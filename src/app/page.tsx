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
    const feedbackUrl = `${baseUrl}/feedback/${studentId}?name=${encodeURIComponent(studentName)}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(feedbackUrl)}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">

      {/* 頂部導覽列 */}
      <header className="bg-white border-b-4 border-emerald-500 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 p-2 rounded-lg shadow-lg rotate-3 hover:rotate-0 transition-transform duration-300">
              <School className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-baseline gap-1">
                508寫作批改回饋
                <span className="text-xs font-mono text-slate-400 font-normal ml-2 bg-slate-100 px-2 py-0.5 rounded-full">v.20260212-1355</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">Teacher's Dashboard</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-600">
            <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              學生總數: {students.length}
            </span>
          </div>
        </div>
      </header>

      {/* 主內容區 */}
      <main className="max-w-[1600px] mx-auto px-4 py-6">

        {students.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center">
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-emerald-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">正在載入名單...</h3>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {students.map((student) => {
              return (
                <div
                  key={student.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-slate-100 flex flex-col p-3 group h-auto"
                >
                  {/* 第一排：姓名 + 操作按鈕 */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight leading-none flex items-center pl-1 border-l-4 border-emerald-400 h-5">
                      {student.name}
                    </h3>

                    <div className="flex items-center gap-1">
                      {/* QR Code */}
                      <a
                        href={generateQRCodeUrl(student.id, student.name)}
                        download={`qrcode-${student.name}.png`}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                        title="下載 QR Code"
                        target="_blank"
                      >
                        <QrCode className="w-4 h-4" />
                      </a>

                      {/* 刪除按鈕 (暫時隱藏) */}
                      <button className="hidden">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 第二排：錄音按鈕 (加強邊框) */}
                  <Link
                    href={`/record/${student.id}`}
                    className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-white text-emerald-600 border-2 border-emerald-500 hover:bg-emerald-500 hover:text-white active:bg-emerald-600 active:border-emerald-600 rounded-lg font-bold transition-all text-sm shadow-sm hover:shadow-md"
                  >
                    <Mic className="w-4 h-4" />
                    開始錄音
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 mt-20 py-8 text-center text-slate-400 text-sm">
        <p>&copy; 2026 Voice Feedback System &middot; 508 Class</p>
      </footer>
    </div>
  );
}
