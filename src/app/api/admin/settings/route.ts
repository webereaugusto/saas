import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Definição da interface das configurações
interface Settings {
  openaiApiKey: string;
  maxMessagesPerChat: number;
  maxChatsPerUser: number;
  maintenanceMode: boolean;
  allowUserRegistration: boolean;
  systemPrompt: string;
}

// Obter configurações
export async function GET() {
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
    // Buscar todas as configurações usando SQL bruto
    const settings = await prisma.$queryRaw`SELECT * FROM "Setting"`;
    
    // Converter para um objeto onde a chave é o nome da configuração
    const settingsObject: Record<string, string> = {};
    
    if (Array.isArray(settings)) {
      for (const setting of settings) {
        if (setting.name && setting.value) {
          settingsObject[setting.name as string] = setting.value as string;
        }
      }
    }

    // Formatado para a interface com valores padrão e chave mascarada
    const formattedSettings: Settings = {
      openaiApiKey: settingsObject['openai_api_key'] ? '••••••••••••••••••••••••••••••••••••••••••••••••••••' : '',
      maxMessagesPerChat: parseInt(settingsObject['max_messages_per_chat'] || '50'),
      maxChatsPerUser: parseInt(settingsObject['max_chats_per_user'] || '10'),
      maintenanceMode: settingsObject['maintenance_mode'] === 'true',
      allowUserRegistration: settingsObject['allow_registrations'] === 'true',
      systemPrompt: settingsObject['system_prompt'] || 'Você é um assistente de IA útil, respeitoso e honesto. Sempre responda da forma mais útil possível, mantendo suas respostas precisas e factuais.'
    };

    return NextResponse.json({ settings: formattedSettings });
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar configurações' },
      { status: 500 }
    );
  }
}

// Salvar configurações
export async function POST(request: NextRequest) {
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
    const data = await request.json();
    const settings = data.settings;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Formato de configurações inválido' },
        { status: 400 }
      );
    }

    // Atualizar ou criar cada configuração usando SQL bruto
    for (const [name, value] of Object.entries(settings)) {
      // Converter os nomes das configurações da interface para o banco
      let dbName = '';
      let dbValue = String(value);
      
      switch(name) {
        case 'openaiApiKey':
          dbName = 'openai_api_key';
          // Se o valor estiver mascarado, não atualizar
          if (dbValue.includes('••••')) {
            continue;
          }
          break;
        case 'maxMessagesPerChat':
          dbName = 'max_messages_per_chat';
          break;
        case 'maxChatsPerUser':
          dbName = 'max_chats_per_user';
          break;
        case 'maintenanceMode':
          dbName = 'maintenance_mode';
          break;
        case 'allowUserRegistration':
          dbName = 'allow_registrations';
          break;
        case 'systemPrompt':
          dbName = 'system_prompt';
          break;
        default:
          continue;
      }
      
      // Verificar se a configuração já existe
      const existingSetting = await prisma.$queryRaw`
        SELECT * FROM "Setting" WHERE name = ${dbName}
      `;
      
      if (Array.isArray(existingSetting) && existingSetting.length > 0) {
        // Atualizar configuração existente
        await prisma.$executeRaw`
          UPDATE "Setting" SET value = ${dbValue} WHERE name = ${dbName}
        `;
      } else {
        // Criar nova configuração
        await prisma.$executeRaw`
          INSERT INTO "Setting" (id, name, value) 
          VALUES (gen_random_uuid(), ${dbName}, ${dbValue})
        `;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar configurações' },
      { status: 500 }
    );
  }
} 