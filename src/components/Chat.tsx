import { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
}

interface ChatProps {
  chatId: string;
  onUpdate?: () => void;
}

export default function Chat({ chatId, onUpdate }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadMessages();
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/chat/${chatId}`);
      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      toast.error('Erro ao carregar mensagens');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage = { id: Date.now().toString(), content: input, role: 'user' as const };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, chatId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        content: data.message,
        role: 'assistant'
      }]);

      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      toast.error('Erro ao enviar mensagem');
    } finally {
      setIsLoading(false);
    }
  };

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-full max-w-2xl px-4">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-white mb-2">Como posso ajudar?</h1>
          </div>
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative flex flex-col w-full flex-grow bg-[#40414f] rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.1)] border border-gray-800/50">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  adjustTextareaHeight();
                }}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua mensagem..."
                rows={1}
                className="w-full resize-none bg-transparent border-0 p-3 pr-12 text-white focus:ring-0 focus-visible:ring-0 placeholder-gray-500"
                style={{ maxHeight: '200px' }}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 bottom-2.5 p-1 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-700 disabled:hover:bg-transparent disabled:opacity-40"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>
          </form>
          <div className="text-center mt-2 text-xs text-gray-500">
            Pressione Enter para enviar, Shift + Enter para nova linha
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto pb-32 sidebar-scrollbar mt-4">
        {messages.map((message) => (
          message.role === 'user' ? (
            <div key={message.id} className="px-4 py-3 max-w-2xl mx-auto">
              <div className="flex justify-end">
                <div className="bg-blue-500 text-white px-4 py-2 rounded-lg max-w-[80%] whitespace-pre-wrap">
                  {message.content}
                </div>
              </div>
            </div>
          ) : (
            <div key={message.id} className="bg-[#444654] py-4">
              <div className="max-w-2xl mx-auto px-4">
                <div className="flex gap-4 text-base">
                  <div className="w-7 h-7 rounded bg-teal-500 flex items-center justify-center flex-shrink-0">
                    AI
                  </div>
                  <div className="min-h-[20px] text-gray-100 whitespace-pre-wrap">
                    {message.content}
                  </div>
                </div>
              </div>
            </div>
          )
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-0 left-64 right-0 mx-auto flex justify-center p-4 pb-6 bg-gradient-to-t from-[#343541] via-[#343541] to-transparent">
        <div className="w-full max-w-2xl">
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative flex flex-col w-full flex-grow bg-[#40414f] rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.1)] border border-gray-800/50">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  adjustTextareaHeight();
                }}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua mensagem..."
                rows={1}
                className="w-full resize-none bg-transparent border-0 p-3 pr-12 text-white focus:ring-0 focus-visible:ring-0 placeholder-gray-500"
                style={{ maxHeight: '200px' }}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 bottom-2.5 p-1 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-700 disabled:hover:bg-transparent disabled:opacity-40"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>
          </form>
          <div className="text-center mt-2 text-xs text-gray-500">
            Pressione Enter para enviar, Shift + Enter para nova linha
          </div>
        </div>
      </div>
    </div>
  );
} 