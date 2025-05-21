'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Chat from '@/components/Chat';
import { PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [chats, setChats] = useState<Array<{ id: string; title: string }>>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      loadChats();
    }
  }, [status, router]);

  const loadChats = async () => {
    try {
      const response = await fetch('/api/chats');
      const data = await response.json();
      setChats(data.chats);
      if (data.chats.length > 0 && !selectedChat) {
        setSelectedChat(data.chats[0].id);
      }
    } catch (error) {
      toast.error('Erro ao carregar chats');
    }
  };

  const createNewChat = async () => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Novo Chat' }),
      });
      const data = await response.json();
      setChats((prev) => [...prev, data.chat]);
      setSelectedChat(data.chat.id);
    } catch (error) {
      toast.error('Erro ao criar novo chat');
    }
  };

  if (status === 'loading') {
    return <div>Carregando...</div>;
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-gray-300">
        <div className="p-2">
          <button
            onClick={createNewChat}
            className="w-full flex items-center justify-start gap-3 px-3 py-3 rounded-md border border-white/20 text-white hover:bg-gray-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Novo chat</span>
          </button>
        </div>
        <div className="px-2 pb-2">
          <div className="mt-5 text-xs text-gray-500 font-medium uppercase px-3 mb-2">Chats anteriores</div>
          <div className="space-y-1">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat.id)}
                className={`w-full flex items-center px-3 py-3 text-sm rounded-md hover:bg-gray-700 transition-colors ${
                  selectedChat === chat.id
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300'
                }`}
              >
                <span className="truncate">{chat.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-[#343541]">
        {selectedChat ? (
          <Chat chatId={selectedChat} onUpdate={loadChats} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            Selecione ou crie um chat para começar
          </div>
        )}
      </div>
    </div>
  );
} 