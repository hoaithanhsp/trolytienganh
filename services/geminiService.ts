
import { GoogleGenAI, Type, GenerateContentParameters } from "@google/genai";
import { ExamConfig, ExamData, ProgressCallback } from "../types";

export const AVAILABLE_MODELS = [
  { id: "gemini-3-flash-preview", name: "Gemini 3 Flash (Fastest)" },
  { id: "gemini-3-pro-preview", name: "Gemini 3 Pro (High Quality)" },
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro" }
];

const FALLBACK_ORDER = [
  "gemini-3-flash-preview",
  "gemini-3-pro-preview",
  "gemini-2.5-flash",
  "gemini-2.5-pro"
];

const KB_HIGH_GRADE_10 = `
- Cấp học: THPT (Lớp 10) - Chuẩn GDPT 2018.
- Cấu trúc đề 2024-2025 (Tham khảo mẫu):
  + PHẦN TRẮC NGHIỆM (I): 
    * Reading Comprehension (5 câu).
    * Phonetics: Stress & Pronunciation (4 câu).
    * Language Focus: MCQs Grammar/Vocab (7-10 câu).
    * Vocabulary: Closest/Opposite meaning (2-4 câu).
    * Sentence Arrangement: Sắp xếp đoạn văn/thư (2 câu).
  + PHẦN TỰ LUẬN (II):
    * Word Form: Supply correct form of word (3 câu).
    * Verb Form: Supply correct form of verb (3 câu).
    * Rewrite: Sentence transformation (Passive, Relative clauses, Conditionals, Reported speech) (4 câu).
- Tỉ lệ: Nhận biết (40%), Thông hiểu (30%), Vận dụng (20%), Vận dụng cao (10%).
`;

const TIMEOUT_MS = 60000;

