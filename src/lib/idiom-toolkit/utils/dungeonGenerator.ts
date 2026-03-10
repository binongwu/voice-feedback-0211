
import { Idiom } from '../schema';
import { BattleQuestion } from '../hooks/useDungeonMaster';

// Fisher-Yates Shuffle (穩定的洗牌演算法)
function shuffle<T>(arr: T[]): T[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

export const generateDungeonQuestions = (allIdioms: Idiom[]): BattleQuestion[] => {
    if (!allIdioms || allIdioms.length === 0) return [];

    const questions: BattleQuestion[] = [];

    // 從每個成語的 battle 題庫中，各抽 2 題
    allIdioms.forEach((idiom) => {
        idiom.quizzes.battle.forEach((q) => {
            // 確保選項順序隨機
            const shuffledOptions = shuffle(q.options);

            questions.push({
                id: q.id,
                type: 'choice',
                content: `【情境題】${q.question}`,
                options: shuffledOptions,
                answer: q.answer,
                timeLimit: 15
            });
        });
    });

    // 全部洗牌
    return shuffle(questions);
};
