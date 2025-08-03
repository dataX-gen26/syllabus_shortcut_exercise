<template lang="pug">
#quiz-area(v-show="isPlaying && !gameFinished")
  #question {{ questionText }}
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

const props = defineProps({
  isPlaying: Boolean,
  gameFinished: Boolean,
  questionText: String,
  showCorrectAnimation: Boolean,
  isRevealAnswer: Boolean,
  currentCorrectKeys: Array,
  pressedKeys: Set,
  isMac: Boolean,
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
#quiz-area {
  margin: 10px;
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 8px;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

#question {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
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
  color: green;
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
    border-color: green;
    background-color: #e8f5e9;
  }
}

.key-box {
  display: inline-block;
  border: 2px solid #ccc;
  border-radius: 6px;
  padding: 10px 20px;
  min-width: 40px;
  min-height: 30px;
  line-height: 30px;
  text-align: center;
  background-color: #f9f9f9;
  font-size: 22px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  font-weight: bold;
  color: #333;
  transition: all 0.2s ease;
}

.plus {
  margin: 0 10px;
  font-weight: bold;
  font-size: 24px;
  color: #555;
}
</style>
