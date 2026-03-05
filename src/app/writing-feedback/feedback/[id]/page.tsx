"use client";

import { useState, useRef, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Play, Pause, School, Volume2, Info, X } from 'lucide-react';
import { storage } from '@/lib/firebase';
import { ref, getDownloadURL } from 'firebase/storage';
import { CLASS_INFO } from '@/config/class-info';

interface Student {
    id: string;
    name: string;
}

export default function FeedbackPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const studentId = params?.id as string;
    // URL param has priority, fallback to local storage or deterministic hash
    const urlName = searchParams?.get('name');
    const urlAvatar = searchParams?.get('avatar');

    const [student, setStudent] = useState<Student | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [audioReady, setAudioReady] = useState(false);

    // Avatar state
    const [currentAvatar, setCurrentAvatar] = useState<string>('🐶');
    const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Cute Animals List
    const animals = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦉', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗'];

    useEffect(() => {
        if (!studentId) return;

        // 1. Resolve Name
        let name = urlName || '';
        if (!name) {
            const savedStudents = localStorage.getItem('students');
            if (savedStudents) {
                const students: Student[] = JSON.parse(savedStudents);
                const found = students.find(s => s.id === studentId);
                if (found) name = found.name;
            }
        }
        setStudent({ id: studentId, name: name || '同學' });

        // 2. Resolve Avatar
        // Priority: LocalStorage > URL Param > Deterministic Hash
        const localAvatar = localStorage.getItem(`student_avatar_${studentId}`);

        if (localAvatar) {
            setCurrentAvatar(localAvatar);
        } else if (urlAvatar) {
            setCurrentAvatar(urlAvatar);
        } else {
            // Deterministic Fallback
            const hash = (name || studentId).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            setCurrentAvatar(animals[hash % animals.length]);
        }

        // 3. Fetch Audio
        // Try the correct extension in order:
        // 1) localStorage (set by the recorder when uploading)
        // 2) mp4  (iPhone Safari records audio/mp4)
        // 3) webm (Chrome/Android fallback)
        const fetchAudio = async () => {
            const savedExt = localStorage.getItem(`audio_ext_${studentId}`);
            const extOrder = savedExt
                ? [savedExt]
                : ['mp4', 'webm'];

            for (const ext of extOrder) {
                try {
                    const audioRefFire = ref(storage, `feedback/${studentId}.${ext}`);
                    const url = await getDownloadURL(audioRefFire);
                    setAudioUrl(url);
                    setLoading(false);
                    return; // success – stop trying
                } catch {
                    // not found with this extension, try next
                }
            }
            setError("尚未收到老師的回饋錄音喔！");
            setLoading(false);
        };

        fetchAudio();
    }, [studentId, urlName, urlAvatar]);

    const togglePlay = async () => {
        if (!audioRef.current) return;
        try {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                await audioRef.current.play(); // await 確保真的播放成功才更新狀態
                setIsPlaying(true);
            }
        } catch (err) {
            console.error('播放失敗:', err);
            setIsPlaying(false); // 失敗時重設，避免顯示錯誤的 PLAYING 狀態
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const percent = (audioRef.current.currentTime / audioRef.current.duration) * 100;
            setProgress(percent || 0);
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setProgress(0);
    };

    const handleAvatarSelect = (avatar: string) => {
        setCurrentAvatar(avatar);
        localStorage.setItem(`student_avatar_${studentId}`, avatar);
        setIsAvatarPickerOpen(false);
    };

    return (
        <div className="min-h-screen bg-[#FDFDF8] font-sans text-stone-800 selection:bg-rose-100">
            {/* Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>

            <div className="max-w-md mx-auto min-h-screen flex flex-col relative z-10 bg-white shadow-2xl shadow-stone-200/50">

                {/* Header Image / Pattern Area (Top 30%) */}
                <div className="h-48 bg-teal-800 relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    {/* Decorative Circles */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-teal-700 rounded-full opacity-50 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-600 rounded-full opacity-30 blur-2xl"></div>

                    {/* Avatar (Clickable) */}
                    <button
                        onClick={() => setIsAvatarPickerOpen(true)}
                        className="relative z-20 group transition-transform hover:scale-105 active:scale-95"
                    >
                        <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center text-5xl relative ring-4 ring-white/20 hover:ring-white/40 transition-all">
                            {currentAvatar}
                            <span className="absolute bottom-0 right-0 bg-stone-100 rounded-full p-1.5 shadow-sm border border-white">
                                <span className="sr-only">Change</span>
                                <svg className="w-3 h-3 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </span>
                        </div>
                        <p className="text-white/80 text-xs mt-3 font-medium tracking-widest text-center opacity-0 group-hover:opacity-100 transition-opacity">更換頭像</p>
                    </button>

                    {/* Badge */}
                    <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-white/90 text-xs font-medium flex items-center gap-1.5">
                        <School className="w-3 h-3" />
                        {CLASS_INFO.id} 寫作教室
                    </div>
                </div>

                {/* Content Area (Rounded overlap) */}
                <div className="flex-1 px-8 py-8 -mt-8 bg-white rounded-t-3xl relative z-10 flex flex-col items-center">

                    <h1 className="text-2xl font-bold text-stone-800 mb-1 tracking-tight">
                        {student?.name || '同學'}
                    </h1>
                    <p className="text-stone-400 text-sm mb-8 font-medium">您的寫作回饋已送達</p>

                    {/* Audio Player Card */}
                    <div className="w-full bg-stone-50 rounded-2xl p-6 mb-6 border border-stone-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                        {loading ? (
                            <div className="flex flex-col items-center py-4 gap-3">
                                <div className="w-8 h-8 border-2 border-stone-200 border-t-teal-600 rounded-full animate-spin"></div>
                                <span className="text-stone-400 text-xs">讀取中...</span>
                            </div>
                        ) : error ? (
                            <div className="text-center py-4">
                                <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-3 text-rose-400">
                                    <Info className="w-6 h-6" />
                                </div>
                                <p className="text-stone-500 text-sm">{error}</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Vis */}
                                <div className="flex items-center justify-between text-xs text-stone-400 font-medium px-1">
                                    <span>Audio Feedback</span>
                                    {isPlaying ? <span className="text-teal-600 animate-pulse">Playing...</span> : <span>Ready</span>}
                                </div>

                                {/* Controls */}
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={togglePlay}
                                        disabled={!audioReady}
                                        className="w-14 h-14 rounded-full bg-teal-700 hover:bg-teal-800 text-white shadow-lg shadow-teal-900/20 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shrink-0 disabled:opacity-50 disabled:cursor-wait"
                                    >
                                        {!audioReady
                                            ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                            : isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                                    </button>

                                    {/* Progress Bar Container */}
                                    <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden relative">
                                        <div
                                            className="absolute top-0 left-0 h-full bg-teal-500 rounded-full transition-all duration-100 ease-linear"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <audio
                                    ref={audioRef}
                                    src={audioUrl || ''}
                                    onCanPlay={() => setAudioReady(true)}
                                    onTimeUpdate={handleTimeUpdate}
                                    onEnded={handleEnded}
                                    playsInline
                                    preload="auto"
                                    className="hidden"
                                />
                            </div>
                        )}
                    </div>

                    {/* Tips / Footer */}
                    <div className="w-full mt-6">
                        <div className="bg-orange-50/80 rounded-xl p-5 border border-orange-100/50">
                            <h4 className="flex items-center gap-2 text-orange-800 text-sm font-bold mb-2">
                                <Volume2 className="w-4 h-4" />
                                收聽小撇步
                            </h4>
                            <ul className="text-orange-900/70 text-xs space-y-1.5 list-disc list-inside font-medium leading-relaxed">
                                <li>如果無法順利聽到錄音，<span className="underline decoration-orange-300 decoration-2">重新按一次播放</span>就可以囉！</li>
                                <li>建議使用耳機收聽以獲得最佳音質。</li>
                                <li>系統僅保留最新的批改回饋。</li>
                            </ul>
                        </div>
                    </div>

                </div>

                {/* Avatar Picker Modal */}
                {isAvatarPickerOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl w-full max-w-sm max-h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
                                <h3 className="font-bold text-stone-700">選擇你的頭像</h3>
                                <button onClick={() => setIsAvatarPickerOpen(false)} className="p-2 hover:bg-stone-200 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-stone-500" />
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto grid grid-cols-5 gap-3">
                                {animals.map((emoji) => (
                                    <button
                                        key={emoji}
                                        onClick={() => handleAvatarSelect(emoji)}
                                        className={`text-3xl p-3 rounded-xl hover:bg-stone-100 hover:scale-110 transition-all ${currentAvatar === emoji ? 'bg-teal-50 ring-2 ring-teal-500' : ''}`}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
