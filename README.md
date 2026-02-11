# 作文語音批改系統 (Voice Feedback System)

這是一個專為老師設計的作文語音批改系統。老師可以輕鬆錄製對學生的回饋，學生可以通過專屬 QR Code 即時收聽最新的批改錄音。

## 主要功能

*   **老師後台**：
    *   管理學生名單 (新增/刪除)
    *   快速錄製語音批改
    *   預覽錄音並直接上傳到 Cloudflare R2
    *   一鍵產生學生專屬 QR Code
*   **學生前台**：
    *   手機掃描 QR Code 直接收聽
    *   自動播放最新的回饋
    *   簡單直觀的播放介面
    *   支援各種裝置

## 技術架構

*   **前端**：Next.js (React), Tailwind CSS, Lucide Icons
*   **儲存**：**Firebase Storage** (免費額度大，設定簡單)
*   **部署**：Vercel


## 快速開始

1.  複製此專案。
2.  安裝依賴：`npm install`
3.  複製 `.env.example` 到 `.env.local` 並填入您的 Cloudflare R2 憑證。
4.  啟動開發伺服器：`npm run dev`

## 部署

詳細部署步驟請參見 [DEPLOY.md](DEPLOY.md)。
