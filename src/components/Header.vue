<template lang="pug">
header.app-header
  .logo
    router-link(to="/") daX Syllabus
    h3#subject-label スプシショートカット
  nav.navigation
    router-link(to="/practice") 練習モード
    router-link(to="/test") テストモード
</template>

<script setup></script>

<style lang="scss" scoped>
.app-header {
  background-color: #46bdc6;
  color: white;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
    color: white;
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
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1) inset, 0 1px 2px rgba(0, 0, 0, 0.15);
  margin-left: 0.25rem;
}

.navigation a {
  color: white;
  text-decoration: none;
  margin-left: 1.5rem;
  font-size: 1rem;
  transition: opacity 0.3s;
  white-space: nowrap;

  &:hover {
    opacity: 0.8;
  }

  &.router-link-exact-active {
    text-decoration: underline;
  }
}

// Responsive tweaks for very small screens
// @media (max-width: 600px) {
//   .app-header {
//     padding: 0 1rem;
//   }
//   .navigation a {
//     margin-left: 1rem;
//     font-size: 0.95rem;
//   }
//   #subject-label {
//     height: 28px;
//     font-size: 0.85rem;
//     padding: 0 0.6rem;
//   }
// }
</style>
