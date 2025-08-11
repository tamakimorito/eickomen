import React, { useEffect } from 'https://esm.sh/react@^19.1.0';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, XMarkIcon } from 'https://esm.sh/@heroicons/react@^2.2.0/24/solid';

export const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); // Auto-dismiss after 4 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);
  
  const typeStyles = {
    success: { bg: 'bg-green-500', icon: CheckCircleIcon },
    error: { bg: 'bg-red-500', icon: XCircleIcon },
    info: { bg: 'bg-blue-500', icon: InformationCircleIcon },
  };

  const { bg, icon: Icon } = typeStyles[type] || typeStyles.info;

  return (
    <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center p-4 rounded-xl shadow-lg text-white ${bg} animate-fade-in-down`}>
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