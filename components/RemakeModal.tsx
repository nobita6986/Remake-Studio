
import React, { useState, useEffect, useMemo } from 'react';
import type { TableRowData, Character, AdjustmentOptions } from '../types';

interface RemakeModalProps {
  rowData: TableRowData | null;
  tableData: TableRowData[];
  onClose: () => void;
  onRemake: (rowId: number, adjustments: AdjustmentOptions) => void;
}

const ADJUSTMENT_OPTIONS = {
  // Logic & Policy
  RE_EVALUATE_LOGIC: 'Logic lại ảnh: Yêu cầu đọc lại "Nguyên văn phân cảnh" để hiểu rõ câu chuyện.',
  BYPASS_POLICY: 'Lách chính sách: Viết lại prompt để tránh vi phạm chính sách nội dung.',
  // Visual Consistency
  STYLE_CONSISTENCY: 'Đồng nhất phong cách vẽ: Yêu cầu phong cách nghệ thuật phải nhất quán với các ảnh đã tạo thành công trước đó.',
  CHARACTER_STYLE: 'Phong cách nhân vật: Yêu cầu tuân thủ nghiêm ngặt phong cách nhân vật đã mô tả.',
  CHARACTER_CONSISTENCY: 'Đồng nhất nhân vật: Yêu cầu xem lại ảnh gốc để đồng nhất nhân vật.',
  COSTUME_CONSISTENCY: 'Đồng nhất trang phục: Đồng nhất trang phục với các scene cùng bối cảnh.',
  // Cinematography
  CAMERA_POSITION: 'Trùng vị trí camera: Yêu cầu đổi một góc camera khác với ảnh đã tạo trước đó.',
  CHARACTER_ANGLE: 'Trùng góc nhân vật: Đổi góc độ nhìn nhân vật (ví dụ: trực diện sang nghiêng, sau lưng,...).',
  MATCH_ASPECT_RATIO: 'Sai tỉ lệ ảnh: Yêu cầu tỉ lệ khung ảnh phải nhất quán với ảnh gần nhất.',
};

const SAMPLE_PROMPTS = [
  {
    id: 'HIGH_ANGLE_CRANE_DOWN',
    name: 'Góc cao',
    enabled: true,
    prompt: `This image represents the **END FRAME** of a cinematic sequence, illustrating a specific moment from a script.

Your task is to generate the corresponding **START FRAME** for a **"crane down and dolly in"** camera movement. The goal is to create a sense of discovery, where the camera travels through a layered environment to reveal the character and room as the ultimate focal point.

**Key Requirements for the START FRAME:**

1.  **Environmental Context and Logical Structure:** The room in the END FRAME must be part of a larger, believable structure. **If no new contextual information is provided, you must refer back to the script and scene descriptions given earlier in this conversation to determine the most logical and narratively appropriate setting.** The structure must have a coherent architectural connection to its surroundings.

2.  **Foreground Elements for Depth and Guidance:** This is crucial. The START FRAME must include **thematically relevant foreground elements** that the camera will pass by or through during its movement. These elements (e.g., architectural arches, overhanging tree branches, industrial pipes, hanging banners, natural rock formations) must act as a **visual gateway**. Their purpose is to create layers, enhance the sense of depth through the parallax effect, and guide the viewer's eye towards the final destination. The choice of these elements must be logical for the environment defined by the script.

3.  **Gradual Reveal and Intrigue:** The START FRAME must be a **high-angle, wide establishing shot** that sets the mood and scale. The structure containing the character's room should be visible behind the foreground elements. The character themselves should **not be clearly identifiable or directly visible** in this wide shot, preserving the impact of the END FRAME's reveal.

4.  **Cinematic Composition and Atmosphere:** Create a visually striking shot with strong composition and dramatic lighting that complements the END FRAME's mood. The foreground elements should frame the shot in an interesting way, adding to the overall aesthetic.

5.  **Seamless Transition:** The art style, textures, color palette, and light interaction must be perfectly consistent with the provided END FRAME, ensuring a smooth and immersive camera journey.

In summary: Analyze the provided image, reference the script for context, and generate a compelling, high-angle wide shot that uses foreground elements to frame and introduce a larger world, preparing for an impactful "crane down and dolly in" movement.`
  },
  { 
    id: 'TOP_DOWN_SHOT', 
    name: 'Chụp xuống', 
    enabled: true, 
    prompt: 'Create an image using a "top-down shot" camera angle, positioning the camera directly above the main subject. Ensure the camera has a slight tilt of approximately 5-10 degrees from the vertical axis, creating a slightly oblique yet still encompassing overhead view. The lighting in the image should be soft, diffused from multiple directions to minimize harsh shadows and create a gentle, somber atmosphere. The background should be a flat surface with a rough, cracked texture, resembling concrete or stone. The dominant colors of the image should be cool, muted tones such as gray, black, and dark blue to evoke a cold, melancholic feeling.' 
  },
  { id: 'UPDATE_2', name: 'Đang update', enabled: false, prompt: '' },
  { id: 'UPDATE_3', name: 'Đang update', enabled: false, prompt: '' },
];


