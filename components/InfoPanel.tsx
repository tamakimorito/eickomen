import React from 'react';

interface InfoPanelProps {
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  onRetry?: () => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ message, type = 'info', onRetry }) => {
    const colorClasses = {
        info: 'bg-green-100 border-green-400 text-green-800',
        warning: 'bg-yellow-100 border-yellow-400 text-yellow-800',
        error: 'bg-red-100 border-red-400 text-red-800',
        success: 'bg-green-100 border-green-400 text-green-800',
    };

    return (
        <div className="p-4 h-full flex flex-col justify-center items-center text-center bg-[#EDEEF2]">
            <div className={`border-l-4 p-4 w-full max-w-md ${colorClasses[type]}`} role="alert">
                <p className="font-bold">{message}</p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="mt-4 bg-[#06C755] hover:bg-[#0dbf58] text-white font-bold py-2 px-4 rounded-md transition-colors"
                    >
                        再実行
                    </button>
                )}
            </div>
        </div>
    );
};

export default InfoPanel;