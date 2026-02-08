
import React, { useState } from 'react';
import { ChatMessage } from '../types';
import { speakText } from '../services/ttsService';

interface ChatBubbleProps {
  message: ChatMessage;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isFormal = message.style === 'formal';
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = async () => {
    if (!message.translation?.translatedText || isSpeaking) return;
    
    setIsSpeaking(true);
    try {
      await speakText(message.translation.translatedText, isFormal);
    } catch (err) {
      console.error("Failed to play audio", err);
    } finally {
      setIsSpeaking(false);
    }
  };

  return (
    <div className={`flex flex-col mb-6 ${isUser ? 'items-end' : 'items-start'}`}>
      {/* Pesan User */}
      {isUser && (
        <div className="max-w-[85%] lg:max-w-[70%] bg-white border border-gray-200 text-gray-800 px-4 py-3 rounded-2xl rounded-tr-none shadow-sm mb-1">
          <p className="text-sm md:text-base leading-relaxed font-medium">{message.content}</p>
        </div>
      )}

      {/* Kartu Pembelajaran Assistant */}
      {!isUser && message.translation && (
        <div className="max-w-[90%] lg:max-w-[80%] bg-white border border-gray-200 rounded-2xl rounded-tl-none shadow-xl overflow-hidden animate-in fade-in slide-in-from-left-4 duration-300">
          <div className={`p-4 border-b border-gray-100 ${isFormal ? 'bg-indigo-50' : 'bg-teal-50'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${isFormal ? 'bg-indigo-600 text-white' : 'bg-teal-600 text-white'}`}>
                {message.style} English
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={handleSpeak}
                  disabled={isSpeaking}
                  className={`${isSpeaking ? 'text-blue-600 animate-pulse' : 'text-gray-400 hover:text-blue-500'} transition-all`}
                  title="Dengarkan Pengucapan"
                >
                  {isSpeaking ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  )}
                </button>
                <button 
                  className="text-gray-400 hover:text-blue-500 transition-colors"
                  onClick={() => navigator.clipboard.writeText(message.translation?.translatedText || '')}
                  title="Salin Terjemahan"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </button>
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900 leading-tight">
              {message.translation.translatedText}
            </p>
          </div>
          
          <div className="p-4 space-y-4">
            {/* Grammar Insight */}
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isFormal ? 'bg-indigo-400' : 'bg-teal-400'}`}></div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Grammar & Structure</h4>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                {message.translation.grammarNotes}
              </p>
            </div>
            
            {/* Why this style? */}
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isFormal ? 'bg-indigo-400' : 'bg-teal-400'}`}></div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Usage Context</h4>
              </div>
              <p className="text-sm text-gray-600 italic">
                {message.translation.usageTips}
              </p>
            </div>
          </div>
        </div>
      )}

      <span className="text-[10px] text-gray-400 mt-1 px-1">
        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
};

export default ChatBubble;
