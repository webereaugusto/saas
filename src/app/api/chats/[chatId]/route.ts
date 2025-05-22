import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// API para renomear um chat
export async function PATCH(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { title } = await request.json();
    const chatId = params.chatId;

    // Verificar se o chat pertence ao usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId: user.id
      }
    });

    if (!chat) {
      return NextResponse.json({ error: 'Chat não encontrado' }, { status: 404 });
    }

    // Atualizar o título do chat
    const updatedChat = await prisma.chat.update({
      where: { id: chatId },
      data: { title }
    });

    return NextResponse.json({ chat: updatedChat });
  } catch (error) {
    console.error('Erro ao renomear chat:', error);
    return NextResponse.json(
      { error: 'Erro ao renomear chat' },
      { status: 500 }
    );
  }
}

// API para excluir um chat
export async function DELETE(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const chatId = params.chatId;

    // Verificar se o chat pertence ao usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId: user.id
      }
    });

    if (!chat) {
      return NextResponse.json({ error: 'Chat não encontrado' }, { status: 404 });
    }

    // Primeiro excluir todas as mensagens relacionadas
    await prisma.message.deleteMany({
      where: { chatId }
    });

    // Depois excluir o chat
    await prisma.chat.delete({
      where: { id: chatId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir chat:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir chat' },
      { status: 500 }
    );
  }
} 