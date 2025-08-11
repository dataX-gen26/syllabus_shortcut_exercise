# ショートカットキー別解・複数段階入力 対応 実装設計書 (改訂版)

## 1. 概要

本ドキュメントは、ショートカット演習アプリケーションにおいて、一つの課題に対して**複数の正解キーコンビネーション（別解）**および、**複数段階のキー入力（シーケンシャル入力）**を許容するためのシステム設計を定義する。

## 2. 目的

- **別解への対応**: `Option` と `Alt` のように、環境によって呼び方が異なるが同じ動作をするキーや、複数の入力方法が許容されているショートカットに対応する。
- **シーケンシャル入力への対応**: `Alt + I` を押した後に `W` を押す、といった複数ステップで構成されるショートカットを正しく判定・表示できるようにする。

## 3. 実装方針

- **データ構造の拡張**: `@src/composables/shortcutsList.js` のデータ構造を「**ステップの配列の配列**」に拡張する。これにより、単純な同時押し、その別解、そして複数段階のシーケンシャルなショートカットを統一的に表現する。
- **ステートフルな判定ロジック**: キー入力を判定するロジックを、現在の入力ステップを管理する**ステートフルな（状態を持つ）**ものに変更する。この状態管理は、キーイベントを直接受け取るVueコンポーネント (`practice.vue`, `test.vue`) が担う。
- **表示の更新**: 正解キーを表示するコンポーネントを修正し、シーケンシャルな入力や別解をユーザーに分かりやすく提示する。

## 4. ファイルごとの変更詳細

### 4.1. `@src/composables/shortcutsList.js`

**変更点**: `keys` オブジェクトの値を「ステップの配列の配列」という3階層の配列構造に変更する。

- **第1階層 (一番外側)**: **別解**の配列 (OR条件)
- **第2階層**: **入力ステップ**の配列 (AND条件、シーケンシャル)
- **第3階層 (一番内側)**: 各ステップで**同時押し**するキーの配列

**データ構造:**
```javascript
{
  // ...
  keys: {
    windows: [ /* 別解配列 */ [ /* ステップ配列 */ [ /* 同時押しキー配列 */ ] ] ],
    mac: [ [ ['cmd', 'a'] ] ]
  }
}
```

**例1: 単純な同時押し (`Cmd + A`)**
```javascript
// 1つの別解、1つのステップ、2キーの同時押し
keys: { mac: [ [ ['cmd', 'a'] ] ] }
```

**例2: 別解のある同時押し (`Option+Shift+5` または `Alt+Shift+5`)**
```javascript
// 2つの別解、各1ステップ
keys: { mac: [ [ ['option', 'shift', '5'] ], [ ['alt', 'shift', '5'] ] ] }
```

**例3: シーケンシャル入力 (`Alt+I` → `W`)**
```javascript
// 1つの別解、2つのステップ
keys: { windows: [ [ ['alt', 'i'], ['w'] ] ] }
```

**例4: 別解のあるシーケンシャル入力 (仮)**
```javascript
// 2つの別解（1つはシーケンシャル、もう1つは同時押し）
keys: {
  windows: [
    [ ['alt', 'i'], ['w'] ],              // 別解1 (シーケンシャル)
    [ ['ctrl', 'shift', 'arrowdown'] ]   // 別解2 (同時押し)
  ]
}
```
> **[NOTE]** この新しいデータ構造に合わせて、既存の全てのショートカットデータを移行する必要がある。

### 4.2. `@src/composables/shortcutUtils.js`

**変更点**: メインの判定ロジックがVueコンポーネントに移るため、このファイルは主にヘルパー関数を提供する役割となる。

- **`isShortcutEventMatch`**: この関数は廃止、または単一ステップの同時押し判定に特化した `isSinglePatternMatch` のような内部ヘルパーに置き換わる。メインロジックはコンポーネント側で実装されるため、`export` する必要はなくなる可能性がある。

- **(修正) `formatAnswerKeys(answerPatterns)`**:
  - 新しいデータ構造を受け取り、シーケンシャル入力と別解の両方を表現できる表示用文字列を生成するようにロジックを更新する。
  - ステップ間は `→` で、別解間は ` / ` で連結する。

  **実装イメージ:**
  ```javascript
  // 単一ステップのフォーマット: ['cmd', 'a'] -> "Cmd + A"
  function formatStep(stepKeys) {
    return stepKeys.map(key => key.charAt(0).toUpperCase() + key.slice(1)).join(' + ');
  }

  // 単一の正解パターンのフォーマット: [['alt', 'i'], ['w']] -> "Alt + I → W"
  function formatPattern(pattern) {
    return pattern.map(formatStep).join(' → ');
  }

  // 全ての別解をフォーマット
  export function formatAnswerKeys(answerPatterns) {
    if (!answerPatterns || answerPatterns.length === 0) return '';
    return answerPatterns.map(formatPattern).join(' / ');
  }
  ```

### 4.3. Vueコンポーネント (`practice.vue`, `test.vue`)

**変更点**: キー入力の判定ロジックをコンポーネント内で状態を管理しながら行います。これにより、複数ステップにまたがる入力シーケンスを正しく追跡できます。

#### 管理する状態 (State)

コンポーネントの `<script setup>` 内で、以下の3つのリアクティブな状態を定義します。

