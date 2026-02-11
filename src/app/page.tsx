"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Mic, Download, Trash2, StopCircle, Play, Pause, Save, User, QrCode, Search, Grid, List } from 'lucide-react';
import Image from 'next/image';

interface Student {
  id: string;
  name: string;
  lastFeedback?: string; // timestamp of last feedback
}

export default function Home() {
  const [students, setStudents] = useState<Student[]>([]);
  const [newStudentName, setNewStudentName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
    if (confirm('確定要刪除這位學生嗎？')) {
      setStudents(students.filter(s => s.id !== id));
    }
  };

  const generateQRCodeUrl = (studentId: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${baseUrl}/feedback/${studentId}`)}`;
  };

  // 隨機分配學生頭像顏色的輔助函數
  const getAvatarColor = (name: string) => {
    const colors = ['bg-blue-100 text-blue-600', 'bg-green-100 text-green-600', 'bg-yellow-100 text-yellow-600', 'bg-purple-100 text-purple-600', 'bg-pink-100 text-pink-600', 'bg-indigo-100 text-indigo-600'];
    const index = name.length % colors.length;
    return colors[index];
  };

  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-neutral-50 p-6 md:p-12 font-sans text-neutral-900">

      {/* 頂部導覽列：極簡標題與操作區 */}
      <header className="max-w-6xl mx-auto mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 flex items-center gap-3">
              <span className="bg-neutral-900 text-white p-2 rounded-lg">
                <Mic className="w-6 h-6" />
              </span>
              Voice Feedback
            </h1>
            <p className="text-neutral-500 mt-2 text-lg">極簡高效的作文語音批改系統</p>
          </div>

          <div className="flex items-center gap-4 bg-white p-1 rounded-xl border border-neutral-200 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-neutral-100 text-neutral-900 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-neutral-100 text-neutral-900 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 搜尋與新增：懸浮設計 */}
        <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-neutral-100">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="搜尋學生姓名..."
              className="w-full pl-12 pr-4 py-3 bg-neutral-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none text-neutral-700 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="新增學生..."
              className="flex-1 px-4 py-3 bg-neutral-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none font-medium"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addStudent()}
            />
            <button
              onClick={addStudent}
              className="bg-neutral-900 hover:bg-black text-white px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 shadow-lg shadow-neutral-500/20 flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">新增</span>
            </button>
          </div>
        </div>
      </header>

      {/* 學生列表區：網格佈局 */}
      <main className="max-w-6xl mx-auto">
        {students.length === 0 ? (
          <div className="text-center py-24 bg-white/50 rounded-3xl border border-dashed border-neutral-200">
            <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-300">
              <User className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-neutral-700 mb-2">還沒有任何學生</h3>
            <p className="text-neutral-400">請在上方輸入姓名新增第一位學生</p>
          </div>
        ) : (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className={`group relative bg-white rounded-2xl border border-neutral-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 overflow-hidden ${viewMode === 'list' ? 'flex items-center justify-between p-4' : 'p-6 flex flex-col items-center text-center'}`}
              >
                {/* 學生資訊 */}
                <div className={`flex items-center gap-4 ${viewMode === 'list' ? '' : 'flex-col mb-6'}`}>
                  <div className={`flex items-center justify-center font-bold text-xl rounded-2xl shadow-inner ${getAvatarColor(student.name)} ${viewMode === 'list' ? 'w-12 h-12' : 'w-20 h-20 text-3xl mb-2'}`}>
                    {student.name.charAt(0)}
                  </div>
                  <div className={viewMode === 'list' ? '' : 'text-center'}>
                    <h3 className="font-bold text-neutral-800 text-lg group-hover:text-blue-600 transition-colors">{student.name}</h3>
                    <p className="text-xs font-mono text-neutral-400 mt-1 uppercase tracking-wider">ID: {student.id.slice(0, 8)}</p>
                  </div>
                </div>

                {/* 操作按鈕群 */}
                <div className={`flex items-center gap-2 ${viewMode === 'list' ? '' : 'w-full justify-center pt-4 border-t border-neutral-50 mt-auto'}`}>
                  <Link
                    href={`/record/${student.id}`}
                    className={`flex items-center justify-center gap-2 bg-neutral-50 hover:bg-blue-600 hover:text-white text-neutral-600 rounded-xl transition-all duration-300 ${viewMode === 'list' ? 'p-3' : 'flex-1 py-3 text-sm font-medium'}`}
                  >
                    <Mic className="w-4 h-4" />
                    {viewMode === 'grid' && <span>錄音</span>}
                  </Link>

                  <a
                    href={generateQRCodeUrl(student.id)}
                    download={`qrcode-${student.name}.png`}
                    target="_blank"
                    className="p-3 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-all"
                    title="下載 QR Code"
                  >
                    <QrCode className="w-5 h-5" />
                  </a>

                  <button
                    onClick={() => deleteStudent(student.id)}
                    className="p-3 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    title="刪除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* 狀態指示燈 (裝飾用，這裡可以根據是否有錄音來改變顏色) */}
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="mt-20 text-center border-t border-neutral-100 pt-8">
        <p className="text-neutral-400 text-sm font-light">
          Designed for Education &middot; Minimalist Edition &copy; 2026
        </p>
      </footer>
    </div>
  );
}
