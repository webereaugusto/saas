import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    // Primeiro, obtemos e verificamos o parâmetro chatId
    const chatId = params.chatId;
    
    if (!chatId) {
      return NextResponse.json(
        { error: 'ID do chat não fornecido' },
        { status: 400 }
      );
    }
    
    // Agora fazemos a verificação de autenticação
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const messages = await prisma.message.findMany({
      where: {
        chatId: String(chatId),
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar mensagens' },
      { status: 500 }
    );
  }
} 