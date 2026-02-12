"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mic, Trash2, BookOpen, GraduationCap, School, QrCode } from 'lucide-react';

interface Student {
    id: string;
    name: string;
}

const DEFAULT_STUDENTS: Student[] = [
    { id: 's-01', name: '吳翊恩' },
    { id: 's-02', name: '邱柏鈞' },
    { id: 's-03', name: '張人杰' },
    { id: 's-04', name: '陳崇名' },
    { id: 's-05', name: '王晨佑' },
    { id: 's-06', name: '林楷鈞' },
    { id: 's-07', name: '許睿旃' },
    { id: 's-08', name: '馬頤中' },
    { id: 's-09', name: '李承翰' },
    { id: 's-10', name: '陳韋豪' },
    { id: 's-11', name: '林宥任' },
    { id: 's-12', name: '華紹硯' },
    { id: 's-13', name: '邱柏翔' },
    { id: 's-14', name: '吳忠陽' },
    { id: 's-15', name: '周翊騰' },
    { id: 's-16', name: '徐維蔓' },
    { id: 's-17', name: '華紹帆' },
    { id: 's-18', name: '王晨希' },
    { id: 's-19', name: '楊銥誼' },
    { id: 's-20', name: '陳妤宣' },
    { id: 's-21', name: '范芝綾' },
    { id: 's-22', name: '劉芷安' },
    { id: 's-23', name: '馬頤菲' },
    { id: 's-24', name: '王沂安' },
    { id: 's-25', name: '謝雅芝' },
    { id: 's-26', name: '謝棋芝' },
    { id: 's-27', name: '蔡芷柔' },
    { id: 's-28', name: '張芸榕' },
    { id: 's-29', name: '連晨希' },
];

export default function Home() {
    const [students, setStudents] = useState<Student[]>([]);
    const [isClient, setIsClient] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    useEffect(() => {
        setIsClient(true);
        const savedStudents = localStorage.getItem('students');
        if (savedStudents) {
            const parsed = JSON.parse(savedStudents);
            if (parsed.length > 0) {
                setStudents(parsed);
            } else {
                setStudents(DEFAULT_STUDENTS);
            }
        } else {
            setStudents(DEFAULT_STUDENTS);
        }
    }, []);

    useEffect(() => {
        if (isClient && students.length > 0) {
            localStorage.setItem('students', JSON.stringify(students));
        }
    }, [students, isClient]);

    const deleteStudent = (id: string) => {
        setStudents(students.filter(s => s.id !== id));
    };

    const generateQRCodeUrl = (studentId: string, studentName: string) => {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
        // Update Route to /writing-feedback/feedback
        const feedbackUrl = `${baseUrl}/writing-feedback/feedback/${studentId}?name=${encodeURIComponent(studentName)}`;
        return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(feedbackUrl)}`;
    };

    return (
        <div className="min-h-screen bg-stone-50 font-sans text-stone-800 selection:bg-teal-100 selection:text-teal-900">

            {/* 頂部導覽列 (Sage & Stone Style) */}
            <header className="bg-white/80 border-b border-stone-200 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="bg-teal-700/10 hover:bg-teal-700/20 p-2 rounded-xl transition-colors group">
                            <School className="w-6 h-6 text-teal-700 group-hover:scale-110 transition-transform" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-stone-800 tracking-tight flex items-center gap-2">
                                508 寫作回饋
                                <span className="text-[10px] font-mono text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200">v.Morandi-1420</span>
                            </h1>
                            <p className="text-xs text-stone-500 font-medium tracking-wide uppercase">Teacher's Dashboard</p>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-4 text-sm font-medium text-stone-600">
                        <span className="bg-stone-100/50 text-stone-600 px-3 py-1.5 rounded-full border border-stone-200 flex items-center gap-2 shadow-sm">
                            <GraduationCap className="w-4 h-4 text-teal-600" />
                            學生總數: {students.length}
                        </span>
                    </div>
                </div>
            </header>

            {/* 主內容區 */}
            <main className="max-w-[1600px] mx-auto px-4 py-8">

                {students.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center shadow-sm">
                        <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BookOpen className="w-10 h-10 text-stone-300" />
                        </div>
                        <h3 className="text-xl font-bold text-stone-600 mb-2">正在載入名單...</h3>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {students.map((student) => {
                            return (
                                <div
                                    key={student.id}
                                    className="bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 transition-all duration-300 border border-stone-100 flex flex-col p-4 group relative"
                                >
                                    {/* 第一排：姓名 + 操作按鈕 */}
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-stone-700 tracking-tight leading-none flex items-center pl-2 border-l-[3px] border-teal-600/50 h-5">
                                            {student.name}
                                        </h3>

                                        <div className="flex items-center gap-1">
                                            {/* QR Code */}
                                            <a
                                                href={generateQRCodeUrl(student.id, student.name)}
                                                download={`qrcode-${student.name}.png`}
                                                className="p-1.5 text-stone-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-all"
                                                title="下載 QR Code"
                                                target="_blank"
                                            >
                                                <QrCode className="w-4 h-4" />
                                            </a>

                                            {/* 刪除按鈕 (隱藏) */}
                                            <button className="hidden">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* 第二排：錄音按鈕 (Morandi Style) */}
                                    <Link
                                        href={`/writing-feedback/record/${student.id}`} // Update Route
                                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-stone-50 hover:bg-teal-50 text-teal-800 border border-stone-200 hover:border-teal-200 active:bg-teal-100 rounded-lg font-bold transition-all text-sm group-hover:shadow-sm"
                                    >
                                        <Mic className="w-4 h-4 text-teal-600 group-hover:text-teal-700" />
                                        開始錄音
                                    </Link>
                                </div>
                            )
                        })}
                    </div>
                )}
            </main>

            <footer className="bg-stone-50 border-t border-stone-200 mt-20 py-8 text-center text-stone-400 text-sm font-light tracking-wide">
                <p>Voice Feedback System &middot; Class 508</p>
            </footer>
        </div>
    );
}
