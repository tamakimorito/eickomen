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

    switch (elecProvider) {
        case 'すまいのでんき（ストエネ）':
            const suteneGasDate = isGasSet === 'セット' ? `ガス→${gasOpeningDate || ''}` : '';
            switch (elecRecordIdPrefix) {
                case 'SR':
                    if (isAllElectric === 'あり') {
                        if (isVacancy === 'あり') {
                             if (hasContractConfirmation === 'あり') {
                                comment = `【ストエネ/賃貸でんき※空室プランHAHZZT223】${tag}\n主商材受注状況：${primaryProductStatus || ''}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：※空室プラン　賃貸でんきオール電化プラン\nガス：${isGasSet || ''}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${phone || ''}\n郵便番号：${postalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：電気→${moveInDate || ''}\n支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
                            } else {
                                comment = `【ストエネ/★インポートのみ/すまいの/※空室プランHAHZZT223】${tag}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：※空室プラン　すまいのでんきオール電化プラン\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n性別：${gender || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${phone || ''}\n郵便番号：${postalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：電気→${moveInDate || ''}\n付帯OP：${attachedOption || ''}\n支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
                            }
                        } else { // isVacancy === 'なし'
                             if (hasContractConfirmation === 'あり') {
                                comment = `【ストエネ】${tag}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n主商材受注状況：${primaryProductStatus || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：賃貸でんきオール電化プラン\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${phone || ''}\n郵便番号：${postalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n支払い方法：${paymentMethod || ''}\n重説送付先：新居\n備考：${remarks || ''}`;
                            } else {
                                comment = `【ストエネ/★インポートのみ/すまいの】${tag}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：すまいのでんきオール電化プラン\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n性別：${gender || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${phone || ''}\n郵便番号：${postalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：電気→${moveInDate || ''}\n付帯OP：${attachedOption || ''}\n支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
                            }
                        }
                    } else { // isAllElectric === 'なし'
                         if (isVacancy === 'あり') {
                            if (hasContractConfirmation === 'あり') {
                                comment = `【ストエネ/賃貸でんき※空室プランHAHZZT223】${tag}\n主商材受注状況：${primaryProductStatus || ''}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：※空室プラン ${isGasSet === 'セット' ? '賃貸セット' : '賃貸電気のみ'}\nガス：${isGasSet || ''}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${phone || ''}\n郵便番号：${postalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：電気→${moveInDate || ''} ${suteneGasDate}\n支払い方法：\n備考：${remarks || ''}`;
                            } else { // hasContractConfirmation === 'なし'
                                comment = `【ストエネ/★インポートのみ/すまいの/※空室プランHAHZZT223】${tag}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：※空室プラン ${isGasSet === 'セット' ? 'すまいのセット' : 'すまいの電気のみ'}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n性別：${gender || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${phone || ''}\n郵便番号：${postalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：電気→${moveInDate || ''} ${suteneGasDate}\n付帯OP：${attachedOption || ''}\n支払い方法：\n備考：${remarks || ''}`;
                            }
                        } else { // isVacancy === 'なし'
                            if (hasContractConfirmation === 'あり') {
                                comment = `【ストエネ/賃貸】${tag}\n主商材受注状況：${primaryProductStatus || ''}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：${isGasSet === 'セット' ? '賃貸セット' : '賃貸電気のみ'}\nガス：${isGasSet || ''}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n性別：${gender || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${phone || ''}\n郵便番号：${postalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：電気→${moveInDate || ''} ${suteneGasDate}\n支払い方法：\n備考：${remarks || ''}`;
                            } else { // hasContractConfirmation === 'なし'
                                comment = `【ストエネ/★インポートのみ/すまいの】${tag}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：${isGasSet === 'セット' ? 'すまいのセット' : 'すまいの電気のみ'}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n性別：${gender || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${phone || ''}\n郵便番号：${postalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：電気→${moveInDate || ''} ${suteneGasDate}\n付帯OP：${attachedOption || ''}\n支払い方法：\n備考：${remarks || ''}`;
                            }
                        }
                    }
                    break;
                case 'code:':
                    const codeGasDate = isGasSet === 'セット' ? `ガス→${gasOpeningDate || ''}` : '';
                    comment = `【ストエネ/★インポートのみ/賃貸/※空室プランHAHZZT241】${tag}\nレコードID：${recordId || ''}\nプラン：※空室プラン　${isAllElectric === 'あり' ? 'オール電化プラン' : (isGasSet === 'セット' ? 'ガスセット' : 'でんきのみ')}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${phone || ''}\n郵便番号：${postalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：電気→${moveInDate || ''} ${codeGasDate}\n付帯OP：${attachedOption || ''}\n支払い方法：\n備考：${remarks || ''}\n性別：${gender || ''}`;
                    break;
                case 'S':
                case 'STJP:':
                    const sCode = elecRecordIdPrefix === 'S' ? 'HAHZZT276※' : 'HAHZZT293※';
                    const sGasDate = isGasSet === 'セット' ? `ガス→${gasOpeningDate || ''}` : '';
                    comment = `【ストエネ】${sCode} ${tag}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n主商材受注状況：${primaryProductStatus || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：${isAllElectric === 'あり' ? 'すまいのでんきオール電化プラン' : (isGasSet === 'セット' ? 'すまいのでんきセット' : 'すまいのでんきのみ')}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${phone || ''}\n郵便番号：${postalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${isGasSet === 'セット' ? `電気→${moveInDate || ''} ${sGasDate}` : moveInDate}\n支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
                    break;
                 case 'サカイ':
                    const sakaiGasDate = isGasSet === 'セット' ? `ガス→${gasOpeningDate || ''}` : '';
                    comment = `【ストエネ】HAHZZT259 ${tag}\nFM取込社名：サカイ販路\n後確希望日/時間：${elecPostConfirmationDateTime || ''}\n名乗り：ライフイン24\n担当者：${apName || ''}\nプラン：${isAllElectric === 'あり' ? 'すまいのでんきオール電化プラン' : (isGasSet === 'セット' ? 'すまいのセット' : 'すまいの電気のみ')}\nガス：なし\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${phone || ''}\n郵便番号：${postalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${isGasSet === 'セット' ? `電気→${moveInDate || ''} ${sakaiGasDate}` : moveInDate}\n支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
                    break;
                case 'それ以外':
                    const soreigaiGasDate = isGasSet === 'セット' ? `ガス→${gasOpeningDate || ''}` : '';
                    if (isVacancy === 'あり') {
                        comment = `【ストエネ/※空室プラン/HZEZZT011】${tag}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n主商材受注状況：${primaryProductStatus || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：Fプラン ${isAllElectric === 'あり' ? 'すまいのでんきオール電化プラン' : (isGasSet === 'セット' ? 'すまいのセット' : 'すまいの電気のみ')}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${phone || ''}\n郵便番号：${postalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${isGasSet === 'セット' ? `電気→${moveInDate || ''} ${soreigaiGasDate}` : moveInDate}\n支払い方法：`;
                    } else { // isVacancy === 'なし'
                        comment = `【ストエネ】${tag}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n主商材受注状況：${primaryProductStatus || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：${isAllElectric === 'あり' ? 'すまいのでんきオール電化プラン' : (isGasSet === 'セット' ? 'すまいのでんきセット' : 'すまいのでんきのみ')}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${phone || ''}\n郵便番号：${postalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：電気→${moveInDate || ''} ${soreigaiGasDate}\n支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
                    }
                    break;
            }
            break;

        case 'プラチナでんき（ジャパン）':
             // Common logic for プラチナでんき mailing address
            const platinaMailingAddress = mailingOption === '現住所' ? `書面送付先：現住所（${currentAddress || ''}）` : '書面送付先：新住所';

            switch (elecRecordIdPrefix) {
                case 'SR':
                    if (isVacancy === 'あり') {
                         if (hasContractConfirmation === 'あり') {
                            comment = `【JAPAN電力※空室プランHAHZZT281】${tag}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n主商材受注状況：${primaryProductStatus || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：${isAllElectric === 'あり' ? 'プラチナでんきオール電化プラン' : 'プラチナでんき'}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${phone || ''}\n郵便番号：${postalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：電気→${moveInDate || ''}\n支払い方法：${paymentMethod || ''}\n${platinaMailingAddress}\n備考：${remarks || ''}`;
                        } else {
                            comment = `【JAPAN電力/★インポートのみ※空室プランHAHZZT281】${tag}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：${isAllElectric === 'あり' ? 'プラチナでんきオール電化プラン' : 'プラチナでんき'}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n性別：${gender || ''}\n電話番号：${phone || ''}\n郵便番号：${postalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n付帯OP：${attachedOption || ''}\n支払い方法：${paymentMethod || ''}\n${platinaMailingAddress}\n備考：${remarks || ''}`;
                        }
                    } else { // isVacancy === 'なし'
                         if (hasContractConfirmation === 'あり') {
                             comment = `【JAPAN電力】HAHZZT182 ${tag}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n主商材受注状況：${primaryProductStatus || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：${isAllElectric === 'あり' ? 'プラチナでんきオール電化プラン' : 'プラチナでんき'}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${phone || ''}\n郵便番号：${postalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：電気→${moveInDate || ''}\n支払い方法：${paymentMethod || ''}\n${platinaMailingAddress}\n備考：${remarks || ''}`;
                        } else {
                            comment = `【JAPAN電力/★インポートのみ】HAHZZT182 ${tag}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：${isAllElectric === 'あり' ? 'プラチナでんきオール電化' : 'プラチナでんき'}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n性別：${gender || ''}\n電話番号：${phone || ''}\n郵便番号：${postalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n付帯OP：${attachedOption || ''}\n支払い方法：${paymentMethod || ''}\n${platinaMailingAddress}\n備考：${remarks || ''}`;
                        }
                    }
                    break;
                case 'STJP:':
                case 'S':
                    const code = elecRecordIdPrefix === 'STJP:' ? 'HAHZZT293' : 'HAHZZT276';
                     comment = `【JAPAN電力/★インポートのみ】${code} ${tag}\nレコードID：${recordId || ''}\n担当者：${apName || ''}\nプラン：${isAllElectric === 'あり' ? 'プラチナでんきオール電化' : 'プラチナでんき'}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n性別：${gender || ''}\n電話番号：${phone || ''}\n郵便番号：${postalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：電気→${moveInDate || ''}\n付帯OP：${attachedOption || ''}\n支払い方法：${paymentMethod || ''}\n${platinaMailingAddress}\n備考：${remarks || ''}`;
                    break;
                case 'サカイ':
                     if (isAllElectric === 'あり') {
                        comment = `【JAPAN電力】HAHZZT259 ${tag}\nFM取込社名：サカイ販路\n名乗り：ライフイン24\n担当者：${apName || ''}\nプラン：プラチナでんきオール電化プラン\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n性別：${gender || ''}\n電話番号：${phone || ''}\n郵便番号：${postalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n支払い方法：${paymentMethod || ''}\n${platinaMailingAddress}\n備考：5000CB`;
                    } else {
                        comment = `【JAPAN電力/★インポートのみ】HAHZZT259 ${tag}\nFM取込社名：サカイ販路\n名乗り：ライフイン24\n担当者：${apName || ''}\nプラン：プラチナでんき\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n性別：${gender || ''}\n電話番号：${phone || ''}\n郵便番号：${postalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n付帯OP：${attachedOption || ''}\n支払い方法：${paymentMethod || ''}\n${platinaMailingAddress}\n備考：5000CB`;
                    }
                    break;
                 case 'それ以外':
                    if (hasContractConfirmation === 'あり') {
                        comment = `【JAPAN電力】${tag}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n主商材受注状況：${primaryProductStatus || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：${isAllElectric === 'あり' ? 'プラチナでんきオール電化プラン' : 'プラチナでんき'}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${phone || ''}\n郵便番号：${postalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n支払い方法：${paymentMethod || ''}\n${platinaMailingAddress}\n備考：${remarks || ''}`;
                    } else {
                        comment = `【JAPAN電力/★インポートのみ】${tag}\nレコードID：${recordId || ''}\n担当者：${apName || ''}\nプラン：${isAllElectric === 'あり' ? 'プラチナでんきオール電化' : 'プラチナでんき'}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n性別：${gender || ''}\n電話番号：${phone || ''}\n郵便番号：${postalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：電気→${moveInDate || ''}\n付帯OP：${attachedOption || ''}\n支払い方法：${paymentMethod || ''}\n${platinaMailingAddress}\n備考：${remarks || ''}`;
                    }
                    break;
            }
            break;
        case 'キューエネスでんき':
             const qenesMailingAddress = mailingOption === '現住所' ? `書面送付先：別住所（${currentAddress || ''}）` : '書面送付先：基本新住所';
             if (elecRecordIdPrefix === 'ID:') {
                comment = `【キューエネスでんき】【★インポートのみ】${tag}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：エコhome\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${phone || ''}\n郵便番号：${postalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n支払方法：${paymentMethod || ''}\nメアド：${email || ''}\n${qenesMailingAddress}\n付帯：\n\n※法人の場合は電話対応者名を記載\n対応者（漢字）：${contactPersonName || ''}\n対応者（フリガナ）：${contactPersonNameKana || ''}`;
            } else { // それ以外
                comment = `【キューエネスでんき】${tag}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n主商材受注状況：${primaryProductStatus || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：エコhome\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${phone || ''}\n郵便番号：${postalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n支払方法：${paymentMethod || ''}\nメアド：${email || ''}\n${qenesMailingAddress}\n備考：${remarks || ''}\n※法人の場合は電話対応者名を記載\n対応者（漢字）：${contactPersonName || ''}\n対応者（フリガナ）：${contactPersonNameKana || ''}`;
            }
            break;
        case 'リミックスでんき':
            const remixHeader = elecRecordIdPrefix === 'サカイ' ? `【リミックスでんき/★インポートのみ】${tag}\nレコードID：${recordId || ''}\n名乗り：ライフイン24` : `【リミックスでんき/★インポートのみ】${tag}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}`;
            comment = `${remixHeader}\n担当者：${apName || ''}\nプラン：ベーシックプラン\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${phone || ''}\n郵便番号：${postalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n---\n郵送先郵便番号：${formData.currentPostalCode || ''}\n郵送先住所：${currentAddress || ''}\n郵送先物件名：\n---\nメアド：${email || ''}\n支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
            break;
        case 'HTBエナジー':
            comment = `【エネ商流_HTBエナジー】${tag}\n架電希望日時：${postConfirmationTime || ''}\n主商材受注状況：${primaryProductStatus || ''}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：プランS\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日（西暦）：${dob || ''}\n電話番号：${phone || ''}\n郵便番号：${postalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n支払い方法：${paymentMethod || ''}\nﾒｰﾙｱﾄﾞﾚｽ：${email || ''}\n備考：${remarks || ''}`;
            break;
        case 'ニチガス電気セット':
             const nichiMailingAddress = mailingOption === '現住所' ? `書面送付先：現住所（${currentAddress || ''}）` : '書面送付先：設置先';
            comment = `【ニチガス電気セット】${tag}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：ニチガス\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${phone || ''}\n郵便番号：${postalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\nガスエリア：${gasArea || ''}（何ガスエリアかいれる）\n利用開始日：電気→${moveInDate || ''}　ガス→${gasOpeningDate || ''}\n立会時間枠：${gasOpeningTimeSlot || ''}（日祝以外）\n立会者：${gasWitness || ''}\nガス事前連絡先：${gasPreContact || ''}\n支払方法：${paymentMethod || ''}\n${nichiMailingAddress}\n備考：${remarks || ''}`;
            break;
        case 'ユーパワー UPOWER':
            const upowerHeader = isNewConstruction === 'はい' ? `【U-POWER】【新築再点】${tag}` : `【U-POWER】${tag}`;
            comment = `${upowerHeader}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n主商材受注状況：${primaryProductStatus || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：グリーン100\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${phone || ''}\n郵便番号：${postalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n支払方法：${paymentMethod || ''}\nメアド：${email || ''}\n備考：${remarks || ''}`;
            break;
        case 'はぴe':
            comment = `【はぴeプラス】${tag}\nレコードID：${recordId || ''}\nプラン：はぴeプラス\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n電話番号：${phone || ''}\n郵便番号：${postalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n支払方法：${paymentMethod || ''}（コンビニ220円）\n【繋がりやすい時間帯：${postConfirmationTime || '9～17時半'}】※必須\n備考：${remarks || ''}`;
            break;
        case 'ループでんき':
            comment = `【ループでんき】${tag}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n主商材受注状況：${primaryProductStatus || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：スマートタイムワン\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${phone || ''}\n郵便番号：${postalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\nメアド：${email || ''}\n支払い方法：${paymentMethod || ''}\n現住所：ヒアリングなし`;
            break;
        case '東京ガス電気セット':
            comment = `【東京ガス_電気セット】${tag}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n主商材受注状況：${primaryProductStatus || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：東京ガス_セット\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日:${dob || ''}\n電話番号：${phone || ''}\n郵便番号：${postalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：電気→${moveInDate || ''}　ガス→${gasOpeningDate || ''}\n現住所：${currentAddress || ''}\n備考：${remarks || ''}`;
            break;
        case '東邦ガスセット':
             const tohoMailingAddress = mailingOption === '現住所' ? `書面送付先：現住所（${currentAddress || ''}）` : '書面送付先：新住所';
            comment = `【東邦ガス電気セット】${tag}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：東邦ガスセット\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${phone || ''}\n郵便番号：${postalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：電気→${moveInDate || ''}　ガス→${gasOpeningDate || ''}\nガス立会時間枠：${gasOpeningTimeSlot || ''}\n支払い方法：${paymentMethod || ''}\n${tohoMailingAddress}\n備考：後確希望時間（${postConfirmationTime || ''}）`;
            break;
        case '大阪ガス電気セット':
             const osakaMailingAddress = mailingOption === '現住所' ? `支払登録用紙届け先：現住所（${currentAddress || ''}）` : '支払登録用紙届け先：新住所';
            comment = `【大阪ガス電気セット　新生活応援プラン】${tag}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n主商材受注状況：${primaryProductStatus || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n電話番号：${phone || ''}\n郵便番号：${postalCode || ''}\n引越し先住所：${address || ''}\n利用開始日：電気→${moveInDate || ''}　ガス→${gasOpeningDate || ''}\n支払方法：${paymentMethod || ''}\n${osakaMailingAddress}\n備考：${remarks || ''}`;
            break;
    }

    return comment;
};