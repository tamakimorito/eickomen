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
        postConfirmationTime, currentAddress, mailingOption, contactPersonName, contactPersonNameKana, gasOpeningTimeSlot,
        gasArea, gasWitness, gasPreContact, gasOpeningDate
    } = { 
        ...formData, 
        dob: formatDate(formData.dob), 
        moveInDate: formatDate(formData.moveInDate),
        gasOpeningDate: formatDate(formData.gasOpeningDate) 
    };

    let comment = '該当するテンプレートがありません。';
    const tag = "250811";

    const isSet = isGasSet === 'セット' || elecProvider === 'ニチガス電気セット' || elecProvider === '東邦ガスセット' || elecProvider === '東京ガス電気セット';
    
    const formattedPhone = formatPhoneNumberWithHyphens(phone);
    const formattedGasPreContact = formatPhoneNumberWithHyphens(gasPreContact);
    
    const formattedPostalCode = formatPostalCode(postalCode, elecProvider);
    const formattedCurrentPostalCode = formatPostalCode(formData.currentPostalCode, elecProvider);

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
    const showAttachedOption = hasContractConfirmation === 'なし';

    switch (elecProvider) {
        case 'すまいのでんき（ストエネ）':
            switch (elecRecordIdPrefix) {
                case 'SR':
                    if (isAllElectric === 'あり') {
                        if (isVacancy === 'あり') {
                             if (hasContractConfirmation === 'あり') {
                                comment = `【ストエネ/賃貸でんき※空室プランHAHZZT223】${tag}\n${showPrimaryProductStatus ? `主商材受注状況：${primaryProductStatus || ''}\n` : ''}契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：※空室プラン　賃貸でんきオール電化プラン\nガス：${isGasSet || ''}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n${dateLine}\n支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
                            } else {
                                comment = `【ストエネ/★インポートのみ/すまいの/※空室プランHAHZZT223】${tag}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：※空室プラン　すまいのでんきオール電化プラン\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n性別：${gender || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n${dateLine}\n${showAttachedOption ? `付帯OP：${attachedOption || ''}\n` : ''}支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
                            }
                        } else { // isVacancy === 'なし'
                             if (hasContractConfirmation === 'あり') {
                                comment = `【ストエネ】${tag}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n${showPrimaryProductStatus ? `主商材受注状況：${primaryProductStatus || ''}\n` : ''}名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：賃貸でんきオール電化プラン\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n${dateLine}\n支払い方法：${paymentMethod || ''}\n重説送付先：新居\n備考：${remarks || ''}`;
                            } else {
                                comment = `【ストエネ/★インポートのみ/すまいの】${tag}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：すまいのでんきオール電化プラン\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n性別：${gender || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n${dateLine}\n${showAttachedOption ? `付帯OP：${attachedOption || ''}\n` : ''}支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
                            }
                        }
                    } else { // isAllElectric === 'なし'
                         if (isVacancy === 'あり') {
                            if (hasContractConfirmation === 'あり') {
                                comment = `【ストエネ/賃貸でんき※空室プランHAHZZT223】${tag}\n${showPrimaryProductStatus ? `主商材受注状況：${primaryProductStatus || ''}\n` : ''}契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：※空室プラン ${isGasSet === 'セット' ? '賃貸セット' : '賃貸電気のみ'}\nガス：${isGasSet || ''}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n${dateLine}\n支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
                            } else { // hasContractConfirmation === 'なし'
                                comment = `【ストエネ/★インポートのみ/すまいの/※空室プランHAHZZT223】${tag}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：※空室プラン ${isGasSet === 'セット' ? 'すまいのセット' : 'すまいの電気のみ'}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n性別：${gender || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n${dateLine}\n${showAttachedOption ? `付帯OP：${attachedOption || ''}\n` : ''}支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
                            }
                        } else { // isVacancy === 'なし'
                            if (hasContractConfirmation === 'あり') {
                                comment = `【ストエネ】${tag}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n主商材受注状況：${primaryProductStatus || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：${isGasSet === 'セット' ? 'すまいのセット' : 'すまいのでんきのみ'}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n${dateLine}\n支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
                            } else { // hasContractConfirmation === 'なし'
                                comment = `【ストエネ/★インポートのみ/すまいの】${tag}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：${isGasSet === 'セット' ? 'すまいのセット' : 'すまいの電気のみ'}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n性別：${gender || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n${dateLine}\n${showAttachedOption ? `付帯OP：${attachedOption || ''}\n` : ''}支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
                            }
                        }
                    }
                    break;
                case 'code:':
                    comment = `【ストエネ/★インポートのみ/賃貸/※空室プランHAHZZT241】${tag}\nレコードID：${recordId || ''}\nプラン：※空室プラン　${isAllElectric === 'あり' ? 'オール電化プラン' : (isGasSet === 'セット' ? 'ガスセット' : 'でんきのみ')}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n${dateLine}\n付帯OP：${attachedOption || ''}\n支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}\n性別：${gender || ''}`;
                    break;
                case 'S':
                case 'STJP:':
                    const sCode = elecRecordIdPrefix === 'S' ? 'HAHZZT276※' : 'HAHZZT293※';
                    comment = `【ストエネ】${sCode} ${tag}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n主商材受注状況：${primaryProductStatus || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：${isAllElectric === 'あり' ? 'すまいのでんきオール電化プラン' : (isGasSet === 'セット' ? 'すまいのでんきセット' : 'すまいのでんきのみ')}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n${dateLine}\n支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
                    break;
                 case 'サカイ':
                    comment = `【ストエネ】HAHZZT259 ${tag}\nFM取込社名：サカイ販路\n後確希望日/時間：${elecPostConfirmationDateTime || ''}\n名乗り：ライフイン24\n担当者：${apName || ''}\nプラン：${isAllElectric === 'あり' ? 'すまいのでんきオール電化プラン' : (isGasSet === 'セット' ? 'すまいのセット' : 'すまいの電気のみ')}\nガス：なし\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n${dateLine}\n支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
                    break;
                case 'ID:':
                case 'それ以外':
                    if (isVacancy === 'あり') {
                        comment = `【ストエネ/※空室プラン/HZEZZT011】${tag}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n主商材受注状況：${primaryProductStatus || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：Fプラン ${isAllElectric === 'あり' ? 'すまいのでんきオール電化プラン' : (isGasSet === 'セット' ? 'すまいのセット' : 'すまいの電気のみ')}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n${dateLine}\n支払い方法：${paymentMethod || ''}`;
                    } else { // isVacancy === 'なし'
                        comment = `【ストエネ】${tag}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n主商材受注状況：${primaryProductStatus || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：${isAllElectric === 'あり' ? 'すまいのでんきオール電化プラン' : (isGasSet === 'セット' ? 'すまいのセット' : 'すまいのでんきのみ')}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n${dateLine}\n支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
                    }
                    break;
            }
            break;

        case 'プラチナでんき（ジャパン）':
            switch (elecRecordIdPrefix) {
                case 'SR':
                    if (isVacancy === 'あり') {
                         if (hasContractConfirmation === 'あり') {
                            comment = `【JAPAN電力※空室プランHAHZZT281】${tag}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n${showPrimaryProductStatus ? `主商材受注状況：${primaryProductStatus || ''}\n` : ''}名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：${isAllElectric === 'あり' ? 'プラチナでんきオール電化プラン' : 'プラチナでんき'}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：電気→${moveInDate || ''}\n支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
                        } else {
                            comment = `【JAPAN電力/★インポートのみ※空室プランHAHZZT281】${tag}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：${isAllElectric === 'あり' ? 'プラチナでんきオール電化プラン' : 'プラチナでんき'}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n性別：${gender || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n${showAttachedOption ? `付帯OP：${attachedOption || ''}\n` : ''}支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
                        }
                    } else { // isVacancy === 'なし'
                         if (hasContractConfirmation === 'あり') {
                             comment = `【JAPAN電力】HAHZZT182 ${tag}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n${showPrimaryProductStatus ? `主商材受注状況：${primaryProductStatus || ''}\n` : ''}名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：${isAllElectric === 'あり' ? 'プラチナでんきオール電化プラン' : 'プラチナでんき'}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：電気→${moveInDate || ''}\n支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
                        } else {
                            comment = `【JAPAN電力/★インポートのみ】HAHZZT182 ${tag}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：${isAllElectric === 'あり' ? 'プラチナでんきオール電化' : 'プラチナでんき'}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n性別：${gender || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n${showAttachedOption ? `付帯OP：${attachedOption || ''}\n` : ''}支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
                        }
                    }
                    break;
                case 'STJP:':
                case 'S':
                    const code = elecRecordIdPrefix === 'STJP:' ? 'HAHZZT293' : 'HAHZZT276';
                     comment = `【JAPAN電力/★インポートのみ】${code} ${tag}\nレコードID：${recordId || ''}\n担当者：${apName || ''}\nプラン：${isAllElectric === 'あり' ? 'プラチナでんきオール電化' : 'プラチナでんき'}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n性別：${gender || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：電気→${moveInDate || ''}\n付帯OP：${attachedOption || ''}\n支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
                    break;
                case 'サカイ':
                    if (isAllElectric === 'あり') {
                        comment = `【JAPAN電力】HAHZZT259　${tag}\nFM取込社名：サカイ販路\n後確希望日/時間：${elecPostConfirmationDateTime || ''}\n名乗り：ライフイン24\n担当者：${apName || ''}\nプラン： プラチナでんきオール電化プラン\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
                    } else { // 'なし' or empty
                        comment = `【JAPAN電力/★インポートのみ】HAHZZT259　${tag}\nFM取込社名：サカイ販路\n名乗り：ライフイン24\n担当者：${apName || ''}\nプラン： プラチナでんき\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n性別：${gender || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n付帯OP：${attachedOption || ''}\n支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
                    }
                    break;
                case 'ID:':
                case 'それ以外':
                    // These cases for Purachina always have hasContractConfirmation: 'なし'
                    comment = `【JAPAN電力/★インポートのみ】${tag}\nレコードID：${recordId || ''}\n担当者：${apName || ''}\nプラン：${isAllElectric === 'あり' ? 'プラチナでんきオール電化' : 'プラチナでんき'}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n性別：${gender || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：電気→${moveInDate || ''}\n${showAttachedOption ? `付帯OP：${attachedOption || ''}\n` : ''}支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
                    break;
            }
            break;
        case 'キューエネスでんき': {
            let header;
            if (recordId?.includes('No.') && isVacancy === 'あり') {
                header = `【キューエネスでんき】${tag}/※ケイアイ空室通電`;
            } else if (hasContractConfirmation === 'なし') {
                header = `【キューエネスでんき】【★インポートのみ】${tag}`;
            } else {
                header = `【キューエネスでんき】${tag}`;
            }

             if (hasContractConfirmation === 'なし') {
                comment = `${header}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：エコhome\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n支払方法：${paymentMethod || ''}\nメアド：${email || ''}\n${showAttachedOption ? `付帯：${attachedOption || ''}\n` : ''}※法人の場合は電話対応者名を記載\n対応者（漢字）：${contactPersonName || ''}\n対応者（フリガナ）：${contactPersonNameKana || ''}\n備考：${remarks || ''}`;
            } else { // 契確あり
                comment = `${header}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n${showPrimaryProductStatus ? `主商材受注状況：${primaryProductStatus || ''}\n` : ''}名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：エコhome\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n支払方法：${paymentMethod || ''}\nメアド：${email || ''}\n※法人の場合は電話対応者名を記載\n対応者（漢字）：${contactPersonName || ''}\n対応者（フリガナ）：${contactPersonNameKana || ''}\n備考：${remarks || ''}`;
            }
            break;
        }
        case 'リミックスでんき':
            const remixHeader = elecRecordIdPrefix === 'サカイ' ? `【リミックスでんき/★インポートのみ】${tag}\nレコードID：${recordId || ''}\n名乗り：ライフイン24` : `【リミックスでんき/★インポートのみ】${tag}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}`;
            comment = `${remixHeader}\n担当者：${apName || ''}\nプラン：ベーシックプラン\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n---\n郵送先郵便番号：${formattedCurrentPostalCode || ''}\n郵送先住所：${currentAddress || ''}\n郵送先物件名：\n---\nメアド：${email || ''}\n支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
            break;
        case 'HTBエナジー':
            comment = `【エネ商流_HTBエナジー】${tag}\n架電希望日時：${postConfirmationTime || ''}\n主商材受注状況：${primaryProductStatus || ''}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：プランS\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日（西暦）：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n支払い方法：${paymentMethod || ''}\nﾒｰﾙｱﾄﾞﾚｽ：${email || ''}\n備考：${remarks || ''}`;
            break;
        case 'ニチガス電気セット':
             const nichiMailingAddress = mailingOption === '現住所' ? `書面送付先：現住所（${currentAddress || ''}）` : `書面送付先：${mailingOption || ''}`;
            comment = `【ニチガス電気セット】${tag}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：ニチガス\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\nガスエリア：${gasArea || ''}（何ガスエリアかいれる）\n${dateLine}\n立会者：${gasWitness || ''}\nガス事前連絡先：${formattedGasPreContact || ''}\n支払方法：${paymentMethod || ''}\n${nichiMailingAddress}\n備考：${remarks || ''}`;
            break;
        case 'ユーパワー UPOWER':
            const upowerHeader = isNewConstruction === 'はい' ? `【U-POWER】【新築再点】${tag}` : `【U-POWER】${tag}`;
            comment = `${upowerHeader}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n主商材受注状況：${primaryProductStatus || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：グリーン100\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n支払方法：${paymentMethod || ''}\nメアド：${email || ''}\n備考：${remarks || ''}`;
            break;
        case 'はぴe':
            comment = `【はぴeプラス】${tag}\nレコードID：${recordId || ''}\nプラン：はぴeプラス\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n支払方法：${paymentMethod || ''}（コンビニ220円）\n【繋がりやすい時間帯：${postConfirmationTime || '9～17時半'}】※必須\n備考：${remarks || ''}`;
            break;
        case 'ループでんき':
            comment = `【ループでんき】${tag}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n主商材受注状況：${primaryProductStatus || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：スマートタイムワン\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\nメアド：${email || ''}\n支払い方法：${paymentMethod || ''}\n現住所：ヒアリングなし\n備考：${remarks || ''}`;
            break;
        case '東京ガス電気セット':
            comment = `【東京ガス_電気セット】${tag}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n主商材受注状況：${primaryProductStatus || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：東京ガス_セット\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日:${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n${dateLine}\n現住所：${currentAddress || ''}\n備考：${remarks || ''}`;
            break;
        case '東邦ガスセット':
            comment = `【東邦ガス電気セット】${tag}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：東邦ガスセット\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n${dateLine}\n支払い方法：${paymentMethod || ''}\n現住所：${currentAddress || '！！必須！！'}\n後確希望時間：${postConfirmationTime || '10-12・12-15・15-18・18-21'}\n備考：${remarks || ''}`;
            break;
        case '大阪ガス電気セット':
            comment = `【大阪ガス電気セット　新生活応援プラン】${tag}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n主商材受注状況：${primaryProductStatus || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n${dateLine}\n支払方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
            break;
    }

    return comment.replace(/\n\n/g, '\n').trim();
};