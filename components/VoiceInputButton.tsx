
import React, { useState, useEffect } from 'react';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
}

const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({ onTranscript, className = "" }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'fr-FR';

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setIsListening(false);
      };

      rec.onerror = () => {
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, [onTranscript]);

  const toggleListening = () => {
    if (!recognition) {
      alert("La reconnaissance vocale n'est pas supportée par votre navigateur.");
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      setIsListening(true);
      recognition.start();
    }
  };

  if (!recognition) return null;

  return (
    <button
      onClick={toggleListening}
      type="button"
      className={`p-2 rounded-full transition-all duration-300 flex items-center justify-center ${
        isListening 
          ? 'bg-red-500/10 text-red-500 animate-pulse shadow-inner' 
          : 'bg-slate-800 text-slate-500 hover:bg-indigo-500/10 hover:text-indigo-400'
      } ${className}`}
      title={isListening ? "Arrêter l'écoute" : "Entrée vocale"}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
      </svg>
    </button>
  );
};

export default VoiceInputButton;
