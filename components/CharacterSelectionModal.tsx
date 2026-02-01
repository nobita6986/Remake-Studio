
import React, { useState, useEffect } from 'react';

interface CharacterSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedCharacters: string[]) => void;
  isLoading: boolean;
  suggestedCharacters: string[];
}

export const CharacterSelectionModal: React.FC<CharacterSelectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  suggestedCharacters
}) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [customCharacter, setCustomCharacter] = useState('');

  useEffect(() => {
    // Reset state when modal opens
    if (isOpen) {
      setSelected([]);
      setIsOtherSelected(false);
      setCustomCharacter('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleCharacter = (name: string) => {
    setSelected(prev => {
      const isSelected = prev.includes(name);
      if (isSelected) {
        return prev.filter(item => item !== name);
      } else if (prev.length < 3) {
        return [...prev, name];
      }
      return prev;
    });
  };

  const handleToggleOther = () => {
    setIsOtherSelected(prev => !prev);
  };

  const handleConfirm = () => {
    const finalSelection = [...selected];
    if (isOtherSelected && customCharacter.trim()) {
      finalSelection.push(customCharacter.trim());
    }
    onConfirm(finalSelection);
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
        <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center">Chọn nhân vật chính</h3>
        <p className="text-gray-700 dark:text-gray-300 text-center">Đâu là những nhân vật cần cố định ngoại hình? (chọn 1-3)</p>
        
        {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[150px] space-y-4">
                <div className="spinner w-12 h-12"></div>
                <p className="text-gray-500 dark:text-gray-400">AI đang phân tích kịch bản...</p>
            </div>
        ) : (
            <div className="space-y-3">
                {suggestedCharacters.map(char => (
                    <label key={char} className={`w-full text-left p-3 rounded-md border-2 flex items-center gap-3 transition-colors cursor-pointer ${selected.includes(char) ? 'bg-green-100 dark:bg-green-800 border-green-400' : 'bg-gray-100 dark:bg-[#0f3a29] border-transparent hover:border-green-300'}`}>
                        <input
                            type="checkbox"
                            checked={selected.includes(char)}
                            onChange={() => handleToggleCharacter(char)}
                            disabled={!selected.includes(char) && selected.length >= 3}
                            className="h-5 w-5 rounded bg-gray-100 dark:bg-[#020a06] border-gray-300 dark:border-[#1f4d3a] text-green-500 focus:ring-green-400"
                        />
                        <span className="font-semibold text-gray-900 dark:text-white">{char}</span>
                    </label>
                ))}
                <label className={`w-full text-left p-3 rounded-md border-2 flex items-center gap-3 transition-colors cursor-pointer ${isOtherSelected ? 'bg-green-100 dark:bg-green-800 border-green-400' : 'bg-gray-100 dark:bg-[#0f3a29] border-transparent hover:border-green-300'}`}>
                    <input
                        type="checkbox"
                        checked={isOtherSelected}
                        onChange={handleToggleOther}
                        className="h-5 w-5 rounded bg-gray-100 dark:bg-[#020a06] border-gray-300 dark:border-[#1f4d3a] text-green-500 focus:ring-green-400"
                    />
                    <span className="font-semibold text-gray-900 dark:text-white">Nhân vật khác</span>
                </label>
                {isOtherSelected && (
                    <input
                        type="text"
                        value={customCharacter}
                        onChange={(e) => setCustomCharacter(e.target.value)}
                        placeholder="Nhập tên nhân vật..."
                        className="mt-2 w-full bg-gray-50 dark:bg-[#020a06] border border-gray-300 dark:border-[#1f4d3a] text-gray-900 dark:text-gray-200 p-2 rounded-md focus:ring-1 focus:ring-green-400 focus:border-green-400 outline-none"
                        autoFocus
                    />
                )}
            </div>
        )}

        <div className="flex justify-center gap-4 pt-4">
          <button
            onClick={handleConfirm}
            disabled={isLoading}
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
