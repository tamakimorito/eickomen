export const USE_SEASONAL_THEME = true;

export const THEMES = {
  default: {
    headerBg: 'bg-blue-700',
    headerBadgeBg: 'bg-yellow-400',
    headerIcon: 'text-blue-800',
    headerVersionText: 'text-blue-200',
    resetButton: 'bg-blue-600 hover:bg-blue-500 focus:ring-white',
    helpButton: 'hover:bg-blue-600 focus:ring-white',
    tabActive: 'text-blue-700 border-b-4 border-blue-700',
    tabInactive: 'text-gray-500 hover:text-blue-600 border-b-4 border-transparent',
  },
  seasonal: {
    headerBg: 'bg-gradient-to-r from-green-900 via-green-800 to-red-700',
    headerBadgeBg: 'bg-red-500',
    headerIcon: 'text-white',
    headerVersionText: 'text-green-100',
    resetButton: 'bg-red-600 hover:bg-red-500 focus:ring-red-200',
    helpButton: 'hover:bg-green-700 focus:ring-green-200',
    tabActive: 'text-green-700 border-b-4 border-green-700',
    tabInactive: 'text-gray-500 hover:text-red-600 border-b-4 border-transparent',
  },
};

export const CURRENT_THEME = USE_SEASONAL_THEME ? THEMES.seasonal : THEMES.default;
