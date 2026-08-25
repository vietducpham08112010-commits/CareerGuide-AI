import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      // Ignore
    }
  }

  try {
    const { text, voiceName = "Aoede", language = "vi", apiKey } = body || {};
    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Missing text for TTS" });
    }

    const keys: string[] = [];
    const addKey = (k?: string) => {
      if (!k || typeof k !== 'string') return;
      const parts = k.split(/[\n,;]+/).map(p => p.trim()).filter(p => p.length >= 10);
      for (const p of parts) {
        if (!keys.includes(p)) keys.push(p);
      }
    };

    addKey(apiKey);
    addKey(process.env.GEMINI_API_KEYS);
    addKey(process.env.GEMINI_API_KEY);
    addKey(process.env.GOOGLE_GENAI_API_KEY);
    addKey(process.env.GOOGLE_API_KEY);
    addKey(process.env.API_KEY);
    addKey(process.env.VITE_GEMINI_API_KEY);

    const cleanText = text.replace(/[*_#`~[\]()]/g, ' ').trim();
    const prompt = language === "vi"
      ? `Đọc đoạn hội thoại sau bằng tiếng Việt tự nhiên, ấm áp, truyền cảm, có sức sống và ngữ điệu tự nhiên như người thật nói chuyện: "${cleanText}"`
      : `Please speak the following naturally with warm intonation, expressiveness, and energy: "${cleanText}"`;

    const candidateModels = [
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-2.5-flash-live-preview",
      "gemini-3.1-flash-tts-preview"
    ];

    let audioData: string | null = null;
    let mimeType = "audio/wav";
    let lastError: any = null;

    const keyCandidates: (string | undefined)[] = keys.length > 0 ? keys : [undefined];

    for (const key of keyCandidates) {
      const aiInstance = key ? new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' }
        }
      }) : new GoogleGenAI({
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' }
        }
      });

      for (const model of candidateModels) {
        try {
          const response: any = await aiInstance.models.generateContent({
            model,
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
              responseModalities: ["AUDIO" as any],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: voiceName || "Aoede"
                  }
                }
              }
            }
          });

          if (response?.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
              if (part.inlineData && part.inlineData.data) {
                audioData = part.inlineData.data;
                mimeType = part.inlineData.mimeType || "audio/wav";
                break;
              }
            }
          }

          if (audioData) break;
        } catch (err: any) {
          lastError = err;
        }
      }

      if (audioData) break;
    }

    if (audioData) {
      return res.status(200).json({ audioData, mimeType });
    }

    return res.status(500).json({ 
      error: "Could not generate audio stream. " + (lastError?.message || "")
    });

  } catch (error: any) {
    console.warn("Vercel TTS API error:", error?.message || error);
    return res.status(500).json({ error: error?.message || "TTS API error" });
  }
}
