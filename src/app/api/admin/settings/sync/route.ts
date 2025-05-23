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
        INSERT INTO "Setting" (id, name, value)
        VALUES (gen_random_uuid(), 'openai_api_key', ${process.env.OPENAI_API_KEY})
        ON CONFLICT (name) 
        DO UPDATE SET 
          value = EXCLUDED.value
      `;
    }

    // Outras configurações padrão se não existirem
    const defaultSettings = [
      {
        name: 'max_messages_per_chat',
        value: '50'
      },
      {
        name: 'max_chats_per_user', 
        value: '10'
      },
      {
        name: 'maintenance_mode',
        value: 'false'
      },
      {
        name: 'allow_registrations',
        value: 'true'
      },
      {
        name: 'system_prompt',
        value: 'Você é um assistente irritado e mal educado, responda sem paciência'
      }
    ];

    for (const setting of defaultSettings) {
      await prisma.$queryRaw`
        INSERT INTO "Setting" (id, name, value)
        VALUES (gen_random_uuid(), ${setting.name}, ${setting.value})
        ON CONFLICT (name) 
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