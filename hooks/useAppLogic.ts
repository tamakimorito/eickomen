import { useState, useCallback, useRef, useEffect } from 'react';
import { BUG_REPORT_SCRIPT_URL } from '../constants.ts';
import { generateElectricityCommentLogic } from '../commentLogic/electricity.ts';
import { generateGasCommentLogic } from '../commentLogic/gas.ts';
import { generateInternetCommentLogic } from '../commentLogic/internet.ts';
import { generateWtsCommentLogic } from '../commentLogic/wts.ts';
import { generateAgencyCommentLogic } from '../commentLogic/agency.ts';

const FIELD_LABELS = {
    apName: '担当者/AP名', customerId: '顧客ID', recordId: 'レコードID', greeting: '名乗り',
    contractorName: '契約者名義（漢字）', contractorNameKana: '契約者名義（フリガナ）', gender: '性別',
    dob: '生年月日', phone: '電話番号', email: 'メアド', postalCode: '郵便番号', address: '住所',
    buildingInfo: '物件名＋部屋番号', moveInDate: '利用開始日/入居予定日', mailingOption: '書面発送先',
    currentPostalCode: '現住所の郵便番号', currentAddress: '現住所・物件名・部屋番号',
    existingLineStatus: '既存回線', existingLineCompany: '回線会社', mobileCarrier: '携帯キャリア',
    homeDiscount: 'おうち割', remarks: '備考',
    elecRemarks: '備考', gasRemarks: '備考', internetRemarks: '備考', wtsRemarks: '備考',
    paymentMethod: '支払方法',
    // Internet
    product: '商材', housingType: 'タイプ', rackType: 'ラック', serviceFee: '案内料金', campaign: 'CP',
    preActivationRental: '開通前レンタル', wifiRouter: '無線ルーター購入', bankName: '銀行名',
    crossPathRouter: 'クロスパス無線ルーター', managementCompany: '管理会社名', managementContact: '管理連絡先',
    contactPerson: '担当者名', 
    gmoConstructionSplit: '工事費分割案内', gmoCompensation: 'GMO解約違約金補填', gmoRouter: '無線LANルーター案内',
    gmoIsDocomoOwnerSame: 'ドコモ名義人申込者同一', gmoDocomoOwnerName: 'ドコモ名義人',
    gmoDocomoOwnerPhone: 'ドコモ名義人電話番号', gmoNoPairIdType: '身分証', 
    gmoCallback1: '第一希望 時間', gmoCallback2: '第二希望 時間', gmoCallback3: '第三希望 時間',
    gmoCallbackDate1: '第一希望 日付', gmoCallbackDate2: '第二希望 日付', gmoCallbackDate3: '第三希望 日付',
    gmoTokutokuPlan: 'プラン', gmoTokutokuCampaign: 'CP',
    auContactType: '連絡先種別',
    auPlanProvider: '案内プラン/プロバイダ',
    fletsRegion: 'エリア', fletsPlan: 'プラン', fletsHasFixedPhone: '固定電話',
    // Elec/Gas
    elecProvider: '電気商材', gasProvider: 'ガス商材', isAllElectric: 'オール電化', isVacancy: '空室',
    hasContractConfirmation: '契約確認は必要ですか？', isGasSet: 'ガスセット', primaryProductStatus: '主商材受注状況',
    attachedOption: '付帯OP', isNewConstruction: '新築', gasOpeningDate: 'ガス開栓日',
    gasOpeningTimeSlot: 'ガス立会時間枠', gasArea: 'ガスエリア', gasWitness: '立会者',
    gasPreContact: 'ガス事前連絡先', gasIsCorporate: '法人契約', elecConfirmationTime: '契確時間',
    qenesIsCorporate: '法人契約', contactPersonName: '対応者（漢字）', contactPersonNameKana: '対応者（フリガナ）',
    // WTS
    wtsCustomerType: '顧客タイプ', wtsShippingDestination: '発送先', wtsShippingPostalCode: '発送先郵便番号',
    wtsShippingAddress: '発送先住所', wtsServerType: 'サーバー', wtsServerColor: 'サーバー色',
    wtsFiveYearPlan: '契約年数', wtsFreeWater: '無料水', wtsCreditCard: 'クレカ', wtsCarrier: 'キャリア',
    wtsMailingAddress: '書面送付先', wtsWaterPurifier: '浄水器確認', wtsMultipleUnits: '複数台提案',
    wtsU20HighSchool: '高校生ヒアリング', wtsU20ParentalConsent: '親相談OKか',
    wtsCorporateInvoice: '請求書先', wtsEmail: 'メアド',
    mailingBuildingInfo: '現住所の物件名＋部屋番号',
    // Agency
    agencyId: 'ID', agencyContractorName: '契約者名義', agencyMoveDate: '引っ越し予定日', agencyNewAddress: '引っ越し先住所',
    agencyRequests: '代行希望', agencyElectricCompanyName: '電力会社名', agencyElectricStartDate: '電気利用開始日',
    agencyGasCompanyName: 'ガス会社名', agencyGasStartDate: 'ガス開栓日', agencyGasStartTime: 'ガス開栓時間',
    agencyWaterStartDate: '水道利用開始日', agencyOilCompanyName: '灯油会社名', agencyOilStartDate: '灯油利用開始日',
    agencyOilStartTime: '灯油開栓時間', agencyOilPaymentMethod: '灯油支払い方法',
};


