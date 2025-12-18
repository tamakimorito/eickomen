import React, { useMemo, useContext, useEffect } from 'react';
import { 
    ELEC_PROVIDERS, YES_NO_OPTIONS, ATTACHED_OPTION_OPTIONS,
    SET_NONE_OPTIONS, PRIMARY_PRODUCT_STATUS_OPTIONS, 
    PAYMENT_METHOD_OPTIONS_EXTENDED, GENDERS, NEW_CONSTRUCTION_OPTIONS, TIME_SLOTS_TOHO, MAILING_OPTIONS,
    TIME_SLOTS_NICHI, TIME_SLOTS_SUTENE_SR, GAS_OPENING_TIME_SLOTS, TIME_SLOTS_TOKYO_GAS, TIME_SLOTS_TOHO_GAS_SETUP,
    NICHIGAS_GAS_AREAS
} from '../constants.ts';
import { AppContext } from '../context/AppContext.tsx';
import { FormInput, FormSelect, FormRadioGroup, FormTextArea, FormDateInput, FormCheckbox } from './FormControls.tsx';

// A component to render the mailing address section based on provider rules
const MailingAddressSection = () => {
    const { formData, handleInputChange, invalidFields, handlePostalCodeBlur } = useContext(AppContext);
    const { elecProvider, mailingOption, currentPostalCode, currentAddress, mailingBuildingInfo, isGasSet } = formData;
    
    const config = useMemo(() => {
        const defaultConfig = { showOptions: false, showFields: false, isRequired: false, fixedValue: null, description: null };
        switch(elecProvider) {
            case 'すまいのでんき（ストエネ）':
            case 'プラチナでんき（ジャパン）':
            case '大阪ガス電気セット':
            case 'キューエネスでんき':
                return { ...defaultConfig, showOptions: false, showFields: false, isRequired: false, description: '新住所郵送（指定も可能、その場合備考欄に特記事項としてわかりやすく書くこと）' };

            case 'リミックスでんき':
                return { ...defaultConfig, showOptions: true, showFields: mailingOption === '現住所', isRequired: true, description: '書面送付先を選択してください。' };
            
            case 'ニチガス電気セット':
                return { ...defaultConfig, showOptions: true, showFields: mailingOption === '現住所', isRequired: mailingOption === '現住所', description: '書面送付先を選択してください。' };

            case '東京ガス電気セット':
                 return { ...defaultConfig, fixedValue: '現住所', showFields: true, isRequired: true, description: '書面は現住所へ送付されます。' };
            
            case '東邦ガスセット':
                 return { ...defaultConfig, fixedValue: '現住所', showFields: true, isRequired: true, description: '現住所が必須となります。' };

            case '東急でんき':
                if (isGasSet === 'セット') {
                    return { ...defaultConfig, fixedValue: '現住所', showFields: true, isRequired: true, description: '書面は現住所へ送付されます。' };
                }
                return { ...defaultConfig, showOptions: true, showFields: mailingOption === '現住所', isRequired: mailingOption === '現住所', description: '書面送付先を選択してください。' };

            case 'ループでんき':
            case 'HTBエナジー':
            case 'ユーパワー UPOWER':
            case 'はぴe':
                return { ...defaultConfig, fixedValue: '新居', description: '書面は新住所（設置先）へ送付されます。' };

            default:
                return { ...defaultConfig, showOptions: false, showFields: false };
        }
    }, [elecProvider, mailingOption, isGasSet]);
    
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
        <div className="border-t-2 border-dashed border-emerald-300 pt-6 space-y-4">
            <h3 className="text-lg font-bold text-red-700">書面送付先</h3>
            {config.description && <p className="text-sm text-gray-600 -mt-2">{config.description}</p>}

            {config.showOptions && (
                 <FormRadioGroup
                    label="書面発送先"
                    name="mailingOption"
                    value={mailingOption}
                    onChange={handleInputChange}
                    options={MAILING_OPTIONS}
                    isInvalid={invalidFields.includes('mailingOption')}
                    required={config.isRequired}
                />
            )}
            
            {config.showFields && (
                 <div className="p-4 bg-emerald-50/50 rounded-lg border border-emerald-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        label={elecProvider === 'リミックスでんき' ? "郵送先郵便番号" : "現住所の郵便番号"}
                        name="currentPostalCode"
                        value={currentPostalCode}
                        onChange={handleInputChange}
                        onBlur={(e) => handlePostalCodeBlur('currentPostalCode', e.target.value)}
                        isInvalid={invalidFields.includes('currentPostalCode')}
                        required={config.isRequired}
                    />
                    <FormInput
                        label={elecProvider === 'リミックスでんき' ? "郵送先住所" : "現住所"}
                        name="currentAddress"
                        value={currentAddress}
                        onChange={handleInputChange}
                        className="md-col-span-2"
                        isInvalid={invalidFields.includes('currentAddress')}
                        required={config.isRequired}
                    />
                    <div className="md:col-span-2 flex items-end gap-2">
                        <FormInput
                            label={elecProvider === 'リミックスでんき' ? "郵送先物件名" : "現住所の物件名＋部屋番号"}
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


const ElectricityTab = () => {
    const { formData, handleInputChange, handleDateBlurWithValidation, handleNameBlur, handleIdBlur, invalidFields, handlePhoneBlur, handleKanaBlur, handlePostalCodeBlur } = useContext(AppContext);
    const { elecProvider, elecRecordIdPrefix, isGasSet, isSakaiRoute, recordId, hasContractConfirmation, isAllElectric } = formData;

    useEffect(() => {
      const isElecTarget =
        formData.elecProvider === 'すまいのでんき（ストエネ）' ||
        formData.elecProvider === 'プラチナでんき（ジャパン）';

      if (isElecTarget && formData.isAllElectric === 'あり' && formData.isGasSet) {
        handleInputChange({ target: { name: 'isGasSet', value: '' } } as any);
      }
    }, [formData.elecProvider, formData.isAllElectric]);
    
    const isSumai = elecProvider === 'すまいのでんき（ストエネ）';
    const isPlatinum = elecProvider === 'プラチナでんき（ジャパン）';
    const isGenderRequired = (isSumai || isPlatinum) && hasContractConfirmation === 'なし';
    const isQenes = elecProvider === 'キューエネスでんき';
    const isQenesItanji = isQenes && recordId?.toLowerCase().startsWith('id:');
    const isQenesOther = isQenes && !recordId?.toLowerCase().startsWith('id:');
    const isRemix = elecProvider === 'リミックスでんき';
    const isMinna = elecProvider === 'みんな電力';


    const showGasSetOption = !isMinna && ((elecProvider === 'すまいのでんき（ストエネ）' && formData.isAllElectric !== 'あり') || elecProvider === '東急でんき');
    
    const showContractConfirmationOption = useMemo(() => {
        return ['すまいのでんき（ストエネ）', 'プラチナでんき（ジャパン）'].includes(elecProvider) && elecProvider !== '東急でんき' && !isMinna;
    }, [elecProvider, isMinna]);

    const isPlatinumOtherConfirmed = useMemo(() => {
        return isPlatinum &&
               ['それ以外', 'ID:', 'No.'].includes(elecRecordIdPrefix) &&
               hasContractConfirmation === 'あり';
    }, [isPlatinum, elecRecordIdPrefix, hasContractConfirmation]);


    const isElecGasSetSelected = useMemo(() => {
        return elecProvider === 'すまいのでんき（ストエネ）' && formData.isGasSet === 'セット';
    }, [elecProvider, formData.isGasSet]);
    
    const showAllElectricOption = ['すまいのでんき（ストエネ）', 'プラチナでんき（ジャパン）', 'ループでんき'].includes(elecProvider) && !isMinna;
    
    const showVacancyOption = useMemo(() => {
        if (['すまいのでんき（ストエネ）', 'プラチナでんき（ジャパン）'].includes(elecProvider)) {
            return true;
        }
        if (elecProvider === 'キューエネスでんき' && recordId?.toLowerCase().startsWith('no.')) {
            return true;
        }
        if (isMinna) {
            return false;
        }
        return false;
    }, [elecProvider, recordId, isMinna]);

    const showNewConstructionOption = elecProvider === 'ユーパワー UPOWER';
    
    const isImportOnlyCase = useMemo(() => {
        if (hasContractConfirmation === 'なし') return true;
        if (isSumai && elecRecordIdPrefix?.toLowerCase() === 'code:') return true;
        if (isPlatinum) {
            if (['S', 'STJP:'].includes(elecRecordIdPrefix)) return true;
            if (elecRecordIdPrefix === 'SR' && hasContractConfirmation !== 'あり') return true;
            if (elecRecordIdPrefix === 'サカイ' && isAllElectric !== 'あり') return true;
             if (['それ以外', 'No.'].includes(elecRecordIdPrefix) && hasContractConfirmation !== 'あり') return true;
        }
        return false;
    }, [hasContractConfirmation, elecProvider, elecRecordIdPrefix, isAllElectric, isSumai, isPlatinum]);

    const showAttachedOption = useMemo(() => {
        if (isPlatinumOtherConfirmed) return false;
        if (isRemix) return true;
        if (['ニチガス電気セット', '東邦ガスセット', '大阪ガス電気セット'].includes(elecProvider)) {
            return false;
        }
        if (isQenesItanji) return true;
        
        // For Sutene/Platinum "no confirmation" cases
        if (hasContractConfirmation === 'なし' && (isSumai || isPlatinum)) {
            return true;
        }

        return isImportOnlyCase;
    }, [isImportOnlyCase, elecProvider, isQenesItanji, isRemix, isPlatinumOtherConfirmed, hasContractConfirmation, isSumai, isPlatinum]);
    
    // Gender field is shown for almost all "import only" templates.
    const showGender = useMemo(() => {
        if (isPlatinumOtherConfirmed) return false;
        
        if (!isSumai && !isPlatinum) return false;

        // Exception case for Platinum Sakai
        if (isPlatinum && elecRecordIdPrefix === 'サカイ' && isAllElectric === 'あり' && hasContractConfirmation === 'あり') {
            return true;
        }

        if (hasContractConfirmation === 'なし' && (isSumai || isPlatinum)) {
            return true;
        }

        return isImportOnlyCase;
    }, [elecProvider, elecRecordIdPrefix, isImportOnlyCase, isAllElectric, hasContractConfirmation, isSumai, isPlatinum, isPlatinumOtherConfirmed]);


    const gasTimeSlotOptions = useMemo(() => {
        // ストエネ関東・期間限定ルール
        if (isElecGasSetSelected) { // すまいのでんき && ガスセット
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

        if (elecProvider === 'すまいのでんき（ストエネ）' && elecRecordIdPrefix === 'SR') {
            return TIME_SLOTS_SUTENE_SR;
        }
        if (elecProvider === '東邦ガスセット') {
            return TIME_SLOTS_TOHO_GAS_SETUP;
        }
        if (elecProvider === 'ニチガス電気セット') {
            return TIME_SLOTS_NICHI;
        }
        if (elecProvider === '東京ガス電気セット') {
            return TIME_SLOTS_TOKYO_GAS;
        }
        if (elecProvider === '大阪ガス電気セット') {
            return GAS_OPENING_TIME_SLOTS;
        }
        if (elecProvider === '東急でんき' && isGasSet === 'セット') {
            return GAS_OPENING_TIME_SLOTS;
        }
        if (isElecGasSetSelected) {
            return GAS_OPENING_TIME_SLOTS;
        }
        return [];
    }, [elecProvider, elecRecordIdPrefix, isElecGasSetSelected, isGasSet, formData.address, formData.gasOpeningDate]);

     const idPrefixDescription = useMemo(() => {
        const lowerCasePrefix = elecRecordIdPrefix?.toLowerCase();
        const map = {
            'sr': 'ストエネ販路',
            'stjp:': 'ベンダー（トーマス販路）',
            'code:': 'ベンダー（YMCS）販路',
            's': 'すま直販路',
            'id:': 'スマサポ、イタンジ、ベンダー、その他販路',
            'それ以外': 'スマサポ、イタンジ、ベンダー、その他販路',
            '全販路': '全販路',
            'no.': 'スマサポ、イタンジ、ベンダー、その他販路',
        };
        return map[lowerCasePrefix] || '';
    }, [elecRecordIdPrefix]);

    const isHtb = elecProvider === 'HTBエナジー';
    const isUpower = elecProvider === 'ユーパワー UPOWER';
    const isHapie = elecProvider === 'はぴe';
    const isToho = elecProvider === '東邦ガスセット';
    const isOsakaGasSet = elecProvider === '大阪ガス電気セット';
    const isNichigasSet = elecProvider === 'ニチガス電気セット';
    const emailIsRequired = isQenes || isUpower || isHtb || isRemix || elecProvider === 'ループでんき' || elecProvider === '東急でんき';

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-red-800 border-b-2 pb-2">電気契約情報</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                    label="商材" name="elecProvider" value={elecProvider} onChange={handleInputChange}
                    options={ELEC_PROVIDERS} isInvalid={invalidFields.includes('elecProvider')} required
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
                    {elecRecordIdPrefix && elecRecordIdPrefix !== 'サカイ' && (
                       <p className="text-sm text-gray-500 mt-1">自動判定された販路: <span className="font-bold text-emerald-700">{idPrefixDescription}</span></p>
                    )}
                </div>
            </div>

            <div className="border-t-2 border-dashed border-emerald-300 pt-6 space-y-4">
                <h3 className="text-lg font-bold text-red-700">契約条件</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 p-4 bg-emerald-50/50 rounded-lg border border-emerald-200">
                    {showAllElectricOption && <FormRadioGroup label="オール電化" name="isAllElectric" value={formData.isAllElectric} onChange={handleInputChange} options={YES_NO_OPTIONS} isInvalid={invalidFields.includes('isAllElectric')} />}
                    {showVacancyOption && <FormRadioGroup label="空室" name="isVacancy" value={formData.isVacancy} onChange={handleInputChange} options={YES_NO_OPTIONS} isInvalid={invalidFields.includes('isVacancy')} />}
                    {showContractConfirmationOption && <FormRadioGroup label="契約確認は必要ですか？" name="hasContractConfirmation" value={formData.hasContractConfirmation} onChange={handleInputChange} options={YES_NO_OPTIONS} isInvalid={invalidFields.includes('hasContractConfirmation')} required />}
                    {showGasSetOption && <FormRadioGroup label="ガスセット" name="isGasSet" value={isGasSet} onChange={handleInputChange} options={SET_NONE_OPTIONS} isInvalid={invalidFields.includes('isGasSet')} />}
                    
                    { hasContractConfirmation !== 'なし' && !isQenesItanji && !isRemix && elecProvider !== 'ニチガス電気セット' && !isMinna && <FormRadioGroup label="主商材受注状況" name="primaryProductStatus" value={formData.primaryProductStatus} onChange={handleInputChange} options={PRIMARY_PRODUCT_STATUS_OPTIONS} isInvalid={invalidFields.includes('primaryProductStatus')} required={isQenesOther || elecProvider === '東急でんき'} /> }

                    {showNewConstructionOption && <FormRadioGroup label="新築" name="isNewConstruction" value={formData.isNewConstruction} onChange={handleInputChange} options={NEW_CONSTRUCTION_OPTIONS} isInvalid={invalidFields.includes('isNewConstruction')} />}
                </div>
            </div>

            <div className="border-t-2 border-dashed border-emerald-300 pt-6 space-y-4">
                <h3 className="text-lg font-bold text-red-700">契約者情報</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="名乗り" name="greeting" value={formData.greeting} onChange={handleInputChange} isInvalid={invalidFields.includes('greeting')} />
                    <FormInput label="契約者名義（漢字）" name="contractorName" value={formData.contractorName} onChange={handleInputChange} onBlur={handleNameBlur} isInvalid={invalidFields.includes('contractorName')} required />
                    <FormInput label="契約者名義（フリガナ）" name="contractorNameKana" value={formData.contractorNameKana} onChange={handleInputChange} onBlur={handleKanaBlur} isInvalid={invalidFields.includes('contractorNameKana')} required />
                    {showGender && <FormSelect label="性別" name="gender" value={formData.gender} onChange={handleInputChange} options={GENDERS} isInvalid={invalidFields.includes('gender')} required={isGenderRequired} />}
                    <FormDateInput label="生年月日（西暦）" name="dob" value={formData.dob} onChange={handleInputChange} onBlur={handleDateBlurWithValidation} isInvalid={invalidFields.includes('dob')} placeholder="例: 1990/01/01" required />
                    <FormInput label="電話番号" name="phone" value={formData.phone} onChange={handleInputChange} onBlur={handlePhoneBlur} isInvalid={invalidFields.includes('phone')} required />
                    { !isSumai && !isPlatinum && <FormInput label="メアド" name="email" type="email" value={formData.email} onChange={handleInputChange} isInvalid={invalidFields.includes('email')} required={emailIsRequired}/> }
                </div>
            </div>

            <div className="border-t-2 border-dashed border-emerald-300 pt-6 space-y-4">
                <h3 className="text-lg font-bold text-red-700">設置先情報</h3>
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
            
            {isElecGasSetSelected || elecProvider === 'ニチガス電気セット' || elecProvider === '東邦ガスセット' || elecProvider === '東京ガス電気セット' || elecProvider === '大阪ガス電気セット' || (elecProvider === '東急でんき' && isGasSet === 'セット') ? (
                <div className="border-t-2 border-dashed border-emerald-300 pt-6 space-y-4">
                    <h3 className="text-lg font-bold text-red-700">利用開始日・開栓日</h3>
                     <div className="p-4 bg-emerald-50/50 rounded-lg border border-emerald-200 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormDateInput label="電気利用開始日" name="moveInDate" value={formData.moveInDate} onChange={handleInputChange} onBlur={handleDateBlurWithValidation} isInvalid={invalidFields.includes('moveInDate')} placeholder="例: 2024/08/01" required />
                            <FormDateInput label="ガス開栓日" name="gasOpeningDate" value={formData.gasOpeningDate} onChange={handleInputChange} onBlur={handleDateBlurWithValidation} isInvalid={invalidFields.includes('gasOpeningDate')} placeholder="例: 2024/08/01" required />
                            <FormSelect label="ガス立会時間枠" name="gasOpeningTimeSlot" value={formData.gasOpeningTimeSlot} onChange={handleInputChange} options={gasTimeSlotOptions} isInvalid={invalidFields.includes('gasOpeningTimeSlot')} required className="md:col-span-2" />
                            {isNichigasSet && (
                                <>
                                    <FormSelect
                                        label="ガスエリア"
                                        name="gasArea"
                                        value={formData.gasArea}
                                        onChange={handleInputChange}
                                        options={NICHIGAS_GAS_AREAS}
                                        isInvalid={invalidFields.includes('gasArea')}
                                        required
                                    />
                                    <FormInput label="立会者" name="gasWitness" value={formData.gasWitness} onChange={handleInputChange} isInvalid={invalidFields.includes('gasWitness')} required />
                                    <FormInput label="ガス事前連絡先" name="gasPreContact" value={formData.gasPreContact} onChange={handleInputChange} onBlur={handlePhoneBlur} isInvalid={invalidFields.includes('gasPreContact')} required />
                                </>
                            )}
                        </div>
                        {(isToho || elecProvider === '東京ガス電気セット') && (
                            <div className="pt-4 mt-4 border-t border-emerald-200">
                                 <FormCheckbox
                                    label="法人契約"
                                    name="gasIsCorporate"
                                    checked={formData.gasIsCorporate}
                                    onChange={handleInputChange}
                                    isInvalid={invalidFields.includes('gasIsCorporate')}
                                    description="法人契約の場合はチェックを入れてください"
                                />
                                {formData.gasIsCorporate && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 mt-2 border-t border-gray-200">
                                        <FormInput label="立ち合い担当者フルネーム" name="gasWitness" value={formData.gasWitness} onChange={handleInputChange} onBlur={handleNameBlur} isInvalid={invalidFields.includes('gasWitness')} required={formData.gasIsCorporate} />
                                        <FormInput label="立ち合い連絡先" name="gasPreContact" value={formData.gasPreContact} onChange={handleInputChange} onBlur={handlePhoneBlur} isInvalid={invalidFields.includes('gasPreContact')} required={formData.gasIsCorporate} />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="border-t-2 border-dashed border-emerald-300 pt-6 space-y-4">
                     <h3 className="text-lg font-bold text-red-700">利用開始日</h3>
                     <FormDateInput label="電気利用開始日" name="moveInDate" value={formData.moveInDate} onChange={handleInputChange} onBlur={handleDateBlurWithValidation} isInvalid={invalidFields.includes('moveInDate')} placeholder="例: 2024/08/01" required />
                </div>
            )}


            <MailingAddressSection />

            <div className="border-t-2 border-dashed border-emerald-300 pt-6 space-y-4">
                <h3 className="text-lg font-bold text-red-700">その他</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    { hasContractConfirmation === 'あり' && !isQenesItanji && !isRemix && <FormInput label="契確時間" name="elecConfirmationTime" value={formData.elecConfirmationTime} onChange={handleInputChange} isInvalid={invalidFields.includes('elecConfirmationTime')} required /> }
                    
                    { showAttachedOption && <FormRadioGroup label={isRemix ? "付帯" : "付帯OP"} name="attachedOption" value={formData.attachedOption} onChange={handleInputChange} options={ATTACHED_OPTION_OPTIONS} isInvalid={invalidFields.includes('attachedOption')} required /> }

                    {(elecProvider !== '東京ガス電気セット' || isOsakaGasSet) && (
                        <FormSelect label="支払い方法" name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange} options={PAYMENT_METHOD_OPTIONS_EXTENDED} isInvalid={invalidFields.includes('paymentMethod')} />
                    )}
                    
                    {isSakaiRoute && (
                        <>
                            <FormInput label="FM取込社名" name="elecImportCompanyName" value={formData.elecImportCompanyName} onChange={handleInputChange} isInvalid={invalidFields.includes('elecImportCompanyName')} disabled={isSakaiRoute} />
                            <FormInput label="後確希望日/時間" name="elecPostConfirmationDateTime" value={formData.elecPostConfirmationDateTime} onChange={handleInputChange} isInvalid={invalidFields.includes('elecPostConfirmationDateTime')} />
                        </>
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
                <FormTextArea label="備考" name="elecRemarks" value={formData.elecRemarks} onChange={handleInputChange} rows={3} isInvalid={invalidFields.includes('elecRemarks')} />
                {isQenes && (
                    <div className="pt-4 space-y-4">
                         <FormCheckbox
                            label="法人契約"
                            name="qenesIsCorporate"
                            checked={formData.qenesIsCorporate}
                            onChange={handleInputChange}
                            isInvalid={invalidFields.includes('qenesIsCorporate')}
                            description=""
                        />
                        {formData.qenesIsCorporate && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-emerald-50/50 rounded-lg border border-emerald-200">
                                <FormInput 
                                    label="対応者（漢字）" 
                                    name="contactPersonName" 
                                    value={formData.contactPersonName} 
                                    onChange={handleInputChange} 
                                    onBlur={handleNameBlur}
                                    isInvalid={invalidFields.includes('contactPersonName')}
                                    required 
                                />
                                <FormInput 
                                    label="対応者（フリガナ）" 
                                    name="contactPersonNameKana" 
                                    value={formData.contactPersonNameKana} 
                                    onChange={handleInputChange} 
                                    onBlur={handleKanaBlur}
                                    isInvalid={invalidFields.includes('contactPersonNameKana')}
                                    required
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ElectricityTab;