
import React from 'https://esm.sh/react@^19.1.0';

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

  const blueButtonClasses = "w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold";
  const grayButtonClasses = "w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold";
  const redButtonClasses = "w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold";

  let confirmButtonClasses = blueButtonClasses;
  let cancelButtonClasses = grayButtonClasses;
  
  switch(type) {
      case 'warning':
          // For warnings, if there are two buttons, the 'cancel' button is the primary action (blue).
          // If only one button, it should be blue.
          if (cancelText) {
            confirmButtonClasses = grayButtonClasses; // 'このまま進む' is secondary
            cancelButtonClasses = blueButtonClasses;
          } else {
             confirmButtonClasses = blueButtonClasses;
          }
          break;
      case 'danger':
           // For danger, the 'confirm' button ('はい、リセットする') is the danger action (red).
          confirmButtonClasses = redButtonClasses;
          cancelButtonClasses = grayButtonClasses;
          break;
      default:
           // Default behavior
          confirmButtonClasses = blueButtonClasses;
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