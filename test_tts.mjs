
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const text = 'Xin chào bạn, tôi là trợ lý AI';
const prompt = 'Đọc đoạn hội thoại sau bằng tiếng Việt tự nhiên, ấm áp, truyền cảm: "' + text + '"';

const candidateModels = ['gemini-3.1-flash-tts-preview', 'gemini-2.5-flash-live-preview', 'gemini-2.5-flash'];

for (const model of candidateModels) {
  try {
    console.log('Testing TTS for model:', model);
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: 'Aoede'
            }
          }
        }
      }
    });
    console.log('Got response for', model, response.candidates?.[0]?.content?.parts?.length);
    const part = response.candidates?.[0]?.content?.parts?.[0];
    console.log('Part keys:', Object.keys(part || {}));
    if (part?.inlineData) {
      console.log('inlineData mimeType:', part.inlineData.mimeType, 'length:', part.inlineData.data?.length);
      break;
    }
  } catch (e) {
    console.log('Error for', model, e.message);
  }
}
