
/**
 * 排行榜服務 (Leaderboard Service)
 * 
 * Firestore Collection: 'leaderboard'
 * 流程：學生提交 (pending) → 老師審核 (approved/rejected) → 排行榜顯示 (approved only)
 */

import { db } from '@/lib/firebase';
import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore';

// ==========================================
// Types
// ==========================================
export type LeaderboardStatus = 'pending' | 'approved' | 'rejected';

export interface LeaderboardEntry {
    id?: string;                // Firestore doc ID (read-only)
    nickname: string;           // 學生自取暱稱
    status: LeaderboardStatus;
    masteredCount: number;      // 已習得成語數
    totalIdioms: number;        // 總成語數
    artifactCount: number;      // 已獲得神器數
    artifactEmojis: string[];   // 已獲得神器的 emoji 列表
    floorsCompleted: number[];  // 已完成的層級
    deviceId: string;           // 瀏覽器指紋 (防重複)
    submittedAt: Timestamp | null;
}

const COLLECTION = 'leaderboard';

// ==========================================
// Device ID (簡易瀏覽器指紋)
// ==========================================
export function getDeviceId(): string {
    if (typeof window === 'undefined') return '';
    const KEY = 'idiom-dungeon-device-id';
    let id = localStorage.getItem(KEY);
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(KEY, id);
    }
    return id;
}

// ==========================================
// 學生端：提交成績
// ==========================================
export async function submitToLeaderboard(entry: Omit<LeaderboardEntry, 'id' | 'status' | 'submittedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION), {
        ...entry,
        status: 'pending' as LeaderboardStatus,
        submittedAt: serverTimestamp(),
    });
    return docRef.id;
}

// ==========================================
// 公開：讀取已審核的排行榜
// ==========================================
export async function getApprovedEntries(): Promise<LeaderboardEntry[]> {
    const q = query(
        collection(db, COLLECTION),
        where('status', '==', 'approved'),
        orderBy('masteredCount', 'desc'),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as LeaderboardEntry));
}

// ==========================================
// 管理員：讀取待審核名單
// ==========================================
export async function getPendingEntries(): Promise<LeaderboardEntry[]> {
    const q = query(
        collection(db, COLLECTION),
        where('status', '==', 'pending'),
        orderBy('submittedAt', 'desc'),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as LeaderboardEntry));
}

// ==========================================
// 管理員：讀取全部名單 (含已審核、已拒絕)
// ==========================================
export async function getAllEntries(): Promise<LeaderboardEntry[]> {
    const q = query(
        collection(db, COLLECTION),
        orderBy('submittedAt', 'desc'),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as LeaderboardEntry));
}

// ==========================================
// 管理員：更新審核狀態
// ==========================================
export async function updateEntryStatus(docId: string, status: LeaderboardStatus): Promise<void> {
    const ref = doc(db, COLLECTION, docId);
    await updateDoc(ref, { status });
}

// ==========================================
// 管理員 PIN 驗證
// ==========================================
const ADMIN_PIN = '7683-';

export function verifyAdminPin(input: string): boolean {
    return input === ADMIN_PIN;
}