```javascript
import { ref } from 'vue';

// 現在どの別解パターンを試行中かを示すインデックス (-1: 試行中ではない)
const activePatternIndex = ref(-1);
// 試行中のパターン内で、次に成功させるべきステップのインデックス (0から開始)
const currentStepIndex = ref(0);
// 入力ステップ間のタイムアウトを管理するタイマーID
let resetTimer = null;
```

#### 正誤判定ロジックフロー

ユーザーからの `keydown` イベントが発生するたびに、以下のフローで正誤を判定します。

**前提:**
- `answerPatterns`: 現在の問題の正解パターン群。例: `[ [ ['alt', 'i'], ['w'] ], [ ['ctrl', 'j'] ] ]`
- `isSinglePatternMatch(event, keys)`: `event` が `keys` (同時押し) と一致するか判定するヘルパー関数。

---

**▼ `handleKeyDown(event)` 処理開始**

1.  **タイマー解除**: `clearTimeout(resetTimer)` を実行し、前回の入力からのタイムアウトをキャンセルします。

2.  **進行中のパターンがあるか？ (`activePatternIndex !== -1`)**
    *   **YES (シーケンス追跡中)**
        a.  現在追跡中のパターン `currentPattern = answerPatterns[activePatternIndex.value]` を取得します。
        b.  次に成功させるべきステップ `nextStepKeys = currentPattern[currentStepIndex.value]` を取得します。
        c.  現在のキー入力 `event` が `nextStepKeys` と一致するか `isSinglePatternMatch` で判定します。
            *   **一致した (Correct Step):**
                i.  `currentStepIndex` をインクリメントします (`++`)。
                ii. **全ステップ完了か？** (`currentStepIndex >= currentPattern.length`)
                    *   **YES (最終ステップ成功):**
                        - **【🎉 正解！】**
                        - 正解処理（スコア加算、次の問題へ進むなど）を実行します。
                        - `resetState()` を呼び出して、次の問題に備えて状態を初期化します。
                        - 処理を終了します。
                    *   **NO (まだ次のステップがある):**
                        - 次のキー入力を待つため、タイムアウトを設定します (`resetTimer = setTimeout(resetState, 1500)`)。
                        - 処理を終了します。
            *   **一致しなかった (Incorrect Step):**
                - 進行中のシーケンスは失敗です。**状態をリセット (`resetState()`) します。**
                - **ただし、ここで処理を中断しません。** この間違ったキー入力が、*別の別解パターンの最初のステップである可能性*があるため、そのままステップ3の「待機状態の処理」に進みます。

    *   **NO (待機状態)**
        *   ステップ3に進みます。

3.  **新しいパターンを開始できるか？ (待機状態からのチェック)**
    a.  全ての別解パターン `answerPatterns` をループでチェックします (`for (let i = 0; ...)`）。
    b.  各パターンの**最初のステップ** `firstStepKeys = answerPatterns[i][0]` を取得します。
    c.  現在のキー入力 `event` が `firstStepKeys` と一致するか `isSinglePatternMatch` で判定します。
        *   **一致した (New Pattern Started):**
            i.  **そのパターンは1ステップのみか？** (`answerPatterns[i].length === 1`)
                *   **YES (単発ショートカット成功):**
                    - **【🎉 正解！】**
                    - 正解処理を実行します。
                    - `resetState()` を呼び出します。
                    - 処理を終了します。
                *   **NO (シーケンシャル入力の開始):**
                    - 状態を更新して、このパターンの追跡を開始します。
                        - `activePatternIndex.value = i`
                        - `currentStepIndex.value = 1` (ステップ0は成功したので、次はステップ1)
                    - 次のキー入力のためのタイムアウトを設定します (`resetTimer = setTimeout(resetState, 1500)`)。
                    - 処理を終了します（他の別解パターンをチェックする必要はありません）。
        *   **一致しなかった:**
            - ループを継続し、次の別解パターンをチェックします。

4.  **どのパターンにも一致しなかった場合**
    *   ループを抜けてもどのパターンのどのステップにも一致しなかった場合、これは不正解の入力です。
    *   `resetState()` を呼び出して、状態を確実に初期化します。
    *   処理を終了します。

---

#### 状態リセット関数

```javascript
function resetState() {
  activePatternIndex.value = -1;
  currentStepIndex.value = 0;
  clearTimeout(resetTimer);
}
```
この関数は、正解時、不正解時、タイムアウト時に呼ばれ、判定ロジックを初期状態に戻します。


### 4.4. Vueコンポーネント (`PreviewArea.vue`, `QuizArea.vue`)

**変更点**: 正解表示ロジックは `shortcutUtils.js` の `formatAnswerKeys` を使うだけで、シーケンシャル入力と別解の両方に対応した文字列が表示される。

**変更後 (イメージ):**
```javascript
// ...
import { getRequiredKeysForQuestion, formatAnswerKeys } from '@/composables/shortcutUtils.js';

const formattedKeys = computed(() => {
  const answerPatterns = getRequiredKeysForQuestion(props.question, props.isMac);
  // この関数を呼ぶだけで、"Alt + I → W / Ctrl + Shift + ArrowDown" のような文字列が返る
  return formatAnswerKeys(answerPatterns);
});
// ...
```
