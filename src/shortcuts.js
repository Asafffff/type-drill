const FUNCTION_KEYS = Array.from({ length: 12 }, (_, index) => `F${index + 1}`);
const NUMBER_KEYS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const SYMBOL_KEYS = [
  { id: 'backtick', label: 'Backtick', key: '`', parts: ['`'] },
  { id: 'minus', label: 'Minus', key: '-', parts: ['-'] },
  { id: 'equals', label: 'Equals', key: '=', parts: ['='] },
  { id: 'left-bracket', label: 'Left bracket', key: '[', parts: ['['] },
  { id: 'right-bracket', label: 'Right bracket', key: ']', parts: [']'] },
  { id: 'backslash', label: 'Backslash', key: '\\', parts: ['\\'] },
  { id: 'semicolon', label: 'Semicolon', key: ';', parts: [';'] },
  { id: 'quote', label: 'Quote', key: "'", parts: ["'"] },
  { id: 'comma', label: 'Comma', key: ',', parts: [','] },
  { id: 'period', label: 'Period', key: '.', parts: ['.'] },
  { id: 'slash', label: 'Slash', key: '/', parts: ['/'] },
  { id: 'exclamation', label: 'Exclamation mark', key: '!', shift: true, parts: ['Shift', '1'] },
  { id: 'at', label: 'At sign', key: '@', shift: true, parts: ['Shift', '2'] },
  { id: 'hash', label: 'Hash sign', key: '#', shift: true, parts: ['Shift', '3'] },
  { id: 'dollar', label: 'Dollar sign', key: '$', shift: true, parts: ['Shift', '4'] },
  { id: 'percent', label: 'Percent sign', key: '%', shift: true, parts: ['Shift', '5'] },
  { id: 'caret', label: 'Caret', key: '^', shift: true, parts: ['Shift', '6'] },
  { id: 'ampersand', label: 'Ampersand', key: '&', shift: true, parts: ['Shift', '7'] },
  { id: 'asterisk', label: 'Asterisk', key: '*', shift: true, parts: ['Shift', '8'] },
  { id: 'left-paren', label: 'Left parenthesis', key: '(', shift: true, parts: ['Shift', '9'] },
  { id: 'right-paren', label: 'Right parenthesis', key: ')', shift: true, parts: ['Shift', '0'] },
  { id: 'underscore', label: 'Underscore', key: '_', shift: true, parts: ['Shift', '-'] },
  { id: 'plus', label: 'Plus sign', key: '+', shift: true, parts: ['Shift', '='] },
  { id: 'colon', label: 'Colon', key: ':', shift: true, parts: ['Shift', ';'] },
  { id: 'double-quote', label: 'Double quote', key: '"', shift: true, parts: ['Shift', "'"] },
  { id: 'less-than', label: 'Less than', key: '<', shift: true, parts: ['Shift', ','] },
  { id: 'greater-than', label: 'Greater than', key: '>', shift: true, parts: ['Shift', '.'] },
  { id: 'question', label: 'Question mark', key: '?', shift: true, parts: ['Shift', '/'] }
];

const WINDOWS_EDITING = [
  { id: 'win-copy', label: 'Copy', category: 'editing', key: 'c', ctrl: true, parts: ['Ctrl', 'C'], capturable: true },
  { id: 'win-paste', label: 'Paste', category: 'editing', key: 'v', ctrl: true, parts: ['Ctrl', 'V'], capturable: true },
  { id: 'win-cut', label: 'Cut', category: 'editing', key: 'x', ctrl: true, parts: ['Ctrl', 'X'], capturable: true },
  { id: 'win-undo', label: 'Undo', category: 'editing', key: 'z', ctrl: true, parts: ['Ctrl', 'Z'], capturable: true },
  { id: 'win-redo', label: 'Redo', category: 'editing', key: 'y', ctrl: true, parts: ['Ctrl', 'Y'], capturable: true },
  { id: 'win-redo-alt', label: 'Redo alternate', category: 'editing', key: 'z', ctrl: true, shift: true, parts: ['Ctrl', 'Shift', 'Z'], capturable: true },
  { id: 'win-select-all', label: 'Select all', category: 'editing', key: 'a', ctrl: true, parts: ['Ctrl', 'A'], capturable: true },
  { id: 'win-save', label: 'Save', category: 'editing', key: 's', ctrl: true, parts: ['Ctrl', 'S'], capturable: true },
  { id: 'win-find', label: 'Find', category: 'editing', key: 'f', ctrl: true, parts: ['Ctrl', 'F'], capturable: true }
];

