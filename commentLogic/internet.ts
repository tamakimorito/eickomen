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

const generateDefaultInternetComment = (formData: FormData): string => {
    const {
        product,
        housingType,
        apName,
        customerId,
        recordId,
        isSakaiRoute,
        greeting,
        rackType,
        contractorName,
        contractorNameKana,
        gender,
        dob,
        phone,
        postalCode,
        address,
        buildingInfo,
        moveInDate,
        mailingOption,
        currentPostalCode,
        currentAddress,
        serviceFee,
        campaign,
        preActivationRental,
        existingLineStatus,
        existingLineCompany,
        mobileCarrier,
        homeDiscount,
        wifiRouter,
        remarks,
        managementCompany,
        managementNumber,
        contactPerson,
        noDrilling,
        // Chintai specific fields
        email,
        paymentMethod,
        bankName,
        crossPathRouter,
        managementContact,
        buildingSurveyRequest,
        drawingSubmissionContact
    } = formData;

    const idField = isSakaiRoute ? `レコードID：${recordId || ''}` : `顧客ID：${customerId || ''}`;
    const isFamily = housingType && housingType.includes('ファミリー');
    const mailingOptionLabel = mailingOption === '新居' ? '新居(設置先と同じ)' : '現住所';
    let commentLines = [];

    switch (product) {
        case 'SoftBank光1G':
            commentLines = [
                `〓SoftBank光1G〓250811`,
                `タイプ：${housingType || ''}`,
                `AP名：${apName || ''}`,
                idField,
                `名乗り(お客様にSMS届くため正確に)：${greeting || ''}`,
                `ラック：${rackType || ''}`,
                `契約者名義（漢字）：${contractorName || ''}`,
                `契約者名義（フリガナ）：${contractorNameKana || ''}`,
                `性別：${gender || ''}`,
                `生年月日(西暦)：${dob || ''}`,
                `電話番号(ハイフンあり)：${phone || ''}`,
                `➤設置先`,
                `郵便番号(〒・ハイフン無し)：${postalCode || ''}`,
                `住所：${address || ''}`,
                `物件名＋部屋番号：${buildingInfo || ''}`,
                `入居予定日：${moveInDate || ''}`,
                `■書面発送先：${mailingOptionLabel || ''}`,
            ];
            if (mailingOption === '現住所') {
                commentLines.push(`現住所の場合郵便番号(〒・ハイフン無し)：${currentPostalCode || ''}`);
                commentLines.push(`住所・物件名・部屋番号：${currentAddress || ''}`);
            }
            commentLines.push(
                `案内料金：${serviceFee || ''}`,
                `ＣＰ：${campaign || ''}`,
                `開通前レンタル：${preActivationRental || ''}`,
                `既存回線：${existingLineStatus === 'あり' ? `あり（回線会社：${existingLineCompany || ''}）` : '無し'}`,
                `携帯キャリア：${mobileCarrier || ''}`,
                `おうち割：${homeDiscount || ''}`,
                `無線ルーター購入：${wifiRouter || ''}`,
                `備考：${remarks || ''}`
            );
            break;

        case 'SoftBank光10G':
            commentLines = [
                `〓SoftBank光10ギガ〓250731`,
                `タイプ：${housingType || ''}`,
                `AP名：${apName || ''}`,
                idField,
                `名乗り（SMS届くので正確に）：${greeting || ''}`,
                `ラック：${rackType || ''}`,
                `契約者名義（漢字）：${contractorName || ''}`,
                `契約者名義（フリガナ）：${contractorNameKana || ''}`,
                `性別：${gender || ''}`,
                `生年月日(西暦)：${dob || ''}`,
                `電話番号(ハイフンあり)：${phone || ''}`,
                `➤設置先`,
                `郵便番号(〒・ハイフン無し)：${postalCode || ''}`,
                `住所：${address || ''}`,
                `物件名＋部屋番号：${buildingInfo || ''}`,
                `入居予定日：${moveInDate || ''}`,
                `■書面発送先：${mailingOptionLabel || ''}`,
            ];
            if (mailingOption === '現住所') {
                commentLines.push(`現住所の場合郵便番号(〒・ハイフン無し)：${currentPostalCode || ''}`);
                commentLines.push(`住所・物件名・部屋番号：${currentAddress || ''}`);
            }
            commentLines.push(
                `案内料金：${serviceFee || ''}`,
                `ＣＰ：${campaign || ''}`,
                `開通前レンタル：${preActivationRental || ''}`,
                `既存回線：${existingLineStatus === 'あり' ? `あり（回線会社：${existingLineCompany || ''}）` : '無し'}`,
                `携帯キャリア：${mobileCarrier || ''}`,
                `おうち割：${homeDiscount || ''}`,
                `備考：${remarks || ''}`
            );
            break;

        case 'SB Air':
            commentLines = [
                `〓SB Air〓250811`,
                `タイプ：${housingType || ''}`,
                `AP名：${apName || ''}`,
                idField,
                `名乗り（SMS届くので正確に）：${greeting || ''}`,
                `契約者名義（漢字）：${contractorName || ''}`,
                `契約者名義（フリガナ）：${contractorNameKana || ''}`,
                `性別：${gender || ''}`,
                `生年月日(西暦)：${dob || ''}`,
                `電話番号(ハイフンあり)：${phone || ''}`,
                `➤設置先`,
                `郵便番号(〒・ハイフン無し)：${postalCode || ''}`,
                `住所：${address || ''}`,
                `物件名＋部屋番号：${buildingInfo || ''}`,
                `入居予定日：${moveInDate || ''}`,
                `■書面発送先：${mailingOptionLabel || ''}`,
            ];
            if (mailingOption === '現住所') {
                commentLines.push(`現住所の場合郵便番号(〒・ハイフン無し)：${currentPostalCode || ''}`);
                commentLines.push(`住所・物件名・部屋番号：${currentAddress || ''}`);
            }
            commentLines.push(
                `案内料金：${serviceFee || ''}`,
                `ＣＰ：${campaign || ''}`,
                `既存回線：${existingLineStatus === 'あり' ? `あり（回線会社：${existingLineCompany || ''}）` : '無し'}`,
                `携帯キャリア：${mobileCarrier || ''}`,
                `備考：${remarks || ''}`
            );
            break;
            
        default: // This handles '賃貸ねっと' and '賃貸ねっと【無料施策】'
            { // Use a block to scope variables
                const isChintaiProduct = product && product.includes('賃貸ねっと');
                if (isChintaiProduct) {
                    const isChintaiFree = product === '賃貸ねっと【無料施策】';
                    const header = isChintaiFree 
                        ? '【ちんむりょ賃貸ねっと無料施策】250811' 
                        : '【賃貸ねっと】250811';

                    commentLines.push(header);
                    commentLines.push(`タイプ：${housingType || ''}`);
                    commentLines.push(`AP名：${apName || ''}`);
                    commentLines.push(idField);
                    commentLines.push(`名乗り：${greeting || ''}`);

                    if (!isChintaiFree) {
                        const zenigameText = existingLineStatus === 'あり' ? `あり（現状回線：${existingLineCompany || ''}）` : (existingLineStatus || '無し');
                        commentLines.push(`ゼニガメ：${zenigameText}`);
                    }

                    commentLines.push(`ラック：${rackType || ''}`);
                    commentLines.push(`メアド：${email || ''}`);
                    commentLines.push(`契約者名義（漢字）：${contractorName || ''}`);
                    commentLines.push(`契約者名義（フリガナ）：${contractorNameKana || ''}`);
                    commentLines.push(`生年月日(西暦)：${dob || ''}`);
                    commentLines.push(`電話番号(ハイフン無し)：${phone || ''}`);
                    commentLines.push(`➤設置先`);
                    commentLines.push(`郵便番号(〒・ハイフン無し)：${postalCode || ''}`);
                    commentLines.push(`住所：${address || ''}`);
                    commentLines.push(`物件名＋部屋番号：${buildingInfo || ''}`);
                    commentLines.push(`利用開始日(必ず引っ越し日を記載)：${moveInDate || ''}`);
                    commentLines.push(`■書面発送先：${mailingOptionLabel || ''}`);
                    
                    if (mailingOption === '現住所') {
                        commentLines.push(`現住所の場合郵便番号(〒・ハイフン無し)：${currentPostalCode || ''}`);
                        commentLines.push(`住所・物件名・部屋番号：${currentAddress || ''}`);
                    }
                    
                    commentLines.push(`案内料金：${serviceFee || ''}`);
                    const paymentText = paymentMethod === '口座' ? `口座（銀行名：${bankName || ''}）※外国人は口座NG` : (paymentMethod || '');
                    commentLines.push(`支払方法：${paymentText}`);
                    commentLines.push(`クロスパス無線ルーター：${crossPathRouter || ''}`);
                    commentLines.push(`備考：${remarks || ''}`);

                    if (isFamily) {
                        commentLines.push(
                            ``,
                            `ファミリータイプはオーナー確認①②③必須！`,
                            `図面提出ある場合は④を「有」にして⑤を記載`,
                            ``,
                            `管理会社情報`,
                            `①管理会社名：${managementCompany || ''}`,
                            `②管理連絡先：${managementContact || ''}`,
                            `③担当者名：${contactPerson || ''}`,
                            `④ビル調査希望：${buildingSurveyRequest || '無'}`,
                            `⑤図面提出方法と送付先：${drawingSubmissionContact || '無'}`
                        );
                    }

                    return commentLines.join('\n');
                } else {
                    return '商材を選択してください。';
                }
            }
    }

    if (isFamily) {
        commentLines.push(
            ``,
            `オーナー情報`,
            `・管理会社：${managementCompany || ''}`,
            `・管理番号：${managementNumber || ''}`,
            `・担当者：${contactPerson || ''}`
        );
        if (noDrilling) {
            commentLines.push(`穴あけ・ビス止めNG`);
        }
    }

    return commentLines.filter(line => line !== null && line !== undefined).join('\n');
};


