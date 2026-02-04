import React, { useState, useRef, ChangeEvent, KeyboardEvent } from 'react';
import { Send, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { SendingState } from '../types';

interface InputAreaProps {
  onSendMessage: (text: string, image?: string) => void;
  status: SendingState;
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, status }) => {
  const [text, setText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file.');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,") to get raw base64
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        setSelectedImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = () => {
    if ((!text.trim() && !selectedImage) || status === SendingState.SENDING || status === SendingState.STREAMING) {
      return;
    }
    onSendMessage(text, selectedImage || undefined);
    setText('');
    setSelectedImage(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isLoading = status === SendingState.SENDING || status === SendingState.STREAMING;

  return (
    <div className="bg-white border-t border-slate-200 p-4 pb-6 md:pb-4">
      <div className="max-w-3xl mx-auto flex flex-col gap-3">
        
        {/* Image Preview */}
        {selectedImage && (
          <div className="relative inline-block w-fit">
            <img 
              src={`data:image/jpeg;base64,${selectedImage}`} 
              alt="Preview" 
              className="h-20 w-auto rounded-lg border border-slate-200 shadow-sm"
            />
            <button
              onClick={() => {
                  setSelectedImage(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-sm"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all shadow-sm">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-slate-400 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-indigo-50"
            disabled={isLoading}
            title="Upload math problem"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />

          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedImage ? "Add a question about this image..." : "Ask a math question or upload a photo..."}
            className="flex-1 bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400"
            disabled={isLoading}
          />

          <button
            onClick={handleSend}
            disabled={isLoading || (!text.trim() && !selectedImage)}
            className={`p-2 rounded-full transition-all ${
              isLoading || (!text.trim() && !selectedImage)
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
            }`}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
          </button>
        </div>
        
        <div className="text-center text-xs text-slate-400">
            Powered by Gemini 3 Pro • Socratic Mode Active
        </div>
      </div>
    </div>
  );
};

export default InputArea;
