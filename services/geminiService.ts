import { GoogleGenAI, Modality } from "@google/genai";
import type { LiveServerMessage } from "@google/genai";
import { TRANSLATIONS } from "../constants";
import { Language, AIProvider, UserProfile } from "../types";
import { downsampleBuffer } from "../utils/audio";

// Helper to strip markdown asterisks (*, **) and formatting artifacts from strings and objects
export const cleanMarkdownAsterisks = (val: any): any => {
  if (typeof val === 'string') {
    return val
      .replace(/\*\*([^*]+)\*\*/g, '$1') // remove **bold**
      .replace(/\*([^*]+)\*/g, '$1')     // remove *italic*
      .replace(/^\s*[\*]\s+/gm, '• ')   // replace list item asterisks with clean bullet points
      .replace(/\*/g, '')                // remove remaining stray asterisks
      .trim();
  }
  if (Array.isArray(val)) {
    return val.map(cleanMarkdownAsterisks);
  }
  if (val && typeof val === 'object') {
    const cleaned: any = {};
    for (const key of Object.keys(val)) {
      cleaned[key] = cleanMarkdownAsterisks(val[key]);
    }
    return cleaned;
  }
  return val;
};

// Helper for exponential backoff retry
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> => {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const isRetryable = 
        error.message?.includes('503') || 
        error.message?.includes('high demand') ||
        error.message?.includes('UNAVAILABLE') ||
        error.message?.includes('overloaded');
        
      if (!isRetryable || i === maxRetries - 1) throw error;
      
      const delay = initialDelay * Math.pow(2, i);
      console.warn(`Gemini API busy (503). Retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw lastError;
};

// Client-side fallback if user provided custom API Key directly in Settings
const generateClientContentWithFallback = async (
    aiInstance: GoogleGenAI,
    options: {
        model?: string;
        contents: any;
        config?: any;
    }): Promise<any> => {
    const defaultModels = ["gemini-3.7-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
    const modelsToTry = options.model ? [options.model, ...defaultModels] : defaultModels;
    const uniqueModels = Array.from(new Set(modelsToTry));

    let lastError: any = null;

    if (options.config?.tools && options.config.tools.length > 0) {
        for (const model of uniqueModels) {
            try {
                const response = await aiInstance.models.generateContent({
                    model: model,
                    contents: options.contents,
                    config: options.config
                });
                return response;
            } catch (error: any) {
                lastError = error;
            }
        }
    }

    const configWithoutTools = { ...options.config };
    if (configWithoutTools.tools) {
        delete configWithoutTools.tools;
    }

    for (const model of uniqueModels) {
        try {
            const response = await aiInstance.models.generateContent({
                model: model,
                contents: options.contents,
                config: configWithoutTools
            });
            return response;
        } catch (error: any) {
            lastError = error;
        }
    }

    throw lastError || new Error("All client model fallback attempts exhausted / Tất cả các phương án kết nối mô hình đều thất bại.");
};

export const getGeminiApiKeysPool = (userProfile?: UserProfile | null): string[] => {
  const keys: string[] = [];
  const add = (k?: string | null) => {
    if (!k) return;
    const parts = k.split(/[\n,;]+/).map(p => p.trim()).filter(p => p.length > 10 && !p.includes('AIzaSyAWdZ7q2CJ') && !p.includes('AQ.Ab8RN'));
    for (const p of parts) {
      if (!keys.includes(p)) keys.push(p);
    }
  };

  add(userProfile?.customGeminiApiKey);
  try {
    add(localStorage.getItem('custom_gemini_api_key'));
    add(localStorage.getItem('gemini_api_keys'));
    add(localStorage.getItem('gemini_api_key'));
    add(localStorage.getItem('custom_api_key'));
    add(localStorage.getItem('ai_api_key'));
  } catch (e) {}

  add(import.meta.env?.VITE_GEMINI_API_KEYS as string);
  add(import.meta.env?.VITE_GEMINI_API_KEY as string);
  add(process.env?.GEMINI_API_KEY as string);

  return keys;
};

export const getGeminiApiKey = (userProfile?: UserProfile | null): string => {
  const pool = getGeminiApiKeysPool(userProfile);
  if (pool.length === 0) return '';
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx] || pool[0];
};

export const cleanFrontEndErrorMessage = (error: any, language: Language): string => {
  const errMsg = error?.message || String(error);
  const isVi = language === Language.VI;
  
  if (errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("Quota exceeded")) {
    return isVi 
      ? "Hệ thống AI đang tạm thời đạt giới hạn dùng thử miễn phí (AI Quota Limit). Vui lòng thử lại sau vài giây hoặc cấu hình thêm khóa API trong Cài đặt."
      : "The AI service has temporarily reached its free trial quota limit. Please try again in a few seconds or configure a custom AI provider in Settings.";
  }
  if (errMsg.includes("503") || errMsg.includes("overloaded") || errMsg.includes("busy") || errMsg.includes("UNAVAILABLE")) {
    return isVi
      ? "Hệ thống AI hiện đang xử lý nhiều yêu cầu, vui lòng ấn gửi lại sau giây lát."
      : "The AI model is currently busy. Please retry in a moment.";
  }
  if (errMsg.includes("API_KEY_INVALID") || errMsg.includes("403")) {
    return isVi
      ? "Khóa API Gemini không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại khóa API trong Cài đặt."
      : "Invalid or expired Gemini API key. Please check your key in Settings.";
  }
  try {
    const parsed = JSON.parse(errMsg);
    if (parsed.error && parsed.error.message) {
      const msg = parsed.error.message;
      if (msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota") || msg.includes("Quota exceeded") || msg.includes("429")) {
        return isVi 
          ? "Hệ thống AI đang tạm thời đạt giới hạn dùng thử miễn phí (AI Quota Limit). Vui lòng thử lại sau vài giây hoặc cấu hình thêm khóa API trong Cài đặt."
          : "The AI service has temporarily reached its free trial quota limit. Please try again in a few seconds or configure a custom AI provider in Settings.";
      }
      if (msg.includes("503") || msg.includes("overloaded") || msg.includes("busy") || msg.includes("UNAVAILABLE")) {
        return isVi
          ? "Hệ thống AI hiện đang xử lý nhiều yêu cầu, vui lòng ấn gửi lại sau giây lát."
          : "The AI model is currently busy. Please retry in a moment.";
      }
      return msg;
    }
  } catch (e) {
    // No-op
  }
  return errMsg;
};

// Generic helper to call AI with JSON prompt via backend proxy or client fallback
export const requestAiContent = async (
  prompt: string,
  systemInstruction: string = "You are a helpful assistant. Do not use asterisks (*) in text formatting.",
  language: Language = Language.VI
): Promise<string> => {
  const keysPool = getGeminiApiKeysPool();
  const activeKey = getGeminiApiKey();

  const callApi = async () => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: [],
          message: prompt,
          systemInstruction,
          apiKey: activeKey || undefined
        })
      });

      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      if (isJson) {
        const resData = await response.json();
        if (response.ok && resData.text) {
          return cleanMarkdownAsterisks(resData.text);
        }
        if (!response.ok && resData.error) {
          if (!activeKey) throw new Error(resData.error);
        }
      }
    } catch (e: any) {
      if (e?.message && e.message.includes("Chưa cấu hình khóa API")) {
        throw e;
      }
      console.warn("Backend chat proxy response handled, proceeding with fallback if needed:", e);
    }

    if (keysPool.length === 0 && !activeKey) {
      return "{}";
    }

    // Direct Client Custom Key Execution across available keys
    const candidateKeys = keysPool.length > 0 ? keysPool : [activeKey];
    for (const key of candidateKeys) {
      try {
        const ai = new GoogleGenAI({ apiKey: key });
        const aiResponse = await generateClientContentWithFallback(ai, {
          model: 'gemini-3.7-flash',
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: { systemInstruction }
        });
        if (aiResponse.text) {
          return cleanMarkdownAsterisks(aiResponse.text);
        }
      } catch (err: any) {
        if (candidateKeys.indexOf(key) === candidateKeys.length - 1) {
          throw err;
        }
      }
    }
    return "{}";
  };

  try {
    return await retryWithBackoff(callApi);
  } catch (error) {
    throw new Error(cleanFrontEndErrorMessage(error, language));
  }
};

export const generateRoadmap = async (
  chatHistory: { role: string; text: string }[],
  language: Language,
  userProfile?: UserProfile | null
) => {
  const isVi = language === Language.VI;
  const fallbackRoadmap = isVi ? [
    {
      id: "rm-step-1",
      title: "Khám phá bản thân & Đánh giá năng lực RIASEC",
      description: "Hoàn thành bài trắc nghiệm tính cách nghề nghiệp, xác định các nhóm đặc điểm nổi trội và lĩnh vực quan tâm hàng đầu.",
      status: "todo"
    },
    {
      id: "rm-step-2",
      title: "Khảo sát ngành nghề & Phân tích thị trường tuyển dụng",
      description: "Tìm hiểu 3 vị trí việc làm thực tế, tra cứu điểm chuẩn đại học và tìm hiểu yêu cầu kỹ năng đầu vào.",
      status: "todo"
    },
    {
      id: "rm-step-3",
      title: "Học tập nền tảng & Tích lũy kỹ năng cốt lõi",
      description: "Tham gia khóa học cơ bản trực tuyến, rèn luyện tư duy logic và kỹ năng tiếng Anh chuyên ngành.",
      status: "todo"
    },
    {
      id: "rm-step-4",
      title: "Xây dựng Portfolio & Thực hành phỏng vấn thử",
      description: "Tạo CV chuẩn chỉnh, hoàn thành 01 mini-project thực tế và luyện tập trả lời phỏng vấn HR cùng AI.",
      status: "todo"
    }
  ] : [
    {
      id: "rm-step-1",
      title: "Self-Discovery & RIASEC Assessment",
      description: "Complete career orientation tests, identify primary strengths and top focus interest areas.",
      status: "todo"
    },
    {
      id: "rm-step-2",
      title: "Industry Survey & Job Market Research",
      description: "Explore 3 potential career paths, check university requirements, and analyze job descriptions.",
      status: "todo"
    },
    {
      id: "rm-step-3",
      title: "Core Skill Building & Online Coursework",
      description: "Enroll in foundational online courses, develop analytical thinking and domain communication.",
      status: "todo"
    },
    {
      id: "rm-step-4",
      title: "Portfolio Development & Mock Interview Practice",
      description: "Build a polished CV, complete a practical mini-project, and practice interview questions with AI.",
      status: "todo"
    }
  ];

  const prompt = language === Language.EN
    ? `Based on our conversation history and my profile, generate a personalized 3-month action plan (roadmap) for my career orientation as a high school student. Break it down into clear, actionable steps. Return ONLY a JSON array of objects, where each object has 'id' (string), 'title' (string), 'description' (string), and 'status' (must be exactly 'todo'). Do not include any markdown formatting like \`\`\`json.`
    : `Dựa trên lịch sử trò chuyện và hồ sơ của tôi, hãy tạo một kế hoạch hành động (lộ trình) cá nhân hóa trong 3 tháng tới cho việc định hướng nghề nghiệp của tôi (tôi là học sinh THPT). Hãy chia nhỏ thành các bước cụ thể và có thể thực hiện được. CHỈ trả về một mảng JSON chứa các đối tượng, mỗi đối tượng có 'id' (chuỗi), 'title' (chuỗi), 'description' (chuỗi), và 'status' (phải chính xác là 'todo'). Không bao gồm bất kỳ định dạng markdown nào như \`\`\`json.`;

  const activeKey = getGeminiApiKey(userProfile);

  const extractJsonArray = (rawText: string) => {
    let clean = (rawText || '').trim();
    clean = clean.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    try {
      const parsed = JSON.parse(clean);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {}
    const s = clean.indexOf('[');
    const e = clean.lastIndexOf(']');
    if (s !== -1 && e !== -1 && e > s) {
      try {
        const parsed = JSON.parse(clean.substring(s, e + 1));
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (err) {}
    }
    return null;
  };

  const callApi = async () => {
    try {
      const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              history: chatHistory,
              message: prompt,
              systemInstruction: "You are an expert career counselor. Output ONLY valid JSON array. No other text.",
              apiKey: activeKey
          })
      });

      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      if (isJson) {
        const text = await response.text();
        const data = JSON.parse(text);
        if (response.ok && data.text) {
          const parsed = extractJsonArray(data.text);
          if (parsed) return parsed;
        }
      }
    } catch (e: any) {
      console.warn("Backend roadmap proxy attempt failed:", e);
    }

    // Direct Client Fallback Execution if key exists
    try {
      const ai = new GoogleGenAI({ apiKey: activeKey });
      const contents = chatHistory.map(h => ({ role: h.role === 'model' ? 'model' : 'user', parts: [{ text: h.text }] }));
      contents.push({ role: 'user', parts: [{ text: prompt }] });
      const aiResponse = await generateClientContentWithFallback(ai, {
          model: 'gemini-3.7-flash',
          contents,
          config: { systemInstruction: "You are an expert career counselor. Output ONLY valid JSON array. No other text." }
      });
      const parsed = extractJsonArray(aiResponse.text || '');
      if (parsed) return parsed;
    } catch (err) {
      console.warn("Direct client roadmap generation failed, returning resilient fallback:", err);
    }

    throw new Error(isVi ? "Không thể kết nối AI (Kiểm tra API Key)" : "Cannot connect to AI (Check API Key)");
  };

  return await retryWithBackoff(callApi);
};

