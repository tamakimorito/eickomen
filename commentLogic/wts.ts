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

export const generateWtsCommentLogic = (formData: FormData): string => {
    const {
        apName, customerId, contractorName, dob, phone, wtsShippingDestination,
        wtsShippingPostalCode, wtsShippingAddress,
        wtsServerColor, wtsFiveYearPlan, wtsFreeWater, wtsCreditCard, wtsCarrier,
        moveInDate, wtsWaterPurifier, wtsMultipleUnits, wtsCustomerType,
        wtsU20HighSchool, wtsU20ParentalConsent, wtsCorporateInvoice, remarks, wtsMailingAddress,
        recordId, isSakaiRoute, wtsServerType, wtsEmail
    } = { ...formData, dob: formatDate(formData.dob), moveInDate: formatDate(formData.moveInDate) };

    const idField = isSakaiRoute ? `レコードID：${recordId || ''}` : `顧客ID：${customerId || ''}`;
    const serverAndColor = `${wtsServerType || ''} ${wtsServerColor || ''}`.trim();
    
    let header = '【プレミアムウォーター】';
    if (wtsCustomerType === 'U-20') {
        header = '【プレミアムウォーターU20】';
    } else if (wtsCustomerType === '法人') {
        header = '【プレミアムウォーター法人】';
    }
    
    const commentLines = [header];

    if (wtsCustomerType === 'U-20') {
        commentLines.push(`※高校生ヒアリング：${wtsU20HighSchool || ''}`);
        commentLines.push(`※親相談OKか：${wtsU20ParentalConsent || ''}`);
    }

    commentLines.push(`AP名：${apName || ''}`);
    commentLines.push(idField);
    
    let currentIndex = 1;
    commentLines.push(`${currentIndex++}）名義：${wtsCustomerType === '法人' ? (contractorName || '') : `（${contractorName || ''}）`}`);
    commentLines.push(`${currentIndex++}）生年月日：${dob || ''}`);
    commentLines.push(`${currentIndex++}）電話番号：${phone || ''}`);
    if (wtsCustomerType === '法人') {
        commentLines.push(`${currentIndex++}）メアド：${wtsEmail || ''}`);
    }

    let shippingDestinationText = wtsShippingDestination || '';
    if (wtsShippingDestination === 'その他') {
        shippingDestinationText = `その他（〒${wtsShippingPostalCode || ''} ${wtsShippingAddress || ''}）`;
    } else if (wtsShippingDestination === '新住所') {
        shippingDestinationText = '新住所(設置先と同じ)';
    }

    commentLines.push(`${currentIndex++}）発送先：${shippingDestinationText}`);
    commentLines.push(`${currentIndex++}）サーバー・色：${serverAndColor}`);
    commentLines.push(`${currentIndex++}）契約年数：${wtsFiveYearPlan || ''}`);
    commentLines.push(`${currentIndex++}）無料水：${wtsFreeWater || ''}`);
    commentLines.push(`${currentIndex++}）クレカ：${wtsCreditCard || ''}`);
    commentLines.push(`${currentIndex++}）キャリア：${wtsCarrier || ''}`);
    commentLines.push(`${currentIndex++}）入居予定日：${moveInDate || ''}`);
    commentLines.push(`${currentIndex++}）書面送付先：${wtsMailingAddress || ''}`);

    if (wtsCustomerType === '法人') {
        commentLines.push(`${currentIndex++}）請求書先：${wtsCorporateInvoice || ''}`);
        commentLines.push(`${currentIndex++}）浄水器確認：${wtsWaterPurifier || ''}`);
        commentLines.push(`${currentIndex++}）複数台提案：${wtsMultipleUnits || ''}`);
    } else {
        commentLines.push(`${currentIndex++}）浄水器確認：${wtsWaterPurifier || ''}`);
        commentLines.push(`${currentIndex++}）複数台提案：${wtsMultipleUnits || ''}`);
    }

    let comment = commentLines.join('\n');
    
    if (remarks) {
      comment += `\n備考：${remarks}`;
    }

    return comment;
};