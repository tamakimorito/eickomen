import React, { useContext } from 'https://esm.sh/react@^19.1.0';
import { AppContext } from '../context/AppContext.tsx';
import { ClipboardDocumentIcon, PencilSquareIcon, ArrowPathIcon } from 'https://esm.sh/@heroicons/react@^2.2.0/24/outline';

const GeneratedComment = () => {
  const { generatedComment, setGeneratedComment, handleCopy, handleResetRequest } = useContext(AppContext);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
      <div className="flex justify-between items-center border-b-2 border-dashed border-gray-200 pb-4 mb-4">
        <div className="flex items-center gap-3">
            <PencilSquareIcon className="h-7 w-7 text-blue-700"/>
            <h2 className="text-2xl font-bold text-gray-700">生成コメント</h2>
        </div>
        <div className="flex items-center gap-2">
           <button
              onClick={handleResetRequest}
              className="flex items-center gap-2 bg-white text-gray-600 font-bold py-2 px-3 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm hover:shadow-md"
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
        value={generatedComment}
        onChange={(e) => setGeneratedComment(e.target.value)}
        rows={20}
        className="w-full p-3 bg-blue-50/50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-sm font-mono leading-relaxed"
        placeholder="フォームに入力すると、ここにコメントが自動生成されます..."
      />
    </div>
  );
};

export default GeneratedComment;