'use client';

import { useState, useEffect, Fragment } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Chat from '@/components/Chat';
import { PlusIcon, UserCircleIcon, EllipsisHorizontalIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [chats, setChats] = useState<Array<{ id: string; title: string }>>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [tempChatId, setTempChatId] = useState<string | null>(null);

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
      
      // Filtra chats que tenham pelo menos uma mensagem
      const chatsWithMessages = data.chats.filter((chat: any) => 
        chat.messageCount > 0 || chat.id === tempChatId
      );
      
      setChats(chatsWithMessages);
      
      if (chatsWithMessages.length > 0 && !selectedChat) {
        setSelectedChat(chatsWithMessages[0].id);
      }
    } catch (error) {
      toast.error('Erro ao carregar chats');
    }
  };

  const createNewChat = async () => {
    try {
      // Criar novo chat na API
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Novo Chat' }),
      });
      const data = await response.json();
      
      // Definir o novo chat como selecionado mas não adicionar à lista até ter mensagens
      setSelectedChat(data.chat.id);
      setTempChatId(data.chat.id);
      
    } catch (error) {
      toast.error('Erro ao criar novo chat');
    }
  };

  const handleRenameChat = async (chatId: string, title: string) => {
    setIsRenaming(null);
    
    if (!title.trim() || title === chats.find(c => c.id === chatId)?.title) {
      return; // Não faz nada se o título estiver vazio ou não foi alterado
    }

    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        throw new Error('Falha ao renomear chat');
      }

      const data = await response.json();
      
      // Atualizar o estado local com o novo título
      setChats(prev => prev.map(chat => 
        chat.id === chatId ? { ...chat, title: data.chat.title } : chat
      ));

      toast.success('Chat renomeado com sucesso');
    } catch (error) {
      toast.error('Erro ao renomear chat');
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    // Confirmar exclusão
    if (!window.confirm("Tem certeza que deseja excluir este chat?")) {
      return;
    }

    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Falha ao excluir chat');
      }

      // Remover o chat da lista
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      
      // Se o chat excluído for o selecionado, selecionar outro
      if (selectedChat === chatId) {
        const remainingChats = chats.filter(chat => chat.id !== chatId);
        setSelectedChat(remainingChats.length > 0 ? remainingChats[0].id : null);
        setTempChatId(null); // Limpa o tempChatId se o chat excluído for o temporário
      }

      toast.success('Chat excluído com sucesso');
    } catch (error) {
      toast.error('Erro ao excluir chat');
    }
  };

  const startRenaming = (chatId: string, currentTitle: string) => {
    setIsRenaming(chatId);
    setNewTitle(currentTitle);
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
            <div className="flex items-center">
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
                        <a
                          href="/dashboard/perfil"
                          className={`flex items-center w-full px-4 py-2 text-left text-sm ${
                            active ? 'bg-gray-800 text-white' : 'text-gray-300'
                          }`}
                        >
                          <UserCircleIcon className="h-4 w-4 mr-2" />
                          Meu Perfil
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => signOut()}
                          className={`flex items-center w-full px-4 py-2 text-left text-sm ${
                            active ? 'bg-gray-800 text-white' : 'text-gray-300'
                          }`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                          </svg>
                          Sair
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
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
          <div className="space-y-0.5 pb-4">
            {chats.map((chat) => (
              <div key={chat.id} className="flex items-center relative group">
                {isRenaming === chat.id ? (
                  <div className="flex items-center w-full px-3 py-2">
                    <input 
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleRenameChat(chat.id, newTitle);
                        } else if (e.key === 'Escape') {
                          setIsRenaming(null);
                        }
                      }}
                      className="w-full bg-gray-800 text-white px-2 py-1 rounded outline-none"
                      autoFocus
                      onBlur={() => handleRenameChat(chat.id, newTitle)}
                    />
                  </div>
                ) : (
                  <div 
                    className={`flex items-center w-full px-3 py-2 rounded-md hover:bg-gray-700 transition-colors ${
                      selectedChat === chat.id ? 'bg-gray-800 text-white' : 'text-gray-300'
                    }`}
                  >
                    <button
                      onClick={() => setSelectedChat(chat.id)}
                      className="flex-grow text-left min-w-0 overflow-hidden mr-2 text-sm"
                      title={chat.title}
                    >
                      <span className="truncate block">{chat.title}</span>
                    </button>
                    <Menu as="div" className="flex-shrink-0">
                      <Menu.Button className={`p-1 rounded-md hover:bg-gray-700 text-gray-400 hover:text-gray-200 focus:outline-none transition-opacity duration-200 ${
                        selectedChat === chat.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}>
                        <EllipsisHorizontalIcon className="h-5 w-5" />
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
                        <Menu.Items className="absolute right-0 z-10 mt-1 w-48 origin-top-right rounded-md bg-[#202123] py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => startRenaming(chat.id, chat.title)}
                                className={`flex items-center w-full px-4 py-2 text-left text-sm ${
                                  active ? 'bg-gray-800 text-white' : 'text-gray-300'
                                }`}
                              >
                                <PencilIcon className="h-4 w-4 mr-2" />
                                Renomear
                              </button>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => handleDeleteChat(chat.id)}
                                className={`flex items-center w-full px-4 py-2 text-left text-sm ${
                                  active ? 'bg-gray-800 text-white' : 'text-gray-300'
                                }`}
                              >
                                <TrashIcon className="h-4 w-4 mr-2" />
                                Excluir
                              </button>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                )}
              </div>
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