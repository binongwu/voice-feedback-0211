---
name: NextJS_App_Base
description: 建立標準筆芯老師教學網站的 Next.js 基礎架構，包含 TypeScript、SEO 設定與目錄結構。
version: 1.0.0
author: 筆芯老師 (Pen-Core)
tags: [Next.js, Infrastructure, Scaffold]
---

# NextJS_App_Base (標準網站架構)

## 1. 技能描述 (Description)
此技能負責從零開始，快速搭建一個**符合筆芯老師開發規範**的 Next.js 應用程式。它確保了無論是「作文網」還是「英文網」，其底層結構都是一致的，方便未來的維護與擴充。

## 2. 核心架構 (Core Structure)

### 2.1 技術選型
*   **Framework**: Next.js (App Router)
*   **Language**: TypeScript (Strict Mode)
*   **Styling**: Tailwind CSS (with Morandi UI System)
*   **Deployment**: Vercel

### 2.2 目錄規範 (Directory Standard)
```text
src/
├── app/                  # App Router 頁面
│   ├── layout.tsx        # 全域佈局 (包含 Navbar/Footer)
│   ├── page.tsx          # 首頁
│   └── globals.css       # 全域樣式
├── components/           # 共用元件
│   ├── ui/               # 基礎 UI 元件 (Button, Card)
│   └── features/         # 功能性元件 (AudioPlayer, Recorder)
├── lib/                  # 工具函式與第三方串接 (Firebase, Utils)
└── types/                # 全域型別定義
```

## 3. SEO 與 Metadata 標準設定
每個網站都必須包含以下基礎 Metadata 設定 (`layout.tsx`)：

```typescript
export const metadata: Metadata = {
  title: {
    template: '%s | 筆芯老師教學網',
    default: '筆芯老師 - 專業語文教學',
  },
  description: '提供最專業的線上寫作指導與語音批改服務。',
  icons: {
    icon: '/favicon.ico',
  },
};
```

## 4. 啟用程序 (Activation)
1.  執行 `npx create-next-app@latest`。
2.  選擇 TypeScript, Tailwind, ESLint, src directory, App Router。
3.  清除預設樣式，套用 `Morandi_UI_System`。
4.  設定 `tsconfig.json` 的路徑別名 (BaseURL)。
