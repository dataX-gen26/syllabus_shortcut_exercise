<template lang="pug">
.wrapper
  .container
    h1 ショートカットキー演習
    p モードを選択してください。
    .mode-selection
      router-link.mode-button(to="/practice") 練習モード
      router-link.mode-button(to="/test") テストモード
</template>

<script setup>
</script>

<style lang="scss" scoped>
.wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.container {
  text-align: center;
  background-color: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #1a73e8;
  margin-bottom: 20px;
}

p {
  margin-bottom: 30px;
  font-size: 18px;
}

.mode-selection {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.mode-button {
  display: inline-block;
  padding: 15px 30px;
  font-size: 18px;
  font-weight: bold;
  color: white;
  background-color: #1a73e8;
  border: none;
  border-radius: 5px;
  text-decoration: none;
  transition: background-color 0.3s;

  &:hover {
    background-color: #1558b8;
  }
}

.mode-button:last-child {
  background-color: #34a853;

  &:hover {
    background-color: #2c8f45;
  }
}
</style>
