<template lang="pug">
.page-container
  h1 ショートカット一覧
  p.description このページでは、演習に含まれるすべてのショートカットを確認できます。
  .list-container
    template(v-for="(group, category) in groupedShortcuts" :key="category")
      h2.category-title {{ category }}
      table.shortcut-table
        thead
          tr
            th 操作内容
            th Windows
            th Mac
        tbody
          tr(v-for="shortcut in group" :key="shortcut.id")
            td {{ shortcut.name }}
            td.keys
              span(v-html="formatAnswerKeys(shortcut.keys.windows)")
            td.keys
              span(v-html="formatAnswerKeys(shortcut.keys.mac)")
  .back-to-top
    router-link(to="/") モード選択に戻る
</template>

<script setup>
import { computed } from 'vue'
import { shortcutsList } from '@/composables/shortcutsList'
import { formatAnswerKeys } from '@/composables/shortcutUtils'

const groupedShortcuts = computed(() => {
  return shortcutsList.reduce((acc, shortcut) => {
    const category = shortcut.category || 'その他'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(shortcut)
    return acc
  }, {})
})
</script>

<style lang="scss" scoped>
@import '@/assets/_variables.scss';

.page-container {
  width: 100%;
  max-width: 960px;
  margin: 2rem auto;
  padding: 2rem;
  box-sizing: border-box;
}

h1 {
  text-align: center;
  margin-bottom: 0.5rem;
}

.description {
  text-align: center;
  color: $text-color-medium;
  margin-bottom: 3rem;
}

.list-container {
  margin-top: 2rem;
}

.category-title {
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid $primary-color;
  color: $primary-color;
}

.shortcut-table {
  width: 100%;
  border-collapse: collapse;
  box-shadow: 0 2px 8px $shadow-color-light;

  th, td {
    border: 1px solid $border-color;
    padding: 12px 15px;
    text-align: left;
  }

  thead {
    background-color: $light-gray-bg;
    th {
      font-weight: 600;
    }
  }

  tbody tr {
    &:nth-of-type(even) {
      background-color: $white;
    }
    &:hover {
      background-color: $gray-200;
    }
  }

  td.keys {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-weight: 500;
    // The deep selector is needed to style v-html content
    :deep(.key-box) {
        display: inline-block;
        border: 1px solid $disabled-color;
        border-radius: 4px;
        padding: 2px 6px;
        margin: 0 2px;
        background-color: $key-box-bg;
        font-size: 0.9rem;
        line-height: 1.4;
        white-space: nowrap;
    }
    :deep(.plus), :deep(.separator) {
        margin: 0 4px;
    }
  }
}

.back-to-top {
    text-align: center;
    margin-top: 3rem;
}
</style>