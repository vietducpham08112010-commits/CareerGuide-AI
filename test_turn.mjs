
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const session = await ai.live.connect({
  model: 'gemini-2.5-flash-live-preview',
  callbacks: {
    onopen: () => console.log('Live connected'),
    onmessage: (m) => console.log('Live message:', JSON.stringify(m)),
    onclose: () => console.log('Live closed'),
    onerror: (e) => console.log('Live error:', e)
  }
});

// Test sendClientContent (text turn)
console.log('Sending text turn...');
session.sendClientContent({
  turns: [{ role: 'user', parts: [{ text: 'Xin chào, bạn có nghe rõ tôi nói không?' }] }],
  turnComplete: true
});

await new Promise(r => setTimeout(r, 6000));
session.close();