export const sendChatMessage = async (
  history: { role: string; text: string }[], 
  newMessage: string, 
  language: Language,
  userProfile?: UserProfile | null,
  file?: { data: string; mimeType: string } | null
) => {
  const t = TRANSLATIONS[language];
  let systemInstruction = t.systemInstruction;
  
  if (userProfile?.careerProfile) {
      systemInstruction += `\n\nUser's Career Profile (RIASEC): ${userProfile.careerProfile}`;
  }

  // Check Provider - ONLY use external APIs if user explicitly configured them
  if (userProfile?.aiProvider === AIProvider.N8N && userProfile.customEndpoint) {
      return await sendN8NMessage(userProfile.customEndpoint, history, newMessage, systemInstruction, language, userProfile);
  }

  if (userProfile?.aiProvider === AIProvider.CUSTOM && userProfile.customEndpoint) {
    const endpoint = userProfile.customEndpoint;
    const modelName = userProfile.customModelName || "llama3";
    return await sendExternalApiMessage(endpoint, modelName, history, newMessage, systemInstruction, language);
  }

  // --- DEFAULT: GOOGLE GEMINI ---
  const keysPool = getGeminiApiKeysPool(userProfile);
  const activeKey = getGeminiApiKey(userProfile);

  const callGemini = async () => {
    try {
      const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              history,
              message: newMessage,
              systemInstruction,
              file,
              apiKey: activeKey
          })
      });

      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      if (isJson) {
          const data = await response.json();
          if (response.ok && data.text) {
            return cleanMarkdownAsterisks(data.text);
          }
      }
    } catch (e: any) {
      console.warn("Backend chat proxy fetch error, switching to direct client-side SDK generation:", e);
    }

    // Direct Client GoogleGenAI SDK execution across candidate keys if available
    const candidateKeys = keysPool.length > 0 ? keysPool : (activeKey ? [activeKey] : []);

    for (const key of candidateKeys) {
      try {
        const ai = new GoogleGenAI({ apiKey: key });
        const contents = history.map(h => ({ role: h.role === 'model' ? 'model' : 'user', parts: [{ text: h.text }] }));
        const userParts: any[] = [{ text: newMessage }];
        if (file) userParts.push({ inlineData: { mimeType: file.mimeType, data: file.data } });
        contents.push({ role: 'user', parts: userParts });
        
        const aiResponse = await generateClientContentWithFallback(ai, {
            model: 'gemini-3.7-flash',
            contents,
            config: { systemInstruction }
        });
        if (aiResponse && aiResponse.text) {
          return cleanMarkdownAsterisks(aiResponse.text);
        }
      } catch (err: any) {
        console.warn("Client key attempt failed, trying next key:", err);
      }
    }

    return t.noAiResponse;
  };

  try {
    return await retryWithBackoff(callGemini);
  } catch (error: any) {
    // console.error("Chat API Error:", error);
    throw new Error(cleanFrontEndErrorMessage(error, language));
  }
};

