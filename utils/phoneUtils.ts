
export const normalizePhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // 1. 全角→半角
  const halfWidth = phone.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
  
  // 2. 空白/ハイフン/長音記号除去
  const cleaned = halfWidth.replace(/[\s-ー－]/g, '');

  // 3. 先頭0を1つだけ削除
  if (cleaned.startsWith('0')) {
    return cleaned.substring(1);
  }
  
  return cleaned;
};