const WINDOWS_NAVIGATION = [
  { id: 'win-word-left', label: 'Move word left', category: 'navigation', key: 'ArrowLeft', ctrl: true, parts: ['Ctrl', 'Left'], capturable: true },
  { id: 'win-word-right', label: 'Move word right', category: 'navigation', key: 'ArrowRight', ctrl: true, parts: ['Ctrl', 'Right'], capturable: true },
  { id: 'win-line-start', label: 'Line start', category: 'navigation', key: 'Home', parts: ['Home'], capturable: true },
  { id: 'win-line-end', label: 'Line end', category: 'navigation', key: 'End', parts: ['End'], capturable: true },
  { id: 'win-page-up', label: 'Page up', category: 'navigation', key: 'PageUp', parts: ['Page Up'], capturable: true },
  { id: 'win-page-down', label: 'Page down', category: 'navigation', key: 'PageDown', parts: ['Page Down'], capturable: true },
  { id: 'win-tab', label: 'Next field', category: 'navigation', key: 'Tab', parts: ['Tab'], capturable: true },
  { id: 'win-shift-tab', label: 'Previous field', category: 'navigation', key: 'Tab', shift: true, parts: ['Shift', 'Tab'], capturable: true }
];

const CUSTOM_NUMBERS = [
  { key: '0', parts: ['L1', '/'] },
  { key: '1', parts: ['L1', 'M'] },
  { key: '2', parts: ['L1', ','] },
  { key: '3', parts: ['L1', '.'] },
  { key: '4', parts: ['L1', 'J'] },
  { key: '5', parts: ['L1', 'K'] },
  { key: '6', parts: ['L1', 'L'] },
  { key: '7', parts: ['L1', 'U'] },
  { key: '8', parts: ['L1', 'I'] },
  { key: '9', parts: ['L1', 'O'] }
];

const CUSTOM_SYMBOLS = [
  { id: 'grave', label: 'Backtick', key: '`', parts: ['L1', 'A'] },
  { id: 'minus', label: 'Minus', key: '-', parts: ['L1', 'P'] },
  { id: 'equals', label: 'Equals', key: '=', parts: ['L1', 'S'] },
  { id: 'left-bracket', label: 'Left bracket', key: '[', parts: ['L1', 'B'] },
  { id: 'right-bracket', label: 'Right bracket', key: ']', parts: ['L1', 'N'] },
  { id: 'backslash', label: 'Backslash', key: '\\', parts: ['L1', 'Z'] },
  { id: 'semicolon', label: 'Semicolon', key: ';', parts: ['L1', 'V'] },
  { id: 'quote', label: 'Quote', key: "'", parts: ["'"] },
  { id: 'comma', label: 'Comma', key: ',', parts: [','] },
  { id: 'period', label: 'Period', key: '.', parts: ['.'] },
  { id: 'slash', label: 'Slash', key: '/', parts: ['/'] },
  { id: 'exclamation', label: 'Exclamation mark', key: '!', shift: true, parts: ['L1', 'Q'] },
  { id: 'at', label: 'At sign', key: '@', shift: true, parts: ['L1', 'W'] },
  { id: 'hash', label: 'Hash sign', key: '#', shift: true, parts: ['L1', 'E'] },
  { id: 'dollar', label: 'Dollar sign', key: '$', shift: true, parts: ['L1', 'R'] },
  { id: 'percent', label: 'Percent sign', key: '%', shift: true, parts: ['L1', 'T'] },
  { id: 'caret', label: 'Caret', key: '^', shift: true, parts: ['L1', 'Y'] },
  { id: 'ampersand', label: 'Ampersand', key: '&', shift: true, parts: ['L1', 'X'] },
  { id: 'asterisk', label: 'Asterisk', key: '*', shift: true, parts: ['L1', 'C'] },
  { id: 'left-paren', label: 'Left parenthesis', key: '(', shift: true, parts: ['L1', 'G'] },
  { id: 'right-paren', label: 'Right parenthesis', key: ')', shift: true, parts: ['L1', 'H'] },
  { id: 'underscore', label: 'Underscore', key: '_', shift: true, parts: ['L1', 'D'] },
  { id: 'plus', label: 'Plus sign', key: '+', shift: true, parts: ['Shift', 'L1', 'S'] },
  { id: 'left-brace', label: 'Left brace', key: '{', shift: true, parts: ['Shift', 'L1', 'B'] },
  { id: 'right-brace', label: 'Right brace', key: '}', shift: true, parts: ['Shift', 'L1', 'N'] },
  { id: 'pipe', label: 'Pipe', key: '|', shift: true, parts: ['Shift', 'L1', 'Z'] },
  { id: 'colon', label: 'Colon', key: ':', shift: true, parts: ['L1', 'F'] },
  { id: 'double-quote', label: 'Double quote', key: '"', shift: true, parts: ['Shift', "'"] },
  { id: 'less-than', label: 'Less than', key: '<', shift: true, parts: ['Shift', ','] },
  { id: 'greater-than', label: 'Greater than', key: '>', shift: true, parts: ['Shift', '.'] },
  { id: 'question', label: 'Question mark', key: '?', shift: true, parts: ['Shift', '/'] },
  { id: 'tilde', label: 'Tilde', key: '~', shift: true, parts: ['Shift', 'L1', 'A'] }
];

