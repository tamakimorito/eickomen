import { useState, useCallback, useRef, useEffect } from 'https://esm.sh/react@^19.1.0';
import { BUG_REPORT_SCRIPT_URL } from '../constants.ts';
import { generateElectricityCommentLogic } from '../commentLogic/electricity.ts';
import { generateGasCommentLogic } from '../commentLogic/gas.ts';
import { generateInternetCommentLogic } from '../commentLogic/internet.ts';
import { generateWtsCommentLogic } from '../commentLogic/wts.ts';

export const useAppLogic = ({ formData, resetForm }) => {
    const [activeTab, setActiveTab] = useState('electricity');
    const [generatedComment, setGeneratedComment] = useState('');
    const [toast, setToast] = useState(null);
    const resetTimerRef = useRef(null);
    const [isManualOpen, setIsManualOpen] = useState(false);
    const [isBugReportOpen, setIsBugReportOpen] = useState(false);
    
    const [bugReportState, setBugReportState] = useState({
        text: '',
        isInvalid: false,
        isSubmitting: false,
    });
    
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
    
    // Comment Generation Logic
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
    
    // Copy and Reset Logic
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
    
    // Tab Change Logic
    const onTabChange = useCallback((newTab) => {
        if (resetTimerRef.current) {
            clearTimeout(resetTimerRef.current);
            resetTimerRef.current = null;
            setToast({ message: 'タブを切り替えたため、自動リセットはキャンセルされました。', type: 'info' });
        }
        setActiveTab(newTab);
    }, []);

    // Bug Report Logic
    const handleOpenBugReport = () => setIsBugReportOpen(true);
    const handleCloseBugReport = () => {
        setIsBugReportOpen(false);
        setBugReportState({ text: '', isInvalid: false, isSubmitting: false });
    };

    const handleBugReportTextChange = (e) => {
        setBugReportState(prev => ({ ...prev, text: e.target.value, isInvalid: false }));
    };

    const handleBugReportSubmit = useCallback(async () => {
        if (!formData.apName.trim()) {
            setToast({ message: '「担当者/AP名」を入力してください。', type: 'error' });
            return;
        }
        if (!bugReportState.text.trim()) {
            setBugReportState(prev => ({ ...prev, isInvalid: true }));
            return;
        }
        setBugReportState(prev => ({ ...prev, isSubmitting: true, isInvalid: false }));
        try {
            const payload = {
                reportText: bugReportState.text,
                apName: formData.apName,
                currentFormData: JSON.stringify(formData, null, 2),
            };
            const response = await fetch(BUG_REPORT_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8', // Apps Script web apps need this for POST from browser
                },
                mode: 'no-cors' // Use 'no-cors' for simple POST requests to Apps Script
            });
            
            setToast({ message: '報告が送信されました。ご協力ありがとうございます！', type: 'success' });
            handleCloseBugReport();

        } catch (error) {
            console.error('Error submitting bug report:', error);
            // Even with no-cors, this catch block might not be triggered for network errors.
            // But we can optimistically assume it worked or handle UI feedback separately.
            setToast({ message: '報告の送信に失敗しました。', type: 'error' });
        } finally {
            setBugReportState(prev => ({ ...prev, isSubmitting: false }));
        }
    }, [bugReportState.text, formData]);
    
    
    // Expose values and functions
    return {
        activeTab,
        onTabChange,
        generatedComment,
        setGeneratedComment,
        toast,
        setToast,
        modalState,
        setModalState,
        closeModal,
        isManualOpen,
        setIsManualOpen,
        isBugReportOpen,
        bugReportState,
        handleBugReportTextChange,
        handleOpenBugReport,
        handleCloseBugReport,
        handleBugReportSubmit,
        handleCopy,
        handleResetRequest,
    };
};