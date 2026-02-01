import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, message, onConfirm, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" 
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-modal-title"
    >
      <div className="bg-white dark:bg-[#0b2b1e] border border-gray-200 dark:border-[#1f4d3a] p-8 rounded-xl space-y-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h3 id="confirmation-modal-title" className="text-xl font-bold text-gray-900 dark:text-white text-center">Xác nhận hành động</h3>
        <p className="text-gray-700 dark:text-gray-300 text-center">{message}</p>
        <div className="flex justify-center gap-4 pt-4">
          <button onClick={onClose} className="font-semibold py-2 px-6 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-500 transition-colors">
            Hủy
          </button>
          <button onClick={onConfirm} className="font-semibold py-2 px-6 rounded-lg bg-green-600 text-white hover:bg-green-500 transition-colors">
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};