import type { FormData } from './types.ts';

export const INITIAL_FORM_DATA: FormData = {
  // --- Shared Info ---
  apName: '',
  customerId: '',
  greeting: '',
  contractorName: '',
  contractorNameKana: '',
  gender: '',
  dob: '',
  phone: '',
  email: '',
  postalCode: '',
  address: '',
  buildingInfo: '',
  moveInDate: '',
  mailingOption: '現住所',
  currentPostalCode: '',
  currentAddress: '',
  existingLineStatus: '',
  existingLineCompany: '',
  mobileCarrier: '',
  homeDiscount: '',
  remarks: '',
  paymentMethod: '',
  recordId: '',

  // --- Internet Specific ---
  product: 'SoftBank光1G',
  housingType: '',
  rackType: '',
  serviceFee: '',
  campaign: '',
  preActivationRental: '',
  wifiRouter: '',

  // --- Chintai Specific ---
  bankName: '',
  crossPathRouter: '',

  // --- Owner Info ---
  managementCompany: '',
  managementNumber: '',
  managementContact: '',
  contactPerson: '',
  noDrilling: false,
  drawingSubmission: false,
  drawingSubmissionContact: '無',
  buildingSurveyRequest: '無',

  // --- Electricity Specific ---
  elecProvider: '',
  elecRecordIdPrefix: 'それ以外',
  isAllElectric: '',
  isVacancy: '',
  hasContractConfirmation: '',
  isGasSet: '',
  elecPostConfirmationDateTime: '',
  elecImportCompanyName: '',
  isNewConstruction: 'いいえ',

  // --- Gas Specific ---
  gasProvider: '',
  gasRecordIdPrefix: 'それ以外',
  gasIsVacancy: '',
  gasHasContractConfirmation: '',
  gasArea: '',
  gasWitness: '',
  gasPreContact: '',
  gasOpeningTimeSlot: '',
  gasOpeningDate: '',

  // --- Common for Elec/Gas ---
  elecConfirmationTime: '順次',
  primaryProductStatus: '',
  attachedOption: '',
  postConfirmationTime: '',
  contactPersonName: '',
  contactPersonNameKana: '',
  isSakaiRoute: false,

  // --- WTS Specific ---
  wtsCustomerType: '通常',
  wtsShippingDestination: '',
  wtsServerColor: '',
  wtsFiveYearPlan: '',
  wtsFreeWater: '',
  wtsCreditCard: '',
  wtsCarrier: '',
  wtsMailingAddress: '現住所',
  wtsWaterPurifier: '',
  wtsMultipleUnits: '',
  wtsU20HighSchool: '',
  wtsU20ParentalConsent: '',
  wtsCorporateInvoice: '',
};

export const BUG_REPORT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxcxDeiLBs1ViBpWx6NhTWtemiiiWLydybw0piSVbxZpodzSQh2ebzyF66MeFinqou7HA/exec';

export const PRODUCTS = [
    { value: 'SoftBank光1G', label: 'SoftBank光1G' },
    { value: 'SoftBank光10G', label: 'SoftBank光10G' },
    { value: 'SB Air', label: 'SB Air' },
    { type: 'break' },
    { value: '賃貸ねっと', label: '賃貸ねっと' },
    { value: '賃貸ねっと【無料施策】', label: '賃貸ねっと【無料施策】' },
];

export const HOUSING_TYPES_1G = [
    {value: 'マンション', label: 'マンション'}, 
    {value: 'ファミリー', label: 'ファミリー'}
];

export const HOUSING_TYPES_10G = [
    {value: '10Gマンション', label: '10Gマンション'},
    {value: '10Gファミリー', label: '10Gファミリー'}
];

export const HOUSING_TYPES_AIR = [
    {value: 'ターミナル6', label: 'ターミナル6'}
];

export const HOUSING_TYPES_CHINTAI = [
    {value: 'マンション', label: 'マンション'},
    {value: 'ファミリー', label: 'ファミリー'},
    {value: '10G', label: '10G'}
];

export const HOUSING_TYPES_CHINTAI_FREE = [
    {value: 'マンション', label: 'マンション'},
    {value: 'マンション10G', label: 'マンション10G'}
];

export const RACK_OPTIONS_1G = [
    { value: '光配線', label: '光配線' },
    { value: 'VDSL', label: 'VDSL' },
    { value: 'LAN', label: 'LAN配線' },
    { value: '無し', label: '無し' },
];

