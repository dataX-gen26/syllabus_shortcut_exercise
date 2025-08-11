<template lang="pug">
.control-buttons
  button#start-button(@click="$emit('startGame')", v-show="!isPlaying") {{ startButtonText }}
  button#reveal-button(@click="$emit('revealAnswer')", v-show="isPlaying", :disabled="showCorrectAnimation") 正解を見る
</template>

<script setup>
defineProps({
  isPlaying: Boolean,
  showCorrectAnimation: Boolean,
  startButtonText: String,
})

defineEmits(['startGame', 'revealAnswer'])
</script>

<style lang="scss" scoped>
@import '@/assets/_variables.scss';

.control-buttons {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 10px; /* Add gap between buttons */
}

button {
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

  &:disabled {
    background-color: $disabled-color;
    cursor: not-allowed;
  }
}

#reveal-button {
  background-color: $danger-color;

  &:hover {
    background-color: $danger-color-dark;
  }
}
</style>
