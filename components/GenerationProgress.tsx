
import React from 'react';
import { Loader2 } from 'lucide-react';

interface GenerationProgressProps {
  progress: number;
  message: string;
}

const GenerationProgress: React.FC<GenerationProgressProps> = ({ progress, message }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 max-w-lg mx-auto w-full">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
        <div 
          className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"
        ></div>
        <div className="absolute inset-0 flex items-center justify-center font-bold text-indigo-600">
          {Math.round(progress)}%
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Đang sinh đề thi...</h2>
      <p className="text-slate-500 text-center mb-8">{message}</p>
      
      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-indigo-600 transition-all duration-500 ease-out" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 w-full mt-6">
        <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg">
          <Loader2 className={`animate-spin text-indigo-600 ${progress > 20 ? 'opacity-0' : 'opacity-100'}`} size={18} />
          <span className={`text-sm ${progress > 20 ? 'text-green-600 font-medium' : 'text-slate-600'}`}>Phần Trắc nghiệm: {progress > 20 ? 'Xong' : 'Đang xử lý...'}</span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg">
          <Loader2 className={`animate-spin text-indigo-600 ${progress > 60 || progress < 21 ? 'opacity-0' : 'opacity-100'}`} size={18} />
          <span className={`text-sm ${progress > 60 ? 'text-green-600 font-medium' : 'text-slate-600'}`}>Phần Đọc hiểu: {progress > 60 ? 'Xong' : 'Đang xử lý...'}</span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg">
          <Loader2 className={`animate-spin text-indigo-600 ${progress > 90 || progress < 61 ? 'opacity-0' : 'opacity-100'}`} size={18} />
          <span className={`text-sm ${progress > 90 ? 'text-green-600 font-medium' : 'text-slate-600'}`}>Phần Tự luận & Đáp án: {progress > 90 ? 'Xong' : 'Đang xử lý...'}</span>
        </div>
      </div>
    </div>
  );
};

export default GenerationProgress;
