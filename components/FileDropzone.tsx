import React, { useState, DragEvent, useCallback } from 'react';

interface FileDropzoneProps {
  onDrop: (files: File[]) => void;
  accept: string;
  children: React.ReactNode;
  className?: string;
  dropMessage?: string;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({ onDrop, accept, children, className, dropMessage = 'Thả tệp vào đây' }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const acceptedTypes = accept.split(',').map(t => t.trim().toLowerCase());

  const handleDrag = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragActive(true);
    }
  }, []);

  const handleDragOut = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      // FIX: Add explicit 'File' type to 'file' parameter to resolve 'unknown' type errors.
      const validFiles = droppedFiles.filter((file: File) => {
        const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
        return acceptedTypes.some(type => {
          if (type.endsWith('/*')) { // like image/*
            return file.type.startsWith(type.slice(0, -1));
          }
          return fileExtension === type;
        });
      });
      
      if (validFiles.length > 0) {
        onDrop(validFiles);
      } else {
        alert(`Không có tệp hợp lệ. Vui lòng thả các tệp có định dạng: ${accept}`);
      }
      e.dataTransfer.clearData();
    }
  }, [onDrop, accept, acceptedTypes]);

  return (
    <div
      className={`relative ${className || ''}`}
      onDrop={handleDrop}
      onDragOver={handleDrag}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
    >
      {isDragActive && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-green-100/90 dark:bg-green-900/80 border-4 border-dashed border-green-500 dark:border-green-400 rounded-xl pointer-events-none">
          <p className="text-2xl font-bold text-green-800 dark:text-white">{dropMessage}</p>
        </div>
      )}
      {children}
    </div>
  );
};