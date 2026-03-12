'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, MessageCircle, Bot, Wand2, Sparkles, Heart, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useElenaStore } from '@/lib/store/elena-store';
import { cn } from '@/lib/utils';

// Assistant config interface
interface AssistantConfig {
  name: string;
  title: string;
  welcomeMessage: string;
  headerColor: string;
  buttonColor: string;
  buttonIcon: string;
  avatar: string;
  position: string;
  isActive: boolean;
}

// Default config
const DEFAULT_CONFIG: AssistantConfig = {
  name: 'Elena',
  title: 'Asistente Virtual',
  welcomeMessage: '¡Hola! ¿En qué puedo ayudarte?',
  headerColor: '#0077B6',
  buttonColor: '#0077B6',
  buttonIcon: 'message-circle',
  avatar: 'woman-doctor',
  position: 'bottom-right',
  isActive: true
};

// Avatar mapping
const AVATAR_EMOJIS: Record<string, string> = {
  'bot': '🤖',
  'woman-doctor': '👩‍⚕️',
  'man-doctor': '👨‍⚕️',
  'nurse': '👩‍⚕️',
  'tooth': '🦷',
  'sparkles': '✨',
  'star': '⭐',
  'health': '💚',
};

// API endpoint for chat
const CHAT_API = '/api/elena/chat';

export function ElenaWidget() {
  const {
    isVisible,
    isExpanded,
    hasGreeted,
    transcripts,
    setExpanded,
    setHasGreeted,
    setConnectionStatus,
    addTranscript,
  } = useElenaStore();

  const [config, setConfig] = useState<AssistantConfig>(DEFAULT_CONFIG);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>(crypto.randomUUID());

  // Fetch assistant config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(CHAT_API);
        const data = await response.json();
        setConfig({ ...DEFAULT_CONFIG, ...data });
      } catch (error) {
        console.error('Error fetching config:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchConfig();
  }, []);

  // Send text message to backend
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;
    
    addTranscript('user', text);
    setInputText('');
    setIsTyping(true);
    
    try {
      const response = await fetch(CHAT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          sessionId: sessionIdRef.current,
        }),
      });
      
      const data = await response.json();
      
      if (data.response) {
        addTranscript('assistant', data.response);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      addTranscript('assistant', 'Lo siento, hubo un error. ¿Podrías intentarlo de nuevo?');
    } finally {
      setIsTyping(false);
    }
  }, [addTranscript]);

  // Play greeting on first appear
  const playGreeting = useCallback(() => {
    if (hasGreeted) return;
    
    setHasGreeted(true);
    
    const greeting = config.welcomeMessage;
    addTranscript('assistant', greeting);
  }, [hasGreeted, setHasGreeted, addTranscript, config.welcomeMessage]);

  // Handle widget toggle
  const handleToggle = useCallback(() => {
    if (!isExpanded) {
      setExpanded(true);
      setConnectionStatus('connected');
      
      if (!hasGreeted) {
        setTimeout(() => playGreeting(), 300);
      }
    } else {
      setExpanded(false);
    }
  }, [isExpanded, setExpanded, setConnectionStatus, hasGreeted, playGreeting]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [transcripts, isTyping]);

  // Don't render if not active or loading
  if (loading || !config.isActive || !isVisible) return null;

  // Get avatar emoji
  const getAvatarEmoji = () => {
    return AVATAR_EMOJIS[config.avatar] || '👩‍⚕️';
  };

  // Get icon component
  const getIcon = () => {
    switch (config.buttonIcon) {
      case 'bot':
        return <Bot className="w-6 h-6" />;
      case 'wand-2':
        return <Wand2 className="w-6 h-6" />;
      case 'sparkles':
        return <Sparkles className="w-6 h-6" />;
      case 'heart':
        return <Heart className="w-6 h-6" />;
      case 'stethoscope':
        return <Stethoscope className="w-6 h-6" />;
      default:
        return <MessageCircle className="w-6 h-6" />;
    }
  };

  const getSmallIcon = () => {
    switch (config.buttonIcon) {
      case 'bot':
        return <Bot className="w-4 h-4" />;
      case 'wand-2':
        return <Wand2 className="w-4 h-4" />;
      case 'sparkles':
        return <Sparkles className="w-4 h-4" />;
      case 'heart':
        return <Heart className="w-4 h-4" />;
      case 'stethoscope':
        return <Stethoscope className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className={cn(
      "fixed z-50",
      config.position === 'bottom-left' ? 'bottom-6 left-6' : 'bottom-6 right-6'
    )}>
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="w-[380px] h-[550px] rounded-2xl overflow-hidden shadow-2xl"
          >
            {/* Glassmorphism panel */}
            <div className="absolute inset-0 bg-white/95 backdrop-blur-xl border border-white/20" />
            
            {/* Content */}
            <div className="relative h-full flex flex-col">
              {/* Header */}
              <div 
                className="p-4 border-b border-white/20"
                style={{ backgroundColor: config.headerColor }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                        {getAvatarEmoji()}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-green-500" />
                    </div>
                    <div className="text-white">
                      <h3 className="font-heading font-semibold text-lg">{config.name}</h3>
                      <p className="text-sm text-white/80">{config.title}</p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setExpanded(false)}
                    className="text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              
              {/* Chat area */}
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
                style={{ scrollBehavior: 'smooth' }}
              >
                {transcripts.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex gap-3',
                      msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    )}
                  >
                    {msg.role === 'assistant' && (
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-lg"
                        style={{ backgroundColor: config.headerColor + '20' }}
                      >
                        {getAvatarEmoji()}
                      </div>
                    )}
                    <div
                      className={cn(
                        'max-w-[80%] rounded-2xl px-4 py-3 text-sm',
                        msg.role === 'user'
                          ? 'text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      )}
                      style={msg.role === 'user' ? { backgroundColor: config.buttonColor } : {}}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                      style={{ backgroundColor: config.headerColor + '20' }}
                    >
                      {getAvatarEmoji()}
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Input area */}
              <div className="p-4 border-t border-gray-200/50 bg-white/50">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage(inputText);
                      }
                    }}
                    placeholder="Escribe tu mensaje..."
                    className="flex-1 px-4 py-3 rounded-xl bg-gray-100 border-0 focus:ring-2 text-sm"
                    style={{ '--tw-ring-color': `${config.headerColor}30` } as React.CSSProperties}
                  />
                  <Button
                    onClick={() => sendMessage(inputText)}
                    disabled={!inputText.trim() || isTyping}
                    className="text-white rounded-xl px-4"
                    style={{ backgroundColor: config.buttonColor }}
                  >
                    {isTyping ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  {config.name} puede ayudarte con tus preguntas
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleToggle}
            className="relative group"
          >
            <div 
              className="absolute inset-0 rounded-full animate-ping opacity-25"
              style={{ backgroundColor: config.buttonColor }}
            />
            <div 
              className="relative w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-white"
              style={{ backgroundColor: config.buttonColor }}
            >
              {getIcon()}
            </div>
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {config.welcomeMessage.substring(0, 40)}...
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