// Function to call a Generic External API (For Custom/Self-Hosted providers only)
const sendExternalApiMessage = async (
  endpoint: string,
  modelName: string,
  history: { role: string; text: string }[],
  newMessage: string,
  systemInstruction: string,
  language: Language
) => {
  const t = TRANSLATIONS[language];
  try {
    const messages = [
      { role: "system", content: systemInstruction },
      ...history.map(h => ({ role: h.role === 'model' ? 'assistant' : 'user', content: h.text })),
      { role: "user", content: newMessage }
    ];

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: modelName,
        messages: messages,
        stream: false,
        temperature: 0.7
      })
    });

    const text = await response.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        throw new Error(`External API returned invalid JSON (Status: ${response.status})`);
    }

    if (!response.ok) {
        throw new Error(data.error?.message || data.error || `External API Error: ${response.statusText}`);
    }
    
    return data.choices?.[0]?.message?.content || data.message?.content || t.noExternalResponse;
  } catch (error) {
    console.error("External Model Error:", error);
    throw error;
  }
};

// Function to call n8n Webhook
const sendN8NMessage = async (
  webhookUrl: string,
  history: { role: string; text: string }[],
  newMessage: string,
  systemInstruction: string,
  language: Language,
  userProfile?: UserProfile | null
) => {
  const t = TRANSLATIONS[language];
  try {
    const payload = {
        message: newMessage,
        history: history,
        systemInstruction: systemInstruction,
        userEmail: userProfile?.email || 'guest',
        timestamp: new Date().toISOString()
    };

    const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const text = await response.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        throw new Error(`n8n Webhook returned invalid JSON (Status: ${response.status})`);
    }

    if (!response.ok) {
        throw new Error(data.error || `n8n Webhook Error: ${response.statusText}`);
    }
    
    if (data.output && typeof data.output === 'string') return data.output;
    if (data.text && typeof data.text === 'string') return data.text;
    if (data.response && typeof data.response === 'string') return data.response;
    if (data.message && typeof data.message === 'string') return data.message;
    if (data.choices?.[0]?.message?.content) return data.choices[0].message.content;

    return JSON.stringify(data);
  } catch (error) {
    console.error("n8n Error:", error);
    throw error;
  }
};

export class LiveSessionManager {
  language: Language;
  userProfile?: UserProfile | null;
  session: any | null;
  inputContext: AudioContext | null;
  outputContext: AudioContext | null;
  inputSource: MediaStreamAudioSourceNode | null;
  processor: any | null;
  stream: MediaStream | null;
  nextStartTime: number;
  sources: Set<AudioBufferSourceNode>;
  speechRecognition: any | null;
  speechSynthUtterance: SpeechSynthesisUtterance | null;
  isBrowserVoiceActive: boolean = false;
  isAiSpeaking: boolean = false;
  conversationHistory: { role: string; text: string }[] = [];
  
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (err: any) => void;
  onAudioLevel?: (level: number) => void;
  onTranscript?: (text: string, isUser: boolean) => void;

  isConnected: boolean;

  constructor(language: Language, userProfile?: UserProfile | null) { 
    this.language = language;
    this.userProfile = userProfile;
    this.session = null;
    this.inputContext = null;
    this.outputContext = null;
    this.inputSource = null;
    this.processor = null;
    this.stream = null;
    this.nextStartTime = 0;
    this.sources = new Set();
    this.isConnected = false;
    this.speechRecognition = null;
    this.speechSynthUtterance = null;
    this.isBrowserVoiceActive = false;
    this.isAiSpeaking = false;
    this.conversationHistory = [];
  }

