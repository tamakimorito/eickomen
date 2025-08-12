

import { useState, useCallback, useRef, useEffect } from 'https://esm.sh/react@^19.1.0';
import { BUG_REPORT_SCRIPT_URL } from '../constants.ts';
import { generateElectricityCommentLogic } from '../commentLogic/electricity.ts';
import { generateGasCommentLogic } from '../commentLogic/gas.ts';
import { generateInternetCommentLogic } from '../commentLogic/internet.ts';
import { generateWtsCommentLogic } from '../commentLogic/wts.ts';

const FIELD_LABELS = {
    apName: '担当者/AP名', customerId: '顧客ID', recordId: 'レコードID', greeting: '名乗り',
    contractorName: '契約者名義（漢字）', contractorNameKana: '契約者名義（フリガナ）', gender: '性別',
    dob: '生年月日', phone: '電話番号', email: 'メアド', postalCode: '郵便番号', address: '住所',
    buildingInfo: '物件名＋部屋番号', moveInDate: '利用開始日/入居予定日', mailingOption: '書面発送先',
    currentPostalCode: '現住所の郵便番号', currentAddress: '現住所・物件名・部屋番号',
    existingLineStatus: '既存回線', existingLineCompany: '回線会社', mobileCarrier: '携帯キャリア',
    homeDiscount: 'おうち割', remarks: '備考', paymentMethod: '支払方法',
    // Internet
    product: '商材', housingType: 'タイプ', rackType: 'ラック', serviceFee: '案内料金', campaign: 'CP',
    preActivationRental: '開通前レンタル', wifiRouter: '無線ルーター購入', bankName: '銀行名',
    crossPathRouter: 'クロスパス無線ルーター', managementCompany: '管理会社名', managementContact: '管理連絡先',
    contactPerson: '担当者名', gmoCompensation: 'GMO解約違約金補填', gmoRouter: '無線LANルーター案内',
    gmoIsDocomoOwnerSame: 'ドコモ名義人申込者同一', gmoDocomoOwnerName: 'ドコモ名義人',
    gmoDocomoOwnerPhone: 'ドコモ名義人電話番号', gmoNoPairIdType: '身分証', auContactType: '連絡先種別',
    auPlanProvider: '案内プラン/プロバイダ',
    // Elec/Gas
    elecProvider: '電気商材', gasProvider: 'ガス商材', isAllElectric: 'オール電化', isVacancy: '空室',
    hasContractConfirmation: '契確要否', isGasSet: 'ガスセット', primaryProductStatus: '主商材受注状況',
    attachedOption: '付帯OP', isNewConstruction: '新築', gasOpeningDate: 'ガス開栓日',
    gasOpeningTimeSlot: 'ガス立会時間枠', gasArea: 'ガスエリア', gasWitness: '立会者',
    gasPreContact: 'ガス事前連絡先',
    // WTS
    wtsCustomerType: '顧客タイプ', wtsShippingDestination: '発送先', wtsShippingPostalCode: '発送先郵便番号',
    wtsShippingAddress: '発送先住所', wtsServerType: 'サーバー', wtsServerColor: 'サーバー色',
    wtsFiveYearPlan: '契約年数', wtsFreeWater: '無料水', wtsCreditCard: 'クレカ', wtsCarrier: 'キャリア',
    wtsMailingAddress: '書面送付先', wtsWaterPurifier: '浄水器確認', wtsMultipleUnits: '複数台提案',
    wtsU20HighSchool: '高校生ヒアリング', wtsU20ParentalConsent: '親相談OKか',
    wtsCorporateInvoice: '請求書先', wtsEmail: 'メアド',
};