const generateGmoComment = (formData: FormData): string => {
    const {
        housingType, apName, customerId, gmoConstructionSplit, gmoCompensation, gmoRouter, greeting,
        contractorName, phone, gmoIsDocomoOwnerSame, gmoDocomoOwnerName, gmoDocomoOwnerPhone,
        existingLineCompany, gmoCallback1, gmoCallback2, gmoCallback3,
        gmoNoPairIdType, mobileCarrier, paymentMethod,
        managementCompany, managementNumber, contactPerson, noDrilling
    } = formData;

    const isNoPair = housingType.includes('ペアなし');
    const isFamily = housingType.includes('ファミリー');
    const is1G = housingType.includes('1G');
    const commentLines = [];

    if (is1G) {
        commentLines.push('■GMOドコモ光※10G案内不要');
    } else {
        const planName = isNoPair ? `GMOドコモ光 ${housingType}` : `GMOドコモ光`;
        commentLines.push(`■${planName}`);
    }
    
    if (!isNoPair) {
        commentLines.push(`工事費分割案内済${gmoConstructionSplit ? '✔' : ''}`);
        commentLines.push(`1Gマンション／1Gファミリー／10G：${housingType || ''}`);
    }
    
    commentLines.push(`AP名：${apName || ''}`);
    commentLines.push(`顧客ID：${customerId || ''}`);
    
    const compensationLabel = isNoPair ? 'GMO解約違約金補填2万円' : 'GMO解約違約金補填対象2万円';
    commentLines.push(`${compensationLabel}：${gmoCompensation || ''}`);
    
    const routerLabel = isNoPair ? '無線LANルーター案内' : '無線LANルーター無料案内';
    const routerValue = gmoRouter || '';
    commentLines.push(`${routerLabel}：${routerValue}`);
    
    if (isNoPair) {
        commentLines.push(`身分証：${gmoNoPairIdType || ''}`);
    }
    
    commentLines.push(`名乗り会社名：${greeting || ''}`);
    commentLines.push(`①申し込み者：${contractorName || ''}`);
    commentLines.push(`②申込者電話番号：${phone || ''}`);

    if (isNoPair) {
        commentLines.push(`③携帯キャリア：${mobileCarrier || ''}`);
        commentLines.push(`④支払い方法：${paymentMethod || ''}`);
        commentLines.push(`⑤現在利用回線：${existingLineCompany || ''}`);
    } else {
        if (gmoIsDocomoOwnerSame) {
            commentLines.push(`④ドコモ名義人：同じ`);
            commentLines.push(`⑤ドコモ名義人電話番号：同じ`);
        } else {
            commentLines.push(`④ドコモ名義人：${gmoDocomoOwnerName || ''}`);
            commentLines.push(`⑤ドコモ名義人電話番号：${gmoDocomoOwnerPhone || ''}`);
        }
        commentLines.push(`⑥現在利用回線（必須）：${existingLineCompany || ''}`);
    }
    
    commentLines.push('後確希望時間枠');
    commentLines.push(`第一希望：${gmoCallback1 || ''}`);
    commentLines.push(`第二希望：${gmoCallback2 || ''}`);
    commentLines.push(`第三希望：${gmoCallback3 || ''}`);

    if (isFamily) {
        commentLines.push('\nオーナー確認');
        commentLines.push(`・管理会社：${managementCompany || ''}`);
        commentLines.push(`・管理番号：${managementNumber || ''}`);
        commentLines.push(`・担当者：${contactPerson || ''}`);
        if(noDrilling) {
            commentLines.push('穴あけ・ビス止めNG');
        }
    }
    
    return commentLines.join('\n');
};

