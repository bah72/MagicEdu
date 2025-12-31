
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { CorrectionResult, QuizResult } from "./types";

// Always initialize with named parameter apiKey from process.env.API_KEY
const aiInstance = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface FileData {
  data: string; // base64
  mimeType: string;
}

export const correctWork = async (text: string, subject: string, level: string, fileData?: FileData): Promise<CorrectionResult> => {
  const ai = aiInstance();
  
  const parts: any[] = [{ text: `Corrige ce travail d'élève. 
    Matière: ${subject}
    Niveau: ${level}
    Consigne ou texte additionnel: ${text}` }];
    
  if (fileData) {
    parts.push({
      inlineData: {
        data: fileData.data,
        mimeType: fileData.mimeType
      }
    });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          maxScore: { type: Type.NUMBER },
          positivePoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctedText: { type: Type.STRING },
          generalFeedback: { type: Type.STRING },
        },
        required: ["score", "maxScore", "positivePoints", "improvements", "correctedText", "generalFeedback"],
      },
      systemInstruction: "Tu es un enseignant expert avec 20 ans d'expérience. Ta correction est constructive, précise et encourageante. Si un document PDF est joint, analyse-le prioritairement.",
    },
  });

  // Use .text property to access content
  return JSON.parse(response.text);
};

export const generateQuiz = async (topic: string, subject: string, level: string, count: number, type: string, fileData?: FileData): Promise<QuizResult> => {
  const ai = aiInstance();
  
  const parts: any[] = [{ text: `Génère un ${type} strictement dans la matière "${subject}" sur le thème : ${topic || "Contenu du document joint"}. 
    Niveau des élèves: ${level}
    Nombre de questions à produire: ${count}
    
    Il est impératif que les questions respectent le programme scolaire lié à la matière "${subject}" pour le niveau "${level}".
    Attribue un 'timeLimit' (en secondes) adapté à la difficulté de chaque question (ex: 30 pour simple, 60 pour réflexion).` }];

  if (fileData) {
    parts.push({
      inlineData: {
        data: fileData.data,
        mimeType: fileData.mimeType
      }
    });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                answer: { type: Type.STRING },
                explanation: { type: Type.STRING },
                timeLimit: { type: Type.INTEGER, description: "Temps limite suggéré en secondes." },
              },
              required: ["question", "answer", "explanation", "timeLimit"],
            },
          },
        },
        required: ["title", "questions"],
      },
      systemInstruction: "Tu es un concepteur pédagogique créatif et rigoureux. Tu dois t'assurer que le contenu généré correspond parfaitement à la matière demandée. Si un fichier PDF est fourni, base tes questions exclusivement sur son contenu tout en respectant le cadre de la matière sélectionnée.",
    },
  });

  // Use .text property to access content
  return JSON.parse(response.text);
};

export const generateImage = async (prompt: string, size: "1K" | "2K" | "4K"): Promise<string | undefined> => {
  const ai = aiInstance();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: size
      }
    },
  });
  
  // Iterate through parts to find the image part
  const part = response.candidates[0].content.parts.find(p => p.inlineData);
  return part ? `data:image/png;base64,${part.inlineData.data}` : undefined;
};

export const editImage = async (base64Image: string, prompt: string): Promise<string | undefined> => {
  const ai = aiInstance();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/png' } },
        { text: prompt }
      ]
    }
  });
  
  // Iterate through parts to find the image part
  const part = response.candidates[0].content.parts.find(p => p.inlineData);
  return part ? `data:image/png;base64,${part.inlineData.data}` : undefined;
};

export const searchPlaces = async (query: string, location?: { latitude: number, longitude: number }) => {
  const ai = aiInstance();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: query,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: location ? {
        retrievalConfig: { latLng: location }
      } : undefined
    },
  });
  return {
    text: response.text,
    places: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};
