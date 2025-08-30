/**
 * Icon enum for playground entities and UI components
 */
export enum IconType {
  // Navigation & Layout
  HOME = 'home',
  SETTINGS = 'settings',
  MENU = 'menu',
  SEARCH = 'search',
  FILTER = 'filter',

  // Playground & Development
  PLAY = 'play',
  PAUSE = 'pause',
  STOP = 'stop',
  CODE = 'code',
  TERMINAL = 'terminal',
  DEBUG = 'debug',
  ZAP = 'zap',

  // Blockchain & EVM
  BLOCKS = 'blocks',
  CPU = 'cpu',
  DATABASE = 'database',
  STORAGE = 'storage',
  MEMORY = 'memory',
  LAYERS = 'layers',
  NETWORK = 'network',

  // Data & Analysis
  BAR_CHART = 'bar_chart',
  LINE_CHART = 'line_chart',
  PIE_CHART = 'pie_chart',
  TRENDING = 'trending',
  ACTIVITY = 'activity',
  EYE = 'eye',

  // Files & Documents
  FILE = 'file',
  FILE_TEXT = 'file_text',
  FOLDER = 'folder',
  FOLDER_OPEN = 'folder_open',
  ARCHIVE = 'archive',

  // Actions & Controls
  PLUS = 'plus',
  MINUS = 'minus',
  EDIT = 'edit',
  DELETE = 'delete',
  COPY = 'copy',
  DOWNLOAD = 'download',
  UPLOAD = 'upload',
  SAVE = 'save',

  // Status & Indicators
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  CLOCK = 'clock',

  // Navigation & Movement
  ARROW_RIGHT = 'arrow_right',
  ARROW_LEFT = 'arrow_left',
  ARROW_UP = 'arrow_up',
  ARROW_DOWN = 'arrow_down',
  CHEVRON_RIGHT = 'chevron_right',
  CHEVRON_LEFT = 'chevron_left',

  // Functions & Smart Contracts
  FUNCTION = 'function',
  BRACES = 'braces',
  HASH = 'hash',
  KEY = 'key',
  LOCK = 'lock',

  // Tools & Utilities
  WRENCH = 'wrench',
  COG = 'cog',
  TOOL = 'tool',
  COMPASS = 'compass',
  TARGET = 'target',

  // Communication & Social
  MESSAGE = 'message',
  BELL = 'bell',
  USERS = 'users',
  USER = 'user',
}

/**
 * Get all available icon types as an array
 */
export const getAllIconTypes = (): IconType[] => {
  return Object.values(IconType);
};

/**
 * Check if a string is a valid icon type
 */
export const isValidIconType = (icon: string): icon is IconType => {
  return Object.values(IconType).includes(icon as IconType);
};
