
import { useState, useRef, useEffect, useCallback } from 'react';

// ==========================================
// 1. Data Structure Definitions
// ==========================================
export type GamePhase = 'ready' | 'battle' | 'victory' | 'defeat';

export interface BattleQuestion {
    id: string;
    type: 'choice';
    content: string;
    options: string[];
    answer: string;
    timeLimit: number;
}

export interface PlayerState {
    hp: number;
    maxHp: number;
    combo: number;
    score: number;
}

export interface EnemyState {
    hp: number;
    maxHp: number;
    name: string;
}

// ==========================================
// 2. The Hook Implementation
// ==========================================
export const useDungeonMaster = (questions: BattleQuestion[]) => {
    // Game State
    const [phase, setPhase] = useState<GamePhase>('ready');
    const [currentQIndex, setCurrentQIndex] = useState(0);

    // Entity State
    const [player, setPlayer] = useState<PlayerState>({ hp: 3, maxHp: 3, combo: 0, score: 0 });
    const [enemy, setEnemy] = useState<EnemyState>({ hp: 5, maxHp: 5, name: '混沌魔獸' }); // Fixed 5 HP

    // Timer State
    const [timeLeft, setTimeLeft] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Feedback State (for UI animations)
    const [feedback, setFeedback] = useState<'hit' | 'miss' | null>(null);

    // ------------------------------------------
    // A. Game Flow Control
    // ------------------------------------------
    const startGame = useCallback(() => {
        if (!questions || questions.length === 0) return;
        setPhase('battle');
        setPlayer({ hp: 3, maxHp: 3, combo: 0, score: 0 });
        setEnemy({ hp: 5, maxHp: 5, name: '混沌魔獸' });
        setCurrentQIndex(0);
        setTimeLeft(questions[0]?.timeLimit || 10);
        setFeedback(null);
    }, [questions]);

    // ------------------------------------------
    // B. Timer Logic
    // ------------------------------------------

    // 3. Answer Handling needs to be defined BEFORE Timer Logic effect to be used in dependency
    // But Timer Logic effect calls handleAnswer.
    // Solution: Define handleAnswer first, or put effect after.
    // However, handleAnswer depends on timeLeft.
    // Circular dependency concept in Variable definition?
    // No, useCallback captures the variable. It's fine.

    // We define handleAnswer first (but it uses setFeedback etc, standard hooks).

    // ------------------------------------------
    // C. Answer Handling
    // ------------------------------------------
    const handleAnswer = useCallback((isCorrect: boolean) => {
        // Clear timer immediately to prevent double firing
        if (timerRef.current) clearTimeout(timerRef.current);

        if (isCorrect) {
            // --- Correct Answer Logic ---
            setFeedback('hit');

            // 1. Update Player Score
            setPlayer(prevPlayer => ({
                ...prevPlayer,
                score: prevPlayer.score + (100 + (timeLeft * 10) + (prevPlayer.combo * 50)),
                combo: prevPlayer.combo + 1
            }));

            // 2. Update Enemy HP
            setEnemy(prevEnemy => ({ ...prevEnemy, hp: prevEnemy.hp - 1 }));

            // 3. Check Progression
            // Logic: If enemy HP was 1, it becomes 0 => Victory.
            if (enemy.hp <= 1) {
                setPhase('victory');
            } else {
                // Enemy still alive, go to next question
                setTimeout(() => {
                    setCurrentQIndex(prev => prev + 1);
                    setFeedback(null);
                }, 1000);
            }

        } else {
            // --- Wrong Answer Logic ---
            setFeedback('miss');

            setPlayer(prevPlayer => ({
                ...prevPlayer,
                hp: prevPlayer.hp - 1,
                combo: 0
            }));

            // Logic: If player HP was 1, it becomes 0 => Defeat.
            if (player.hp <= 1) {
                setPhase('defeat');
            } else {
                // Player still alive
                setTimeout(() => {
                    // Check if more questions
                    if (currentQIndex < questions.length - 1) {
                        setCurrentQIndex(prev => prev + 1);
                        setFeedback(null);
                    } else {
                        // No more questions. If enemy still alive -> Defeat.
                        if (enemy.hp > 0) {
                            setPhase('defeat');
                        }
                    }
                }, 1000);
            }
        }
    }, [timeLeft, player.combo, player.hp, questions, currentQIndex, enemy.hp]);

    // Timer Reset when question changes
    useEffect(() => {
        if (phase === 'battle' && questions[currentQIndex]) {
            setTimeLeft(questions[currentQIndex].timeLimit);
        }
    }, [currentQIndex, phase, questions]);

    // Timer Countdown
    useEffect(() => {
        if (phase === 'battle' && timeLeft > 0) {
            timerRef.current = setTimeout(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (phase === 'battle' && timeLeft === 0) {
            // Time's Up -> Treat as wrong answer
            handleAnswer(false);
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [timeLeft, phase, handleAnswer]);

    return {
        phase,
        currentQuestion: questions[currentQIndex],
        player,
        enemy,
        timeLeft,
        feedback,
        startGame,
        submitAnswer: (answer: string) => {
            const isCorrect = answer === questions[currentQIndex].answer;
            handleAnswer(isCorrect);
        }
    };
};
