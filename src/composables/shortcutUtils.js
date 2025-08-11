// Utilities for handling shortcut key logic shared across views

export const MODIFIER_KEYS = ['ctrl', 'cmd', 'option', 'alt', 'shift', 'fn']

export function isMacPlatform() {
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform)
}

export function getRequiredKeysForQuestion(question, isMac) {
  if (!question) return []
  return isMac ? question.keys.mac : question.keys.windows
}

export function getMainKey(requiredKeys) {
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

export function isShortcutEventMatch(e, requiredKeys, isMac) {
  const required = new Set(requiredKeys)
  const mainKey = getMainKey(required)
  if (!mainKey) return false

  // Main key must match
  if ((e.key || '').toLowerCase() !== mainKey) {
    return false
  }

  // Check modifiers; ignore 'fn' as browsers don't expose it
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
