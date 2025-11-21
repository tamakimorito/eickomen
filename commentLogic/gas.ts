import type { FormData } from '../types.ts';

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    }
    return dateStr;
};

const formatPhoneNumberWithHyphens = (phoneStr: string): string => {
  if (!phoneStr) return '';
  const digits = phoneStr.replace(/\D/g, '');

  if (digits.length === 11) { // Mobile phones (e.g., 090-1234-5678)
    return `${digits.substring(0, 3)}-${digits.substring(3, 7)}-${digits.substring(7)}`;
  }
  if (digits.length === 10) {
    // Major cities with 2-digit area codes (e.g., Tokyo 03, Osaka 06)
    const twoDigitAreaCodes = ['3', '6'];
    if (digits.startsWith('0') && twoDigitAreaCodes.includes(digits.charAt(1))) {
      return `${digits.substring(0, 2)}-${digits.substring(2, 6)}-${digits.substring(6)}`;
    }
    // Other landlines, typically 3-digit area codes (e.g., 011-234-5678)
    return `${digits.substring(0, 3)}-${digits.substring(3, 6)}-${digits.substring(6)}`;
  }
  // Fallback for unexpected lengths
  return phoneStr;
};

const formatPostalCode = (postalCodeStr: string, providerName: string): string => {
  if (!postalCodeStr) return '';
  const digits = postalCodeStr.replace(/\D/g, '');
  
  const hyphenProviders = ['東邦ガスセット', 'リミックスでんき', '東急ガス', '東邦ガス単品'];

  if (hyphenProviders.includes(providerName)) {
    if (digits.length === 7) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    }
    return postalCodeStr;
  }
  
  return digits;
};

