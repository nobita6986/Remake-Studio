import React, { useState, useCallback, ChangeEvent, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { STYLES, PRESET_PROMPT_CONTEXT } from './constants';
import type { Style, Character, TableRowData, ProjectData, ExcelRow, AdjustmentOptions, ColumnMapping, ChatMessage } from './types';
import { StyleSelector } from './components/StyleSelector';
import { CharacterManager } from './components/CharacterManager';
import { ResultsView } from './components/ResultsView';
import { ImageModal } from './components/ImageModal';
import { RemakeModal } from './components/RemakeModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { readJsonFile, saveJsonFile, createProjectAssetsZip, readExcelFile, createRowAssetsZip, createFramesJsonWithBase64, exportPromptsToTxt, createFramesJsonWithImgAndPrompt, readTextFile, parseMarkdownTables } from './utils/fileUtils';
import { FileDropzone } from './components/FileDropzone';
import { VersionHistoryModal } from './components/VersionHistoryModal';
import { SunIcon, MoonIcon, ChatIcon } from './components/icons';
import { getPromptAndPartsForRow } from './utils/fileUtils';
import { ColumnMapper } from './components/ColumnMapper';
import { ChatModal } from './components/ChatModal';
import { PresentScriptModal } from './components/PresentScriptModal';
import { ChatBubble } from './components/ChatBubble';


const IMAGE_GENERATION_COST_USD = 0.0025; // Placeholder cost per image generation

const normalizeName = (name: string): string => {
  if (!name) return '';
  return name
    .toLowerCase()
    .normalize("NFD") // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/\s+/g, ''); // Remove spaces
};

const getCharacterIndicesFromStt = (stt: string | number, characters: Character[], defaultCharacterIndex: number | null): number[] => {
    const sttString = String(stt || '').toLowerCase();
    const selectedCharacterIndices: number[] = [];

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
            selectedCharacterIndices.push(normalizedCharMap.get(normalized)!);
        }
    });

    if (selectedCharacterIndices.length === 0) {
        const hasAnyLetter = /[\p{L}]/u.test(sttString);
        if (hasAnyLetter && defaultCharacterIndex !== null) {
            selectedCharacterIndices.push(defaultCharacterIndex);
        }
    }
    
    return selectedCharacterIndices;
}


