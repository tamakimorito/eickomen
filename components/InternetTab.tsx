import React, { useMemo, useContext, useEffect, useCallback } from 'react';
import { 
    PRODUCTS, HOUSING_TYPES_1G, HOUSING_TYPES_10G, HOUSING_TYPES_AIR, HOUSING_TYPES_CHINTAI, HOUSING_TYPES_CHINTAI_FREE,
    RACK_OPTIONS_1G, RACK_OPTIONS_10G, RACK_OPTIONS_CHINTAI_FREE_MANSION, RACK_OPTIONS_CHINTAI_FREE_10G,
    CAMPAIGNS_1G, CAMPAIGNS_10G_NEW, CAMPAIGNS_AIR_NEW, CAMPAIGNS_AIR_U25O60,
    GENDERS, MAILING_OPTIONS, RENTAL_OPTIONS, 
    EXISTING_LINE_STATUS_OPTIONS, MOBILE_CARRIERS, 
    DISCOUNT_OPTIONS, DISCOUNT_OPTIONS_10G_NEW, ROUTER_OPTIONS,
    PAYMENT_METHOD_OPTIONS, CROSS_PATH_ROUTER_OPTIONS,
    HOUSING_TYPES_GMO, GMO_TOKUTOKU_PLANS, GMO_COMPENSATION_OPTIONS, GMO_ROUTER_OPTIONS, GMO_NO_PAIR_ROUTER_OPTIONS,
    GMO_NO_PAIR_ID_OPTIONS, GMO_CALLBACK_TIME_SLOTS, AU_CONTACT_TYPE_OPTIONS, AU_PLAN_PROVIDER_OPTIONS
} from '../constants.ts';
import { AppContext } from '../context/AppContext.tsx';
import { FormInput, FormSelect, FormRadioGroup, FormTextArea, FormDateInput, FormCheckbox } from './FormControls.tsx';
import OwnerInfo from './OwnerInfo.tsx';

