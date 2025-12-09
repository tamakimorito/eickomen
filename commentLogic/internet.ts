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

// GMOドコモ光専用：年未入力 (MM/DD, M月D日, 全角混在) の場合に
// 今日(Asia/Tokyo)から見て「最も近い未来年」で YYYY/MM/DD を返す。
// 年が含まれる場合は既存 formatDate(dateStr) に委ねる（＝従来どおり）。
const formatDateNearestFutureYYYYMMDD = (dateStr) => {
  if (!dateStr) return '';

  const toHalf = (s) =>
    String(s)
      .trim()
      .replace(/[０-９]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0xFEE0))
      .replace(/／/g, '/')
      .replace(/\s+/g, '');

  const s = toHalf(dateStr);

  // 年が明示されている場合は従来関数で整形（副作用回避）
  if (/\d{4}/.test(s)) {
    return formatDate(s);
  }

  // 「M月D日」→「M/D」に正規化
  const mdFromKanji = s.match(/^(\d{1,2})\s*月\s*(\d{1,2})\s*日$/);
  const mds = mdFromKanji ? `${mdFromKanji[1]}/${mdFromKanji[2]}` : s;

  // 「M/D」だけが入っている前提で解釈
  const md = mds.match(/^(\d{1,2})\s*\/\s*(\d{1,2})$/);
  if (!md) {
    // 解釈不能は現行踏襲：原文返し
    return dateStr;
  }
  const m = parseInt(md[1], 10);
  const d = parseInt(md[2], 10);
  if (!(m >= 1 && m <= 12)) return dateStr;

  // Tokyo ローカル日付の「今日」
  const now = new Date(); // 実行環境は日本運用前提
  const y = now.getFullYear();
  const today = new Date(y, now.getMonth(), now.getDate());

  const candThis = new Date(y, m - 1, d);
  const chosenY = (candThis >= today) ? y : (y + 1);

  // 妥当日チェック（例：2/30 はNG）
  const cand = new Date(chosenY, m - 1, d);
  if (cand.getMonth() + 1 !== m || cand.getDate() !== d) {
    return dateStr; // 不正日は原文返し
  }

  const MM = String(m).padStart(2, '0');
  const DD = String(d).padStart(2, '0');
  return `${chosenY}/${MM}/${DD}`;
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
        internetRemarks,
        managementCompany,
        managementNumber,
        contactPerson,
        contactPersonKana,
        noDrilling,
        drawingSubmission,
        drawingSubmissionContact,
        // Chintai specific fields
        email,
        paymentMethod,
        bankName,
        crossPathRouter,
        managementContact,
        buildingSurveyRequest,
    } = formData;
    
    const tag = "250811";
    const idField = isSakaiRoute ? `レコードID：${recordId || ''}` : `顧客ID：${customerId || ''}`;
    const isFamily = housingType && housingType.includes('ファミリー');
    const mailingOptionLabel = mailingOption === '新居' ? '新居(設置先と同じ)' : '現住所';
    let commentLines = [];
    
    const isChintaiProduct = product && product.includes('賃貸ねっと');
    const formattedPhone = isChintaiProduct ? (phone || '').replace(/\D/g, '') : formatPhoneNumberWithHyphens(phone);
    
    const formattedPostalCode = formatPostalCode(postalCode);
    const formattedCurrentPostalCode = formatPostalCode(currentPostalCode);


    switch (product) {
        case 'SoftBank光1G':
            commentLines = [
                `〓SoftBank光1G〓 ${tag}`,
                `タイプ：${housingType || ''}`,
                `AP名：${apName || ''}`,
                idField,
                `名乗り(お客様にSMS届くため正確に)：${greeting || ''}`,
                `ラック：${rackType || ''}`,
                `契約者名義（漢字）：${contractorName || ''}`,
                `契約者名義（フリガナ）：${contractorNameKana || ''}`,
                `性別：${gender || ''}`,
                `生年月日(西暦)：${dob || ''}`,
                `電話番号(ハイフンあり)：${formattedPhone || ''}`,
                `➤設置先`,
                `郵便番号(〒・ハイフン無し)：${formattedPostalCode || ''}`,
                `住所：${address || ''}`,
                `物件名＋部屋番号：${buildingInfo || ''}`,
                `入居予定日：${moveInDate || ''}`,
                `■書面発送先：${mailingOptionLabel || ''}`,
            ];
            if (mailingOption === '現住所') {
                commentLines.push(`現住所の場合郵便番号(〒・ハイフン無し)：${formattedCurrentPostalCode || ''}`);
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
                `備考：${internetRemarks || ''}`
            );
            break;

        case 'SoftBank光10G':
            commentLines = [
                `〓SoftBank光10ギガ〓 ${tag}`,
                `タイプ：${housingType || ''}`,
                `AP名：${apName || ''}`,
                idField,
                `名乗り（SMS届くので正確に）：${greeting || ''}`,
                `ラック：${rackType || ''}`,
                `契約者名義（漢字）：${contractorName || ''}`,
                `契約者名義（フリガナ）：${contractorNameKana || ''}`,
                `性別：${gender || ''}`,
                `生年月日(西暦)：${dob || ''}`,
                `電話番号(ハイフンあり)：${formattedPhone || ''}`,
                `➤設置先`,
                `郵便番号(〒・ハイフン無し)：${formattedPostalCode || ''}`,
                `住所：${address || ''}`,
                `物件名＋部屋番号：${buildingInfo || ''}`,
                `入居予定日：${moveInDate || ''}`,
                `■書面発送先：${mailingOptionLabel || ''}`,
            ];
            if (mailingOption === '現住所') {
                commentLines.push(`現住所の場合郵便番号(〒・ハイフン無し)：${formattedCurrentPostalCode || ''}`);
                commentLines.push(`住所・物件名・部屋番号：${currentAddress || ''}`);
            }
            commentLines.push(
                `案内料金：${serviceFee || ''}`,
                `ＣＰ：${campaign || ''}`,
                `開通前レンタル：${preActivationRental || ''}`,
                `既存回線：${existingLineStatus === 'あり' ? `あり（回線会社：${existingLineCompany || ''}）` : '無し'}`,
                `携帯キャリア：${mobileCarrier || ''}`,
                `おうち割：${homeDiscount || ''}`,
                `備考：${internetRemarks || ''}`
            );
            break;

        case 'SB Air':
            commentLines = [
                `〓SB Air〓 ${tag}`,
                `タイプ：${housingType || ''}`,
                `AP名：${apName || ''}`,
                idField,
                `名乗り（SMS届くので正確に）：${greeting || ''}`,
                `契約者名義（漢字）：${contractorName || ''}`,
                `契約者名義（フリガナ）：${contractorNameKana || ''}`,
                `性別：${gender || ''}`,
                `生年月日(西暦)：${dob || ''}`,
                `電話番号(ハイフンあり)：${formattedPhone || ''}`,
                `➤設置先`,
                `郵便番号(〒・ハイフン無し)：${formattedPostalCode || ''}`,
                `住所：${address || ''}`,
                `物件名＋部屋番号：${buildingInfo || ''}`,
                `入居予定日：${moveInDate || ''}`,
                `■書面発送先：${mailingOptionLabel || ''}`,
            ];
            if (mailingOption === '現住所') {
                commentLines.push(`現住所の場合郵便番号(〒・ハイフン無し)：${formattedCurrentPostalCode || ''}`);
                commentLines.push(`住所・物件名・部屋番号：${currentAddress || ''}`);
            }
            commentLines.push(
                `案内料金：${serviceFee || ''}`,
                `ＣＰ：${campaign || ''}`,
                `既存回線：${existingLineStatus === 'あり' ? `あり（回線会社：${existingLineCompany || ''}）` : '無し'}`,
                `携帯キャリア：${mobileCarrier || ''}`,
                `備考：${internetRemarks || ''}`
            );
            break;

        default: // This handles '賃貸ねっと' and '賃貸ねっと【無料施策】'
            { // Use a block to scope variables
                if (isChintaiProduct) {
                    const isChintaiFree = product === '賃貸ねっと【無料施策】';
                    const header = isChintaiFree
                        ? `【ちんむりょ賃貸ねっと無料施策】 ${tag}`
                        : `【賃貸ねっと】 ${tag}`;

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
                    commentLines.push(`電話番号(ハイフン無し)：${formattedPhone || ''}`);
                    commentLines.push(`➤設置先`);
                    commentLines.push(`郵便番号(〒・ハイフン無し)：${formattedPostalCode || ''}`);
                    commentLines.push(`住所：${address || ''}`);
                    commentLines.push(`物件名＋部屋番号：${buildingInfo || ''}`);
                    commentLines.push(`利用開始日(必ず引っ越し日を記載)：${moveInDate || ''}`);
                    commentLines.push(`■書面発送先：${mailingOptionLabel || ''}`);

                    if (mailingOption === '現住所') {
                        commentLines.push(`現住所の場合郵便番号(〒・ハイフン無し)：${formattedCurrentPostalCode || ''}`);
                        commentLines.push(`住所・物件名・部屋番号：${currentAddress || ''}`);
                    }

                    commentLines.push(`案内料金：${serviceFee || ''}`);
                    const paymentText = paymentMethod === '口座' ? `口座（銀行名：${bankName || ''}）※外国人は口座NG` : (paymentMethod || '');
                    commentLines.push(`支払方法：${paymentText}`);
                    commentLines.push(`クロスパス無線ルーター：${crossPathRouter || ''}`);
                    commentLines.push(`備考：${internetRemarks || ''}`);
                    
                    const showChintaiOwnerInfo = housingType === 'ファミリー' || (housingType === '10G' && rackType === '無し');

                    if (showChintaiOwnerInfo) {
                        commentLines.push(
                            ``,
                            `ファミリータイプはオーナー確認①②③必須！`,
                            `図面提出ある場合は④を「有」にして⑤を記載`,
                            ``,
                            `管理会社情報`,
                            `①管理会社名：${managementCompany || ''}`,
                            `②管理連絡先：${managementContact || ''}`,
                            `③担当者名：${contactPerson || ''}様`,
                            `担当者（フリガナ）：${contactPersonKana || ''}`,
                            `④ビル調査希望：${buildingSurveyRequest || '無'}`,
                            `⑤図面提出方法と送付先：${drawingSubmissionContact || '無'}`,
                            `穴あけビス止めNG`
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
            `・担当者：${contactPerson || ''}様`,
            `・担当者（フリガナ）：${contactPersonKana || ''}`
        );
        if (noDrilling) {
            commentLines.push(`穴あけ・ビス止めNG`);
        }
    }

    return commentLines.filter(line => line !== null && line !== undefined).join('\n');
};

const generateGmoDocomoComment = (formData: FormData): string => {
    const {
        housingType, apName, customerId, gmoConstructionSplit, gmoCompensation, gmoRouter, greeting,
        contractorName, phone, gmoIsDocomoOwnerSame, gmoDocomoOwnerName, gmoDocomoOwnerPhone,
        existingLineCompany, gmoCallback1, gmoCallback2, gmoCallback3,
        gmoCallbackDate1, gmoCallbackDate2, gmoCallbackDate3,
        gmoNoPairIdType, mobileCarrier, paymentMethod,
        managementCompany, managementNumber, contactPerson, noDrilling, internetRemarks
    } = formData;
    
    const tag = "250811";
    const isNoPair = housingType.includes('ペアなし');
    const isFamily = housingType.includes('ファミリー');
    const is1G = housingType.includes('1G');
    const commentLines = [];
    
    const formattedPhone = formatPhoneNumberWithHyphens(phone);
    const formattedGmoDocomoOwnerPhone = formatPhoneNumberWithHyphens(gmoDocomoOwnerPhone);


    let header = `■GMOドコモ光 ${tag}`;
    if (housingType) {
        header += `（${housingType}）`;
    }
    if (is1G) {
        header += '※10G案内不要';
    }
    commentLines.push(header);

    if (!isNoPair) {
        commentLines.push(`工事費分割案内済${gmoConstructionSplit ? '✔' : ''}`);
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
    commentLines.push(`②申込者電話番号：${formattedPhone || ''}`);

    if (isNoPair) {
        commentLines.push(`③携帯キャリア：${mobileCarrier || ''}`);
        commentLines.push(`④支払い方法：${paymentMethod || ''}`);
        commentLines.push(`⑤現在利用回線：${existingLineCompany || ''}`);
    } else {
        if (gmoIsDocomoOwnerSame) {
            commentLines.push(`③ドコモ名義人：同じ`);
            commentLines.push(`④ドコモ名義人電話番号：同じ`);
        } else {
            commentLines.push(`③ドコモ名義人：${gmoDocomoOwnerName || ''}`);
            commentLines.push(`④ドコモ名義人電話番号：${formattedGmoDocomoOwnerPhone || ''}`);
        }
        commentLines.push(`⑤現在利用回線（必須）：${existingLineCompany || ''}`);
    }

    commentLines.push('後確希望時間枠');
    commentLines.push(`第一希望：${formatDateNearestFutureYYYYMMDD(gmoCallbackDate1) || ''} ${gmoCallback1 || ''}`.trim());
    commentLines.push(`第二希望：${formatDateNearestFutureYYYYMMDD(gmoCallbackDate2) || ''} ${gmoCallback2 || ''}`.trim());
    commentLines.push(`第三希望：${formatDateNearestFutureYYYYMMDD(gmoCallbackDate3) || ''} ${gmoCallback3 || ''}`.trim());

    if (isFamily) {
        commentLines.push(
            ``,
            `オーナー情報（ファミリープラン用）`,
            `管理会社：${managementCompany || ''}`,
            `管理番号：${managementNumber || ''}`,
            `担当者：${contactPerson || ''}`
        );
        if (noDrilling) {
            commentLines.push(`穴あけ・ビス止めNG`);
        }
    }
    
    if (internetRemarks) {
        commentLines.push(`備考：${internetRemarks}`);
    }

    return commentLines.join('\n');
};

const generateAuHikariComment = (formData: FormData): string => {
    const {
        apName,
        recordId,
        greeting,
        contractorName,
        existingLineCompany,
        postalCode,
        address,
        auPlanProvider,
        internetRemarks, // This is used for '案内内容'
        auWifiRouter,
        auOptions,
        auSupport,
        auCampaign,
        phone,
        auContactType,
        auPreCheckTime,
        serviceFee
    } = formData;
    
    const tag = "250811";

    const formatPostalCodeWithHyphen = (pc: string): string => {
        if (!pc) return '';
        const digits = pc.replace(/\D/g, '');
        if (digits.length === 7) {
            return `${digits.substring(0, 3)}-${digits.substring(3)}`;
        }
        return pc;
    };

    const formattedPhone = formatPhoneNumberWithHyphens(phone);
    const formattedPostalCode = formatPostalCodeWithHyphen(postalCode);

    let comment = [
        `【AUひかり】※AUでんき案内禁止 ${tag}`,
        `獲得者：${apName || ''}`,
        `レコードID：${recordId || ''}`,
        `名乗り：${greeting || ''}`,
        `お客様氏名：${contractorName || ''}`,
        `現状回線/プロバイダ：${existingLineCompany || ''}`,
        `郵便番号：${formattedPostalCode || ''}`,
        `住所：${address || ''}`,
        `案内プラン/プロバイダ：${auPlanProvider ? `${auPlanProvider}/ソネット` : ''}`,
        `案内内容：${internetRemarks || ''}`, // internetRemarks field is used here
        `Wi-Fiルーター：${auWifiRouter || ''}`,
        `オプション付帯：${auOptions || ''}`,
        `乗り換えサポート：${auSupport || ''}`,
        `適用CP：${auCampaign || ''}`,
        `ご連絡先電話番号：${formattedPhone || ''} (${auContactType || ''})`,
        `前確希望時間：${auPreCheckTime || ''}`,
        `案内料金：${serviceFee || ''}`,
    ].join('\n');

    return comment;
};

const generateGmoTokutokuComment = (formData: FormData): string => {
    const {
        apName,
        customerId,
        gmoTokutokuPlan,
        contractorName,
        dob,
        moveInDate,
        mailingOption,
        buildingInfo,
        serviceFee,
        gmoTokutokuCampaign,
        existingLineStatus,
        existingLineCompany,
        email,
        paymentMethod,
        internetRemarks,
        // Owner Info
        managementCompany,
        managementNumber,
        contactPerson,
        noDrilling,
    } = formData;
    
    const tag = "250811";
    const mailingOptionLabel = mailingOption === '新居' ? '新居' : '現住所';

    const commentLines = [
        `■GMO光 ${tag}`,
        `AP名：${apName || ''}`,
        `顧客ID：${customerId || ''}`,
        `プラン：${gmoTokutokuPlan || ''}`,
        `①名義：${contractorName || ''}`,
        `②生年月日：${dob || ''}`,
        `③引越日：${moveInDate || ''}`,
        `④書面送付先：${mailingOptionLabel || ''}`,
        `⑤設置先号室：${buildingInfo || ''}`,
        `⑥案内料金：${serviceFee || ''}`,
        `⑦ＣＰ：${gmoTokutokuCampaign || ''}`,
        `⑧既存回線：${existingLineStatus === 'あり' ? `あり（${existingLineCompany || ''}）` : (existingLineStatus || '無し')}`,
        `⑨メアド必須：${email || ''}`,
        `⑩支払い方法：${paymentMethod || ''}`,
    ];

    if (gmoTokutokuPlan === 'ファミリー') {
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

    commentLines.push(`備考：${internetRemarks || ''}`);
    
    return commentLines.join('\n');
};

const generateFletsHikariTossComment = (formData: FormData): string => {
    const {
        apName, greeting, customerId, fletsRegion, fletsPlan, fletsHasFixedPhone,
        contractorName, contractorNameKana, contactPersonName, contactPerson, phone,
        postConfirmationTime, internetRemarks
    } = formData;

    const tag = "250811";
    const formattedPhone = formatPhoneNumberWithHyphens(phone);

    const companyKeywords = ['株式会社', '有限会社', '合同会社', '会社'];
    const contractorIsCompany = companyKeywords.some(kw => (contractorName || '').includes(kw) || (contractorNameKana || '').includes(kw));

    const contactPersonValue = contractorIsCompany ? (contactPersonName || contactPerson || '') : '';

    const commentLines = [
        `AP名：${apName || ''}`,
        `名乗り会社名：${greeting || ''}`,
        `顧客ID：${customerId || ''}`,
        `【フレッツ光トス】${fletsRegion || ''} ${tag}`,
        `①プラン：${fletsPlan || ''}`,
        `②固定電話：${fletsHasFixedPhone || ''}`,
        `③会社名：${contractorName || ''}`,
        `④会社名カナ：${contractorNameKana || ''}`,
        `⑤担当名(フルネーム必須)：${contactPersonValue}`,
        `⑥連絡先(なるべく携帯)：${formattedPhone || ''}`,
        `⑦後確時間(平日10-19時)：${postConfirmationTime || ''}`,
    ];
    
    if (internetRemarks) {
        commentLines.push(`備考：${internetRemarks}`);
    }

    return commentLines.join('\n');
};

export const generateInternetCommentLogic = (formData: FormData): string => {
    const { product } = formData;
    switch (product) {
        case 'GMOドコモ光':
            return generateGmoDocomoComment(formData);
        case 'GMOとくとく光':
            return generateGmoTokutokuComment(formData);
        case 'AUひかり':
            return generateAuHikariComment(formData);
        case 'フレッツ光トス':
            return generateFletsHikariTossComment(formData);
        case 'SoftBank光1G':
        case 'SoftBank光10G':
        case 'SB Air':
        case '賃貸ねっと':
        case '賃貸ねっと【無料施策】':
            return generateDefaultInternetComment(formData);
        default:
            return '商材を選択してください。';
    }
};