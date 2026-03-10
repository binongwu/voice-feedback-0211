---
name: Morandi_UI_System
description: 提供一套標準的「莫蘭迪綠」配色方案與 UI 設計系統，包含色彩變數、陰影、圓角與微動畫配置。
version: 1.0.0
author: 筆芯老師 (Pen-Core)
tags: [UI, Design, CSS, Tailwind]
---

# Morandi_UI_System (莫蘭迪 UI 系統)

## 1. 技能描述 (Description)
此技能定義了筆芯老師系列網站的**視覺識別 (Visual Identity)**。它不是一個元件庫，而是一套**設計語言 (Design Language)**，確保所有網站都擁有統一的「溫暖、專業、清新」質感。

## 2. 核心色票 (Color Palette)

### 根基色彩 (Variables in globals.css)
*   **Background**: `#f0fdf4` (極淺綠，像早晨的霧氣，不刺眼)
*   **Foreground**: `#111827` (深灰黑，閱讀舒適)
*   **Primary**: `#10b981` (Emerald-500，主色調，象徵生長與希望)
*   **Secondary**: `#fb923c` (Orange-400，輔助色，用於強調與溫暖點綴)
*   **Accent**: `#dcfce7` (Green-100，裝飾色，用於卡片背景或大區塊)
*   **Radius**: `1rem` (圓角半徑，統一使用較大圓角，增加親和力)

## 3. 實作指南 (Implementation Guide)

### 3.1 CSS 變數定義
將以下內容寫入 `src/app/globals.css`：

```css
@layer base {
  :root {
    --background: #f0fdf4;
    --foreground: #111827;
    --primary: #10b981;
    --primary-foreground: #ffffff;
    --secondary: #fb923c;
    --accent: #dcfce7;
    --radius: 1rem;
  }
}
```

### 3.2 互動效果 (Micro-Interactions)
為了增加網站的「生命力」，這套系統包含幾個標準動畫：

*   **Pulse Ring (呼吸光環)**：用於錄音按鈕或重點提示。
*   **Float (懸浮)**：用於卡片 Hover 效果，使其看起來輕盈。
*   **Wave (聲波)**：用於語音播放時的視覺回饋。

#### Keyframes 定義：
```css
@keyframes pulse-ring {
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.15); opacity: 0.4; }
  100% { transform: scale(1); opacity: 0.8; }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
```

## 4. 使用時機 (Usage)
*   當需要建立新網站的 `globals.css` 時。
*   當需要統一多個網站的視覺風格時。
*   當 UI 過於生硬，需要加入「莫蘭迪」質感時。
