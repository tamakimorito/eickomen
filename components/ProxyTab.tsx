import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext.tsx';
import { FormCheckbox, FormDateInput, FormInput, FormSelect } from './FormControls.tsx';
import { PROXY_TIME_SLOTS, PROXY_OIL_PAYMENT_METHODS } from '../constants.ts';

const ProxyTab = () => {
    const { formData, handleInputChange, invalidFields, handleDateBlurWithValidation } = useContext(AppContext);
    const {
        proxyElectricity,
        proxyGas,
        proxyWater,
        proxyOil,
    } = formData;

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 border-b-2 pb-2">代行情報</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                    label="ID"
                    name="proxyId"
                    value={formData.proxyId}
                    onChange={handleInputChange}
                    isInvalid={invalidFields.includes('proxyId')}
                    required
                />
                <FormInput
                    label="AP名"
                    name="apName"
                    value={formData.apName}
                    onChange={handleInputChange}
                    isInvalid={invalidFields.includes('apName')}
                    required
                />
                <FormInput
                    label="契約者名義"
                    name="contractorName"
                    value={formData.contractorName}
                    onChange={handleInputChange}
                    isInvalid={invalidFields.includes('contractorName')}
                    required
                />
                <FormDateInput
                    label="引っ越し予定日"
                    name="moveInDate"
                    value={formData.moveInDate}
                    onChange={handleInputChange}
                    onBlur={handleDateBlurWithValidation}
                    isInvalid={invalidFields.includes('moveInDate')}
                    required
                />
                <FormInput
                    label="引っ越し先住所"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="md:col-span-2"
                    isInvalid={invalidFields.includes('address')}
                    required
                />
            </div>

            <div className="border-t-2 border-dashed border-blue-300 pt-4">
                <h4 className="text-lg font-bold text-blue-700 mb-2">代行希望</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <FormCheckbox
                        label="電気"
                        name="proxyElectricity"
                        checked={proxyElectricity}
                        onChange={handleInputChange}
                        isInvalid={invalidFields.includes('proxyServices')}
                        description=""
                    />
                    <FormCheckbox
                        label="ガス"
                        name="proxyGas"
                        checked={proxyGas}
                        onChange={handleInputChange}
                        isInvalid={invalidFields.includes('proxyServices')}
                        description=""
                    />
                    <FormCheckbox
                        label="水道"
                        name="proxyWater"
                        checked={proxyWater}
                        onChange={handleInputChange}
                        isInvalid={invalidFields.includes('proxyServices')}
                        description=""
                    />
                    <FormCheckbox
                        label="灯油"
                        name="proxyOil"
                        checked={proxyOil}
                        onChange={handleInputChange}
                        isInvalid={invalidFields.includes('proxyServices')}
                        description=""
                    />
                </div>
                {invalidFields.includes('proxyServices') && (
                    <p className="text-sm text-red-600 mt-2">少なくとも1つ選択してください。</p>
                )}
            </div>

            {proxyElectricity && (
                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200 space-y-4">
                    <h5 className="font-bold text-yellow-800">電気</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="電力会社名"
                            name="proxyElectricCompanyName"
                            value={formData.proxyElectricCompanyName}
                            onChange={handleInputChange}
                            isInvalid={invalidFields.includes('proxyElectricCompanyName')}
                            required
                        />
                        <FormDateInput
                            label="電気利用開始日"
                            name="proxyElectricStartDate"
                            value={formData.proxyElectricStartDate}
                            onChange={handleInputChange}
                            onBlur={handleDateBlurWithValidation}
                            isInvalid={invalidFields.includes('proxyElectricStartDate')}
                            required
                        />
                    </div>
                </div>
            )}

            {proxyGas && (
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-200 space-y-4">
                    <h5 className="font-bold text-orange-800">ガス</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormInput
                            label="ガス会社名"
                            name="proxyGasCompanyName"
                            value={formData.proxyGasCompanyName}
                            onChange={handleInputChange}
                            isInvalid={invalidFields.includes('proxyGasCompanyName')}
                            required
                        />
                        <FormDateInput
                            label="ガス開栓日"
                            name="proxyGasStartDate"
                            value={formData.proxyGasStartDate}
                            onChange={handleInputChange}
                            onBlur={handleDateBlurWithValidation}
                            isInvalid={invalidFields.includes('proxyGasStartDate')}
                            required
                        />
                        <FormSelect
                            label="ガス開栓時間"
                            name="proxyGasStartTime"
                            value={formData.proxyGasStartTime}
                            onChange={handleInputChange}
                            options={PROXY_TIME_SLOTS}
                            isInvalid={invalidFields.includes('proxyGasStartTime')}
                            required
                        />
                    </div>
                </div>
            )}

            {proxyWater && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-4">
                    <h5 className="font-bold text-blue-800">水道</h5>
                    <FormDateInput
                        label="水道利用開始日"
                        name="proxyWaterStartDate"
                        value={formData.proxyWaterStartDate}
                        onChange={handleInputChange}
                        onBlur={handleDateBlurWithValidation}
                        isInvalid={invalidFields.includes('proxyWaterStartDate')}
                        required
                    />
                </div>
            )}

            {proxyOil && (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-4">
                    <h5 className="font-bold text-emerald-800">灯油</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="灯油会社名"
                            name="proxyOilCompanyName"
                            value={formData.proxyOilCompanyName}
                            onChange={handleInputChange}
                            isInvalid={invalidFields.includes('proxyOilCompanyName')}
                            required
                        />
                        <FormDateInput
                            label="灯油利用開始日"
                            name="proxyOilStartDate"
                            value={formData.proxyOilStartDate}
                            onChange={handleInputChange}
                            onBlur={handleDateBlurWithValidation}
                            isInvalid={invalidFields.includes('proxyOilStartDate')}
                            required
                        />
                        <FormSelect
                            label="灯油開栓時間"
                            name="proxyOilStartTime"
                            value={formData.proxyOilStartTime}
                            onChange={handleInputChange}
                            options={PROXY_TIME_SLOTS}
                            isInvalid={invalidFields.includes('proxyOilStartTime')}
                            required
                        />
                        <FormSelect
                            label="灯油支払い方法"
                            name="proxyOilPaymentMethod"
                            value={formData.proxyOilPaymentMethod}
                            onChange={handleInputChange}
                            options={PROXY_OIL_PAYMENT_METHODS}
                            isInvalid={invalidFields.includes('proxyOilPaymentMethod')}
                            required
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProxyTab;
