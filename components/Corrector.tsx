
import React, { useState, useRef, useMemo } from 'react';
import { correctWork, FileData } from '../geminiService';
import { CorrectionResult, HistoryItem } from '../types';
import VoiceInputButton from './VoiceInputButton';

interface CorrectorProps {
  onSave: (data: any) => void;
  history: HistoryItem[];
}

const Corrector: React.FC<CorrectorProps> = ({ onSave, history }) => {
  const [text, setText] = useState('');
  const [subject, setSubject] = useState('Français');
  const [level, setLevel] = useState('Collège');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CorrectionResult | null>(null);
  const [pdfFile, setPdfFile] = useState<{ name: string, data: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtrer les quiz correspondants à la matière sélectionnée
  const relatedQuizzes = useMemo(() => {
    return history.filter(item => 
      item.type === 'quiz' && 
      item.subject === subject
    ).slice(0, 3);
  }, [history, subject]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        setPdfFile({ name: file.name, data: base64 });
      };
      reader.readAsDataURL(file);
    } else if (file) {
      alert("Veuillez sélectionner un fichier PDF.");
    }
  };

  const handleCorrect = async () => {
    if (!text.trim() && !pdfFile) return;
    setIsLoading(true);
    try {
      const fileData: FileData | undefined = pdfFile ? { data: pdfFile.data, mimeType: 'application/pdf' } : undefined;
      const correction = await correctWork(text, subject, level, fileData);
      setResult(correction);
      onSave({ ...correction, subject, level, originalText: text });
    } catch (error) {
      alert("Erreur lors de la correction. Vérifiez votre clé API.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-12">
      <header className="flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-white">Correction IA</h2>
          <p className="text-slate-400">Analysez des copies d'élèves {subject === 'Mathématiques' ? 'en Mathématiques' : ''}.</p>
        </div>
      </header>

      {!result ? (
        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-400">Matière</label>
                <select 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-3 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option>Français</option>
                  <option>Mathématiques</option>
                  <option>Histoire-Géo</option>
                  <option>Philosophie</option>
                  <option>Anglais</option>
                  <option>Sciences</option>
                  <option>Arts</option>
                  <option>Général</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-400">Niveau scolaire</label>
                <select 
                  value={level} 
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full p-3 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option>Primaire</option>
                  <option>Collège</option>
                  <option>Lycée</option>
                  <option>Supérieur</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-400">Importation du Devoir (PDF)</label>
                {!pdfFile ? (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-6 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">📄</span>
                    <span className="text-sm font-bold text-slate-500 group-hover:text-indigo-400">Importer un fichier PDF</span>
                  </button>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl animate-in zoom-in-95">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="text-2xl">📄</span>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Document prêt</p>
                        <p className="text-sm text-indigo-200 font-medium truncate">{pdfFile.name}</p>
                      </div>
                    </div>
                    <button onClick={() => setPdfFile(null)} className="p-2 text-slate-500 hover:text-red-400 transition-colors">✕</button>
                  </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" className="hidden" />
              </div>

              <div className="space-y-2 relative">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-semibold text-slate-400">Saisie manuelle</label>
                  <VoiceInputButton onTranscript={(t) => setText(prev => prev + (prev ? ' ' : '') + t)} />
                </div>
                <textarea 
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Écrivez ou collez le contenu ici..."
                  className="w-full h-32 p-4 bg-slate-800 border border-slate-700 text-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none placeholder:text-slate-600"
                />
              </div>
            </div>

            <button 
              onClick={handleCorrect}
              disabled={isLoading || (!text.trim() && !pdfFile)}
              className={`w-full py-4 rounded-2xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 ${
                isLoading ? 'bg-indigo-600/50 cursor-not-allowed shadow-none' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-indigo-500/20'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Correction en cours...
                </>
              ) : (
                <>🪄 Analyser la copie de {subject}</>
              )}
            </button>
          </div>

          {/* Section "Vos ressources liées" */}
          {relatedQuizzes.length > 0 && (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-700">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <span>📚</span> Vos Quiz de {subject} récents
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {relatedQuizzes.map(quiz => (
                  <div key={quiz.id} className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col gap-2 hover:border-purple-500/30 transition-all cursor-default group">
                    <span className="text-xs font-bold text-purple-400">Quiz</span>
                    <h4 className="text-sm font-semibold text-slate-200 line-clamp-1">{quiz.title}</h4>
                    <p className="text-[10px] text-slate-500">{quiz.date}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex gap-4 print:hidden">
            <div className="flex-1 bg-slate-900 p-6 rounded-3xl border border-slate-800 text-center">
              <div className="text-4xl font-black text-indigo-400">{result.score}<span className="text-lg text-slate-600">/{result.maxScore}</span></div>
              <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mt-1">Note suggérée</p>
            </div>
            <button 
              onClick={() => setResult(null)} 
              className="px-6 bg-slate-800 text-slate-300 rounded-3xl font-semibold hover:bg-slate-700 transition-colors"
            >
              Nouvelle correction
            </button>
          </div>

          <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 p-6 rounded-3xl border border-indigo-500/20 flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in zoom-in-95 duration-700 delay-300">
            <div className="flex items-center gap-4">
              <span className="text-3xl">🎯</span>
              <div>
                <h4 className="font-bold text-white">Besoin d'un nouvel exercice ?</h4>
                <p className="text-xs text-slate-400">Créez un quiz de remédiation basé sur ce feedback en {subject}.</p>
              </div>
            </div>
            <button className="px-6 py-2 bg-indigo-500 text-white rounded-xl font-bold text-sm hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20">
              Générer Quiz ciblé
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-emerald-500/5 p-6 rounded-3xl border border-emerald-500/20">
              <h4 className="font-bold text-emerald-400 mb-4 flex items-center gap-2">✅ Points forts</h4>
              <ul className="space-y-2">
                {result.positivePoints.map((p, i) => <li key={i} className="text-sm text-emerald-300/80 flex gap-2"><span>•</span>{p}</li>)}
              </ul>
            </div>
            <div className="bg-amber-500/5 p-6 rounded-3xl border border-amber-500/20">
              <h4 className="font-bold text-amber-400 mb-4 flex items-center gap-2">🎯 Axes d'amélioration</h4>
              <ul className="space-y-2">
                {result.improvements.map((p, i) => <li key={i} className="text-sm text-amber-300/80 flex gap-2"><span>•</span>{p}</li>)}
              </ul>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
            <h4 className="font-bold text-white mb-4">Feedback Général</h4>
            <p className="text-slate-400 leading-relaxed text-sm italic">"{result.generalFeedback}"</p>
          </div>

          <div className="bg-slate-800 p-8 rounded-3xl shadow-xl text-slate-100 print:bg-white print:text-slate-900">
            <h4 className="font-bold mb-4 flex items-center gap-2">✍️ Texte corrigé</h4>
            <div className="text-sm leading-loose opacity-90 whitespace-pre-wrap font-serif">
              {result.correctedText}
            </div>
          </div>

          <button 
            className="w-full py-4 bg-slate-100 text-slate-900 rounded-2xl font-bold hover:bg-white transition-all flex items-center justify-center gap-2 print:hidden"
            onClick={() => window.print()}
          >
            <span>🖨️ Exporter en PDF / Imprimer</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Corrector;
