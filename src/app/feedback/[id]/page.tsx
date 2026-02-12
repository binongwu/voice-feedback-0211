"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Play, Pause, Download, Volume2, User, Loader2, Music4, CheckCircle } from 'lucide-react';
import { storage } from '@/lib/firebase';
import { ref, getDownloadURL } from 'firebase/storage';

interface Student {
    id: string;
    name: string;
}

export default function FeedbackPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const studentId = params?.id as string;
    const studentNameFromUrl = searchParams.get('name');

    const [student, setStudent] = useState<Student | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0); // 0-100
    const [currentTime, setCurrentTime] = useState('00:00');
    const [duration, setDuration] = useState('00:00');

    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (!studentId) return;

        // Try to get name from URL first (for student viewing), then localStorage (for teacher preview)
        if (studentNameFromUrl) {
            setStudent({ id: studentId, name: studentNameFromUrl });
        } else {
            const savedStudents = localStorage.getItem('students');
            if (savedStudents) {
                const students: Student[] = JSON.parse(savedStudents);
                const found = students.find(s => s.id === studentId);
                if (found) setStudent(found);
            }
        }

        // Construct Firebase Storage URL
        const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
        if (!bucketName) { setError('系統錯誤'); setIsLoading(false); return; }

        const encodedPath = encodeURIComponent(`feedback/${studentId}.webm`);
        const url = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media&t=${Date.now()}`;
        setAudioUrl(url);
        setIsLoading(false);

    }, [studentId]);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) audioRef.current.pause();
            else audioRef.current.play().catch(() => setError("無法播放，請檢查瀏覽器設定。"));
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        const audio = audioRef.current;
        if (audio) {
            const current = audio.currentTime;
            const total = audio.duration || 0;
            setProgress((current / total) * 100);
            setCurrentTime(formatTime(current));
            setDuration(formatTime(total));
        }
    };

    const formatTime = (seconds: number) => {
        if (isNaN(seconds)) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (isLoading) return <div className="min-h-screen bg-emerald-50 flex items-center justify-center"><Loader2 className="w-10 h-10 text-emerald-500 animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-emerald-50/50 font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* 背景裝飾 (Circle Patterns like e-Learning platforms) */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100 rounded-full opacity-50 blur-3xl"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-100 rounded-full opacity-50 blur-3xl"></div>

            <div className="w-full max-w-md z-10">

                {/* 主要播放卡片 */}
                <div className="bg-white rounded-3xl shadow-xl shadow-emerald-900/5 border border-white overflow-hidden relative group">

                    {/* 封面區域 (Header) */}
                    <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-8 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/10 opacity-20 pattern-grid-lg scale-150"></div>

                        <div className="relative z-10">
                            <div className="w-20 h-20 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg transform rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                <span className="text-4xl font-bold text-emerald-600">
                                    {student?.name.charAt(0) || 'S'}
                                </span>
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-1 drop-shadow-sm">
                                {student?.name || '同學'}
                            </h1>
                            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-white border border-white/20">
                                <CheckCircle className="w-3.5 h-3.5" />
                                老師已批改
                            </div>
                        </div>
                    </div>

                    {/* 播放控制區 (Body) */}
                    <div className="p-8">
                        <audio
                            ref={audioRef}
                            src={audioUrl || ''}
                            onTimeUpdate={handleTimeUpdate}
                            onEnded={() => { setIsPlaying(false); setProgress(0); }}
                            onError={(e) => {
                                // Ignore errors if no URL is set (initial state)
                                if (!audioUrl) return;

                                console.error("Audio playback error (suppressed for UI):", e);
                            }}
                            className="hidden"
                        />

                        {/* Error Alert (Non-blocking) */}
                        {error && (
                            <div className="bg-red-50 text-red-500 p-3 mb-6 rounded-xl text-center text-sm font-medium border border-red-100 flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2">
                                <span onClick={() => setError(null)} className="cursor-pointer">⚠️ {error} (點擊關閉)</span>
                            </div>
                        )}



                        {/* 進度條 */}
                        <div className="mb-8">
                            <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 tracking-wide font-mono">
                                <span>{currentTime}</span>
                                <span>{duration}</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden w-full ring-1 ring-slate-900/5 cursor-pointer group/progress">
                                <div
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-100 group-hover/progress:bg-emerald-400"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* 按鈕群 (Simplified: Only Play Button) */}
                        <div className="flex items-center justify-center mb-8">
                            <button
                                onClick={togglePlay}
                                className="w-24 h-24 sm:w-28 sm:h-28 bg-emerald-500 text-white rounded-[32px] flex items-center justify-center shadow-xl shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all group hover:bg-emerald-400 border-4 border-emerald-100/50"
                            >
                                {isPlaying ? (
                                    <Pause className="w-10 h-10 sm:w-12 sm:h-12 fill-current" />
                                ) : (
                                    <Play className="w-10 h-10 sm:w-12 sm:h-12 fill-current ml-2" />
                                )}
                            </button>
                        </div>

                        {/* 問候語 (Moved below play button) */}
                        <div className="text-center mb-6">
                            <p className="text-slate-500 font-medium">
                                Hi <span className="text-emerald-600 font-bold">{student?.name || '同學'}</span>，<br />
                                老師已經完成了你的寫作批改。
                            </p>
                        </div>

                        {/* 提示語 & 下載連結 */}
                        <div className="text-center bg-orange-50/50 p-4 mb-6 rounded-xl border border-orange-100/50">
                            <p className="text-orange-600/90 text-xs font-medium leading-relaxed">
                                💡 貼心提醒：<br />系統僅保留最新的批改回饋，<br />
                                若有需要請 <a href={audioUrl || '#'} download={`feedback-${studentId}.webm`} className="underline font-bold hover:text-orange-800 cursor-pointer">點此自行下載保存</a> 喔！
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-slate-300 text-xs font-medium uppercase tracking-widest">
                                Audio Feedback
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
