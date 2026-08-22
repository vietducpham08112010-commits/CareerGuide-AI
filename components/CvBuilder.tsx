import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import * as Icons from 'lucide-react';
import { captureElementToCanvasDataUrl } from '../utils/exportUtils';
import { Language, Theme, UserProfile } from '../types';
import { requestAiContent, cleanMarkdownAsterisks } from '../services/geminiService';
import { getSubscriptionDetails, isFeatureUnlocked } from '../utils/subscriptionUtils';
import { LuxuryAiThinking } from './SkeletonLoader';

interface CvBuilderProps {
  language: Language;
  theme: Theme;
  user: UserProfile | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateToChat: () => void;
  onRequestUpgrade: (featureName: string) => void;
}

export interface CvData {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  summary: string;
  skills: string[];
  education: {
    school: string;
    degree: string;
    year: string;
    details: string;
  }[];
  experience: {
    title: string;
    company: string;
    period: string;
    highlights: string[];
  }[];
  projects: {
    name: string;
    tech: string;
    description: string;
  }[];
  certifications: string[];
  aiSources: {
    quizCode?: string;
    lifecyclePhase?: string;
    interviewScore?: number;
    milestonesCount?: number;
    trendingCareer?: string;
  };
}

export const CvBuilder: React.FC<CvBuilderProps> = ({
  language,
  theme,
  user,
  showToast,
  onNavigateToChat,
  onRequestUpgrade,
}) => {
  const isVi = language === Language.VI;
  const currentSub = getSubscriptionDetails(user?.subscription);
  const hasAiPolish = isFeatureUnlocked(user, 'cvReview');
  const hasJdAnalysis = isFeatureUnlocked(user, 'cvJdAnalysis');
  const isLockedForFree = !hasAiPolish;

  const [cvTheme, setCvTheme] = useState<'ats' | 'modern' | 'executive' | 'creative'>('ats');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'edit' | 'jd-match'>('preview');

  const cvCardRef = useRef<HTMLDivElement>(null);
  const [isExportingCv, setIsExportingCv] = useState(false);

  // Max Feature: JD Matching State
  const [jdText, setJdText] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [isJdLoading, setIsJdLoading] = useState(false);
  const [jdResult, setJdResult] = useState<{
    score: number;
    matchLevel: string;
    matchedSkills: string[];
    missingKeywords: string[];
    suggestions: string[];
    optimizedSummary?: string;
  } | null>(null);

  // Initial state pulled from local storage & user profile
  const [cvData, setCvData] = useState<CvData>(() => {
    let quizCode = '';
    try {
      const q = localStorage.getItem('career_quiz_result');
      if (q) quizCode = q;
    } catch (e) {}

    let milestonesCount = 0;
    try {
      const ms = localStorage.getItem('userMilestones');
      if (ms) {
        const parsed = JSON.parse(ms);
        milestonesCount = Array.isArray(parsed) ? parsed.filter((m: any) => m.completed).length : 0;
      }
    } catch (e) {}

    let interviewScore = 0;
    try {
      const mi = localStorage.getItem('latest_mock_interview_score');
      if (mi) interviewScore = parseInt(mi, 10) || 0;
    } catch (e) {}

    let trendingCareer = '';
    try {
      const tc = localStorage.getItem('selected_trending_career');
      if (tc) trendingCareer = tc;
    } catch (e) {}

    const defaultTitle = user?.careerGoal && user.careerGoal !== 'Undecided' 
      ? user.careerGoal 
      : (trendingCareer || (isVi ? 'Chuyên Viên Công Nghệ / Định Hướng AI' : 'AI & Tech Career Professional'));

    return {
      fullName: user?.name || (isVi ? 'Nguyễn Văn A' : 'Alex Johnson'),
      jobTitle: defaultTitle,
      email: user?.email || 'email@example.com',
      phone: '+84 987 654 321',
      location: 'Hà Nội, Việt Nam',
      website: 'github.com/my-profile',
      summary: isVi
        ? `Ứng viên nhiệt huyết với tư duy phân tích hệ thống sắc bén (Đạt Holland: ${quizCode || 'RIA'}). Tích cực hoàn thành ${milestonesCount} mốc kỹ năng thực tế và đạt ${interviewScore || 85}/100 điểm phỏng vấn thử AI. Sẵn sàng cống hiến cho vị trí ${defaultTitle}.`
        : `Results-driven candidate with sharp analytical skills (Holland Profile: ${quizCode || 'RIA'}). Completed ${milestonesCount} technical roadmap milestones and achieved ${interviewScore || 85}/100 in AI Mock Interviews. Seeking to contribute as a ${defaultTitle}.`,
      skills: [
        'Phân tích Yêu cầu & Dữ liệu',
        'Tư duy Giải quyết Bối cảnh AI (Prompt Engineering)',
        'Lập trình Ứng dụng & HTML/JS/Python',
        'Quản lý Dự án & Tiến độ',
        'Giao tiếp & Làm việc nhóm'
      ],
      education: [
        {
          school: isVi ? 'Đại học Bách Khoa / Công Nghệ' : 'State University of Technology',
          degree: isVi ? 'Cử nhân Công nghệ Thông tin / Kỹ thuật' : 'B.S. in Computer Science / Engineering',
          year: '2021 - 2025',
          details: isVi ? 'Đạt điểm rèn luyện Xuất sắc, tham gia các dự án đổi mới sáng tạo cùng AI.' : 'Excellence academic track, active in AI innovation projects.'
        }
      ],
      experience: [
        {
          title: isVi ? 'Thực tập sinh Phát triển & Phân tích Career AI' : 'Career AI & Junior Analytics Intern',
          company: 'Career Compass AI Platform',
          period: '2024 - Hiện tại',
          highlights: isVi ? [
            'Sử dụng công cụ AI Career Assistant xây dựng lộ trình học tập 3 tháng hoàn chỉnh.',
            'Thực hành 10+ buổi phỏng vấn thử đạt kết quả xuất sắc về phản xạ chuyên môn.',
            'Tích lũy các chứng chỉ kĩ năng mềm và hoàn thành các cột mốc thực hành.'
          ] : [
            'Utilized Career AI Assistant to engineer personalized 3-month skill roadmaps.',
            'Completed 10+ AI mock interview sessions with top-tier performance scores.',
            'Earned core competency badges through continuous milestone tracking.'
          ]
        }
      ],
      projects: [
        {
          name: isVi ? 'Hệ thống Định hướng Sự nghiệp Thông minh' : 'Smart Career Navigator System',
          tech: 'React, TypeScript, Gemini AI, Tailwind CSS',
          description: isVi 
            ? 'Xây dựng ứng dụng tư vấn lộ trình học tập, tích hợp trắc nghiệm Holland/MBTI và tổng hợp CV tự động.' 
            : 'Developed an AI-driven career guidance app integrating Holland/MBTI quizzes and automated CV generation.'
        }
      ],
      certifications: [
        isVi ? 'Chứng nhận Hoàn thành Lộ trình Kỹ năng AI Compass (2026)' : 'AI Compass Career Skill Pathway Certificate (2026)',
        isVi ? 'Chứng chỉ Tiếng Anh Giao tiếp & Chuyên ngành (IELTS 7.0 / TOEIC 850)' : 'Professional English Proficiency (IELTS 7.0 / TOEIC 850)'
      ],
      aiSources: {
        quizCode,
        interviewScore,
        milestonesCount,
        trendingCareer
      }
    };
  });

  // Re-sync CV Data with user profile changes
  useEffect(() => {
    if (user) {
      setCvData(prev => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email,
        jobTitle: user.careerGoal && user.careerGoal !== 'Undecided' ? user.careerGoal : prev.jobTitle
      }));
    }
  }, [user]);

  // Helper to safely parse JSON from AI outputs even if markdown or conversational wrapper is present
  const extractSafeJson = <T,>(rawText: string, fallback: T): T => {
    if (!rawText || typeof rawText !== 'string') return fallback;
    let clean = rawText.trim();
    clean = clean.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    try {
      return JSON.parse(clean);
    } catch (e) {}

    // Try finding JSON object {...}
    const startObj = clean.indexOf('{');
    const endObj = clean.lastIndexOf('}');
    if (startObj !== -1 && endObj !== -1 && endObj > startObj) {
      try {
        return JSON.parse(clean.substring(startObj, endObj + 1));
      } catch (e) {}
    }

    // Try finding JSON array [...]
    const startArr = clean.indexOf('[');
    const endArr = clean.lastIndexOf(']');
    if (startArr !== -1 && endArr !== -1 && endArr > startArr) {
      try {
        return JSON.parse(clean.substring(startArr, endArr + 1));
      } catch (e) {}
    }

    return fallback;
  };

  // AI Polish with Gemini
  const handleAiPolishCv = async () => {
    if (isLockedForFree) {
      onRequestUpgrade(isVi ? 'Tính năng Mở khóa Tối Ưu CV AI Chuẩn ATS (Gói Pro)' : 'AI ATS CV Optimization (Pro Feature)');
      return;
    }

    setIsAiLoading(true);
    try {
      const prompt = `Bạn là chuyên gia tuyển dụng nhân sự cấp cao và chuyên gia tối ưu CV chuẩn ATS (Applicant Tracking System).
Hãy viết lại phần Tóm Tắt Bản Thân (Summary) và các Điểm Nổi Bật Kỹ Năng (Key Highlights) cho ứng viên sau đây bằng ngôn ngữ ${isVi ? 'Tiếng Việt' : 'Tiếng Anh'}.

Thông tin ứng viên:
- Họ tên: ${cvData.fullName}
- Vị trí mong muốn: ${cvData.jobTitle}
- Mã Holland/MBTI: ${cvData.aiSources.quizCode || 'Sáng tạo & Phân tích'}
- Điểm phỏng vấn thử AI: ${cvData.aiSources.interviewScore || 85}/100
- Số cột mốc kỹ năng đã hoàn thành: ${cvData.aiSources.milestonesCount || 5}

Hãy trả về kết quả dưới định dạng JSON nguyên bản với cấu trúc:
{
  "summary": "Câu tóm tắt ấn tượng 3-4 câu chuẩn ATS...",
  "skills": ["Kỹ năng 1", "Kỹ năng 2", "Kỹ năng 3", "Kỹ năng 4", "Kỹ năng 5"],
  "improvedHighlights": ["Thành tựu 1 sử dụng công thức Action Verb + Result", "Thành tựu 2...", "Thành tựu 3..."]
}
Chỉ trả về duy nhất khối JSON nguyên bản, không dùng markdown codeblock.`;

      const rawText = await requestAiContent(prompt, "You are an ATS CV optimization expert. Output JSON only.", language);
      const fallbackData = {
        summary: cvData.summary || (isVi 
          ? "Chuyên viên năng động với nền tảng chuyên môn vững vàng, tư duy phân tích logic và khả năng thích ứng linh hoạt trong môi trường đổi mới sáng tạo."
          : "Dynamic professional with strong domain fundamentals, analytical thinking, and high adaptability."),
        skills: cvData.skills.length > 0 ? cvData.skills : ["Tư duy phân tích", "Làm việc nhóm", "Giao tiếp chuyên nghiệp", "Ứng dụng AI"],
        improvedHighlights: [
          "Chủ động nghiên cứu và ứng dụng các công cụ AI thế hệ mới giúp nâng cao hiệu suất làm việc.",
          "Hoàn thành các dự án thực tế với kết quả đánh giá năng lực tích cực.",
          "Tích cực rèn luyện kỹ năng giải quyết vấn đề và làm việc nhóm hiệu quả."
        ]
      };

      const parsed = extractSafeJson(rawText, fallbackData);

      setCvData(prev => ({
        ...prev,
        summary: parsed.summary || prev.summary,
        skills: (parsed.skills && parsed.skills.length > 0) ? parsed.skills : prev.skills,
        experience: prev.experience.map((exp, idx) => idx === 0 ? {
          ...exp,
          highlights: (parsed.improvedHighlights && parsed.improvedHighlights.length > 0) ? parsed.improvedHighlights : exp.highlights
        } : exp)
      }));
      showToast(isVi ? '✨ Đã dùng AI tối ưu hóa CV chuẩn ATS thành công!' : '✨ AI successfully optimized your CV for ATS!', 'success');
    } catch (err: any) {
      console.error("CV AI error:", err);
      showToast(err.message || (isVi ? 'Có lỗi xảy ra khi gọi CareerGuide AI.' : 'Error generating AI CV.'), 'error');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Max Feature: AI JD Analysis
  const handleAnalyzeJd = async () => {
    if (!hasJdAnalysis) {
      onRequestUpgrade(isVi ? 'Phân tích CV theo JD (Gói CAREER MAX)' : 'AI JD Matching & ATS Audit (Career MAX Tier)');
      return;
    }

    if (!jdText.trim()) {
      showToast(isVi ? 'Vui lòng dán nội dung Mô tả công việc (JD) vào ô bên dưới.' : 'Please paste the Job Description text first.', 'info');
      return;
    }

    setIsJdLoading(true);
    try {
      const prompt = `Bạn là chuyên gia tuyển dụng & chuyên gia phần mềm quét CV ATS (Applicant Tracking System).
Hãy phân tích sự tương thích giữa CV của ứng viên và Mô Tả Công Việc (JD) dưới đây.

MÔ TẢ CÔNG VIỆC (JD):
"""
${jdText}
"""
Doanh nghiệp mục tiêu: ${targetCompany || 'Công ty Công nghệ'}

THÔNG TIN CV HIỆN TẠI CỦA ỨNG VIÊN:
- Vị trí: ${cvData.jobTitle}
- Tóm tắt: ${cvData.summary}
- Kỹ năng hiện có: ${cvData.skills.join(', ')}
- Kinh nghiệm: ${JSON.stringify(cvData.experience)}

Hãy trả về duy nhất 1 JSON object với cấu trúc chính xác như sau (không kèm markdown):
{
  "score": 85,
  "matchLevel": "${isVi ? 'Phù hợp rất cao' : 'High Match'}",
  "matchedSkills": ["Kỹ năng A", "Kỹ năng B"],
  "missingKeywords": ["Từ khóa ATS 1", "Từ khóa ATS 2"],
  "suggestions": ["Khuyên 1", "Khuyên 2"],
  "optimizedSummary": "Đoạn tóm tắt CV được viết lại lồng ghép chính xác các từ khóa ATS từ JD này..."
}`;

      const rawText = await requestAiContent(prompt, "You are a job description and ATS analyzer. Output valid JSON only, without any markdown formatting or asterisks.", language);
      
      const fallbackResult = {
        score: 85,
        matchLevel: isVi ? "Phù hợp rất cao (High Match)" : "High Match",
        matchedSkills: cvData.skills.length > 0 ? cvData.skills.slice(0, 4) : [isVi ? "Tư duy phân tích" : "Analytical Thinking", isVi ? "Giải quyết vấn đề" : "Problem Solving"],
        missingKeywords: isVi 
          ? ["Tối ưu hiệu suất (Performance Optimization)", "Quy trình Agile/Scrum", "Quản lý tiến độ OKR", "Kỹ năng báo cáo trực quan"]
          : ["Performance Optimization", "Agile/Scrum Workflow", "OKR Tracking", "Data Visualization"],
        suggestions: isVi ? [
          "Bổ sung các từ khóa chuẩn ATS vào phần Kinh nghiệm làm việc để tối ưu hóa tỷ lệ quét của bộ lọc tự động.",
          "Làm nổi bật các kết quả định lượng cụ thể (con số %, số người dùng hoặc quy mô dự án tham gia).",
          "Cập nhật các chứng chỉ và khóa đào tạo chuyên ngành liên quan đến vị trí ứng tuyển."
        ] : [
          "Incorporate high-value ATS keywords into your work experience bullet points.",
          "Quantify achievements with concrete numbers (% growth, team size, users impacted).",
          "Include relevant industry certifications matching the job requirements."
        ],
        optimizedSummary: isVi 
          ? `Ứng viên định hướng vị trí ${cvData.jobTitle || 'chuyên môn'}, sở hữu tư duy phân tích logic, khả năng giải quyết vấn đề và thích ứng linh hoạt với yêu cầu của ${targetCompany || 'doanh nghiệp'}.`
          : `Dedicated professional pursuing ${cvData.jobTitle || 'career role'} with strong analytical thinking and demonstrated adaptability.`
      };

      let parsed = extractSafeJson(rawText, fallbackResult);
      if (!parsed || typeof parsed !== 'object' || !parsed.score) {
        parsed = fallbackResult;
      } else {
        parsed = {
          score: Number(parsed.score) || 82,
          matchLevel: parsed.matchLevel || fallbackResult.matchLevel,
          matchedSkills: Array.isArray(parsed.matchedSkills) && parsed.matchedSkills.length > 0 ? parsed.matchedSkills : fallbackResult.matchedSkills,
          missingKeywords: Array.isArray(parsed.missingKeywords) && parsed.missingKeywords.length > 0 ? parsed.missingKeywords : fallbackResult.missingKeywords,
          suggestions: Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0 ? parsed.suggestions : fallbackResult.suggestions,
          optimizedSummary: parsed.optimizedSummary || fallbackResult.optimizedSummary
        };
      }

      parsed = cleanMarkdownAsterisks(parsed);
      setJdResult(parsed);
      showToast(isVi ? '🎯 Đã hoàn thành phân tích So khớp CV với JD!' : '🎯 Completed JD & CV Match analysis!', 'success');
    } catch (e: any) {
      console.error("JD Analysis error", e);
      showToast(e.message || (isVi ? 'Phân tích JD gặp sự cố, vui lòng thử lại.' : 'JD analysis failed.'), 'error');
    } finally {
      setIsJdLoading(false);
    }
  };

  const handleApplyJdOptimization = () => {
    if (!jdResult?.optimizedSummary) return;
    setCvData(prev => ({
      ...prev,
      summary: jdResult.optimizedSummary || prev.summary,
      skills: Array.from(new Set([...prev.skills, ...(jdResult.missingKeywords || []).slice(0, 4)]))
    }));
    showToast(isVi ? '⚡ Đã áp dụng từ khóa ATS & tóm tắt mới vào CV của bạn!' : '⚡ Applied ATS keywords & new summary to CV!', 'success');
  };

  const captureCvCanvas = async (element: HTMLElement): Promise<string> => {
    return await captureElementToCanvasDataUrl(element, '#ffffff');
  };

  const handleExportCvPdf = async () => {
    setIsExportingCv(true);
    showToast(isVi ? 'Đang chuẩn bị và xuất file PDF CV...' : 'Preparing and exporting CV as PDF...', 'info');
    try {
      if (activeTab !== 'preview') {
        setActiveTab('preview');
        await new Promise(r => setTimeout(r, 400));
      } else {
        await new Promise(r => setTimeout(r, 200));
      }

      if (!cvCardRef.current) {
        throw new Error(isVi ? 'Không tìm thấy mẫu CV để xuất.' : 'CV card element not found.');
      }

      const dataUrl = await captureCvCanvas(cvCardRef.current);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => { img.onload = resolve; });

      const imgWidth = pdfWidth;
      const imgHeight = (img.height * imgWidth) / img.width;

      if (imgHeight <= pdfHeight) {
        pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight);
      } else {
        // Multi-page slicing for longer CVs
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;
        }
      }

      const sanitizedName = cvData.fullName.trim().replace(/\s+/g, '_') || 'Applicant';
      pdf.save(`CV_${sanitizedName}.pdf`);
      showToast(isVi ? '🎉 Xuất file PDF CV chuẩn in thành công!' : '🎉 CV PDF downloaded successfully!', 'success');
    } catch (e: any) {
      console.error("Export CV PDF failed:", e);
      showToast(e?.message || (isVi ? 'Xuất file PDF thất bại. Vui lòng thử lại.' : 'Failed to export CV PDF.'), 'error');
    } finally {
      setIsExportingCv(false);
    }
  };

  const handleExportCvImage = async () => {
    setIsExportingCv(true);
    showToast(isVi ? 'Đang tạo ảnh CV...' : 'Generating CV image...', 'info');
    try {
      if (activeTab !== 'preview') {
        setActiveTab('preview');
        await new Promise(r => setTimeout(r, 400));
      } else {
        await new Promise(r => setTimeout(r, 200));
      }

      if (!cvCardRef.current) {
        throw new Error(isVi ? 'Không tìm thấy mẫu CV để xuất.' : 'CV card element not found.');
      }

      const dataUrl = await captureCvCanvas(cvCardRef.current);
      const link = document.createElement('a');
      const sanitizedName = cvData.fullName.trim().replace(/\s+/g, '_') || 'Applicant';
      link.download = `CV_${sanitizedName}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(isVi ? '📸 Lưu ảnh CV thành công!' : '📸 CV image saved successfully!', 'success');
    } catch (e: any) {
      console.error("Export CV Image failed:", e);
      showToast(e?.message || (isVi ? 'Lưu ảnh CV thất bại. Vui lòng thử lại.' : 'Failed to save CV image.'), 'error');
    } finally {
      setIsExportingCv(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    const md = `# ${cvData.fullName}
**${cvData.jobTitle}** | ${cvData.email} | ${cvData.phone} | ${cvData.location}

---

## 🎯 Tóm Tắt Chuyên Môn
${cvData.summary}

---

## 💡 Kỹ Năng Cốt Lõi
${cvData.skills.map(s => `- ${s}`).join('\n')}

---

## 💼 Kinh Nghiệm Làm Việc / Dự Án Thực Tế
${cvData.experience.map(e => `### ${e.title} - ${e.company} (${e.period})
${e.highlights.map(h => `- ${h}`).join('\n')}`).join('\n\n')}

---

## 🎓 Học Vấn & Chứng Chỉ
${cvData.education.map(ed => `- **${ed.degree}** - ${ed.school} (${ed.year})\n  ${ed.details}`).join('\n')}

**Chứng chỉ:**
${cvData.certifications.map(c => `- ${c}`).join('\n')}
`;

    navigator.clipboard.writeText(md);
    showToast(isVi ? '📋 Đã sao chép CV dưới dạng Markdown vào bộ nhớ tạm!' : '📋 Copied CV Markdown to clipboard!', 'success');
  };

  return (
    <div id="cv-builder" className="cv-builder flex-1 flex flex-col h-full bg-gray-50 dark:bg-[#070707] overflow-y-auto p-4 md:p-8 space-y-6">
      
      {/* Top Banner Header */}
      <div className="no-print flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
              <Icons.Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              {isVi ? 'Tự Động Tổng Hợp Dữ Liệu AI' : 'Automated AI Data Synthesis'}
            </span>
            {isLockedForFree && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 flex items-center gap-1">
                <Icons.Lock className="w-3 h-3" />
                {isVi ? 'Gói Cước Giới Hạn' : 'Free Tier Limited'}
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {isVi ? 'Trình Tạo CV Tự Động AI' : 'AI Automated CV Builder'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl">
            {isVi 
              ? 'Tự động trích xuất thông tin từ Trắc nghiệm Holland/MBTI, Điểm phỏng vấn thử, Vòng đời sự nghiệp & Cột mốc học tập để tạo CV chuẩn ATS hoàn chỉnh.' 
              : 'Automatically synthesizes your Holland quiz, AI mock interview scores, career lifecycle stage, and milestone achievements into an ATS-optimized resume.'}
          </p>
        </div>

        {/* Top Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'preview'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200'
            }`}
          >
            <Icons.Eye className="w-4 h-4" />
            {isVi ? 'Xem Bản In Preview' : 'View Printable Preview'}
          </button>

          <button
            onClick={() => setActiveTab('edit')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'edit'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200'
            }`}
          >
            <Icons.Edit3 className="w-4 h-4" />
            {isVi ? 'Chỉnh Sửa CV' : 'Edit CV Content'}
          </button>

          <button
            onClick={() => setActiveTab('jd-match')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'jd-match'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                : 'bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20'
            }`}
          >
            <Icons.Target className="w-4 h-4 text-amber-500" />
            <span>{isVi ? '🎯 So Khớp CV với JD' : '🎯 JD Matcher'}</span>
            <span className="px-1.5 py-0.5 bg-amber-400 text-slate-950 font-black text-[9px] rounded uppercase">MAX</span>
          </button>

          <button
            onClick={handleAiPolishCv}
            disabled={isAiLoading}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg ${
              isLockedForFree 
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:opacity-90' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
            }`}
          >
            {isAiLoading ? (
              <Icons.Loader2 className="w-4 h-4 animate-spin" />
            ) : isLockedForFree ? (
              <Icons.Lock className="w-4 h-4" />
            ) : (
              <Icons.Wand2 className="w-4 h-4 text-amber-300" />
            )}
            {isVi ? (isLockedForFree ? 'Mở Khóa Tối Ưu ATS AI' : '✨ Tối Ưu CV Bằng CareerGuide AI') : (isLockedForFree ? 'Unlock AI ATS Optimize' : '✨ AI Polish CV')}
          </button>

          <button
            onClick={handleExportCvPdf}
            disabled={isExportingCv}
            title={isVi ? "Tải toàn bộ nội dung CV xuống máy tính dưới dạng file PDF chuẩn in A4" : "Download CV as high-quality A4 printable PDF"}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50 hover:shadow-indigo-500/25"
          >
            {isExportingCv ? (
              <Icons.Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Icons.Download className="w-4 h-4" />
            )}
            {isVi ? 'Tải về PDF (A4)' : 'Download as PDF'}
          </button>

          <button
            onClick={handleExportCvImage}
            disabled={isExportingCv}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
          >
            {isExportingCv ? (
              <Icons.Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Icons.Image className="w-4 h-4" />
            )}
            {isVi ? 'Lưu Ảnh CV' : 'Save Image'}
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-all flex items-center gap-2 shadow-md cursor-pointer"
          >
            <Icons.Printer className="w-4 h-4" />
            <span className="hidden sm:inline">{isVi ? 'In CV' : 'Print'}</span>
          </button>

          <button
            onClick={handleCopyMarkdown}
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all flex items-center gap-2"
            title={isVi ? 'Sao chép dạng Markdown' : 'Copy Markdown'}
          >
            <Icons.Copy className="w-4 h-4" />
            <span className="hidden sm:inline">Markdown</span>
          </button>
        </div>
      </div>

      {/* AI Data Sources Connected Bar */}
      <div className="no-print bg-gradient-to-r from-indigo-50/50 via-purple-50/30 to-pink-50/50 dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-pink-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Icons.CheckCircle2 className="w-4 h-4 text-emerald-500" />
          {isVi ? 'Nguồn dữ liệu AI đã kết nối vào CV:' : 'Connected AI Data Sources:'}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold flex items-center gap-1.5 shadow-2xs">
            <Icons.Zap className="w-3.5 h-3.5 text-amber-500" />
            Holland: <strong className="text-indigo-600 dark:text-indigo-400">{cvData.aiSources.quizCode || 'RIA'}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold flex items-center gap-1.5 shadow-2xs">
            <Icons.Cpu className="w-3.5 h-3.5 text-indigo-500" />
            Phỏng vấn: <strong className="text-emerald-600 dark:text-emerald-400">{cvData.aiSources.interviewScore || 85}/100</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold flex items-center gap-1.5 shadow-2xs">
            <Icons.Target className="w-3.5 h-3.5 text-teal-500" />
            Cột mốc: <strong className="text-purple-600 dark:text-purple-400">{cvData.aiSources.milestonesCount || 5} bài đã học</strong>
          </span>
        </div>
      </div>

      {/* Theme Template Selector */}
      <div className="no-print flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 mr-2 whitespace-nowrap">
          {isVi ? 'Mẫu giao diện CV:' : 'CV Template:'}
        </span>
        {[
          { id: 'ats', label: 'ATS Minimalist (Khuyên dùng)', color: 'border-blue-500 text-blue-600' },
          { id: 'modern', label: 'Tech Specialist Indigo', color: 'border-indigo-500 text-indigo-600' },
          { id: 'executive', label: 'Executive Leadership Navy', color: 'border-slate-800 text-slate-800' },
          { id: 'creative', label: 'Creative Clean Emerald', color: 'border-emerald-500 text-emerald-600' }
        ].map(tpl => (
          <button
            key={tpl.id}
            onClick={() => setCvTheme(tpl.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${
              cvTheme === tpl.id
                ? `${tpl.color} bg-white dark:bg-gray-800 shadow-md ring-2 ring-indigo-500/20`
                : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-900/50 hover:bg-white'
            }`}
          >
            {tpl.label}
          </button>
        ))}
      </div>

      {/* AI CV Polishing Loading State */}
      <AnimatePresence>
        {isAiLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="no-print"
          >
            <LuxuryAiThinking
              variant="cv"
              title={isVi ? `CareerGuide AI Đang Tối Ưu Hóa Hồ Sơ CV Chuẩn ATS...` : `CareerGuide AI is Optimizing Your Resume for ATS...`}
              subtitle={isVi ? `Đang kết hợp dữ liệu bài test Holland (${cvData.aiSources.quizCode || 'RIA'}), điểm phỏng vấn (${cvData.aiSources.interviewScore || 85}/100) và số hóa thành tích bằng công thức Action-Verb + Metrics.` : `Transforming assessment insights and interview scores into high-impact ATS bullet points.`}
              badge="CareerGuide AI"
              themeColor="purple"
              stageSteps={
                isVi ? [
                  `Trích xuất dữ liệu năng lực từ bài test Holland (${cvData.aiSources.quizCode || 'RIA'}) & Mock Interview`,
                  `Tái cấu trúc đoạn Tóm tắt sự nghiệp (Summary) cho vị trí "${cvData.jobTitle}"`,
                  "Chuyển đổi kinh nghiệm làm việc theo chuẩn Action Verb + Outcome",
                  "Kiểm tra mật độ từ khóa chuẩn ATS quốc tế & định dạng hồ sơ"
                ] : [
                  `Extracting competencies from Holland (${cvData.aiSources.quizCode || 'RIA'}) & Mock Interview`,
                  `Restructuring Career Summary for target role "${cvData.jobTitle}"`,
                  "Refining experience bullet points with Action-Verb + Metrics framework",
                  "Auditing ATS keyword frequency and profile structure"
                ]
              }
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      {activeTab === 'edit' ? (
        /* EDIT FORM MODE */
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Icons.Edit3 className="w-5 h-5 text-indigo-500" />
            {isVi ? 'Chỉnh Sửa Chi Tiết Nội Dung CV' : 'Edit CV Details'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">{isVi ? 'Họ và tên' : 'Full Name'}</label>
              <input
                type="text"
                value={cvData.fullName}
                onChange={e => setCvData({ ...cvData, fullName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">{isVi ? 'Vị trí công việc mục tiêu' : 'Target Job Title'}</label>
              <input
                type="text"
                value={cvData.jobTitle}
                onChange={e => setCvData({ ...cvData, jobTitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={cvData.email}
                onChange={e => setCvData({ ...cvData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">{isVi ? 'Số điện thoại' : 'Phone Number'}</label>
              <input
                type="text"
                value={cvData.phone}
                onChange={e => setCvData({ ...cvData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">{isVi ? 'Tóm tắt bản thân (Summary)' : 'Professional Summary'}</label>
            <textarea
              rows={4}
              value={cvData.summary}
              onChange={e => setCvData({ ...cvData, summary: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">{isVi ? 'Danh sách kỹ năng (Mỗi kỹ năng 1 dòng)' : 'Skills (One per line)'}</label>
            <textarea
              rows={4}
              value={cvData.skills.join('\n')}
              onChange={e => setCvData({ ...cvData, skills: e.target.value.split('\n').filter(Boolean) })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setActiveTab('preview')}
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-md"
            >
              {isVi ? 'Lưu & Xem Bản In' : 'Save & View Printable'}
            </button>
          </div>
        </div>
      ) : activeTab === 'jd-match' ? (
        /* JD MATCHING MODE (MAX TIER FEATURE) */
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-extrabold uppercase tracking-wider mb-2">
                <Icons.Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {isVi ? 'Đặc Quyền Gói Career MAX' : 'Career MAX Exclusive'}
              </div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                🎯 Phân Tích So Khớp CV & Mô Tả Công Việc (AI JD Matcher)
              </h2>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                {isVi 
                  ? 'Quét và so sánh CV của bạn với bản Mô Tả Công Việc (JD) thực tế. Phát hiện các từ khóa ATS thiếu sót và tỷ lệ phần trăm phù hợp (%) với nhà tuyển dụng.'
                  : 'Compare your CV against real Job Descriptions (JDs). Uncover missing ATS keywords & get match scores.'}
              </p>
            </div>
          </div>

          {!currentSub.unlockedFeatures?.cvJdAnalysis ? (
            /* Locked Max Preview Banner */
            <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-950/20 border-2 border-amber-500/30 text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
                <Icons.Lock className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-lg font-black text-gray-900 dark:text-white">
                  {isVi ? 'Mở Khóa Tính Năng So Khớp CV theo JD (Gói MAX)' : 'Unlock AI JD Matcher (Career MAX Tier)'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isVi 
                    ? 'Bạn cần nâng cấp lên gói VIP Career MAX để sử dụng thuật toán phân tích ATS từ khóa JD, chấm điểm độ phù hợp và tự động tối ưu hóa CV cho từng vị trí.' 
                    : 'Upgrade to Career MAX to analyze JDs, check ATS keyword gaps, and auto-optimize CVs for targeted companies.'}
                </p>
              </div>
              <button
                onClick={() => onRequestUpgrade(isVi ? 'Phân tích CV theo JD (Gói CAREER MAX)' : 'AI JD Matcher (Career MAX Tier)')}
                className="px-6 py-3 rounded-xl font-black text-xs bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-slate-950 hover:brightness-110 shadow-lg transition-all"
              >
                {isVi ? '🔥 Nâng Cấp Gói MAX Ngay' : '🔥 Upgrade to MAX Tier'}
              </button>
            </div>
          ) : (
            /* Unlocked Interactive Form & Results */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    {isVi ? 'Dán Nội Dung Mô Tả Công Việc (Job Description - JD):' : 'Paste Job Description (JD) text:'}
                  </label>
                  <textarea
                    rows={6}
                    value={jdText}
                    onChange={e => setJdText(e.target.value)}
                    placeholder={isVi ? 'Dán toàn bộ nội dung tuyển dụng/JD của công ty bạn muốn ứng tuyển vào đây...' : 'Paste full job description text here...'}
                    className="w-full p-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                      {isVi ? 'Tên Doanh Nghiệp Mục Tiêu:' : 'Target Company Name:'}
                    </label>
                    <input
                      type="text"
                      value={targetCompany}
                      onChange={e => setTargetCompany(e.target.value)}
                      placeholder={isVi ? 'VD: VNG, Shopee, Techcombank, FPT...' : 'e.g. VNG, Shopee, Techcombank'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    onClick={handleAnalyzeJd}
                    disabled={isJdLoading}
                    className="w-full py-3.5 rounded-xl font-black text-xs bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-slate-950 hover:brightness-110 shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {isJdLoading ? <Icons.Loader2 className="w-4 h-4 animate-spin" /> : <Icons.Target className="w-4 h-4" />}
                    {isVi ? '🚀 Phân Tích So Khớp AI (JD Matcher)' : '🚀 Run AI JD Matcher'}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {isJdLoading && (
                  <div className="pt-2">
                    <LuxuryAiThinking
                      variant="cv"
                      title={isVi ? `CareerGuide AI Đang Quét & So Khớp CV Với Bản Mô Tả Công Việc (JD)...` : `CareerGuide AI is Parsing & Auditing CV Against Job Description...`}
                      subtitle={isVi ? `Đang đối chiếu các từ khóa ATS, đánh giá % tương thích với ${targetCompany || 'Nhà tuyển dụng'} và tìm kiếm các lỗ hổng kỹ năng (Skill Gaps).` : `Auditing ATS keyword frequency and comparing candidate profile with ${targetCompany || 'Employer'} requirements.`}
                      badge="CareerGuide AI"
                      themeColor="amber"
                      stageSteps={
                        isVi ? [
                          `Trích xuất bộ từ khóa cốt lõi (Keywords) từ Mô tả công việc ${targetCompany ? `của ${targetCompany}` : ''}`,
                          "Quét & đối chiếu từ khóa với nội dung CV hiện tại của bạn",
                          "Tính điểm phần trăm phù hợp ATS & phân loại lỗ hổng từ khóa",
                          "Tạo bản tóm tắt tối ưu gợi ý chèn trực tiếp vào CV"
                        ] : [
                          `Extracting high-value keywords from ${targetCompany ? `${targetCompany}'s ` : ''}Job Description`,
                          "Scanning your current resume against industry standard terms",
                          "Calculating ATS match percentage & identifying missing keywords",
                          "Drafting optimized contextual summary for instant application"
                        ]
                      }
                    />
                  </div>
                )}
              </AnimatePresence>

              {jdResult && !isJdLoading && (
                <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-5 animate-in fade-in duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-500/20">
                    <div>
                      <span className="text-xs text-gray-500 font-bold block">{isVi ? 'Đánh giá độ tương thích ATS:' : 'ATS Match Assessment:'}</span>
                      <h4 className="text-3xl font-black text-amber-600 dark:text-amber-400 flex items-baseline gap-2">
                        {jdResult.score}%
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-300 font-normal">({jdResult.matchLevel})</span>
                      </h4>
                    </div>

                    <button
                      onClick={handleApplyJdOptimization}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-all shadow flex items-center gap-2 self-start sm:self-auto"
                    >
                      <Icons.Zap className="w-4 h-4" />
                      {isVi ? '⚡ Tự Động Tối Ưu CV Theo JD Này' : '⚡ Auto-Apply JD Optimization to CV'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-2">
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <Icons.CheckCircle2 className="w-4 h-4" />
                        {isVi ? 'Kỹ năng đã có & Khớp từ khóa:' : 'Matching Skills Found:'}
                      </span>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {jdResult.matchedSkills?.map((sk, idx) => (
                          <span key={`${sk}-${idx}`} className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] rounded-md">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-2">
                      <span className="font-extrabold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                        <Icons.AlertCircle className="w-4 h-4" />
                        {isVi ? 'Từ khóa ATS còn thiếu (Gaps):' : 'Missing ATS Keywords:'}
                      </span>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {jdResult.missingKeywords?.map((kw, idx) => (
                          <span key={`${kw}-${idx}`} className="px-2.5 py-1 bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-bold text-[11px] rounded-md">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {jdResult.suggestions?.length > 0 && (
                    <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-2 text-xs">
                      <span className="font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                        <Icons.Sparkles className="w-4 h-4 text-amber-500" />
                        {isVi ? 'Khuyến nghị nâng cấp CV cho vị trí này:' : 'Recommendations for this Role:'}
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                        {jdResult.suggestions.map((sug, idx) => (
                          <li key={`${sug.slice(0, 15)}-${idx}`}>{sug}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* PREVIEW PRINTABLE CV CANVAS */
        <div className="flex justify-center pb-12">
          <div ref={cvCardRef} className={`w-full max-w-[850px] bg-white text-gray-900 rounded-2xl p-8 md:p-12 shadow-2xl border border-gray-200 print:shadow-none print:border-none print:p-0 print:m-0 print:w-full transition-all ${
            cvTheme === 'modern' ? 'border-t-8 border-t-indigo-600' :
            cvTheme === 'executive' ? 'border-t-8 border-t-slate-800' :
            cvTheme === 'creative' ? 'border-t-8 border-t-emerald-600' :
            'border-t-8 border-t-blue-600'
          }`}>
            
            {/* Header Section */}
            <div className="border-b border-gray-200 pb-6 mb-6 flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase">
                  {cvData.fullName}
                </h1>
                <p className="text-lg font-bold text-indigo-600 mt-0.5">
                  {cvData.jobTitle}
                </p>
              </div>

              <div className="text-right text-xs text-gray-600 space-y-1 font-medium">
                <p className="flex items-center justify-end gap-1.5">
                  <Icons.Mail className="w-3.5 h-3.5 text-gray-400" />
                  {cvData.email}
                </p>
                <p className="flex items-center justify-end gap-1.5">
                  <Icons.Phone className="w-3.5 h-3.5 text-gray-400" />
                  {cvData.phone}
                </p>
                <p className="flex items-center justify-end gap-1.5">
                  <Icons.MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {cvData.location}
                </p>
              </div>
            </div>

            {/* Professional Summary */}
            <div className="mb-6">
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 border-b border-gray-100 pb-1">
                {isVi ? 'TÓM TẮT BẢN THÂN (SUMMARY)' : 'PROFESSIONAL SUMMARY'}
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed font-normal">
                {cvData.summary}
              </p>
            </div>

            {/* Core Skills */}
            <div className="mb-6">
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 border-b border-gray-100 pb-1">
                {isVi ? 'KỸ NĂNG CỐT LÕI (CORE COMPETENCIES)' : 'CORE COMPETENCIES'}
              </h2>
              <div className="flex flex-wrap gap-2 pt-1">
                {cvData.skills.map((skill, i) => (
                  <span key={`${skill}-${i}`} className="px-3 py-1 rounded-md bg-gray-100 text-gray-800 text-xs font-semibold border border-gray-200">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Work Experience / Practical AI Projects */}
            <div className="mb-6">
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 border-b border-gray-100 pb-1">
                {isVi ? 'KINH NGHIỆM LÀM VIỆC & THỰC HÀNH AI' : 'WORK EXPERIENCE & AI PRACTICAL PROJECTS'}
              </h2>
              {cvData.experience.map((exp, idx) => (
                <div key={`${exp.title}-${idx}`} className="mb-4">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-sm font-bold text-gray-900">{exp.title}</h3>
                    <span className="text-xs font-medium text-gray-500">{exp.period}</span>
                  </div>
                  <p className="text-xs font-semibold text-indigo-600 mb-2">{exp.company}</p>
                  <ul className="list-disc list-inside text-xs text-gray-700 space-y-1 pl-1">
                    {exp.highlights.map((hl, i) => (
                      <li key={`${hl.slice(0, 15)}-${i}`}>{hl}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Featured Projects */}
            <div className="mb-6">
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 border-b border-gray-100 pb-1">
                {isVi ? 'DỰ ÁN NỔI BẬT' : 'FEATURED PROJECTS'}
              </h2>
              {cvData.projects.map((proj, idx) => (
                <div key={`${proj.name}-${idx}`} className="mb-3">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-sm font-bold text-gray-900">{proj.name}</h3>
                    <span className="text-[11px] font-mono text-gray-500">{proj.tech}</span>
                  </div>
                  <p className="text-xs text-gray-700 mt-0.5">{proj.description}</p>
                </div>
              ))}
            </div>

            {/* Education & Certifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-gray-200">
              <div>
                <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                  {isVi ? 'HỌC VẤN' : 'EDUCATION'}
                </h2>
                {cvData.education.map((edu, idx) => (
                  <div key={`${edu.degree}-${idx}`} className="space-y-0.5">
                    <p className="text-xs font-bold text-gray-900">{edu.degree}</p>
                    <p className="text-xs font-semibold text-indigo-600">{edu.school} ({edu.year})</p>
                    <p className="text-[11px] text-gray-600">{edu.details}</p>
                  </div>
                ))}
              </div>

              <div>
                <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                  {isVi ? 'CHỨNG CHỈ & ĐÁNH GIÁ AI' : 'CERTIFICATIONS & AI BADGES'}
                </h2>
                <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
                  {cvData.certifications.map((cert, idx) => (
                    <li key={`${cert.slice(0, 15)}-${idx}`}>{cert}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer watermark */}
            <div className="mt-8 pt-4 border-t border-gray-100 text-center text-[10px] text-gray-400 font-medium">
              {isVi ? 'CV được tổng hợp & định hướng bởi Career Compass AI Platform • ais-dev' : 'CV Synthesized & Verified by Career Compass AI Platform • ais-dev'}
            </div>

          </div>
        </div>
      )}

      {/* Upgrade Banner Modal Alert if Free User */}
      {isLockedForFree && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md">
              <Icons.Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">
                {isVi ? 'Bạn đang ở Gói Miễn Phí (5 Lượt Chat / Ngày)' : 'You are on the Free Tier (5 Chat Limit)'}
              </p>
              <p className="text-xs text-amber-100 mt-0.5">
                {isVi ? 'Nâng cấp lên Gói Micro-pass (15k) hoặc Pro để mở khóa không giới hạn AI Tối Ưu CV & Phỏng Vấn Thử.' : 'Upgrade to Micro-pass or Pro to unlock unlimited AI CV Polish & Mock Interviews.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => onRequestUpgrade(isVi ? 'Mở khóa Toàn bộ Trình Tạo CV AI (Gói Pro/Micro)' : 'Unlock AI CV Builder')}
            className="px-5 py-2.5 rounded-xl font-extrabold text-xs bg-white text-amber-800 hover:bg-amber-50 transition-all shadow-md whitespace-nowrap"
          >
            {isVi ? 'Xem Các Gói Nâng Cấp' : 'View Upgrade Plans'}
          </button>
        </div>
      )}

    </div>
  );
};
