import React from 'react';
import { BellIcon, QuestionMarkCircleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

const Header = ({ onManualOpen, onResetRequest }) => {
  return (
    <header className="bg-red-700 shadow-lg sticky top-0 z-20">
      <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 text-white">
        <div className="flex items-center gap-4">
            <div className="bg-green-400 p-3 rounded-full shadow-md">
            <BellIcon className="h-8 w-8 text-red-900" />
            </div>
            <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-wider">営業コメント作成ツール～エイコメン～</h1>
            <p className="text-xs text-green-100 mt-1">Version: v1.62</p>
            </div>
            <div className="hidden sm:flex items-center gap-2" aria-hidden="true">
              {[
                { icon: '🎅', label: 'Santa' },
                { icon: '🦌', label: 'Reindeer' },
                { icon: '🎄', label: 'Tree' },
                { icon: '🧦', label: 'Stocking' },
              ].map((item) => (
                <span
                  key={item.label}
                  className="flex items-center justify-center h-10 w-10 bg-white/20 text-2xl rounded-xl border border-green-200 shadow-sm"
                  title={item.label}
                >
                  {item.icon}
                </span>
              ))}
            </div>
        </div>
        <div className="flex items-center gap-x-3">
          <button
              onClick={onResetRequest}
              className="flex items-center gap-2 bg-green-700 text-white font-semibold py-2 px-3 rounded-lg hover:bg-green-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-200 shadow-sm"
              aria-label="フォームをリセット（終話）"
            >
              <ArrowPathIcon className="h-5 w-5" />
              <span className="hidden sm:inline">リセット</span>
            </button>
            <button
              onClick={onManualOpen}
              className="p-2 rounded-full hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-200"
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
