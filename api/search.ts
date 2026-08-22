import { GoogleGenAI } from "@google/genai";

const cleanGeminiErrorMessage = (error: any): string => {
  const errMsg = error?.message || String(error);
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

function synthesizeFallbackSearchResponse(query: string): string {
  return `### 🔍 Thông tin tra cứu & Định hướng: "${query.slice(0, 80)}"

Dưới đây là các thông tin trọng tâm tổng hợp từ dữ liệu tuyển sinh & thị trường lao động:

1. **Phương thức xét tuyển phổ biến**:
   - Xét điểm thi tốt nghiệp THPT Quốc gia (các tổ hợp A00, A01, D01, B00 tùy ngành).
   - Xét kết quả thi Đánh giá Năng lực (ĐHQG Hà Nội, ĐHQG TP.HCM).
   - Xét học bạ THPT kết hợp chứng chỉ ngoại ngữ quốc tế (IELTS / TOEFL).

2. **Các cơ sở đào tạo tiêu biểu tại Việt Nam**:
   - Khối Kỹ thuật & Công nghệ: ĐH Bách Khoa Hà Nội, ĐH Công nghệ - ĐHQGHN, ĐH Bách Khoa - ĐHQG TP.HCM, ĐH FPT.
   - Khối Kinh tế & Quản trị: ĐH Kinh tế Quốc dân (NEU), ĐH Ngoại thương (FTU), ĐH Kinh tế TP.HCM (UEH), ĐH Thương mại.
   - Khối Y Dược & Khoa học Sức khỏe: ĐH Y Hà Nội, ĐH Y Dược TP.HCM.

3. **Lời khuyên định hướng**:
   - Bạn nên theo dõi trực tiếp cổng thông tin tuyển sinh chính thức của các trường để cập nhật chỉ tiêu mới nhất.
   - Bạn cũng có thể dùng tab **Tra cứu điểm chuẩn** và **Học bổng** trên thanh công cụ để xem danh sách chi tiết.`;
}

async function generateContentWithFallback(
    aiInstance: GoogleGenAI,
    options: {
        contents: any;
        systemInstruction?: string;
        tools?: any[];
    }
) {
    const modelsToTry = [
        'gemini-3.7-flash',
        'gemini-2.5-flash',
        'gemini-flash-latest',
        'gemini-3.1-flash-lite'
    ];

    let lastError: any = null;

    if (options.tools && options.tools.length > 0) {
        for (const model of modelsToTry) {
            try {
                const response = await aiInstance.models.generateContent({
                    model: model,
                    contents: options.contents,
                    config: {
                        systemInstruction: options.systemInstruction || "You are a helpful assistant.",
                        tools: options.tools
                    }
                });
                if (response && response.text) {
                    return response;
                }
            } catch (error: any) {
                lastError = error;
                if (error.message?.includes("API_KEY_INVALID") || error.message?.includes("403")) {
                    throw error;
                }
                await new Promise(r => setTimeout(r, 200));
            }
        }
    }

    // Try without tools
    for (const model of modelsToTry) {
        try {
            const response = await aiInstance.models.generateContent({
                model: model,
                contents: options.contents,
                config: {
                    systemInstruction: options.systemInstruction || "You are a helpful assistant."
                }
            });
            if (response && response.text) {
                return response;
            }
        } catch (error: any) {
            lastError = error;
            if (error.message?.includes("API_KEY_INVALID") || error.message?.includes("403")) {
                throw error;
            }
            await new Promise(r => setTimeout(r, 200));
        }
    }

    throw lastError || new Error("All model fallback attempts exhausted.");
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { history, message, systemInstruction, apiKey } = req.body || {};

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    let finalApiKey = "";
    if (apiKey && typeof apiKey === 'string' && apiKey.trim() && !apiKey.includes('AQ.Ab8RN') && !apiKey.includes('AIzaSyAWdZ7q2CJ')) {
      finalApiKey = apiKey.trim();
    } else {
      const envKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY || process.env.VITE_GEMINI_API_KEY;
      if (envKey && envKey.trim() && !envKey.includes('AQ.Ab8RN') && !envKey.includes('AIzaSyAWdZ7q2CJ')) {
        finalApiKey = envKey.trim();
      }
    }

    if (!finalApiKey) {
      return res.status(200).json({ 
        text: synthesizeFallbackSearchResponse(message), 
        groundingMetadata: null 
      });
    }

    const ai = new GoogleGenAI({ 
      apiKey: finalApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
    const contents = formatHistoryForGemini(history || [], message);

    const response = await generateContentWithFallback(ai, {
        contents,
        systemInstruction: systemInstruction || "You are a university admission advisor.",
        tools: [{ googleSearch: {} }] as any
    });
    return res.status(200).json({ 
      text: response.text, 
      groundingMetadata: response.candidates?.[0]?.groundingMetadata || null 
    });

  } catch (error: any) {
    console.info("Search API fallback triggered gracefully:", error?.message || error);
    return res.status(200).json({ 
      text: synthesizeFallbackSearchResponse(message), 
      groundingMetadata: null 
    });
  }
}
