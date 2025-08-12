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
        apName, customerId, greeting, contractorName, contractorNameKana, gender, dob, phone, email,
        postalCode, address, buildingInfo, moveInDate,
        mailingOption, currentPostalCode, currentAddress,
        product, housingType, rackType, serviceFee, campaign, preActivationRental,
        existingLineStatus, existingLineCompany, mobileCarrier, homeDiscount, wifiRouter,
        paymentMethod, bankName, crossPathRouter,
        managementCompany, managementNumber, managementContact, contactPerson,
        buildingSurveyRequest, drawingSubmissionContact,
        remarks, isSakaiRoute, recordId
    } = formData;

    const idField = isSakaiRoute ? `レコードID：${recordId || ''}` : `顧客ID：${customerId || ''}`;
    const isChintai = product && product.includes('賃貸ねっと');
    const isChintaiFree = product === '賃貸ねっと【無料施策】';
    const isFamily = housingType && housingType.includes('ファミリー');

    const commentLines = [];

    commentLines.push(`【${product || ''}】`);
    commentLines.push(idField);
    commentLines.push(isChintai ? `名乗り：${greeting || ''}` : `名乗り（SMS届くので正確に）：${greeting || ''}`);
    commentLines.push(`担当者：${apName || ''}`);
    commentLines.push('---');
    commentLines.push('【契約者情報】');
    commentLines.push(`契約者名義（漢字）：${contractorName || ''}`);
    commentLines.push(`契約者名義（フリガナ）：${contractorNameKana || ''}`);
    if (!isChintai && !isChintaiFree) {
        commentLines.push(`性別：${gender || ''}`);
    }
    commentLines.push(`生年月日（西暦）：${dob || ''}`);
    commentLines.push(`電話番号：${phone || ''}`);
    if (isChintai || isChintaiFree) {
        commentLines.push(`メアド：${email || ''}`);
    }
    commentLines.push('---');
    commentLines.push('【設置先情報】');
    commentLines.push(`郵便番号：${postalCode || ''}`);
    commentLines.push(`住所：${address || ''}`);
    commentLines.push(`物件名＋部屋番号：${buildingInfo || ''}`);
    commentLines.push(`${isChintai || isChintaiFree ? "利用開始日(必ず引っ越し日を記載)" : "入居予定日"}：${moveInDate || ''}`);
    commentLines.push('---');
    commentLines.push('【その他詳細】');
    commentLines.push(`書面発送先：${mailingOption || ''}`);
    if (mailingOption === '現住所') {
        commentLines.push(`現住所の郵便番号：${currentPostalCode || ''}`);
        commentLines.push(`現住所・物件名・部屋番号：${currentAddress || ''}`);
    }
    commentLines.push(`案内料金：${serviceFee || ''}`);

    if (!isChintai && !isChintaiFree) {
        commentLines.push(`CP：${campaign || ''}`);
    }
    if (product !== 'SB Air' && !isChintai && !isChintaiFree) {
        commentLines.push(`開通前レンタル：${preActivationRental || ''}`);
    }
    if (!isChintaiFree) {
        commentLines.push(`${isChintai ? "ゼニガメ" : "既存回線"}：${existingLineStatus || ''}`);
        if (existingLineStatus === 'あり') {
            commentLines.push(`${isChintai ? "現状回線" : "回線会社"}：${existingLineCompany || ''}`);
        }
    }

    if (isChintai || isChintaiFree) {
        commentLines.push(`支払方法：${paymentMethod || ''}`);
        if (paymentMethod === '口座') {
            commentLines.push(`銀行名：${bankName || ''}`);
        }
        commentLines.push(`クロスパス無線ルーター：${crossPathRouter || ''}`);
    }

    if (!isChintai && !isChintaiFree) {
        commentLines.push(`携帯キャリア：${mobileCarrier || ''}`);
        if (product !== 'SB Air') {
            commentLines.push(`おうち割：${homeDiscount || ''}`);
        }
    }
    
    if (product === 'SoftBank光1G') {
        commentLines.push(`無線ルーター購入：${wifiRouter || ''}`);
    }

    if (isFamily) {
        commentLines.push('---');
        commentLines.push(isChintai ? '【管理会社情報】' : '【オーナー情報】');
        commentLines.push(`①管理会社名：${managementCompany || ''}`);
        commentLines.push(`②管理連絡先：${managementContact || ''}`);
        commentLines.push(`③担当者名：${contactPerson || ''}`);
        if (isChintai) {
            commentLines.push(`④ビル調査希望：${buildingSurveyRequest || ''}`);
            commentLines.push(`⑤図面提出方法と送付先：${drawingSubmissionContact || ''}`);
        }
    }

    if (remarks) {
        commentLines.push('---');
        commentLines.push(`備考：${remarks}`);
    }
    
    return commentLines.join('\n');
}

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
    const commentLines = [];

    const planName = isNoPair ? `GMOドコモ光 ${housingType}` : `GMOドコモ光`;
    commentLines.push(`■${planName}`);
    
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