const calculateAge = (dobString) => {
    if (!dobString) return null;
    // YYYY/MM/DD format check
    const parts = dobString.split('/');
    if (parts.length !== 3) return null;
    const [year, month, day] = parts.map(p => parseInt(p, 10));
    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

    const birthDate = new Date(year, month - 1, day);
    if (birthDate.getFullYear() !== year || birthDate.getMonth() + 1 !== month || birthDate.getDate() !== day) {
        return null; // Invalid date like 2023/02/30
    }
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

const DefaultInternetForm = () => {
    const { formData, handleInputChange, handleDateBlurWithValidation, handleIdBlur, invalidFields, handlePhoneBlur, handleKanaBlur, handleNameBlur, handlePostalCodeBlur, setModalState, closeModal } = useContext(AppContext);
    
    const is10G = formData.product === 'SoftBank光10G';
    const isAir = formData.product === 'SB Air';
    const isChintai = formData.product === '賃貸ねっと';
    const isChintaiFree = formData.product === '賃貸ねっと【無料施策】';
    const is1G = formData.product === 'SoftBank光1G';

    const age = useMemo(() => calculateAge(formData.dob), [formData.dob]);
    const isU25O60 = age !== null && (age <= 25 || age >= 60);

    const campaignOptions = isAir && isU25O60 ? CAMPAIGNS_AIR_U25O60 : (isAir ? CAMPAIGNS_AIR_NEW : is10G ? CAMPAIGNS_10G_NEW : CAMPAIGNS_1G);
    
    const CROSS_PATH_ROUTER_OPTIONS_FOR_FREE = [{ value: 'プレゼント', label: 'プレゼント' }];

    useEffect(() => {
        if (isAir) {
            const currentCampaignIsValid = campaignOptions.some(opt => opt.value === formData.campaign);
            if (formData.campaign && !currentCampaignIsValid) {
                handleInputChange({ target: { name: 'campaign', value: '' } });
            }
        }
    }, [isAir, campaignOptions, formData.campaign, handleInputChange]);

    useEffect(() => {
      if (isChintaiFree && formData.crossPathRouter !== 'プレゼント') {
        handleInputChange({ target: { name: 'crossPathRouter', value: 'プレゼント', type: 'text' } } as any);
      }
    }, [isChintaiFree, formData.crossPathRouter, handleInputChange]);

    const smartLifeFee = '2年3278円、3年以降5368円';
    const isSmartLifeCP = ['スマートライフ割', 'スマートライフ割+あんしん乗り換え'].includes(formData.campaign);

    const handleServiceFeeBlur = useCallback(() => {
        if (isAir && isSmartLifeCP) {
            if (formData.serviceFee !== smartLifeFee) {
                handleInputChange({ target: { name: 'serviceFee', value: smartLifeFee } });
            }
        }
    }, [isAir, isSmartLifeCP, formData.serviceFee, handleInputChange]);


    // Service Fee Automation
    useEffect(() => {
        if (isAir && isSmartLifeCP) {
            if (formData.serviceFee !== smartLifeFee) {
                handleInputChange({ target: { name: 'serviceFee', value: smartLifeFee } });
            }
            return; // Exit early to prevent conflict with older logic.
        }

        if (is10G) {
            const defaultFee = '6カ月0円→6930円';
            const threeMonthFee = '3カ月0円→6930円';

            if (formData.campaign === '10ギガめちゃトク割3カ月') {
                if (formData.serviceFee === '' || formData.serviceFee === defaultFee) {
                    handleInputChange({ target: { name: 'serviceFee', value: threeMonthFee } });
                }
            } else {
                if (formData.serviceFee === threeMonthFee) {
                    handleInputChange({ target: { name: 'serviceFee', value: defaultFee } });
                } else if (formData.serviceFee === '') {
                    handleInputChange({ target: { name: 'serviceFee', value: defaultFee } });
                }
            }
        } else if (isAir) {
            const u25o60Fee = '2年3278円、3年以降5368円';
            if (isU25O60) {
                if (formData.serviceFee === '') {
                    handleInputChange({ target: { name: 'serviceFee', value: u25o60Fee } });
                }
            } else {
                if (formData.serviceFee === u25o60Fee) {
                    handleInputChange({ target: { name: 'serviceFee', value: '' } });
                }
            }
        }
    }, [is10G, isAir, isU25O60, formData.campaign, formData.serviceFee, handleInputChange, isSmartLifeCP]);

    const handleOuchiWariBlur = useCallback(() => {
        if (formData.homeDiscount === 'あり' && !['SoftBank', 'Y!mobile'].includes(formData.mobileCarrier)) {
            setModalState({
                isOpen: true,
                title: '入力内容の確認',
                message: 'おうち割の対象携帯キャリアはsoftbankとY!mobileです。修正してください',
                confirmText: '継続する',
                cancelText: '修正する',
                type: 'warning',
                onConfirm: closeModal,
                onCancel: closeModal,
            });
        }
    }, [formData.homeDiscount, formData.mobileCarrier, setModalState, closeModal]);

    const handleAnshinNorikaeBlur = useCallback(() => {
        if (formData.campaign?.includes('あんしん乗り換え') && formData.existingLineStatus === '無し') {
            setModalState({
                isOpen: true,
                title: '入力内容の確認',
                message: '利用回線無しなのに安心乗り換えが選択されてます',
                confirmText: '継続する',
                cancelText: '修正する',
                type: 'warning',
                onConfirm: closeModal,
                onCancel: closeModal,
            });
        }
    }, [formData.campaign, formData.existingLineStatus, setModalState, closeModal]);


    const housingTypeOptions = isAir ? HOUSING_TYPES_AIR : is10G ? HOUSING_TYPES_10G : isChintai ? HOUSING_TYPES_CHINTAI : isChintaiFree ? HOUSING_TYPES_CHINTAI_FREE : HOUSING_TYPES_1G;
  
    const currentRackOptions = useMemo(() => {
        if (isChintaiFree) {
            if (formData.housingType === 'マンション10G') return RACK_OPTIONS_CHINTAI_FREE_10G;
            if (formData.housingType === 'マンション') return RACK_OPTIONS_CHINTAI_FREE_MANSION;
            return [...RACK_OPTIONS_CHINTAI_FREE_MANSION, ...RACK_OPTIONS_CHINTAI_FREE_10G];
        }
        
        let baseOptions;
        if (isChintai) baseOptions = formData.housingType === '10G' ? RACK_OPTIONS_10G : RACK_OPTIONS_1G;
        else if (is10G) baseOptions = RACK_OPTIONS_10G;
        else if (is1G) baseOptions = RACK_OPTIONS_1G;
        else return [];

        if (isChintai && formData.housingType === 'マンション') {
            return baseOptions.filter(o => o.value !== '無し');
        }

        const housingType = formData.housingType;
        const isMansionType = housingType.includes('マンション') || housingType === '10G';
        const isFamilyType = housingType.includes('ファミリー');
        
        if (isMansionType && !isChintai) return baseOptions.filter(option => option.value !== '無し');
        if (isFamilyType) return baseOptions.find(option => option.value === '無し') ? [baseOptions.find(option => option.value === '無し')] : [];

        return baseOptions;
    }, [isChintai, isChintaiFree, is10G, is1G, formData.housingType]);

    const discountOptions = is10G ? DISCOUNT_OPTIONS_10G_NEW : DISCOUNT_OPTIONS;
    
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                    label="タイプ" name="housingType" value={formData.housingType} onChange={handleInputChange}
                    options={housingTypeOptions} isInvalid={invalidFields.includes('housingType')} required
                />
                {(!isAir) && (
                    <FormSelect
                        label="ラック" name="rackType" value={formData.rackType} onChange={handleInputChange}
                        options={currentRackOptions} isInvalid={invalidFields.includes('rackType')} required
                    />
                )}
                <FormInput
                    label="顧客ID" name="customerId" value={formData.customerId} onChange={handleInputChange}
                    onBlur={handleIdBlur}
                    isInvalid={invalidFields.includes('customerId')} 
                    required={!formData.isSakaiRoute}
                    disabled={formData.isSakaiRoute}
                    placeholder={formData.isSakaiRoute ? 'サカイ販路選択時は入力不要' : ''}
                />
                <FormInput
                    label={(isChintai || isChintaiFree) ? "名乗り" : "名乗り（SMS届くので正確に）"}
                    name="greeting" value={formData.greeting} onChange={handleInputChange}
                    isInvalid={invalidFields.includes('greeting')} required
                    disabled={formData.isSakaiRoute}
                />
            </div>
            
            <div className="border-t-2 border-dashed border-blue-300 pt-6 space-y-4">
                <h3 className="text-lg font-bold text-blue-700">契約者情報</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="契約者名義（漢字）" name="contractorName" value={formData.contractorName} onChange={handleInputChange} onBlur={handleNameBlur} isInvalid={invalidFields.includes('contractorName')} required />
                    <FormInput label="契約者名義（フリガナ）" name="contractorNameKana" value={formData.contractorNameKana} onChange={handleInputChange} onBlur={handleKanaBlur} isInvalid={invalidFields.includes('contractorNameKana')} required />
                    {!isChintai && !isChintaiFree && <FormSelect label="性別" name="gender" value={formData.gender} onChange={handleInputChange} options={GENDERS} isInvalid={invalidFields.includes('gender')} required />}
                    <FormDateInput label="生年月日（西暦）" name="dob" value={formData.dob} onChange={handleInputChange} onBlur={handleDateBlurWithValidation} isInvalid={invalidFields.includes('dob')} placeholder="例: 1990/01/01" required />
                    <FormInput label="電話番号" name="phone" value={formData.phone} onChange={handleInputChange} onBlur={handlePhoneBlur} isInvalid={invalidFields.includes('phone')} required />
                    {(isChintai || isChintaiFree) && <FormInput label="メアド" name="email" value={formData.email} onChange={handleInputChange} isInvalid={invalidFields.includes('email')} required />}
                </div>
            </div>

            <div className="border-t-2 border-dashed border-blue-300 pt-6 space-y-4">
                <h3 className="text-lg font-bold text-blue-700">設置先情報</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="郵便番号" name="postalCode" value={formData.postalCode} onChange={handleInputChange} onBlur={(e) => handlePostalCodeBlur('postalCode', e.target.value)} isInvalid={invalidFields.includes('postalCode')} required className="md:col-span-2" />
                    <FormInput label="住所" name="address" value={formData.address} onChange={handleInputChange} className="md:col-span-2" isInvalid={invalidFields.includes('address')} required />
                    <div className="md:col-span-2 flex items-end gap-2">
                        <FormInput
                            label="物件名＋部屋番号"
                            name="buildingInfo"
                            value={formData.buildingInfo}
                            onChange={handleInputChange}
                            className="flex-grow"
                            isInvalid={invalidFields.includes('buildingInfo')}
                            required
                        />
                        <FormCheckbox
                            label="戸建て"
                            name="isDetachedHouse"
                            checked={formData.buildingInfo === '戸建て'}
                            onChange={(e) => handleInputChange({ target: { name: 'buildingInfo', value: e.target.checked ? '戸建て' : '' } })}
                            className="pb-2"
                            description=""
                            isInvalid={invalidFields.includes('buildingInfo')}
                        />
                    </div>
                    <FormDateInput label="入居予定日" name="moveInDate" value={formData.moveInDate} onChange={handleInputChange} onBlur={handleDateBlurWithValidation} isInvalid={invalidFields.includes('moveInDate')} placeholder="例: 2024/08/01" required />
                </div>
            </div>

            <div className="border-t-2 border-dashed border-blue-300 pt-6 space-y-4">
                <h3 className="text-lg font-bold text-blue-700">書面送付先</h3>
                <FormRadioGroup
                    label="書面発送先"
                    name="mailingOption"
                    value={formData.mailingOption}
                    onChange={handleInputChange}
                    options={MAILING_OPTIONS}
                    isInvalid={invalidFields.includes('mailingOption')}
                    required
                />
                {formData.mailingOption === '現住所' && (
                    <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="現住所の郵便番号" name="currentPostalCode" value={formData.currentPostalCode} onChange={handleInputChange}
                            onBlur={(e) => handlePostalCodeBlur('currentPostalCode', e.target.value)}
                            isInvalid={invalidFields.includes('currentPostalCode')} required
                        />
                        <FormInput
                            label="現住所・物件名・部屋番号" name="currentAddress"
                            value={formData.currentAddress}
                            onChange={handleInputChange} className="md:col-span-2" isInvalid={invalidFields.includes('currentAddress')} required
                        />
                    </div>
                )}
            </div>

            <div className="border-t-2 border-dashed border-blue-300 pt-6 space-y-4">
                <h3 className="text-lg font-bold text-blue-700">その他</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="案内料金" name="serviceFee" value={formData.serviceFee} onChange={handleInputChange} onBlur={handleServiceFeeBlur} isInvalid={invalidFields.includes('serviceFee')} required />
                    {!isChintai && !isChintaiFree && <FormSelect label="CP" name="campaign" value={formData.campaign} onChange={handleInputChange} onBlur={handleAnshinNorikaeBlur} options={campaignOptions} isInvalid={invalidFields.includes('campaign')} required />}
                    
                    {!isAir && !isChintai && !isChintaiFree && (
                         <FormSelect label="開通前レンタル" name="preActivationRental" value={formData.preActivationRental} onChange={handleInputChange} options={RENTAL_OPTIONS} isInvalid={invalidFields.includes('preActivationRental')} required />
                    )}
                    
                    <FormSelect label="既存回線" name="existingLineStatus" value={formData.existingLineStatus} onChange={handleInputChange} onBlur={handleAnshinNorikaeBlur} options={EXISTING_LINE_STATUS_OPTIONS} isInvalid={invalidFields.includes('existingLineStatus')} required />
                    {formData.existingLineStatus === 'あり' && (
                        <FormInput label="回線会社" name="existingLineCompany" value={formData.existingLineCompany} onChange={handleInputChange} isInvalid={invalidFields.includes('existingLineCompany')} required />
                    )}
                    
                    {!isChintai && !isChintaiFree && <FormSelect label="携帯キャリア" name="mobileCarrier" value={formData.mobileCarrier} onChange={handleInputChange} onBlur={handleOuchiWariBlur} options={MOBILE_CARRIERS} isInvalid={invalidFields.includes('mobileCarrier')} required />}
                    
                    {!isAir && !isChintai && !isChintaiFree && (
                        <FormSelect label="おうち割" name="homeDiscount" value={formData.homeDiscount} onChange={handleInputChange} onBlur={handleOuchiWariBlur} options={discountOptions} isInvalid={invalidFields.includes('homeDiscount')} required />
                    )}
                    
                    {is1G && (
                         <FormSelect label="無線ルーター購入" name="wifiRouter" value={formData.wifiRouter} onChange={handleInputChange} options={ROUTER_OPTIONS} isInvalid={invalidFields.includes('wifiRouter')} required />
                    )}

                    {(isChintai || isChintaiFree) && (
                         <FormSelect label="支払方法" name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange} options={PAYMENT_METHOD_OPTIONS} isInvalid={invalidFields.includes('paymentMethod')} required />
                    )}
                     {(isChintai || isChintaiFree) && formData.paymentMethod === '口座' && (
                        <FormInput label="銀行名" name="bankName" value={formData.bankName} onChange={handleInputChange} isInvalid={invalidFields.includes('bankName')} required />
                    )}
                     {(isChintai || isChintaiFree) && (
                         <FormSelect label="クロスパス無線ルーター" name="crossPathRouter" value={formData.crossPathRouter} onChange={handleInputChange} options={isChintaiFree ? CROSS_PATH_ROUTER_OPTIONS_FOR_FREE : CROSS_PATH_ROUTER_OPTIONS} isInvalid={invalidFields.includes('crossPathRouter')} required />
                    )}
                </div>
                <FormTextArea label="備考" name="internetRemarks" value={formData.internetRemarks} onChange={handleInputChange} rows={3} isInvalid={invalidFields.includes('internetRemarks')} />
            </div>

            {(formData.housingType?.includes('ファミリー') || (isChintai && formData.housingType === '10G' && formData.rackType === '無し')) && <OwnerInfo isChintai={isChintai} />}
        </div>
    );
};

