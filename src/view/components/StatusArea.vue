<template lang="pug">
.status-area
    div 時間: 
        span#timer {{ timer.toFixed(2) }} 秒
    div ミスタイプ: 
        span#miss-count {{ missCount }} 回
</template>

<script setup>
defineProps({
    timer: Number,
    missCount: Number,
})
</script>

<style lang="scss" scoped>
.status-area {
  display: flex;
  justify-content: space-around;
  margin: 20px 0;
  font-size: 18px;
}
</style>
