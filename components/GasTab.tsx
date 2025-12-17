import React, { useMemo, useContext, useEffect } from 'react';
import { 
    GAS_PROVIDERS, YES_NO_OPTIONS,
    PRIMARY_PRODUCT_STATUS_OPTIONS, ATTACHED_OPTION_OPTIONS, GENDERS, 
    PAYMENT_METHOD_OPTIONS_EXTENDED, MAILING_OPTIONS, GAS_OPENING_TIME_SLOTS, 
    TIME_SLOTS_NICHI, TIME_SLOTS_SUTENE_SR, TIME_SLOTS_TOKYO_GAS, NICHIGAS_GAS_AREAS
} from '../constants.ts';
import { AppContext } from '../context/AppContext.tsx';
import { FormInput, FormSelect, FormRadioGroup, FormTextArea, FormDateInput, FormCheckbox } from './FormControls.tsx';

const MailingAddressSection = () => {
    const { formData, handleInputChange, invalidFields, handlePostalCodeBlur } = useContext(AppContext);
    const { gasProvider, mailingOption, currentPostalCode, currentAddress, mailingBuildingInfo } = formData;
    
    const config = useMemo(() => {
        const defaultConfig = { showOptions: false, showFields: false, isRequired: false, fixedValue: null, description: null };
        switch(gasProvider) {
            case 'すまいのでんき（ストエネ）': // This is "すまいのガス"
                 return { ...defaultConfig, showOptions: false, showFields: false, isRequired: false, fixedValue: null, description: '新住所郵送（指定も可能、その場合備考欄に特記事項としてわかりやすく書くこと）' };
            case 'ニチガス単品':
                return { ...defaultConfig, showOptions: true, showFields: mailingOption === '現住所', isRequired: mailingOption === '現住所', description: '書面送付先を選択してください。' };
            case '大阪ガス単品':
                return { ...defaultConfig, showOptions: true, showFields: mailingOption === '現住所', isRequired: mailingOption === '現住所', description: '書面送付先を選択してください。' };
            
            case '東邦ガス単品':
                 return { ...defaultConfig, fixedValue: '現住所', showFields: true, isRequired: true, description: '書面は現住所へ送付されます。' };

            case '東急ガス':
                return { ...defaultConfig, fixedValue: '現住所', showFields: true, isRequired: true, description: 'ご契約内容確認書はお引越し前の現住所に送付されます。' };
            
            case '東京ガス単品':
                return { ...defaultConfig, showOptions: false, showFields: false, description: '書面送付先のヒアリングは不要です。' };

            default:
                return { ...defaultConfig, showOptions: false, showFields: false };
        }
    }, [gasProvider, mailingOption]);

    if (!config.showOptions && !config.showFields && !config.description) {
        return null;
    }
    
    const handleDetachedHouseChange = (e) => {
        const isChecked = e.target.checked;
        const currentBuildingInfo = mailingBuildingInfo || '';
        let baseInfo = currentBuildingInfo.replace(/戸建て$/, '').trim();
        const newValue = isChecked ? `${baseInfo}戸建て`.trim() : baseInfo;
        
        handleInputChange({
            target: { name: 'mailingBuildingInfo', value: newValue, type: 'text' }
        });
    };

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
                    required
                />
            )}
            
            {config.showFields && (
                 <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        label="現住所の郵便番号"
                        name="currentPostalCode"
                        value={currentPostalCode}
                        onChange={handleInputChange}
                        onBlur={(e) => handlePostalCodeBlur('currentPostalCode', e.target.value)}
                        isInvalid={invalidFields.includes('currentPostalCode')}
                        required={config.isRequired}
                    />
                    <FormInput
                        label="現住所"
                        name="currentAddress"
                        value={currentAddress}
                        onChange={handleInputChange}
                        className="md-col-span-2"
                        isInvalid={invalidFields.includes('currentAddress')}
                        required={config.isRequired}
                    />
                    <div className="md:col-span-2 flex items-end gap-2">
                         <FormInput
                            label="現住所の物件名＋部屋番号"
                            name="mailingBuildingInfo"
                            value={mailingBuildingInfo}
                            onChange={handleInputChange}
                            className="flex-grow"
                            isInvalid={invalidFields.includes('mailingBuildingInfo')}
                            required={config.isRequired}
                        />
                        <FormCheckbox
                            label="戸建て"
                            name="isMailingDetached" // UI-only name
                            checked={(mailingBuildingInfo || '').endsWith('戸建て')}
                            onChange={handleDetachedHouseChange}
                            className="pb-2"
                            description=""
                            isInvalid={invalidFields.includes('mailingBuildingInfo')}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};


const GasTab = () => {
    const { formData, handleInputChange, handleDateBlurWithValidation, handleNameBlur, handleIdBlur, invalidFields, handlePhoneBlur, handleKanaBlur, handlePostalCodeBlur } = useContext(AppContext);
    const { gasProvider, gasRecordIdPrefix, isSakaiRoute } = formData;

    useEffect(() => {
        if (formData.gasProvider === '東急ガス' && formData.gasHasContractConfirmation !== 'あり') {
            handleInputChange({ target: { name: 'gasHasContractConfirmation', value: 'あり', type: 'text' } } as any);
        }
    }, [formData.gasProvider, formData.gasHasContractConfirmation, handleInputChange]);
    
    const isSumainoGas = gasProvider === 'すまいのでんき（ストエネ）';
    const isTokyu = gasProvider === '東急ガス';
    const isNichi = gasProvider === 'ニチガス単品';
    const isTokyo = gasProvider === '東京ガス単品';
    const isToho = gasProvider === '東邦ガス単品';
    const isOsakaGas = gasProvider === '大阪ガス単品';

    
    const showAttachedOption = useMemo(() => {
        return isSumainoGas && formData.gasHasContractConfirmation === 'なし';
    }, [isSumainoGas, formData.gasHasContractConfirmation]);

    const needsWitness = useMemo(() => {
        return ['すまいのでんき（ストエネ）', '東京ガス単品', '東邦ガス単品', '東急ガス', 'ニチガス単品', '大阪ガス単品'].includes(gasProvider);
    }, [gasProvider]);

    const gasTimeSlotOptions = useMemo(() => {
        // ストエネ関東・期間限定ルール
        if (gasProvider === 'すまいのでんき（ストエネ）') {
            const isKanto = /^(東京都|神奈川県|千葉県|埼玉県|茨城県|栃木県|群馬県|山梨県)/.test(formData.address || '');
            if (isKanto && formData.gasOpeningDate) {
                const targetDate = new Date(formData.gasOpeningDate);
                targetDate.setHours(0, 0, 0, 0);
                const start = new Date(2026, 1, 1); // 2026/02/01
                const end = new Date(2026, 3, 30);  // 2026/04/30

                if (targetDate >= start && targetDate <= end) {
                    return [
                        { value: '9:00〜12:00', label: '9:00〜12:00' },
                        { value: 'PM 時間指定なし', label: 'PM 時間指定なし' },
                    ];
                }
            }
        }

        if (gasProvider === 'すまいのでんき（ストエネ）' && gasRecordIdPrefix === 'SR') {
            return TIME_SLOTS_SUTENE_SR;
        }
        if (gasProvider === '東京ガス単品') {
            return TIME_SLOTS_TOKYO_GAS;
        }
        if (gasProvider === 'ニチガス単品') {
            return TIME_SLOTS_NICHI;
        }
        if (['東急ガス', '東邦ガス単品', 'すまいのでんき（ストエネ）', '大阪ガス単品'].includes(gasProvider)) {
            return GAS_OPENING_TIME_SLOTS;
        }
        return [];
    }, [gasProvider, gasRecordIdPrefix, formData.address, formData.gasOpeningDate]);
    
    const idPrefixDescription = useMemo(() => {
        const lowerCasePrefix = gasRecordIdPrefix?.toLowerCase();
        const map = {
            'sr': 'ストエネ販路',
            'stjp:': 'ベンダー（トーマス販路）',
            's': 'すま直販路',
            'それ以外': 'スマサポ、イタンジ、ベンダー、その他販路',
        };
        return map[lowerCasePrefix] || '';
    }, [gasRecordIdPrefix]);

    // Conditional rendering based on comment templates
    const showGreeting = !isTokyo;
    const showEmail = isTokyu;
    const showPaymentMethod = !isTokyo && !isOsakaGas;
    const showGender = isSumainoGas;

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 border-b-2 pb-2">ガス契約情報</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                    label="商材" name="gasProvider" value={gasProvider} onChange={handleInputChange}
                    options={GAS_PROVIDERS} isInvalid={invalidFields.includes('gasProvider')} required
                    className="md:col-span-2"
                />
                 <div className="md:col-span-2">
                    <FormInput
                        label="レコードID" name="recordId" value={formData.recordId} onChange={handleInputChange}
                        onBlur={handleIdBlur}
                        isInvalid={invalidFields.includes('recordId')}
                        required
                        placeholder="例: SR12345"
                    />
                    {gasRecordIdPrefix && gasRecordIdPrefix !== 'サカイ' && (
                       <p className="text-sm text-gray-500 mt-1">自動判定された販路: <span className="font-bold text-blue-600">{idPrefixDescription}</span></p>
                    )}
                </div>
            </div>

            <div className="border-t-2 border-dashed border-blue-300 pt-6 space-y-4">
                 <h3 className="text-lg font-bold text-blue-700">契約条件</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 p-4 bg-blue-50/50 rounded-lg border border-blue-200">
                    {isSumainoGas && (
                         <>
                            <FormRadioGroup label="空室" name="gasIsVacancy" value={formData.gasIsVacancy} onChange={handleInputChange} options={YES_NO_OPTIONS} isInvalid={invalidFields.includes('gasIsVacancy')} />
                            <FormRadioGroup label="契約確認は必要ですか？" name="gasHasContractConfirmation" value={formData.gasHasContractConfirmation} onChange={handleInputChange} options={YES_NO_OPTIONS} isInvalid={invalidFields.includes('gasHasContractConfirmation')} />
                            {showAttachedOption && <FormRadioGroup label="付帯OP" name="attachedOption" value={formData.attachedOption} onChange={handleInputChange} options={ATTACHED_OPTION_OPTIONS} isInvalid={invalidFields.includes('attachedOption')} />}
                        </>
                    )}
                    {(isSumainoGas || isTokyu) && formData.gasHasContractConfirmation !== 'なし' && (
                         <FormRadioGroup label="主商材受注状況" name="primaryProductStatus" value={formData.primaryProductStatus} onChange={handleInputChange} options={PRIMARY_PRODUCT_STATUS_OPTIONS} isInvalid={invalidFields.includes('primaryProductStatus')} />
                    )}
                     {!isSumainoGas && !isTokyu && <p className="text-gray-600 md:col-span-2">この商材に特有の契約条件はありません。</p>}
                </div>
            </div>
            
            <div className="border-t-2 border-dashed border-blue-300 pt-6 space-y-4">
                <h3 className="text-lg font-bold text-blue-700">契約者情報</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {showGreeting && <FormInput label="名乗り" name="greeting" value={formData.greeting} onChange={handleInputChange} isInvalid={invalidFields.includes('greeting')} required={isOsakaGas} />}
                    <FormInput label="契約者名義（漢字）" name="contractorName" value={formData.contractorName} onChange={handleInputChange} onBlur={handleNameBlur} isInvalid={invalidFields.includes('contractorName')} required />
                    <FormInput label="契約者名義（フリガナ）" name="contractorNameKana" value={formData.contractorNameKana} onChange={handleInputChange} onBlur={handleKanaBlur} isInvalid={invalidFields.includes('contractorNameKana')} required />
                    {showGender && <FormSelect label="性別" name="gender" value={formData.gender} onChange={handleInputChange} options={GENDERS} isInvalid={invalidFields.includes('gender')} />}
                    <FormDateInput label="生年月日（西暦）" name="dob" value={formData.dob} onChange={handleInputChange} onBlur={handleDateBlurWithValidation} isInvalid={invalidFields.includes('dob')} placeholder="例: 1990/01/01" required />
                    <FormInput label="電話番号" name="phone" value={formData.phone} onChange={handleInputChange} onBlur={handlePhoneBlur} isInvalid={invalidFields.includes('phone')} required />
                    {showEmail && <FormInput label="メアド" name="email" type="email" value={formData.email} onChange={handleInputChange} isInvalid={invalidFields.includes('email')} required={isTokyu} />}
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
                </div>
            </div>

                        <div className="border-t-2 border-dashed border-blue-300 pt-6 space-y-4">
                <h3 className="text-lg font-bold text-blue-700">ガス利用開始情報</h3>
                <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200 space-y-4">
                     <FormDateInput
                        label="ガス利用開始日"
                        name="gasOpeningDate"
                        value={formData.gasOpeningDate}
                        onChange={handleInputChange}
                        onBlur={handleDateBlurWithValidation}
                        isInvalid={invalidFields.includes('gasOpeningDate')}
                        placeholder="例: 2024/08/01"
                        required
                    />
                    {needsWitness && (
                         <div className="pt-4 mt-4 border-t border-blue-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormSelect
                                    label="立会時間枠"
                                    name="gasOpeningTimeSlot"
                                    value={formData.gasOpeningTimeSlot}
                                    onChange={handleInputChange}
                                    options={gasTimeSlotOptions}
                                    isInvalid={invalidFields.includes('gasOpeningTimeSlot')}
                                    required
                                    className="md:col-span-2"
                                />
                                {isNichi && (
                                    <>
                                        <FormInput label="立会者" name="gasWitness" value={formData.gasWitness} onChange={handleInputChange} isInvalid={invalidFields.includes('gasWitness')} required />
                                        <FormInput label="ガス事前連絡先" name="gasPreContact" value={formData.gasPreContact} onChange={handleInputChange} onBlur={handlePhoneBlur} isInvalid={invalidFields.includes('gasPreContact')} required />
                                        <FormSelect
                                            label="ガスエリア"
                                            name="gasArea"
                                            value={formData.gasArea}
                                            onChange={handleInputChange}
                                            options={NICHIGAS_GAS_AREAS}
                                            isInvalid={invalidFields.includes('gasArea')}
                                            required
                                        />
                                    </>
                                )}
                                {(isTokyo || isToho) && (
                                    <div className="md:col-span-2 space-y-4">
                                        <FormCheckbox
                                            label="法人契約"
                                            name="gasIsCorporate"
                                            checked={formData.gasIsCorporate}
                                            onChange={handleInputChange}
                                            isInvalid={invalidFields.includes('gasIsCorporate')}
                                            description="法人契約の場合はチェックを入れてください"
                                        />
                                        {formData.gasIsCorporate && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                                <FormInput label="立ち合い担当者フルネーム" name="gasWitness" value={formData.gasWitness} onChange={handleInputChange} onBlur={handleNameBlur} isInvalid={invalidFields.includes('gasWitness')} required={formData.gasIsCorporate} />
                                                <FormInput label="立ち合い連絡先" name="gasPreContact" value={formData.gasPreContact} onChange={handleInputChange} onBlur={handlePhoneBlur} isInvalid={invalidFields.includes('gasPreContact')} required={formData.gasIsCorporate} />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>


            
            {!isOsakaGas && <MailingAddressSection />}

            <div className="border-t-2 border-dashed border-blue-300 pt-6 space-y-4">
                <h3 className="text-lg font-bold text-blue-700">その他</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {showPaymentMethod && <FormSelect label="支払い方法" name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange} options={PAYMENT_METHOD_OPTIONS_EXTENDED} isInvalid={invalidFields.includes('paymentMethod')} />}
                    
                    {isSumainoGas && formData.gasHasContractConfirmation === 'あり' && (
                        <FormInput 
                            label="契確時間" 
                            name="elecConfirmationTime" 
                            value={formData.elecConfirmationTime} 
                            onChange={handleInputChange} 
                            isInvalid={invalidFields.includes('elecConfirmationTime')}
                            required
                        />
                    )}
                    {isSakaiRoute && (
                         <FormInput label="ガス" name="gasArea" value={formData.gasArea} onChange={handleInputChange} placeholder="「なし」と入力" isInvalid={invalidFields.includes('gasArea')} />
                    )}
                     {isTokyu && (
                          <FormInput label="契確時間" name="elecConfirmationTime" value={formData.elecConfirmationTime} onChange={handleInputChange} isInvalid={invalidFields.includes('elecConfirmationTime')} />
                    )}
                    {isSakaiRoute && (
                        <FormInput label="後確希望日/時間" name="postConfirmationTime" value={formData.postConfirmationTime} onChange={handleInputChange} isInvalid={invalidFields.includes('postConfirmationTime')} />
                    )}
                 </div>
                <FormTextArea label="備考" name="gasRemarks" value={formData.gasRemarks} onChange={handleInputChange} rows={3} isInvalid={invalidFields.includes('gasRemarks')} />
            </div>
        </div>
    );
};

export default GasTab;