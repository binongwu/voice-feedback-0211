# 508 Class Design System (508 綠野仙蹤風格)

這份文件定義了 `508寫作批改回饋` 網站的 UI/UX 設計規範。
未來的開發請嚴格遵守此風格，以保持視覺一致性。

## 1. 核心色彩 (Color Palette)

### 主色調 (Primary) - 翡翠綠
用於主要按鈕、強調文字、圖標背景。
- **Primary**: `bg-emerald-500` (錄音鈕、重要標示)
- **Primary Hover**: `hover:bg-emerald-600`
- **Primary Light**: `bg-emerald-50` (背景底色、次要按鈕底色)
- **Border**: `border-emerald-500` (強調邊框)

### 輔助色 (Secondary) - 檸檬綠/青色
用於區塊背景、裝飾性元素，創造清新感。
- **Avatar Background**: `bg-lime-100` (頭像區底色)
- **Gradient**: `from-emerald-400 to-teal-500` (大標題背景、漸層卡片)

### 中性色 (Neutral) - 岩灰
用於文字、邊框、非強調背景。
- **Text Main**: `text-slate-800` (標題、內文)
- **Text Muted**: `text-slate-500` / `text-slate-400` (次要資訊)
- **Background**: `bg-slate-50` (全站背景)
- **Border**: `border-slate-100` / `border-slate-200` (卡片邊框)

### 功能色 (Functional)
- **Delete/Danger**: `text-red-500`, `bg-red-50` (刪除按鈕)
- **Warning/Tips**: `bg-orange-50`, `text-orange-600` (提示框)

## 2. 元件設計 (Components)

### 卡片 (Cards)
- **容器**: `bg-white rounded-xl border border-slate-100 shadow-sm`
- **互動**: `hover:shadow-md transition-all duration-200`
- **極簡風格**: 移除不必要的 Padding，使用緊湊佈局。

### 按鈕 (Buttons)
- **主要按鈕 (Solid)**: 
  - `bg-emerald-500 text-white rounded-lg font-bold shadow-md`
  - `hover:scale-105 active:scale-95` (微動畫)
- **次要按鈕 (Outline)**:
  - `bg-white text-emerald-600 border-2 border-emerald-500`
  - `hover:bg-emerald-500 hover:text-white`
- **圖標按鈕 (Icon Only)**:
  - `p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50`

### 裝飾元素 (Visuals)
- **點狀紋理 (Dot Pattern)**: 在卡片頭部或背景使用 `pattern-dots` (需配合 CSS)。
- **可愛動物 (Cute Animals)**: 使用 Emoji 作為預設頭像，增加親和力。
- **圓角 (Radius)**: 統一使用 `rounded-xl` 或 `rounded-2xl`，避免直角。

## 3. 版面佈局 (Layout)
- **高密度網格**: 老師儀表板使用 `grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6`，最大化資訊密度。
- **最大寬度**: `max-w-[1600px]` (Dashboard), `max-w-lg` (Mobile/Detail View).

## 4. 互動體驗 (Interaction)
- **回饋感**: 所有可點擊元素必須有 `hover` 變色或 `scale` 縮放效果。
- **無縫體驗**: 使用 `localStorage` 作為輕量級資料暫存，減少非必要的後端請求。
