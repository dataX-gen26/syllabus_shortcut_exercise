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
  color: white;
  background-color: #1a73e8;
  transition: background-color 0.3s;

  &:hover {
    background-color: #1558b8;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
}

#reveal-button {
  background-color: #f44336;

  &:hover {
    background-color: #d32f2f;
  }
}
</style>
