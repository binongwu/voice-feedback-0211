
import React, { useEffect, useState } from 'react';

export const HealthBar = ({ current, max, isPlayer }: { current: number, max: number, isPlayer: boolean }) => {
    const percentage = (current / max) * 100;

    return (
        <div className={`w-full max-w-xs ${isPlayer ? 'order-1' : 'order-2'}`}>
            <div className={`flex justify-between text-xs font-bold mb-1 ${isPlayer ? 'text-emerald-400' : 'text-rose-400'}`}>
                <span>{isPlayer ? 'YOU (勇者)' : 'BOSS (混沌魔獸)'}</span>
                <span>{current}/{max} HP</span>
            </div>
            <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700 shadow-inner relative">
                <div
                    className={`h-full transition-all duration-500 ease-out ${isPlayer ? 'bg-emerald-500' : 'bg-rose-600'}`}
                    style={{ width: `${percentage}%` }}
                >
                    {/* Gloss effect */}
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20"></div>
                </div>
            </div>
        </div>
    );
};

export const TimerDisplay = ({ timeLeft, maxTime = 10 }: { timeLeft: number, maxTime?: number }) => {
    const isCritical = timeLeft <= 3;

    return (
        <div className="flex flex-col items-center">
            <div className={`text-4xl font-black tabular-nums transition-colors ${isCritical ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                {timeLeft}
            </div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">SECONDS</div>
        </div>
    );
};