export default function App() {
  const [projectName, setProjectName] = useState('');
  const [characters, setCharacters] = useState<Character[]>(Array(3).fill(null).map(() => ({ name: '', images: [], stylePrompt: '' })));
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);
  const [tableData, setTableData] = useState<TableRowData[]>([]);
  const [defaultCharacterIndex, setDefaultCharacterIndex] = useState<number | null>(null);
  const [viewingImage, setViewingImage] = useState<{ imageUrl: string; rowId: number } | null>(null);
  const [remakingRow, setRemakingRow] = useState<TableRowData | null>(null);
  const [historyRow, setHistoryRow] = useState<TableRowData | null>(null);
  const [confirmation, setConfirmation] = useState<{ message: string; onConfirm: () => void } | null>(null);
  const [currentProjectFilename, setCurrentProjectFilename] = useState<string | null>(null);
  const [projectNameError, setProjectNameError] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [videoPromptNote, setVideoPromptNote] = useState('');
  const [isMappingColumns, setIsMappingColumns] = useState(false);
  const [excelToMap, setExcelToMap] = useState<ExcelRow[] | null>(null);
  
  // State for new Chat feature
  const [chatState, setChatState] = useState<'closed' | 'open' | 'minimized'>('closed');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isAiReplying, setIsAiReplying] = useState(false);
  const [scriptForProcessing, setScriptForProcessing] = useState<string | null>(null);
  const [isPresentingScript, setIsPresentingScript] = useState(false);


  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // FIX: Added the missing toggleTheme function.
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        event.preventDefault();
        // Chrome requires returnValue to be set.
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // This effect synchronizes the character selection in the table whenever the character list changes.
  useEffect(() => {
    // Don't run if there's no table data to update.
    if (tableData.length > 0) {
      setTableData(currentTableData => {
        let hasChanges = false;
        const updatedTableData = currentTableData.map(row => {
          const newSelectedCharacterIndices = getCharacterIndicesFromStt(
            row.originalRow[0],
            characters,
            defaultCharacterIndex
          );

          // Sort arrays for consistent comparison to avoid unnecessary re-renders.
          const currentIndicesSorted = [...row.selectedCharacterIndices].sort();
          const newIndicesSorted = [...newSelectedCharacterIndices].sort();

          if (JSON.stringify(currentIndicesSorted) !== JSON.stringify(newIndicesSorted)) {
            hasChanges = true;
            return { ...row, selectedCharacterIndices: newSelectedCharacterIndices };
          }
          return row;
        });

        // Only trigger a state update if there were actual changes.
        return hasChanges ? updatedTableData : currentTableData;
      });
    }
  }, [characters, defaultCharacterIndex]);


  const handleProjectNameChange = (name: string) => {
    setProjectName(name);
    setHasUnsavedChanges(true);
  }

  const handleCharactersChange = (newCharacters: Character[]) => {
    setCharacters(newCharacters);
    setHasUnsavedChanges(true);
  }

  const handleVideoPromptNoteChange = (note: string) => {
    setVideoPromptNote(note);
    setHasUnsavedChanges(true);
  };

  const handleSetDefaultCharacter = useCallback((index: number | null) => {
    setDefaultCharacterIndex(index);
    setHasUnsavedChanges(true);
  }, []);

  const handleStyleSelect = useCallback((style: Style) => {
    setSelectedStyle(style);
    setHasUnsavedChanges(true);
  }, []);

  const handleBackToStyles = () => {
    setSelectedStyle(null);
  };
  
  const processData = useCallback((data: ExcelRow[], mapping: ColumnMapping) => {
    const newTableData: TableRowData[] = data.slice(1) // Skip header row
        .filter(row => row && row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== ''))
        .map((row, index) => {
            const sttValue = mapping.stt !== undefined ? row[mapping.stt] : undefined;
            const contextPromptValue = mapping.contextPrompt !== undefined ? (row[mapping.contextPrompt] as string) || '' : '';
            
            const originalRow: ExcelRow = [];
            originalRow[0] = sttValue !== undefined ? sttValue : (index + 1);
            originalRow[1] = mapping.otherLang !== undefined ? row[mapping.otherLang] : '';
            originalRow[2] = mapping.vietnamese !== undefined ? row[mapping.vietnamese] : '';
            originalRow[3] = mapping.promptName !== undefined ? row[mapping.promptName] : '';
            originalRow[4] = contextPromptValue;

            const id = typeof sttValue === 'string' ? parseInt(sttValue.replace(/[^0-9]/g, ''), 10) : (typeof sttValue === 'number' ? sttValue : index + 1);
            
            const selectedCharacterIndices = getCharacterIndicesFromStt(originalRow[0], characters, defaultCharacterIndex);

            return {
                id: id || index + 1,
                originalRow,
                contextPrompt: contextPromptValue,
                selectedCharacterIndices,
                generatedImages: [],
                mainImageIndex: -1,
                isGenerating: false,
                error: null,
                videoPrompt: '',
                isGeneratingPrompt: false,
            }
        });
    setTableData(newTableData);
    setHasUnsavedChanges(true);
  }, [characters, defaultCharacterIndex]);

  const handleFileProcessed = useCallback(async (file: File) => {
    const startProcessing = (data: ExcelRow[]) => {
        if (data[0].length === 5 && (String(data[0][0]).toLowerCase().includes('stt') || String(data[0][2]).toLowerCase().includes('việt'))) {
             processData(data, { stt: 0, otherLang: 1, vietnamese: 2, promptName: 3, contextPrompt: 4 });
        } else {
            setExcelToMap(data);
            setIsMappingColumns(true);
        }
    };
    
    try {
        const excelData = await readExcelFile(file);
        if (!excelData || excelData.length < 1) {
            throw new Error("Tệp Excel trống hoặc không hợp lệ.");
        }

        if (tableData.length > 0) {
            setConfirmation({
                message: "Thao tác này sẽ thay thế kịch bản hiện tại. Bạn có chắc chắn muốn tiếp tục không?",
                onConfirm: () => {
                    startProcessing(excelData);
                    setConfirmation(null);
                }
            });
        } else {
            startProcessing(excelData);
        }
    } catch (error: any) {
        console.error("Failed to process Excel file:", error);
        alert(`Lỗi: Không thể đọc tệp Excel. ${error.message}`);
    }
  }, [tableData.length, processData]);

  const handleMappingComplete = (mapping: ColumnMapping) => {
    if (excelToMap) {
        processData(excelToMap, mapping);
    }
    setExcelToMap(null);
    setIsMappingColumns(false);
  };

  const handleMappingCancel = () => {
    setExcelToMap(null);
    setIsMappingColumns(false);
  };


  const handleUpdateRow = useCallback((updatedRow: TableRowData) => {
    setTableData(prevData => prevData.map(row => (row.id === updatedRow.id ? updatedRow : row)));
    setHasUnsavedChanges(true);
  }, []);

  const handleDocUpload = async (file: File) => {
    try {
        const scriptContent = await readTextFile(file);
        setChatMessages([
            { role: 'user', content: scriptContent },
            { role: 'model', content: "Bạn cần hỗ trợ gì với kịch bản này?" }
        ]);
        setChatState('open');
    } catch (error: any) {
        alert(`Lỗi đọc tệp: ${error.message}`);
    }
  };

  const handleSendMessageToAI = async (prompt: string) => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      alert("API Key mặc định chưa được cấu hình.");
      return;
    }

    const updatedMessages: ChatMessage[] = [...chatMessages, { role: 'user', content: prompt }];
    setChatMessages(updatedMessages);
    setIsAiReplying(true);

    try {
        const ai = new GoogleGenAI({ apiKey });
        // Use gemini-3-pro-preview for complex script analysis and reasoning
        
        const history = updatedMessages.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }]
        }));
        
        // Remove last user message from history for generateContent
        history.pop(); 

        const chat = ai.chats.create({
          model: 'gemini-3-pro-preview',
          history: history,
        })

        const responseStream = await chat.sendMessageStream({
            message: prompt,
        });
        
        let fullResponse = '';
        setChatMessages(prev => [...prev, { role: 'model', content: '' }]);

        for await (const chunk of responseStream) {
            const chunkText = chunk.text;
            if (chunkText) {
                fullResponse += chunkText;
                setChatMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].content = fullResponse;
                    return newMessages;
                });
            }
        }
    } catch (err: any) {
        console.error("AI chat failed:", err);
        setChatMessages(prev => [...prev, { role: 'model', content: `Lỗi: ${err.message}` }]);
    } finally {
        setIsAiReplying(false);
    }
  };

  const handleFinalizeTableFromChat = () => {
    const allModelMessagesContent = chatMessages
        .filter(m => m.role === 'model')
        .map(m => m.content)
        .join('\n'); // Join all model responses

    const allTableRows = parseMarkdownTables(allModelMessagesContent);

    if (allTableRows.length === 0) {
        alert("Không tìm thấy dữ liệu bảng hợp lệ trong cuộc trò chuyện. Vui lòng thử lại hoặc đảm bảo AI trả về đúng định dạng bảng.");
        return;
    }

    const newTableData: TableRowData[] = allTableRows.map((row, index) => {
        const originalRow: ExcelRow = [
            row[0] || (index + 1), // STT
            row[1] || '', // Ngôn ngữ khác
            row[2] || '', // Tiếng Việt
            row[3] || '', // Tên Prompt
            row[4] || ''  // Prompt bối cảnh
        ];
        
        const id = index + 1;
        const selectedCharacterIndices = getCharacterIndicesFromStt(originalRow[0], characters, defaultCharacterIndex);
        
        return {
            id,
            originalRow,
            contextPrompt: (originalRow[4] as string) || '',
            selectedCharacterIndices,
            generatedImages: [],
            mainImageIndex: -1,
            isGenerating: false,
            error: null,
            videoPrompt: '',
            isGeneratingPrompt: false,
        };
    });

    setTableData(newTableData);

    // Reset and close modals
    setChatState('closed');
    setChatMessages([]);
    setScriptForProcessing(null);
    setHasUnsavedChanges(true);
  };


  const handlePresentScript = () => {
    const allModelMessagesContent = chatMessages
        .filter(m => m.role === 'model')
        .map(m => m.content)
        .join('\n');

    // Use the robust parser to detect if there's valid table data.
    const tableRows = parseMarkdownTables(allModelMessagesContent);

    if (tableRows.length > 0) {
        handleFinalizeTableFromChat();
    } else {
        // Otherwise, fall back to the old behavior of treating the last message as a simple script.
        const lastModelMessage = chatMessages.filter(m => m.role === 'model').pop();
        if (lastModelMessage) {
            setScriptForProcessing(lastModelMessage.content);
            setIsPresentingScript(true);
        } else {
             alert("Không có phản hồi nào từ AI để trình bày.");
        }
    }
  };


  const handleFinalizeScriptToTable = (language: 'vietnamese' | 'otherLang') => {
    if (!scriptForProcessing) return;

    const scriptLines = scriptForProcessing.split('\n').filter(line => line.trim() !== '');
    const columnIndex = language === 'vietnamese' ? 2 : 1;

    if (tableData.length === 0) { // Populate for the first time
        const newTableData = scriptLines.map((line, index): TableRowData => {
            const originalRow: ExcelRow = ['', '', '', '', ''];
            originalRow[0] = index + 1;
            originalRow[columnIndex] = line.trim();
            
            return {
                id: index + 1,
                originalRow,
                contextPrompt: '',
                selectedCharacterIndices: [],
                generatedImages: [],
                mainImageIndex: -1,
                isGenerating: false,
                error: null,
                videoPrompt: '',
                isGeneratingPrompt: false,
            };
        });
        setTableData(newTableData);
    } else { // Merge with existing data
        const updatedTableData = [...tableData];
        scriptLines.forEach((line, index) => {
            if (updatedTableData[index]) {
                updatedTableData[index].originalRow[columnIndex] = line.trim();
            }
            // Note: If new script is longer, extra lines are ignored. If shorter, remaining old rows are untouched.
        });
        setTableData(updatedTableData);
    }

    // Reset and close modals
    setIsPresentingScript(false);
    setChatState('closed');
    setChatMessages([]);
    setScriptForProcessing(null);
    setHasUnsavedChanges(true);
  };
  
  const generateImage = useCallback(async (rowId: number, adjustments?: AdjustmentOptions) => {
    const rowIndex = tableData.findIndex(row => row.id === rowId);
    if (rowIndex === -1 || !selectedStyle) return;
  
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      alert("API Key mặc định chưa được cấu hình. Vui lòng liên hệ quản trị viên.");
      const rowToUpdate = tableData[rowIndex];
      handleUpdateRow({ ...rowToUpdate, error: "API Key is missing." });
      return;
    }
  
    const row = tableData[rowIndex];
    handleUpdateRow({ ...row, isGenerating: true, error: null });
  
    try {
      const { prompt, parts } = getPromptAndPartsForRow({
        row,
        rowIndex,
        tableData,
        selectedStyle,
        characters,
        defaultCharacterIndex,
        adjustments
      });
  
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image', // Keep flash-image for images
        contents: { parts: parts },
        // Do not use responseMimeType for this model
      });
  
      const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      const generatedBase64 = imagePart?.inlineData?.data;
  
      if (generatedBase64) {
        const imageUrl = `data:image/png;base64,${generatedBase64}`;
        const latestRowState = tableData.find(r => r.id === rowId)!;
        const newImages = [...latestRowState.generatedImages, imageUrl];
        handleUpdateRow({
          ...latestRowState,
          generatedImages: newImages,
          mainImageIndex: newImages.length - 1,
          isGenerating: false,
          error: null,
          lastUsedPrompt: prompt,
        });
      } else {
        const blockReason = response.candidates?.[0]?.finishReason;
        const safetyRatings = response.candidates?.[0]?.safetyRatings;
        const modelTextResponse = response.text;
        let errorMessage = "Image generation failed for an unknown reason.";
        if (modelTextResponse) errorMessage = `Model responded with text instead of an image: ${modelTextResponse}`;
        else if (blockReason && blockReason !== 'STOP') {
          let details = `Reason: ${blockReason}`;
          if (safetyRatings && safetyRatings.length > 0) details += `. Safety issues: ${safetyRatings.map(r => `${r.category} was ${r.probability}`).join(', ')}`;
          errorMessage = `Image generation blocked. ${details}`;
        } else if (blockReason) errorMessage = `Image generation stopped. Reason: ${blockReason}. No image was produced.`;
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      console.error(`API call failed:`, err);
      const latestRowState = tableData.find(r => r.id === rowId)!;
      handleUpdateRow({ ...latestRowState, error: `Tạo ảnh thất bại: ${err.message}`, isGenerating: false });
    }
  }, [characters, selectedStyle, tableData, handleUpdateRow, defaultCharacterIndex]);
  
  const generateAllImages = useCallback(async () => {
    const rowsToGenerate = tableData.filter(row => row.generatedImages.length === 0 && !row.error);
    const chunkSize = 3;

    for (let i = 0; i < rowsToGenerate.length; i += chunkSize) {
      const chunk = rowsToGenerate.slice(i, i + chunkSize);
      const promises = chunk.map(row => generateImage(row.id));
      await Promise.all(promises);
    }
  }, [tableData, generateImage]);

  const generateVideoPromptForRow = useCallback(async (rowId: number) => {
    const rowIndex = tableData.findIndex(row => row.id === rowId);
    if (rowIndex === -1) return;

    const row = tableData[rowIndex];
    
    const mainIndex = row.mainImageIndex > -1 ? row.mainImageIndex : (row.generatedImages.length > 0 ? row.generatedImages.length - 1 : -1);
    const mainAsset = mainIndex !== -1 ? row.generatedImages[mainIndex] : null;

    if (!mainAsset) {
        handleUpdateRow({ ...row, error: "Cần có ảnh chính để tạo prompt video." });
        return;
    }

    setTableData(prevData => prevData.map(r => r.id === rowId ? { ...r, isGeneratingPrompt: true, error: null, videoPrompt: '' } : r));

    try {
        const dataB = (row.originalRow[2] as string) || '';

        const promptTemplate = `“Từ kịch bản [B] và ảnh minh họa cho kịch bản là [A] hãy viết Prompt Video (Prompt để tạo ra video 8 giây model VEO-3.1 của google để minh họa cho phân đoạn kịch bản này [B].
Prompt bắt buộc viết 100% bằng tiếng anh trừ những đoạn hội thoại thì có thể lời thoại là ngôn ngữ khác đúng theo kịch bản). Prompt tạo video bắt buộc phải theo Format dưới đây (lưu ý tôi ghi tiếng việt nhưng cột 4 này phải đúng ngôn ngữ là tiếng Anh nhé)
“Hãy tạo một video 8 giây
Với góc máy ban đầu: là bối cảnh trong ảnh [A]
Chuyển động nếu chia làm nhiều cảnh thì
Cảnh 1 mấy giây: Kỹ thuật di chuyển camera sử dụng trong cảnh 1 này là gì, di chuyển từ đâu đến đâu, có chia làm nhiều cảnh hay không, nếu cắt cảnh thì sử dụng kỹ thuật gì để cắt cảnh (ví dụ Match cut, match action,...), nhân vật hành động thế nào, biểu cảm ra sao, nói gì hay không nói, nếu nói thì chi tiết giọng nói thế nào (mô tả thật chi tiết bằng các thuật ngữ mô tả giọng nói), nói tiếng gì vùng miền nào của quốc gia đó (mô tả chi tiết), nhạc nền là nhạc không lời, âm thanh môi trường hay không có âm thanh nền.
Tương tự các cảnh sau cũng vậy nhưng phải phù hợp với tất cả các chi tiết trong bối cảnh ảnh [A]
Chuyển động đấy đưa đến cảnh quay cuối cùng: Bối cảnh ở đâu, camera đặt ở đâu trong bối cảnh đấy, góc camera hướng về nhân vật, (các) nhân vật đứng ở đâu trong bối cảnh đấy, từng nhân vật có ngoại hình chi tiết thế nào (giới tính, độ tuổi, mô tả chi tiết áo, mô tả chi tiết quần, mô tả chi tiết kiểu tóc, mô tả chi tiết khuôn mặt đảm bảo đồng nhất ở tất cả các cảnh, mô tả chi tiết tỉ lệ kích thước đầu và các bộ phận, mô tả chi tiết biểu cảm nhân vật), nhân vật hướng bộ phận nào về camera (đầu, lưng, chân gần đầu xa,...), khoảng cách giữa người và camera, các chi tiết/nhân vật phụ. Lưu ý là chuyển động phải phù hợp với nội dung đoạn này là [B].
Lưu ý chung: Không cần gọi tên nhân vật trong Prompt, tập trung vào mô tả chi tiết, biết rằng mỗi video sẽ dài khoảng 8 giây. Prompt tập trung vào chất lượng vì vậy mỗi prompt video viết ra cần phải minh họa được kịch bản là [B] và dài không dưới 300 chữ
Bắt buộc tuân thủ, chỉ viết prompt không nói thêm bất cứ một điều gì khác prompt trong câu trả lời, không chào hỏi, không trình bày, không báo cáo sẽ bắt đầu hay hoàn thành. Tức là bắt đầu từ prompt và kết thúc prompt.
Prompt viết trong 1 đoạn duy nhất, không được xuống dòng, nếu ngắt ý thì ngắt bởi dấu chấm.””`;

        const globalNote = videoPromptNote.trim() ? `\n\n${videoPromptNote}` : '';

        const finalPrompt = promptTemplate
            .replace(/\[A\]/g, '(phân tích từ hình ảnh được cung cấp)')
            .replace(/\[B\]/g, dataB) 
            + globalNote;
        
        const imagePart = {
            inlineData: {
                data: mainAsset.split(',')[1],
                mimeType: mainAsset.startsWith('data:image/jpeg') ? 'image/jpeg' : 'image/png',
            }
        };

        const parts = [imagePart, { text: finalPrompt }];
        
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
          throw new Error("API Key mặc định chưa được cấu hình.");
        }
        const ai = new GoogleGenAI({ apiKey });

        // Upgrade to gemini-3-pro-preview for complex video prompting
        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-3-pro-preview', 
            contents: { parts },
        });

        for await (const chunk of responseStream) {
            const chunkText = chunk.text;
            setTableData(prevData => prevData.map(r => 
                r.id === rowId 
                    ? { ...r, videoPrompt: (r.videoPrompt || '') + chunkText } 
                    : r
            ));
        }

    } catch (err: any) {
        console.error("Video prompt generation failed:", err);
        const latestRowState = tableData.find(r => r.id === rowId)!;
        handleUpdateRow({ ...latestRowState, error: `Tạo prompt thất bại: ${err.message}` });
    } finally {
        setTableData(prevData => prevData.map(r => 
            r.id === rowId ? { ...r, isGeneratingPrompt: false } : r
        ));
    }
  }, [tableData, handleUpdateRow, videoPromptNote]);

  const generateAllVideoPrompts = useCallback(async () => {
    const rowsToGenerate = tableData.filter(row => !row.videoPrompt && row.generatedImages.length > 0 && !row.error);
    for (const row of rowsToGenerate) {
        await generateVideoPromptForRow(row.id);
    }
  }, [tableData, generateVideoPromptForRow]);

  const handleSaveProject = useCallback((saveAs = false) => {
    const hasProjectName = projectName.trim();
    if (!hasProjectName) {
        setProjectNameError(true);
        setTimeout(() => setProjectNameError(false), 500);
        return;
    }

    const filename = (saveAs || !currentProjectFilename) 
        ? `${projectName.trim()}.json` 
        : currentProjectFilename;

    const projectData: ProjectData = {
      projectName,
      selectedStylePrompt: selectedStyle?.promptTemplate || '',
      tableData,
      characters,
      videoPromptNote,
    };

    saveJsonFile(projectData, filename);
    setHasUnsavedChanges(false);

    if (saveAs || !currentProjectFilename) {
        setCurrentProjectFilename(filename);
    }
  }, [projectName, selectedStyle, tableData, characters, currentProjectFilename, videoPromptNote]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
            event.preventDefault();
            handleSaveProject(false); 
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSaveProject]);

  const loadProjectFromFile = async (file: File) => {
    try {
      const result = await readJsonFile(file);
      if (result) {
        const { project } = result;
        
        const tableDataFromProject = Array.isArray(project.tableData) ? project.tableData.map((r: any) => ({...r, videoPrompt: r.videoPrompt || '', isGeneratingPrompt: false })) : [];
        const charactersFromProject = Array.isArray(project.characters) ? project.characters : [];

        const finalCharacters = Array(3).fill(null).map((_, i) => 
            charactersFromProject[i] || { name: '', images: [], stylePrompt: '' }
        );
        
        const migratedTableData = tableDataFromProject.map((row: any) => {
            const newRow = { ...row };
            if (newRow.generatedImage && (!newRow.generatedImages || newRow.generatedImages.length === 0)) {
                newRow.generatedImages = [newRow.generatedImage];
            } else if (!newRow.generatedImages) {
                newRow.generatedImages = [];
            }
            delete newRow.generatedImage;

            // Add backward compatibility for mainImageIndex
            if (typeof newRow.mainImageIndex !== 'number') {
                newRow.mainImageIndex = newRow.generatedImages.length > 0 ? newRow.generatedImages.length - 1 : -1;
            }

            // BACKWARD COMPATIBILITY for selectedCharacterIndex -> selectedCharacterIndices
            if (row.selectedCharacterIndex !== undefined && !row.selectedCharacterIndices) {
                const index = row.selectedCharacterIndex;
                if (index !== null && index >= -2) {
                    newRow.selectedCharacterIndices = (index === -1) ? [] : [index]; 
                } else {
                    newRow.selectedCharacterIndices = [];
                }
            } else if (!row.selectedCharacterIndices) {
                newRow.selectedCharacterIndices = [];
            }
            delete newRow.selectedCharacterIndex;

            return newRow as TableRowData;
        });

        setProjectName(project.projectName || '');
        setCharacters(finalCharacters);
        setTableData(migratedTableData);
        setVideoPromptNote(project.videoPromptNote || '');
        const matchingStyle = STYLES.find(s => s.promptTemplate === project.selectedStylePrompt);
        setSelectedStyle(matchingStyle || null);
        setCurrentProjectFilename(file.name);
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error("Failed to load project:", error);
      alert("Error: Could not load the project file. It may be corrupted.");
    }
  };

  const handleLoadProjectInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await loadProjectFromFile(file);
    }
    event.target.value = ''; // Reset input
  };
  
  const handleAppDrop = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.json')) {
      await loadProjectFromFile(file);
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      if (!selectedStyle) {
          alert("Vui lòng chọn một phong cách trước khi tải lên tệp Excel.");
      } else {
        handleFileProcessed(file);
      }
    } else {
      alert("Loại tệp không được hỗ trợ. Vui lòng thả tệp .json, .xlsx, hoặc .xls.");
    }
  };


  const handleViewImage = (imageUrl: string, rowId: number) => {
    setViewingImage({ imageUrl, rowId });
  };

  const handleStartRemake = (row: TableRowData) => {
    setRemakingRow(row);
  };
  
  const handleCancelRemake = () => {
    setRemakingRow(null);
  };

  const handleConfirmRemake = (rowId: number, adjustments: AdjustmentOptions) => {
    setConfirmation({
      message: `Thao tác này sẽ sử dụng API của bạn để tạo lại hình ảnh. Chi phí dự kiến: $${IMAGE_GENERATION_COST_USD}. Bạn có chắc chắn muốn tiếp tục không?`,
      onConfirm: () => {
        setRemakingRow(null); 
        setConfirmation(null); 
        generateImage(rowId, adjustments);
      }
    });
  };

  const handleCloseConfirmation = () => {
    setConfirmation(null);
  };

  const handleOpenHistory = (row: TableRowData) => setHistoryRow(row);
  const handleCloseHistory = () => setHistoryRow(null);

  const handleSetMainImage = (rowId: number, index: number) => {
      const rowToUpdate = tableData.find(r => r.id === rowId);
      if (rowToUpdate) {
          const updatedRow = { ...rowToUpdate, mainImageIndex: index };
          handleUpdateRow(updatedRow);
          setHasUnsavedChanges(true);
      }
  };

  const handleDownloadRowAssets = (row: TableRowData) => {
      const filename = `${projectName || 'assets'}_row_${row.id}.zip`;
      createRowAssetsZip(row, filename);
  };

  const handleSendToVideo = (rowId: number) => {
    const row = tableData.find(r => r.id === rowId);
    if (!row || !selectedStyle) return;
  
    const mainIndex = row.mainImageIndex > -1 ? row.mainImageIndex : (row.generatedImages.length > 0 ? row.generatedImages.length - 1 : -1);
    const mainAsset = mainIndex !== -1 ? row.generatedImages[mainIndex] : null;
  
    if (!mainAsset || !mainAsset.startsWith('data:image')) {
      console.warn('Cannot send to video: No main image found for this row.');
      return;
    }
  
    const { prompt } = getPromptAndPartsForRow({
      row,
      rowIndex: tableData.findIndex(r => r.id === rowId),
      tableData,
      selectedStyle,
      characters,
      defaultCharacterIndex,
      adjustments: undefined
    });
  
    const eventPayload = {
      detail: {
        imageDataUrl: mainAsset,
        prompt: prompt,
        sceneDescription: row.originalRow[2] || '', // Phân cảnh tiếng Việt
      }
    };
  
    const customEvent = new CustomEvent('creatorStudio:sendToVideo', eventPayload);
    window.dispatchEvent(customEvent);
    console.log('Dispatched event creatorStudio:sendToVideo with payload:', eventPayload.detail);
  };
  
  const handleResetApp = () => {
    const confirmReset = () => {
        setConfirmation(null);
        window.location.reload();
    };

    if (hasUnsavedChanges) {
        setConfirmation({
            message: "Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn đặt lại và bắt đầu một dự án mới không?",
            onConfirm: confirmReset,
        });
    } else {
        setConfirmation({
            message: "Bạn có chắc chắn muốn đặt lại ứng dụng không?",
            onConfirm: confirmReset,
        });
    }
  };

  const currentHistoryRowData = historyRow ? tableData.find(row => row.id === historyRow.id) : null;
  const safeProjectName = projectName.trim() || 'project';

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#020a06]/80 backdrop-blur-md border-b border-gray-200 dark:border-[#1f4d3a] py-3 px-6 header-bg">
        <div className="container mx-auto">
          <div className="flex flex-wrap justify-between items-center gap-x-6 gap-y-3">
            <h1 onClick={handleResetApp} className="text-2xl font-bold uppercase tracking-wider gradient-text cursor-pointer" title="Đặt lại ứng dụng">
                Pro Studio
            </h1>

            <div className="flex items-center flex-wrap justify-end gap-2">
              <input 
                type="text"
                value={projectName}
                onChange={(e) => handleProjectNameChange(e.target.value)}
                placeholder="Nhập tên dự án..."
                className={`bg-gray-100 dark:bg-[#0b2b1e] border text-gray-900 dark:text-gray-200 px-3 py-2 h-10 rounded-lg w-48 outline-none transition-all border-gray-300 dark:border-[#1f4d3a] focus:border-green-400 focus:ring-2 focus:ring-green-400/50 ${projectNameError ? 'input-error' : ''}`}
              />
               <button onClick={() => handleSaveProject(true)} className="flex-shrink-0 h-10 font-semibold py-2 px-4 rounded-lg bg-gray-200 dark:bg-[#0f3a29] text-gray-800 dark:text-green-300 border border-gray-300 dark:border-green-700 hover:bg-gray-300 dark:hover:bg-green-900 transition-colors whitespace-nowrap">
                 Lưu thành...
              </button>
              <button onClick={() => handleSaveProject(false)} className="flex-shrink-0 h-10 font-semibold py-2 px-4 rounded-lg bg-green-600 text-white hover:bg-green-500 transition-colors whitespace-nowrap">
                Lưu (Ctrl+S)
              </button>
              <label htmlFor="load-project-input" className="flex-shrink-0 h-10 cursor-pointer font-semibold py-2 px-4 rounded-lg bg-gray-200 dark:bg-[#0f3a29] text-gray-800 dark:text-green-300 border border-gray-300 dark:border-green-700 hover:bg-gray-300 dark:hover:bg-green-900 transition-colors flex items-center whitespace-nowrap">
                Tải dự án
              </label>
              <input id="load-project-input" type="file" className="hidden" accept=".json" onChange={handleLoadProjectInputChange} />
               <button onClick={() => createProjectAssetsZip(tableData, `${safeProjectName}_assets.zip`)} className="flex-shrink-0 h-10 font-semibold py-2 px-4 rounded-lg bg-gray-200 dark:bg-[#0f3a29] text-gray-800 dark:text-green-300 border border-gray-300 dark:border-green-700 hover:bg-gray-300 dark:hover:bg-green-900 transition-colors whitespace-nowrap">
                Xuất tệp ZIP
              </button>
              <button onClick={() => exportPromptsToTxt(tableData, `${safeProjectName}-Scripts.txt`)} className="flex-shrink-0 h-10 font-semibold py-2 px-4 rounded-lg bg-gray-200 dark:bg-[#0f3a29] text-gray-800 dark:text-green-300 border border-gray-300 dark:border-green-700 hover:bg-gray-300 dark:hover:bg-green-900 transition-colors whitespace-nowrap">
                Xuất Prompt
              </button>
              <button onClick={() => createFramesJsonWithBase64(tableData, `${safeProjectName}-Images.json`)} className="flex-shrink-0 h-10 font-semibold py-2 px-4 rounded-lg bg-gray-200 dark:bg-[#0f3a29] text-gray-800 dark:text-green-300 border border-gray-300 dark:border-green-700 hover:bg-gray-300 dark:hover:bg-green-900 transition-colors whitespace-nowrap">
                Xuất Code Ảnh
              </button>
              <button onClick={() => createFramesJsonWithImgAndPrompt(tableData, `${safeProjectName}-veo-element.json`)} className="flex-shrink-0 h-10 font-semibold py-2 px-4 rounded-lg bg-gray-200 dark:bg-[#0f3a29] text-gray-800 dark:text-green-300 border border-gray-300 dark:border-green-700 hover:bg-gray-300 dark:hover:bg-green-900 transition-colors whitespace-nowrap">
                Xuất Code Img+Prompt
              </button>
               <button 
                onClick={toggleTheme}
                className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-gray-200 dark:bg-[#0f3a29] text-gray-800 dark:text-green-300 border border-gray-300 dark:border-green-700 hover:bg-gray-300 dark:hover:bg-green-900 transition-colors"
                aria-label="Toggle theme"
               >
                 {theme === 'dark' ? <SunIcon className="w-6 h-6"/> : <MoonIcon className="w-6 h-6"/>}
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-6">
       <FileDropzone onDrop={handleAppDrop} accept=".json,.xlsx,.xls">
        {!selectedStyle ? (
          <StyleSelector onSelectStyle={handleStyleSelect} />
        ) : (
          <div className="space-y-6">
            <CharacterManager 
              characters={characters} 
              setCharacters={handleCharactersChange}
              defaultCharacterIndex={defaultCharacterIndex}
              onSetDefault={handleSetDefaultCharacter}
              videoPromptNote={videoPromptNote}
              onVideoPromptNoteChange={handleVideoPromptNoteChange}
            />
            <ResultsView 
              selectedStyle={selectedStyle}
              tableData={tableData}
              characters={characters}
              defaultCharacterIndex={defaultCharacterIndex}
              onBack={handleBackToStyles}
              onFileProcessed={handleFileProcessed}
              onDocUpload={handleDocUpload}
              onUpdateRow={handleUpdateRow}
              onGenerateImage={(rowId) => generateImage(rowId)}
              onGenerateAllImages={generateAllImages}
              onGenerateVideoPrompt={generateVideoPromptForRow}
              onGenerateAllVideoPrompts={generateAllVideoPrompts}
              onDownloadAll={() => createProjectAssetsZip(tableData, `${safeProjectName}_assets.zip`)}
              onViewImage={handleViewImage}
              onStartRemake={handleStartRemake}
              onOpenHistory={handleOpenHistory}
              onSendToVideo={handleSendToVideo}
            />
          </div>
        )}
       </FileDropzone>
      </main>

      <ImageModal 
        viewData={viewingImage} 
        tableData={tableData}
        onClose={() => setViewingImage(null)} 
      />
      <RemakeModal 
        rowData={remakingRow} 
        tableData={tableData}
        onClose={handleCancelRemake}
        onRemake={handleConfirmRemake}
      />
      <ConfirmationModal
        isOpen={!!confirmation}
        message={confirmation?.message || ''}
        onConfirm={() => {
          confirmation?.onConfirm();
          handleCloseConfirmation();
        }}
        onClose={handleCloseConfirmation}
      />
      <VersionHistoryModal 
        isOpen={!!currentHistoryRowData}
        rowData={currentHistoryRowData}
        onClose={handleCloseHistory}
        onSetMain={handleSetMainImage}
        onDownloadAll={handleDownloadRowAssets}
      />
      {isMappingColumns && excelToMap && (
        <ColumnMapper 
            excelData={excelToMap}
            onComplete={handleMappingComplete}
            onCancel={handleMappingCancel}
        />
      )}
      <ChatModal 
        isOpen={chatState === 'open'}
        onClose={() => setChatState('closed')}
        onMinimize={() => setChatState('minimized')}
        messages={chatMessages}
        onSendMessage={handleSendMessageToAI}
        isAiReplying={isAiReplying}
        onPresentScript={handlePresentScript}
      />
      {chatState === 'minimized' && <ChatBubble onClick={() => setChatState('open')} />}
      <PresentScriptModal 
        isOpen={isPresentingScript}
        onClose={() => setIsPresentingScript(false)}
        onComplete={handleFinalizeScriptToTable}
      />
    </>
  );
}