
export enum Step {
  UPLOAD = 'UPLOAD',
  ANALYZING = 'ANALYZING',
  OUTLINE = 'OUTLINE',
  CONFIG = 'CONFIG',
  CONFIRMING = 'CONFIRMING',
  GENERATING = 'GENERATING',
  RESULTS = 'RESULTS'
}

export interface Question {
  id: number;
  type: string;
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
}

export interface Exam {
  id: string;
  code: string;
  title: string;
  timeMinutes: number;
  units: string[];
  topics: string[];
  questions: Question[];
  essayPrompt?: string;
  difficultyStats: {
    recognition: number;
    understanding: number;
    application: number;
    highApplication: number;
  };
}

export interface AnalysisResult {
  units: string[];
  topics: string[];
  totalQuestions: number;
  timeLimit: number;
  ratios: {
    multipleChoice: number;
    essay: number;
  };
}

export interface ExamOutline {
  sections: {
    title: string;
    questionCount: number;
    points: number;
    description: string;
  }[];
  matrixAnalysis: string;
}

export interface GeneratorConfig {
  count: number;
  codes: string[];
  difficulty: 'original' | 'easier' | 'harder';
  specialRequirements?: string;
}