  async getAudioInputDevices() {
    try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.warn("MediaDevices API not supported or not in a secure context.");
            return [];
        }
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.filter(d => d.kind === 'audioinput');
    } catch (e) { return []; }
  }

  async connect(deviceId: string, decodeAudioDataFn: any, createBlobFn: any, decodeFn: any) {
    const t = TRANSLATIONS[this.language];
    let systemInstruction = t.voiceSystemInstruction;
    
    if (this.userProfile?.careerProfile) {
        systemInstruction += `\n\nUser's Career Profile (RIASEC): ${this.userProfile.careerProfile}`;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          // If media devices not available, try browser speech recognition fallback directly
          return this.startBrowserVoiceFallback(systemInstruction);
      }
      
      this.inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      this.outputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      if (this.inputContext.state === 'suspended') { await this.inputContext.resume(); }
      if (this.outputContext.state === 'suspended') { await this.outputContext.resume(); }

      try {
        const constraints = { audio: deviceId ? { deviceId: { exact: deviceId } } : true };
        this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (micErr: any) {
        console.warn("Microphone access denied or unavailable:", micErr);
        const isVi = this.language === Language.VI;
        const msg = (micErr?.name === 'NotAllowedError' || micErr?.message?.includes('Permission denied') || micErr?.message?.includes('denied'))
          ? (isVi ? 'Trình duyệt chưa được cấp quyền truy cập Micro. Vui lòng cho phép quyền micro trên trình duyệt để tiếp tục.' : 'Microphone permission was denied. Please allow microphone access in your browser to proceed.')
          : (micErr?.message || t.micPermission);
        if (this.onError) this.onError(msg);
        this.cleanup();
        if (this.onDisconnect) this.onDisconnect();
        return;
      }

      // Start input level meter so visualizer animates
      this.startMicLevelMeter();

      const customKey = getGeminiApiKey(this.userProfile);

      // If user has custom key, connect via client SDK Live API
      if (customKey) {
        const ai = new GoogleGenAI({ apiKey: customKey });
        const liveModels = ['gemini-3.1-flash-live-preview', 'gemini-3.7-flash'];
        let modelIndex = 0;

        const attemptNextModel = async (): Promise<any> => {
          if (modelIndex >= liveModels.length) {
            // Fallback to browser voice assistant
            console.log("Live API connection exhausted, switching to Browser Voice Assistant mode.");
            return this.startBrowserVoiceFallback(systemInstruction);
          }

          const model = liveModels[modelIndex];
          modelIndex++;

          let hasOpened = false;
          let sessionPromise: Promise<any>;

          try {
            sessionPromise = ai.live.connect({
              model,
              callbacks: {
                onopen: () => {
                  hasOpened = true;
                  this.isConnected = true;
                  this.startAudioStreaming(createBlobFn, sessionPromise);
                  if (this.onConnect) this.onConnect();
                },
                onmessage: async (message: LiveServerMessage) => {
                  const serverContent = message.serverContent;
                  if (serverContent) {
                    if (serverContent.outputTranscription) {
                      const text = serverContent.outputTranscription.text;
                      if (text && this.onTranscript) this.onTranscript(text, false);
                    } else if (serverContent.inputTranscription) {
                      const text = serverContent.inputTranscription.text;
                      if (text && this.onTranscript) this.onTranscript(text, true);
                    }
                    
                    const base64Audio = serverContent.modelTurn?.parts?.[0]?.inlineData?.data;
                    if (base64Audio && this.outputContext) {
                      const audioBuffer = await decodeAudioDataFn(decodeFn(base64Audio), this.outputContext, 24000, 1);
                      this.playAudio(audioBuffer);
                    }
                    
                    if (serverContent.interrupted) this.stopCurrentAudio();
                  }
                },
                onclose: () => {
                  if (!hasOpened && !this.isConnected) {
                    attemptNextModel();
                  } else {
                    this.cleanup();
                    if (this.onDisconnect) this.onDisconnect();
                  }
                },
                onerror: () => {
                  if (!hasOpened && !this.isConnected) {
                    attemptNextModel();
                  } else {
                    this.startBrowserVoiceFallback(systemInstruction);
                  }
                }
              },
              config: {
                responseModalities: [Modality.AUDIO],
                outputAudioTranscription: {},
                inputAudioTranscription: {},
                systemInstruction: systemInstruction,
                speechConfig: { 
                  voiceConfig: { 
                    prebuiltVoiceConfig: { 
                      voiceName: 'Kore' 
                    } 
                  } 
                }
              }
            });
            this.session = await sessionPromise;
          } catch (err) {
            if (!hasOpened && !this.isConnected) {
              await attemptNextModel();
            }
          }
        };

        await attemptNextModel();
      } else {
        // Connect via backend WebSocket proxy on /ws with immediate fallback
        try {
          const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
          const wsUrl = `${protocol}//${window.location.host}/ws`;
          const ws = new WebSocket(wsUrl);

          let hasWsConnected = false;
          const fallbackTimer = setTimeout(() => {
            if (!hasWsConnected && !this.isConnected) {
              try { ws.close(); } catch (e) {}
              this.startBrowserVoiceFallback(systemInstruction);
            }
          }, 2500);

          ws.onopen = () => {
            ws.send(JSON.stringify({
              type: "config",
              systemInstruction,
              voiceName: "Kore"
            }));
          };

          ws.onmessage = async (event) => {
            try {
              const data = JSON.parse(event.data);
              if (data.type === "connected") {
                hasWsConnected = true;
                clearTimeout(fallbackTimer);
                this.isConnected = true;
                this.startWebSocketAudioStreaming(createBlobFn, ws);
                if (this.onConnect) this.onConnect();
              } else if (data.error) {
                clearTimeout(fallbackTimer);
                this.startBrowserVoiceFallback(systemInstruction);
              } else if (data.serverContent) {
                const serverContent = data.serverContent;
                if (serverContent.outputTranscription?.text && this.onTranscript) {
                  this.onTranscript(serverContent.outputTranscription.text, false);
                } else if (serverContent.inputTranscription?.text && this.onTranscript) {
                  this.onTranscript(serverContent.inputTranscription.text, true);
                }
                const base64Audio = serverContent.modelTurn?.parts?.[0]?.inlineData?.data;
                if (base64Audio && this.outputContext) {
                  const audioBuffer = await decodeAudioDataFn(decodeFn(base64Audio), this.outputContext, 24000, 1);
                  this.playAudio(audioBuffer);
                }
                if (serverContent.interrupted) this.stopCurrentAudio();
              }
            } catch (e) {
              console.error("WS Parse error", e);
            }
          };

          ws.onerror = () => {
            clearTimeout(fallbackTimer);
            if (!hasWsConnected) {
              this.startBrowserVoiceFallback(systemInstruction);
            }
          };

          ws.onclose = () => {
            clearTimeout(fallbackTimer);
            if (!hasWsConnected && !this.isConnected) {
              this.startBrowserVoiceFallback(systemInstruction);
            } else if (!this.isBrowserVoiceActive) {
              this.cleanup();
              if (this.onDisconnect) this.onDisconnect();
            }
          };

          this.session = ws;
        } catch (wsErr) {
          this.startBrowserVoiceFallback(systemInstruction);
        }
      }

    } catch (e) { 
      this.startBrowserVoiceFallback(systemInstruction);
    }
  }

  startMicLevelMeter() {
    if (!this.inputContext || !this.stream) return;
    try {
      this.inputSource = this.inputContext.createMediaStreamSource(this.stream);
      this.processor = this.inputContext.createScriptProcessor(2048, 1, 1);
      this.processor.onaudioprocess = (e: any) => {
        const inputData = e.inputBuffer.getChannelData(0);
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        if (this.onAudioLevel) {
          this.onAudioLevel(this.isAiSpeaking ? Math.min(0.8, rms * 4 + 0.15) : rms);
        }
      };
      this.inputSource.connect(this.processor);
      this.processor.connect(this.inputContext.destination);
    } catch (e) {
      console.warn("Mic level meter setup failed", e);
    }
  }

  startBrowserVoiceFallback(systemInstruction: string) {
    if (this.isBrowserVoiceActive) return;
    this.isBrowserVoiceActive = true;
    this.isConnected = true;
    if (this.onConnect) this.onConnect();

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      const isVi = this.language === Language.VI;
      if (this.onError) {
        this.onError(isVi ? "Trình duyệt không hỗ trợ nhận diện giọng nói (Web Speech API). Vui lòng sử dụng Google Chrome hoặc Microsoft Edge." : "Your browser does not support Web Speech Recognition. Please use Chrome or Edge.");
      }
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = this.language === Language.VI ? 'vi-VN' : 'en-US';

      recognition.onresult = async (event: any) => {
        const results = event.results;
        const lastResult = results[results.length - 1];
        if (lastResult && lastResult[0]) {
          const userSpeech = lastResult[0].transcript?.trim();
          if (userSpeech) {
            if (this.onTranscript) this.onTranscript(userSpeech, true);
            this.conversationHistory.push({ role: 'user', text: userSpeech });
            
            // Generate AI Response
            try {
              this.isAiSpeaking = true;
              const prompt = `${systemInstruction}\n\nUser spoken input: "${userSpeech}"\n\nPlease give a natural, concise, and helpful career counseling response in 1-3 conversational sentences without any asterisks or markdown code.`;
              const aiRaw = await requestAiContent(prompt, systemInstruction, this.language);
              const aiText = cleanMarkdownAsterisks(aiRaw);
              
              if (this.onTranscript) this.onTranscript(aiText, false);
              this.conversationHistory.push({ role: 'model', text: aiText });

              // Speak AI Response
              this.speakBrowserAi(aiText);
            } catch (err: any) {
              console.error("Browser voice AI response error:", err);
              this.isAiSpeaking = false;
            }
          }
        }
      };

      recognition.onerror = (err: any) => {
        if (err.error !== 'no-speech') {
          console.warn("Speech recognition notice:", err.error);
        }
      };

      recognition.onend = () => {
        if (this.isBrowserVoiceActive && this.isConnected) {
          try {
            recognition.start();
          } catch (e) {}
        }
      };

      recognition.start();
      this.speechRecognition = recognition;

      // Welcome prompt
      const welcomeText = this.language === Language.VI
        ? "Xin chào! Tôi là Trợ lý Nghề nghiệp CareerGuide AI. Bạn đang quan tâm đến ngành nghề nào?"
        : "Hello! I am your CareerGuide AI Voice Counselor. What career path are you exploring today?";
      
      if (this.onTranscript) this.onTranscript(welcomeText, false);
      this.speakBrowserAi(welcomeText);

    } catch (e: any) {
      console.warn("Native speech setup exception:", e);
    }
  }

  speakBrowserAi(text: string) {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.language === Language.VI ? 'vi-VN' : 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Select high quality voice if available
      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(v => 
        (this.language === Language.VI && v.lang.startsWith('vi')) ||
        (this.language === Language.EN && (v.lang.startsWith('en-US') || v.lang.startsWith('en-GB')))
      );
      if (matchedVoice) utterance.voice = matchedVoice;

      this.isAiSpeaking = true;
      let pulseInterval: any = setInterval(() => {
        if (this.isAiSpeaking && this.onAudioLevel) {
          this.onAudioLevel(0.3 + Math.random() * 0.4);
        }
      }, 100);

      utterance.onend = () => {
        this.isAiSpeaking = false;
        clearInterval(pulseInterval);
        if (this.onAudioLevel) this.onAudioLevel(0);
      };

      utterance.onerror = () => {
        this.isAiSpeaking = false;
        clearInterval(pulseInterval);
        if (this.onAudioLevel) this.onAudioLevel(0);
      };

      this.speechSynthUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      this.isAiSpeaking = false;
    }
  }

  async startWebSocketAudioStreaming(createBlobFn: any, ws: WebSocket) {
    if (!this.inputContext || !this.stream) return;
    try {
      this.inputSource = this.inputContext.createMediaStreamSource(this.stream);
      this.processor = this.inputContext.createScriptProcessor(2048, 1, 1);
      this.processor.onaudioprocess = (e: any) => {
        const inputData = e.inputBuffer.getChannelData(0);
        let sum = 0; for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
        if (this.onAudioLevel) this.onAudioLevel(Math.sqrt(sum / inputData.length));
        
        const downsampled = downsampleBuffer(inputData, this.inputContext?.sampleRate || 16000, 16000);
        const pcmBlob = createBlobFn(downsampled, 16000);
        
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            realtimeInput: { audio: { data: pcmBlob.data, mimeType: pcmBlob.mimeType } }
          }));
        }
      };
      this.inputSource.connect(this.processor);
      this.processor.connect(this.inputContext.destination);
    } catch (err) {
      console.warn("ScriptProcessor fallback failed", err);
    }
  }

  async startAudioStreaming(createBlobFn: any, sessionPromise?: Promise<any>) {
    if (!this.inputContext || !this.stream) return;
    this.inputSource = this.inputContext.createMediaStreamSource(this.stream);
    
    try {
        await this.inputContext.audioWorklet.addModule('/audio-processor.js');
        this.processor = new AudioWorkletNode(this.inputContext, 'audio-processor');
        this.processor.port.onmessage = (e) => {
            const inputData = e.data;
            let sum = 0; for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
            if (this.onAudioLevel) this.onAudioLevel(Math.sqrt(sum / inputData.length));
            
            const downsampled = downsampleBuffer(inputData, this.inputContext?.sampleRate || 16000, 16000);
            const pcmBlob = createBlobFn(downsampled, 16000);
            
            if (sessionPromise) {
                sessionPromise.then(session => {
                    if (this.isConnected) {
                        session.sendRealtimeInput({ audio: { data: pcmBlob.data, mimeType: pcmBlob.mimeType } });
                    }
                });
            } else if (this.session && this.isConnected) {
                this.session.sendRealtimeInput({ audio: { data: pcmBlob.data, mimeType: pcmBlob.mimeType } });
            }
        };
        this.inputSource.connect(this.processor);
        this.processor.connect(this.inputContext.destination);
    } catch (err) {
        console.warn("AudioWorklet failed, falling back to ScriptProcessorNode", err);
        if (!this.inputContext) return;
        this.processor = this.inputContext.createScriptProcessor(2048, 1, 1);
        this.processor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          let sum = 0; for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
          if (this.onAudioLevel) this.onAudioLevel(Math.sqrt(sum / inputData.length));
          
          const downsampled = downsampleBuffer(inputData, this.inputContext?.sampleRate || 16000, 16000);
          const pcmBlob = createBlobFn(downsampled, 16000);
          
          if (sessionPromise) {
              sessionPromise.then(session => {
                  if (this.isConnected) {
                      session.sendRealtimeInput({ audio: { data: pcmBlob.data, mimeType: pcmBlob.mimeType } });
                  }
              });
          } else if (this.session && this.isConnected) {
              this.session.sendRealtimeInput({ audio: { data: pcmBlob.data, mimeType: pcmBlob.mimeType } });
          }
        };
        this.inputSource.connect(this.processor);
        this.processor.connect(this.inputContext.destination);
    }
  }

  playAudio(buffer: AudioBuffer) {
    if (!this.outputContext) return;
    this.nextStartTime = Math.max(this.nextStartTime, this.outputContext.currentTime);
    const source = this.outputContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.outputContext.destination);
    source.addEventListener('ended', () => { this.sources.delete(source); });
    source.start(this.nextStartTime);
    this.nextStartTime += buffer.duration;
    this.sources.add(source);
  }

  stopCurrentAudio() {
      this.sources.forEach(s => s.stop()); this.sources.clear();
      this.nextStartTime = 0;
      if (this.outputContext) this.nextStartTime = this.outputContext.currentTime;
      if ('speechSynthesis' in window) {
        try { window.speechSynthesis.cancel(); } catch (e) {}
      }
  }

  disconnect() { 
      if (this.speechRecognition) {
        try { this.speechRecognition.stop(); } catch (e) {}
        this.speechRecognition = null;
      }
      if ('speechSynthesis' in window) {
        try { window.speechSynthesis.cancel(); } catch (e) {}
      }
      if (this.session) {
          if (typeof this.session.close === 'function') {
            this.session.close();
          }
      }
      this.cleanup(); 
  }

  cleanup() {
      this.isBrowserVoiceActive = false;
      this.isAiSpeaking = false;
      this.processor?.disconnect(); this.inputSource?.disconnect();
      this.stream?.getTracks().forEach(t => t.stop());
      this.inputContext?.close(); this.outputContext?.close();
      this.inputContext = null; this.outputContext = null; this.stream = null; this.processor = null;
      this.sources.clear(); this.nextStartTime = 0;
      this.session = null;
      this.isConnected = false;
  }
}

