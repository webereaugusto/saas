'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import toast from 'react-hot-toast';
import { MagnifyingGlassIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: string;
  chatCount: number;
  messageCount: number;
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
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
        fetchUsers();
      }
    }
  }, [status, session, router]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error('Falha ao carregar usuários');
      }
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      toast.error('Erro ao carregar usuários');
      console.error('Erro ao carregar usuários:', error);
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

  const handleDelete = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Falha ao excluir usuário');
      }

      toast.success('Usuário excluído com sucesso');
      fetchUsers();
    } catch (error) {
      toast.error('Erro ao excluir usuário');
      console.error('Erro ao excluir usuário:', error);
    }
  };

  const filteredUsers = users.filter(user => 
    (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === 'name') {
      const nameA = a.name || '';
      const nameB = b.name || '';
      return sortDirection === 'asc' 
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    } else if (sortBy === 'email') {
      const emailA = a.email || '';
      const emailB = b.email || '';
      return sortDirection === 'asc'
        ? emailA.localeCompare(emailB)
        : emailB.localeCompare(emailA);
    } else if (sortBy === 'chatCount' || sortBy === 'messageCount') {
      return sortDirection === 'asc'
        ? (a[sortBy as keyof User] as number) - (b[sortBy as keyof User] as number)
        : (b[sortBy as keyof User] as number) - (a[sortBy as keyof User] as number);
    } else {
      // Ordenação por data
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    }
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

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Gerenciamento de Usuários</h1>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5"
              placeholder="Buscar usuários..."
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
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Nome
                    {sortBy === 'name' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center">
                    Email
                    {sortBy === 'email' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('role')}
                >
                  <div className="flex items-center">
                    Função
                    {sortBy === 'role' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('chatCount')}
                >
                  <div className="flex items-center">
                    Chats
                    {sortBy === 'chatCount' && (
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
                    Data de Criação
                    {sortBy === 'createdAt' && (
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
              {sortedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-400">
                    {searchTerm ? 'Nenhum usuário encontrado com este termo.' : 'Nenhum usuário cadastrado.'}
                  </td>
                </tr>
              ) : (
                sortedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {user.name || 'Sem nome'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {user.email || 'Sem email'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role === 'ADMIN' ? 'Administrador' : 'Usuário'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {user.chatCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {user.messageCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div className="flex space-x-2">
                        <button
                          className="text-indigo-400 hover:text-indigo-300"
                          onClick={() => router.push(`/admin/users/${user.id}`)}
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          className="text-red-500 hover:text-red-400"
                          onClick={() => handleDelete(user.id)}
                          disabled={user.role === 'ADMIN'} // Não permitir excluir administradores
                          title={user.role === 'ADMIN' ? "Administradores não podem ser excluídos" : "Excluir usuário"}
                        >
                          <TrashIcon className={`h-5 w-5 ${user.role === 'ADMIN' ? 'opacity-30 cursor-not-allowed' : ''}`} />
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