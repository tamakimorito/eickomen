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
                                comment = `【ストエネ/賃貸でんき※空室プランHAHZZT223】${tag}\n${showPrimaryProductStatus ? `主商材受注状況：${primaryProductStatus || ''}\n` : ''}契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：※空室プラン ${isGasSet === 'セット' ? '賃貸セット' : '賃貸電気のみ'}\nガス：${isGasSet || ''}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n${dateLine}\n支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
                            } else { // hasContractConfirmation === 'なし'
                                comment = `【ストエネ/★インポートのみ/すまいの/※空室プランHAHZZT223】${tag}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：※空室プラン ${isGasSet === 'セット' ? 'すまいのセット' : 'すまいの電気のみ'}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n性別：${gender || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n${dateLine}\n${attachedOptionLine}支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
                            }
                        } else { // isVacancy === 'なし'
                            if (hasContractConfirmation === 'あり') {
                                comment = `【ストエネ】${tag}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n主商材受注状況：${primaryProductStatus || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：${isGasSet === 'セット' ? 'すまいのセット' : 'すまいのでんきのみ'}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n${dateLine}\n支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
                            } else { // hasContractConfirmation === 'なし'
                                comment = `【ストエネ/★インポートのみ/すまいの】${tag}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：${isGasSet === 'セット' ? 'すまいのセット' : 'すまいの電気のみ'}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n性別：${gender || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n${dateLine}\n${attachedOptionLine}支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
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

        case 'プラチナでんき（ジャパン）': {
            const isImportOnly = hasContractConfirmation !== 'あり' && elecRecordIdPrefix !== 'SR';
            const isOtherRoute = ['全販路', 'それ以外', 'ID:'].includes(elecRecordIdPrefix);

            let header;
            if (isVacancy === 'あり' && isOtherRoute) {
                header = `【JAPAN電力/★インポートのみ※空室プランHZEZZT011】${tag}`;
            } else if (isVacancy === 'あり' && elecRecordIdPrefix === 'SR') {
                 header = `【JAPAN電力※空室プランHAHZZT281】${tag}`;
            } else {
                 header = `【JAPAN電力${isImportOnly ? '/★インポートのみ' : ''}】${tag}`;
            }

            let baseTemplate = [];
            
            if (elecRecordIdPrefix === 'SR') {
                baseTemplate = [
                    `契確時間：${elecConfirmationTime || ''}`,
                    `レコードID：${recordId || ''}`,
                    showPrimaryProductStatus ? `主商材受注状況：${primaryProductStatus || ''}` : null,
                    `名乗り：${greeting || ''}`,
                    `担当者：${apName || ''}`,
                    `プラン：${isAllElectric === 'あり' ? 'プラチナでんきオール電化プラン' : 'プラチナでんき'}`,
                    `契約者名義（漢字）：${contractorName || ''}`,
                    `契約者名義（フリガナ）：${contractorNameKana || ''}`,
                    `生年月日(西暦)：${dob || ''}`,
                    `電話番号：${formattedPhone || ''}`,
                    `郵便番号：${formattedPostalCode || ''}`,
                    `引越し先住所：${address || ''}`,
                    `物件名：${buildingInfo || ''}`,
                    `利用開始日：電気→${moveInDate || ''}`,
                    `支払い方法：${paymentMethod || ''}`,
                    `備考：${remarks || ''}`
                ];
            } else if (elecRecordIdPrefix === 'サカイ') {
                baseTemplate = [
                     `FM取込社名：サカイ販路`,
                     `後確希望日/時間：${elecPostConfirmationDateTime || ''}`,
                     `名乗り：ライフイン24`,
                     `担当者：${apName || ''}`,
                     `プラン：${isAllElectric === 'あり' ? 'プラチナでんきオール電化プラン' : 'プラチナでんき'}`,
                     `ガス：なし`,
                     `契約者名義（漢字）：${contractorName || ''}`,
                     `契約者名義（フリガナ）：${contractorNameKana || ''}`,
                     `生年月日(西暦)：${dob || ''}`,
                     `電話番号：${formattedPhone || ''}`,
                     `郵便番号：${formattedPostalCode || ''}`,
                     `住所：${address || ''}`,
                     `物件名：${buildingInfo || ''}`,
                     `利用開始日：電気→${moveInDate || ''}`,
                     attachedOptionLine.trim(),
                     `支払い方法：${paymentMethod || ''}`,
                     `備考：${remarks || ''}`
                ];
            } else { // Default/Other routes
                baseTemplate = [
                    `レコードID：${recordId || ''}`,
                    `名乗り：${greeting || ''}`,
                    `担当者：${apName || ''}`,
                    `プラン：${isAllElectric === 'あり' ? 'プラチナでんきオール電化プラン' : 'プラチナでんき'}`,
                    `契約者名義（漢字）：${contractorName || ''}`,
                    `契約者名義（フリガナ）：${contractorNameKana || ''}`,
                    `性別：${gender || ''}`,
                    `生年月日(西暦)：${dob || ''}`,
                    `電話番号：${formattedPhone || ''}`,
                    `郵便番号：${formattedPostalCode || ''}`,
                    `住所：${address || ''}`,
                    `物件名：${buildingInfo || ''}`,
                    `利用開始日：電気→${moveInDate || ''}`,
                    attachedOptionLine.trim(),
                    `支払い方法：${paymentMethod || ''}`,
                    `備考：${remarks || ''}`
                ];
            }
            
            comment = header + '\n' + baseTemplate.filter(Boolean).join('\n');
            break;
        }
        case 'キューエネスでんき':
        {
            const header = hasContractConfirmation === 'あり' ? `【キューエネスでんき】` : `【キューエネスでんき/★インポートのみ】`;
            const contactPersonLines = (contactPersonName || contactPersonNameKana) ? `対応者（漢字）：${contactPersonName || ''}\n対応者（フリガナ）：${contactPersonNameKana || ''}\n` : '';
            const baseTemplate = [
                header + tag,
                `レコードID：${recordId || ''}`,
                `担当者：${apName || ''}`,
                contactPersonLines.trim(),
                `契約者名義（漢字）：${contractorName || ''}`,
                `契約者名義（フリガナ）：${contractorNameKana || ''}`,
                `生年月日(西暦)：${dob || ''}`,
                `電話番号：${formattedPhone || ''}`,
                `メアド：${email || ''}`,
                `郵便番号：${formattedPostalCode || ''}`,
                `住所：${address || ''}`,
                `物件名：${buildingInfo || ''}`,
                `利用開始日：${moveInDate || ''}`,
                `備考：${remarks || ''}`
            ].filter(Boolean).join('\n');
            comment = baseTemplate;
            break;
        }

        case 'リミックスでんき':
        {
            const mailingAddressLine = (currentPostalCode || currentAddress) ? `書面送付先：〒${formattedCurrentPostalCode || ''} ${currentAddress || ''}` : '';
            const baseTemplate = [
                `【リミックスでんき】${tag}`,
                `レコードID：${recordId || ''}`,
                `担当者：${apName || ''}`,
                `契約者名義（漢字）：${contractorName || ''}`,
                `契約者名義（フリガナ）：${contractorNameKana || ''}`,
                `電話番号：${formattedPhone || ''}`,
                `メアド：${email || ''}`,
                `郵便番号：${formattedPostalCode || ''}`,
                `住所：${address || ''}`,
                `物件名：${buildingInfo || ''}`,
                `利用開始日：${moveInDate || ''}`,
                mailingAddressLine,
                `備考：${remarks || ''}`
            ].filter(Boolean).join('\n');
            comment = baseTemplate;
            break;
        }
        
        case 'HTBエナジー':
            comment = `【HTBエナジー】${tag}\nレコードID：${recordId || ''}\n担当者：${apName || ''}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日：${dob || ''}\n電話番号：${formattedPhone || ''}\nメアド：${email || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n建物名・部屋番号：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n架電希望日時：${postConfirmationTime || ''}\n備考：${remarks || ''}`;
            break;
            
        case 'ニチガス電気セット':
             comment = `【ニチガス_セット】${tag}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：ニチガス_セット\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\nガスエリア：${gasArea || ''}\n${dateLine}\n立会者：${gasWitness || ''}\nガス事前連絡先：${formattedGasPreContact || ''}\n支払方法：${paymentMethod || ''}\n書面送付先：${mailingOption === '現住所' ? `現住所（${currentAddress}）` : '設置先'}\n備考：${remarks || ''}`;
            break;
            
        case 'ユーパワー UPOWER':
            comment = `【U-POWER】\n新電力コード：0002\n${tag}\nレコードID：${recordId || ''}\n担当者：${apName || ''}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\nメアド：${email || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n新築：${isNewConstruction || ''}\n支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
            break;
            
        case 'はぴe':
             comment = `【はぴe】\n代理店コード：K0604\n${tag}\nレコードID：${recordId || ''}\n担当者：${apName || ''}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n繋がりやすい時間帯：${postConfirmationTime || ''}\n支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
            break;
        
        case 'ループでんき':
             comment = `【ループでんき】${tag}\nレコードID：${recordId || ''}\n担当者：${apName || ''}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n電話番号：${formattedPhone || ''}\nメアド：${email || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\nオール電化：${isAllElectric || ''}\n備考：${remarks || ''}`;
            break;
            
        case '東京ガス電気セット':
             comment = `【東京ガス 電気セット】${tag}\nレコードID：${recordId || ''}\n担当者：${apName || ''}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n${dateLine}\n現住所：${currentAddress || '！！必須！！'}\n備考：${remarks || ''}`;
            break;

        case '東邦ガスセット':
             comment = `【東邦ガス_セット】${tag}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：東邦ガスセット\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n${dateLine}\n後確希望時間：${postConfirmationTime || ''}\n支払い方法：${paymentMethod || ''}\n現住所：${currentAddress || '！！必須！！'}\n備考：${remarks || ''}`;
            break;
            
        case '大阪ガス電気セット':
            const fullAddressForOsaka = `${address || ''} ${buildingInfo || ''}`.trim();
             comment = [
                `【大阪ガス電気セット　新生活応援プラン】${tag}`,
                `契確時間：順次`,
                `レコードID：${recordId || ''}`,
                `主商材受注状況：${primaryProductStatus || ''}`,
                `名乗り：${greeting || ''}`,
                `担当者：${apName || ''}`,
                `契約者名義（漢字）：${contractorName || ''}`,
                `契約者名義（フリガナ）：${contractorNameKana || ''}`,
                `電話番号：${formattedPhone || ''}`,
                `郵便番号：${formattedPostalCode || ''}`,
                `引越し先住所：${fullAddressForOsaka}`,
                dateLine,
                `支払方法：${paymentMethod || ''}`,
                `備考：${remarks || ''}`
            ].join('\n');
            break;
            
    }

    return comment;
};