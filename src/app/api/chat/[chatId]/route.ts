import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    // Primeiro, obtemos e verificamos o parâmetro chatId
    const resolvedParams = await params;
    const chatId = resolvedParams.chatId;

    if (!chatId) {
      return NextResponse.json(
        { error: 'ID do chat é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se há sessão ativa
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Buscar o usuário na base de dados
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Buscar o chat e verificar se pertence ao usuário
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId: user.id, // Garantir que o chat pertence ao usuário
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!chat) {
      return NextResponse.json(
        { error: 'Chat não encontrado ou acesso negado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ chat });
  } catch (error) {
    console.error('Erro ao buscar chat:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    // Primeiro, obtemos e verificamos o parâmetro chatId
    const resolvedParams = await params;
    const chatId = resolvedParams.chatId;

    if (!chatId) {
      return NextResponse.json(
        { error: 'ID do chat é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se há sessão ativa
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Buscar o usuário na base de dados
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o chat existe e pertence ao usuário
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId: user.id,
      },
    });

    if (!chat) {
      return NextResponse.json(
        { error: 'Chat não encontrado ou acesso negado' },
        { status: 404 }
      );
    }

    // Primeiro excluir todas as mensagens do chat
    await prisma.message.deleteMany({
      where: {
        chatId: chatId,
      },
    });

    // Depois excluir o chat
    await prisma.chat.delete({
      where: {
        id: chatId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir chat:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 