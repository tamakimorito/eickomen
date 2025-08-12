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

export const generateInternetCommentLogic = (formData: FormData): string => {
    const {
        apName, customerId, greeting, contractorName, contractorNameKana, gender, dob, phone, email,
        postalCode, address, buildingInfo, moveInDate,
        mailingOption, currentPostalCode, currentAddress,
        product, housingType, rackType, serviceFee, campaign, preActivationRental,
        existingLineStatus, existingLineCompany, mobileCarrier, homeDiscount, wifiRouter,
        paymentMethod, bankName, crossPathRouter,
        managementCompany, managementContact, contactPerson,
        buildingSurveyRequest, drawingSubmissionContact,
        remarks, isSakaiRoute, recordId
    } = { ...formData, dob: formatDate(formData.dob), moveInDate: formatDate(formData.moveInDate) };

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
};
