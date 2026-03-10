/**
 * 向後相容層 (Backward Compatibility Facade)
 * 
 * 此檔案已重構，所有資料移至 floors/ 目錄。
 * 本檔案保留作為向後相容的入口，避免破壞現有的 import。
 * 
 * 新程式碼請直接從 './floors' 匯入：
 *   import { idioms, stories, texts, floors } from './floors';
 */
export { texts, stories, idioms, floors } from './floors';
export type { FloorData } from './floors';
