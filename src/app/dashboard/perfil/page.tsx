'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { UserCircleIcon, ArrowLeftIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';

// Importação dinâmica do componente de estatísticas para evitar problemas de SSR com Chart.js
const UserStats = dynamic(() => import('@/components/UserStats'), { ssr: false });

export default function UserProfile() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    image: '',
    password: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user) {
      setUserData({
        name: session.user.name || '',
        email: session.user.email || '',
        image: session.user.image || '',
        password: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [status, session, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (userData.newPassword && userData.newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    if (userData.newPassword && userData.newPassword !== userData.confirmPassword) {
      toast.error('As senhas não conferem');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userData.name,
          password: userData.password,
          newPassword: userData.newPassword || undefined,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erro ao atualizar perfil');
      }
      
      // Atualizar a sessão com os novos dados
      await update({
        ...session,
        user: {
          ...session?.user,
          name: userData.name,
        },
      });
      
      toast.success('Perfil atualizado com sucesso');
      setUserData(prev => ({
        ...prev,
        password: '',
        newPassword: '',
        confirmPassword: '',
      }));
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="flex h-screen bg-[#343541]">
      <div className="w-full max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <a href="/dashboard" className="text-gray-300 hover:text-white mr-4">
            <ArrowLeftIcon className="h-5 w-5" />
          </a>
          <h1 className="text-2xl font-bold text-white">Meu Perfil</h1>
        </div>

        {/* Abas */}
        <div className="flex space-x-2 mb-6 border-b border-gray-700">
          <button
            className={`px-4 py-3 font-medium focus:outline-none ${
              activeTab === 'profile'
                ? 'text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            Informações Pessoais
          </button>
          <button
            className={`px-4 py-3 font-medium focus:outline-none ${
              activeTab === 'stats'
                ? 'text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('stats')}
          >
            <span className="flex items-center">
              <ChartBarIcon className="h-4 w-4 mr-1" />
              Estatísticas de Uso
            </span>
          </button>
        </div>

        {activeTab === 'profile' ? (
          <div className="bg-gray-800 rounded-lg shadow p-6">
            <div className="flex flex-col items-center mb-6">
              {userData.image ? (
                <img src={userData.image} alt={userData.name} className="w-24 h-24 rounded-full mb-4" />
              ) : (
                <UserCircleIcon className="w-24 h-24 text-gray-400 mb-4" />
              )}
              <h2 className="text-xl font-semibold text-white">{userData.name || 'Usuário'}</h2>
              <p className="text-gray-400">{userData.email}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={userData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Seu nome"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={userData.email}
                  disabled
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-400 cursor-not-allowed"
                  placeholder="seu@email.com"
                />
                <p className="mt-1 text-xs text-gray-400">O email não pode ser alterado</p>
              </div>

              <div className="border-t border-gray-700 pt-6 mt-6">
                <h3 className="text-lg font-medium text-white mb-4">Alterar Senha</h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                      Senha Atual
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={userData.password}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Digite sua senha atual"
                    />
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-1">
                      Nova Senha
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={userData.newPassword}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Digite uma nova senha"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                      Confirme a Nova Senha
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={userData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Confirme a nova senha"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <UserStats />
        )}
      </div>
    </div>
  );
} 