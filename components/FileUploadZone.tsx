
import React, { useState } from 'react';
import { FileSpreadsheet, FileText, FileCheck, X, AlertCircle, Upload } from 'lucide-react';
import { CategorizedFiles } from '../services/geminiService';

interface FileUploadZoneProps {
  onUpload: (files: CategorizedFiles) => void;
}

type FileSlot = 'matrix' | 'specification' | 'sampleExam';

interface SlotData {
  name: string;
  content: string;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({ onUpload }) => {
  const [slots, setSlots] = useState<Record<FileSlot, SlotData | null>>({
    matrix: null,
    specification: null,
    sampleExam: null
  });
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (slot: FileSlot, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setSlots(prev => ({
        ...prev,
        [slot]: { name: file.name, content }
      }));
    };
    reader.readAsText(file);
    // Reset input so the same file can be selected again if removed
    e.target.value = '';
  };

  const clearSlot = (slot: FileSlot) => {
    setSlots(prev => ({ ...prev, [slot]: null }));
  };

  const isComplete = slots.matrix && slots.specification && slots.sampleExam;

  const handleSubmit = () => {
    if (!isComplete) {
      setError("Vui lòng tải đủ 3 loại tài liệu để AI phân tích chính xác nhất.");
      return;
    }
    onUpload(slots as CategorizedFiles);
  };

  return (
    <div className="space-y-10 w-full">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-black text-slate-800 mb-3">Tải lên tài liệu nguồn</h2>
        <p className="text-slate-500">Để AI soạn đề chính xác, hãy cung cấp đủ 3 thành phần dưới đây.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <UploadCard 
          title="1. Ma trận" 
          description="Cấu trúc mức độ (Nhận biết, Thông hiểu...)"
          icon={<FileSpreadsheet size={32} className="text-emerald-600" />}
          slot="matrix"
          data={slots.matrix}
          onChange={handleFileChange}
          onClear={clearSlot}
          accentColor="emerald"
        />
        <UploadCard 
          title="2. Đặc tả" 
          description="Nội dung kiến thức, kỹ năng chi tiết"
          icon={<FileText size={32} className="text-indigo-600" />}
          slot="specification"
          data={slots.specification}
          onChange={handleFileChange}
          onClear={clearSlot}
          accentColor="indigo"
        />
        <UploadCard 
          title="3. Đề mẫu" 
          description="Định dạng câu hỏi, phong cách ra đề"
          icon={<FileCheck size={32} className="text-amber-600" />}
          slot="sampleExam"
          data={slots.sampleExam}
          onChange={handleFileChange}
          onClear={clearSlot}
          accentColor="amber"
        />
      </div>

      <div className="max-w-md mx-auto space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 animate-bounce">
            <AlertCircle size={20} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button 
          onClick={handleSubmit}
          disabled={!isComplete}
          className={`w-full py-5 rounded-2xl font-black text-lg shadow-xl transition-all duration-300 transform ${
            isComplete 
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-1 active:scale-95 shadow-indigo-200' 
              : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200'
          }`}
        >
          TIẾN HÀNH PHÂN TÍCH
        </button>
      </div>

      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex items-start gap-4 max-w-3xl mx-auto">
        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
          <AlertCircle size={20} />
        </div>
        <div className="text-sm text-slate-600 leading-relaxed">
          <p className="font-bold text-slate-800 mb-1">Mẹo nhỏ:</p>
          AI sẽ bám sát <strong>Ma trận</strong> để tính số câu, <strong>Đặc tả</strong> để chọn nội dung và <strong>Đề mẫu</strong> để bắt chước văn phong. Khuyên dùng file định dạng <strong>.txt</strong> hoặc copy nội dung từ Word/PDF vào file văn bản để kết quả phân tích đạt độ chính xác cao nhất.
        </div>
      </div>
    </div>
  );
};

interface UploadCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  slot: FileSlot;
  data: SlotData | null;
  onChange: (slot: FileSlot, e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: (slot: FileSlot) => void;
  accentColor: 'emerald' | 'indigo' | 'amber';
}

const UploadCard: React.FC<UploadCardProps> = ({ title, description, icon, slot, data, onChange, onClear, accentColor }) => {
  const accentClasses = {
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700 hover:border-emerald-300',
    indigo: 'bg-indigo-50 border-indigo-100 text-indigo-700 hover:border-indigo-300',
    amber: 'bg-amber-50 border-amber-100 text-amber-700 hover:border-amber-300'
  };

  const iconBgClasses = {
    emerald: 'bg-emerald-100',
    indigo: 'bg-indigo-100',
    amber: 'bg-amber-100'
  };

  return (
    <div className={`relative h-full border-2 rounded-2xl p-6 transition-all group flex flex-col ${
      data ? accentClasses[accentColor] : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg'
    }`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
        data ? 'bg-white shadow-sm' : iconBgClasses[accentColor]
      }`}>
        {icon}
      </div>
      
      <h3 className="font-bold text-slate-800 text-lg mb-1">{title}</h3>
      <p className="text-xs text-slate-500 mb-6 leading-relaxed flex-grow">{description}</p>

      {data ? (
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-inherit">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-sm font-bold truncate text-slate-700">{data.name}</span>
          </div>
          <button 
            onClick={() => onClear(slot)}
            className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors text-slate-400"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <label className="cursor-pointer block">
          <div className="flex items-center justify-center gap-2 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-100 transition-all border-dashed">
            <Upload size={16} />
            <span>Tải file lên</span>
          </div>
          <input 
            type="file" 
            className="hidden" 
            onChange={(e) => onChange(slot, e)}
          />
        </label>
      )}
    </div>
  );
};

export default FileUploadZone;
