<template lang="pug">
#quiz-area(v-show="isPlaying && !gameFinished")
  span#question 問題: {{ questionText }}
  span#frequency 頻出度: {{ questionFrequency }}
  #feedback-container
    #key-input-container
      span.correct-text(:class="{ visible: showCorrectAnimation && !isRevealAnswer }" v-if="!isRevealAnswer") 正解！🎉
      #key-input-display(:class="{ correct: showCorrectAnimation }")
      template(v-for="(key, index) in currentCorrectKeys")
        span.key-box(v-html="showCorrectAnimation || pressedKeys.has(key) ? formatKeyForDisplay(key) : '&nbsp;'")
        span.plus(v-if="index < currentCorrectKeys.length - 1") +
</template>

<script setup>
import { computed } from 'vue'
import { shortcutsList } from '@/composables/shortcutsList'

const props = defineProps({
  isPlaying: Boolean,
  gameFinished: Boolean,
  questionText: String,
  questionFrequency: String,
  showCorrectAnimation: Boolean,
  isRevealAnswer: Boolean,
  currentCorrectKeys: Array,
  pressedKeys: Set,
  isMac: Boolean,
})

const shortcuts = computed(() => {
  return shortcutsList
})

function formatKeyForDisplay(key) {
  switch (key) {
    case 'mod':
      return props.isMac ? '⌘' : 'Ctrl'
    case 'alt':
      return props.isMac ? '⌥' : 'Alt'
    case 'shift':
      return 'Shift'
    default:
      return key.charAt(0).toUpperCase() + key.slice(1)
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/_variables.scss';

#quiz-area {
  margin: 10px;
  padding: 10px;
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

#frequency {
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
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

#key-input-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.correct-text {
  position: absolute;
  left: -50%;
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

  &.correct .key-box {
    border-color: $correct-color;
    background-color: $correct-bg;
  }
}

.key-box {
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
  color: $text-color;
  transition: all 0.2s ease;
}

.plus {
  margin: 0 10px;
  font-weight: bold;
  font-size: 24px;
  color: $text-color-medium;
}
</style>
