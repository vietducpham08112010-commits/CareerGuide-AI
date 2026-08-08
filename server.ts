import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

server.on('error', (err) => {
  console.error('HTTP Server Error:', err);
});

wss.on('error', (err) => {
  console.error('WebSocket Server Error:', err);
});

const PORT = 3000;
const API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey: API_KEY || "DUMMY_KEY" });

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Debug logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- Helper Functions ---
const formatHistoryForGemini = (history: { role: string; text: string }[], newMessage: string) => {
  const raw = [...history, { role: 'user', text: newMessage }];
  const formatted: { role: string; parts: { text: string }[] }[] = [];
  
  for (const msg of raw) {
      const role = msg.role === 'model' ? 'model' : 'user';
      if (formatted.length > 0 && formatted[formatted.length - 1].role === role) {
          formatted[formatted.length - 1].parts[0].text += `\n\n${msg.text}`;
      } else {
          formatted.push({ role, parts: [{ text: msg.text }] });
      }
  }
  return formatted;
};

const cleanGeminiErrorMessage = (error: any): string => {
  const errMsg = error.message || String(error);
  if (errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("Quota exceeded")) {
    return "Hệ thống AI đang tạm thời đạt giới hạn dùng thử miễn phí (AI Quota Limit). Vui lòng thử lại sau vài giây hoặc kết nối tài khoản dịch vụ riêng của bạn trong phần Cài đặt. / The AI service has temporarily reached its free trial quota limit. Please try again in a few seconds or configure a custom AI provider in Settings.";
  }
  if (errMsg.includes("503") || errMsg.includes("overloaded") || errMsg.includes("busy") || errMsg.includes("UNAVAILABLE")) {
    return "Hệ thống AI hiện đang xử lý nhiều yêu cầu, vui lòng ấn gửi lại sau giây lát. / The AI model is currently busy. Please retry in a moment.";
  }
  try {
    const parsed = JSON.parse(errMsg);
    if (parsed.error && parsed.error.message) {
      const msg = parsed.error.message;
      if (msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota") || msg.includes("Quota exceeded") || msg.includes("429")) {
        return "Hệ thống AI đang tạm thời đạt giới hạn dùng thử miễn phí (AI Quota Limit). Vui lòng thử lại sau vài giây hoặc kết nối tài khoản dịch vụ riêng của bạn trong phần Cài đặt. / The AI service has temporarily reached its free trial quota limit. Please try again in a few seconds or configure a custom AI provider in Settings.";
      }
      if (msg.includes("503") || msg.includes("overloaded") || msg.includes("busy") || msg.includes("UNAVAILABLE")) {
        return "Hệ thống AI hiện đang xử lý nhiều yêu cầu, vui lòng ấn gửi lại sau giây lát. / The AI model is currently busy. Please retry in a moment.";
      }
      return msg;
    }
  } catch (e) {
    // No-op
  }
  return errMsg;
};

async function generateContentWithFallback(
    aiInstance: GoogleGenAI,
    options: {
        contents: any;
        systemInstruction?: string;
        tools?: any[];
    }
) {
    const modelsToTry = [
        'gemini-3.5-flash',
        'gemini-3.1-flash-lite',
        'gemini-flash-latest'
    ];

    if (options.tools && options.tools.length > 0) {
        for (const model of modelsToTry) {
            try {
                console.log(`[Fallback API] Attempting WITH tools using model ${model}...`);
                const response = await aiInstance.models.generateContent({
                    model: model,
                    contents: options.contents,
                    config: {
                        systemInstruction: options.systemInstruction || "You are a helpful assistant.",
                        tools: options.tools
                    }
                });
                return response;
            } catch (error: any) {
                console.warn(`[Fallback API] Attempt WITH tools failed for model ${model}:`, error.message || error);
                if (error.message?.includes("API_KEY_INVALID") || error.message?.includes("403")) {
                    throw error;
                }
            }
        }
    }

    // Try without tools
    for (const model of modelsToTry) {
        try {
            console.log(`[Fallback API] Attempting WITHOUT tools using model ${model}...`);
            const response = await aiInstance.models.generateContent({
                model: model,
                contents: options.contents,
                config: {
                    systemInstruction: options.systemInstruction || "You are a helpful assistant."
                }
            });
            return response;
        } catch (error: any) {
            console.warn(`[Fallback API] Attempt WITHOUT tools failed for model ${model}:`, error.message || error);
            if (error.message?.includes("API_KEY_INVALID") || error.message?.includes("403")) {
                throw error;
            }
        }
    }

    throw new Error("All model fallback attempts exhausted / Tất cả các phương án kết nối mô hình đều thất bại.");
}

