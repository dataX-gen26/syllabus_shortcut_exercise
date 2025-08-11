<template lang="pug">
#app-container
  Header
  main.main-content
    router-view
</template>

<script setup>
import Header from '@/components/Header.vue'
</script>

<style lang="scss">
body {
  font-family: sans-serif;
  margin: 0;
  background-color: #f0f2f5;
  color: #333;
}

#app-container {
  display: flex;
  flex-direction: column;
  height: 90vh;
  box-sizing: border-box;
}

.main-content {
  padding-top: 60px; // ヘッダーの高さ分
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding-left: 1rem;
  padding-right: 1rem;
}

.container {
  text-align: center;
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 600px;
  max-width: 100%;

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
