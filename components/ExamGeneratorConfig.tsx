
import React, { useState } from 'react';
import { AnalysisResult, GeneratorConfig } from '../types';
import { Settings, Info } from 'lucide-react';

interface ExamGeneratorConfigProps {
  analysis: AnalysisResult;
  onSubmit: (config: GeneratorConfig) => void;
}

const ExamGeneratorConfig: React.FC<ExamGeneratorConfigProps> = ({ analysis, onSubmit }) => {
  const [count, setCount] = useState(2);
  const [codes, setCodes] = useState('101, 102');
  const [difficulty, setDifficulty] = useState<'original' | 'easier' | 'harder'>('original');
  const [specialReq, setSpecialReq] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const codesArray = codes.split(',').map(c => c.trim()).filter(c => c !== '');
    onSubmit({
      count,
      codes: codesArray,
      difficulty,
      specialRequirements: specialReq
    });
  };

  return (
    <div className="max-w-3xl mx-auto w-full">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
          <Settings size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Thông tin sinh đề</h2>
          <p className="text-slate-500">Tùy chỉnh các thông số để AI sinh đề thi phù hợp.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="text-sm font-bold text-slate-800 mb-2">📊 Thông tin từ tài liệu:</h4>
            <ul className="text-sm text-slate-600 space-y-1.5">
              <li>• Môn: Tiếng Anh 10</li>
              <li>• Nội dung: {analysis.units.join(', ')}</li>
              <li>• Thời gian: {analysis.timeLimit} phút</li>
              <li>• Tỷ lệ: {analysis.ratios.multipleChoice}% TN + {analysis.ratios.essay}% TL</li>
              <li>• Tổng số câu: {analysis.totalQuestions} câu</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
            <Info className="text-blue-500 shrink-0" size={18} />
            <p className="text-xs text-blue-700 leading-relaxed">
              Dựa vào đặc tả, đề thi sẽ bao gồm phần nghe, nói, đọc, viết. Phân bố độ khó sẽ bám sát 100% Ma trận đã tải lên.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">1. Số lượng đề cần tạo</label>
            <input 
              type="number" 
              min="1" 
              max="10"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">2. Mã đề (phân cách bằng dấu phẩy)</label>
            <input 
              type="text" 
              placeholder="101, 102, 103..."
              value={codes}
              onChange={(e) => setCodes(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">3. Độ khó mong muốn</label>
            <select 
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="original">Giữ nguyên như đề mẫu (khuyến nghị)</option>
              <option value="easier">Dễ hơn một chút</option>
              <option value="harder">Khó hơn một chút</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">4. Yêu cầu đặc biệt (tùy chọn)</label>
            <textarea 
              rows={3}
              placeholder="Ví dụ: Tập trung nhiều vào Unit 5, thêm câu hỏi về từ vựng môi trường..."
              value={specialReq}
              onChange={(e) => setSpecialReq(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
          >
            Tiếp tục xác nhận
          </button>
        </form>
      </div>
    </div>
  );
};

export default ExamGeneratorConfig;
