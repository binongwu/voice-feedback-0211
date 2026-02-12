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

    // --- Logic Block ---
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

            // Detect best supported MIME type (Prioritize MP4 for better seeking)
            let mimeType = 'audio/webm'; // Fallback
            if (MediaRecorder.isTypeSupported('audio/mp4')) {
                mimeType = 'audio/mp4';
            } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
                mimeType = 'audio/webm;codecs=opus';
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

            mediaRecorderRef.current.start(1000); // 1s timeslice for safety
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
            setUploadSuccess(true);
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
        // QR Code must point to the PUBLIC link, not the admin link
        // PUBLIC: /writing-feedback/feedback/[id]
        const feedbackUrl = `${baseUrl}/writing-feedback/feedback/${studentId}?name=${encodeURIComponent(studentName)}`;
        return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(feedbackUrl)}`;
    };

    if (uploadSuccess) {
        return (
            <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
                <div className="bg-teal-700 rounded-full p-4 mb-6 shadow-xl shadow-teal-900/10">
                    <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-stone-800 mb-2 font-serif tracking-tight">上傳完成</h1>
                <p className="text-stone-500 mb-8 font-light">回饋已送達，請學生掃描下方條碼</p>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 mb-8">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={generateQRCodeUrl(studentId, student?.name || '')} alt="QR Code" className="w-56 h-56 opacity-90 mix-blend-multiply" />
                </div>

                <div className="flex flex-col gap-3 w-full max-w-xs">
                    <Link
                        href="/writing-feedback/t-admin-508" // Back to Admin Dashboard
                        className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold transition-all text-center shadow-lg shadow-teal-900/10 hover:-translate-y-0.5"
                    >
                        返回儀表板
                    </Link>
                </div>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center text-stone-400 font-mono gap-4">
                <div className="animate-pulse">Loading Studio...</div>
                <Link href="/writing-feedback/t-admin-508" className="text-teal-600 hover:underline">Return to Dashboard</Link>
            </div>
        );
    }

    // --- UI Block (Morandi Studio) ---
    return (
        <div className="min-h-screen bg-[#F5F5F0] font-sans text-stone-800 overflow-hidden relative selection:bg-teal-100">
            {/* Background Texture Suggestion */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>

            <div className="max-w-lg mx-auto px-6 py-8 relative z-10 flex flex-col min-h-screen justify-center">

                {/* Header */}
                <div className="flex items-center gap-4 mb-12">
                    <Link href="/writing-feedback/t-admin-508" className="w-10 h-10 rounded-full bg-white border border-stone-200 hover:border-teal-300 transition-colors flex items-center justify-center text-stone-400 hover:text-teal-700 shadow-sm">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex-1 text-center pr-10">
                        <p className="text-stone-400 text-xs font-bold tracking-widest uppercase mb-1">Recording Session</p>
                        <h1 className="text-2xl font-bold text-stone-800 font-serif">{student.name}</h1>
                    </div>
                </div>

                {/* Status Card (Elegant Paper Look) */}
                <div className="bg-white rounded-3xl p-8 mb-12 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-stone-100 relative overflow-hidden ring-1 ring-stone-50">

                    {/* Recording Indicator */}
                    <div className="flex items-center justify-center mb-8">
                        <span className={`transition-all duration-500 flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium tracking-wide ${isRecording ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-100' : audioUrl ? 'bg-teal-50 text-teal-700 ring-1 ring-teal-100' : 'bg-stone-100 text-stone-500'}`}>
                            <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-rose-500 animate-pulse' : audioUrl ? 'bg-teal-500' : 'bg-stone-400'}`}></span>
                            {isRecording ? 'REC' : audioUrl ? 'READY' : 'STANDBY'}
                        </span>
                    </div>

                    {/* Timer Display */}
                    <div className="text-center mb-8">
                        <div className="font-mono text-6xl font-light text-stone-700 tracking-tighter tabular-nums">
                            {formatTime(recordingTime)}
                        </div>
                    </div>

                    {/* Sound Waves (Subtle) */}
                    <div className={`flex items-center justify-center gap-1.5 h-12 transition-opacity duration-500 ${isRecording ? 'opacity-100' : 'opacity-10'}`}>
                        {[...Array(8)].map((_, i) => (
                            <div
                                key={i}
                                className={`w-1 rounded-full ${isRecording ? 'animate-wave bg-rose-400' : 'bg-stone-300'}`}
                                style={{
                                    height: isRecording ? '60%' : '20%',
                                    animationDelay: `${i * 0.1}s`,
                                }}
                            ></div>
                        ))}
                    </div>
                </div>

                {/* Main Recording Button Area */}
                {!audioUrl ? (
                    <div className="flex flex-col items-center mb-8 relative">
                        <button
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`w-24 h-24 rounded-full transition-all duration-500 flex items-center justify-center shadow-xl z-10 group ${isRecording
                                ? 'bg-white border-2 border-rose-100 text-rose-500 hover:scale-105 hover:bg-rose-50'
                                : 'bg-teal-700 text-white hover:bg-teal-800 hover:scale-110 active:scale-95 shadow-teal-900/20'
                                }`}
                        >
                            {isRecording ? (
                                <Square className="w-8 h-8 fill-current" />
                            ) : (
                                <Mic className="w-8 h-8" />
                            )}
                        </button>
                        <p className="text-stone-400 text-xs mt-6 font-medium tracking-widest uppercase">
                            {isRecording ? 'Tap to Stop' : 'Tap to Record'}
                        </p>
                    </div>
                ) : (
                    /* Post-Recording Actions */
                    <div className="space-y-4 animate-in slide-in-from-bottom-10 fade-in duration-500 px-4">

                        {/* Player */}
                        <div className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-stone-200 shadow-sm mb-6">
                            <button
                                onClick={handlePlayPreview}
                                className="w-12 h-12 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
                            >
                                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                            </button>
                            <div className="flex-1">
                                <div className="h-1 bg-stone-100 rounded-full w-full overflow-hidden">
                                    <div className="h-full bg-teal-600 rounded-full w-1/2"></div>
                                </div>
                            </div>
                            <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => { setAudioUrl(null); setAudioBlob(null); setIsPlaying(false); }}
                                className="py-4 px-6 bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 rounded-xl text-stone-500 font-medium flex items-center justify-center gap-2 transition-all"
                            >
                                <RefreshCw className="w-4 h-4" />
                                重錄
                            </button>

                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="py-4 px-6 bg-teal-700 hover:bg-teal-800 rounded-xl text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-teal-900/10 transition-all hover:-translate-y-0.5 disabled:opacity-70"
                            >
                                {uploading ? <span className="animate-pulse">上傳中...</span> : <><Upload className="w-4 h-4" /> 上傳</>}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
