"use client";

import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function RootPage() {
  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-6 font-sans text-stone-800">

      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-5">

        {/* Logo / Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-white rounded-3xl shadow-xl shadow-stone-200 border border-stone-50 flex items-center justify-center rotate-3 hover:rotate-0 transition-transform duration-500">
            <BookOpen className="w-10 h-10 text-teal-700" />
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-800 mb-2 tracking-tight">
            Class 508 Hub
          </h1>
          <p className="text-stone-500 text-sm font-medium uppercase tracking-widest">
            智慧教學輔助系統
          </p>
        </div>

        {/* Formatting Line */}
        <div className="w-16 h-1 bg-teal-600/20 rounded-full mx-auto"></div>

        {/* App Links */}
        <div className="grid gap-4">
          <Link
            href="/writing-feedback"
            className="group flex items-center gap-4 bg-white p-5 rounded-2xl shadow-sm hover:shadow-lg border border-stone-200 hover:border-teal-200 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <Mic className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-stone-700 text-lg group-hover:text-teal-800">寫作批改回饋</h3>
              <p className="text-xs text-stone-400 font-medium">Writing Voice Feedback</p>
            </div>
            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-teal-400">
              →
            </div>
          </Link>

          {/* Placeholder for future apps */}
          {/* <div className="p-5 rounded-2xl border border-dashed border-stone-200 text-stone-300 text-xs font-mono flex items-center justify-center">
                Coming Soon...
            </div> */}
        </div>

        <footer className="pt-12 text-stone-300 text-xs font-light">
          &copy; 2026 Class 508 System
        </footer>

      </div>
    </div>
  );
}

// Icon component (Re-declared for this file scope to avoid imports if not needed, but here we used Lucide)
import { Mic } from 'lucide-react';
