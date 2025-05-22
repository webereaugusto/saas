'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Chat from '@/components/Chat';
import { PlusIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
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
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-gray-300 flex flex-col h-full">
        {/* Título e Menu do Usuário no topo da barra lateral */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800/50">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-white">AI Chat SAAS</span>
          </Link>
          {session && (
            <Menu as="div" className="relative">
              <Menu.Button className="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-white">
                {session.user?.image ? (
                  <img
                    className="h-8 w-8 rounded-full"
                    src={session.user.image}
                    alt={session.user.name || ''}
                  />
                ) : (
                  <UserCircleIcon className="h-8 w-8 text-gray-400" />
                )}
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-[#202123] py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => signOut()}
                        className={`block w-full px-4 py-2 text-left text-sm ${
                          active ? 'bg-gray-800 text-white' : 'text-gray-300'
                        }`}
                      >
                        Sair
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          )}
        </div>

        {/* Botão Novo Chat */}
        <div className="p-2">
          <button
            onClick={createNewChat}
            className="w-full flex items-center justify-start gap-3 px-3 py-3 rounded-md border border-white/20 text-white hover:bg-gray-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Novo chat</span>
          </button>
        </div>

        {/* Lista de Chats */}
        <div className="px-2 flex-1 overflow-y-auto sidebar-scrollbar">
          <div className="mt-5 text-xs text-gray-500 font-medium uppercase px-3 mb-2">Chats anteriores</div>
          <div className="space-y-1 pb-4">
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
      <div className="flex-1 bg-[#343541] overflow-hidden">
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