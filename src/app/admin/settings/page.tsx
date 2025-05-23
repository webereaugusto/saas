'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import toast from 'react-hot-toast';
import { Cog6ToothIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface Settings {
  openaiApiKey: string;
  maxMessagesPerChat: number;
  maxChatsPerUser: number;
  maintenanceMode: boolean;
  allowUserRegistration: boolean;
  systemPrompt: string;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [settings, setSettings] = useState<Settings>({
    openaiApiKey: '',
    maxMessagesPerChat: 100,
    maxChatsPerUser: 10,
    maintenanceMode: false,
    allowUserRegistration: true,
    systemPrompt: 'Você é um assistente de IA útil, respeitoso e honesto. Sempre responda da forma mais útil possível, mantendo suas respostas precisas e factuais. Se não souber a resposta, não tente inventar uma; apenas diga que não sabe. Suas respostas não devem ser prejudiciais, ilegais, antiéticas ou enganosas.',
  });

  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      // Verificar se o usuário é admin
      if (session?.user && (session.user as any).role !== 'ADMIN') {
        toast.error('Você não tem permissão para acessar esta página');
        router.push('/dashboard');
      } else {
        fetchSettings();
      }
    }
  }, [status, session, router]);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/settings');
      if (!response.ok) {
        throw new Error('Falha ao carregar configurações');
      }
      const data = await response.json();
      setSettings(data.settings);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings }),
      });

      if (!response.ok) {
        throw new Error('Falha ao salvar configurações');
      }

      toast.success('Configurações salvas com sucesso');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  const syncFromEnv = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/admin/settings/sync', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Falha ao sincronizar configurações');
      }

      const data = await response.json();
      toast.success(data.message || 'Configurações sincronizadas com sucesso!');
      
      // Atualizar os dados da interface após a sincronização
      await fetchSettings();
    } catch (error) {
      console.error('Erro ao sincronizar configurações:', error);
      toast.error('Erro ao sincronizar configurações');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleChange = (field: keyof Settings, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (status === 'loading' || isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Cog6ToothIcon className="h-8 w-8 text-indigo-500 mr-3" />
          <h1 className="text-2xl font-bold text-white">Configurações do Sistema</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* API e Limites */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-medium text-white mb-4">API e Limites</h2>
            
            <div className="space-y-5">
              <div>
                <label htmlFor="openaiApiKey" className="block text-sm font-medium text-gray-300 mb-2">
                  Chave da API OpenAI
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="openaiApiKey"
                    value={settings.openaiApiKey}
                    onChange={(e) => handleChange('openaiApiKey', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="sk-..."
                  />
                  {settings.openaiApiKey && settings.openaiApiKey.includes('••••') && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                        ✓ Configurada
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  Esta chave é usada para fazer chamadas à API da OpenAI.
                </p>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="maxMessagesPerChat">
                  Máximo de Mensagens por Chat
                </label>
                <input
                  type="number"
                  id="maxMessagesPerChat"
                  value={settings.maxMessagesPerChat}
                  onChange={(e) => handleChange('maxMessagesPerChat', parseInt(e.target.value))}
                  min="1"
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="mt-1 text-sm text-gray-400">Limite de mensagens para cada conversa.</p>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="maxChatsPerUser">
                  Máximo de Chats por Usuário
                </label>
                <input
                  type="number"
                  id="maxChatsPerUser"
                  value={settings.maxChatsPerUser}
                  onChange={(e) => handleChange('maxChatsPerUser', parseInt(e.target.value))}
                  min="1"
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="mt-1 text-sm text-gray-400">Limite de conversas para cada usuário.</p>
              </div>
            </div>
          </div>

          {/* Configurações Gerais */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-medium text-white mb-4">Configurações Gerais</h2>
            
            <div className="space-y-5">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-500 rounded"
                />
                <label className="ml-3 block text-gray-300 text-sm font-medium" htmlFor="maintenanceMode">
                  Modo de Manutenção
                </label>
              </div>
              <p className="text-sm text-gray-400 -mt-2">
                Quando ativado, apenas administradores poderão acessar o sistema.
              </p>

              <div className="flex items-center mt-4">
                <input
                  type="checkbox"
                  id="allowUserRegistration"
                  checked={settings.allowUserRegistration}
                  onChange={(e) => handleChange('allowUserRegistration', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-500 rounded"
                />
                <label className="ml-3 block text-gray-300 text-sm font-medium" htmlFor="allowUserRegistration">
                  Permitir Novos Registros
                </label>
              </div>
              <p className="text-sm text-gray-400 -mt-2">
                Se desativado, novos usuários não poderão se registrar no sistema.
              </p>
            </div>
          </div>

          {/* Configuração da IA */}
          <div className="bg-gray-800 rounded-lg p-6 lg:col-span-2">
            <h2 className="text-lg font-medium text-white mb-4">Configuração da IA</h2>
            
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="systemPrompt">
                Prompt do Sistema
              </label>
              <div className="bg-gray-900 rounded-lg p-4 mb-3 flex items-start">
                <InformationCircleIcon className="h-5 w-5 text-indigo-400 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-400">
                  Este é o prompt inicial enviado à IA, que define como ela deve se comportar. Ele é usado como contexto para todas as conversas.
                </p>
              </div>
              <textarea
                id="systemPrompt"
                value={settings.systemPrompt}
                onChange={(e) => handleChange('systemPrompt', e.target.value)}
                rows={5}
                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={syncFromEnv}
              disabled={isSyncing}
              className={`bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md flex items-center ${
                isSyncing ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSyncing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sincronizando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Sincronizar do .env
                </>
              )}
            </button>
            <p className="text-sm text-gray-400">
              Importa configurações do arquivo .env para o banco de dados
            </p>
          </div>
          
          <button
            onClick={saveSettings}
            disabled={isSaving}
            className={`bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-md flex items-center ${
              isSaving ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Salvando...
              </>
            ) : (
              'Salvar Configurações'
            )}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
} 