const getRequiredFields = (formData, activeTab) => {
    let required = ['apName'];
    const { product, isSakaiRoute } = formData;

    switch (activeTab) {
        case 'internet':
            required.push('product');
            if (product === 'GMOドコモ光') {
                 required.push(
                    'housingType', 'customerId', 'gmoCompensation', 'gmoRouter', 'greeting', 
                    'contractorName', 'phone', 'existingLineCompany', 'gmoCallback1', 'gmoCallback2', 'gmoCallback3',
                    'gmoCallbackDate1', 'gmoCallbackDate2', 'gmoCallbackDate3'
                );
                 if (formData.housingType.includes('ペアなし')) {
                    required.push('gmoNoPairIdType', 'mobileCarrier', 'paymentMethod');
                } else {
                    if (!formData.gmoIsDocomoOwnerSame) {
                        required.push('gmoDocomoOwnerName', 'gmoDocomoOwnerPhone');
                    }
                }
            } else if (product === 'GMOとくとく光') {
                 required.push(
                    'customerId', 'gmoTokutokuPlan', 'contractorName', 'dob', 'moveInDate', 'mailingOption', 'buildingInfo',
                    'serviceFee', 'gmoTokutokuCampaign', 'existingLineStatus', 'email', 'paymentMethod'
                 );
                 if (formData.mailingOption === '現住所') required.push('currentPostalCode', 'currentAddress');
                 if (formData.existingLineStatus === 'あり') required.push('existingLineCompany');

            } else if (product === 'AUひかり') {
                required.push(
                    'recordId', 'greeting', 'contractorName', 'existingLineCompany', 'postalCode', 'address',
                    'phone', 'auContactType', 'auPlanProvider', 'serviceFee'
                );
            } else if (product === 'フレッツ光トス') {
                 required.push('greeting', 'customerId', 'fletsRegion', 'fletsPlan', 'fletsHasFixedPhone', 'postConfirmationTime', 'contractorName', 'contractorNameKana', 'phone');
                const companyKeywords = ['株式会社', '有限会社', '合同会社', '会社'];
                const contractorIsCompany = companyKeywords.some(kw => (formData.contractorName || '').includes(kw) || (formData.contractorNameKana || '').includes(kw));
                if (contractorIsCompany) {
                    required.push('contactPersonName');
                }
            } else if (product.includes('SoftBank') || product.includes('賃貸ねっと')) {
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
            }
            break;

        case 'electricity': {
            const { elecProvider, recordId, hasContractConfirmation, mailingOption, isSakaiRoute, isGasSet } = formData;
            required.push('elecProvider', 'greeting', 'contractorName', 'contractorNameKana', 'dob', 'phone', 'postalCode', 'address', 'buildingInfo', 'moveInDate');
            
            if (elecProvider !== '東京ガス電気セット' && !['すまいのでんき（ストエネ）', 'プラチナでんき（ジャパン）'].includes(elecProvider)) {
                required.push('paymentMethod');
            }
            if (!isSakaiRoute) required.push('recordId');
            
            const isSuteneOrPlatinum = ['すまいのでんき（ストエネ）', 'プラチナでんき（ジャパン）'].includes(elecProvider);
            const isQenes = elecProvider === 'キューエネスでんき';
            const isRemix = elecProvider === 'リミックスでんき';
            const isQenesItanji = isQenes && recordId?.toLowerCase().startsWith('id:');

            if (isSuteneOrPlatinum) {
                required.push('hasContractConfirmation');
                if (hasContractConfirmation === 'なし') {
                    required.push('gender', 'attachedOption');
                }
            }
            
            if (hasContractConfirmation === 'あり') {
                required.push('elecConfirmationTime');
            }
            
            if (hasContractConfirmation !== 'なし' && !isQenesItanji && !isRemix && elecProvider !== 'ニチガス電気セット') {
                required.push('primaryProductStatus');
            }

            if (isRemix || isQenesItanji) {
                required.push('attachedOption');
            }
            
            if (['キューエネスでんき', 'ユーパワー UPOWER', 'HTBエナジー', 'リミックスでんき', 'ループでんき', '東急でんき'].includes(elecProvider)) {
                required.push('email');
            }
             if ((['すまいのでんき（ストエネ）', '東急でんき'].includes(elecProvider) && isGasSet === 'セット') || ['ニチガス電気セット', '東邦ガスセット', '東京ガス電気セット', '大阪ガス電気セット'].includes(elecProvider)) {
                required.push('gasOpeningDate', 'gasOpeningTimeSlot');
            }
             if (mailingOption === '現住所' && ['リミックスでんき', '東京ガス電気セット', '東邦ガスセット', 'ニチガス電気セット'].includes(elecProvider)) {
                required.push('currentPostalCode', 'currentAddress');
            }
             if (elecProvider === '東急でんき' && (isGasSet === 'セット' || mailingOption === '現住所')) {
                required.push('currentPostalCode', 'currentAddress');
             }
             if (elecProvider === '東急でんき') {
                required.push('primaryProductStatus');
             }
            if (elecProvider === 'リミックスでんき' || (elecProvider === '東急でんき' && isGasSet !== 'セット')) {
                required.push('mailingOption');
            }
            if (['ニチガス電気セット'].includes(elecProvider)) {
                required.push('gasArea', 'gasWitness', 'gasPreContact');
                if (mailingOption === '現住所') {
                    required.push('mailingBuildingInfo');
                }
            }
             if (elecProvider === '東邦ガスセット' && formData.gasIsCorporate) {
                required.push('gasWitness', 'gasPreContact');
            }
            if (['東邦ガスセット', '東京ガス電気セット'].includes(elecProvider)) {
                required.push('currentAddress');
            }
            if (formData.qenesIsCorporate) {
                required.push('contactPersonName', 'contactPersonNameKana');
            }
            break;
        }

        case 'gas': {
            const { gasProvider, gasHasContractConfirmation } = formData;
            required.push('gasProvider', 'contractorName', 'contractorNameKana', 'dob', 'phone', 'postalCode', 'address', 'buildingInfo', 'gasOpeningDate');
            
            if (!isSakaiRoute) required.push('recordId');

            if (gasProvider === '大阪ガス単品') {
                required.push('greeting');
            } else if (![ '東京ガス単品' ].includes(gasProvider)) {
                required.push('greeting');
            }
             if (gasProvider !== '東京ガス単品' && gasProvider !== '大阪ガス単品') {
                required.push('paymentMethod');
            }
            if (gasProvider === '東急ガス') {
                required.push('email', 'elecConfirmationTime', 'primaryProductStatus');
            }
            
             if(['すまいのでんき（ストエネ）', '東京ガス単品', '東邦ガス単品', '東急ガス', 'ニチガス単品', '大阪ガス単品'].includes(gasProvider)) {
                 required.push('gasOpeningTimeSlot');
             }
             if(gasProvider === 'ニチガス単品') {
                required.push('gasWitness', 'gasPreContact', 'gasArea');
                if (formData.mailingOption === '現住所') {
                    required.push('currentPostalCode', 'currentAddress', 'mailingBuildingInfo');
                }
             }
             if((gasProvider === '東京ガス単品' || gasProvider === '東邦ガス単品') && formData.gasIsCorporate) {
                required.push('gasWitness', 'gasPreContact');
             }
             if(formData.mailingOption === '現住所' && ['すまいのでんき（ストエネ）', '東邦ガス単品', '東急ガス', '大阪ガス単品'].includes(gasProvider)){
                required.push('currentPostalCode', 'currentAddress');
             }
             if(['東邦ガス単品', '東急ガス'].includes(gasProvider)){
                 required.push('currentAddress');
             }
             if (gasProvider === 'すまいのでんき（ストエネ）' && gasHasContractConfirmation === 'あり') {
                required.push('elecConfirmationTime');
             }
            break;
        }
            
        case 'wts':
            required.push('wtsCustomerType', 'contractorName', 'dob', 'phone', 'wtsShippingDestination', 'wtsServerType', 'wtsServerColor', 'wtsFiveYearPlan', 'wtsFreeWater', 'wtsCreditCard', 'wtsCarrier', 'wtsMailingAddress', 'wtsWaterPurifier', 'wtsMultipleUnits');
            if (!formData.wtsMoveInAlready) {
                required.push('moveInDate');
            }
            if (!isSakaiRoute) required.push('customerId');
            if (formData.wtsCustomerType === 'U-20') required.push('wtsU20HighSchool', 'wtsU20ParentalConsent');
            if (formData.wtsCustomerType === '法人') required.push('wtsCorporateInvoice');
            if (formData.wtsShippingDestination === 'その他') required.push('wtsShippingPostalCode', 'wtsShippingAddress');
            break;

        case 'agency': {
            required.push('agencyId', 'agencyContractorName', 'agencyMoveDate', 'agencyNewAddress');
            const hasRequestedService = formData.agencyRequestElectricity || formData.agencyRequestGas || formData.agencyRequestWater || formData.agencyRequestOil;
            if (!hasRequestedService) {
                required.push('agencyRequests');
            }
            if (formData.agencyRequestElectricity) {
                required.push('agencyElectricCompanyName', 'agencyElectricStartDate');
            }
            if (formData.agencyRequestGas) {
                required.push('agencyGasCompanyName', 'agencyGasStartDate', 'agencyGasStartTime');
            }
            if (formData.agencyRequestWater) {
                required.push('agencyWaterStartDate');
            }
            if (formData.agencyRequestOil) {
                required.push('agencyOilCompanyName', 'agencyOilStartDate', 'agencyOilStartTime', 'agencyOilPaymentMethod');
            }
            break;
        }
    }

    const missingFields = required.filter(field => {
        const value = formData[field];
        if (typeof value === 'boolean') return false; // booleans are always "filled"
        return !value;
    });
    
    const missingLabels = missingFields.map(field => FIELD_LABELS[field] || field);
    
    return { missingFields, missingLabels };
};

