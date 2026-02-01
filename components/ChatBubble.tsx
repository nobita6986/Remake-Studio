
import React from 'react';
import { ChatIcon } from './icons';

interface ChatBubbleProps {
    onClick: () => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-6 right-6 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-green-600 transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 z-50"
            aria-label="Open chat"
        >
            <ChatIcon className="w-8 h-8" />
        </button>
    );
};
