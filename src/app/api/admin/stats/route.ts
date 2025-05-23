import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

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
    // Obter os parâmetros da consulta
    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('timeRange') || 'week';

    // Obter estatísticas gerais
    const userCount = await prisma.user.count();
    const chatCount = await prisma.chat.count();
    const messageCount = await prisma.message.count();

    // Estatísticas detalhadas com base no intervalo de tempo
    const userGrowth = await getUserGrowthData(timeRange);
    const messageActivity = await getMessageActivityData(timeRange);
    const chatCreation = await getChatCreationData(timeRange);

    // Obter estatísticas de mensagens por modelo de IA (se houver)
    const messagesByRole = await prisma.message.groupBy({
      by: ['role'],
      _count: {
        id: true,
      },
    });

    // Formatar resposta para modelos
    const formattedMessagesByRole = messagesByRole.map(item => ({
      role: item.role,
      count: item._count.id,
    }));

    // Usuários mais ativos (por contagem de chats)
    const topUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        chats: {
          _count: 'desc',
        },
      },
      take: 5,
    });

    // Buscar contagens de mensagens para os usuários
    const formattedTopUsers = await Promise.all(
      topUsers.map(async (user) => {
        const chatCount = await prisma.chat.count({
          where: { userId: user.id },
        });
        
        const messageCount = await prisma.message.count({
          where: {
            chat: {
              userId: user.id,
            },
            role: 'user', // Apenas mensagens enviadas pelo usuário
          },
        });
        
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          chatCount,
          messageCount,
        };
      })
    );

    return NextResponse.json({
      counts: {
        users: userCount,
        chats: chatCount,
        messages: messageCount,
      },
      trends: {
        userGrowth,
        messageActivity,
        chatCreation,
      },
      messagesByRole: formattedMessagesByRole,
      topUsers: formattedTopUsers,
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    );
  }
}

// Funções auxiliares simplificadas para obter dados por período

async function getUserGrowthData(timeRange: string) {
  let startDate = new Date();
  
  switch (timeRange) {
    case 'day':
      startDate.setDate(startDate.getDate() - 1);
      break;
    case 'week':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      startDate.setDate(startDate.getDate() - 7);
  }

  // Buscar usuários no período e contar por dia
  const users = await prisma.user.findMany({
    where: {
      createdAt: {
        gte: startDate,
      },
    },
    select: {
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  // Agrupar por data
  const grouped: Record<string, number> = {};
  
  users.forEach(user => {
    let key: string;
    
    if (timeRange === 'day') {
      key = `${user.createdAt.getHours()}h`;
    } else if (timeRange === 'year') {
      key = user.createdAt.toISOString().substring(0, 7); // YYYY-MM
    } else {
      key = user.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
    }
    
    grouped[key] = (grouped[key] || 0) + 1;
  });

  return Object.entries(grouped).map(([date, count]) => ({ date, count }));
}

async function getMessageActivityData(timeRange: string) {
  let startDate = new Date();
  
  switch (timeRange) {
    case 'day':
      startDate.setDate(startDate.getDate() - 1);
      break;
    case 'week':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      startDate.setDate(startDate.getDate() - 7);
  }

  // Buscar mensagens no período
  const messages = await prisma.message.findMany({
    where: {
      createdAt: {
        gte: startDate,
      },
    },
    select: {
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  // Agrupar por data
  const grouped: Record<string, number> = {};
  
  messages.forEach(message => {
    let key: string;
    
    if (timeRange === 'day') {
      key = `${message.createdAt.getHours()}h`;
    } else if (timeRange === 'year') {
      key = message.createdAt.toISOString().substring(0, 7); // YYYY-MM
    } else {
      key = message.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
    }
    
    grouped[key] = (grouped[key] || 0) + 1;
  });

  return Object.entries(grouped).map(([date, count]) => ({ date, count }));
}

async function getChatCreationData(timeRange: string) {
  let startDate = new Date();
  
  switch (timeRange) {
    case 'day':
      startDate.setDate(startDate.getDate() - 1);
      break;
    case 'week':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      startDate.setDate(startDate.getDate() - 7);
  }
  
  // Buscar chats no período
  const chats = await prisma.chat.findMany({
    where: {
      createdAt: {
        gte: startDate,
      },
    },
    select: {
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  // Agrupar por data
  const grouped: Record<string, number> = {};
  
  chats.forEach(chat => {
    let key: string;
    
    if (timeRange === 'day') {
      key = `${chat.createdAt.getHours()}h`;
    } else if (timeRange === 'year') {
      key = chat.createdAt.toISOString().substring(0, 7); // YYYY-MM
    } else {
      key = chat.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
    }
    
    grouped[key] = (grouped[key] || 0) + 1;
  });

  return Object.entries(grouped).map(([date, count]) => ({ date, count }));
} 