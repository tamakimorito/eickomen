
import { FormData } from './types';
import type { RadioGroupOption, RadioOption } from './types';


export const INITIAL_FORM_DATA: FormData = {
  product: 'SoftBank光1G',
  housingType: '',
  apName: '',
  customerId: '',
  greeting: '',
  contractorName: '',
  contractorNameKana: '',
  gender: '',
  dob: '',
  phone: '',
  email: '',
  rackType: '',
  postalCode: '',
  address: '',
  buildingInfo: '',
  moveInDate: '',
  mailingOption: '新居',
  currentPostalCode: '',
  currentAddress: '',
  serviceFee: '',
  campaign: '',
  preActivationRental: '',
  existingLineStatus: '',
  existingLineCompany: '',
  mobileCarrier: '',
  homeDiscount: '',
  wifiRouter: '',
  remarks: '',
  paymentMethod: '',
  bankName: '',
  crossPathRouter: '',
  managementCompany: '',
  managementNumber: '',
  managementContact: '',
  contactPerson: '',
  noDrilling: false,
  drawingSubmission: false,
  drawingSubmissionContact: '無',
  buildingSurveyRequest: '無',
};

export const PRODUCTS: RadioGroupOption[] = [
    { value: 'SoftBank光1G', label: 'SoftBank光1G' },
    { value: 'SoftBank光10G', label: 'SoftBank光10G' },
    { value: 'SB Air', label: 'SB Air' },
    { type: 'break' },
    { value: '賃貸ねっと', label: '賃貸ねっと' },
    { value: '賃貸ねっと【無料施策】', label: '賃貸ねっと【無料施策】' },
];

export const HOUSING_TYPES_1G: RadioOption[] = [
    {value: 'マンション', label: 'マンション'}, 
    {value: 'ファミリー', label: 'ファミリー'}
];

export const HOUSING_TYPES_10G: RadioOption[] = [
    {value: '10Gマンション', label: '10Gマンション'},
    {value: '10Gファミリー', label: '10Gファミリー'}
];

export const HOUSING_TYPES_AIR: RadioOption[] = [
    {value: 'ターミナル6', label: 'ターミナル6'}
];

export const HOUSING_TYPES_CHINTAI: RadioOption[] = [
    {value: 'マンション', label: 'マンション'},
    {value: 'ファミリー', label: 'ファミリー'},
    {value: '10G', label: '10G'}
];

export const HOUSING_TYPES_CHINTAI_FREE: RadioOption[] = [
    {value: 'マンション', label: 'マンション'},
    {value: 'マンション10G', label: 'マンション10G'}
];

export const RACK_OPTIONS_1G: RadioOption[] = [
    { value: '光配線', label: '光配線' },
    { value: 'VDSL', label: 'VDSL' },
    { value: 'LAN', label: 'LAN配線' },
    { value: '無し', label: '無し' },
];

export const RACK_OPTIONS_10G: RadioOption[] = [
    { value: '光配線クロス', label: '光配線クロス' },
    { value: '無し', label: '無し' },
];

export const RACK_OPTIONS_CHINTAI_FREE_MANSION: RadioOption[] = [
    { value: '光配線', label: '光配線' },
    { value: 'VDSL', label: 'VDSL' },
    { value: 'LAN', label: 'LAN配線' },
];

export const RACK_OPTIONS_CHINTAI_FREE_10G: RadioOption[] = [
    { value: '光配線クロス', label: '光配線クロス' },
];

export const CAMPAIGNS_1G: RadioOption[] = [
    { value: '引っ越し', label: '引っ越し' },
    { value: 'あんしん乗り換え', label: 'あんしん乗り換え' },
];

export const CAMPAIGNS_10G_NEW: RadioOption[] = [
    { value: '10ギガめちゃトク割', label: '10ギгаめちゃトク割' },
    { value: '10ギガめちゃトク割+あんしん乗り換え', label: '10ギガめちゃトク割+あんしん乗り換え' },
];

export const CAMPAIGNS_AIR_NEW: RadioOption[] = [
    { value: 'Airめちゃトク割サポートCP', label: 'Airめちゃトク割サポートCP' },
    { value: 'Airめちゃトク割サポートCP／＋あんしん乗り換え', label: 'Airめちゃトク割サポートCP／＋あんしん乗り換え' },
];

export const GENDERS: RadioOption[] = [
    { value: '男性', label: '男性' },
    { value: '女性', label: '女性' },
];

export const MAILING_OPTIONS: RadioOption[] = [
    { value: '新居', label: '新居(設置先と同じ)' },
    { value: '現住所', label: '現住所' },
];

export const RENTAL_OPTIONS: RadioOption[] = [
    { value: 'あり', label: 'あり' },
    { value: '無し', label: '無し' },
    { value: '未案内', label: '未案内'},
];

export const EXISTING_LINE_STATUS_OPTIONS: RadioOption[] = [
    { value: 'あり', label: 'あり' },
    { value: '無し', label: '無し' },
];

export const MOBILE_CARRIERS: RadioOption[] = [
    { value: 'SoftBank', label: 'SoftBank' },
    { value: 'Y!mobile', label: 'Y!mobile' },
    { value: 'docomo', label: 'docomo' },
    { value: 'au', label: 'au' },
    { value: 'Rakuten', label: '楽天モバイル' },
    { value: 'その他', label: 'その他' },
];

export const DISCOUNT_OPTIONS: RadioOption[] = [
    { value: 'あり', label: 'あり' },
    { value: 'なし', label: 'なし' },
];

export const DISCOUNT_OPTIONS_10G_NEW: RadioOption[] = [
    { value: 'あり▲インポート注意!!!▲', label: 'あり▲インポート注意!!!▲' },
    { value: '無し', label: '無し' },
];

export const ROUTER_OPTIONS: RadioOption[] = [
    { value: '案内した', label: '案内した' },
    { value: '未案内', label: '未案内' },
];

export const PAYMENT_METHOD_OPTIONS: RadioOption[] = [
    { value: 'クレカ', label: 'クレカ' },
    { value: '口座', label: '口座' },
];

export const CROSS_PATH_ROUTER_OPTIONS: RadioOption[] = [
    { value: '4950円購入', label: '4950円購入' },
    { value: 'お客様で手配', label: 'お客様で手配' },
];
