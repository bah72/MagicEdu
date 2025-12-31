
import React, { useState } from 'react';
import { searchPlaces } from '../geminiService';

interface MapsToolProps {
  onSave: (data: any) => void;
}

const MapsTool: React.FC<MapsToolProps> = ({ onSave }) => {
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('Histoire-Géo');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{text: string, places: any[]} | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    try {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const res = await searchPlaces(query, { latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setResult(res);
        onSave({ type: 'maps', title: query, subject, data: res });
      }, async () => {
        const res = await searchPlaces(query);
        setResult(res);
        onSave({ type: 'maps', title: query, subject, data: res });
      });
    } catch (e) {
      alert("Erreur de recherche.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <header>
        <h2 className="text-2xl font-bold text-white">Géographie & Sorties</h2>
        <p className="text-slate-400">Trouvez des lieux pédagogiques avec des informations à jour.</p>
      </header>

      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-400">Matière concernée</label>
          <select 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)}
            className="w-full p-3 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option>Histoire-Géo</option>
            <option>Sciences</option>
            <option>Arts</option>
            <option>Sport</option>
            <option>Général</option>
          </select>
        </div>

        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex: Quels sont les musées d'histoire à proximité pour une classe de primaire ?"
          className="w-full p-4 bg-slate-800 border border-slate-700 text-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 h-24 resize-none placeholder:text-slate-600"
        />
        <button
          onClick={handleSearch}
          disabled={isLoading || !query.trim()}
          className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
        >
          {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : '🔍 Rechercher des lieux'}
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 prose prose-invert max-w-none">
             <p className="text-slate-300 leading-relaxed">{result.text}</p>
          </div>
          
          <div className="grid gap-3">
            {result.places.map((chunk: any, i: number) => (
              chunk.maps && (
                <a key={i} href={chunk.maps.uri} target="_blank" rel="noopener noreferrer" className="block p-4 bg-slate-900 rounded-2xl border border-slate-800 hover:bg-slate-800 hover:border-emerald-500/50 transition-all shadow-sm group">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">{chunk.maps.title || "Voir sur Maps"}</span>
                    <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest">Ouvrir Maps ↗</span>
                  </div>
                </a>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapsTool;
