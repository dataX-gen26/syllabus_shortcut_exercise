<template lang="pug">
.wrapper
  .container
    h1 スプレッドシート ショートカット演習
    p(v-if="!isPlaying && !gameFinished") 制限時間1分で、何問正解できるかに挑戦！
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

const TIME_LIMIT = 60 // 制限時間（秒）

const imageModules = import.meta.glob('@/assets/img/*.png', { eager: true })
const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform)

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
  if (!currentQuestion.value) return []
  return isMac ? currentQuestion.value.keys.mac : currentQuestion.value.keys.windows
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

  pressedKeys.value.clear()
  if (isMac) {
    if (e.metaKey) pressedKeys.value.add('cmd')
    if (e.ctrlKey) pressedKeys.value.add('ctrl')
    if (e.altKey) pressedKeys.value.add('option')
  } else {
    if (e.ctrlKey) pressedKeys.value.add('ctrl')
    if (e.altKey) pressedKeys.value.add('alt')
  }
  if (e.shiftKey) pressedKeys.value.add('shift')
  pressedKeys.value.add(e.key.toLowerCase())

  checkAnswer(e)
}

function handleKeyUp(e) {
  if (!isPlaying.value) return
  pressedKeys.value.clear()
}

function checkAnswer(e) {
  const requiredKeys = new Set(currentCorrectKeys.value)
  const mainKey = [...requiredKeys].find(
    (k) => !['ctrl', 'cmd', 'option', 'alt', 'shift'].includes(k)
  )

  if (e.key.toLowerCase() !== mainKey) {
    missCount.value++
    return
  }

  let correctModifiers = true
  if (isMac) {
    correctModifiers =
      requiredKeys.has('cmd') === e.metaKey &&
      requiredKeys.has('ctrl') === e.ctrlKey &&
      requiredKeys.has('option') === e.altKey &&
      requiredKeys.has('shift') === e.shiftKey
  } else {
    correctModifiers =
      requiredKeys.has('ctrl') === e.ctrlKey &&
      requiredKeys.has('alt') === e.altKey &&
      requiredKeys.has('shift') === e.shiftKey
  }

  if (correctModifiers) {
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

<style lang="scss">
body {
  font-family: sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
  background-color: #f0f2f5;
  color: #333;
}

.wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  //   margin: 50px;
}

.container {
  text-align: center;
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 600px;
  justify-content: center;

  h1 {
    color: #1a73e8;
  }
}

#result {
  font-size: 24px;
  font-weight: bold;
}

.hidden {
  display: none;
}
</style>
