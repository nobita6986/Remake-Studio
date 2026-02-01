
import React, { useState, ChangeEvent } from 'react';
import { GoogleGenAI } from '@google/genai';
import { readKeysFromExcel } from '../utils/fileUtils';

interface ApiKeyManagerProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeys: string[];
  setApiKeys: (keys: string[]) => void;
}

type ValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid';

export const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ isOpen, onClose, apiKeys, setApiKeys }) => {
  const [newKey, setNewKey] = useState('');
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>('idle');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const validateApiKey = async (key: string): Promise<boolean> => {
    try {
      const ai = new GoogleGenAI({ apiKey: key });
      // Use a lightweight model for a quick and cheap validation call.
      // This is sufficient to check if the key is active and billing is enabled.
      await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'validation check',
      });
      return true;
    } catch (error: any) {
      console.error("API Key validation failed:", error);
      let message = `Lỗi xác thực: ${error.message}`;
      if (error.message.includes('API key not valid')) {
          message = 'API key không hợp lệ. Vui lòng kiểm tra lại.';
      } else if (error.message.includes('quota')) {
          message = 'API key đã hết hạn mức sử dụng.';
      } else if (error.message.includes('billing')) {
          message = 'Vui lòng bật tính năng thanh toán (billing) cho dự án Google Cloud của bạn.';
      }
      setValidationMessage(message);
      return false;
    }
  };


  const handleAddKey = async () => {
    const trimmedKey = newKey.trim();
    if (!trimmedKey) return;
    if (apiKeys.includes(trimmedKey)) {
        alert("API key này đã tồn tại trong danh sách.");
        return;
    }

    setValidationStatus('validating');
    setValidationMessage(null);

    const isValid = await validateApiKey(trimmedKey);

    if (isValid) {
        setValidationStatus('valid');
        setValidationMessage('Thêm API key thành công. Có thể sử dụng để tạo ảnh.');
        setApiKeys([...apiKeys, trimmedKey]);
        setNewKey('');
        setTimeout(() => {
            setValidationStatus('idle');
            setValidationMessage(null);
        }, 2500); // Reset status after a delay
    } else {
        setValidationStatus('invalid');
    }
  };

  const handleRemoveKey = (indexToRemove: number) => {
    setApiKeys(apiKeys.filter((_, index) => index !== indexToRemove));
  };
  
  const maskKey = (key: string) => {
    if (key.length <= 8) return '****';
    return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
  }

  const handleExcelUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
        const keysFromFile = await readKeysFromExcel(file);
        const currentKeys = new Set(apiKeys);
        let addedCount = 0;
        const newKeys = [...apiKeys];

        keysFromFile.forEach(key => {
            const trimmedKey = key.trim();
            if (trimmedKey && !currentKeys.has(trimmedKey)) {
                newKeys.push(trimmedKey);
                currentKeys.add(trimmedKey);
                addedCount++;
            }
        });

        if (addedCount > 0) {
            setApiKeys(newKeys);
            alert(`Đã thêm thành công ${addedCount} key mới từ tệp Excel.`);
        } else {
            alert("Không có key mới nào được tìm thấy trong tệp Excel hoặc tất cả các key đã tồn tại.");
        }

    } catch (error) {
        console.error("Error reading keys from Excel:", error);
        alert("Đã xảy ra lỗi khi đọc tệp Excel. Vui lòng đảm bảo tệp có định dạng đúng và chứa các key trong cột đầu tiên.");
    }
    event.target.value = ''; // Reset input to allow re-uploading the same file
  };

  const getBorderColor = () => {
    switch (validationStatus) {
        case 'valid': return 'border-green-400 ring-2 ring-green-400/50';
        case 'invalid': return 'border-red-400 ring-2 ring-red-400/50';
        default: return 'border-gray-300 dark:border-[#1f4d3a] focus:ring-2 focus:ring-green-400 focus:border-green-400';
    }
  };
  
  const getButtonContent = () => {
    switch (validationStatus) {
        case 'validating': return <><div className="spinner w-5 h-5 mr-2"></div> Đang xác thực...</>;
        case 'valid': return <>✓ Đã thêm</>;
        default: return 'Thêm Key';
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-key-manager-title"
    >
      <div
        className="bg-white dark:bg-[#0b2b1e] border border-gray-200 dark:border-[#1f4d3a] p-8 rounded-xl space-y-6 max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
            <h3 id="api-key-manager-title" className="text-xl font-bold text-gray-900 dark:text-white">
                Kho API Key
            </h3>
             <div className="flex items-center gap-4">
                <label htmlFor="excel-key-upload" className="cursor-pointer text-sm font-semibold py-2 px-4 rounded-lg bg-gray-200 dark:bg-[#0f3a29] text-gray-800 dark:text-green-300 border border-gray-300 dark:border-green-700 hover:bg-gray-300 dark:hover:bg-green-900 transition-colors whitespace-nowrap">
                    Tải lên từ Excel
                </label>
                <input id="excel-key-upload" type="file" className="hidden" accept=".xlsx, .xls" onChange={handleExcelUpload} />
                <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-3xl" aria-label="Close">&times;</button>
            </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Thêm nhiều API key để ứng dụng tự động chuyển đổi khi một key hết hạn mức hoặc gặp lỗi. Các key được lưu vào tệp dự án của bạn.
        </p>

        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {apiKeys.length > 0 ? apiKeys.map((key, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-[#020a06] p-3 rounded-lg border border-gray-200 dark:border-[#1f4d3a]">
                    <span className="font-mono text-gray-700 dark:text-gray-300">{index + 1}. {maskKey(key)}</span>
                    <button 
                        onClick={() => handleRemoveKey(index)}
                        className="text-sm font-semibold py-1 px-3 rounded-md bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-800 dark:text-red-200 dark:hover:bg-red-700 transition-colors"
                    >
                        Xóa
                    </button>
                </div>
            )) : (
                <p className="text-center text-gray-500 py-4">Chưa có API key nào được thêm. Ứng dụng sẽ sử dụng API key mặc định.</p>
            )}
        </div>

        <div className="pt-4 border-t border-gray-300 dark:border-gray-700 space-y-2">
            <div>
                <div className="flex gap-3">
                    <input
                      type="text"
                      value={newKey}
                      onChange={(e) => {
                        setNewKey(e.target.value);
                        if (validationStatus === 'invalid' || validationStatus === 'valid') {
                            setValidationStatus('idle');
                            setValidationMessage(null);
                        }
                      }}
                      placeholder="Nhập API Key mới để thêm thủ công..."
                      className={`flex-grow bg-gray-50 dark:bg-[#020a06] border text-gray-900 dark:text-gray-200 px-3 py-2 rounded-lg outline-none transition-all ${getBorderColor()}`}
                    />
                    <button 
                        onClick={handleAddKey}
                        className="font-semibold py-2 px-5 rounded-lg bg-green-600 text-white hover:bg-green-500 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 flex items-center justify-center w-40"
                        disabled={!newKey.trim() || validationStatus === 'validating'}
                    >
                        {getButtonContent()}
                    </button>
                </div>
                 {validationMessage && (
                    <p className={`text-xs mt-2 ${validationStatus === 'invalid' ? 'text-red-400' : 'text-green-400'}`}>
                        {validationMessage}
                    </p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
