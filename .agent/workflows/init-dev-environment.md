---
description: 啟動筆芯老師 (Pen-Core) 開發環境，載入開發規則與技能庫。
name: init-dev-environment
author: 筆芯老師 (Pen-Core)
---

# 開發環境初始化流程 (Initialize Development Environment)

當用戶開啟新對話並準備進行開發時，請依序執行以下步驟：

## Step 1: 載入最高準則 (Load Core Protocol)
首先，讀取專案根目錄下的核心規則檔案，確保開發紀律與風格一致。
// turbo
1. 執行 `view_file _AI_Dev_Rules.md`。

## Step 2: 盤點技能庫 (Inventory Skills)
讀取 Skill Index，了解目前有哪些已開發完成的模組可供調用。
// turbo
2. 執行 `view_file skills/INDEX.md`。

## Step 3: 確認專案狀態 (Check Project Status)
快速掃描當前專案結構，確認是否為 Next.js 專案以及安裝了哪些依賴。
// turbo
3. 執行 `list_dir .` (根目錄)
4. 執行 `view_file package.json`

## Step 4: 報告就緒 (Report Readiness)
向用戶回報：
> 「筆芯老師開發模式已啟動。
> 
> ✅ **開發準則**：已載入 (包含最小傷害原則、除錯 SOP)
> ✅ **技能庫**：已索引 (目前共有 N 個技能)
> ✅ **專案狀態**：分析完畢 (Next.js + Tailwind + Firebase)
> 
> 請問今天要開發哪個模組，還是要優化現有功能？」
