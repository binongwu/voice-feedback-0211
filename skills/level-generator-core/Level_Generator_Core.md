---
name: Level_Generator_Core
description: 依據測驗學原理設計的題庫生成邏輯，涵蓋素養導向命題原則與誘答項(Distractor)設計標準。
version: 1.0.0
author: 筆芯老師 (Pen-Core)
tags: [Education, Quiz, Logic, Algorithm]
---

# Level_Generator_Core (題庫生成核心)

## 1. 技能描述 (Description)
本技能旨在轉化傳統的「出題」為程式化的「生成」。依據教育測驗學原理，自動產生素養導向的題目，並透過演算法確保誘答項 (Distractor) 的品質，避免一眼假或模稜兩可的情況。

## 2. 命題原則 (Design Principles)

### 2.1 素養導向 (Competence-Based)
*   **情境優先**：題目應描述真實生活情境或具體故事，而非單純詢問「...的意思是什麼？」。
    *   *Bad*: 「畫蛇添足」的意思是？
    *   *Good*: 小明考試已經寫滿分了，還硬要加分題結果扣分。這可以用哪個成語形容？
*   **單一觀念 (Single Concept)**：每題只測驗一個核心成語，避免多重變數干擾。

### 2.2 誘答項設計標準 (Distractor Standards)
*   **似真性 (Plausibility)**：錯誤選項必須看起來「像是對的」。
    *   *Rule*: 選項詞性必須一致 (都是動詞、都是名詞、或都是四字成語)。
    *   *Rule*: 避免使用不存在的成語 (除非是克漏字題型的字形混淆)。
*   **互斥性 (Mutually Exclusive)**：正確答案必須是**唯一**且**絕對**正確的。
*   **長度一致 (Length Consistency)**：所有選項的字數應盡量相同，避免透過長度猜題。
*   **隨機分佈 (Random Distribution)**：正確答案的位置 (A/B/C/D) 必須完全隨機，不可固定。

## 3. 生成演算法 (Generation Algorithms)

### 3.1 題型 A: 成語填空 (Fill-in-the-Blank)
*   **目標**：測驗字形辨識與成語結構。
*   **邏輯**：
    1.  輸入成語 `畫蛇添足`。
    2.  隨機挖空 `畫蛇添_`。
    3.  **正確答案**：`足`。
    4.  **誘答項生成**：從 `CommonCharPool` (常見字庫) 或 `TopicRelatedPool` (動物/身體部位) 中選取 3 個字。
    *   *進階技巧*: 使用 **形近字** 或 **音近字** 作為誘答項 (e.g. 畫蛇添`腳`)。

### 3.2 題型 B: 情境判斷 (Scenario Judgment)
*   **目標**：測驗語意理解與應用。
*   **邏輯**：
    1.  輸入成語 `畫蛇添足`，讀取其 `quiz.question`。
    2.  **正確答案**：`畫蛇添足`。
    3.  **誘答項生成**：從成語資料庫中，隨機選取 3 個**不同**的成語作為選項。
    *   *進階技巧*: 優先選取與正確答案 **意思相反** 或 **領域相關** 的成語 (e.g. `畫龍點睛` vs `畫蛇添足`)，增加鑑別度。

## 4. 實作規範 (Implementation Guide)

在 `src/lib/idiom-toolkit/utils/dungeonGenerator.ts` 中實作以下介面：

```typescript
interface QuestionGeneratorConfig {
  count: number;          // 題目數量
  types: ('fill-in' | 'scenario')[]; // 混合題型
  difficulty: 1 | 2 | 3;  // 難度係數 (影響誘答項的相似度)
}

function generateQuestions(pool: Idiom[], config: QuestionGeneratorConfig): BattleQuestion[] {
  // 1. Shuffle Pool (Fisher-Yates)
  // 2. Select Candidates
  // 3. For each candidate:
  //    a. Generate Question Text
  //    b. Generate Distractors (ensure exclusivity)
  //    c. Combine & Shuffle Options
  //    d. Record Correct Answer
  // 4. Return Questions
}
```

## 5. 品質檢核表 (Quality Checklist)
- [ ] 題目是否包含至少 10 題？
- [ ] 選項是否重新洗牌 (Shuffle)？正確答案不固定在 A？
- [ ] 誘答項是否與正確答案詞性一致？
- [ ] 是否有重複出現同一題？(如果是，是否為刻意複習？)
