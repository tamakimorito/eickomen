
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { FormData, RadioOption } from './types';
import { 
    INITIAL_FORM_DATA, PRODUCTS, 
    HOUSING_TYPES_1G, HOUSING_TYPES_10G, HOUSING_TYPES_AIR, HOUSING_TYPES_CHINTAI, HOUSING_TYPES_CHINTAI_FREE,
    RACK_OPTIONS_1G, RACK_OPTIONS_10G, RACK_OPTIONS_CHINTAI_FREE_MANSION, RACK_OPTIONS_CHINTAI_FREE_10G,
    CAMPAIGNS_1G, CAMPAIGNS_10G_NEW, CAMPAIGNS_AIR_NEW,
    GENDERS, MAILING_OPTIONS, RENTAL_OPTIONS, 
    EXISTING_LINE_STATUS_OPTIONS, MOBILE_CARRIERS, 
    DISCOUNT_OPTIONS, DISCOUNT_OPTIONS_10G_NEW, ROUTER_OPTIONS,
    PAYMENT_METHOD_OPTIONS, CROSS_PATH_ROUTER_OPTIONS
} from './constants';
import { FormInput, FormSelect, FormRadioGroup, FormTextArea, FormDateInput } from './components/FormControls';
import GeneratedComment from './components/GeneratedComment';
import OwnerInfo from './components/OwnerInfo';
import Header from './components/Header';
import { Toast } from './components/Toast';
import { Modal } from './components/Modal';
import ManualModal from './components/ManualModal';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText: string;
  cancelText: string;
  type?: 'default' | 'warning';
}

