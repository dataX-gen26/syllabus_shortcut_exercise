# Windows/Mac両対応ショートカットキー実装手順書

## 1. はじめに

本ドキュメントは、アプリケーションにおけるショートカットキー操作を、WindowsとmacOSの双方の環境で利用可能にするための実装手順を定義します。

## 2. 要件

- ユーザーの使用OSを判定し、適切な修飾キー（Windows/Linux: `Ctrl`, macOS: `Command`）を動的に割り当てること。
- ショートカットキーハンドリングのロジックを、再利用可能な形式で実装すること。

## 3. 実装方針

Vue 3のComposition APIを活用し、ショートカットキーハンドリングのロジックをカプセル化したコンポーザブル（Composable）を作成します。これにより、関心事の分離とコードの再利用性を高めます。

具体的には、`useShortcut`という名前のコンポーザブルを作成し、各コンポーネントからこれを呼び出して使用する形を想定しています。

## 4. 実装手順

### 手順1: コンポーザブルファイルの作成

まず、ショートカットキーのロジックを配置するためのコンポーザブルファイルを作成します。

- **パス:** `src/composables/useShortcut.js`

`composables`ディレクトリが存在しない場合は、`src`配下に新規作成してください。

### 手順2: コンポーザブルの実装

`src/composables/useShortcut.js` に以下のコードを記述します。
このコンポーザブルは、OSを判定し、適切な修飾キー（`ctrlKey`または`metaKey`）を監視する役割を担います。

```javascript
import { onMounted, onUnmounted } from 'vue';

export function useShortcut(key, callback) {
  const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  const handleKeyDown = (event) => {
    const modifierKeyPressed = isMac ? event.metaKey : event.ctrlKey;

    if (modifierKeyPressed && event.key === key) {
      event.preventDefault();
      callback();
    }
  };

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
  });
}
```

### 手順3: コンポーネントでの利用

作成した`useShortcut`コンポーザブルを、ショートカットキーを実装したいVueコンポーネント内で使用します。

以下は、`c`キーと`Ctrl`（または`Command`）キーの同時押しを検知するサンプルコードです。

```vue
<script setup>
import { useShortcut } from '@/composables/useShortcut';

// 'c'キーのショートカットを登録
useShortcut('c', () => {
  console.log('Shortcut "Ctrl/Cmd + c" pressed!');
  // ここに実行したい処理を記述
});
</script>

<template>
  <div>
    <p>Press Ctrl/Cmd + c</p>
  </div>
</template>
```

### 手順4: 既存コードのリファクタリング

既存のコンポーネントにショートカットキーの実装が既にある場合、新しい`useShortcut`コンポーザブルを使用するようにリファクタリングを行います。

## 5. ファイル構成

本対応により、以下のファイルが新規作成または変更されます。

```
.
├── @devDocs/
│   └── shortcut_implementation_plan.md  (新規作成)
└── src/
    └── composables/
        └── useShortcut.js               (新規作成)
```

## 6. その他

- 本手順書は実装の指針を示すものであり、具体的な実装は対象コンポーネントの仕様に応じて調整してください。