const getRequiredFields = (formData, activeTab) => {
    let required = ['apName'];
    const { product, isSakaiRoute } = formData;

    switch (activeTab) {
        case 'internet':
            required.push('product');
            if (product.includes('SoftBank') || product.includes('賃貸ねっと')) {
                required.push('greeting', 'housingType', 'rackType', 'contractorName', 'contractorNameKana', 'dob', 'phone', 'postalCode', 'address', 'buildingInfo', 'moveInDate', 'mailingOption');
                if (formData.mailingOption === '現住所') required.push('currentPostalCode', 'currentAddress');

                if (product.includes('SoftBank')) {
                    if (!isSakaiRoute) required.push('customerId');
                    required.push('gender', 'serviceFee', 'campaign', 'existingLineStatus', 'mobileCarrier');
                    if (!product.includes('Air')) required.push('preActivationRental', 'homeDiscount');
                    if(product === 'SoftBank光1G') required.push('wifiRouter');
                    if (formData.existingLineStatus === 'あり') required.push('existingLineCompany');
                } else { // Chintai
                    if (!isSakaiRoute) required.push('customerId');
                    required.push('email', 'paymentMethod', 'crossPathRouter');
                    if (product === '賃貸ねっと') required.push('existingLineStatus');
                    if (formData.existingLineStatus === 'あり') required.push('existingLineCompany');
                    if (formData.paymentMethod === '口座') required.push('bankName');
                    if (formData.housingType === 'ファミリー') required.push('managementCompany', 'managementContact', 'contactPerson');
                }
            } else if (product === 'GMOドコモ光') {
                required.push('housingType', 'customerId', 'gmoCompensation', 'gmoRouter', 'greeting', 'contractorName', 'phone', 'existingLineCompany');
                if (formData.housingType.includes('ペアなし')) {
                    required.push('gmoNoPairIdType', 'mobileCarrier', 'paymentMethod');
                } else {
                    if (!formData.gmoIsDocomoOwnerSame) required.push('gmoDocomoOwnerName', 'gmoDocomoOwnerPhone');
                }
            } else if (product === 'AUひかり') {
                required.push('contractorName', 'existingLineCompany', 'postalCode', 'address', 'auPlanProvider', 'phone', 'auContactType');
            }
            break;

        case 'electricity':
            required.push('elecProvider', 'greeting', 'paymentMethod', 'contractorName', 'contractorNameKana', 'dob', 'phone', 'postalCode', 'address', 'buildingInfo', 'moveInDate');
            if (!isSakaiRoute) required.push('recordId');
            const { elecProvider, elecRecordIdPrefix } = formData;
            if (elecProvider === 'すまいのでんき（ストエネ）' || (elecProvider === 'プラチナでんき（ジャパン）' && elecRecordIdPrefix === 'SR')) {
                required.push('hasContractConfirmation');
            }
            if (['キューエネスでんき', 'ユーパワー UPOWER', 'HTBエナジー', 'リミックスでんき', 'ループでんき'].includes(elecProvider)) {
                required.push('email');
            }
             if (elecProvider === 'すまいのでんき（ストエネ）' && formData.isGasSet === 'セット' || ['ニチガス電気セット', '東邦ガスセット', '東京ガス電気セット'].includes(elecProvider)) {
                required.push('gasOpeningDate', 'gasOpeningTimeSlot');
            }
             if (formData.mailingOption === '現住所' && ['すまいのでんき（ストエネ）', 'プラチナでんき（ジャパン）', 'ニチガス電気セット', '東京ガス電気セット', '東邦ガスセット'].includes(elecProvider)) {
                required.push('currentPostalCode', 'currentAddress');
            }
            if (['ニチガス電気セット'].includes(elecProvider)) {
                required.push('gasArea', 'gasWitness', 'gasPreContact');
            }
            if (['東邦ガスセット', '東京ガス電気セット'].includes(elecProvider)) {
                required.push('currentAddress');
            }
            break;

        case 'gas':
            required.push('gasProvider', 'greeting', 'paymentMethod', 'contractorName', 'contractorNameKana', 'dob', 'phone', 'postalCode', 'address', 'buildingInfo', 'moveInDate');
             if (!isSakaiRoute) required.push('recordId');
             if(['すまいのでんき（ストエネ）', '東京ガス単品', '東邦ガス単品', '東急ガス', 'ニチガス単品'].includes(formData.gasProvider)) {
                 required.push('gasOpeningTimeSlot');
             }
             if(['東京ガス単品', 'ニチガス単品'].includes(formData.gasProvider)) {
                required.push('gasWitness', 'gasPreContact');
             }
             if(formData.gasProvider === 'ニチガス単品') required.push('gasArea');
             if(formData.mailingOption === '現住所' && ['すまいのでんき（ストエネ）', 'ニチガス単品', '東邦ガス単品', '東急ガス'].includes(formData.gasProvider)){
                required.push('currentPostalCode', 'currentAddress');
             }
             if(['東邦ガス単品', '東急ガス'].includes(formData.gasProvider)){
                 required.push('currentAddress');
             }
            break;
            
        case 'wts':
            required.push('wtsCustomerType', 'contractorName', 'dob', 'phone', 'wtsShippingDestination', 'wtsServerType', 'wtsServerColor', 'wtsFiveYearPlan', 'wtsFreeWater', 'wtsCreditCard', 'wtsCarrier', 'moveInDate', 'wtsMailingAddress', 'wtsWaterPurifier', 'wtsMultipleUnits');
            if (!isSakaiRoute) required.push('customerId');
            if (formData.wtsCustomerType === 'U-20') required.push('wtsU20HighSchool', 'wtsU20ParentalConsent');
            if (formData.wtsCustomerType === '法人') required.push('wtsEmail', 'wtsCorporateInvoice');
            if (formData.wtsShippingDestination === 'その他') required.push('wtsShippingPostalCode', 'wtsShippingAddress');
            break;
    }

    const missingFields = required.filter(field => {
        const value = formData[field];
        if (typeof value === 'boolean') return false; // booleans are always "filled"
        return !value;
    });
    
    const missingLabels = missingFields.map(field => FIELD_LABELS[field] || field);
    
    return { missingFields, missingLabels };
};