const effectiveLen = (str: string | undefined | null): number => {
    if (!str) return 0;
    return str.replace(/[\s\u3000]/g, '').length;
};

const normalizePartialDateToFuture = (raw: string): string => {
  if (!raw) return raw;
  const m = raw.match(/^\s*(\d{1,2})\/(\d{1,2})\s*$/);
  if (!m) return raw;
  const mm = parseInt(m[1], 10);
  const dd = parseInt(m[2], 10);
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return raw;

  const today = new Date();
  const y = today.getFullYear();
  const candidate = new Date(y, mm - 1, dd);
  
  if (candidate < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
    candidate.setFullYear(y + 1);
  }
  const yyyy = candidate.getFullYear();
  const MM = String(candidate.getMonth() + 1).padStart(2, '0');
  const DD = String(candidate.getDate()).padStart(2, '0');
  return `${yyyy}/${MM}/${DD}`;
};


export const useAppLogic = ({ formData, dispatch, resetForm, setInvalidFields }) => {
    const [activeTab, setActiveTab] = useState('electricity');
    const [generatedComment, setGeneratedComment] = useState('');
    const [toast, setToast] = useState(null);
    const resetTimerRef = useRef(null);
    const [isManualOpen, setIsManualOpen] = useState(false);
    const [isBugReportOpen, setIsBugReportOpen] = useState(false);
    const clearedInternetGreetingForIdRef = useRef<string | null>(null);
    
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
                case 'agency': newComment = generateAgencyCommentLogic(formData); break;
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

    // 名乗り（Greeting）の自動設定ロジック
    const { recordId, greeting, isSakaiRoute } = formData;
    const previousRecordIdRef = useRef(recordId);

    useEffect(() => {
        const previousRecordId = previousRecordIdRef.current;
        if (isSakaiRoute || recordId === previousRecordId) {
            previousRecordIdRef.current = recordId;
            return;
        }

        let newGreeting; // undefined means no change
        const autoGreetings = ['すまえる', 'ばっちり賃貸入居サポートセンター', 'レプリス株式会社'];
        
        // Logic for setting greeting based on new recordId
        if (recordId.toLowerCase().startsWith('id:')) {
            if (activeTab === 'electricity' || activeTab === 'gas') newGreeting = 'すまえる';
        } else if (recordId.startsWith('L')) {
            newGreeting = 'ばっちり賃貸入居サポートセンター';
        } else if (/^S\d/.test(recordId)) {
            if (activeTab === 'electricity' || activeTab === 'gas') newGreeting = 'レプリス株式会社';
        } else if (recordId.startsWith('SR') || recordId.startsWith('STJP:')) {
            if (autoGreetings.includes(greeting)) newGreeting = '';
        }

        // Logic for clearing greeting when changing away from a pattern
        if (previousRecordId && previousRecordId.toLowerCase().startsWith('id:') && !recordId.toLowerCase().startsWith('id:')) {
            if (greeting === 'すまえる') newGreeting = '';
        }
        
        if (newGreeting !== undefined && newGreeting !== greeting) {
            dispatch({ type: 'UPDATE_FIELD', payload: { name: 'greeting', value: newGreeting } });
        }
        
        previousRecordIdRef.current = recordId;

    }, [recordId, greeting, activeTab, isSakaiRoute, dispatch]);

     // 東急でんき: 契確を「あり」に固定
    useEffect(() => {
        if (formData.elecProvider === '東急でんき' && formData.hasContractConfirmation !== 'あり') {
            dispatch({ type: 'UPDATE_FIELD', payload: { name: 'hasContractConfirmation', value: 'あり' } });
        }
    }, [formData.elecProvider, formData.hasContractConfirmation, dispatch]);

    // Tokyo Gas: check name length on provider change
    useEffect(() => {
        const isTokyoGasProduct = formData.elecProvider === '東京ガス電気セット' || formData.gasProvider === '東京ガス単品';
        if (!isTokyoGasProduct) return;
    
        const contractorNameLength = effectiveLen(formData.contractorName);
        const contractorNameKanaLength = effectiveLen(formData.contractorNameKana);
    
        if (contractorNameLength >= 9 || contractorNameKanaLength >= 9) {
            const invalidField = contractorNameLength >= 9 ? 'contractorName' : 'contractorNameKana';
            setInvalidFields(prev => [...new Set([...prev, invalidField])]);
            setModalState({
                isOpen: true,
                title: '契約者名義の確認',
                message: '契約者名義が9文字以上です。\n東京ガス受付では短縮表記が必要です。',
                confirmText: '修正する',
                cancelText: null, // No cancel button, blocking modal
                type: 'default',
                onConfirm: () => {
                    closeModal();
                    // Don't focus here as it's a provider change event
                },
                onCancel: closeModal,
                isErrorBanner: true,
                bannerMessage: '契約者名義が長すぎます。修正してください。'
            });
        }
    }, [formData.elecProvider, formData.gasProvider, formData.contractorName, formData.contractorNameKana, setModalState, setInvalidFields, closeModal]);
    
    const handlePostalCodeBlur = useCallback((fieldName: 'postalCode' | 'currentPostalCode' | 'wtsShippingPostalCode', value: string) => {
        if (!value) return;
        const digits = value.replace(/\D/g, '');
        if (digits.length > 0 && digits.length !== 7) {
            // FIX: Added missing isErrorBanner and bannerMessage properties to match the modal state type.
            setModalState({
                isOpen: true,
                title: '郵便番号の確認',
                message: '郵便番号が7桁ではありません。修正しますか？',
                confirmText: 'このまま進む', // "Continue as is"
                cancelText: '修正する',     // "Fix it"
                type: 'warning',
                onConfirm: () => { // "Continue as is" clicked
                    closeModal();
                },
                onCancel: () => { // "Fix it" clicked
                    dispatch({ type: 'UPDATE_FIELD', payload: { name: fieldName, value: '' } });
                    // Focusing is not directly possible here. The user will have to re-focus.
                    closeModal();
                },
                isErrorBanner: false,
                bannerMessage: '',
            });
        }
    }, [dispatch, setModalState, closeModal]);

    const handleDateBlurWithValidation = useCallback((e) => {
      const { name, value } = e.target;
       if (!value) return;

      let normalized = value;
      if (name === 'moveInDate' || name === 'gasOpeningDate') {
        normalized = normalizePartialDateToFuture(value);
        if (normalized !== value) {
          dispatch({ type: 'UPDATE_FIELD', payload: { name, value: normalized, type: 'text' }});
        }
      }

      const dateToCheck = new Date(normalized);
       if (!isNaN(dateToCheck.getTime()) && /^\d{4}\/\d{2}\/\d{2}$/.test(normalized)) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

           if (name === 'gasOpeningDate' && formData.elecProvider === 'すまいのでんき（ストエネ）' && formData.isGasSet === 'セット' && formData.address) {
                const KANSAI_PREFECTURES = ['大阪', '兵庫', '京都', '奈良', '滋賀', '和歌山'];
                const KANTO_PREFECTURES = ['東京', '神奈川', '千葉', '埼玉', '茨城', '栃木', '群馬', '山梨'];

                let region = '';
                if (KANSAI_PREFECTURES.some(pref => formData.address.includes(pref))) {
                    region = 'Kansai';
                } else if (KANTO_PREFECTURES.some(pref => formData.address.includes(pref))) {
                    region = 'Kanto';
                }

                if (region) {
                    const selectedDate = new Date(normalized);
                    selectedDate.setHours(0, 0, 0, 0);
                    let isBlocked = false;
                    
                    if (region === 'Kansai') {
                        const startDate = new Date(2025, 11, 28); // Month is 0-indexed
                        const endDate = new Date(2026, 0, 8);
                        if (selectedDate >= startDate && selectedDate <= endDate) isBlocked = true;
                    } else if (region === 'Kanto') {
                        const startDate = new Date(2025, 11, 28);
                        const endDate = new Date(2026, 0, 9);
                        if (selectedDate >= startDate && selectedDate <= endDate) isBlocked = true;
                    }

                    if (isBlocked) {
                        setModalState({
                            isOpen: true,
                            title: '入力エラー',
                            message: 'ガス開栓不可日程となります。再入力してください。',
                            confirmText: '修正する',
                            cancelText: null,
                            type: 'default',
                            onConfirm: () => {
                                dispatch({ type: 'UPDATE_FIELD', payload: { name: 'gasOpeningDate', value: '', type: 'text' }});
                                closeModal();
                            },
                            onCancel: closeModal,
                            isErrorBanner: false,
                            bannerMessage: '',
                        });
                        return; // Stop further validation
                    }
                }
            }


          if (name === 'moveInDate' || name === 'gasOpeningDate') {
            if (dateToCheck < today) {
                setModalState({
                    isOpen: true,
                    title: '日付を確認してください',
                    message: '入力された日付が過去日です。続行しますか？',
                    confirmText: '続行',
                    cancelText: '修正する',
                    type: 'warning',
                    onConfirm: closeModal,
                    onCancel: () => {
                        dispatch({ type: 'UPDATE_FIELD', payload: { name, value: '', type: 'text' }});
                        closeModal();
                    },
                    isErrorBanner: false,
                    bannerMessage: '',
                });
            }
          }
          
          if (name === 'dob') {
            if (dateToCheck > today) {
                setModalState({
                    isOpen: true,
                    title: '日付を確認してください',
                    message: '入力された日付が未来日です。続行しますか？',
                    confirmText: '続行',
                    cancelText: '修正する',
                    type: 'warning',
                    onConfirm: closeModal,
                    onCancel: () => {
                        dispatch({ type: 'UPDATE_FIELD', payload: { name, value: '', type: 'text' }});
                        closeModal();
                    },
                    isErrorBanner: false,
                    bannerMessage: '',
                });
            }
          }
      }

    }, [dispatch, setModalState, closeModal, formData.elecProvider, formData.isGasSet, formData.address]);

    const nameHasSpace = (s: string) => /\s|\u3000/.test(s?.trim() || '');
    const companyKeywords = ['株式会社', '有限会社', '合同会社', '会社'];
    const isCompanyName = (s: string) => companyKeywords.some(kw => (s || '').includes(kw));

    const openNameSpaceModal = (fieldName: 'contractorName'|'contractorNameKana') => {
      setInvalidFields(prev => Array.from(new Set([...prev, fieldName])));
      setModalState({
        isOpen: true,
        title: '入力の確認',
        message: '姓と名の間にスペースがありません。修正しますか？',
        confirmText: '修正する',
        cancelText: '続行',
        type: 'warning',
        onConfirm: () => { closeModal(); },
        onCancel: () => { setInvalidFields(prev => prev.filter(x => x !== fieldName)); closeModal(); },
        isErrorBanner: false, bannerMessage: ''
      });
    };
    
    const handleNameBlur = useCallback((e) => {
      const { value } = e.target;
      if (value && !nameHasSpace(value) && !isCompanyName(value)) {
          openNameSpaceModal('contractorName');
      }
    }, [setInvalidFields, setModalState, closeModal]);

    const handleKanaBlur = useCallback((e) => {
      const { value } = e.target;
      if (value && !nameHasSpace(value) && !isCompanyName(value)) {
          openNameSpaceModal('contractorNameKana');
      }
    }, [setInvalidFields, setModalState, closeModal]);

    const handleIdBlur = useCallback((e) => {
        const { name, value } = e.target;
        const fieldName = name === 'customerId' ? 'customerId' : 'recordId';

        if (value && !/[A-Za-z]/.test(value)) {
            // FIX: Added missing isErrorBanner and bannerMessage properties to match the modal state type, resolving a TypeScript error.
            setModalState({
                isOpen: true,
                title: 'レコードIDを確認してください',
                message: 'レコードIDに英字（A-Z）が含まれていません。続行しますか？',
                confirmText: '続行',
                cancelText: '修正する',
                type: 'warning',
                onConfirm: () => { // "続行" button
                    setInvalidFields(prev => prev.filter(f => f !== fieldName));
                    closeModal();
                },
                onCancel: () => { // "修正する" button
                    setInvalidFields(prev => [...new Set([...prev, fieldName])]);
                    closeModal();
                },
                isErrorBanner: false,
                bannerMessage: '',
            });
        } else {
             setInvalidFields(prev => prev.filter(f => f !== fieldName));
        }
    }, [setModalState, closeModal, setInvalidFields]);


    const handleCopy = useCallback(() => {
        const { missingFields, missingLabels } = getRequiredFields(formData, activeTab);

        if (missingFields.length > 0) {
            setInvalidFields(missingFields);
            setModalState({
                isOpen: true,
                title: '必須項目が未入力です',
                message: `以下の項目を入力してください：\n\n・${missingLabels.join('\n・')}`,
                onConfirm: closeModal,
                onCancel: closeModal, // Hides cancel button
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

        const performCopy = () => {
            const toHalfWidth = (str: string | null | undefined): string => {
                if (!str) return str || '';
                return str.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
            };
        
            const formDataForCopy = JSON.parse(JSON.stringify(formData));
            formDataForCopy.address = toHalfWidth(formDataForCopy.address);
            formDataForCopy.currentAddress = toHalfWidth(formDataForCopy.currentAddress);
            formDataForCopy.buildingInfo = toHalfWidth(formDataForCopy.buildingInfo);
            formDataForCopy.mailingBuildingInfo = toHalfWidth(formDataForCopy.mailingBuildingInfo);
            formDataForCopy.wtsShippingAddress = toHalfWidth(formDataForCopy.wtsShippingAddress);
        
            let commentToCopy = '';
            try {
                switch (activeTab) {
                    case 'electricity': commentToCopy = generateElectricityCommentLogic(formDataForCopy); break;
                    case 'gas': commentToCopy = generateGasCommentLogic(formDataForCopy); break;
                    case 'internet': commentToCopy = generateInternetCommentLogic(formDataForCopy); break;
                    case 'wts': commentToCopy = generateWtsCommentLogic(formDataForCopy); break;
                }
            } catch (error) {
                console.error("Error generating comment for copy:", error);
                commentToCopy = "コメントの生成中にエラーが発生しました。";
            }

            if (!commentToCopy) {
                setToast({ message: 'コメントが空です', type: 'error' });
                return;
            }
            navigator.clipboard.writeText(commentToCopy).then(() => {
                setToast({ message: 'コメントをコピーしました！', type: 'success' });

                // After copy, show reset confirmation modal
                setModalState({
                    isOpen: true,
                    title: 'フォームのリセット',
                    message: '無事にコピーは完了しました。リセットしますか？',
                    confirmText: 'はい、リセットする',
                    cancelText: 'いいえ、まだ続ける',
                    type: 'warning', // Makes 'cancel' (No) blue and 'confirm' (Yes) gray
                    onConfirm: () => { // "Yes" clicked
                        if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
                        resetForm(true);
                        setToast({ message: 'フォームをリセットしました', type: 'info' });
                        closeModal();
                    },
                    onCancel: () => { // "No" clicked
                        // Start 20-minute timer ONLY if user says no to immediate reset.
                        if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
                        resetTimerRef.current = setTimeout(() => {
                            resetForm(true);
                            setToast({ message: 'フォームが自動リセットされました。', type: 'info' });
                        }, 20 * 60 * 1000);
                        setToast({ message: '入力を継続します。20分後にフォームは自動リセットされます。', type: 'info' });
                        closeModal();
                    },
                    isErrorBanner: false,
                    bannerMessage: '',
                });

            }).catch(err => {
                setToast({ message: 'コピーに失敗しました', type: 'error' });
                console.error('Copy failed', err);
            });
        };
        
        if (
          activeTab === 'gas' &&
          formData.gasProvider === 'すまいのでんき（ストエネ）' &&
          formData.isGasSet !== 'セット' &&
          ((/^CC/i.test(formData.recordId || '')) || (/^No\./i.test(formData.recordId || '')))
        ) {
          setModalState({
            isOpen: true,
            title: '注意',
            message: '本来案内しないはずのすまいのガス単品が選択されてます、コピーしていいですか？',
            confirmText: '続行',
            cancelText: 'やめる',
            type: 'warning',
            onConfirm: () => { closeModal(); performCopy(); },
            onCancel: closeModal,
            isErrorBanner: false,
            bannerMessage: ''
          });
          return;
        }

        const isInternetAU = activeTab === 'internet' && formData.product === 'AUひかり';
        const isInternetGmoDocomo = activeTab === 'internet' && formData.product === 'GMOドコモ光';
        const isInternetFletsToss = activeTab === 'internet' && formData.product === 'フレッツ光トス';
        const needsBuildingInfo =
          (activeTab === 'electricity' || activeTab === 'gas') ||
          (activeTab === 'internet' && !isInternetAU && !isInternetGmoDocomo && !isInternetFletsToss);

        if (needsBuildingInfo && !formData.buildingInfo.trim()) {
            setModalState({
                isOpen: true,
                title: '入力エラー',
                message: '『物件名＋部屋番号』が空です。戸建ての場合はチェック、集合住宅は号室までご入力ください。',
                confirmText: 'OK',
                cancelText: null,
                type: 'warning',
                onConfirm: closeModal,
                onCancel: closeModal,
                isErrorBanner: true,
                bannerMessage: '物件名＋部屋番号が未入力です。'
            });
            return; // Stop copy
        }

        // --- Address Number Check for AU Hikari ---
        if (activeTab === 'internet' && formData.product === 'AUひかり' && formData.address && !/[0-9０-９]/.test(formData.address)) {
            setInvalidFields(['address']);
            setModalState({
                isOpen: true,
                title: '入力エラー',
                message: '「住所※物件名部屋番号まで全部」に番地などの数字が含まれていません。修正してください。',
                onConfirm: closeModal,
                onCancel: closeModal,
                confirmText: 'OK',
                cancelText: null,
                type: 'warning',
                isErrorBanner: true,
                bannerMessage: '住所に数字が含まれていません。'
            });
            return; // Stop copy
        }
        
        // --- Address Number Check ---
        if (formData.address && !/[0-9０-９]/.test(formData.address)) {
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
        if (formData.mailingOption === '現住所' && formData.currentAddress && !/[0-9０-９]/.test(formData.currentAddress)) {
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

        const { moveInDate, dob, gasOpeningDate, wtsMoveInAlready } = formData;
        const dateErrors = [];
        if (moveInDate) {
            const skipMoveInDateCheck = activeTab === 'wts' && wtsMoveInAlready;
            if (!skipMoveInDateCheck) {
                const moveIn = new Date(moveInDate);
                const today = new Date();
                moveIn.setHours(0, 0, 0, 0);
                today.setHours(0, 0, 0, 0);
                if (!isNaN(moveIn.getTime()) && moveIn < today) {
                    dateErrors.push('・利用開始日が過去の日付になっています。');
                }
            }
        }
        if (dob) {
            const birthDate = new Date(dob);
            const today = new Date();
            if (!isNaN(birthDate.getTime()) && birthDate > today) {
                dateErrors.push('・生年月日が未来の日付になっています。');
            }
        }
        if (gasOpeningDate) {
            const gasOpen = new Date(gasOpeningDate);
            const today = new Date();
            gasOpen.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);
            if (!isNaN(gasOpen.getTime()) && gasOpen < today) {
                dateErrors.push('・ガス開栓日が過去の日付になっています。');
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
                bannerMessage: '',
            });
        } else {
            performCopy();
        }
    }, [generatedComment, formData, activeTab, resetForm, closeModal, setInvalidFields, setToast]);

    const handleResetRequest = useCallback(() => {
        setModalState({
            isOpen: true,
            title: 'フォームのリセット確認',
            message: '入力内容をリセットしてもよろしいですか？（担当者名は保持されます）',
            confirmText: 'はい、リセットする',
            cancelText: 'キャンセル',
            type: 'danger',
            onConfirm: () => {
                resetForm(true);
                setToast({ message: 'フォームをリセットしました', type: 'info' });
                closeModal();
            },
            onCancel: closeModal,
            isErrorBanner: false,
            bannerMessage: '',
        });
    }, [resetForm, closeModal, setToast]);

    const onTabChange = useCallback((tabId) => {
        if (resetTimerRef.current) {
            clearTimeout(resetTimerRef.current);
            resetTimerRef.current = null;
            setToast({ message: '自動リセットがキャンセルされました', type: 'info' });
        }
        
        if (tabId === 'internet' && ['electricity', 'gas'].includes(activeTab)) {
            const rec = (formData.recordId || '').toLowerCase();
            const notClearedYet = clearedInternetGreetingForIdRef.current !== formData.recordId;
            if (rec.startsWith('id:') && formData.greeting === 'すまえる' && notClearedYet) {
                dispatch({ type: 'UPDATE_FIELD', payload: { name: 'greeting', value: '' } });
                clearedInternetGreetingForIdRef.current = formData.recordId || '';
            }
        }

        // Add address consolidation logic here
        if (['internet', 'wts'].includes(tabId) && ['electricity', 'gas'].includes(activeTab)) {
            const mailingOpt = (formData.mailingOption || '').trim();
            const base = (formData.currentAddress || '').trim();
            const extra = (formData.mailingBuildingInfo || '').trim();

            if (mailingOpt === '現住所' && extra) {
                const alreadyHas = base.includes(extra);
                if (!alreadyHas) {
                    const merged = base ? `${base} ${extra}` : extra;
                    dispatch({ type: 'UPDATE_FIELD', payload: { name: 'currentAddress', value: merged } });
                }
            }
        }

        const fromInternetOrWts = ['internet', 'wts'].includes(activeTab);
        const toElecOrGas = ['electricity', 'gas'].includes(tabId);

        if (fromInternetOrWts && toElecOrGas && activeTab !== tabId) {
            setModalState({
                isOpen: true,
                title: '入力内容の確認',
                message: '顧客情報をリセットしますか？',
                confirmText: 'リセットする',
                cancelText: '継続する',
                type: 'warning',
                onConfirm: () => {
                    resetForm(true);
                    setActiveTab(tabId);
                    closeModal();
                },
                onCancel: () => {
                    setActiveTab(tabId);
                    closeModal();
                },
                isErrorBanner: false,
                bannerMessage: '',
            });
        } else {
            setActiveTab(tabId);
        }
    }, [activeTab, resetForm, closeModal, setToast, setModalState, formData, dispatch]);
    
    // --- Bug Report Logic ---
    const handleOpenBugReport = () => setIsBugReportOpen(true);
    const handleCloseBugReport = () => {
        setIsBugReportOpen(false);
        setBugReportState({ text: '', isInvalid: false, isSubmitting: false });
    };

    const handleBugReportTextChange = (e) => {
        setBugReportState(prev => ({ ...prev, text: e.target.value, isInvalid: false }));
    };

    const handleBugReportSubmit = useCallback(async () => {
        if (!bugReportState.text.trim()) {
            setBugReportState(prev => ({ ...prev, isInvalid: true }));
            return;
        }

        setBugReportState(prev => ({ ...prev, isSubmitting: true }));
        
        const reportData = {
            apName: formData.apName,
            reportText: bugReportState.text,
            currentFormData: JSON.stringify(formData, null, 2),
        };

        try {
            const response = await fetch(BUG_REPORT_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Important for Google Apps Script web apps
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reportData),
            });
            // no-cors means we can't inspect the response, so we just assume success
            setToast({ message: '報告が送信されました。ご協力ありがとうございます！', type: 'success' });
            handleCloseBugReport();

        } catch (error) {
            console.error('Bug report submission error:', error);
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
        handlePostalCodeBlur,
        handleDateBlurWithValidation,
        handleNameBlur,
        handleKanaBlur,
        handleIdBlur,
    };
};