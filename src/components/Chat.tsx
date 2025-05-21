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

  return (
    <div className="flex flex-col h-full bg-[#343541]">
      <div className="flex-1 overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`${
              message.role === 'assistant' ? 'bg-[#444654]' : ''
            } text-gray-100 border-b border-gray-800/50`}
          >
            <div className="max-w-3xl mx-auto px-4 py-6">
              <div className="flex gap-4 text-base">
                <div className={`w-7 h-7 rounded flex items-center justify-center flex-shrink-0 ${
                  message.role === 'assistant' 
                    ? 'bg-teal-500' 
                    : 'bg-blue-500'
                }`}>
                  {message.role === 'assistant' ? 'AI' : 'U'}
                </div>
                <div className="min-h-[20px] whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-800/50 bg-[#343541] px-4 py-4">
        <div className="max-w-3xl mx-auto">
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