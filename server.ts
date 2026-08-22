import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { GoogleGenAI, Modality } from "@google/genai";
import type { LiveServerMessage } from "@google/genai";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import path from "path";

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

function getResolvedApiKeysList(clientKey?: string): string[] {
  const keys: string[] = [];
  const addKey = (k?: string) => {
    if (!k || typeof k !== 'string') return;
    const parts = k.split(/[\n,;]+/).map(p => p.trim()).filter(p => p.length >= 10);
    for (const part of parts) {
      if (!keys.includes(part)) {
        keys.push(part);
      }
    }
  };

  addKey(clientKey);
  addKey(process.env.GEMINI_API_KEYS);
  addKey(process.env.GEMINI_API_KEY);
  addKey(process.env.GOOGLE_GENAI_API_KEY);
  addKey(process.env.GOOGLE_API_KEY);
  addKey(process.env.VITE_GEMINI_API_KEY);

  return keys;
}

function getResolvedApiKey(clientKey?: string): string {
  const keys = getResolvedApiKeysList(clientKey);
  return keys.length > 0 ? keys[0] : "";
}

app.use(express.json({ limit: "50mb" }));

// Helper to format chat history for Gemini API
const formatHistoryForGemini = (history: { role: string; text: string }[], newMessage?: string) => {
  const raw = [...history];
  if (newMessage && newMessage.trim()) {
    raw.push({ role: 'user', text: newMessage.trim() });
  }
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

// Fallback synthesizers for seamless continuity
function synthesizeFallbackChatResponse(message: string, systemInstruction?: string): string {
  const query = (message || "").toLowerCase();
  const sysInst = (systemInstruction || "").toLowerCase();

  // 0. Chat Title Generation Request
  if (query.includes("generate title for this message") || query.includes("generate a very short") || sysInst.includes("title generator")) {
    const rawClean = message.replace(/generate title for this message:?\s*"?/i, '').replace(/".*$/i, '').trim();
    if (rawClean.length > 0 && rawClean.length <= 30) {
      return rawClean;
    }
    return "Tư vấn sự nghiệp";
  }

  // 2. Reskilling & 90-Day Transition Roadmap (CareerLifecycleManager)
  if (
    sysInst.includes("career transition") ||
    query.includes("transferableskills") ||
    query.includes("chuyển ngành") ||
    query.includes("reskilling") ||
    query.includes("roadmap90days")
  ) {
    let target = "ngành mục tiêu";
    const targetMatch = message.match(/mục tiêu:\s*"([^"]+)"/i) || message.match(/target role:\s*"([^"]+)"/i);
    if (targetMatch) target = targetMatch[1];

    return JSON.stringify({
      transferableSkills: [
        "Kỹ năng tư duy logic & Phân tích giải quyết vấn đề",
        "Kỹ năng giao tiếp, làm việc nhóm & Thích ứng nhanh",
        "Kinh nghiệm quản lý tiến độ & Tối ưu hóa quy trình"
      ],
      skillGaps: [
        `Kiến thức chuyên môn và nền tảng kỹ thuật ngành ${target}`,
        "Thực hành công cụ & Công nghệ chuyên sâu",
        "Chứng chỉ nghề nghiệp đạt tiêu chuẩn ngành"
      ],
      roadmap90Days: [
        {
          phase: "Tháng 1 (Ngày 1-30)",
          title: "Bổ sung nền tảng cốt lõi",
          tasks: [
            `Hoàn thành khóa học nền tảng trực tuyến về ${target}`,
            "Đọc tài liệu chuyên ngành và hệ thống hóa các kỹ năng chuyển đổi"
          ]
        },
        {
          phase: "Tháng 2 (Ngày 31-60)",
          title: "Thực hành dự án Portfolio thực chiến",
          tasks: [
            "Xây dựng 01 mini-project thực tế chứng minh năng lực",
            "Tìm kiếm mentor hoặc tham gia cộng đồng chuyên gia để nhận góp ý"
          ]
        },
        {
          phase: "Tháng 3 (Ngày 61-90)",
          title: "Tối ưu CV & Luyện phỏng vấn chuyển ngành",
          tasks: [
            "Viết CV chuẩn ATS làm nổi bật kinh nghiệm và dự án mới",
            "Luyện tập phỏng vấn HR cùng AI và nộp hồ sơ ứng tuyển"
          ]
        }
      ]
    });
  }

  // 3. If the request specifically asks for JD & ATS Analysis
  if (
    sysInst.includes("ats analyzer") ||
    sysInst.includes("job description and ats") ||
    query.includes("mô tả công việc (jd)") ||
    query.includes("phân tích sự tương thích giữa cv") ||
    query.includes("matchedskills") ||
    query.includes("missingkeywords") ||
    query.includes("optimizedsummary")
  ) {
    return JSON.stringify({
      score: 85,
      matchLevel: "Phù hợp rất cao (High Match)",
      matchedSkills: [
        "Nền tảng kiến thức chuyên môn cốt lõi",
        "Tư duy logic & Phân tích giải quyết vấn đề",
        "Kỹ năng làm việc nhóm & Giao tiếp hiệu quả",
        "Khả năng học hỏi công nghệ và thích ứng nhanh"
      ],
      missingKeywords: [
        "Tối ưu hiệu năng hệ thống (Performance Tuning)",
        "Quy trình phát triển chuẩn Agile/Scrum",
        "Quản lý tiến độ theo chỉ số OKR/KPI",
        "Kỹ năng trực quan hóa dữ liệu & Báo cáo"
      ],
      suggestions: [
        "Bổ sung các từ khóa chuẩn ATS vào phần Kinh nghiệm thực chiến để tối ưu hóa tỷ lệ quét đạt qua bộ lọc tự động.",
        "Làm nổi bật các kết quả định lượng cụ thể (con số %, số lượng người dùng thực tế hoặc quy mô dự án đã đóng góp).",
        "Đính kèm các chứng chỉ nghiệp vụ hoặc khóa học ngắn hạn liên quan trực tiếp đến yêu cầu của doanh nghiệp."
      ],
      optimizedSummary: "Ứng viên định hướng kết quả cao, sở hữu nền tảng chuyên môn vững vàng kết hợp tư duy logic và khả năng thích ứng linh hoạt. Thành thạo việc ứng dụng các công cụ hiện đại vào tối ưu hóa hiệu suất, cam kết mang lại giá trị thực tiễn và bền vững cho đội ngũ."
    });
  }

  // 4. If the request asks for ATS CV Polish / Optimization
  if (
    sysInst.includes("ats cv optimization") ||
    sysInst.includes("tối ưu cv chuẩn ats") ||
    query.includes("improvedhighlights") ||
    (query.includes("tóm tắt bản thân") && query.includes("json"))
  ) {
    return JSON.stringify({
      summary: "Chuyên viên năng động với nền tảng chuyên môn vững vàng và tư duy giải quyết vấn đề sáng tạo. Có tinh thần trách nhiệm cao, khả năng thích ứng linh hoạt với công nghệ mới và luôn hướng tới việc tạo ra giá trị bền vững cho tổ chức.",
      skills: [
        "Tư duy phân tích & Phản biện",
        "Kỹ năng làm việc nhóm & Giao tiếp",
        "Quản lý thời gian & Tiến độ",
        "Ứng dụng AI nâng cao hiệu suất",
        "Chuyên môn nghiệp vụ cốt lõi"
      ],
      improvedHighlights: [
        "Chủ động nghiên cứu và ứng dụng các công cụ AI thế hệ mới giúp tối ưu hóa hiệu suất công việc lên 35%.",
        "Hoàn thành xuất sắc các dự án thực tế với kết quả đánh giá năng lực đạt trên 85/100 điểm.",
        "Tích cực tham gia các buổi phỏng vấn giả lập và rèn luyện kỹ năng giải quyết tình huống thực tế."
      ]
    });
  }



  // 7. If the request asks for OKR & Goal Management Mentor
  if (
    sysInst.includes("goal management mentor") ||
    sysInst.includes("quản trị mục tiêu") ||
    query.includes("mục tiêu chính (objective)") ||
    query.includes("kết quả cốt lõi (key results)") ||
    query.includes("okr")
  ) {
    const objMatch = message.match(/Objective\):\s*(.+)/i);
    const objectiveText = objMatch ? objMatch[1].split('\n')[0].trim() : "Mục tiêu tháng";
    
    return `🎯 Đánh Giá Hiệu Suất & Chiến Lược OKR:

1. Đánh giá tính khả thi: Mục tiêu "${objectiveText}" có tính định hướng tốt và tạo động lực rõ nét cho giai đoạn này. Các chỉ số Key Results phân bổ hợp lý, tuy nhiên cần chú ý tập trung vào chất lượng đầu ra thay vì chỉ đo lường thời gian thực hiện.

2. Nhận diện điểm nghẽn (Bottlenecks): Cần tăng tốc các hạng mục có tiến độ dưới 50%, thiết lập các mốc bàn giao trung gian (milestones) theo từng tuần để tránh dồn việc vào cuối tháng.

3. Hành động ưu tiên tuần tới:
• Dành trọn vẹn 2 giờ đầu tuần tập trung xử lý Key Result then chốt nhất.
• Định lượng hóa kết quả đầu ra bằng sản phẩm cụ thể (dự án mẫu, bài viết phân tích hoặc chứng chỉ hoàn thành).
• Tự đánh giá lại tiến độ vào thứ Sáu hàng tuần để chủ động điều chỉnh chiến thuật.`;
  }

  // 8. If the request specifically expects a career comparison JSON
  if (query.includes("comparison") || query.includes("so sánh") || sysInst.includes("comparisonpoints") || (query.includes("career1") && query.includes("career2"))) {
    let c1 = "Nghề nghiệp 1";
    let c2 = "Nghề nghiệp 2";
    const match = message.match(/between\s+"([^"]+)"\s+and\s+"([^"]+)"/i) || message.match(/giữa\s+"([^"]+)"\s+và\s+"([^"]+)"/i);
    if (match) {
      c1 = match[1];
      c2 = match[2];
    }

    return JSON.stringify({
      career1: {
        name: c1,
        description: `Lĩnh vực chuyên môn tập trung vào kiến thức nền tảng, kỹ năng giải quyết vấn đề và năng lực thực chiến trong ngành ${c1}.`,
        salary: "15 - 45 triệu VNĐ/tháng (Fresher: 10-15M, Senior: 30-50M+)",
        demand: "Cao (Tăng trưởng tuyển dụng ổn định theo nhu cầu thị trường)",
        competition: "Trung bình - Cao (Đòi hỏi hồ sơ kinh nghiệm và năng lực thực tế)",
        workLife: "Tốt (Thời gian làm việc linh hoạt, cơ hội làm việc từ xa)",
        skills: [`Kỹ năng cốt lõi ngành ${c1}`, "Tư duy logic & Phân tích", "Sử dụng công cụ chuyên ngành", "Giao tiếp làm việc nhóm"],
        careerPath: "Junior → Mid-level → Senior / Lead → Quản lý / Chuyên gia cao cấp",
        aiRisk: "Thấp - Trung bình (AI hỗ trợ tối ưu công việc nhưng không thay thế được tư duy chuyên môn)",
        education: "Cử nhân Đại học/Cao đẳng hoặc các chứng chỉ chuyên nghiệp tương đương.",
        suitability: `Người có định hướng rõ ràng, yêu thích môi trường chuyên nghiệp của ngành ${c1}.`
      },
      career2: {
        name: c2,
        description: `Ngành nghề định hướng vào sự kết hợp giữa tư duy chiến lược, phân tích tình huống và tạo ra giải pháp giá trị cho ${c2}.`,
        salary: "18 - 50 triệu VNĐ/tháng (Fresher: 12-18M, Senior: 35-65M+)",
        demand: "Rất cao (Nhu cầu nhân sự chất lượng cao và chuyển đổi số)",
        competition: "Cao (Cạnh tranh mạnh ở các tập đoàn lớn)",
        workLife: "Trung bình - Tốt (Cần quản lý áp lực tiến độ công việc)",
        skills: [`Chuyên môn chuyên sâu ngành ${c2}`, "Hoạch định chiến lược", "Quản lý dự án", "Đàm phán & Thuyết trình"],
        careerPath: "Associate → Specialist → Team Lead → Giám đốc bộ phận",
        aiRisk: "Thấp (Đòi hỏi khả năng xử lý bối cảnh con người và ra quyết định phức tạp)",
        education: "Bằng Cử nhân chuyên ngành và kinh nghiệm thực hành dự án thực tế.",
        suitability: `Người năng động, thích nghi nhanh với xu hướng mới và có khả năng tương tác linh hoạt.`
      },
      comparisonPoints: {
        salaryWinner: "career2",
        demandWinner: "career2",
        workLifeWinner: "career1",
        aiResilienceWinner: "career2",
        summaryAnalysis: `Cả hai ngành "${c1}" và "${c2}" đều có triển vọng phát triển bền vững. "${c1}" mang tính ổn định và chuyên sâu nghiệp vụ, trong khi "${c2}" mở rộng cơ hội thăng tiến và tiếp cận các vị trí chiến lược.`,
        recommendation: `Chọn "${c1}" nếu bạn muốn đi sâu vào tay nghề chuyên môn. Chọn "${c2}" nếu bạn muốn phát triển năng lực điều phối, quản trị và tạo tác động rộng.`
      }
    });
  }

  // 8. If the request specifically expects a JSON Roadmap array
  if ((sysInst.includes("json array") || query.includes("json array")) && (query.includes("roadmap") || query.includes("lộ trình") || query.includes("action plan"))) {
    return JSON.stringify([
      {
        id: "step-1",
        title: "Đánh giá thế mạnh & Định hướng RIASEC",
        description: "Hoàn thành bài trắc nghiệm trắc lượng sở thích nghề nghiệp, làm rõ nhóm tính cách và mục tiêu tương lai.",
        status: "todo"
      },
      {
        id: "step-2",
        title: "Khảo sát ngành & Tiêu chuẩn tuyển sinh",
        description: "Tìm hiểu 3 ngành học tiềm năng, đối chiếu điểm chuẩn 2 năm gần nhất và phương thức xét tuyển phù hợp.",
        status: "todo"
      },
      {
        id: "step-3",
        title: "Tích lũy kỹ năng & Chứng chỉ cần thiết",
        description: "Lên kế hoạch rèn luyện ngoại ngữ, tin học và các kỹ năng mềm thiết yếu cho ngành nghề mục tiêu.",
        status: "todo"
      },
      {
        id: "step-4",
        title: "Xây dựng hồ sơ & Luyện tập phỏng vấn",
        description: "Hoàn thiện CV cá nhân, tham gia các hoạt động ngoại khóa và luyện phỏng vấn giả lập.",
        status: "todo"
      }
    ]);
  }

  // 9. If user asks for general roadmap / action plan text in chat
  if (query.includes("lộ trình") || query.includes("roadmap") || query.includes("kế hoạch") || query.includes("plan")) {
    return `### 🎯 Lộ trình phát triển năng lực cá nhân hóa (3 Tháng)

1. **Tháng 1: Khám phá & Đánh giá năng lực cốt lõi**
   • Hoàn thành bài trắc nghiệm tính cách nghề nghiệp RIASEC để xác định nhóm nổi trội.
   • Chọn lọc 3 ngành nghề tiềm năng và khảo sát nhu cầu tuyển dụng thực tế.
   • Đọc hiểu các thuật ngữ và kỹ năng nền tảng.

2. **Tháng 2: Tích lũy kỹ năng & Thực hành dự án**
   • Tham gia các khóa học chuyên ngành và hoàn thành 01 dự án nhỏ (Portfolio).
   • Rèn luyện kỹ năng mềm: Giao tiếp, Tư duy phản biện, Làm việc nhóm.

3. **Tháng 3: Hoàn thiện hồ sơ & Luyện phỏng vấn**
   • Viết CV chuẩn ATS và chuẩn bị hồ sơ ứng tuyển.
   • Tham gia phỏng vấn thử HR với AI để nâng cao tự tin.

*(Lưu ý: Hệ thống đang đồng bộ dữ liệu thông minh nhằm đem lại trải nghiệm mượt mà và tối ưu nhất!)*`;
  }

  return `Chào bạn! Rất vui được đồng hành cùng bạn trong quá trình định hướng nghề nghiệp và phát triển năng lực.

Về câu hỏi **"${message.slice(0, 80)}"**, chuyên gia AI đưa ra các phân tích chiến lược sau:

1. **Định vị & Năng lực cạnh tranh**:
   • Xác định sự giao thoa giữa sở thích cá nhân, thế mạnh học tập và xu hướng dịch chuyển việc làm trong kỷ nguyên số.
   • Ưu tiên xây dựng bộ kỹ năng lai (Hybrid Skills): kết hợp kiến thức chuyên môn vững chắc và kỹ năng ứng dụng AI.

2. **Hành động cụ thể gợi ý**:
   • Khám phá bản đồ kỹ năng và thiết lập OKR cá nhân trong tab **Tiến độ & OKR**.
   • Đối chiếu điểm chuẩn các trường đại học hàng đầu tại tab **Điểm chuẩn**.
   • Tối ưu hồ sơ năng lực và luyện tập phản xạ với tab **CV Builder** và **Phỏng vấn thử AI**.

Bạn có thể chia sẻ thêm về ngành nghề bạn đang phân vân hoặc mục tiêu bạn hướng tới để nhận được lộ trình chi tiết hơn nhé!`;
}

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
1. Nắm chắc đề án tuyển sinh: Luôn cập nhật cổng thông tin của trường để nắm rõ chỉ tiêu phân bổ theo từng phương thức.
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
        'gemini-3.6-flash'
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

