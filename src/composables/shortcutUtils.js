// Utilities for handling shortcut key logic shared across views

export const MODIFIER_KEYS = ['ctrl', 'cmd', 'option', 'alt', 'shift', 'fn']

export function isMacPlatform() {
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform)
}

export function getRequiredKeysForQuestion(question, isMac) {
  if (!question || !question.keys) return []
  return isMac ? question.keys.mac : question.keys.windows
}

function getMainKey(requiredKeys) {
  const keys = Array.isArray(requiredKeys) ? requiredKeys : [...requiredKeys]
  return keys.find((k) => !MODIFIER_KEYS.includes(k)) || null
}

export function eventToKeyNames(e, isMac) {
  const keys = []
  if (isMac) {
    if (e.metaKey) keys.push('cmd')
    if (e.ctrlKey) keys.push('ctrl')
    if (e.altKey) keys.push('option')
  } else {
    if (e.ctrlKey) keys.push('ctrl')
    if (e.altKey) keys.push('alt')
  }
  if (e.shiftKey) keys.push('shift')
  keys.push((e.key || '').toLowerCase())
  return keys
}

export function isSinglePatternMatch(e, requiredKeys, isMac) {
  const required = new Set(requiredKeys)
  const mainKey = getMainKey(required)
  if (!mainKey) return false

  let codeMainKey = e.code

  const codeToKeyMap = {
    'Minus': '-',
    'Equal': '=',
    'BracketLeft': '[',
    'BracketRight': ']',
    'Backslash': '\\',
    'Semicolon': ';',
    'Quote': '\'',
    'Comma': ',',
    'Period': '.', 
    'Slash': '/',
    'Backquote': '`',
    'NumpadSubtract': '-',
    'NumpadAdd': '+',
    'NumpadMultiply': '*',
    'NumpadDivide': '/',
    'NumpadDecimal': '.', 
  };

  if (codeToKeyMap[codeMainKey]) {
    codeMainKey = codeToKeyMap[codeMainKey];
  } else if (codeMainKey.startsWith('Key')) {
    codeMainKey = codeMainKey.substring(3)
  } else if (codeMainKey.startsWith('Digit')) {
    codeMainKey = codeMainKey.substring(5)
  } else if (codeMainKey.startsWith('Arrow')) {
    codeMainKey = 'arrow' + codeMainKey.substring(5)
  }
  
  if (codeMainKey.toLowerCase() !== mainKey.toLowerCase()) {
    return false
  }

  if (isMac) {
    return (
      required.has('cmd') === !!e.metaKey &&
      required.has('ctrl') === !!e.ctrlKey &&
      required.has('option') === !!e.altKey &&
      required.has('shift') === !!e.shiftKey
    )
  } else {
    return (
      required.has('ctrl') === !!e.ctrlKey &&
      required.has('alt') === !!e.altKey &&
      required.has('shift') === !!e.shiftKey
    )
  }
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

// Formats a single pattern for display.
function formatStep(stepKeys) {
  return stepKeys
    .map((key) => key.charAt(0).toUpperCase() + key.slice(1))
    .join(' + ')
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