const CUSTOM_NAVIGATION = [
  { id: 'custom-insert', label: 'Insert', category: 'navigation', key: 'Insert', parts: ['L2', 'Y'], capturable: true },
  { id: 'custom-home', label: 'Home', category: 'navigation', key: 'Home', parts: ['L2', 'U'], capturable: true },
  { id: 'custom-end', label: 'End', category: 'navigation', key: 'End', parts: ['L2', 'I'], capturable: true },
  { id: 'custom-page-down', label: 'Page down', category: 'navigation', key: 'PageDown', parts: ['L2', 'O'], capturable: true },
  { id: 'custom-page-up', label: 'Page up', category: 'navigation', key: 'PageUp', parts: ['L2', 'P'], capturable: true },
  { id: 'custom-left', label: 'Arrow left', category: 'navigation', key: 'ArrowLeft', parts: ['L2', 'H'], capturable: true },
  { id: 'custom-down', label: 'Arrow down', category: 'navigation', key: 'ArrowDown', parts: ['L2', 'J'], capturable: true },
  { id: 'custom-up', label: 'Arrow up', category: 'navigation', key: 'ArrowUp', parts: ['L2', 'K'], capturable: true },
  { id: 'custom-right', label: 'Arrow right', category: 'navigation', key: 'ArrowRight', parts: ['L2', 'L'], capturable: true },
  { id: 'custom-tab', label: 'Next field', category: 'navigation', key: 'Tab', parts: ['Tab'], capturable: true },
  { id: 'custom-shift-tab', label: 'Previous field', category: 'navigation', key: 'Tab', shift: true, parts: ['Shift', 'Tab'], capturable: true }
];

const CUSTOM_FUNCTIONS = [
  { key: 'F1', parts: ['L3', 'M'] },
  { key: 'F2', parts: ['L3', ','] },
  { key: 'F3', parts: ['L3', '.'] },
  { key: 'F4', parts: ['L3', 'J'] },
  { key: 'F5', parts: ['L3', 'K'] },
  { key: 'F6', parts: ['L3', 'L'] },
  { key: 'F7', parts: ['L3', 'U'] },
  { key: 'F8', parts: ['L3', 'I'] },
  { key: 'F9', parts: ['L3', 'O'] },
  { key: 'F10', parts: ['L3', 'P'] },
  { key: 'F11', parts: ['L3', "'"] },
  { key: 'F12', parts: ['L3', '/'] }
];

