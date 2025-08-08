import React from 'react';
import { ClipboardDocumentIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

interface Props {
  comment: string;
  onCommentChange: (value: string) => void;
  onCopy: () => void;
}

const GeneratedComment: React.FC<Props> = ({ comment, onCommentChange, onCopy }) => {

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
      <div className="flex justify-between items-center border-b-2 border-dashed border-gray-200 pb-4 mb-4">
        <div className="flex items-center gap-3">
            <PencilSquareIcon className="h-7 w-7 text-blue-700"/>
            <h2 className="text-2xl font-bold text-gray-700">生成コメント</h2>
        </div>
        <button
          onClick={onCopy}
          className="flex items-center gap-2 bg-yellow-400 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 shadow-md hover:shadow-lg"
        >
          <ClipboardDocumentIcon className="h-5 w-5" />
          <span>コピー</span>
        </button>
      </div>
      <textarea
        value={comment}
        onChange={(e) => onCommentChange(e.target.value)}
        rows={20}
        className="w-full p-3 bg-blue-50/50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-sm font-mono leading-relaxed"
        placeholder="フォームに入力すると、ここにコメントが自動生成されます..."
      />
    </div>
  );
};

export default GeneratedComment;