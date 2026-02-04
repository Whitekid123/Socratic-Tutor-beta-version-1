import React, { useState, useEffect, useRef } from 'react';
import { Message, SendingState } from './types';
import { geminiService } from './services/gemini';
import ChatMessage from './components/ChatMessage';
import InputArea from './components/InputArea';
import { BookOpen, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "**Hello! I'm your Socratic Math Tutor.** \n\nI'm here to help you understand math, step-by-step. Upload a photo of a problem or ask me a question. We'll solve it together!",
      timestamp: Date.now()
    }
  ]);
  const [status, setStatus] = useState<SendingState>(SendingState.IDLE);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, status]);

  // Initialize chat on mount
  useEffect(() => {
    try {
        geminiService.startChat();
    } catch (e) {
        console.error("Failed to start chat service", e);
    }
  }, []);

  const handleSendMessage = async (text: string, image?: string) => {
    // 1. Add User Message
    const userMsgId = Date.now().toString();
    const newUserMsg: Message = {
      id: userMsgId,
      role: 'user',
      text,
      image,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, newUserMsg]);
    setStatus(SendingState.SENDING);

    // 2. Add Placeholder Bot Message (Thinking state)
    const botMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: botMsgId,
      role: 'model',
      text: '',
      timestamp: Date.now(),
      isThinking: true
    }]);

    try {
      // 3. Call Service
      const stream = await geminiService.sendMessageStream(text, image);
      
      setStatus(SendingState.STREAMING);
      let fullResponseText = '';

      // 4. Stream response
      for await (const chunk of stream) {
        fullResponseText += chunk;
        
        setMessages(prev => prev.map(msg => 
          msg.id === botMsgId 
            ? { ...msg, text: fullResponseText, isThinking: false } 
            : msg
        ));
      }

      setStatus(SendingState.IDLE);

    } catch (error) {
      console.error(error);
      // Remove thinking bubble and show error
      setMessages(prev => prev.filter(msg => msg.id !== botMsgId));
      
      // Add error message
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "I'm sorry, I encountered an issue thinking through that problem. Please try again.",
        timestamp: Date.now()
      }]);
      setStatus(SendingState.ERROR);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <header className="flex-none bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-3 shadow-sm z-10">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-indigo-200 shadow-lg">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            Socratic Tutor
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wide border border-indigo-100">Beta</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium">Patient, step-by-step guidance</p>
        </div>
        <div className="ml-auto flex items-center gap-1 text-amber-500 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
            <Sparkles className="w-3.5 h-3.5 fill-amber-500" />
            <span className="text-xs font-semibold">Gemini 3 Pro</span>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide">
        <div className="max-w-3xl mx-auto flex flex-col pt-2">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="flex-none z-10">
        <InputArea onSendMessage={handleSendMessage} status={status} />
      </footer>
    </div>
  );
};

export default App;
