import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);

  // Verificar autenticação e permissões
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
    // Buscar todos os chats com informações do usuário e contagem de mensagens
    const chats = await prisma.chat.findMany({
      select: {
        id: true,
        title: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        messages: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Formatar os dados para o formato esperado pela interface
    const formattedChats = chats.map(chat => ({
      id: chat.id,
      title: chat.title,
      userId: chat.userId,
      userName: chat.user?.name || null,
      userEmail: chat.user?.email || null,
      messageCount: chat.messages.length,
      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt.toISOString(),
    }));

    return NextResponse.json({ chats: formattedChats });
  } catch (error) {
    console.error('Erro ao buscar chats:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar chats' },
      { status: 500 }
    );
  }
} 