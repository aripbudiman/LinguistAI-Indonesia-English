
import React from 'react';
import { TranslationStyle } from '../types';

interface StyleSelectorProps {
  selectedStyle: TranslationStyle;
  onSelect: (style: TranslationStyle) => void;
}

const StyleSelector: React.FC<StyleSelectorProps> = ({ selectedStyle, onSelect }) => {
  return (
    <div className="flex items-center justify-center gap-4 p-4 bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
      <button
        onClick={() => onSelect('formal')}
        className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${
          selectedStyle === 'formal'
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 ring-2 ring-indigo-300'
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
        }`}
      >
        <span className="text-lg">💼</span>
        <span>FORMAL</span>
      </button>
      <button
        onClick={() => onSelect('casual')}
        className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${
          selectedStyle === 'casual'
            ? 'bg-teal-600 text-white shadow-lg shadow-teal-200 ring-2 ring-teal-300'
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
        }`}
      >
        <span className="text-lg">☕</span>
        <span>CASUAL</span>
      </button>
    </div>
  );
};

export default StyleSelector;
