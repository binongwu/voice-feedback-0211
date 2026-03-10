/**
 * migrate-audio.mjs
 * Uses Firebase client SDK (no service account needed) to:
 * 1. List all .webm files in feedback/ folder
 * 2. Download each file
 * 3. Convert to .mp4 using ffmpeg
 * 4. Re-upload as .mp4
 *
 * Run: node migrate-audio.mjs
 */

import { initializeApp } from 'firebase/app';
import { getStorage, ref, listAll, getDownloadURL, uploadBytes, getMetadata } from 'firebase/storage';
import { execSync } from 'child_process';
import { mkdirSync, existsSync, writeFileSync, readFileSync, openSync, readSync, closeSync, unlinkSync } from 'fs';
import https from 'https';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

// ─── Firebase Config (from .env.local) ────────────────────────────────────────
const firebaseConfig = {
    apiKey: "AIzaSyBh7ovZy49-W_AXQ_cXHC0Jr-LsYtaIfpA",
    authDomain: "voice-feedback-0211.firebaseapp.com",
    projectId: "voice-feedback-0211",
    storageBucket: "voice-feedback-0211.firebasestorage.app",
    messagingSenderId: "771092514737",
    appId: "1:771092514737:web:ad5661a76c99b0958a9f90"
};

const TMP_DIR = path.join(process.cwd(), '_audio_tmp');
// ──────────────────────────────────────────────────────────────────────────────

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

function downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        const file = { data: [] };
        client.get(url, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
            }
            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => {
                const buf = Buffer.concat(chunks);
                writeFileSync(destPath, buf);
                resolve();
            });
            res.on('error', reject);
        }).on('error', reject);
    });
}

function detectIsMP4(filePath) {
    const buf = Buffer.alloc(12);
    const fd = openSync(filePath, 'r');
    readSync(fd, buf, 0, 12, 0);
    closeSync(fd);
    const sig = buf.toString('ascii', 4, 8);
    return sig === 'ftyp'; // MP4/M4A files have 'ftyp' at byte offset 4
}

async function main() {
    if (!existsSync(TMP_DIR)) mkdirSync(TMP_DIR, { recursive: true });

    // ffmpeg absolute path (winget install location)
    const FFMPEG = 'C:\\Users\\binon\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.0.1-full_build\\bin\\ffmpeg.exe';
    // Verify ffmpeg is available
    try {
        execSync(`"${FFMPEG}" -version`, { stdio: 'pipe' });
    } catch {
        console.error('❌ ffmpeg 找不到，路徑：' + FFMPEG);
        process.exit(1);
    }

    console.log('🔍 列出 Firebase Storage feedback/ 資料夾中的檔案...');
    const folderRef = ref(storage, 'feedback/');
    const listResult = await listAll(folderRef);

    const webmItems = listResult.items.filter(item => item.name.endsWith('.webm'));

    if (webmItems.length === 0) {
        console.log('✅ 沒有找到 .webm 檔案，無需遷移。');
        process.exit(0);
    }

    console.log(`📁 找到 ${webmItems.length} 個 .webm 檔案\n`);

    let converted = 0, skipped = 0, errors = 0;

    for (const item of webmItems) {
        const studentId = item.name.replace('.webm', '');
        const localWebm = path.join(TMP_DIR, item.name);
        const localMp4 = path.join(TMP_DIR, `${studentId}.mp4`);

        try {
            // 1. Download
            console.log(`⬇️  下載 feedback/${item.name} ...`);
            const url = await getDownloadURL(item);
            await downloadFile(url, localWebm);

            // 2. Detect actual format
            const isMp4Content = detectIsMP4(localWebm);
            const formatLabel = isMp4Content ? 'MP4 container（iPhone 錄製）' : 'WebM container（需轉碼）';
            console.log(`   格式偵測: ${formatLabel}`);

            // 3. Convert with ffmpeg
            let cmd;
            if (isMp4Content) {
                // Content is already MP4, just remux (fast, lossless)
                cmd = `"${FFMPEG}" -y -i "${localWebm}" -c copy "${localMp4}" -loglevel error`;
            } else {
                // True WebM/Opus → transcode to AAC inside MP4
                cmd = `"${FFMPEG}" -y -i "${localWebm}" -c:a aac -b:a 128k "${localMp4}" -loglevel error`;
            }
            console.log(`   執行 ffmpeg...`);
            execSync(cmd, { stdio: 'pipe' });

            if (!existsSync(localMp4)) throw new Error('ffmpeg 未產生輸出檔案');

            // 4. Upload as .mp4
            const mp4Buf = readFileSync(localMp4);
            const destRef = ref(storage, `feedback/${studentId}.mp4`);
            console.log(`   ⬆️  上傳 feedback/${studentId}.mp4 ...`);
            await uploadBytes(destRef, mp4Buf, {
                contentType: 'audio/mp4',
                cacheControl: 'public, max-age=0, must-revalidate',
            });

            // Cleanup temp files
            unlinkSync(localWebm);
            unlinkSync(localMp4);

            console.log(`   ✅ 完成: ${studentId}\n`);
            converted++;

        } catch (err) {
            console.error(`   ❌ 失敗 (${item.name}): ${err.message}\n`);
            errors++;
        }
    }

    console.log('═══════════════════════════════════');
    console.log(`✅ 遷移完成：${converted} 成功 ｜ ${errors} 失敗`);
    if (converted > 0) {
        console.log('\n⚠️  舊的 .webm 檔案仍存在 Storage，確認正常後請至 Firebase Console 手動刪除。');
    }
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
