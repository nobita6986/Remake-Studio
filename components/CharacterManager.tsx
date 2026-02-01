
import React, { ChangeEvent } from 'react';
import type { Character } from '../types';
import { fileToBase64 } from '../utils/fileUtils';
import { FileDropzone } from './FileDropzone';

interface CharacterManagerProps {
  characters: Character[];
  setCharacters: (characters: Character[]) => void;
  defaultCharacterIndex: number | null;
  onSetDefault: (index: number) => void;
  videoPromptNote: string;
  onVideoPromptNoteChange: (note: string) => void;
}

export const CharacterManager: React.FC<CharacterManagerProps> = ({ characters, setCharacters, defaultCharacterIndex, onSetDefault, videoPromptNote, onVideoPromptNoteChange }) => {
  const handleNameChange = (index: number, name: string) => {
    const newCharacters = [...characters];
    // Allow only Unicode letters for character names, removing other symbols.
    const sanitizedName = name.replace(/[^\p{L}]/gu, '');
    newCharacters[index] = { ...newCharacters[index], name: sanitizedName };
    setCharacters(newCharacters);
  };

  const handleStylePromptChange = (index: number, prompt: string) => {
    const newCharacters = [...characters];
    newCharacters[index] = { ...newCharacters[index], stylePrompt: prompt };
    setCharacters(newCharacters);
  };

  const processAndUploadImages = async (index: number, files: File[]) => {
    if (!files || files.length === 0) return;

    const currentImageCount = characters[index].images.length;
    const remainingSlots = 5 - currentImageCount;

    if (remainingSlots <= 0) {
      alert('Đã đạt tối đa 5 ảnh cho mỗi nhân vật.');
      return;
    }

    const filesToProcess = files.slice(0, remainingSlots);

    try {
      const base64Images = await Promise.all(filesToProcess.map(fileToBase64));
      const newCharacters = [...characters];
      newCharacters[index] = { ...newCharacters[index], images: [...newCharacters[index].images, ...base64Images] };
      setCharacters(newCharacters);
    } catch (error) {
      console.error('Error converting files to base64:', error);
      alert('Đã xảy ra lỗi trong quá trình tải ảnh lên.');
    }
  };
  
  const handleFileInputChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      processAndUploadImages(index, Array.from(event.target.files));
    }
    event.target.value = '';
  };
  
  const handleFileDrop = (index: number, files: File[]) => {
      processAndUploadImages(index, files);
  };

  const handleRemoveImage = (charIndex: number, imgIndex: number) => {
    const newCharacters = [...characters];
    const updatedImages = newCharacters[charIndex].images.filter((_, i) => i !== imgIndex);
    newCharacters[charIndex] = { ...newCharacters[charIndex], images: updatedImages };
    setCharacters(newCharacters);
  };

  return (
    <section className="bg-white dark:bg-[#0b2b1e] border border-gray-200 dark:border-[#1f4d3a] p-8 rounded-xl">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Tải ảnh nhân vật</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Kéo và thả tệp ảnh vào ô nhân vật hoặc nhấn nút "Tải lên".</p>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Ảnh nhân vật nên có nền trắng hoặc đơn sắc để tránh nhiễu bởi các yếu tố ngoại cảnh.</p>
      <div className="grid md:grid-cols-3 gap-6">
        {characters.map((char, index) => (
          <FileDropzone
            key={index}
            onDrop={(files) => handleFileDrop(index, files)}
            accept="image/*"
            className="border-l-4 border-gray-200 dark:border-[#1f4d3a] p-4 space-y-3 h-full rounded-r-lg"
            dropMessage="Thả ảnh vào đây"
          >
            <div className="flex justify-between items-center">
              <label htmlFor={`char-name-${index}`} className="block font-semibold">Nhân vật {index + 1}</label>
              {char.name && char.images.length > 0 && (
                <button
                  onClick={() => onSetDefault(index)}
                  className={`text-xs font-semibold py-1 px-3 rounded-full transition-colors ${
                    defaultCharacterIndex === index
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500'
                  }`}
                  aria-label={`Set Character ${index + 1} as default`}
                >
                  {defaultCharacterIndex === index ? '✓ Mặc định' : 'Đặt mặc định'}
                </button>
              )}
            </div>
            <input
              type="text"
              id={`char-name-${index}`}
              className="bg-gray-50 dark:bg-[#020a06] border border-gray-300 dark:border-[#1f4d3a] text-gray-900 dark:text-gray-200 p-2 rounded-md w-full focus:ring-1 focus:ring-green-400 focus:border-green-400 outline-none"
              placeholder="Nhập tên..."
              value={char.name}
              onChange={(e) => handleNameChange(index, e.target.value)}
            />
             <div>
                <label htmlFor={`char-style-${index}`} className="block font-semibold text-sm mb-1">Phong cách nhân vật</label>
                <textarea
                    id={`char-style-${index}`}
                    rows={2}
                    className="bg-gray-50 dark:bg-[#020a06] border border-gray-300 dark:border-[#1f4d3a] text-gray-900 dark:text-gray-200 p-2 rounded-md w-full focus:ring-1 focus:ring-green-400 focus:border-green-400 outline-none text-sm"
                    placeholder="Lưu ý về phong cách nhân vật (vd: luôn đeo vòng cổ mặt trăng)..."
                    value={char.stylePrompt}
                    onChange={(e) => handleStylePromptChange(index, e.target.value)}
                />
            </div>
            <div>
                <label htmlFor={`char-img-${index}`} className="cursor-pointer inline-block text-sm font-semibold py-2 px-4 rounded-lg bg-green-600 text-white hover:bg-green-500 transition-colors">
                Tải lên (tối đa 5 ảnh)
                </label>
                <input
                type="file"
                id={`char-img-${index}`}
                className="hidden"
                multiple
                accept="image/*"
                onChange={(e) => handleFileInputChange(index, e)}
                />
            </div>
            <div className="flex flex-wrap gap-2 pt-1 min-h-[72px]">
              {char.images.map((imgData, imgIndex) => (
                <div key={imgIndex} className="relative group">
                  <img src={imgData} alt={`Character ${index + 1} preview ${imgIndex + 1}`} className="w-16 h-16 object-cover rounded-md" />
                  <button
                    onClick={() => handleRemoveImage(index, imgIndex)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                    aria-label={`Remove image ${imgIndex + 1}`}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </FileDropzone>
        ))}
      </div>
       <div className="mt-6 pt-6 border-t border-gray-200 dark:border-[#1f4d3a]">
        <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Lưu ý chung cho Prompt Video</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Lưu ý này sẽ được thêm vào cuối mỗi prompt video được tạo ra để đảm bảo tuân thủ.</p>
        <textarea
            rows={3}
            className="bg-gray-50 dark:bg-[#020a06] border border-gray-300 dark:border-[#1f4d3a] text-gray-900 dark:text-gray-200 p-2 rounded-md w-full focus:ring-1 focus:ring-green-400 focus:border-green-400 outline-none text-sm"
            placeholder="Ví dụ: Không có nhạc nền, chỉ sử dụng âm thanh môi trường nếu cần. Nhân vật chỉ hành động minh họa cho kịch bản chứ không có nhép miệng theo lời thoại..."
            value={videoPromptNote}
            onChange={(e) => onVideoPromptNoteChange(e.target.value)}
        />
    </div>
    </section>
  );
};