<template lang="pug">
.page-wrapper
  .container
    h1 スプレッドシート ショートカット演習
    p(v-if="!isPlaying && !gameFinished") 制限時間2分で、何問正解できるかに挑戦！
    p(v-if="isPlaying") 問題の操作を行うショートカットキーを押してください。
    p(v-if="gameFinished") 時間です！お疲れ様でした。

    QuizArea(
      :isPlaying="isPlaying",
      :gameFinished="gameFinished",
      :questionText="questionText",
      :questionFrequency="questionFrequency",
      :showCorrectAnimation="showCorrectAnimation",
      :isRevealAnswer="isRevealAnswer",
      :currentCorrectKeys="currentCorrectKeys",
      :pressedKeys="pressedKeys",
      :isMac="isMac"
    )

    ScoreArea(
      v-if="gameFinished"
      :gameFinished="gameFinished",
      :correctCount="correctCount",
      :missCount="missCount",
      :revealCount="revealCount"
    )

    StatusArea(
      v-if="isPlaying"
      :timer="timer",
      :correctCount="correctCount",
      :missCount="missCount"
    )

    ControlButtons(
      :isPlaying="isPlaying",
      :showCorrectAnimation="showCorrectAnimation",
      :startButtonText="startButtonText",
      @startGame="startGame",
      @revealAnswer="revealAnswer"
    )

  PreviewArea(
    :currentQuestionId="currentQuestionId",
    :isPlaying="isPlaying",
    :previewImages="previewImages"
  )

</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { shortcutsList } from '@/composables/shortcutsList'
import QuizArea from './components/QuizArea.vue'
import ScoreArea from './components/ScoreArea.vue'
import StatusArea from './components/StatusArea.vue'
import ControlButtons from './components/ControlButtons.vue'
import PreviewArea from './components/PreviewArea.vue'
import {
  isMacPlatform,
  eventToKeyNames,
  isShortcutEventMatch,
  getRequiredKeysForQuestion,
} from '@/composables/shortcutUtils'

const TIME_LIMIT = 120 // 制限時間（秒）

const imageModules = import.meta.glob('@/assets/img/*.png', { eager: true })
const isMac = isMacPlatform()

const questions = ref([])
const currentQuestionIndex = ref(0)
const pressedKeys = ref(new Set())
const missCount = ref(0)
const revealCount = ref(0)
const correctCount = ref(0) // 正解数をカウント
const timer = ref(TIME_LIMIT)
let timerInterval = null

const isPlaying = ref(false)
const gameFinished = ref(false)
const showCorrectAnimation = ref(false)
const isRevealAnswer = ref(false)

const currentQuestion = computed(() => {
  if (!questions.value.length) return null
  return questions.value[currentQuestionIndex.value]
})

const questionText = computed(() => currentQuestion.value?.name || 'ここに問題文が表示されます')
const currentQuestionId = computed(() => currentQuestion.value?.id || null)
const questionFrequency = computed(() => currentQuestion.value?.frequency || null)

const currentCorrectKeys = computed(() => {
  return getRequiredKeysForQuestion(currentQuestion.value, isMac)
})

const startButtonText = computed(() => {
  return gameFinished.value ? 'もう一度挑戦する' : 'スタート'
})

const previewImages = computed(() => {
  return [] // Preview is disabled for now
})

function startGame() {
  isPlaying.value = true
  gameFinished.value = false
  showCorrectAnimation.value = false
  missCount.value = 0
  revealCount.value = 0
  correctCount.value = 0
  timer.value = TIME_LIMIT
  pressedKeys.value.clear()

  questions.value = shuffle([...shortcutsList])
  currentQuestionIndex.value = 0

  startTimer()
}

function startTimer() {
  timerInterval = setInterval(() => {
    timer.value--
    if (timer.value <= 0) {
      endGame()
    }
  }, 1000)
}

function stopTimer() {
  clearInterval(timerInterval)
}

function handleKeyDown(e) {
  if (!isPlaying.value || showCorrectAnimation.value) return
  e.preventDefault()

  // Use shared helper to collect pressed keys
  pressedKeys.value = new Set(eventToKeyNames(e, isMac))

  checkAnswer(e)
}

function handleKeyUp(e) {
  if (!isPlaying.value) return
  pressedKeys.value.clear()
}

function checkAnswer(e) {
  // Use shared matcher for correctness
  if (isShortcutEventMatch(e, currentCorrectKeys.value, isMac)) {
    correctCount.value++
    showCorrectAnimation.value = true
    setTimeout(nextQuestion, 500)
  } else {
    missCount.value++
  }
}

function revealAnswer() {
  if (!isPlaying.value || showCorrectAnimation.value) return
  isRevealAnswer.value = true
  revealCount.value++
  showCorrectAnimation.value = true
  setTimeout(nextQuestion, 500)
}

function nextQuestion() {
  if (!isPlaying.value) return // ゲームが終了していたら何もしない

  // 問題リストの最後に到達したら、再度シャッフルして最初に戻る
  if (currentQuestionIndex.value >= questions.value.length - 1) {
    questions.value = shuffle([...shortcutsList])
    currentQuestionIndex.value = 0
  } else {
    currentQuestionIndex.value++
  }

  pressedKeys.value.clear()
  showCorrectAnimation.value = false
  isRevealAnswer.value = false
}

function endGame() {
  stopTimer()
  isPlaying.value = false
  gameFinished.value = true
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('keyup', handleKeyUp)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyDown)
  document.removeEventListener('keyup', handleKeyUp)
  stopTimer()
})
</script>

<style lang="scss" scoped>
.page-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}

// .container スタイルは App.vue で定義
</style>
