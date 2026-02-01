import React from 'react';
import type { TableRowData } from '../types';

interface VersionHistoryModalProps {
  isOpen: boolean;
  rowData: TableRowData | null;
  onClose: () => void;
  onSetMain: (rowId: number, index: number) => void;
  onDownloadAll: (row: TableRowData) => void;
}

const MediaItem: React.FC<{ src: string }> = ({ src }) => {
  if (src.startsWith('data:video/')) {
    return <video controls src={src} className="w-full h-full object-contain" />;
  }
  return <img src={src} alt="Generated asset" className="w-full h-full object-contain" />;
};

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({ isOpen, rowData, onClose, onSetMain, onDownloadAll }) => {
  if (!isOpen || !rowData) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white dark:bg-[#0b2b1e] border border-gray-200 dark:border-[#1f4d3a] p-8 rounded-xl space-y-6 w-full max-w-6xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Lịch sử phiên bản cho: <span className="text-green-600 dark:text-green-300">"{rowData.originalRow[3]}"</span>
          </h2>
          <div className="flex items-center gap-4">
            <button onClick={() => onDownloadAll(rowData)} className="font-semibold py-2 px-4 rounded-lg bg-teal-600 text-white hover:bg-teal-500 transition-colors">
                Tải tất cả
            </button>
            <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-3xl" aria-label="Close">&times;</button>
          </div>
        </div>

        <div className="overflow-y-auto flex-grow -mr-4 pr-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {rowData.generatedImages.map((src, index) => (
              <div key={index} className={`relative group border-2 rounded-lg ${index === rowData.mainImageIndex ? 'border-green-400 shadow-lg shadow-green-500/20' : 'border-transparent'}`}>
                <div className="aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-black/20 rounded-md overflow-hidden">
                    <MediaItem src={src} />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 flex justify-between items-center transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                    <span className="text-white font-bold text-sm">Phiên bản {index + 1}</span>
                    {index === rowData.mainImageIndex ? (
                        <span className="text-xs font-semibold py-1 px-2 rounded-full bg-green-500 text-white dark:bg-green-400 dark:text-[#051a11]">
                            ✓ Chính
                        </span>
                    ) : (
                        <button 
                            onClick={() => onSetMain(rowData.id, index)}
                            className="text-xs font-semibold py-1 px-2 rounded-full bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-500 transition-colors"
                        >
                            Đặt làm chính
                        </button>
                    )}
                </div>
                 {index === rowData.mainImageIndex && (
                     <div className="absolute top-2 right-2 text-xs font-semibold py-1 px-2 rounded-full bg-green-500 text-white dark:bg-green-400 dark:text-[#051a11] pointer-events-none">
                        Chính
                    </div>
                 )}
              </div>
            ))}
             {rowData.generatedImages.length === 0 && (
                <p className="col-span-full text-center text-gray-500 dark:text-gray-400 py-16">Chưa có phiên bản nào.</p>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};