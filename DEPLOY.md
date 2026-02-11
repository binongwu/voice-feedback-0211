# 作文語音批改系統 - Firebase 部署指南

本系統已從 Cloudflare R2 改為使用 **Firebase Storage**，更方便設定與使用。

## 1. 建立 Firebase 專案

1.  前往 [Firebase Console](https://console.firebase.google.com/)。
2.  點擊 **建立專案** (Add project)。
3.  輸入專案名稱，例如 `voice-feedback`。
4.  Google Analytics 可以選擇不啟用。
5.  建立完成後，點擊進入專案。

## 2. 啟用 Storage (儲存空間)

1.  在左側選單選擇 **Build** -> **Storage**。
2.  點擊 **Get started**。
3.  選擇 **Production mode** 或 **Test mode** (都沒關係，我們稍後會改規則)。
4.  選擇地理位置 (Asia-East1 台灣 或 Asia-Northeast1 東京 速度較快)。
5.  完成啟用。

## 3. 設定權限 (Security Rules)

為了讓學生能聽到錄音，也讓老師能上傳，我們需要設定規則。
**注意**：此設定為了方便使用，設為公開。請小心不要洩漏您的 API Key 以外的敏感資訊。

1.  在 Storage 頁面，點擊 **Rules** 標籤。
2.  將規則修改如下，然後點擊 **Publish**：

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /feedback/{allPaths=**} {
      // 允許任何人讀取和寫入
      allow read, write: if true;
    }
  }
}
```

## 4. 取得設定參數

1.  點擊左上角的 **Project Overview** 旁的齒輪圖示 -> **Project settings**。
2.  捲動到最底下的 **Your apps** 區域。
3.  點擊 **</> (Web)** 圖示來新增一個 Web App。
4.  輸入 App 名稱，不用勾選 Hosting。
5.  註冊後，你會看到一段程式碼 `const firebaseConfig = { ... }`。
6.  請將這裡面的值，填入您的環境變數檔案 `.env.local` (參考 `.env.example`)。

需填入的變數包括：
*   `NEXT_PUBLIC_FIREBASE_API_KEY`
*   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
*   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
*   `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` (注意：通常是 `您的專案ID.firebasestorage.app`)
*   `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
*   `NEXT_PUBLIC_FIREBASE_APP_ID`

## 5. 部署到 Vercel (網路發布)

1.  將程式碼上傳到 GitHub。
2.  在 Vercel 新增專案，並將上述所有環境變數都填入 Vercel 的 Environment Variables 設定中。
3.  Deploy!
4.  部署成功後，將 Vercel 給您的網址 (`https://xxx.vercel.app`) 填回 `.env.local` 和 Vercel 環境變數中的 `NEXT_PUBLIC_BASE_URL`，這樣 QR Code 才會指向正確網址。
