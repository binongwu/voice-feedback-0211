/**
 * Floor Registry (樓層註冊表)
 * 
 * 擴充方式：
 * 1. 在 floors/ 目錄下新增 floor-N.ts (複製現有 floor 檔案作為模板)
 * 2. 在下方 import 並加入 allFloors 陣列
 * 3. 完成！UI 會自動渲染新樓層
 */

import { ClassicalText, Story, Idiom, FloorMeta } from '../../schema';
import * as floor1 from './floor-1';
import * as floor2 from './floor-2';
// import * as floor3 from './floor-3';  ← 未來新增只要加這一行

// ==========================================
// 註冊所有樓層 (新增樓層只需在此加一行)
// ==========================================
const allFloors = [floor1, floor2];

// ==========================================
// 聚合資料 (供外部直接使用)
// ==========================================
export const texts: ClassicalText[] = allFloors.flatMap(f => f.texts);
export const stories: Story[] = allFloors.flatMap(f => f.stories);
export const idioms: Idiom[] = allFloors.flatMap(f => f.idioms);

// ==========================================
// 樓層結構化資料 (供 UI 動態渲染)
// ==========================================
export interface FloorData {
    meta: FloorMeta;
    texts: ClassicalText[];
    stories: Story[];
    idioms: Idiom[];
}

export const floors: FloorData[] = allFloors.map(f => ({
    meta: f.floorMeta,
    texts: f.texts,
    stories: f.stories,
    idioms: f.idioms,
}));
