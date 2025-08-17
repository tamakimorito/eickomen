import React, { useMemo, useContext } from 'https://esm.sh/react@^19.1.0';
import { 
    PRODUCTS, HOUSING_TYPES_1G, HOUSING_TYPES_10G, HOUSING_TYPES_AIR, HOUSING_TYPES_CHINTAI, HOUSING_TYPES_CHINTAI_FREE,
    RACK_OPTIONS_1G, RACK_OPTIONS_10G, RACK_OPTIONS_CHINTAI_FREE_MANSION, RACK_OPTIONS_CHINTAI_FREE_10G,
    CAMPAIGNS_1G, CAMPAIGNS_10G_NEW, CAMPAIGNS_AIR_NEW,
    GENDERS, MAILING_OPTIONS, RENTAL_OPTIONS, 
    EXISTING_LINE_STATUS_OPTIONS, MOBILE_CARRIERS, 
    DISCOUNT_OPTIONS, DISCOUNT_OPTIONS_10G_NEW, ROUTER_OPTIONS,
    PAYMENT_METHOD_OPTIONS, CROSS_PATH_ROUTER_OPTIONS,
    HOUSING_TYPES_GMO, GMO_COMPENSATION_OPTIONS, GMO_ROUTER_OPTIONS, GMO_NO_PAIR_ROUTER_OPTIONS,
    GMO_NO_PAIR_ID_OPTIONS, GMO_CALLBACK_TIME_SLOTS, AU_CONTACT_TYPE_OPTIONS
} from '../constants.ts';
import { AppContext } from '../context/AppContext.tsx';
import { FormInput, FormSelect, FormRadioGroup, FormTextArea, FormDateInput, FormCheckbox } from './FormControls.tsx';
import OwnerInfo from './OwnerInfo.tsx';

const DefaultInternetForm = () => {
    const { formData, handleInputChange, handleDateBlur, handleNameBlur, handleIdBlur, invalidFields } = useContext(AppContext);
    
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
                        disabled={isChintaiFree && formData.housingType === 'マンション10G'}
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
                        isInvalid={invalidFields.includes('serviceFee')} disabled={is10G} required
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
                <OwnerInfo isChintai={isChintai} />
            )}
        </div>
    )
}

