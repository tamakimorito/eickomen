
import React, { useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); // Auto-dismiss after 4 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const Icon = type === 'success' ? CheckCircleIcon : XCircleIcon;

  return (
    <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center p-4 rounded-xl shadow-lg text-white ${bgColor} animate-fade-in-down`}>
      <Icon className="h-6 w-6 mr-3" />
      <span className="font-bold">{message}</span>
      <button onClick={onClose} className="ml-4 -mr-1 p-1 rounded-full hover:bg-white/20 transition-colors">
        <XMarkIcon className="h-5 w-5" />
      </button>
      <style>{`
        @keyframes fade-in-down {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
