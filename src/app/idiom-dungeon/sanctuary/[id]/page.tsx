
'use client';

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { idioms, stories, texts } from '@/lib/idiom-toolkit/data/idioms';
import { evaluateIdiomInput, QuizQuestion } from '@/lib/idiom-toolkit/schema';
import { markAsMastered } from '@/lib/idiom-toolkit/utils/progressManager';

// ==========================================
// Helper Components
// ==========================================
function StarRating({ stars }: { stars: number }) {
    return (
        <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className={`text-xl ${i <= stars ? 'text-amber-400' : 'text-slate-200'}`}>
                    ★
                </span>
            ))}
        </div>
    );
}

// 閱讀測驗卡片
function PracticeQuizCard({ questions, onComplete }: { questions: QuizQuestion[], onComplete: (score: number) => void }) {
    const [currentQ, setCurrentQ] = React.useState(0);
    const [score, setScore] = React.useState(0);
    const [selected, setSelected] = React.useState<string | null>(null);
    const [revealed, setRevealed] = React.useState(false);
    const [finished, setFinished] = React.useState(false);

    const question = questions[currentQ];

    // Shuffle options once per question
    const [shuffledOptions, setShuffledOptions] = React.useState<string[]>([]);
    React.useEffect(() => {
        const opts = [...question.options].sort(() => 0.5 - Math.random());
        setShuffledOptions(opts);
        setSelected(null);
        setRevealed(false);
    }, [currentQ, question.options]);

    const handleSelect = (opt: string) => {
        if (revealed) return;
        setSelected(opt);
        setRevealed(true);

        const isCorrect = opt === question.answer;
        const newScore = isCorrect ? score + 1 : score;
        if (isCorrect) setScore(newScore);

        // Auto advance after 1.5s
        setTimeout(() => {
            if (currentQ < questions.length - 1) {
                setCurrentQ(prev => prev + 1);
            } else {
                setFinished(true);
                onComplete(newScore);
            }
        }, 1500);
    };

    if (finished) {
        const passed = score >= 3;
        return (
            <div className={`rounded-2xl p-8 text-center border-2 ${passed ? 'bg-emerald-50 border-emerald-400' : 'bg-amber-50 border-amber-400'}`}>
                <div className="text-5xl mb-4">{passed ? '🎉' : '📚'}</div>
                <h3 className={`text-2xl font-black mb-2 ${passed ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {passed ? '太棒了！成語已習得！' : '再多讀幾遍吧！'}
                </h3>
                <p className="text-lg text-slate-600 mb-4">
                    答對 <span className="font-bold text-2xl">{score}</span> / {questions.length} 題
                </p>
                {!passed && (
                    <button
                        onClick={() => { setCurrentQ(0); setScore(0); setFinished(false); }}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-xl font-bold transition-all"
                    >
                        再試一次
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="rounded-2xl bg-white border-2 border-indigo-200 shadow-lg overflow-hidden">
            {/* Progress Bar */}
            <div className="h-2 bg-slate-100">
                <div
                    className="h-full bg-indigo-500 transition-all duration-500"
                    style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
                />
            </div>

            <div className="p-6">
                {/* Question Header */}
                <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">
                        📝 閱讀測驗 {currentQ + 1}/{questions.length}
                    </span>
                    <span className="text-sm text-slate-400 font-medium">
                        目前 {score} 分
                    </span>
                </div>

                {/* Question */}
                <h4 className="text-lg font-bold text-slate-800 mb-6 leading-relaxed">
                    {question.question}
                </h4>

                {/* Options */}
                <div className="grid grid-cols-1 gap-3">
                    {shuffledOptions.map((opt, idx) => {
                        let style = 'bg-slate-50 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-slate-700';
                        if (revealed) {
                            if (opt === question.answer) {
                                style = 'bg-emerald-100 border-emerald-500 text-emerald-800 font-bold ring-2 ring-emerald-300';
                            } else if (opt === selected) {
                                style = 'bg-red-100 border-red-400 text-red-700 line-through opacity-70';
                            } else {
                                style = 'bg-slate-50 border-slate-200 text-slate-400 opacity-50';
                            }
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => handleSelect(opt)}
                                disabled={revealed}
                                className={`p-4 rounded-xl border-2 text-left font-medium transition-all ${style}`}
                            >
                                <span className="opacity-50 mr-2 text-sm">{String.fromCharCode(65 + idx)}.</span>
                                {opt}
                            </button>
                        );
                    })}
                </div>

                {/* Feedback after select */}
                {revealed && (
                    <div className={`mt-4 p-3 rounded-lg text-sm font-bold animate-in fade-in ${selected === question.answer ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        {selected === question.answer ? '✅ 答對了！' : `❌ 正確答案是：${question.answer}`}
                    </div>
                )}
            </div>
        </div>
    );
}

// ==========================================
// Main Page Component
// ==========================================
type LearningPhase = 'reading' | 'speaking' | 'quiz' | 'complete';

export default function IdiomLearningPage({ params }: { params: Promise<{ id: string }> }) {
    const [idiomId, setIdiomId] = React.useState<string | null>(null);
    const [userInput, setUserInput] = React.useState('');
    const [feedback, setFeedback] = React.useState<{
        status: 'pass' | 'fail' | 'retry' | null,
        stars: 0 | 1 | 3 | 5,
        msg: string
    }>({ status: null, stars: 0, msg: '' });

    const [readHook, setReadHook] = React.useState(false);
    const [readStory, setReadStory] = React.useState(false);
    const [phase, setPhase] = React.useState<LearningPhase>('reading');
    const [quizScore, setQuizScore] = React.useState<number | null>(null);

    React.useEffect(() => {
        params.then((p) => setIdiomId(p.id));
    }, [params]);

    if (!idiomId) return <div className="p-8 text-center text-lg">Loading...</div>;

    const idiom = idioms.find(i => i.id === idiomId);
    if (!idiom) return notFound();

    const story = stories.find(s => s.id === idiom.storyId);
    const sourceText = story ? texts.find(t => t.id === story.sourceTextId) : null;

    const currentIndex = idioms.findIndex(i => i.id === idiomId);
    const nextIdiom = currentIndex !== -1 && currentIndex < idioms.length - 1 ? idioms[currentIndex + 1] : null;

    const handleEvaluate = () => {
        if (!userInput.trim()) return;
        const result = evaluateIdiomInput(userInput, idiom);
        setFeedback({
            status: result.status,
            stars: result.stars,
            msg: result.feedback
        });
    };

    const handleQuizComplete = (score: number) => {
        setQuizScore(score);
        markAsMastered(idiomId, score);
        if (score >= 3) {
            setPhase('complete');
        }
    };

    // Determine progress
    const readingDone = readHook && readStory;
    const speakingDone = feedback.stars >= 3;
    const canStartQuiz = readingDone && speakingDone;
    const canProceed = phase === 'complete';

    return (
        <div className="h-screen bg-[#f8fafc] text-slate-800 flex flex-col overflow-hidden">
            {/* 1. Header (Ultra Compact) */}
            <header className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center shadow-sm shrink-0 z-10 h-16">
                <Link href="/idiom-dungeon/sanctuary" className="text-slate-500 hover:text-emerald-600 font-bold flex items-center text-sm group transition-colors">
                    <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
                    返回聖殿
                </Link>

                <div className="flex items-center space-x-6">
                    <div className="flex items-center text-sm font-medium text-slate-400">
                        <span className={`w-2 h-2 rounded-full mr-2 ${readHook && readStory ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                        閱讀
                    </div>
                    <div className="flex items-center text-sm font-medium text-slate-400">
                        <span className={`w-2 h-2 rounded-full mr-2 ${speakingDone ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                        口說
                    </div>
                    <div className="flex items-center text-sm font-medium text-slate-400">
                        <span className={`w-2 h-2 rounded-full mr-2 ${phase === 'complete' ? 'bg-amber-400 animate-pulse' : 'bg-slate-300'}`}></span>
                        測驗
                    </div>
                </div>

                <div className="w-24 flex justify-end">
                    {canProceed ? (
                        <Link
                            href={nextIdiom ? `/idiom-dungeon/sanctuary/${nextIdiom.id}` : '/idiom-dungeon'}
                            className="bg-gradient-to-r from-amber-400 to-orange-400 text-white hover:from-amber-500 hover:to-orange-500 px-4 py-2 rounded-lg font-bold text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all animate-bounce"
                        >
                            {nextIdiom ? '下一關 →' : '回大廳 🏠'}
                        </Link>
                    ) : (
                        <span className="text-xs text-slate-300 font-medium bg-slate-100 px-3 py-1 rounded-full">
                            修煉中...
                        </span>
                    )}
                </div>
            </header>

            {/* 2. Main Content (Split View) */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

                {/* Left Panel: The Monolith (Static Knowledge) - Dark Mode */}
                <aside className="lg:w-[40%] bg-slate-900 text-white flex flex-col relative overflow-hidden shadow-2xl z-0">
                    {/* Background Decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

                    <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center relative z-10 overflow-y-auto">
                        <div className="mb-2">
                            <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wider mb-4 border border-emerald-500/30">
                                LEVEL {idiom.level}
                            </span>
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-black text-white mb-6 tracking-tight leading-tight">
                            {idiom.term}
                        </h1>

                        <div className="text-xl lg:text-2xl text-slate-300 font-light leading-relaxed mb-12 border-l-4 border-emerald-500 pl-6">
                            {idiom.definition}
                        </div>

                        {/* Scrollable Story Section */}
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 backdrop-blur-sm flex-1 min-h-[200px] overflow-y-auto custom-scrollbar">
                            <h3 className="text-amber-400/80 font-bold mb-3 flex items-center text-sm uppercase tracking-widest sticky top-0 bg-slate-800/95 py-2 z-10 w-full drop-shadow-sm">
                                📜 典故來源 · {sourceText?.dynasty}
                            </h3>
                            <p className="text-sm text-slate-300 mb-4 font-medium italic opacity-80">
                                {sourceText ? `${sourceText.title} (${sourceText.author})` : ''}
                            </p>
                            <div className="text-sm text-slate-400 leading-relaxed space-y-4 font-serif">
                                <p>{story?.content}</p>
                                {sourceText && (
                                    <div className="border-t border-slate-700 pt-4 mt-4">
                                        <p className="text-xs text-slate-500 mb-2">原文節錄：</p>
                                        <p className="opacity-60">{sourceText.content}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Right Panel: The Workbench (Interactive Learning) - Light Mode */}
                <main className="lg:w-[60%] bg-[#f8fafc] flex flex-col h-full overflow-hidden relative">
                    <div className="flex-1 p-4 lg:p-8 flex flex-col gap-4 overflow-y-auto h-full">

                        {/* Phase: Reading */}
                        {(phase === 'reading' || phase === 'speaking') && (
                            <>
                                {/* A. Metaphor Cards */}
                                <div className="flex-1 flex flex-col gap-4 min-h-[250px]">
                                    {/* Hook Card */}
                                    <div
                                        className={`bg-white rounded-2xl p-6 shadow-sm border-2 transition-all cursor-pointer group hover:-translate-y-1 ${readHook ? 'border-emerald-400 bg-emerald-50/10' : 'border-slate-100 hover:border-emerald-200'}`}
                                        onClick={() => setReadHook(!readHook)}
                                    >
                                        <div className="flex justify-between items-center mb-3">
                                            <h3 className="text-xl font-bold text-slate-800 flex items-center">
                                                <span className="text-2xl mr-3">💡</span>
                                                秒懂比喻
                                            </h3>
                                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${readHook ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                                                {readHook && <span className="text-white text-sm font-bold">✓</span>}
                                            </div>
                                        </div>
                                        <p className="text-lg text-slate-700 font-medium leading-relaxed pl-4 border-l-4 border-yellow-400">
                                            &quot;{idiom.metaphor.hook}&quot;
                                        </p>
                                    </div>

                                    {/* Story Card */}
                                    <div
                                        className={`bg-white rounded-2xl p-6 shadow-sm border-2 transition-all cursor-pointer group hover:-translate-y-1 flex-1 ${readStory ? 'border-emerald-400 bg-emerald-50/10' : 'border-slate-100 hover:border-emerald-200'}`}
                                        onClick={() => setReadStory(!readStory)}
                                    >
                                        <div className="flex justify-between items-center mb-3">
                                            <h3 className="text-xl font-bold text-slate-800 flex items-center">
                                                <span className="text-2xl mr-3">📖</span>
                                                生活小劇場
                                            </h3>
                                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${readStory ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                                                {readStory && <span className="text-white text-sm font-bold">✓</span>}
                                            </div>
                                        </div>
                                        <p className="text-lg text-slate-600 leading-relaxed px-2">
                                            {idiom.metaphor.description}
                                        </p>
                                    </div>
                                </div>

                                {/* B. Speaking Area */}
                                <div className={`bg-white rounded-2xl p-6 shadow-xl border-2 transition-all relative overflow-hidden shrink-0 ${speakingDone ? 'border-amber-400 shadow-amber-100' : 'border-slate-100'}`}>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xl font-bold text-slate-800 flex items-center">
                                            <span className="text-2xl mr-3">🗣️</span>
                                            換你說說看
                                        </h3>
                                        {feedback.status && <StarRating stars={feedback.stars} />}
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-2 mb-4 border border-slate-200 focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-50 transition-all">
                                        <textarea
                                            className="w-full bg-transparent border-none focus:ring-0 p-4 text-lg text-slate-700 placeholder-slate-400 resize-none h-24 leading-relaxed"
                                            placeholder="我覺得它是用來形容..."
                                            value={userInput}
                                            onChange={(e) => setUserInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleEvaluate())}
                                        />
                                        <div className="flex justify-between items-center px-3 pb-2 pt-2 border-t border-slate-200/50">
                                            <span className="text-xs text-slate-400">按 Enter 送出</span>
                                            <button
                                                onClick={handleEvaluate}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-bold text-sm transition-transform active:scale-95 shadow-md shadow-emerald-200"
                                            >
                                                送出檢查
                                            </button>
                                        </div>
                                    </div>

                                    {/* Feedback */}
                                    {feedback.msg && (
                                        <div className={`rounded-lg px-4 py-3 text-sm font-bold flex items-center ${feedback.status === 'pass' ? 'bg-green-50 text-green-700 border border-green-200' :
                                            feedback.status === 'fail' ? 'bg-red-50 text-red-700 border border-red-200' :
                                                'bg-amber-50 text-amber-700 border border-amber-200'
                                            }`}>
                                            <span className="text-lg mr-3">{feedback.status === 'pass' ? '🎉' : feedback.status === 'fail' ? '🚫' : '🤔'}</span>
                                            {feedback.msg}
                                        </div>
                                    )}

                                    {/* Quiz Unlock Button */}
                                    {canStartQuiz && (
                                        <button
                                            onClick={() => setPhase('quiz')}
                                            className="mt-4 w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white py-3 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-indigo-300 animate-bounce"
                                        >
                                            📝 開始閱讀測驗！
                                        </button>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Phase: Quiz */}
                        {phase === 'quiz' && (
                            <div className="flex-1 flex flex-col justify-center">
                                <PracticeQuizCard
                                    questions={idiom.quizzes.practice}
                                    onComplete={handleQuizComplete}
                                />
                            </div>
                        )}

                        {/* Phase: Complete */}
                        {phase === 'complete' && (
                            <div className="flex-1 flex flex-col items-center justify-center text-center">
                                <div className="text-8xl mb-6 animate-bounce">🏅</div>
                                <h2 className="text-3xl font-black text-emerald-700 mb-3">成語習得！</h2>
                                <p className="text-lg text-slate-500 mb-2">
                                    「{idiom.term}」已加入你的知識庫
                                </p>
                                <p className="text-slate-400 text-sm mb-8">
                                    閱讀測驗: {quizScore}/3 | 口說星等: {feedback.stars}★
                                </p>
                                <Link
                                    href={nextIdiom ? `/idiom-dungeon/sanctuary/${nextIdiom.id}` : '/idiom-dungeon'}
                                    className="bg-gradient-to-r from-amber-400 to-orange-400 text-white hover:from-amber-500 hover:to-orange-500 px-8 py-4 rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
                                >
                                    {nextIdiom ? '繼續修煉下一個成語 →' : '🏠 回大廳查看進度'}
                                </Link>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