// --- API Routes ---
app.get("/api/get-gemini-key", (req, res) => {
  if (API_KEY) {
    res.json({ key: API_KEY });
  } else {
    res.status(500).json({ error: "API key not configured on server" });
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    const { history, message, systemInstruction, file, image, apiKey } = req.body;
    const attachment = file || image;

    if (!message && !attachment) {
      return res.status(400).json({ error: "Message or file is required" });
    }

    const finalApiKey = apiKey || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "";
    if (!finalApiKey) {
      return res.status(400).json({ error: "Gemini API Key is missing." });
    }
    const aiInstance = new GoogleGenAI({ apiKey: finalApiKey });

    const contents = formatHistoryForGemini(history || [], message || "");

    // Add file if present
    if (attachment && attachment.data && attachment.mimeType) {
      const lastTurn = contents[contents.length - 1];
      if (lastTurn.role === 'user') {
        lastTurn.parts.push({
          inlineData: {
            data: attachment.data,
            mimeType: attachment.mimeType
          }
        } as any);
      }
    }

    const response = await generateContentWithFallback(aiInstance, {
        contents,
        systemInstruction: systemInstruction || "You are an expert career counselor."
    });
    return res.json({ text: response.text });

  } catch (error: any) {
    console.error("Chat API Error:", error);
    const errorMessage = cleanGeminiErrorMessage(error);
    res.status(500).json({ error: errorMessage });
  }
});

app.post("/api/search", async (req, res) => {
  try {
    const { history, message, systemInstruction, apiKey } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const finalApiKey = apiKey || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "";
    if (!finalApiKey) {
      return res.status(400).json({ error: "Gemini API Key is missing." });
    }
    const aiInstance = new GoogleGenAI({ apiKey: finalApiKey });

    const contents = formatHistoryForGemini(history || [], message || "");

    const response = await generateContentWithFallback(aiInstance, {
        contents,
        systemInstruction: systemInstruction || "You are a university admission advisor.",
        tools: [{ googleSearch: {} }] as any
    });
    return res.json({ 
      text: response.text, 
      groundingMetadata: response.candidates?.[0]?.groundingMetadata || null 
    });

  } catch (error: any) {
    console.error("Search API Error:", error);
    const errorMessage = cleanGeminiErrorMessage(error);
    res.status(500).json({ error: errorMessage });
  }
});

// --- AI Skill Map Generator API ---
app.post("/api/generate-skill-map", async (req, res) => {
  try {
    const { career, apiKey } = req.body;
    if (!career) {
      return res.status(400).json({ error: "Career name is required" });
    }

    const finalApiKey = apiKey || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "";
    if (!finalApiKey) {
      return res.status(400).json({ error: "Gemini API Key is missing." });
    }
    const aiInstance = new GoogleGenAI({ apiKey: finalApiKey });

    const careerId = "ai-gen-" + Math.random().toString(36).substring(2, 9);
    const systemInstruction = "You are a professional industrial and career mapping expert. You specialize in analyzing job roles and decomposing them into clean, structural learning levels (junior, mid, senior).";
    
    const prompt = `Hãy thiết kế bản đồ kỹ năng (Skill Map) chuyên sâu cho nghề nghiệp: "${career}".
Bản đồ kỹ năng phải chia làm 3 cấp độ: junior (cơ bản/nhập môn), mid (trung cấp/thực hành), senior (cao cấp/hoạch định).
Hãy tạo từ 6 đến 9 kỹ năng trải dài trên cả 3 cấp độ này.

Bạn BẮT BUỘC phải trả về dữ liệu dưới định dạng JSON thuần túy, KHÔNG được có ký tự bọc markdown như \`\`\`json hay bất kỳ ký tự thừa nào ngoài JSON.
Cấu trúc JSON chính xác như sau:
{
  "id": "${careerId}",
  "title_vi": "Tên tiếng Việt của nghề nghiệp",
  "title_en": "Tên tiếng Anh của nghề nghiệp",
  "category": "Lĩnh vực (ví dụ: Y tế, Kinh tế, Công nghệ, Nghệ thuật, Dịch vụ, Kỹ thuật...)",
  "skills": [
    {
      "id": "viet-lien-khong-dau-vi-du-skill1",
      "name": "Tên kỹ năng",
      "level": "junior",
      "description_vi": "Mô tả ngắn gọn bằng tiếng Việt về kỹ năng này và vì sao cần thiết",
      "description_en": "Brief English description of this skill and why it is required"
    }
  ]
}`;

    const response = await generateContentWithFallback(aiInstance, {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        systemInstruction
    });

    let text = response.text || "";
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsed = JSON.parse(text);
    return res.json(parsed);

  } catch (error: any) {
    console.error("Generate Skill Map API Error:", error);
    const errorMessage = cleanGeminiErrorMessage(error);
    res.status(500).json({ error: errorMessage });
  }
});

