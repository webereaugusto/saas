import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const userId = params.id;

  // Verificar autenticação
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  // Verificar se o usuário atual é administrador
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user?.email as string },
  });

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 });
  }

  try {
    // Buscar o usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Buscar chats do usuário
    const chats = await prisma.chat.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 5, // Últimos 5 chats
    });

    // Contar total de chats
    const chatCount = await prisma.chat.count({
      where: { userId },
    });

    // Contar total de mensagens
    const messageCount = await prisma.message.count({
      where: {
        chat: {
          userId,
        },
      },
    });

    // Buscar primeira e última atividade
    const firstMessage = await prisma.message.findFirst({
      where: {
        chat: {
          userId,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const lastMessage = await prisma.message.findFirst({
      where: {
        chat: {
          userId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Formatar dados para resposta
    const formattedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      stats: {
        chatCount,
        messageCount,
        firstActivity: firstMessage?.createdAt.toISOString() || null,
        lastActivity: lastMessage?.createdAt.toISOString() || null,
      },
      recentChats: chats.map(chat => ({
        id: chat.id,
        title: chat.title,
        messageCount: chat._count.messages,
        createdAt: chat.createdAt.toISOString(),
        updatedAt: chat.updatedAt.toISOString(),
      })),
    };

    return NextResponse.json({ user: formattedUser });
  } catch (error) {
    console.error('Erro ao buscar detalhes do usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar detalhes do usuário' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Obter o ID do usuário
    const userId = params.id;
    
    // Verificar autenticação
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar o usuário pelo email para verificar se é admin
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Verificar se o usuário a ser excluído existe
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userToDelete) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Não permitir excluir administradores
    if (userToDelete.role === 'ADMIN') {
      return NextResponse.json(
        { error: 'Não é possível excluir um administrador' },
        { status: 403 }
      );
    }

    // Excluir o usuário
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir usuário' },
      { status: 500 }
    );
  }
} 