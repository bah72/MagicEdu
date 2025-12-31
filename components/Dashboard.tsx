
import React from 'react';
import { HistoryItem, AppView } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  history: HistoryItem[];
  onViewChange: (view: AppView) => void;
  userName: string;
}

const Dashboard: React.FC<DashboardProps> = ({ history, onViewChange, userName }) => {
  const data = [
    { name: 'Lun', qty: 4 },
    { name: 'Mar', qty: 7 },
    { name: 'Mer', qty: 3 },
    { name: 'Jeu', qty: 8 },
    { name: 'Ven', qty: 5 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-3xl font-black text-white">Bonjour, {userName} 👋</h2>
        <p className="text-slate-400">Prêt à transformer vos cours aujourd'hui ?</p>
      </header>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          onClick={() => onViewChange('corrector')}
          className="group p-6 bg-slate-900 rounded-3xl border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer bg-gradient-to-br from-indigo-500/5 to-slate-900"
        >
          <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">📝</div>
          <h3 className="text-xl font-bold text-white">Correction Instantanée</h3>
          <p className="text-slate-400 mt-2">Analysez des textes ou scans, obtenez des notes et des feedbacks constructifs.</p>
        </div>

        <div 
          onClick={() => onViewChange('generator')}
          className="group p-6 bg-slate-900 rounded-3xl border border-slate-800 hover:border-purple-500/50 transition-all cursor-pointer bg-gradient-to-br from-purple-500/5 to-slate-900"
        >
          <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">✨</div>
          <h3 className="text-xl font-bold text-white">Générateur de Quiz</h3>
          <p className="text-slate-400 mt-2">Créez des évaluations personnalisées sur n'importe quel sujet en quelques secondes.</p>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <span>📊</span> Activité de la semaine
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
              <YAxis hide />
              <Tooltip 
                cursor={{fill: '#1e293b'}} 
                contentStyle={{backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', color: '#fff'}}
              />
              <Bar dataKey="qty" fill="#6366f1" radius={[6, 6, 6, 6]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent History */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">Travaux récents</h3>
          <button onClick={() => onViewChange('history')} className="text-indigo-400 text-sm font-semibold hover:underline">Voir tout</button>
        </div>
        <div className="space-y-3">
          {history.length > 0 ? history.slice(0, 3).map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4 bg-slate-900 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${item.type === 'correction' ? 'bg-blue-500/10' : 'bg-purple-500/10'}`}>
                {item.type === 'correction' ? '📝' : '✨'}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-200">{item.title}</h4>
                <p className="text-xs text-slate-500">{item.date}</p>
              </div>
            </div>
          )) : (
            <div className="text-center py-8 text-slate-600 italic">Aucun historique pour le moment.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