const GmoDocomoForm = () => {
    const { formData, handleInputChange, handleDateBlurWithValidation, handleNameBlur, invalidFields, handlePhoneBlur, handleKanaBlur } = useContext(AppContext);
    
    const isFamily = formData.housingType?.includes('ファミリー');
    const isNoPair = formData.housingType?.includes('ペアなし');

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                    label="タイプ" name="housingType" value={formData.housingType} onChange={handleInputChange}
                    options={HOUSING_TYPES_GMO} isInvalid={invalidFields.includes('housingType')} required className="md:col-span-2"
                />
                <FormInput
                    label="顧客ID" name="customerId" value={formData.customerId} onChange={handleInputChange}
                    isInvalid={invalidFields.includes('customerId')} required
                />
                <FormInput
                    label="名乗り会社名" name="greeting" value={formData.greeting} onChange={handleInputChange}
                    isInvalid={invalidFields.includes('greeting')} required
                />
                 {!isNoPair && <FormCheckbox label="工事費分割案内済" name="gmoConstructionSplit" checked={formData.gmoConstructionSplit} onChange={handleInputChange} isInvalid={invalidFields.includes('gmoConstructionSplit')} description="" className="pt-6" />}

            </div>
            
            <div className="border-t-2 border-dashed border-blue-300 pt-6 space-y-4">
                <h3 className="text-lg font-bold text-blue-700">キャンペーン・オプション</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50/50 rounded-lg border border-blue-200">
                     <FormRadioGroup
                        label={isNoPair ? 'GMO解約違約金補填2万円' : 'GMO解約違約金補填対象2万円'}
                        name="gmoCompensation" value={formData.gmoCompensation} onChange={handleInputChange}
                        options={GMO_COMPENSATION_OPTIONS} isInvalid={invalidFields.includes('gmoCompensation')} required
                    />
                    <FormRadioGroup
                        label={isNoPair ? '無線LANルーター案内' : '無線LANルーター無料案内'}
                        name="gmoRouter" value={formData.gmoRouter} onChange={handleInputChange}
                        options={isNoPair ? GMO_NO_PAIR_ROUTER_OPTIONS : GMO_ROUTER_OPTIONS}
                        isInvalid={invalidFields.includes('gmoRouter')} required
                    />
                    {isNoPair && (
                        <FormRadioGroup
                            label="身分証" name="gmoNoPairIdType" value={formData.gmoNoPairIdType} onChange={handleInputChange}
                            options={GMO_NO_PAIR_ID_OPTIONS} isInvalid={invalidFields.includes('gmoNoPairIdType')} required
                        />
                    )}
                </div>
            </div>

            <div className="border-t-2 border-dashed border-blue-300 pt-6 space-y-4">
                <h3 className="text-lg font-bold text-blue-700">申込者情報</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="①申し込み者" name="contractorName" value={formData.contractorName} onChange={handleInputChange} onBlur={handleNameBlur} isInvalid={invalidFields.includes('contractorName')} required />
                    <FormInput label="②申込者電話番号" name="phone" value={formData.phone} onChange={handleInputChange} onBlur={handlePhoneBlur} isInvalid={invalidFields.includes('phone')} required />
                    
                    {isNoPair ? (
                        <>
                            <FormSelect label="③携帯キャリア" name="mobileCarrier" value={formData.mobileCarrier} onChange={handleInputChange} options={MOBILE_CARRIERS} isInvalid={invalidFields.includes('mobileCarrier')} required />
                            <FormSelect label="④支払い方法" name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange} options={PAYMENT_METHOD_OPTIONS} isInvalid={invalidFields.includes('paymentMethod')} required />
                        </>
                    ) : (
                        <div className="md:col-span-2 space-y-4">
                            <FormCheckbox
                                label="③ドコモ名義人：申込者と同じ"
                                name="gmoIsDocomoOwnerSame"
                                checked={formData.gmoIsDocomoOwnerSame}
                                onChange={handleInputChange}
                                isInvalid={invalidFields.includes('gmoIsDocomoOwnerSame')}
                                description=""
                            />
                            {!formData.gmoIsDocomoOwnerSame && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50/50 rounded-lg border border-blue-200">
                                    <FormInput label="③ドコモ名義人" name="gmoDocomoOwnerName" value={formData.gmoDocomoOwnerName} onChange={handleInputChange} onBlur={handleNameBlur} isInvalid={invalidFields.includes('gmoDocomoOwnerName')} required />
                                    <FormInput label="④ドコモ名義人電話番号" name="gmoDocomoOwnerPhone" value={formData.gmoDocomoOwnerPhone} onChange={handleInputChange} onBlur={handlePhoneBlur} isInvalid={invalidFields.includes('gmoDocomoOwnerPhone')} required />
                                </div>
                            )}
                        </div>
                    )}
                    <FormInput label={isNoPair ? "⑤現在利用回線" : "⑤現在利用回線（必須）"} name="existingLineCompany" value={formData.existingLineCompany} onChange={handleInputChange} isInvalid={invalidFields.includes('existingLineCompany')} required className="md:col-span-2" />
                </div>
            </div>

            <div className="border-t-2 border-dashed border-blue-300 pt-6 space-y-4">
                <h3 className="text-lg font-bold text-blue-700">後確希望時間枠</h3>
                <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormDateInput label="第一希望 日付" name="gmoCallbackDate1" value={formData.gmoCallbackDate1} onChange={handleInputChange} onBlur={handleDateBlurWithValidation} isInvalid={invalidFields.includes('gmoCallbackDate1')} required />
                    <FormSelect label="第一希望 時間" name="gmoCallback1" value={formData.gmoCallback1} onChange={handleInputChange} options={GMO_CALLBACK_TIME_SLOTS} isInvalid={invalidFields.includes('gmoCallback1')} required />

                    <FormDateInput label="第二希望 日付" name="gmoCallbackDate2" value={formData.gmoCallbackDate2} onChange={handleInputChange} onBlur={handleDateBlurWithValidation} isInvalid={invalidFields.includes('gmoCallbackDate2')} required />
                    <FormSelect label="第二希望 時間" name="gmoCallback2" value={formData.gmoCallback2} onChange={handleInputChange} options={GMO_CALLBACK_TIME_SLOTS} isInvalid={invalidFields.includes('gmoCallback2')} required />

                    <FormDateInput label="第三希望 日付" name="gmoCallbackDate3" value={formData.gmoCallbackDate3} onChange={handleInputChange} onBlur={handleDateBlurWithValidation} isInvalid={invalidFields.includes('gmoCallbackDate3')} required />
                    <FormSelect label="第三希望 時間" name="gmoCallback3" value={formData.gmoCallback3} onChange={handleInputChange} options={GMO_CALLBACK_TIME_SLOTS} isInvalid={invalidFields.includes('gmoCallback3')} required />
                </div>
            </div>
            
            <div className="border-t-2 border-dashed border-blue-300 pt-6 space-y-4">
                <FormTextArea label="備考" name="internetRemarks" value={formData.internetRemarks} onChange={handleInputChange} rows={3} isInvalid={invalidFields.includes('internetRemarks')} />
            </div>

            {isFamily && <OwnerInfo isChintai={false} />}
        </div>
    );
};