export const RACK_OPTIONS_10G = [
    { value: '光配線クロス', label: '光配線クロス' },
    { value: '無し', label: '無し' },
];

export const RACK_OPTIONS_CHINTAI_FREE_MANSION = [
    { value: '光配線', label: '光配線' },
    { value: 'VDSL', label: 'VDSL' },
    { value: 'LAN', label: 'LAN配線' },
];

export const RACK_OPTIONS_CHINTAI_FREE_10G = [
    { value: '光配線クロス', label: '光配線クロス' },
];

export const CAMPAIGNS_1G = [
    { value: '引っ越し', label: '引っ越し' },
    { value: 'あんしん乗り換え', label: 'あんしん乗り換え' },
];

export const CAMPAIGNS_10G_NEW = [
    { value: '10ギガめちゃトク割', label: '10ギгаめちゃトク割' },
    { value: '10ギガめちゃトク割+あんしん乗り換え', label: '10ギガめちゃトク割+あんしん乗り換え' },
];

export const CAMPAIGNS_AIR_NEW = [
    { value: 'Airめちゃトク割サポートCP', label: 'Airめちゃトク割サポートCP' },
    { value: 'Airめちゃトク割サポートCP／＋あんしん乗り換え', label: 'Airめちゃトク割サポートCP／＋あんしん乗り換え' },
];

export const GENDERS = [
    { value: '男性', label: '男性' },
    { value: '女性', label: '女性' },
];

export const MAILING_OPTIONS = [
    { value: '新居', label: '新居(設置先と同じ)' },
    { value: '現住所', label: '現住所' },
];

export const RENTAL_OPTIONS = [
    { value: 'あり', label: 'あり' },
    { value: '無し', label: '無し' },
    { value: '未案内', label: '未案内'},
];

export const EXISTING_LINE_STATUS_OPTIONS = [
    { value: 'あり', label: 'あり' },
    { value: '無し', label: '無し' },
];

export const MOBILE_CARRIERS = [
    { value: 'SoftBank', label: 'SoftBank' },
    { value: 'Y!mobile', label: 'Y!mobile' },
    { value: 'docomo', label: 'docomo' },
    { value: 'au', label: 'au' },
    { value: 'Rakuten', label: '楽天モバイル' },
    { value: 'その他', label: 'その他' },
];

export const DISCOUNT_OPTIONS = [
    { value: 'あり', label: 'あり' },
    { value: 'なし', label: 'なし' },
];

export const DISCOUNT_OPTIONS_10G_NEW = [
    { value: 'あり▲インポート注意!!!▲', label: 'あり▲インポート注意!!!▲' },
    { value: '無し', label: '無し' },
];

export const ROUTER_OPTIONS = [
    { value: '案内した', label: '案内した' },
    { value: '未案内', label: '未案内' },
];

export const PAYMENT_METHOD_OPTIONS = [
    { value: 'クレカ', label: 'クレカ' },
    { value: '口座', label: '口座' },
];

export const PAYMENT_METHOD_OPTIONS_EXTENDED = [
    { value: 'クレカ', label: 'クレカ' },
    { value: '口座', label: '口座' },
    { value: '口座・クレジットカード', label: '口座・クレジットカード' },
];

export const CROSS_PATH_ROUTER_OPTIONS = [
    { value: '4950円購入', label: '4950円購入' },
    { value: 'お客様で手配', label: 'お客様で手配' },
];

// --- New Elec/Gas Constants ---

export const YES_NO_OPTIONS = [
    { value: 'あり', label: 'あり' },
    { value: 'なし', label: 'なし' },
];

export const YES_NO_OPTIONS_2 = [
    { value: '有', label: '有' },
    { value: '無', label: '無' },
];

export const PRIMARY_PRODUCT_STATUS_OPTIONS = [
    { value: 'あり', label: 'あり' },
    { value: 'なし', label: 'なし' },
];

export const ATTACHED_OPTION_OPTIONS = [
    { value: '有', label: '有' },
    { value: '無', label: '無' },
];

export const SET_NONE_OPTIONS = [
    { value: 'セット', label: 'セット' },
    { value: 'なし', label: 'なし' },
];

export const NEW_CONSTRUCTION_OPTIONS = [
    { value: 'はい', label: 'はい' },
    { value: 'いいえ', label: 'いいえ' },
];

