import React from 'react';

export const Modal = ({
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

  const greenButtonClasses = "w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow";
  const berryButtonClasses = "w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold shadow";
  const grayButtonClasses = "w-full px-4 py-2 bg-emerald-50 text-green-800 rounded-lg hover:bg-emerald-100 transition-colors font-semibold";

  let confirmButtonClasses = greenButtonClasses;
  let cancelButtonClasses = grayButtonClasses;
  
  switch(type) {
      case 'warning':
          // For warnings, use green for安全推奨、赤で続行の強調。
          if (cancelText) {
            confirmButtonClasses = berryButtonClasses; // 'このまま進む' is caution
            cancelButtonClasses = greenButtonClasses;
          } else {
             confirmButtonClasses = greenButtonClasses;
          }
          break;
      case 'danger':
           // For danger, the 'confirm' button ('はい、リセットする') is the danger action (red).
          confirmButtonClasses = berryButtonClasses;
          cancelButtonClasses = grayButtonClasses;
          break;
      default:
          confirmButtonClasses = greenButtonClasses;
          cancelButtonClasses = grayButtonClasses;
          break;
  }


  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4" id="my-modal">
      <div className="relative mx-auto p-6 border w-full max-w-md shadow-lg rounded-xl bg-white animate-fade-in-down">
        <div className="text-center">
          <h3 className="text-xl leading-6 font-bold text-gray-900">{title}</h3>
          <div className="mt-4 px-4 py-3">
            <p className={messageClasses}>{message}</p>
          </div>
          <div className={`grid ${cancelText ? 'grid-cols-2' : 'grid-cols-1'} gap-4 mt-4 px-4`}>
            {cancelText && (
              <button
                onClick={onCancel}
                className={cancelButtonClasses}
              >
                {cancelText}
              </button>
            )}
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