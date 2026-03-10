
import React, { useState } from 'react';
import { BattleQuestion } from '@/lib/idiom-toolkit/hooks/useDungeonMaster';

interface QuestionCardProps {
    question: BattleQuestion;
    onSubmit: (answer: string) => void;
    // Add phase logic to disable input during transitions? Yes
    phase: string;
}

export const QuestionCard = ({ question, onSubmit, phase }: QuestionCardProps) => {
    // Phase logic: if phase is 'battle' and question exists, we can answer
    const isAnswerable = phase === 'battle';
    const [selected, setSelected] = useState<string | null>(null);

    // Reset selection when question changes
    React.useEffect(() => {
        setSelected(null);
    }, [question.id]);

    const handleSelect = (option: string) => {
        if (!isAnswerable || selected) return;
        setSelected(option);
        setTimeout(() => {
            onSubmit(option);
        }, 300); // Small delay for visual feedback
    };

    return (
        <div className="bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700 w-full max-w-2xl transform transition-all hover:scale-[1.01]">
            <div className="bg-slate-900/50 p-6 rounded-xl mb-6 border border-emerald-500/20 shadow-inner">
                <h2 className="text-2xl text-emerald-400 font-bold mb-2 tracking-wide flex items-center">
                    <span className="bg-emerald-500/20 p-2 rounded-lg mr-3 shadow-emerald-500/20 shadow-sm">⚔️</span>
                    戰鬥試煉
                </h2>
                <div className="text-xl text-slate-200 font-medium leading-relaxed font-serif">
                    {question.content}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {question.options.map((opt, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleSelect(opt)}
                        disabled={!!selected}
                        className={`
                            p-4 rounded-xl text-lg font-bold transition-all duration-200 transform active:scale-95 text-left flex items-center
                            ${selected === opt
                                ? 'bg-amber-500 text-slate-900 ring-4 ring-amber-300 shadow-amber-500/50'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white border border-slate-600 hover:border-emerald-400/50 shadow-lg'}
                        `}
                    >
                        <span className="bg-slate-900/30 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm opacity-70 border border-slate-500/30">
                            {String.fromCharCode(65 + idx)}
                        </span>
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );
};
