"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Mic, Download, Trash2, Search, BookOpen, GraduationCap, School, QrCode } from 'lucide-react';

interface Student {
  id: string;
  name: string;
}

export default function Home() {
  const [students, setStudents] = useState<Student[]>([]);
  const [newStudentName, setNewStudentName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    const savedStudents = localStorage.getItem('students');
    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('students', JSON.stringify(students));
    }
  }, [students, isClient]);

  const addStudent = () => {
    if (!newStudentName.trim()) return;
    const newStudent: Student = {
      id: crypto.randomUUID(),
      name: newStudentName,
    };
    setStudents([...students, newStudent]);
    setNewStudentName('');
  };

  const deleteStudent = (id: string) => {
    // Confirmation is handled by the UI button state now
    setStudents(students.filter(s => s.id !== id));
  };

  const generateQRCodeUrl = (studentId: string, studentName: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
    const feedbackUrl = `${baseUrl}/feedback/${studentId}?name=${encodeURIComponent(studentName)}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(feedbackUrl)}`;
  };

  // 隨機分配課程卡片顏色
  const getCardColor = (name: string) => {
    const colors = ['bg-emerald-500', 'bg-teal-500', 'bg-cyan-600', 'bg-green-600', 'bg-lime-600', 'bg-sky-600'];
    return colors[name.length % colors.length];
  };

  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">

      {/* 頂部導覽列 (Taipei e-Learning Header Style) */}
      <header className="bg-white border-b-4 border-emerald-500 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 p-2 rounded-lg shadow-lg rotate-3 hover:rotate-0 transition-transform duration-300">
              <School className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-baseline gap-1">
                508寫作批改回饋 <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* 操作工具列：搜尋與新增 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-10 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="搜尋學生姓名..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="輸入學生姓名..."
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all w-full md:w-64"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addStudent()}
            />

            <button
              onClick={addStudent}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/30 active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              新增
            </button>
          </div>
        </div>

        {/* 學生列表：課程卡片風格 */}
        {students.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center">
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-emerald-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">開始建立您的班級！</h3>
            <p className="text-slate-400 mb-6">目前還沒有學生資料，請在上方輸入姓名新增。</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredStudents.map((student) => {
              // Deterministic Animal Avatar
              const animals = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦉', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗'];
              const avatar = animals[student.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % animals.length];

              return (
                <div
                  key={student.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 flex flex-col group relative"
                >
                  {/* 刪除按鈕 (Two-step confirmation) */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (confirmDeleteId === student.id) {
                        deleteStudent(student.id);
                        setConfirmDeleteId(null);
                      } else {
                        setConfirmDeleteId(student.id);
                        setTimeout(() => setConfirmDeleteId(prev => (prev === student.id ? null : prev)), 3000);
                      }
                    }}
                    className={`absolute top-2 right-2 p-2 rounded-lg transition-all shadow-sm z-50 active:scale-95 border ${confirmDeleteId === student.id
                      ? 'bg-red-600 text-white border-red-600 animate-pulse'
                      : 'bg-red-50 text-red-500 hover:bg-red-600 hover:text-white border-red-100'
                      }`}
                    title={confirmDeleteId === student.id ? "再次點擊以確認刪除" : "移除學生"}
                  >
                    {confirmDeleteId === student.id ? (
                      <span className="text-xs font-bold whitespace-nowrap">確認?</span>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>

                  {/* 卡片頂部 (Compact) */}
                  <div className={`h-20 ${getCardColor(student.name)} relative overflow-hidden flex items-center justify-center`}>
                    <div className="absolute inset-0 bg-white/10 opacity-30 pattern-dots transform rotate-12 scale-150"></div>

                    {/* QR Code 下載 (Top Left) */}
                    <a
                      href={generateQRCodeUrl(student.id, student.name)}
                      download={`qrcode-${student.name}.png`}
                      className="absolute top-2 left-2 p-2 bg-white/90 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-lg transition-all backdrop-blur-sm shadow-sm z-10"
                      title="下載 QR Code"
                      target="_blank"
                    >
                      <QrCode className="w-4 h-4" />
                    </a>

                    {/* Avatar */}
                    <div className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center text-3xl z-10 mt-6 transform translate-y-4">
                      {avatar}
                    </div>
                  </div>

                  {/* 卡片內容 (Compact) */}
                  <div className="pt-8 pb-4 px-4 text-center flex-1">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 line-clamp-1">{student.name}</h3>

                    {/* 開始錄音按鈕 */}
                    <Link
                      href={`/record/${student.id}`}
                      className="flex items-center justify-center gap-2 w-full py-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-lg font-bold transition-all shadow-md hover:shadow-lg shadow-emerald-500/20 text-sm"
                    >
                      <Mic className="w-4 h-4" />
                      開始錄音
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 mt-20 py-8 text-center text-slate-400 text-sm">
        <p>&copy; 2026 Voice Feedback System &middot; Inspired by Taipei e-Learning</p>
      </footer>
    </div>
  );
}
