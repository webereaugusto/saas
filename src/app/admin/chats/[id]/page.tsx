'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, TrashIcon } from '@heroicons/react/24/outline';
import AdminLayout from '@/components/AdminLayout';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

interface ChatDetail {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  messages: Message[];
}

export default function ChatDetailsPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const chatId = params.id;
  const [chat, setChat] = useState<ChatDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      // Verificar se o usuário é admin
      if (session?.user && (session.user as any).role !== 'ADMIN') {
        toast.error('Você não tem permissão para acessar esta página');
        router.push('/dashboard');
      } else {
        fetchChatDetails();
      }
    }
  }, [status, session, router, chatId]);

  const fetchChatDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/chats/${chatId}`);
      if (!response.ok) {
        throw new Error('Falha ao carregar detalhes do chat');
      }
      const data = await response.json();
      setChat(data.chat);
    } catch (error) {
      toast.error('Erro ao carregar detalhes do chat');
      console.error('Erro ao carregar detalhes do chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteChat = async () => {
    if (!confirm('Tem certeza que deseja excluir este chat? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/chats/${chatId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Falha ao excluir chat');
      }

      toast.success('Chat excluído com sucesso');
      router.push('/admin/chats');
    } catch (error) {
      toast.error('Erro ao excluir chat');
      console.error('Erro ao excluir chat:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
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

  if (!chat) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => router.push('/admin/chats')}
              className="text-gray-300 hover:text-white mr-4"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-white">Chat não encontrado</h1>
          </div>
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-300">O chat solicitado não foi encontrado ou pode ter sido excluído.</p>
            <button
              onClick={() => router.push('/admin/chats')}
              className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded"
            >
              Voltar para a lista de chats
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <button 
              onClick={() => router.push('/admin/chats')}
              className="text-gray-300 hover:text-white mr-4"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-white">{chat.title}</h1>
          </div>
          <button
            onClick={handleDeleteChat}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded flex items-center"
          >
            <TrashIcon className="h-5 w-5 mr-2" />
            Excluir Chat
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1 bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-medium text-white mb-4">Informações do Chat</h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm">ID do Chat</p>
                <p className="text-white">{chat.id}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Título</p>
                <p className="text-white">{chat.title}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Criado em</p>
                <p className="text-white">{formatDate(chat.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Atualizado em</p>
                <p className="text-white">{formatDate(chat.updatedAt)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total de Mensagens</p>
                <p className="text-white">{chat.messages.length}</p>
              </div>
            </div>

            <h2 className="text-lg font-medium text-white mt-8 mb-4">Informações do Usuário</h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm">ID do Usuário</p>
                <p className="text-white">{chat.user.id}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Nome</p>
                <p className="text-white">{chat.user.name || 'Sem nome'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-white">{chat.user.email || 'Sem email'}</p>
              </div>
              <div className="pt-4">
                <button
                  onClick={() => router.push(`/admin/users/${chat.user.id}`)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded w-full"
                >
                  Ver Perfil do Usuário
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6 overflow-hidden flex flex-col">
            <h2 className="text-lg font-medium text-white mb-4">Mensagens</h2>
            
            <div className="flex-grow overflow-y-auto max-h-[600px] pr-2 space-y-6 chat-scrollbar">
              {chat.messages.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Este chat não possui mensagens.</p>
              ) : (
                chat.messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === 'user' 
                          ? 'bg-indigo-600 text-white rounded-tr-none' 
                          : 'bg-gray-700 text-white rounded-tl-none'
                      }`}
                    >
                      <div className="text-sm mb-1 text-gray-300">
                        {message.role === 'user' ? chat.user.name || 'Usuário' : 'IA'}
                        <span className="ml-2 text-xs opacity-70">
                          {formatDate(message.createdAt)}
                        </span>
                      </div>
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 