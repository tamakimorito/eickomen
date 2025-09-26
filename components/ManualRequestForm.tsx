import React, { useState, useEffect } from 'react';

interface ManualRequestFormProps {
  onSubmit: (payload: { apName: string; recordId: string; requestType: 'email' | 'address' }) => Promise<void>;
}

const ManualRequestForm: React.FC<ManualRequestFormProps> = ({ onSubmit }) => {
  const [apName, setApName] = useState('');
  const [recordId, setRecordId] = useState('');
  const [requestType, setRequestType] = useState<'email' | 'address'>('email');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedApName = localStorage.getItem('line_scope_ap_name');
    if (savedApName) {
      setApName(savedApName);
    }
  }, []);

  const validate = () => {
    if (!apName.trim()) return 'AP名は必須です。';
    if (!recordId.trim()) return 'レコードIDは必須です。';
    if (!requestType) return '欲しい情報を選択してください。';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setIsSubmitting(true);
    
    try {
      await onSubmit({ apName: apName.trim(), recordId: recordId.trim(), requestType });
      localStorage.setItem('line_scope_ap_name', apName.trim());
      setRecordId(''); // Clear record ID on success
    } catch (e) {
      // Error is handled by parent's toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-base font-semibold text-gray-800">手動依頼フォーム</h3>
        
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div>
          <label htmlFor="apName" className="block text-sm font-medium text-gray-600">AP名</label>
          <input
            id="apName"
            type="text"
            value={apName}
            onChange={(e) => setApName(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#06C755]"
            placeholder="例: 山田太郎"
          />
        </div>

        <div>
          <label htmlFor="recordId" className="block text-sm font-medium text-gray-600">レコードID</label>
          <input
            id="recordId"
            type="text"
            value={recordId}
            onChange={(e) => setRecordId(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#06C755]"
            placeholder="Salesforce等のID"
          />
        </div>

        <div>
          <span className="block text-sm font-medium text-gray-600">欲しい情報</span>
          <div className="mt-2 flex items-center space-x-6">
            <label className="flex items-center">
              <input
                type="radio"
                name="requestType"
                value="email"
                checked={requestType === 'email'}
                onChange={() => setRequestType('email')}
                className="h-4 w-4 text-[#06C755] border-gray-300 focus:ring-[#06C755]"
              />
              <span className="ml-2 text-sm text-gray-700">メアド</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="requestType"
                value="address"
                checked={requestType === 'address'}
                onChange={() => setRequestType('address')}
                className="h-4 w-4 text-[#06C755] border-gray-300 focus:ring-[#06C755]"
              />
              <span className="ml-2 text-sm text-gray-700">現住所</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-3 bg-[#06C755] text-white rounded-md px-4 py-2 hover:bg-[#0dbf58] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? '送信中...' : 'Chatworkへ依頼する'}
        </button>
      </form>
    </div>
  );
};

export default ManualRequestForm;
