---
name: Firebase_Storage_Adapter
description: 提供在 Next.js 專案中整合 Firebase Storage 的標準設定與操作流程，用於音訊與檔案託管。
version: 1.0.0
author: 筆芯老師 (Pen-Core)
tags: [Firebase, Cloud, Storage, Backend]
---

# Firebase_Storage_Adapter (雲端儲存適配器)

## 1. 技能描述 (Description)
此技能解決了教學網站中常見的「多媒體儲存」需求（如：學生朗讀錄音、老師語音評語）。它將 Firebase Storage 的複雜設定封裝成標準流程，確保檔案能安全上傳、永久保存且快速存取。

## 2. 環境變數規範 (.env.local)
所有使用此技能的專案，必須在 `.env.local` 與 Vercel 設定中包含以下變數：

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

## 3. 程式碼實作 (Implementation)

### 3.1 初始化 (`src/lib/firebase.ts`)
```typescript
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
```

### 3.2 權限規則 (Security Rules)
Firebase Console > Storage > Rules 必須設定為：
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /feedback/{allPaths=**} {
      allow read, write: if true; // 開發階段允許讀寫
    }
  }
}
```

## 4. 錯誤處理 (Error Handling)
*   **Quota Exceeded**: 監控免費額度，若超過需切換至 Blaze Plan。
*   **CORS**: 若遇到跨域問題，需在 Google Cloud Console 設定 CORS。
