<template lang="pug">
.wrapper
  .container
    h1 スプレッドシート ショートカット演習
    p 問題の操作を行うショートカットキーを押してください。

    QuizArea(
      :isPlaying="isPlaying",
      :gameFinished="gameFinished",
      :questionText="questionText",
      :showCorrectAnimation="showCorrectAnimation",
      :isRevealAnswer="isRevealAnswer",
      :currentCorrectKeys="currentCorrectKeys",
      :pressedKeys="pressedKeys",
      :isMac="isMac"
    )

    ScoreArea(
      :gameFinished="gameFinished",
      :finalScore="finalScore",
      :timer="timer",
      :missCount="missCount",
      :revealCount="revealCount"
    )

    StatusArea(:timer="timer", :missCount="missCount")

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
import QuizArea from './components/QuizArea.vue'
import ScoreArea from './components/ScoreArea.vue'
import StatusArea from './components/StatusArea.vue'
import ControlButtons from './components/ControlButtons.vue'
import PreviewArea from './components/PreviewArea.vue'

const imageModules = import.meta.glob('../assets/img/*.png', { eager: true })

const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform)

const shortcuts = ref([
  { id: 1, name: '太字にする', keys: ['mod', 'b'] },
  { id: 2, name: 'コピーする', keys: ['mod', 'c'] },
  { id: 3, name: '貼り付ける', keys: ['mod', 'v'] },
  { id: 4, name: '切り取る', keys: ['mod', 'x'] },
])

const currentQuestionIndex = ref(0)
const pressedKeys = ref(new Set()) // Make pressedKeys reactive
const missCount = ref(0)
const revealCount = ref(0)
const timer = ref(0)
let timerInterval = null
let lastTime = 0
const isPlaying = ref(false)
const gameFinished = ref(false)
const showCorrectAnimation = ref(false)
const isRevealAnswer = ref(false)

const questionText = computed(() => {
  if (gameFinished.value || !shortcuts.value[currentQuestionIndex.value]) {
    return 'ここに問題文が表示されます'
  }
  return `問題: ${shortcuts.value[currentQuestionIndex.value].name}`
})

const currentQuestionId = computed(() => {
  if (gameFinished.value || !shortcuts.value[currentQuestionIndex.value]) {
    return null
  }
  return shortcuts.value[currentQuestionIndex.value].id
})

const previewImages = computed(() => {
  if (!currentQuestionId.value) return []
  const questionId = currentQuestionId.value
  return Object.keys(imageModules)
    .filter((path) => path.split('/').pop().startsWith(`q${questionId}_`))
    .sort()
    .map((path) => imageModules[path].default)
})

const currentCorrectKeys = computed(() => {
  if (gameFinished.value || !shortcuts.value[currentQuestionIndex.value]) {
    return []
  }
  return shortcuts.value[currentQuestionIndex.value].keys
})

const isLastQuestion = computed(() => {
  return currentQuestionIndex.value >= shortcuts.value.length - 1
})

const finalScore = computed(() => {
  let score = 10000 - timer.value * 50 - missCount.value * 100 - revealCount.value * 500
  return Math.max(0, Math.round(score))
})

const startButtonText = computed(() => {
  return gameFinished.value ? 'もう一度挑戦する' : 'スタート'
})

function startGame() {
  isPlaying.value = true
  gameFinished.value = false
  showCorrectAnimation.value = false
  currentQuestionIndex.value = 0
  missCount.value = 0
  revealCount.value = 0
  timer.value = 0
  lastTime = 0
  pressedKeys.value.clear()
  shuffle(shortcuts.value)
  setQuestion()
  startTimer()
}

function startTimer() {
  const tickStartTime = Date.now()
  timerInterval = setInterval(() => {
    const diff = (Date.now() - tickStartTime) / 1000
    timer.value = lastTime + diff
  }, 100)
}

function stopTimer() {
  clearInterval(timerInterval)
  if (isPlaying.value || gameFinished.value) {
    lastTime = timer.value
  }
}

function setQuestion() {
  if (currentQuestionIndex.value >= shortcuts.value.length) {
    endGame()
    return
  }
}

function handleKeyDown(e) {
  if (!isPlaying.value || showCorrectAnimation.value) return
  e.preventDefault()

  // Update pressedKeys for display
  pressedKeys.value.add(e.key.toLowerCase())
  if (e.metaKey) pressedKeys.value.add('mod')
  if (e.ctrlKey) pressedKeys.value.add(isMac ? 'Control' : 'mod') // Distinguish Mac's Ctrl
  if (e.altKey) pressedKeys.value.add('alt')
  if (e.shiftKey) pressedKeys.value.add('shift')

  checkAnswer(e)
}

function handleKeyUp(e) {
  if (!isPlaying.value) return
  pressedKeys.value.clear() // Clear display keys on any key up
}

function checkAnswer(e) {
  const requiredKeys = new Set(currentCorrectKeys.value)
  const mainKey = [...requiredKeys].find((k) => !['mod', 'alt', 'shift', 'Control'].includes(k))

  // Check for the main, non-modifier key
  if (e.key.toLowerCase() !== mainKey) {
    missCount.value++
    return
  }

  // Check modifier keys
  const modPressed = isMac ? e.metaKey : e.ctrlKey
  const altPressed = e.altKey
  const shiftPressed = e.shiftKey
  // Note: Mac's Control key can be handled separately if needed

  const correctModifiers =
    requiredKeys.has('mod') === modPressed &&
    requiredKeys.has('alt') === altPressed &&
    requiredKeys.has('shift') === shiftPressed

  if (correctModifiers) {
    stopTimer()
    showCorrectAnimation.value = true

    if (isLastQuestion.value) {
      setTimeout(endGame, 500)
    } else {
      setTimeout(nextQuestion, 500)
    }
  } else {
    missCount.value++
  }
}

function revealAnswer() {
  if (!isPlaying.value || showCorrectAnimation.value) return

  isRevealAnswer.value = true

  revealCount.value++
  stopTimer()
  showCorrectAnimation.value = true

  if (isLastQuestion.value) {
    setTimeout(() => {
      endGame()
    }, 500)
  } else {
    setTimeout(() => {
      nextQuestion()
    }, 500)
  }
}

function nextQuestion() {
  if (isLastQuestion.value) {
    endGame()
    return
  }
  currentQuestionIndex.value++
  pressedKeys.value.clear()
  showCorrectAnimation.value = false
  isRevealAnswer.value = false
  setQuestion()
  startTimer()
}

function endGame() {
  isPlaying.value = false
  gameFinished.value = true
  stopTimer()
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
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
