
import React, { useState, useEffect } from 'react';
import { AppView, HistoryItem, UserRole, User } from './types';
import Dashboard from './components/Dashboard';
import Corrector from './components/Corrector';
import Generator from './components/Generator';
import ImageStudio from './components/ImageStudio';
import VideoCreator from './components/VideoCreator';
import VoiceAssistant from './components/VoiceAssistant';
import MapsTool from './components/MapsTool';
import History from './components/History';
import Navigation from './components/Navigation';
import StudentPortal from './components/StudentPortal';
import Login from './components/Login';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Charge l'historique et la session utilisateur au démarrage
  useEffect(() => {
    const savedHistory = localStorage.getItem('edumagic_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    
    const savedUser = localStorage.getItem('edumagic_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      if (parsedUser.role === 'student') setCurrentView('student-portal');
    }
  }, []);

  const handleLogin = (loggedUser: User) => {
    setUser(loggedUser);
    localStorage.setItem('edumagic_user', JSON.stringify(loggedUser));
    if (loggedUser.role === 'student') setCurrentView('student-portal');
    else setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('edumagic_user');
  };

  const addToHistory = (item: Omit<HistoryItem, 'id' | 'date'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };
    const updatedHistory = [newItem, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('edumagic_history', JSON.stringify(updatedHistory));
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderView = () => {
    // Les étudiants n'ont accès qu'à certaines vues
    if (user.role === 'student' && !['student-portal', 'voice', 'history'].includes(currentView)) {
       // Fix: Pass missing userName prop
       return <StudentPortal history={history} userName={user.name} />;
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard history={history} onViewChange={setCurrentView} userName={user.name} />;
      case 'corrector':
        return (
          <Corrector 
            history={history}
            onSave={(data) => addToHistory({ type: 'correction', title: 'Correction: ' + data.subject, subject: data.subject, level: data.level, data })} 
          />
        );
      case 'generator':
        return <Generator onSave={(data) => addToHistory({ type: 'quiz', title: data.title, subject: data.subject, level: data.level, data })} />;
      case 'image-studio':
        return <ImageStudio onSave={(data) => addToHistory({ ...data })} />;
      case 'video-creator':
        return <VideoCreator onSave={(data) => addToHistory({ ...data })} />;
      case 'voice':
        return <VoiceAssistant role={user.role} />;
      case 'maps':
        return <MapsTool onSave={(data) => addToHistory({ ...data })} />;
      case 'history':
        return <History history={history} />;
      case 'student-portal':
        return <StudentPortal history={history} userName={user.name} />;
      default:
        return <Dashboard history={history} onViewChange={setCurrentView} userName={user.name} />;
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-0 md:pl-64 flex flex-col bg-slate-950 text-slate-100">
      {/* Sidebar Desktop */}
      <div className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 flex-col z-50">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-indigo-400 flex items-center gap-2">
            <span className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white text-lg shadow-lg">E</span>
            EduMagic
          </h1>
          <div className="mt-6 p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Session active</p>
            <p className="text-sm font-bold text-slate-200 truncate">{user.name}</p>
            <p className="text-[10px] text-slate-400 mb-3">{user.role === 'teacher' ? 'Professeur (Admin)' : 'Étudiant'}</p>
            <button 
              onClick={handleLogout}
              className="w-full py-1.5 text-[10px] font-bold bg-slate-900 text-slate-400 hover:text-red-400 border border-slate-700 rounded-lg transition-colors"
            >
              DÉCONNEXION
            </button>
          </div>
        </div>
        <Navigation currentView={currentView} setCurrentView={setCurrentView} desktop role={user.role} />
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-8 overflow-y-auto">
        <header className="md:hidden flex justify-between items-center mb-6">
           <h1 className="text-xl font-bold text-indigo-400">EduMagic</h1>
           <button onClick={handleLogout} className="text-xs font-bold text-slate-500 border border-slate-800 px-3 py-1.5 rounded-full">
             Quitter
           </button>
        </header>
        {renderView()}
      </main>

      {/* Bottom Nav Mobile */}
      <div className="md:hidden">
        <Navigation currentView={currentView} setCurrentView={setCurrentView} role={user.role} />
      </div>
    </div>
  );
};

export default App;
