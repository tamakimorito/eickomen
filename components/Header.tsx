import React from 'react';
import { BellIcon, QuestionMarkCircleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

const Header = ({ onManualOpen, onResetRequest }) => {
  return (
    <header className="bg-rose-700 shadow-lg sticky top-0 z-20">
      <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 text-white">
        <div className="flex items-center gap-4">
            <div className="bg-amber-300 p-3 rounded-full shadow-md">
            <BellIcon className="h-8 w-8 text-rose-900" />
            </div>
            <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-wider flex items-center gap-2">
              営業コメント作成ツール～エイコメン～
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-amber-100 text-rose-900 text-xl shadow-sm" aria-label="門松">🎍</span>
            </h1>
            <p className="text-xs text-amber-100 mt-1">Version: v1.64</p>
            </div>
        </div>
        <div className="flex items-center gap-x-3">
          <button
              onClick={onResetRequest}
              className="flex items-center gap-2 bg-rose-600 text-white font-semibold py-2 px-3 rounded-lg hover:bg-rose-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-200 shadow-sm"
              aria-label="フォームをリセット（終話）"
            >
              <ArrowPathIcon className="h-5 w-5" />
              <span className="hidden sm:inline">リセット</span>
            </button>
            <button
              onClick={onManualOpen}
              className="p-2 rounded-full hover:bg-rose-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-200"
              aria-label="使い方を開く"
            >
              <QuestionMarkCircleIcon className="h-7 w-7" />
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