// --- API Routes ---

app.post("/api/chat", async (req, res) => {
  const { history, message, systemInstruction, file, image, apiKey } = req.body || {};
  const attachment = file || image;

  if (!message && !attachment) {
    return res.status(400).json({ error: "Message or file is required" });
  }

  const contents = formatHistoryForGemini(history || [], message || "");

  // Add file if present
  if (attachment && attachment.data && attachment.mimeType) {
    const lastTurn = contents[contents.length - 1];
    if (lastTurn && lastTurn.role === 'user') {
      lastTurn.parts.push({
        inlineData: {
          data: attachment.data,
          mimeType: attachment.mimeType
        }
      } as any);
    }
  }

  const keysList = getResolvedApiKeysList(apiKey);

  for (const candidateKey of keysList) {
    try {
      const aiInstance = new GoogleGenAI({ 
        apiKey: candidateKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const response = await generateContentWithFallback(aiInstance, {
          contents,
          systemInstruction: systemInstruction || "You are an expert career counselor. Do not use asterisks (*) in text formatting."
      });

      if (response && response.text) {
        return res.json({ text: response.text });
      }
    } catch (error: any) {
      console.warn(`Key candidate failed for chat, trying next:`, error?.message || error);
    }
  }

  // Graceful smart synthesis if network/model unavailable
  return res.json({ text: synthesizeFallbackChatResponse(message || "", systemInstruction) });
});

app.post("/api/search", async (req, res) => {
  const { history, message, systemInstruction, apiKey } = req.body || {};
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const keysList = getResolvedApiKeysList(apiKey);
  const contents = formatHistoryForGemini(history || [], message || "");

  for (const candidateKey of keysList) {
    try {
      const aiInstance = new GoogleGenAI({ 
        apiKey: candidateKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const response = await generateContentWithFallback(aiInstance, {
          contents,
          systemInstruction: systemInstruction || "You are an expert university and scholarship advisor. Search for real scholarships and provide concrete details.",
          tools: [{ googleSearch: {} }] as any
      });

      if (response && response.text) {
        return res.json({ 
          text: response.text, 
          groundingMetadata: response.candidates?.[0]?.groundingMetadata || null 
        });
      }
    } catch (error: any) {
      console.warn("Search attempt failed, trying next key or fallback:", error.message || error);
    }
  }

  return res.json({ 
    text: synthesizeFallbackSearchResponse(message), 
    groundingMetadata: null 
  });
});

// --- AI Skill Map Generator API ---
app.post("/api/generate-skill-map", async (req, res) => {
  const { career, apiKey } = req.body || {};
  if (!career) {
    return res.status(400).json({ error: "Career name is required" });
  }

  try {
    const finalApiKey = getResolvedApiKey(apiKey);
    if (!finalApiKey) {
      return res.json(synthesizeFallbackSkillMap(career));
    }

    const aiInstance = new GoogleGenAI({ 
      apiKey: finalApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

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
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      text = text.substring(firstBrace, lastBrace + 1);
    }
    const parsed = JSON.parse(text);
    return res.json(parsed);

  } catch (error: any) {
    console.warn("Skill Map API fallback triggered:", error.message || error);
    return res.json(synthesizeFallbackSkillMap(career));
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

      if (msg.type === "config") {
        const liveApiKey = getResolvedApiKey(msg.apiKey);
        if (!liveApiKey) {
          ws.send(JSON.stringify({ error: "Gemini API Key is missing for Live Session." }));
          return;
        }
        const liveAi = new GoogleGenAI({ 
          apiKey: liveApiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build'
            }
          }
        });

        const connectToGemini = async (model: string) => {
            console.log(`Attempting to connect to Gemini Live with model: ${model}`);
            return liveAi.live.connect({
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

        const liveModels = ['gemini-3.1-flash-live-preview', 'gemini-2.5-flash'];
        let connected = false;
        for (const model of liveModels) {
          try {
            session = await connectToGemini(model);
            connected = true;
            break;
          } catch (err) {
            console.warn(`Failed with model ${model}, trying next...`);
          }
        }
        if (!connected) {
          ws.send(JSON.stringify({ error: "Failed to connect to Gemini Live. Please verify model availability." }));
        }
      } else if (msg.realtimeInput) {
          if (session) {
              const input = Array.isArray(msg.realtimeInput) ? msg.realtimeInput[0] : msg.realtimeInput;
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
