
import React, { useState, useEffect } from 'react';
import { Step, AnalysisResult, GeneratorConfig, Exam, ExamOutline } from './types';
import { analyzeDocuments, generateExams, generateOutline, CategorizedFiles } from './services/geminiService';
import Header from './components/Header';
import FileUploadZone from './components/FileUploadZone';
import ExamGeneratorConfig from './components/ExamGeneratorConfig';
import GenerationProgress from './components/GenerationProgress';
import ExamView from './components/ExamView';
import ExamOutlineView from './components/ExamOutlineView';
import ApiKeySettings from './components/ApiKeySettings';
import { FileText, Settings, CheckCircle, ListRestart, ClipboardList } from 'lucide-react';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.UPLOAD);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [outline, setOutline] = useState<ExamOutline | null>(null);
  const [config, setConfig] = useState<GeneratorConfig | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [progress, setProgress] = useState({ value: 0, message: '' });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const apiKey = localStorage.getItem('GEMINI_API_KEY');
    if (!apiKey) {
      setIsSettingsOpen(true);
    }
  }, []);

  const handleFileUpload = async (files: CategorizedFiles) => {
    setCurrentStep(Step.ANALYZING);
    try {
      const result = await analyzeDocuments(files);
      setAnalysis(result);
      const outlineResult = await generateOutline(result);
      setOutline(outlineResult);
      setCurrentStep(Step.OUTLINE);
    } catch (err) {
      alert("Lỗi khi phân tích tài liệu. Vui lòng kiểm tra API Key và thử lại.");
      setCurrentStep(Step.UPLOAD);
    }
  };

  const handleConfirmOutline = () => {
    setCurrentStep(Step.CONFIG);
  };

  const handleConfigSubmit = (newConfig: GeneratorConfig) => {
    setConfig(newConfig);
    setCurrentStep(Step.CONFIRMING);
  };

  const startGeneration = async () => {
    if (!analysis || !config) return;
    setCurrentStep(Step.GENERATING);
    try {
      const generatedExams = await generateExams(analysis, config, (val, msg) => {
        setProgress({ value: val, message: msg });
      });
      setExams(generatedExams);
      setCurrentStep(Step.RESULTS);
    } catch (err) {
      alert("Lỗi khi sinh đề. Vui lòng kiểm tra lại quota hoặc API key.");
      setCurrentStep(Step.CONFIG);
    }
  };

  const reset = () => {
    setCurrentStep(Step.UPLOAD);
    setAnalysis(null);
    setOutline(null);
    setConfig(null);
    setExams([]);
    setProgress({ value: 0, message: '' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
        {/* Stepper */}
        <div className="mb-12 no-print overflow-x-auto pb-4">
          <div className="flex items-center justify-between relative min-w-[600px]">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
            <StepIcon
              active={currentStep === Step.UPLOAD || currentStep === Step.ANALYZING}
              completed={[Step.OUTLINE, Step.CONFIG, Step.CONFIRMING, Step.GENERATING, Step.RESULTS].includes(currentStep)}
              icon={<FileText size={20} />}
              label="Tải lên"
            />
            <StepIcon
              active={currentStep === Step.OUTLINE}
              completed={[Step.CONFIG, Step.CONFIRMING, Step.GENERATING, Step.RESULTS].includes(currentStep)}
              icon={<ClipboardList size={20} />}
              label="Dàn ý"
            />
            <StepIcon
              active={currentStep === Step.CONFIG}
              completed={[Step.CONFIRMING, Step.GENERATING, Step.RESULTS].includes(currentStep)}
              icon={<Settings size={20} />}
              label="Cấu hình"
            />
            <StepIcon
              active={currentStep === Step.CONFIRMING || currentStep === Step.GENERATING}
              completed={currentStep === Step.RESULTS}
              icon={<ListRestart size={20} />}
              label="Sinh đề"
            />
            <StepIcon
              active={currentStep === Step.RESULTS}
              completed={false}
              icon={<CheckCircle size={20} />}
              label="Kết quả"
            />
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 min-h-[400px] flex flex-col transition-all duration-300">
          {currentStep === Step.UPLOAD && (
            <FileUploadZone onUpload={handleFileUpload} />
          )}

          {currentStep === Step.ANALYZING && (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
              <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <h2 className="text-xl font-semibold text-slate-800">Đang phân tích cấu trúc...</h2>
              <p className="text-slate-500 text-center">AI đang đọc kỹ Ma trận, Đặc tả và Đề mẫu để lập dàn ý tối ưu.</p>
            </div>
          )}

          {currentStep === Step.OUTLINE && outline && (
            <ExamOutlineView outline={outline} onConfirm={handleConfirmOutline} onBack={() => setCurrentStep(Step.UPLOAD)} />
          )}

          {currentStep === Step.CONFIG && analysis && (
            <ExamGeneratorConfig analysis={analysis} onSubmit={handleConfigSubmit} />
          )}

          {currentStep === Step.CONFIRMING && analysis && config && (
            <div className="space-y-6">
              <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl">
                <h3 className="text-lg font-bold text-indigo-900 mb-4">XÁC NHẬN THÔNG TIN SINH ĐỀ</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-indigo-800">
                  <div className="space-y-2">
                    <p>• <strong>Số lượng:</strong> {config.count} đề</p>
                    <p>• <strong>Mã đề:</strong> {config.codes.join(', ') || 'Tự động'}</p>
                    <p>• <strong>Độ khó:</strong> {config.difficulty === 'original' ? 'Bám sát đề mẫu' : config.difficulty === 'easier' ? 'Dễ hơn' : 'Khó hơn'}</p>
                  </div>
                  <div className="space-y-2">
                    <p>• <strong>Cấu trúc:</strong> Đồng nhất 100% Ma trận</p>
                    <p>• <strong>Nội dung:</strong> {analysis.units.join(', ')}</p>
                    <p>• <strong>Tổng câu:</strong> {analysis.totalQuestions} câu</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setCurrentStep(Step.CONFIG)}
                  className="px-6 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors"
                >
                  Sửa cấu hình
                </button>
                <button
                  onClick={startGeneration}
                  className="px-8 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all"
                >
                  Tiến hành sinh đề
                </button>
              </div>
            </div>
          )}

          {currentStep === Step.GENERATING && (
            <GenerationProgress progress={progress.value} message={progress.message} />
          )}

          {currentStep === Step.RESULTS && (
            <div className="space-y-12">
              <div className="no-print flex justify-between items-center bg-green-50 p-4 rounded-xl border border-green-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500 rounded-full text-white">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-green-900">Hoàn tất!</h3>
                    <p className="text-sm text-green-700">Đã tạo xong {exams.length} đề thi chuẩn chất lượng.</p>
                  </div>
                </div>
                <button
                  onClick={reset}
                  className="px-4 py-2 bg-white text-slate-700 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                  <ListRestart size={18} />
                  Soạn đề mới
                </button>
              </div>

              <div className="space-y-8">
                {exams.map((exam, idx) => (
                  <ExamView key={exam.id} exam={exam} isFirst={idx === 0} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <ApiKeySettings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Footer Promotion */}
      <footer className="bg-slate-800 text-slate-300 py-8 px-4 mt-auto border-t border-slate-700 no-print">
        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-6 p-6 bg-gradient-to-r from-blue-900/40 to-indigo-900/40 rounded-2xl border border-blue-500/20 backdrop-blur-sm">
            <p className="font-bold text-lg md:text-xl text-blue-200 mb-3 leading-relaxed">
              ĐĂNG KÝ KHOÁ HỌC THỰC CHIẾN VIẾT SKKN, TẠO APP DẠY HỌC, TẠO MÔ PHỎNG TRỰC QUAN <br className="hidden md:block" />
              <span className="text-yellow-400">CHỈ VỚI 1 CÂU LỆNH</span>
            </p>
            <a
              href="https://tinyurl.com/khoahocAI2025"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-all transform hover:-translate-y-1 shadow-lg shadow-blue-900/50"
            >
              ĐĂNG KÝ NGAY
            </a>
          </div>

          <div className="space-y-2 text-sm md:text-base">
            <p className="font-medium text-slate-400">Mọi thông tin vui lòng liên hệ:</p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6">
              <a
                href="https://www.facebook.com/tranhoaithanhvicko/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-blue-400 transition-colors duration-200 flex items-center gap-2"
              >
                <span className="font-bold">Facebook:</span> tranhoaithanhvicko
              </a>
              <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-600"></div>
              <span className="hover:text-emerald-400 transition-colors duration-200 cursor-default flex items-center gap-2">
                <span className="font-bold">Zalo:</span> 0348296773
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

interface StepIconProps {
  active: boolean;
  completed: boolean;
  icon: React.ReactNode;
  label: string;
}

const StepIcon: React.FC<StepIconProps> = ({ active, completed, icon, label }) => (
  <div className="flex flex-col items-center z-10 w-24">
    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${completed ? 'bg-green-500 text-white' :
        active ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' :
          'bg-white text-slate-400 border-2 border-slate-200'
      }`}>
      {completed ? <CheckCircle size={20} /> : icon}
    </div>
    <span className={`mt-2 text-[10px] sm:text-xs font-semibold uppercase ${active || completed ? 'text-slate-800' : 'text-slate-400'}`}>
      {label}
    </span>
  </div>
);

export default App;
