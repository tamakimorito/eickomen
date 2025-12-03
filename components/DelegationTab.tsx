import React, { useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext.tsx';
import { FormCheckbox, FormDateInput, FormInput, FormSelect } from './FormControls.tsx';
import { DELEGATION_KEROSENE_PAYMENT_OPTIONS, DELEGATION_TIME_SLOT_OPTIONS } from '../constants.ts';

const DelegationTab = () => {
    const { formData, handleInputChange, handleDateBlurWithValidation, invalidFields } = useContext(AppContext);

    const serviceInvalid = invalidFields.includes('delegationServices');

    const selectedServices = useMemo(() => ([
        formData.delegationNeedsElectricity && '電気',
        formData.delegationNeedsGas && 'ガス',
        formData.delegationNeedsWater && '水道',
        formData.delegationNeedsKerosene && '灯油',
    ].filter(Boolean) as string[]), [
        formData.delegationNeedsElectricity,
        formData.delegationNeedsGas,
        formData.delegationNeedsWater,
        formData.delegationNeedsKerosene,
    ]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                    label="ID"
                    name="delegationId"
                    value={formData.delegationId}
                    onChange={handleInputChange}
                    isInvalid={invalidFields.includes('delegationId')}
                    required
                />
                <FormInput
                    label="契約者名義"
                    name="delegationContractorName"
                    value={formData.delegationContractorName}
                    onChange={handleInputChange}
                    isInvalid={invalidFields.includes('delegationContractorName')}
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormDateInput
                    label="引っ越し予定日"
                    name="delegationMoveDate"
                    value={formData.delegationMoveDate}
                    onChange={handleInputChange}
                    onBlur={handleDateBlurWithValidation}
                    isInvalid={invalidFields.includes('delegationMoveDate')}
                    placeholder="例: 2024/08/01"
                    required
                />
                <FormInput
                    label="引っ越し先住所"
                    name="delegationNewAddress"
                    value={formData.delegationNewAddress}
                    onChange={handleInputChange}
                    isInvalid={invalidFields.includes('delegationNewAddress')}
                    required
                />
            </div>

            <div className={`border rounded-2xl p-4 ${serviceInvalid ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${serviceInvalid ? 'text-red-600' : 'text-gray-700'}`}>
                            代行希望<span className="text-red-500 ml-1">*</span>
                        </span>
                        <span className="text-xs text-gray-500">希望するライフラインを選択してください</span>
                    </div>
                    {serviceInvalid && <span className="text-xs text-red-600 font-semibold">少なくとも1つ選択してください</span>}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <FormCheckbox
                        label="電気"
                        name="delegationNeedsElectricity"
                        checked={formData.delegationNeedsElectricity}
                        onChange={handleInputChange}
                        description=""
                        isInvalid={serviceInvalid}
                    />
                    <FormCheckbox
                        label="ガス"
                        name="delegationNeedsGas"
                        checked={formData.delegationNeedsGas}
                        onChange={handleInputChange}
                        description=""
                        isInvalid={serviceInvalid}
                    />
                    <FormCheckbox
                        label="水道"
                        name="delegationNeedsWater"
                        checked={formData.delegationNeedsWater}
                        onChange={handleInputChange}
                        description=""
                        isInvalid={serviceInvalid}
                    />
                    <FormCheckbox
                        label="灯油"
                        name="delegationNeedsKerosene"
                        checked={formData.delegationNeedsKerosene}
                        onChange={handleInputChange}
                        description=""
                        isInvalid={serviceInvalid}
                    />
                </div>
            </div>

            {formData.delegationNeedsElectricity && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        label="電力会社名"
                        name="delegationElectricCompany"
                        value={formData.delegationElectricCompany}
                        onChange={handleInputChange}
                        isInvalid={invalidFields.includes('delegationElectricCompany')}
                        required
                    />
                    <FormDateInput
                        label="電気利用開始日"
                        name="delegationElectricStartDate"
                        value={formData.delegationElectricStartDate}
                        onChange={handleInputChange}
                        onBlur={handleDateBlurWithValidation}
                        isInvalid={invalidFields.includes('delegationElectricStartDate')}
                        required
                    />
                </div>
            )}

            {formData.delegationNeedsGas && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormInput
                        label="ガス会社名"
                        name="delegationGasCompany"
                        value={formData.delegationGasCompany}
                        onChange={handleInputChange}
                        isInvalid={invalidFields.includes('delegationGasCompany')}
                        required
                    />
                    <FormDateInput
                        label="ガス開栓日"
                        name="delegationGasStartDate"
                        value={formData.delegationGasStartDate}
                        onChange={handleInputChange}
                        onBlur={handleDateBlurWithValidation}
                        isInvalid={invalidFields.includes('delegationGasStartDate')}
                        required
                    />
                    <FormSelect
                        label="ガス開栓時間"
                        name="delegationGasTimeSlot"
                        value={formData.delegationGasTimeSlot}
                        onChange={handleInputChange}
                        options={DELEGATION_TIME_SLOT_OPTIONS}
                        isInvalid={invalidFields.includes('delegationGasTimeSlot')}
                        required
                    />
                </div>
            )}

            {formData.delegationNeedsWater && (
                <FormDateInput
                    label="水道利用開始日"
                    name="delegationWaterStartDate"
                    value={formData.delegationWaterStartDate}
                    onChange={handleInputChange}
                    onBlur={handleDateBlurWithValidation}
                    isInvalid={invalidFields.includes('delegationWaterStartDate')}
                    required
                />
            )}

            {formData.delegationNeedsKerosene && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        label="灯油会社名"
                        name="delegationKeroseneCompany"
                        value={formData.delegationKeroseneCompany}
                        onChange={handleInputChange}
                        isInvalid={invalidFields.includes('delegationKeroseneCompany')}
                        required
                    />
                    <FormDateInput
                        label="灯油利用開始日"
                        name="delegationKeroseneStartDate"
                        value={formData.delegationKeroseneStartDate}
                        onChange={handleInputChange}
                        onBlur={handleDateBlurWithValidation}
                        isInvalid={invalidFields.includes('delegationKeroseneStartDate')}
                        required
                    />
                    <FormSelect
                        label="灯油開栓時間"
                        name="delegationKeroseneTimeSlot"
                        value={formData.delegationKeroseneTimeSlot}
                        onChange={handleInputChange}
                        options={DELEGATION_TIME_SLOT_OPTIONS}
                        isInvalid={invalidFields.includes('delegationKeroseneTimeSlot')}
                        required
                    />
                    <FormSelect
                        label="灯油支払い方法"
                        name="delegationKerosenePayment"
                        value={formData.delegationKerosenePayment}
                        onChange={handleInputChange}
                        options={DELEGATION_KEROSENE_PAYMENT_OPTIONS}
                        isInvalid={invalidFields.includes('delegationKerosenePayment')}
                        required
                    />
                </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-900">
                <p className="font-semibold mb-1">入力メモ</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>必要なライフラインにチェックを入れると対応する入力欄が表示されます。</li>
                    <li>日付はYYYY/MM/DD形式で入力してください。</li>
                </ul>
                <p className="mt-2 text-xs text-blue-700">入力内容は右側のコメントに自動反映されます。</p>
            </div>
        </div>
    );
};

export default DelegationTab;
