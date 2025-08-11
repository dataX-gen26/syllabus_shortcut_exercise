<template lang="pug">
.page-wrapper
  .container
    //- モード選択画面
    template(v-if="step === 'select'")
      h1 練習モード
      p 練習したいショートカットの頻出度を選択してください。
      .frequency-selection
        .mode-card(
          v-for="freq in frequencies"
          :key="freq"
          @click="startPractice(freq)"
          role="button"
          tabindex="0"
          @keydown.enter.prevent="startPractice(freq)"
          @keydown.space.prevent="startPractice(freq)"
        )
          img(:src="levelImage[freq]" alt="頻出度アイコン")
          .card-title {{ freq }}
      router-link.back-button(to="/") モード選択に戻る

    //- 演習画面
    template(v-else)
      .title-wrapper(v-if="isPlaying")
        h1 練習モード
        p 問題の操作を行うショートカットキーを押してください。

      QuizArea(
        :isPlaying="isPlaying",
        :gameFinished="gameFinished",
        :questionText="questionText",
        :questionFrequency="questionFrequency",
        :showCorrectAnimation="showCorrectAnimation",
        :isRevealAnswer="isRevealAnswer",
        :currentCorrectKeys="currentCorrectKeys",
        :isMac="isMac",
        :pressedKeys="pressedKeys"
      )

      //- 終了後のメッセージ
      .end-message(v-if="gameFinished")
        h1 終了！
        p 全10問の練習が終わりました。
        button.restart-button(@click="restart") もう一度同じ頻度で挑戦
        router-link.back-button(to="/practice") 頻度選択に戻る

      ControlButtons(
        v-if="!gameFinished"
        :isPlaying="isPlaying",
        :showCorrectAnimation="showCorrectAnimation",
        startButtonText="やり直す",
        @revealAnswer="revealAnswer"
      )

  PreviewArea(
    v-if="step === 'playing'"
    :currentQuestionId="currentQuestionId",
    :isPlaying="isPlaying",
    :previewImages="previewImages"
  )

</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { shortcutsList } from '@/composables/shortcutsList'
import QuizArea from './components/QuizArea.vue'
import ControlButtons from './components/ControlButtons.vue'
import PreviewArea from './components/PreviewArea.vue'
import pine from '@/assets/img/pine.png'
import bamboo from '@/assets/img/bamboo.png'
import plum from '@/assets/img/plum.png'
import {
  isMacPlatform,
  getRequiredKeysForQuestion,
  eventToKeyNames,
  isSinglePatternMatch,
} from '@/composables/shortcutUtils'

const isMac = isMacPlatform()
const levelImage = { 低: pine, 高: bamboo, 激高: plum }

const step = ref('select')
const frequencies = ref([])
const selectedFrequency = ref(null)

const questions = ref([])
const currentQuestionIndex = ref(0)
const isPlaying = ref(false)
const gameFinished = ref(false)
const showCorrectAnimation = ref(false)
const isRevealAnswer = ref(false)

const pressedKeys = ref(new Set())
const activePatternIndex = ref(-1)
const currentStepIndex = ref(0)
let resetTimer = null

const currentQuestion = computed(() => {
  if (!questions.value.length || currentQuestionIndex.value >= questions.value.length) {
    return null
  }
  return questions.value[currentQuestionIndex.value]
})

const questionText = computed(() => currentQuestion.value?.name || 'ここに問題文が表示されます')
const currentQuestionId = computed(() => currentQuestion.value?.id || null)
const questionFrequency = computed(() => currentQuestion.value?.frequency || null)

const currentCorrectKeys = computed(() => {
  return getRequiredKeysForQuestion(currentQuestion.value, isMac)
})

const isLastQuestion = computed(() => {
  return currentQuestionIndex.value >= questions.value.length - 1
})

const previewImages = computed(() => [])

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

function startPractice(frequency) {
  selectedFrequency.value = frequency
  const filtered = shortcutsList.filter((q) => q.frequency === frequency)
  questions.value = shuffle(filtered).slice(0, 10)

  if (questions.value.length > 0) {
    currentQuestionIndex.value = 0
    resetState()
    isPlaying.value = true
    gameFinished.value = false
    showCorrectAnimation.value = false
    isRevealAnswer.value = false
    step.value = 'playing'
  } else {
    alert('この頻度の問題はありません。')
  }
}

