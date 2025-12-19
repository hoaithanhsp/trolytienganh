
import React from 'react';
import { ExamOutline } from '../types';
import { ClipboardList, ArrowLeft, ArrowRight } from 'lucide-react';

interface ExamOutlineViewProps {
  outline: ExamOutline;
  onConfirm: () => void;
  onBack: () => void;
}

const ExamOutlineView: React.FC<ExamOutlineViewProps> = ({ outline, onConfirm, onBack }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
          <ClipboardList size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dàn ý chi tiết của đề thi</h2>
          <p className="text-slate-500">AI đã lập kế hoạch cấu trúc dựa trên Ma trận và Đặc tả.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-center w-16">STT</th>
                <th className="px-6 py-4">Phần thi / Dạng bài</th>
                <th className="px-6 py-4 text-center">Số câu</th>
                <th className="px-6 py-4 text-center">Điểm</th>
                <th className="px-6 py-4">Mô tả chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {outline.sections.map((section, index) => (
                <tr key={index} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="px-6 py-4 text-center font-medium text-slate-400">{index + 1}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{section.title}</td>
                  <td className="px-6 py-4 text-center">{section.questionCount}</td>
                  <td className="px-6 py-4 text-center font-semibold text-indigo-600">{section.points.toFixed(1)}</td>
                  <td className="px-6 py-4 text-slate-600">{section.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200">
          <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
            Phân tích mức độ kiến thức (Matrix Analysis):
          </h4>
          <p className="text-sm text-slate-600 italic leading-relaxed pl-4 border-l-2 border-indigo-200 ml-1">
            {outline.matrixAnalysis}
          </p>
        </div>
      </div>

      <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-amber-800 text-sm flex items-start gap-3">
        <div className="mt-0.5">⚠️</div>
        <div>
          <strong>Xác nhận cấu trúc:</strong> Hãy kiểm tra kỹ dàn ý trên. Nếu đồng ý, AI sẽ bắt đầu sinh nội dung câu hỏi chi tiết dựa trên các phần này.
        </div>
      </div>

      <div className="flex justify-between items-center pt-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-600 font-medium transition-all"
        >
          <ArrowLeft size={18} />
          Tải lại file
        </button>
        <button 
          onClick={onConfirm}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all transform hover:-translate-y-0.5"
        >
          Đồng ý & Tiếp tục cấu hình
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default ExamOutlineView;
