export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // Base64 string
  timestamp: number;
  isThinking?: boolean;
}

export enum SendingState {
  IDLE = 'IDLE',
  SENDING = 'SENDING',
  STREAMING = 'STREAMING',
  ERROR = 'ERROR'
}

export interface ChatSessionConfig {
  apiKey: string;
}
