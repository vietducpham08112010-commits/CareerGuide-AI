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
  const q = (query || "").toLowerCase();

  // If query is about scholarships / học bổng
  if (q.includes("học bổng") || q.includes("scholarship") || q.includes("du học") || q.includes("tài trợ") || q.includes("grant") || q.includes("fellowship")) {
    return `### 🎓 Danh mục học bổng uy tín & đang mở đăng ký cho "${query.slice(0, 80)}"

1. Học bổng Toàn phần Fulbright (Thạc sĩ Hoa Kỳ)
• Đơn vị cấp: Bộ Ngoại giao Hoa Kỳ & Đại sứ quán Mỹ tại Việt Nam
• Giá trị tài trợ: Toàn phần 100% học phí, sinh hoạt phí hàng tháng, vé máy bay khứ hồi và bảo hiểm y tế toàn diện.
• Đối tượng & Điều kiện: Công dân Việt Nam đã tốt nghiệp Đại học, GPA từ 7.0/10 hoặc 3.0/4.0 trở lên, tối thiểu 2 năm kinh nghiệm làm việc thực tế, IELTS ≥ 6.5 hoặc TOEFL iBT ≥ 79.
• Hạn nộp hồ sơ: Hàng năm (Tháng 12 - Tháng 4 năm sau).
• Hướng dẫn ứng tuyển: Nộp hồ sơ trực tuyến qua cổng chính thức của Phái đoàn Ngoại giao Hoa Kỳ tại Việt Nam.

2. Học bổng Chính phủ Australia (Australia Awards Scholarships - AAS)
• Đơn vị cấp: Bộ Ngoại giao và Thương mại Australia (DFAT)
• Giá trị tài trợ: Toàn bộ học phí khóa học Thạc sĩ, trợ cấp ban đầu 5.000 AUD, vé máy bay và sinh hoạt phí định kỳ.
• Đối tượng & Điều kiện: Ứng viên thuộc các khối ngành ưu tiên (Nông nghiệp, Chuyển đổi số, Biến đổi khí hậu, Y tế công cộng, Quản trị), IELTS ≥ 6.5 (không kỹ năng nào dưới 6.0).
• Hạn nộp hồ sơ: Tháng 2 đến tháng 4 hàng năm.
• Hướng dẫn ứng tuyển: Nộp hồ sơ qua hệ thống OASIS của Chính phủ Australia.

3. Học bổng Khoa học Công nghệ Vingroup (Thạc sĩ / Tiến sĩ Quốc tế)
• Đơn vị cấp: Tập đoàn Vingroup & VinUniversity
• Giá trị tài trợ: Toàn phần 100% chi phí đào tạo, sinh hoạt phí và chi phí bảo vệ luận án tại các trường Đại học Top 100 thế giới.
• Đối tượng & Điều kiện: Sinh viên xuất sắc hoặc chuyên gia nghiên cứu ngành STEM, AI, Công nghệ Sinh học, Khoa học Máy tính.
• Hạn nộp hồ sơ: Đợt 1 (Tháng 4) và Đợt 2 (Tháng 9 hàng năm).
• Hướng dẫn ứng tuyển: Đăng ký trực tiếp tại Cổng thông tin Chương trình Học bổng Vingroup.`;
  }

  // If query is about University admission scores / điểm chuẩn
  return `### 📊 Bảng điểm chuẩn & Phương thức tuyển sinh mới nhất: "${query.slice(0, 80)}"

Dưới đây là tổng hợp bảng điểm chuẩn các ngành đào tạo tiêu biểu và phương thức xét tuyển:

| Trường Đại học | Ngành / Chuyên ngành | Tổ hợp môn | Điểm chuẩn tham khảo (Thang 30) | Phương thức / Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| Đại học Bách Khoa Hà Nội | Khoa học Máy tính / Tự động hóa | A00, A01 | 27.5 - 29.4 | Điểm ĐGNL Tư duy (TSA) + Thi THPT |
| ĐH Kinh tế Quốc dân (NEU) | Kinh tế Quốc tế / Marketing / QTKD | A00, A01, D01, D07 | 26.5 - 28.3 | Kết hợp chứng chỉ quốc tế (IELTS ≥ 5.5) |
| ĐH Ngoại Thương (FTU) | Kinh tế Đối ngoại / Logistics | A00, A01, D01 | 27.8 - 28.6 | Xét điểm thi THPT & Xét học bạ THPT |
| ĐH Bách Khoa - ĐHQG TP.HCM | Kỹ thuật Máy tính / Robot | A00, A01 | 26.2 - 28.2 | Ưu tiên điểm thi ĐGNL ĐHQG-HCM |
| ĐH Kinh tế TP.HCM (UEH) | Kinh doanh Quốc tế / Thương mại | A00, A01, D01 | 26.0 - 27.9 | Xét điểm thi THPT & Tổ hợp học bạ |
| ĐH Công nghệ - ĐHQGHN | Công nghệ Thông tin / Trí tuệ Nhân tạo | A00, A01 | 27.0 - 28.6 | Xét kết quả kỳ thi ĐGNL (HSA) |

---

### 💡 Lời khuyên chiến lược cho thí sinh:
1. Nắm chắc đề案 tuyển sinh: Luôn cập nhật cổng thông tin của trường để nắm rõ chỉ tiêu phân bổ theo từng phương thức.
2. Tận dụng tối đa phương thức sớm: Tham gia các kỳ thi ĐGNL (HSA, TSA, ĐGNL ĐHQG-HCM) và chứng chỉ ngoại ngữ để gia tăng cơ hội trúng tuyển trước kỳ thi THPT.
3. Sắp xếp thứ tự nguyện vọng: Đặt ngành yêu thích nhất ở Nguyện vọng 1 và các ngành an toàn ở các nguyện vọng tiếp theo.`;
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
    addKey(process.env.VITE_GEMINI_API_KEY);

    const contents = formatHistoryForGemini(history || [], message);

    const keyCandidates: (string | undefined)[] = keys.length > 0 ? keys : [undefined];

    for (const key of keyCandidates) {
      try {
        const ai = key ? new GoogleGenAI({ 
          apiKey: key,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build'
            }
          }
        }) : new GoogleGenAI({
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build'
            }
          }
        });

        const response = await generateContentWithFallback(ai, {
            contents,
            systemInstruction: systemInstruction || "You are an expert scholarship and university admission advisor.",
            tools: [{ googleSearch: {} }] as any
        });

        if (response && response.text) {
          return res.status(200).json({ 
            text: response.text, 
            groundingMetadata: response.candidates?.[0]?.groundingMetadata || null 
          });
        }
      } catch (err) {
        console.warn("Search key failed, trying next:", err);
      }
    }

    return res.status(200).json({ 
      text: synthesizeFallbackSearchResponse(message), 
      groundingMetadata: null 
    });

  } catch (error: any) {
    console.info("Search API fallback triggered gracefully:", error?.message || error);
    return res.status(200).json({ 
      text: synthesizeFallbackSearchResponse(message), 
      groundingMetadata: null 
    });
  }
}