async function callWithFallback(
  params: Omit<GenerateContentParameters, 'model'>,
  apiKey: string,
  preferredModel: string = "gemini-3-flash-preview",
  onProgress?: ProgressCallback
): Promise<string> {
  // Construct the trial order: Preferred Model -> Then the rest of FALLBACK_ORDER
  const trialModels = [
    preferredModel,
    ...FALLBACK_ORDER.filter(m => m !== preferredModel)
  ];

  let lastError: any;

  for (const model of trialModels) {
    try {
      console.log(`Trying model: ${model}`);
      if (onProgress && model !== preferredModel) {
        onProgress(`Model ${model === preferredModel ? 'preferred' : 'previous'} timed out or failed. Switching to ${model}...`);
      }

      const ai = new GoogleGenAI({ apiKey });

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Timeout of ${TIMEOUT_MS}ms exceeded`)), TIMEOUT_MS);
      });

      const response = await Promise.race([
        ai.models.generateContent({ ...params, model }),
        timeoutPromise
      ]) as any;

      if (response.text) return response.text;
      throw new Error("Empty response");
    } catch (err: any) {
      console.warn(`Model ${model} failed:`, err);
      lastError = err;
      // Continue to next model
    }
  }

  // If all failed, throw the last error with its original message (e.g. 429...)
  throw lastError || new Error("All AI models failed.");
}

export const generateExam = async (
  config: ExamConfig,
  apiKey: string,
  model: string,
  onProgress?: ProgressCallback
): Promise<ExamData> => {
  if (!apiKey) throw new Error("API Key is missing. Please enter it in Settings.");

  const kb = config.level === 'High School' ? KB_HIGH_GRADE_10 : `Standard ${config.level} instructions.`;
  const selectedModel = model || "gemini-3-flash-preview";

  // STEP 1: STRUCTURAL ANALYSIS & BLUEPRINTING
  onProgress?.("Step 1/2: Analyzing Matrix, Specification & Structure...");
  const step1Prompt = `
    Role: Senior English Assessment Specialist (Vietnamese Education System).
    
    INPUT DOCUMENTS:
    1. **MATRIX (Ma trận)**: ${config.matrixContent || "Not provided"}
    2. **SPECIFICATION (Đặc tả)**: ${config.specificationContent || "Not provided"}
    3. **TARGET STRUCTURE (Đề mẫu/Cấu trúc)**: ${config.structureContent || "Not provided"}
    4. **REFERENCE STYLE**: ${config.referenceContent || "Not provided"}
    
    TASK: Analyze these inputs to create a precise EXAM BLUEPRINT.
    
    ANALYSIS LOGIC:
    1. **Format & Structure**: Use 'TARGET STRUCTURE' as the skeleton. The final exam MUST look exactly like this structure (sections, numbering style).
    2. **Question Distribution**: Use 'MATRIX' to determine the number of questions, points per question, and cognitive levels (NB, TH, VD, VDC).
    3. **Content Requirements**: Use 'SPECIFICATION' to determine WHAT to test in each question (e.g., specific grammar point, vocabulary topic).
    4. **Style**: Use 'REFERENCE STYLE' for tone and difficulty.

    OUTPUT: A structured detailed plan (Blueprint) that lists every section and question to be generated in Step 2.
    Format:
    - Section I: [Name]
      - Question 1: [Type] - [Specific Content from Spec] - [Level from Matrix]
      - ...
    - Section II: ...
    
    IMPORTANT: Do not generate the full exam text yet. Just the blueprint.
  `;

  // Pass apiKey and selectedModel
  const plan = await callWithFallback({ contents: step1Prompt }, apiKey, selectedModel, onProgress);

  // STEP 2: HIGH-FIDELITY GENERATION
  onProgress?.("Step 2/2: Generating Final Exam Paper...");
  const step2Prompt = `
    Role: Professional Examiner.
    Task: Generate the FULL ENGLISH EXAM based on the BLUEPRINT from Step 1.
    
    BLUEPRINT:
    ${plan}
    
    CONTEXT:
    - Grade: ${config.level} - ${config.gradeLevel}
    - Time: ${config.examType}
    - Topic: ${config.trendingTopic}
    
    STRICT REQUIREMENTS:
    1. **Adhere to Blueprint**: Follow the section order, question types, and cognitive levels exactly.
    2. **Content**: Generate high-quality English questions.
       - For Reading: Generate a text approx 200-250 words about "${config.trendingTopic}".
       - For Writing: Ensure topics are relevant to Grade ${config.gradeLevel}.
    3. **Formatting**:
       - Headers in VIETNAMESE (e.g., "I. PHẦN TRẮC NGHIỆM", "II. PHẦN TỰ LUẬN").
       - Numbering: "Question 1", "Question 2", etc.
    4. **CLEAN OUTPUT**: 
       - The 'text' field MUST contain ONLY the Reading Passage or specific student instructions. 
       - DO NOT include internal notes, meta-commentary, "Context:", "Note:", or "Blueprint reasoning" in the 'text' field.
       - Use \\n\\n for paragraph breaks in the 'text' field.
    
    JSON Output Schema:
    {
      "examTitle": "string (e.g. ĐỀ KIỂM TRA GIỮA KÌ 1)",
      "duration": "string",
      "content": [
        {
          "section": "string (e.g. I. PHẦN TRẮC NGHIỆM)",
          "text": "string (Reading passage or instructions ONLY. Use \\n\\n for paragraphs. NO meta-notes.)",
          "questions": [
            { 
              "id": "Question 1", 
              "text": "Question text here...", 
              "points": 0.2, 
              "parts": [{"label": "A.", "content": "Option A"}, {"label": "B.", "content": "Option B"}] 
            }
          ]
        }
      ],
      "answers": [{ "questionId": "Question 1", "answer": "A", "pointsDetail": "Nhận biết - 0.2" }]
    }
  `;

  const finalResponse = await callWithFallback({
    contents: step2Prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          examTitle: { type: Type.STRING },
          duration: { type: Type.STRING },
          content: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                section: { type: Type.STRING },
                text: { type: Type.STRING },
                questions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      text: { type: Type.STRING },
                      points: { type: Type.NUMBER },
                      parts: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            label: { type: Type.STRING },
                            content: { type: Type.STRING }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          answers: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                questionId: { type: Type.STRING },
                answer: { type: Type.STRING },
                pointsDetail: { type: Type.STRING }
              }
            }
          }
        },
        required: ["examTitle", "duration", "content", "answers"]
      }
    }
  }, apiKey, selectedModel, onProgress);

  return JSON.parse(finalResponse) as ExamData;
};
