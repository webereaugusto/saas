'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, UserCircleIcon, ChatBubbleLeftRightIcon, TrashIcon } from '@heroicons/react/24/outline';
import AdminLayout from '@/components/AdminLayout';
import toast from 'react-hot-toast';

interface UserDetail {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: string;
  chats: {
    id: string;
    title: string;
    createdAt: string;
    messageCount: number;
  }[];
  subscription: {
    status: string;
    currentPeriodEnd: string | null;
  } | null;
}

export default function UserDetailsPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userId = params.id;
  const [user, setUser] = useState<UserDetail | null>(null);
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
        fetchUserDetails();
      }
    }
  }, [status, session, router, userId]);

  const fetchUserDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      if (!response.ok) {
        throw new Error('Falha ao carregar detalhes do usuário');
      }
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      toast.error('Erro ao carregar detalhes do usuário');
      console.error('Erro ao carregar detalhes do usuário:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita e excluirá todos os dados associados.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Falha ao excluir usuário');
      }

      toast.success('Usuário excluído com sucesso');
      router.push('/admin/users');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir usuário');
      console.error('Erro ao excluir usuário:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  if (!user) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => router.push('/admin/users')}
              className="text-gray-300 hover:text-white mr-4"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-white">Usuário não encontrado</h1>
          </div>
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-300">O usuário solicitado não foi encontrado ou pode ter sido excluído.</p>
            <button
              onClick={() => router.push('/admin/users')}
              className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded"
            >
              Voltar para a lista de usuários
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
              onClick={() => router.push('/admin/users')}
              className="text-gray-300 hover:text-white mr-4"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-white">
              {user.name || 'Usuário sem nome'}
            </h1>
          </div>
          {user.role !== 'ADMIN' && (
            <button
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded flex items-center"
            >
              <TrashIcon className="h-5 w-5 mr-2" />
              Excluir Usuário
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Informações do Usuário */}
          <div className="lg:col-span-1 bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-center mb-6">
              {user.email ? (
                <img 
                  src={`https://www.gravatar.com/avatar/${Buffer.from(user.email).toString('hex')}?d=mp&s=120`}
                  alt={user.name || 'Usuário'}
                  className="h-32 w-32 rounded-full"
                />
              ) : (
                <UserCircleIcon className="h-32 w-32 text-gray-400" />
              )}
            </div>
            
            <h2 className="text-lg font-medium text-white mb-4">Informações do Usuário</h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm">ID do Usuário</p>
                <p className="text-white break-all">{user.id}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Nome</p>
                <p className="text-white">{user.name || 'Sem nome'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-white">{user.email || 'Sem email'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Função</p>
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  user.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'
                }`}>
                  {user.role === 'ADMIN' ? 'Administrador' : 'Usuário'}
                </span>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Criado em</p>
                <p className="text-white">{formatDate(user.createdAt)}</p>
              </div>
            </div>

            {/* Status da Assinatura */}
            <h2 className="text-lg font-medium text-white mt-8 mb-4">Status da Assinatura</h2>
            <div className="bg-gray-700 rounded-lg p-4">
              {user.subscription ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Status:</span>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.subscription.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                      user.subscription.status === 'PAST_DUE' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {user.subscription.status === 'ACTIVE' ? 'Ativa' : 
                       user.subscription.status === 'PAST_DUE' ? 'Pagamento Pendente' : 
                       user.subscription.status === 'CANCELED' ? 'Cancelada' : 'Inativa'}
                    </span>
                  </div>
                  {user.subscription.currentPeriodEnd && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">Validade:</span>
                      <span className="text-white">{formatDate(user.subscription.currentPeriodEnd)}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-gray-400">Sem assinatura ativa</p>
                </div>
              )}
            </div>
          </div>

          {/* Chats do Usuário */}
          <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <ChatBubbleLeftRightIcon className="h-5 w-5 text-indigo-400 mr-2" />
              <h2 className="text-lg font-medium text-white">Chats do Usuário</h2>
            </div>
            
            {user.chats.length === 0 ? (
              <div className="bg-gray-700 rounded-lg p-8 text-center">
                <p className="text-gray-400">Este usuário ainda não criou nenhum chat.</p>
              </div>
            ) : (
              <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2">
                {user.chats.map(chat => (
                  <div key={chat.id} className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 transition cursor-pointer" onClick={() => router.push(`/admin/chats/${chat.id}`)}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-white font-medium">{chat.title}</h3>
                        <p className="text-gray-400 text-sm mt-1">Criado em: {formatDate(chat.createdAt)}</p>
                      </div>
                      <div className="bg-gray-800 px-2 py-1 rounded-full">
                        <span className="text-gray-300 text-sm">{chat.messageCount} mensagens</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {user.chats.length > 0 && (
              <div className="mt-4 text-right">
                <p className="text-gray-400 text-sm">Total de chats: {user.chats.length}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 