
'use client';

import React from 'react';
import {
    submitToLeaderboard,
    getDeviceId,
} from '@/lib/idiom-toolkit/utils/leaderboardService';
import { floors, idioms } from '@/lib/idiom-toolkit/data/idioms';
import { getMasteredCount, isFloorCompleted } from '@/lib/idiom-toolkit/utils/progressManager';

interface SubmitModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SubmitLeaderboardModal({ isOpen, onClose }: SubmitModalProps) {
    const [nickname, setNickname] = React.useState('');
    const [submitting, setSubmitting] = React.useState(false);
    const [submitted, setSubmitted] = React.useState(false);
    const [error, setError] = React.useState('');

    if (!isOpen) return null;

    const masteredCount = getMasteredCount(idioms.map(i => i.id));
    const totalIdioms = idioms.length;
    const completedFloors = floors
        .filter(f => isFloorCompleted(f.idioms.map(i => i.id)))
        .map(f => f.meta.level);
    const artifactEmojis = floors
        .filter(f => isFloorCompleted(f.idioms.map(i => i.id)))
        .map(f => f.meta.reward.emoji);

    async function handleSubmit() {
        const trimmed = nickname.trim();
        if (!trimmed) {
            setError('請輸入你的稱號！');
            return;
        }
        if (trimmed.length < 2 || trimmed.length > 10) {
            setError('稱號需要 2~10 個字');
            return;
        }

        setSubmitting(true);
        setError('');
        try {
            await submitToLeaderboard({
                nickname: trimmed,
                masteredCount,
                totalIdioms,
                artifactCount: completedFloors.length,
                artifactEmojis,
                floorsCompleted: completedFloors,
                deviceId: getDeviceId(),
            });
            setSubmitted(true);
        } catch (e) {
            setError('提交失敗，請稍後再試。');
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    }

    // Success screen
    if (submitted) {
        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
                <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl" onClick={e => e.stopPropagation()}>
                    <div className="text-6xl mb-4 animate-bounce">🎉</div>
                    <h2 className="text-2xl font-black text-emerald-700 mb-2">提交成功！</h2>
                    <p className="text-slate-600 mb-2">
                        你的稱號 <span className="font-bold text-emerald-600">「{nickname.trim()}」</span> 已送出審核
                    </p>
                    <p className="text-slate-400 text-sm mb-6">
                        等待老師審核通過後，就能在排行榜上看到你了！
                    </p>
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors"
                    >
                        知道了！
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-black text-slate-800 mb-2 text-center">🏆 提交排行榜</h2>
                <p className="text-slate-500 text-sm text-center mb-6">
                    為自己取一個帥氣的稱號，送出後等待老師審核上榜！
                </p>

                {/* Preview */}
                <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-200">
                    <div className="flex justify-between items-center text-sm text-slate-600">
                        <span>📚 已習得</span>
                        <span className="font-bold">{masteredCount}/{totalIdioms} 成語</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-slate-600 mt-2">
                        <span>🏛️ 通關層數</span>
                        <span className="font-bold">{completedFloors.length} 層</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-slate-600 mt-2">
                        <span>🗡️ 神器</span>
                        <span className="font-bold text-lg">{artifactEmojis.length > 0 ? artifactEmojis.join(' ') : '尚無'}</span>
                    </div>
                </div>

                {/* Nickname Input */}
                <div className="mb-4">
                    <label className="block text-sm font-bold text-slate-600 mb-2">你的稱號</label>
                    <input
                        type="text"
                        value={nickname}
                        onChange={(e) => { setNickname(e.target.value); setError(''); }}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        placeholder="例如：成語大師小明"
                        maxLength={10}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-400 focus:outline-none text-slate-800 text-lg"
                        autoFocus
                    />
                    <p className="text-xs text-slate-400 mt-1">{nickname.length}/10 字（老師審核通過後才會上榜）</p>
                    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 border-2 border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !nickname.trim()}
                        className="flex-1 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {submitting ? '提交中...' : '🚀 提交'}
                    </button>
                </div>
            </div>
        </div>
    );
}
