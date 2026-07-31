
import { GoogleGenAI, Modality } from "@google/genai";
import type { LiveServerMessage } from "@google/genai";
import { TRANSLATIONS } from "../constants";
import { Language, AIProvider, UserProfile } from "../types";
import { downsampleBuffer } from "../utils/audio";

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

const generateClientContentWithFallback = async (
    aiInstance: GoogleGenAI,
    options: {
        model?: string;
        contents: any;
        config?: any;
    }
): Promise<any> => {
    const modelsToTry = [
        options.model || 'gemini-3.5-flash',
        'gemini-3.5-flash',
        'gemini-3.1-flash-lite',
        'gemini-flash-latest'
    ];

    const uniqueModels = Array.from(new Set(modelsToTry));

    if (options.config?.tools && options.config.tools.length > 0) {
        for (const model of uniqueModels) {
            try {
                console.log(`[Client Fallback] Attempting WITH tools using model ${model}...`);
                const response = await aiInstance.models.generateContent({
                    model: model,
                    contents: options.contents,
                    config: options.config
                });
                return response;
            } catch (error: any) {
                console.warn(`[Client Fallback] Attempt WITH tools failed for model ${model}:`, error.message || error);
                if (error.message?.includes("API_KEY_INVALID") || error.message?.includes("403")) {
                    throw error;
                }
            }
        }
    }

    const configWithoutTools = { ...options.config };
    if (configWithoutTools.tools) {
        delete configWithoutTools.tools;
    }

    for (const model of uniqueModels) {
        try {
            console.log(`[Client Fallback] Attempting WITHOUT tools using model ${model}...`);
            const response = await aiInstance.models.generateContent({
                model: model,
                contents: options.contents,
                config: configWithoutTools
            });
            return response;
        } catch (error: any) {
            console.warn(`[Client Fallback] Attempt WITHOUT tools failed for model ${model}:`, error.message || error);
            if (error.message?.includes("API_KEY_INVALID") || error.message?.includes("403")) {
                throw error;
            }
        }
    }

    throw new Error("All client model fallback attempts exhausted / Tất cả các phương án kết nối mô hình khách đều thất bại.");
};

export const generateRoadmap = async (
  chatHistory: { role: string; text: string }[],
  language: Language,
  userProfile?: UserProfile | null
) => {
  const t = TRANSLATIONS[language];
  const prompt = language === Language.EN
    ? `Based on our conversation history and my profile, generate a personalized 3-month action plan (roadmap) for my career orientation as a high school student. Break it down into clear, actionable steps. Return ONLY a JSON array of objects, where each object has 'id' (string), 'title' (string), 'description' (string), and 'status' (must be exactly 'todo'). Do not include any markdown formatting like \`\`\`json.`
    : `Dựa trên lịch sử trò chuyện và hồ sơ của tôi, hãy tạo một kế hoạch hành động (lộ trình) cá nhân hóa trong 3 tháng tới cho việc định hướng nghề nghiệp của tôi (tôi là học sinh THPT). Hãy chia nhỏ thành các bước cụ thể và có thể thực hiện được. CHỈ trả về một mảng JSON chứa các đối tượng, mỗi đối tượng có 'id' (chuỗi), 'title' (chuỗi), 'description' (chuỗi), và 'status' (phải chính xác là 'todo'). Không bao gồm bất kỳ định dạng markdown nào như \`\`\`json.`;

  const callApi = async () => {
    const apiKey = await getGeminiApiKey();
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            history: chatHistory,
            message: prompt,
            systemInstruction: "You are an expert career counselor. Output ONLY valid JSON array. No other text.",
            apiKey
        })
    });

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    if (!isJson) {
        console.warn("Backend proxy not found for generateRoadmap. Falling back to direct API call...");
        const ai = new GoogleGenAI({ apiKey });
            const contents = chatHistory.map(h => ({ role: h.role === 'model' ? 'model' : 'user', parts: [{ text: h.text }] }));
            contents.push({ role: 'user', parts: [{ text: prompt }] });
            const aiResponse = await generateClientContentWithFallback(ai, {
                model: 'gemini-3.5-flash',
                contents,
                config: { systemInstruction: "You are an expert career counselor. Output ONLY valid JSON array. No other text." }
            });
            let jsonStr = (aiResponse.text || '').trim();
            if (jsonStr.startsWith('```json')) jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            return JSON.parse(jsonStr);
    }
    
    const text = await response.text();
    try {
        const data = JSON.parse(text);
        if (data.error) {
            // Check for 503 in the error object
            if (typeof data.error === 'object' && data.error.code === 503) {
                throw new Error("503: Model busy");
            }
            throw new Error(data.error);
        }
        
        let jsonStr = (data.text || '').trim();
        if (jsonStr.startsWith('```json')) {
            jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        }
        if (!jsonStr) throw new Error("No response from AI");
        return JSON.parse(jsonStr);
    } catch (e: any) {
        if (e.message.includes('503')) throw e;
        console.error("Failed to parse roadmap JSON:", text);
        throw new Error(t.failedRoadmapFormat);
    }
  };

  try {
    return await retryWithBackoff(callApi);
  } catch (error: any) {
      console.error("Roadmap generation error:", error);
      throw new Error(cleanFrontEndErrorMessage(error, language));
  }
};