export const ELEC_PROVIDERS = [
  { value: 'すまいのでんき（ストエネ）', label: 'すまいのでんき（ストエネ）' },
  { value: 'プラチナでんき（ジャパン）', label: 'プラチナでんき（ジャパン）' },
  { value: 'キューエネスでんき', label: 'キューエネスでんき' },
  { value: 'リミックスでんき', label: 'リミックスでんき' },
  { value: 'HTBエナジー', label: 'HTBエナジー' },
  { value: 'ニチガス電気セット', label: 'ニチガス電気セット' },
  { value: 'ユーパワー UPOWER', label: 'ユーパワー UPOWER' },
  { value: 'はぴe', label: 'はぴe' },
  { value: 'ループでんき', label: 'ループでんき' },
  { value: '東京ガス電気セット', label: '東京ガス電気セット' },
  { value: '東邦ガスセット', label: '東邦ガスセット' },
  { value: '大阪ガス電気セット', label: '大阪ガス電気セット' },
];

export const GAS_PROVIDERS = [
  { value: 'すまいのでんき（ストエネ）', label: 'すまいのガス' },
  { value: '東京ガス単品', label: '東京ガス単品' },
  { value: '東邦ガス単品', label: '東邦ガス単品' },
  { value: '東急ガス', label: '東急ガス' },
  { value: '大阪ガス単品', label: '大阪ガス単品' },
  { value: 'ニチガス単品', label: 'ニチガス単品' },
];

export const ELEC_ID_PREFIX_OPTIONS = [
    { value: 'SR', label: 'SR' },
    { value: 'code:', label: 'code:' },
    { value: 'S', label: 'S' },
    { value: 'STJP:', label: 'STJP:' },
    { value: 'サカイ', label: 'サカイ' },
    { value: 'ID:', label: 'ID:' },
    { value: 'それ以外', label: 'それ以外' },
    { value: '全販路', label: '全販路' },
];

export const GAS_ID_PREFIX_OPTIONS = [
    { value: 'SR', label: 'SR' },
    { value: 'S', label: 'S' },
    { value: 'STJP:', label: 'STJP:' },
    { value: 'サカイ', label: 'サカイ' },
    { value: 'それ以外', label: 'それ以外' },
    { value: '全販路', label: '全販路' },
];

export const TIME_SLOTS_TOHO = [
    { value: '10-12', label: '10-12' },
    { value: '12-15', label: '12-15' },
    { value: '15-18', label: '15-18' },
    { value: '18-21', label: '18-21' },
];

export const TIME_SLOTS_NICHI = [
    { value: '9-12', label: '9-12' },
    { value: '13-15', label: '13-15' },
    { value: '15-17', label: '15-17' },
    { value: '17-19', label: '17-19 (日祝以外)' },
];

export const GAS_OPENING_TIME_SLOTS = [
    { value: '9-12', label: '9-12' },
    { value: '13-15', label: '13-15' },
    { value: '15-17', label: '15-17' },
];

export const TIME_SLOTS_SUTENE_SR = [
    { value: '9-12', label: '9-12' },
    { value: '13-17', label: '午後枠 (13-17)' },
];

export const TIME_SLOTS_TOKYO_GAS = [
    ...GAS_OPENING_TIME_SLOTS,
    { value: '17-19', label: '17-19 (日祝除く)' },
];

// --- WTS Constants ---
export const WTS_CUSTOMER_TYPES = [
    { value: '通常', label: '通常' },
    { value: 'U-20', label: 'U-20' },
    { value: '法人', label: '法人' },
];

export const WTS_SHIPPING_DESTINATIONS = [
    { value: '設置先', label: '設置先' },
    { value: '新住所', label: '新住所' },
];

export const WTS_FIVE_YEAR_PLAN_OPTIONS = [
    { value: '話した', label: '話した' },
    { value: '話してない', label: '話してない' },
];

export const WTS_CREDIT_CARD_OPTIONS = [
    { value: 'あり', label: 'あり' },
    { value: 'なし', label: 'なし' },
];

export const WTS_WATER_PURIFIER_OPTIONS = [
    { value: 'あり', label: 'あり' },
    { value: 'なし', label: 'なし' },
];

export const WTS_MULTIPLE_UNITS_OPTIONS = [
    { value: 'した', label: 'した' },
    { value: 'してない', label: 'してない' },
];

export const WTS_U20_HIGHSCHOOL_OPTIONS = [
    { value: '高校生じゃない', label: '高校生じゃない' },
    { value: '高校生', label: '高校生' },
];

export const WTS_U20_PARENTAL_CONSENT_OPTIONS = [
    { value: 'OK', label: 'OK' },
    { value: 'NG', label: 'NG' },
    { value: 'きいてない', label: 'きいてない' },
];