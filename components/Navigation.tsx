
import React from 'react';
import { AppView, UserRole } from '../types';

interface NavigationProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  desktop?: boolean;
  role: UserRole;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setCurrentView, desktop, role }) => {
  const teacherItems = [
    { id: 'dashboard' as AppView, label: 'Accueil', icon: '🏠' },
    { id: 'corrector' as AppView, label: 'Correction', icon: '📝' },
    { id: 'generator' as AppView, label: 'Quiz & Exo', icon: '✨' },
    { id: 'image-studio' as AppView, label: 'Studio Image', icon: '🎨' },
    { id: 'video-creator' as AppView, label: 'Studio Vidéo', icon: '🎬' },
    { id: 'maps' as AppView, label: 'Sorties/Géo', icon: '📍' },
    { id: 'voice' as AppView, label: 'Assistant Vocal', icon: '🎙️' },
    { id: 'history' as AppView, label: 'Bibliothèque', icon: '📚' },
  ];

  const studentItems = [
    { id: 'student-portal' as AppView, label: 'Mes Quiz', icon: '🎓' },
    { id: 'voice' as AppView, label: 'Tuteur Vocal', icon: '🎙️' },
    { id: 'history' as AppView, label: 'Ressources', icon: '📚' },
  ];

  const items = role === 'teacher' ? teacherItems : studentItems;

  if (desktop) {
    return (
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto no-scrollbar">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
              currentView === item.id 
                ? 'bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20' 
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>
    );
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/80 border-t border-slate-800 flex justify-around items-center p-2 z-50 glass overflow-x-auto no-scrollbar">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => setCurrentView(item.id)}
          className={`flex flex-col items-center gap-1 min-w-[60px] transition-all ${
            currentView === item.id ? 'text-indigo-400' : 'text-slate-500'
          }`}
        >
          <span className="text-xl">{item.icon}</span>
          <span className="text-[9px] font-medium uppercase truncate w-full text-center">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default Navigation;
