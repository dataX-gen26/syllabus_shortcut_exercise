<template lang="pug">
.page-wrapper
  .container
    //- モード選択画面
    template(v-if="step === 'select'")
      h1 練習モード
      p 練習したいショートカットの難易度を選択してください。
      .level-selection
        .mode-card(
          v-for="level in levels"
          :key="level"
          @click="startPractice(level)"
          role="button"
          tabindex="0"
          @keydown.enter.prevent="startPractice(level)"
          @keydown.space.prevent="startPractice(level)"
        )
          img(:src="levelImage[level]" alt="レベルアイコン")
          .card-title {{ level }}
          span 問題数: {{ levelCounts[level] }}
      router-link.basic-button(to="/") モード選択に戻る

    //- 演習画面
    template(v-else)
      .title-wrapper(v-if="isPlaying")
        h1 練習モード
        p 問題の操作を行うショートカットキーを押してください。
        span.current-question-number 第 {{ currentQuestionIndex + 1 }} 問 / 全 {{ questions.length }} 問

      QuizArea(
        :isPlaying="isPlaying",
        :gameFinished="gameFinished",
        :questionText="questionText",
        :questionLevel="questionLevel",
        :showCorrectAnimation="showCorrectAnimation",
        :isRevealAnswer="isRevealAnswer",
        :currentCorrectKeys="currentCorrectKeys",
        :isMac="isMac",
        :pressedKeys="pressedKeys"
      )
      

      //- 終了後のメッセージ
      .end-message(v-if="gameFinished")
        h1 終了！
        p お疲れ様でした！
        .buttons
          button.basic-button(@click="restart") もう一度挑戦
          button.basic-button(@click="resetLevel") 難易度選択に戻る

      //- .buttons
      ControlButtons(
        v-if="!gameFinished"
        :isPlaying="isPlaying",
        :showCorrectAnimation="showCorrectAnimation",
        startButtonText="やり直す",
        @revealAnswer="revealAnswer"
      )
      p.end-game(
        v-if="isPlaying"
        @click="endGame"
      ) 終了する

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
  checkAnswer,
  shuffle,
  isAnyPrefixMatch,
} from '@/composables/shortcutUtils'

const isMac = isMacPlatform()
const levelImage = { 上級: pine, 中級: bamboo, 初級: plum }

const step = ref('select')
const levels = ['初級', '中級', '上級']
const selectedLevel = ref(null)

const questions = ref([])
const currentQuestionIndex = ref(0)
const isPlaying = ref(false)
const gameFinished = ref(false)
const showCorrectAnimation = ref(false)
const isRevealAnswer = ref(false)

const pressedKeys = ref(new Set())

const currentQuestion = computed(() => {
  if (!questions.value.length || currentQuestionIndex.value >= questions.value.length) {
    return null
  }
  return questions.value[currentQuestionIndex.value]
})

const questionText = computed(() => currentQuestion.value?.name || 'ここに問題文が表示されます')
const currentQuestionId = computed(() => currentQuestion.value?.id || null)
const questionLevel = computed(() => currentQuestion.value?.level || null)

const currentCorrectKeys = computed(() => {
  return getRequiredKeysForQuestion(currentQuestion.value, isMac)
})

const isLastQuestion = computed(() => {
  return currentQuestionIndex.value >= questions.value.length - 1
})

const previewImages = computed(() => [])

const levelCounts = computed(() => {
  const counts = {}
  levels.forEach((level) => {
    counts[level] = shortcutsList.filter((q) => q.level === level).length
  })
  return counts
})

function startPractice(level) {
  selectedLevel.value = level
  questions.value = shuffle(shortcutsList.filter((q) => q.level === level))

  if (questions.value.length > 0) {
    currentQuestionIndex.value = 0
    pressedKeys.value.clear()
    isPlaying.value = true
    gameFinished.value = false
    showCorrectAnimation.value = false
    isRevealAnswer.value = false
    step.value = 'playing'
  } else {
    alert('この難易度の問題はありません。')
  }
}

function restart() {
  if (selectedLevel.value) {
    startPractice(selectedLevel.value)
  }
}

function handleKeyDown(e) {
  if (!isPlaying.value || showCorrectAnimation.value) return
  e.preventDefault()
  const actualKeys = eventToKeyNames(e, isMac)
  pressedKeys.value = new Set(actualKeys)

  // Allow Shift-only presses without counting a miss
  if (actualKeys.length === 1 && actualKeys[0] === 'shift') {
    return
  }

  if (checkAnswer(e, currentCorrectKeys.value, isMac)) {
    handleCorrectAnswer()
  } else if (!isAnyPrefixMatch(e, currentCorrectKeys.value, isMac)) {
    // Not a valid prefix, could count as miss if you add miss tracking to practice mode
  }
}

function handleKeyUp() {
  if (showCorrectAnimation.value) return
  setTimeout(() => {
    pressedKeys.value.clear()
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
  pressedKeys.value.clear()
  showCorrectAnimation.value = false
  isRevealAnswer.value = false
}

function endGame() {
  isPlaying.value = false
  gameFinished.value = true
  step.value = 'finished'
}

function resetLevel() {
  selectedLevel.value = null
  questions.value = []
  currentQuestionIndex.value = 0
  pressedKeys.value.clear()
  isPlaying.value = false
  gameFinished.value = false
  showCorrectAnimation.value = false
  isRevealAnswer.value = false
  step.value = 'select'
}

onMounted(() => {
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
@import '@/assets/style.scss';

.page-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.level-selection {
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

.title-wrapper {
  margin-bottom: 20px;
  text-align: center;

  .current-question-number {
    font-size: 16px;
    color: $text-color;
    margin-top: 5px;
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

.buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  height: fit-content;
}

.basic-button {
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
