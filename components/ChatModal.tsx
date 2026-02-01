import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import type { ChatMessage } from '../types';
import { PRESET_PROMPT_SEGMENT, PRESET_PROMPT_CONTEXT } from '../constants';
import { ChatMessageContent } from './ChatMessageContent';
import { LanguageSelectionModal } from './LanguageSelectionModal';
import { CharacterSelectionModal } from './CharacterSelectionModal';
import { MinimizeIcon } from './icons';


interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
  messages: ChatMessage[];
  onSendMessage: (prompt: string) => void;
  isAiReplying: boolean;
  onPresentScript: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  onMinimize,
  messages,
  onSendMessage,
  isAiReplying,
  onPresentScript,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const [isAnalyzingCharacters, setIsAnalyzingCharacters] = useState(false);
  const [analyzedCharacters, setAnalyzedCharacters] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiReplying]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (prompt.trim() && !isAiReplying) {
      onSendMessage(prompt);
      setPrompt('');
    }
  };
  
  const handlePresetClick = (preset: 'segment' | 'context') => {
      if (preset === 'segment') {
          onSendMessage(PRESET_PROMPT_SEGMENT);
      } else {
          setIsLanguageModalOpen(true);
      }
  };

  const startCharacterAnalysis = async (language: string) => {
    setIsAnalyzingCharacters(true);
    setIsCharacterModalOpen(true);

    const scriptContent = messages.find(m => m.role === 'user')?.content || '';
    if (!scriptContent) {
        setAnalyzedCharacters([]);
        setIsAnalyzingCharacters(false);
        return;
    }

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API Key not configured.");
      
      const ai = new GoogleGenAI({ apiKey });
      const analysisPrompt = `From the following script, identify and list the main characters. Return ONLY a comma-separated list of names (e.g., John, Mary, David). Do not add any other text or formatting. Script: "${scriptContent}"`;
      
      // Use gemini-3-flash-preview for basic text extraction tasks
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: analysisPrompt,
      });

      const characterList = response.text
        .trim()
        .split(',')
        .map(name => name.trim())
        .filter(name => name.length > 0);
        
      setAnalyzedCharacters(characterList);
    } catch (error) {
        console.error("Character analysis failed:", error);
        alert("Không thể phân tích nhân vật từ kịch bản. Vui lòng nhập thủ công.");
        setAnalyzedCharacters([]);
    } finally {
        setIsAnalyzingCharacters(false);
    }
  };

  const handleLanguageSelected = (language: string) => {
    setSelectedLanguage(language);
    setIsLanguageModalOpen(false);
    startCharacterAnalysis(language);
  };
  
  const handleCharactersConfirmed = (selectedCharacters: string[]) => {
      const characterGuidance = selectedCharacters.length > 0
          ? `Yêu cầu về nhân vật: Các nhân vật chính cần cố định ngoại hình là: ${selectedCharacters.join(', ')}. Khi viết cột "STT", hãy dùng tên của các nhân vật này đã được chuẩn hóa (không dấu, viết liền) làm tiền tố (ví dụ: nhân vật "Thần Điểu" sẽ là "thandieu1", "Thần Điểu" và "Lâm" sẽ là "[thandieu+lam]1"). Các nhân vật khác không được liệt kê ở đây sẽ được coi là nhân vật phụ.`
          : '';

      const finalPrompt = PRESET_PROMPT_CONTEXT
        .replace(/Phân cảnh tiếng \[Đức\]/g, `Phân cảnh tiếng [${selectedLanguage}]`)
        .replace(/\[CHARACTER_GUIDANCE\]/g, characterGuidance);

      onSendMessage(finalPrompt);
      setIsCharacterModalOpen(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[70] p-4" onClick={onClose}>
        <div 
          className="bg-white dark:bg-[#020a06] border border-gray-200 dark:border-[#1f4d3a] rounded-xl w-full h-full max-w-6xl max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-[#1f4d3a] flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Xử lý kịch bản với AI</h2>
            <div className="flex items-center gap-2">
                <button onClick={onMinimize} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white" aria-label="Minimize chat">
                    <MinimizeIcon className="w-6 h-6" />
                </button>
                <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-3xl font-light" aria-label="Close chat">&times;</button>
            </div>
          </header>
          
          <div className="flex-grow flex overflow-hidden">
            {/* Main Chat Area */}
            <main className="flex-grow flex flex-col p-4 overflow-y-auto">
              <div className="flex-grow space-y-6">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${msg.role === 'user' ? 'bg-gray-500' : 'bg-green-500'}`}>
                      {msg.role === 'user' ? 'B' : 'A'}
                    </div>
                    <div className={`p-4 rounded-lg max-w-2xl ${msg.role === 'user' ? 'bg-gray-100 dark:bg-[#0f3a29] text-gray-800 dark:text-gray-200' : 'bg-gray-100 dark:bg-[#0b2b1e] text-gray-800 dark:text-gray-200'}`}>
                      <ChatMessageContent content={msg.content} />
                      {isAiReplying && index === messages.length - 1 && <span className="inline-block w-0.5 h-4 bg-gray-400 animate-pulse ml-1 align-bottom"></span>}
                       {!isAiReplying && msg.role === 'model' && index === messages.length - 1 && (
                          <div className="mt-4 text-right">
                              <button onClick={onPresentScript} className="font-semibold py-2 px-4 rounded-lg bg-green-600 text-white hover:bg-green-500 transition-colors text-sm">
                                  Trình bày kịch bản
                              </button>
                          </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <div className="mt-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Nhập prompt của bạn..."
                    rows={2}
                    className="flex-grow bg-gray-100 dark:bg-[#0b2b1e] border border-gray-300 dark:border-[#1f4d3a] text-gray-900 dark:text-gray-200 p-2 rounded-lg outline-none focus:ring-2 focus:ring-green-400"
                    disabled={isAiReplying}
                  />
                  <button
                    onClick={handleSend}
                    disabled={isAiReplying || !prompt.trim()}
                    className="h-full font-semibold py-2 px-6 rounded-lg bg-green-600 text-white hover:bg-green-500 transition-colors disabled:opacity-50"
                  >
                    Gửi
                  </button>
                </div>
              </div>
            </main>
            
            {/* Control Panel */}
            <aside className="w-80 border-l border-gray-200 dark:border-[#1f4d3a] p-4 flex-shrink-0 flex flex-col">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Bảng điều khiển</h3>
              <div className="space-y-3">
                  <div className="bg-gray-50 dark:bg-[#0b2b1e] p-3 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Prompt có sẵn</h4>
                      <div className="space-y-2">
                        <button onClick={() => handlePresetClick('segment')} className="w-full text-sm text-left font-semibold py-2 px-4 rounded-lg bg-gray-200 dark:bg-[#0f3a29] text-gray-800 dark:text-green-300 border border-gray-300 dark:border-green-700 hover:bg-gray-300 dark:hover:bg-green-900 transition-colors">
                            Phân đoạn
                        </button>
                        <button onClick={() => handlePresetClick('context')} className="w-full text-sm text-left font-semibold py-2 px-4 rounded-lg bg-gray-200 dark:bg-[#0f3a29] text-gray-800 dark:text-green-300 border border-gray-300 dark:border-green-700 hover:bg-gray-300 dark:hover:bg-green-900 transition-colors">
                            Mô tả bối cảnh
                        </button>
                      </div>
                  </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
      <LanguageSelectionModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        onSelectLanguage={handleLanguageSelected}
      />
      <CharacterSelectionModal
        isOpen={isCharacterModalOpen}
        onClose={() => setIsCharacterModalOpen(false)}
        onConfirm={handleCharactersConfirmed}
        isLoading={isAnalyzingCharacters}
        suggestedCharacters={analyzedCharacters}
      />
    </>
  );
};