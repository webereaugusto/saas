'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import toast from 'react-hot-toast';
import { MagnifyingGlassIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

interface Chat {
  id: string;
  title: string;
  userId: string;
  userName: string;
  userEmail: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function ChatsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      // Verificar se o usuário é admin
      if (session?.user && (session.user as any).role !== 'ADMIN') {
        toast.error('Você não tem permissão para acessar esta página');
        router.push('/dashboard');
      } else {
        fetchChats();
      }
    }
  }, [status, session, router]);

  const fetchChats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/chats');
      if (!response.ok) {
        throw new Error('Falha ao carregar chats');
      }
      const data = await response.json();
      setChats(data.chats);
    } catch (error) {
      toast.error('Erro ao carregar chats');
      console.error('Erro ao carregar chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = async (chatId: string) => {
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
      fetchChats();
    } catch (error) {
      toast.error('Erro ao excluir chat');
      console.error('Erro ao excluir chat:', error);
    }
  };

  const filteredChats = chats.filter(chat => 
    (chat.title.toLowerCase()).includes(searchTerm.toLowerCase()) || 
    (chat.userName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (chat.userEmail?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const sortedChats = [...filteredChats].sort((a, b) => {
    if (sortBy === 'title') {
      return sortDirection === 'asc' 
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    } else if (sortBy === 'userName') {
      const nameA = a.userName || '';
      const nameB = b.userName || '';
      return sortDirection === 'asc'
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    } else if (sortBy === 'messageCount') {
      return sortDirection === 'asc'
        ? a.messageCount - b.messageCount
        : b.messageCount - a.messageCount;
    } else if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
      const dateA = new Date(a[sortBy as keyof Chat] as string).getTime();
      const dateB = new Date(b[sortBy as keyof Chat] as string).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    }
    return 0;
  });

  if (status === 'loading' || isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </AdminLayout>
    );
  }

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

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Gerenciamento de Chats</h1>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5"
              placeholder="Buscar chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-md">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center">
                    Título
                    {sortBy === 'title' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('userName')}
                >
                  <div className="flex items-center">
                    Usuário
                    {sortBy === 'userName' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('messageCount')}
                >
                  <div className="flex items-center">
                    Mensagens
                    {sortBy === 'messageCount' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center">
                    Criado em
                    {sortBy === 'createdAt' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('updatedAt')}
                >
                  <div className="flex items-center">
                    Atualizado em
                    {sortBy === 'updatedAt' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 bg-gray-800">
              {sortedChats.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                    {searchTerm ? 'Nenhum chat encontrado com este termo.' : 'Nenhum chat encontrado.'}
                  </td>
                </tr>
              ) : (
                sortedChats.map((chat) => (
                  <tr key={chat.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 text-sm text-white">
                      <div className="truncate max-w-xs" title={chat.title}>
                        {chat.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-white">
                      <div className="flex flex-col">
                        <span>{chat.userName || 'Desconhecido'}</span>
                        <span className="text-xs text-gray-400">{chat.userEmail || 'Sem email'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {chat.messageCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(chat.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(chat.updatedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div className="flex space-x-2">
                        <button
                          className="text-indigo-400 hover:text-indigo-300"
                          onClick={() => router.push(`/admin/chats/${chat.id}`)}
                          title="Visualizar chat"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          className="text-red-500 hover:text-red-400"
                          onClick={() => handleDelete(chat.id)}
                          title="Excluir chat"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
} 