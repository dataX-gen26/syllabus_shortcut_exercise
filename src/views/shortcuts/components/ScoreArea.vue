<template lang="pug">
#score-area(v-show="gameFinished")
    h2 結果
    p 正解数: 
        strong#correct-count {{ correctCount }} 問
    p ミスタイプ数: 
        span#final-miss-count {{ missCount }} 回
    p 正解を見た回数: 
        span#reveal-count {{ revealCount }} 回
</template>

<script setup>
defineProps({
  gameFinished: Boolean,
  correctCount: Number,
  missCount: Number,
  revealCount: Number,
})
</script>

<style lang="scss" scoped>
@import '@/assets/_variables.scss';

#correct-count {
  font-size: 22px;
  color: $primary-color;
  font-weight: bold;
}
</style>