export const RemakeModal: React.FC<RemakeModalProps> = ({ rowData, onClose, onRemake, tableData }) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [manualPrompt, setManualPrompt] = useState('');

  useEffect(() => {
    // Reset state when modal opens for a new row
    if (rowData) {
      setSelectedOptions([]);
      setManualPrompt('');
    }
  }, [rowData]);

  const mainImages = useMemo(() => 
    tableData
      .map(row => {
        const mainIndex = row.mainImageIndex > -1 ? row.mainImageIndex : (row.generatedImages.length > 0 ? row.generatedImages.length - 1 : -1);
        if (mainIndex === -1 || !row.generatedImages[mainIndex] || row.generatedImages[mainIndex].startsWith('data:video/')) return null;
        return {
          imageUrl: row.generatedImages[mainIndex],
          stt: row.originalRow[0],
          id: row.id,
        };
      })
      .filter((item): item is { imageUrl: string, stt: string | number, id: number } => item !== null), 
    [tableData]
  );
  
  if (!rowData) return null;

  const handleOptionToggle = (option: string) => {
    setSelectedOptions(prev => 
      prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
    );
  };

  const handleSubmit = () => {
    onRemake(rowData.id, { options: selectedOptions, manualPrompt });
  };
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, stt: string | number) => {
    e.dataTransfer.setData('text/plain', `[scene_${stt}]`);
  };

  const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const sceneCode = e.dataTransfer.getData('text/plain');
    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const newText = text.substring(0, start) + ` ${sceneCode} ` + text.substring(end);
    setManualPrompt(newText);
    
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + sceneCode.length + 2;
      textarea.focus();
    }, 0);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
  };

  const beforeImage = rowData.mainImageIndex > -1 ? rowData.generatedImages[rowData.mainImageIndex] : (rowData.generatedImages.length > 0 ? rowData.generatedImages[rowData.generatedImages.length - 1] : null);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-40 p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="remake-modal-title">
      <div 
        className="bg-white dark:bg-[#0b2b1e] border border-gray-200 dark:border-[#1f4d3a] p-8 rounded-xl space-y-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h2 id="remake-modal-title" className="text-xl font-bold text-gray-900 dark:text-white">
            Tạo lại ảnh cho: <span className="text-green-600 dark:text-green-300">"{rowData.originalRow[2]}"</span>
          </h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-3xl" aria-label="Close">&times;</button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column: Adjustment Options */}
          <div className="space-y-4 flex flex-col">
            <h3 className="font-semibold text-gray-600 dark:text-gray-300">Các lỗi sai thường gặp</h3>
            <div className="space-y-2 flex-shrink pr-2 overflow-y-auto">
              {Object.entries(ADJUSTMENT_OPTIONS).map(([key, value]) => (
                <label key={key} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-[#020a06] border border-gray-200 dark:border-[#1f4d3a] rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-[#0f3a29]">
                  <input
                    type="checkbox"
                    checked={selectedOptions.includes(key)}
                    onChange={() => handleOptionToggle(key)}
                    className="h-5 w-5 rounded bg-gray-100 dark:bg-[#020a06] border-gray-300 dark:border-[#1f4d3a] text-green-500 focus:ring-green-400 mt-1 flex-shrink-0"
                  />
                  <span className="text-gray-800 dark:text-gray-200 text-sm">{value}</span>
                </label>
              ))}
            </div>
            
            <div className="flex-grow flex flex-col">
              <label htmlFor="manual-prompt" className="block font-semibold text-gray-600 dark:text-gray-300 mb-2">
                Prompt điều chỉnh thủ công
              </label>
              <div className="mb-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Prompt mẫu có sẵn:</p>
                  <div className="flex flex-wrap gap-2">
                    {SAMPLE_PROMPTS.map((sample) => (
                      <button
                        key={sample.id}
                        onClick={() => {
                          if (sample.enabled) {
                            setManualPrompt(sample.prompt);
                          }
                        }}
                        disabled={!sample.enabled}
                        className={`text-xs font-semibold py-1 px-3 rounded-md transition-colors ${
                          sample.enabled
                            ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        }`}
                        title={sample.enabled ? `Chèn prompt "${sample.name}"` : 'Đang cập nhật'}
                      >
                        {sample.name}
                      </button>
                    ))}
                  </div>
              </div>
              <textarea
                id="manual-prompt"
                rows={4}
                value={manualPrompt}
                onChange={(e) => setManualPrompt(e.target.value)}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="bg-gray-50 dark:bg-[#020a06] border border-gray-300 dark:border-[#1f4d3a] text-gray-900 dark:text-gray-200 p-2 rounded-md w-full focus:ring-1 focus:ring-green-400 focus:border-green-400 outline-none"
                placeholder="Ví dụ: Thêm một chiếc mũ màu đỏ cho nhân vật... hoặc kéo ảnh từ dưới vào đây."
              />
               <div className="mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Kéo ảnh vào ô prompt phía trên để tham chiếu:</p>
                <div className="flex overflow-x-auto space-x-2 p-2 bg-gray-100 dark:bg-black/20 rounded-lg">
                  {mainImages.map(imgData => (
                    <div 
                      key={imgData.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, imgData.stt!)}
                      className="relative flex-shrink-0 cursor-grab group"
                    >
                      <img src={imgData.imageUrl} alt={`Thumbnail for Scene ${imgData.stt}`} className="w-20 h-20 object-cover rounded-md border-2 border-transparent group-hover:border-green-400" />
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        Scene {imgData.stt}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Image Preview */}
          <div className="flex flex-col gap-4">
              <div>
                  <h3 className="font-semibold mb-2 text-gray-600 dark:text-gray-300">Ảnh gốc (sắp được chỉnh sửa)</h3>
                  <div className="flex items-center justify-center bg-gray-100 dark:bg-black/20 rounded-lg p-2 min-h-[300px]">
                      {beforeImage ? (
                          <img src={beforeImage} alt="Previous generation" className="max-w-full max-h-80 object-contain rounded-md" />
                      ) : (
                          <div className="text-center text-gray-500 dark:text-gray-400 p-4">
                              <p>Chưa có ảnh nào được tạo hoặc tạo ảnh thất bại.</p>
                          </div>
                      )}
                  </div>
              </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onClose} className="font-semibold py-2 px-6 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-500 transition-colors">
            Hủy
          </button>
          <button onClick={handleSubmit} className="font-semibold py-2 px-6 rounded-lg bg-green-600 text-white hover:bg-green-500 transition-colors">
            Tạo lại với điều chỉnh
          </button>
        </div>
      </div>
    </div>
  );
};
