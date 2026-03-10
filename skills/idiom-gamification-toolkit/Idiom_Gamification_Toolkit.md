---
name: Idiom_Gamification_Toolkit
description: 國語文教學專用的成語資料結構標準與遊戲化判斷邏輯，包含免 AI 的關鍵字評分引擎、樓層漸進解鎖系統與神器獎勵機制。
version: 2.0.0
author: 筆芯老師 (Pen-Core)
tags: [Schema, Game, Idiom, Teaching, Progression]
---

# Idiom_Gamification_Toolkit (成語遊戲化工具箱)

## 1. 技能描述 (Description)
本技能是建構「成語地牢」與「文言文學習網」的基礎建設。它不只定義資料結構，還內建了「關鍵字捕手 (Keyword Catcher)」邏輯，讓前端能即時判斷學生的回答是否正確，無需頻繁呼叫 AI API。

## 2. 核心資料結構 (Core Schema)

為了確保未來的擴充性 (連接文言文與典故)，我們採用三層式架構：`Text` -> `Story` -> `Idiom`。

### 2.1 基礎介面定義 (`resources/schema.ts`)

```typescript
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

// 1. 最底層：文言文原文 (For future usage)
export interface ClassicalText {
  id: string;           // e.g. 'han-fei-zi-wu-du'
  title: string;        // 韓非子·五蠹
  dynasty: string;      // 戰國
  author: string;       // 韓非
  content: string;      // 原文...
  translation?: string; // 白話翻譯
}

// 2. 中間層：典故故事 (Story Mode)
export interface Story {
  id: string;
  sourceTextId: string; // Foreign Key -> ClassicalText
  title: string;        // 守株待兔的故事
  content: string;      // 白話故事內容...
}

// 3. 核心層：成語卡片 (Game Mode)
export interface Idiom {
  id: string;           // e.g. 'shou-zhu-dai-tu'
  term: string;         // 守株待兔
  pronunciation: string;// shǒu zhū dài tù
  definition: string;   // 標準教育部釋義
  storyId: string;      // Foreign Key -> Story
  
  // 遊戲化數據 (Gamification Data)
  level: DifficultyLevel;
  metaphor: {
    hook: string;       // 一句話秒懂 (生活場景)
    description: string;// 小劇場詳細描述
  };
  
  // 關鍵字捕手設定 (Keyword Catcher Config)
  validation: {
    keywords: string[]; // 必中關鍵字 (Core)
    forbidden: string[];// 禁忌關鍵字 (Negative)
    hint: string;       // 當學生答錯時的引導提示
  };
  
  // 測驗題庫 (Quiz Data) - v1.2 分離式設計
  quizzes: {
    practice: QuizQuestion[]; // 聖殿用的基礎閱讀測驗 (3題)
    battle: QuizQuestion[];   // 地牢用的進階戰鬥題 (不重複)
  };
}

// 4. 測驗題目介面 (v1.2 新增)
export interface QuizQuestion {
    id: string;           // 格式: '{idiom-id}-p{n}' (practice) 或 '{idiom-id}-b{n}' (battle)
    question: string;     // 題目文字
    options: string[];    // 4 個選項 (含正確答案，字數必須平衡)
    answer: string;       // 正確答案 (字串比對)
}
```

### 樓層系統 (Floor System) — v2.0 新增

```typescript
// 資料結構：data/floors/floor-N.ts
export interface FloorMeta {
    level: DifficultyLevel;
    name: string;          // e.g. '覺醒層'
    emoji: string;         // e.g. '🏛️'
    colorClass: string;    // Tailwind 色系
    description: string;
    reward: ArtifactReward; // 通關獎勵 (神器)
}

export interface ArtifactReward {
    id: string;            // e.g. 'wisdom-scroll'
    name: string;          // e.g. '智慧卷軸'
    emoji: string;         // e.g. '📜'
    description: string;   // 故事性描述
    effect: string;        // 戰鬥效果
}
```

#### 擴充方式（新增一層只需兩步）
1. 在 `data/floors/` 建立 `floor-N.ts`（複製任一現有 floor 作模板）
2. 在 `data/floors/index.ts` 加一行 import

#### 漸進式解鎖規則
- 第 1 層永遠開放
- 第 N 層需要第 N-1 層 **全部成語 mastered** 才解鎖
- 完成一層 → 獲得該層神器 + 解鎖該層地牢入口

#### 設計原則（基於 Octalysis Framework）
| 核心驅力 | 對應實作 |
|---|---|
| #2 成就感 | 每層通關 → 神器獎勵 |
| #4 擁有感 | 神器庫 — 收集展示 |
| #6 稀缺性 | 神器只有通關才能拿到 |
| #7 好奇心 | 下一層神器 = ??? 未知驚喜 |

