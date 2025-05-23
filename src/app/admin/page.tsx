'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  UserIcon, 
  ChatBubbleLeftRightIcon, 
  EnvelopeIcon, 
  ArrowTrendingUpIcon,
  UsersIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import AdminLayout from '@/components/AdminLayout';
import toast from 'react-hot-toast';

// Registrando os componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardStats {
  counts: {
    users: number;
    chats: number;
    messages: number;
  };
  trends: {
    userGrowth: { date: string; count: number }[];
    messageActivity: { date: string; count: number }[];
    chatCreation: { date: string; count: number }[];
  };
  messagesByRole: { role: string; count: number }[];
  topUsers: {
    id: string;
    name: string | null;
    email: string | null;
    chatCount: number;
    messageCount: number;
  }[];
}

const AdminDashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week'); // 'week', 'month', 'year'

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      // Verificar se o usuário é admin
      if (session?.user && (session.user as any).role !== 'ADMIN') {
        toast.error('Você não tem permissão para acessar esta página');
        router.push('/dashboard');
      } else {
        fetchDashboardStats();
      }
    }
  }, [status, session, router, timeRange]);

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/stats?timeRange=${timeRange}`);
      if (!response.ok) {
        throw new Error('Falha ao carregar estatísticas');
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      toast.error('Erro ao carregar estatísticas');
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setIsLoading(false);
    }
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

  if (!stats) {
    return (
      <AdminLayout>
        <div className="text-center py-10">
          <p className="text-lg text-gray-300">Nenhuma estatística disponível</p>
        </div>
      </AdminLayout>
    );
  }

  // Configuração dos gráficos
  const userGrowthData = {
    labels: stats.trends.userGrowth.map(item => item.date),
    datasets: [
      {
        label: 'Novos Usuários',
        data: stats.trends.userGrowth.map(item => item.count),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const messageActivityData = {
    labels: stats.trends.messageActivity.map(item => item.date),
    datasets: [
      {
        label: 'Mensagens por Dia',
        data: stats.trends.messageActivity.map(item => item.count),
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
        borderColor: 'rgb(153, 102, 255)',
        borderWidth: 1,
      },
    ],
  };

  const chatCreationData = {
    labels: stats.trends.chatCreation.map(item => item.date),
    datasets: [
      {
        label: 'Criação de Chats',
        data: stats.trends.chatCreation.map(item => item.count),
        backgroundColor: 'rgba(255, 159, 64, 0.5)',
        borderColor: 'rgb(255, 159, 64)',
        borderWidth: 1,
      },
    ],
  };

  const messagesByRoleData = {
    labels: stats.messagesByRole.map(item => item.role === 'user' ? 'Usuário' : 'Assistente'),
    datasets: [
      {
        label: 'Distribuição de Mensagens',
        data: stats.messagesByRole.map(item => item.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Dashboard Administrativo</h1>
          <div className="flex space-x-2">
            <button 
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 rounded ${timeRange === 'week' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'}`}
            >
              Semana
            </button>
            <button 
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 rounded ${timeRange === 'month' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'}`}
            >
              Mês
            </button>
            <button 
              onClick={() => setTimeRange('year')}
              className={`px-4 py-2 rounded ${timeRange === 'year' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'}`}
            >
              Ano
            </button>
          </div>
        </div>

        {/* Cards com estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-blue-500 bg-opacity-30 rounded-full p-3">
                <UserIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h2 className="text-white text-sm font-medium">Usuários Totais</h2>
                <p className="text-white text-2xl font-bold">{stats.counts.users}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-purple-500 bg-opacity-30 rounded-full p-3">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h2 className="text-white text-sm font-medium">Chats Totais</h2>
                <p className="text-white text-2xl font-bold">{stats.counts.chats}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-white text-xs">
              <span>Média de {(stats.counts.chats / (stats.counts.users || 1)).toFixed(1)} por usuário</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-green-500 bg-opacity-30 rounded-full p-3">
                <EnvelopeIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h2 className="text-white text-sm font-medium">Mensagens Totais</h2>
                <p className="text-white text-2xl font-bold">{stats.counts.messages}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-white text-xs">
              <span>Média de {(stats.counts.messages / (stats.counts.chats || 1)).toFixed(1)} por chat</span>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-medium text-white mb-4">Crescimento de Usuários</h3>
            <div className="h-64">
              <Line data={userGrowthData} options={{ 
                maintainAspectRatio: false,
                scales: {
                  y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: 'rgba(255,255,255,0.7)' } },
                  x: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: 'rgba(255,255,255,0.7)' } }
                },
                plugins: { legend: { labels: { color: 'rgba(255,255,255,0.7)' } } }
              }} />
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-medium text-white mb-4">Atividade de Mensagens</h3>
            <div className="h-64">
              <Bar data={messageActivityData} options={{ 
                maintainAspectRatio: false,
                scales: {
                  y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: 'rgba(255,255,255,0.7)' } },
                  x: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: 'rgba(255,255,255,0.7)' } }
                },
                plugins: { legend: { labels: { color: 'rgba(255,255,255,0.7)' } } }
              }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-medium text-white mb-4">Criação de Chats</h3>
            <div className="h-64">
              <Bar data={chatCreationData} options={{ 
                maintainAspectRatio: false,
                scales: {
                  y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: 'rgba(255,255,255,0.7)' } },
                  x: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: 'rgba(255,255,255,0.7)' } }
                },
                plugins: { legend: { labels: { color: 'rgba(255,255,255,0.7)' } } }
              }} />
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-medium text-white mb-4">Distribuição de Mensagens</h3>
            <div className="h-64 flex items-center justify-center">
              <Doughnut data={messagesByRoleData} options={{ 
                maintainAspectRatio: false,
                plugins: { 
                  legend: { 
                    labels: { color: 'rgba(255,255,255,0.7)' },
                    position: 'bottom' 
                  } 
                }
              }} />
            </div>
          </div>
        </div>

        {/* Usuários mais ativos */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
          <h3 className="text-lg font-medium text-white mb-4">Usuários Mais Ativos</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="py-3 px-4 text-gray-300 font-medium">Usuário</th>
                  <th className="py-3 px-4 text-gray-300 font-medium">Email</th>
                  <th className="py-3 px-4 text-gray-300 font-medium text-center">Chats</th>
                  <th className="py-3 px-4 text-gray-300 font-medium text-center">Mensagens</th>
                  <th className="py-3 px-4 text-gray-300 font-medium text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {stats.topUsers.map(user => (
                  <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="py-3 px-4 text-gray-200">{user.name || 'Anônimo'}</td>
                    <td className="py-3 px-4 text-gray-200">{user.email || 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-200 text-center">{user.chatCount}</td>
                    <td className="py-3 px-4 text-gray-200 text-center">{user.messageCount}</td>
                    <td className="py-3 px-4 text-center">
                      <button 
                        onClick={() => router.push(`/admin/users/${user.id}`)}
                        className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                      >
                        Ver Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard; 