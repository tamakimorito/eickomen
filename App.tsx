import React, { useState, useEffect, useCallback, useRef, useMemo } from 'https://esm.sh/react@^19.1.0';
import { INITIAL_FORM_DATA, ELEC_ID_PREFIX_OPTIONS, GAS_ID_PREFIX_OPTIONS, BUG_REPORT_SCRIPT_URL } from './constants.ts';
import type { FormData } from './types.ts';
import InternetTab from './components/InternetTab.tsx';
import ElectricityTab from './components/ElectricityTab.tsx';
import GasTab from './components/GasTab.tsx';
import WtsTab from './components/WtsTab.tsx';
import GeneratedComment from './components/GeneratedComment.tsx';
import Header from './components/Header.tsx';
import { Toast } from './components/Toast.tsx';
import { Modal } from './components/Modal.tsx';
import ManualModal from './components/ManualModal.tsx';
import BugReportModal from './components/BugReportModal.tsx';
import { FormInput, FormCheckbox } from './components/FormControls.tsx';
import { BoltIcon, FireIcon, WifiIcon, CloudIcon, ExclamationTriangleIcon, ChatBubbleBottomCenterTextIcon } from 'https://esm.sh/@heroicons/react@^2.2.0/24/solid';
import { generateElectricityCommentLogic } from './commentLogic/electricity.ts';
import { generateGasCommentLogic } from './commentLogic/gas.ts';
import { generateWtsCommentLogic } from './commentLogic/wts.ts';
import { generateInternetCommentLogic } from './commentLogic/internet.ts';


const TABS = [
  { id: 'electricity', label: '電気', icon: BoltIcon },
  { id: 'gas', label: 'ガス', icon: FireIcon },
  { id: 'internet', label: 'インターネット', icon: WifiIcon },
  { id: 'wts', label: 'ウォーターサーバー', icon: CloudIcon },
];

const Tab = ({ id, label, icon: Icon, activeTab, onTabChange }) => (
    <button
        onClick={() => onTabChange(id)}
        className={`flex items-center gap-2 px-3 sm:px-4 py-3 text-sm sm:text-base font-bold transition-colors duration-200 ease-in-out focus:outline-none -mb-px ${
            activeTab === id
            ? 'text-blue-700 border-b-4 border-blue-700'
            : 'text-gray-500 hover:text-blue-600 border-b-4 border-transparent'
        }`}
    >
        <Icon className="h-5 w-5"/>
        <span className="hidden sm:inline">{label}</span>
    </button>
);


