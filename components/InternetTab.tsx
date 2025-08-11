import React, { useMemo, useEffect } from 'https://esm.sh/react@^19.1.0';
import { 
    PRODUCTS, HOUSING_TYPES_1G, HOUSING_TYPES_10G, HOUSING_TYPES_AIR, HOUSING_TYPES_CHINTAI, HOUSING_TYPES_CHINTAI_FREE,
    RACK_OPTIONS_1G, RACK_OPTIONS_10G, RACK_OPTIONS_CHINTAI_FREE_MANSION, RACK_OPTIONS_CHINTAI_FREE_10G,
    CAMPAIGNS_1G, CAMPAIGNS_10G_NEW, CAMPAIGNS_AIR_NEW,
    GENDERS, MAILING_OPTIONS, RENTAL_OPTIONS, 
    EXISTING_LINE_STATUS_OPTIONS, MOBILE_CARRIERS, 
    DISCOUNT_OPTIONS, DISCOUNT_OPTIONS_10G_NEW, ROUTER_OPTIONS,
    PAYMENT_METHOD_OPTIONS, CROSS_PATH_ROUTER_OPTIONS
} from '../constants.ts';
import { FormInput, FormSelect, FormRadioGroup, FormTextArea, FormDateInput } from './FormControls.tsx';
import OwnerInfo from './OwnerInfo.tsx';

