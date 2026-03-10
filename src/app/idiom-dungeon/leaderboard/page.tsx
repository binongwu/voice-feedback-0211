
'use client';

import Link from 'next/link';
import React from 'react';
import { getApprovedEntries, type LeaderboardEntry } from '@/lib/idiom-toolkit/utils/leaderboardService';

export default function LeaderboardPage() {
    const [entries, setEntries] = React.useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState('');

    React.useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            setLoading(true);
            const data = await getApprovedEntries();
            setEntries(data);
        } catch (e) {
            setError('載入排行榜失敗，請稍後再試。');
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    const getRankStyle = (idx: number) => {
        if (idx === 0) return { medal: '🥇', bg: 'bg-gradient-to-r from-amber-50 to-yellow-50', border: 'border-amber-300', text: 'text-amber-800' };
        if (idx === 1) return { medal: '🥈', bg: 'bg-gradient-to-r from-slate-50 to-gray-100', border: 'border-slate-300', text: 'text-slate-700' };
        if (idx === 2) return { medal: '🥉', bg: 'bg-gradient-to-r from-orange-50 to-amber-50', border: 'border-orange-300', text: 'text-orange-800' };
        return { medal: `#${idx + 1}`, bg: 'bg-white', border: 'border-slate-200', text: 'text-slate-700' };
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <header className="text-center mb-10">
                    <Link href="/idiom-dungeon" className="text-emerald-400 hover:text-emerald-300 font-bold mb-4 inline-block text-sm">
                        ← 返回大廳
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 mb-3">
                        🏆 挑戰者排行榜
                    </h1>
                    <p className="text-slate-400 text-lg">
                        成語地牢中最勇敢的冒險者們
                    </p>
                </header>

                {/* Loading */}
                {loading && (
                    <div className="text-center py-20">
                        <div className="text-4xl mb-4 animate-bounce">⏳</div>
                        <p className="text-slate-400">載入中...</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="text-center py-20">
                        <div className="text-4xl mb-4">⚠️</div>
                        <p className="text-red-400">{error}</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && entries.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🏜️</div>
                        <p className="text-slate-400 text-lg">還沒有人上榜！</p>
                        <p className="text-slate-500 text-sm mt-2">成為第一個提交成績的冒險者吧！</p>
                    </div>
                )}

                {/* Leaderboard Cards */}
                {!loading && !error && entries.length > 0 && (
                    <div className="space-y-4">
                        {entries.map((entry, idx) => {
                            const style = getRankStyle(idx);
                            return (
                                <div
                                    key={entry.id}
                                    className={`${style.bg} border-2 ${style.border} rounded-2xl p-5 flex items-center gap-5 shadow-sm transition-all hover:shadow-md`}
                                >
                                    {/* Rank */}
                                    <div className="text-3xl font-black w-12 text-center shrink-0">
                                        {typeof style.medal === 'string' && style.medal.startsWith('#')
                                            ? <span className="text-slate-400 text-xl">{style.medal}</span>
                                            : style.medal
                                        }
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`text-xl font-black ${style.text} truncate`}>
                                            {entry.nickname}
                                        </h3>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                                            <span>📚 {entry.masteredCount}/{entry.totalIdioms} 成語</span>
                                            <span>🏛️ {entry.floorsCompleted.length} 層通關</span>
                                        </div>
                                    </div>

                                    {/* Artifacts */}
                                    <div className="flex gap-1 shrink-0">
                                        {entry.artifactEmojis && entry.artifactEmojis.length > 0
                                            ? entry.artifactEmojis.map((emoji, i) => (
                                                <span key={i} className="text-2xl drop-shadow-md" title="已獲得神器">
                                                    {emoji}
                                                </span>
                                            ))
                                            : <span className="text-slate-300 text-sm">尚無神器</span>
                                        }
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Footer */}
                <div className="text-center mt-12 text-slate-600 text-xs">
                    排行榜每次提交需經老師審核後才會顯示
                </div>
            </div>
        </div>
    );
}
