
import React, { useEffect, useState, useMemo } from 'react';
import { TableRowData } from '../types';

interface ImageModalProps {
  viewData: { imageUrl: string; rowId: number } | null;
  tableData: TableRowData[];
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ viewData, tableData, onClose }) => {
  const [currentViewIndex, setCurrentViewIndex] = useState<number | null>(null);

  const mainImagesData = useMemo(() => 
    tableData
      .map((row) => {
        const mainIndex = row.mainImageIndex > -1 ? row.mainImageIndex : (row.generatedImages.length > 0 ? row.generatedImages.length - 1 : -1);
        if (mainIndex === -1 || !row.generatedImages[mainIndex] || row.generatedImages[mainIndex].startsWith('data:video/')) {
          return null;
        }
        return {
          imageUrl: row.generatedImages[mainIndex],
          description: (row.originalRow[2] as string) || '',
          rowId: row.id,
        };
      })
      .filter((item): item is { imageUrl: string; description: string; rowId: number } => item !== null),
    [tableData]
  );
  
  useEffect(() => {
    if (viewData) {
      const initialIndex = mainImagesData.findIndex(item => item.rowId === viewData.rowId);
      setCurrentViewIndex(initialIndex !== -1 ? initialIndex : null);
    } else {
      setCurrentViewIndex(null);
    }
  }, [viewData, mainImagesData]);

  const handlePrev = () => {
    if (currentViewIndex !== null && currentViewIndex > 0) {
      setCurrentViewIndex(currentViewIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentViewIndex !== null && currentViewIndex < mainImagesData.length - 1) {
      setCurrentViewIndex(currentViewIndex + 1);
    }
  };
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') handlePrev();
      if (event.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, currentViewIndex, mainImagesData.length]);

  if (currentViewIndex === null) return null;

  const currentImageData = mainImagesData[currentViewIndex];
  if (!currentImageData) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative flex justify-center items-center w-full h-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-10 h-10 bg-gray-800/70 rounded-full text-white text-2xl flex items-center justify-center hover:bg-gray-700 transition-colors z-20 border-2 border-gray-600"
          aria-label="Close image viewer"
        >
          &times;
        </button>

        {currentViewIndex > 0 && (
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-gray-800/70 rounded-full text-white text-3xl flex items-center justify-center hover:bg-gray-700 transition-colors z-20 border-2 border-gray-600"
            aria-label="Previous image"
          >
            &#8249;
          </button>
        )}

        <div className="relative">
            <img
            src={currentImageData.imageUrl}
            alt={`Full size generated image for scene: ${currentImageData.description}`}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg pointer-events-none">
                <p className="text-white text-sm text-center drop-shadow-md">{currentImageData.description}</p>
            </div>
        </div>

        {currentViewIndex < mainImagesData.length - 1 && (
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-gray-800/70 rounded-full text-white text-3xl flex items-center justify-center hover:bg-gray-700 transition-colors z-20 border-2 border-gray-600"
            aria-label="Next image"
          >
            &#8250;
          </button>
        )}
      </div>
    </div>
  );
};