const GmoTokutokuForm = () => {
    const { formData, handleInputChange, handleDateBlurWithValidation, invalidFields, handlePhoneBlur, handleNameBlur, handleKanaBlur } = useContext(AppContext);
    const isFamily = formData.gmoTokutokuPlan === 'ファミリー';
    
    return (
        <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                    label="顧客ID" name="customerId" value={formData.customerId} onChange={handleInputChange}
                    isInvalid={invalidFields.includes('customerId')} required
                />
                <FormSelect
                    label="プラン" name="gmoTokutokuPlan" value={formData.gmoTokutokuPlan} onChange={handleInputChange}
                    options={GMO_TOKUTOKU_PLANS} isInvalid={invalidFields.includes('gmoTokutokuPlan')} required
                />
             </div>

             <div className="border-t-2 border-dashed border-blue-300 pt-6 space-y-4">
                <h3 className="text-lg font-bold text-blue-700">契約者情報</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="①名義" name="contractorName" value={formData.contractorName} onChange={handleInputChange} onBlur={handleNameBlur} isInvalid={invalidFields.includes('contractorName')} required />
                    <FormDateInput label="②生年月日" name="dob" value={formData.dob} onChange={handleInputChange} onBlur={handleDateBlurWithValidation} isInvalid={invalidFields.includes('dob')} placeholder="例: 1990/01/01" required />
                    <FormDateInput label="③引越日" name="moveInDate" value={formData.moveInDate} onChange={handleInputChange} onBlur={handleDateBlurWithValidation} isInvalid={invalidFields.includes('moveInDate')} placeholder="例: 2024/08/01" required />
                    <FormInput label="⑤設置先号室" name="buildingInfo" value={formData.buildingInfo} onChange={handleInputChange} isInvalid={invalidFields.includes('buildingInfo')} required />
                    <FormInput label="⑨メアド必須" name="email" value={formData.email} onChange={handleInputChange} isInvalid={invalidFields.includes('email')} required className="md:col-span-2" />
                </div>
            </div>

            <div className="border-t-2 border-dashed border-blue-300 pt-6 space-y-4">
                <h3 className="text-lg font-bold text-blue-700">書面送付先</h3>
                <FormRadioGroup
                    label="④書面送付先" name="mailingOption" value={formData.mailingOption} onChange={handleInputChange}
                    options={MAILING_OPTIONS} isInvalid={invalidFields.includes('mailingOption')} required
                />
                {formData.mailingOption === '現住所' && (
                    <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput label="現住所の郵便番号" name="currentPostalCode" value={formData.currentPostalCode} onChange={handleInputChange} isInvalid={invalidFields.includes('currentPostalCode')} required />
                        <FormInput label="現住所・物件名・部屋番号" name="currentAddress" value={formData.currentAddress} onChange={handleInputChange} className="md:col-span-2" isInvalid={invalidFields.includes('currentAddress')} required />
                    </div>
                )}
            </div>

            <div className="border-t-2 border-dashed border-blue-300 pt-6 space-y-4">
                <h3 className="text-lg font-bold text-blue-700">その他</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="⑥案内料金" name="serviceFee" value={formData.serviceFee} onChange={handleInputChange} isInvalid={invalidFields.includes('serviceFee')} required />
                    <FormInput label="⑦ＣＰ" name="gmoTokutokuCampaign" value={formData.gmoTokutokuCampaign} onChange={handleInputChange} isInvalid={invalidFields.includes('gmoTokutokuCampaign')} required />
                    <FormSelect label="⑧既存回線" name="existingLineStatus" value={formData.existingLineStatus} onChange={handleInputChange} options={EXISTING_LINE_STATUS_OPTIONS} isInvalid={invalidFields.includes('existingLineStatus')} required />
                    {formData.existingLineStatus === 'あり' && (
                        <FormInput label="回線会社" name="existingLineCompany" value={formData.existingLineCompany} onChange={handleInputChange} isInvalid={invalidFields.includes('existingLineCompany')} required />
                    )}
                    <FormSelect label="⑩支払い方法" name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange} options={PAYMENT_METHOD_OPTIONS} isInvalid={invalidFields.includes('paymentMethod')} required />
                </div>
                <FormTextArea label="備考" name="internetRemarks" value={formData.internetRemarks} onChange={handleInputChange} rows={3} isInvalid={invalidFields.includes('internetRemarks')} />
            </div>

            {isFamily && <OwnerInfo isChintai={false} />}
        </div>
    );
};

