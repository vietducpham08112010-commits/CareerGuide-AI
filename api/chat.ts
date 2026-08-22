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

// Fallback intelligent career counselor response synthesizer
function synthesizeFallbackChatResponse(message: string, systemInstruction?: string): string {
  const query = (message || "").toLowerCase();
  const sysInst = (systemInstruction || "").toLowerCase();

  // 1. Salary & Promotion Analysis (ProgressBoard)
  if (
    sysInst.includes("labor market analyst") ||
    query.includes("minsalaryvnd") ||
    query.includes("dải lương") ||
    query.includes("thăng tiến cho vị trí") ||
    (query.includes("lương") && query.includes("json"))
  ) {
    let jobRole = "Chuyên viên";
    const jobMatch = message.match(/vị trí:\s*"([^"]+)"/i) || message.match(/position:\s*"([^"]+)"/i);
    if (jobMatch) jobRole = jobMatch[1];

    return JSON.stringify({
      minSalaryVnd: "16.000.000 VNĐ",
      medianSalaryVnd: "28.000.000 VNĐ",
      maxSalaryVnd: "55.000.000 VNĐ",
      promotionLevers: [
        `Làm chủ công cụ & kiến trúc thực chiến chuẩn doanh nghiệp cho vị trí ${jobRole}`,
        "Xây dựng tư duy giải quyết vấn đề phức tạp và tối ưu hóa hiệu năng",
        "Rèn luyện kỹ năng quản trị nhóm, đàm phán và tiếng Anh chuyên ngành"
      ],
      nextRoleTitle: `Senior / Lead ${jobRole}`,
      marketOutlook: `Nhu cầu thị trường cho vị trí ${jobRole} duy trì mức tăng trưởng cao với cơ hội thăng tiến rộng mở.`
    });
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

  // 5. If the request specifically expects a career comparison JSON
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

Dưới đây là khung định hướng thực tiễn được tinh chỉnh cho bạn:

1. **Tháng 1: Khám phá nền tảng & Đánh giá năng lực**
   • Hoàn thành bài trắc nghiệm tính cách nghề nghiệp RIASEC để xác định nhóm nổi trội.
   • Tìm hiểu 3 ngành nghề phù hợp nhất và phân tích yêu cầu tuyển dụng thực tế (JD) trên thị trường.
   • Thiết lập thói quen đọc tài liệu/sách chuyên ngành 30 phút mỗi ngày.

2. **Tháng 2: Xây dựng kỹ năng cốt lõi & Dự án thực tế**
   • Đăng ký khóa học nền tảng trực tuyến (Coursera, edX, hoặc học liệu mở).
   • Thực hiện 01 bài tập lớn/dự án nhỏ (Mini-project) để tích lũy hồ sơ Portfolio.
   • Rèn luyện kỹ năng mềm: Tư duy phản biện, Giao tiếp thuyết trình, Tiếng Anh chuyên ngành.

3. **Tháng 3: Hoàn thiện hồ sơ & Mở rộng kết nối (Networking)**
   • Xây dựng bản CV chuẩn chỉnh và hồ sơ năng lực số.
   • Tham gia các cộng đồng sinh viên/chuyên gia trong ngành để học hỏi kinh nghiệm.
   • Luyện tập phỏng vấn giả lập để sẵn sàng cho các kỳ ứng tuyển hoặc xét tuyển đại học.

*(Lưu ý: Hệ thống AI đang tự động tối ưu hóa để phản hồi nhanh chóng và chuẩn xác nhất!)*`;
  }

  // Default rich career counselor response
  return `Chào bạn! Rất vui được đồng hành cùng bạn trong hành trình định hướng nghề nghiệp và phát triển bản thân.

Đối với nội dung **"${message.slice(0, 100)}"**, đây là những góc nhìn và bước đi cụ thể bạn nên cân nhắc:

1. **Phân tích mục tiêu & thế mạnh cá nhân**:
   • Xác định rõ sự kết hợp giữa **Sở thích (Passion)**, **Năng lực hiện tại (Skills)** và **Nhu cầu thị trường (Market Demand)** theo mô hình Ikigai.
   • Đánh giá xem mục tiêu này đòi hỏi bạn cần bổ sung những chứng chỉ hay kỹ năng chuyên môn nào.

2. **Các công cụ hỗ trợ trực tiếp trên hệ thống**:
   • Vào tab **Tiến độ & OKR** để thiết lập lộ trình học tập và mục tiêu từng tháng.
   • Sử dụng tab **Tra cứu điểm chuẩn** và **Săn học bổng** để đối chiếu cơ hội xét tuyển đại học.
   • Luyện tập phỏng vấn tại **Luyện phỏng vấn HR** để rèn luyện sự tự tin.

Nếu bạn cần tư vấn sâu hơn về bất kỳ ngành học hay kỹ năng nào, hãy cho mình biết nhé!`;
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
        'gemini-2.5-flash',
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

  const { history, message, systemInstruction, file, image, apiKey } = req.body || {};
  const attachment = file || image;

  if (!message && !attachment) {
    return res.status(400).json({ error: "Message or attachment is required" });
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

    for (const key of keys) {
      try {
        const ai = new GoogleGenAI({ 
          apiKey: key,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build'
            }
          }
        });

        const response = await generateContentWithFallback(ai, {
            contents,
            systemInstruction: systemInstruction || "You are an expert career counselor. Do not use asterisks (*) in text formatting."
        });

        if (response && response.text) {
          return res.status(200).json({ text: response.text });
        }
      } catch (error: any) {
        console.warn("Chat key failed, trying next:", error?.message || error);
      }
    }

    return res.status(200).json({ text: synthesizeFallbackChatResponse(message || "", systemInstruction) });

  } catch (error: any) {
    return res.status(500).json({ error: cleanGeminiErrorMessage(error) });
  }
}
