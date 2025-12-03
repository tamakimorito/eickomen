import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext.tsx';
import { FormCheckbox, FormDateInput, FormInput, FormSelect } from './FormControls.tsx';
import { DAIKO_KEROSENE_PAYMENT_OPTIONS, DAIKO_TIME_SLOTS } from '../constants.ts';

const DaikoTab = () => {
    const { formData, handleInputChange, handleDateBlurWithValidation, invalidFields, setInvalidFields } = useContext(AppContext);
    const serviceInvalid = invalidFields.includes('agencyServices');

    const handleServiceChange = (e) => {
        handleInputChange(e);
        setInvalidFields((prev) => prev.filter((field) => field !== 'agencyServices'));
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 border-b-2 pb-2">代行依頼</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                    label="ID"
                    name="agencyId"
                    value={formData.agencyId}
                    onChange={handleInputChange}
                    isInvalid={invalidFields.includes('agencyId')}
                    required
                />
                <FormInput
                    label="AP名"
                    name="agencyApName"
                    value={formData.agencyApName}
                    onChange={handleInputChange}
                    isInvalid={invalidFields.includes('agencyApName')}
                    required
                />
                <FormInput
                    label="契約者名義"
                    name="agencyContractorName"
                    value={formData.agencyContractorName}
                    onChange={handleInputChange}
                    isInvalid={invalidFields.includes('agencyContractorName')}
                    required
                    className="md:col-span-2"
                />
                <FormDateInput
                    label="引っ越し予定日"
                    name="agencyMoveDate"
                    value={formData.agencyMoveDate}
                    onChange={handleInputChange}
                    onBlur={handleDateBlurWithValidation}
                    isInvalid={invalidFields.includes('agencyMoveDate')}
                    required
                />
                <FormInput
                    label="引っ越し先住所"
                    name="agencyNewAddress"
                    value={formData.agencyNewAddress}
                    onChange={handleInputChange}
                    isInvalid={invalidFields.includes('agencyNewAddress')}
                    required
                    className="md:col-span-2"
                />
            </div>

            <div className={`p-4 rounded-xl border ${serviceInvalid ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <p className={`text-sm font-bold ${serviceInvalid ? 'text-red-700' : 'text-gray-700'}`}>
                            代行希望 <span className="text-red-500">*</span>
                        </p>
                        {serviceInvalid && <p className="text-xs text-red-600">いずれかの代行希望にチェックを入れてください。</p>}
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <FormCheckbox
                        label="電気"
                        name="agencyElectricity"
                        checked={formData.agencyElectricity}
                        onChange={handleServiceChange}
                        description=""
                        isInvalid={serviceInvalid}
                    />
                    <FormCheckbox
                        label="ガス"
                        name="agencyGas"
                        checked={formData.agencyGas}
                        onChange={handleServiceChange}
                        description=""
                        isInvalid={serviceInvalid}
                    />
                    <FormCheckbox
                        label="水道"
                        name="agencyWater"
                        checked={formData.agencyWater}
                        onChange={handleServiceChange}
                        description=""
                        isInvalid={serviceInvalid}
                    />
                    <FormCheckbox
                        label="灯油"
                        name="agencyKerosene"
                        checked={formData.agencyKerosene}
                        onChange={handleServiceChange}
                        description=""
                        isInvalid={serviceInvalid}
                    />
                </div>
            </div>

            {formData.agencyElectricity && (
                <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        label="電力会社名"
                        name="agencyElectricityCompany"
                        value={formData.agencyElectricityCompany}
                        onChange={handleInputChange}
                        isInvalid={invalidFields.includes('agencyElectricityCompany')}
                        required
                    />
                    <FormDateInput
                        label="電気利用開始日"
                        name="agencyElectricityStartDate"
                        value={formData.agencyElectricityStartDate}
                        onChange={handleInputChange}
                        onBlur={handleDateBlurWithValidation}
                        isInvalid={invalidFields.includes('agencyElectricityStartDate')}
                        required
                    />
                </div>
            )}

            {formData.agencyGas && (
                <div className="p-4 bg-orange-50/50 border border-orange-200 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormInput
                        label="ガス会社名"
                        name="agencyGasCompany"
                        value={formData.agencyGasCompany}
                        onChange={handleInputChange}
                        isInvalid={invalidFields.includes('agencyGasCompany')}
                        required
                    />
                    <FormDateInput
                        label="ガス開栓日"
                        name="agencyGasStartDate"
                        value={formData.agencyGasStartDate}
                        onChange={handleInputChange}
                        onBlur={handleDateBlurWithValidation}
                        isInvalid={invalidFields.includes('agencyGasStartDate')}
                        required
                    />
                    <FormSelect
                        label="ガス開栓時間"
                        name="agencyGasTimeSlot"
                        value={formData.agencyGasTimeSlot}
                        onChange={handleInputChange}
                        options={DAIKO_TIME_SLOTS}
                        isInvalid={invalidFields.includes('agencyGasTimeSlot')}
                        required
                    />
                </div>
            )}

            {formData.agencyWater && (
                <div className="p-4 bg-cyan-50/50 border border-cyan-200 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormDateInput
                        label="水道利用開始日"
                        name="agencyWaterStartDate"
                        value={formData.agencyWaterStartDate}
                        onChange={handleInputChange}
                        onBlur={handleDateBlurWithValidation}
                        isInvalid={invalidFields.includes('agencyWaterStartDate')}
                        required
                        className="md:col-span-2"
                    />
                </div>
            )}

            {formData.agencyKerosene && (
                <div className="p-4 bg-yellow-50/50 border border-yellow-200 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        label="灯油会社名"
                        name="agencyKeroseneCompany"
                        value={formData.agencyKeroseneCompany}
                        onChange={handleInputChange}
                        isInvalid={invalidFields.includes('agencyKeroseneCompany')}
                        required
                    />
                    <FormDateInput
                        label="灯油利用開始日"
                        name="agencyKeroseneStartDate"
                        value={formData.agencyKeroseneStartDate}
                        onChange={handleInputChange}
                        onBlur={handleDateBlurWithValidation}
                        isInvalid={invalidFields.includes('agencyKeroseneStartDate')}
                        required
                    />
                    <FormSelect
                        label="灯油開栓時間"
                        name="agencyKeroseneTimeSlot"
                        value={formData.agencyKeroseneTimeSlot}
                        onChange={handleInputChange}
                        options={DAIKO_TIME_SLOTS}
                        isInvalid={invalidFields.includes('agencyKeroseneTimeSlot')}
                        required
                    />
                    <FormSelect
                        label="灯油支払い方法"
                        name="agencyKerosenePaymentMethod"
                        value={formData.agencyKerosenePaymentMethod}
                        onChange={handleInputChange}
                        options={DAIKO_KEROSENE_PAYMENT_OPTIONS}
                        isInvalid={invalidFields.includes('agencyKerosenePaymentMethod')}
                        required
                    />
                </div>
            )}
        </div>
    );
};

export default DaikoTab;