export const generateChatTitle = async (message: string, language: Language) => {
  if (!message || !message.trim()) return '';
  const firstMsg = message.trim();
  const lowerMsg = firstMsg.toLowerCase();
  
  // Instant clean title for common short greetings
  if (['xin chào', 'chào bạn', 'chào', 'hello', 'hi', 'hey', 'alo', 'chao ban', 'chao'].includes(lowerMsg)) {
    return language === Language.VI ? 'Bắt đầu cuộc trò chuyện' : 'General Inquiry';
  }

  const customKey = getGeminiApiKey();

  const sanitizeTitle = (raw: string): string => {
    const t = cleanMarkdownAsterisks(raw || '').replace(/^["']|["']$/g, '').replace(/\n.*$/s, '').trim();
    if (!t || t.length > 35 || t.includes('Chào bạn') || t.includes('Đối với') || t.includes('hành trình') || t.includes('Generate title') || t.includes('Language required')) {
      return firstMsg.length > 25 ? firstMsg.slice(0, 25) + '...' : firstMsg;
    }
    return t;
  };

  const callApi = async () => {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            history: [],
            message: `Generate a short concise 2-4 word title in ${language === Language.EN ? 'English' : 'Vietnamese'} for this inquiry: "${firstMsg.slice(0, 50)}". Return ONLY 2-4 words, no quotes, no extra text.`,
            systemInstruction: "You are a concise title generator. Return only 2 to 4 words. No greeting, no punctuation.",
            apiKey: customKey || undefined
        })
    });
    
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    if (!isJson) {
        if (customKey) {
            const ai = new GoogleGenAI({ apiKey: customKey });
            const aiResponse = await generateClientContentWithFallback(ai, {
                model: 'gemini-3.7-flash',
                contents: [{ role: 'user', parts: [{ text: `Generate a 2-4 word title: "${firstMsg.slice(0, 50)}"` }] }],
                config: { systemInstruction: "Return only 2 to 4 words" }
            });
            return sanitizeTitle(aiResponse.text || '');
        }
        return firstMsg.length > 25 ? firstMsg.slice(0, 25) + '...' : firstMsg;
    }

    const textResponse = await response.text();
    let data;
    try { data = JSON.parse(textResponse); } catch(e) { throw new Error('Invalid JSON'); }
    if (data.error) throw new Error(data.error);
    return sanitizeTitle(data.text || '');
  };

  try {
    return await retryWithBackoff(callApi);
  } catch (error) {
    // console.error("Title generation error:", error);
    return firstMsg.length > 25 ? firstMsg.slice(0, 25) + '...' : firstMsg;
  }
};

