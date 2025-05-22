import { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  isTyping?: boolean; // Para controlar o efeito de digitação
}

interface ChatProps {
  chatId: string;
  onUpdate?: () => void;
}

export default function Chat({ chatId, onUpdate }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [displayedContent, setDisplayedContent] = useState<{[key: string]: string}>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingSpeed = 10; // milissegundos por caractere

  useEffect(() => {
    loadMessages();
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, displayedContent]);

  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/chat/${chatId}`);
      const data = await response.json();
      
      // Inicializar o conteúdo exibido para cada mensagem
      const initialDisplayContent: {[key: string]: string} = {};
      data.messages.forEach((msg: Message) => {
        initialDisplayContent[msg.id] = msg.role === 'assistant' ? '' : msg.content;
      });
      
      setMessages(data.messages);
      setDisplayedContent(initialDisplayContent);
      
      // Simular a digitação para as mensagens existentes da IA
      data.messages.forEach((msg: Message) => {
        if (msg.role === 'assistant') {
          simulateTyping(msg.id, msg.content);
        }
      });
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

  const simulateTyping = (messageId: string, content: string) => {
    let currentIndex = 0;
    const intervalId = setInterval(() => {
      if (currentIndex <= content.length) {
        setDisplayedContent(prev => ({
          ...prev,
          [messageId]: content.substring(0, currentIndex)
        }));
        currentIndex++;
      } else {
        clearInterval(intervalId);
      }
    }, typingSpeed);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage = { id: Date.now().toString(), content: input, role: 'user' as const };
    setMessages((prev) => [...prev, userMessage]);
    setDisplayedContent(prev => ({
      ...prev,
      [userMessage.id]: userMessage.content
    }));
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      // Adicionar uma mensagem temporária da IA com isTyping=true
      const tempMessageId = `temp-${Date.now()}`;
      setMessages((prev) => [...prev, {
        id: tempMessageId,
        content: '',
        role: 'assistant',
        isTyping: true
      }]);
      setDisplayedContent(prev => ({
        ...prev,
        [tempMessageId]: ''
      }));

      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, chatId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Substituir a mensagem temporária pela mensagem real
      const assistantMessageId = Date.now().toString();
      setMessages((prev) => prev.map(msg => 
        msg.id === tempMessageId 
          ? { id: assistantMessageId, content: data.message, role: 'assistant' }
          : msg
      ));
      setDisplayedContent(prev => ({
        ...prev,
        [assistantMessageId]: ''
      }));

      // Iniciar o efeito de digitação
      simulateTyping(assistantMessageId, data.message);

      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      toast.error('Erro ao enviar mensagem');
      // Remover a mensagem temporária em caso de erro
      setMessages((prev) => prev.filter(msg => !msg.isTyping));
    } finally {
      setIsLoading(false);
    }
  };

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-full max-w-[768px] px-4">
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
            <div key={message.id} className="px-4 py-3 max-w-[768px] mx-auto">
              <div className="flex justify-end">
                <div className="bg-blue-500 text-white px-4 py-2 rounded-lg max-w-[80%] whitespace-pre-wrap">
                  {message.content}
                </div>
              </div>
            </div>
          ) : (
            <div key={message.id} className="py-4">
              <div className="max-w-[768px] mx-auto px-4">
                <div className="text-base text-gray-100 whitespace-pre-wrap">
                  {displayedContent[message.id]}
                  {message.isTyping && <span className="typing-cursor">▊</span>}
                </div>
              </div>
            </div>
          )
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-0 left-64 right-0 mx-auto flex justify-center p-4 pb-6 bg-gradient-to-t from-[#343541] via-[#343541] to-transparent">
        <div className="w-full max-w-[768px]">
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

      <style jsx global>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        .typing-cursor {
          display: inline-block;
          width: 0.5em;
          animation: blink 1s infinite;
        }
      `}</style>
    </div>
  );
} 