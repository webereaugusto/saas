import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
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
    // Sincronizar chave da OpenAI do .env para o banco
    if (process.env.OPENAI_API_KEY) {
      await prisma.$queryRaw`
        INSERT INTO settings (key, value, description, type, created_at, updated_at)
        VALUES ('openai_api_key', ${process.env.OPENAI_API_KEY}, 'Chave da API OpenAI para integração com ChatGPT', 'string', NOW(), NOW())
        ON CONFLICT (key) 
        DO UPDATE SET 
          value = EXCLUDED.value,
          updated_at = NOW()
      `;
    }

    // Outras configurações padrão se não existirem
    const defaultSettings = [
      {
        key: 'max_messages_per_chat',
        value: '50',
        description: 'Máximo de mensagens por chat',
        type: 'number'
      },
      {
        key: 'max_chats_per_user', 
        value: '10',
        description: 'Máximo de chats por usuário',
        type: 'number'
      },
      {
        key: 'maintenance_mode',
        value: 'false',
        description: 'Modo de manutenção ativo',
        type: 'boolean'
      },
      {
        key: 'allow_registrations',
        value: 'true', 
        description: 'Permitir novos registros',
        type: 'boolean'
      },
      {
        key: 'system_prompt',
        value: 'Você é um assistente irritado e mal educado, responda sem paciência',
        description: 'Prompt padrão do sistema para a IA',
        type: 'text'
      }
    ];

    for (const setting of defaultSettings) {
      await prisma.$queryRaw`
        INSERT INTO settings (key, value, description, type, created_at, updated_at)
        VALUES (${setting.key}, ${setting.value}, ${setting.description}, ${setting.type}, NOW(), NOW())
        ON CONFLICT (key) 
        DO NOTHING
      `;
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Configurações sincronizadas com sucesso!' 
    });
  } catch (error) {
    console.error('Erro ao sincronizar configurações:', error);
    return NextResponse.json(
      { error: 'Erro ao sincronizar configurações' },
      { status: 500 }
    );
  }
} 