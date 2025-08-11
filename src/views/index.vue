<template lang="pug">
.container
  h1 ショートカットキー演習
  p モードを選択してください。
  .mode-selection
    router-link.mode-button(to="/practice") 練習モード
    router-link.mode-button(to="/test") テストモード
</template>

<script setup></script>

<style lang="scss" scoped>
// .container スタイルは App.vue のグローバルスタイルで定義
// .wrapper スタイルは不要になったため削除

h1 {
  // App.vueのスタイルを継承
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