const generateAuComment = (formData: FormData): string => {
    const {
        apName, contractorName, existingLineCompany, postalCode, address, buildingInfo,
        auPlanProvider, auWifiRouter, auOptions, auSupport, auCampaign, phone, auContactType,
        auPreCheckTime, serviceFee
    } = formData;

    const commentLines = [
        '【必要連携項目】',
        'AUひかりお得プラン※AUでんき案内禁止',
        `■獲得者：${apName || ''}`,
        `■お客様氏名: ${contractorName || ''}`,
        `■現状回線/プロバイダ：${existingLineCompany || ''}`,
        `■〒${postalCode || ''}`,
        `■住所：${address || ''} ${buildingInfo || ''}`,
        `■案内プラン/プロバイダ：${auPlanProvider || ''}/ソネット`,
        `■案内内容：${formData.remarks || ''}`, // remarks is used for 案内内容
        `▪️Wi-Fiルーター：${auWifiRouter || ''}`,
        `▪️オプション付帯：${auOptions || ''}`,
        `▪️乗り換えサポート：${auSupport || ''}`,
        `▪️適用CP：${auCampaign || ''}`,
        `■ご連絡先電話番号(${auContactType || ''})：${phone || ''}`,
        `■前確希望時間：${auPreCheckTime || ''}`,
        `■案内料金：${serviceFee || ''}`
    ];
    
    return commentLines.join('\n');
};


export const generateInternetCommentLogic = (formData: FormData): string => {
    const { product } = formData;
    
    const formattedData = {
        ...formData,
        dob: formatDate(formData.dob),
        moveInDate: formatDate(formData.moveInDate)
    };
    
    switch (product) {
        case 'GMOドコモ光':
            return generateGmoComment(formattedData);
        case 'AUひかり':
            return generateAuComment(formattedData);
        default:
            return generateDefaultInternetComment(formattedData);
    }
};