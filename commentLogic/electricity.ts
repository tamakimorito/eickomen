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
        recordId, primaryProductStatus, greeting, apName, contractorName, contractorNameKana, gender, phone,
        postalCode, address, buildingInfo, paymentMethod, elecRemarks, attachedOption,
        elecConfirmationTime, elecImportCompanyName, elecPostConfirmationDateTime, email, isNewConstruction,
        postConfirmationTime, currentAddress, currentPostalCode, mailingOption, contactPersonName, contactPersonNameKana, gasOpeningTimeSlot,
        gasArea, gasWitness, gasPreContact, mailingBuildingInfo, qenesIsCorporate
    } = formData;

    const dob = formatDate(formData.dob);
    const moveInDate = formatDate(formData.moveInDate);
    const gasOpeningDate = formatDate(formData.gasOpeningDate);

    let comment = '該当するテンプレートがありません。';
    const tag = "250811";

    const isSet = isGasSet === 'セット' || ['ニチガス電気セット', '東邦ガスセット', '東京ガス電気セット', '大阪ガス電気セット'].includes(elecProvider);
    
    const noHyphenProviders = ['すまいのでんき（ストエネ）', 'プラチナでんき（ジャパン）'];
    const formattedPhone = noHyphenProviders.includes(elecProvider)
        ? (phone || '').replace(/\D/g, '')
        : formatPhoneNumberWithHyphens(phone);
    const formattedGasPreContact = formatPhoneNumberWithHyphens(gasPreContact);
    
    const formattedPostalCode = formatPostalCode(postalCode, elecProvider);
    const formattedCurrentPostalCode = formatPostalCode(currentPostalCode, elecProvider);

    // Date line logic
    let dateLine = `利用開始日：${moveInDate || ''}`;
    let elecDateLine = `利用開始日：電気→${moveInDate || ''}`;

    if (isSet) {
        let elecPart = `電気→${moveInDate || ''}`;
        let gasPart = `ガス→${gasOpeningDate || ''}`;
        let timePart = gasOpeningTimeSlot ? ` ${gasOpeningTimeSlot}` : '';
        dateLine = `利用開始日：${elecPart}　${gasPart}${timePart}`.trim();
        elecDateLine = dateLine; // Use combined line for sets
    }
    
    const showPrimaryProductStatus = hasContractConfirmation === 'あり';
    
    const attachedOptionLine = `付帯OP：${attachedOption || ''}\n`;

    switch (elecProvider) {
        case 'すまいのでんき（ストエネ）':
            const baseInfo = `レコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}`;
            const contractInfo = `契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}`;
            const addressInfo = `郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}`;
            const importAddressInfo = `郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}`;
            const vacancyNote = isVacancy === 'あり' ? '※空室\n' : '';

            switch (elecRecordIdPrefix) {
                case 'SR':
                    if (hasContractConfirmation === 'あり') {
                        const plan = isAllElectric === 'あり'
                            ? '賃貸でんきオール電化プラン'
                            : (isGasSet === 'セット' ? '賃貸セット' : '賃貸電気のみ');
                        const header = isVacancy === 'あり' ? `【ストエネ/賃貸でんき※空室プランHAHZZT223】` : `【ストエネ/賃貸】`;
                        const gasLine = isVacancy === 'あり' ? `ガス：${isAllElectric === 'あり' ? 'あり/なし' : (isGasSet || '')}\n` : '';
                        const genderLine = isVacancy !== 'あり' ? `性別：${gender || ''}\n` : '';
                        const 重説送付先Line = isAllElectric === 'あり' && isVacancy !== 'あり' ? '重説送付先：新居\n' : '';

                        comment = `${header} ${tag}\n契確時間：${elecConfirmationTime || ''}\n${primaryProductStatus ? `主商材受注状況：${primaryProductStatus}\n` : ''}${baseInfo}\nプラン：${isVacancy === 'あり' ? `※空室プラン\n` : ''}${plan}\n${gasLine}${contractInfo}\n${genderLine}${addressInfo}\n${elecDateLine}\n支払い方法：${paymentMethod || ''}\n${重説送付先Line}備考：${elecRemarks || ''}`;
                    } else { // インポートのみ
                        const plan = isAllElectric === 'あり'
                            ? (isVacancy === 'あり' ? '※空室プラン　すまいのでんきオール電化プラン' : 'すまいのでんきオール電化プラン')
                            : (isVacancy === 'あり'
                                ? (isGasSet === 'セット' ? '※空室プラン　すまいのセット' : '※空室プラン　すまいの電気のみ')
                                : (isGasSet === 'セット' ? 'すまいのセット' : 'すまいの電気のみ'));
                        const header = `【ストエネ/★インポートのみ/すまいの${isVacancy === 'あり' ? '/※空室プランHAHZZT223' : ''}】`;
                        comment = `${header} ${tag}\n${baseInfo}\nプラン：${plan}\n${contractInfo}\n性別：${gender || ''}\n${importAddressInfo}\n${elecDateLine}\n${attachedOptionLine}支払い方法：${paymentMethod || ''}\n備考：${elecRemarks || ''}`;
                    }
                    break;
                case 'code:':
                     const planCode = isAllElectric === 'あり'
                        ? 'オール電化プラン'
                        : (isGasSet === 'セット' ? 'ガスセット' : 'でんきのみ');
                    comment = `【ストエネ/★インポートのみ/賃貸/※空室プランHAHZZT241】 ${tag}\nレコードID：${recordId || ''}\nプラン：※空室プラン　\n${planCode}\n${contractInfo}\n${importAddressInfo}\n${elecDateLine}\n${attachedOptionLine}支払い方法：${paymentMethod || ''}\n備考：${elecRemarks || ''}\n性別：${gender || ''}`;
                    break;
                case 'S':
                case 'STJP:':
                    if (hasContractConfirmation === 'なし') {
                        const code = elecRecordIdPrefix === 'S' ? 'HAHZZT276' : 'HAHZZT293';
                        const planSImp = isGasSet === 'セット' ? 'すまいのセット' : 'すまいの電気のみ';
                        comment = `【ストエネ/★インポートのみ/すまいの】
${code}※ ${tag}
${baseInfo}
プラン：${planSImp}
${contractInfo}
性別：${gender || ''}
${importAddressInfo}
${vacancyNote}${elecDateLine}
${attachedOptionLine}支払い方法：${paymentMethod || ''}
備考：${elecRemarks || ''}`;
                        comment = comment.replace(/^\s*\n/gm, '');
                    } else {
                        const code = elecRecordIdPrefix === 'S' ? 'HAHZZT276' : 'HAHZZT293';
                        const planS = isAllElectric === 'あり'
                            ? 'すまいのでんきオール電化'
                            : (isGasSet === 'セット' ? 'すまいのでんきセット' : 'すまいの電気のみ');
                        comment = `【ストエネ】\n${code}※ ${tag}\n契確時間：${elecConfirmationTime || ''}\n${primaryProductStatus ? `主商材受注状況：${primaryProductStatus}\n` : ''}${baseInfo}\nプラン：${planS}\n${contractInfo}\n${addressInfo}\n${elecDateLine}\n支払い方法：${paymentMethod || ''}\n備考：${elecRemarks || ''}`;
                    }
                    break;
                case 'サカイ':
                    const planSakai = isAllElectric === 'あり'
                        ? 'すまいのでんきオール電化プラン'
                        : (isGasSet === 'セット' ? 'すまいのセット' : 'すまいの電気のみ');
                    comment = `【ストエネ】HAHZZT259 ${tag}\nFM取込社名：サカイ販路\n後確希望日/時間：${postConfirmationTime || ''}\n${baseInfo}\nプラン：${planSakai}\n${isGasSet === 'セット' ? '' : 'ガス：なし\n'}${contractInfo}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n${dateLine}\n支払い方法：${paymentMethod || ''}\n備考：${elecRemarks || ''}`;
                    break;
                case 'それ以外':
                case 'ID:':
                case 'No.':
                    if (hasContractConfirmation === 'なし') {
                        const header = isVacancy === 'あり'
                            ? `【ストエネ/★インポートのみ/※空室プラン/HZEZZT011】`
                            : `【ストエネ/★インポートのみ】`;
                        
                        const plan = isAllElectric === 'あり'
                            ? 'すまいのでんきオール電化プラン'
                            : (isGasSet === 'セット' ? 'すまいのセット' : 'すまいの電気のみ');
                        
                        comment = `${header} ${tag}\n${baseInfo}\nプラン：${plan}\n${contractInfo}\n性別：${gender || ''}\n${importAddressInfo}\n${elecDateLine}\n${attachedOptionLine}支払い方法：${paymentMethod || ''}\n備考：${elecRemarks || ''}`;
                    } else {
                        if (isVacancy === 'あり') {
                            const planF = isAllElectric === 'あり'
                                ? 'すまいのでんきオール電化プラン'
                                : (isGasSet === 'セット' ? 'すまいのセット' : 'すまいの電気のみ');
                            comment = `【ストエネ/※空室プラン/HZEZZT011】 ${tag}\n契確時間：${elecConfirmationTime || ''}\n${primaryProductStatus ? `主商材受注状況：${primaryProductStatus}\n` : ''}${baseInfo}\nプラン：${planF}\n${contractInfo}\n${addressInfo}\n利用開始日：${moveInDate || ''}\n支払い方法：${paymentMethod || ''}\n備考：${elecRemarks || ''}`;
                        } else {
                            const planElse = isAllElectric === 'あり'
                                ? 'すまいのでんきオール電化プラン'
                                : (isGasSet === 'セット' ? 'すまいのでんきセット' : 'すまいの電気のみ');
                            comment = `【ストエネ】 ${tag}\n契確時間：${elecConfirmationTime || ''}\n${primaryProductStatus ? `主商材受注状況：${primaryProductStatus}\n` : ''}${baseInfo}\nプラン：${planElse}\n${contractInfo}\n${addressInfo}\n${elecDateLine}\n支払い方法：${paymentMethod || ''}\n備考：${elecRemarks || ''}`;
                        }
                    }
                    break;
            }
            break;

        case 'プラチナでんき（ジャパン）':
            const primaryProductStatusLinePlat = showPrimaryProductStatus ? `主商材受注状況：${primaryProductStatus || ''}\n` : '';
            const baseInfoPlat = `レコードID：${recordId || ''}\n${primaryProductStatusLinePlat}担当者：${apName || ''}`;
            const contractInfoPlat = `契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}`;
            const contactInfoPlat = `電話番号：${formattedPhone || ''}`;
            const addressInfoPlat = `郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}`;
            const importAddressInfoPlat = `郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}`;

            switch (elecRecordIdPrefix) {
                case 'SR':
                    const planSR = isAllElectric === 'あり' ? 'プラチナでんきオール電化プラン' : 'プラチナでんき';
                    if (hasContractConfirmation === 'あり') {
                        const headerSR = isVacancy === 'あり' ? `【JAPAN電力※空室プランHAHZZT281】` : `【JAPAN電力】HAHZZT182`;
                        comment = `${headerSR} ${tag}\n契確時間：${elecConfirmationTime || ''}\n${baseInfoPlat}\n名乗り：${greeting || ''}\nプラン：${planSR}\n${contractInfoPlat}\n${contactInfoPlat}\n${addressInfoPlat}\n${elecDateLine}\n支払い方法：${paymentMethod || ''}\n備考：${elecRemarks || ''}`;
                    } else { // インポートのみ
                        const headerSRImp = `【JAPAN電力/★インポートのみ${isVacancy === 'あり' ? '※空室プランHAHZZT281' : ''}】`;
                        const codePart = isVacancy === 'あり' ? '' : 'HAHZZT182 ';
                        comment = `${headerSRImp} ${codePart}${tag}\n${baseInfoPlat}\n名乗り：${greeting || ''}\nプラン：${planSR}\n${contractInfoPlat}\n性別：${gender || ''}\n${contactInfoPlat}\n${importAddressInfoPlat}\n利用開始日：${moveInDate || ''}\n${attachedOptionLine}支払い方法：${paymentMethod || ''}\n備考：${elecRemarks || ''}`;
                    }
                    break;
                case 'STJP:':
                case 'S':
                     const codePlat = elecRecordIdPrefix === 'S' ? 'HAHZZT276' : 'HAHZZT293';
                    const planPlat = isAllElectric === 'あり' ? 'プラチナでんきオール電化' : 'プラチナでんき';
                    if (hasContractConfirmation === 'あり') {
                        comment = `【JAPAN電力】\n${codePlat}※ ${tag}\n契確時間：${elecConfirmationTime || ''}\n${baseInfoPlat}\n名乗り：${greeting || ''}\nプラン：${planPlat}\n${contractInfoPlat}\n${contactInfoPlat}\n${addressInfoPlat}\n${elecDateLine}\n支払い方法：${paymentMethod || ''}\n備考：${elecRemarks || ''}`;
                    } else {
                        comment = `【JAPAN電力/★インポートのみ】\n${codePlat}※ ${tag}\n${baseInfoPlat}\n名乗り：${greeting || ''}\nプラン：${planPlat}\n${contractInfoPlat}\n性別：${gender || ''}\n${contactInfoPlat}\n${importAddressInfoPlat}\n利用開始日：${moveInDate || ''}\n${attachedOptionLine}支払い方法：${paymentMethod || ''}\n備考：${elecRemarks || ''}`;
                    }
                    break;
                case 'サカイ':
                    if (isAllElectric === 'あり' && hasContractConfirmation === 'あり') {
                        comment = `【JAPAN電力】HAHZZT259 ${tag}\nFM取込社名：サカイ販路\n名乗り：ライフイン24\n${baseInfoPlat}\nプラン： プラチナでんきオール電化プラン\n${contractInfoPlat}\n性別：${gender || ''}\n${contactInfoPlat}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n支払い方法：${paymentMethod || ''}\n備考：5000CB`;
                    } else {
                        comment = `【JAPAN電力/★インポートのみ】HAHZZT259 ${tag}\nFM取込社名：サカイ販路\n名乗り：ライフイン24\n${baseInfoPlat}\nプラン： プラチナでんき\n${contractInfoPlat}\n性別：${gender || ''}\n${contactInfoPlat}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n${attachedOptionLine}支払い方法：${paymentMethod || ''}\n備考：5000CB`;
                    }
                    break;
                case 'それ以外':
                case 'ID:':
                case 'No.':
                     if (hasContractConfirmation === 'あり') {
                        const planElse = isAllElectric === 'あり' ? 'プラチナでんきオール電化' : 'プラチナでんき';
                        comment = `【JAPAN電力】 ${tag}
契確時間：${elecConfirmationTime || ''}
レコードID：${recordId || ''}
主商材受注状況：${primaryProductStatus || ''}
担当者：${apName || ''}
名乗り：${greeting || ''}
プラン：${planElse}
契約者名義（漢字）：${contractorName || ''}
契約者名義（フリガナ）：${contractorNameKana || ''}
生年月日(西暦)：${dob || ''}
電話番号：${formattedPhone || ''}
郵便番号：${formattedPostalCode || ''}
住所：${address || ''}
物件名：${buildingInfo || ''}
利用開始日：${moveInDate || ''}
支払い方法：${paymentMethod || ''}
備考：${elecRemarks || ''}`;
                        comment = comment.replace(/^\s*\n/gm, '');
                    } else { // インポートのみ (契確なし)
                        const headerElseImp = `【JAPAN電力/★インポートのみ${isVacancy === 'あり' ? '※空室プランHZEZZT011' : ''}】`;
                        const planElseImp = isAllElectric === 'あり' ? 'プラチナでんきオール電化' : 'プラチナでんき';
                        comment = `${headerElseImp} ${tag}\n${baseInfoPlat}\n名乗り：${greeting || ''}\nプラン：${planElseImp}\n${contractInfoPlat}\n性別：${gender || ''}\n${contactInfoPlat}\n${importAddressInfoPlat}\n利用開始日：${moveInDate || ''}\n${attachedOptionLine}支払い方法：${paymentMethod || ''}\n備考：${elecRemarks || ''}`;
                    }
                    break;
            }
            break;
        case 'キューエネスでんき': {
            let qenesCorporateLines = '';
            if (qenesIsCorporate) {
                qenesCorporateLines = `\n対応者（漢字）：${contactPersonName || ''}\n対応者（フリガナ）：${contactPersonNameKana || ''}`;
            }

            if (recordId?.toLowerCase().startsWith('id:')) {
                // Itanji route
                comment = `【キューエネスでんき/★インポートのみ】 ${tag}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：エコhome\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\nメアド：${email || ''}\n付帯OP：${attachedOption || ''}\n支払い方法：${paymentMethod || ''}\n備考：${elecRemarks || ''}${qenesCorporateLines}`;
            } else {
                // Other routes (No., etc.)
                const header = (recordId?.toLowerCase().startsWith('no.') && isVacancy === 'あり') 
                    ? `【キューエネスでんき】※ケイアイ空室通電 ${tag}`
                    : `【キューエネスでんき】 ${tag}`;
                
                comment = `${header}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n主商材受注状況：${primaryProductStatus || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：エコhome\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\nメアド：${email || ''}\n支払い方法：${paymentMethod || ''}\n備考：${elecRemarks || ''}${qenesCorporateLines}`;
            }
            break;
        }
        case 'リミックスでんき':
            comment = `【リミックスでんき/★インポートのみ】 ${tag}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：${attachedOption === 'あり' ? 'ベーシックプランセット' : 'ベーシックプラン'}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n---\n郵送先郵便番号：${formattedCurrentPostalCode || ''}\n郵送先住所：${currentAddress || ''}\n郵送先物件名：${mailingBuildingInfo || ''}\n---\nメアド：${email || ''}\n支払い方法：${paymentMethod || ''}\n付帯：${attachedOption || ''}\n備考：${elecRemarks || ''}`;
            break;
        case 'HTBエナジー':
            comment = `【エネ商流_HTBエナジー】 ${tag}
架電希望日時：${postConfirmationTime || ''}
主商材受注状況：${primaryProductStatus || ''}
レコードID：${recordId || ''}
名乗り：${greeting || ''}
担当者：${apName || ''}
プラン：プランS
契約者名義（漢字）：${contractorName || ''}
契約者名義（フリガナ）：${contractorNameKana || ''}
生年月日（西暦）：${dob || ''}
電話番号：${formattedPhone || ''}
郵便番号：${formattedPostalCode || ''}
引越し先住所：${address || ''}
物件名：${buildingInfo || ''}
利用開始日：${moveInDate || ''}
支払い方法：${paymentMethod || ''}
ﾒｰﾙｱﾄﾞﾚｽ：${email || ''}
備考：${elecRemarks || ''}`;
            comment = comment.replace(/^\s*\n/gm, '');
            break;
        case 'ニチガス電気セット':
            const nichigasMailingAddress = mailingOption === '現住所' ? `現住所（${(currentAddress || '') + (mailingBuildingInfo ? ' ' + mailingBuildingInfo : '')}）` : '設置先';
            comment = `【ニチガス_電気セット】 ${tag}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：ニチガス_電気セット\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\nガスエリア：${gasArea || ''}（何ガスエリアかいれる）\n利用開始日：電気→${moveInDate || ''}　ガス→${gasOpeningDate || ''} ${gasOpeningTimeSlot || ''}\n立会者：${gasWitness || ''}\nガス事前連絡先：${formattedGasPreContact || ''}\n支払方法：${paymentMethod || ''}\n書面送付先：${nichigasMailingAddress}\n備考：${elecRemarks || ''}`;
            break;
        case 'ユーパワー UPOWER':
            const upowerHeader = isNewConstruction === 'はい' ? `【U-POWER】【新築再点】` : `【U-POWER】`;
            comment = `${upowerHeader} ${tag}
契確時間：${elecConfirmationTime || ''}
レコードID：${recordId || ''}
主商材受注状況：${primaryProductStatus || ''}
名乗り：${greeting || ''}
担当者：${apName || ''}
プラン：グリーン100
契約者名義（漢字）：${contractorName || ''}
契約者名義（フリガナ）：${contractorNameKana || ''}
生年月日(西暦)：${dob || ''}
電話番号：${formattedPhone || ''}
郵便番号：${formattedPostalCode || ''}
引越し先住所：${address || ''}
物件名：${buildingInfo || ''}
利用開始日：${moveInDate || ''}
支払方法：${paymentMethod || ''}
メアド：${email || ''}
備考：${elecRemarks || ''}`;
            comment = comment.replace(/^\s*\n/gm, '');
            break;
        case 'はぴe':
            comment = `【はぴe】 ${tag}\n繋がりやすい時間帯：${postConfirmationTime || ''}（9～17時半）\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n支払い方法：${paymentMethod || ''}\n備考：${elecRemarks || ''}`;
            break;
        case 'ループでんき':
             comment = `【ループでんき/★インポートのみ】 ${tag}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：スマートタイム\nオール電化：${isAllElectric || ''}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n支払い方法：${paymentMethod || ''}\nメアド：${email || ''}\n備考：${elecRemarks || ''}`;
            break;
        case '東京ガス電気セット':
            comment = `【東京ガス 電気セット】 ${tag}\nレコードID：${recordId || ''}\n担当者：${apName || ''}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n${dateLine}\n現住所：${currentAddress || '！！必須！！'}\n備考：${elecRemarks || ''}`;
            break;
        case '東邦ガスセット':
             comment = `【東邦ガス_電気セット】 ${tag}\n後確希望時間：${postConfirmationTime || ''}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：東邦ガス_電気セット\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${formattedPhone || ''}\n郵便番号：${formattedPostalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n${dateLine}\n支払い方法：${paymentMethod || ''}\n現住所：${currentAddress || '！！必須！！'}\n備考：${elecRemarks || ''}`;
            break;
        case '大阪ガス電気セット':
             comment = `【大阪ガス電気セット　新生活応援プラン】 ${tag}
契確時間：${elecConfirmationTime || ''}
レコードID：${recordId || ''}
主商材受注状況：${primaryProductStatus || ''}
名乗り：${greeting || ''}
担当者：${apName || ''}
契約者名義（漢字）：${contractorName || ''}
契約者名義（フリガナ）：${contractorNameKana || ''}
電話番号：${formattedPhone || ''}
郵便番号：${formattedPostalCode || ''}
引越し先住所：${address || ''}${buildingInfo ? ` ${buildingInfo}` : ''}
利用開始日：電気→${moveInDate || ''}　ガス→${gasOpeningDate || ''}${gasOpeningTimeSlot ? ` ${gasOpeningTimeSlot}` : ''}
支払方法：${paymentMethod || ''}
備考：${elecRemarks || ''}`;
            comment = comment.replace(/^\s*\n/gm, '');
            break;
    }

    return comment;
};