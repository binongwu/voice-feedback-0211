"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Play, Pause, Loader2, X } from 'lucide-react';

interface Student {
    id: string;
    name: string;
}

export default function FeedbackPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const studentId = params?.id as string;
    const studentNameFromUrl = searchParams.get('name');
    const studentAvatarFromUrl = searchParams.get('avatar');

    const [student, setStudent] = useState<Student | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0); // 0-100
    const [currentTime, setCurrentTime] = useState('00:00');
    const [duration, setDuration] = useState('00:00');

    // Avatar Customization
    const [localAvatar, setLocalAvatar] = useState<string | null>(null);
    const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const animals = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦉', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗'];

    useEffect(() => {
        if (!studentId) return;

        // Load local avatar preference
        const savedAvatar = localStorage.getItem(`student_avatar_${studentId}`);
        if (savedAvatar) setLocalAvatar(savedAvatar);

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

    }, [studentId, studentNameFromUrl]);

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
            if (total > 0) {
                const p = (current / total) * 100;
                setProgress(p);
                setCurrentTime(formatTime(current));
                setDuration(formatTime(total));
            }
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

    const handleAvatarSelect = (emoji: string) => {
        setLocalAvatar(emoji);
        localStorage.setItem(`student_avatar_${studentId}`, emoji);
        setIsAvatarPickerOpen(false);
    };

    const getDisplayAvatar = () => {
        if (localAvatar) return localAvatar;
        if (studentAvatarFromUrl) return studentAvatarFromUrl;
        const name = student?.name || 'S';
        // Deterministic fallback
        return animals[name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % animals.length];
    };

    if (isLoading) return <div className="min-h-screen bg-emerald-50 flex items-center justify-center"><Loader2 className="w-10 h-10 text-emerald-500 animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-emerald-50/50 font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* 背景裝飾 */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100 rounded-full opacity-50 blur-3xl"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-100 rounded-full opacity-50 blur-3xl"></div>

            <div className="w-full max-w-md z-10 transition-all duration-500">

                {/* 主要播放卡片 */}
                <div className="bg-white rounded-3xl shadow-xl shadow-emerald-900/5 border border-white overflow-hidden relative group">

                    {/* 封面區域 (Header) */}
                    <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-8 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/10 opacity-20 pattern-grid-lg scale-150"></div>

                        <div className="relative z-10">
                            {/* Avatar Display */}
                            <div
                                onClick={() => setIsAvatarPickerOpen(true)}
                                className="w-24 h-24 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer relative"
                                title="點擊更換頭像"
                            >
                                <span className="text-5xl select-none">
                                    {getDisplayAvatar()}
                                </span>
                                <div className="absolute bottom-0 right-0 bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-tl-lg rounded-br-lg font-bold">
                                    更換
                                </div>
                            </div>

                            <h1 className="text-2xl font-bold text-white mb-1 drop-shadow-sm">
                                {student?.name || '同學'}
                            </h1>
                            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-white border border-white/20">
                                <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse"></span>
                                寫作回饋
                            </div>
                        </div>
                    </div>

                    {/* 播放器控制區 */}
                    <div className="p-8">
                        {error ? (
                            <div className="bg-red-50 text-red-500 p-4 rounded-xl text-center text-sm font-medium border border-red-100">
                                {error}
                            </div>
                        ) : (
                            <>
                                <audio
                                    ref={audioRef}
                                    src={audioUrl || ''}
                                    onTimeUpdate={handleTimeUpdate}
                                    onEnded={handleEnded}
                                    onLoadedMetadata={handleTimeUpdate}
                                    preload="metadata"
                                />

                                {/* 進度條 */}
                                <div className="mb-8">
                                    <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 tracking-wide font-mono">
                                        <span>{currentTime}</span>
                                        <span>{duration}</span>
                                    </div>
                                    <div
                                        className="h-2 bg-slate-100 rounded-full overflow-hidden w-full ring-1 ring-slate-900/5 cursor-pointer group/progress relative"
                                        onClick={(e) => {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            const percent = (e.clientX - rect.left) / rect.width;
                                            if (audioRef.current && audioRef.current.duration) {
                                                audioRef.current.currentTime = percent * audioRef.current.duration;
                                            }
                                        }}
                                    >
                                        <div
                                            className="h-full bg-emerald-500 rounded-full transition-all duration-100 relative"
                                            style={{ width: `${progress}%` }}
                                        >
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md scale-0 group-hover/progress:scale-100 transition-transform"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* 播放按鈕 */}
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

                                {/* 問候語 */}
                                <div className="text-center mb-6">
                                    <p className="text-slate-500 font-medium">
                                        Hi <span className="text-emerald-600 font-bold">{student?.name || '同學'}</span>，<br />
                                        老師已經完成了你的寫作批改。
                                    </p>
                                </div>

                                {/* 提示語 (已移除下載連結) */}
                                <div className="text-center bg-orange-50/50 p-4 mb-6 rounded-xl border border-orange-100/50">
                                    <p className="text-orange-600/90 text-xs font-medium leading-relaxed">
                                        💡 貼心提醒：系統僅保留最新的批改回饋。
                                    </p>
                                </div>

                                <div className="text-center">
                                    <p className="text-slate-300 text-xs font-medium uppercase tracking-widest">
                                        Audio Feedback
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Avatar Picker Modal */}
            {isAvatarPickerOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-800">選擇你喜歡的頭像</h3>
                            <button
                                onClick={() => setIsAvatarPickerOpen(false)}
                                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1 grid grid-cols-5 gap-3 p-2">
                            {animals.map((emoji) => (
                                <button
                                    key={emoji}
                                    onClick={() => handleAvatarSelect(emoji)}
                                    className={`text-3xl p-3 rounded-xl hover:bg-emerald-50 hover:scale-110 active:scale-95 transition-all ${localAvatar === emoji ? 'bg-emerald-100 ring-2 ring-emerald-500' : 'bg-slate-50'}`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                            <p className="text-xs text-slate-400">選擇後系統會自動記住喔！</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