const AuHikariForm = () => {
    const { formData, handleInputChange, handleDateBlurWithValidation, invalidFields, handlePhoneBlur, handleNameBlur, handlePostalCodeBlur, handleKanaBlur } = useContext(AppContext);

    const handleAuDetachedChange = (e) => {
        const isChecked = e.target.checked;
        const current = formData.address || '';
        const base = current.replace(/戸建て$/, '').trim();
        const next = isChecked ? `${base}戸建て`.trim() : base;
        handleInputChange({ target: { name: 'address', value: next, type: 'text' } });
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                    label="レコードID" name="recordId" value={formData.recordId} onChange={handleInputChange}
                    isInvalid={invalidFields.includes('recordId')} required
                />
                <FormInput
                    label="名乗り" name="greeting" value={formData.greeting} onChange={handleInputChange}
                    isInvalid={invalidFields.includes('greeting')} required
                />
            </div>

            <div className="border-t-2 border-dashed border-blue-300 pt-6 space-y-4">
                <h3 className="text-lg font-bold text-blue-700">お客様情報</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="お客様氏名" name="contractorName" value={formData.contractorName} onChange={handleInputChange} onBlur={handleNameBlur} isInvalid={invalidFields.includes('contractorName')} required />
                    <FormInput label="ご連絡先電話番号" name="phone" value={formData.phone} onChange={handleInputChange} onBlur={handlePhoneBlur} isInvalid={invalidFields.includes('phone')} required />
                    <FormSelect label="連絡先種別" name="auContactType" value={formData.auContactType} onChange={handleInputChange} options={AU_CONTACT_TYPE_OPTIONS} isInvalid={invalidFields.includes('auContactType')} required />
                    <FormInput label="現状回線/プロバイダ" name="existingLineCompany" value={formData.existingLineCompany} onChange={handleInputChange} isInvalid={invalidFields.includes('existingLineCompany')} required />
                </div>
            </div>

            <div className="border-t-2 border-dashed border-blue-300 pt-6 space-y-4">
                <h3 className="text-lg font-bold text-blue-700">設置先情報</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="郵便番号" name="postalCode" value={formData.postalCode} onChange={handleInputChange} onBlur={(e) => handlePostalCodeBlur('postalCode', e.target.value)} isInvalid={invalidFields.includes('postalCode')} required className="md:col-span-2" />
                    <div className="md:col-span-2 flex items-end gap-2">
                        <FormInput
                            label="住所※物件名部屋番号まで全部"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="flex-grow"
                            isInvalid={invalidFields.includes('address')}
                            required
                        />
                        <FormCheckbox
                            label="戸建て"
                            name="auIsDetached"
                            checked={(formData.address || '').endsWith('戸建て')}
                            onChange={handleAuDetachedChange}
                            className="pb-2"
                            description=""
                            isInvalid={false}
                        />
                    </div>
                </div>
            </div>

            <div className="border-t-2 border-dashed border-blue-300 pt-6 space-y-4">
                <h3 className="text-lg font-bold text-blue-700">プラン・キャンペーン情報</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormSelect label="案内プラン/プロバイダ" name="auPlanProvider" value={formData.auPlanProvider} onChange={handleInputChange} options={AU_PLAN_PROVIDER_OPTIONS} isInvalid={invalidFields.includes('auPlanProvider')} required className="md:col-span-2" />
                    <FormInput label="案内料金" name="serviceFee" value={formData.serviceFee} onChange={handleInputChange} isInvalid={invalidFields.includes('serviceFee')} required />
                    <FormInput label="適用CP" name="auCampaign" value={formData.auCampaign} onChange={handleInputChange} isInvalid={invalidFields.includes('auCampaign')} />
                    <FormInput label="Wi-Fiルーター" name="auWifiRouter" value={formData.auWifiRouter} onChange={handleInputChange} isInvalid={invalidFields.includes('auWifiRouter')} />
                    <FormInput label="オプション付帯" name="auOptions" value={formData.auOptions} onChange={handleInputChange} isInvalid={invalidFields.includes('auOptions')} />
                    <FormInput label="乗り換えサポート" name="auSupport" value={formData.auSupport} onChange={handleInputChange} isInvalid={invalidFields.includes('auSupport')} />
                    <FormInput label="前確希望時間" name="auPreCheckTime" value={formData.auPreCheckTime} onChange={handleInputChange} isInvalid={invalidFields.includes('auPreCheckTime')} />
                </div>
                <FormTextArea label="案内内容" name="internetRemarks" value={formData.internetRemarks} onChange={handleInputChange} rows={3} isInvalid={invalidFields.includes('internetRemarks')} />
            </div>
        </div>
    );
};


const InternetTab = () => {
    const { formData, handleInputChange, invalidFields } = useContext(AppContext);
    
    const renderForm = () => {
        switch (formData.product) {
            case 'GMOドコモ光':
                return <GmoDocomoForm />;
            case 'GMOとくとく光':
                return <GmoTokutokuForm />;
            case 'AUひかり':
                return <AuHikariForm />;
            default:
                return <DefaultInternetForm />;
        }
    };

    return (
        <div className="space-y-6">
            <FormSelect
                label="商材" name="product" value={formData.product} onChange={handleInputChange}
                options={PRODUCTS} isInvalid={invalidFields.includes('product')} required
            />
            {renderForm()}
        </div>
    );
};

export default InternetTab;