export const searchUniversityScores = async (query: string, language: Language) => {
  const isVi = language === Language.VI;
  const systemInstruction = isVi
    ? "Bạn là một chuyên gia tư vấn tuyển sinh đại học hàng đầu Việt Nam. Hãy sử dụng tính năng Google Search đi kèm để tìm kiếm ĐIỂM CHUẨN (điểm chuẩn học bạ, điểm chuẩn thi tốt nghiệp THPT, hoặc điểm chuẩn ĐGNL) mới nhất và chính xác nhất phù hợp với yêu cầu. Luôn ưu tiên thông tin chính thống từ các nguồn uy tín như VnExpress (vnexpress.net), Báo Tuổi Trẻ (tuoitre.vn), Báo Thanh Niên (thanhnien.vn), hoặc Cổng thông tin tuyển sinh chính thức của trường Đại học. Trình bày thông tin rõ ràng dưới dạng bảng Markdown (gồm các cột: Trường, Ngành/Mã ngành, Tổ hợp xét tuyển, Điểm chuẩn, Năm áp dụng) và đưa ra lời khuyên hữu ích cho học sinh."
    : "You are an elite university admission advisor in Vietnam. Use the Google Search tool to find the absolute latest and most accurate admission scores matching the university or major requested. Prioritize official and prestigious Vietnamese sources like VnExpress, Tuoi Tre, Thanh Nien, or official university portals. Present results in a neat Markdown table containing: University, Major/Code, Exam Group, Score, and Year. Provide strategic advice below.";
  
  const customKey = getGeminiApiKey();

  const callApi = async () => {
    const promptMessage = isVi
      ? `Tra cứu điểm chuẩn đại học mới nhất của trường/ngành: "${query}". Chú ý: Hiện tại đang là năm 2026. Hãy tìm kiếm các dữ liệu mới nhất có sẵn (ví dụ điểm chuẩn năm 2025, 2024). Luôn cung cấp tên nguồn báo hoặc trang tuyển sinh chính thống mà bạn lấy dữ liệu.`
      : `Find the latest university admission scores for: "${query}". Note: The current year is 2026, so look for the most recent data (e.g., 2025, 2024 figures) using actual search grounding and specify the sources clearly.`;

    try {
      const response = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              history: [],
              message: promptMessage,
              systemInstruction,
              apiKey: customKey || undefined
          })
      });
      
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      if (isJson) {
        const textResponse = await response.text();
        const data = JSON.parse(textResponse);
        if (response.ok && data?.text) {
          return {
            text: cleanMarkdownAsterisks(data.text),
            groundingMetadata: data.groundingMetadata || null
          };
        }
      }
    } catch (err) {
      // console.warn("Backend search proxy failed:", err);
    }

    if (customKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: customKey });
        const aiResponse = await generateClientContentWithFallback(ai, {
            model: 'gemini-3.7-flash',
            contents: [{ role: 'user', parts: [{ text: promptMessage }] }],
            config: { 
                systemInstruction,
                tools: [{ googleSearch: {} }]
            }
        });
        return {
            text: cleanMarkdownAsterisks(aiResponse.text || TRANSLATIONS[language].noAiResponse),
            groundingMetadata: aiResponse.candidates?.[0]?.groundingMetadata || null
        };
      } catch (clientErr) {
        // Fall through to synthesis fallback
      }
    }

    throw new Error(isVi ? "Không thể kết nối AI (Kiểm tra API Key)" : "Cannot connect to AI (Check API Key)");
  };

  return await retryWithBackoff(callApi);
};

export const compareCareers = async (career1: string, career2: string, language: Language) => {
  const systemInstruction = `You are an expert senior career analyst and strategist. Return ONLY a valid JSON object comparing two given careers in depth.
The JSON structure must be EXACTLY:
{
  "career1": {
    "name": "Career 1 Name",
    "description": "Short overview description without markdown asterisks",
    "salary": "Salary range or specific average details (e.g. 20 - 55 triệu VNĐ/tháng)",
    "demand": "Market demand details with growth rates",
    "competition": "Competition description and entry barriers",
    "workLife": "Work-life balance and stress level details",
    "skills": ["Skill 1", "Skill 2", "Skill 3"],
    "careerPath": "Advancement path or stages (e.g. Junior -> Senior -> Lead)",
    "aiRisk": "AI disruption threat level and reason",
    "education": "Required education, bootcamps or key certifications",
    "suitability": "Traits or interests of people who would excel here"
  },
  "career2": {
    "name": "Career 2 Name",
    "description": "Short overview description without markdown asterisks",
    "salary": "Salary range or specific average details (e.g. 25 - 65 triệu VNĐ/tháng)",
    "demand": "Market demand details with growth rates",
    "competition": "Competition description and entry barriers",
    "workLife": "Work-life balance and stress level details",
    "skills": ["Skill 1", "Skill 2", "Skill 3"],
    "careerPath": "Advancement path or stages (e.g. Junior -> Senior -> Lead)",
    "aiRisk": "AI disruption threat level and reason",
    "education": "Required education, bootcamps or key certifications",
    "suitability": "Traits or interests of people who would excel here"
  },
  "comparisonPoints": {
    "salaryWinner": "career1" | "career2" | "tie",
    "demandWinner": "career1" | "career2" | "tie",
    "workLifeWinner": "career1" | "career2" | "tie",
    "aiResilienceWinner": "career1" | "career2" | "tie",
    "summaryAnalysis": "A deep analysis of the trade-offs and differences between the two careers.",
    "recommendation": "Actionable career advice on how to choose between them depending on personal traits."
  }
}
Do NOT include any markdown formatting like \`\`\`json. Ensure all strings are translated into the requested language (either Vietnamese or English). Do not use asterisks (*) in text values.`;
  
  const customKey = getGeminiApiKey();

  const callApi = async () => {
    const prompt = `Provide an in-depth comparison between "${career1}" and "${career2}". Language requested: ${language === Language.EN ? 'English' : 'Vietnamese'}. Make the analysis highly specific, detailed, and realistic (include local Vietnamese salary ranges in VNĐ/tháng). Clean all asterisks from output.`;
    
    try {
      const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              history: [], message: prompt, systemInstruction, apiKey: customKey || undefined
          })
      });
      
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      
      if (isJson) {
        const textResponse = await response.text();
        const data = JSON.parse(textResponse);
        if (response.ok && data?.text) {
          let jsonStr = (data.text || '').trim();
          const firstBrace = jsonStr.indexOf('{');
          const lastBrace = jsonStr.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace > firstBrace) {
            jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
            try {
              const parsed = JSON.parse(jsonStr);
              if (parsed.career1 && parsed.career2) {
                return cleanMarkdownAsterisks(parsed);
              }
            } catch (e) {}
          }
        }
      }
    } catch (err) {
      console.warn("Backend compare proxy call failed:", err);
    }

    // Direct client fallback if custom key exists
    try {
      const ai = new GoogleGenAI({ apiKey: customKey });
      const aiResponse = await generateClientContentWithFallback(ai, {
          model: 'gemini-3.7-flash',
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: { systemInstruction }
      });
      let jsonStr = (aiResponse.text || '').trim();
      const firstBrace = jsonStr.indexOf('{');
      const lastBrace = jsonStr.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
        const parsed = JSON.parse(jsonStr);
        if (parsed.career1 && parsed.career2) {
          return cleanMarkdownAsterisks(parsed);
        }
      }
    } catch (clientErr) {
      console.warn("Client fallback comparison failed:", clientErr);
    }

    throw new Error(language === Language.VI ? "Không thể kết nối AI (Kiểm tra API Key)" : "Cannot connect to AI (Check API Key)");
  };

  return await retryWithBackoff(callApi);
};

