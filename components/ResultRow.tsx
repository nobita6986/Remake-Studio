
import React, { useState, ChangeEvent, useRef, useEffect } from 'react';
// FIX: Import ExcelRow type to resolve type error.
import type { TableRowData, Character, Style, ExcelRow } from '../types';
// FIX: Import getPromptForRow function to resolve reference error.
import { fileToBase64, getPromptForRow } from '../utils/fileUtils';
import { FileDropzone } from './FileDropzone';
import { CopyIcon } from './icons';

interface ResultRowProps {
  rowData: TableRowData;
  characters: Character[];
  defaultCharacterIndex: number | null;
  onUpdateRow: (row: TableRowData) => void;
  onGenerateImage: (rowId: number) => void;
  onGenerateVideoPrompt: (rowId: number) => void;
  onStartRemake: (row: TableRowData) => void;
  selectedStyle: Style;
  onViewImage: (imageUrl: string, rowId: number) => void;
  onOpenHistory: (row: TableRowData) => void;
  onSendToVideo: (rowId: number) => void;
}

const CharacterSelector: React.FC<{
    characters: Character[];
    selectedIndices: number[];
    onChange: (indices: number[]) => void;
}> = ({ characters, selectedIndices, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const validCharacters = characters.filter(c => c.name && c.images.length > 0);
    const options = [
        { label: 'None', value: -1 },
        { label: 'Random', value: -2 },
        ...validCharacters.map((c, i) => ({ label: c.name, value: characters.findIndex(origC => origC === c) }))
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    const handleSelectionChange = (value: number) => {
        let newSelection: number[];
        if (value === -1) { // None
            newSelection = [];
        } else if (value === -2) { // Random
            newSelection = [-2];
        } else { // A character
            const currentSelection = selectedIndices.filter(i => i >= 0);
            if (currentSelection.includes(value)) {
                newSelection = currentSelection.filter(i => i !== value);
            } else {
                newSelection = [...currentSelection, value];
            }
        }
        onChange(newSelection);
    };

    const getButtonLabel = () => {
        if (selectedIndices.length === 0) return 'None';
        if (selectedIndices.includes(-2)) return 'Random';
        return selectedIndices.map(i => characters[i]?.name).join(', ');
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-gray-50 dark:bg-[#020a06] border border-gray-300 dark:border-[#1f4d3a] text-gray-900 dark:text-gray-200 p-2 rounded-md w-full focus:ring-1 focus:ring-green-400 focus:border-green-400 outline-none text-left"
            >
                {getButtonLabel() || '-- Chọn NV --'}
            </button>
            {isOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-[#0f3a29] border border-gray-300 dark:border-[#1f4d3a] rounded-md shadow-lg">
                    {options.map(option => (
                        <label key={option.value} className="flex items-center px-3 py-2 text-sm text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-green-900 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={option.value < 0 ? selectedIndices.includes(option.value) : selectedIndices.filter(i => i >= 0).includes(option.value)}
                                onChange={() => handleSelectionChange(option.value)}
                                className="h-4 w-4 rounded bg-gray-100 dark:bg-[#020a06] border-gray-300 dark:border-[#1f4d3a] text-green-500 focus:ring-green-400"
                            />
                            <span className="ml-3">{option.label}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};

// Placed here for use in this component
const normalizeName = (name: string): string => {
  if (!name) return '';
  return name
    .toLowerCase()
    .normalize("NFD") // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/\s+/g, ''); // Remove spaces
};

export const ResultRow: React.FC<ResultRowProps> = ({ rowData, characters, onUpdateRow, onGenerateImage, selectedStyle, onViewImage, onStartRemake, onOpenHistory, onSendToVideo, onGenerateVideoPrompt, defaultCharacterIndex }) => {
  const [copyStatus, setCopyStatus] = useState('Copy Prompt');
  const [promptCopyStatus, setPromptCopyStatus] = useState('Copy');
  const [sendStatus, setSendStatus] = useState<'idle' | 'sent'>('idle');
  const [isContextPromptExpanded, setIsContextPromptExpanded] = useState(false);
  const [isVideoPromptExpanded, setIsVideoPromptExpanded] = useState(false);
  
  const mainIndex = rowData.mainImageIndex > -1 ? rowData.mainImageIndex : (rowData.generatedImages.length > 0 ? rowData.generatedImages.length - 1 : -1);
  const mainAsset = mainIndex !== -1 ? rowData.generatedImages[mainIndex] : null;

  const handleCopy = () => {
    if (!selectedStyle?.promptTemplate) {
      alert("No style template selected.");
      return;
    }

    const prompt = getPromptForRow(rowData, selectedStyle, characters);

    navigator.clipboard.writeText(prompt).then(() => {
      setCopyStatus('Đã chép!');
      setTimeout(() => setCopyStatus('Copy Prompt'), 2000);
    });
  };
  
  const handleCopyVideoPrompt = () => {
    if (rowData.videoPrompt) {
      navigator.clipboard.writeText(rowData.videoPrompt);
      setPromptCopyStatus('Copied!');
      setTimeout(() => setPromptCopyStatus('Copy'), 2000);
    }
  };

  const handleSendToVideo = () => {
    onSendToVideo(rowData.id);
    setSendStatus('sent');
    setTimeout(() => setSendStatus('idle'), 2500);
  };

  const processAndUploadMedia = async (file: File) => {
    if (!file) return;

    try {
      const base64Media = await fileToBase64(file);
      const newMedia = [...rowData.generatedImages, base64Media];
      onUpdateRow({
        ...rowData,
        generatedImages: newMedia,
        mainImageIndex: newMedia.length - 1,
        error: null, // Clear any previous error on success
      });
    } catch (error) {
      console.error("Failed to upload and convert media:", error);
      onUpdateRow({
        ...rowData,
        error: "Failed to upload media."
      });
    }
  };

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processAndUploadMedia(file);
    }
    event.target.value = '';
  };

  const handleFileDrop = (files: File[]) => {
    if (files.length > 0) {
      processAndUploadMedia(files[0]);
    }
  };
  
  const getFileExtension = (dataUrl: string) => {
    if (dataUrl.startsWith('data:video/mp4')) return '.mp4';
    if (dataUrl.startsWith('data:image/jpeg')) return '.jpeg';
    return '.png'; // default
  };

  const handleSttChange = (e: React.FocusEvent<HTMLTableCellElement>) => {
      const newStt = e.currentTarget.textContent || '';
      const oldStt = String(rowData.originalRow[0] || '');

      if (newStt === oldStt) return;

      const updatedOriginalRow = [...rowData.originalRow] as ExcelRow;
      updatedOriginalRow[0] = newStt;
      
      const sttString = String(newStt || '').toLowerCase();
      const newSelectedIndices: number[] = [];

      const normalizedCharMap = new Map<string, number>();
      characters.forEach((c, i) => {
          if (c.name) {
              normalizedCharMap.set(normalizeName(c.name), i);
          }
      });

      let characterNamesFromStt: string[] = [];
      const multiCharMatch = sttString.match(/\[(.*?)\]/);
      if (multiCharMatch && multiCharMatch[1]) {
          characterNamesFromStt = multiCharMatch[1].split('+').map(name => name.trim());
      } else {
          const singleCharMatch = sttString.match(/^([\p{L}]+)/u);
          if (singleCharMatch && singleCharMatch[1]) {
              characterNamesFromStt = [singleCharMatch[1]];
          }
      }

      characterNamesFromStt.forEach(name => {
          const normalized = normalizeName(name);
          if (normalizedCharMap.has(normalized)) {
              newSelectedIndices.push(normalizedCharMap.get(normalized)!);
          }
      });

      if (newSelectedIndices.length === 0) {
          const hasAnyLetter = /[\p{L}]/u.test(sttString);
          if (hasAnyLetter && defaultCharacterIndex !== null) {
              newSelectedIndices.push(defaultCharacterIndex);
          }
      }
      
      onUpdateRow({ ...rowData, originalRow: updatedOriginalRow, selectedCharacterIndices: newSelectedIndices });
  };

  return (
    <tr data-row-index={rowData.id} className="border-b border-gray-200 dark:border-gray-700">
      <td 
        className="p-3 text-center align-middle"
        contentEditable
        suppressContentEditableWarning
        onBlur={handleSttChange}
      >
        {rowData.originalRow[0]}
      </td>
      <td className="p-3 align-middle">{(rowData.originalRow[1] as string) || ''}</td>
      <td className="p-3 align-middle">{(rowData.originalRow[2] as string) || ''}</td>
      <td className="p-3 align-middle">{(rowData.originalRow[3] as string) || ''}</td>
      <td className="p-3 align-middle">
        <div
          contentEditable
          suppressContentEditableWarning
          onFocus={() => setIsContextPromptExpanded(true)}
          onBlur={(e) => {
            setIsContextPromptExpanded(false);
            onUpdateRow({ ...rowData, contextPrompt: e.currentTarget.textContent || '' });
          }}
          className={`bg-gray-50 dark:bg-[#020a06] text-gray-900 dark:text-gray-200 p-2 rounded-md border border-gray-300 dark:border-[#1f4d3a] min-h-[40px] outline-none focus:border-green-400 transition cursor-text ${!isContextPromptExpanded ? 'line-clamp-15' : ''}`}
        >
          {rowData.contextPrompt}
        </div>
      </td>
      <td className="p-3 align-middle w-56">
        <CharacterSelector
          characters={characters}
          selectedIndices={rowData.selectedCharacterIndices}
          onChange={(indices) => onUpdateRow({ ...rowData, selectedCharacterIndices: indices })}
        />
      </td>
      <td className="p-3 space-y-2 w-40 align-middle">
        <button onClick={() => onGenerateImage(rowData.id)} className="w-full text-sm font-semibold py-2 px-2 rounded-lg bg-green-100 border border-green-200 text-green-800 hover:bg-green-200 dark:bg-green-800 dark:border-green-700 dark:text-green-200 dark:hover:bg-green-700 transition-colors">
          Tạo ảnh
        </button>
        <button onClick={() => onGenerateVideoPrompt(rowData.id)} className="w-full text-sm font-semibold py-2 px-2 rounded-lg bg-green-100 border border-green-200 text-green-800 hover:bg-green-200 dark:bg-green-800 dark:border-green-700 dark:text-green-200 dark:hover:bg-green-700 transition-colors">
          Tạo Prompt Video
        </button>
        <label htmlFor={`upload-${rowData.id}`} className="cursor-pointer block text-center w-full text-sm font-semibold py-2 px-2 rounded-lg bg-green-100 border border-green-200 text-green-800 hover:bg-green-200 dark:bg-green-800 dark:border-green-700 dark:text-green-200 dark:hover:bg-green-700 transition-colors">
            Tải lên Media
        </label>
        <input type="file" id={`upload-${rowData.id}`} className="hidden" accept="image/*,video/mp4" onChange={handleFileInputChange} />
        <button onClick={handleCopy} className={`w-full text-sm font-semibold py-2 px-2 rounded-lg border transition-colors ${copyStatus === 'Đã chép!' ? 'bg-green-500 border-green-400 text-white' : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600'}`}>
          {copyStatus}
        </button>
      </td>
      <td className="p-3 text-center align-middle w-48">
        <FileDropzone 
          onDrop={handleFileDrop} 
          accept="image/*,video/mp4"
          className="h-full min-h-[100px] flex flex-col justify-center items-center"
          dropMessage="Thả ảnh/video"
        >
          {rowData.isGenerating && <div className="spinner mx-auto w-[30px] h-[30px]"></div>}
          {rowData.error && (
              <div className="space-y-2">
                  <p className="text-red-400 text-xs">{rowData.error}</p>
                  <button onClick={() => onStartRemake(rowData)} className="text-xs font-semibold py-1 px-3 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-500 transition">Tạo lại</button>
              </div>
          )}
          {mainAsset && (
            <div className="space-y-2">
              {mainAsset.startsWith('data:video/') ? (
                 <video controls src={mainAsset} className="max-w-full rounded-lg" />
              ) : (
                 <img 
                    src={mainAsset} 
                    alt={`Generated for row ${rowData.id}`} 
                    className="max-w-full rounded-lg cursor-pointer hover:opacity-80 transition-opacity" 
                    onClick={() => onViewImage(mainAsset!, rowData.id)}
                  />
              )}
              {rowData.generatedImages.length > 1 && (
                 <button onClick={() => onOpenHistory(rowData)} className="w-full text-center text-xs font-semibold py-1 px-3 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-500 transition-colors">
                    {rowData.generatedImages.length} phiên bản
                </button>
              )}
              <div className="flex flex-wrap gap-2 justify-center">
                  <button onClick={() => onStartRemake(rowData)} className="text-xs font-semibold py-1 px-3 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-500 transition">Tạo lại</button>
                  {!mainAsset.startsWith('data:video/') && <button onClick={() => onViewImage(mainAsset!, rowData.id)} className="text-xs font-semibold py-1 px-3 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-500 transition">Phóng to</button>}
                  <a href={mainAsset} download={`Asset_${rowData.id}_${(rowData.originalRow[3] as string) || 'scene'}${getFileExtension(mainAsset)}`} className="text-xs font-semibold py-1 px-3 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-500 transition inline-block">Tải về</a>
                   {!mainAsset.startsWith('data:video/') && (
                    <button 
                        onClick={handleSendToVideo}
                        disabled={sendStatus === 'sent'}
                        className={`text-xs font-semibold py-1 px-3 rounded-md transition-colors ${sendStatus === 'sent' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-800 dark:text-green-200 dark:hover:bg-green-700'}`}>
                        {sendStatus === 'sent' ? '✓ Đã gửi!' : 'Tạo video'}
                    </button>
                   )}
              </div>
            </div>
          )}
        </FileDropzone>
      </td>
      <td className="p-3 align-middle">
        <div className="relative group">
            {!rowData.isGeneratingPrompt && rowData.videoPrompt && (
                <button
                    onClick={handleCopyVideoPrompt}
                    className="absolute top-2 right-2 p-1 bg-gray-200 dark:bg-gray-700 rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    title={promptCopyStatus}
                >
                    <CopyIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
            )}
            <div
                contentEditable={!rowData.isGeneratingPrompt}
                suppressContentEditableWarning
                onFocus={() => { if (!rowData.isGeneratingPrompt) setIsVideoPromptExpanded(true); }}
                onBlur={(e) => {
                    setIsVideoPromptExpanded(false);
                    onUpdateRow({ ...rowData, videoPrompt: e.currentTarget.textContent || '' });
                }}
                className={`bg-gray-50 dark:bg-[#020a06] text-gray-900 dark:text-gray-200 p-2 rounded-md border border-gray-300 dark:border-[#1f4d3a] min-h-[100px] outline-none whitespace-pre-wrap break-words cursor-text ${!isVideoPromptExpanded && !rowData.isGeneratingPrompt ? 'line-clamp-15' : ''}`}
            >
                {rowData.isGeneratingPrompt && !rowData.videoPrompt ? (
                    <div className="flex justify-center items-center pt-8">
                        <div className="spinner w-[30px] h-[30px]"></div>
                    </div>
                ) : (
                    <>
                        {rowData.videoPrompt}
                        {rowData.isGeneratingPrompt && <span className="inline-block w-0.5 h-4 bg-gray-400 animate-pulse ml-1 align-bottom"></span>}
                    </>
                )}
            </div>
        </div>
      </td>
    </tr>
  );
};
