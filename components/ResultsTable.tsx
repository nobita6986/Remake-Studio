
import React, { useState, ChangeEvent, useEffect } from 'react';
import type { TableRowData, Character, Style } from '../types';
import { fileToBase64 } from '../utils/fileUtils';
import { FileDropzone } from './FileDropzone';
import { ResultRow } from './ResultRow';
import { InfoIcon } from './icons';

interface ResultsTableProps {
  tableData: TableRowData[];
  characters: Character[];
  defaultCharacterIndex: number | null;
  onUpdateRow: (row: TableRowData) => void;
  onGenerateImage: (rowId: number) => void;
  onGenerateAllImages: () => void;
  onGenerateAllVideoPrompts: () => void;
  onGenerateVideoPrompt: (rowId: number) => void;
  onDownloadAll: () => void;
  onStartRemake: (row: TableRowData) => void;
  selectedStyle: Style;
  onViewImage: (imageUrl: string, rowId: number) => void;
  onOpenHistory: (row: TableRowData) => void;
  onSendToVideo: (rowId: number) => void;
}

const Tooltip: React.FC<{ text: string }> = ({ text }) => (
    <div className="relative flex items-center group">
        <InfoIcon className="w-4 h-4 ml-1 text-gray-400 dark:text-gray-500 cursor-pointer" />
        <div className="absolute bottom-full mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            {text}
        </div>
    </div>
);


export const ResultsTable: React.FC<ResultsTableProps> = ({ tableData, characters, onUpdateRow, onGenerateImage, onGenerateAllImages, onGenerateAllVideoPrompts, onDownloadAll, selectedStyle, onViewImage, onStartRemake, onOpenHistory, onSendToVideo, onGenerateVideoPrompt, defaultCharacterIndex }) => {
  const headers = [
    { text: "STT", tooltip: "Số thứ tự phân cảnh. Khi tải các file ảnh được tạo ra từ phân cảnh này, ảnh sẽ được đặt tên giống tên của ô trong cột này. Cột này nhập liệu là cột A trên bảng Excel up lên." },
    { text: "Ngôn ngữ khác", tooltip: "Tương ứng với nội dung trong cột B của file Excel." },
    { text: "Phân cảnh tiếng Việt", tooltip: "Tương ứng với nội dung trong cột C của file Excel." },
    { text: "Tên prompt", tooltip: "Tóm tắt những gì xảy ra trong phân cảnh này để check tính chính xác của ảnh tạo ra. Tương ứng với cột D của file Excel." },
    { text: "Prompt bối cảnh (Editable)", tooltip: "Tương ứng với cột E của file Excel." },
    { text: "Nhân vật", tooltip: null },
    { text: "Hành động", tooltip: null },
    { text: "Kết quả", tooltip: null },
    { text: "Prompt video", tooltip: null },
  ];

  return (
    <div>
        <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600 dark:text-gray-400">Chỉnh sửa trực tiếp nội dung ở cột "Prompt bối cảnh".</p>
            <div className="flex gap-2">
                <button onClick={onGenerateAllVideoPrompts} className="font-semibold py-2 px-4 rounded-lg bg-green-600 text-white hover:bg-green-500 transition-colors">Video Prompting All</button>
                <button onClick={onGenerateAllImages} className="font-semibold py-2 px-4 rounded-lg bg-green-600 text-white hover:bg-green-500 transition-colors">Tạo ảnh hàng loạt</button>
                <button onClick={onDownloadAll} className="font-semibold py-2 px-4 rounded-lg bg-green-600 text-white hover:bg-green-500 transition-colors">Tải tất cả hàng loạt (ZIP)</button>
            </div>
        </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-gray-300 dark:border-gray-700">
              {headers.map(h => 
                <th key={h.text} className="p-3 text-center text-green-700 dark:text-green-300 font-semibold">
                    <div className="flex items-center justify-center">
                        {h.text}
                        {h.tooltip && <Tooltip text={h.tooltip} />}
                    </div>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {tableData.map(row => (
              <ResultRow key={row.id} rowData={row} characters={characters} onUpdateRow={onUpdateRow} onGenerateImage={onGenerateImage} onGenerateVideoPrompt={onGenerateVideoPrompt} selectedStyle={selectedStyle} onViewImage={onViewImage} onStartRemake={onStartRemake} onOpenHistory={onOpenHistory} onSendToVideo={onSendToVideo} defaultCharacterIndex={defaultCharacterIndex} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