function restart() {
  if (selectedFrequency.value) {
    startPractice(selectedFrequency.value)
  }
}

function handleKeyDown(e) {
  if (!isPlaying.value || showCorrectAnimation.value) return
  e.preventDefault()
  pressedKeys.value = new Set(eventToKeyNames(e, isMac))
  clearTimeout(resetTimer)

  const answerPatterns = currentCorrectKeys.value
  if (!answerPatterns || answerPatterns.length === 0) return

  if (activePatternIndex.value !== -1) {
    const currentPattern = answerPatterns[activePatternIndex.value]
    const nextStepKeys = currentPattern[currentStepIndex.value]
    if (isSinglePatternMatch(e, nextStepKeys, isMac)) {
      currentStepIndex.value++
      if (currentStepIndex.value >= currentPattern.length) {
        handleCorrectAnswer()
      } else {
        resetTimer = setTimeout(resetState, 1500)
      }
      return
    }
  }

  for (let i = 0; i < answerPatterns.length; i++) {
    const firstStepKeys = answerPatterns[i][0]
    if (isSinglePatternMatch(e, firstStepKeys, isMac)) {
      if (answerPatterns[i].length === 1) {
        handleCorrectAnswer()
      } else {
        activePatternIndex.value = i
        currentStepIndex.value = 1
        resetTimer = setTimeout(resetState, 1500)
      }
      return
    }
  }
}

function handleKeyUp() {
  if (showCorrectAnimation.value) return
  resetTimer = setTimeout(() => {
      pressedKeys.value.clear()
      if(activePatternIndex.value !== -1) {
          resetState()
      }
  }, 100)
}

function handleCorrectAnswer() {
  showCorrectAnimation.value = true
  setTimeout(() => {
    if (isLastQuestion.value) {
      endGame()
    } else {
      nextQuestion()
    }
  }, 500)
}

function revealAnswer() {
  if (!isPlaying.value || showCorrectAnimation.value) return
  isRevealAnswer.value = true
  showCorrectAnimation.value = true
  setTimeout(() => {
    if (isLastQuestion.value) {
      endGame()
    } else {
      nextQuestion()
    }
  }, 500)
}

function nextQuestion() {
  currentQuestionIndex.value++
  resetState()
  showCorrectAnimation.value = false
  isRevealAnswer.value = false
}

function resetState() {
  pressedKeys.value.clear()
  activePatternIndex.value = -1
  currentStepIndex.value = 0
  clearTimeout(resetTimer)
}

function endGame() {
  isPlaying.value = false
  gameFinished.value = true
  step.value = 'finished'
}

onMounted(() => {
  const uniqueFrequencies = [...new Set(shortcutsList.map((item) => item.frequency))]
  frequencies.value = uniqueFrequencies
  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('keyup', handleKeyUp)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyDown)
  document.removeEventListener('keyup', handleKeyUp)
})
</script>

<style lang="scss" scoped>
@import '@/assets/_variables.scss';

.page-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.frequency-selection {
  margin: 30px 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  width: 100%;
  max-width: 860px;
}

.mode-card {
  background: $white;
  border: 1px solid $gray-200;
  border-radius: 12px;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  box-shadow: 0 2px 8px $shadow-color-light;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px $shadow-color-medium;
    border-color: $gray-300;
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px $shadow-color-darker-alt;
  }

  img {
    width: 70px;
    height: auto;
    object-fit: contain;
    margin-bottom: 12px;
  }

  .card-title {
    font-size: 18px;
    font-weight: 600;
    color: $gray-800;
    letter-spacing: 0.2px;
  }
}

.back-button {
  display: inline-block;
  margin-top: 20px;
  color: $text-color-medium;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
}

.end-message {
  margin-top: 30px;
  h1 {
    color: $success-color;
  }
  p {
    margin: 10px 0 20px;
  }
}

.restart-button {
  padding: 10px 15px;
  font-size: 16px;
  cursor: pointer;
  border: none;
  border-radius: 5px;
  color: $white;
  background-color: $primary-color;
  transition: background-color 0.3s;

  &:hover {
    background-color: $primary-color-dark;
  }
}
</style>