const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [generatedComment, setGeneratedComment] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [invalidFields, setInvalidFields] = useState<string[]>([]);
  const resetTimerRef = useRef<number | null>(null);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => {},
    confirmText: 'OK',
    cancelText: 'キャンセル',
    type: 'default',
  });

  const productOptions = useMemo(() => PRODUCTS, []);

  const is10G = formData.product === 'SoftBank光10G';
  const isAir = formData.product === 'SB Air';
  const isChintai = formData.product === '賃貸ねっと';
  const isChintaiFree = formData.product === '賃貸ねっと【無料施策】';
  const is1G = !is10G && !isAir && !isChintai && !isChintaiFree;

  const housingTypeOptions = isAir ? HOUSING_TYPES_AIR : is10G ? HOUSING_TYPES_10G : isChintai ? HOUSING_TYPES_CHINTAI : isChintaiFree ? HOUSING_TYPES_CHINTAI_FREE : HOUSING_TYPES_1G;
  
  const currentRackOptions = useMemo(() => {
    // Special logic for 賃貸ねっと【無料施策】 should be handled first.
    if (isChintaiFree) {
        if (formData.housingType === 'マンション10G') return RACK_OPTIONS_CHINTAI_FREE_10G;
        if (formData.housingType === 'マンション') return RACK_OPTIONS_CHINTAI_FREE_MANSION;
        return [];
    }
    
    // Determine base options for other products
    let baseOptions: RadioOption[];
    if (isChintai) {
        baseOptions = formData.housingType === '10G' ? RACK_OPTIONS_10G : RACK_OPTIONS_1G;
    } else if (is10G) {
        baseOptions = RACK_OPTIONS_10G;
    } else if (is1G) {
        baseOptions = RACK_OPTIONS_1G;
    } else {
        // For SB Air or any other unhandled case, return empty
        return [];
    }

    // Apply filtering for Mansion/Family types
    const housingType = formData.housingType;
    const isMansionType = housingType.includes('マンション') || housingType === '10G';
    const isFamilyType = housingType.includes('ファミリー');
    
    if (isMansionType) {
        return baseOptions.filter(option => option.value !== '無し');
    }
    
    if (isFamilyType) {
        const noneOption = baseOptions.find(option => option.value === '無し');
        return noneOption ? [noneOption] : [];
    }

    // If it's not mansion or family (e.g., housingType is empty), return the full base options.
    return baseOptions;
  }, [isChintai, isChintaiFree, is10G, is1G, formData.housingType]);

  const campaignOptions = isAir ? CAMPAIGNS_AIR_NEW : is10G ? CAMPAIGNS_10G_NEW : CAMPAIGNS_1G;
  const discountOptions = is10G ? DISCOUNT_OPTIONS_10G_NEW : DISCOUNT_OPTIONS;


  const closeModal = () => setModalState(prev => ({ ...prev, isOpen: false }));

  const showConfirmationModal = useCallback((title: string, message: string, onCancelAction: () => void) => {
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

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, type } = e.target;
    
    setInvalidFields(prev => prev.filter(item => item !== name));

    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        let { value } = e.target;
        if (name === 'apName') {
            value = value.replace(/\s/g, '');
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, []);

    const handleDateBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (!value) return;

        let processedValue = value;

        if (name === 'moveInDate') {
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
                    setFormData(prev => ({...prev, moveInDate: processedValue}));
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
        } else if (name === 'moveInDate') {
            const fiveYearsAgo = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate());

            if (date < fiveYearsAgo) {
                 showConfirmationModal(
                    '日付の確認',
                    '入居予定日が5年以上前の日付に設定されています。よろしいですか？',
                    () => { setFormData(prev => ({ ...prev, moveInDate: '' })); }
                );
            }
        }
    }, [showConfirmationModal]);

    const handleNameBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
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

  useEffect(() => {
    setFormData(prev => ({
        ...prev,
        housingType: '',
        rackType: '',
        campaign: '',
        serviceFee: '',
        homeDiscount: '',
        crossPathRouter: '',
    }));
  }, [formData.product]);
  
  useEffect(() => {
    // When housingType changes, the rack options might change.
    // If the currently selected rackType is no longer in the list of valid options, reset it.
    if (formData.rackType && !currentRackOptions.some(opt => opt.value === formData.rackType)) {
        setFormData(prev => ({ ...prev, rackType: '' }));
    }
  }, [formData.housingType, currentRackOptions, formData.rackType]);

  useEffect(() => {
    if (is10G) {
        setFormData(prev => ({ ...prev, serviceFee: '3カ月0円→6930円' }));
    } else if (isAir) {
        setFormData(prev => ({ ...prev, serviceFee: '3カ月1485円、2年4950円、3年以降5368円' }));
    } else if (isChintai) {
        let updates: Partial<FormData> = {};
        switch (formData.housingType) {
            case 'マンション':
                updates = { serviceFee: '3960' };
                break;
            case 'ファミリー':
                updates = { serviceFee: '5060' };
                break;
            case '10G':
                updates = { serviceFee: '6160', crossPathRouter: '10Gレンタル' };
                break;
            default:
                updates = { serviceFee: '', crossPathRouter: '' };
                break;
        }
        if (formData.housingType !== '10G' && formData.crossPathRouter === '10Gレンタル') {
            updates.crossPathRouter = '';
        }
        setFormData(prev => ({...prev, ...updates}));
    } else if (isChintaiFree) {
        let updates: Partial<FormData> = {};
        switch (formData.housingType) {
            case 'マンション':
                updates = { serviceFee: '初月無料→3960', crossPathRouter: '無料施策プレゼント' };
                if (formData.rackType === '光配線クロス') {
                    updates.rackType = '';
                }
                break;
            case 'マンション10G':
                updates = { serviceFee: '初月無料→6160', crossPathRouter: '10Gレンタル', rackType: '光配線クロス' };
                break;
            default:
                 updates = { serviceFee: '', crossPathRouter: '', rackType: '' };
                 break;
        }
        setFormData(prev => ({...prev, ...updates}));
    } else { // 1G
        if (formData.housingType === 'マンション') {
            setFormData(prev => ({ ...prev, serviceFee: '4180' }));
        } else if (formData.housingType === 'ファミリー') {
            setFormData(prev => ({ ...prev, serviceFee: '5720' }));
        } else {
            setFormData(prev => ({ ...prev, serviceFee: '' }));
        }
    }
  }, [formData.product, formData.housingType, is10G, isAir, isChintai, isChintaiFree]);

  const resetForm = useCallback((message?: string) => {
    if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
        resetTimerRef.current = null;
    }
    const currentProduct = formData.product;
    setFormData({...INITIAL_FORM_DATA, product: currentProduct});
    setGeneratedComment('');
    setInvalidFields([]);
    if (message) {
      setToast({ message, type: 'success' });
    }
  }, [formData.product]);

  useEffect(() => {
    return () => {
        if (resetTimerRef.current) {
            clearTimeout(resetTimerRef.current);
        }
    };
  }, []);
  
  useEffect(() => {
    const formatPhoneNumber = (phone: string): string => {
        const digits = phone.replace(/\D/g, '');
        if (digits.length === 11) {
            return `${digits.substring(0, 3)}-${digits.substring(3, 7)}-${digits.substring(7)}`;
        }
        if (digits.length === 10) {
            return `${digits.substring(0, 3)}-${digits.substring(3, 6)}-${digits.substring(6)}`;
        }
        return phone;
    };

    const formatDateToYYYYMMDD = (dateStr: string): string => {
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
      
    const generateComment = () => {
      const {
        product, customerId, housingType, apName, greeting,
        rackType, contractorName, contractorNameKana, gender, dob, phone,
        postalCode, address, buildingInfo, moveInDate, mailingOption,
        currentPostalCode, currentAddress, serviceFee, campaign, preActivationRental,
        existingLineStatus, existingLineCompany, mobileCarrier, homeDiscount, wifiRouter, remarks,
        managementCompany, managementContact, contactPerson, noDrilling,
        email, paymentMethod, bankName, crossPathRouter, buildingSurveyRequest, drawingSubmissionContact
      } = formData;

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
    };

    generateComment();
  }, [formData, is10G, isAir, isChintai, isChintaiFree]);

  const validateAndCopy = useCallback(() => {
    let requiredFields: string[] = [];
    
    if (isChintai) {
        requiredFields = [
            'housingType', 'apName', 'customerId', 'greeting', 'existingLineStatus',
            'rackType', 'email', 'contractorName', 'contractorNameKana', 'dob', 'phone',
            'postalCode', 'address', 'buildingInfo', 'moveInDate', 'mailingOption',
            'serviceFee', 'paymentMethod', 'crossPathRouter'
        ];
        if (formData.paymentMethod === '口座' && !formData.bankName) {
            requiredFields.push('bankName');
        }
        if (formData.housingType === 'ファミリー') {
            if (!formData.managementCompany) requiredFields.push('managementCompany');
            if (!formData.managementContact) requiredFields.push('managementContact');
            if (!formData.contactPerson) requiredFields.push('contactPerson');
        }
    } else if (isChintaiFree) {
        requiredFields = [
            'housingType', 'apName', 'customerId', 'greeting', 'rackType', 'email', 'contractorName',
            'contractorNameKana', 'dob', 'phone', 'postalCode', 'address', 'buildingInfo', 'moveInDate',
            'mailingOption', 'serviceFee', 'paymentMethod', 'crossPathRouter'
        ];
        if (formData.paymentMethod === '口座' && !formData.bankName) {
            requiredFields.push('bankName');
        }
    } else {
        const baseRequiredFields = [
            'housingType', 'apName', 'customerId', 'greeting', 'contractorName',
            'contractorNameKana', 'gender', 'dob', 'phone', 'postalCode',
            'address', 'buildingInfo', 'moveInDate', 'mailingOption',
            'campaign', 'existingLineStatus', 'mobileCarrier',
        ];

        let specificRequiredFields: string[] = [];
        if (isAir) {
          // No specific fields needed
        } else if (is10G) {
            specificRequiredFields = ['rackType', 'preActivationRental', 'homeDiscount'];
        } else { // 1G
            specificRequiredFields = ['rackType', 'preActivationRental', 'homeDiscount', 'wifiRouter', 'serviceFee'];
        }
        requiredFields = [...baseRequiredFields, ...specificRequiredFields];
    }
    
    const missingFields = requiredFields.filter(field => !formData[field as keyof FormData]);
    
    if (formData.mailingOption === '現住所') {
        if (!formData.currentPostalCode) missingFields.push('currentPostalCode');
        if (!formData.currentAddress) missingFields.push('currentAddress');
    }

    if (!isChintaiFree && formData.existingLineStatus === 'あり') {
        if (!formData.existingLineCompany) missingFields.push('existingLineCompany');
    }

    setInvalidFields(missingFields);
    
    if (missingFields.length > 0) {
        setToast({ message: '未入力の必須項目があります。', type: 'error' });
        document.querySelector('.border-red-500, .text-red-600')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    navigator.clipboard.writeText(generatedComment).then(() => {
        setToast({ message: 'コピーしました！10分後にフォームがリセットされます。', type: 'success' });
        if (resetTimerRef.current) {
            clearTimeout(resetTimerRef.current);
        }
        resetTimerRef.current = window.setTimeout(() => {
            resetForm('10分経過したためフォームをリセットしました。');
        }, 10 * 60 * 1000); // 10 minutes
    }, () => {
        setToast({ message: 'コピーに失敗しました。', type: 'error' });
    });
  }, [formData, generatedComment, resetForm, is10G, isAir, isChintai, isChintaiFree]);
  
  const checkMansionRoomNumber = useCallback(() => {
    if (isChintai || isChintaiFree) { // Skip this check for Chintai products
        validateAndCopy();
        return;
    }
    const isMansion = formData.housingType.includes('マンション');
    if (isMansion && formData.buildingInfo && !/\d/.test(formData.buildingInfo)) {
        setModalState({
            isOpen: true,
            title: '入力内容の確認',
            message: '「物件名＋部屋番号」に部屋番号と思われる数字が含まれていません。このままコピーしてよろしいですか？',
            onConfirm: () => { setModalState(prev => ({ ...prev, isOpen: false })); validateAndCopy(); },
            onCancel: () => {
                setInvalidFields(prev => [...new Set([...prev, 'buildingInfo'])]);
                (document.querySelector('[name="buildingInfo"]') as HTMLElement)?.focus();
                setModalState(prev => ({ ...prev, isOpen: false }));
            },
            confirmText: 'はい、コピーする',
            cancelText: '修正する',
            type: 'warning',
        });
    } else {
        validateAndCopy();
    }
  }, [formData, validateAndCopy, isChintai, isChintaiFree]);

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

  const checkAddressNumber = useCallback(() => {
    if (
        formData.address &&
        !/\d/.test(formData.address)
    ) {
        setModalState({
            isOpen: true,
            title: '入力内容の確認',
            message: '住所に丁目・番地が含まれていないようです。このままでよろしいですか？',
            onConfirm: () => {
                setModalState(prev => ({ ...prev, isOpen: false }));
                checkMailingAddress();
            },
            onCancel: () => {
                setInvalidFields(prev => [...new Set([...prev, 'address'])]);
                (document.querySelector('[name="address"]') as HTMLElement)?.focus();
                setModalState(prev => ({ ...prev, isOpen: false }));
            },
            confirmText: 'このままにする',
            cancelText: '修正する',
            type: 'warning',
        });
    } else {
        checkMailingAddress();
    }
  }, [formData, checkMailingAddress]);

  const checkCurrentAddressNumber = useCallback(() => {
    if (
        formData.mailingOption === '現住所' &&
        formData.currentAddress &&
        !/\d/.test(formData.currentAddress)
    ) {
        setModalState({
            isOpen: true,
            title: '入力内容の確認',
            message: '現住所に丁目・番地が含まれていないようです。このままでよろしいですか？',
            onConfirm: () => {
                setModalState(prev => ({ ...prev, isOpen: false }));
                checkAddressNumber();
            },
            onCancel: () => {
                setInvalidFields(prev => [...new Set([...prev, 'currentAddress'])]);
                (document.querySelector('[name="currentAddress"]') as HTMLElement)?.focus();
                setModalState(prev => ({ ...prev, isOpen: false }));
            },
            confirmText: 'このままにする',
            cancelText: '修正する',
            type: 'warning',
        });
    } else {
        checkAddressNumber();
    }
  }, [formData, checkAddressNumber]);

  const checkFurigana = useCallback(() => {
    const katakanaRegex = /^[ァ-ヶー\s　]*$/;
    if (formData.contractorNameKana && !katakanaRegex.test(formData.contractorNameKana)) {
        setModalState({
            isOpen: true,
            title: 'フリガナの確認',
            message: '契約者名義（フリガナ）にカタカナ以外の文字が含まれているようです。このままコピーしますか？',
            onConfirm: () => { setModalState(prev => ({ ...prev, isOpen: false })); checkCurrentAddressNumber(); },
            onCancel: () => {
                setInvalidFields(prev => [...new Set([...prev, 'contractorNameKana'])]);
                (document.querySelector('[name="contractorNameKana"]') as HTMLElement)?.focus();
                setModalState(prev => ({ ...prev, isOpen: false }));
            },
            confirmText: 'はい、コピーする',
            cancelText: '修正する',
            type: 'warning',
        });
    } else {
        checkCurrentAddressNumber();
    }
  }, [formData, checkCurrentAddressNumber]);

  const startCopyProcess = useCallback(() => {
    checkFurigana();
  }, [checkFurigana]);


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header onManualOpen={() => setIsManualOpen(true)} />
        <Modal {...modalState} />
        <ManualModal isOpen={isManualOpen} onClose={() => setIsManualOpen(false)} />
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        
        <main className="w-full max-w-7xl mx-auto p-4 md:p-8 flex-grow">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 space-y-6">
                    <div className="flex justify-between items-center border-b-2 border-dashed border-gray-200 pb-4">
                        <h2 className="text-2xl font-bold text-gray-700">情報入力フォーム</h2>
                        <button 
                          onClick={() => resetForm('フォームをリセットしました。')}
                          className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-700 transition-colors"
                          aria-label="フォームをリセット"
                        >
                            <ArrowPathIcon className="h-5 w-5" />
                            <span>リセット</span>
                        </button>
                    </div>

                    <FormRadioGroup
                        label="商材"
                        name="product"
                        value={formData.product}
                        onChange={handleInputChange}
                        options={productOptions}
                        isInvalid={invalidFields.includes('product')}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormSelect
                            label="タイプ"
                            name="housingType"
                            value={formData.housingType}
                            onChange={handleInputChange}
                            options={housingTypeOptions}
                            isInvalid={invalidFields.includes('housingType')}
                            required
                        />
                         {(!isAir) && (
                            <FormSelect
                                label="ラック"
                                name="rackType"
                                value={formData.rackType}
                                onChange={handleInputChange}
                                options={currentRackOptions}
                                isInvalid={invalidFields.includes('rackType')}
                                required
                                disabled={isChintaiFree && formData.housingType === 'マンション10G'}
                            />
                         )}
                        <FormInput
                            label="AP名"
                            name="apName"
                            value={formData.apName}
                            onChange={handleInputChange}
                            isInvalid={invalidFields.includes('apName')}
                            required
                        />
                        <FormInput
                            label="顧客ID"
                            name="customerId"
                            value={formData.customerId}
                            onChange={handleInputChange}
                            isInvalid={invalidFields.includes('customerId')}
                            required
                        />
                        <FormInput
                            label={(isChintai || isChintaiFree) ? "名乗り" : "名乗り（SMS届くので正確に）"}
                            name="greeting"
                            value={formData.greeting}
                            onChange={handleInputChange}
                            className="md:col-span-2"
                            isInvalid={invalidFields.includes('greeting')}
                            required
                        />
                    </div>
                    
                    <div className="border-t-2 border-dashed border-blue-300 pt-6 space-y-4">
                        <h3 className="text-lg font-bold text-blue-700">契約者情報</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput
                                label="契約者名義（漢字）"
                                name="contractorName"
                                value={formData.contractorName}
                                onChange={handleInputChange}
                                onBlur={handleNameBlur}
                                isInvalid={invalidFields.includes('contractorName')}
                                required
                            />
                            <FormInput
                                label="契約者名義（フリガナ）"
                                name="contractorNameKana"
                                value={formData.contractorNameKana}
                                onChange={handleInputChange}
                                onBlur={handleNameBlur}
                                isInvalid={invalidFields.includes('contractorNameKana')}
                                required
                            />
                            {(!isChintai && !isChintaiFree) &&
                            <FormSelect
                                label="性別"
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                options={GENDERS}
                                isInvalid={invalidFields.includes('gender')}
                                required
                            />
                            }
                            <FormInput
                                label="生年月日（西暦）"
                                name="dob"
                                type="text"
                                value={formData.dob}
                                onChange={handleInputChange}
                                onBlur={handleDateBlur}
                                placeholder="例: 1990/01/01"
                                isInvalid={invalidFields.includes('dob')}
                                required
                            />
                            <FormInput
                                label="電話番号"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                isInvalid={invalidFields.includes('phone')}
                                required
                            />
                            {(isChintai || isChintaiFree) && (
                                <FormInput
                                    label="メアド"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    isInvalid={invalidFields.includes('email')}
                                    required
                                />
                            )}
                        </div>
                    </div>

                    <div className="border-t-2 border-dashed border-blue-300 pt-6 space-y-4">
                        <h3 className="text-lg font-bold text-blue-700">設置先情報</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput
                                label="郵便番号"
                                name="postalCode"
                                value={formData.postalCode}
                                onChange={handleInputChange}
                                isInvalid={invalidFields.includes('postalCode')}
                                className="md:col-span-2"
                                required
                            />
                            <FormInput
                                label="住所"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                className="md:col-span-2"
                                isInvalid={invalidFields.includes('address')}
                                required
                            />
                             <FormInput
                                label="物件名＋部屋番号"
                                name="buildingInfo"
                                value={formData.buildingInfo}
                                onChange={handleInputChange}
                                className="md:col-span-2"
                                placeholder="例: 〇〇マンション101号室"
                                isInvalid={invalidFields.includes('buildingInfo')}
                                required
                            />
                             <FormDateInput
                                label={(isChintai || isChintaiFree) ? "利用開始日(必ず引っ越し日を記載)" : "入居予定日"}
                                name="moveInDate"
                                type="text"
                                value={formData.moveInDate}
                                onChange={handleInputChange}
                                onBlur={handleDateBlur}
                                placeholder="例: 2024/08/01 または 8/1"
                                isInvalid={invalidFields.includes('moveInDate')}
                                className="md:col-span-2"
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="border-t-2 border-dashed border-blue-300 pt-6 space-y-4">
                        <h3 className="text-lg font-bold text-blue-700">その他詳細</h3>
                         <FormRadioGroup
                            label="書面発送先"
                            name="mailingOption"
                            value={formData.mailingOption}
                            onChange={handleInputChange}
                            options={MAILING_OPTIONS}
                            isInvalid={invalidFields.includes('mailingOption')}
                        />
                        {formData.mailingOption === '現住所' && (
                            <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput
                                    label="現住所の郵便番号"
                                    name="currentPostalCode"
                                    value={formData.currentPostalCode}
                                    onChange={handleInputChange}
                                    isInvalid={invalidFields.includes('currentPostalCode')}
                                    required
                                />
                                <FormInput
                                    label="現住所・物件名・部屋番号"
                                    name="currentAddress"
                                    value={formData.currentAddress}
                                    onChange={handleInputChange}
                                    className="md:col-span-2"
                                    isInvalid={invalidFields.includes('currentAddress')}
                                    required
                                />
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {(!isChintai && !isChintaiFree) &&
                            <FormInput
                                label="案内料金"
                                name="serviceFee"
                                value={formData.serviceFee}
                                onChange={handleInputChange}
                                isInvalid={invalidFields.includes('serviceFee')}
                                disabled={is10G || isAir}
                                required
                            />
                           }
                           {(isChintai || isChintaiFree) &&
                             <FormInput
                                label="案内料金"
                                name="serviceFee"
                                value={formData.serviceFee}
                                onChange={handleInputChange}
                                isInvalid={invalidFields.includes('serviceFee')}
                                disabled={true}
                                required
                            />
                           }
                            {(!isChintai && !isChintaiFree) &&
                                <FormSelect
                                    label="CP"
                                    name="campaign"
                                    value={formData.campaign}
                                    onChange={handleInputChange}
                                    options={campaignOptions}
                                    isInvalid={invalidFields.includes('campaign')}
                                    required
                                />
                            }
                            {isChintai && (
                                <>
                                     <FormSelect
                                        label="支払方法"
                                        name="paymentMethod"
                                        value={formData.paymentMethod}
                                        onChange={handleInputChange}
                                        options={PAYMENT_METHOD_OPTIONS}
                                        isInvalid={invalidFields.includes('paymentMethod')}
                                        required
                                    />
                                    {formData.paymentMethod === '口座' && (
                                        <FormInput
                                            label="銀行名"
                                            name="bankName"
                                            value={formData.bankName}
                                            onChange={handleInputChange}
                                            isInvalid={invalidFields.includes('bankName')}
                                            required
                                        />
                                    )}
                                    {formData.housingType === '10G' ? (
                                        <FormInput
                                            label="クロスパス無線ルーター"
                                            name="crossPathRouter"
                                            value={formData.crossPathRouter}
                                            onChange={handleInputChange}
                                            isInvalid={invalidFields.includes('crossPathRouter')}
                                            className="md:col-span-2"
                                            disabled
                                            required
                                        />
                                    ) : (
                                        <FormSelect
                                            label="クロスパス無線ルーター"
                                            name="crossPathRouter"
                                            value={formData.crossPathRouter}
                                            onChange={handleInputChange}
                                            options={CROSS_PATH_ROUTER_OPTIONS}
                                            isInvalid={invalidFields.includes('crossPathRouter')}
                                            className="md:col-span-2"
                                            required
                                        />
                                    )}
                                </>
                            )}
                            {isChintaiFree && (
                                <>
                                     <FormSelect
                                        label="支払方法"
                                        name="paymentMethod"
                                        value={formData.paymentMethod}
                                        onChange={handleInputChange}
                                        options={PAYMENT_METHOD_OPTIONS}
                                        isInvalid={invalidFields.includes('paymentMethod')}
                                        required
                                    />
                                    {formData.paymentMethod === '口座' && (
                                        <FormInput
                                            label="銀行名"
                                            name="bankName"
                                            value={formData.bankName}
                                            onChange={handleInputChange}
                                            isInvalid={invalidFields.includes('bankName')}
                                            required
                                        />
                                    )}
                                    <FormInput
                                        label="クロスパス無線ルーター"
                                        name="crossPathRouter"
                                        value={formData.crossPathRouter}
                                        onChange={handleInputChange}
                                        isInvalid={invalidFields.includes('crossPathRouter')}
                                        className="md:col-span-2"
                                        disabled
                                        required
                                    />
                                </>
                            )}
                            {!isAir && !isChintai && !isChintaiFree && (
                                <FormSelect
                                    label="開通前レンタル"
                                    name="preActivationRental"
                                    value={formData.preActivationRental}
                                    onChange={handleInputChange}
                                    options={RENTAL_OPTIONS}
                                    isInvalid={invalidFields.includes('preActivationRental')}
                                    required
                                />
                            )}
                           { !isChintaiFree &&
                               <FormSelect
                                    label={isChintai ? "ゼニガメ" : "既存回線"}
                                    name="existingLineStatus"
                                    value={formData.existingLineStatus}
                                    onChange={handleInputChange}
                                    options={EXISTING_LINE_STATUS_OPTIONS}
                                    isInvalid={invalidFields.includes('existingLineStatus')}
                                    required
                                />
                           }
                             { !isChintaiFree && formData.existingLineStatus === 'あり' && (
                                <FormInput
                                    label={isChintai ? "現状回線" : "回線会社"}
                                    name="existingLineCompany"
                                    value={formData.existingLineCompany}
                                    onChange={handleInputChange}
                                    isInvalid={invalidFields.includes('existingLineCompany')}
                                    required
                                />
                            )}
                            {(!isChintai && !isChintaiFree) &&
                             <FormSelect
                                label="携帯キャリア"
                                name="mobileCarrier"
                                value={formData.mobileCarrier}
                                onChange={handleInputChange}
                                options={MOBILE_CARRIERS}
                                isInvalid={invalidFields.includes('mobileCarrier')}
                                required
                            />
                            }
                            {!isAir && !isChintai && !isChintaiFree && (
                                <FormSelect
                                    label="おうち割"
                                    name="homeDiscount"
                                    value={formData.homeDiscount}
                                    onChange={handleInputChange}
                                    options={discountOptions}
                                    isInvalid={invalidFields.includes('homeDiscount')}
                                    required
                                />
                            )}
                            {!is10G && !isAir && !isChintai && !isChintaiFree && (
                                <FormSelect
                                    label="無線ルーター購入"
                                    name="wifiRouter"
                                    value={formData.wifiRouter}
                                    onChange={handleInputChange}
                                    options={ROUTER_OPTIONS}
                                    isInvalid={invalidFields.includes('wifiRouter')}
                                    required
                                />
                            )}
                        </div>
                         <FormTextArea
                            label="備考"
                            name="remarks"
                            value={formData.remarks}
                            onChange={handleInputChange}
                            rows={3}
                        />
                    </div>
                    
                     {((!isAir && !isChintai && !isChintaiFree && formData.housingType.includes('ファミリー')) || (isChintai && formData.housingType === 'ファミリー')) && (
                        <OwnerInfo 
                            formData={formData} 
                            onChange={handleInputChange} 
                            invalidFields={invalidFields}
                            isChintai={isChintai}
                        />
                    )}

                </div>
                <div className="sticky top-[88px]">
                   <GeneratedComment
                        comment={generatedComment}
                        onCommentChange={setGeneratedComment}
                        onCopy={startCopyProcess}
                    />
                </div>
            </div>
        </main>
        <footer className="text-center py-5 text-sm text-gray-500">
            タマシステム2025
        </footer>
    </div>
  );
};

export default App;
