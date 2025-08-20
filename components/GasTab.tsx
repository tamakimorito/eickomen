import React, { useMemo, useContext } from 'https://esm.sh/react@^19.1.0';
import { 
    GAS_PROVIDERS, YES_NO_OPTIONS,
    PRIMARY_PRODUCT_STATUS_OPTIONS, ATTACHED_OPTION_OPTIONS, GENDERS, 
    PAYMENT_METHOD_OPTIONS_EXTENDED, MAILING_OPTIONS, GAS_OPENING_TIME_SLOTS, 
    TIME_SLOTS_NICHI, TIME_SLOTS_SUTENE_SR, TIME_SLOTS_TOKYO_GAS
} from '../constants.ts';
import { AppContext } from '../context/AppContext.tsx';
import { FormInput, FormSelect, FormRadioGroup, FormTextArea, FormDateInput, FormCheckbox } from './FormControls.tsx';

const MailingAddressSection = () => {
    const { formData, handleInputChange, invalidFields } = useContext(AppContext);
    const { gasProvider, mailingOption, currentPostalCode, currentAddress } = formData;
    
    const config = useMemo(() => {
        const defaultConfig = { showOptions: false, showFields: false, isRequired: false, fixedValue: null, description: null };
        switch(gasProvider) {
            case 'すまいのでんき（ストエネ）': // This is "すまいのガス"
            case 'ニチガス単品':
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
                        isInvalid={invalidFields.includes('currentPostalCode')}
                        required={config.isRequired}
                    />
                    <FormInput
                        label="現住所・物件名・部屋番号"
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


const GasTab = () => {
    const { formData, handleInputChange, handleDateBlur, handleNameBlur, handleIdBlur, invalidFields } = useContext(AppContext);
    const { gasProvider, gasRecordIdPrefix, isSakaiRoute } = formData;
    
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
    }, [gasProvider, gasRecordIdPrefix]);
    
    const idPrefixDescription = useMemo(() => {
        const map = {
            'SR': 'ストエネ販路',
            'STJP:': 'ベンダー（トーマス販路）',
            'S': 'すま直販路',
            'それ以外': 'スマサポ、イタンジ、ベンダー、その他販路',
        };
        return map[gasRecordIdPrefix] || '';
    }, [gasRecordIdPrefix]);

    // Conditional rendering based on comment templates
    const showGreeting = !isTokyo && !isOsakaGas;
    const showEmail = isTokyu;
    const showPaymentMethod = !isTokyo;
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
                        required={!isSakaiRoute}
                        disabled={isSakaiRoute}
                        placeholder={isSakaiRoute ? 'サカイ販路選択時は入力不要' : '例: SR12345'}
                    />
                     {!isSakaiRoute && gasRecordIdPrefix && gasRecordIdPrefix !== 'サカイ' && (
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
                            <FormRadioGroup label="契確は必要ですか？" name="gasHasContractConfirmation" value={formData.gasHasContractConfirmation} onChange={handleInputChange} options={YES_NO_OPTIONS} isInvalid={invalidFields.includes('gasHasContractConfirmation')} />
                            {showAttachedOption && <FormRadioGroup label="付帯OP" name="attachedOption" value={formData.attachedOption} onChange={handleInputChange} options={ATTACHED_OPTION_OPTIONS} isInvalid={invalidFields.includes('attachedOption')} />}
                        </>
                    )}
                    {isTokyu && (
                        <FormRadioGroup label="契確は必要ですか？" name="gasHasContractConfirmation" value={formData.gasHasContractConfirmation} onChange={handleInputChange} options={[{value: 'あり', label: 'あり'}]} disabled isInvalid={invalidFields.includes('gasHasContractConfirmation')} />
                    )}
                    {(isSumainoGas || isTokyu) && (
                         <FormRadioGroup label="主商材受注状況" name="primaryProductStatus" value={formData.primaryProductStatus} onChange={handleInputChange} options={PRIMARY_PRODUCT_STATUS_OPTIONS} isInvalid={invalidFields.includes('primaryProductStatus')} />
                    )}
                     {!isSumainoGas && !isTokyu && <p className="text-gray-600 md:col-span-2">この商材に特有の契約条件はありません。</p>}
                </div>
            </div>
            
            <div className="border-t-2 border-dashed border-blue-300 pt-6 space-y-4">
                <h3 className="text-lg font-bold text-blue-700">ガス利用開始情報</h3>
                <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200 space-y-4">
                     <FormDateInput
                        label="ガス利用開始日"
                        name="moveInDate"
                        value={formData.moveInDate}
                        onChange={handleInputChange}
                        onBlur={handleDateBlur}
                        isInvalid={invalidFields.includes('moveInDate')}
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
                                        <FormInput label="ガス事前連絡先" name="gasPreContact" value={formData.gasPreContact} onChange={handleInputChange} isInvalid={invalidFields.includes('gasPreContact')} required />
                                        <FormInput label="ガスエリア" name="gasArea" value={formData.gasArea} onChange={handleInputChange} placeholder="例: 東京ガス" isInvalid={invalidFields.includes('gasArea')} required />
                                    </>
                                )}
                                {isTokyo && (
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
                                                <FormInput label="立ち合い担当者フルネーム" name="gasWitness" value={formData.gasWitness} onChange={handleInputChange} isInvalid={invalidFields.includes('gasWitness')} required={formData.gasIsCorporate} />
                                                <FormInput label="立ち合い連絡先" name="gasPreContact" value={formData.gasPreContact} onChange={handleInputChange} isInvalid={invalidFields.includes('gasPreContact')} required={formData.gasIsCorporate} />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="border-t-2 border-dashed border-blue-300 pt-6 space-y-4">
                <h3 className="text-lg font-bold text-blue-700">契約者情報</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {showGreeting && <FormInput label="名乗り" name="greeting" value={formData.greeting} onChange={handleInputChange} isInvalid={invalidFields.includes('greeting')} />}
                    <FormInput label="契約者名義（漢字）" name="contractorName" value={formData.contractorName} onChange={handleInputChange} onBlur={handleNameBlur} isInvalid={invalidFields.includes('contractorName')} required />
                    <FormInput label="契約者名義（フリガナ）" name="contractorNameKana" value={formData.contractorNameKana} onChange={handleInputChange} onBlur={handleNameBlur} isInvalid={invalidFields.includes('contractorNameKana')} required />
                    {showGender && <FormSelect label="性別" name="gender" value={formData.gender} onChange={handleInputChange} options={GENDERS} isInvalid={invalidFields.includes('gender')} />}
                    <FormDateInput label="生年月日（西暦）" name="dob" value={formData.dob} onChange={handleInputChange} onBlur={handleDateBlur} isInvalid={invalidFields.includes('dob')} placeholder="例: 1990/01/01" required />
                    <FormInput label="電話番号" name="phone" value={formData.phone} onChange={handleInputChange} isInvalid={invalidFields.includes('phone')} required />
                    {showEmail && <FormInput label="メアド" name="email" type="email" value={formData.email} onChange={handleInputChange} isInvalid={invalidFields.includes('email')} required={isTokyu} />}
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
            
            <MailingAddressSection />

            <div className="border-t-2 border-dashed border-blue-300 pt-6 space-y-4">
                <h3 className="text-lg font-bold text-blue-700">その他</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {showPaymentMethod && <FormSelect label="支払い方法" name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange} options={PAYMENT_METHOD_OPTIONS_EXTENDED} isInvalid={invalidFields.includes('paymentMethod')} />}
                    
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
                <FormTextArea label="備考" name="remarks" value={formData.remarks} onChange={handleInputChange} rows={3} isInvalid={invalidFields.includes('remarks')} />
            </div>
        </div>
    );
};

export default GasTab;