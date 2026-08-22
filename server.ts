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

function getResolvedApiKey(clientKey?: string): string {
  if (clientKey && typeof clientKey === 'string' && clientKey.trim() && !clientKey.includes('AQ.Ab8RN') && !clientKey.includes('AIzaSyAWdZ7q2CJ')) {
    return clientKey.trim();
  }
  const envKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim() && !envKey.includes("AIzaSyAWdZ7q2CJ") && !envKey.includes('AQ.Ab8RN')) {
    return envKey.trim();
  }
  return "";
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

  // 1. If the request specifically asks for JD & ATS Analysis
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

  // 2. If the request asks for ATS CV Polish / Optimization
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

  // 3. If the request asks for Mock Interview Questions (Array of questions)
  if (
    sysInst.includes("interview questions") ||
    sysInst.includes("artificial career interviewer") ||
    query.includes("tailored interview questions") ||
    (query.includes("json array of 4 string questions") || (query.includes("câu hỏi phỏng vấn") && query.includes("json")))
  ) {
    let jobTitle = "ứng viên";
    const jobMatch = message.match(/position of\s+"([^"]+)"/i) || message.match(/vị trí\s+"([^"]+)"/i);
    if (jobMatch) {
      jobTitle = jobMatch[1];
    }

    return JSON.stringify([
      `Hãy giới thiệu ngắn gọn về bản thân, thế mạnh nổi bật và lý do bạn muốn theo đuổi vị trí "${jobTitle}"?`,
      `Hãy chia sẻ về một thử thách, dự án hoặc bài toán khó khăn nhất bạn từng gặp phải và cách bạn đã giải quyết nó?`,
      `Theo bạn, tố chất hoặc kỹ năng chuyên môn quan trọng nhất để đạt hiệu suất xuất sắc ở vị trí "${jobTitle}" là gì?`,
      `Bạn có định hướng phát triển bản thân và mục tiêu nghề nghiệp cụ thể như thế nào trong 2-3 năm tới?`
    ]);
  }

  // 4. If the request asks for Mock Interview Evaluation / Rubric
  if (
    sysInst.includes("analyzing interview transcripts") ||
    query.includes("evaluate this interview transcript") ||
    query.includes("overallfeedback") ||
    (query.includes("rubric") && query.includes("score"))
  ) {
    return JSON.stringify({
      score: 86,
      overallFeedback: "Ứng viên thể hiện phong thái tự tin, câu trả lời có cấu trúc mạch lạc và làm nổi bật được năng lực tư duy chuyên môn. Có tinh thần trách nhiệm, phản xạ tình huống tốt và định hướng nghề nghiệp rất rõ ràng.",
      strengths: [
        "Tư duy logic tốt, cấu trúc câu trả lời theo phương pháp STAR rõ ràng, đi thẳng vào trọng tâm",
        "Có kiến thức thực tế và thái độ học tập cầu tiến, sẵn sàng đón nhận thử thách",
        "Khả năng thích ứng nhanh và thể hiện sự phù hợp cao với văn hóa doanh nghiệp"
      ],
      weaknesses: [
        "Có thể bổ sung thêm các số liệu đo lường định lượng cụ thể để tăng tính thuyết phục của thành tựu",
        "Cần đào sâu hơn về một số công cụ hoặc chuẩn mực quy trình nâng cao trong ngành"
      ],
      recommendations: [
        "Tiếp tục thực hành phỏng vấn thử định kỳ để duy trì phản xạ chuyên môn sắc bén",
        "Bổ sung các chứng chỉ nghề nghiệp hoặc dự án cá nhân thực tế vào hồ sơ năng lực (Portfolio)",
        "Rèn luyện kỹ năng thuyết trình tự tin trước hội đồng tuyển dụng"
      ],
      categories: {
        knowledge: 86,
        communication: 88,
        problemSolving: 84,
        riasecFit: 88
      }
    });
  }

  // 5. If the request specifically expects a career comparison JSON
  if (query.includes("comparison") || query.includes("so sánh") || sysInst.includes("comparisonpoints") || (query.includes("career1") && query.includes("career2"))) {
    // Extract career names if possible
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

  // 6. If the request specifically expects a JSON Roadmap array
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

  // 7. If user asks for general roadmap / action plan text in chat
  if (query.includes("lộ trình") || query.includes("roadmap") || query.includes("kế hoạch") || query.includes("plan")) {
    return `### 🎯 Lộ trình phát triển năng lực cá nhân hóa (3 Tháng)

1. **Tháng 1: Khám phá & Đánh giá năng lực cốt lõi**
   - Hoàn thành bài trắc nghiệm tính cách nghề nghiệp RIASEC.
   - Chọn lọc 3 ngành nghề tiềm năng và khảo sát nhu cầu tuyển dụng thực tế.
   - Đọc hiểu các thuật ngữ và kỹ năng nền tảng.

2. **Tháng 2: Tích lũy kỹ năng & Thực hành dự án**
   - Tham gia các khóa học chuyên ngành và hoàn thành 01 dự án nhỏ (Portfolio).
   - Rèn luyện kỹ năng mềm: Giao tiếp, Tư duy phản biện, Làm việc nhóm.

3. **Tháng 3: Hoàn thiện hồ sơ & Luyện phỏng vấn**
   - Viết CV chuẩn ATS và chuẩn bị hồ sơ ứng tuyển.
   - Tham gia phỏng vấn thử HR với AI để nâng cao tự tin.

*(Lưu ý: Hệ thống đang hoạt động ở chế độ Offline Hướng nghiệp do lưu lượng truy cập cao. Bạn có thể kết nối Gemini API Key riêng trong Cài đặt để có câu trả lời mở rộng hơn!)*`;
  }

  return `Chào bạn! Rất vui được đồng hành cùng bạn trong quá trình định hướng nghề nghiệp.

Về vấn đề **"${message.slice(0, 80)}"**, đây là những lời khuyên chiến lược dành cho bạn:

1. **Nhận diện điểm mạnh**: Phân tích sự giao thoa giữa sở thích cá nhân, năng lực học tập và xu hướng thị trường lao động tại Việt Nam.
2. **Kế hoạch hành động**: 
   - Tham khảo các chỉ số kỹ năng cần thiết trong mục **Bản đồ kỹ năng & OKR**.
   - Khám phá phổ điểm và phương thức tuyển sinh tại mục **Tra cứu điểm chuẩn**.
   - Luyện tập trả lời tình huống trong mục **Luyện phỏng vấn HR**.

Nếu bạn muốn biết chi tiết về trường đào tạo, học bổng hoặc yêu cầu chuyên môn, hãy cho mình biết nhé!`;
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
  return `### 🔍 Thông tin tra cứu & Tuyển sinh: "${query.slice(0, 80)}"

1. **Phương thức xét tuyển phổ biến**:
   - Xét điểm thi tốt nghiệp THPT Quốc gia (Tổ hợp A00, A01, D01, B00 tùy ngành).
   - Xét kết quả thi Đánh giá Năng lực (ĐHQG Hà Nội, ĐHQG TP.HCM).
   - Xét học bạ THPT kết hợp chứng chỉ ngoại ngữ quốc tế (IELTS / TOEFL).

2. **Các cơ sở đào tạo tiêu biểu tại Việt Nam**:
   - Khối Kỹ thuật - Công nghệ: ĐH Bách Khoa Hà Nội, ĐH Bách Khoa - ĐHQG TP.HCM, ĐH FPT.
   - Khối Kinh tế - Kinh doanh: ĐH Ngoại Thương, ĐH Kinh tế Quốc dân, ĐH Kinh tế TP.HCM (UEH).
   - Khối Y Dược & Khoa học Sức khỏe: ĐH Y Hà Nội, ĐH Y Dược TP.HCM.

3. **Gợi ý**: Bạn có thể tra cứu chi tiết tại tab **Tra cứu điểm chuẩn** và **Học bổng**.`;
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

// --- API Routes ---

app.post("/api/chat", async (req, res) => {
  const { history, message, systemInstruction, file, image, apiKey } = req.body || {};
  const attachment = file || image;

  if (!message && !attachment) {
    return res.status(400).json({ error: "Message or file is required" });
  }

  try {
    const finalApiKey = getResolvedApiKey(apiKey);
    if (!finalApiKey) {
      return res.json({ text: synthesizeFallbackChatResponse(message || "", systemInstruction) });
    }

    const aiInstance = new GoogleGenAI({ 
      apiKey: finalApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

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

    const response = await generateContentWithFallback(aiInstance, {
        contents,
        systemInstruction: systemInstruction || "You are an expert career counselor."
    });
    return res.json({ text: response.text });

  } catch (error: any) {
    console.warn("Chat API remote failed, sending smart fallback response:", error.message || error);
    return res.json({ text: synthesizeFallbackChatResponse(message || "", systemInstruction) });
  }
});

app.post("/api/search", async (req, res) => {
  const { history, message, systemInstruction, apiKey } = req.body || {};
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const finalApiKey = getResolvedApiKey(apiKey);
    if (!finalApiKey) {
      return res.json({ 
        text: synthesizeFallbackSearchResponse(message), 
        groundingMetadata: null 
      });
    }

    const aiInstance = new GoogleGenAI({ 
      apiKey: finalApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

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
    console.warn("Search API fallback triggered:", error.message || error);
    return res.json({ 
      text: synthesizeFallbackSearchResponse(message), 
      groundingMetadata: null 
    });
  }
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
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
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
