import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext.tsx';
import { FormCheckbox, FormDateInput, FormInput, FormSelect } from './FormControls.tsx';

const TIME_OPTIONS = [
    { value: '9-12', label: '9-12' },
    { value: '13-15', label: '13-15' },
    { value: '15-17', label: '15-17' },
];

const OIL_PAYMENT_OPTIONS = [
    { value: 'クレカ', label: 'クレカ' },
    { value: '口座', label: '口座' },
    { value: '請求書', label: '請求書' },
];

const AgencyTab = () => {
    const { formData, handleInputChange, handleDateBlurWithValidation, invalidFields } = useContext(AppContext);

    const isElectricityRequested = formData.agencyRequestElectricity;
    const isGasRequested = formData.agencyRequestGas;
    const isWaterRequested = formData.agencyRequestWater;
    const isOilRequested = formData.agencyRequestOil;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                    label="ID"
                    name="recordId"
                    value={formData.recordId}
                    onChange={handleInputChange}
                    required
                    isInvalid={invalidFields.includes('recordId')}
                />
                <FormInput
                    label="契約者名義"
                    name="agencyContractorName"
                    value={formData.agencyContractorName}
                    onChange={handleInputChange}
                    required
                    isInvalid={invalidFields.includes('agencyContractorName')}
                />
                <FormDateInput
                    label="引っ越し予定日"
                    name="agencyMoveDate"
                    value={formData.agencyMoveDate}
                    onChange={handleInputChange}
                    onBlur={handleDateBlurWithValidation}
                    required
                    isInvalid={invalidFields.includes('agencyMoveDate')}
                />
                <FormInput
                    label="引っ越し先住所"
                    name="agencyNewAddress"
                    value={formData.agencyNewAddress}
                    onChange={handleInputChange}
                    required
                    isInvalid={invalidFields.includes('agencyNewAddress')}
                />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="font-bold text-gray-800 mb-3">代行希望<span className="text-red-500 ml-1">*</span></div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <FormCheckbox
                        label="電気"
                        name="agencyRequestElectricity"
                        checked={isElectricityRequested}
                        onChange={handleInputChange}
                        description=""
                        isInvalid={invalidFields.includes('agencyRequests')}
                    />
                    <FormCheckbox
                        label="ガス"
                        name="agencyRequestGas"
                        checked={isGasRequested}
                        onChange={handleInputChange}
                        description=""
                        isInvalid={invalidFields.includes('agencyRequests')}
                    />
                    <FormCheckbox
                        label="水道"
                        name="agencyRequestWater"
                        checked={isWaterRequested}
                        onChange={handleInputChange}
                        description=""
                        isInvalid={invalidFields.includes('agencyRequests')}
                    />
                    <FormCheckbox
                        label="灯油"
                        name="agencyRequestOil"
                        checked={isOilRequested}
                        onChange={handleInputChange}
                        description=""
                        isInvalid={invalidFields.includes('agencyRequests')}
                    />
                </div>
            </div>

            {isElectricityRequested && (
                <div className="bg-yellow-50 border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="font-bold text-gray-800 mb-3">電気</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput
                            label="電力会社名"
                            name="agencyElectricCompanyName"
                            value={formData.agencyElectricCompanyName}
                            onChange={handleInputChange}
                            required
                            isInvalid={invalidFields.includes('agencyElectricCompanyName')}
                        />
                        <FormDateInput
                            label="電気利用開始日"
                            name="agencyElectricStartDate"
                            value={formData.agencyElectricStartDate}
                            onChange={handleInputChange}
                            onBlur={handleDateBlurWithValidation}
                            required
                            isInvalid={invalidFields.includes('agencyElectricStartDate')}
                        />
                    </div>
                </div>
            )}

            {isGasRequested && (
                <div className="bg-orange-50 border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="font-bold text-gray-800 mb-3">ガス</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput
                            label="ガス会社名"
                            name="agencyGasCompanyName"
                            value={formData.agencyGasCompanyName}
                            onChange={handleInputChange}
                            required
                            isInvalid={invalidFields.includes('agencyGasCompanyName')}
                        />
                        <FormDateInput
                            label="ガス開栓日"
                            name="agencyGasStartDate"
                            value={formData.agencyGasStartDate}
                            onChange={handleInputChange}
                            onBlur={handleDateBlurWithValidation}
                            required
                            isInvalid={invalidFields.includes('agencyGasStartDate')}
                        />
                        <FormSelect
                            label="ガス開栓時間"
                            name="agencyGasStartTime"
                            value={formData.agencyGasStartTime}
                            onChange={handleInputChange}
                            options={TIME_OPTIONS}
                            required
                            isInvalid={invalidFields.includes('agencyGasStartTime')}
                        />
                    </div>
                </div>
            )}

            {isWaterRequested && (
                <div className="bg-blue-50 border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="font-bold text-gray-800 mb-3">水道</div>
                    <FormDateInput
                        label="水道利用開始日"
                        name="agencyWaterStartDate"
                        value={formData.agencyWaterStartDate}
                        onChange={handleInputChange}
                        onBlur={handleDateBlurWithValidation}
                        required
                        isInvalid={invalidFields.includes('agencyWaterStartDate')}
                    />
                </div>
            )}

            {isOilRequested && (
                <div className="bg-amber-50 border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="font-bold text-gray-800 mb-3">灯油</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput
                            label="灯油会社名"
                            name="agencyOilCompanyName"
                            value={formData.agencyOilCompanyName}
                            onChange={handleInputChange}
                            required
                            isInvalid={invalidFields.includes('agencyOilCompanyName')}
                        />
                        <FormDateInput
                            label="灯油利用開始日"
                            name="agencyOilStartDate"
                            value={formData.agencyOilStartDate}
                            onChange={handleInputChange}
                            onBlur={handleDateBlurWithValidation}
                            required
                            isInvalid={invalidFields.includes('agencyOilStartDate')}
                        />
                        <FormSelect
                            label="灯油開栓時間"
                            name="agencyOilStartTime"
                            value={formData.agencyOilStartTime}
                            onChange={handleInputChange}
                            options={TIME_OPTIONS}
                            required
                            isInvalid={invalidFields.includes('agencyOilStartTime')}
                        />
                        <FormSelect
                            label="灯油支払い方法"
                            name="agencyOilPaymentMethod"
                            value={formData.agencyOilPaymentMethod}
                            onChange={handleInputChange}
                            options={OIL_PAYMENT_OPTIONS}
                            required
                            isInvalid={invalidFields.includes('agencyOilPaymentMethod')}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgencyTab;
