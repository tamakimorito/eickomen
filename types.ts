
export type HousingType = 'マンション' | 'ファミリー' | '10Gマンション' | '10Gファミリー' | 'ターミナル6' | '10G' | 'マンション10G' | '';

export type RadioOption = { value: string; label: string; };
export type BreakOption = { type: 'break'; };
export type RadioGroupOption = RadioOption | BreakOption;

export interface FormData {
  // Basic Info
  product: string;
  housingType: HousingType;
  apName: string;
  customerId: string;
  greeting: string;
  
  // Contractor Info
  contractorName: string;
  contractorNameKana: string;
  gender: string;
  dob: string;
  phone: string;
  email: string;
  
  // Rack Info
  rackType: string;

  // Installation Address
  postalCode: string;
  address: string;
  buildingInfo: string;
  moveInDate: string;
  
  // Mailing Address
  mailingOption: string;
  currentPostalCode: string;
  currentAddress: string;

  // Other details
  serviceFee: string;
  campaign: string;
  preActivationRental: string;
  existingLineStatus: string;
  existingLineCompany: string;
  mobileCarrier: string;
  homeDiscount: string;
  wifiRouter: string;
  remarks: string;
  paymentMethod: string;
  bankName: string;
  crossPathRouter: string;


  // Owner Info
  managementCompany: string;
  managementNumber: string;
  managementContact: string;
  contactPerson: string;
  noDrilling: boolean;
  drawingSubmission: boolean;
  drawingSubmissionContact: string;
  buildingSurveyRequest: string;
}