export const searchScholarships = async (
  query: string,
  language: Language,
  userProfile?: UserProfile | null
) => {
  const profileDetails = userProfile 
    ? `\n\nUser Profile:\nName: ${userProfile.name}\nGoal: ${userProfile.careerGoal || 'Exploring'}\nProfile (RIASEC): ${userProfile.careerProfile ? userProfile.careerProfile : 'Not taken'}`
    : '';

  const isVi = language === Language.VI;
  const systemInstruction = isVi
    ? `Bạn là chuyên gia cố vấn săn học bổng và hỗ trợ tài chính du học hàng đầu. Hãy tìm kiếm danh sách 3 - 5 chương trình học bổng thực tế, còn hạn hoặc mở định kỳ tương ứng với từ khóa tìm kiếm: "${query}".
Với mỗi học bổng, trình bày chi tiết theo định dạng:
### 🎓 [Tên học bổng đầy đủ]
- **Đơn vị / Tổ chức cấp**: Tên quỹ tài trợ / Trường đại học / Chính phủ
- **Giá trị tài trợ**: Số tiền hoặc % học phí cụ thể (Toàn phần, 50-100% học phí, sinh hoạt phí)
- **Đối tượng & Điều kiện xét tuyển**: Điểm GPA yêu cầu, chứng chỉ tiếng Anh (IELTS/TOEFL), bài luận hoặc kinh nghiệm
- **Hạn nộp hồ sơ & Kỳ nhập học**: Mốc thời gian tuyển sinh cụ thể
- **Hướng dẫn ứng tuyển & Link/Cổng thông tin**: Nơi tiếp nhận hồ sơ

Hãy trả lời chuyên sâu, đầy đủ, không sử dụng câu trả lời mẫu chung chung.`
    : `You are a premier scholarship and study abroad advisor. Search for 3 - 5 real, active or recurring scholarship programs matching the search query: "${query}".
For each scholarship, provide:
### 🎓 [Full Scholarship Name]
- **Sponsoring Body / University**: Sponsoring Foundation / Government / University
- **Funding Value**: Exact grant amounts or tuition coverage (Full tuition, stipend, flight)
- **Eligibility & Requirements**: Minimum GPA, English certificates (IELTS/TOEFL), essays, achievements
- **Application Deadline & Intakes**: Specific timeline and deadlines
- **Application Process & Portal**: Official portal guidance

Provide deep, factual, and actionable details without generic templates.`;

  const customKey = getGeminiApiKey(userProfile);

  const callApi = async () => {
    const promptMessage = isVi
      ? `Tìm kiếm các chương trình học bổng, quỹ tài trợ du học hoặc học bổng đại học cho từ khóa: "${query}"${profileDetails}. Yêu cầu cung cấp thông tin chi tiết và chính xác.`
      : `Search for live scholarships and grants for: "${query}"${profileDetails}. Provide concrete, detailed scholarship opportunities.`;

    try {
      const response = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              history: [],
              message: promptMessage,
              systemInstruction,
              apiKey: customKey || undefined
          })
      });
      
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      if (isJson) {
        const textResponse = await response.text();
        const data = JSON.parse(textResponse);
        if (response.ok && data?.text && !data.text.includes("Dưới đây là các thông tin trọng tâm tổng hợp từ dữ liệu tuyển sinh")) {
          return cleanMarkdownAsterisks(data.text);
        }
      }
    } catch (e) {
      console.warn("Backend scholarship search fetch error:", e);
    }

    // Direct Client Generation via GoogleGenAI SDK with Search Grounding
    if (customKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: customKey });
        const aiResponse = await generateClientContentWithFallback(ai, {
            model: 'gemini-3.7-flash',
            contents: [{ role: 'user', parts: [{ text: promptMessage }] }],
            config: { 
              systemInstruction,
              tools: [{ googleSearch: {} }]
            }
        });
        if (aiResponse.text) {
          return cleanMarkdownAsterisks(aiResponse.text);
        }
      } catch (clientErr) {
        console.warn("Client-side scholarship search error:", clientErr);
      }
    }

    // Dynamic AI structured synthesis if remote search tool is offline
    const fallbackPrompt = `Lập danh sách 3 chương trình học bổng uy tín nhất phù hợp với ngành/chủ đề "${query}" kèm điều kiện xét tuyển, giá trị học bổng và hạn nộp.`;
    const text = await requestAiContent(fallbackPrompt, systemInstruction, language);
    return cleanMarkdownAsterisks(text);
  };

  try {
    return await retryWithBackoff(callApi);
  } catch (error: any) {
    console.error("Scholarship search error:", error);
    throw new Error(cleanFrontEndErrorMessage(error, language));
  }
};

export const evaluateScholarshipProfile = async (
  profileData: {
    gpa: string;
    languageCert: string;
    major: string;
    targetCountry: string;
    activities: string;
    targetScholarship?: string;
  },
  language: Language,
  userProfile?: UserProfile | null
): Promise<string> => {
  const isVi = language === Language.VI;
  const systemInstruction = isVi
    ? `Bạn là Trưởng ban tuyển sinh và Cố vấn Săn học bổng Quốc tế cao cấp. Hãy đánh giá chi tiết và khách quan hồ sơ ứng viên sau đây đối với việc xin học bổng ${profileData.targetScholarship ? `"${profileData.targetScholarship}"` : 'các trường Đại học / Quỹ quốc tế'}.
Cung cấp phân tích sâu sắc theo định dạng:
### 📊 1. Điểm Đánh Giá Năng Lực Hồ Sơ
- **Điểm tổng quan hồ sơ (Profile Strength)**: [Ví dụ: 82/100 - Khá Mạnh / Xuất Sắc]
- **Tỷ lệ trúng tuyển ước tính**: [% trúng học bổng Toàn phần / Bán phần]

### 💎 2. Phân Tích Điểm Mạnh & Lợi Thế Cạnh Tranh
- Các điểm nổi bật về học thuật, ngoại ngữ và hoạt động.

### ⚠️ 3. Lỗ Hổng & Điểm Cần Cải Thiện Cấp Tốc
- Những tiêu chí còn thiếu hoặc cần nâng cấp trước kỳ hạn nộp đơn.

### 🎯 4. Danh Sách Học Bổng Tương Thích Nhất (Matching Scholarships)
- 3 chương trình học bổng thực tế phù hợp nhất với ngưỡng điểm này.

### 🚀 5. Lộ Trình Hành Động 4 Bước Tối Ưu Tỷ Lệ Đậu
- Kế hoạch từng tháng để nâng cấp bài luận, xin thư giới thiệu và nộp đơn.`
    : `You are a Senior Scholarship Board Evaluator. Perform an in-depth audit of the applicant's profile for ${profileData.targetScholarship ? `"${profileData.targetScholarship}"` : 'international scholarships'}.
Format response:
### 📊 1. Profile Competitiveness Score
- **Overall Profile Score**: [e.g. 85/100]
- **Estimated Acceptance Probability**: [Full-ride vs Partial %]

### 💎 2. Competitive Strengths
### ⚠️ 3. Critical Gaps & Weaknesses to Address
### 🎯 4. Top Matched Scholarship Programs
### 🚀 5. Strategic 4-Step Action Plan to Maximize Success`;

  const prompt = isVi
    ? `Thông tin ứng viên:
- Điểm GPA: ${profileData.gpa || 'Chưa cung cấp'}
- Chứng chỉ ngoại ngữ: ${profileData.languageCert || 'Chưa cung cấp'}
- Ngành học mục tiêu: ${profileData.major || 'Đa ngành'}
- Quốc gia/Khu vực mong muốn: ${profileData.targetCountry || 'Toàn cầu'}
- Hoạt động ngoại khóa / Nghiên cứu / Giải thưởng: ${profileData.activities || 'Chưa có nhiều'}
${profileData.targetScholarship ? `- Học bổng nhắm tới: ${profileData.targetScholarship}` : ''}`
    : `Applicant profile:
- GPA: ${profileData.gpa || 'Not provided'}
- English / Language Proficiency: ${profileData.languageCert || 'Not provided'}
- Target Major: ${profileData.major || 'General'}
- Target Region: ${profileData.targetCountry || 'Global'}
- Extracurriculars / Projects / Awards: ${profileData.activities || 'None specified'}
${profileData.targetScholarship ? `- Target Scholarship: ${profileData.targetScholarship}` : ''}`;

  const text = await requestAiContent(prompt, systemInstruction, language);
  return cleanMarkdownAsterisks(text);
};

