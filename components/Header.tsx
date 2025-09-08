import React from 'https://esm.sh/react@^19.1.0';
import { BellIcon, QuestionMarkCircleIcon, ArrowPathIcon } from 'https://esm.sh/@heroicons/react@^2.2.0/24/solid';

const Header = ({ onManualOpen, onResetRequest }) => {
  return (
    <header className="bg-blue-700 shadow-lg sticky top-0 z-20">
      <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 text-white">
        <div className="flex items-center gap-4">
            <div className="bg-yellow-400 p-3 rounded-full shadow-md">
            <BellIcon className="h-8 w-8 text-blue-800" />
            </div>
            <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-wider">営業コメント作成ツール～エイコメン～</h1>
            <p className="text-xs text-blue-200 mt-1">Version: v1.16.0</p>
            </div>
        </div>
        <div className="flex items-center gap-x-3">
          <button 
              onClick={onResetRequest}
              className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-3 rounded-lg hover:bg-blue-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white shadow-sm"
              aria-label="フォームをリセット（終話）"
            >
              <ArrowPathIcon className="h-5 w-5" />
              <span className="hidden sm:inline">リセット</span>
            </button>
            <button 
              onClick={onManualOpen}
              className="p-2 rounded-full hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
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