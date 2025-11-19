<template lang="pug">
header.app-header
  .logo
    router-link(to="/") daX Syllabus
    h3#subject-label スプシショートカット
  nav.navigation
    router-link(to="/practice") 練習モード
    router-link(to="/test") テストモード
    router-link(to="/list") ショートカット一覧
    a(href="https://docs.google.com/forms/d/e/1FAIpQLSdc9vAAu9L4-TMC7unmBYcptqO1dDxkCschH5LNeu4du6dwkQ/viewform" target="_blank" rel="noopener noreferrer") お問い合わせ
</template>

<script setup></script>

<style lang="scss" scoped>
@import '@/assets/_variables.scss';

.app-header {
  background-color: $primary-color;
  color: $white;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  box-shadow: 0 2px 4px $shadow-color;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  box-sizing: border-box; // prevent padding from causing horizontal overflow
}

// Align logo and subject label nicely
.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;

  a {
    color: $white;
    text-decoration: none;
    font-size: 1.5rem;
    font-weight: bold;
  }
}

#subject-label {
  display: inline-flex;
  align-items: center;
  height: 32px;
  padding: 0 0.75rem;
  border-radius: 999px;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  background: $subject-label-bg;
  border: 1px solid $subject-label-border;
  box-shadow: 0 1px 0 $shadow-color inset, 0 1px 2px $shadow-color-darker;
  margin-left: 0.25rem;
}

.navigation a {
  color: $white;
  text-decoration: none;
  margin-left: 1.5rem;
  font-size: 1rem;
  transition: opacity 0.3s;
  white-space: nowrap;
  box-sizing: border-box;
  padding: 0.25rem 0.5rem;

  &:hover {
    opacity: 0.8;
  }

  &.router-link-exact-active {
    border-bottom: 2px solid $yellow;
    font-weight: bold;
  }
}
</style>
