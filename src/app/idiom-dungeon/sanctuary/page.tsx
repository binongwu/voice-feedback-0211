
'use client';

import Link from 'next/link';
import React from 'react';
import { floors, idioms } from '@/lib/idiom-toolkit/data/idioms';
import { type Idiom, type FloorMeta, type ArtifactReward } from '@/lib/idiom-toolkit/schema';
import {
    getIdiomProgress,
    getMasteredCount,
    isFloorUnlocked,
    isFloorCompleted,
} from '@/lib/idiom-toolkit/utils/progressManager';

// ==========================================
// Color mapping (must be static strings for Tailwind JIT)
// ==========================================
const colorMap: Record<string, {
    border: string; hoverBorder: string; bg: string; text: string;
    heading: string; progressBg: string; progressFill: string;
    lockBg: string; lockBorder: string;
}> = {
    emerald: { border: 'border-emerald-100', hoverBorder: 'hover:border-emerald-400', bg: 'bg-emerald-50', text: 'text-emerald-900', heading: 'text-emerald-700', progressBg: 'bg-emerald-100', progressFill: 'bg-emerald-500', lockBg: 'bg-emerald-50/30', lockBorder: 'border-emerald-200' },
    indigo: { border: 'border-indigo-100', hoverBorder: 'hover:border-indigo-400', bg: 'bg-indigo-50', text: 'text-indigo-900', heading: 'text-indigo-700', progressBg: 'bg-indigo-100', progressFill: 'bg-indigo-500', lockBg: 'bg-indigo-50/30', lockBorder: 'border-indigo-200' },
    rose: { border: 'border-rose-100', hoverBorder: 'hover:border-rose-400', bg: 'bg-rose-50', text: 'text-rose-900', heading: 'text-rose-700', progressBg: 'bg-rose-100', progressFill: 'bg-rose-500', lockBg: 'bg-rose-50/30', lockBorder: 'border-rose-200' },
    amber: { border: 'border-amber-100', hoverBorder: 'hover:border-amber-400', bg: 'bg-amber-50', text: 'text-amber-900', heading: 'text-amber-700', progressBg: 'bg-amber-100', progressFill: 'bg-amber-500', lockBg: 'bg-amber-50/30', lockBorder: 'border-amber-200' },
    violet: { border: 'border-violet-100', hoverBorder: 'hover:border-violet-400', bg: 'bg-violet-50', text: 'text-violet-900', heading: 'text-violet-700', progressBg: 'bg-violet-100', progressFill: 'bg-violet-500', lockBg: 'bg-violet-50/30', lockBorder: 'border-violet-200' },
};