export const generateGasCommentLogic = (formData: FormData): string => {
    const {
        gasProvider, gasRecordIdPrefix, gasIsVacancy, gasHasContractConfirmation,
        recordId, primaryProductStatus, greeting, apName, contractorName, contractorNameKana, gender, dob, phone,
        postalCode, address, buildingInfo, gasOpeningDate, paymentMethod, gasRemarks, attachedOption,
        elecConfirmationTime, email, gasArea, gasWitness, gasPreContact, gasOpeningTimeSlot, postConfirmationTime, currentAddress, mailingOption, currentPostalCode,
        gasIsCorporate, mailingBuildingInfo, isSakaiRoute
    } = { ...formData, dob: formatDate(formData.dob), gasOpeningDate: formatDate(formData.gasOpeningDate) };

    let comment = '該当するテンプレートがありません。';
    const tag = "250811";
    
    const noHyphenProviders = ['すまいのでんき（ストエネ）', '大阪ガス単品'];
    const formattedPhone = noHyphenProviders.includes(gasProvider)
        ? (phone || '').replace(/\D/g, '')
        : formatPhoneNumberWithHyphens(phone);

    const formattedGasPreContact = noHyphenProviders.includes(gasProvider)
    ? (gasPreContact || '').replace(/\D/g, '')
    : formatPhoneNumberWithHyphens(gasPreContact);

    const formattedPostalCode = formatPostalCode(postalCode, gasProvider);
    const formattedCurrentPostalCode = formatPostalCode(currentPostalCode, gasProvider);
    
    // --- すまいのガス（契確なし）のインポート専用ロジック ---
    if (gasProvider === 'すまいのでんき（ストエネ）' && gasHasContractConfirmation === 'なし') {
        const baseInfo = `レコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}`;
        const contractInfo = `契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}`;
        const importAddressInfo = `郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}`;
        const dateLine = `利用開始日：電気→　　ガス→${gasOpeningDate || ''} ${gasOpeningTimeSlot || ''}`;
        const attachedOptionLine = `付帯OP：${attachedOption || ''}\n`;
        const plan = gasIsVacancy === 'あり' ? '※空室プラン　すまいのガスのみ' : 'すまいのガスのみ';
        const header = `【ストエネ/★インポートのみ/すまいの${gasIsVacancy === 'あり' ? '/※空室プランHAHZZT223' : ''}】`;

        comment = `${header} ${tag}\n${baseInfo}\nプラン：${plan}\n${contractInfo}\n性別：${gender || ''}\n${importAddressInfo}\n${dateLine}\n${attachedOptionLine}支払い方法：${paymentMethod || ''}\n備考：${gasRemarks || ''}`;
        return comment;
    }


    switch (gasProvider) {
        case 'すまいのでんき（ストエネ）': // This is "すまいのガス" (契確あり)
            const suteneMailingAddress = mailingOption === '現住所' ? `書面送付先：現住所（${currentAddress || ''}）` : '書面送付先：新住所';
            
            switch (gasRecordIdPrefix) {
                case 'SR':
                    comment = `【ストエネ/賃貸】 ${tag}\n主商材受注状況：${primaryProductStatus || ''}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：賃貸ガスのみ\nガス：あり/なし\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n性別：${gender || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：電気→　　ガス→${gasOpeningDate || ''} ${gasOpeningTimeSlot || ''}\n支払い方法：${paymentMethod || ''}\n${suteneMailingAddress}\n備考：${gasRemarks || ''}`;
                    break;
                case 'S':
                case 'STJP:':
                    const code = gasRecordIdPrefix === 'S' ? 'HAHZZT276※' : 'HAHZZT293※';
                    comment = `【ストエネ】${code} ${tag}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n主商材受注状況：${primaryProductStatus || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：すまいのガスのみ\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${gasOpeningDate || ''} ${gasOpeningTimeSlot || ''}\n支払い方法：${paymentMethod || ''}\n備考：${gasRemarks || ''}\n性別：${gender || ''}`;
                    break;
                case 'サカイ':
                    const sakaiCodeGas = (isSakaiRoute && buildingInfo === '戸建て') ? 'HAHZZT305' : 'HAHZZT259';
                    comment = `【ストエネ】${sakaiCodeGas} ${tag}\nFM取込社名：サカイ販路\n後確希望日/時間：${postConfirmationTime || ''}\n名乗り：ライフイン24\n担当者：${apName || ''}\nプラン：すまいのガスのみ\nガス：なし\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${gasOpeningDate || ''} ${gasOpeningTimeSlot || ''}\n支払い方法：${paymentMethod || ''}\n備考：${gasRemarks || ''}`;
                    break;
                case 'それ以外':
                    if (gasIsVacancy === 'あり') {
                        comment = `【ストエネ/※空室プラン/HZEZZT011】 ${tag}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n主商材受注状況：${primaryProductStatus || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：Fプラン\nすまいのガスのみ\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${gasOpeningDate || ''} ${gasOpeningTimeSlot || ''}\n支払い方法：${paymentMethod || ''}`;
                    } else { // なし
                        comment = `【ストエネ】 ${tag}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n主商材受注状況：${primaryProductStatus || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：すまいのガスのみ\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：電気→　　　　　ガス→${gasOpeningDate || ''} ${gasOpeningTimeSlot || ''}\n支払い方法：${paymentMethod || ''}\n備考：${gasRemarks || ''}`;
                    }
                    break;
            }
            break;

        case '東京ガス単品':
            {
                let tokyoGasCommentLines = [
                    `【東京ガス ガス単品】 ${tag}`,
                    `レコードID：${recordId || ''}`,
                    `担当者：${apName || ''}`,
                    `契約者名義（漢字）：${contractorName || ''}`,
                    `契約者名義（フリガナ）：${contractorNameKana || ''}`,
                    `生年月日(西暦)：${dob || ''}`,
                    `電話番号：${formattedPhone || ''}`,
                    `郵便番号：${formattedPostalCode || ''}`,
                    `引越し先住所：${address || ''}`,
                    `物件名：${buildingInfo || ''}`,
                    `利用開始日：${gasOpeningDate || ''} ${gasOpeningTimeSlot || ''}`
                ];

                if (gasIsCorporate) {
                    tokyoGasCommentLines.push(
                        `（法人の場合下記も）`,
                        `立ち合い担当者フルネーム：${gasWitness || ''}`,
                        `立ち合い連絡先：${formattedGasPreContact || ''}`
                    );
                }
                
                comment = tokyoGasCommentLines.join('\n');
                if (gasRemarks) {
                    comment += `\n備考：${gasRemarks}`;
                }
                break;
            }
            
        case '東邦ガス単品':
            {
                let tohoCommentLines = [
                    `【東邦ガス_ガス単品】 ${tag}`,
                    `レコードID：${recordId || ''}`,
                    `名乗り：${greeting || ''}`,
                    `担当者：${apName || ''}`,
                    `プラン：東邦ガス単品`,
                    `契約者名義（漢字）：${contractorName || ''}`,
                    `契約者名義（フリガナ）：${contractorNameKana || ''}`,
                    `生年月日(西暦)：${dob || ''}`,
                    `電話番号：${formattedPhone || ''}`,
                    `郵便番号：${formattedPostalCode || ''}`,
                    `引越し先住所：${address || ''}`,
                    `物件名：${buildingInfo || ''}`,
                    `利用開始日：電気：なし　ガス：${gasOpeningDate || ''} ${gasOpeningTimeSlot || ''}`,
                    `支払い方法：${paymentMethod || ''}`,
                    `現住所：${currentAddress || '！！必須！！'}`,
                    `備考：※単品につき後確なし`
                ];
                comment = tohoCommentLines.join('\n');
                if (gasRemarks) {
                    comment += `\n${gasRemarks}`;
                }
                break;
            }

        case '東急ガス':
            {
                const tokyuCurrentAddress =
                  formattedCurrentPostalCode
                    ? `〒${formattedCurrentPostalCode} ${(currentAddress || '')}${mailingBuildingInfo ? ' ' + mailingBuildingInfo : ''}`
                    : `${currentAddress || ''}${mailingBuildingInfo ? ' ' + mailingBuildingInfo : ''}`;
                let tokyuCommentLines = [
                    `【東急ガス_開栓】 ${tag}`,
                    `契確時間：${elecConfirmationTime || ''}`,
                    `レコードID：${recordId || ''}`,
                    `主商材受注状況：${primaryProductStatus || ''}`,
                    `名乗り：${greeting || ''}`,
                    `担当者：${apName || ''}`,
                    `プラン：東急ガス`,
                    `契約者名義（漢字）：${contractorName || ''}`,
                    `契約者名義（フリガナ）：${contractorNameKana || ''}`,
                    `生年月日(西暦)：${dob || ''}`,
                    `電話番号：${formattedPhone || ''}`,
                    `郵便番号：${formattedPostalCode || ''}`,
                    `引越し先住所：${address || ''}`,
                    `物件名：${buildingInfo || ''}`,
                    `利用開始日：${gasOpeningDate || ''} ${gasOpeningTimeSlot || ''}`,
                    `メアド：${email || ''}`,
                    `支払い方法：${paymentMethod || ''}`,
                    `現住所：${tokyuCurrentAddress}`
                ];
                 comment = tokyuCommentLines.join('\n');
                 if (gasRemarks) {
                    comment += `\n備考：${gasRemarks || ''}`;
                }
                break;
            }
            
        case '大阪ガス単品':
            {
                let osakaCommentLines = [
                    `【大阪ガス単品】 ${tag}`,
                    `名乗り：${greeting || ''}`,
                    `レコードID：${recordId || ''}`,
                    `担当者：${apName || ''}`,
                    `契約者名義（漢字）：${contractorName || ''}`,
                    `契約者名義（フリガナ）：${contractorNameKana || ''}`,
                    `電話番号：${formattedPhone || ''}`,
                    `郵便番号：${formattedPostalCode || ''}`,
                    `住所：${address || ''}`,
                    `物件名：${buildingInfo || ''}`,
                    `利用開始日：${gasOpeningDate || ''} ${gasOpeningTimeSlot || ''}`,
                    `備考：${gasRemarks || ''}`
                ];
                comment = osakaCommentLines.join('\n');
                break;
            }

        case 'ニチガス単品':
            {
                const nichiMailingAddress = `書面送付先：${mailingOption === '現住所' ? `現住所（${(currentAddress || '') + (mailingBuildingInfo ? ' ' + mailingBuildingInfo : '')}）` : '設置先'}`;
                let nichigasCommentLines = [
                    `【ニチガス_単品】 ${tag}`,
                    `レコードID：${recordId || ''}`,
                    `名乗り：${greeting || ''}`,
                    `担当者：${apName || ''}`,
                    `プラン：ニチガス_単品`,
                    `契約者名義（漢字）：${contractorName || ''}`,
                    `契約者名義（フリガナ）：${contractorNameKana || ''}`,
                    `生年月日(西暦)：${dob || ''}`,
                    `電話番号：${formattedPhone || ''}`,
                    `郵便番号：${formattedPostalCode || ''}`,
                    `住所：${address || ''}`,
                    `物件名：${buildingInfo || ''}`,
                    `ガスエリア：${gasArea || ''}（何ガスエリアかいれる）`,
                    `利用開始日：${gasOpeningDate || ''} ${gasOpeningTimeSlot || ''}`,
                    `立会者：${gasWitness || ''}`,
                    `ガス事前連絡先：${formattedGasPreContact || ''}`,
                    `支払方法：${paymentMethod || ''}`,
                    nichiMailingAddress,
                    `備考：${gasRemarks || ''}`
                ];
                comment = nichigasCommentLines.join('\n');
                break;
            }
    }

    return comment;
};