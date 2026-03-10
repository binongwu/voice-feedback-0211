
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

// ==========================================
// 0. 樓層 Metadata (Floor System)
// ==========================================
export interface FloorMeta {
    level: DifficultyLevel;
    name: string;          // e.g. '覺醒層'
    emoji: string;         // e.g. '🏛️'
    colorClass: string;    // Tailwind color prefix, e.g. 'emerald', 'indigo'
    description: string;   // 簡短說明
    reward: ArtifactReward; // 通關獎勵
}

// 神器獎勵 (通過該層所有成語後獲得)
export interface ArtifactReward {
    id: string;            // e.g. 'wisdom-scroll'
    name: string;          // e.g. '智慧卷軸'
    emoji: string;         // e.g. '📜'
    description: string;   // 戰鬥中的效果描述
    effect: string;        // 地牢中的機制效果 (e.g. '+2秒答題時間')
}

// ==========================================
// 1. 最底層：文言文原文 (For future usage)
// ==========================================
export interface ClassicalText {
    id: string;           // e.g. 'han-fei-zi-wu-du'
    title: string;        // 韓非子·五蠹
    dynasty: string;      // 戰國
    author: string;       // 韓非
    content: string;      // 原文...
    translation?: string; // 白話翻譯
}

// ==========================================
// 2. 中間層：典故故事 (Story Mode)
// ==========================================
export interface Story {
    id: string;
    sourceTextId: string; // Foreign Key -> ClassicalText
    title: string;        // 守株待兔的故事
    content: string;      // 白話故事內容...
}

// ==========================================
// 3. 核心層：成語卡片 (Game Mode)
// ==========================================
export interface Idiom {
    id: string;           // e.g. 'shou-zhu-dai-tu'
    term: string;         // 守株待兔
    pronunciation: string;// shǒu zhū dài tù
    definition: string;   // 標準教育部釋義
    storyId: string;      // Foreign Key -> Story

    // 遊戲化數據 (Gamification Data)
    level: DifficultyLevel;
    metaphor: {
        hook: string;       // 一句話秒懂 (生活場景)
        description: string;// 小劇場詳細描述
    };

    // 關鍵字捕手設定 (Keyword Catcher Config)
    validation: {
        keywords: string[]; // 必中關鍵字 (Core)
        forbidden: string[];// 禁忌關鍵字 (Negative)
        hint: string;       // 當學生答錯時的引導提示
    };

    // 測驗題庫 (Quiz Data)
    quizzes: {
        practice: QuizQuestion[]; // 聖殿用的基礎閱讀測驗 (3題)
        battle: QuizQuestion[];   // 地牢用的進階戰鬥題 (不重複)
    };
}

export interface QuizQuestion {
    id: string;
    question: string;   // 題目
    options: string[];  // 選項 (4個)
    answer: string;     // 正確答案 (字串比對較安全)
}

// ==========================================
// 4. 關鍵字捕手邏輯 Helper
// ==========================================
export type EvaluationResult = {
    status: 'pass' | 'fail' | 'retry';
    stars: 0 | 1 | 3 | 5;
    feedback: string;
};

export function evaluateIdiomInput(input: string, idiom: Idiom): EvaluationResult {
    const text = input.trim().toLowerCase();

    // 0. 基本檢查 (字數太少) -> 0 星
    if (text.length < 5) {
        return {
            status: 'retry',
            stars: 0,
            feedback: '太短囉！請再多說一點～'
        };
    }

    // 1. 檢查禁語 (Forbidden Check) -> 0 星 (Fail)
    for (const word of idiom.validation.forbidden) {
        if (text.includes(word)) {
            return {
                status: 'fail',
                stars: 0,
                feedback: `小心！講到「${word}」就不太對囉，反而變成相反的意思了。`
            };
        }
    }

    // 2. 檢查關鍵字 (Core Check)
    let score = 0;
    const hitKeywords: string[] = [];

    for (const word of idiom.validation.keywords) {
        if (text.includes(word)) {
            score += 1;
            hitKeywords.push(word);
        }
    }

    // 判定星星等級
    if (score >= 2) {
        // 命中 2 個以上關鍵字 -> 5 星 (Excellent)
        return {
            status: 'pass',
            stars: 5,
            feedback: `太厲害了！你講到了重點「${hitKeywords[0]}」，完全解釋了這個成語！🎉`
        };
    } else if (score >= 1) {
        // 命中 1 個關鍵字 -> 3 星 (Pass)
        return {
            status: 'pass',
            stars: 3,
            feedback: `答對了！核心概念就是「${hitKeywords[0]}」，很棒！👏`
        };
    } else {
        // 沒命中 -> 1 星 (Retry)
        return {
            status: 'retry',
            stars: 1,
            feedback: `意思有點接近，但還差一點點。提示：${idiom.validation.hint}`
        };
    }
}
