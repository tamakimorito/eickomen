// FIX: Add WTS_COLORS to import to resolve missing member error.
import { INITIAL_FORM_DATA, WTS_COLORS } from '../constants.ts';
import type { FormData, FormAction } from '../types.ts';
import { ELEC_ID_PREFIX_OPTIONS, GAS_ID_PREFIX_OPTIONS, RACK_OPTIONS_CHINTAI_FREE_10G, RACK_OPTIONS_CHINTAI_FREE_MANSION, RACK_OPTIONS_1G, RACK_OPTIONS_10G } from '../constants.ts';

const getRackOptions = (product, housingType) => {
    const isChintaiFree = product === '賃貸ねっと【無料施策】';
    if (isChintaiFree) {
        if (housingType === 'マンション10G') return RACK_OPTIONS_CHINTAI_FREE_10G;
        if (housingType === 'マンション') return RACK_OPTIONS_CHINTAI_FREE_MANSION;
        return [];
    }
    const isChintai = product === '賃貸ねっと';
    const is10G = product === 'SoftBank光10G';
    const is1G = !is10G && !isChintai && !isChintaiFree && product !== 'SB Air';

    let baseOptions;
    if (isChintai) baseOptions = housingType === '10G' ? RACK_OPTIONS_10G : RACK_OPTIONS_1G;
    else if (is10G) baseOptions = RACK_OPTIONS_10G;
    else if (is1G) baseOptions = RACK_OPTIONS_1G;
    else return [];
    
    const isMansionType = housingType.includes('マンション') || housingType === '10G';
    const isFamilyType = housingType.includes('ファミリー');
    
    if (isMansionType && !isChintai) return baseOptions.filter(option => option.value !== '無し');
    if (isFamilyType) return baseOptions.find(option => option.value === '無し') ? [baseOptions.find(option => option.value === '無し')] : [];

    return baseOptions;
}

export const formReducer = (state: FormData, action: FormAction): FormData => {
  switch (action.type) {
    case 'UPDATE_FIELD': {
      const { name, value, type } = action.payload;
      const updates: Partial<FormData> = {};

      updates[name] = value;

      // Create a temporary new state to calculate dependent fields
      let newState = { ...state, ...updates };

      // --- Logic for dependent field updates ---
      
      // Sync recordId/customerId and update prefix
      if (name === 'recordId' || name === 'customerId') {
          const idValue = value;
          // Sync both fields
          newState.recordId = idValue;
          newState.customerId = idValue;
          
          if (!newState.isSakaiRoute) {
              // Auto-determine prefix from ID for Elec/Gas tabs
              let prefix = 'それ以外';
              if (idValue.startsWith('STJP:')) prefix = 'STJP:';
              else if (idValue.startsWith('SR')) prefix = 'SR';
              else if (idValue.startsWith('code:')) prefix = 'code:';
              else if (idValue.startsWith('ID:')) prefix = 'ID:';
              else if (idValue.startsWith('No.')) prefix = 'No.';
              else if (/^S\d/.test(idValue)) prefix = 'S'; // Use regex to check for 'S' followed by a digit.
              
              if (ELEC_ID_PREFIX_OPTIONS.some(opt => opt.value === prefix)) {
                  newState.elecRecordIdPrefix = prefix;
              }
              if (GAS_ID_PREFIX_OPTIONS.some(opt => opt.value === prefix)) {
                  newState.gasRecordIdPrefix = prefix;
              }
          }
          if (idValue.startsWith('code:')) {
            newState.isVacancy = 'あり';
          }
      }
      
      // Handle 'apName' trimming
      if (name === 'apName') {
        newState.apName = value.replace(/\s/g, '');
      }

      // Logic for 'isSakaiRoute' checkbox
      if (name === 'isSakaiRoute' && type === 'checkbox') {
          newState.recordId = '';
          newState.customerId = ''; 
          if (value) { // value is the boolean 'checked'
              newState.greeting = 'ライフイン24';
              newState.elecRecordIdPrefix = 'サカイ';
              newState.gasRecordIdPrefix = 'サカイ';
              newState.elecImportCompanyName = 'サカイ販路';
          } else {
              newState.greeting = '';
              newState.elecRecordIdPrefix = 'それ以外';
              newState.gasRecordIdPrefix = 'それ以外';
              newState.elecImportCompanyName = '';
          }
      }

      // --- Sakai Route + Platinum Denki Remarks Logic ---
      const oldIsPlatinumSakai = state.isSakaiRoute && state.elecProvider === 'プラチナでんき（ジャパン）';
      const newIsPlatinumSakai = newState.isSakaiRoute && newState.elecProvider === 'プラチナでんき（ジャパン）';

      if (!oldIsPlatinumSakai && newIsPlatinumSakai) {
          // Condition just became true, set remarks
          newState.elecRemarks = '5000円CB';
      } else if (oldIsPlatinumSakai && !newIsPlatinumSakai) {
          // Condition just became false, only clear remarks if it's the default text
          if (state.elecRemarks === '5000円CB') {
              newState.elecRemarks = '';
          }
      }
      
      // --- CB Remarks Logic for ID:/CC: records ---
      if (name === 'elecProvider' || name === 'recordId') {
        const cbEligibleProviders = ['すまいのでんき（ストエネ）', 'プラチナでんき（ジャパン）', 'キューエネスでんき'];
        const isEligibleProvider = cbEligibleProviders.includes(newState.elecProvider);
        const recordId = newState.recordId || '';
        const isEligibleId = recordId.startsWith('ID:') || /^CC\d+/.test(recordId);

        if (isEligibleProvider && isEligibleId) {
            if (newState.elecRemarks === '') {
                newState.elecRemarks = '5,000円CB';
            }
        }
      }


      // --- WTS Specific Logic ---
      if (name === 'wtsCustomerType') {
          newState.wtsFiveYearPlan = value === 'U-20' ? '3年' : '5年';
      }

      if (name === 'wtsServerType') {
          const newServer = value;
          const availableColors = WTS_COLORS[newServer] || [];
          if (!availableColors.some(color => color.value === state.wtsServerColor)) {
              newState.wtsServerColor = '';
          }
      }

      // --- GMO Docomo Specific Logic ---
      if (name === 'gmoIsDocomoOwnerSame' && type === 'checkbox' && value) {
        newState.gmoDocomoOwnerName = '';
        newState.gmoDocomoOwnerPhone = '';
      }
      // FIX: Ensure all code paths in the reducer function return a value. The 'UPDATE_FIELD' case was missing its return statement.
      return newState;
    }

    case 'SET_FORM_DATA':
      return { ...state, ...action.payload };

    case 'RESET_FORM': {
      const { keepApName, apName } = action.payload;
      if (keepApName) {
        return { ...INITIAL_FORM_DATA, apName: apName };
      }
      return INITIAL_FORM_DATA;
    }

    case 'UPDATE_DERIVED_FIELDS_FROM_ID':
      // This logic is now handled inside 'UPDATE_FIELD', but we keep the case for safety.
      return state;

    default:
      return state;
  }
};
