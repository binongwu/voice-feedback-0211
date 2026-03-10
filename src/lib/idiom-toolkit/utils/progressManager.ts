
// 學習進度管理器 (使用 localStorage)
// Key: 'idiom-dungeon-progress'
// Value: { [idiomId: string]: { mastered: boolean, practiceScore: number } }

const STORAGE_KEY = 'idiom-dungeon-progress';

export interface IdiomProgress {
    mastered: boolean;       // 是否已通過閱讀測驗 (3/3)
    practiceScore: number;   // 正確題數 (0-3)
    speakingStars: number;   // 口說星等 (0-5)
}

export type ProgressMap = Record<string, IdiomProgress>;

// 讀取全部進度
export function getProgress(): ProgressMap {
    if (typeof window === 'undefined') return {};
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

// 讀取單一成語進度
export function getIdiomProgress(idiomId: string): IdiomProgress {
    const all = getProgress();
    return all[idiomId] || { mastered: false, practiceScore: 0, speakingStars: 0 };
}

// 更新單一成語進度
export function saveIdiomProgress(idiomId: string, progress: Partial<IdiomProgress>) {
    const all = getProgress();
    const current = all[idiomId] || { mastered: false, practiceScore: 0, speakingStars: 0 };
    all[idiomId] = { ...current, ...progress };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

// 標記成語為已習得
export function markAsMastered(idiomId: string, score: number) {
    saveIdiomProgress(idiomId, { mastered: score >= 3, practiceScore: score });
}

// 檢查是否所有成語都已習得
export function isAllMastered(idiomIds: string[]): boolean {
    const all = getProgress();
    return idiomIds.every(id => all[id]?.mastered === true);
}

// 取得已習得數量
export function getMasteredCount(idiomIds: string[]): number {
    const all = getProgress();
    return idiomIds.filter(id => all[id]?.mastered === true).length;
}

// 清除所有進度 (Debug 用)
export function resetProgress() {
    localStorage.removeItem(STORAGE_KEY);
}

// 檢查某一層是否已解鎖
// 規則：第1層永遠解鎖；第N層需要第N-1層全部成語 mastered
export function isFloorUnlocked(floorLevel: number, floorIdiomIds: Map<number, string[]>): boolean {
    if (floorLevel <= 1) return true;
    const prevIds = floorIdiomIds.get(floorLevel - 1);
    if (!prevIds) return false;
    return isAllMastered(prevIds);
}

// 檢查某一層是否已完成 (全部成語 mastered)
export function isFloorCompleted(idiomIds: string[]): boolean {
    return isAllMastered(idiomIds);
}

// 取得所有已獲得的神器 ID (已完成的層的 reward)
export function getCompletedFloorLevels(): number[] {
    // 由外部呼叫者搭配 floors 數據使用
    // 此函式只回傳已完成的層級數字
    return [];  // placeholder - 實際邏輯在 UI 層使用 isFloorCompleted
}

