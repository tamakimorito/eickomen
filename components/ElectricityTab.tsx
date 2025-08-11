import React, { useMemo, useEffect } from 'https://esm.sh/react@^19.1.0';
import { 
    ELEC_PROVIDERS, YES_NO_OPTIONS,
    SET_NONE_OPTIONS, PRIMARY_PRODUCT_STATUS_OPTIONS, ATTACHED_OPTION_OPTIONS, 
    PAYMENT_METHOD_OPTIONS_EXTENDED, GENDERS, NEW_CONSTRUCTION_OPTIONS, TIME_SLOTS_TOHO, MAILING_OPTIONS,
    TIME_SLOTS_NICHI, TIME_SLOTS_SUTENE_SR, GAS_OPENING_TIME_SLOTS
} from '../constants.ts';
import { FormInput, FormSelect, FormRadioGroup, FormTextArea, FormDateInput } from './FormControls.tsx';

// A component to render the mailing address section based on provider rules
const MailingAddressSection = ({ provider, formData, handleInputChange, invalidFields }) => {
    const { mailingOption, currentPostalCode, currentAddress } = formData;
    
    const config = useMemo(() => {
        const defaultConfig = { showOptions: false, showFields: false, isRequired: false, fixedValue: null, description: null };
        switch(provider) {
            case 'すまいのでんき（ストエネ）':
            case 'プラチナでんき（ジャパン）':
            case 'キューエネスでんき':
            case 'ニチガス電気セット':
            case '東邦ガスセット':
            case '大阪ガス電気セット':
                return { ...defaultConfig, showOptions: true, showFields: mailingOption === '現住所', isRequired: mailingOption === '現住所', description: '新住所郵送（指定も可能）' };
            
            case 'リミックスでんき':
                return { ...defaultConfig, showFields: true, isRequired: false, description: '決済登録が難しい場合などの書面送付先を入力します。' };

            case '東京ガス電気セット':
                 return { ...defaultConfig, fixedValue: '現住所', showFields: true, isRequired: true, description: '書面は現住所へ送付されます。' };
            
            case 'ループでんき':
            case 'HTBエナジー':
            case 'ユーパワー UPOWER':
            case 'はぴe':
                return { ...defaultConfig, fixedValue: '新居', description: '書面は新住所（設置先）へ送付されます。' };

            default:
                return { ...defaultConfig, showOptions: false, showFields: false };
        }
    }, [provider, mailingOption]);

    // Effect to set fixed mailingOption value when provider changes
    useEffect(() => {
        if (config.fixedValue && mailingOption !== config.fixedValue) {
            handleInputChange({ target: { name: 'mailingOption', value: config.fixedValue, type: 'radio' } });
        }
    }, [provider, config.fixedValue, mailingOption, handleInputChange]);

    if (!config.showOptions && !config.showFields) {
        return null;
    }

    return (
        <div className="border-t-2 border-dashed border-blue-300 pt-6 space-y-4">
            <h3 className="text-lg font-bold text-blue-700">書面送付先</h3>
            {config.description && <p className="text-sm text-gray-600 -mt-2">{config.description}</p>}

            {config.showOptions && (
                 <FormRadioGroup
                    label="書面発送先"
                    name="mailingOption"
                    value={mailingOption}
                    onChange={handleInputChange}
                    options={MAILING_OPTIONS}
                    isInvalid={invalidFields.includes('mailingOption')}
                />
            )}
            
            {config.showFields && (
                 <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        label={provider === 'リミックスでんき' ? "郵送先郵便番号" : "現住所の郵便番号"}
                        name="currentPostalCode"
                        value={currentPostalCode}
                        onChange={handleInputChange}
                        isInvalid={invalidFields.includes('currentPostalCode')}
                        required={config.isRequired}
                    />
                    <FormInput
                        label={provider === 'リミックスでんき' ? "郵送先住所" : "現住所・物件名・部屋番号"}
                        name="currentAddress"
                        value={currentAddress}
                        onChange={handleInputChange}
                        className="md:col-span-2"
                        isInvalid={invalidFields.includes('currentAddress')}
                        required={config.isRequired}
                    />
                </div>
            )}
        </div>
    );
};


