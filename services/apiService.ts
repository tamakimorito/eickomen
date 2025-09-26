import { API_KEY, BASE_URL } from '../constants';
import { AuthResponse, SearchResponse, ConversationResponse, NotifyResponse } from '../types';

export interface NotifyPayload {
  pass: string;
  apName: string;
  recordId: string;
  phone: string;
  requestType: 'email' | 'address';
  roomId?: string;
}

const fetchApi = async <T>(payload: object): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

  const body = new URLSearchParams();
  // Add API key to all requests
  body.append('key', API_KEY);
  
  const act = (payload as any)?.action ? String((payload as any).action).toLowerCase() : '';

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      body.append(key, String(value));
    }
  });

  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const json = await response.json().catch(() => {
      throw new Error(`レスポンスの解析に失敗しました。サーバーの状態を確認してください。(HTTP Status: ${response.status})`);
    });
    
    if (!response.ok || json.ok === false) {
      console.error("API Error Response:", json);
      let msg = json.error || `サーバーエラーが発生しました (HTTP Status: ${response.status})`;
      if (response.status === 403 || act === 'auth' || json.error === 'wrong_password') {
        msg = 'パスワードが間違っています。';
      }
      throw new Error(msg);
    }
    
    return json as T;

  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('リクエストがタイムアウトしました (30秒)');
    }
    console.error('API Service Error:', error);
    throw (error instanceof Error) ? error : new Error('不明なエラーが発生しました。');
  }
};

export const authenticate = async (pass: string): Promise<AuthResponse> => {
  return fetchApi<AuthResponse>({
    action: 'auth',
    pass,
  });
};

export const searchPhone = async (pass: string, phone: string): Promise<SearchResponse> => {
  return fetchApi<SearchResponse>({
    action: 'search',
    pass,
    phone,
  });
};

export const getConversation = async (
  pass: string,
  userId: string,
  before: string | null = null
): Promise<ConversationResponse> => {
  return fetchApi<ConversationResponse>({
    action: 'conversation',
    pass,
    userId,
    before,
    limit: 500,
  });
};

export const notify = async (payload: NotifyPayload): Promise<NotifyResponse> => {
  return fetchApi<NotifyResponse>({
    action: 'notify',
    ...payload,
  });
};
