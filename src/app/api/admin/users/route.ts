import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // Verificar autenticação
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  // Verificar se o usuário é administrador
  const user = await prisma.user.findUnique({
    where: { email: session.user?.email as string },
  });

  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 });
  }

  try {
    // Obter parâmetros de consulta
    const { searchParams } = request.nextUrl;
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    // Construir condições de busca
    let where: Prisma.UserWhereInput = {};
    
    if (search) {
      where = {
        OR: [
          { 
            name: { 
              contains: search,
              mode: 'insensitive' as Prisma.QueryMode
            } 
          },
          { 
            email: { 
              contains: search,
              mode: 'insensitive' as Prisma.QueryMode
            } 
          },
        ],
      };
    }

    // Contar total de usuários para paginação
    const totalUsers = await prisma.user.count({ where });

    // Criar objeto de ordenação dinamicamente
    const orderBy: Prisma.UserOrderByWithRelationInput = {
      [sort]: order as Prisma.SortOrder,
    };

    // Buscar usuários
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        chats: {
          select: {
            id: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    // Buscar contagem de mensagens para cada usuário
    const usersWithMessageCounts = await Promise.all(
      users.map(async (user) => {
        const messageCount = await prisma.message.count({
          where: {
            chat: {
              userId: user.id,
            },
          },
        });

        return {
          ...user,
          chatCount: user.chats.length,
          messageCount,
        };
      })
    );

    // Formatar resposta
    const formattedUsers = usersWithMessageCounts.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      chatCount: user.chatCount,
      messageCount: user.messageCount,
    }));

    return NextResponse.json({
      users: formattedUsers,
      total: totalUsers,
      page,
      limit,
      totalPages: Math.ceil(totalUsers / limit),
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar usuários' },
      { status: 500 }
    );
  }
} 