export default function SanctuaryPage() {
    const [mounted, setMounted] = React.useState(false);
    const [progress, setProgress] = React.useState<Record<string, boolean>>({});

    React.useEffect(() => {
        setMounted(true);
        const map: Record<string, boolean> = {};
        idioms.forEach(i => {
            map[i.id] = getIdiomProgress(i.id).mastered;
        });
        setProgress(map);
    }, []);

    // Build floor → idiomIds map for unlock checks
    const floorIdiomIds = React.useMemo(() => {
        const map = new Map<number, string[]>();
        floors.forEach(f => {
            map.set(f.meta.level, f.idioms.map(i => i.id));
        });
        return map;
    }, []);

    // ==========================================
    // Idiom Card (unlocked)
    // ==========================================
    const renderCard = (idiom: Idiom, floorColor: string) => {
        const mastered = mounted && progress[idiom.id];
        const colors = colorMap[floorColor] || colorMap.emerald;
        return (
            <Link
                key={idiom.id}
                href={`/idiom-dungeon/sanctuary/${idiom.id}`}
                className={`group block bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border-2 p-6 relative overflow-hidden ${mastered
                    ? 'border-amber-400 bg-amber-50/30'
                    : `${colors.border} ${colors.hoverBorder}`
                    }`}
            >
                {mastered && (
                    <div className="absolute top-3 right-3 bg-amber-400 text-white text-xs font-black px-3 py-1 rounded-full shadow-md">
                        ✅ 已習得
                    </div>
                )}
                <div className="flex justify-between items-start mb-4">
                    <h3 className={`text-2xl font-bold transition-colors ${mastered ? 'text-amber-700' : 'text-slate-800'}`}>
                        {idiom.term}
                    </h3>
                    <span className={`text-3xl transition-all ${mastered ? 'opacity-100' : 'opacity-50 group-hover:opacity-100 group-hover:scale-110'}`}>
                        {mastered ? '🏅' : '📜'}
                    </span>
                </div>
                <div className={`rounded-lg p-4 mb-4 ${mastered ? 'bg-amber-50' : colors.bg}`}>
                    <p className={`font-medium ${mastered ? 'text-amber-900' : colors.text}`}>
                        {idiom.metaphor.hook}
                    </p>
                </div>
                <div className="flex justify-between items-center text-sm text-slate-400">
                    <span>Lv.{idiom.level}</span>
                    <span className="group-hover:translate-x-1 transition-transform">
                        {mastered ? '再次複習 →' : '點擊學習 →'}
                    </span>
                </div>
            </Link>
        );
    };

    // ==========================================
    // Locked Idiom Card (greyed out, no link)
    // ==========================================
    const renderLockedCard = (idiom: Idiom) => (
        <div
            key={idiom.id}
            className="block bg-slate-100/80 rounded-xl border-2 border-slate-200 p-6 relative overflow-hidden opacity-60 cursor-not-allowed"
        >
            <div className="absolute top-3 right-3 text-2xl">🔒</div>
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-slate-400">
                    {idiom.term}
                </h3>
                <span className="text-3xl opacity-30">📜</span>
            </div>
            <div className="rounded-lg p-4 mb-4 bg-slate-50">
                <p className="font-medium text-slate-400">
                    完成上一層所有修煉後解鎖
                </p>
            </div>
            <div className="text-sm text-slate-300 text-right">🔒 尚未解鎖</div>
        </div>
    );

    // ==========================================
    // Reward Banner (shows when a floor is completed)
    // ==========================================
    const renderRewardBanner = (reward: ArtifactReward, completed: boolean, floorColor: string) => {
        const colors = colorMap[floorColor] || colorMap.emerald;
        if (completed) {
            return (
                <div className={`max-w-3xl mx-auto mb-6 p-4 rounded-xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 flex items-center gap-4 shadow-md`}>
                    <span className="text-4xl animate-bounce">{reward.emoji}</span>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="font-black text-amber-800 text-lg">🎉 神器獲得：{reward.name}</span>
                        </div>
                        <p className="text-amber-700 text-sm mt-1">{reward.description}</p>
                        <p className="text-amber-600 text-xs mt-1 font-mono">⚔️ 效果：{reward.effect}</p>
                    </div>
                </div>
            );
        }
        // Not yet earned — show as mystery
        return (
            <div className={`max-w-3xl mx-auto mb-6 p-4 rounded-xl border-2 ${colors.lockBorder} ${colors.lockBg} flex items-center gap-4`}>
                <span className="text-4xl opacity-40">❓</span>
                <div className="flex-1">
                    <span className="font-bold text-slate-500">通關獎勵：???</span>
                    <p className="text-slate-400 text-sm mt-1">完成本層所有成語修煉後獲得神秘武器！</p>
                </div>
            </div>
        );
    };

    // ==========================================
    // Floor Progress Bar
    // ==========================================
    const renderProgressBar = (floorIdioms: Idiom[], floorColor: string) => {
        if (!mounted) return null;
        const colors = colorMap[floorColor] || colorMap.emerald;
        const total = floorIdioms.length;
        const mastered = getMasteredCount(floorIdioms.map(i => i.id));
        const pct = Math.round((mastered / total) * 100);
        return (
            <div className="max-w-3xl mx-auto mb-6">
                <div className="flex justify-between text-sm text-slate-500 mb-1">
                    <span>修煉進度</span>
                    <span className="font-bold">{mastered}/{total} 已習得 ({pct}%)</span>
                </div>
                <div className={`w-full h-3 rounded-full ${colors.progressBg} overflow-hidden`}>
                    <div
                        className={`h-full rounded-full ${colors.progressFill} transition-all duration-700 ease-out`}
                        style={{ width: `${pct}%` }}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-fuchsia-50/50 text-slate-800 p-8">
            <header className="mb-12 text-center">
                <Link href="/idiom-dungeon" className="text-emerald-600 hover:text-emerald-700 font-bold mb-4 inline-block">
                    ← 返回大廳
                </Link>
                <h1 className="text-4xl font-bold text-emerald-800 mb-2">聖殿修煉</h1>
                <p className="text-slate-600 max-w-xl mx-auto">
                    完成每一層的修煉，獲得神器，解鎖下一層與地牢挑戰！
                </p>
            </header>

            {/* 已收集的神器欄 */}
            {mounted && (
                <div className="max-w-3xl mx-auto mb-12 p-5 rounded-2xl bg-white/80 border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-500 mb-3 tracking-widest uppercase">🗡️ 我的神器庫</h3>
                    <div className="flex gap-4 flex-wrap">
                        {floors.map(floor => {
                            const completed = isFloorCompleted(floor.idioms.map(i => i.id));
                            return (
                                <div
                                    key={floor.meta.reward.id}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${completed
                                        ? 'border-amber-300 bg-amber-50 shadow-sm'
                                        : 'border-slate-200 bg-slate-50 opacity-40'
                                        }`}
                                    title={completed ? `${floor.meta.reward.name}：${floor.meta.reward.effect}` : '尚未獲得'}
                                >
                                    <span className="text-2xl">{completed ? floor.meta.reward.emoji : '❓'}</span>
                                    <span className={`text-sm font-bold ${completed ? 'text-amber-800' : 'text-slate-400'}`}>
                                        {completed ? floor.meta.reward.name : '???'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 動態渲染所有樓層 */}
            {floors.map((floor) => {
                const colors = colorMap[floor.meta.colorClass] || colorMap.emerald;
                const unlocked = !mounted || isFloorUnlocked(floor.meta.level, floorIdiomIds);
                const completed = mounted && isFloorCompleted(floor.idioms.map(i => i.id));

                return (
                    <section key={floor.meta.level} className="mb-16">
                        {/* Floor Header */}
                        <h2 className={`text-2xl font-bold ${unlocked ? colors.heading : 'text-slate-400'} mb-2 text-center`}>
                            {unlocked ? floor.meta.emoji : '🔒'} 第{floor.meta.level}層：{floor.meta.name}
                        </h2>
                        <p className={`text-center text-sm mb-4 ${unlocked ? 'text-slate-500' : 'text-slate-400'}`}>
                            {unlocked ? floor.meta.description : '完成上一層修煉後解鎖此層'}
                        </p>

                        {/* Progress Bar (only for unlocked floors) */}
                        {unlocked && renderProgressBar(floor.idioms, floor.meta.colorClass)}

                        {/* Reward Banner */}
                        {unlocked && renderRewardBanner(floor.meta.reward, !!completed, floor.meta.colorClass)}

                        {/* Idiom Grid */}
                        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                            {unlocked
                                ? floor.idioms.map(idiom => renderCard(idiom, floor.meta.colorClass))
                                : floor.idioms.map(idiom => renderLockedCard(idiom))
                            }
                        </div>

                        {/* Per-floor Dungeon Entrance */}
                        {unlocked && completed && (
                            <div className="max-w-3xl mx-auto mt-6 text-center">
                                <Link
                                    href={`/idiom-dungeon/dungeon?floor=${floor.meta.level}`}
                                    className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-black rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-lg"
                                >
                                    ⚔️ 挑戰第{floor.meta.level}層地牢
                                </Link>
                            </div>
                        )}
                    </section>
                );
            })}
        </div>
    );
}
