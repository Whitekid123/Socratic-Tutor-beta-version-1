import React from 'react';
import { Message } from '../types';
import { Bot, User, BrainCircuit } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  // Simple formatter to handle bold text and newlines
  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j} className="font-bold text-indigo-900">{part.slice(2, -2)}</strong>;
            }
            return part;
        })}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-indigo-600' : 'bg-emerald-600'} shadow-sm`}>
          {isUser ? (
            <User className="w-5 h-5 text-white" />
          ) : (
            <Bot className="w-5 h-5 text-white" />
          )}
        </div>

        {/* Message Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div
            className={`px-5 py-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed ${
              isUser
                ? 'bg-indigo-600 text-white rounded-tr-none'
                : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
            }`}
          >
            {message.image && (
                <div className="mb-3 rounded-lg overflow-hidden border border-white/20">
                    <img src={`data:image/jpeg;base64,${message.image}`} alt="User upload" className="max-w-full h-auto max-h-64 object-cover" />
                </div>
            )}
            
            {message.isThinking ? (
                <div className="flex items-center gap-2 text-indigo-200 animate-pulse">
                    <BrainCircuit className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Thinking deeply...</span>
                </div>
            ) : (
                <div>{formatText(message.text)}</div>
            )}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 px-1">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
