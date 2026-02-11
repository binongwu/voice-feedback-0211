"use client";

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mic, StopCircle, Play, Pause, Save, RotateCcw, Check, Sparkles, UploadCloud } from 'lucide-react';
import Link from 'next/link';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes } from 'firebase/storage';

interface Student {
    id: string;
    name: string;
}

export default function RecordPage() {
    const router = useRouter();
    const params = useParams();
    const studentId = params?.id as string;

    const [student, setStudent] = useState<Student | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [uploading, setUploading] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0); // in seconds
    const [isPlaying, setIsPlaying] = useState(false); // for preview player state

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null); // Ref for the audio element


    useEffect(() => {
        if (!studentId) return;

        const savedStudents = localStorage.getItem('students');
        if (savedStudents) {
            const students: Student[] = JSON.parse(savedStudents);
            const foundStudent = students.find(s => s.id === studentId);
            if (foundStudent) {
                setStudent(foundStudent);
            } else {
                alert('找不到學生資料');
                router.push('/');
            }
        }
    }, [studentId, router]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
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
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
    };

    const handleUpload = async () => {
        if (!audioBlob || !student) return;

        setUploading(true);

        // Create a reference to 'feedback/[studentId].webm'
        const storageRef = ref(storage, `feedback/${student.id}.webm`);

        try {
            // Upload the file directly to Firebase Storage
            // We set cacheControl to ensure students always get the latest version
            const metadata = {
                contentType: 'audio/webm',
                cacheControl: 'public, max-age=0, must-revalidate',
            };

            await uploadBytes(storageRef, audioBlob, metadata);

            alert('上傳成功！');
            router.push('/');

        } catch (error) {
            console.error('Firebase Upload error:', error);
            alert('上傳失敗，請檢查網路或 Firebase 設定。');
        } finally {
            setUploading(false);
        }
    };

    // Format time (MM:SS)
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const togglePlayback = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    // Reset playback state when audio ends
    useEffect(() => {
        const audioEl = audioRef.current;
        if (audioEl) {
            const handleEnded = () => setIsPlaying(false);
            audioEl.addEventListener('ended', handleEnded);
            return () => audioEl.removeEventListener('ended', handleEnded);
        }
    }, [audioUrl]);


    if (!student) return <div className="min-h-screen flex items-center justify-center text-neutral-400 font-mono">Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* 裝飾背景 */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-100/50 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-100/50 rounded-full blur-[100px] animate-pulse delay-700"></div>

            <div className="w-full max-w-md z-10">
                <header className="flex items-center mb-12">
                    <Link href="/" className="p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-neutral-600 hover:text-neutral-900 group">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </Link>
                    <div className="ml-6">
                        <p className="text-sm font-bold text-blue-500 uppercase tracking-widest mb-1">RECORDING FOR</p>
                        <h1 className="text-3xl font-extrabold text-slate-800">{student.name}</h1>
                    </div>
                </header>

                <main className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 relative overflow-hidden">

                    {/* 錄音狀態顯示區 */}
                    <div className="flex flex-col items-center justify-center mb-10 min-h-[160px]">
                        {isRecording ? (
                            <>
                                <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center relative mb-6">
                                    <span className="absolute inset-0 rounded-full bg-red-400 opacity-20 animate-ping"></span>
                                    <span className="absolute inset-2 rounded-full bg-red-500 opacity-20 animate-ping delay-75"></span>
                                    <Mic className="w-10 h-10 text-red-500 relative z-10" />
                                </div>
                                <div className="text-5xl font-mono font-bold text-slate-800 tabular-nums animate-pulse">
                                    {formatTime(recordingTime)}
                                </div>
                                <p className="text-red-400 font-medium mt-2 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                    Recording...
                                </p>
                            </>
                        ) : audioUrl ? (
                            <>
                                <div className="w-full bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-xs font-bold text-slate-400 tracking-wider">PREVIEW</span>
                                        <span className="text-xs font-mono text-slate-500 bg-slate-200 px-2 py-1 rounded-md">{formatTime(recordingTime)}</span>
                                    </div>

                                    {/* 隱藏的原生播放器，改用自定義按鈕控制 */}
                                    <audio ref={audioRef} src={audioUrl} className="hidden" />

                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={togglePlayback}
                                            className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-slate-500/20"
                                        >
                                            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                                        </button>
                                        <div className="flex-1 h-12 bg-white rounded-xl border border-slate-100 flex items-center justify-center overflow-hidden relative">
                                            {/* 假波形視覺效果 */}
                                            <div className="flex items-center justify-center gap-1 h-full w-full opacity-30">
                                                {[...Array(20)].map((_, i) => (
                                                    <div key={i} className="w-1 bg-slate-900 rounded-full" style={{ height: `${Math.random() * 80 + 20}%` }}></div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center">
                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                                    <Mic className="w-8 h-8" />
                                </div>
                                <p className="text-slate-500 font-medium">點擊下方按鈕開始錄音</p>
                            </div>
                        )}
                    </div>

                    {/* 控制按鈕區 */}
                    <div className="flex items-center justify-center gap-6">
                        {!isRecording && !audioUrl && (
                            <button
                                onClick={startRecording}
                                className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-xl shadow-red-500/30 hover:scale-105 active:scale-95 transition-all group"
                            >
                                <div className="w-8 h-8 bg-white rounded-md group-hover:rounded-full transition-all duration-300"></div>
                            </button>
                        )}

                        {isRecording && (
                            <button
                                onClick={stopRecording}
                                className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center shadow-xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all"
                            >
                                <div className="w-8 h-8 bg-white rounded-md"></div>
                            </button>
                        )}

                        {audioUrl && !uploading && (
                            <div className="flex gap-4 w-full">
                                <button
                                    onClick={() => {
                                        if (confirm('重新錄音將會捨棄目前的錄音檔，確定嗎？')) {
                                            setAudioUrl(null);
                                            setAudioBlob(null);
                                        }
                                    }}
                                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                                >
                                    <RotateCcw className="w-5 h-5" />
                                    重錄
                                </button>
                                <button
                                    onClick={handleUpload}
                                    className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                                >
                                    <UploadCloud className="w-5 h-5" />
                                    確認上傳
                                </button>
                            </div>
                        )}

                        {uploading && (
                            <div className="w-full py-4 bg-slate-100 rounded-2xl flex items-center justify-center gap-3 text-slate-500 font-medium animate-pulse">
                                <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                                上傳中...
                            </div>
                        )}
                    </div>

                </main>
            </div>
        </div>
    );
}
