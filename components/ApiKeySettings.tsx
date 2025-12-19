
import React, { useState, useEffect } from 'react';
import { X, Key, Check, Cpu } from 'lucide-react';

interface ApiKeySettingsProps {
    isOpen: boolean;
    onClose: () => void;
}

const MODELS = [
    { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview', desc: 'Tốc độ cao, tối ưu chi phí (Mặc định)', recommended: true },
    { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro Preview', desc: 'Thông minh hơn, xử lý phức tạp', recommended: false },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Phiên bản ổn định, nhanh', recommended: false },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', desc: 'Phiên bản ổn định, mạnh mẽ', recommended: false },
];

const ApiKeySettings: React.FC<ApiKeySettingsProps> = ({ isOpen, onClose }) => {
    const [apiKey, setApiKey] = useState('');
    const [selectedModel, setSelectedModel] = useState('gemini-3-flash-preview');

    useEffect(() => {
        const storedKey = localStorage.getItem('GEMINI_API_KEY');
        const storedModel = localStorage.getItem('GEMINI_MODEL');
        if (storedKey) setApiKey(storedKey);
        if (storedModel) setSelectedModel(storedModel);
    }, [isOpen]);

    const handleSave = () => {
        if (!apiKey.trim()) {
            alert('Vui lòng nhập API Key');
            return;
        }
        localStorage.setItem('GEMINI_API_KEY', apiKey.trim());
        localStorage.setItem('GEMINI_MODEL', selectedModel);
        onClose();
        window.location.reload(); // Reload to apply changes to services
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-in">
                <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-white">
                        <div className="p-2 bg-indigo-500 rounded-lg">
                            <Key size={20} />
                        </div>
                        <h2 className="text-xl font-bold">Cấu hình AI & API Key</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 max-h-[80vh] overflow-y-auto">
                    {/* API Key Section */}
                    <div className="mb-8">
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Google Gemini API Key <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Nhập API Key của bạn (bắt đầu bằng AIza...)"
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                            />
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                            Chưa có key? <a href="https://aistudio.google.com/api-keys" target="_blank" rel="noreferrer" className="text-indigo-600 font-semibold hover:underline">Lấy key miễn phí tại đây</a>
                        </p>
                    </div>

                    {/* Model Selection */}
                    <div className="mb-8">
                        <label className="block text-sm font-bold text-slate-700 mb-3">
                            Chọn Model AI Ưu tiên
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {MODELS.map((model) => (
                                <div
                                    key={model.id}
                                    onClick={() => setSelectedModel(model.id)}
                                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all relative ${selectedModel === model.id
                                            ? 'border-indigo-600 bg-indigo-50'
                                            : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-1 p-1.5 rounded-md ${selectedModel === model.id ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                            <Cpu size={16} />
                                        </div>
                                        <div>
                                            <h4 className={`font-bold text-sm ${selectedModel === model.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                                                {model.name}
                                            </h4>
                                            <p className="text-xs text-slate-500 mt-1">{model.desc}</p>
                                        </div>
                                    </div>
                                    {selectedModel === model.id && (
                                        <div className="absolute top-2 right-2 text-indigo-600">
                                            <Check size={16} strokeWidth={3} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-lg text-slate-600 font-medium hover:bg-slate-100 transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5"
                        >
                            Lưu Cấu hình
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApiKeySettings;