const GmoForm = () => {
    const { formData, handleInputChange, handleDateBlur, handleIdBlur, invalidFields } = useContext(AppContext);
    const { housingType, gmoIsDocomoOwnerSame } = formData;
    
    const isNoPair = housingType.includes('ペアなし');
    const routerOptions = isNoPair ? GMO_NO_PAIR_ROUTER_OPTIONS : GMO_ROUTER_OPTIONS;

    return (
         <div className="space-y-6">
            <FormRadioGroup
                label="プランタイプ" name="housingType" value={housingType} onChange={handleInputChange}
                options={HOUSING_TYPES_GMO} isInvalid={invalidFields.includes('housingType')} required
            />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                    label="AP名" name="apName" value={formData.apName} onChange={handleInputChange}
                    isInvalid={invalidFields.includes('apName')} required
                />
                <FormInput
                    label="顧客ID" name="customerId" value={formData.customerId} onChange={handleInputChange}
                    onBlur={handleIdBlur}
                    isInvalid={invalidFields.includes('customerId')} required
                />
            </div>
            <div className="border-t-2 border-dashed border-blue-300 pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {!isNoPair &&
                        <FormCheckbox
                            label="工事費分割案内済" name="gmoConstructionSplit" checked={formData.gmoConstructionSplit} onChange={handleInputChange}
                            isInvalid={invalidFields.includes('gmoConstructionSplit')} description="" className="md:col-span-2"
                        />
                     }
                    <FormRadioGroup
                        label="GMO解約違約金補填対象2万円" name="gmoCompensation" value={formData.gmoCompensation} onChange={handleInputChange}
                        options={GMO_COMPENSATION_OPTIONS} isInvalid={invalidFields.includes('gmoCompensation')} required
                    />
                    <FormRadioGroup
                        label={isNoPair ? "無線LANルーター案内" : "無線LANルーター無料案内"} name="gmoRouter" value={formData.gmoRouter} onChange={handleInputChange}
                        options={routerOptions} isInvalid={invalidFields.includes('gmoRouter')} required
                    />
                    {isNoPair && 
                        <FormRadioGroup
                            label="身分証" name="gmoNoPairIdType" value={formData.gmoNoPairIdType} onChange={handleInputChange}
                            options={GMO_NO_PAIR_ID_OPTIONS} isInvalid={invalidFields.includes('gmoNoPairIdType')} required
                        />
                    }
                </div>
            </div>

            <div className="border-t-2 border-dashed border-blue-300 pt-6 space-y-4">
                <FormInput
                    label="名乗り会社名" name="greeting" value={formData.greeting} onChange={handleInputChange}
                    isInvalid={invalidFields.includes('greeting')} required
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        label="①申し込み者" name="contractorName" value={formData.contractorName} onChange={handleInputChange}
                        isInvalid={invalidFields.includes('contractorName')} required
                    />
                     <FormInput
                        label="②申込者電話番号" name="phone" value={formData.phone} onChange={handleInputChange}
                        isInvalid={invalidFields.includes('phone')} required
                    />
                     {!isNoPair && 
                        <div className="md:col-span-2">
                            <FormCheckbox
                                label="④⑤ドコモ名義人・電話番号は申込者と同じ" name="gmoIsDocomoOwnerSame" checked={gmoIsDocomoOwnerSame} onChange={handleInputChange}
                                isInvalid={invalidFields.includes('gmoIsDocomoOwnerSame')}
                                description=""
                            />
                            {!gmoIsDocomoOwnerSame && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 border border-gray-300 rounded-lg">
                                    <FormInput
                                        label="④ドコモ名義人" name="gmoDocomoOwnerName" value={formData.gmoDocomoOwnerName} onChange={handleInputChange}
                                        isInvalid={invalidFields.includes('gmoDocomoOwnerName')} required
                                    />
                                     <FormInput
                                        label="⑤ドコモ名義人電話番号" name="gmoDocomoOwnerPhone" value={formData.gmoDocomoOwnerPhone} onChange={handleInputChange}
                                        isInvalid={invalidFields.includes('gmoDocomoOwnerPhone')} required
                                    />
                                </div>
                            )}
                        </div>
                     }
                      {isNoPair && (
                        <>
                           <FormSelect
                                label="③携帯キャリア" name="mobileCarrier" value={formData.mobileCarrier} onChange={handleInputChange}
                                options={MOBILE_CARRIERS} isInvalid={invalidFields.includes('mobileCarrier')} required
                            />
                            <FormSelect
                                label="④支払い方法" name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange}
                                options={PAYMENT_METHOD_OPTIONS} isInvalid={invalidFields.includes('paymentMethod')} required
                            />
                        </>
                     )}
                     <FormInput
                        label={isNoPair ? "⑤現在利用回線" : "⑥現在利用回線（必須）"} name="existingLineCompany" value={formData.existingLineCompany} onChange={handleInputChange}
                        isInvalid={invalidFields.includes('existingLineCompany')} required className="md:col-span-2"
                    />
                </div>
            </div>

             <div className="border-t-2 border-dashed border-blue-300 pt-6 space-y-4">
                <h3 className="text-lg font-bold text-blue-700">後確希望時間枠</h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg border">
                        <FormDateInput
                            label="第一希望 日付"
                            name="gmoCallbackDate1"
                            value={formData.gmoCallbackDate1}
                            onChange={handleInputChange}
                            onBlur={handleDateBlur}
                            isInvalid={invalidFields.includes('gmoCallbackDate1')}
                            placeholder="例: 2024/08/15"
                        />
                        <FormSelect
                            label="第一希望 時間"
                            name="gmoCallback1"
                            value={formData.gmoCallback1}
                            onChange={handleInputChange}
                            options={GMO_CALLBACK_TIME_SLOTS}
                            isInvalid={invalidFields.includes('gmoCallback1')}
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg border">
                        <FormDateInput
                            label="第二希望 日付"
                            name="gmoCallbackDate2"
                            value={formData.gmoCallbackDate2}
                            onChange={handleInputChange}
                            onBlur={handleDateBlur}
                            isInvalid={invalidFields.includes('gmoCallbackDate2')}
                            placeholder="例: 2024/08/16"
                        />
                        <FormSelect
                            label="第二希望 時間"
                            name="gmoCallback2"
                            value={formData.gmoCallback2}
                            onChange={handleInputChange}
                            options={GMO_CALLBACK_TIME_SLOTS}
                            isInvalid={invalidFields.includes('gmoCallback2')}
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg border">
                        <FormDateInput
                            label="第三希望 日付"
                            name="gmoCallbackDate3"
                            value={formData.gmoCallbackDate3}
                            onChange={handleInputChange}
                            onBlur={handleDateBlur}
                            isInvalid={invalidFields.includes('gmoCallbackDate3')}
                            placeholder="例: 2024/08/17"
                        />
                        <FormSelect
                            label="第三希望 時間"
                            name="gmoCallback3"
                            value={formData.gmoCallback3}
                            onChange={handleInputChange}
                            options={GMO_CALLBACK_TIME_SLOTS}
                            isInvalid={invalidFields.includes('gmoCallback3')}
                        />
                    </div>
                </div>
            </div>
            
             {housingType.includes('ファミリー') && (
                <OwnerInfo isChintai={false} />
            )}
        </div>
    )
}