const App = () => {
  const [activeTab, setActiveTab] = useState('electricity');
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [generatedComment, setGeneratedComment] = useState('');
  const [toast, setToast] = useState(null);
  const [invalidFields, setInvalidFields] = useState([]);
  const resetTimerRef = useRef(null);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isBugReportOpen, setIsBugReportOpen] = useState(false);
  const [bugReportText, setBugReportText] = useState('');
  const [isBugReportTextInvalid, setIsBugReportTextInvalid] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => {},
    confirmText: 'OK',
    cancelText: 'キャンセル',
    type: 'default',
  });

  const closeModal = () => setModalState(prev => ({ ...prev, isOpen: false }));

  const showConfirmationModal = useCallback((title, message, onCancelAction) => {
      setModalState({
          isOpen: true,
          title,
          message,
          onConfirm: closeModal,
          onCancel: () => {
              onCancelAction();
              closeModal();
          },
          confirmText: 'このままにする',
          cancelText: '修正する',
          type: 'warning',
      });
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, type } = e.target;
    let { value } = e.target;

    setInvalidFields(prev => prev.filter(item => item !== name));
    
    const updates: { [key: string]: any } = {};

    if (type === 'checkbox') {
        const { checked } = e.target;
        
        if (name === 'isSakaiRoute') {
            updates.isSakaiRoute = checked;
            updates.recordId = '';
            updates.customerId = ''; 
            if (checked) {
                if (activeTab === 'electricity') updates.elecRecordIdPrefix = 'サカイ';
                else if (activeTab === 'gas') updates.gasRecordIdPrefix = 'サカイ';
            } else {
                if (activeTab === 'electricity') updates.elecRecordIdPrefix = 'それ以外';
                else if (activeTab === 'gas') updates.gasRecordIdPrefix = 'それ以外';
            }
        } else {
            updates[name] = checked;
        }
    } else { // Not a checkbox
        if (name === 'apName') {
            value = value.replace(/\s/g, '');
        }
        updates[name] = value;
        
        // Sync recordId and customerId
        if (name === 'recordId') {
            updates.customerId = value;
        }
        if (name === 'customerId') {
            updates.recordId = value;
        }
    
        if (name === 'recordId' && !formData.isSakaiRoute) {
            let prefix = 'それ以外';
            if (value.startsWith('STJP:')) prefix = 'STJP:';
            else if (value.startsWith('SR')) prefix = 'SR';
            else if (value.startsWith('code:')) prefix = 'code:';
            else if (value.startsWith('ID:')) prefix = 'ID:';
            else if (value.startsWith('S')) prefix = 'S';

            if (activeTab === 'electricity') {
                if (ELEC_ID_PREFIX_OPTIONS.some(opt => opt.value === prefix)) {
                    updates.elecRecordIdPrefix = prefix;
                }
            } else if (activeTab === 'gas') {
                 if (GAS_ID_PREFIX_OPTIONS.some(opt => opt.value === prefix)) {
                    updates.gasRecordIdPrefix = prefix;
                }
            }
        }
        
        if (name === 'wtsCustomerType') {
            if (value === 'U-20') {
                updates.wtsFiveYearPlan = '3年';
            } else {
                updates.wtsFiveYearPlan = '5年';
            }
        }
    }

    setFormData(prev => ({ ...prev, ...updates }));
  }, [activeTab, formData.isSakaiRoute]);
  
    const handleDateBlur = useCallback((e) => {
        const { name, value } = e.target;
        if (!value) return;

        let processedValue = value;
        const targetDate = new Date(value);

        if (isNaN(targetDate.getTime())) {
            const match = value.match(/^(?<month>\d{1,2})\/(?<day>\d{1,2})$/);
            if (match?.groups) {
                const { month, day } = match.groups;
                const m = parseInt(month, 10);
                const d = parseInt(day, 10);

                if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
                    const today = new Date();
                    const year = today.getFullYear();
                    
                    const d_curr = new Date(year, m - 1, d);
                    const d_next = new Date(year + 1, m - 1, d);
                    const d_prev = new Date(year - 1, m - 1, d);

                    const diffs = [
                        { date: d_curr, diff: Math.abs(d_curr.getTime() - today.getTime()) },
                        { date: d_next, diff: Math.abs(d_next.getTime() - today.getTime()) },
                        { date: d_prev, diff: Math.abs(d_prev.getTime() - today.getTime()) },
                    ].sort((a, b) => a.diff - b.diff);
                    
                    const closestDate = diffs[0].date;
                    if (closestDate) {
                        processedValue = `${closestDate.getFullYear()}/${String(closestDate.getMonth() + 1).padStart(2, '0')}/${String(closestDate.getDate()).padStart(2, '0')}`;
                    }
                }
            }
        } else { 
             processedValue = `${targetDate.getFullYear()}/${String(targetDate.getMonth() + 1).padStart(2, '0')}/${String(targetDate.getDate()).padStart(2, '0')}`;
        }

        if (processedValue !== value) {
            setFormData(prev => ({...prev, [name]: processedValue}));
        }
    }, []);

    const handleNameBlur = useCallback((e) => {
      const { name, value } = e.target;
      if (!value) return;

      const hasNumber = /\d/.test(value);
      const isKanaField = name.toLowerCase().includes('kana');

      if (isKanaField) {
        const isNotKana = /[^\u30A0-\u30FF\u3000\s]/.test(value); 
        if (isNotKana) {
             showConfirmationModal(
              '入力内容の確認',
              `フリガナにカタカナ以外が含まれていますが、よろしいですか？\n「${value}」`,
              () => {
                  const input = document.querySelector(`input[name="${name}"]`);
                  if (input) (input as HTMLInputElement).focus();
              }
          );
          return;
        }
      }

      if (hasNumber && !isKanaField) {
          showConfirmationModal(
              '入力内容の確認',
              `名前に数字が含まれていますが、よろしいですか？\n「${value}」`,
              () => {
                  const input = document.querySelector(`input[name="${name}"]`);
                  if (input) (input as HTMLInputElement).focus();
              }
          );
      }
    }, [showConfirmationModal]);
    
    const isElecGasSetSelected = useMemo(() => {
        return activeTab === 'electricity' && formData.elecProvider === 'すまいのでんき（ストエネ）' && formData.isGasSet === 'セット';
    }, [activeTab, formData.elecProvider, formData.isGasSet]);
    
    useEffect(() => {
        const generate = () => {
            let newComment = '';
            try {
                switch (activeTab) {
                    case 'electricity':
                        newComment = generateElectricityCommentLogic(formData);
                        break;
                    case 'gas':
                        newComment = generateGasCommentLogic(formData);
                        break;
                    case 'internet':
                        newComment = generateInternetCommentLogic(formData);
                        break;
                    case 'wts':
                        newComment = generateWtsCommentLogic(formData);
                        break;
                }
            } catch (error) {
                console.error("Error generating comment:", error);
                newComment = "コメントの生成中にエラーが発生しました。";
            }
            setGeneratedComment(newComment);
        };
        generate();
    }, [formData, activeTab]);

    const resetForm = useCallback((keepApName = true) => {
        const apName = keepApName ? formData.apName : '';
        const currentTab = activeTab;
        setFormData({ ...INITIAL_FORM_DATA, apName });
        setActiveTab(currentTab);
        setGeneratedComment('');
        setInvalidFields([]);
        if (resetTimerRef.current) {
            clearTimeout(resetTimerRef.current);
            resetTimerRef.current = null;
        }
    }, [formData.apName, activeTab]);

    const handleCopy = useCallback(() => {
        if (!generatedComment) {
            setToast({ message: 'コメントが空です', type: 'error' });
            return;
        }
        navigator.clipboard.writeText(generatedComment).then(() => {
            setToast({ message: 'コメントをコピーしました！20分後にフォームはリセットされます。', type: 'success' });
            if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
            resetTimerRef.current = setTimeout(() => {
                resetForm();
                setToast({ message: 'フォームが自動リセットされました。', type: 'info' });
            }, 20 * 60 * 1000); // 20 minutes
        }).catch(err => {
            setToast({ message: 'コピーに失敗しました', type: 'error' });
            console.error('Copy failed', err);
        });
    }, [generatedComment, resetForm]);

    const handleResetRequest = useCallback(() => {
        setModalState({
            isOpen: true,
            title: 'フォームのリセット確認',
            message: '入力内容をすべてリセットします。よろしいですか？（担当者名は保持されます）',
            onConfirm: () => {
                resetForm();
                closeModal();
                setToast({ message: 'フォームをリセットしました', type: 'info' });
            },
            onCancel: closeModal,
            confirmText: 'はい、リセットする',
            cancelText: 'キャンセル',
            type: 'danger',
        });
    }, [resetForm]);

    const handleOpenBugReport = () => setIsBugReportOpen(true);
    const handleCloseBugReport = () => {
        setIsBugReportOpen(false);
        setBugReportText('');
        setIsBugReportTextInvalid(false);
    };

    const handleBugReportSubmit = useCallback(async () => {
        if (!bugReportText.trim()) {
            setIsBugReportTextInvalid(true);
            return;
        }
        setIsSubmittingReport(true);
        setIsBugReportTextInvalid(false);
        try {
            const payload = {
                reportText: bugReportText,
                apName: formData.apName,
                currentFormData: JSON.stringify(formData, null, 2),
            };
            await fetch(BUG_REPORT_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                redirect: 'follow',
            });
            setToast({ message: '報告が送信されました。ご協力ありがとうございます！', type: 'success' });
            handleCloseBugReport();
        } catch (error) {
            console.error('Error submitting bug report:', error);
            setToast({ message: '報告の送信に失敗しました。', type: 'error' });
        } finally {
            setIsSubmittingReport(false);
        }
    }, [bugReportText, formData]);
    
    const onTabChange = useCallback((newTab) => {
        if (resetTimerRef.current) {
            clearTimeout(resetTimerRef.current);
            resetTimerRef.current = null;
            setToast({ message: 'タブを切り替えたため、自動リセットはキャンセルされました。', type: 'info' });
        }
        
        setActiveTab(newTab);
        setInvalidFields([]);
    }, []);
    
    return (
        <div className="bg-gray-100 min-h-screen font-sans">
            <Header onManualOpen={() => setIsManualOpen(true)} />

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <Modal {...modalState} />
            <ManualModal isOpen={isManualOpen} onClose={() => setIsManualOpen(false)} />
            <BugReportModal 
                isOpen={isBugReportOpen}
                onClose={handleCloseBugReport}
                reportText={bugReportText}
                onReportTextChange={(e) => {
                    setBugReportText(e.target.value);
                    if (isBugReportTextInvalid) setIsBugReportTextInvalid(false);
                }}
                onSubmit={handleBugReportSubmit}
                isSubmitting={isSubmittingReport}
                isInvalid={isBugReportTextInvalid}
            />

            <main className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <FormInput
                                label="担当者/AP名"
                                name="apName"
                                value={formData.apName}
                                onChange={handleInputChange}
                                isInvalid={invalidFields.includes('apName')}
                                required
                                className="w-1/2"
                            />
                             <FormCheckbox
                                label="サカイ販路"
                                name="isSakaiRoute"
                                checked={formData.isSakaiRoute}
                                onChange={handleInputChange}
                                isInvalid={invalidFields.includes('isSakaiRoute')}
                                description=""
                                className="pt-6"
                            />
                        </div>
                        <div className="border-b-2 border-gray-200">
                            <nav className="flex space-x-2 sm:space-x-4">
                                {TABS.map(tab => <Tab key={tab.id} {...tab} activeTab={activeTab} onTabChange={onTabChange} />)}
                            </nav>
                        </div>
                        <div className="mt-6 space-y-6">
                            {activeTab === 'electricity' && <ElectricityTab formData={formData} setFormData={setFormData} handleInputChange={handleInputChange} handleDateBlur={handleDateBlur} handleNameBlur={handleNameBlur} invalidFields={invalidFields} isElecGasSetSelected={isElecGasSetSelected} />}
                            {activeTab === 'gas' && <GasTab formData={formData} handleInputChange={handleInputChange} handleDateBlur={handleDateBlur} handleNameBlur={handleNameBlur} invalidFields={invalidFields} />}
                            {activeTab === 'internet' && <InternetTab formData={formData} setFormData={setFormData} handleInputChange={handleInputChange} handleDateBlur={handleDateBlur} handleNameBlur={handleNameBlur} invalidFields={invalidFields} />}
                            {activeTab === 'wts' && <WtsTab formData={formData} setFormData={setFormData} handleInputChange={handleInputChange} handleDateBlur={handleDateBlur} handleNameBlur={handleNameBlur} invalidFields={invalidFields} />}
                        </div>
                    </div>

                    <div className="sticky top-24 self-start">
                        <GeneratedComment
                            comment={generatedComment}
                            onCommentChange={setGeneratedComment}
                            onCopy={handleCopy}
                            onResetRequest={handleResetRequest}
                        />
                    </div>
                </div>
            </main>
            
            <button
                onClick={handleOpenBugReport}
                className="fixed bottom-6 right-6 bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                aria-label="不具合・要望の報告"
            >
                <ChatBubbleBottomCenterTextIcon className="h-7 w-7" />
            </button>
        </div>
    );
};

export default App;