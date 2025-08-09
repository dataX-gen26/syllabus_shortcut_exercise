<template lang="pug">
  IndexView
</template>

<script setup>
import IndexView from './views/shortcuts/index.vue'
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

#result {
  font-size: 24px;
  font-weight: bold;
}

.hidden {
  display: none;
}
</style>
