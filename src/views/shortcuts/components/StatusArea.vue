<template lang="pug">
.status-area
    div 残り時間: 
        span#timer {{ timer }} 秒
    div 正解: 
        span#correct-count {{ correctCount }} 問
    div ミスタイプ: 
        span#miss-count {{ missCount }} 回
</template>

<script setup>
defineProps({
  timer: Number,
  correctCount: Number,
  missCount: Number,
})
</script>

<style lang="scss" scoped>
@import '@/assets/_variables.scss';

.status-area {
  display: flex;
  justify-content: space-around;
  margin: 20px 0;
  padding: 10px;
  font-size: 18px;
  background-color: $background-color;
  border-radius: 8px;
}
</style>
