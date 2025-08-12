import React, { useContext, useMemo } from 'https://esm.sh/react@^19.1.0';
import {
    WTS_CUSTOMER_TYPES, WTS_SHIPPING_DESTINATIONS, WTS_FIVE_YEAR_PLAN_OPTIONS,
    WTS_WATER_PURIFIER_OPTIONS, WTS_MULTIPLE_UNITS_OPTIONS,
    WTS_U20_HIGHSCHOOL_OPTIONS, WTS_U20_PARENTAL_CONSENT_OPTIONS, MAILING_OPTIONS,
    WTS_SERVERS, WTS_COLORS
} from '../constants.ts';
import { AppContext } from '../context/AppContext.tsx';
import { FormInput, FormSelect, FormRadioGroup, FormTextArea, FormDateInput } from './FormControls.tsx';


const WtsTab = () => {
    const { formData, handleInputChange, handleDateBlur, handleNameBlur, invalidFields } = useContext(AppContext);
    const { wtsCustomerType, isSakaiRoute, wtsServerType } = formData;
    
    const colorOptions = useMemo(() => {
        return wtsServerType && WTS_COLORS[wtsServerType] ? WTS_COLORS[wtsServerType] : [];
    }, [wtsServerType]);

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
                    required={!isSakaiRoute}
                    disabled={isSakaiRoute}
                    placeholder={isSakaiRoute ? 'サカイ販路選択時は入力不要' : ''}
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
                     <FormDateInput
                        label="②生年月日"
                        name="dob"
                        value={formData.dob}
                        onChange={handleInputChange}
                        onBlur={handleDateBlur}
                        placeholder="YYYY/MM/DD"
                        isInvalid={invalidFields.includes('dob')}
                        required
                    />
                    <FormInput
                        label="③番号"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        isInvalid={invalidFields.includes('phone')}
                        required
                    />
                    <FormSelect
                        label="④発送先"
                        name="wtsShippingDestination"
                        value={formData.wtsShippingDestination}
                        onChange={handleInputChange}
                        options={WTS_SHIPPING_DESTINATIONS}
                        isInvalid={invalidFields.includes('wtsShippingDestination')}
                        required
                    />
                    <FormSelect
                        label="⑤サーバー"
                        name="wtsServerType"
                        value={formData.wtsServerType}
                        onChange={handleInputChange}
                        options={WTS_SERVERS}
                        isInvalid={invalidFields.includes('wtsServerType')}
                        required
                    />
                    <FormSelect
                        label="⑥色"
                        name="wtsServerColor"
                        value={formData.wtsServerColor}
                        onChange={handleInputChange}
                        options={colorOptions}
                        isInvalid={invalidFields.includes('wtsServerColor')}
                        required
                        disabled={!formData.wtsServerType}
                    />
                     <FormSelect
                        label="⑦契約年数"
                        name="wtsFiveYearPlan"
                        value={formData.wtsFiveYearPlan}
                        onChange={handleInputChange}
                        options={WTS_FIVE_YEAR_PLAN_OPTIONS}
                        isInvalid={invalidFields.includes('wtsFiveYearPlan')}
                        required
                    />
                     <FormInput
                        label="⑧無料水"
                        name="wtsFreeWater"
                        value={formData.wtsFreeWater}
                        onChange={handleInputChange}
                        isInvalid={invalidFields.includes('wtsFreeWater')}
                        required
                    />
                     <FormInput
                        label="⑨クレカ"
                        name="wtsCreditCard"
                        value={formData.wtsCreditCard}
                        onChange={handleInputChange}
                        placeholder="あり, なし, または自由入力"
                        isInvalid={invalidFields.includes('wtsCreditCard')}
                        required
                    />
                    <FormInput
                        label="⑩キャリア"
                        name="wtsCarrier"
                        value={formData.wtsCarrier}
                        onChange={handleInputChange}
                        isInvalid={invalidFields.includes('wtsCarrier')}
                        required
                    />
                    <FormDateInput
                        label="⑪入居予定日"
                        name="moveInDate"
                        value={formData.moveInDate}
                        onChange={handleInputChange}
                        onBlur={handleDateBlur}
                        placeholder="YYYY/MM/DD"
                        isInvalid={invalidFields.includes('moveInDate')}
                        required
                    />
                     <FormRadioGroup
                        label="⑫書面送付先"
                        name="wtsMailingAddress"
                        value={formData.wtsMailingAddress}
                        onChange={handleInputChange}
                        options={MAILING_OPTIONS}
                        isInvalid={invalidFields.includes('wtsMailingAddress')}
                        required
                    />
                     {wtsCustomerType === '法人' ? (
                        <FormInput
                            label="⑬請求書先"
                            name="wtsCorporateInvoice"
                            value={formData.wtsCorporateInvoice}
                            onChange={handleInputChange}
                            isInvalid={invalidFields.includes('wtsCorporateInvoice')}
                            required
                        />
                     ) : (
                         <FormSelect
                            label="⑬浄水器確認"
                            name="wtsWaterPurifier"
                            value={formData.wtsWaterPurifier}
                            onChange={handleInputChange}
                            options={WTS_WATER_PURIFIER_OPTIONS}
                            isInvalid={invalidFields.includes('wtsWaterPurifier')}
                            required
                        />
                     )}

                    {wtsCustomerType === '法人' ? (
                         <FormSelect
                            label="⑭浄水器確認"
                            name="wtsWaterPurifier"
                            value={formData.wtsWaterPurifier}
                            onChange={handleInputChange}
                            options={WTS_WATER_PURIFIER_OPTIONS}
                            isInvalid={invalidFields.includes('wtsWaterPurifier')}
                            required
                        />
                    ) : (
                         <FormSelect
                            label="⑭複数台提案"
                            name="wtsMultipleUnits"
                            value={formData.wtsMultipleUnits}
                            onChange={handleInputChange}
                            options={WTS_MULTIPLE_UNITS_OPTIONS}
                            isInvalid={invalidFields.includes('wtsMultipleUnits')}
                            required
                        />
                    )}

                    {wtsCustomerType === '法人' && (
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
                </div>
            </div>
            <div className="border-t-2 border-dashed border-blue-300 pt-6 space-y-4">
                <FormTextArea
                    label="備考"
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    rows={4}
                    isInvalid={invalidFields.includes('remarks')}
                />
            </div>
        </div>
    );
};

export default WtsTab;