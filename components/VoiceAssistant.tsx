
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { UserRole } from '../types';

interface VoiceAssistantProps {
  role?: UserRole;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ role = 'teacher' }) => {
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState<string[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());

  // Manual base64 decoding implementation as required by guidelines
  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  // Manual base64 encoding implementation as required by guidelines
  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Manual PCM audio data decoding to AudioBuffer for Gemini Live API raw stream
  const decodeAudioData = async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const startSession = async () => {
    setIsActive(true);
    // Initialize GoogleGenAI with named parameter apiKey right before connecting
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    const systemInstruction = role === 'teacher' 
      ? "Tu es un assistant pédagogique vocal expert. Tu réponds oralement de manière courte, claire et motivante."
      : "Tu es un tuteur bienveillant pour un élève. Aide-le à comprendre ses leçons par la parole, avec des exemples simples et amusants.";

    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: {
        onopen: () => {
          const source = inputCtx.createMediaStreamSource(stream);
          const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
          scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
            const l = inputData.length;
            const int16 = new Int16Array(l);
            for (let i = 0; i < l; i++) {
              int16[i] = inputData[i] * 32768;
            }
            const pcmBase64 = encode(new Uint8Array(int16.buffer));
            // Use sessionPromise to prevent race conditions during initialization
            sessionPromise.then((session) => {
              session.sendRealtimeInput({
                media: {
                  data: pcmBase64,
                  mimeType: 'audio/pcm;rate=16000',
                },
              });
            });
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(inputCtx.destination);
        },
        onmessage: async (message) => {
          const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64EncodedAudioString) {
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContextRef.current!.currentTime);
            const audioBuffer = await decodeAudioData(
              decode(base64EncodedAudioString),
              audioContextRef.current!,
              24000,
              1,
            );
            const source = audioContextRef.current!.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current!.destination);
            source.addEventListener('ended', () => {
              sourcesRef.current.delete(source);
            });

            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current = nextStartTimeRef.current + audioBuffer.duration;
            sourcesRef.current.add(source);
          }

          if (message.serverContent?.outputTranscription) {
            setTranscription(prev => [...prev.slice(-4), message.serverContent!.outputTranscription!.text]);
          }

          if (message.serverContent?.interrupted) {
            for (const source of sourcesRef.current.values()) {
              source.stop();
              sourcesRef.current.delete(source);
            }
            nextStartTimeRef.current = 0;
          }
        },
        onclose: () => setIsActive(false),
        onerror: (e) => console.error('Live API Error', e)
      },
      config: {
        responseModalities: [Modality.AUDIO],
        outputAudioTranscription: {},
        systemInstruction: systemInstruction,
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
        }
      }
    });
    
    sessionRef.current = await sessionPromise;
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
    }
    setIsActive(false);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500 pb-24">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">{role === 'teacher' ? 'Assistant Vocal Magique' : 'Ton Tuteur Vocal'}</h2>
        <p className="text-slate-400">{role === 'teacher' ? 'Posez vos questions de vive voix.' : 'Pose-moi tes questions sur tes devoirs !'}</p>
      </div>

      <div className="relative">
        <div className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-700 ${isActive ? 'bg-indigo-600 scale-110 shadow-[0_0_80px_rgba(79,70,229,0.4)]' : 'bg-slate-900 border border-slate-800'}`}>
          <button
            onClick={isActive ? stopSession : startSession}
            className={`text-6xl ${isActive ? 'text-white' : 'text-slate-700 hover:text-indigo-400 transition-colors'}`}
          >
            {isActive ? '⏹️' : '🎙️'}
          </button>
          
          {isActive && (
            <div className="absolute inset-0 rounded-full border-4 border-indigo-400/20 animate-ping"></div>
          )}
        </div>
      </div>

      <div className="w-full max-w-md bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl min-h-[150px]">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Transcription en direct</h3>
        <div className="space-y-2">
          {transcription.length > 0 ? (
            transcription.map((t, i) => <p key={i} className="text-sm text-slate-300 animate-in slide-in-from-bottom-2 leading-relaxed">{t}</p>)
          ) : (
            <p className="text-slate-600 italic text-sm">Parlez maintenant...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
