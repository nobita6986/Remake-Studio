
import React from 'react';

interface PresentScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (language: 'vietnamese' | 'otherLang') => void;
}

export const PresentScriptModal: React.FC<PresentScriptModalProps> = ({ isOpen, onClose, onComplete }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-[80] p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-[#0b2b1e] border border-gray-200 dark:border-[#1f4d3a] p-8 rounded-xl space-y-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center">Trình bày kịch bản</h3>
        <p className="text-gray-700 dark:text-gray-300 text-center">Kịch bản đã xử lý được viết bằng ngôn ngữ gì?</p>
        <div className="flex justify-center gap-4 pt-4">
          <button 
            onClick={() => onComplete('vietnamese')}
            className="font-semibold py-2 px-6 rounded-lg bg-green-600 text-white hover:bg-green-500 transition-colors"
          >
            Tiếng Việt
          </button>
          <button 
            onClick={() => onComplete('otherLang')}
            className="font-semibold py-2 px-6 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-500 transition-colors"
          >
            Ngôn ngữ khác
          </button>
        </div>
         <div className="text-center mt-2">
            <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
                Hủy
            </button>
        </div>
      </div>
    </div>
  );
};
