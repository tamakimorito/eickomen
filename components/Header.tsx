import React from 'react';
import { BellIcon, QuestionMarkCircleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

const Header = ({ onManualOpen, onResetRequest }) => {
  return (
    <header className="bg-gradient-to-r from-red-700 via-green-700 to-red-700 shadow-lg sticky top-0 z-20">
      <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 text-white">
        <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-full shadow-md border border-white/40">
            <BellIcon className="h-8 w-8 text-yellow-200" />
            </div>
            <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-wider text-white">営業コメント作成ツール～エイコメン～</h1>
            <p className="text-xs text-green-100 mt-1">Version: v1.60</p>
            </div>
        </div>
        <div className="flex items-center gap-x-3">
          <button
              onClick={onResetRequest}
              className="flex items-center gap-2 bg-white text-green-800 font-semibold py-2 px-3 rounded-lg hover:bg-green-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-300 shadow-sm"
              aria-label="フォームをリセット（終話）"
            >
              <ArrowPathIcon className="h-5 w-5" />
              <span className="hidden sm:inline">リセット</span>
            </button>
            <button
              onClick={onManualOpen}
              className="p-2 rounded-full hover:bg-white/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-100"
              aria-label="使い方を開く"
            >
              <QuestionMarkCircleIcon className="h-7 w-7 text-white" />
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;