
import React, { useState } from 'react';

interface LanguageSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLanguage: (language: string) => void;
}

const PRESET_LANGUAGES = ['English', 'Hàn', 'Nhật', 'Đức', 'Tây Ban Nha', 'Pháp'];

export const LanguageSelectionModal: React.FC<LanguageSelectionModalProps> = ({ isOpen, onClose, onSelectLanguage }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [customLanguage, setCustomLanguage] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    const finalLanguage = selectedLanguage === 'Other' ? customLanguage.trim() : selectedLanguage;
    if (finalLanguage) {
      onSelectLanguage(finalLanguage);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-[80] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#0b2b1e] border border-gray-200 dark:border-[#1f4d3a] p-8 rounded-xl space-y-6 max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center">Chọn ngôn ngữ</h3>
        <p className="text-gray-700 dark:text-gray-300 text-center">Ngoài tiếng Việt, kịch bản của bạn sử dụng ngôn ngữ nào?</p>
        
        <div className="space-y-3">
            {PRESET_LANGUAGES.map(lang => (
                 <button
                    key={lang}
                    onClick={() => { setSelectedLanguage(lang); setCustomLanguage(''); }}
                    className={`w-full text-left p-3 rounded-md border-2 transition-colors ${
                        selectedLanguage === lang
                            ? 'bg-green-100 dark:bg-green-800 border-green-400'
                            : 'bg-gray-100 dark:bg-[#0f3a29] border-transparent hover:border-green-300'
                    }`}
                >
                    {lang}
                </button>
            ))}
             <button
                onClick={() => setSelectedLanguage('Other')}
                 className={`w-full text-left p-3 rounded-md border-2 transition-colors ${
                    selectedLanguage === 'Other'
                        ? 'bg-green-100 dark:bg-green-800 border-green-400'
                        : 'bg-gray-100 dark:bg-[#0f3a29] border-transparent hover:border-green-300'
                }`}
            >
                Ngôn ngữ khác...
            </button>
            {selectedLanguage === 'Other' && (
                <input
                    type="text"
                    value={customLanguage}
                    onChange={(e) => setCustomLanguage(e.target.value)}
                    placeholder="Nhập tên ngôn ngữ..."
                    className="mt-2 w-full bg-gray-50 dark:bg-[#020a06] border border-gray-300 dark:border-[#1f4d3a] text-gray-900 dark:text-gray-200 p-2 rounded-md focus:ring-1 focus:ring-green-400 focus:border-green-400 outline-none"
                    autoFocus
                />
            )}
        </div>

        <div className="flex justify-center gap-4 pt-4">
          <button
            onClick={handleConfirm}
            disabled={selectedLanguage === 'Other' && !customLanguage.trim()}
            className="font-semibold py-2 px-6 rounded-lg bg-green-600 text-white hover:bg-green-500 transition-colors disabled:opacity-50"
          >
            Xác nhận
          </button>
           <button onClick={onClose} className="font-semibold py-2 px-6 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-500 transition-colors">
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};
