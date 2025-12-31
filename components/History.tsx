
import React, { useState } from 'react';
import { HistoryItem } from '../types';

interface HistoryProps {
  history: HistoryItem[];
}

const History: React.FC<HistoryProps> = ({ history }) => {
  const [typeFilter, setTypeFilter] = useState<'all' | 'correction' | 'quiz' | 'image' | 'video' | 'maps'>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const subjects = ['all', ...Array.from(new Set(history.map(item => item.subject).filter(Boolean)))];
  const levels = ['all', ...Array.from(new Set(history.map(item => item.level).filter(Boolean)))];

  const getCount = (type: string, subject: string) => {
    return history.filter(item => 
      (type === 'all' || item.type === type) && 
      (subject === 'all' || item.subject === subject)
    ).length;
  };

  const filtered = history.filter(item => {
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesSubject = subjectFilter === 'all' || item.subject === subjectFilter;
    const matchesLevel = levelFilter === 'all' || item.level === levelFilter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSubject && matchesLevel && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Ma Bibliothèque</h2>
          <p className="text-slate-400">Vos ressources, corrections et quiz centralisés.</p>
        </div>
        <div className="relative flex-1 max-w-md">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm transition-all placeholder:text-slate-600"
          />
        </div>
      </header>

      <div className="space-y-4 bg-slate-900 p-6 rounded-3xl border border-slate-800">
        <div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Matières & Ressources disponibles</span>
          <div className="flex flex-wrap gap-2">
            {subjects.map((s) => {
              const count = history.filter(item => s === 'all' || item.subject === s).length;
              if (count === 0 && s !== 'all') return null;
              return (
                <button
                  key={s}
                  onClick={() => setSubjectFilter(s!)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                    subjectFilter === s 
                      ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' 
                      : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
                  }`}
                >
                  {s === 'all' ? 'Toutes les matières' : s}
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${subjectFilter === s ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-600'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800/50">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Filtrer par type</span>
          <div className="flex flex-wrap gap-2">
            {(['all', 'correction', 'quiz', 'image', 'video', 'maps'] as const).map((f) => {
              const count = getCount(f, subjectFilter);
              return (
                <button
                  key={f}
                  onClick={() => setTypeFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                    typeFilter === f ? 'bg-slate-100 text-slate-900' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {f === 'all' ? 'Tout' : f.charAt(0).toUpperCase() + f.slice(1)}
                  {count > 0 && <span className="opacity-50 text-[10px]">({count})</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length > 0 ? filtered.map((item) => (
          <div key={item.id} className="group p-5 bg-slate-900 rounded-3xl border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer flex flex-col h-full shadow-sm hover:shadow-indigo-500/10">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                item.type === 'correction' ? 'bg-blue-500/10' : 
                item.type === 'quiz' ? 'bg-purple-500/10' : 
                item.type === 'image' ? 'bg-pink-500/10' : 
                'bg-emerald-500/10'
              }`}>
                {item.type === 'correction' ? '📝' : item.type === 'quiz' ? '✨' : item.type === 'image' ? '🎨' : '📍'}
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="px-2 py-0.5 bg-slate-800 text-[9px] font-black text-slate-400 rounded border border-slate-700 uppercase">
                  {item.subject || 'Général'}
                </span>
              </div>
            </div>
            <h4 className="font-bold text-slate-200 line-clamp-2 flex-1">{item.title}</h4>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-500">{item.date}</span>
              <span className="text-[10px] font-black text-indigo-400 uppercase group-hover:translate-x-1 transition-transform">Voir →</span>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-12 text-center text-slate-500 bg-slate-900 rounded-3xl border border-dashed border-slate-800">
            <p className="text-4xl mb-4">🔍</p>
            <p className="font-medium">Aucune ressource trouvée pour cette sélection.</p>
            <button 
              onClick={() => {setTypeFilter('all'); setSubjectFilter('all');}}
              className="mt-4 text-indigo-400 text-sm font-bold hover:underline"
            >
              Afficher tout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
