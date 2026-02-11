"use client";

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mic, StopCircle, Play, Pause, Save, RotateCcw } from 'lucide-react';
import { ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase";

interface Student {
    id: string;
    name: string;
}

export default function RecordPage() {
    const params = useParams();
    const router = useRouter();
    const [student, setStudent] = useState<Student | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [uploading, setUploading] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // 从 localStorage 获取学生信息
        const savedStudents = localStorage.getItem('students');
        if (savedStudents) {
            const students: Student[] = JSON.parse(savedStudents);
            const foundStudent = students.find((s) => s.id === params.id);
            if (foundStudent) {
                setStudent(foundStudent);
            } else {
                alert('找不到該學生');
                router.push('/');
            }
        }
    }, [params.id, router]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            const chunks: BlobPart[] = [];
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const drop = new Blob(chunks, { type: 'audio/webm' });
                setAudioBlob(drop);
                const url = URL.createObjectURL(drop);
                setAudioUrl(url);
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Error accessing microphone:', err);
            alert('無法存取麥克風，請檢查權限設定。');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            // Stop all tracks
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
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

    if (!student) return <div className="flex justify-center items-center h-screen">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
            <header className="w-full max-w-md mb-8 flex justify-between items-center">
                <Link href="/" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                    <ArrowLeft className="w-6 h-6 mr-2" />
                    返回列表
                </Link>
                <h1 className="text-xl font-bold text-gray-800">錄音批改</h1>
            </header>

            <main className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-bold mb-6">
                    {student.name.charAt(0)}
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{student.name}</h2>
                <p className="text-gray-500 mb-12">準備錄製新的批改回饋...</p>

                {/* 錄音控制區 */}
                {!audioUrl ? (
                    <div className="flex flex-col items-center gap-6 w-full">
                        <button
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${isRecording
                                ? 'bg-red-500 hover:bg-red-600 animate-pulse ring-4 ring-red-200'
                                : 'bg-blue-600 hover:bg-blue-700 hover:scale-105 ring-4 ring-blue-100'
                                }`}
                        >
                            {isRecording ? <StopCircle className="w-10 h-10 text-white" /> : <Mic className="w-10 h-10 text-white" />}
                        </button>
                        <p className={`text-lg font-medium ${isRecording ? 'text-red-500' : 'text-gray-400'}`}>
                            {isRecording ? '正在錄音...' : '點擊開始錄音'}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="w-full bg-gray-100 rounded-xl p-4 mb-4">
                            <audio
                                ref={audioRef}
                                src={audioUrl}
                                onEnded={() => setIsPlaying(false)}
                                className="w-full hidden"
                            />
                            <div className="flex justify-between items-center px-4">
                                <button
                                    onClick={togglePlayback}
                                    className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current pl-1" />}
                                </button>
                                <div className="flex-1 mx-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className={`h-full bg-blue-500 ${isPlaying ? 'animate-progress' : 'w-0'}`} style={{ width: '0%' }}></div> {/* TODO: Implement progress bar */}
                                </div>
                                <span className="text-xs text-gray-400 font-mono">00:00</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full">
                            <button
                                onClick={() => {
                                    if (confirm('確定要重新錄音嗎？目前的錄音將被丟棄。')) {
                                        setAudioUrl(null);
                                        setAudioBlob(null);
                                    }
                                }}
                                className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors font-medium"
                            >
                                <RotateCcw className="w-4 h-4" />
                                重新錄製
                            </button>

                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {uploading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        上傳中...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        確認上傳
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
