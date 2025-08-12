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
        recordId, isSakaiRoute
    } = { ...formData, dob: formatDate(formData.dob), moveInDate: formatDate(formData.moveInDate) };

    let comment = '';
    const idField = isSakaiRoute ? `レコードID：${recordId || ''}` : `顧客ID：${customerId || ''}`;

    const commonFields = [
        `AP名：${apName || ''}`,
        idField,
        `①名義：（${contractorName || ''}）`,
        `②生年月日：${dob || ''}`,
        `③番号：${phone || ''}`,
        `④発送先：${wtsShippingDestination || ''}`,
        `⑤サーバー・色：${wtsServerColor || ''}`,
        `⑥契約年数：${wtsFiveYearPlan || ''}`,
        `⑦無料水：${wtsFreeWater || ''}`,
        `⑧クレカ：${wtsCreditCard || ''}`,
        `⑨キャリア：${wtsCarrier || ''}`,
        `⑩入居予定日：${moveInDate || ''}`,
        `⑪書面送付先：${wtsMailingAddress || ''}`,
    ];

    switch (wtsCustomerType) {
        case '通常':
            comment = [
                ...commonFields,
                `⑫浄水器確認：${wtsWaterPurifier || ''}`,
                `⑬複数台提案：${wtsMultipleUnits || ''}`
            ].join('\n');
            break;
        
        case 'U-20':
            comment = [
                `※高校生ヒアリング：${wtsU20HighSchool || ''}`,
                `※親相談OKか：${wtsU20ParentalConsent || ''}`,
                ...commonFields,
                `⑫浄水器確認：${wtsWaterPurifier || ''}`,
                `⑬複数台提案：${wtsMultipleUnits || ''}`
            ].join('\n');
            break;
            
        case '法人':
            comment = [
                `AP名：${apName || ''}`,
                idField,
                `①名義：${contractorName || ''}`,
                `②生年月日：${dob || ''}`,
                `③番号：${phone || ''}`,
                `④発送先：${wtsShippingDestination || ''}`,
                `⑤サーバー・色：${wtsServerColor || ''}`,
                `⑥契約年数：${wtsFiveYearPlan || ''}`,
                `⑦無料水：${wtsFreeWater || ''}`,
                `⑧クレカ：${wtsCreditCard || ''}`,
                `⑨キャリア：${wtsCarrier || ''}`,
                `⑩入居予定日：${moveInDate || ''}`,
                `⑪書面送付先：${wtsMailingAddress || ''}`,
                `⑫請求書先：${wtsCorporateInvoice || ''}`,
                `⑬浄水器確認：${wtsWaterPurifier || ''}`,
                `⑭複数台提案：${wtsMultipleUnits || ''}`
            ].join('\n');
            break;

        default:
            return '該当するテンプレートがありません。';
    }

    if (remarks) {
      comment += `\n備考：${remarks}`;
    }

    return comment;
};