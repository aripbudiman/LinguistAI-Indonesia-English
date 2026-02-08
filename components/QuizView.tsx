
import React, { useState } from 'react';
import { QuizQuestion, QuizState } from '../types';
import { generateQuiz } from '../services/quizService';

const QuizView: React.FC = () => {
  const [quiz, setQuiz] = useState<QuizState>({
    questions: [],
    userAnswers: {},
    isSubmitted: false,
  });
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const questions = await generateQuiz(topic);
      setQuiz({
        questions,
        userAnswers: {},
        isSubmitted: false,
      });
    } catch (err) {
      alert("Gagal memuat kuis.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (questionId: number, option: string) => {
    if (quiz.isSubmitted) return;
    setQuiz(prev => ({
      ...prev,
      userAnswers: { ...prev.userAnswers, [questionId]: option }
    }));
  };

  const handleSubmit = () => {
    if (Object.keys(quiz.userAnswers).length < quiz.questions.length) {
      alert("Tolong jawab semua soal dulu ya!");
      return;
    }
    setQuiz(prev => ({ ...prev, isSubmitted: true }));
  };

  const score = quiz.questions.reduce((acc, q) => {
    return acc + (quiz.userAnswers[q.id] === q.correctAnswer ? 1 : 0);
  }, 0);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 no-scrollbar">
      {quiz.questions.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center space-y-6 max-w-sm mx-auto">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-3xl animate-bounce">📝</div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-gray-900">Kustomisasi Latihanmu</h2>
            <p className="text-sm text-gray-500">Masukkan topik yang ingin kamu pelajari hari ini agar soal yang muncul lebih relevan.</p>
          </div>
          
          <div className="w-full space-y-4">
            <div className="relative">
              <input 
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Contoh: Penggunaan 'Will', Passive Voice..."
                className="w-full bg-white border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm focus:border-indigo-500 transition-all outline-none shadow-sm font-medium"
              />
            </div>
            
            <div className="flex flex-wrap justify-center gap-2">
              {['Will vs Going to', 'Present Perfect', 'Job Interview', 'Phrasal Verbs'].map(suggestion => (
                <button 
                  key={suggestion}
                  onClick={() => setTopic(suggestion)}
                  className="text-[10px] font-bold bg-white border border-gray-200 px-3 py-1.5 rounded-full hover:border-indigo-300 hover:text-indigo-600 transition-all text-gray-400"
                >
                  + {suggestion}
                </button>
              ))}
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
            >
              {isLoading ? "Menyiapkan Soal..." : "GENERATE SOAL"}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8 pb-10">
          <div className="flex items-center justify-between sticky top-0 bg-slate-50/90 backdrop-blur py-3 z-10 border-b border-gray-100">
            <div>
              <h2 className="font-black text-gray-800 uppercase tracking-tighter leading-none">English Practice Test</h2>
              <p className="text-[10px] text-indigo-600 font-bold mt-1 uppercase tracking-widest">{topic || 'General Topic'}</p>
            </div>
            {quiz.isSubmitted && (
              <span className="bg-indigo-600 text-white px-4 py-1 rounded-full font-black text-sm shadow-md">
                Score: {score}/{quiz.questions.length}
              </span>
            )}
          </div>

          {quiz.questions.map((q, idx) => (
            <div key={q.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-500">{idx + 1}</span>
                <p className="text-lg font-bold text-gray-800 leading-tight">{q.question}</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {q.options.map((opt) => {
                  const isSelected = quiz.userAnswers[q.id] === opt;
                  const isCorrect = q.correctAnswer === opt;
                  let btnClass = "text-left px-5 py-4 rounded-2xl border-2 font-medium transition-all ";

                  if (quiz.isSubmitted) {
                    if (isCorrect) btnClass += "border-green-500 bg-green-50 text-green-700 shadow-sm ";
                    else if (isSelected) btnClass += "border-red-500 bg-red-50 text-red-700 ";
                    else btnClass += "border-gray-100 text-gray-400 opacity-50 ";
                  } else {
                    btnClass += isSelected 
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md " 
                      : "border-gray-100 text-gray-600 hover:border-indigo-200 hover:bg-gray-50 ";
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => handleSelectOption(q.id, opt)}
                      className={btnClass}
                    >
                      <div className="flex items-center justify-between">
                        <span>{opt}</span>
                        {quiz.isSubmitted && isCorrect && <span className="text-green-500 text-xl">✓</span>}
                        {quiz.isSubmitted && isSelected && !isCorrect && <span className="text-red-500 text-xl">✕</span>}
                      </div>
                    </button>
                  );
                })}
              </div>

              {quiz.isSubmitted && (
                <div className="mt-4 p-5 bg-indigo-50/50 rounded-2xl border-l-4 border-indigo-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">💡</span>
                    <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">Penjelasan</p>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium">{q.explanation}</p>
                </div>
              )}
            </div>
          ))}

          <div className="flex flex-col gap-3">
            {!quiz.isSubmitted ? (
              <button
                onClick={handleSubmit}
                className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:scale-[1.01] active:scale-95 transition-all"
              >
                SUBMIT JAWABAN
              </button>
            ) : (
              <button
                onClick={() => {
                  setQuiz({ questions: [], userAnswers: {}, isSubmitted: false });
                }}
                className="w-full bg-white border-2 border-indigo-600 text-indigo-600 py-5 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:scale-[1.01] active:scale-95 transition-all"
              >
                GANTI TOPIK BARU
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizView;
