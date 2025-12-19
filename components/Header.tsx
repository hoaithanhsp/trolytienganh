import React from 'react';
import { GraduationCap, Settings } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  return (
    <header className="no-print bg-white border-b border-slate-200 py-4 px-6 flex items-center justify-between shadow-sm sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
          <GraduationCap size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">TRỢ LÝ SINH ĐỀ TIẾNG ANH</h1>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Phiên bản chuyên nghiệp</p>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 transition-colors animate-pulse"
        >
          <Settings size={16} />
          <span className="text-xs font-bold">Lấy API key để sử dụng app</span>
        </button>

        <div className="hidden md:flex items-center gap-6">
          <nav className="flex gap-4 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-indigo-600 transition-colors">Hướng dẫn</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Thư viện</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Liên hệ</a>
          </nav>
          <div className="h-6 w-px bg-slate-200"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
              <span className="text-xs font-bold">GV</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
