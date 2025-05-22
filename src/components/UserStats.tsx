import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import toast from 'react-hot-toast';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Configurações globais para temas escuros
ChartJS.defaults.color = '#9ca3af';
ChartJS.defaults.borderColor = '#374151';

interface StatsData {
  totalChats: number;
  totalMessages: number;
  messageDistribution: {
    user: number;
    assistant: number;
  };
  messagesByHour: number[];
  messagesByDay: number[];
  chatsByMonth: {
    month: string;
    count: number;
  }[];
  recentActivity: {
    id: string;
    title: string;
    lastMessage: string;
    updatedAt: string;
  }[];
}

export default function UserStats() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/user/stats');
        
        if (!response.ok) {
          throw new Error('Falha ao carregar estatísticas');
        }
        
        const data = await response.json();
        setStats(data);
      } catch (error) {
        setError('Erro ao carregar dados estatísticos');
        toast.error('Erro ao carregar estatísticas');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center text-gray-300">
        <p>{error || 'Não foi possível carregar as estatísticas'}</p>
        <button 
          className="mt-4 px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700 transition-colors"
          onClick={() => window.location.reload()}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  // Configuração do gráfico de distribuição de mensagens
  const messageDistributionData = {
    labels: ['Suas mensagens', 'Respostas da IA'],
    datasets: [
      {
        data: [stats.messageDistribution.user, stats.messageDistribution.assistant],
        backgroundColor: ['#3b82f6', '#10b981'],
        borderWidth: 1,
        borderColor: ['#2563eb', '#059669'],
      },
    ],
  };

  // Configuração do gráfico de mensagens por hora
  const messagesByHourData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}h`),
    datasets: [
      {
        label: 'Mensagens',
        data: stats.messagesByHour,
        backgroundColor: '#3b82f6',
        borderColor: '#2563eb',
        borderWidth: 1,
      },
    ],
  };

  // Configuração do gráfico de mensagens por dia da semana
  const messagesByDayData = {
    labels: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    datasets: [
      {
        label: 'Mensagens',
        data: stats.messagesByDay,
        backgroundColor: '#3b82f6',
        borderColor: '#2563eb',
        borderWidth: 1,
      },
    ],
  };

  // Configuração do gráfico de chats por mês
  const chatsByMonthData = {
    labels: stats.chatsByMonth.map(item => item.month),
    datasets: [
      {
        label: 'Chats criados',
        data: stats.chatsByMonth.map(item => item.count),
        backgroundColor: '#8b5cf6',
        borderColor: '#7c3aed',
        borderWidth: 2,
        tension: 0.3,
        fill: false,
      },
    ],
  };

  return (
    <div className="space-y-8 mb-10">
      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-6 shadow">
          <h3 className="text-lg font-medium text-gray-300 mb-2">Total de Chats</h3>
          <p className="text-3xl font-bold text-white">{stats.totalChats}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 shadow">
          <h3 className="text-lg font-medium text-gray-300 mb-2">Total de Mensagens</h3>
          <p className="text-3xl font-bold text-white">{stats.totalMessages}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 shadow">
          <h3 className="text-lg font-medium text-gray-300 mb-2">Taxa de Resposta</h3>
          <p className="text-3xl font-bold text-white">
            {stats.messageDistribution.user > 0 
              ? Math.round((stats.messageDistribution.assistant / stats.messageDistribution.user) * 100) / 100
              : 0}
          </p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Distribuição de mensagens */}
        <div className="bg-gray-800 rounded-lg p-6 shadow">
          <h3 className="text-lg font-medium text-gray-300 mb-4">Distribuição de Mensagens</h3>
          <div className="h-64">
            <Doughnut 
              data={messageDistributionData} 
              options={{
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
                maintainAspectRatio: false,
              }} 
            />
          </div>
        </div>

        {/* Atividade por hora do dia */}
        <div className="bg-gray-800 rounded-lg p-6 shadow">
          <h3 className="text-lg font-medium text-gray-300 mb-4">Atividade por Hora do Dia</h3>
          <div className="h-64">
            <Bar 
              data={messagesByHourData} 
              options={{
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
                maintainAspectRatio: false,
              }} 
            />
          </div>
        </div>

        {/* Atividade por dia da semana */}
        <div className="bg-gray-800 rounded-lg p-6 shadow">
          <h3 className="text-lg font-medium text-gray-300 mb-4">Atividade por Dia da Semana</h3>
          <div className="h-64">
            <Bar 
              data={messagesByDayData} 
              options={{
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
                maintainAspectRatio: false,
              }} 
            />
          </div>
        </div>

        {/* Chats por mês */}
        <div className="bg-gray-800 rounded-lg p-6 shadow">
          <h3 className="text-lg font-medium text-gray-300 mb-4">Chats Criados por Mês</h3>
          <div className="h-64">
            <Line 
              data={chatsByMonthData} 
              options={{
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0,
                    },
                  },
                },
                maintainAspectRatio: false,
              }} 
            />
          </div>
        </div>
      </div>

      {/* Atividade Recente */}
      <div className="bg-gray-800 rounded-lg p-6 shadow">
        <h3 className="text-lg font-medium text-gray-300 mb-4">Atividade Recente</h3>
        <div className="space-y-4">
          {stats.recentActivity.length > 0 ? (
            stats.recentActivity.map((activity) => (
              <div key={activity.id} className="border-b border-gray-700 pb-3 last:border-0 last:pb-0">
                <p className="font-medium text-white">{activity.title}</p>
                <p className="text-sm text-gray-400 mt-1">{activity.lastMessage}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(activity.updatedAt).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-400">Nenhuma atividade recente</p>
          )}
        </div>
      </div>
    </div>
  );
} 