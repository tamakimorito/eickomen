
import React from 'react';
import { BookOpenIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface ManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ManualModal: React.FC<ManualModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-lg font-bold text-blue-700 mt-4 mb-2 border-b-2 border-blue-200 pb-1">{children}</h3>
  );

  const ListItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <li className="text-gray-700 mb-1">{children}</li>
  );
  
  const SubTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h4 className="font-bold text-gray-800 mt-3 mb-1">{children}</h4>
  );

  return (
    <div 
        className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-40 flex justify-center items-center p-4" 
        onClick={onClose}
    >
      <div 
        className="relative mx-auto p-6 border w-full max-w-2xl shadow-lg rounded-xl bg-white animate-fade-in-down"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <BookOpenIcon className="h-8 w-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">エイコメンの使い方</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <XMarkIcon className="h-6 w-6 text-gray-600" />
          </button>
        </div>
        
        <div className="text-sm max-h-[70vh] overflow-y-auto pr-2">
          <SectionTitle>基本操作</SectionTitle>
          <ul className="list-disc list-inside space-y-1">
            <ListItem>このツールは「回線営業コメント作成ツール～エイコメン～」という名前です。</ListItem>
            <ListItem>フォームの各項目を上から順に入力してください。</ListItem>
            <ListItem>必須項目には赤いアスタリスク（*）が付いています。</ListItem>
            <ListItem>入力内容は右側の「生成コメント」エリアにリアルタイムで反映されます。</ListItem>
          </ul>

          <SectionTitle>便利機能</SectionTitle>
          <ul className="list-none">
            <li>
                <SubTitle>・日付入力の補助機能</SubTitle>
                <p className="text-gray-700 ml-4">「入居予定日」などの日付フィールドでは、「8/1」のように入力すると最も近い将来の日付（例: 2024/08/01）に自動整形されます。カレンダーアイコンから日付を選択することも可能です。</p>
            </li>
             <li>
                <SubTitle>・入力内容のチェック機能</SubTitle>
                <p className="text-gray-700 ml-4">名前に数字が含まれていたり、生年月日が未来の日付になっているなど、入力ミスの可能性がある場合に確認のメッセージが表示されます。</p>
            </li>
          </ul>

          <SectionTitle>コピーとリセット</SectionTitle>
          <ul className="list-disc list-inside space-y-1">
            <ListItem>右上の「コピー」ボタンをクリックすると、生成されたコメント全文がクリップボードにコピーされます。</ListItem>
            <ListItem>コピーが完了すると、10分後にフォームが自動でリセットされるタイマーが作動します。</ListItem>
            <ListItem>フォーム右上のリセットボタンを押すと、いつでもフォームを初期状態に戻せます。</ListItem>
          </ul>
          
          <SectionTitle>商材ごとの違い</SectionTitle>
           <ul className="list-disc list-inside space-y-1">
            <ListItem>最初に利用する「商材」を選択すると、入力フォームの内容がその商品に合わせて最適化されます。</ListItem>
          </ul>

          <SubTitle>・SoftBank光 / SB Air</SubTitle>
          <p className="text-gray-700 ml-4">従来のSoftBank光やSB Airのプランです。1Gか10Gかなど、正しいものを選択するとCP等の選択肢が切り替わります。</p>

          <SubTitle>・賃貸ねっと</SubTitle>
          <p className="text-gray-700 ml-4">
              「タイプ」を選択すると「案内料金」が自動で入力されます。また、「10G」タイプを選ぶと「クロスパス無線ルーター」が自動で設定されます。「ファミリー」タイプの場合は、必須となる管理会社情報の入力欄が表示されます。
          </p>

          <SubTitle>・賃貸ねっと【無料施策】</SubTitle>
          <p className="text-gray-700 ml-4">
              こちらは更に賢い入力補助が働きます。例えば「タイプ」で「マンション10G」を選ぶと、「ラック」が自動的に「光配線クロス」に設定・固定されます。これにより、入力ミスを未然に防ぎます。
          </p>
        </div>
        
        <div className="mt-6 text-right">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              閉じる
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

export default ManualModal;