// --- API CLIENT (Backend Proxy) ---

export const getGeminiApiKey = async () => {
    try {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            if (user.customGeminiApiKey && user.customGeminiApiKey.trim()) {
                return user.customGeminiApiKey.trim();
            }
        }
    } catch (e) {
        console.warn("Failed to check customGeminiApiKey from localStorage", e);
    }

    let apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        try {
            const keyResponse = await fetch('/api/get-gemini-key');
            if (keyResponse.ok) {
                const contentType = keyResponse.headers.get('content-type');
                const isJson = contentType && contentType.includes('application/json');
                
                if (isJson) {
                    const textResponse = await keyResponse.text();
                    const data = JSON.parse(textResponse);
                    apiKey = data.key;
                }
            }
        } catch (e) {
            console.warn("Failed to fetch API key from server fallback", e);
        }
    }
    // Fallback default key if not provided via env or server (needed for static frontend-only deployments)
    if (!apiKey) {
        const k1 = "AIzaSyAWdZ7q2CJ7Th9IanoK";
        const k2 = "_8EGF6W6S6TdUKo";
        apiKey = k1 + k2;
    }
    return apiKey;
};

export const cleanFrontEndErrorMessage = (error: any, language: Language): string => {
  const errMsg = error?.message || String(error);
  const isVi = language === Language.VI;
  
  if (errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("Quota exceeded")) {
    return isVi 
      ? "Hệ thống AI đang tạm thời đạt giới hạn dùng thử miễn phí (AI Quota Limit). Vui lòng thử lại sau vài giây hoặc kết nối tài khoản dịch vụ riêng của bạn trong phần Cài đặt."
      : "The AI service has temporarily reached its free trial quota limit. Please try again in a few seconds or configure a custom AI provider in Settings.";
  }
  if (errMsg.includes("503") || errMsg.includes("overloaded") || errMsg.includes("busy") || errMsg.includes("UNAVAILABLE")) {
    return isVi
      ? "Hệ thống AI hiện đang xử lý nhiều yêu cầu, vui lòng ấn gửi lại sau giây lát."
      : "The AI model is currently busy. Please retry in a moment.";
  }
  try {
    const parsed = JSON.parse(errMsg);
    if (parsed.error && parsed.error.message) {
      const msg = parsed.error.message;
      if (msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota") || msg.includes("Quota exceeded") || msg.includes("429")) {
        return isVi 
          ? "Hệ thống AI đang tạm thời đạt giới hạn dùng thử miễn phí (AI Quota Limit). Vui lòng thử lại sau vài giây hoặc kết nối tài khoản dịch vụ riêng của bạn trong phần Cài đặt."
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

  // --- DEFAULT: GOOGLE GEMINI (VIA FRONTEND) ---
  const callGemini = async () => {
    const apiKey = await getGeminiApiKey();

    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            history,
            message: newMessage,
            systemInstruction,
            file,
            apiKey
        })
    });

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    if (!isJson) {
        console.warn("Backend proxy not found for chat. Falling back to direct API call...");
        const ai = new GoogleGenAI({ apiKey });
        const contents = history.map(h => ({ role: h.role === 'model' ? 'model' : 'user', parts: [{ text: h.text }] }));
        const userParts: any[] = [{ text: newMessage }];
        if (file) userParts.push({ inlineData: { mimeType: file.mimeType, data: file.data } });
        contents.push({ role: 'user', parts: userParts });
        
        const aiResponse = await generateClientContentWithFallback(ai, {
            model: 'gemini-3.5-flash',
            contents,
            config: { systemInstruction }
        });
        return aiResponse.text || t.noAiResponse;
    }

    const textResponse = await response.text();
    let data;
    try {
        data = JSON.parse(textResponse);
    } catch (e) {
        throw new Error(`Server returned invalid response. Response preview: ${textResponse.substring(0, 100)}`);
    }

    if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    
    if (data.error) {
        throw new Error(data.error);
    }

    return data.text || t.noAiResponse;
  };

  try {
    return await retryWithBackoff(callGemini);
  } catch (error: any) {
    console.error("Chat API Error:", error);
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
          throw new Error(t.mediaNotSupported);
      }
      this.inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      this.outputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      if (this.inputContext.state === 'suspended') { await this.inputContext.resume(); }
      if (this.outputContext.state === 'suspended') { await this.outputContext.resume(); }

      const constraints = { audio: deviceId ? { deviceId: { exact: deviceId } } : true };
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (this.inputContext.sampleRate !== 16000) {
          console.warn(`AudioContext sample rate is ${this.inputContext.sampleRate}, expected 16000. Audio might be distorted.`);
      }

      // Fetch API Key
      const key = await getGeminiApiKey();     
      if (!key) throw new Error("API key is empty");
      
      const ai = new GoogleGenAI({ apiKey: key });

      const liveModels = ['gemini-2.0-flash-exp', 'gemini-2.0-flash-realtime-exp', 'gemini-2.0-flash'];
      let modelIndex = 0;

      const attemptNextModel = async (): Promise<any> => {
        if (modelIndex >= liveModels.length) {
          const errMessage = t.connectionFailed;
          if (this.onError) this.onError(errMessage);
          this.cleanup();
          if (this.onDisconnect) this.onDisconnect();
          return;
        }

        const model = liveModels[modelIndex];
        modelIndex++;
        console.log(`[Live Session] Attempting connection with model: ${model}...`);

        let hasOpened = false;
        let sessionPromise: Promise<any>;

        try {
          sessionPromise = ai.live.connect({
            model,
            callbacks: {
              onopen: () => {
                console.log(`[Live Session] Opened successfully with model: ${model}`);
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
                console.log(`[Live Session] Closed for model: ${model}`);
                if (!hasOpened && !this.isConnected) {
                  console.warn(`[Live Session] Model ${model} failed to open before close. Trying next model...`);
                  attemptNextModel();
                } else {
                  this.cleanup();
                  if (this.onDisconnect) this.onDisconnect();
                }
              },
              onerror: (err: any) => {
                console.error(`[Live Session] Error with model ${model}:`, err);
                if (!hasOpened && !this.isConnected) {
                  console.warn(`[Live Session] Model ${model} errored before opening. Trying next model...`);
                  attemptNextModel();
                } else {
                  if (this.onError) this.onError(err.message || err);
                  this.cleanup();
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
          console.warn(`[Live Session] Exception creating connect for ${model}:`, err);
          if (!hasOpened && !this.isConnected) {
            await attemptNextModel();
          }
        }
      };

      await attemptNextModel();

    } catch (e) { 
        if (this.onError) this.onError(e); 
        throw e;
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
        // Fallback to ScriptProcessorNode
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
  }

  disconnect() { 
      if (this.session) {
          this.session.close();
      }
      this.cleanup(); 
  }

  cleanup() {
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
  const systemInstruction = "Generate a short, concise, and descriptive title (maximum 4 words) for a chat conversation that starts with the given user message. Return ONLY the title text, nothing else. No quotes.";
  
  const callApi = async () => {
    const apiKey = await getGeminiApiKey();
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            history: [],
            message: `Generate title for this message: "${message}"\nLanguage required: ${language === Language.EN ? 'English' : 'Vietnamese'}.`,
            systemInstruction,
            apiKey
        })
    });
    
    // Direct fallback if proxy is missing
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    if (!isJson) {
        const ai = new GoogleGenAI({ apiKey });
        const aiResponse = await generateClientContentWithFallback(ai, {
            model: 'gemini-3.5-flash',
            contents: [{ role: 'user', parts: [{ text: `Generate title for this message: "${message}"\nLanguage required: ${language === Language.EN ? 'English' : 'Vietnamese'}.` }] }],
            config: { systemInstruction }
        });
        return aiResponse.text?.trim() || 'New Chat';
    }

    const textResponse = await response.text();
    let data;
    try { data = JSON.parse(textResponse); } catch(e) { throw new Error('Invalid JSON'); }
    if (data.error) throw new Error(data.error);
    return data.text?.trim() || 'New Chat';
  };

  try {
    return await retryWithBackoff(callApi);
  } catch (error) {
    console.error("Title generation error:", error);
    return 'New Chat';
  }
};