const MAC_EDITING = [
  { id: 'mac-copy', label: 'Copy', category: 'editing', key: 'c', meta: true, parts: ['Cmd', 'C'], capturable: true },
  { id: 'mac-paste', label: 'Paste', category: 'editing', key: 'v', meta: true, parts: ['Cmd', 'V'], capturable: true },
  { id: 'mac-cut', label: 'Cut', category: 'editing', key: 'x', meta: true, parts: ['Cmd', 'X'], capturable: true },
  { id: 'mac-undo', label: 'Undo', category: 'editing', key: 'z', meta: true, parts: ['Cmd', 'Z'], capturable: true },
  { id: 'mac-redo', label: 'Redo', category: 'editing', key: 'z', meta: true, shift: true, parts: ['Cmd', 'Shift', 'Z'], capturable: true },
  { id: 'mac-select-all', label: 'Select all', category: 'editing', key: 'a', meta: true, parts: ['Cmd', 'A'], capturable: true },
  { id: 'mac-save', label: 'Save', category: 'editing', key: 's', meta: true, parts: ['Cmd', 'S'], capturable: true },
  { id: 'mac-find', label: 'Find', category: 'editing', key: 'f', meta: true, parts: ['Cmd', 'F'], capturable: true },
  { id: 'mac-delete-word', label: 'Delete previous word', category: 'editing', key: 'Backspace', alt: true, parts: ['Option', 'Delete'], capturable: true }
];

const MAC_NAVIGATION = [
  { id: 'mac-word-left', label: 'Move word left', category: 'navigation', key: 'ArrowLeft', alt: true, parts: ['Option', 'Left'], capturable: true },
  { id: 'mac-word-right', label: 'Move word right', category: 'navigation', key: 'ArrowRight', alt: true, parts: ['Option', 'Right'], capturable: true },
  { id: 'mac-line-start', label: 'Line start', category: 'navigation', key: 'ArrowLeft', meta: true, parts: ['Cmd', 'Left'], capturable: true },
  { id: 'mac-line-end', label: 'Line end', category: 'navigation', key: 'ArrowRight', meta: true, parts: ['Cmd', 'Right'], capturable: true },
  { id: 'mac-document-start', label: 'Document start', category: 'navigation', key: 'ArrowUp', meta: true, parts: ['Cmd', 'Up'], capturable: true },
  { id: 'mac-document-end', label: 'Document end', category: 'navigation', key: 'ArrowDown', meta: true, parts: ['Cmd', 'Down'], capturable: true },
  { id: 'mac-tab-forward', label: 'Next field', category: 'navigation', key: 'Tab', parts: ['Tab'], capturable: true },
  { id: 'mac-tab-back', label: 'Previous field', category: 'navigation', key: 'Tab', shift: true, parts: ['Shift', 'Tab'], capturable: true }
];

const functionShortcuts = (prefix, labelPrefix = '') => FUNCTION_KEYS.map((key) => ({
  id: `${prefix}-${key.toLowerCase()}`,
  label: `${labelPrefix}${key}`,
  category: 'function',
  key,
  parts: [key],
  capturable: !['F11', 'F12'].includes(key)
}));

const numberShortcuts = (prefix) => NUMBER_KEYS.map((key) => ({
  id: `${prefix}-number-${key}`,
  label: `Number ${key}`,
  category: 'numbers',
  key,
  parts: [key],
  capturable: true
}));

const symbolShortcuts = (prefix) => SYMBOL_KEYS.map((symbol) => ({
  id: `${prefix}-symbol-${symbol.id}`,
  label: symbol.label,
  category: 'symbols',
  key: symbol.key,
  shift: Boolean(symbol.shift),
  parts: symbol.parts,
  capturable: true
}));

const customNumberShortcuts = () => CUSTOM_NUMBERS.map((number) => ({
  id: `custom-number-${number.key}`,
  label: `Number ${number.key}`,
  category: 'numbers',
  key: number.key,
  parts: number.parts,
  capturable: true
}));

const customSymbolShortcuts = () => CUSTOM_SYMBOLS.map((symbol) => ({
  id: `custom-symbol-${symbol.id}`,
  label: symbol.label,
  category: 'symbols',
  key: symbol.key,
  shift: Boolean(symbol.shift),
  parts: symbol.parts,
  capturable: true
}));

