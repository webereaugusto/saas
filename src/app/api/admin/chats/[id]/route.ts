import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const chatId = params.id;

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
    // Verificar se o chat existe
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      return NextResponse.json({ error: 'Chat não encontrado' }, { status: 404 });
    }

    // Excluir todas as mensagens relacionadas ao chat primeiro
    await prisma.message.deleteMany({
      where: { chatId },
    });

    // Excluir o chat
    await prisma.chat.delete({
      where: { id: chatId },
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const chatId = params.id;

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
    // Buscar o chat e todas as suas mensagens
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!chat) {
      return NextResponse.json({ error: 'Chat não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ chat });
  } catch (error) {
    console.error('Erro ao buscar chat:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar chat' },
      { status: 500 }
    );
  }
} 