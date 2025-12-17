import React, { useContext, useMemo } from 'react';
import {
    WTS_CUSTOMER_TYPES, WTS_SHIPPING_DESTINATIONS, WTS_FIVE_YEAR_PLAN_OPTIONS,
    WTS_WATER_PURIFIER_OPTIONS, WTS_MULTIPLE_UNITS_OPTIONS,
    WTS_U20_HIGHSCHOOL_OPTIONS, WTS_U20_PARENTAL_CONSENT_OPTIONS, MAILING_OPTIONS,
    WTS_SERVERS, WTS_COLORS, WTS_FREE_WATER_OPTIONS, WTS_CARRIER_OPTIONS,
    YES_NO_OPTIONS
} from '../constants.ts';
import { AppContext } from '../context/AppContext.tsx';
import { FormInput, FormSelect, FormRadioGroup, FormTextArea, FormDateInput, FormCheckbox } from './FormControls.tsx';


const WtsTab = () => {
    const { formData, handleInputChange, handleDateBlurWithValidation, handleNameBlur, handleIdBlur, invalidFields, handlePhoneBlur, handleKanaBlur, handlePostalCodeBlur } = useContext(AppContext);
    const { wtsCustomerType, isSakaiRoute, wtsServerType } = formData;
    
    const serverOptions = useMemo(() => {
        if (wtsCustomerType === 'ジライフウォーター') {
            // 除外：リッタ / ロッカスマート / スリムR2 / AURA
            const filtered = WTS_SERVERS.filter(x => !['リッタ','ロッカスマート','スリムR2','AURA'].includes(x.value));
            // 追加：スタンダードサーバー（色はWTS_COLORSで定義済み）
            const addStd = { value: 'スタンダードサーバー', label: 'スタンダードサーバー' };
            // 並び替え：amadana → スタンダードサーバー → fam2 → スリム4ロング → スリム4ショート
            const byValue = (v: string) => (o: any) => o.value === v;
            return [
                filtered.find(byValue('amadana')),
                addStd,
                filtered.find(byValue('fam2')),
                filtered.find(byValue('スリム4ロング')),
                filtered.find(byValue('スリム4ショート')),
            ].filter(Boolean);
        }
        // プレミアム/U-20/法人は従来通り
        return WTS_SERVERS;
    }, [wtsCustomerType]);

    const colorOptions = useMemo(() => {
        return WTS_COLORS[wtsServerType] || [];
    }, [wtsServerType]);
    
    const isCorporate = wtsCustomerType === '法人';

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 border-b-2 pb-2">ウォーターサーバー契約情報</h3>
            
            <FormRadioGroup
                label="顧客タイプ"
                name="wtsCustomerType"
                value={wtsCustomerType}
                onChange={handleInputChange}
                options={WTS_CUSTOMER_TYPES}
                isInvalid={invalidFields.includes('wtsCustomerType')}
                required
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                    label="顧客ID"
                    name="customerId"
                    value={formData.customerId}
                    onChange={handleInputChange}
                    onBlur={handleIdBlur}
                    isInvalid={invalidFields.includes('customerId')}
                    required
                    placeholder={isSakaiRoute ? 'サカイ販路はレコードIDを入力' : ''}
                    className="md:col-span-2"
                />
            </div>
            
            {wtsCustomerType === 'U-20' && (
                <div className="border-t-2 border-dashed border-blue-300 pt-6 space-y-4">
                    <h3 className="text-lg font-bold text-blue-700">U-20プラン専用情報</h3>
                    <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                         <FormSelect
                            label="※高校生ヒアリング"
                            name="wtsU20HighSchool"
                            value={formData.wtsU20HighSchool}
                            onChange={handleInputChange}
                            options={WTS_U20_HIGHSCHOOL_OPTIONS}
                            isInvalid={invalidFields.includes('wtsU20HighSchool')}
                            required
                         />
                         <FormSelect
                            label="※親相談OKか"
                            name="wtsU20ParentalConsent"
                            value={formData.wtsU20ParentalConsent}
                            onChange={handleInputChange}
                            options={WTS_U20_PARENTAL_CONSENT_OPTIONS}
                            isInvalid={invalidFields.includes('wtsU20ParentalConsent')}
                            required
                         />
                    </div>
                </div>
            )}
            
            <div className="border-t-2 border-dashed border-blue-300 pt-6 space-y-4">
                <h3 className="text-lg font-bold text-blue-700">契約詳細</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        label="①名義"
                        name="contractorName"
                        value={formData.contractorName}
                        onChange={handleInputChange}
                        onBlur={handleNameBlur}
                        isInvalid={invalidFields.includes('contractorName')}
                        required
                    />
                    <FormInput
                        label="②フリガナ"
                        name="contractorNameKana"
                        value={formData.contractorNameKana}
                        onChange={handleInputChange}
                        onBlur={handleKanaBlur}
                        isInvalid={invalidFields.includes('contractorNameKana')}
                        required={wtsCustomerType === 'ジライフウォーター'}
                    />
                     <FormDateInput
                        label="③生年月日"
                        name="dob"
                        value={formData.dob}
                        onChange={handleInputChange}
                        onBlur={handleDateBlurWithValidation}
                        placeholder="YYYY/MM/DD"
                        isInvalid={invalidFields.includes('dob')}
                        required
                    />
                    <FormInput
                        label="④電話番号"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        onBlur={handlePhoneBlur}
                        isInvalid={invalidFields.includes('phone')}
                        required
                    />
                    <FormInput
                        label="メアド"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        isInvalid={invalidFields.includes('email')}
                        required={wtsCustomerType === 'ジライフウォーター'}
                    />
                    <div className="md:col-span-2">
                        <FormRadioGroup
                            label="⑤発送先"
                            name="wtsShippingDestination"
                            value={formData.wtsShippingDestination}
                            onChange={handleInputChange}
                            options={WTS_SHIPPING_DESTINATIONS}
                            isInvalid={invalidFields.includes('wtsShippingDestination')}
                            required
                        />
                         {formData.wtsShippingDestination === 'その他' && (
                            <div className="mt-2 p-4 bg-blue-50/50 rounded-lg border border-blue-200 grid grid-cols-1 gap-4">
                                <FormInput
                                    label="発送先 郵便番号"
                                    name="wtsShippingPostalCode"
                                    value={formData.wtsShippingPostalCode}
                                    onChange={handleInputChange}
                                    onBlur={(e) => handlePostalCodeBlur('wtsShippingPostalCode', e.target.value)}
                                    isInvalid={invalidFields.includes('wtsShippingPostalCode')}
                                    required
                                />
                                <FormInput
                                    label="発送先 住所"
                                    name="wtsShippingAddress"
                                    value={formData.wtsShippingAddress}
                                    onChange={handleInputChange}
                                    isInvalid={invalidFields.includes('wtsShippingAddress')}
                                    required
                                />
                            </div>
                        )}
                    </div>
                    <FormSelect
                        label="⑥サーバー"
                        name="wtsServerType"
                        value={formData.wtsServerType}
                        onChange={handleInputChange}
                        options={serverOptions}
                        isInvalid={invalidFields.includes('wtsServerType')}
                        required
                    />
                    <FormSelect
                        label="⑦色"
                        name="wtsServerColor"
                        value={formData.wtsServerColor}
                        onChange={handleInputChange}
                        options={colorOptions}
                        isInvalid={invalidFields.includes('wtsServerColor')}
                        required
                        disabled={!formData.wtsServerType}
                    />
                     <FormSelect
                        label="⑧契約年数"
                        name="wtsFiveYearPlan"
                        value={formData.wtsFiveYearPlan}
                        onChange={handleInputChange}
                        options={WTS_FIVE_YEAR_PLAN_OPTIONS}
                        isInvalid={invalidFields.includes('wtsFiveYearPlan')}
                        required
                    />
                     <FormRadioGroup
                        label="⑨無料水"
                        name="wtsFreeWater"
                        value={formData.wtsFreeWater}
                        onChange={handleInputChange}
                        options={WTS_FREE_WATER_OPTIONS}
                        isInvalid={invalidFields.includes('wtsFreeWater')}
                        required
                    />
                     <FormInput
                        label="⑩クレカ"
                        name="wtsCreditCard"
                        value={formData.wtsCreditCard}
                        onChange={handleInputChange}
                        placeholder="あり, なし, または自由入力"
                        isInvalid={invalidFields.includes('wtsCreditCard')}
                        required
                    />
                    <div className="md:col-span-1">
                        <FormSelect
                            label="⑪キャリア"
                            name="wtsCarrier"
                            value={formData.wtsCarrier}
                            onChange={handleInputChange}
                            options={WTS_CARRIER_OPTIONS}
                            isInvalid={invalidFields.includes('wtsCarrier')}
                            required
                        />
                         {formData.wtsCarrier === 'その他' && (
                            <FormInput
                                label="キャリア名（任意）"
                                name="wtsCarrierOther"
                                value={formData.wtsCarrierOther}
                                onChange={handleInputChange}
                                className="mt-2"
                                placeholder="例: 楽天モバイル"
                                isInvalid={invalidFields.includes('wtsCarrierOther')}
                            />
                        )}
                    </div>
                    <div className="flex items-end gap-4">
                        <div className="flex-1">
                            <FormDateInput
                                label="⑫入居予定日"
                                name="moveInDate"
                                value={formData.moveInDate}
                                onChange={handleInputChange}
                                onBlur={handleDateBlurWithValidation}
                                placeholder="YYYY/MM/DD"
                                isInvalid={invalidFields.includes('moveInDate')}
                                required={!formData.wtsMoveInAlready}
                                disabled={formData.wtsMoveInAlready}
                            />
                        </div>
                        <FormCheckbox
                            label="入居済み"
                            name="wtsMoveInAlready"
                            checked={formData.wtsMoveInAlready}
                            onChange={handleInputChange}
                            className="pb-2"
                            description=""
                            // FIX: Add missing 'isInvalid' property to FormCheckbox component.
                            isInvalid={invalidFields.includes('wtsMoveInAlready')}
                        />
                    </div>
                     <div className="md:col-span-2">
                        <FormRadioGroup
                            label="⑬書面送付先"
                            name="wtsMailingAddress"
                            value={formData.wtsMailingAddress}
                            onChange={handleInputChange}
                            options={MAILING_OPTIONS}
                            isInvalid={invalidFields.includes('wtsMailingAddress')}
                            required
                        />
                        {formData.wtsMailingAddress === '現住所' && (
                            <div className="mt-2 p-4 bg-blue-50/50 rounded-lg border border-blue-200 grid grid-cols-1 md:grid-cols-2 gap-4">
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
                     {isCorporate ? (
                        <FormInput
                            label="⑭請求書先"
                            name="wtsCorporateInvoice"
                            value={formData.wtsCorporateInvoice}
                            onChange={handleInputChange}
                            isInvalid={invalidFields.includes('wtsCorporateInvoice')}
                            required
                        />
                     ) : (
                         <FormSelect
                            label="⑭浄水器確認"
                            name="wtsWaterPurifier"
                            value={formData.wtsWaterPurifier}
                            onChange={handleInputChange}
                            options={WTS_WATER_PURIFIER_OPTIONS}
                            isInvalid={invalidFields.includes('wtsWaterPurifier')}
                            required
                        />
                     )}

                    {isCorporate ? (
                         <FormSelect
                            label="⑮浄水器確認"
                            name="wtsWaterPurifier"
                            value={formData.wtsWaterPurifier}
                            onChange={handleInputChange}
                            options={WTS_WATER_PURIFIER_OPTIONS}
                            isInvalid={invalidFields.includes('wtsWaterPurifier')}
                            required
                        />
                    ) : (
                         <FormSelect
                            label="⑮複数台提案"
                            name="wtsMultipleUnits"
                            value={formData.wtsMultipleUnits}
                            onChange={handleInputChange}
                            options={WTS_MULTIPLE_UNITS_OPTIONS}
                            isInvalid={invalidFields.includes('wtsMultipleUnits')}
                            required
                        />
                    )}

                    {isCorporate && (
                          <FormSelect
                            label="⑯複数台提案"
                            name="wtsMultipleUnits"
                            value={formData.wtsMultipleUnits}
                            onChange={handleInputChange}
                            options={WTS_MULTIPLE_UNITS_OPTIONS}
                            isInvalid={invalidFields.includes('wtsMultipleUnits')}
                            required
                        />
                    )}
                </div>
            </div>
            <div className="border-t-2 border-dashed border-blue-300 pt-6 space-y-4">
                <FormTextArea
                    label="備考"
                    name="wtsRemarks"
                    value={formData.wtsRemarks}
                    onChange={handleInputChange}
                    rows={4}
                    isInvalid={invalidFields.includes('wtsRemarks')}
                />
            </div>
        </div>
    );
};

export default WtsTab;