const AuForm = () => {
    const { formData, handleInputChange, invalidFields } = useContext(AppContext);
    
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-bold text-blue-700">必要連携項目</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                    label="獲得者" name="apName" value={formData.apName} onChange={handleInputChange}
                    isInvalid={invalidFields.includes('apName')} required
                />
                 <FormInput
                    label="お客様氏名" name="contractorName" value={formData.contractorName} onChange={handleInputChange}
                    isInvalid={invalidFields.includes('contractorName')} required
                />
                <FormInput
                    label="現状回線/プロバイダ" name="existingLineCompany" value={formData.existingLineCompany} onChange={handleInputChange}
                    isInvalid={invalidFields.includes('existingLineCompany')} required
                />
                <FormInput
                    label="郵便番号" name="postalCode" value={formData.postalCode} onChange={handleInputChange}
                    isInvalid={invalidFields.includes('postalCode')} required
                />
                 <FormInput
                    label="住所" name="address" value={formData.address} onChange={handleInputChange}
                    isInvalid={invalidFields.includes('address')} required className="md:col-span-2"
                />
                 <FormInput
                    label="案内プラン/プロバイダ" name="auPlanProvider" value={formData.auPlanProvider} onChange={handleInputChange}
                    isInvalid={invalidFields.includes('auPlanProvider')} placeholder="（下記からコピペして入力）/ソネット"
                />
                 <FormInput
                    label="案内内容" name="remarks" value={formData.remarks} onChange={handleInputChange}
                    isInvalid={invalidFields.includes('remarks')} 
                />
                <FormInput
                    label="Wi-Fiルーター" name="auWifiRouter" value={formData.auWifiRouter} onChange={handleInputChange}
                    isInvalid={invalidFields.includes('auWifiRouter')} 
                />
                <FormInput
                    label="オプション付帯" name="auOptions" value={formData.auOptions} onChange={handleInputChange}
                    isInvalid={invalidFields.includes('auOptions')} 
                />
                 <FormInput
                    label="乗り換えサポート" name="auSupport" value={formData.auSupport} onChange={handleInputChange}
                    isInvalid={invalidFields.includes('auSupport')} 
                />
                <FormInput
                    label="適用CP" name="auCampaign" value={formData.auCampaign} onChange={handleInputChange}
                    isInvalid={invalidFields.includes('auCampaign')} 
                />
                <div className="grid grid-cols-2 gap-2">
                    <FormInput
                        label="ご連絡先電話番号" name="phone" value={formData.phone} onChange={handleInputChange}
                        isInvalid={invalidFields.includes('phone')} required
                    />
                    <FormRadioGroup
                        label="携帯/固定" name="auContactType" value={formData.auContactType} onChange={handleInputChange}
                        options={AU_CONTACT_TYPE_OPTIONS} isInvalid={invalidFields.includes('auContactType')} required
                    />
                </div>
                <FormInput
                    label="前確希望時間" name="auPreCheckTime" value={formData.auPreCheckTime} onChange={handleInputChange}
                    isInvalid={invalidFields.includes('auPreCheckTime')}
                />
                 <FormInput
                    label="案内料金" name="serviceFee" value={formData.serviceFee} onChange={handleInputChange}
                    isInvalid={invalidFields.includes('serviceFee')}
                />
            </div>
        </div>
    );
};

const InternetTab = () => {
    const { formData, handleInputChange, invalidFields } = useContext(AppContext);
    
    const isGmo = formData.product === 'GMOドコモ光';
    const isAu = formData.product === 'AUひかり';
    const showDefaultForm = !isGmo && !isAu;

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
            <div className="mt-6 space-y-6">
                {showDefaultForm && <DefaultInternetForm />}
                {isGmo && <GmoForm />}
                {isAu && <AuForm />}
            </div>
        </>
    );
};

export default InternetTab;