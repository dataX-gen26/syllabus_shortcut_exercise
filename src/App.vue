<template lang="pug">
#app.container
  h1 スプレッドシート ショートカット演習
  p お題の操作を行うショートカットキーを押してください。

  #quiz-area(v-show="!gameFinished")
    #question {{ questionText }}
    #feedback-container
      #key-input-container
        span.correct-text(:class="{ visible: showCorrectAnimation && !isRevealAnswer }") 正解！🎉
        #key-input-display(:class="{ correct: showCorrectAnimation }")
          template(v-for="(key, index) in currentCorrectKeys")
            span.key-box(v-html="showCorrectAnimation || pressedKeys.has(key) ? key : '&nbsp;'")
            span.plus(v-if="index < currentCorrectKeys.length - 1") +

  #score-area(v-show="gameFinished")
    h2 結果
    p 最終スコア: 
      strong#final-score {{ finalScore }}
    p クリアタイム: 
      span#clear-time {{ timer.toFixed(2) }} 秒
    p ミスタイプ数: 
      span#final-miss-count {{ missCount }} 回
    p 正解を見た回数: 
      span#reveal-count {{ revealCount }} 回

  .status-area
    div 時間: 
      span#timer {{ timer.toFixed(2) }} 秒
    div ミスタイプ: 
      span#miss-count {{ missCount }} 回

  button#start-button(@click="startGame", v-show="!isPlaying") {{ startButtonText }}
  button#reveal-button(@click="revealAnswer", v-show="isPlaying", :disabled="showCorrectAnimation") 正解を見る

</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const shortcuts = ref([
  { id: 1, name: '太字にする', keys: ['Control', 'b'] },
  { id: 2, name: 'コピー', keys: ['Control', 'c'] },
  { id: 3, name: '貼り付け', keys: ['Control', 'v'] },
  { id: 4, name: '切り取り', keys: ['Control', 'x'] },
  //   { id: 5, name: 'すべて選択', keys: ['Control', 'a'] },
  //   { id: 6, name: '元に戻す', keys: ['Control', 'z'] },
  //   { id: 7, name: '前に戻す', keys: ['Control', 'y'] },
  //   { id: 8, name: '検索', keys: ['Control', 'f'] },
])

const currentQuestionIndex = ref(0)
const pressedKeys = new Set()
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
  return `お題: ${shortcuts.value[currentQuestionIndex.value].name}`
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
  pressedKeys.clear()
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

  const key = e.key

  if (!currentCorrectKeys.value.includes(key)) {
    missCount.value++
    return
  }

  pressedKeys.add(key)
  checkAnswer()
}

function handleKeyUp(e) {
  if (!isPlaying.value) return
  pressedKeys.delete(e.key)
}

function checkAnswer() {
  if (pressedKeys.size !== currentCorrectKeys.value.length) {
    return
  }

  const isCorrectCheck = currentCorrectKeys.value.every((key) => pressedKeys.has(key))

  if (isCorrectCheck) {
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
  pressedKeys.clear()
  showCorrectAnimation.value = false
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

.container {
  text-align: center;
  background-color: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 600px;

  h1 {
    color: #1a73e8;
  }
}

#quiz-area {
  margin: 30px 0;
  padding: 20px;
  border: 2px solid #ddd;
  border-radius: 8px;
  min-height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

#question {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

#feedback-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

#result {
  font-size: 24px;
  font-weight: bold;
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

.status-area {
  display: flex;
  justify-content: space-around;
  margin: 20px 0;
  font-size: 18px;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  border: none;
  border-radius: 5px;
  color: white;
  background-color: #1a73e8;
  transition: background-color 0.3s;
  margin-top: 10px;

  &:hover {
    background-color: #1558b8;
  }
}

#reveal-button {
  background-color: #f44336;
  margin-left: 10px;

  &:hover {
    background-color: #d32f2f;
  }
}

.hidden {
  display: none;
}
</style>
