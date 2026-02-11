"use client";

import { useEffect, useState, useRef } from 'react';
import { Play, Pause, Download, Volume2, User, Loader2 } from 'lucide-react';
import { storage } from '@/lib/firebase';
import { ref, getDownloadURL } from 'firebase/storage';

interface Student {
    id: string;
    name: string;
}

export default function FeedbackPage({ params }: { params: { id: string } }) {
    const [student, setStudent] = useState<Student | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0); // 0-100
    const [currentTime, setCurrentTime] = useState('00:00');
    const [duration, setDuration] = useState('00:00');

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const studentId = params.id;

    useEffect(() => {
        // Determine student name from ID locally for now
        const savedStudents = localStorage.getItem('students');
        if (savedStudents) {
            const students: Student[] = JSON.parse(savedStudents);
            const found = students.find(s => s.id === studentId);
            if (found) setStudent(found);
        }

        // Construct Firebase Storage URL
        const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
        if (!bucketName) {
            setError('系統配置錯誤');
            setIsLoading(false);
            return;
        }

        // Firebase Storage URL format
        const encodedPath = encodeURIComponent(`feedback/${studentId}.webm`);
        const url = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media&t=${Date.now()}`;

        setAudioUrl(url);
        setIsLoading(false); // Assume valid until error

    }, [studentId]);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play().catch(e => {
                    console.error("Playback failed:", e);
                    setError("無法播放音訊，可能檔案不存在或是瀏覽器限制。");
                });
            }
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

    const handleEnded = () => {
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime('00:00');
    };

    const formatTime = (seconds: number) => {
        if (isNaN(seconds)) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (isLoading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-400 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="font-medium tracking-wide text-sm">LOADING FEEDBACK...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">

            {/* 裝飾背景 */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-50 to-transparent"></div>

            <div className="w-full max-w-sm relative z-10">

                {/* 卡片主體 */}
                <div className="bg-white rounded-[32px] shadow-2xl shadow-blue-500/10 p-8 flex flex-col items-center text-center overflow-hidden border border-white">

                    {/* 頂部標籤 */}
                    <div className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-8">
                        Teacher's Feedback
                    </div>

                    {/* 用戶頭像與名稱 */}
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6 shadow-inner text-blue-500">
                        <User className="w-10 h-10" />
                    </div>

                    <h1 className="text-2xl font-bold text-slate-800 mb-2">
                        Hi, {student?.name || '同學'}
                    </h1>
                    <p className="text-slate-400 text-sm font-medium mb-10 px-4 leading-relaxed">
                        老師已經完成了你的作文批改，<br />點擊下方按鈕收聽回饋。
                    </p>

                    {/* 播放器核心 */}
                    {error ? (
                        <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-medium border border-red-100 w-full">
                            {error}
                        </div>
                    ) : (
                        <div className="w-full">
                            {/* 隱藏的原生播放器 */}
                            <audio
                                ref={audioRef}
                                src={audioUrl || ''}
                                onTimeUpdate={handleTimeUpdate}
                                onEnded={handleEnded}
                                onError={() => setError('找不到錄音檔，或是發生讀取錯誤。')}
                                className="hidden"
                            />

                            {/* 音訊波形視覺化 (靜態裝飾) */}
                            <div className="flex items-center justify-center gap-[3px] h-12 mb-8 opacity-40">
                                {[...Array(30)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-1 bg-slate-800 rounded-full transition-all duration-300 ${isPlaying ? 'animate-pulse' : ''}`}
                                        style={{
                                            height: `${Math.random() * 80 + 20}%`,
                                            animationDelay: `${i * 0.05}s`
                                        }}
                                    ></div>
                                ))}
                            </div>

                            {/* 進度條與時間 */}
                            <div className="w-full mb-6">
                                <div className="flex justify-between text-xs font-mono text-slate-400 mb-2 font-medium">
                                    <span>{currentTime}</span>
                                    <span>{duration}</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden w-full">
                                    <div
                                        className="h-full bg-slate-800 rounded-full transition-all duration-100"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* 控制按鈕 */}
                            <div className="flex items-center justify-center gap-6 mb-8">
                                <button className="p-3 text-slate-300 hover:text-slate-500 transition-colors">
                                    <Volume2 className="w-5 h-5" />
                                </button>

                                <button
                                    onClick={togglePlay}
                                    className="w-20 h-20 bg-slate-900 text-white rounded-[28px] flex items-center justify-center shadow-xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-[28px]"></div>
                                    {isPlaying ? (
                                        <Pause className="w-8 h-8 fill-current translate-x-[1px]" />
                                    ) : (
                                        <Play className="w-8 h-8 fill-current ml-1" />
                                    )}
                                </button>

                                <a
                                    href={audioUrl || '#'}
                                    download={`feedback-${studentId}.webm`}
                                    className={`p-3 text-slate-300 hover:text-slate-500 transition-colors ${!audioUrl ? 'opacity-50 pointer-events-none' : ''}`}
                                >
                                    <Download className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                <div className="text-center mt-8">
                    <p className="text-slate-300 text-xs font-medium tracking-widest uppercase">VOICE FEEDBACK SYSTEM</p>
                </div>
            </div>
        </div>
    );
}
