
import React from 'react';
import { SUPPORTED_LANGUAGES } from '../constants';
import { Language } from '../types';

interface LanguageSelectorProps {
  selectedLanguage: Language;
  onSelect: (lang: Language) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selectedLanguage, onSelect }) => {
  return (
    <div className="flex items-center gap-2 p-4 bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
      <span className="text-sm font-medium text-gray-500">Translate to:</span>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onSelect(lang)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              selectedLanguage.code === lang.code
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>{lang.flag}</span>
            <span>{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
