export type FormData = {
  // --- Shared Info ---
  apName: string;
  customerId: string;
  greeting: string;
  contractorName: string;
  contractorNameKana: string;
  gender: string;
  dob: string;
  phone: string;
  email: string;
  postalCode: string;
  address: string;
  buildingInfo: string;
  moveInDate: string;
  mailingOption: string;
  currentPostalCode: string;
  currentAddress: string;
  existingLineStatus: string;
  existingLineCompany: string;
  mobileCarrier: string;
  homeDiscount: string;
  remarks: string;
  paymentMethod: string;
  recordId: string;

  // --- Internet Specific ---
  product: string;
  housingType: string;
  rackType: string;
  serviceFee: string;
  campaign: string;
  preActivationRental: string;
  wifiRouter: string;

  // --- Chintai Specific ---
  bankName: string;
  crossPathRouter: string;

  // --- Owner Info ---
  managementCompany: string;
  managementNumber: string;
  managementContact: string;
  contactPerson: string;
  noDrilling: boolean;
  drawingSubmission: boolean;
  drawingSubmissionContact: string;
  buildingSurveyRequest: string;

  // --- Electricity Specific ---
  elecProvider: string;
  elecRecordIdPrefix: string;
  isAllElectric: string;
  isVacancy: string;
  hasContractConfirmation: string;
  isGasSet: string;
  elecPostConfirmationDateTime: string;
  elecImportCompanyName: string;
  isNewConstruction: string;
  
  // --- Gas Specific ---
  gasProvider: string;
  gasRecordIdPrefix: string;
  gasIsVacancy: string;
  gasHasContractConfirmation: string;
  gasArea: string;
  gasWitness: string;
  gasPreContact: string;
  gasOpeningTimeSlot: string;
  gasOpeningDate: string;

  // --- Common for Elec/Gas ---
  primaryProductStatus: string;
  attachedOption: string;
  elecConfirmationTime: string;
  postConfirmationTime: string;
  contactPersonName: string;
  contactPersonNameKana: string;
  isSakaiRoute: boolean;

  // --- WTS Specific ---
  wtsCustomerType: string; 
  wtsShippingDestination: string;
  wtsServerColor: string;
  wtsFiveYearPlan: string;
  wtsFreeWater: string;
  wtsCreditCard: string;
  wtsCarrier: string;
  wtsMailingAddress: string;
  wtsWaterPurifier: string;
  wtsMultipleUnits: string;
  // U-20 only
  wtsU20HighSchool: string;
  wtsU20ParentalConsent: string;
  // Corporate only
  wtsCorporateInvoice: string;
};