const ElectricityTab = ({ formData, setFormData, handleInputChange, handleDateBlur, handleNameBlur, invalidFields, isElecGasSetSelected }) => {
    const { elecProvider, elecRecordIdPrefix, isGasSet, isSakaiRoute } = formData;

    const showGasSetOption = elecProvider === 'すまいのでんき（ストエネ）';
    const showAllElectricOption = ['すまいのでんき（ストエネ）', 'プラチナでんき（ジャパン）', 'ループでんき'].includes(elecProvider);
    const showVacancyOption = ['すまいのでんき（ストエネ）', 'プラチナでんき（ジャパン）'].includes(elecProvider);
    const showContractConfirmationOption = ['すまいのでんき（ストエネ）', 'プラチナでんき（ジャパン）'].includes(elecProvider);
    const showNewConstructionOption = elecProvider === 'ユーパワー UPOWER';
    const showAttachedOption = useMemo(() => {
        return ['キューエネスでんき', 'リミックスでんき', 'プラチナでんき（ジャパン）'].includes(elecProvider) || 
                (elecProvider === 'すまいのでんき（ストエネ）' && formData.hasContractConfirmation === 'なし');
    }, [elecProvider, formData.hasContractConfirmation]);
    
    const gasTimeSlotOptions = useMemo(() => {
        if (elecProvider === 'すまいのでんき（ストエネ）' && elecRecordIdPrefix === 'SR') {
            return TIME_SLOTS_SUTENE_SR;
        }
        if (elecProvider === '東邦ガスセット') {
            return GAS_OPENING_TIME_SLOTS;
        }
        if (elecProvider === 'ニチガス電気セット') {
            return TIME_SLOTS_NICHI;
        }
        if (isElecGasSetSelected) {
            return GAS_OPENING_TIME_SLOTS;
        }
        return [];
    }, [elecProvider, elecRecordIdPrefix, isElecGasSetSelected]);

     const idPrefixDescription = useMemo(() => {
        const map = {
            'SR': 'ストエネ販路',
            'STJP:': 'ベンダー（トーマス販路）',
            'code:': 'ベンダー（YMCS）販路',
            'S': 'すま直販路',
            'ID:': 'キューエネス販路',
            'それ以外': 'スマサポ、イタンジ、ベンダー、その他販路',
        };
        return map[elecRecordIdPrefix] || '';
    }, [elecRecordIdPrefix]);

    const isHtb = elecProvider === 'HTBエナジー';
    const isUpower = elecProvider === 'ユーパワー UPOWER';
    const isHapie = elecProvider === 'はぴe';
    const isToho = elecProvider === '東邦ガスセット';
    const isQenes = elecProvider === 'キューエネスでんき';
    const isNichigasSet = elecProvider === 'ニチガス電気セット';
    const emailIsRequired = isQenes || isUpower || isHtb || elecProvider === 'ループでんき';


    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 border-b-2 pb-2">電気契約情報</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                    label="商材" name="elecProvider" value={elecProvider} onChange={handleInputChange}
                    options={ELEC_PROVIDERS} isInvalid={invalidFields.includes('elecProvider')} required
                    className="md:col-span-2"
                />
                <div className="md:col-span-2">
                    <FormInput
                        label="レコードID" name="recordId" value={formData.recordId} onChange={handleInputChange}
                        isInvalid={invalidFields.includes('recordId')}
                        required={!isSakaiRoute}
                        disabled={isSakaiRoute}
                        placeholder={isSakaiRoute ? 'サカイ販路選択時は入力不要' : '例: SR12345'}
                    />
                    {!isSakaiRoute && elecRecordIdPrefix && elecRecordIdPrefix !== 'サカイ' && (
                       <p className="text-sm text-gray-500 mt-1">自動判定された販路: <span className="font-bold text-blue-600">{idPrefixDescription}</span></p>
                    )}
                </div>
            </div>

            <div className="border-t-2 border-dashed border-blue-300 pt-6 space-y-4">
                <h3 className="text-lg font-bold text-blue-700">契約条件</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 p-4 bg-blue-50/50 rounded-lg border border-blue-200">
                    {showAllElectricOption && <FormRadioGroup label="オール電化" name="isAllElectric" value={formData.isAllElectric} onChange={handleInputChange} options={YES_NO_OPTIONS} isInvalid={invalidFields.includes('isAllElectric')} />}
                    {showVacancyOption && <FormRadioGroup label="空室" name="isVacancy" value={formData.isVacancy} onChange={handleInputChange} options={YES_NO_OPTIONS} isInvalid={invalidFields.includes('isVacancy')} />}
                    {showContractConfirmationOption && <FormRadioGroup label="契約確認" name="hasContractConfirmation" value={formData.hasContractConfirmation} onChange={handleInputChange} options={YES_NO_OPTIONS} isInvalid={invalidFields.includes('hasContractConfirmation')} />}
                    {showGasSetOption && <FormRadioGroup label="ガスセット" name="isGasSet" value={isGasSet} onChange={handleInputChange} options={SET_NONE_OPTIONS} isInvalid={invalidFields.includes('isGasSet')} />}
                    <FormRadioGroup label="主商材受注状況" name="primaryProductStatus" value={formData.primaryProductStatus} onChange={handleInputChange} options={PRIMARY_PRODUCT_STATUS_OPTIONS} isInvalid={invalidFields.includes('primaryProductStatus')} />
                    {showAttachedOption && <FormRadioGroup label="付帯OP" name="attachedOption" value={formData.attachedOption} onChange={handleInputChange} options={ATTACHED_OPTION_OPTIONS} isInvalid={invalidFields.includes('attachedOption')} />}
                    {showNewConstructionOption && <FormRadioGroup label="新築" name="isNewConstruction" value={formData.isNewConstruction} onChange={handleInputChange} options={NEW_CONSTRUCTION_OPTIONS} isInvalid={invalidFields.includes('isNewConstruction')} />}
                </div>
            </div>

            <div className="border-t-2 border-dashed border-blue-300 pt-6 space-y-4">
                <h3 className="text-lg font-bold text-blue-700">契約者情報</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="名乗り" name="greeting" value={formData.greeting} onChange={handleInputChange} isInvalid={invalidFields.includes('greeting')} />
                    <FormInput label="契約者名義（漢字）" name="contractorName" value={formData.contractorName} onChange={handleInputChange} onBlur={handleNameBlur} isInvalid={invalidFields.includes('contractorName')} required />
                    <FormInput label="契約者名義（フリガナ）" name="contractorNameKana" value={formData.contractorNameKana} onChange={handleInputChange} onBlur={handleNameBlur} isInvalid={invalidFields.includes('contractorNameKana')} required />
                    <FormSelect label="性別" name="gender" value={formData.gender} onChange={handleInputChange} options={GENDERS} isInvalid={invalidFields.includes('gender')} />
                    <FormDateInput label="生年月日（西暦）" name="dob" value={formData.dob} onChange={handleInputChange} onBlur={handleDateBlur} isInvalid={invalidFields.includes('dob')} placeholder="例: 1990/01/01" required />
                    <FormInput label="電話番号" name="phone" value={formData.phone} onChange={handleInputChange} isInvalid={invalidFields.includes('phone')} required />
                    <FormInput label="メアド" name="email" type="email" value={formData.email} onChange={handleInputChange} isInvalid={invalidFields.includes('email')} required={emailIsRequired}/>
                </div>
            </div>

            <div className="border-t-2 border-dashed border-blue-300 pt-6 space-y-4">
                <h3 className="text-lg font-bold text-blue-700">設置先情報</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="郵便番号" name="postalCode" value={formData.postalCode} onChange={handleInputChange} isInvalid={invalidFields.includes('postalCode')} required className="md:col-span-2" />
                    <FormInput label="住所" name="address" value={formData.address} onChange={handleInputChange} className="md:col-span-2" isInvalid={invalidFields.includes('address')} required />
                    <FormInput label="物件名＋部屋番号" name="buildingInfo" value={formData.buildingInfo} onChange={handleInputChange} className="md:col-span-2" isInvalid={invalidFields.includes('buildingInfo')} required />
                </div>
            </div>
            
            {isElecGasSetSelected ? (
                <div className="border-t-2 border-dashed border-blue-300 pt-6 space-y-4">
                    <h3 className="text-lg font-bold text-blue-700">利用開始日・開栓日</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50/50 rounded-lg border border-blue-200">
                        <FormDateInput label="電気利用開始日" name="moveInDate" value={formData.moveInDate} onChange={handleInputChange} onBlur={handleDateBlur} isInvalid={invalidFields.includes('moveInDate')} placeholder="例: 2024/08/01" required />
                        <FormDateInput label="ガス開栓日" name="gasOpeningDate" value={formData.gasOpeningDate} onChange={handleInputChange} onBlur={handleDateBlur} isInvalid={invalidFields.includes('gasOpeningDate')} placeholder="例: 2024/08/01" required />
                        <FormSelect label="ガス立会時間枠" name="gasOpeningTimeSlot" value={formData.gasOpeningTimeSlot} onChange={handleInputChange} options={gasTimeSlotOptions} isInvalid={invalidFields.includes('gasOpeningTimeSlot')} required className="md:col-span-2" />
                        {isNichigasSet && (
                            <>
                                <FormInput label="ガスエリア" name="gasArea" value={formData.gasArea} onChange={handleInputChange} placeholder="例: 東京ガス" isInvalid={invalidFields.includes('gasArea')} required />
                                <FormInput label="立会者" name="gasWitness" value={formData.gasWitness} onChange={handleInputChange} isInvalid={invalidFields.includes('gasWitness')} required />
                                <FormInput label="ガス事前連絡先" name="gasPreContact" value={formData.gasPreContact} onChange={handleInputChange} isInvalid={invalidFields.includes('gasPreContact')} required />
                            </>
                        )}
                        {isToho && (
                            <FormInput label="現住所" name="currentAddress" value={formData.currentAddress} onChange={handleInputChange} placeholder="！！必須！！" className="md:col-span-2" isInvalid={invalidFields.includes('currentAddress')} required />
                        )}
                    </div>
                </div>
            ) : (
                <div className="border-t-2 border-dashed border-blue-300 pt-6 space-y-4">
                     <h3 className="text-lg font-bold text-blue-700">利用開始日</h3>
                     <FormDateInput label="電気利用開始日" name="moveInDate" value={formData.moveInDate} onChange={handleInputChange} onBlur={handleDateBlur} isInvalid={invalidFields.includes('moveInDate')} placeholder="例: 2024/08/01" required />
                </div>
            )}


            <MailingAddressSection 
                provider={elecProvider}
                formData={formData}
                handleInputChange={handleInputChange}
                invalidFields={invalidFields}
            />

            <div className="border-t-2 border-dashed border-blue-300 pt-6 space-y-4">
                <h3 className="text-lg font-bold text-blue-700">その他</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="契確時間" name="elecConfirmationTime" value={formData.elecConfirmationTime} onChange={handleInputChange} isInvalid={invalidFields.includes('elecConfirmationTime')} />
                    <FormSelect label="支払い方法" name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange} options={PAYMENT_METHOD_OPTIONS_EXTENDED} isInvalid={invalidFields.includes('paymentMethod')} />
                    {isSakaiRoute && (
                        <>
                            <FormInput label="FM取込社名" name="elecImportCompanyName" value={formData.elecImportCompanyName} onChange={handleInputChange} isInvalid={invalidFields.includes('elecImportCompanyName')} />
                            <FormInput label="後確希望日/時間" name="elecPostConfirmationDateTime" value={formData.elecPostConfirmationDateTime} onChange={handleInputChange} isInvalid={invalidFields.includes('elecPostConfirmationDateTime')} />
                        </>
                    )}
                    {isQenes && (
                         <div className="md:col-span-2 p-4 bg-yellow-50 border border-yellow-300 rounded-lg space-y-4">
                            <p className="text-sm font-bold text-yellow-800">※法人の場合は電話対応者名を記載</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput label="対応者（漢字）" name="contactPersonName" value={formData.contactPersonName} onChange={handleInputChange} isInvalid={invalidFields.includes('contactPersonName')} />
                                <FormInput label="対応者（フリガナ）" name="contactPersonNameKana" value={formData.contactPersonNameKana} onChange={handleInputChange} isInvalid={invalidFields.includes('contactPersonNameKana')} />
                            </div>
                        </div>
                    )}
                    {isHtb && (
                         <FormInput label="架電希望日時" name="postConfirmationTime" value={formData.postConfirmationTime} onChange={handleInputChange} isInvalid={invalidFields.includes('postConfirmationTime')} />
                    )}
                    {isHapie && (
                        <FormInput label="繋がりやすい時間帯" name="postConfirmationTime" value={formData.postConfirmationTime} onChange={handleInputChange} placeholder="9～17時半" isInvalid={invalidFields.includes('postConfirmationTime')} />
                    )}
                    {isToho && (
                         <FormSelect label="後確希望時間" name="postConfirmationTime" value={formData.postConfirmationTime} onChange={handleInputChange} options={TIME_SLOTS_TOHO} isInvalid={invalidFields.includes('postConfirmationTime')} />
                    )}
                </div>
                <FormTextArea label="備考" name="remarks" value={formData.remarks} onChange={handleInputChange} rows={3} isInvalid={invalidFields.includes('remarks')} />
            </div>
        </div>
    );
};

export default ElectricityTab;