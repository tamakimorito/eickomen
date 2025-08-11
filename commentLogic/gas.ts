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

export const generateGasCommentLogic = (formData: FormData): string => {
    const {
        gasProvider, gasRecordIdPrefix, gasIsVacancy, gasHasContractConfirmation,
        recordId, primaryProductStatus, greeting, apName, contractorName, contractorNameKana, gender, dob, phone,
        postalCode, address, buildingInfo, moveInDate, paymentMethod, remarks, attachedOption,
        elecConfirmationTime, email, gasArea, gasWitness, gasPreContact, gasOpeningTimeSlot, postConfirmationTime, currentAddress, mailingOption
    } = { ...formData, dob: formatDate(formData.dob), moveInDate: formatDate(formData.moveInDate) };

    let comment = '該当するテンプレートがありません。';
    const tag = "250811";

    switch (gasProvider) {
        case 'すまいのでんき（ストエネ）': // This is "すまいのガス"
            const suteneMailingAddress = mailingOption === '現住所' ? `書面送付先：現住所（${currentAddress || ''}）` : '書面送付先：新住所';
            const baseSuteneComment = (plan: string) => `レコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：${plan}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n性別：${gender || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${phone || ''}\n郵便番号：${postalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：電気→　　ガス→${moveInDate || ''}\nガス開栓日：${moveInDate || ''}\n付帯OP：${attachedOption || ''}\n支払い方法：${paymentMethod || ''}\n${suteneMailingAddress}\n備考：${remarks || ''}`;

            switch (gasRecordIdPrefix) {
                case 'SR':
                     if (gasIsVacancy === 'あり') {
                        comment = `【ストエネ/★インポートのみ/すまいの/※空室プランHAHZZT223】${tag}\n${baseSuteneComment('※空室プラン　すまいのガスのみ')}`;
                    } else { // なし
                        if (gasHasContractConfirmation === 'あり') {
                            comment = `【ストエネ/賃貸】${tag}\n主商材受注状況：${primaryProductStatus || ''}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：賃貸ガスのみ\nガス：あり/なし\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n性別：${gender || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${phone || ''}\n郵便番号：${postalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：電気→　　ガス→${moveInDate || ''}\n支払い方法：${paymentMethod || ''}\n${suteneMailingAddress}\n備考：${remarks || ''}`;
                        } else {
                            comment = `【ストエネ/★インポートのみ/すまいの】${tag}\n${baseSuteneComment('すまいのガスのみ')}`;
                        }
                    }
                    break;
                case 'S':
                case 'STJP:':
                    const code = gasRecordIdPrefix === 'S' ? 'HAHZZT276※' : 'HAHZZT293※';
                    comment = `【ストエネ】${code} ${tag}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n主商材受注状況：${primaryProductStatus || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：すまいのガスのみ\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${phone || ''}\n郵便番号：${postalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}\n性別：${gender || ''}`;
                    break;
                case 'サカイ':
                    comment = `【ストエネ】HAHZZT259 ${tag}\nFM取込社名：サカイ販路\n後確希望日/時間：${postConfirmationTime || ''}\n名乗り：ライフイン24\n担当者：${apName || ''}\nプラン：すまいのガスのみ\nガス：なし\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${phone || ''}\n郵便番号：${postalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
                    break;
                case 'それ以外':
                    if (gasIsVacancy === 'あり') {
                        comment = `【ストエネ/※空室プラン/HZEZZT011】${tag}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n主商材受注状況：${primaryProductStatus || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：Fプラン\nすまいのガスのみ\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${phone || ''}\n郵便番号：${postalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n支払い方法：${paymentMethod || ''}`;
                    } else { // なし
                        comment = `【ストエネ】${tag}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n主商材受注状況：${primaryProductStatus || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：すまいのガスのみ\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${phone || ''}\n郵便番号：${postalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：電気→　　　　　ガス→${moveInDate || ''}\n支払い方法：${paymentMethod || ''}\n備考：${remarks || ''}`;
                    }
                    break;
            }
            break;

        case '東京ガス単品':
            comment = `【東京ガス ガス単品】${tag}\n\nレコードID：${recordId || ''}\n担当者：${apName || ''}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${phone || ''}\n郵便番号：${postalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\nガス開栓日：${moveInDate || ''}\n時間枠：${gasOpeningTimeSlot || ''}\n（法人の場合下記も）\n立ち合い担当者フルネーム：${gasWitness || ''}\n立ち合い連絡先：${gasPreContact || ''}`;
            break;
            
        case '東邦ガス単品':
            comment = `【東邦ガス_ガス単品】${tag}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：東邦ガス単品\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${phone || ''}\n郵便番号：${postalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：電気：なし　ガス：${moveInDate || ''}\nガス開栓日：${moveInDate || ''}\nガス立会時間枠：${gasOpeningTimeSlot || ''}\n支払い方法：${paymentMethod || ''}\n書面送付先：現住所（${currentAddress || ''}）\n備考：※単品につき後確なし`;
            break;

        case '東急ガス':
            comment = `【えねこねガス_開栓】${tag}\n契確時間：${elecConfirmationTime || ''}\nレコードID：${recordId || ''}\n主商材受注状況：${primaryProductStatus || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：えねこねガス\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${phone || ''}\n郵便番号：${postalCode || ''}\n引越し先住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\nガス開栓日：${moveInDate || ''}\n立会時間枠：${gasOpeningTimeSlot || ''}\nメアド：${email || ''}\n支払い方法：${paymentMethod || ''}\n書面送付先（現住所）：${currentAddress || ''}`;
            break;

        case '大阪ガス単品':
             const osakaMailingAddress = mailingOption === '現住所' ? `支払登録用紙届け先：現住所（${currentAddress || ''}）` : '支払登録用紙届け先：新住所';
            comment = `【大阪ガス単品】${tag}\n名乗り：${greeting || ''}\nレコードID：${recordId || ''}\n担当者：${apName || ''}\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n電話番号：${phone || ''}\n郵便番号：${postalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\n利用開始日：${moveInDate || ''}\n${osakaMailingAddress}\n備考：${remarks || ''}`;
            break;

        case 'ニチガス単品':
            const nichiMailingAddress = mailingOption === '現住所' ? `書面送付先：現住所（${currentAddress || ''}）` : '書面送付先：設置先';
            comment = `【ニチガス_単品】${tag}\nレコードID：${recordId || ''}\n名乗り：${greeting || ''}\n担当者：${apName || ''}\nプラン：ニチガス_単品\n契約者名義（漢字）：${contractorName || ''}\n契約者名義（フリガナ）：${contractorNameKana || ''}\n生年月日(西暦)：${dob || ''}\n電話番号：${phone || ''}\n郵便番号：${postalCode || ''}\n住所：${address || ''}\n物件名：${buildingInfo || ''}\nガスエリア：${gasArea || ''}（何ガスエリアかいれる）\n利用開始日：${moveInDate || ''}\nガス開栓日：${moveInDate || ''}\n立会時間枠：${gasOpeningTimeSlot || ''}（日祝以外）\n立会者：${gasWitness || ''}\nガス事前連絡先：${gasPreContact || ''}\n支払方法：${paymentMethod || ''}\n${nichiMailingAddress}\n備考：${remarks || ''}`;
            break;
    }

    return comment;
};