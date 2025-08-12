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
        wtsServerColor, wtsFiveYearPlan, wtsFreeWater, wtsCreditCard, wtsCarrier,
        moveInDate, wtsWaterPurifier, wtsMultipleUnits, wtsCustomerType,
        wtsU20HighSchool, wtsU20ParentalConsent, wtsCorporateInvoice, remarks, wtsMailingAddress,
        recordId, isSakaiRoute, wtsServerType
    } = { ...formData, dob: formatDate(formData.dob), moveInDate: formatDate(formData.moveInDate) };

    const idField = isSakaiRoute ? `レコードID：${recordId || ''}` : `顧客ID：${customerId || ''}`;
    const serverAndColor = `${wtsServerType || ''} ${wtsServerColor || ''}`.trim();
    
    let commentLines = [];

    // Header based on customer type
    if (wtsCustomerType === 'U-20') {
        commentLines.push(`※高校生ヒアリング：${wtsU20HighSchool || ''}`);
        commentLines.push(`※親相談OKか：${wtsU20ParentalConsent || ''}`);
    }

    // Common fields for all types
    commentLines.push(`AP名：${apName || ''}`);
    commentLines.push(idField);
    commentLines.push(`①名義：${wtsCustomerType === '法人' ? (contractorName || '') : `（${contractorName || ''}）`}`);
    commentLines.push(`②生年月日：${dob || ''}`);
    commentLines.push(`③番号：${phone || ''}`);
    commentLines.push(`④発送先：${wtsShippingDestination || ''}`);
    commentLines.push(`⑤サーバー・色：${serverAndColor}`);
    commentLines.push(`⑥契約年数：${wtsFiveYearPlan || ''}`);
    commentLines.push(`⑦無料水：${wtsFreeWater || ''}`);
    commentLines.push(`⑧クレカ：${wtsCreditCard || ''}`);
    commentLines.push(`⑨キャリア：${wtsCarrier || ''}`);
    commentLines.push(`⑩入居予定日：${moveInDate || ''}`);
    commentLines.push(`⑪書面送付先：${wtsMailingAddress || ''}`);

    // Type-specific fields
    if (wtsCustomerType === '法人') {
        commentLines.push(`⑫請求書先：${wtsCorporateInvoice || ''}`);
        commentLines.push(`⑬浄水器確認：${wtsWaterPurifier || ''}`);
        commentLines.push(`⑭複数台提案：${wtsMultipleUnits || ''}`);
    } else { // 通常 and U-20
        commentLines.push(`⑫浄水器確認：${wtsWaterPurifier || ''}`);
        commentLines.push(`⑬複数台提案：${wtsMultipleUnits || ''}`);
    }

    let comment = commentLines.join('\n');
    
    if (remarks) {
      comment += `\n備考：${remarks}`;
    }

    return comment;
};