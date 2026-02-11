"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mic, StopCircle, Play, Pause, Save, RotateCcw, MonitorPlay, CheckCircle2, AlertTriangle, UploadCloud } from 'lucide-react';
import Link from 'next/link';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes } from 'firebase/storage';

interface Student {
    id: string;
    name: string;
}

export default function RecordPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [student, setStudent] = useState<Student | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [uploading, setUploading] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const unwrappedParams = params;

    useEffect(() => {
        const savedStudents = localStorage.getItem('students');
        if (savedStudents) {
            const students: Student[] = JSON.parse(savedStudents);
            const foundStudent = students.find(s => s.id === unwrappedParams.id);
            if (foundStudent) {
                setStudent(foundStudent);
            } else {
                alert('找不到學生資料');
                router.push('/');
            }
        }
    }, [unwrappedParams.id, router]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error('Error accessing microphone:', err);
            alert('無法存取麥克風，請檢查權限設定。');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const handleUpload = async () => {
        if (!audioBlob || !student) return;

        setUploading(true);
        const storageRef = ref(storage, `feedback/${student.id}.webm`);

        try {
            const metadata = { contentType: 'audio/webm', cacheControl: 'public, max-age=0, must-revalidate' };
            await uploadBytes(storageRef, audioBlob, metadata);
            alert('上傳成功！');
            router.push('/');
        } catch (error) {
            console.error('Firebase Upload error:', error);
            alert('上傳失敗。');
        } finally {
            setUploading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const togglePlayback = () => {
        if (audioRef.current) {
            if (isPlaying) audioRef.current.pause();
            else audioRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    useEffect(() => {
        const audioEl = audioRef.current;
        if (audioEl) {
            const handleEnded = () => setIsPlaying(false);
            audioEl.addEventListener('ended', handleEnded);
            return () => audioEl.removeEventListener('ended', handleEnded);
        }
    }, [audioUrl]);

    if (!student) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-emerald-400 font-mono animate-pulse">Initializing Studio...</div>;

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col font-sans">

            {/* 頂部導覽 */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            錄音室 <span className="text-slate-400 font-normal text-sm">/ {student.name}</span>
                        </h1>
                        <div className="flex items-center gap-2 text-xs font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                            READY TO RECORD
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative bg-grid-slate-200/[0.5]">

                {/* 錄音主控台 */}
                <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden relative group">

                    {/* 視覺化區域 */}
                    <div className={`h-64 bg-slate-900 relative flex items-center justify-center overflow-hidden transition-colors duration-500 ${isRecording ? 'bg-red-950' : 'bg-slate-900'}`}>

                        {/* 裝飾線條 */}
                        <div className="absolute inset-x-0 top-1/2 h-[1px] bg-white/10 w-full"></div>

                        {isRecording ? (
                            <div className="flex items-end justify-center gap-1 h-32 w-full px-12">
                                {/* 動態波形 (假) */}
                                {[...Array(30)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-2 bg-red-500 rounded-t-sm shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-bounce"
                                        style={{
                                            height: `${Math.random() * 80 + 20}%`,
                                            animationDuration: `${Math.random() * 0.5 + 0.3}s`
                                        }}
                                    ></div>
                                ))}
                            </div>
                        ) : audioUrl ? (
                            <div className="flex flex-col items-center justify-center text-emerald-400 gap-4">
                                <CheckCircle2 className="w-16 h-16" />
                                <span className="font-mono text-sm tracking-widest uppercase">Recording Captured</span>
                            </div>
                        ) : (
                            <div className="text-slate-500 font-mono text-sm tracking-widest uppercase animate-pulse">Waiting for input...</div>
                        )}

                        {/* 時間顯示 */}
                        <div className="absolute top-6 right-6 font-mono text-2xl font-bold text-white tabular-nums bg-black/30 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 shadow-lg">
                            {formatTime(recordingTime)}
                            {isRecording && <span className="inline-block w-3 h-3 bg-red-500 rounded-full ml-3 animate-pulse"></span>}
                        </div>
                    </div>

                    {/* 操作面板 */}
                    <div className="p-8 bg-slate-50 relative">
                        {/* 錄音按鈕群 */}
                        <div className="flex items-center justify-center gap-8 -mt-16 relative z-10">

                            {!isRecording && !audioUrl && (
                                <button
                                    onClick={startRecording}
                                    className="w-24 h-24 bg-red-600 hover:bg-red-500 text-white rounded-full shadow-[0_10px_30px_rgba(220,38,38,0.4)] flex items-center justify-center transition-all hover:scale-110 active:scale-95 border-4 border-white/20"
                                    title="開始錄音"
                                >
                                    <Mic className="w-10 h-10" />
                                </button>
                            )}

                            {isRecording && (
                                <button
                                    onClick={stopRecording}
                                    className="w-24 h-24 bg-slate-800 hover:bg-slate-700 text-white rounded-3xl shadow-[0_10px_30px_rgba(30,41,59,0.4)] flex items-center justify-center transition-all hover:scale-105 active:scale-95 border-4 border-white/20"
                                    title="停止錄音"
                                >
                                    <span className="w-8 h-8 bg-current rounded-sm block"></span>
                                </button>
                            )}

                            {audioUrl && (
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={togglePlayback}
                                        className="w-16 h-16 bg-slate-800 text-emerald-400 rounded-full flex items-center justify-center hover:bg-slate-700 transition-all shadow-lg border-2 border-slate-700"
                                    >
                                        {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 底部操作與提示 */}
                        <div className="mt-8">
                            <audio ref={audioRef} src={audioUrl || ''} className="hidden" />

                            {audioUrl ? (
                                <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <button
                                        onClick={() => { if (confirm('重新錄音將會覆蓋目前的檔案，確定嗎？')) { setAudioUrl(null); setAudioBlob(null); } }}
                                        className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors font-bold flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        重錄
                                    </button>
                                    <button
                                        onClick={handleUpload}
                                        disabled={uploading}
                                        className="flex-[2] py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {uploading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                上傳中...
                                            </>
                                        ) : (
                                            <>
                                                <UploadCloud className="w-5 h-5" />
                                                確認上傳回饋
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <p className="text-center text-slate-400 text-sm font-medium mt-4">
                                    {isRecording ? '正在錄音中...請對著麥克風說話' : '點擊紅色按鈕開始'}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
