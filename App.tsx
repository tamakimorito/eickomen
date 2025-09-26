import React, { useState, useCallback, useRef } from 'react';

import TopBar from './components/TopBar';
import ControlsBar from './components/ControlsBar';
import InfoPanel from './components/InfoPanel';
import LoadingSpinner from './components/LoadingSpinner';
import CandidateSelection from './components/CandidateSelection';
import ConversationView from './components/ConversationView';
import ManualRequestForm from './components/ManualRequestForm';
import { AppState, Candidate, Message, SearchResponse, ConversationResponse } from './types';
import * as api from './services/apiService';
import { normalizePhoneNumber } from './utils/phoneUtils';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.UNAUTHENTICATED);
  const [password, setPassword] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [phoneInput, setPhoneInput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [searchData, setSearchData] = useState<Pick<SearchResponse, 'maskedPhone' | 'candidates'> | null>(null);
  const [conversationData, setConversationData] = useState<Omit<ConversationResponse, 'ok' | 'error'> | null>(null);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextToastId = useRef(0);

  const addToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = nextToastId.current++;
    setToasts(prev => [...prev, { id, message, type }]);
    const timer = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleError = useCallback((e: any, defaultMessage: string) => {
    const errorMessage = e instanceof Error ? e.message : defaultMessage;
    console.error(e);
    setError(errorMessage);
    setAppState(AppState.ERROR);
  }, []);

  const handleAuth = useCallback(async () => {
    if (!passwordInput) return;
    setAppState(AppState.AUTHENTICATING);
    setError(null);
    try {
      await api.authenticate(passwordInput);
      setPassword(passwordInput);
      setAppState(AppState.AUTHENTICATED_IDLE);
    } catch (e) {
      handleError(e, '認証に失敗しました。');
    }
  }, [passwordInput, handleError]);

  const handleSelectCandidate = useCallback(async (userId: string, maskedPhone?: string, candidates?: Candidate[]) => {
    setAppState(AppState.LOADING_CONVO);
    setError(null);
    try {
      const data = await api.getConversation(password, userId, null);
      setConversationData(data);
      if (maskedPhone && candidates) {
        setSearchData({ maskedPhone, candidates });
      }
      setAppState(AppState.CONVERSATION);
    } catch (e) {
      handleError(e, '会話の読み込みに失敗しました。');
    }
  }, [password, handleError]);

  const handleSearch = useCallback(async () => {
    const normalizedPhone = normalizePhoneNumber(phoneInput);
    if (normalizedPhone.length < 9) return;
    setAppState(AppState.SEARCHING);
    setError(null);
    setSearchData(null);
    setConversationData(null);
    try {
      const data = await api.searchPhone(password, normalizedPhone);
      if (data.candidates.length === 0) {
        setAppState(AppState.NO_MATCH);
      } else if (data.candidates.length === 1) {
        await handleSelectCandidate(data.candidates[0].userId, data.maskedPhone, data.candidates);
      } else {
        setSearchData({ maskedPhone: data.maskedPhone, candidates: data.candidates });
        setAppState(AppState.CANDIDATES);
      }
    } catch (e) {
      handleError(e, '検索に失敗しました。');
    }
  }, [password, phoneInput, handleSelectCandidate, handleError]);

  const handleLoadMore = useCallback(async () => {
    if (!conversationData?.nextBefore || !conversationData?.userId) return;
    setAppState(AppState.PAGINATING);
    try {
      const data = await api.getConversation(password, conversationData.userId, conversationData.nextBefore);
      setConversationData(prev => prev ? ({
        ...prev,
        messages: [...data.messages, ...prev.messages],
        nextBefore: data.nextBefore,
      }) : null);
    } catch (e) {
      addToast(e instanceof Error ? e.message : '追加のメッセージ読み込みに失敗しました。', 'error');
    } finally {
      setAppState(AppState.CONVERSATION);
    }
  }, [password, conversationData, addToast]);

  const handleReAuth = () => {
    setAppState(AppState.UNAUTHENTICATED);
    setPassword('');
    setPasswordInput('');
    setPhoneInput('');
    setError(null);
    setSearchData(null);
    setConversationData(null);
  };

  const handleManualRequest = useCallback(async (payload: { apName: string; recordId: string; requestType: 'email' | 'address' }) => {
    if (!password) {
        addToast('認証情報がありません。再認証してください。', 'error');
        throw new Error('Not authenticated');
    }
    const normalizedPhone = normalizePhoneNumber(phoneInput);
    try {
      const response = await api.notify({
          pass: password,
          phone: normalizedPhone,
          ...payload
      });
      if (response.deduped) {
          addToast('このリクエストは既に送信されています。', 'success');
      } else {
          addToast('リクエストを送信しました。', 'success');
      }
    } catch (e: any) {
        addToast(`リクエストの送信に失敗しました: ${e.message}`, 'error');
        throw e;
    }
  }, [password, phoneInput, addToast]);

  const isAuthenticated = appState !== AppState.UNAUTHENTICATED && appState !== AppState.AUTHENTICATING;

  const renderContent = () => {
    // FIX: Grouped AppState.UNAUTHENTICATED and AppState.AUTHENTICATING to resolve a type-narrowing error.
    // This change makes the login form's loading state functional, as was likely intended.
    switch (appState) {
      case AppState.UNAUTHENTICATED:
      case AppState.AUTHENTICATING:
        return (
          <div className="h-full flex flex-col justify-center items-center text-center bg-[#EDEEF2] p-4">
            <div className="max-w-sm w-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                あとパスワードを入力して認証してください。
              </h2>
              <p className="text-sm text-gray-600 mb-8">
                （パスワードはコールセンターすまえるチャットの概要記載）
              </p>
              <form onSubmit={(e) => { e.preventDefault(); handleAuth(); }} className="flex flex-col items-center gap-4">
                <label htmlFor="password-input" className="sr-only">パスワード</label>
                <input
                  id="password-input"
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="パスワード"
                  className="rounded-lg border border-[#D6D9DE] px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#06C755] w-full"
                  disabled={appState === AppState.AUTHENTICATING}
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-[#06C755] text-white rounded-lg px-8 py-3 text-lg font-bold hover:bg-[#0dbf58] disabled:opacity-50 w-full transition-colors"
                  disabled={appState === AppState.AUTHENTICATING || !passwordInput}
                >
                  {appState === AppState.AUTHENTICATING ? '認証中...' : '認証'}
                </button>
              </form>
            </div>
          </div>
        );
      case AppState.SEARCHING:
      case AppState.LOADING_CONVO:
        return <LoadingSpinner />;
      case AppState.AUTHENTICATED_IDLE:
        return <InfoPanel message="上部のバーから電話番号を検索してください。" />;
      case AppState.CANDIDATES:
        if (!searchData) return <InfoPanel message="検索データが見つかりません。" type="error" />;
        return <CandidateSelection candidates={searchData.candidates} onSelect={(userId) => handleSelectCandidate(userId)} />;
      case AppState.NO_MATCH:
        return (
          <div className="p-4 md:p-6 max-w-md mx-auto h-full flex flex-col justify-center">
            <InfoPanel message={`"${phoneInput}"に一致する候補が見つかりませんでした。`} type="warning" />
            <div className="mt-4">
              <ManualRequestForm onSubmit={handleManualRequest} />
            </div>
          </div>
        );
      case AppState.CONVERSATION:
      case AppState.PAGINATING:
        if (!conversationData || !searchData) return <InfoPanel message="会話データが見つかりません。" type="error" />;
        const candidate = searchData.candidates.find(c => c.userId === conversationData.userId);
        if (!candidate) return <InfoPanel message="ユーザー情報が見つかりません。" type="error" />;
        const searchInfo = {
          maskedPhone: searchData.maskedPhone,
          userId: conversationData.userId,
          count: candidate.count,
          lastTs: candidate.lastTs
        };
        return (
          <ConversationView
            messages={conversationData.messages}
            nextBefore={conversationData.nextBefore}
            onLoadMore={handleLoadMore}
            isPaginating={appState === AppState.PAGINATING}
            searchInfo={searchInfo}
          />
        );
      case AppState.ERROR:
        return <InfoPanel message={error || '不明なエラーが発生しました。'} type="error" onRetry={handleReAuth} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col font-sans antialiased bg-[#EDEEF2] text-gray-900">
      <TopBar isAuthenticated={isAuthenticated} onReAuth={handleReAuth} />
      <ControlsBar
        isAuthenticated={isAuthenticated}
        appState={appState}
        passwordInput={passwordInput}
        setPasswordInput={setPasswordInput}
        phoneInput={phoneInput}
        setPhoneInput={setPhoneInput}
        onAuthSubmit={handleAuth}
        onSearchSubmit={handleSearch}
      />
      <main className="flex-1 overflow-y-auto relative">
        {renderContent()}
      </main>
      
      <footer className="shrink-0 bg-white/80 backdrop-blur-sm p-2 border-t border-gray-200 text-xs text-gray-600 text-center">
        ©タマシステム 2025
      </footer>

      <div aria-live="assertive" className="fixed top-16 right-4 space-y-2 z-50 pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`max-w-sm w-full shadow-lg rounded-lg pointer-events-auto p-4 text-white ${
                toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`}
            >
              {toast.message}
            </div>
          ))}
      </div>
    </div>
  );
};

export default App;
