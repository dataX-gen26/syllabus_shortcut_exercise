<template lang="pug">
.wrapper
  .container
    //- モード選択画面
    template(v-if="step === 'select'")
      h1 練習モード
      p 練習したい頻出度を選択してください。
      .frequency-selection
        button.freq-button(v-for="freq in frequencies" :key="freq" @click="startPractice(freq)") {{ freq }}
      router-link.back-button(to="/") モード選択に戻る

    //- 演習画面
    template(v-else)
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
        :pressedKeys="pressedKeys",
        :isMac="isMac"
      )

      //- 終了後のメッセージ
      .end-message(v-if="gameFinished")
        h2 練習完了！
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

// --- State ---
const isMac = /Mac|iPod|iPod|iPhone|iPad/.test(navigator.platform)
const imageModules = import.meta.glob('@/assets/img/*.png', { eager: true })

const step = ref('select') // 'select', 'playing', 'finished'
const frequencies = ref([])
const selectedFrequency = ref(null)

const questions = ref([])
const currentQuestionIndex = ref(0)
const pressedKeys = ref(new Set())
const isPlaying = ref(false)
const gameFinished = ref(false)
const showCorrectAnimation = ref(false)
const isRevealAnswer = ref(false)


// --- Computed Properties ---
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
  if (!currentQuestion.value) return []
  return isMac ? currentQuestion.value.keys.mac : currentQuestion.value.keys.windows
})

const isLastQuestion = computed(() => {
  return currentQuestionIndex.value >= questions.value.length - 1
})

const previewImages = computed(() => {
  return [] // Preview is disabled for now
})


// --- Methods ---
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

function startPractice(frequency) {
  selectedFrequency.value = frequency
  const filtered = shortcutsList.filter(q => q.frequency === frequency)
  questions.value = shuffle(filtered).slice(0, 10)

  if (questions.value.length > 0) {
    currentQuestionIndex.value = 0
    pressedKeys.value.clear()
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
  const mainKey = [...requiredKeys].find(k => !['ctrl', 'cmd', 'option', 'alt', 'shift'].includes(k))

  if (e.key.toLowerCase() !== mainKey) return

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
    showCorrectAnimation.value = true
    setTimeout(() => {
      if (isLastQuestion.value) {
        endGame()
      } else {
        nextQuestion()
      }
    }, 500)
  }
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
  pressedKeys.value.clear()
  showCorrectAnimation.value = false
  isRevealAnswer.value = false
}

function endGame() {
  isPlaying.value = false
  gameFinished.value = true
}

// --- Lifecycle Hooks ---
onMounted(() => {
  const uniqueFrequencies = [...new Set(shortcutsList.map(item => item.frequency))]
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
.wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
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

.frequency-selection {
  margin: 30px 0;
  display: flex;
  justify-content: center;
  gap: 15px;
}

.freq-button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  border: 2px solid #1a73e8;
  border-radius: 5px;
  color: #1a73e8;
  background-color: white;
  transition: all 0.3s;

  &:hover {
    background-color: #1a73e8;
    color: white;
  }
}

.back-button {
  display: inline-block;
  margin-top: 20px;
  color: #555;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
}

.end-message {
  margin-top: 30px;
  h2 {
    color: #34a853;
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
  color: white;
  background-color: #1a73e8;
  transition: background-color 0.3s;

  &:hover {
    background-color: #1558b8;
  }
}
</style>
