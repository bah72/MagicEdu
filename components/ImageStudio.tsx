
import React, { useState } from 'react';
import { generateImage, editImage } from '../geminiService';

interface ImageStudioProps {
  onSave: (data: any) => void;
}

const ImageStudio: React.FC<ImageStudioProps> = ({ onSave }) => {
  const [prompt, setPrompt] = useState('');
  const [subject, setSubject] = useState('Arts');
  const [size, setSize] = useState<"1K" | "2K" | "4K">("1K");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [mode, setMode] = useState<'generate' | 'edit'>('generate');

  const handleAction = async () => {
    if (!prompt.trim()) return;

    // Check for selected API key when using gemini-3-pro-image-preview
    if (mode === 'generate') {
      try {
        if (!(await (window as any).aistudio.hasSelectedApiKey())) {
          await (window as any).aistudio.openSelectKey();
        }
      } catch (err) {
        console.error("API Key selection failed", err);
      }
    }

    setIsLoading(true);
    try {
      let imageUrl: string | undefined;
      if (mode === 'generate') {
        imageUrl = await generateImage(prompt, size);
      } else {
        if (!result) return alert("Veuillez d'abord générer ou charger une image.");
        imageUrl = await editImage(result, prompt);
      }

      if (imageUrl) {
        setResult(imageUrl);
        onSave({ type: 'image', title: prompt, subject, data: imageUrl });
      }
    } catch (e) {
      alert("Erreur de génération.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <header>
        <h2 className="text-2xl font-bold text-white">Studio Image IA</h2>
        <p className="text-slate-400">Générez des illustrations haute qualité ou modifiez-les à la volée.</p>
      </header>

      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex p-1 bg-slate-800 rounded-2xl w-fit border border-slate-700">
            <button onClick={() => setMode('generate')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${mode === 'generate' ? 'bg-slate-700 text-indigo-400 shadow-sm' : 'text-slate-500'}`}>Générer</button>
            <button onClick={() => setMode('edit')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${mode === 'edit' ? 'bg-slate-700 text-indigo-400 shadow-sm' : 'text-slate-500'}`}>Modifier</button>
          </div>

          <div className="flex-1 min-w-[200px]">
             <select 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-2.5 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium"
              >
                <option>Arts</option>
                <option>Histoire-Géo</option>
                <option>Sciences</option>
                <option>Français</option>
                <option>Anglais</option>
                <option>Général</option>
              </select>
          </div>
        </div>

        {mode === 'generate' && (
          <div className="flex gap-4">
            {(["1K", "2K", "4K"] as const).map(s => (
              <button key={s} onClick={() => setSize(s)} className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all ${size === s ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-slate-800 text-slate-500 hover:border-slate-700'}`}>{s}</button>
            ))}
          </div>
        )}

        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={mode === 'generate' ? "Décrivez l'image à créer..." : "Ex: Ajoute un filtre rétro, change le ciel en rose..."}
            className="w-full p-4 bg-slate-800 border border-slate-700 text-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 h-32 resize-none placeholder:text-slate-600"
          />
        </div>

        <button
          onClick={handleAction}
          disabled={isLoading || !prompt.trim()}
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10"
        >
          {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (mode === 'generate' ? '🎨 Créer l\'image' : '✨ Appliquer la modification')}
        </button>
      </div>

      {result && (
        <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 shadow-xl overflow-hidden group">
          <img src={result} alt="Generated" className="w-full h-auto rounded-2xl" />
          <div className="mt-4 flex gap-2">
            <button onClick={() => {
               const a = document.createElement('a');
               a.href = result;
               a.download = 'edumagic-image.png';
               a.click();
            }} className="flex-1 py-3 bg-slate-100 text-slate-900 rounded-xl font-bold text-sm hover:bg-white transition-colors">Télécharger</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageStudio;
