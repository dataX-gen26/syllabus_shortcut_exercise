// Utilities for handling shortcut key logic shared across views

export const MODIFIER_KEYS = ['ctrl', 'cmd', 'option', 'alt', 'shift', 'fn', 'meta']

export function isMacPlatform() {
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform)
}

export function getRequiredKeysForQuestion(question, isMac) {
  if (!question || !question.keys) return []
  return isMac ? question.keys.mac : question.keys.windows
}

// Map KeyboardEvent.code to display key names for non-alphanumeric and numpad keys
const codeToKeyMap = {
  Minus: '-',
  Equal: '=',
  BracketLeft: '[',
  BracketRight: ']',
  Backslash: '\\',
  Semicolon: ';',
  Quote: "'",
  Comma: ',',
  Period: '.',
  Slash: '/',
  Backquote: '`',
  Space: 'space',
  NumpadSubtract: '-',
  NumpadAdd: '+',
  NumpadMultiply: '*',
  NumpadDivide: '/',
  NumpadDecimal: '.',
}

export function eventToKeyNames(e, isMac) {
  const keys = new Set() // Use a Set to avoid duplicates

  if (isMac) {
    if (e.metaKey) keys.add('cmd')
    if (e.ctrlKey) keys.add('ctrl')
    if (e.altKey) keys.add('option')
  } else {
    if (e.ctrlKey) keys.add('ctrl')
    if (e.altKey) keys.add('alt')
  }
  if (e.shiftKey) keys.add('shift')

  // Add the non-modifier key (normalized by code when applicable)
  const pressedKey = (e.key || '').toLowerCase()
  if (pressedKey) {
    if (pressedKey === 'control') keys.add('ctrl')
    else if (pressedKey === 'meta') keys.add('cmd') // Map 'meta' to 'cmd'
    else if (pressedKey === 'alt' && isMac) keys.add('option')
    else if (pressedKey === 'alt' && !isMac) keys.add('alt')
    else if (pressedKey === 'shift') keys.add('shift')
    else if (pressedKey === ' ' || pressedKey === 'spacebar')
      keys.add('space') // Normalize spacebar
    else {
      const mapped = codeToKeyMap[e.code] ? String(codeToKeyMap[e.code]).toLowerCase() : pressedKey
      keys.add(mapped)
    }
  }

  return Array.from(keys)
}

export function isSinglePatternMatch(e, requiredKeys, isMac) {
  const normalize = (k) => (k || '').toLowerCase()
  const expected = (Array.isArray(requiredKeys) ? requiredKeys : [requiredKeys]).map(normalize)
  const actual = eventToKeyNames(e, isMac).map(normalize)

  if (expected.length !== actual.length) return false
  for (let i = 0; i < expected.length; i++) {
    if (expected[i] !== actual[i]) return false
  }
  return true
}

export function checkAnswer(e, answerPatterns, isMac) {
  if (!answerPatterns || answerPatterns.length === 0) return false

  for (const pattern of answerPatterns) {
    if (isSinglePatternMatch(e, pattern, isMac)) {
      return true
    }
  }
  return false
}

// Prefix matching helpers for per-keydown judgment
export function isPrefixMatch(e, requiredKeys, isMac) {
  const normalize = (k) => (k || '').toLowerCase()
  const expected = (Array.isArray(requiredKeys) ? requiredKeys : [requiredKeys]).map(normalize)
  const actual = eventToKeyNames(e, isMac).map(normalize)

  if (actual.length > expected.length) return false
  for (let i = 0; i < actual.length; i++) {
    if (expected[i] !== actual[i]) return false
  }
  return true
}

export function isAnyPrefixMatch(e, answerPatterns, isMac) {
  if (!answerPatterns || answerPatterns.length === 0) return false
  for (const pattern of answerPatterns) {
    if (isPrefixMatch(e, pattern, isMac)) return true
  }
  return false
}

// Formats a single pattern for display.
function formatStep(stepKeys) {
  return stepKeys.map((key) => key.charAt(0).toUpperCase() + key.slice(1)).join(' + ')
}

// Formats all answer patterns for a question, including alternatives.
export function formatAnswerKeys(answerPatterns) {
  if (!answerPatterns || answerPatterns.length === 0) return ''
  return answerPatterns.map(formatStep).join(' / ')
}

export function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}
