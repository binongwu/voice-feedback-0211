"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Mic, Square, Play, Pause, RefreshCw, Upload, CheckCircle2 } from 'lucide-react';
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
    const [recordingTime, setRecordingTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // --- Logic Block (Preserved) ---
    useEffect(() => {
        if (!studentId) return;

        const savedStudents = localStorage.getItem('students');
        if (savedStudents) {
            const students: Student[] = JSON.parse(savedStudents);
            const foundStudent = students.find(s => s.id === studentId);
            if (foundStudent) {
                setStudent(foundStudent);
            } else {
                console.error('Student not found');
            }
        }
    }, [studentId]);

    const mimeTypeRef = useRef<string>('');

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Detect best supported MIME type
            let mimeType = 'audio/webm';
            if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
                mimeType = 'audio/webm;codecs=opus';
            } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
                mimeType = 'audio/mp4'; // Safari fallback
            }

            mimeTypeRef.current = mimeType;
            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: mimeType });
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
            const metadata = { contentType: mimeTypeRef.current || 'audio/webm', cacheControl: 'public, max-age=0, must-revalidate' };
            await uploadBytes(storageRef, audioBlob, metadata);
            setUploadSuccess(true); // Don't redirect, show success screen
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

    const handlePlayPreview = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                audioRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    const generateQRCodeUrl = (studentId: string, studentName: string) => {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
        const feedbackUrl = `${baseUrl}/feedback/${studentId}?name=${encodeURIComponent(studentName)}`;
        return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(feedbackUrl)}`;
    };

    if (uploadSuccess) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
                <div className="bg-emerald-500 rounded-full p-4 mb-6 shadow-lg shadow-emerald-500/50">
                    <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">上傳成功！</h1>
                <p className="text-slate-400 mb-8">請學生掃描 QR Code 收聽回饋</p>

                <div className="bg-white p-4 rounded-2xl shadow-xl mb-8">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={generateQRCodeUrl(studentId, student?.name || '')} alt="QR Code" className="w-64 h-64" />
                </div>

                <div className="flex flex-col gap-3 w-full max-w-xs">
                    <button
                        onClick={() => {
                            const url = `${window.location.origin}/feedback/${studentId}?name=${encodeURIComponent(student?.name || '')}`;
                            navigator.clipboard.writeText(url).then(() => alert('已複製連結！'));
                        }}
                        className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/10"
                    >
                        複製連結
                    </button>
                    <Link
                        href="/"
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all text-center shadow-lg shadow-emerald-900/20"
                    >
                        完成並返回首頁
                    </Link>
                </div>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-400 font-mono gap-4">
                <div className="animate-pulse">Loading Studio...</div>
                <div className="text-xs">ID: {studentId}</div>
                <Link href="/" className="text-emerald-500 hover:underline">Return to Dashboard</Link>
            </div>
        );
    }

    // --- UI Block (New Design) ---
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 font-sans text-white overflow-hidden">

            <div className="max-w-lg mx-auto px-6 py-8 relative z-10">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/" className="w-10 h-10 rounded-xl bg-slate-700/50 hover:bg-slate-700 transition-colors flex items-center justify-center text-slate-300 hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex-1">
                        <p className="text-slate-400 text-sm font-medium">錄製回饋給</p>
                        <h1 className="text-xl font-bold text-white tracking-wide">{student.name}</h1>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-amber-500/30 ring-2 ring-slate-800">
                        {student.name.charAt(0)}
                    </div>
                </div>

                {/* Status Card */}
                <div className="bg-slate-800/50 rounded-2xl p-6 mb-8 border border-slate-700/50 backdrop-blur-sm relative overflow-hidden">
                    {/* Background Gradient for Active State */}
                    {isRecording && (
                        <div className="absolute inset-0 bg-red-500/5 animate-pulse"></div>
                    )}

                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <span className={`text-sm font-medium transition-colors ${isRecording ? 'text-red-400' : 'text-slate-400'}`}>
                            {isRecording ? '正在錄音...' : audioUrl ? '錄音完成' : '準備錄音'}
                        </span>
                        <span className={`w-3 h-3 rounded-full transition-all duration-500 ${isRecording ? 'bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.6)]' : audioUrl ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                    </div>

                    {/* Timer Display */}
                    <div className="text-center py-6 relative z-10">
                        <div className="font-mono text-6xl font-bold text-white tracking-wider tabular-nums drop-shadow-lg">
                            {formatTime(recordingTime)}
                        </div>
                        <p className="text-slate-500 text-xs mt-3 uppercase tracking-widest font-medium">Recording Time</p>
                    </div>

                    {/* Sound Waves Visualization */}
                    <div className={`flex items-center justify-center gap-1.5 h-16 transition-opacity duration-500 ${isRecording ? 'opacity-100' : 'opacity-20'}`}>
                        {[...Array(12)].map((_, i) => (
                            <div
                                key={i}
                                className={`w-1.5 bg-red-500 rounded-full ${isRecording ? 'animate-wave' : ''}`}
                                style={{
                                    height: isRecording ? '40%' : '20%',
                                    animationDelay: `${i * 0.1}s`,
                                    backgroundColor: isRecording ? '#ef4444' : '#475569'
                                }}
                            ></div>
                        ))}
                    </div>
                </div>

                {/* Main Recording Button Area */}
                {!audioUrl ? (
                    <div className="flex flex-col items-center mb-8 relative">
                        <div className="relative">
                            {/* Pulse rings */}
                            {isRecording && (
                                <>
                                    <div className="absolute inset-0 rounded-full bg-red-500/20 animate-[pulse-ring_2s_ease-out_infinite]"></div>
                                    <div className="absolute inset-0 rounded-full bg-red-500/30 animate-[pulse-ring_2s_ease-out_infinite_0.5s]"></div>
                                </>
                            )}

                            {/* Main button */}
                            <button
                                onClick={isRecording ? stopRecording : startRecording}
                                className={`relative w-32 h-32 rounded-full transition-all duration-300 flex items-center justify-center shadow-2xl z-10 group ${isRecording
                                    ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-4 border-red-500/50 hover:border-red-500 animate-recording-pulse'
                                    : 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 shadow-red-500/40 hover:shadow-red-500/60 hover:scale-105 active:scale-95'
                                    }`}
                            >
                                {isRecording ? (
                                    <Square className="w-12 h-12 text-red-500 fill-current" />
                                ) : (
                                    <Mic className="w-14 h-14 text-white group-hover:scale-110 transition-transform" />
                                )}
                            </button>
                        </div>
                        <p className="text-slate-400 text-sm mt-6 font-medium tracking-wide">
                            {isRecording ? '點擊停止錄音' : '點擊開始錄音'}
                        </p>
                    </div>
                ) : (
                    /* Post-Recording Actions */
                    <div className="space-y-6 animate-in slide-in-from-bottom-10 fade-in duration-500">

                        {/* Audio Preview */}
                        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-white font-medium">錄音完成</p>
                                    <p className="text-slate-400 text-sm">請確認內容無誤後上傳</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                                <button
                                    onClick={handlePlayPreview}
                                    className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white shrink-0"
                                >
                                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                                </button>
                                <div className="h-full w-full flex items-center">
                                    <div className="h-1.5 bg-slate-700 rounded-full w-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 rounded-full w-1/2"></div> {/* Mock progress */}
                                    </div>
                                </div>
                                <audio
                                    ref={audioRef}
                                    src={audioUrl}
                                    onEnded={() => setIsPlaying(false)}
                                    className="hidden"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
                            >
                                {uploading ? (
                                    <span className="animate-pulse">上傳中...</span>
                                ) : (
                                    <>
                                        <Upload className="w-6 h-6" />
                                        上傳錄音
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => { setAudioUrl(null); setAudioBlob(null); setIsPlaying(false); }}
                                className="w-full py-4 px-6 bg-slate-800/50 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white font-medium flex items-center justify-center gap-3 transition-all border border-slate-700 hover:border-slate-600"
                            >
                                <RefreshCw className="w-5 h-5" />
                                重新錄音
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
