import React, { type PropsWithChildren } from 'https://esm.sh/react@^19.1.0';
import { BookOpenIcon, XMarkIcon, ShareIcon, BoltIcon, BellAlertIcon, ArrowPathIcon } from 'https://esm.sh/@heroicons/react@^2.2.0/24/solid';

const ManualModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const SectionTitle = ({ children, icon: Icon }: PropsWithChildren<{ icon?: React.ElementType }>) => (
    <h3 className="text-lg font-bold text-blue-700 mt-6 mb-2 border-b-2 border-blue-200 pb-1 flex items-center gap-2">
      {Icon && <Icon className="h-5 w-5" />}
      {children}
    </h3>
  );

  const ListItem = ({ children }: PropsWithChildren) => (
    <li className="text-gray-700 mb-1">{children}</li>
  );
  
  const SubTitle = ({ children }: PropsWithChildren) => (
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
          <SectionTitle icon={BookOpenIcon}>基本操作</SectionTitle>
          <ul className="list-disc list-inside space-y-1">
            <ListItem>画面上部のタブ（電気、ガス、インターネット...）で商材を切り替えます。</ListItem>
            <ListItem>フォームの各項目を上から順に入力してください。</ListItem>
            <ListItem>必須項目には赤いアスタリスク（*）が付いています。</ListItem>
            <ListItem>「サカイ販路」にチェックを入れると、顧客ID/レコードIDの入力が不要になり、一部の項目が自動で設定されます。</ListItem>
            <ListItem>入力内容は右側の「生成コメント」エリアにリアルタイムで反映されます。</ListItem>
            <ListItem>「担当者/AP名」は一度入力すると、フォームをリセットしても内容は保持されます。</ListItem>
          </ul>

          <SectionTitle icon={ShareIcon}>情報共有機能</SectionTitle>
          <p className="text-gray-700">
            一度入力した名前、住所、電話番号などの共通情報は、他のタブに切り替えても自動で引き継がれます。これにより、何度も同じ情報を入力する手間が省けます。
          </p>

          <SectionTitle icon={BoltIcon}>商材ごとの入力フォーム</SectionTitle>
          <SubTitle>・電気 / ガス</SubTitle>
          <p className="text-gray-700 ml-4">
            「商材選択」でプランやガス会社を選ぶと、その商材に必要な入力フォームが自動で表示されます。電気とガスをセットで契約する場合、電気タブから入力するとよりスムーズです。
          </p>
          <SubTitle>・インターネット</SubTitle>
          <p className="text-gray-700 ml-4">
              「商材」を選択すると、そのプラン（SoftBank光, Air, 賃貸ねっと等）に合わせて入力項目が最適化されます。
          </p>
          <SubTitle>・ウォーターサーバー</SubTitle>
          <p className="text-gray-700 ml-4">
              顧客タイプ（通常、U-20、法人）を選択し、サーバーの種類や色、契約プランなどを入力します。
          </p>

          <SectionTitle icon={BellAlertIcon}>便利機能</SectionTitle>
          <ul className="list-none">
            <li>
                <SubTitle>・日付入力の補助機能</SubTitle>
                <p className="text-gray-700 ml-4">日付フィールドで「8/1」と入力すると、最も近い未来の日付（例: 2024/08/01）に自動整形されます。カレンダーアイコンからも選択可能です。</p>
            </li>
             <li>
                <SubTitle>・電話番号の自動整形</SubTitle>
                <p className="text-gray-700 ml-4">商材に応じて、電話番号がハイフン付き（090-1234-5678）またはハイフン無し（09012345678）に自動で整形されます。</p>
            </li>
             <li>
                <SubTitle>・入力内容のチェック機能</SubTitle>
                <p className="text-gray-700 ml-4">必須項目が未入力のままコピーしようとすると、どの項目が足りないかを教えてくれます。</p>
            </li>
          </ul>

          <SectionTitle icon={ArrowPathIcon}>コピーとリセット</SectionTitle>
          <ul className="list-disc list-inside space-y-1">
            <ListItem>右下の「コピー」ボタンをクリックすると、生成されたコメント全文がクリップボードにコピーされます。</ListItem>
            <ListItem>コピーが完了すると、**20分後**にフォームを自動リセットするタイマーが起動します。</ListItem>
            <ListItem>作業中に**他のタブに切り替える**と、このタイマーは自動で解除され、入力内容が保持されます。</ListItem>
            <ListItem>右下の「リセット(終話)」ボタンで、いつでもフォームを初期状態に戻せます。(安全のため、確認画面が表示されます)</ListItem>
          </ul>
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