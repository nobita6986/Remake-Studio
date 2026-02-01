import React from 'react';
import { CheckCircleIcon, XCircleIcon } from './icons';

type ApiKeyStatus = 'idle' | 'validating' | 'valid' | 'invalid';

interface ApiKeyInputProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  apiKeyStatus: ApiKeyStatus;
  onValidate: () => void;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ apiKey, setApiKey, apiKeyStatus, onValidate }) => {
  const getStatusIndicator = () => {
    switch (apiKeyStatus) {
      case 'validating':
        return <div className="spinner w-5 h-5"></div>;
      case 'valid':
        {/* FIX: The 'title' prop was causing a type error. Wrapped the icon in a span to provide the title/tooltip. */}
        return <span title="API Key is valid"><CheckCircleIcon className="w-6 h-6 text-green-400" /></span>;
      case 'invalid':
        {/* FIX: The 'title' prop was causing a type error. Wrapped the icon in a span to provide the title/tooltip. */}
        return <span title="API Key is invalid or failed to validate"><XCircleIcon className="w-6 h-6 text-red-400" /></span>;
      default:
        return null;
    }
  };

  const getBorderColor = () => {
    switch (apiKeyStatus) {
      case 'valid':
        return 'border-green-400 ring-2 ring-green-400/50';
      case 'invalid':
        return 'border-red-400 ring-2 ring-red-400/50';
      default:
        return 'border-[#1f4d3a] focus:border-green-400 focus:ring-2 focus:ring-green-400/50';
    }
  };

  return (
    <div>
      <label htmlFor="api-key-input" className="block text-xs font-medium text-gray-300 mb-1">
        Gemini API Key
      </label>
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            id="api-key-input"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Nhập API Key..."
            className={`bg-[#0b2b1e] border text-gray-200 px-3 py-2 h-10 rounded-lg w-48 outline-none transition-all ${getBorderColor()}`}
          />
          <div className="absolute inset-y-0 right-3 flex items-center">
            {getStatusIndicator()}
          </div>
        </div>
        <button
          onClick={onValidate}
          disabled={apiKeyStatus === 'validating' || !apiKey}
          className="h-10 font-semibold py-2 px-4 rounded-lg bg-[#0f3a29] text-green-300 border border-green-700 hover:bg-green-900 transition-colors disabled:bg-gray-700 disabled:text-gray-400 disabled:border-gray-600 disabled:cursor-not-allowed"
        >
          Xác thực
        </button>
      </div>
    </div>
  );
};
