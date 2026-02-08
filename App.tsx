
import React, { useState, useRef, useEffect } from 'react';
import { TranslationStyle, ChatMessage, AppView } from './types';
import { translateText } from './services/geminiService';
import StyleSelector from './components/StyleSelector';
import ChatBubble from './components/ChatBubble';
import QuizView from './components/QuizView';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('coach');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentStyle, setCurrentStyle] = useState<TranslationStyle>('casual');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (view === 'coach') scrollToBottom();
  }, [messages, view]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const result = await translateText(userMessage.content, currentStyle);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.translatedText,
        translation: result,
        style: currentStyle,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Oops! Sepertinya ada masalah koneksi. Coba lagi ya.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-white shadow-2xl overflow-hidden">
      {/* Header */}
      <header className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-xl">EN</span>
          </div>
          <div>
            <h1 className="text-lg font-black text-gray-900 tracking-tight leading-none">EnglishMaster AI</h1>
            <div className="flex gap-2 mt-1">
              <span className={`text-[10px] font-bold uppercase tracking-widest ${view === 'coach' ? 'text-indigo-600' : 'text-gray-300'}`}>Coach</span>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${view === 'quiz' ? 'text-indigo-600' : 'text-gray-300'}`}>Quiz</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setMessages([])}
            className="p-2 text-gray-300 hover:text-red-500 transition-all"
            title="Hapus Percakapan"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* View Switcher Tabs */}
      <div className="flex border-b border-gray-100">
        <button 
          onClick={() => setView('coach')}
          className={`flex-1 py-3 text-xs font-black tracking-widest transition-all ${view === 'coach' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-400 hover:bg-gray-50'}`}
        >
          COACH (ID &rarr; EN)
        </button>
        <button 
          onClick={() => setView('quiz')}
          className={`flex-1 py-3 text-xs font-black tracking-widest transition-all ${view === 'quiz' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-400 hover:bg-gray-50'}`}
        >
          QUIZ (LATIHAN)
        </button>
      </div>

      {view === 'coach' ? (
        <>
          {/* Style Toggle Selector */}
          <StyleSelector selectedStyle={currentStyle} onSelect={setCurrentStyle} />

          {/* Main Chat Area */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar bg-slate-50/50">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-8 space-y-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center text-4xl transform -rotate-6">🇮🇩</div>
                  <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center text-4xl absolute -top-4 -right-4 transform rotate-12 border-2 border-blue-50">🇺🇸</div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-gray-900">Siap Master English?</h2>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Ketik kalimat apa saja, saya akan ubah ke Inggris dengan grammar yang sempurna.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((msg) => <ChatBubble key={msg.id} message={msg} />)
            )}
            
            {isLoading && (
              <div className="flex items-start mb-6">
                <div className="bg-white border border-gray-100 px-5 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mastering...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </main>

          {/* Input Section */}
          <footer className="p-4 bg-white border-t border-gray-100">
            <form onSubmit={handleSendMessage} className="relative group">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={currentStyle === 'formal' ? "Tulis sesuatu (Formal)..." : "Tulis sesuatu (Casual)..."}
                className={`w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 pr-16 text-sm focus:bg-white focus:ring-0 transition-all outline-none text-gray-800 font-medium ${
                  currentStyle === 'formal' ? 'focus:border-indigo-500' : 'focus:border-teal-500'
                }`}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className={`absolute right-2 top-2 bottom-2 w-12 rounded-xl flex items-center justify-center transition-all ${
                  inputText.trim() && !isLoading 
                    ? (currentStyle === 'formal' ? 'bg-indigo-600 shadow-indigo-200' : 'bg-teal-600 shadow-teal-200') + ' text-white shadow-lg hover:scale-105 active:scale-95' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </form>
          </footer>
        </>
      ) : (
        <QuizView />
      )}
    </div>
  );
};

export default App;
