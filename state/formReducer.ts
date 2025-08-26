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
      
      // --- Greeting logic based on recordId and product ---
      if (['recordId', 'customerId', 'product', 'isSakaiRoute'].includes(name)) {
          const { recordId, product, isSakaiRoute } = newState;
          if (!isSakaiRoute && recordId) {
              if (recordId.startsWith('ID:')) {
                  const isSbHikari = product === 'SoftBank光1G' || product === 'SoftBank光10G';
                  newState.greeting = isSbHikari ? '' : 'すまえる';
              } else if (recordId.startsWith('L')) {
                  newState.greeting = 'ばっちり賃貸入居サポートセンター';
              } else if (recordId.startsWith('SR') || recordId.startsWith('STJP:')) {
                   // Only clear if it was an auto-set greeting
                  const autoGreetings = ['すまえる', 'ばっちり賃貸入居サポートセンター', 'レプリス株式会社'];
                  if (autoGreetings.includes(state.greeting)) {
                      newState.greeting = '';
                  }
              } else if (/^S\d/.test(recordId)) { // Check for 'S' followed by a digit
                  newState.greeting = 'レプリス株式会社';
              }
          }
      }


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
          newState.remarks = '5000円CB';
      } else if (oldIsPlatinumSakai && !newIsPlatinumSakai) {
          // Condition just became false, only clear remarks if it's the default text
          if (state.remarks === '5000円CB') {
              newState.remarks = '';
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
      
      // --- Electricity/Gas Contract Confirmation Logic ---
      if (name === 'elecProvider' || name === 'recordId' || name === 'isSakaiRoute' || name === 'isAllElectric') {
        const newElecProvider = name === 'elecProvider' ? value : newState.elecProvider;
        const newElecPrefix = newState.elecRecordIdPrefix;
        const newIsAllElectric = name === 'isAllElectric' ? value : newState.isAllElectric;

        if (newElecProvider === 'プラチナでんき（ジャパン）') {
            if (newElecPrefix === 'SR') {
                newState.hasContractConfirmation = 'あり';
            } else { // Not SR route
                if (newIsAllElectric === 'あり') {
                    // When user switches to all-electric, default to 'あり'.
                    // They can then change it. This won't override their subsequent choices.
                    if (name === 'isAllElectric' && value === 'あり') {
                        newState.hasContractConfirmation = 'あり';
                    }
                } else {
                    // If not all-electric, no confirmation choice is available.
                    newState.hasContractConfirmation = ''; 
                }
            }
        } else if (newElecProvider === 'すまいのでんき（ストエネ）' && newElecPrefix === 'code:') {
            newState.hasContractConfirmation = 'なし';
        } else if (newElecProvider === 'キューエネスでんき') {
            newState.hasContractConfirmation = (newElecPrefix === 'ID:') ? 'なし' : 'あり';
        }
      }


       // Clear attachedOption if hasContractConfirmation becomes 'あり'
      if (newState.hasContractConfirmation === 'あり' && state.hasContractConfirmation !== 'あり') {
        newState.attachedOption = '';
      }

      if (name === 'gasProvider') {
          if (value === '東急ガス') {
              newState.gasHasContractConfirmation = 'あり';
          }
      }
      
      // --- Mailing Option Logic ---
      if (name === 'elecProvider') {
        const newProvider = value;
        const elecMailingConfig = {
            'すまいのでんき（ストエネ）': '新居',
            'プラチナでんき（ジャパン）': '新居',
            'ニチガス電気セット': '新居',
            '大阪ガス電気セット': '新居',
            'キューエネスでんき': '新居',
            '東京ガス電気セット': '現住所', 
            '東邦ガスセット': '現住所', 
            'ループでんき': '新居', 
            'HTBエナジー': '新居', 
            'ユーパワー UPOWER': '新居', 
            'はぴe': '新居'
        };
        if (elecMailingConfig.hasOwnProperty(newProvider)) {
            newState.mailingOption = elecMailingConfig[newProvider];
        } else if (value === '') { 
            newState.mailingOption = INITIAL_FORM_DATA.mailingOption;
        }
      }
      
      if (name === 'gasProvider') {
        const newProvider = value;
        const gasMailingConfig = {
            'すまいのでんき（ストエネ）': '新居',
            'ニチガス単品': '新居',
            '大阪ガス単品': '新居',
            '東邦ガス単品': '現住所', 
            '東急ガス': '現住所'
        };
        if (gasMailingConfig.hasOwnProperty(newProvider)) {
            newState.mailingOption = gasMailingConfig[newProvider];
        } else if (value === '') {
            newState.mailingOption = INITIAL_FORM_DATA.mailingOption;
        }
      }
      
      // --- Internet Form Dynamic Logic ---
      if (name === 'product') {
          const defaultInternetFields = {
              housingType: '', rackType: '', campaign: '', serviceFee: '', homeDiscount: '', crossPathRouter: '',
              gmoConstructionSplit: false, gmoCompensation: '', gmoRouter: '', gmoIsDocomoOwnerSame: true,
              gmoDocomoOwnerName: '', gmoDocomoOwnerPhone: '', gmoCallback1: '', gmoCallback2: '',
              gmoCallback3: '', gmoNoPairIdType: '',
              auPlanProvider: '', auWifiRouter: '', auOptions: '話してないです', auSupport: '',
              auCampaign: '2万円CB', auContactType: '', auPreCheckTime: '',
          };
          newState = { ...newState, ...defaultInternetFields };
      }

      const newHousingType = name === 'housingType' ? value : newState.housingType;
      const newProduct = name === 'product' ? value : newState.product;
      const currentRackOptions = getRackOptions(newProduct, newHousingType);

      if (name === 'housingType' && !currentRackOptions.some(opt => opt.value === newState.rackType)) {
          newState.rackType = '';
      }

      if (name === 'product' || name === 'housingType') {
          if (newProduct.startsWith('SoftBank') || newProduct === 'SB Air') {
              if (newProduct === 'SoftBank光10G') {
                  newState.serviceFee = '3カ月0円→6930円';
              } else if (newProduct === 'SB Air') {
                  newState.serviceFee = '3カ月1485円、2年4950円、3年以降5368円';
              } else { // 1G
                  if (newHousingType === 'マンション') newState.serviceFee = '4180';
                  else if (newHousingType === 'ファミリー') newState.serviceFee = '5720';
                  else newState.serviceFee = '';
              }
          } else if (newProduct.startsWith('賃貸ねっと')) {
              if (newProduct === '賃貸ねっと') {
                  if (newHousingType === 'マンション') newState.serviceFee = '3960';
                  else if (newHousingType === 'ファミリー') newState.serviceFee = '5060';
                  else if (newHousingType === '10G') {
                    newState.serviceFee = '6160';
                    newState.crossPathRouter = '10Gレンタル';
                  } else {
                    newState.serviceFee = '';
                    newState.crossPathRouter = '';
                  }
                  if (newHousingType !== '10G' && newState.crossPathRouter === '10Gレンタル') {
                      newState.crossPathRouter = '';
                  }
              } else if (newProduct === '賃貸ねっと【無料施策】') {
                  if (newHousingType === 'マンション') {
                      newState.serviceFee = '初月無料→3960';
                      newState.crossPathRouter = '無料施策プレゼント';
                      if (newState.rackType === '光配線クロス') newState.rackType = '';
                  } else if (newHousingType === 'マンション10G') {
                      newState.serviceFee = '初月無料→6160';
                      newState.crossPathRouter = '10Gレンタル';
                      newState.rackType = '光配線クロス';
                  } else {
                    newState.serviceFee = '';
                    newState.crossPathRouter = '';
                    newState.rackType = '';
                  }
              }
          }
      }
      
      return newState;
    }
    
    case 'UPDATE_DERIVED_FIELDS_FROM_ID': {
        // This action is deprecated and its logic is merged into 'UPDATE_FIELD' for better consistency.
        // Kept to avoid breaking older parts of the code if they still call it.
        return state;
    }

    case 'SET_FORM_DATA':
        return { ...state, ...action.payload };
    
    case 'RESET_FORM': {
      const { keepApName, apName } = action.payload;
      return {
        ...INITIAL_FORM_DATA,
        apName: keepApName ? apName : '',
      };
    }

    default:
      return state;
  }
};