> ⚠️ **重要變更 (v1.2 → v2.0)**：
> - 舊版 `quiz` 屬性已廢棄，改為 `quizzes: { practice[], battle[] }`。
> - 資料從單一 `idioms.ts` 重構為 `floors/` 目錄，每層一個檔案。
> - 新增 `FloorMeta.reward` 神器獎勵欄位。
> - 地牢從「全部學完才解鎖」改為「每層學完即可挑戰該層」。
> - `practice`: 3 題，用於聖殿的閱讀測驗，學生全對才算「習得」。
> - `battle`: 2 題，用於地牢挑戰模式，難度較高的應用題。
> - 選項字數必須平衡，避免「最長的就是答案」。詳見 `Reading_Comprehension_Quiz` 技能。

## 3. 關鍵字捕手邏輯 (Keyword Catcher Logic)

這是一個純前端的評分演算法，用於「我說你導」環節。

### 判定規則：
1.  **Forbidden Check**: 如果輸入包含任一 `forbidden` 詞彙，直接判定為 **❌ 錯誤 (Critical Fail)**。
    *   *Feedback*: "方向完全錯囉！這樣解讀會變成..."
2.  **Core Check**: 如果輸入包含至少 **1 個** `keywords` 詞彙，判定為 **✅ 正確 (Pass)**。
    *   *Score*: 2 個以上為 5 星，1 個為 3 星，0 個為 1 星。
3.  **Default**: 如果以上皆非，判定為 **⚠️ 模糊 (Retry)**。
    *   *Feedback*: 顯示 `hint` 欄位的內容。

### 實作範例 (Helper Function):

```typescript
export type EvaluationResult = {
    status: 'pass' | 'fail' | 'retry';
    stars: 0 | 1 | 3 | 5;
    feedback: string;
};

export function evaluateIdiomInput(input: string, idiom: Idiom): EvaluationResult {
  const text = input.trim().toLowerCase();
  
  if (text.length < 5) return { status: 'retry', stars: 0, feedback: '太短囉' };

  for (const word of idiom.validation.forbidden) {
    if (text.includes(word)) return { status: 'fail', stars: 0, feedback: '觸犯禁忌' };
  }
  
  let score = 0;
  for (const word of idiom.validation.keywords) {
    if (text.includes(word)) score++;
  }

  if (score >= 2) return { status: 'pass', stars: 5, feedback: '完美！' };
  if (score >= 1) return { status: 'pass', stars: 3, feedback: '通過！' };
  
  return { status: 'retry', stars: 1, feedback: '再試試' };
}
```

## 4. 遊戲化視覺規範 (Visual Effects)

### CSS Animation Tokens (Tailwind)

*   **`animate-shake`**: 當答錯或受到攻擊時。
*   **`animate-pop`**: 當答對或獲得金幣時。
*   **`mode-dungeon`**: 啟動地牢模式的 Dark Theme Class。

## 5. 使用指南 (Usage)

1.  在專案中建立 `src/lib/idiom-toolkit` 資料夾。
2.  複製 `schema.ts` 到該目錄。
3.  使用此 Schema 建立 `data/idioms.ts` 種子資料庫。

## 6. 內容審核標準 (Content Audit Standards)

在新增任何成語資料時，必須嚴格遵守以下三點規範：

### 6.1 隱喻邏輯一致性 (Metaphor Integrity)
*   **規則**：`hook` (秒懂比喻) 與 `description` (詳細情境) 必須在邏輯上完全一致，不能有矛盾。
*   **❌ 錯誤示範**：hook 說「就像玩躲貓貓遮眼睛」，description 卻說「聲音還在只是你不想聽」。(躲貓貓是視覺遮蔽，非聽覺)
*   **✅ 正確示範**：hook 說「躲貓貓遮眼睛」，description 說「你自己看不見外面，就以為外面也看不見你」。(統一為視覺邏輯)

### 6.2 包容性與去歧視 (Inclusivity)
*   **規則**：禁止使用任何涉及年齡、性別、職業、種族的刻板印象。
*   **❌ 錯誤示範**：「跟阿嬤解釋區塊鏈，她只會問你吃飽沒。」(年齡歧視)
*   **✅ 正確示範**：「跟剛出生的嬰兒解釋微積分，他只會覺得你在唱歌。」(發展心理學事實，非歧視)

### 6.3 兒童友善 (Child-Friendly)
*   **規則**：用語必須符合 **10-12 歲** 兒童的生活經驗 (如：考試、玩遊戲、與父母互動)。
*   **避免**：過於成人的職場比喻 (如：KPI、裁員) 或複雜的政治比喻。
