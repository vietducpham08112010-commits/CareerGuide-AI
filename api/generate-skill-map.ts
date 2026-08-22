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

// Fallback synthesizer if all remote AI quotas are exhausted
function synthesizeFallbackSkillMap(career: string) {
  const cleanTitle = career.trim();
  const idBase = cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'career';
  const careerId = `ai-gen-${idBase}-${Math.random().toString(36).substring(2, 7)}`;

  return {
    id: careerId,
    title_vi: cleanTitle,
    title_en: `${cleanTitle} Specialist`,
    category: "Chuyên ngành định hướng / Career Focus",
    skills: [
      {
        id: `${idBase}-fundamentals`,
        name: `Kiến thức nền tảng & Tư duy ngành (${cleanTitle})`,
        level: "junior",
        description_vi: `Nắm vững các nguyên lý cơ bản, thuật ngữ chuyên ngành và phương pháp tư duy cần thiết cho nghề ${cleanTitle}.`,
        description_en: `Master the foundational principles, core terminology, and analytical mindset required for ${cleanTitle}.`
      },
      {
        id: `${idBase}-tools-basics`,
        name: `Công cụ & Quy trình tác nghiệp chuẩn`,
        level: "junior",
        description_vi: `Thành thạo các phần mềm, công cụ nhập môn và luồng làm việc thực tế hàng ngày trong ngành.`,
        description_en: `Proficient with entry-level tools, software suites, and standard operating procedures.`
      },
      {
        id: `${idBase}-data-analysis`,
        name: `Thu thập & Phân tích thông tin thực tế`,
        level: "junior",
        description_vi: `Khả năng tìm kiếm tài liệu, tổng hợp dữ liệu và đọc hiểu các báo cáo chuyên ngành.`,
        description_en: `Ability to gather documentation, synthesize metrics, and interpret industry reports.`
      },
      {
        id: `${idBase}-execution-mid`,
        name: `Triển khai dự án & Giải quyết vấn đề độc lập`,
        level: "mid",
        description_vi: `Tự chủ thực hiện các nhiệm vụ chuyên sâu, xử lý tình huống phát sinh và tối ưu hóa hiệu suất công việc.`,
        description_en: `Independently execute complex project tasks, troubleshoot issues, and optimize operational performance.`
      },
      {
        id: `${idBase}-collaboration`,
        name: `Phối hợp liên chức năng & Quản lý tiến độ`,
        level: "mid",
        description_vi: `Giao tiếp hiệu quả với đồng nghiệp, đối tác và quản lý tiến độ theo phương pháp hiện đại (Agile/Scrum).`,
        description_en: `Communicate seamlessly across cross-functional teams and manage milestone timelines effectively.`
      },
      {
        id: `${idBase}-quality-assurance`,
        name: `Kiểm định chất lượng & Đánh giá hiệu quả`,
        level: "mid",
        description_vi: `Thiết lập các tiêu chuẩn đánh giá kết quả, đo lường KPIs và bảo đảm độ chính xác chuyên môn.`,
        description_en: `Establish evaluation benchmarks, track KPIs, and ensure quality standards in deliverables.`
      },
      {
        id: `${idBase}-strategy-senior`,
        name: `Hoạch định chiến lược & Kiến trúc giải pháp`,
        level: "senior",
        description_vi: `Xây dựng tầm nhìn dài hạn, định hình kiến trúc/chiến lược tổng thể và dự báo xu hướng thị trường.`,
        description_en: `Formulate long-term strategy, architect high-impact solutions, and forecast industry trends.`
      },
      {
        id: `${idBase}-leadership`,
        name: `Lãnh đạo đội ngũ & Cố vấn chuyên môn (Mentorship)`,
        level: "senior",
        description_vi: `Dẫn dắt đội ngũ, đào tạo nhân sự kế cận và thúc đẩy văn hóa đổi mới sáng tạo trong tổ chức.`,
        description_en: `Lead high-performing teams, mentor juniors, and champion a culture of continuous innovation.`
      }
    ]
  };
}

async function generateContentWithFallback(
    aiInstance: GoogleGenAI,
    options: {
        contents: any;
        systemInstruction?: string;
    }
) {
    const modelsToTry = [
        'gemini-3.7-flash',
        'gemini-3.1-flash-lite',
        'gemini-flash-latest'
    ];

    let lastError: any = null;

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
        }
    }

    throw lastError || new Error("All model fallback attempts exhausted.");
}

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

  const { career, apiKey } = body || {};
  if (!career) {
    return res.status(400).json({ error: "Career name is required" });
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
    addKey(process.env.API_KEY);
    addKey(process.env.VITE_GEMINI_API_KEY);

    const keyCandidates: (string | undefined)[] = keys.length > 0 ? keys : [undefined];

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

    for (const candidateKey of keyCandidates) {
      try {
        const aiInstance = candidateKey ? new GoogleGenAI({ 
          apiKey: candidateKey,
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

        const response = await generateContentWithFallback(aiInstance, {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            systemInstruction
        });

        let text = response.text || "";
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace > firstBrace) {
          text = text.substring(firstBrace, lastBrace + 1);
        }
        
        const parsed = JSON.parse(text);
        return res.status(200).json(parsed);
      } catch (keyErr) {
        console.warn("Skill map generation failed for key, trying next:", keyErr);
      }
    }

    return res.status(200).json(synthesizeFallbackSkillMap(career));

  } catch (error: any) {
    console.info("Generate Skill Map AI graceful fallback:", error?.message || error);
    // Graceful fallback synthesis so the UI never crashes or breaks
    return res.status(200).json(synthesizeFallbackSkillMap(career));
  }
}