const customFunctionShortcuts = () => CUSTOM_FUNCTIONS.map((fn) => ({
  id: `custom-${fn.key.toLowerCase()}`,
  label: `Function ${fn.key}`,
  category: 'function',
  key: fn.key,
  parts: fn.parts,
  capturable: !['F11', 'F12'].includes(fn.key)
}));

export const SHORTCUT_BANKS = {
  custom: [
    ...WINDOWS_EDITING,
    ...CUSTOM_NAVIGATION,
    ...customFunctionShortcuts(),
    ...customNumberShortcuts(),
    ...customSymbolShortcuts()
  ],
  windows: [
    ...WINDOWS_EDITING,
    ...WINDOWS_NAVIGATION,
    ...functionShortcuts('win', 'Function '),
    ...numberShortcuts('win'),
    ...symbolShortcuts('win')
  ],
  mac: [
    ...MAC_EDITING,
    ...MAC_NAVIGATION,
    ...functionShortcuts('mac', 'Function '),
    ...numberShortcuts('mac'),
    ...symbolShortcuts('mac')
  ]
};

export const SHORTCUT_CATEGORIES = ['mixed', 'editing', 'navigation', 'function', 'numbers', 'symbols'];

export const SHORTCUT_CATEGORY_LABELS = {
  mixed: 'mixed',
  editing: 'edit',
  navigation: 'nav',
  function: 'fn',
  numbers: '123',
  symbols: '#+='
};

export const SHORTCUT_COUNTS = [10, 20, 40];

export function getShortcutBank(system, category = 'mixed') {
  const bank = SHORTCUT_BANKS[system] ?? SHORTCUT_BANKS.windows;
  if (category === 'mixed') return bank;

  const filtered = bank.filter((shortcut) => shortcut.category === category);
  return filtered.length > 0 ? filtered : bank;
}

export function createShortcutSession(system, category, count) {
  const bank = getShortcutBank(system, category);
  let previousId = null;

  return Array.from({ length: count }, () => {
    const source = bank.length > 1 ? bank.filter((shortcut) => shortcut.id !== previousId) : bank;
    const shortcut = source[Math.floor(Math.random() * source.length)];
    previousId = shortcut.id;
    return shortcut;
  });
}

export function getDefaultShortcutSystem() {
  return 'custom';
}

export function normalizeShortcutKey(key) {
  if (key === ' ') return ' ';
  if (key === 'Esc') return 'Escape';
  if (key === 'Del') return 'Delete';
  if (key === 'Left') return 'ArrowLeft';
  if (key === 'Right') return 'ArrowRight';
  if (key === 'Up') return 'ArrowUp';
  if (key === 'Down') return 'ArrowDown';
  if (key.length === 1) return key.toLowerCase();

  return key;
}

export function isModifierKey(key) {
  return ['Alt', 'Control', 'Meta', 'Shift'].includes(key);
}

export function shortcutMatchesEvent(shortcut, event) {
  return (
    normalizeShortcutKey(event.key) === shortcut.key &&
    Boolean(event.ctrlKey) === Boolean(shortcut.ctrl) &&
    Boolean(event.metaKey) === Boolean(shortcut.meta) &&
    Boolean(event.altKey) === Boolean(shortcut.alt) &&
    Boolean(event.shiftKey) === Boolean(shortcut.shift)
  );
}

function displayKey(key) {
  const labels = {
    ' ': 'Space',
    ArrowLeft: 'Left',
    ArrowRight: 'Right',
    ArrowUp: 'Up',
    ArrowDown: 'Down',
    PageUp: 'Page Up',
    PageDown: 'Page Down'
  };

  if (labels[key]) return labels[key];
  if (key.length === 1) return key.toUpperCase();
  return key;
}

export function formatPressedShortcut(event, system = 'windows') {
  const key = normalizeShortcutKey(event.key);
  const parts = [];

  if (event.ctrlKey) parts.push('Ctrl');
  if (event.metaKey) parts.push(system === 'mac' ? 'Cmd' : 'Win');
  if (event.altKey) parts.push(system === 'mac' ? 'Option' : 'Alt');
  if (event.shiftKey) parts.push('Shift');
  if (!isModifierKey(key)) parts.push(displayKey(key));

  return parts.join(' + ') || displayKey(key);
}
