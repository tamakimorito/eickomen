import React from 'react';
import { BellIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/solid';

interface HeaderProps {
    onManualOpen: () => void;
}

const Header: React.FC<HeaderProps> = ({ onManualOpen }) => {
  return (
    <header className="bg-blue-700 shadow-lg sticky top-0 z-20">
      <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 text-white">
        <div className="flex items-center gap-4">
            <div className="bg-yellow-400 p-3 rounded-full shadow-md">
            <BellIcon className="h-8 w-8 text-blue-800" />
            </div>
            <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-wider">回線営業コメント作成ツール～エイコメン～</h1>
            </div>
        </div>
        <button 
            onClick={onManualOpen}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors py-2 px-4 rounded-lg text-sm font-bold"
            aria-label="使い方のマニュアルを開く"
        >
            <QuestionMarkCircleIcon className="h-6 w-6"/>
            <span>使い方</span>
        </button>
      </div>
    </header>
  );
};

export default Header;