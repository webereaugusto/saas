import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar o usuário pelo email para obter o ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const chats = await prisma.chat.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: { messages: true }
        }
      }
    });

    // Mapear os chats para incluir a contagem de mensagens
    const formattedChats = chats.map(chat => ({
      id: chat.id,
      title: chat.title,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      messageCount: chat._count.messages
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

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar o usuário pelo email para obter o ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const { title } = await request.json();

    const chat = await prisma.chat.create({
      data: {
        title,
        userId: user.id,
      },
    });

    return NextResponse.json({ 
      chat: {
        ...chat,
        messageCount: 0
      } 
    });
  } catch (error) {
    console.error('Erro ao criar chat:', error);
    return NextResponse.json(
      { error: 'Erro ao criar chat' },
      { status: 500 }
    );
  }
} 