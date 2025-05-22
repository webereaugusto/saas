import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Total de chats
    const totalChats = await prisma.chat.count({
      where: { userId }
    });
    
    // Total de mensagens
    const chats = await prisma.chat.findMany({
      where: { userId },
      include: { messages: true }
    });
    
    const totalMessages = chats.reduce((acc, chat) => acc + chat.messages.length, 0);
    const userMessages = chats.reduce((acc, chat) => 
      acc + chat.messages.filter(m => m.role === 'user').length, 0);
    const assistantMessages = chats.reduce((acc, chat) => 
      acc + chat.messages.filter(m => m.role === 'assistant').length, 0);
    
    // Distribuição de mensagens por hora do dia
    const messagesByHour = Array(24).fill(0);
    
    chats.forEach(chat => {
      chat.messages.forEach(message => {
        const hour = new Date(message.createdAt).getHours();
        messagesByHour[hour]++;
      });
    });
    
    // Atividade por dia da semana
    const messagesByDay = Array(7).fill(0);
    
    chats.forEach(chat => {
      chat.messages.forEach(message => {
        const day = new Date(message.createdAt).getDay();
        messagesByDay[day]++;
      });
    });
    
    // Chats criados por mês (últimos 6 meses)
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 5);
    
    const chatsByMonth = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(sixMonthsAgo.getMonth() + i);
      const monthName = date.toLocaleString('pt-BR', { month: 'short' });
      
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const count = await prisma.chat.count({
        where: {
          userId,
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      });
      
      chatsByMonth.push({
        month: monthName,
        count
      });
    }
    
    // Dados recentes
    const recentActivity = await prisma.chat.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });
    
    return NextResponse.json({
      totalChats,
      totalMessages,
      messageDistribution: {
        user: userMessages,
        assistant: assistantMessages
      },
      messagesByHour,
      messagesByDay,
      chatsByMonth,
      recentActivity: recentActivity.map(chat => ({
        id: chat.id,
        title: chat.title,
        lastMessage: chat.messages[0]?.content.substring(0, 50) + (chat.messages[0]?.content.length > 50 ? '...' : '') || 'Sem mensagens',
        updatedAt: chat.updatedAt
      }))
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar estatísticas' },
      { status: 500 }
    );
  }
} 