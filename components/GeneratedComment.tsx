import React, { useContext, useState, useRef, useEffect } from 'react';
import { AppContext } from '../context/AppContext.tsx';
import { ClipboardDocumentIcon, PencilSquareIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const GeneratedComment = () => {
  const { generatedComment, setGeneratedComment, handleCopy, handleResetRequest, setModalState, closeModal, formData, activeTab } = useContext(AppContext);
  const [hasConfirmedEdit, setHasConfirmedEdit] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    setHasConfirmedEdit(false);
  }, [formData?.recordId, activeTab]);

  const handleFocus = () => {
    if (hasConfirmedEdit) return;

    // FIX: Added missing isErrorBanner and bannerMessage properties to align with the modal state type.
    setModalState({
      isOpen: true,
      title: '編集の確認',
      message: 'このコメント欄を直接編集すると不備が発生しやすくなります。\nコピーボタンの使用を推奨しますが、このまま編集を続けますか？',
      confirmText: '編集を続ける',
      cancelText: 'キャンセル',
      type: 'warning',
      onConfirm: () => {
        setHasConfirmedEdit(true);
        closeModal();
        textareaRef.current?.focus();
      },
      onCancel: () => {
        textareaRef.current?.blur();
        closeModal();
      },
      isErrorBanner: false,
      bannerMessage: '',
    });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-green-200">
      <div className="flex justify-between items-center border-b-2 border-dashed border-green-200 pb-4 mb-4">
        <div className="flex items-center gap-3">
            <PencilSquareIcon className="h-7 w-7 text-red-700"/>
            <h2 className="text-2xl font-bold text-gray-700">生成コメント</h2>
        </div>
        <div className="flex items-center gap-2">
           <button
              onClick={handleResetRequest}
              className="flex items-center gap-2 bg-white text-gray-600 font-bold py-2 px-3 rounded-lg border border-green-200 hover:bg-green-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 shadow-sm hover:shadow-md"
              aria-label="フォームをリセット（終話）"
            >
              <ArrowPathIcon className="h-5 w-5" />
              <span className="hidden sm:inline">リセット(終話)</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 bg-yellow-400 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 shadow-md hover:shadow-lg"
            >
              <ClipboardDocumentIcon className="h-5 w-5" />
              <span>コピー</span>
            </button>
        </div>
      </div>
      <textarea
        ref={textareaRef}
        value={generatedComment}
        onFocus={handleFocus}
        onChange={(e) => setGeneratedComment(e.target.value)}
        rows={20}
        className="w-full p-3 bg-green-50/50 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out text-sm font-mono leading-relaxed"
        placeholder="フォームに入力すると、ここにコメントが自動生成されます..."
      />
    </div>
  );
};

export default GeneratedComment;