
import React, { useState, useRef } from 'react';
import { generateQuiz, FileData } from '../geminiService';
import { QuizResult, QuizQuestion } from '../types';
import VoiceInputButton from './VoiceInputButton';

interface GeneratorProps {
  onSave: (data: any) => void;
}

const Generator: React.FC<GeneratorProps> = ({ onSave }) => {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('Français');
  const [level, setLevel] = useState('Collège');
  const [count, setCount] = useState(5);
  const [type, setType] = useState('QCM');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [sourcePdf, setSourcePdf] = useState<{ name: string, data: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    if (!topic.trim() && !sourcePdf) return;
    setIsLoading(true);
    try {
      const fileData: FileData | undefined = sourcePdf ? { data: sourcePdf.data, mimeType: 'application/pdf' } : undefined;
      // Ajout de 'subject' dans l'appel
      const quiz = await generateQuiz(topic, subject, level, count, type, fileData);
      setResult(quiz);
      onSave({ ...quiz, subject, level });
    } catch (error) {
      alert("Erreur lors de la génération. Vérifiez votre clé API.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        setSourcePdf({ name: file.name, data: base64 });
      };
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(content);
          if (parsed.questions && Array.isArray(parsed.questions)) {
            const importedResult: QuizResult = {
              title: parsed.title || `Import: ${file.name}`,
              questions: parsed.questions
            };
            setResult(importedResult);
            onSave({ ...importedResult, subject: 'Importé', level: 'N/A' });
          } else {
            throw new Error("Format JSON invalide");
          }
        } else if (file.name.endsWith('.csv')) {
          const lines = content.split('\n').filter(line => line.trim() !== '');
          const questions: QuizQuestion[] = lines.slice(1).map(line => {
            const parts = line.split(',').map(p => p.trim());
            return {
              question: parts[0],
              answer: parts[1],
              explanation: parts[2] || '',
              options: parts.length > 3 ? parts.slice(3) : undefined
            };
          });
          const importedResult: QuizResult = {
            title: `Import CSV: ${file.name}`,
            questions
          };
          setResult(importedResult);
          onSave({ ...importedResult, subject: 'Importé', level: 'N/A' });
        } else {
          alert("Format de fichier non supporté. Utilisez .json, .csv ou .pdf");
        }
      } catch (err) {
        console.error(err);
        alert("Erreur lors de la lecture du fichier. Vérifiez le format.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Générateur de Ressources</h2>
          <p className="text-slate-400">Créez des quiz à partir d'un sujet ou d'un PDF source.</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".json,.csv,.pdf" 
            className="hidden" 
          />
          <button 
            onClick={handleImportClick}
            className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm"
          >
            <span>📥 Importer (PDF/JSON/CSV)</span>
          </button>
        </div>
      </header>

      {!result ? (
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 space-y-8">
          {sourcePdf && (
            <div className="flex items-center justify-between p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="text-2xl">📄</span>
                <div>
                  <p className="text-xs font-bold text-purple-400 uppercase tracking-widest">Source de contenu active</p>
                  <p className="text-sm text-purple-200 font-medium truncate">{sourcePdf.name}</p>
                </div>
              </div>
              <button onClick={() => setSourcePdf(null)} className="text-slate-500 hover:text-red-400 p-2">✕</button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-semibold text-slate-400">Sujet ou Précision</label>
                <VoiceInputButton onTranscript={(t) => setTopic(prev => prev + (prev ? ' ' : '') + t)} />
              </div>
              <input 
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={sourcePdf ? "Optionnel : précisez un chapitre..." : "Ex: La Révolution Française..."}
                className="w-full p-4 bg-slate-800 border border-slate-700 text-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/20 placeholder:text-slate-600"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-400 mt-8 md:mt-0 block h-5">Matière</label>
              <select 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-4 bg-slate-800 border border-slate-700 text-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                <option>Français</option>
                <option>Mathématiques</option>
                <option>Histoire-Géo</option>
                <option>Sciences</option>
                <option>Anglais</option>
                <option>Philosophie</option>
                <option>Arts</option>
                <option>Général</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-400">Niveau</label>
              <select 
                value={level} 
                onChange={(e) => setLevel(e.target.value)}
                className="w-full p-3 bg-slate-800 border border-slate-700 text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                <option>Maternelle</option>
                <option>Primaire</option>
                <option>Collège</option>
                <option>Lycée</option>
                <option>Bac +2</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-400">Format</label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value)}
                className="w-full p-3 bg-slate-800 border border-slate-700 text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="QCM">QCM (Choix Multiples)</option>
                <option value="questions ouvertes">Questions ouvertes</option>
                <option value="Vrai/Faux">Vrai / Faux</option>
                <option value="exercice complet">Exercice d'application</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-400">Questions ({count})</label>
              <input 
                type="range" min="1" max="10" step="1"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
                className="w-full accent-purple-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isLoading || (!topic.trim() && !sourcePdf)}
            className={`w-full py-4 rounded-2xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 ${
              isLoading ? 'bg-purple-600/50 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 active:scale-95'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Génération en cours...
              </>
            ) : (
              <>✨ Créer le contenu avec l'IA</>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center print:hidden">
            <div>
              <h3 className="text-xl font-bold text-white">{result.title}</h3>
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">{subject} • {level}</p>
            </div>
            <button 
              onClick={() => setResult(null)} 
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-700 transition-colors"
            >
              Nouveau / Recommencer
            </button>
          </div>

          <div className="space-y-4">
            {result.questions.map((q, i) => (
              <div key={i} className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4 break-inside-avoid shadow-sm">
                <div className="flex gap-4">
                  <span className="w-8 h-8 bg-purple-500/10 text-purple-400 rounded-lg flex items-center justify-center font-bold flex-shrink-0">{i+1}</span>
                  <p className="text-slate-200 font-semibold leading-relaxed">{q.question}</p>
                </div>
                
                {q.options && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-12">
                    {q.options.map((opt, idx) => (
                      <div key={idx} className={`p-3 rounded-xl border border-slate-800 text-slate-400 text-sm bg-slate-900/50`}>
                        <span className="inline-block w-6 font-bold text-slate-600">{String.fromCharCode(65 + idx)}.</span> {opt}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 pl-12 pt-4 border-t border-slate-800 print:hidden">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Correction suggérée</p>
                  <p className="text-emerald-400 font-bold mb-2 text-sm">Réponse : {q.answer}</p>
                  <p className="text-slate-500 text-xs italic">{q.explanation}</p>
                </div>
              </div>
            ))}
          </div>
          
          <button 
            className="w-full py-4 bg-slate-100 text-slate-900 rounded-2xl font-bold hover:bg-white transition-all flex items-center justify-center gap-2 print:hidden shadow-lg"
            onClick={() => window.print()}
          >
            <span>🖨️ Imprimer ou Exporter PDF</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Generator;