export const generateScholarshipEssayOutline = async (
  essayData: {
    scholarshipName: string;
    intendedMajor: string;
    whyMajor: string;
    uniqueExperience: string;
    futureContribution: string;
  },
  language: Language
): Promise<string> => {
  const isVi = language === Language.VI;
  const systemInstruction = isVi
    ? `Bạn là Chuyên gia luyện viết Luận Học bổng & Thư Động Lực (Statement of Purpose / Motivation Letter) quốc tế. Hãy xây dựng một cấu trúc bài luận thuyết phục, cảm xúc và đậm chất cá nhân hóa cho học bổng "${essayData.scholarshipName || 'Đại học Toàn Cầu'}".
Cung cấp:
### ✍️ 1. Tiêu Đề Bài Luận & Thông Điệp Cốt Lõi (Core Hook & Theme)
### 🌟 2. Đoạn Mở Đầu Ấn Tượng (Opening Hook - Viết mẫu 1 đoạn cuốn hút)
### 🧱 3. Dàn Ý Chi Tiết Thân Bài (Body Paragraphs Outline):
- **Phần 1: Khởi nguồn đam mê & Động lực học tập**
- **Phần 2: Trải nghiệm thực tế & Năng lực vượt trội**
- **Phần 3: Lý do chọn trường / quốc gia / quỹ học bổng này**
- **Phần 4: Kế hoạch tương lai & Giá trị đóng góp cho cộng đồng**
### 🎯 4. Đoạn Kết Bài Gây Dấu Ấn (Memorable Conclusion)
### 💡 5. Ba Lỗi Thường Gặp Cần Tránh Khi Nộp Bài Luận Này`
    : `You are an elite Scholarship Essay & Motivation Letter Coach. Generate an outline and compelling writing strategy for "${essayData.scholarshipName || 'Global Scholarship'}".
Include:
### ✍️ 1. Essay Title & Core Narrative Theme
### 🌟 2. Sample Compelling Opening Hook
### 🧱 3. Detailed Body Paragraphs Outline
### 🎯 4. Memorable Conclusion
### 💡 5. Top 3 Pitfalls to Avoid`;

  const prompt = isVi
    ? `Thông tin viết bài luận:
- Học bổng: ${essayData.scholarshipName || 'Học bổng đại học'}
- Ngành học: ${essayData.intendedMajor || 'Chưa chỉ định'}
- Lý do đam mê ngành này: ${essayData.whyMajor || 'Đam mê phát triển bản thân và giải quyết vấn đề xã hội'}
- Trải nghiệm nổi bật / Khó khăn đã vượt qua: ${essayData.uniqueExperience || 'Chưa cung cấp'}
- Đóng góp trong tương lai: ${essayData.futureContribution || 'Đóng góp tri thức và đổi mới sáng tạo'}`
    : `Essay parameters:
- Scholarship: ${essayData.scholarshipName || 'University Scholarship'}
- Major: ${essayData.intendedMajor || 'Undecided'}
- Motivation for major: ${essayData.whyMajor || 'Passion for solving societal challenges'}
- Key personal story / obstacle overcome: ${essayData.uniqueExperience || 'Not specified'}
- Future contribution: ${essayData.futureContribution || 'Contributing to innovation'}`;

  const text = await requestAiContent(prompt, systemInstruction, language);
  return cleanMarkdownAsterisks(text);
};

export const generateMockInterviewQuestions = async (
  job: string,
  level: string,
  tone: string,
  targetCompany?: string,
  language: Language = Language.VI
): Promise<string[]> => {
  const isEn = language === Language.EN;
  const systemPrompt = "You are an expert HR Manager and artificial career interviewer. You must generate EXACTLY 4 highly relevant and customized interview questions for a candidate.";
  const userMessage = `Create 4 tailored interview questions for the position of "${job}" with "${level}" experience level.
The interviewer tone should be "${tone}".
${targetCompany ? `Target Hiring Company: "${targetCompany}". Adapt questions to the specific culture and hiring process of ${targetCompany}.` : ''}
Return the output strictly as a JSON array of 4 string questions. Do not write anything else. Do not use markdown \`\`\`json.`;

  const customKey = getGeminiApiKey();
  
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        history: [],
        message: userMessage,
        systemInstruction: systemPrompt,
        apiKey: customKey || undefined
      })
    });
    if (response.ok) {
      const data = await response.json();
      if (data?.text) {
        let clean = data.text.trim();
        const firstBracket = clean.indexOf('[');
        const lastBracket = clean.lastIndexOf(']');
        if (firstBracket !== -1 && lastBracket > firstBracket) {
          clean = clean.substring(firstBracket, lastBracket + 1);
        }
        const parsed = JSON.parse(clean);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((q: string) => cleanMarkdownAsterisks(q));
        }
      }
    }
  } catch (err) {
    console.warn("Backend chat query failed for questions, attempting direct client AI...", err);
  }

  if (customKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: customKey });
      const aiResponse = await generateClientContentWithFallback(ai, {
        model: 'gemini-3.7-flash',
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        config: { systemInstruction: systemPrompt }
      });
      let clean = (aiResponse.text || '').trim();
      const firstBracket = clean.indexOf('[');
      const lastBracket = clean.lastIndexOf(']');
      if (firstBracket !== -1 && lastBracket > firstBracket) {
        clean = clean.substring(firstBracket, lastBracket + 1);
      }
      const parsed = JSON.parse(clean);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((q: string) => cleanMarkdownAsterisks(q));
      }
    } catch (clientErr) {
      console.warn("Client SDK failed for questions:", clientErr);
    }
  }

  throw new Error(isEn ? "Failed to generate interview questions. Please verify your AI settings and API key." : "Không thể tạo câu hỏi phỏng vấn bằng AI. Vui lòng kiểm tra thiết lập API Key.");
};

export const evaluateMockInterviewTranscript = async (
  job: string,
  level: string,
  tone: string,
  questions: string[],
  answers: string[],
  language: Language = Language.VI
): Promise<any> => {
  const isVi = language === Language.VI;
  const systemInstruction = "You are an elite HR consultant analyzing interview transcripts. You must analyze the questions and candidates answers then evaluate performance objectively. Return EXACTLY a JSON object matching the specified schema.";

  const transcript = questions.map((q, i) => `Question ${i + 1}: ${q}\nAnswer: ${answers[i] || 'No answer'}`).join('\n\n');

  const userMessage = `Role: ${job} (Level: ${level})
Interviewer Tone: ${tone}

Evaluate this interview transcript:
${transcript}

Return a valid JSON object matching this structure EXACTLY:
{
  "score": <number from 0 to 100>,
  "overallFeedback": "<string details summarizing performance with constructive advice in ${isVi ? 'Vietnamese' : 'English'}>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "recommendations": ["<recommendation 1>", "<recommendation 2>"],
  "categories": {
    "knowledge": <number from 0 to 100>,
    "communication": <number from 0 to 100>,
    "problemSolving": <number from 0 to 100>,
    "riasecFit": <number from 0 to 100>
  }
}

Rule: Do NOT output anything other than this JSON structure. Do NOT write markdown code fences. Respond in ${isVi ? "Vietnamese" : "English"}.`;

  const customKey = getGeminiApiKey();

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        history: [],
        message: userMessage,
        systemInstruction,
        apiKey: customKey || undefined
      })
    });
    if (response.ok) {
      const data = await response.json();
      if (data?.text) {
        let clean = data.text.trim();
        const firstBrace = clean.indexOf('{');
        const lastBrace = clean.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace > firstBrace) {
          clean = clean.substring(firstBrace, lastBrace + 1);
        }
        const parsed = JSON.parse(clean);
        if (parsed && typeof parsed.score === 'number') {
          return cleanMarkdownAsterisks(parsed);
        }
      }
    }
  } catch (err) {
    console.warn("Backend evaluation request failed, trying client SDK...", err);
  }

  if (customKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: customKey });
      const aiResponse = await generateClientContentWithFallback(ai, {
        model: 'gemini-3.7-flash',
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        config: { systemInstruction }
      });
      let clean = (aiResponse.text || '').trim();
      const firstBrace = clean.indexOf('{');
      const lastBrace = clean.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        clean = clean.substring(firstBrace, lastBrace + 1);
      }
      const parsed = JSON.parse(clean);
      if (parsed && typeof parsed.score === 'number') {
        return cleanMarkdownAsterisks(parsed);
      }
    } catch (clientErr) {
      console.warn("Client SDK failed for evaluation:", clientErr);
    }
  }

  throw new Error(isVi ? "Đánh giá bằng AI thất bại. Vui lòng kiểm tra API Key." : "AI Evaluation failed. Please check your API key.");
};
