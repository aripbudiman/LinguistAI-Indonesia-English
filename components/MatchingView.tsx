
import React, { useState, useEffect } from 'react';
import { VocabularyPair } from '../types';
import { generateVocabularyPairs } from '../services/geminiService';

const MatchingView: React.FC = () => {
  const [pairs, setPairs] = useState<VocabularyPair[]>([]);
  const [shuffledIndo, setShuffledIndo] = useState<{id: number, text: string}[]>([]);
  const [shuffledEng, setShuffledEng] = useState<{id: number, text: string}[]>([]);
  
  const [selectedIndo, setSelectedIndo] = useState<number | null>(null);
  const [selectedEng, setSelectedEng] = useState<number | null>(null);
  const [matches, setMatches] = useState<number[]>([]);
  const [wrongMatch, setWrongMatch] = useState<{indo: number | null, eng: number | null}>({ indo: null, eng: null });
  
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const data = await generateVocabularyPairs(topic);
      setPairs(data);
      setMatches([]);
      setSelectedIndo(null);
      setSelectedEng(null);
      
      // Shuffle both sides independently
      setShuffledIndo([...data].map(p => ({ id: p.id, text: p.indonesian })).sort(() => Math.random() - 0.5));
      setShuffledEng([...data].map(p => ({ id: p.id, text: p.english })).sort(() => Math.random() - 0.5));
    } catch (err) {
      alert("Gagal memuat kosa kata.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedIndo !== null && selectedEng !== null) {
      if (selectedIndo === selectedEng) {
        // Correct Match
        setMatches(prev => [...prev, selectedIndo]);
        setSelectedIndo(null);
        setSelectedEng(null);
      } else {
        // Wrong Match
        setWrongMatch({ indo: selectedIndo, eng: selectedEng });
        setTimeout(() => {
          setWrongMatch({ indo: null, eng: null });
          setSelectedIndo(null);
          setSelectedEng(null);
        }, 600);
      }
    }
  }, [selectedIndo, selectedEng]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/50 no-scrollbar">
      {pairs.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center space-y-6 max-w-sm mx-auto">
          <div className="w-20 h-20 bg-teal-100 rounded-[2.5rem] flex items-center justify-center text-4xl animate-bounce shadow-xl shadow-teal-50">🔗</div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-gray-900">Vocab Match-Up</h2>
            <p className="text-sm text-gray-500">Hubungkan kosa kata Indonesia dengan bahasa Inggris yang tepat.</p>
          </div>
          
          <div className="w-full space-y-4">
            <input 
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Tema: (Hobi, Kantor, Sekolah...)"
              className="w-full bg-white border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm focus:border-teal-500 transition-all outline-none shadow-sm font-medium"
            />
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full bg-teal-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-teal-100 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {isLoading ? "Menyiapkan Kata..." : "MULAI LATIHAN"}
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in duration-300">
          <div className="flex items-center justify-between bg-white/80 backdrop-blur p-4 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="font-black text-gray-800 uppercase text-xs tracking-widest">Pencocokan Kosa Kata</h2>
            <div className="flex items-center gap-2">
               <div className="h-2 w-32 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-teal-500 transition-all duration-500" 
                    style={{ width: `${(matches.length / pairs.length) * 100}%` }}
                  />
               </div>
               <span className="text-[10px] font-black text-teal-600">{matches.length}/{pairs.length}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Indonesian Column */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center mb-4">Bahasa Indonesia</h3>
              {shuffledIndo.map((item) => {
                const isMatched = matches.includes(item.id);
                const isSelected = selectedIndo === item.id;
                const isWrong = wrongMatch.indo === item.id;

                return (
                  <button
                    key={`indo-${item.id}`}
                    disabled={isMatched || isLoading}
                    onClick={() => setSelectedIndo(item.id)}
                    className={`w-full p-5 rounded-2xl border-2 font-bold text-sm transition-all transform active:scale-95 ${
                      isMatched 
                        ? 'bg-gray-50 border-transparent text-gray-300 cursor-not-allowed' 
                        : isWrong 
                        ? 'border-red-500 bg-red-50 text-red-600 animate-shake'
                        : isSelected 
                        ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-md' 
                        : 'border-gray-100 bg-white text-gray-700 hover:border-teal-200 shadow-sm'
                    }`}
                  >
                    {item.text}
                  </button>
                );
              })}
            </div>

            {/* English Column */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center mb-4">English</h3>
              {shuffledEng.map((item) => {
                const isMatched = matches.includes(item.id);
                const isSelected = selectedEng === item.id;
                const isWrong = wrongMatch.eng === item.id;

                return (
                  <button
                    key={`eng-${item.id}`}
                    disabled={isMatched || isLoading}
                    onClick={() => setSelectedEng(item.id)}
                    className={`w-full p-5 rounded-2xl border-2 font-bold text-sm transition-all transform active:scale-95 ${
                      isMatched 
                        ? 'bg-gray-50 border-transparent text-gray-300 cursor-not-allowed' 
                        : isWrong 
                        ? 'border-red-500 bg-red-50 text-red-600 animate-shake'
                        : isSelected 
                        ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-md' 
                        : 'border-gray-100 bg-white text-gray-700 hover:border-teal-200 shadow-sm'
                    }`}
                  >
                    {item.text}
                  </button>
                );
              })}
            </div>
          </div>

          {matches.length === pairs.length && (
            <div className="bg-teal-600 p-8 rounded-[2.5rem] text-center text-white space-y-4 shadow-2xl shadow-teal-100 animate-in slide-in-from-bottom-8 duration-500">
              <div className="text-4xl">🏆</div>
              <h3 className="text-2xl font-black">Luar Biasa!</h3>
              <p className="text-teal-100 text-sm font-medium">Kamu berhasil mencocokkan semua kosa kata dengan sempurna.</p>
              <button 
                onClick={() => setPairs([])}
                className="bg-white text-teal-600 px-8 py-3 rounded-2xl font-black text-sm hover:scale-105 transition-transform"
              >
                GANTI TOPIK
              </button>
            </div>
          )}
        </div>
      )}
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 3;
        }
      `}</style>
    </div>
  );
};

export default MatchingView;
