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
    gasPreContact: 'ガス事前連絡先', gasIsCorporate: '法人契約',
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
                    if (formData.housingType === 'ファミリー' || (formData.housingType === '10G' && formData.rackType === '無し')) {
                        required.push('managementCompany', 'managementContact', 'contactPerson');
                    }
                }
            } else if (product === 'GMOドコモ光') {
                required.push('housingType', 'customerId', 'gmoCompensation', 'gmoRouter', 'greeting', 'contractorName', 'phone', 'existingLineCompany');
                if (formData.housingType.includes('ペアなし')) {
                    required.push('gmoNoPairIdType', 'mobileCarrier', 'paymentMethod');
                } else {
                    if (!formData.gmoIsDocomoOwnerSame) required.push('gmoDocomoOwnerName', 'gmoDocomoOwnerPhone');
                }
            } else if (product === 'AUひかり') {
                required.push('greeting', 'contractorName', 'existingLineCompany', 'postalCode', 'address', 'phone', 'auContactType', 'auPlanProvider');
            }
            break;

        case 'electricity': {
            const { elecProvider, elecRecordIdPrefix, isAllElectric } = formData;
            required.push('elecProvider', 'greeting', 'contractorName', 'contractorNameKana', 'dob', 'phone', 'postalCode', 'address', 'buildingInfo', 'moveInDate');
            if (elecProvider !== '東京ガス電気セット') {
                required.push('paymentMethod');
            }
            if (!isSakaiRoute) required.push('recordId');
            if (elecProvider === 'すまいのでんき（ストエネ）' || (elecProvider === 'プラチナでんき（ジャパン）' && (elecRecordIdPrefix === 'SR' || isAllElectric === 'あり'))) {
                required.push('hasContractConfirmation');
            }
            if (['キューエネスでんき', 'ユーパワー UPOWER', 'HTBエナジー', 'リミックスでんき', 'ループでんき'].includes(elecProvider)) {
                required.push('email');
            }
             if (elecProvider === 'すまいのでんき（ストエネ）' && formData.isGasSet === 'セット' || ['ニチガス電気セット', '東邦ガスセット', '東京ガス電気セット', '大阪ガス電気セット'].includes(elecProvider)) {
                required.push('gasOpeningDate', 'gasOpeningTimeSlot');
            }
             if (formData.mailingOption === '現住所' && ['すまいのでんき（ストエネ）', 'プラチナでんき（ジャパン）', 'ニチガス電気セット', '東京ガス電気セット', '東邦ガスセット', '大阪ガス電気セット'].includes(elecProvider)) {
                required.push('currentPostalCode', 'currentAddress');
            }
            if (['ニチガス電気セット'].includes(elecProvider)) {
                required.push('gasArea', 'gasWitness', 'gasPreContact');
            }
            if (['東邦ガスセット', '東京ガス電気セット'].includes(elecProvider)) {
                required.push('currentAddress');
            }
            break;
        }

        case 'gas': {
            const { gasProvider } = formData;
            required.push('gasProvider', 'contractorName', 'contractorNameKana', 'dob', 'phone', 'postalCode', 'address', 'buildingInfo', 'moveInDate');
            
            if (!isSakaiRoute) required.push('recordId');

            if (![ '東京ガス単品', '大阪ガス単品' ].includes(gasProvider)) {
                required.push('greeting');
            }
             if (gasProvider !== '東京ガス単品') {
                required.push('paymentMethod');
            }
            if (gasProvider === '東急ガス') {
                required.push('email');
            }
            
             if(['すまいのでんき（ストエネ）', '東京ガス単品', '東邦ガス単品', '東急ガス', 'ニチガス単品', '大阪ガス単品'].includes(gasProvider)) {
                 required.push('gasOpeningTimeSlot');
             }
             if(gasProvider === 'ニチガス単品') {
                required.push('gasWitness', 'gasPreContact', 'gasArea');
             }
             if(gasProvider === '東京ガス単品' && formData.gasIsCorporate) {
                required.push('gasWitness', 'gasPreContact');
             }
             if(formData.mailingOption === '現住所' && ['すまいのでんき（ストエネ）', 'ニチガス単品', '東邦ガス単品', '東急ガス', '大阪ガス単品'].includes(gasProvider)){
                required.push('currentPostalCode', 'currentAddress');
             }
             if(['東邦ガス単品', '東急ガス'].includes(gasProvider)){
                 required.push('currentAddress');
             }
            break;
        }
            
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
    const elecGasGreetingRef = useRef('');
    
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

    // 設置先住所の自動入力（サカイ販路の場合のみ）
    useEffect(() => {
        const { postalCode, address, isSakaiRoute } = formData;
        // サカイ販路が選択されている場合のみ住所を自動入力
        if (isSakaiRoute && postalCode && /^\d{7}$/.test(postalCode.replace(/\D/g, ''))) {
            const fetchAddress = async () => {
                try {
                    const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${postalCode.replace(/\D/g, '')}`);
                    if (!response.ok) throw new Error('API response was not ok.');
                    const data = await response.json();
                    if (data.status === 200 && data.results) {
                        const { address1, address2, address3 } = data.results[0];
                        const fullAddress = `${address1}${address2}${address3}`;
                        // 既に手動で入力されている場合や、取得した住所が同じ場合は更新しない
                        if (fullAddress && (!address || !address.startsWith(fullAddress))) {
                            dispatch({ type: 'UPDATE_FIELD', payload: { name: 'address', value: fullAddress } });
                        }
                    } else {
                        if (!address) {
                             setToast({ message: '郵便番号に対応する住所が見つかりません。', type: 'error' });
                        }
                    }
                } catch (error) {
                    console.error('Failed to fetch address:', error);
                    setToast({ message: '住所の自動入力に失敗しました。', type: 'error' });
                }
            };
            fetchAddress();
        }
    }, [formData.isSakaiRoute, formData.postalCode, dispatch, setToast]);

    // 現住所の自動入力（販路問わず）
    useEffect(() => {
        const { currentPostalCode, currentAddress } = formData;
        if (currentPostalCode && /^\d{7}$/.test(currentPostalCode.replace(/\D/g, ''))) {
            const fetchAddress = async () => {
                try {
                    const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${currentPostalCode.replace(/\D/g, '')}`);
                    if (!response.ok) throw new Error('API response was not ok.');
                    const data = await response.json();
                    if (data.status === 200 && data.results) {
                        const { address1, address2, address3 } = data.results[0];
                        const fullAddress = `${address1}${address2}${address3}`;
                        if (fullAddress && (!currentAddress || !currentAddress.startsWith(fullAddress))) {
                            dispatch({ type: 'UPDATE_FIELD', payload: { name: 'currentAddress', value: fullAddress } });
                        }
                    } else {
                        if (!currentAddress) {
                            setToast({ message: '現住所の郵便番号に対応する住所が見つかりません。', type: 'error' });
                        }
                    }
                } catch (error) {
                    console.error('Failed to fetch current address:', error);
                    setToast({ message: '現住所の自動入力に失敗しました。', type: 'error' });
                }
            };
            fetchAddress();
        }
    }, [formData.currentPostalCode, dispatch, setToast]);
    
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

        // --- Address Number Check for AU Hikari ---
        if (activeTab === 'internet' && formData.product === 'AUひかり' && formData.address && !/\d/.test(formData.address)) {
            setInvalidFields(['address']);
            setModalState({
                isOpen: true,
                title: '入力エラー',
                message: '「住所※物件名部屋番号まで全部」に番地などの数字が含まれていません。修正してください。',
                onConfirm: closeModal,
                onCancel: null,
                confirmText: 'OK',
                cancelText: null,
                type: 'warning',
                isErrorBanner: true,
                bannerMessage: '住所に数字が含まれていません。'
            });
            return; // Stop copy
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
        
        // --- Address Number Check ---
        if (formData.address && !/\d/.test(formData.address)) {
            setInvalidFields(prev => [...new Set([...prev, 'address'])]);
            setModalState({
                isOpen: true,
                title: '入力内容の確認',
                message: '住所に番地などの数字が含まれていません。入力内容を確認してください。',
                onConfirm: () => {
                    closeModal();
                    setInvalidFields(prev => prev.filter(f => f !== 'address'));
                    performCopy();
                },
                onCancel: closeModal,
                confirmText: 'このままコピー',
                cancelText: '修正する',
                type: 'warning',
                isErrorBanner: true,
                bannerMessage: '住所に番地などの数字が含まれていない可能性があります。'
            });
            return;
        }

        // --- Current Address Number Check ---
        if (formData.mailingOption === '現住所' && formData.currentAddress && !/\d/.test(formData.currentAddress)) {
            setInvalidFields(prev => [...new Set([...prev, 'currentAddress'])]);
            setModalState({
                isOpen: true,
                title: '入力内容の確認',
                message: '現住所に番地などの数字が含まれていません。入力内容を確認してください。',
                onConfirm: () => {
                    closeModal();
                    setInvalidFields(prev => prev.filter(f => f !== 'currentAddress'));
                    performCopy();
                },
                onCancel: closeModal,
                confirmText: 'このままコピー',
                cancelText: '修正する',
                type: 'warning',
                isErrorBanner: true,
                bannerMessage: '現住所に番地などの数字が含まれていない可能性があります。'
            });
            return;
        }

        // --- DOB / Phone Swap Check ---
        const dobValue = formData.dob || '';
        const phoneValue = formData.phone || '';
        let swapWarningMessage = '';

        const dobDigitsOnly = dobValue.replace(/\D/g, '');
        if (dobValue.includes('-') || dobDigitsOnly.length === 10 || dobDigitsOnly.length === 11) {
            swapWarningMessage = '「生年月日」に電話番号のような入力がされています。';
        }

        if (!swapWarningMessage) {
            const parsedPhoneAsDate = new Date(phoneValue);
            const currentYear = new Date().getFullYear();
            if (phoneValue.includes('/') || (phoneValue.length >= 8 && !isNaN(parsedPhoneAsDate.getTime()) && parsedPhoneAsDate.getFullYear() > 1900 && parsedPhoneAsDate.getFullYear() <= currentYear)) {
                swapWarningMessage = '「電話番号」に日付のような入力がされています。';
            }
        }

        if (swapWarningMessage) {
            setInvalidFields(prev => [...new Set([...prev, 'dob', 'phone'])]);
            setModalState({
                isOpen: true,
                title: '入力内容の確認',
                message: `${swapWarningMessage}\n入力内容が正しいか確認してください。`,
                onConfirm: () => {
                    closeModal();
                    setInvalidFields(prev => prev.filter(f => f !== 'dob' && f !== 'phone'));
                    performCopy();
                },
                onCancel: closeModal,
                confirmText: 'このままコピー',
                cancelText: '修正する',
                type: 'warning',
                isErrorBanner: true,
                bannerMessage: '生年月日または電話番号の入力内容に誤りの可能性があります。'
            });
            return;
        }
        // --- End of Swap Check ---

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
        
        const { recordId, greeting } = formData;
        const fromElecOrGas = activeTab === 'electricity' || activeTab === 'gas';
        const toElecOrGas = newTab === 'electricity' || newTab === 'gas';
        const fromInternet = activeTab === 'internet';
        const toInternet = newTab === 'internet';

        // Itanji route (`ID:`) special greeting handling
        if (recordId && recordId.startsWith('ID:')) {
            if (fromElecOrGas && toInternet) {
                // Save the elec/gas greeting and clear it for internet tab
                elecGasGreetingRef.current = greeting;
                dispatch({ type: 'UPDATE_FIELD', payload: { name: 'greeting', value: '' } });
            } else if (fromInternet && toElecOrGas) {
                // Restore the elec/gas greeting
                dispatch({ type: 'UPDATE_FIELD', payload: { name: 'greeting', value: elecGasGreetingRef.current || 'すまえる' } });
            }
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

    const handleDateBlurWithValidation = useCallback((e) => {
        const { name, value } = e.target;
        if (!value) return;

        // 1. Formatting Logic
        let processedValue = value;
        const match = value.match(/^(?<month>\d{1,2})\/(?<day>\d{1,2})$/);
        if (match?.groups) {
            const { month, day } = match.groups;
            const m = parseInt(month, 10);
            const d = parseInt(day, 10);
            if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
                const today = new Date();
                const currentYear = today.getFullYear();
                const targetDate = new Date(currentYear, m - 1, d);
                if (targetDate.getMonth() === m - 1) {
                    processedValue = `${targetDate.getFullYear()}/${String(targetDate.getMonth() + 1).padStart(2, '0')}/${String(targetDate.getDate()).padStart(2, '0')}`;
                }
            }
        } else {
            const targetDate = new Date(value);
            if (!isNaN(targetDate.getTime())) {
                processedValue = `${targetDate.getFullYear()}/${String(targetDate.getMonth() + 1).padStart(2, '0')}/${String(targetDate.getDate()).padStart(2, '0')}`;
            }
        }
        if (processedValue !== value) {
            dispatch({ type: 'UPDATE_FIELD', payload: { name, value: processedValue } });
        }

        // 2. Validation Logic
        const dateToValidate = new Date(processedValue);
        if (isNaN(dateToValidate.getTime())) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // DOB check (under 15)
        if (name === 'dob') {
            const fifteenYearsAgo = new Date(today.getFullYear() - 15, today.getMonth(), today.getDate());
            if (dateToValidate > fifteenYearsAgo) {
                setModalState({
                    isOpen: true,
                    title: '入力内容の確認',
                    message: '生年月日は正しいですか？ (15歳未満です)',
                    onConfirm: closeModal,
                    onCancel: closeModal,
                    confirmText: 'このまま進む',
                    cancelText: '修正する',
                    type: 'warning'
                });
            }
        }

        // Move-in date check (5+ years ago)
        const moveInDateFields = ['moveInDate', 'gasOpeningDate'];
        if (moveInDateFields.includes(name)) {
            const fiveYearsAgo = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate());
            if (dateToValidate <= fiveYearsAgo) {
                setModalState({
                    isOpen: true,
                    title: '入力内容の確認',
                    message: `${FIELD_LABELS[name] || '日付'}は正しいですか？ (5年以上前です)`,
                    onConfirm: closeModal,
                    onCancel: closeModal,
                    confirmText: 'このまま進む',
                    cancelText: '修正する',
                    type: 'warning'
                });
            }
        }
    }, [dispatch, setModalState, closeModal]);
    
    
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
        handleDateBlurWithValidation,
    };
};