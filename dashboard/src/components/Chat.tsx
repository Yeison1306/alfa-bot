'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, Copy, Check, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  isLoading?: boolean;
}

export function Chat({ projectId }: { projectId?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage], projectId }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error en el chat');

      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `❌ Error: ${error.message}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col h-full bg-dark-50 dark:bg-dark-900 rounded-xl border border-dark-200 dark:border-dark-700 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-dark-400 dark:text-dark-500 py-12">
            <Bot className="mx-auto mb-3 h-12 w-12 text-primary-500" />
            <p className="text-lg font-medium">Bienvenido a Alfa</p>
            <p className="text-sm mt-1">Escribe tu pregunta o tarea para comenzar</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={cn('flex gap-3', msg.role === 'user' && 'flex-row-reverse')}
          >
            <div
              className={cn(
                'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium',
                msg.role === 'user'
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-400'
              )}
            >
              {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <div
              className={cn(
                'max-w-[80%] px-4 py-2 rounded-2xl',
                msg.role === 'user'
                  ? 'bg-primary-500 text-white rounded-tr-none'
                  : 'bg-dark-100 dark:bg-dark-800 text-dark-900 dark:text-dark-100 rounded-tl-none'
              )}
            >
              <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
              {msg.role === 'assistant' && (
                <button
                  onClick={() => copyToClipboard(msg.content)}
                  className="mt-2 text-xs opacity-50 hover:opacity-100 transition-opacity flex items-center gap-1"
                >
                  <Copy className="h-3 w-3" />
                  Copiar
                </button>
              )}
              {msg.isLoading && (
                <div className="flex items-center gap-2 text-xs opacity-70 mt-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Alfa está pensando...
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-dark-200 dark:border-dark-700 p-4">
        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu mensaje... (Shift+Enter para nueva línea)"
            disabled={isLoading}
            rows={1}
            className="flex-1 resize-none px-4 py-2 bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
            style={{ minHeight: '44px', maxHeight: '150px' }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-6 py-2 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enviar'}
          </button>
        </div>
      </form>
    </div>
  );
}