export const useAppLogic = ({ formData, dispatch, resetForm, setInvalidFields }) => {
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
        isErrorBanner: false,
        bannerMessage: '',
    });

    const closeModal = useCallback(() => setModalState(prev => ({ ...prev, isOpen: false })), []);
    
    useEffect(() => {
        let newComment = '';
        try {
            switch (activeTab) {
                case 'electricity': newComment = generateElectricityCommentLogic(formData); break;
                case 'gas': newComment = generateGasCommentLogic(formData); break;
                case 'internet': newComment = generateInternetCommentLogic(formData); break;
                case 'wts': newComment = generateWtsCommentLogic(formData); break;
            }
        } catch (error) {
            console.error("Error generating comment:", error);
            newComment = "コメントの生成中にエラーが発生しました。";
        }
        setGeneratedComment(newComment);
    }, [formData, activeTab]);
    
    const handleCopy = useCallback(() => {
        const { missingFields, missingLabels } = getRequiredFields(formData, activeTab);

        if (missingFields.length > 0) {
            setInvalidFields(missingFields);
            setModalState({
                isOpen: true,
                title: '必須項目が未入力です',
                message: `以下の項目を入力してください：\n\n・${missingLabels.join('\n・')}`,
                onConfirm: closeModal,
                onCancel: null, // Hides cancel button
                confirmText: 'OK',
                cancelText: null,
                type: 'warning',
                isErrorBanner: true,
                bannerMessage: '未入力の必須項目があります。全ての項目を入力してください。'
            });
            return;
        }
        
        setInvalidFields([]);
        setModalState(prev => ({...prev, isErrorBanner: false}));

        const { moveInDate, dob } = formData;
        const dateErrors = [];
        if (moveInDate) {
            const moveIn = new Date(moveInDate);
            const today = new Date();
            moveIn.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);
            if (!isNaN(moveIn.getTime()) && moveIn < today) {
                dateErrors.push('・利用開始日が過去の日付になっています。');
            }
        }
        if (dob) {
            const birthDate = new Date(dob);
            const today = new Date();
            if (!isNaN(birthDate.getTime()) && birthDate > today) {
                dateErrors.push('・生年月日が未来の日付になっています。');
            }
        }
    
        const performCopy = () => {
            if (!generatedComment) {
                setToast({ message: 'コメントが空です', type: 'error' });
                return;
            }
            navigator.clipboard.writeText(generatedComment).then(() => {
                setToast({ message: 'コメントをコピーしました！20分後にフォームはリセットされます。', type: 'success' });
                if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
                resetTimerRef.current = setTimeout(() => {
                    resetForm(true);
                    setToast({ message: 'フォームが自動リセットされました。', type: 'info' });
                }, 20 * 60 * 1000);
            }).catch(err => {
                setToast({ message: 'コピーに失敗しました', type: 'error' });
                console.error('Copy failed', err);
            });
        };

        if (dateErrors.length > 0) {
            setModalState({
                isOpen: true,
                title: '入力内容の確認',
                message: `以下の問題が見つかりました。このままコピーしますか？\n\n${dateErrors.join('\n')}`,
                onConfirm: () => { closeModal(); performCopy(); },
                onCancel: closeModal,
                confirmText: 'このままコピー',
                cancelText: '修正する',
                type: 'warning',
                isErrorBanner: false,
            });
        } else {
            performCopy();
        }
    }, [generatedComment, formData, activeTab, resetForm, closeModal, setInvalidFields, setToast]);

    const handleResetRequest = useCallback(() => {
        setModalState({
            isOpen: true,
            title: 'フォームのリセット確認',
            message: '入力内容をすべてリセットします。よろしいですか？（担当者名は保持されます）',
            onConfirm: () => {
                resetForm(true);
                closeModal();
                setToast({ message: 'フォームをリセットしました', type: 'info' });
                setInvalidFields([]);
                setModalState(prev => ({...prev, isErrorBanner: false }));
            },
            onCancel: closeModal,
            confirmText: 'はい、リセットする',
            cancelText: 'キャンセル',
            type: 'danger',
            isErrorBanner: false,
        });
    }, [resetForm, closeModal, setInvalidFields]);
    
    const onTabChange = useCallback((newTab) => {
        if (resetTimerRef.current) {
            clearTimeout(resetTimerRef.current);
            resetTimerRef.current = null;
            setToast({ message: 'タブを切り替えたため、自動リセットはキャンセルされました。', type: 'info' });
        }
        
        const { recordId } = formData;
        const fromElecOrGas = activeTab === 'electricity' || activeTab === 'gas';
        
        if (fromElecOrGas && newTab === 'internet' && recordId && recordId.startsWith('ID:')) {
             dispatch({ type: 'UPDATE_FIELD', payload: { name: 'greeting', value: '' } });
        }

        setActiveTab(newTab);
        setInvalidFields([]);
        setModalState(prev => ({...prev, isErrorBanner: false }));
    }, [activeTab, formData, dispatch, setInvalidFields, setToast]);

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
            await fetch(BUG_REPORT_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
                mode: 'no-cors'
            });
            setToast({ message: '報告が送信されました。ご協力ありがとうございます！', type: 'success' });
            handleCloseBugReport();

        } catch (error) {
            console.error('Error submitting bug report:', error);
            setToast({ message: '報告の送信に失敗しました。', type: 'error' });
        } finally {
            setBugReportState(prev => ({ ...prev, isSubmitting: false }));
        }
    }, [bugReportState.text, formData]);
    
    
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