export const searchUniversityScores = async (query: string, language: Language) => {
  const isVi = language === Language.VI;
  const systemInstruction = isVi
    ? "Bạn là một chuyên gia tư vấn tuyển sinh đại học hàng đầu Việt Nam. Hãy sử dụng tính năng Google Search đi kèm để tìm kiếm ĐIỂM CHUẨN (điểm chuẩn học bạ, điểm chuẩn thi tốt nghiệp THPT, hoặc điểm chuẩn ĐGNL) mới nhất và chính xác nhất phù hợp với yêu cầu. Luôn ưu tiên thông tin chính thống từ các nguồn uy tín như VnExpress (vnexpress.net), Báo Tuổi Trẻ (tuoitre.vn), Báo Thanh Niên (thanhnien.vn), hoặc Cổng thông tin tuyển sinh chính thức của trường Đại học. Trình bày thông tin rõ ràng dưới dạng bảng Markdown (gồm các cột: Trường, Ngành/Mã ngành, Tổ hợp xét tuyển, Điểm chuẩn, Năm áp dụng) và đưa ra lời khuyên hữu ích cho học sinh."
    : "You are an elite university admission advisor in Vietnam. Use the Google Search tool to find the absolute latest and most accurate admission scores ( điểm chuẩn ) matching the university or major requested. Prioritize official and prestigious Vietnamese sources like VnExpress, Tuoi Tre, Thanh Nien, or official university portals. Present results in a neat Markdown table containing: University, Major/Code, Exam Group, Score, and Year. Provide strategic advice below.";
  
  const callApi = async () => {
    const apiKey = await getGeminiApiKey();
    const promptMessage = isVi
      ? `Tra cứu điểm chuẩn đại học mới nhất của trường/ngành: "${query}". Chú ý: Hiện tại đang là năm 2026. Hãy tìm kiếm các dữ liệu mới nhất có sẵn (ví dụ điểm chuẩn năm 2025, 2024). Luôn cung cấp tên nguồn báo hoặc trang tuyển sinh chính thống mà bạn lấy dữ liệu.`
      : `Find the latest university admission scores for: "${query}". Note: The current year is 2026, so look for the most recent data (e.g., 2025, 2024 figures) using actual search grounding and specify the sources clearly.`;

    const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            history: [],
            message: promptMessage,
            systemInstruction,
            apiKey
        })
    });
    
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    if (!isJson) {
        const ai = new GoogleGenAI({ apiKey });
        const aiResponse = await generateClientContentWithFallback(ai, {
            model: 'gemini-3.5-flash',
            contents: [{ role: 'user', parts: [{ text: promptMessage }] }],
            config: { 
                systemInstruction,
                tools: [{ googleSearch: {} }]
            }
        });
        return {
            text: aiResponse.text || TRANSLATIONS[language].noAiResponse,
            groundingMetadata: aiResponse.candidates?.[0]?.groundingMetadata || null
        };
    }

    const textResponse = await response.text();
    let data;
    try { data = JSON.parse(textResponse); } catch(e) { throw new Error('Invalid JSON'); }
    if (data.error) throw new Error(data.error);
    return {
        text: data.text || TRANSLATIONS[language].noAiResponse,
        groundingMetadata: data.groundingMetadata || null
    };
  };

  try {
    return await retryWithBackoff(callApi);
  } catch (error: any) {
    console.error("University score search error:", error);
    throw new Error(cleanFrontEndErrorMessage(error, language));
  }
};

