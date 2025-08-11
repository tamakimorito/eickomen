import React from 'https://esm.sh/react@^19.1.0';
import { FormTextArea } from './FormControls.tsx';
import { ChatBubbleBottomCenterTextIcon, XMarkIcon } from 'https://esm.sh/@heroicons/react@^2.2.0/24/solid';

const BugReportModal = ({ isOpen, onClose, reportText, onReportTextChange, onSubmit, isSubmitting, isInvalid }) => {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-40 flex justify-center items-center p-4" 
        onClick={onClose}
    >
      <div 
        className="relative mx-auto p-6 border w-full max-w-lg shadow-lg rounded-xl bg-white animate-fade-in-down"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <ChatBubbleBottomCenterTextIcon className="h-8 w-8 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-800">不具合・要望の報告</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <XMarkIcon className="h-6 w-6 text-gray-600" />
          </button>
        </div>
        
        <div className="text-sm space-y-4">
            <p className="text-gray-600">
                ツールの不具合や改善してほしい点をご自由にお書きください。
                <br />
                報告を送信すると、現在の入力内容もあわせて開発者に送信されます。
            </p>
            <FormTextArea
                label="報告内容"
                name="bugReportText"
                value={reportText}
                onChange={onReportTextChange}
                rows={8}
                placeholder="例：〇〇を選択すると、□□の項目が正しく表示されません。"
                required
                isInvalid={isInvalid}
            />
        </div>
        
        <div className="mt-6 flex justify-end items-center gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              キャンセル
            </button>
            <button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 w-36 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:bg-red-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>送信中...</span>
                </>
              ) : (
                '報告を送信'
              )}
            </button>
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

export default BugReportModal;