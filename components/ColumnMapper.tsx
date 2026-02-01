
import React, { useState } from 'react';
import type { ExcelRow, ColumnMapping, MappedColumn } from '../types';

interface ColumnMapperProps {
  excelData: ExcelRow[];
  onComplete: (mapping: ColumnMapping) => void;
  onCancel: () => void;
}

const COLUMN_DEFINITIONS: { id: MappedColumn; label: string; description: string; }[] = [
  { id: 'stt', label: 'STT', description: 'Số thứ tự. Dùng để xác định nhân vật. Nếu không có, số thứ tự sẽ được tự động tạo.' },
  { id: 'otherLang', label: 'Ngôn ngữ khác', description: 'Cột phân cảnh bằng ngôn ngữ gốc (không phải tiếng Việt).' },
  { id: 'vietnamese', label: 'Tiếng Việt', description: 'Cột phân cảnh bằng tiếng Việt.' },
  { id: 'promptName', label: 'Tên prompt', description: 'Tóm tắt ý đồ của ảnh minh họa (ví dụ: "Nhân vật A buồn bã nhìn ra cửa sổ").' },
  { id: 'contextPrompt', label: 'Prompt bối cảnh', description: 'Mô tả chi tiết về bối cảnh, hành động, góc máy...' },
];

export const ColumnMapper: React.FC<ColumnMapperProps> = ({ excelData, onComplete, onCancel }) => {
    const [step, setStep] = useState(0);
    const [mapping, setMapping] = useState<ColumnMapping>({});
    const [error, setError] = useState<string | null>(null);

    const headers = excelData[0];
    const previewData = excelData.slice(1, 21);
    const totalColumns = headers.length;

    const handleNext = () => {
        if (step < totalColumns - 1) {
            setStep(step + 1);
            setError(null);
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setStep(step - 1);
            setError(null);
        }
    };

    const handleSelectMapping = (columnType: MappedColumn | 'skip') => {
        const newMapping = { ...mapping };
        
        Object.keys(newMapping).forEach(key => {
            if (newMapping[key as MappedColumn] === step) {
                delete newMapping[key as MappedColumn];
            }
        });
        
        if (columnType !== 'skip') {
            newMapping[columnType] = step;
        }

        setMapping(newMapping);
    };

    const handleFinish = () => {
        if (mapping.vietnamese === undefined && mapping.otherLang === undefined) {
            setError('Bạn phải chọn ít nhất một trong hai cột: "Ngôn ngữ khác" hoặc "Tiếng Việt".');
            return;
        }
        setError(null);
        onComplete(mapping);
    };

    const currentMappingForStep = Object.keys(mapping).find(key => mapping[key as MappedColumn] === step) as MappedColumn | undefined;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-[60] p-4" onClick={onCancel}>
            <div 
                className="bg-white dark:bg-[#0b2b1e] border border-gray-200 dark:border-[#1f4d3a] p-8 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Ánh xạ cột Excel</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Định dạng tệp Excel của bạn không chuẩn. Vui lòng cho biết mỗi cột tương ứng với loại dữ liệu nào.
                    <span className="font-semibold">{` (Cột ${step + 1}/${totalColumns})`}</span>
                </p>

                <div className="grid md:grid-cols-2 gap-6 flex-grow overflow-y-auto pr-4 -mr-4">
                    <div className="bg-gray-50 dark:bg-[#020a06] p-4 rounded-lg flex flex-col">
                        <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-200 flex-shrink-0">
                            Xem trước Cột: <span className="text-green-600 dark:text-green-300">{headers[step] || `Cột ${step + 1}`}</span>
                        </h3>
                        <div className="overflow-y-auto text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#1f4d3a] rounded-md flex-grow">
                            <table className="w-full">
                                <tbody>
                                    {previewData.map((row, index) => (
                                        <tr key={index} className="border-b border-gray-200 dark:border-[#1f4d3a] last:border-b-0">
                                            <td className="p-2 truncate" title={String(row[step] || '')}>{String(row[step] || '')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-200">
                            Cột này chứa dữ liệu gì?
                        </h3>
                        <div className="space-y-2">
                            {COLUMN_DEFINITIONS.map(def => {
                                const isMappedToAnotherColumn = def.id in mapping && mapping[def.id] !== step;
                                return (
                                    <button
                                        key={def.id}
                                        onClick={() => handleSelectMapping(def.id)}
                                        disabled={isMappedToAnotherColumn}
                                        className={`w-full text-left p-3 rounded-md border-2 transition-colors ${
                                            currentMappingForStep === def.id
                                                ? 'bg-green-100 dark:bg-green-800 border-green-400'
                                                : 'bg-gray-100 dark:bg-[#0f3a29] border-transparent hover:border-green-300'
                                        } ${isMappedToAnotherColumn ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <p className="font-semibold text-gray-900 dark:text-white">{def.label}</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">{def.description}</p>
                                    </button>
                                );
                            })}
                             <button
                                onClick={() => handleSelectMapping('skip')}
                                className={`w-full text-left p-3 rounded-md border-2 transition-colors ${
                                    currentMappingForStep === undefined
                                        ? 'bg-red-100 dark:bg-red-900/80 border-red-400'
                                        : 'bg-gray-100 dark:bg-[#0f3a29] border-transparent hover:border-red-300'
                                }`}
                            >
                                <p className="font-semibold text-gray-900 dark:text-white">Bỏ qua cột này</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Không sử dụng dữ liệu từ cột này.</p>
                            </button>
                        </div>
                    </div>
                </div>
                {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
                
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <button
                        onClick={onCancel}
                        className="font-semibold py-2 px-6 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-500 transition-colors"
                    >
                        Hủy
                    </button>
                    <div className="flex gap-4">
                        <button
                            onClick={handleBack}
                            disabled={step === 0}
                            className="font-semibold py-2 px-6 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            &larr; Quay lại
                        </button>
                        {step < totalColumns - 1 ? (
                            <button
                                onClick={handleNext}
                                className="font-semibold py-2 px-6 rounded-lg bg-green-600 text-white hover:bg-green-500 transition-colors"
                            >
                                Tiếp theo &rarr;
                            </button>
                        ) : (
                             <button
                                onClick={handleFinish}
                                className="font-semibold py-2 px-6 rounded-lg bg-green-600 text-white hover:bg-green-500 transition-colors"
                            >
                                Hoàn tất
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
