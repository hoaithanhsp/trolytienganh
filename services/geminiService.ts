
import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, Exam, GeneratorConfig, Question, ExamOutline } from "../types";


const DEFAULT_MODELS = [
  'gemini-3-flash-preview',
  'gemini-3-pro-preview',
  'gemini-2.5-flash',
  'gemini-2.5-pro'
];

const getApiKey = () => {
  return localStorage.getItem('GEMINI_API_KEY') || '';
};

const getGenAI = () => {
  const key = getApiKey();
  if (!key) throw new Error("Vui lòng nhập API Key trong phần Cài đặt (Settings).");
  return new GoogleGenAI({ apiKey: key });
};

export interface CategorizedFiles {
  matrix: { name: string, content: string };
  specification: { name: string, content: string };
  sampleExam: { name: string, content: string };
}

// Hàm hỗ trợ bóc tách JSON an toàn từ phản hồi của AI
const parseJSONResponse = (text: string) => {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : text;
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Lỗi parse JSON từ AI:", text);
    throw new Error("Không thể đọc được dữ liệu định dạng JSON từ AI.");
  }
};

const generateWithFallback = async (prompt: string, jsonMode: boolean = true) => {
  const ai = getGenAI();
  let lastError: any;

  // Determine model order based on user preference
  const preferredModel = localStorage.getItem('GEMINI_MODEL');
  let models = [...DEFAULT_MODELS];
  if (preferredModel && models.includes(preferredModel)) {
    models = [preferredModel, ...models.filter(m => m !== preferredModel)];
  }

  for (const model of models) {
    try {
      console.log(`Trying model: ${model}`);
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: jsonMode ? { responseMimeType: 'application/json' } : undefined
      });
      return response;
    } catch (error: any) {
      console.warn(`Model ${model} failed:`, error);
      lastError = error;
      // Continue to next model
    }
  }

  // If we get here, all models failed
  const errorMsg = lastError?.message || JSON.stringify(lastError);
  // Extract specific API error codes if possible (e.g. 429)
  if (errorMsg.includes('429')) {
    throw new Error(`429 RESOURCE_EXHAUSTED: Hết quota. Vui lòng đổi API Key hoặc chờ.`);
  }
  throw new Error(`${errorMsg}`);
};

export const analyzeDocuments = async (files: CategorizedFiles): Promise<AnalysisResult> => {
  const prompt = `
    Bạn là một chuyên gia phân tích đề thi Tiếng Anh THPT. 
    Hãy phân tích bộ tài liệu sau để trích xuất cấu trúc đề thi chính xác:

    1. MA TRẬN: ${files.matrix.content}
    2. ĐẶC TẢ: ${files.specification.content}
    3. ĐỀ MẪU: ${files.sampleExam.content}

    Nhiệm vụ: Trích xuất các Unit, chủ đề, tổng số câu, thời gian và tỷ lệ điểm.
    Yêu cầu trả về DUY NHẤT định dạng JSON sau:
    {
      "units": ["Unit 1", "Unit 2", ...],
      "topics": ["Chủ đề 1", "Chủ đề 2", ...],
      "totalQuestions": 40,
      "timeLimit": 50,
      "ratios": { "multipleChoice": 70, "essay": 30 }
    }
  `;

  try {
    const response = await generateWithFallback(prompt, true);
    return parseJSONResponse(response.text || '{}');
  } catch (error: any) {
    console.error("Error analyzing documents:", error);
    throw error; // Rethrow to show error in UI
  }
};

export const generateOutline = async (analysis: AnalysisResult): Promise<ExamOutline> => {
  const prompt = `
    Dựa trên thông tin: Units (${analysis.units.join(', ')}), Tổng câu (${analysis.totalQuestions}).
    Hãy lập dàn ý chi tiết đề thi Tiếng Anh.
    Trả về định dạng JSON:
    {
      "sections": [
        { "title": "Phần 1: Phonetics", "questionCount": 4, "points": 1.0, "description": "Phát âm và Trọng âm" },
        ...
      ],
      "matrixAnalysis": "Phân tích mức độ nhận thức bám sát ma trận."
    }
  `;

  try {
    const response = await generateWithFallback(prompt, true);
    return parseJSONResponse(response.text || '{}');
  } catch (error) {
    console.error("Error generating outline:", error);
    throw error;
  }
};

export const generateExams = async (
  analysis: AnalysisResult,
  config: GeneratorConfig,
  onProgress: (progress: number, message: string) => void
): Promise<Exam[]> => {
  const exams: Exam[] = [];

  for (let i = 0; i < config.count; i++) {
    const code = config.codes[i] || (101 + i).toString();
    onProgress(((i + 0.1) / config.count) * 100, `Đang soạn thảo Đề ${code}...`);

    const prompt = `
      Hãy tạo một đề thi Tiếng Anh hoàn chỉnh bám sát cấu trúc sau:
      - Mã đề: ${code}
      - Các Unit: ${analysis.units.join(', ')}
      - Độ khó: ${config.difficulty} (dựa trên mức độ đề mẫu đã phân tích)
      - Tổng số câu: ${analysis.totalQuestions}
      
      Yêu cầu trả về định dạng JSON khớp chính xác với interface Exam:
      {
        "id": "tự_sinh",
        "code": "${code}",
        "title": "KIỂM TRA ĐỊNH KỲ MÔN TIẾNG ANH",
        "timeMinutes": ${analysis.timeLimit},
        "units": ${JSON.stringify(analysis.units)},
        "topics": ${JSON.stringify(analysis.topics)},
        "questions": [
           { "id": 1, "type": "Loại câu", "questionText": "...", "options": {"A": "...", "B": "...", "C": "...", "D": "..."}, "correctAnswer": "A", "explanation": "..." }
        ],
        "essayPrompt": "Đề bài phần tự luận",
        "difficultyStats": {
          "recognition": 40,
          "understanding": 30,
          "application": 20,
          "highApplication": 10
        }
      }
      
      Lưu ý quan trọng: difficultyStats phải luôn có đủ 4 trường: recognition, understanding, application, highApplication với tổng là 100.
    `;

    try {
      const response = await generateWithFallback(prompt, true);

      let examData = parseJSONResponse(response.text || '{}');

      // Đảm bảo có ID và difficultyStats hợp lệ để tránh lỗi runtime
      examData.id = Math.random().toString(36).substr(2, 9);
      if (!examData.difficultyStats) {
        examData.difficultyStats = { recognition: 40, understanding: 30, application: 20, highApplication: 10 };
      }

      exams.push(examData);
      onProgress(((i + 1) / config.count) * 100, `Hoàn thành Đề ${code}`);
    } catch (error) {
      console.error(`Error generating exam ${code}:`, error);
      throw error; // Rethrow to stop and show error
    }
  }
  return exams;
};

