"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Mic, StopCircle, Play, Pause, RotateCcw, UploadCloud } from 'lucide-react';
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

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (!studentId) return;

        // 直接讀取，不做任何延遲或複雜判斷
        const savedStudents = localStorage.getItem('students');
        if (savedStudents) {
            const students: Student[] = JSON.parse(savedStudents);
            const foundStudent = students.find(s => s.id === studentId);
            if (foundStudent) {
                setStudent(foundStudent);
            } else {
                // 找不到也不要自動跳轉，顯示錯誤即可，方便除錯
                console.error('Student not found');
            }
        }
    }, [studentId]);

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

    if (!student) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-xl font-bold mb-4">找不到學生資料 (ID: {studentId})</h1>
                <p className="mb-4">請確認您是從首頁點擊進來的。</p>
                <Link href="/" className="text-blue-500 underline">回首頁</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white p-6 flex flex-col items-center">

            <div className="w-full max-w-md">
                <Link href="/" className="mb-6 inline-block text-gray-500 flex items-center gap-2">
                    <ArrowLeft size={20} /> 回列表
                </Link>

                <h1 className="text-2xl font-bold mb-2">錄音給：{student.name}</h1>
                <p className="text-gray-500 mb-8">請點擊下方按鈕開始錄音</p>

                {/* 錄音狀態顯示 */}
                <div className="bg-gray-100 rounded-xl p-6 text-center mb-8">
                    {isRecording ? (
                        <div className="text-red-500 font-bold text-3xl animate-pulse">
                            {formatTime(recordingTime)}
                        </div>
                    ) : audioUrl ? (
                        <div>
                            <audio src={audioUrl} controls className="w-full mb-4" />
                            <p className="text-green-600 font-medium">錄音完成！請確認後上傳</p>
                        </div>
                    ) : (
                        <div className="text-gray-400">準備就緒</div>
                    )}
                </div>

                {/* 按鈕區 */}
                <div className="flex justify-center gap-4">
                    {!isRecording && !audioUrl && (
                        <button
                            onClick={startRecording}
                            className="bg-red-500 text-white w-20 h-20 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-all"
                        >
                            <Mic size={32} />
                        </button>
                    )}

                    {isRecording && (
                        <button
                            onClick={stopRecording}
                            className="bg-gray-800 text-white w-20 h-20 rounded-full flex items-center justify-center shadow-lg hover:bg-black transition-all"
                        >
                            <StopCircle size={32} />
                        </button>
                    )}

                    {audioUrl && (
                        <div className="flex w-full gap-2">
                            <button
                                onClick={() => { setAudioUrl(null); setAudioBlob(null); }}
                                className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                            >
                                重錄
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {uploading ? '上傳中...' : '確認上傳'}
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
