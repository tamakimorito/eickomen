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

const formatDigitsOnly = (value: string): string => {
  if (!value) return '';
  return value.replace(/\D/g, '');
};

export const generateWtsCommentLogic = (formData: FormData): string => {
    const {
        apName, customerId, contractorName, contractorNameKana, dob, phone, wtsShippingDestination,
        wtsShippingPostalCode, wtsShippingAddress,
        wtsServerColor, wtsFiveYearPlan, wtsFreeWater, wtsCreditCard, wtsCarrier, wtsCarrierOther,
        moveInDate, wtsWaterPurifier, wtsMultipleUnits, wtsCustomerType,
        wtsU20HighSchool, wtsU20ParentalConsent, wtsCorporateInvoice, wtsRemarks, wtsMailingAddress,
        recordId, isSakaiRoute, wtsServerType, wtsEmail, currentAddress, currentPostalCode, email,
        wtsMoveInAlready
    } = { ...formData, dob: formatDate(formData.dob), moveInDate: formatDate(formData.moveInDate) };
    
    const tag = "250811";
    const idField = isSakaiRoute ? `レコードID：${recordId || ''}` : `顧客ID：${customerId || ''}`;
    const serverAndColor = `${wtsServerType || ''} ${wtsServerColor || ''}`.trim();
    
    const formattedPhone = formatDigitsOnly(phone);
    const formattedShippingPostalCode = formatDigitsOnly(wtsShippingPostalCode);
    
    let header = `【プレミアムウォーター】 ${tag}`;
    if (wtsCustomerType === 'ジライフウォーター') {
        header = `【ジライフウォーター】 ${tag}`;
    } else if (wtsCustomerType === 'U-20') {
        header = `【プレミアムウォーターU20】 ${tag}`;
    } else if (wtsCustomerType === '法人') {
        header = `【プレミアムウォーター法人】 ${tag}`;
    }
    
    const commentLines = [header];

    if (wtsCustomerType === 'U-20') {
        commentLines.push(`※高校生ヒアリング：${wtsU20HighSchool || ''}`);
        commentLines.push(`※親相談OKか：${wtsU20ParentalConsent || ''}`);
    }

    commentLines.push(`AP名：${apName || ''}`);
    commentLines.push(idField);
    
    let currentIndex = 1;
    
    let nameDisplay = contractorName || '';
    if (contractorNameKana) {
        nameDisplay += `（${contractorNameKana}）`;
    }
    commentLines.push(`${currentIndex++}）名義：${nameDisplay}`);
    
    commentLines.push(`${currentIndex++}）生年月日：${dob || ''}`);
    commentLines.push(`${currentIndex++}）電話番号：${formattedPhone || ''}`);

    let shippingDestinationText = wtsShippingDestination || '';
    if (wtsShippingDestination === 'その他') {
        shippingDestinationText = `その他（〒${formattedShippingPostalCode || ''} ${wtsShippingAddress || ''}）`;
    } else if (wtsShippingDestination === '新住所') {
        shippingDestinationText = '新住所(設置先と同じ)';
    }

    commentLines.push(`${currentIndex++}）発送先：${shippingDestinationText}`);
    commentLines.push(`${currentIndex++}）サーバー・色：${serverAndColor}`);
    commentLines.push(`${currentIndex++}）契約年数：${wtsFiveYearPlan || ''}`);
    commentLines.push(`${currentIndex++}）無料水：${wtsFreeWater || ''}`);
    commentLines.push(`${currentIndex++}）クレカ：${wtsCreditCard || ''}`);

    const carrierLabel = wtsCarrier === 'その他' ? (wtsCarrierOther || 'その他') : wtsCarrier;
    commentLines.push(`${currentIndex++}）キャリア：${carrierLabel || ''}`);

    commentLines.push(`${currentIndex++}）入居予定日：${wtsMoveInAlready ? '入居済み' : (moveInDate || '')}`);
    
    let mailingAddressText = wtsMailingAddress || '';
    if (wtsMailingAddress === '現住所') {
        mailingAddressText = `現住所（${currentAddress || ''}）`;
    }
    commentLines.push(`${currentIndex++}）書面送付先：${mailingAddressText}`);

    if (wtsCustomerType === '法人') {
        commentLines.push(`${currentIndex++}）請求書先：${wtsCorporateInvoice || ''}`);
        commentLines.push(`${currentIndex++}）浄水器確認：${wtsWaterPurifier || ''}`);
        commentLines.push(`${currentIndex++}）複数台提案：${wtsMultipleUnits || ''}`);
    } else {
        commentLines.push(`${currentIndex++}）浄水器確認：${wtsWaterPurifier || ''}`);
        commentLines.push(`${currentIndex++}）複数台提案：${wtsMultipleUnits || ''}`);
    }
    
    commentLines.push(`${currentIndex++}）メアド：${email || wtsEmail || ''}`);

    let comment = commentLines.join('\n');
    
    if (wtsRemarks) {
      comment += `\n備考：${wtsRemarks}`;
    }

    return comment;
};