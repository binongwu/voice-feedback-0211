
'use client';

import Link from 'next/link';
import React from 'react';
import { floors, idioms } from '@/lib/idiom-toolkit/data/idioms';
import { getMasteredCount, isFloorCompleted, resetProgress } from '@/lib/idiom-toolkit/utils/progressManager';
import SubmitLeaderboardModal from './components/SubmitLeaderboardModal';

export default function IdiomDungeonPage() {
    const [mounted, setMounted] = React.useState(false);
    const [masteredCount, setMasteredCount] = React.useState(0);
    const [artifactCount, setArtifactCount] = React.useState(0);
    const [showSubmitModal, setShowSubmitModal] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
        setMasteredCount(getMasteredCount(idioms.map(i => i.id)));
        const artifacts = floors.filter(f => isFloorCompleted(f.idioms.map(i => i.id))).length;
        setArtifactCount(artifacts);
    }, []);

    const totalIdioms = idioms.length;
    const totalFloors = floors.length;

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -mr-32 -mt-32 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl -ml-32 -mb-32 animate-pulse"></div>

            <h1 className="text-4xl md:text-7xl font-black mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 animate-pulse drop-shadow-lg z-10">
                成語地牢：字魔之塔
            </h1>
            <p className="text-xl text-slate-400 mb-4 max-w-2xl text-center font-light z-10">
                每一層修煉，都是通往更深層智慧的鑰匙。
            </p>

            {/* Overall Progress */}
            {mounted && (
                <div className="w-full max-w-md z-10 mb-4">
                    <div className="flex justify-between text-sm text-slate-500 mb-2 font-medium">
                        <span>總修煉進度</span>
                        <span>{masteredCount}/{totalIdioms} 成語已習得</span>
                    </div>
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-1000 ease-out rounded-full"
                            style={{ width: `${(masteredCount / totalIdioms) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Artifact Summary */}
            {mounted && (
                <div className="z-10 mb-12 flex items-center gap-3 text-sm">
                    <span className="text-slate-500">神器已收集：</span>
                    <div className="flex gap-2">
                        {floors.map(f => {
                            const completed = isFloorCompleted(f.idioms.map(i => i.id));
                            return (
                                <span
                                    key={f.meta.reward.id}
                                    className={`text-2xl transition-all ${completed ? 'opacity-100 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'opacity-30 grayscale'}`}
                                    title={completed ? f.meta.reward.name : '???'}
                                >
                                    {completed ? f.meta.reward.emoji : '❓'}
                                </span>
                            );
                        })}
                    </div>
                    <span className="text-amber-400 font-bold">{artifactCount}/{totalFloors}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl z-10">
                {/* Entrance 1: Sanctuary */}
                <Link href="/idiom-dungeon/sanctuary" className="group relative block p-8 bg-slate-800/80 backdrop-blur-sm rounded-3xl border border-slate-700 hover:border-emerald-400 transition-all duration-300 hover:shadow-[0_0_50px_rgba(52,211,153,0.3)] transform hover:-translate-y-2 overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity transform group-hover:scale-110 duration-500">
                        <span className="text-8xl">🏛️</span>
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-4xl font-bold text-emerald-400 mb-2 group-hover:text-emerald-300 transition-colors">
                            聖殿修煉
                        </h2>
                        <p className="text-emerald-600/80 font-bold uppercase tracking-widest text-sm mb-6">
                            Learning Mode
                        </p>
                        <ul className="space-y-3 text-slate-300 font-medium">
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3 shadow-[0_0_10px_currentColor]"></span>
                                閱讀成語典故與生活隱喻
                            </li>
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3 shadow-[0_0_10px_currentColor]"></span>
                                逐層解鎖，收集神器
                            </li>
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3 shadow-[0_0_10px_currentColor]"></span>
                                每層通關後即可挑戰該層地牢
                            </li>
                        </ul>
                        {mounted && (
                            <div className="mt-4 text-sm text-slate-500">
                                已習得 {masteredCount}/{totalIdioms} 個成語 · {artifactCount} 件神器
                            </div>
                        )}
                    </div>
                </Link>

                {/* Entrance 2: Dungeon (info card — actual dungeon entries are per-floor in sanctuary) */}
                <div className="group relative block p-8 bg-slate-800/80 backdrop-blur-sm rounded-3xl border border-slate-700 overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <span className="text-8xl">🔥</span>
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-4xl font-bold text-rose-500 mb-2">
                            地牢試煉
                        </h2>
                        <p className="text-rose-600/80 font-bold uppercase tracking-widest text-sm mb-6">
                            Challenge Mode
                        </p>
                        <ul className="space-y-3 text-slate-300 font-medium">
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-rose-500 rounded-full mr-3 shadow-[0_0_10px_currentColor]"></span>
                                限時成語戰鬥 (Timer Battle)
                            </li>
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-rose-500 rounded-full mr-3 shadow-[0_0_10px_currentColor]"></span>
                                使用神器增強戰力
                            </li>
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-rose-500 rounded-full mr-3 shadow-[0_0_10px_currentColor]"></span>
                                每層有專屬地牢 BOSS
                            </li>
                        </ul>
                        <div className="mt-6 p-3 bg-slate-700/50 rounded-xl border border-slate-600 text-center">
                            <p className="text-amber-400 font-bold text-sm">💡 在聖殿中完成每層修煉後，即可進入該層地牢</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-10 z-10 flex-wrap justify-center">
                <Link
                    href="/idiom-dungeon/leaderboard"
                    className="px-6 py-3 bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold rounded-xl hover:bg-amber-500/30 transition-colors"
                >
                    🏆 排行榜
                </Link>
                {mounted && masteredCount > 0 && (
                    <button
                        onClick={() => setShowSubmitModal(true)}
                        className="px-6 py-3 bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-bold rounded-xl hover:bg-emerald-500/30 transition-colors"
                    >
                        🚀 提交成績上榜
                    </button>
                )}
            </div>

            {/* Submit Modal */}
            <SubmitLeaderboardModal
                isOpen={showSubmitModal}
                onClose={() => setShowSubmitModal(false)}
            />

            {/* Debug: Reset Progress */}
            <button
                onClick={() => { resetProgress(); window.location.reload(); }}
                className="mt-8 text-slate-700 hover:text-slate-400 text-xs font-mono transition-colors z-10"
            >
                [DEV] Reset Progress
            </button>

            <div className="mt-4 text-slate-600 text-sm font-mono tracking-widest uppercase z-10">
                System Version 2.1.0 | {totalFloors} Floors · {totalIdioms} Idioms
            </div>
        </div>
    );
}
