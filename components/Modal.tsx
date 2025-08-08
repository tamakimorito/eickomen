
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'default' | 'warning';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'キャンセル',
  type = 'default',
}) => {
  if (!isOpen) return null;

  const messageClasses = `text-md text-gray-600 whitespace-pre-wrap ${
    type === 'warning' ? 'text-red-600 font-bold' : ''
  }`;

  const blueButtonClasses = "w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold";
  const grayButtonClasses = "w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold";

  // For warnings, the 'cancel' button ('修正する') is the primary action (blue).
  const cancelButtonClasses = type === 'warning' ? blueButtonClasses : grayButtonClasses;
  // The 'confirm' button ('このまま進む') is the secondary action (gray).
  const confirmButtonClasses = type === 'warning' ? grayButtonClasses : blueButtonClasses;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4" id="my-modal">
      <div className="relative mx-auto p-6 border w-full max-w-md shadow-lg rounded-xl bg-white animate-fade-in-down">
        <div className="text-center">
          <h3 className="text-xl leading-6 font-bold text-gray-900">{title}</h3>
          <div className="mt-4 px-4 py-3">
            <p className={messageClasses}>{message}</p>
          </div>
          <div className="flex justify-center items-center gap-4 mt-4 px-4">
            <button
              onClick={onCancel}
              className={cancelButtonClasses}
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={confirmButtonClasses}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-down {
          0% {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
