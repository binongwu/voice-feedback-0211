"use client";

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Play, Pause, AlertCircle, RefreshCw } from 'lucide-react';

export default function FeedbackPage() {
    const params = useParams();
    const studentId = params.id as string;
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (!studentId) return;

        // 构建 Firebase Storage URL
        const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
        if (!bucketName) {
            setError('系統配置錯誤：未設定 Firebase Storage Bucket');
            setIsLoading(false);
            return;
        }

        // Firebase Storage URL format: https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<path>?alt=media
        // Path must be URL encoded (slash becomes %2F)
        const encodedPath = encodeURIComponent(`feedback/${studentId}.webm`);
        const url = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media&t=${Date.now()}`;

        setAudioUrl(url);
        setIsLoading(false); // Assume valid until error

    }, [studentId]);

    const togglePlayback = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play().catch(e => {
                    console.error("Play failed", e);
                    setError('無法播放音訊');
                });
            }
        }
    };

    const handleError = () => {
        console.error('Audio load error for URL:', audioUrl);
        setError('目前尚無最新批改錄音');
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col justify-center items-center py-10 px-4">
            <main className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center text-center relative overflow-hidden">

                {/* 背景裝飾 */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-indigo-600"></div>

                <h1 className="text-2xl font-extrabold text-gray-800 mb-2 mt-4">作文批改回饋</h1>
                <p className="text-sm text-gray-500 mb-8">學生 ID: {studentId?.slice(0, 8)}...</p>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 animate-pulse">
                        <div className="w-16 h-16 bg-blue-100 rounded-full mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-100 rounded w-24"></div>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center text-gray-400 py-8">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle className="w-10 h-10 opacity-50" />
                        </div>
                        <p className="text-lg">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-6 flex items-center gap-2 text-blue-600 hover:underline text-sm"
                        >
                            <RefreshCw className="w-4 h-4" /> 重新整理
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center w-full animate-in zoom-in duration-500">

                        <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
                            {/* 波紋動畫 */}
                            {isPlaying && (
                                <>
                                    <div className="absolute w-full h-full bg-blue-400 rounded-full opacity-20 animate-ping"></div>
                                    <div className="absolute w-3/4 h-3/4 bg-blue-500 rounded-full opacity-20 animate-ping animation-delay-500"></div>
                                </>
                            )}

                            <button
                                onClick={togglePlayback}
                                className="relative z-10 w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-lg shadow-blue-200 flex items-center justify-center text-white hover:scale-105 transition-transform duration-300 focus:outline-none"
                            >
                                {isPlaying ? <Pause className="w-12 h-12 fill-current" /> : <Play className="w-12 h-12 fill-current pl-2" />}
                            </button>
                        </div>

                        <audio
                            ref={audioRef}
                            src={audioUrl || ''}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onEnded={() => setIsPlaying(false)}
                            onError={handleError}
                            className="hidden"
                        />

                        <div className="w-full bg-blue-50/50 rounded-xl p-4 border border-blue-100 mb-4">
                            <p className="text-blue-900 font-medium">老師的語音回饋已就緒</p>
                            <p className="text-blue-600/70 text-sm mt-1">點擊上方按鈕開始播放</p>
                        </div>

                        <div className="flex items-center justify-center w-full gap-2 mt-4">
                            <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full bg-blue-500 transition-all duration-300 ${isPlaying ? 'w-full animate-pulse' : 'w-0'}`}></div>
                            </div>
                        </div>

                    </div>
                )}
            </main>

            <footer className="mt-8 text-white/40 text-xs">
                Powered by Teacher's Voice
            </footer>
        </div>
    );
}
