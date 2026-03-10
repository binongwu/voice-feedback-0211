---
# Project Development Rules (專案開發最高準則)
**Status:** Critical | **Focus:** Stability & Precision

## 0. 開發啟動程序 (Initialization Protocol)
*   **[強制掃描 Mandatory Scan]**：
    - 在每個新對話的**第一回合**，必須優先執行 `.agent/workflows/init-dev-environment.md`。
    - 檢查 `skills/INDEX.md` 以確認當前可用的技能庫狀態。

## 1. 核心鐵律：最小傷害原則 (Do No Harm)
* **[範圍隔離 Scope Isolation]**：
  - 修改 Bug 時，**僅限於**操作與該 Bug 直接相關的變數或函式。
  - **嚴禁**順手優化、重構、或為了美觀而調整其他運作正常的程式碼。
* **[完整性保護 Integrity]**：
  - 除非我明確要求「重寫整個檔案」，否則請優先提供修改片段（Diff）。
  - 禁止在未經確認的情況下刪除舊有的註解或備份程式碼。

## 2. 除錯標準程序 (Debugging SOP) - 針對重複錯誤
當我指出某個 Bug **重複出現**或**修復無效**時，請強制執行以下步驟：
1. **Stop (停)**：立刻停止輸出任何程式碼。
2. **Analyze (想)**：
   - **[多面向檢查]**：在下定論前，請務必掃描以下三個層面：
     A. **資料層 (Data)**：資料格式、API 回傳值、變數型別是否正確？
     B. **狀態層 (State)**：UI 狀態 (State/Store) 是否與資料同步？有無 Race Condition？
     C. **邏輯層 (Logic)**：流程控制 (if/else, loops) 是否有漏洞？
   - **[回溯檢討]**：上次修改失敗，是因為我忽略了上述哪一層？
3. **Confirm (問)**：用文字解釋你發現的根本原因 (Root Cause)，並提出新的解決方案邏輯，**等我確認後**再寫 Code。

## 3. 溝通與輸出格式 (Output Protocol)
* **[Diff 優先]**：修改建議請優先展示 原本的寫法 vs 修改後的寫法 的對照。
* **[檔案指引]**：請務必在程式碼區塊上方標註清楚：`filepath/filename.ext`。
* **[指令關鍵字]**：
  - 當我說 **「遵守規則」** 時，請重新讀取此檔案並檢查你的輸出是否違規。
  - 當我說 **「執行 SOP」** 時，請立即啟動第 2 點的除錯流程。

---
