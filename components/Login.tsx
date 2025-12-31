
import React, { useState } from 'react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulation d'une authentification
    setTimeout(() => {
      const idTrimmed = identifier.trim().toLowerCase();
      
      // Check Admin/Professeur
      if (idTrimmed === 'moussa.ba@supnum.mr' && password === 'admin123') {
        onLogin({
          email: idTrimmed,
          role: 'teacher',
          name: 'Moussa Ba'
        });
      } 
      // Check Étudiant (Format: matricule@supnum.mr + mot de passe 123)
      else if (password === '123' && idTrimmed.endsWith('@supnum.mr')) {
        const matricule = idTrimmed.split('@')[0];
        onLogin({
          email: idTrimmed,
          role: 'student',
          name: `Étudiant (${matricule})`
        });
      }
      else {
        setError('Identifiants invalides. Les étudiants utilisent leur identifiant matricule@supnum.mr et le code "123".');
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center">
          <div className="w-20 h-20 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white text-4xl font-bold mx-auto mb-6 shadow-2xl shadow-indigo-500/20">E</div>
          <h1 className="text-3xl font-black text-white tracking-tight">EduMagic <span className="text-indigo-500">AI</span></h1>
          <p className="mt-2 text-slate-400">Assistant pédagogique nouvelle génération</p>
        </div>

        <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-slate-800 shadow-xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Identifiant</label>
              <input 
                type="text" 
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                placeholder="Ex: 25001@supnum.mr"
                className="w-full px-5 py-4 bg-slate-800/50 border border-slate-700 text-white rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-600"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Mot de passe</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-5 py-4 bg-slate-800/50 border border-slate-700 text-white rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-600"
              />
            </div>

            {error && <p className="text-red-400 text-xs font-bold text-center animate-shake">{error}</p>}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : 'SE CONNECTER'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-800/50 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-4">Accès rapides pour test</p>
            <div className="flex gap-2">
              <button onClick={() => {setIdentifier('moussa.ba@supnum.mr'); setPassword('admin123');}} className="flex-1 py-2 bg-slate-800/50 hover:bg-slate-800 text-[10px] font-bold text-slate-400 rounded-xl transition-colors">ADMIN</button>
              <button onClick={() => {setIdentifier('25001@supnum.mr'); setPassword('123');}} className="flex-1 py-2 bg-slate-800/50 hover:bg-slate-800 text-[10px] font-bold text-slate-400 rounded-xl transition-colors">ÉLÈVE (123)</button>
            </div>
          </div>
        </div>
        
        <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">© 2025 EduMagic AI • SupNum Mauritanie</p>
      </div>
    </div>
  );
};

export default Login;
