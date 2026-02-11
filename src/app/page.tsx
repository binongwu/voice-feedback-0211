"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Mic, Download, Trash2, StopCircle, Play, Pause, Save, User, QrCode } from 'lucide-react';
import Image from 'next/image';

interface Student {
  id: string;
  name: string;
  lastFeedback?: string; // timestamp of last feedback
}

export default function Home() {
  const [students, setStudents] = useState<Student[]>([]);
  const [newStudentName, setNewStudentName] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // 从 localStorage 加载学生数据
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
    // 这里生成一个 QR Code API URL 或者使用 canvas 生成
    // 简单起见，我们假设是部署后的地址
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${baseUrl}/feedback/${studentId}`)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <header className="w-full max-w-3xl mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Mic className="w-8 h-8 text-blue-600" />
          作文語音批改系統
        </h1>
        <div className="text-sm text-gray-500">老師後台</div>
      </header>

      <main className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6">
        <div className="flex gap-4 mb-8">
          <input
            type="text"
            placeholder="輸入學生姓名..."
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg text-gray-800 placeholder:text-gray-400"
            value={newStudentName}
            onChange={(e) => setNewStudentName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addStudent()}
          />
          <button
            onClick={addStudent}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            新增學生
          </button>
        </div>

        <div className="space-y-4">
          {students.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <User className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>目前還沒有學生，請上方輸入姓名新增。</p>
            </div>
          ) : (
            students.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{student.name}</h3>
                    <p className="text-xs text-gray-500">ID: {student.id.slice(0, 8)}...</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/record/${student.id}`} className="p-2 text-gray-600 hover:text-blue-600 hover:bg-white rounded-lg transition-all" title="錄音批改">
                    <Mic className="w-5 h-5" />
                  </Link>
                  <a
                    href={generateQRCodeUrl(student.id)}
                    download={`qrcode-${student.name}.png`}
                    target="_blank"
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-white rounded-lg transition-all"
                    title="下載 QR Code"
                  >
                    <QrCode className="w-5 h-5" />
                  </a>
                  <button
                    onClick={() => deleteStudent(student.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-all"
                    title="刪除學生"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <footer className="mt-12 text-center text-gray-400 text-sm">
        &copy; 2026 作文語音批改系統
      </footer>
    </div>
  );
}