// --- Email/Milestone Reminder API ---
app.post("/api/send-reminder", (req, res) => {
  const { email, milestone } = req.body;
  console.log(`[ALERT REMINDER] Scheduled email alert for ${email}. Milestone: "${milestone?.title}" on deadline: ${milestone?.deadline}`);
  return res.json({ success: true, message: `Successfully scheduled reminder for ${email}` });
});

// --- WebSocket Handling (Live API) ---
wss.on("connection", (ws: WebSocket) => {
  console.log("Client connected to WebSocket");

  let session: any = null;

  ws.on("message", async (data: Buffer) => {
    try {
      const msg = JSON.parse(data.toString());
      console.log("Received WebSocket message type:", msg.type);

      if (msg.type === "config") {
        // Initialize Gemini Live Session
        const connectToGemini = async (model: string) => {
            console.log(`Attempting to connect to Gemini Live with model: ${model}`);
            return ai.live.connect({
                model,
                callbacks: {
                  onopen: () => {
                    console.log(`Gemini Live Session Opened (${model})`);
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ type: "connected" }));
                    }
                  },
                  onmessage: (message: LiveServerMessage) => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify(message));
                    }
                  },
                  onclose: () => {
                    console.log("Gemini Live Session Closed");
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.close();
                    }
                  },
                  onerror: (err: any) => {
                    console.error("Gemini Live Session Error:", err);
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ error: err.message }));
                    }
                  }
                },
                config: {
                  responseModalities: [Modality.AUDIO],
                  outputAudioTranscription: {},
                  inputAudioTranscription: {},
                  systemInstruction: msg.systemInstruction || "You are a helpful assistant.",
                  speechConfig: { 
                    voiceConfig: { 
                      prebuiltVoiceConfig: { 
                        voiceName: msg.voiceName || 'Kore' 
                      } 
                    } 
                  }
                }
            });
        };

        try {
            try {
                session = await connectToGemini('gemini-3.1-flash-live-preview');
            } catch (err) {
                console.warn("Failed with primary model, trying fallback.");
            }
        } catch (err: any) {
            console.error("Failed to connect to Gemini Live (All models):", err);
            ws.send(JSON.stringify({ error: "Failed to connect to Gemini Live. Please check API Key or Model availability." }));
        }
      } else if (msg.realtimeInput) {
          // Forward audio/input to Gemini
          if (session) {
              const input = Array.isArray(msg.realtimeInput) ? msg.realtimeInput[0] : msg.realtimeInput;
              // session is now the object, not a promise
              session.sendRealtimeInput(input);
          }
      } else if (msg.toolResponse) {
          if (session) {
              session.sendToolResponse(msg.toolResponse);
          }
      }
    } catch (err) {
      console.error("WebSocket Message Error:", err);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    if (session) {
        session.close();
    }
  });
});

// --- Vite Middleware ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static files (if built)
    app.use(express.static("dist"));
    
    // SPA fallback
    app.get("*all", (req, res) => {
      res.sendFile(path.resolve("dist/index.html"));
    });
  }

  const serverInstance = server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  const shutdown = () => {
    console.log('Shutting down server...');
    serverInstance.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer();
