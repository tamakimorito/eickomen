import React from 'react';

interface TopBarProps {
  isAuthenticated: boolean;
  onReAuth: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ isAuthenticated, onReAuth }) => {
  return (
    <header className="flex items-center justify-between h-14 px-4 bg-gradient-to-r from-[#06C755] to-[#00AF5B] text-white shadow-sm shrink-0">
      <h1 className="text-lg font-bold">🔭 LINEスコープ</h1>
      {isAuthenticated && (
        <button
          onClick={onReAuth}
          className="text-sm font-semibold border border-white rounded-md px-3 py-1 hover:bg-white hover:text-[#06C755] transition-colors focus:outline-none focus:ring-2 focus:ring-white"
        >
          再認証
        </button>
      )}
    </header>
  );
};

export default TopBar;