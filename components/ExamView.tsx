
import React, { useState } from 'react';
import { Exam } from '../types';
import { Printer, Copy, Eye, EyeOff, Layout, ClipboardCheck, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ExamViewProps {
  exam: Exam;
  isFirst?: boolean;
}

const ExamView: React.FC<ExamViewProps> = ({ exam, isFirst }) => {
  const [showAnswers, setShowAnswers] = useState(false);
  const [showStats, setShowStats] = useState(isFirst);
  const [copied, setCopied] = useState(false);

  const stats = exam.difficultyStats || {
    recognition: 0,
    understanding: 0,
    application: 0,
    highApplication: 0
  };

  const difficultyData = [
    { name: 'Nhận biết', value: stats.recognition, color: '#6366f1' },
    { name: 'Thông hiểu', value: stats.understanding, color: '#3b82f6' },
    { name: 'Vận dụng', value: stats.application, color: '#10b981' },
    { name: 'Vận dụng cao', value: stats.highApplication, color: '#f59e0b' },
  ];

  const handlePrint = () => {
    window.print();
  };

  const formatExamForWord = () => {
    let text = `SỞ GD&ĐT [TÊN SỞ]\t\t\t\tĐỀ THI HỌC KÌ I\n`;
    text += `TRƯỜNG THPT [TÊN TRƯỜNG]\t\t\tNĂM HỌC 2024 - 2025\n\n`;
    text += `\t\tĐỀ THI MÔN: TIẾNG ANH - LỚP 10\n`;
    text += `\t\tThời gian làm bài: ${exam.timeMinutes} phút\n\n`;
    text += `\t\t\tMÃ ĐỀ: ${exam.code}\n\n`;
    text += `Họ và tên thí sinh: ........................................................... SBD: ......................\n`;
    text += `------------------------------------------------------------------------------------------\n`;
    text += `Nội dung kiểm tra: ${exam.units.join(', ')}\n\n`;

    exam.questions.forEach((q, i) => {
      text += `Question ${i + 1}: ${q.questionText}\n`;
      text += `A. ${q.options.A}\t\tB. ${q.options.B}\t\tC. ${q.options.C}\t\tD. ${q.options.D}\n\n`;
    });

    if (exam.essayPrompt) {
      text += `\nPHẦN TỰ LUẬN (3.0 ĐIỂM)\n`;
      text += `${exam.essayPrompt}\n`;
      text += `..........................................................................................................................................\n`;
      text += `..........................................................................................................................................\n`;
    }

    text += `\n\t\t\t--- HẾT ---\n\n`;
    text += `\n==========================================================================================\n`;
    text += `\t\tĐÁP ÁN VÀ HƯỚNG DẪN CHẤM - MÃ ĐỀ: ${exam.code}\n\n`;
    
    // Tạo bảng đáp án dạng lưới đơn giản
    const perRow = 5;
    for (let i = 0; i < exam.questions.length; i += perRow) {
      const chunk = exam.questions.slice(i, i + perRow);
      let rowNums = "";
      let rowAns = "";
      chunk.forEach((q, idx) => {
        rowNums += `${i + idx + 1}\t`;
        rowAns += `${q.correctAnswer}\t`;
      });
      text += rowNums + "\n" + rowAns + "\n\n";
    }

    if (exam.questions.some(q => q.explanation)) {
      text += `GIẢI THÍCH CHI TIẾT:\n`;
      exam.questions.forEach((q, i) => {
        if (q.explanation) {
          text += `Câu ${i + 1}: ${q.explanation}\n`;
        }
      });
    }

    return text;
  };

  const handleCopyToWord = () => {
    const formattedText = formatExamForWord();
    navigator.clipboard.writeText(formattedText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-indigo-600 text-white rounded-full text-sm font-bold">MÃ ĐỀ: {exam.code}</div>
          <h2 className="text-xl font-bold text-slate-800">{exam.title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowStats(!showStats)}
            className={`p-2 rounded-lg border transition-all ${showStats ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            title="Phân tích độ khó"
          >
            <Layout size={20} />
          </button>
          <button 
            onClick={() => setShowAnswers(!showAnswers)}
            className={`p-2 rounded-lg border transition-all ${showAnswers ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            title={showAnswers ? "Ẩn đáp án" : "Hiện đáp án"}
          >
            {showAnswers ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          <button onClick={handlePrint} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-all" title="In đề thi">
            <Printer size={20} />
          </button>
          <button 
            onClick={handleCopyToWord}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all shadow-sm ${copied ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
          >
            {copied ? <ClipboardCheck size={18} /> : <FileText size={18} />}
            <span>{copied ? "Đã sao chép!" : "Sao chép cho Word"}</span>
          </button>
        </div>
      </div>

      {showStats && (
        <div className="no-print grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <div className="md:col-span-2 h-[200px]">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Phân bố độ khó (% câu hỏi)</h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={difficultyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <Tooltip cursor={{fill: '#e2e8f0'}} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {difficultyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Thống kê chi tiết</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                <p className="text-xs text-slate-400">Trắc nghiệm</p>
                <p className="text-lg font-bold text-slate-700">7.0đ</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                <p className="text-xs text-slate-400">Tự luận</p>
                <p className="text-lg font-bold text-slate-700">3.0đ</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                <p className="text-xs text-slate-400">Tổng câu</p>
                <p className="text-lg font-bold text-slate-700">{exam.questions.length}</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                <p className="text-xs text-slate-400">Thời gian</p>
                <p className="text-lg font-bold text-slate-700">{exam.timeMinutes}'</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gợi ý cho người dùng */}
      {copied && (
        <div className="no-print bg-green-50 text-green-700 p-3 rounded-lg border border-green-100 text-sm animate-in slide-in-from-top duration-300">
           💡 <strong>Mẹo:</strong> Bây giờ bạn có thể mở Microsoft Word và nhấn <strong>Ctrl + V</strong> để dán nội dung đã sao chép. Bản sao bao gồm cả đề thi và đáp án.
        </div>
      )}

      <div className="exam-paper">
        <div className="text-center space-y-2 mb-8 border-b-2 border-slate-800 pb-6">
          <div className="flex justify-between font-bold text-sm">
            <div className="text-left uppercase">
              SỞ GD&ĐT [Tên Sở]<br />
              TRƯỜNG THPT [Tên Trường]
            </div>
            <div className="text-right">
              ĐỀ THI HỌC KÌ I<br />
              NĂM HỌC 2024 - 2025
            </div>
          </div>
          <div className="mt-4">
            <h1 className="text-xl font-black uppercase">ĐỀ THI MÔN: TIẾNG ANH - LỚP 10</h1>
            <p className="text-sm font-medium italic mt-1">Thời gian làm bài: {exam.timeMinutes} phút (Không kể thời gian phát đề)</p>
          </div>
          <div className="flex justify-center mt-4">
            <div className="border-2 border-slate-800 px-6 py-1 font-bold text-lg">MÃ ĐỀ: {exam.code}</div>
          </div>
        </div>

        <div className="mb-8 font-medium">
          Họ và tên thí sinh: ............................................................................ SBD: ......................
        </div>

        <div className="font-bold border-y border-slate-400 py-1 mb-6 text-sm text-center">
          Nội dung kiểm tra: {exam.units.join(', ')} ({exam.topics.join(', ')})
        </div>

        <div className="space-y-6">
          {exam.questions.map((q, i) => (
            <div key={q.id || i} className="question-item">
              <p className="font-bold mb-2">Question {i + 1}. {q.questionText}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm ml-4">
                {q.options && Object.entries(q.options).map(([key, val]) => (
                  <div key={key} className={`flex items-start gap-1 ${showAnswers && key === q.correctAnswer ? 'text-green-600 font-bold' : ''}`}>
                    <span className="font-bold">{key}.</span>
                    <span>{val}</span>
                  </div>
                ))}
              </div>
              {showAnswers && q.explanation && (
                <p className="text-xs italic text-slate-500 mt-2 ml-4">Giải thích: {q.explanation}</p>
              )}
            </div>
          ))}
        </div>

        {exam.essayPrompt && (
          <div className="mt-12 pt-8 border-t border-slate-200">
            <h3 className="font-black uppercase mb-4 underline">PHẦN TỰ LUẬN (3.0 ĐIỂM)</h3>
            <p className="font-medium leading-relaxed">{exam.essayPrompt}</p>
            <div className="mt-4 border-b border-dashed border-slate-300 h-24"></div>
            <div className="mt-4 border-b border-dashed border-slate-300 h-24"></div>
          </div>
        )}

        <div className="mt-12 text-center border-t-2 border-slate-800 pt-6">
          <p className="font-black">--- HẾT ---</p>
          <p className="text-xs mt-2 italic">Thí sinh không được sử dụng tài liệu. Cán bộ coi thi không giải thích gì thêm.</p>
        </div>

        {showAnswers && (
          <div className="mt-16 pt-12 border-t-4 border-double border-slate-800 break-before-page">
            <h2 className="text-center font-black text-xl mb-8 uppercase">ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM - MÃ ĐỀ: {exam.code}</h2>
            <div className="grid grid-cols-5 gap-4">
              {exam.questions.map((q, i) => (
                <div key={q.id || i} className="flex border border-slate-300 p-2 text-sm justify-between">
                  <span className="font-bold">{i + 1}.</span>
                  <span className="font-black text-indigo-600">{q.correctAnswer}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamView;
