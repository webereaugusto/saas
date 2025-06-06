import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Função para obter a chave da API da OpenAI das configurações
async function getOpenAIKey(): Promise<string | null> {
  try {
    // Primeiro, tentar buscar da configuração do sistema
    const setting = await prisma.$queryRaw<Array<{value: string}>>`
      SELECT value FROM "Setting" WHERE name = 'openai_api_key' AND value IS NOT NULL AND value != ''
    `;
    
    if (setting && setting.length > 0 && setting[0].value) {
      console.log('Usando chave OpenAI do sistema de configurações');
      return setting[0].value;
    }
    
    // Fallback para variável de ambiente
    if (process.env.OPENAI_API_KEY) {
      console.log('Usando chave OpenAI do arquivo .env');
      return process.env.OPENAI_API_KEY;
    }
    
    console.log('Nenhuma chave OpenAI encontrada');
    return null;
  } catch (error) {
    console.error('Erro ao buscar chave OpenAI:', error);
    // Fallback para variável de ambiente em caso de erro
    return process.env.OPENAI_API_KEY || null;
  }
}

// Função para obter o prompt do sistema das configurações
async function getSystemPrompt(): Promise<string> {
  try {
    const setting = await prisma.$queryRaw<Array<{value: string}>>`
      SELECT value FROM "Setting" WHERE name = 'system_prompt' AND value IS NOT NULL AND value != ''
    `;
    
    if (setting && setting.length > 0 && setting[0].value) {
      console.log('Usando prompt do sistema personalizado');
      return setting[0].value;
    }
    
    // Prompt padrão se não encontrar configuração
    const defaultPrompt = 'Você é um assistente de IA útil, respeitoso e honesto. Sempre responda da forma mais útil possível, mantendo suas respostas precisas e factuais.';
    console.log('Usando prompt do sistema padrão');
    return defaultPrompt;
  } catch (error) {
    console.error('Erro ao buscar prompt do sistema:', error);
    return 'Você é um assistente de IA útil, respeitoso e honesto. Sempre responda da forma mais útil possível, mantendo suas respostas precisas e factuais.';
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { message, chatId } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Mensagem é obrigatória' }, { status: 400 });
    }

    // Obter a chave da API
    const apiKey = await getOpenAIKey();
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'Chave da API OpenAI não configurada. Configure nas configurações do sistema.' 
      }, { status: 500 });
    }

    // Inicializar OpenAI com a chave obtida
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // Salvar mensagem do usuário
    await prisma.message.create({
      data: {
        content: message,
        role: 'user',
        chatId,
      },
    });

    // Verificar se é a primeira mensagem do chat e atualizar o título
    const messagesCount = await prisma.message.count({
      where: { chatId },
    });

    if (messagesCount === 1) {
      // Gerar título com base na primeira mensagem
      const titleCompletion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Gere um título curto e descritivo (máximo 6 palavras) para uma conversa que começa com a seguinte mensagem. Responda APENAS com o título, sem pontuação no final.',
          },
          {
            role: 'user',
            content: message,
          },
        ],
      });

      const newTitle = titleCompletion.choices[0]?.message?.content || 'Novo Chat';

      // Atualizar o título do chat
      await prisma.chat.update({
        where: { id: chatId },
        data: { title: newTitle },
      });
    }

    // Obter histórico de mensagens
    const messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
    });

    // Obter o prompt do sistema
    const systemPrompt = await getSystemPrompt();

    // Preparar mensagens para a API da OpenAI com prompt do sistema
    const chatMessages = [
      {
        role: 'system' as const,
        content: systemPrompt,
      },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }))
    ];

    // Chamar a API da OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: chatMessages,
    });

    const aiResponse = completion.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.';

    // Salvar resposta da AI
    await prisma.message.create({
      data: {
        content: aiResponse,
        role: 'assistant',
        chatId,
      },
    });

    return NextResponse.json({ message: aiResponse });
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
    return NextResponse.json(
      { error: 'Erro ao processar mensagem' },
      { status: 500 }
    );
  }
} 