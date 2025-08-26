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


export const generateElectricityCommentLogic = (formData: FormData): string => {
    const {
        elecProvider, elecRecordIdPrefix, isAllElectric, isVacancy, hasContractConfirmation, isGasSet,
        recordId, primaryProductStatus, greeting, apName, contractorName, contractorNameKana, gender, dob, phone,
        postalCode, address, buildingInfo, moveInDate, paymentMethod, remarks, attachedOption,
        elecConfirmationTime, elecImportCompanyName, elecPostConfirmationDateTime, email, isNewConstruction,
        postConfirmationTime, currentAddress, currentPostalCode, mailingOption, contactPersonName, contactPersonNameKana, gasOpeningTimeSlot,
        gasArea, gasWitness, gasPreContact, gasOpeningDate
    } = { 
        ...formData, 
        dob: formatDate(formData.dob), 
        moveInDate: formatDate(formData.moveInDate),
        gasOpeningDate: formatDate(formData.gasOpeningDate) 
    };

    let comment = '該当するテンプレートがありません。';
    const tag = "250811";

    const isSet = isGasSet === 'セット' || ['ニチガス電気セット', '東邦ガスセット', '東京ガス電気セット', '大阪ガス電気セット'].includes(elecProvider);
    
    const formattedPhone = formatPhoneNumberWithHyphens(phone);
    const formattedGasPreContact = formatPhoneNumberWithHyphens(gasPreContact);
    
    const formattedPostalCode = formatPostalCode(postalCode, elecProvider);
    const formattedCurrentPostalCode = formatPostalCode(currentPostalCode, elecProvider);

    // Date line logic for sets
    let dateLine = `利用開始日：電気→${moveInDate || ''}`;
    if (isSet) {
        let elecPart = `電気→${moveInDate || ''}`;
        let gasPart = `ガス→${gasOpeningDate || ''}`;
        let timePart = gasOpeningTimeSlot ? ` ${gasOpeningTimeSlot}` : '';

        dateLine = `利用開始日：${elecPart}　${gasPart}${timePart}`;
        dateLine = dateLine.trim();
    }
    
    const showPrimaryProductStatus = hasContractConfirmation === 'あり';
    const showAttachedOption = hasContractConfirmation !== 'あり' && !['東邦ガスセット', '大阪ガス電気セット'].includes(elecProvider);
    const attachedOptionLine = showAttachedOption ? `付帯OP：${attachedOption || ''}\n` : '';

    switch (elecProvider) {
        case 'すまいのでんき（ストエネ）':
            switch (elecRecordIdPrefix) {
                case 'SR':
                    if (isAllElectric === 'あり') {
                        if (isVacancy === 'あり') {
                             if (hasContractConfirmation === 'あり') {
                                comment = `【ストエネ/賃貸でんき※空室プランHAHZZT223】${tag}\n${showPrimaryProductStatus ? `主商材受注状況：${primaryProductStatus || ''}\n` : ''}契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：※空室プラン　賃貸でんきオール電化プラン\nガス：${isGasSet || ''}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n${dateLine}\n支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
                            } else {
                                comment = `【ストエネ/★インポートのみ/すまいの/※空室プランHAHZZT223】${tag}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：※空室プラン　すまいのでんきオール電化プラン\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n性別：${gender || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n${dateLine}\n${attachedOptionLine}支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
                            }
                        } else { // isVacancy === 'なし'
                             if (hasContractConfirmation === 'あり') {
                                comment = `【ストエネ】${tag}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n${showPrimaryProductStatus ? `主商材受注状況：${primaryProductStatus || ''}\n` : ''}名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：賃貸でんきオール電化プラン\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n${dateLine}\n支払い方法：${paymentMethod || ''}\n重説送付先：新居\n備考：${remarks || ''}`;
                            } else {
                                comment = `【ストエネ/★インポートのみ/すまいの】${tag}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：すまいのでんきオール電化プラン\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n性別：${gender || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n${dateLine}\n${attachedOptionLine}支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
                            }
                        }
                    } else { // isAllElectric === 'なし'
                         if (isVacancy === 'あり') {
                             if (hasContractConfirmation === 'あり') {
                                comment = `【ストエネ/賃貸でんき※空室プランHAHZZT223】${tag}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n${showPrimaryProductStatus ? `主商材受注状況：${primaryProductStatus || ''}\n` : ''}名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：※空室プラン　賃貸でんきプラン\nガス：${isGasSet || ''}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n${dateLine}\n支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
                            } else {
                                comment = `【ストエネ/★インポートのみ/すまいの/※空室プランHAHZZT223】${tag}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：※空室プラン　すまいのでんきプラン\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n性別：${gender || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n${dateLine}\n${attachedOptionLine}支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
                            }
                         } else { // isVacancy === 'なし'
                             if (hasContractConfirmation === 'あり') {
                                comment = `【ストエネ】${tag}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n${showPrimaryProductStatus ? `主商材受注状況：${primaryProductStatus || ''}\n` : ''}名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：賃貸でんきプラン\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n${dateLine}\n支払い方法：${paymentMethod || ''}\n重説送付先：新居\n備考：${remarks || ''}`;
                            } else {
                                comment = `【ストエネ/★インポートのみ/すまいの】${tag}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：すまいのでんきプラン\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n性別：${gender || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n${dateLine}\n${attachedOptionLine}支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
                            }
                         }
                    }
                    break;
                case 'code:':
                     comment = `【ストエネ/★インポートのみ/YMCS】${tag}\nレコードID：${recordId || ''}\n担当者：${apName || ''}\nプラン：すまいのでんきプラン\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
                    break;
                case 'S':
                case 'STJP:':
                    const code = elecRecordIdPrefix === 'S' ? 'HAHZZT276※' : 'HAHZZT293※';
                    comment = `【ストエネ】${code} ${tag}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n主商材受注状況：${primaryProductStatus || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：すまいのでんき\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}\n性別：${gender || ''}`;
                    break;
                 case 'サカイ':
                    comment = `【ストエネ】HAHZZT259 ${tag}\nFM取込社名：${elecImportCompanyName || ''}\n後確希望日/時間：${elecPostConfirmationDateTime || ''}\n名乗り：ライフイン24\n担当者：${apName || ''}\nプラン：すまいのでんき\nガス：${isGasSet || ''}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n${dateLine}\n支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
                    break;
                case 'それ以外':
                     if (isVacancy === 'あり') {
                         comment = `【ストエネ/※空室プラン/HZEZZT011】${tag}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n主商材受注状況：${primaryProductStatus || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：Fプラン\nすまいのでんき\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n支払い方法：${paymentMethod || ''}`;
                     } else {
                        comment = `【ストエネ】${tag}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n主商材受注状況：${primaryProductStatus || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：すまいのでんき\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n${dateLine}\n支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
                     }
                    break;
            }
            break;

        case 'プラチナでんき（ジャパン）': {
            const isImportOnly = hasContractConfirmation === 'なし';
            const isAllElec = isAllElectric === 'あり';
            const isVacant = isVacancy === 'あり';

            if (elecRecordIdPrefix === 'SR') {
                if (isAllElec) {
                    if (isVacant) {
                        comment = isImportOnly
                            ? `【JAPAN電力/★インポートのみ※空室プランHAHZZT281】${tag}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：プラチナでんきオール電化プラン\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n性別：男性/女性\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n付帯OP：あり　/　なし\n支払い方法：\n備考：${remarks || ''}`
                            : `【JAPAN電力※空室プランHAHZZT281】${tag}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n主商材受注状況：あり　/　なし\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン： プラチナでんきオール電化プラン\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：電気→${moveInDate || ''}\n支払い方法：口座　/　クレカ\n備考：${remarks || ''}`;
                    } else { // Not Vacant
                        comment = isImportOnly
                            ? `【JAPAN電力/★インポートのみ】HAHZZT182 ${tag}\nレコードID：${recordId || ''}\n名乗：${greeting || ''}\n担当者：${apName || ''}\nプラン：プラチナでんきオール電化\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n性別：男性/女性\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：り\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n付帯OP：あり　/　なし\n支払い方法：\n備考：${remarks || ''}`
                            : `【JAPAN電力】HAHZZT182 ${tag}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n主商材受注状況：あり　/　なし\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン： プラチナでんきオール電化プラン\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：電気→${moveInDate || ''}\n支払い方法：口座　/　クレカ\n備考：${remarks || ''}`;
                    }
                } else { // Not All-Electric
                    if (isVacant) {
                        comment = isImportOnly
                            ? `【JAPAN電力/★インポートのみ※空室プランHAHZZT281】${tag}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：プラチナでんき\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n性別：男性/女性\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n付帯OP：あり　/　なし\n支払い方法：\n備考：${remarks || ''}`
                            : `【JAPAN電力※空室プランHAHZZT281】${tag}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n主商材受注状況：あり　/　なし\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン： プラチナでんき\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：電気→${moveInDate || ''}\n支払い方法：口座　/　クレカ\n備考：${remarks || ''}`;
                    } else { // Not Vacant
                        comment = isImportOnly
                            ? `【JAPAN電力/★インポートのみ】HAHZZT182 ${tag}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：プラチナでんき\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n性別：男性/女性\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n付帯OP：あり　/　なし\n支払い方法：\n備考：${remarks || ''}`
                            : `【JAPAN電力】HAHZZT182 ${tag}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n主商材受注状況：あり　/　なし\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン： プラチナでんき\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：電気→${moveInDate || ''}\n支払い方法：口座　/　クレカ\n備考：${remarks || ''}`;
                    }
                }
            } else if (elecRecordIdPrefix === 'STJP:') {
                comment = isAllElec
                    ? `【JAPAN電力/★インポートのみ】HAHZZT293 ${tag}\nレコードID：${recordId || ''}\n担当者：${apName || ''}\nプラン：プラチナでんきオール電化\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n性別：男性/女性\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：電気→${moveInDate || ''}\n付帯OP：有/無\n支払い方法：口座/クレカ\n備考：${remarks || ''}`
                    : `【JAPAN電力/★インポートのみ】\nHAHZZT293※ ${tag}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：プラチナでんき\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n性別：男性/女性\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n付帯OP：あり　/　なし\n支払い方法：\n備考：${remarks || ''}`;
            } else if (elecRecordIdPrefix === 'S') {
                 comment = isAllElec
                    ? `【JAPAN電力/★インポートのみ】HAHZZT276 ${tag}\nレコードID：${recordId || ''}\n担当者：${apName || ''}\nプラン：プラチナでんきオール電化\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n性別：男性/女性\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：電気→${moveInDate || ''}\n付帯OP：有/無\n支払い方法：口座/クレカ\n備考：${remarks || ''}`
                    : `【JAPAN電力/★インポートのみ】\nHAHZZT276※ ${tag}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：プラチナでんき\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n性別：男性/女性\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n付帯OP：あり　/　なし\n支払い方法：\n備考：${remarks || ''}`;
            } else if (elecRecordIdPrefix === 'サカイ') {
                comment = isAllElec
                    ? `【JAPAN電力】HAHZZT259 ${tag}\nFM取込社名：サカイ販路\n名乗り：ライフイン24\n担当者：${apName || ''}\nプラン： プラチナでんきオール電化プラン\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n性別：男性・女性\n電話番号：${formattedPhone || ''}\n郵便番号\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n支払い方法：口座・クレジットカード\n備考：5000CB${remarks ? ` ${remarks}`: ''}`
                    : `【JAPAN電力/★インポートのみ】HAHZZT259 ${tag}\nFM取込社名：サカイ販路\n名乗り：ライフイン24\n担当者：${apName || ''}\nプラン： プラチナでんき\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n性別：男性・女性\n電話番号：${formattedPhone || ''}\n郵便番号\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n付帯OP：あり・なし\n支払い方法：口座・クレジットカード\n備考：5000CB${remarks ? ` ${remarks}`: ''}`;
            } else { // それ以外
                 if (isAllElec) {
                    comment = isImportOnly
                        ? `【JAPAN電力/★インポートのみ】${tag}\nレコードID：${recordId || ''}\n担当者：${apName || ''}\nプラン：プラチナでんきオール電化\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n性別：男性/女性\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：電気→${moveInDate || ''}\n付帯OP：有/無\n支払い方法：口座/クレカ\n備考：${remarks || ''}`
                        : `【JAPAN電力】${tag}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n主商材受注状況：あり　/　なし\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：プラチナでんきオール電化プラン\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n支払い方法：口座　/　クレカ\n備考：${remarks || ''}`;
                 } else { // Not All-Electric
                     comment = isImportOnly
                        ? `【JAPAN電力/★インポートのみ】${tag}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：プラチナでんき\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n性別：男性/女性\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n付帯OP：あり　/　なし\n支払い方法：\n備考：${remarks || ''}`
                        : `【JAPAN電力】${tag}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n主商材受注状況：あり　/　なし\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン： プラチナでんき\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：電気→${moveInDate || ''}\n支払い方法：口座　/　クレカ\n備考：${remarks || ''}`;
                 }
            }
            break;
        }

        case 'キューエネスでんき':
            if (elecRecordIdPrefix === 'ID:') {
                 comment = `【キューエネスでんき】【★インポートのみ】${tag}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：エコhome\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n支払方法：クレカ/口座（コンビニの場合原則HTB）\nメアド：${email || ''}\n付帯：${attachedOption || ''}\n\n※法人の場合は電話対応者名を記載　\n対応者（漢字）；${contactPersonName || ''}\n対応者（フリガナ）；${contactPersonNameKana || ''}`;
            } else {
                 comment = `【キューエネスでんき】${tag}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n主商材受注状況：${primaryProductStatus || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：エコhome\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n支払方法：クレカ/口座（コンビニの場合原則HTB）\nメアド：${email || ''}\n備考：${remarks || ''}\n※法人の場合は電話対応者名を記載　\n対応者（漢字）；${contactPersonName || ''}\n対応者（フリガナ）；${contactPersonNameKana || ''}`;
            }
            break;

        case 'リミックスでんき': {
            const remixMailingAddress = mailingOption === '現住所' ? `郵送先：〒${formattedCurrentPostalCode || ''} ${currentAddress || ''}` : `郵送先：新住所と同じ`;
            comment = `【リミックスでんき】${tag}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n支払い方法：${paymentMethod || ''}\nメアド：${email || ''}\n${remixMailingAddress}\n備考：${remarks || ''}`;
            break;
        }

        case 'HTBエナジー':
            comment = `【HTBエナジー】${tag}\nレコードID：${recordId || ''}\n担当者：${apName || ''}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n支払い方法：${paymentMethod || ''}\nメアド：${email || ''}\n架電希望日時：${postConfirmationTime || ''}\n備考：${remarks || ''}`;
            break;

        case 'ニチガス電気セット':
             comment = `【ニチガス_電気セット】${tag}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：ニチガス_電気セット\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\nガスエリア：${gasArea || ''}（何ガスエリアかいれる）\n利用開始日：電気：${moveInDate || ''}　ガス：${gasOpeningDate || ''} ${gasOpeningTimeSlot || ''}\n立会者：${gasWitness || ''}\nガス事前連絡先：${formattedGasPreContact || ''}\n支払方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
            break;

        case 'ユーパワー UPOWER':
            const upowerMailingAddress = mailingOption === '現住所' ? `郵送先：現住所（${currentAddress || ''}）` : `郵送先：新居`;
            comment = `【U-POWER】${tag}\nレコードID：${recordId || ''}\n担当者：${apName || ''}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n支払い方法：${paymentMethod || ''}\nメアド：${email || ''}\n新築：${isNewConstruction || ''}\n${upowerMailingAddress}\n備考：${remarks || ''}`;
            break;
            
        case 'はぴe':
             comment = `【はぴe】${tag}\nレコードID：${recordId || ''}\n担当者：${apName || ''}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n電話番号：${formattedPhone || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n繋がりやすい時間帯：${postConfirmationTime || ''}\n備考：${remarks || ''}`;
            break;

        case 'ループでんき':
            const loopPlan = isAllElectric === 'あり' ? 'スマートタイムONE（電化）' : 'スマートタイムONE（電灯）';
            comment = `【ループでんき】${tag}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：${loopPlan}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n支払い方法：${paymentMethod || ''}\nメアド：${email || ''}\n備考：${remarks || ''}`;
            break;

        case '東京ガス電気セット':
            comment = `【東京ガス 電気セット】${tag}\nレコードID：${recordId || ''}\n担当者：${apName || ''}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：電気：${moveInDate || ''}　ガス：${gasOpeningDate || ''}　時間枠：${gasOpeningTimeSlot || ''}\n現住所：${currentAddress || '！！必須！！'}\n備考：${remarks || ''}`;
            break;
            
        case '東邦ガスセット':
            comment = `【東邦ガス_電気セット】${tag}\n後確希望時間：${postConfirmationTime || ''}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：東邦ガス_電気セット\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：電気：${moveInDate || ''}　ガス：${gasOpeningDate || ''} ${gasOpeningTimeSlot || ''}\n支払い方法：${paymentMethod || ''}\n現住所：${currentAddress || '！！必須！！'}\n備考：${remarks || ''}`;
            break;
            
        case '大阪ガス電気セット':
            comment = `【大阪ガス電気セット】${tag}\n名乗り：${greeting || ''}\nレコードID：${recordId || ''}\n担当者：${apName || ''}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：電気：${moveInDate || ''}　ガス：${gasOpeningDate || ''} ${gasOpeningTimeSlot || ''}\n支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
            break;
    }

    return comment;
};