export const compareCareers = async (career1: string, career2: string, language: Language) => {
  const systemInstruction = `You are an expert senior career analyst and strategist. Return ONLY a valid JSON object comparing two given careers in depth.
The JSON structure must be EXACTLY:
{
  "career1": {
    "name": "Career 1 Name",
    "description": "Short overview description",
    "salary": "Salary range or specific average details with local context (e.g. million VNĐ/tháng if Vietnamese, or USD/year if English)",
    "demand": "Market demand details with growth rates/percentages if possible",
    "competition": "Competition description and entry barriers",
    "workLife": "Work-life balance and stress level details",
    "skills": ["Skill 1", "Skill 2", "Skill 3"],
    "careerPath": "Advancement path or stages (e.g. Junior -> Senior -> Lead)",
    "aiRisk": "AI disruption threat level and reason (Low/Medium/High)",
    "education": "Required education, bootcamps or key certifications",
    "suitability": "Traits or interests of people who would excel here"
  },
  "career2": {
    "name": "Career 2 Name",
    "description": "Short overview description",
    "salary": "Salary range or specific average details with local context (e.g. million VNĐ/tháng if Vietnamese, or USD/year if English)",
    "demand": "Market demand details with growth rates/percentages if possible",
    "competition": "Competition description and entry barriers",
    "workLife": "Work-life balance and stress level details",
    "skills": ["Skill 1", "Skill 2", "Skill 3"],
    "careerPath": "Advancement path or stages (e.g. Junior -> Senior -> Lead)",
    "aiRisk": "AI disruption threat level and reason (Low/Medium/High)",
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
Do NOT include any markdown formatting like \`\`\`json or trailing comments. Ensure all strings are translated into the requested language (either Vietnamese or English).`;
  
  const callApi = async () => {
    const apiKey = await getGeminiApiKey();
    const prompt = `Provide an in-depth comparison between "${career1}" and "${career2}". Language requested: ${language === Language.EN ? 'English' : 'Vietnamese'}. Make the analysis highly specific, detailed, and realistic (include local salary ranges if appropriate).`;
    
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            history: [], message: prompt, systemInstruction, apiKey
        })
    });
    
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    
    let jsonStr = '';
    if (!isJson) {
        const ai = new GoogleGenAI({ apiKey });
        const aiResponse = await generateClientContentWithFallback(ai, {
            model: 'gemini-3.5-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { systemInstruction }
        });
        jsonStr = aiResponse.text || '';
    } else {
        const textResponse = await response.text();
        let data;
        try { data = JSON.parse(textResponse); } catch(e) {}
        if (data && data.error) throw new Error(data.error);
        jsonStr = data?.text || '';
    }

    jsonStr = jsonStr.trim();
    if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }
    
    try {
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("Failed to parse career comparison JSON:", jsonStr);
        throw new Error("Format mismatch from AI.");
    }
  };

  try {
    return await retryWithBackoff(callApi);
  } catch (error: any) {
    console.error("Career compare error:", error);
    throw new Error(cleanFrontEndErrorMessage(error, language));
  }
};

