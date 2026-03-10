
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useDungeonMaster } from '@/lib/idiom-toolkit/hooks/useDungeonMaster';
import { HealthBar, TimerDisplay } from './components';
import { QuestionCard } from './QuestionCard';
import { generateDungeonQuestions } from '@/lib/idiom-toolkit/utils/dungeonGenerator';
import { idioms } from '@/lib/idiom-toolkit/data/idioms';
import { BattleQuestion } from '@/lib/idiom-toolkit/hooks/useDungeonMaster';

export default function DungeonPage() {
    const [questions, setQuestions] = useState<BattleQuestion[]>([]);
    const game = useDungeonMaster(questions);

    useEffect(() => {
        const q = generateDungeonQuestions(idioms);
        setQuestions(q);
    }, []);

    // Effect for screen shake
    const [shake, setShake] = useState(false);
    useEffect(() => {
        if (game.feedback === 'miss') {
            setShake(true);
            const ts = setTimeout(() => setShake(false), 500);
            return () => clearTimeout(ts);
        }
    }, [game.feedback]);

    if (questions.length === 0) return <div className="h-screen bg-slate-900 text-white flex items-center justify-center">Loading Dungeon...</div>;

    if (game.phase === 'ready') {
        return (
            <div className="h-screen bg-slate-900 text-white flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-black pointer-events-none"></div>
                <h1 className="text-6xl font-black text-rose-500 mb-8 animate-pulse tracking-tight drop-shadow-red-glow">
                    地牢試煉
                </h1>
                <p className="text-xl text-slate-400 max-w-md text-center mb-12 font-medium">
                    勇者啊，準備好面對混沌魔獸了嗎？<br />
                    你有 3 點生命值，連續答對 5 題即可獲勝！
                </p>
                <button
                    onClick={game.startGame}
                    className="bg-rose-600 hover:bg-rose-700 text-white px-12 py-4 rounded-2xl font-bold text-2xl transition-all shadow-lg hover:shadow-rose-500/50 hover:-translate-y-1 active:scale-95 border-2 border-rose-500/50"
                >
                    開始戰鬥 (START)
                </button>

                <Link href="/idiom-dungeon" className="mt-8 text-slate-500 hover:text-white transition-colors text-sm font-medium border-b border-transparent hover:border-slate-500 pb-1">
                    ← 返回大廳
                </Link>
            </div>
        );
    }

    if (game.phase === 'victory') {
        return (
            <div className="h-screen bg-emerald-900 text-white flex flex-col items-center justify-center">
                <div className="text-8xl mb-6 animate-bounce hover:scale-110 transition-transform cursor-default">🏆</div>
                <h1 className="text-5xl font-black text-emerald-400 mb-4 tracking-tight drop-shadow-lg">
                    試煉通過！
                </h1>
                <p className="text-2xl text-emerald-200 mb-8">
                    最終得分: <span className="font-mono font-bold text-4xl">{Math.floor(game.player.score)}</span>
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={game.startGame}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg"
                    >
                        再挑戰一次
                    </button>
                    <Link
                        href="/idiom-dungeon"
                        className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg"
                    >
                        回大廳
                    </Link>
                </div>
            </div>
        );
    }

    if (game.phase === 'defeat') {
        return (
            <div className="h-screen bg-red-950 text-white flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 animate-pulse"></div>
                <h1 className="text-6xl font-black text-rose-500 mb-8 animate-shake tracking-widest uppercase">
                    GAME OVER
                </h1>
                <p className="text-xl text-rose-200 mb-8 font-light">
                    你的勇氣雖然可嘉，但智慧還需磨練...
                </p>
                <div className="flex gap-4 relative z-10">
                    <button
                        onClick={game.startGame}
                        className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg border border-rose-400/30"
                    >
                        不服輸！重來
                    </button>
                    <Link
                        href="/idiom-dungeon/sanctuary"
                        className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg border border-slate-600"
                    >
                        回聖殿修煉
                    </Link>
                </div>
            </div>
        );
    }

    // Battle Phase
    return (
        <div className={`h-screen bg-slate-900 text-white flex flex-col p-4 md:p-8 transition-transform duration-100 ${shake ? 'scale-[1.02] translate-x-1 translate-y-1 rotate-1 bg-red-900/20' : ''}`}>
            {/* Top HUD */}
            <header className="flex justify-between items-center mb-12 max-w-4xl mx-auto w-full gap-8">
                <HealthBar current={game.player.hp} max={game.player.maxHp} isPlayer={true} />
                <TimerDisplay timeLeft={game.timeLeft} />
                <HealthBar current={game.enemy.hp} max={game.enemy.maxHp} isPlayer={false} />
            </header>

            {/* Boss visual (Optional) */}
            <div className="flex-1 flex flex-col items-center justify-center relative">
                {/* Boss Avatar Placeholder */}
                <div className={`mb-12 transition-all duration-300 ${game.feedback === 'hit' ? 'scale-90 opacity-70 filter brightness-150 grayscale-0' : 'scale-100 opacity-100 grayscale-[0.05]'}`}>
                    <div className="w-32 h-32 md:w-48 md:h-48 bg-gradient-to-br from-purple-600 to-rose-600 rounded-full blur-[60px] animate-pulse absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-50 z-0"></div>
                    <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-rose-500/30 flex items-center justify-center bg-slate-800 shadow-2xl relative z-10 text-6xl animate-bounce-slow">
                        👹
                    </div>
                </div>

                {/* Score & Combo */}
                <div className="absolute top-0 right-0 md:right-20 text-right hidden md:block">
                    <div className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-1">SCORE</div>
                    <div className="text-3xl font-mono text-amber-400 tabular-nums">{Math.floor(game.player.score)}</div>
                    {game.player.combo > 1 && (
                        <div className="text-xl text-emerald-400 font-black animate-bounce mt-2 rotate-12 drop-shadow-lg">
                            {game.player.combo} COMBO!
                        </div>
                    )}
                </div>

                {/* Question Card */}
                {game.currentQuestion ? (
                    <div className="w-full flex justify-center z-20">
                        <QuestionCard
                            question={game.currentQuestion}
                            onSubmit={game.submitAnswer}
                            phase={game.phase}
                        />
                    </div>
                ) : (
                    <div className="text-white bg-slate-800 p-8 rounded-xl animate-pulse">
                        <h2 className="text-xl mb-4">正在召喚混沌魔獸...</h2>
                        <p className="text-sm text-slate-400">Loading Question Index: {game.currentQuestion || 'null'}</p>
                    </div>
                )}

                {/* Debug Info */}
                <div className="absolute bottom-4 left-4 text-xs text-slate-500 font-mono hidden md:block opacity-50">
                    Questions: {questions.length} | Phase: {game.phase} | QID: {game.currentQuestion?.id}
                </div>
            </div>

            {/* Mobile Score */}
            <div className="md:hidden absolute top-20 right-4 text-right z-0 opacity-50">
                <div className="text-xl font-mono text-amber-400">{Math.floor(game.player.score)}</div>
            </div>
        </div>
    );
}
