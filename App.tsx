
import React, { useState, useRef, useEffect } from 'react';
import { TranslationStyle, ChatMessage, AppView, ChatSession } from './types';
import { translateText } from './services/geminiService';
import { saveMessageToFirebase, getChatHistory, getAllSessions, saveSessionMetadata, deleteChatFromFirebase } from './services/firebaseService';
import StyleSelector from './components/StyleSelector';
import ChatBubble from './components/ChatBubble';
import QuizView from './components/QuizView';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('coach');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentStyle, setCurrentStyle] = useState<TranslationStyle>('casual');
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string>('');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Session & Load Session List
  useEffect(() => {
    const init = async () => {
      let savedSession = localStorage.getItem('lingua_session_id');
      if (!savedSession) {
        savedSession = 'sess_' + Date.now();
        localStorage.setItem('lingua_session_id', savedSession);
      }
      setSessionId(savedSession);
      
      const allSessions = await getAllSessions();
      setSessions(allSessions);
    };
    init();
  }, []);

  // Load History when sessionId changes
  useEffect(() => {
    if (!sessionId) return;

    const loadHistory = async () => {
      setIsHistoryLoading(true);
      const history = await getChatHistory(sessionId);
      setMessages(history.sort((a, b) => a.timestamp - b.timestamp));
      setIsHistoryLoading(false);
      setIsSidebarOpen(false); // Close sidebar on mobile after selection
    };

    loadHistory();
  }, [sessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (view === 'coach') scrollToBottom();
  }, [messages, view]);

  const startNewChat = () => {
    const newSession = 'sess_' + Date.now();
    localStorage.setItem('lingua_session_id', newSession);
    setSessionId(newSession);
    setMessages([]);
    setIsSidebarOpen(false);
  };

  const selectSession = (id: string) => {
    localStorage.setItem('lingua_session_id', id);
    setSessionId(id);
  };

  const deleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Hapus percakapan ini?")) return;
    
    await deleteChatFromFirebase(id);
    const updated = await getAllSessions();
    setSessions(updated);
    
    if (sessionId === id) {
      startNewChat();
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const isFirstMessage = messages.length === 0;
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    saveMessageToFirebase(sessionId, userMessage);
    
    // Save metadata on first message to create a "title"
    if (isFirstMessage) {
      await saveSessionMetadata(sessionId, inputText);
      const updated = await getAllSessions();
      setSessions(updated);
    }
    
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
      saveMessageToFirebase(sessionId, assistantMessage);
    } catch (error) {
      console.error(error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Maaf, terjadi kesalahan teknis. Coba kirim pesan lagi.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-gray-900 overflow-hidden">
      
      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-72 bg-white border-r border-gray-100 z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                <span className="text-white font-black text-xl">EN</span>
              </div>
              <h1 className="text-lg font-black tracking-tight">EnglishMaster</h1>
            </div>
            
            <button 
              onClick={startNewChat}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-indigo-100 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              CHAT BARU
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
            <h3 className="px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Riwayat Percakapan</h3>
            {sessions.length === 0 && !isHistoryLoading && (
              <p className="px-2 text-xs text-gray-400 italic">Belum ada percakapan.</p>
            )}
            {sessions.map((s) => (
              <div 
                key={s.id}
                onClick={() => selectSession(s.id)}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${sessionId === s.id ? 'bg-indigo-50 border-indigo-100 text-indigo-700 font-bold' : 'hover:bg-gray-50 border-transparent text-gray-600'}`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="text-lg opacity-60">💬</span>
                  <span className="text-xs truncate">{s.title || "Percakapan Tanpa Judul"}</span>
                </div>
                <button 
                  onClick={(e) => deleteSession(e, s.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          
          <div className="p-6 bg-slate-50/50 border-t border-gray-100">
             <p className="text-[10px] font-bold text-gray-400 text-center uppercase tracking-widest">Powered by Gemini AI</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full bg-white relative">
        
        {/* Mobile Header Nav */}
        <header className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white z-30">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
          <div className="font-black text-sm tracking-tighter">ENGLISH MASTER</div>
          <div className="w-10"></div>
        </header>

        {/* View Switcher */}
        <div className="flex border-b border-gray-100">
          <button 
            onClick={() => setView('coach')}
            className={`flex-1 py-4 text-[10px] font-black tracking-widest transition-all ${view === 'coach' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            COACH MODE
          </button>
          <button 
            onClick={() => setView('quiz')}
            className={`flex-1 py-4 text-[10px] font-black tracking-widest transition-all ${view === 'quiz' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            QUIZ MODE
          </button>
        </div>

        {view === 'coach' ? (
          <>
            <StyleSelector selectedStyle={currentStyle} onSelect={setCurrentStyle} />

            <main className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar bg-slate-50/30">
              {isHistoryLoading ? (
                <div className="h-full flex flex-col items-center justify-center space-y-4">
                  <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Sinkronisasi Database...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-8">
                  <div className="relative">
                    <div className="w-20 h-20 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center text-4xl animate-pulse">✨</div>
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-2xl font-black text-gray-900 leading-none">Apa yang ingin kamu pelajari?</h2>
                    <p className="text-sm text-gray-500 font-medium">Ketik kalimat dalam Bahasa Indonesia, dan pilih gaya bahasa di atas.</p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => <ChatBubble key={msg.id} message={msg} />)
              )}
              
              {isLoading && (
                <div className="flex items-start mb-6">
                  <div className="bg-white border border-gray-100 px-6 py-4 rounded-3xl rounded-tl-none shadow-sm flex items-center gap-4">
                    <div className="flex space-x-1.5">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </main>

            <footer className="p-4 md:p-6 bg-white border-t border-gray-100">
              <form onSubmit={handleSendMessage} className="relative max-w-3xl mx-auto group">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ketik kalimat Bahasa Indonesia..."
                  className="w-full bg-slate-100/50 border-2 border-transparent rounded-3xl px-8 py-5 pr-20 text-sm focus:bg-white focus:border-indigo-600 transition-all outline-none text-gray-800 font-bold shadow-sm"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputText.trim()}
                  className={`absolute right-2.5 top-2.5 bottom-2.5 w-14 rounded-2xl flex items-center justify-center transition-all ${
                    inputText.trim() && !isLoading 
                      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95' 
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
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
    </div>
  );
};

export default App;
