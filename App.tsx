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
    
    setInvalidFields(prev => prev.filter(item => item !== name));

    if (type === 'checkbox') {
        const { checked } = e.target;
        
        if (name === 'isSakaiRoute') {
            const updates: { [key: string]: any } = {
                isSakaiRoute: checked,
                recordId: '',
                customerId: '', // レコードIDと顧客IDは同じ意味なので両方クリア
            };
            if (checked) {
                if (activeTab === 'electricity') updates.elecRecordIdPrefix = 'サカイ';
                else if (activeTab === 'gas') updates.gasRecordIdPrefix = 'サカイ';
            } else {
                if (activeTab === 'electricity') updates.elecRecordIdPrefix = 'それ以外';
                else if (activeTab === 'gas') updates.gasRecordIdPrefix = 'それ以外';
            }
            setFormData(prev => ({ ...prev, ...updates }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: checked }));
        return;
    }
    
    let { value } = e.target;
    if (name === 'apName') {
        value = value.replace(/\s/g, '');
    }
    
    const updates: { [key: string]: any } = { [name]: value };

    if (name === 'recordId' && !formData.isSakaiRoute) {
        let prefix = 'それ以外'; // Default

        if (value.startsWith('STJP:')) {
            prefix = 'STJP:';
        } else if (value.startsWith('SR')) {
            prefix = 'SR';
        } else if (value.startsWith('code:')) {
            prefix = 'code:';
        } else if (value.startsWith('ID:')) {
            prefix = 'ID:';
        } else if (value.startsWith('S')) {
            prefix = 'S';
        }

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

    setFormData(prev => ({ ...prev, ...updates }));
  }, [activeTab, formData.isSakaiRoute]);
  
    const handleDateBlur = useCallback((e) => {
        const { name, value } = e.target;
        if (!value) return;

        let processedValue = value;
        const targetDate = new Date(value);

        // If it's not a valid date, maybe it's M/D format
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

                    const bestDate = diffs[0].date;
                    
                    const finalYear = bestDate.getFullYear();
                    const finalMonth = String(bestDate.getMonth() + 1).padStart(2, '0');
                    const finalDay = String(bestDate.getDate()).padStart(2, '0');
                    
                    processedValue = `${finalYear}/${finalMonth}/${finalDay}`;
                    setFormData(prev => ({...prev, [name]: processedValue}));
                }
            }
        }

        const date = new Date(processedValue);
        if (isNaN(date.getTime())) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (name === 'dob') {
            const tenYearsAgo = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate());
            
            if (date > today) {
                showConfirmationModal(
                    '日付の確認',
                    '生年月日が未来の日付に設定されています。よろしいですか？',
                    () => { setFormData(prev => ({ ...prev, dob: '' })); }
                );
            } else if (date > tenYearsAgo) {
                 showConfirmationModal(
                    '年齢の確認',
                    '生年月日が10歳以下に設定されています。よろしいですか？',
                    () => { setFormData(prev => ({ ...prev, dob: '' })); }
                );
            }
        } else if (['moveInDate', 'gasOpeningDate'].includes(name)) {
            const fiveYearsAgo = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate());

            if (date < fiveYearsAgo) {
                 showConfirmationModal(
                    '日付の確認',
                    '利用開始日/開栓日が5年以上前の日付に設定されています。よろしいですか？',
                    () => { setFormData(prev => ({ ...prev, [name]: '' })); }
                );
            }
        }
    }, [showConfirmationModal]);

    const handleNameBlur = useCallback((e) => {
        const { name, value } = e.target;
        if (!value || !/\d/.test(value)) return;

        if (name === 'contractorName' || name === 'contractorNameKana') {
            showConfirmationModal(
                '入力内容の確認',
                '名前に数字が含まれています。このままでよろしいですか？',
                () => {
                    setFormData(prev => ({ ...prev, [name]: '' }));
                    (document.querySelector(`[name="${name}"]`) as HTMLElement)?.focus();
                }
            );
        }
    }, [showConfirmationModal]);

  const resetForm = useCallback((message) => {
    if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
        resetTimerRef.current = null;
    }
    const currentProduct = formData.product;
    const currentApName = formData.apName;
    const currentIsSakaiRoute = formData.isSakaiRoute;
    
    // Keep apName and isSakaiRoute, reset everything else
    setFormData({
        ...INITIAL_FORM_DATA, 
        product: currentProduct, 
        apName: currentApName,
        isSakaiRoute: currentIsSakaiRoute,
        elecRecordIdPrefix: currentIsSakaiRoute ? 'サカイ' : 'それ以外',
        gasRecordIdPrefix: currentIsSakaiRoute ? 'サカイ' : 'それ以外',
    });

    setGeneratedComment('');
    setInvalidFields([]);
    if (message) {
      setToast({ message, type: 'success' });
    }
  }, [formData.product, formData.apName, formData.isSakaiRoute]);

  useEffect(() => {
    return () => {
        if (resetTimerRef.current) {
            clearTimeout(resetTimerRef.current);
        }
    };
  }, []);

  const formatDateToYYYYMMDD = (dateStr) => {
    if (!dateStr) return dateStr;
    const date = new Date(dateStr);
    if (!isNaN(date.getTime()) && date.getFullYear() > 1900) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    }
    return dateStr;
  };
  
    const generateInternetComment = useCallback(() => {
        const is10G = formData.product === 'SoftBank光10G';
        const isAir = formData.product === 'SB Air';
        const isChintai = formData.product === '賃貸ねっと';
        const isChintaiFree = formData.product === '賃貸ねっと【無料施策】';

        const {
            product, customerId, housingType, apName, greeting,
            rackType, contractorName, contractorNameKana, gender, dob, phone,
            postalCode, address, buildingInfo, moveInDate, mailingOption,
            currentPostalCode, currentAddress, serviceFee, campaign, preActivationRental,
            existingLineStatus, existingLineCompany, mobileCarrier, homeDiscount, wifiRouter, remarks,
            managementCompany, managementContact, contactPerson, noDrilling,
            email, paymentMethod, bankName, crossPathRouter, buildingSurveyRequest, drawingSubmissionContact
        } = formData;

        const formatPhoneNumber = (phone) => {
            const digits = phone.replace(/\D/g, '');
            if (digits.length === 11) {
                return `${digits.substring(0, 3)}-${digits.substring(3, 7)}-${digits.substring(7)}`;
            }
            if (digits.length === 10) {
                return `${digits.substring(0, 3)}-${digits.substring(3, 6)}-${digits.substring(6)}`;
            }
            return phone;
        };

        if (isChintaiFree) {
            const header = '【ちんむりょ賃貸ねっと無料施策】250808';
            let comment = `${header}\n`;
            comment += `タイプ：${housingType || ''}\n`;
            comment += `AP名：${apName || ''}\n`;
            comment += `顧客ID：${customerId || ''}\n`;
            comment += `名乗り：${greeting || ''}\n`;
            comment += `ラック：${rackType || ''}\n`;
            comment += `メアド：${email || ''}\n`;
            comment += `契約者名義（漢字）：${contractorName || ''}\n`;
            comment += `契約者名義（フリガナ）：${contractorNameKana || ''}\n`;
            comment += `生年月日(西暦)：${formatDateToYYYYMMDD(dob) || ''}\n`;
            comment += `電話番号(ハイフン無し)：${(phone || '').replace(/\D/g, '')}\n`;
            comment += `➤設置先\n`;
            comment += `郵便番号(〒・ハイフン無し)：${(postalCode || '').replace(/-/g, '')}\n`;
            comment += `住所：${address || ''}\n`;
            comment += `物件名＋部屋番号：${buildingInfo || ''}\n`;
            comment += `利用開始日(必ず引っ越し日を記載)：${formatDateToYYYYMMDD(moveInDate) || ''}\n`;
            let mailingOptionText = mailingOption;
            if (mailingOption === '新居') {
                mailingOptionText = '新居(設置先と同じ)';
            }
            comment += `■書面発送先：${mailingOptionText || ''}\n`;
            if (mailingOption === '現住所') {
                comment += `現住所の場合郵便番号(〒・ハイフン無し)：${(currentPostalCode || '').replace(/-/g, '')}\n`;
                comment += `住所・物件名・部屋番号：${currentAddress || ''}\n`;
            }
            comment += `案内料金：${serviceFee || ''}\n`;
            let paymentInfo = paymentMethod;
            if (paymentMethod === '口座' && bankName) {
                paymentInfo = `口座（銀行名：${bankName}）※外国人は口座NG`;
            } else if (paymentMethod === '口座') {
                paymentInfo = `口座 ※外国人は口座NG`;
            }
            comment += `支払方法：${paymentInfo || ''}\n`;
            comment += `クロスパス無線ルーター：${crossPathRouter || ''}\n`;
            comment += `備考：${remarks || ''}\n`;
            setGeneratedComment(comment);
            return;
        }
        
        if (isChintai) {
            const header = '【賃貸ねっと】250808';
            let comment = `${header}\n`;
            comment += `タイプ：${housingType || ''}\n`;
            comment += `AP名：${apName || ''}\n`;
            comment += `顧客ID：${customerId || ''}\n`;
            comment += `名乗り：${greeting || ''}\n`;
            let zenigameInfo = existingLineStatus;
            if (existingLineStatus === 'あり' && existingLineCompany) {
                zenigameInfo = `あり（現状回線：${existingLineCompany}）`;
            }
            comment += `ゼニガメ：${zenigameInfo || ''}\n`;
            comment += `ラック：${rackType || ''}\n`;
            comment += `メアド：${email || ''}\n`;
            comment += `契約者名義（漢字）：${contractorName || ''}\n`;
            comment += `契約者名義（フリガナ）：${contractorNameKana || ''}\n`;
            comment += `生年月日(西暦)：${formatDateToYYYYMMDD(dob) || ''}\n`;
            comment += `電話番号(ハイフン無し)：${(phone || '').replace(/\D/g, '')}\n`;
            comment += `➤設置先\n`;
            comment += `郵便番号(〒・ハイフン無し)：${(postalCode || '').replace(/-/g, '')}\n`;
            comment += `住所：${address || ''}\n`;
            comment += `物件名＋部屋番号：${buildingInfo || ''}\n`;
            comment += `利用開始日(必ず引っ越し日を記載)：${formatDateToYYYYMMDD(moveInDate) || ''}\n`;
            let mailingOptionText = mailingOption;
            if (mailingOption === '新居') {
                mailingOptionText = '新居(設置先と同じ)';
            }
            comment += `■書面発送先：${mailingOptionText || ''}\n`;
            if (mailingOption === '現住所') {
                comment += `現住所の場合郵便番号(〒・ハイフン無し)：${(currentPostalCode || '').replace(/-/g, '')}\n`;
                comment += `住所・物件名・部屋番号：${currentAddress || ''}\n`;
            }
            comment += `案内料金：${serviceFee || ''}\n`;
            let paymentInfo = paymentMethod;
            if (paymentMethod === '口座' && bankName) {
                paymentInfo = `口座（銀行名：${bankName}）※外国人は口座NG`;
            } else if (paymentMethod === '口座') {
                paymentInfo = `口座 ※外国人は口座NG`;
            }
            comment += `支払方法：${paymentInfo || ''}\n`;
            comment += `クロスパス無線ルーター：${crossPathRouter || ''}\n`;
            comment += `備考：${remarks || ''}\n`;
            if (housingType === 'ファミリー') {
              comment += "\nファミリータイプはオーナー確認①②③必須！\n";
              comment += "図面提出ある場合は④を「有」にして⑤を記載\n\n";
              comment += "管理会社情報\n";
              comment += `①管理会社名：${managementCompany || ''}\n`;
              comment += `②管理連絡先：${managementContact || ''}\n`;
              comment += `③担当者名：${contactPerson || ''}\n`;
              comment += `④ビル調査希望：${buildingSurveyRequest || '無'}\n`;
              comment += `⑤図面提出方法と送付先：${drawingSubmissionContact || '無'}\n`;
            }
            setGeneratedComment(comment);
            return;
        }

        if (isAir) {
            const header = '〓SB Air〓250808';
            let comment = `${header}\n`;
            comment += `タイプ：${housingType || ''}\n`;
            comment += `AP名：${apName || ''}\n`;
            comment += `顧客ID：${customerId || ''}\n`;
            comment += `名乗り（SMS届くので正確に）：${greeting || ''}\n`;
            comment += `契約者名義（漢字）：${contractorName || ''}\n`;
            comment += `契約者名義（フリガナ）：${contractorNameKana || ''}\n`;
            comment += `性別：${gender || ''}\n`;
            comment += `生年月日(西暦)：${formatDateToYYYYMMDD(dob) || ''}\n`;
            comment += `電話番号(ハイフンあり)：${formatPhoneNumber(phone) || ''}\n`;
            comment += `➤設置先\n`;
            comment += `郵便番号(〒・ハイフン無し)：${(postalCode || '').replace(/-/g, '')}\n`;
            comment += `住所：${address || ''}\n`;
            comment += `物件名＋部屋番号：${buildingInfo || ''}\n`;
            comment += `入居予定日：${formatDateToYYYYMMDD(moveInDate) || ''}\n`;
            let mailingOptionText = mailingOption;
            if (mailingOption === '新居') {
                mailingOptionText = '新居(設置先と同じ)';
            }
            comment += `■書面発送先：${mailingOptionText || ''}\n`;
            if (mailingOption === '現住所') {
                comment += `現住所の場合郵便番号(〒・ハイフン無し)：${(currentPostalCode || '').replace(/-/g, '')}\n`;
                comment += `住所・物件名・部屋番号：${currentAddress || ''}\n`;
            }
            comment += `案内料金：${serviceFee || ''}\n`;
            comment += `ＣＰ：${campaign || ''}\n`;
            let existingLineInfo = existingLineStatus;
            if (existingLineStatus === 'あり' && existingLineCompany) {
                existingLineInfo = `あり（回線会社：${existingLineCompany}）`;
            }
            comment += `既存回線：${existingLineInfo || ''}\n`;
            comment += `携帯キャリア：${mobileCarrier || ''}\n`;
            comment += `備考：${remarks || ''}\n`;
            setGeneratedComment(comment);
            return;
        }
        
        const isFamily = housingType.includes('ファミリー');
        const header = is10G ? '〓SoftBank光10ギガ〓250808' : `〓${product}〓250808`;
        let comment = `${header}\n`;
        comment += `タイプ：${housingType || ''}\n`;
        comment += `AP名：${apName || ''}\n`;
        comment += `顧客ID：${customerId || ''}\n`;
        comment += `名乗り（SMS届くので正確に）：${greeting || ''}\n`;
        comment += `ラック：${rackType || ''}\n`;
        comment += `契約者名義（漢字）：${contractorName || ''}\n`;
        comment += `契約者名義（フリガナ）：${contractorNameKana || ''}\n`;
        comment += `性別：${gender || ''}\n`;
        comment += `生年月日(西暦)：${formatDateToYYYYMMDD(dob) || ''}\n`;
        comment += `電話番号(ハイフンあり)：${formatPhoneNumber(phone) || ''}\n`;
        comment += `➤設置先\n`;
        comment += `郵便番号(〒・ハイフン無し)：${(postalCode || '').replace(/-/g, '')}\n`;
        comment += `住所：${address || ''}\n`;
        comment += `物件名＋部屋番号：${buildingInfo || ''}\n`;
        comment += `入居予定日：${formatDateToYYYYMMDD(moveInDate) || ''}\n`;
        let mailingOptionText = mailingOption;
        if (mailingOption === '新居') {
            mailingOptionText = '新居(設置先と同じ)';
        }
        comment += `■書面発送先：${mailingOptionText || ''}\n`;
        if (mailingOption === '現住所') {
          comment += `現住所の場合郵便番号(〒・ハイフン無し)：${(currentPostalCode || '').replace(/-/g, '')}\n`;
          comment += `住所・物件名・部屋番号：${currentAddress || ''}\n`;
        }
        comment += is10G 
          ? `案内料金：3カ月0円→6930円\n`
          : `案内料金：${serviceFee || ''}\n`;
        comment += is10G
          ? `ＣＰ：${campaign === '10ギガめちゃトク割+あんしん乗り換え' ? '10ギガめちゃトク割／＋あんしん乗り換え' : campaign || ''}\n`
          : `ＣＰ：${campaign || ''}\n`;
        comment += `開通前レンタル：${preActivationRental || ''}\n`;
        let existingLineInfo = existingLineStatus;
        if (existingLineStatus === 'あり' && existingLineCompany) {
          existingLineInfo = `あり（回線会社：${existingLineCompany}）`;
        }
        comment += `既存回線：${existingLineInfo || ''}\n`;
        comment += `携帯キャリア：${mobileCarrier || ''}\n`;
        comment += is10G
          ? `おうち割：${homeDiscount === 'あり▲インポート注意!!!▲' ? 'あり▲インポート注意!!!▲' : '無し'}\n`
          : `おうち割：${homeDiscount || ''}\n`;
        if (!is10G) {
          comment += `無線ルーター購入：${wifiRouter || ''}\n`;
        }
        comment += `備考：${remarks || ''}\n`;
        if (isFamily) {
          comment += "\nオーナー情報\n";
          comment += `・管理会社：${managementCompany || ''}\n`;
          comment += `・管理番号：${formData.managementNumber || ''}\n`;
          comment += `・担当者：${contactPerson || ''}\n`;
          if (noDrilling) {
            comment += `穴あけ・ビス止めNG\n`;
          }
        }
        setGeneratedComment(comment);
    }, [formData]);

    const generateElectricityComment = useCallback(() => {
        const comment = generateElectricityCommentLogic(formData);
        setGeneratedComment(comment);
    }, [formData]);

    const generateGasComment = useCallback(() => {
        const comment = generateGasCommentLogic(formData);
        setGeneratedComment(comment);
    }, [formData]);
    
    const generateWtsComment = useCallback(() => {
        const comment = generateWtsCommentLogic(formData);
        setGeneratedComment(comment);
    }, [formData]);

    useEffect(() => {
        if (activeTab === 'internet') {
            generateInternetComment();
        } else if (activeTab === 'electricity') {
            generateElectricityComment();
        } else if (activeTab === 'gas') {
            generateGasComment();
        } else if (activeTab === 'wts') {
            generateWtsComment();
        } else {
            setGeneratedComment('');
        }
    }, [formData, activeTab, generateInternetComment, generateElectricityComment, generateGasComment, generateWtsComment]);

    const isElecGasSetSelected = useMemo(() => {
      const { elecProvider, isGasSet } = formData;
      const elecSetProviders = ['ニチガス電気セット', '東京ガス電気セット', '東邦ガスセット', '大阪ガス電気セット'];
      if (elecSetProviders.includes(elecProvider)) return true;
      if (elecProvider === 'すまいのでんき（ストエネ）' && isGasSet === 'セット') return true;
      return false;
    }, [formData.elecProvider, formData.isGasSet]);

    const validateAndCopy = useCallback(() => {
        let requiredFields = [];

        // Email validation helper
        const checkEmailIfNeeded = (needsEmail: boolean) => {
            if (needsEmail) {
                requiredFields.push('email');
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (formData.email && !emailRegex.test(formData.email)) {
                    setToast({ message: '有効なメールアドレス形式ではありません。', type: 'error' });
                    setInvalidFields(prev => [...prev, 'email']);
                    return false; // validation failed
                }
            }
            return true; // validation passed or not needed
        };

        if (activeTab === 'internet') {
            const isChintai = formData.product === '賃貸ねっと';
            const isChintaiFree = formData.product === '賃貸ねっと【無料施策】';
            const isAir = formData.product === 'SB Air';
            const is10G = formData.product === 'SoftBank光10G';

            if (!formData.isSakaiRoute) {
                requiredFields.push('customerId');
            }

            if (isChintai || isChintaiFree) {
                if(!checkEmailIfNeeded(true)) return;
            }

            if (isChintai) {
                requiredFields.push(
                    'housingType', 'apName', 'greeting', 'existingLineStatus',
                    'rackType', 'contractorName', 'contractorNameKana', 'dob', 'phone',
                    'postalCode', 'address', 'buildingInfo', 'moveInDate', 'mailingOption',
                    'serviceFee', 'paymentMethod', 'crossPathRouter'
                );
                if (formData.paymentMethod === '口座') requiredFields.push('bankName');
                if (formData.housingType === 'ファミリー') requiredFields.push('managementCompany', 'managementContact', 'contactPerson');
            } else if (isChintaiFree) {
                 requiredFields.push(
                    'housingType', 'apName', 'greeting', 'rackType', 'contractorName',
                    'contractorNameKana', 'dob', 'phone', 'postalCode', 'address', 'buildingInfo', 'moveInDate',
                    'mailingOption', 'serviceFee', 'paymentMethod', 'crossPathRouter'
                );
                if (formData.paymentMethod === '口座') requiredFields.push('bankName');
            } else {
                const baseRequiredFields = [
                    'housingType', 'apName', 'greeting', 'contractorName',
                    'contractorNameKana', 'gender', 'dob', 'phone', 'postalCode',
                    'address', 'buildingInfo', 'moveInDate', 'mailingOption',
                    'campaign', 'existingLineStatus', 'mobileCarrier',
                ];
                let specificRequiredFields = [];
                if (is10G) {
                    specificRequiredFields = ['rackType', 'preActivationRental', 'homeDiscount'];
                } else if (!isAir) {
                    specificRequiredFields = ['rackType', 'preActivationRental', 'homeDiscount', 'wifiRouter', 'serviceFee'];
                }
                requiredFields.push(...baseRequiredFields, ...specificRequiredFields);
            }
            if (formData.mailingOption === '現住所') requiredFields.push('currentPostalCode', 'currentAddress');
            if (!isChintaiFree && formData.existingLineStatus === 'あり') requiredFields.push('existingLineCompany');
        
        } else if (activeTab === 'electricity') {
            const commonFields = ['apName', 'contractorName', 'contractorNameKana', 'dob', 'phone', 'postalCode', 'address', 'buildingInfo', 'moveInDate'];
            requiredFields = ['elecProvider', ...commonFields];
            if (!formData.isSakaiRoute) requiredFields.push('recordId');

            if (isElecGasSetSelected) {
              requiredFields.push('gasOpeningDate', 'gasOpeningTimeSlot');
              if (formData.elecProvider === 'ニチガス電気セット') {
                requiredFields.push('gasArea', 'gasWitness', 'gasPreContact');
              }
            }
            
            const needsEmail = ['キューエネスでんき', 'HTBエナジー', 'ユーパワー UPOWER', 'ループでんき'].includes(formData.elecProvider);
            if (!checkEmailIfNeeded(needsEmail)) return;

            if (formData.elecProvider === '東京ガス電気セット' || formData.elecProvider === '東邦ガスセット') {
                requiredFields.push('currentAddress');
            }
             if (formData.mailingOption === '現住所' && ['すまいのでんき（ストエネ）', 'プラチナでんき（ジャパン）', 'キューエネスでんき', 'ニチガス電気セット', '東邦ガスセット', '大阪ガス電気セット'].includes(formData.elecProvider)) {
                 requiredFields.push('currentPostalCode', 'currentAddress');
            }

        } else if (activeTab === 'gas') {
            const commonFields = ['apName', 'contractorName', 'contractorNameKana', 'dob', 'phone', 'postalCode', 'address', 'buildingInfo', 'moveInDate'];
            requiredFields = ['gasProvider', ...commonFields];
            if (!formData.isSakaiRoute) requiredFields.push('recordId');
            
            const needsEmail = formData.gasProvider === '東急ガス';
            if (!checkEmailIfNeeded(needsEmail)) return;

            if(formData.gasProvider === '東急ガス' || formData.gasProvider === '東邦ガス単品') {
                requiredFields.push('currentAddress');
            }
            if (formData.mailingOption === '現住所' && ['すまいのでんき（ストエネ）', 'ニチガス単品', '大阪ガス単品'].includes(formData.gasProvider)) {
                 requiredFields.push('currentPostalCode', 'currentAddress');
            }
        } else if (activeTab === 'wts') {
            const { wtsCustomerType } = formData;
            requiredFields = [
                'apName', 'contractorName', 'dob', 'phone', 'wtsShippingDestination',
                'wtsServerColor', 'wtsFiveYearPlan', 'wtsFreeWater', 'wtsCreditCard', 'wtsCarrier',
                'moveInDate', 'wtsWaterPurifier', 'wtsMultipleUnits'
            ];

            if (!formData.isSakaiRoute) requiredFields.push('customerId');

            if(wtsCustomerType === 'U-20') {
                requiredFields.push('wtsU20HighSchool', 'wtsU20ParentalConsent');
            }
             if(wtsCustomerType === '法人') {
                requiredFields.push('wtsCorporateInvoice');
            }
        }


        const missingFields = requiredFields.filter(field => !formData[field]);
        setInvalidFields(missingFields);
        
        if (missingFields.length > 0) {
            setToast({ message: '未入力の必須項目があります。', type: 'error' });
            document.querySelector('.border-red-500, .text-red-600')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        if (!generatedComment.trim() || generatedComment.includes("該当するテンプレートがありません。")) {
            setToast({ message: '条件に合うコメントがありません。入力を確認してください。', type: 'error' });
            return;
        }

        navigator.clipboard.writeText(generatedComment).then(() => {
            setToast({ message: 'コピーしました！15分後にフォームがリセットされます。', type: 'success' });
            
            if (['internet', 'wts'].includes(activeTab)) {
                setFormData(prev => ({...prev, primaryProductStatus: 'あり'}));
            }

            if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
            resetTimerRef.current = window.setTimeout(() => {
                resetForm('15分経過したためフォームをリセットしました。');
            }, 15 * 60 * 1000);
        }, () => {
            setToast({ message: 'コピーに失敗しました。', type: 'error' });
        });
    }, [formData, generatedComment, resetForm, activeTab, isElecGasSetSelected]);
  
    const checkMansionRoomNumber = useCallback(() => {
        const isInternetTab = activeTab === 'internet';
        const isChintai = formData.product === '賃貸ねっと' || formData.product === '賃貸ねっと【無料施策】';
        if (!isInternetTab || isChintai) {
            validateAndCopy();
            return;
        }

        const isMansion = formData.housingType.includes('マンション');
        if (isMansion && formData.buildingInfo && !/\d/.test(formData.buildingInfo)) {
            setModalState({
                isOpen: true,
                title: '入力内容の確認',
                message: '「物件名＋部屋番号」に部屋番号と思われる数字が含まれていません。このままコピーしてよろしいですか？',
                onConfirm: () => { setModalState(p => ({ ...p, isOpen: false })); validateAndCopy(); },
                onCancel: () => {
                    setInvalidFields(p => [...new Set([...p, 'buildingInfo'])]);
                    (document.querySelector('[name="buildingInfo"]') as HTMLElement)?.focus();
                    setModalState(p => ({ ...p, isOpen: false }));
                },
                confirmText: 'はい、コピーする',
                cancelText: '修正する',
                type: 'warning',
            });
        } else {
            validateAndCopy();
        }
    }, [formData, validateAndCopy, activeTab]);

  const checkMailingAddress = useCallback(() => {
    if (
        formData.mailingOption === '現住所' &&
        formData.address?.trim() &&
        formData.currentAddress?.trim() &&
        formData.address.trim() === formData.currentAddress.trim()
    ) {
        setModalState({
            isOpen: true,
            title: '発送先の確認',
            message: '「書面発送先」が現住所に設定されていますが、設置先と同じ住所が入力されています。このままでよろしいですか？',
            onConfirm: () => { setModalState(prev => ({ ...prev, isOpen: false })); checkMansionRoomNumber(); },
            onCancel: () => { setModalState(prev => ({ ...prev, isOpen: false })); },
            confirmText: 'はい',
            cancelText: '修正する',
            type: 'warning',
        });
    } else {
        checkMansionRoomNumber();
    }
  }, [formData, checkMansionRoomNumber]);

  const checkAddressNumber = useCallback((nextCheck) => {
    if (formData.address && !/\d/.test(formData.address)) {
        setModalState({
            isOpen: true,
            title: '入力内容の確認',
            message: '住所に丁目・番地が含まれていないようです。このままでよろしいですか？',
            onConfirm: () => { setModalState(p => ({ ...p, isOpen: false })); nextCheck(); },
            onCancel: () => {
                setInvalidFields(p => [...new Set([...p, 'address'])]);
                (document.querySelector('[name="address"]') as HTMLElement)?.focus();
                setModalState(p => ({ ...p, isOpen: false }));
            },
            confirmText: 'このままにする',
            cancelText: '修正する',
            type: 'warning',
        });
    } else {
        nextCheck();
    }
  }, [formData.address]);

  const checkCurrentAddressNumber = useCallback(() => {
    const nextCheck = () => checkAddressNumber(checkMailingAddress);
    if (formData.mailingOption === '現住所' && formData.currentAddress && !/\d/.test(formData.currentAddress)) {
        setModalState({
            isOpen: true,
            title: '入力内容の確認',
            message: '現住所に丁目・番地が含まれていないようです。このままでよろしいですか？',
            onConfirm: () => { setModalState(p => ({ ...p, isOpen: false })); nextCheck(); },
            onCancel: () => {
                setInvalidFields(p => [...new Set([...p, 'currentAddress'])]);
                (document.querySelector('[name="currentAddress"]') as HTMLElement)?.focus();
                setModalState(p => ({ ...p, isOpen: false }));
            },
            confirmText: 'このままにする',
            cancelText: '修正する',
            type: 'warning',
        });
    } else {
        nextCheck();
    }
  }, [formData.mailingOption, formData.currentAddress, checkAddressNumber, checkMailingAddress]);
  
  const checkFurigana = useCallback(() => {
    const katakanaRegex = /^[ァ-ヶー\s　]*$/;
    const nextCheck = activeTab === 'internet' ? checkCurrentAddressNumber : () => checkAddressNumber(validateAndCopy);
    if (formData.contractorNameKana && !katakanaRegex.test(formData.contractorNameKana)) {
        setModalState({
            isOpen: true,
            title: 'フリガナの確認',
            message: '契約者名義（フリガナ）にカタカナ以外の文字が含まれているようです。このままコピーしますか？',
            onConfirm: () => { setModalState(p => ({ ...p, isOpen: false })); nextCheck(); },
            onCancel: () => {
                setInvalidFields(p => [...new Set([...p, 'contractorNameKana'])]);
                (document.querySelector('[name="contractorNameKana"]') as HTMLElement)?.focus();
                setModalState(p => ({ ...p, isOpen: false }));
            },
            confirmText: 'はい、コピーする',
            cancelText: '修正する',
            type: 'warning',
        });
    } else {
        nextCheck();
    }
  }, [formData.contractorNameKana, checkCurrentAddressNumber, activeTab, validateAndCopy, checkAddressNumber]);

  const startCopyProcess = useCallback(() => {
    checkFurigana();
  }, [checkFurigana]);

  const showResetConfirmationModal = useCallback(() => {
    setModalState({
      isOpen: true,
      title: 'フォームのリセット確認',
      message: '本当に入力内容をすべてリセットしますか？\n「担当者/AP名」「サカイ販路」以外の情報はすべて消去されます。',
      onConfirm: () => {
        resetForm('フォームをリセットしました。');
        closeModal();
      },
      onCancel: closeModal,
      confirmText: 'はい、リセットする',
      cancelText: 'キャンセル',
      type: 'danger',
    });
  }, [resetForm]);
  
  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    
    if (formData.isSakaiRoute) {
        if (tabId === 'electricity') {
            setFormData(prev => ({...prev, elecRecordIdPrefix: 'サカイ', gasRecordIdPrefix: ''}));
        } else if (tabId === 'gas') {
            setFormData(prev => ({...prev, gasRecordIdPrefix: 'サカイ', elecRecordIdPrefix: ''}));
        } else {
            setFormData(prev => ({...prev, elecRecordIdPrefix: '', gasRecordIdPrefix: ''}));
        }
    }

    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
      setToast({ message: '作業を継続したため、自動リセットタイマーを解除しました。', type: 'info' });
    }
  }, [formData.isSakaiRoute]);

  const handleBugReportSubmit = useCallback(async () => {
    if (!formData.apName) {
        setToast({ message: '報告するには「担当者/AP名」を入力してください。', type: 'error' });
        return;
    }
    if (!bugReportText.trim()) {
        setToast({ message: '報告内容を入力してください。', type: 'error' });
        setIsBugReportTextInvalid(true);
        return;
    }

    if (BUG_REPORT_SCRIPT_URL.includes('YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE')) {
        setToast({ message: '管理者：報告用URLが設定されていません。', type: 'error' });
        return;
    }

    setIsSubmittingReport(true);
    try {
        const payload = {
            apName: formData.apName,
            reportText: bugReportText,
            currentFormData: JSON.stringify(formData, null, 2),
        };

        const response = await fetch(BUG_REPORT_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Apps Script requires no-cors for simple requests if not configured otherwise
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        // no-cors means we can't read the response, but we can assume success if no network error
        setToast({ message: '報告を送信しました。ご協力ありがとうございます！', type: 'success' });
        setIsBugReportOpen(false);
        setBugReportText('');
        setIsBugReportTextInvalid(false);

    } catch (error) {
        console.error('Bug report submission error:', error);
        setToast({ message: '報告の送信に失敗しました。ネットワーク接続を確認してください。', type: 'error' });
    } finally {
        setIsSubmittingReport(false);
    }
}, [formData, bugReportText]);


  const commonProps = {
    formData,
    setFormData,
    handleInputChange,
    handleDateBlur,
    handleNameBlur,
    invalidFields,
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header onManualOpen={() => setIsManualOpen(true)} />
        <Modal {...modalState} />
        <ManualModal isOpen={isManualOpen} onClose={() => setIsManualOpen(false)} />
        <BugReportModal 
            isOpen={isBugReportOpen}
            onClose={() => {
                setIsBugReportOpen(false);
                setIsBugReportTextInvalid(false);
            }}
            reportText={bugReportText}
            onReportTextChange={(e) => {
                setBugReportText(e.target.value);
                setIsBugReportTextInvalid(false);
            }}
            onSubmit={handleBugReportSubmit}
            isSubmitting={isSubmittingReport}
            isInvalid={isBugReportTextInvalid}
        />
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        
        <main className="w-full max-w-7xl mx-auto p-4 md:p-8 flex-grow">
            <div className="flex justify-between items-center pb-4">
                <h2 className="text-2xl font-bold text-gray-700">情報入力フォーム</h2>
            </div>
            
            <div className="bg-white p-4 rounded-t-2xl shadow-lg grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 items-center border-b border-gray-200">
                <FormInput
                    label="担当者/AP名"
                    name="apName"
                    value={formData.apName}
                    onChange={handleInputChange}
                    isInvalid={invalidFields.includes('apName')}
                    required
                    placeholder="入力内容はリセット後も保持されます"
                />
                 <FormCheckbox
                    label="サカイ販路"
                    name="isSakaiRoute"
                    checked={formData.isSakaiRoute}
                    onChange={handleInputChange}
                    isInvalid={invalidFields.includes('isSakaiRoute')}
                    description="チェックするとレコードID/顧客IDが不要になります"
                />
            </div>
            
             <div className="bg-white rounded-b-xl shadow-lg border-b border-gray-200 sticky top-[72px] z-10">
                <nav className="flex justify-around sm:justify-start sm:space-x-2 sm:px-4">
                    {TABS.map(tab => (
                        <Tab key={tab.id} {...tab} activeTab={activeTab} onTabChange={handleTabChange} />
                    ))}
                </nav>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                 <div className="bg-white p-6 rounded-b-2xl shadow-xl border border-t-0 border-gray-200 space-y-6">
                    {activeTab === 'internet' && <InternetTab {...commonProps} />}
                    {activeTab === 'electricity' && <ElectricityTab {...commonProps} isElecGasSetSelected={isElecGasSetSelected} />}
                    {activeTab === 'gas' && (
                        isElecGasSetSelected ? (
                            <div className="text-center py-8">
                                <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-yellow-400" />
                                <p className="mt-4 text-lg font-bold text-yellow-700">
                                    電気セットプランが選択されています
                                </p>
                                <p className="text-gray-600 mt-2">
                                    ガスに関する情報は「電気」タブで入力してください。
                                </p>
                            </div>
                        ) : (
                            <GasTab {...commonProps} />
                        )
                    )}
                    {activeTab === 'wts' && <WtsTab {...commonProps} />}
                 </div>
                <div className="sticky top-[198px] lg:top-[140px]">
                   <GeneratedComment
                        comment={generatedComment}
                        onCommentChange={setGeneratedComment}
                        onCopy={startCopyProcess}
                        onResetRequest={showResetConfirmationModal}
                    />
                </div>
            </div>
        </main>
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 mt-4 mb-4">
             <button
                onClick={() => setIsBugReportOpen(true)}
                className="w-full flex items-center justify-center gap-2 bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-md hover:shadow-lg"
            >
                <ChatBubbleBottomCenterTextIcon className="h-6 w-6" />
                <span>不具合・要望を報告</span>
            </button>
        </div>
        <footer className="text-center py-5 text-sm text-gray-500">
            タマシステム2025
        </footer>
    </div>
  );
};

export default App;