const InternetTab = ({ formData, setFormData, handleInputChange, handleDateBlur, handleNameBlur, invalidFields }) => {
  const is10G = formData.product === 'SoftBank光10G';
  const isAir = formData.product === 'SB Air';
  const isChintai = formData.product === '賃貸ねっと';
  const isChintaiFree = formData.product === '賃貸ねっと【無料施策】';
  const is1G = !is10G && !isAir && !isChintai && !isChintaiFree;

  const housingTypeOptions = isAir ? HOUSING_TYPES_AIR : is10G ? HOUSING_TYPES_10G : isChintai ? HOUSING_TYPES_CHINTAI : isChintaiFree ? HOUSING_TYPES_CHINTAI_FREE : HOUSING_TYPES_1G;
  
  const currentRackOptions = useMemo(() => {
    if (isChintaiFree) {
        if (formData.housingType === 'マンション10G') return RACK_OPTIONS_CHINTAI_FREE_10G;
        if (formData.housingType === 'マンション') return RACK_OPTIONS_CHINTAI_FREE_MANSION;
        return [];
    }
    
    let baseOptions;
    if (isChintai) baseOptions = formData.housingType === '10G' ? RACK_OPTIONS_10G : RACK_OPTIONS_1G;
    else if (is10G) baseOptions = RACK_OPTIONS_10G;
    else if (is1G) baseOptions = RACK_OPTIONS_1G;
    else return [];

    const housingType = formData.housingType;
    const isMansionType = housingType.includes('マンション') || housingType === '10G';
    const isFamilyType = housingType.includes('ファミリー');
    
    if (isMansionType) return baseOptions.filter(option => option.value !== '無し');
    if (isFamilyType) return baseOptions.find(option => option.value === '無し') ? [baseOptions.find(option => option.value === '無し')] : [];

    return baseOptions;
  }, [isChintai, isChintaiFree, is10G, is1G, formData.housingType]);

  const campaignOptions = isAir ? CAMPAIGNS_AIR_NEW : is10G ? CAMPAIGNS_10G_NEW : CAMPAIGNS_1G;
  const discountOptions = is10G ? DISCOUNT_OPTIONS_10G_NEW : DISCOUNT_OPTIONS;

  useEffect(() => {
    setFormData(prev => ({
        ...prev,
        housingType: '', rackType: '', campaign: '', serviceFee: '', homeDiscount: '', crossPathRouter: '',
    }));
  }, [formData.product, setFormData]);
  
  useEffect(() => {
    if (formData.rackType && !currentRackOptions.some(opt => opt.value === formData.rackType)) {
        setFormData(prev => ({ ...prev, rackType: '' }));
    }
  }, [formData.housingType, currentRackOptions, formData.rackType, setFormData]);

  useEffect(() => {
    if (is10G) {
        setFormData(prev => ({ ...prev, serviceFee: '3カ月0円→6930円' }));
    } else if (isAir) {
        setFormData(prev => ({ ...prev, serviceFee: '3カ月1485円、2年4950円、3年以降5368円' }));
    } else if (isChintai) {
        let updates: { serviceFee?: string; crossPathRouter?: string; } = {};
        switch (formData.housingType) {
            case 'マンション': updates = { serviceFee: '3960' }; break;
            case 'ファミリー': updates = { serviceFee: '5060' }; break;
            case '10G': updates = { serviceFee: '6160', crossPathRouter: '10Gレンタル' }; break;
            default: updates = { serviceFee: '', crossPathRouter: '' }; break;
        }
        if (formData.housingType !== '10G' && formData.crossPathRouter === '10Gレンタル') {
            updates.crossPathRouter = '';
        }
        setFormData(prev => ({...prev, ...updates}));
    } else if (isChintaiFree) {
        let updates: { serviceFee?: string; crossPathRouter?: string; rackType?: string; } = {};
        switch (formData.housingType) {
            case 'マンション':
                updates = { serviceFee: '初月無料→3960', crossPathRouter: '無料施策プレゼント' };
                if (formData.rackType === '光配線クロス') updates.rackType = '';
                break;
            case 'マンション10G':
                updates = { serviceFee: '初月無料→6160', crossPathRouter: '10Gレンタル', rackType: '光配線クロス' };
                break;
            default: updates = { serviceFee: '', crossPathRouter: '', rackType: '' }; break;
        }
        setFormData(prev => ({...prev, ...updates}));
    } else { // 1G
        if (formData.housingType === 'マンション') setFormData(prev => ({ ...prev, serviceFee: '4180' }));
        else if (formData.housingType === 'ファミリー') setFormData(prev => ({ ...prev, serviceFee: '5720' }));
        else setFormData(prev => ({ ...prev, serviceFee: '' }));
    }
  }, [formData.product, formData.housingType, is10G, isAir, isChintai, isChintaiFree, setFormData]);

  return (
    <>
        <FormRadioGroup
            label="商材"
            name="product"
            value={formData.product}
            onChange={handleInputChange}
            options={PRODUCTS}
            isInvalid={invalidFields.includes('product')}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
                label="タイプ" name="housingType" value={formData.housingType} onChange={handleInputChange}
                options={housingTypeOptions} isInvalid={invalidFields.includes('housingType')} required
            />
            {(!isAir) && (
                <FormSelect
                    label="ラック" name="rackType" value={formData.rackType} onChange={handleInputChange}
                    options={currentRackOptions} isInvalid={invalidFields.includes('rackType')} required
                    disabled={isChintaiFree && formData.housingType === 'マンション10G'}
                />
            )}
            <FormInput
                label="顧客ID" name="customerId" value={formData.customerId} onChange={handleInputChange}
                isInvalid={invalidFields.includes('customerId')} 
                required={!formData.isSakaiRoute}
                disabled={formData.isSakaiRoute}
                placeholder={formData.isSakaiRoute ? 'サカイ販路選択時は入力不要' : ''}
            />
            <FormInput
                label={(isChintai || isChintaiFree) ? "名乗り" : "名乗り（SMS届くので正確に）"}
                name="greeting" value={formData.greeting} onChange={handleInputChange}
                isInvalid={invalidFields.includes('greeting')} required
            />
        </div>
        
        <div className="border-t-2 border-dashed border-blue-300 pt-6 space-y-4">
            <h3 className="text-lg font-bold text-blue-700">契約者情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                    label="契約者名義（漢字）" name="contractorName" value={formData.contractorName}
                    onChange={handleInputChange} onBlur={handleNameBlur} isInvalid={invalidFields.includes('contractorName')} required
                />
                <FormInput
                    label="契約者名義（フリガナ）" name="contractorNameKana" value={formData.contractorNameKana}
                    onChange={handleInputChange} onBlur={handleNameBlur} isInvalid={invalidFields.includes('contractorNameKana')} required
                />
                {(!isChintai && !isChintaiFree) &&
                <FormSelect
                    label="性別" name="gender" value={formData.gender} onChange={handleInputChange}
                    options={GENDERS} isInvalid={invalidFields.includes('gender')} required
                />
                }
                <FormInput
                    label="生年月日（西暦）" name="dob" type="text" value={formData.dob} onChange={handleInputChange}
                    onBlur={handleDateBlur} placeholder="例: 1990/01/01" isInvalid={invalidFields.includes('dob')} required
                />
                <FormInput
                    label="電話番号" name="phone" value={formData.phone} onChange={handleInputChange}
                    isInvalid={invalidFields.includes('phone')} required
                />
                {(isChintai || isChintaiFree) && (
                    <FormInput
                        label="メアド" name="email" type="email" value={formData.email} onChange={handleInputChange}
                        isInvalid={invalidFields.includes('email')} required
                    />
                )}
            </div>
        </div>

        <div className="border-t-2 border-dashed border-blue-300 pt-6 space-y-4">
            <h3 className="text-lg font-bold text-blue-700">設置先情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                    label="郵便番号" name="postalCode" value={formData.postalCode} onChange={handleInputChange}
                    isInvalid={invalidFields.includes('postalCode')} className="md:col-span-2" required
                />
                <FormInput
                    label="住所" name="address" value={formData.address} onChange={handleInputChange}
                    className="md:col-span-2" isInvalid={invalidFields.includes('address')} required
                />
                 <FormInput
                    label="物件名＋部屋番号" name="buildingInfo" value={formData.buildingInfo} onChange={handleInputChange}
                    className="md:col-span-2" placeholder="例: 〇〇マンション101号室" isInvalid={invalidFields.includes('buildingInfo')} required
                />
                 <FormDateInput
                    label={(isChintai || isChintaiFree) ? "利用開始日(必ず引っ越し日を記載)" : "入居予定日"}
                    name="moveInDate" type="text" value={formData.moveInDate} onChange={handleInputChange} onBlur={handleDateBlur}
                    placeholder="例: 2024/08/01 または 8/1" isInvalid={invalidFields.includes('moveInDate')}
                    className="md:col-span-2" required
                />
            </div>
        </div>
        
        <div className="border-t-2 border-dashed border-blue-300 pt-6 space-y-4">
            <h3 className="text-lg font-bold text-blue-700">その他詳細</h3>
             <FormRadioGroup
                label="書面発送先" name="mailingOption" value={formData.mailingOption} onChange={handleInputChange}
                options={MAILING_OPTIONS} isInvalid={invalidFields.includes('mailingOption')}
            />
            {formData.mailingOption === '現住所' && (
                <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        label="現住所の郵便番号" name="currentPostalCode" value={formData.currentPostalCode} onChange={handleInputChange}
                        isInvalid={invalidFields.includes('currentPostalCode')} required
                    />
                    <FormInput
                        label="現住所・物件名・部屋番号" name="currentAddress"
                        value={formData.currentAddress}
                        onChange={handleInputChange} className="md:col-span-2" isInvalid={invalidFields.includes('currentAddress')} required
                    />
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {(!isChintai && !isChintaiFree) &&
                <FormInput
                    label="案内料金" name="serviceFee" value={formData.serviceFee} onChange={handleInputChange}
                    isInvalid={invalidFields.includes('serviceFee')} disabled={is10G || isAir} required
                />
               }
               {(isChintai || isChintaiFree) &&
                 <FormInput
                    label="案内料金" name="serviceFee" value={formData.serviceFee} onChange={handleInputChange}
                    isInvalid={invalidFields.includes('serviceFee')} disabled={true} required
                />
               }
                {(!isChintai && !isChintaiFree) &&
                    <FormSelect
                        label="CP" name="campaign" value={formData.campaign} onChange={handleInputChange}
                        options={campaignOptions} isInvalid={invalidFields.includes('campaign')} required
                    />
                }
                {isChintai && (
                    <>
                         <FormSelect
                            label="支払方法" name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange}
                            options={PAYMENT_METHOD_OPTIONS} isInvalid={invalidFields.includes('paymentMethod')} required
                        />
                        {formData.paymentMethod === '口座' && (
                            <FormInput
                                label="銀行名" name="bankName" value={formData.bankName} onChange={handleInputChange}
                                isInvalid={invalidFields.includes('bankName')} required
                            />
                        )}
                        {formData.housingType === '10G' ? (
                            <FormInput
                                label="クロスパス無線ルーター" name="crossPathRouter" value={formData.crossPathRouter}
                                onChange={handleInputChange} isInvalid={invalidFields.includes('crossPathRouter')}
                                className="md:col-span-2" disabled required
                            />
                        ) : (
                            <FormSelect
                                label="クロスパス無線ルーター" name="crossPathRouter" value={formData.crossPathRouter}
                                onChange={handleInputChange} options={CROSS_PATH_ROUTER_OPTIONS}
                                isInvalid={invalidFields.includes('crossPathRouter')} className="md:col-span-2" required
                            />
                        )}
                    </>
                )}
                {isChintaiFree && (
                    <>
                         <FormSelect
                            label="支払方法" name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange}
                            options={PAYMENT_METHOD_OPTIONS} isInvalid={invalidFields.includes('paymentMethod')} required
                        />
                        {formData.paymentMethod === '口座' && (
                            <FormInput
                                label="銀行名" name="bankName" value={formData.bankName} onChange={handleInputChange}
                                isInvalid={invalidFields.includes('bankName')} required
                            />
                        )}
                        <FormInput
                            label="クロスパス無線ルーター" name="crossPathRouter" value={formData.crossPathRouter}
                            onChange={handleInputChange} isInvalid={invalidFields.includes('crossPathRouter')}
                            className="md:col-span-2" disabled required
                        />
                    </>
                )}
                {!isAir && !isChintai && !isChintaiFree && (
                    <FormSelect
                        label="開通前レンタル" name="preActivationRental" value={formData.preActivationRental} onChange={handleInputChange}
                        options={RENTAL_OPTIONS} isInvalid={invalidFields.includes('preActivationRental')} required
                    />
                )}
               { !isChintaiFree &&
                   <FormSelect
                        label={isChintai ? "ゼニガメ" : "既存回線"} name="existingLineStatus"
                        value={formData.existingLineStatus} onChange={handleInputChange}
                        options={EXISTING_LINE_STATUS_OPTIONS} isInvalid={invalidFields.includes('existingLineStatus')} required
                    />
               }
                 { !isChintaiFree && formData.existingLineStatus === 'あり' && (
                    <FormInput
                        label={isChintai ? "現状回線" : "回線会社"} name="existingLineCompany"
                        value={formData.existingLineCompany} onChange={handleInputChange}
                        isInvalid={invalidFields.includes('existingLineCompany')} required
                    />
                )}
                {(!isChintai && !isChintaiFree) &&
                 <FormSelect
                    label="携帯キャリア" name="mobileCarrier" value={formData.mobileCarrier} onChange={handleInputChange}
                    options={MOBILE_CARRIERS} isInvalid={invalidFields.includes('mobileCarrier')} required
                />
                }
                {!isAir && !isChintai && !isChintaiFree && (
                    <FormSelect
                        label="おうち割" name="homeDiscount" value={formData.homeDiscount} onChange={handleInputChange}
                        options={discountOptions} isInvalid={invalidFields.includes('homeDiscount')} required
                    />
                )}
                {!is10G && !isAir && !isChintai && !isChintaiFree && (
                    <FormSelect
                        label="無線ルーター購入" name="wifiRouter" value={formData.wifiRouter}
                        onChange={handleInputChange} options={ROUTER_OPTIONS} isInvalid={invalidFields.includes('wifiRouter')} required
                    />
                )}
            </div>
             <FormTextArea
                label="備考" name="remarks" value={formData.remarks} onChange={handleInputChange}
                rows={3} isInvalid={invalidFields.includes('remarks')}
            />
        </div>
        
         {((!isAir && !isChintai && !isChintaiFree && formData.housingType.includes('ファミリー')) || (isChintai && formData.housingType === 'ファミリー')) && (
            <OwnerInfo 
                formData={formData} onChange={handleInputChange} invalidFields={invalidFields} isChintai={isChintai}
            />
        )}
    </>
  );
};

export default InternetTab;