import React, { useState, useEffect } from 'react';
import { X, Key, Check, Info } from 'lucide-react';
import { AVAILABLE_MODELS } from '../services/geminiService';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    apiKey: string;
    setApiKey: (key: string) => void;
    model: string;
    setModel: (model: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, apiKey, setApiKey, model, setModel }) => {
    const [tempKey, setTempKey] = useState(apiKey);

    useEffect(() => {
        setTempKey(apiKey);
    }, [apiKey]);

    const handleSave = () => {
        setApiKey(tempKey);
        localStorage.setItem('gemini_api_key', tempKey);
        localStorage.setItem('gemini_model', model);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
                    <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <Key className="w-5 h-5 text-blue-600" /> API Settings
                    </h2>
                    {apiKey && (
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
                            <X size={20} />
                        </button>
                    )}
                </div>

                <div className="p-6 space-y-6">
                    {/* API Key Section */}
                    <div className="space-y-3">
                        <label className="block text-sm font-bold text-slate-700">
                            Google Gemini API Key <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                value={tempKey}
                                onChange={(e) => setTempKey(e.target.value)}
                                placeholder="Paste your API key here..."
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
                            />
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Info className="w-3 h-3" />
                            Key is stored locally in your browser.
                        </p>
                    </div>

                    {/* Model Selection Section */}
                    <div className="space-y-3">
                        <label className="block text-sm font-bold text-slate-700">
                            AI Model Preference
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                            {AVAILABLE_MODELS.map((m) => (
                                <div
                                    key={m.id}
                                    onClick={() => setModel(m.id)}
                                    className={`cursor-pointer p-3 rounded-xl border transition-all flex items-center justify-between ${model === m.id
                                            ? 'bg-blue-50 border-blue-500 shadow-sm'
                                            : 'bg-white border-slate-200 hover:border-blue-300'
                                        }`}
                                >
                                    <div className="flex flex-col">
                                        <span className={`font-semibold text-sm ${model === m.id ? 'text-blue-700' : 'text-slate-700'}`}>
                                            {m.name}
                                        </span>
                                        <span className="text-xs text-slate-400 font-mono">{m.id}</span>
                                    </div>
                                    {model === m.id && (
                                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={!tempKey}
                        className={`px-6 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all ${tempKey
                                ? 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5'
                                : 'bg-slate-300 cursor-not-allowed'
                            }`}
                    >
                        Save Configuration
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
