# 508 Class Design System (Morandi Green Edition)

這份文件定義了 `508寫作批改回饋` 以及未來應用程式的設計規範。
核心理念：**知性、溫暖、質感** (Inspired by Morandi Green & Stone)。

## 1. 專案結構原則 (Structure)

未來的每一個新功能或網頁應用程式，都必須建立在 `src/app/` 底下的獨立資料夾中。
根目錄 `src/app/page.tsx` 僅作為入口大廳 (Hub)。

### 命名規範
- `src/app/writing-feedback/` : 寫作語音回饋系統 (目前專案)
- `src/app/[app-name]/` : 未來的新專案

## 2. 核心色彩 (Color Palette - Morandi)

我們捨棄了高飽和度的「科技綠」，改用低飽和度、帶有灰調的色彩，營造高級的閱讀體驗。

### 主色調 (Primary) - 鼠尾草綠 / 深青 (Teal/Sage)
用於主要按鈕、圖標、強調文字。
- **Primary**: `bg-teal-700` (Hex: #0F766E)
- **Primary Hover**: `hover:bg-teal-800`
- **Primary Light**: `bg-teal-50` (背景底色)
- **Accent**: `text-teal-600`

### 輔助色 (Secondary) - 暖石色 (Stone/Cream)
用於全站背景，取代刺眼的純白。
- **Page Background**: `bg-stone-50` (Hex: #FAFAF9) 或 `bg-[#FDFDF8]` (米白)
- **Card Background**: `bg-white` (搭配 Stone-100 邊框)
- **Text Main**: `text-stone-800` (深暖灰)
- **Text Muted**: `text-stone-500` / `text-stone-400`

### 強調色 (Accent) - 陶土紅 / 焦糖 (Terra Cotta)
用於刪除、錄音中、提示訊息。
- **Recording/Active**: `text-rose-600`, `bg-rose-50`
- **Warning/Tips**: `text-orange-600`, `bg-orange-50`

## 3. 元件設計 (Components)

### 卡片 (Cards)
- **質感**: 必須有細微的邊框 (`border-stone-100`) 與柔和陰影。
- **陰影**: `shadow-sm` 至 `shadow-xl` (但在 Hover 時才明顯)。
- **圓角**: `rounded-xl` 至 `rounded-3xl` (特別是 Modal 或大區塊)。

### 字體 (Typography)
- **標題**: 建議使用 `font-serif` (例如 Times 或 Noto Serif) 於大標題，增加書卷氣。
- **內文**: 使用 `font-sans` (Inter/System) 保持易讀性。

## 4. 互動體驗
- **按鈕**: 實心按鈕使用 `bg-teal-700`，文字為白。
- **錄音介面**: 錄音時使用「波紋動畫」與紅色/玫瑰色系提示。

---
**版本紀錄**:
- v1.0 (Emerald Clean): 初始翡翠綠風格。
- v2.0 (Morandi Green): 2026/02/12 更新，改為莫蘭迪色系與模組化資料夾結構。
