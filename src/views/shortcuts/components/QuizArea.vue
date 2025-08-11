<template lang="pug">
#quiz-area(v-show="isPlaying && !gameFinished")
  span#question 問題: {{ questionText }}
  span#level 難易度: {{ questionLevel }}
  #feedback-container
    #key-input-container
      span.correct-text(:class="{ visible: showCorrectAnimation && !isRevealAnswer }" v-if="!isRevealAnswer") 正解！🎉
      #key-input-display(:class="{ correct: showCorrectAnimation }" v-html="formattedAnswer")
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isPlaying: Boolean,
  gameFinished: Boolean,
  questionText: String,
  questionLevel: String,
  showCorrectAnimation: Boolean,
  isRevealAnswer: Boolean,
  currentCorrectKeys: Array,
  isMac: Boolean,
  pressedKeys: Set,
})

function formatKeyForDisplay(key) {
  switch (key) {
    case 'cmd':
      return '⌘'
    case 'ctrl':
      return props.isMac ? '⌃' : 'Ctrl'
    case 'option':
      return '⌥'
    case 'alt':
      return 'Alt'
    case 'shift':
      return '⇧'
    case 'enter':
      return 'Enter'
    case 'space':
      return 'Space'
    case 'arrowup':
      return '↑'
    case 'arrowdown':
      return '↓'
    case 'arrowleft':
      return '←'
    case 'arrowright':
      return '→'
    default:
      return key.toUpperCase()
  }
}

const formattedAnswer = computed(() => {
  const answerPatterns = props.currentCorrectKeys || []
  if (answerPatterns.length === 0) return ''

  let html = ''

  answerPatterns.forEach((pattern, patternIndex) => {
    if (patternIndex > 0) {
      html += '<span class="separator">/</span>'
    }

    html += '<div class="pattern-group">'
    pattern.forEach((key, keyIndex) => {
      if (keyIndex > 0) {
        html += '<span class="plus">+</span>'
      }

      let keyContent = '&nbsp;'
      let isHighlighted = false

      if (props.showCorrectAnimation || props.isRevealAnswer) {
        isHighlighted = true
      } else if (props.pressedKeys && props.pressedKeys.has(key)) {
        isHighlighted = true
      }

      if (isHighlighted) {
        keyContent = formatKeyForDisplay(key)
      }

      html += `<span class="key-box ${isHighlighted ? 'filled' : ''}">${keyContent}</span>`
    })
    html += '</div>' // .pattern-group
  })

  return html
})
</script>

<style lang="scss" scoped>
@import '@/assets/_variables.scss';

#quiz-area {
  margin: 10px;
  padding: 20px;
  border: 2px solid $border-color;
  border-radius: 8px;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
}

#question {
  font-size: 20px;
  font-weight: bold;
  margin: 5px 0px 10px 0px;
}

#level {
  font-size: 14px;
  color: $text-color-light;
  position: absolute;
  top: -10px;
  right: -10px;
  padding: 5px 10px;
  background-color: $light-gray-bg;
  border-radius: 0 8px 0 8px;
  box-shadow: 0 4px 4px $shadow-color;
  font-style: italic;
}

#feedback-container {
  height: fit-content;
  display: flex;
  align-items: center;
  justify-content: center;
}

#key-input-container {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.correct-text {
  position: absolute;
  left: -95px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
  font-weight: bold;
  color: $correct-color;
  margin-right: 15px;
  visibility: hidden;

  &.visible {
    visibility: visible;
  }
}

#key-input-display {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;

  :deep(.pattern-group) {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  :deep(.key-box) {
    display: inline-block;
    border: 2px solid $disabled-color;
    border-radius: 6px;
    padding: 10px 20px;
    min-width: 40px;
    min-height: 30px;
    line-height: 30px;
    text-align: center;
    background-color: $key-box-bg;
    font-size: 22px;
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-weight: bold;
    color: $text-color-light;
    transition: all 0.2s ease;

    &.filled {
      background-color: $white;
      border-color: $text-color;
      color: $text-color;
    }
  }

  :deep(.plus) {
    margin: 0 5px;
    font-weight: bold;
    font-size: 24px;
    color: $text-color-medium;
  }

  :deep(.separator) {
    margin: 0 10px;
    font-weight: bold;
    font-size: 24px;
    color: $text-color-light;
  }

  &.correct {
    :deep(.key-box.filled) {
      border-color: $correct-color;
      background-color: $correct-bg;
      color: $text-color;
    }
  }
}
</style>
