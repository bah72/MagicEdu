
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

interface VideoCreatorProps {
  onSave: (data: any) => void;
}

const VideoCreator: React.FC<VideoCreatorProps> = ({ onSave }) => {
  const [image, setImage] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isLoading, setIsLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const generateVideo = async () => {
    if (!image) return;
    setIsLoading(true);
    setStatus('Vérification de la clé API...');
    
    try {
      if (!(await (window as any).aistudio.hasSelectedApiKey())) {
        await (window as any).aistudio.openSelectKey();
      }

      setStatus('Initialisation de Veo...');
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      setStatus('Animation de l\'image en cours (cela peut prendre quelques minutes)...');
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: 'Animate this pedagogical scene smoothly',
        image: {
          imageBytes: image.split(',')[1],
          mimeType: 'image/png',
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: aspectRatio
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      onSave({ type: 'video', title: 'Vidéo animée', data: url });
    } catch (e) {
      alert("Erreur lors de la génération de la vidéo.");
    } finally {
      setIsLoading(false);
      setStatus('');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <header>
        <h2 className="text-2xl font-bold text-white">Animation Vidéo (Veo)</h2>
        <p className="text-slate-400">Transformez une photo de classe ou un schéma en vidéo pédagogique.</p>
      </header>

      <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-3xl p-12 hover:border-indigo-500/50 transition-colors cursor-pointer relative bg-slate-900/50">
          {image ? (
            <img src={image} className="max-h-64 rounded-xl shadow-lg" />
          ) : (
            <div className="text-center">
              <span className="text-5xl mb-4 block opacity-50">📸</span>
              <p className="text-slate-500 font-medium">Cliquez pour ajouter une photo</p>
            </div>
          )}
          <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
        </div>

        <div className="flex gap-4 justify-center">
          <button onClick={() => setAspectRatio('16:9')} className={`px-6 py-3 rounded-2xl border font-bold transition-all ${aspectRatio === '16:9' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>16:9 Paysage</button>
          <button onClick={() => setAspectRatio('9:16')} className={`px-6 py-3 rounded-2xl border font-bold transition-all ${aspectRatio === '9:16' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>9:16 Portrait</button>
        </div>

        <button
          onClick={generateVideo}
          disabled={isLoading || !image}
          className="w-full py-4 bg-slate-100 text-slate-900 rounded-2xl font-bold hover:bg-white transition-all disabled:bg-slate-800 disabled:text-slate-600 flex flex-col items-center gap-1 shadow-lg"
        >
          <span>🎬 Générer l'animation</span>
          {isLoading && <span className="text-[10px] opacity-70 animate-pulse">{status}</span>}
        </button>
      </div>

      {videoUrl && (
        <div className="bg-black rounded-3xl shadow-2xl overflow-hidden aspect-video border border-slate-800">
          <video src={videoUrl} controls className="w-full h-full" autoPlay loop />
        </div>
      )}
    </div>
  );
};

export default VideoCreator;