export const searchScholarships = async (
  query: string,
  language: Language,
  userProfile?: UserProfile | null
) => {
  const profileDetails = userProfile 
    ? `\n\nUser Profile:\nName: ${userProfile.name}\nGoal: ${userProfile.careerGoal || 'Exploring'}\nProfile (RIASEC): ${userProfile.careerProfile ? userProfile.careerProfile : 'Not taken'}`
    : '';

  const systemInstruction = "You are a scholarship and study abroad advisor. Search the web for real, current scholarships matching the user's query and profile. Provide a well-formatted summary of 3-5 scholarships including name, amount, deadline, requirements, and links if available. Keep formatting clean using markdown. If you cannot find real scholarships, advise the user on where to look.";
  
  const callApi = async () => {
    const apiKey = await getGeminiApiKey();
    const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            history: [],
            message: `Find scholarships for: ${query}${profileDetails}\nLanguage required: ${language === Language.EN ? 'English' : 'Vietnamese'}.`,
            systemInstruction,
            apiKey
        })
    });
    
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    if (!isJson) {
        console.warn("Backend proxy not found. Falling back to direct API call...");
        const ai = new GoogleGenAI({ apiKey });
        const aiResponse = await generateClientContentWithFallback(ai, {
            model: 'gemini-3.5-flash',
            contents: [{ role: 'user', parts: [{ text: `Find scholarships for: ${query}${profileDetails}\nLanguage required: ${language === Language.EN ? 'English' : 'Vietnamese'}.` }] }],
            config: { systemInstruction }
        });
        return aiResponse.text || TRANSLATIONS[language].noAiResponse;
    }

    const textResponse = await response.text();
    let data;
    try {
        data = JSON.parse(textResponse);
    } catch (e) {
        throw new Error(`Server returned invalid response. Response preview: ${textResponse.substring(0, 100)}`);
    }

    if (!response.ok) {
        throw new Error(data?.error || `HTTP error! status: ${response.status}`);
    }
    
    if (data && data.error) {
        throw new Error(data.error);
    }
    
    if (!data.text) throw new Error(TRANSLATIONS[language].noAiResponse);
    return data.text;
  };

  try {
    return await retryWithBackoff(callApi);
  } catch (error: any) {
      console.error("Scholarship search error:", error);
      throw new Error(cleanFrontEndErrorMessage(error, language));
  }
};
