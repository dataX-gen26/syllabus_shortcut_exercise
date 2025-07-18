<template lang="pug">
#app.container
  h1 スプレッドシート ショートカット演習
  p お題の操作を行うショートカットキーを押してください。

  #quiz-area(v-show="!gameFinished")
    #question(v-show="!isCorrect") {{ questionText }}
    #result(v-show="isCorrect", style="color: green;") 正解！ 🎉

  #score-area(v-show="gameFinished")
    h2 結果
    p 最終スコア: 
      strong#final-score {{ finalScore }}
    p クリアタイム: 
      span#clear-time {{ timer.toFixed(2) }} 秒
    p ミスタイプ数: 
      span#final-miss-count {{ missCount }} 回

  .status-area
    div 時間: 
      span#timer {{ timer.toFixed(2) }} 秒
    div ミスタイプ: 
      span#miss-count {{ missCount }} 回

  button#start-button(@click="startGame", v-show="!isPlaying") {{ startButtonText }}
  button#next-button(@click="nextQuestion", v-show="isCorrect && !isLastQuestion") 次の問題へ

</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

const shortcuts = ref([
    { name: '太字にする', keys: ['Control', 'b'] },
    { name: 'コピー', keys: ['Control', 'c'] },
    { name: '貼り付け', keys: ['Control', 'v'] },
    { name: '切り取り', keys: ['Control', 'x'] },
    { name: 'すべて選択', keys: ['Control', 'a'] },
    { name: '元に戻す', keys: ['Control', 'z'] },
    { name: 'やり直し', keys: ['Control', 'y'] },
    { name: '検索', keys: ['Control', 'f'] },
]);

const currentQuestionIndex = ref(0);
const pressedKeys = new Set();
const missCount = ref(0);
const timer = ref(0);
let timerInterval = null;
let startTime = 0;
const isPlaying = ref(false);
const isCorrect = ref(false);
const gameFinished = ref(false);

const questionText = computed(() => {
    if (gameFinished.value || !shortcuts.value[currentQuestionIndex.value]) {
        return 'ここに問題文が表示されます';
    }
    return `お題: ${shortcuts.value[currentQuestionIndex.value].name}`;
});

const isLastQuestion = computed(() => {
    return currentQuestionIndex.value >= shortcuts.value.length - 1;
});

const finalScore = computed(() => {
    let score = 10000 - (timer.value * 50) - (missCount.value * 100);
    return Math.max(0, Math.round(score));
});

const startButtonText = computed(() => {
    return gameFinished.value ? 'もう一度挑戦する' : 'スタート';
});

function startGame() {
    isPlaying.value = true;
    gameFinished.value = false;
    isCorrect.value = false;
    currentQuestionIndex.value = 0;
    missCount.value = 0;
    timer.value = 0;
    shuffle(shortcuts.value);
    setQuestion();
    startTimer();
}

function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        timer.value = (Date.now() - startTime) / 1000;
    }, 100);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function setQuestion() {
    if (currentQuestionIndex.value >= shortcuts.value.length) {
        endGame();
        return;
    }
    isCorrect.value = false;
}

function handleKeyDown(e) {
    if (!isPlaying.value || isCorrect.value) return;
    e.preventDefault();
    pressedKeys.add(e.key);
    checkAnswer();
}

function handleKeyUp(e) {
    if (!isPlaying.value) return;
    pressedKeys.delete(e.key);
}

function checkAnswer() {
    const correctKeys = shortcuts.value[currentQuestionIndex.value].keys;
    if (pressedKeys.size !== correctKeys.length) {
        return;
    }

    const isCorrectCheck = correctKeys.every(key => pressedKeys.has(key));

    if (isCorrectCheck) {
        isCorrect.value = true;
        if (isLastQuestion.value) {
            endGame();
        }
    } else {
        missCount.value++;
    }
}

function nextQuestion() {
    if (isLastQuestion.value) {
        endGame();
        return;
    }
    currentQuestionIndex.value++;
    pressedKeys.clear();
    setQuestion();
}

function endGame() {
    isPlaying.value = false;
    isCorrect.value = false;
    gameFinished.value = true;
    stopTimer();
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

onMounted(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
});

onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
    stopTimer();
});

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
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
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
    min-height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
}

#question, #result {
    font-size: 24px;
    font-weight: bold;
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

    &:hover {
        background-color: #1558b8;
    }
}

.hidden {
    display: none;
}
</style>