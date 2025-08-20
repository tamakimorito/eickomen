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

const formatPostalCode = (postalCodeStr: string): string => {
  if (!postalCodeStr) return '';
  return postalCodeStr.replace(/\D/g, '');
};

export const generateWtsCommentLogic = (formData: FormData): string => {
    const {
        apName, customerId, contractorName, contractorNameKana, dob, phone, wtsShippingDestination,
        wtsShippingPostalCode, wtsShippingAddress,
        wtsServerColor, wtsFiveYearPlan, wtsFreeWater, wtsCreditCard, wtsCarrier,
        moveInDate, wtsWaterPurifier, wtsMultipleUnits, wtsCustomerType,
        wtsU20HighSchool, wtsU20ParentalConsent, wtsCorporateInvoice, remarks, wtsMailingAddress,
        recordId, isSakaiRoute, wtsServerType, wtsEmail, currentAddress, currentPostalCode
    } = { ...formData, dob: formatDate(formData.dob), moveInDate: formatDate(formData.moveInDate) };

    const idField = isSakaiRoute ? `レコードID：${recordId || ''}` : `顧客ID：${customerId || ''}`;
    const serverAndColor = `${wtsServerType || ''} ${wtsServerColor || ''}`.trim();
    
    const formattedPhone = formatPhoneNumberWithHyphens(phone);
    const formattedShippingPostalCode = formatPostalCode(wtsShippingPostalCode);
    
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
    
    let nameDisplay = contractorName || '';
    if (contractorNameKana) {
        nameDisplay += `（${contractorNameKana}）`;
    }
    commentLines.push(`${currentIndex++}）名義：${nameDisplay}`);
    
    commentLines.push(`${currentIndex++}）生年月日：${dob || ''}`);
    commentLines.push(`${currentIndex++}）電話番号：${formattedPhone || ''}`);
    if (wtsCustomerType === '法人') {
        commentLines.push(`${currentIndex++}）メアド：${wtsEmail || ''}`);
    }

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
    commentLines.push(`${currentIndex++}）キャリア：${wtsCarrier || ''}`);
    commentLines.push(`${currentIndex++}）入居予定日：${moveInDate || ''}`);
    
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

    let comment = commentLines.join('\n');
    
    if (remarks) {
      comment += `\n備考：${remarks}`;
    }

    return comment;
};