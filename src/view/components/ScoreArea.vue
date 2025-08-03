<template lang="pug">
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
</template>

<script setup>
defineProps({
    gameFinished: Boolean,
    finalScore: Number,
    timer: Number,
    missCount: Number,
    revealCount: Number,
})
</script>

<style lang="scss" scoped>
/* Add component-specific styles here if needed */
</style>
