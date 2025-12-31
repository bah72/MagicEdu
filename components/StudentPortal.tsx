
import React, { useState, useMemo, useEffect } from 'react';
import { HistoryItem, QuizResult, QuizQuestion } from '../types';

interface StudentPortalProps {
  history: HistoryItem[];
  userName: string;
}

const StudentPortal: React.FC<StudentPortalProps> = ({ history, userName }) => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<HistoryItem | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(30); // Par défaut 30s

  const subjects = useMemo(() => {
    const s = Array.from(new Set(history.filter(h => h.type === 'quiz').map(h => h.subject).filter(Boolean)));
    return s.length > 0 ? s : [];
  }, [history]);

  const availableQuizzes = useMemo(() => {
    if (!selectedSubject) return [];
    return history.filter(h => h.type === 'quiz' && h.subject === selectedSubject);
  }, [history, selectedSubject]);

  // Logique du Timer
  useEffect(() => {
    if (!activeQuiz || quizFinished) return;

    const currentQ = (activeQuiz.data as QuizResult).questions[currentQuestionIndex];
    if (timeLeft <= 0) {
      // Temps écoulé : on passe à la suivante avec une réponse vide
      handleAnswer("[TEMPS ÉCOULÉ]");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, activeQuiz, quizFinished, currentQuestionIndex]);

  const startQuiz = (quiz: HistoryItem) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setQuizFinished(false);
    const firstQ = (quiz.data as QuizResult).questions[0];
    setTimeLeft(firstQ.timeLimit || 30);
  };

  const handleAnswer = (answer: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);

    const questions = (activeQuiz?.data as QuizResult).questions;
    if (currentQuestionIndex < questions.length - 1) {
      const nextQ = questions[currentQuestionIndex + 1];
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
        setTimeLeft(nextQ.timeLimit || 30);
      }, 300);
    } else {
      setQuizFinished(true);
    }
  };

  const calculateScore = () => {
    if (!activeQuiz) return 0;
    const questions = (activeQuiz.data as QuizResult).questions;
    let score = 0;
    userAnswers.forEach((ans, i) => {
      if (ans && ans.toLowerCase().trim() === questions[i].answer.toLowerCase().trim()) {
        score++;
      }
    });
    return score;
  };

  if (quizFinished && activeQuiz) {
    const score = calculateScore();
    const questions = (activeQuiz.data as QuizResult).questions;
    return (
      <div className="space-y-8 animate-in zoom-in-95 duration-500 max-w-2xl mx-auto py-12">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-3xl font-black text-white">Quiz Terminé !</h2>
          <p className="text-slate-400">Bravo {userName}, voici tes résultats pour {activeQuiz.subject}.</p>
          <div className="inline-block p-8 bg-slate-900 border border-slate-800 rounded-full">
            <div className="text-5xl font-black text-emerald-400">{score}<span className="text-2xl text-slate-600">/{questions.length}</span></div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-200">Correction détaillée</h3>
          {questions.map((q, i) => (
            <div key={i} className={`p-6 rounded-3xl border ${userAnswers[i] && userAnswers[i].toLowerCase().trim() === q.answer.toLowerCase().trim() ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
              <p className="font-bold text-slate-200 mb-2">{q.question}</p>
              <div className="flex flex-col gap-1 text-sm">
                <p className={`${userAnswers[i] && userAnswers[i].toLowerCase().trim() === q.answer.toLowerCase().trim() ? 'text-emerald-400' : 'text-red-400'} font-semibold`}>
                  Ta réponse : {userAnswers[i] || "Aucune"}
                </p>
                {( !userAnswers[i] || userAnswers[i].toLowerCase().trim() !== q.answer.toLowerCase().trim()) && (
                  <p className="text-emerald-400 font-semibold">Réponse correcte : {q.answer}</p>
                )}
                <p className="text-slate-500 mt-2 italic">Explication : {q.explanation}</p>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={() => {setActiveQuiz(null); setQuizFinished(false);}}
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg"
        >
          Retourner au portail
        </button>
      </div>
    );
  }

  if (activeQuiz) {
    const questions = (activeQuiz.data as QuizResult).questions;
    const currentQ = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    const initialTime = currentQ.timeLimit || 30;
    const timePercentage = (timeLeft / initialTime) * 100;

    return (
      <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 max-w-2xl mx-auto py-8 px-4">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{activeQuiz.subject}</span>
            <h2 className="text-2xl font-bold text-white">{activeQuiz.title}</h2>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-black tabular-nums ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-slate-200'}`}>
              {timeLeft}s
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase">Restants</span>
          </div>
        </div>

        {/* Barres de progression combinées */}
        <div className="space-y-2">
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-1000 ${timeLeft <= 5 ? 'bg-red-500' : 'bg-indigo-500'}`} style={{ width: `${timePercentage}%` }}></div>
            </div>
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                <span>Progression</span>
                <span>Question {currentQuestionIndex + 1} sur {questions.length}</span>
            </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 space-y-8 shadow-xl relative overflow-hidden">
          {/* Décoration de fond subtile pour le timer */}
          {timeLeft <= 5 && (
            <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none"></div>
          )}

          <h3 className="text-xl md:text-2xl font-bold text-slate-100 leading-relaxed text-center">{currentQ.question}</h3>
          
          <div className="grid gap-3">
            {currentQ.options ? (
              currentQ.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt)}
                  className="w-full p-5 bg-slate-800 border border-slate-700 rounded-2xl text-left font-semibold text-slate-300 hover:border-indigo-500 hover:bg-indigo-500/10 transition-all active:scale-95 group flex items-center gap-4"
                >
                  <span className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors">{String.fromCharCode(65 + i)}</span>
                  {opt}
                </button>
              ))
            ) : (
              <div className="space-y-4">
                <input 
                  type="text" 
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleAnswer((e.target as HTMLInputElement).value)}
                  placeholder="Écris ta réponse ici..."
                  className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <button 
                  onClick={(e) => {
                    const input = (e.currentTarget.previousSibling as HTMLInputElement);
                    handleAnswer(input.value);
                  }}
                  className="w-full py-4 bg-indigo-600 rounded-2xl font-bold shadow-lg"
                >
                  Valider la réponse
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <header className="text-center space-y-2">
        <h2 className="text-3xl font-black text-white">Bonjour, {userName} ! 🚀</h2>
        <p className="text-slate-400">Choisis une matière pour commencer à t'entraîner.</p>
      </header>

      {/* Matières */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {subjects.length > 0 ? subjects.map((s) => (
          <button
            key={s}
            onClick={() => setSelectedSubject(s!)}
            className={`p-6 rounded-3xl border flex flex-col items-center gap-3 transition-all ${
              selectedSubject === s 
                ? 'bg-indigo-500 border-indigo-400 shadow-[0_0_30px_rgba(79,70,229,0.3)] scale-105' 
                : 'bg-slate-900 border-slate-800 hover:border-slate-700 grayscale hover:grayscale-0'
            }`}
          >
            <span className="text-4xl">
              {s === 'Mathématiques' ? '🔢' : s === 'Français' ? '📚' : s === 'Anglais' ? '🌍' : s === 'Sciences' ? '🧬' : '🎨'}
            </span>
            <span className="font-bold text-sm">{s}</span>
          </button>
        )) : (
          <div className="col-span-full py-12 text-center text-slate-500 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800">
            Ton professeur n'a pas encore créé de quiz pour toi.
          </div>
        )}
      </div>

      {/* Liste des Quiz de la matière */}
      {selectedSubject && (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <span>✨</span> Quiz disponibles en {selectedSubject}
          </h3>
          <div className="grid gap-3">
            {availableQuizzes.map(quiz => (
              <button
                key={quiz.id}
                onClick={() => startQuiz(quiz)}
                className="w-full p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between hover:border-emerald-500/50 hover:bg-slate-800/50 transition-all group shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">🎓</div>
                  <div className="text-left">
                    <h4 className="font-bold text-slate-200">{quiz.title}</h4>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">{(quiz.data as QuizResult).questions.length} Questions • {quiz.level}</p>
                  </div>
                </div>
                <div className="px-4 py-2 bg-emerald-500 text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                  Démarrer
                </div>
              </button>
            ))}
            {availableQuizzes.length === 0 && (
              <p className="text-center text-slate-600 italic py-8">Aucun quiz disponible pour cette matière.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPortal;
