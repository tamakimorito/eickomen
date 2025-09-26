// FIX: Removed `import { AppState } from './App';` which caused a circular dependency and redeclaration error as AppState is defined below.
export enum AppState {
  UNAUTHENTICATED,
  AUTHENTICATING,
  AUTHENTICATED_IDLE,
  SEARCHING,
  CANDIDATES,
  NO_MATCH,
  LOADING_CONVO,
  CONVERSATION,
  PAGINATING,
  ERROR,
}

export interface AuthResponse {
  ok: boolean;
  error?: string;
}

export interface Candidate {
  userId: string;
  count: number;
  lastTs: string;
}

export interface SearchResponse {
  ok: boolean;
  maskedPhone: string;
  candidates: Candidate[];
  error?: string;
}

export interface Message {
  date: string;
  time: string;
  side: 'left' | 'right';
  type: 'text';
  text: string;
  ts: number;
}

export interface ConversationResponse {
  ok: boolean;
  userId: string;
  count: number;
  nextBefore: string | null;
  messages: Message[];
  error?: string;
}

export interface NotifyResponse {
  ok: boolean;
  deduped?: boolean;
  error?: string;
}