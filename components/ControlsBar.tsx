import React, { FormEvent, useEffect, useRef } from 'react';
import { AppState } from '../types';
import { normalizePhoneNumber } from '../utils/phoneUtils';

interface ControlsBarProps {
  isAuthenticated: boolean;
  appState: AppState;
  passwordInput: string;
  setPasswordInput: (value: string) => void;
  phoneInput: string;
  setPhoneInput: (value: string) => void;
  onAuthSubmit: () => void;
  onSearchSubmit: () => void;
}

const ControlsBar: React.FC<ControlsBarProps> = ({
  isAuthenticated,
  appState,
  passwordInput,
  setPasswordInput,
  phoneInput,
  setPhoneInput,
  onAuthSubmit,
  onSearchSubmit,
}) => {
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const isSearching = appState === AppState.SEARCHING;
  
  useEffect(() => {
    if (isAuthenticated && appState === AppState.AUTHENTICATED_IDLE && phoneInputRef.current) {
        phoneInputRef.current.focus();
    }
  }, [isAuthenticated, appState]);

  const handleSearchFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearchSubmit();
  };
  
  const normalizedPhone = normalizePhoneNumber(phoneInput);
  const isPhoneSearchable = normalizedPhone.length >= 9;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-3 shrink-0">
      <form onSubmit={handleSearchFormSubmit} className="flex flex-wrap items-center gap-2">
        <label htmlFor="phone-input" className="sr-only">電話番号</label>
        <input
          id="phone-input"
          ref={phoneInputRef}
          type="tel"
          value={phoneInput}
          onChange={(e) => setPhoneInput(e.target.value)}
          placeholder="電話番号"
          className="rounded-md border border-[#D6D9DE] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#06C755] w-full sm:w-auto flex-grow"
          disabled={isSearching}
        />
        <button
          type="submit"
          className="bg-[#06C755] text-white rounded-md px-6 py-2 hover:bg-[#0dbf58] disabled:opacity-50 w-full sm:w-auto"
          disabled={isSearching || !isPhoneSearchable}
        >
          {isSearching ? '検索中...' : '🔍 スコープ'}
        </button>
      </form>
    </div>
  );
};

export default ControlsBar;