
'use client';

import Link from 'next/link';
import React from 'react';
import {
    getAllEntries,
    updateEntryStatus,
    verifyAdminPin,
    type LeaderboardEntry,
    type LeaderboardStatus,
} from '@/lib/idiom-toolkit/utils/leaderboardService';

export default function LeaderboardAdminPage() {
    const [authenticated, setAuthenticated] = React.useState(false);
    const [pin, setPin] = React.useState('');
    const [pinError, setPinError] = React.useState('');
    const [entries, setEntries] = React.useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [updating, setUpdating] = React.useState<string | null>(null);
    const [filter, setFilter] = React.useState<LeaderboardStatus | 'all'>('pending');

    async function loadData() {
        setLoading(true);
        try {
            const data = await getAllEntries();
            setEntries(data);
        } catch (e) {
            console.error('Failed to load entries:', e);
        } finally {
            setLoading(false);
        }
    }

    function handleLogin() {
        if (verifyAdminPin(pin)) {
            setAuthenticated(true);
            setPinError('');
            loadData();
        } else {
            setPinError('密碼錯誤，請重試。');
        }
    }

    async function handleStatusChange(docId: string, newStatus: LeaderboardStatus) {
        setUpdating(docId);
        try {
            await updateEntryStatus(docId, newStatus);
            setEntries(prev =>
                prev.map(e => e.id === docId ? { ...e, status: newStatus } : e)
            );
        } catch (e) {
            console.error('Failed to update status:', e);
            alert('更新失敗，請重試。');
        } finally {
            setUpdating(null);
        }
    }

    const filteredEntries = filter === 'all'
        ? entries
        : entries.filter(e => e.status === filter);

    const statusLabel: Record<LeaderboardStatus, { text: string; color: string }> = {
        pending: { text: '⏳ 待審核', color: 'text-amber-600 bg-amber-50 border-amber-200' },
        approved: { text: '✅ 已核准', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
        rejected: { text: '❌ 已拒絕', color: 'text-red-600 bg-red-50 border-red-200' },
    };

    const counts = {
        pending: entries.filter(e => e.status === 'pending').length,
        approved: entries.filter(e => e.status === 'approved').length,
        rejected: entries.filter(e => e.status === 'rejected').length,
    };

    // ==========================================
    // PIN Login Screen
    // ==========================================
    if (!authenticated) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-8">
                <div className="w-full max-w-sm">
                    <div className="text-center mb-8">
                        <div className="text-5xl mb-4">🔐</div>
                        <h1 className="text-2xl font-black text-amber-400">管理員驗證</h1>
                        <p className="text-slate-400 text-sm mt-2">請輸入管理員密碼以進入審核頁面</p>
                    </div>
                    <div className="space-y-4">
                        <input
                            type="password"
                            value={pin}
                            onChange={(e) => { setPin(e.target.value); setPinError(''); }}
                            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                            placeholder="輸入密碼"
                            className="w-full px-4 py-3 rounded-xl bg-slate-800 border-2 border-slate-700 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none text-center text-lg tracking-widest"
                            autoFocus
                        />
                        {pinError && (
                            <p className="text-red-400 text-center text-sm">{pinError}</p>
                        )}
                        <button
                            onClick={handleLogin}
                            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black rounded-xl transition-colors"
                        >
                            登入
                        </button>
                    </div>
                    <div className="text-center mt-6">
                        <Link href="/idiom-dungeon" className="text-slate-500 hover:text-slate-300 text-sm">
                            ← 返回大廳
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // Admin Dashboard
    // ==========================================
    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <header className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800">📋 排行榜管理</h1>
                        <p className="text-slate-500 text-sm mt-1">審核學生提交的暱稱與成績</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/idiom-dungeon/leaderboard"
                            className="px-4 py-2 text-sm bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
                            查看公開排行榜
                        </Link>
                        <button
                            onClick={() => loadData()}
                            className="px-4 py-2 text-sm bg-slate-800 text-white rounded-lg hover:bg-slate-700"
                        >
                            🔄 重新載入
                        </button>
                    </div>
                </header>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                        <div className="text-3xl font-black text-amber-700">{counts.pending}</div>
                        <div className="text-sm text-amber-600 font-medium">待審核</div>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                        <div className="text-3xl font-black text-emerald-700">{counts.approved}</div>
                        <div className="text-sm text-emerald-600 font-medium">已核准</div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                        <div className="text-3xl font-black text-red-700">{counts.rejected}</div>
                        <div className="text-sm text-red-600 font-medium">已拒絕</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6">
                    {(['pending', 'approved', 'rejected', 'all'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === f
                                ? 'bg-slate-800 text-white'
                                : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-100'
                                }`}
                        >
                            {f === 'all' ? '全部' : f === 'pending' ? `⏳ 待審核 (${counts.pending})` : f === 'approved' ? `✅ 已核准` : `❌ 已拒絕`}
                        </button>
                    ))}
                </div>

                {/* Loading */}
                {loading && (
                    <div className="text-center py-12 text-slate-400">
                        <div className="text-3xl mb-2 animate-spin">⏳</div>
                        載入中...
                    </div>
                )}

                {/* Entry List */}
                {!loading && filteredEntries.length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                        <div className="text-4xl mb-2">📭</div>
                        目前沒有{filter === 'pending' ? '待審核' : filter === 'approved' ? '已核准' : filter === 'rejected' ? '已拒絕' : ''}的項目
                    </div>
                )}

                {!loading && filteredEntries.length > 0 && (
                    <div className="space-y-3">
                        {filteredEntries.map(entry => {
                            const st = statusLabel[entry.status];
                            const isUpdating = updating === entry.id;
                            return (
                                <div key={entry.id} className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
                                    {/* Nickname */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-black text-slate-800 truncate">
                                                {entry.nickname}
                                            </h3>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${st.color}`}>
                                                {st.text}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-slate-500">
                                            <span>📚 {entry.masteredCount}/{entry.totalIdioms}</span>
                                            <span>🏛️ {entry.floorsCompleted.length} 層</span>
                                            <span>🗡️ {entry.artifactEmojis?.join('') || '無'}</span>
                                            {entry.submittedAt && (
                                                <span className="text-slate-400">
                                                    {entry.submittedAt.toDate?.()
                                                        ? new Date(entry.submittedAt.toDate()).toLocaleString('zh-TW')
                                                        : ''}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 shrink-0">
                                        {entry.status !== 'approved' && (
                                            <button
                                                onClick={() => entry.id && handleStatusChange(entry.id, 'approved')}
                                                disabled={isUpdating}
                                                className="px-3 py-2 text-sm font-bold bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                                            >
                                                ✅ 核准
                                            </button>
                                        )}
                                        {entry.status !== 'rejected' && (
                                            <button
                                                onClick={() => entry.id && handleStatusChange(entry.id, 'rejected')}
                                                disabled={isUpdating}
                                                className="px-3 py-2 text-sm font-bold bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                                            >
                                                ❌ 拒絕
                                            </button>
                                        )}
                                        {entry.status !== 'pending' && (
                                            <button
                                                onClick={() => entry.id && handleStatusChange(entry.id, 'pending')}
                                                disabled={isUpdating}
                                                className="px-3 py-2 text-sm font-bold bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors"
                                            >
                                                ⏳ 改回待審
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
