import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import { Language, UserProfile } from '../types';
import { getSubscriptionDetails } from '../utils/subscriptionUtils';
import { requestAiContent } from '../services/geminiService';

interface CareerLifecycleManagerProps {
  language: Language;
  user: UserProfile | null;
  onSendPromptToChat: (promptText: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onRequestUpgrade?: (featureName: string) => void;
}

export type CareerStage = 'student' | 'junior' | 'mid_senior' | 'alumni';

interface StageCheckitem {
  id: string;
  title_vi: string;
  title_en: string;
  category: string;
}

interface StageConfig {
  id: CareerStage;
  icon: keyof typeof Icons;
  badge_vi: string;
  badge_en: string;
  title_vi: string;
  title_en: string;
  subtitle_vi: string;
  subtitle_en: string;
  salaryRange_vi: string;
  salaryRange_en: string;
  readinessFactors: {
    key: string;
    label_vi: string;
    label_en: string;
    defaultValue: number;
  }[];
  checklist: StageCheckitem[];
  highlights_vi: string[];
  highlights_en: string[];
  actionPrompts: {
    title_vi: string;
    title_en: string;
    prompt_vi: string;
    prompt_en: string;
  }[];
}

const CAREER_STAGES: StageConfig[] = [
  {
    id: 'student',
    icon: 'GraduationCap',
    badge_vi: 'Giai đoạn 1: Sinh viên / Học sinh',
    badge_en: 'Stage 1: Student / Undergrad',
    title_vi: 'Định Hướng Ngành & Tích Lũy Nền Tảng',
    title_en: 'Major Orientation & Foundation Building',
    subtitle_vi: 'Chọn đúng ngành học, đạt điểm chuẩn THPT, luyện chứng chỉ ngoại ngữ và xây dựng Portfolio cá nhân.',
    subtitle_en: 'Select right major, meet cutoff scores, master English & build early portfolio.',
    salaryRange_vi: 'Học bổng & Trợ cấp thực tập: 3 - 8 triệu VNĐ/tháng',
    salaryRange_en: 'Scholarships & Intern stipend: $150 - $400/mo',
    readinessFactors: [
      { key: 'english', label_vi: 'Trình độ Tiếng Anh (IELTS/TOEIC)', label_en: 'English Proficiency', defaultValue: 65 },
      { key: 'gpa', label_vi: 'Điểm số & Nền tảng chuyên môn (GPA)', label_en: 'Academic Foundation (GPA)', defaultValue: 75 },
      { key: 'portfolio', label_vi: 'Dự án thực tế / Activity Portfolio', label_en: 'Project Portfolio', defaultValue: 50 },
      { key: 'soft_skills', label_vi: 'Kỹ năng làm việc nhóm & Thuyết trình', label_en: 'Presentation & Teamwork', defaultValue: 60 }
    ],
    checklist: [
      { id: 'st_1', title_vi: 'Hoàn thành trắc nghiệm RIASEC & Holland định hướng ngành', title_en: 'Complete RIASEC career assessment quiz', category: 'Orientation' },
      { id: 'st_2', title_vi: 'Tra cứu điểm chuẩn 3 năm gần nhất các trường mục tiêu', title_en: 'Check target university cutoff scores', category: 'Admission' },
      { id: 'st_3', title_vi: 'Đạt chứng chỉ Tiếng Anh tối thiểu (IELTS 6.5+ / TOEIC 750+)', title_en: 'Achieve English certificate (IELTS 6.5+)', category: 'Skills' },
      { id: 'st_4', title_vi: 'Xây dựng 1 Portfolio / GitHub / Behance dự án cá nhân', title_en: 'Build 1 personal project portfolio / GitHub', category: 'Portfolio' },
      { id: 'st_5', title_vi: 'Chuẩn bị CV sinh viên và nộp ứng tuyển 3 vị trí Thực tập', title_en: 'Create Student Resume & apply to 3 internships', category: 'Career' }
    ],
    highlights_vi: [
      'Tra cứu điểm chuẩn đại học & học bổng mới nhất',
      'Đánh giá trắc nghiệm tính cách & sở thích nghề nghiệp RIASEC',
      'Luyện thi chứng chỉ tiếng Anh (IELTS / TOEIC)',
      'Tham gia hoạt động ngoại khóa & dự án cá nhân'
    ],
    highlights_en: [
      'Check latest university cutoff scores & scholarships',
      'Personality & career orientation quiz (RIASEC)',
      'English certification prep (IELTS/TOEIC)',
      'Extracurriculars & personal projects'
    ],
    actionPrompts: [
      {
        title_vi: 'Tư vấn chọn ngành theo điểm thi THPT',
        title_en: 'Major orientation based on high school exam scores',
        prompt_vi: 'Tôi có tổng điểm thi THPT khối A1 là 25.5 điểm và yêu thích công nghệ. Hãy tư vấn các trường và ngành phù hợp tại Hà Nội.',
        prompt_en: 'I scored 25.5 in STEM subjects and like tech. Recommend universities and majors in Hanoi.'
      },
      {
        title_vi: 'Lộ trình chuẩn bị đi thực tập năm 3-4',
        title_en: 'Year 3-4 Internship Prep Roadmap',
        prompt_vi: 'Lập cho tôi lộ trình 6 tháng chuẩn bị hồ sơ và kỹ năng đi thực tập tại các công ty công nghệ lớn.',
        prompt_en: 'Build a 6-month roadmap to prepare my resume and skills for tech company internships.'
      }
    ]
  },
  {
    id: 'junior',
    icon: 'Briefcase',
    badge_vi: 'Giai đoạn 2: Mới Ra Trường (Junior 0-2 năm)',
    badge_en: 'Stage 2: Fresh Grad / Junior (0-2 yrs)',
    title_vi: 'Vượt Phỏng Vấn & Hòa Nhập Môi Trường Công Sở',
    title_en: 'Pass Probation & Master Workplace Skills',
    subtitle_vi: 'Tạo CV chuẩn ATS, luyện phỏng vấn thực tế với AI, vượt 2 tháng thử việc xuất sắc và đạt KPI đầu tiên.',
    subtitle_en: 'Build ATS resumes, practice mock interviews, pass 2-month probation & hit first KPIs.',
    salaryRange_vi: 'Thu nhập khởi điểm: 8 - 18 triệu VNĐ/tháng',
    salaryRange_en: 'Entry-level salary: $400 - $900/mo',
    readinessFactors: [
      { key: 'cv_score', label_vi: 'Độ tối ưu CV chuẩn ATS & Hồ sơ LinkedIn', label_en: 'ATS Resume & LinkedIn Optimization', defaultValue: 70 },
      { key: 'interview', label_vi: 'Kỹ năng trả lời Phỏng vấn tuyển dụng', label_en: 'Interview & Behavioral Skills', defaultValue: 55 },
      { key: 'probation', label_vi: 'Tốc độ hoàn thành công việc & Thử việc', label_en: 'Probation Task Execution Speed', defaultValue: 65 },
      { key: 'ai_tools', label_vi: 'Ứng dụng AI tăng tốc xử lý công việc', label_en: 'AI Productivity Tools Mastery', defaultValue: 80 }
    ],
    checklist: [
      { id: 'jn_1', title_vi: 'Thiết kế CV chuẩn ATS quét từ khóa tuyển dụng', title_en: 'Create ATS-friendly keyword-optimized CV', category: 'CV' },
      { id: 'jn_2', title_vi: 'Thực hành 3 buổi phỏng vấn giả định 1-1 với AI Agent', title_en: 'Complete 3 AI mock interview sessions', category: 'Interview' },
      { id: 'jn_3', title_vi: 'Lập Kế hoạch 60 ngày vượt thử việc tại công ty mới', title_en: 'Draft 60-day probation survival checklist', category: 'Probation' },
      { id: 'jn_4', title_vi: 'Học kỹ năng viết email công sở, Slack etiquette & báo cáo Sếp', title_en: 'Master workplace email & Slack etiquette', category: 'Communication' },
      { id: 'jn_5', title_vi: 'Thiết lập mục tiêu KPIs cá nhân quý đầu tiên', title_en: 'Set first quarter personal KPI targets', category: 'Performance' }
    ],
    highlights_vi: [
      'Viết CV ấn tượng chuẩn ATS tuyển dụng',
      'Luyện phỏng vấn thử 1-1 phản hồi tức thì với AI Agent',
      'Kỹ năng giao tiếp công sở, email chuyên nghiệp & báo cáo',
      'Thiết lập mục tiêu thăng tiến từ Junior lên Midweight'
    ],
    highlights_en: [
      'Write ATS-optimized professional resumes',
      'Practice 1-on-1 AI mock interviews with real-time feedback',
      'Workplace communication, email & reporting skills',
      'Set goals to advance from Junior to Mid-level'
    ],
    actionPrompts: [
      {
        title_vi: 'Mô phỏng phỏng vấn vị trí Junior Web Developer',
        title_en: 'Junior Web Developer Mock Interview',
        prompt_vi: 'Hãy đóng vai Trưởng phòng Kỹ thuật công ty FPT và phỏng vấn tôi vị trí Junior Web Developer với 5 câu hỏi thực tế.',
        prompt_en: 'Act as a Tech Lead and interview me for a Junior Web Developer position with 5 real interview questions.'
      },
      {
        title_vi: 'Chiến lược vượt 2 tháng thử việc xuất sắc',
        title_en: 'Strategy to pass 2-month probation with distinction',
        prompt_vi: 'Tôi sắp bắt đầu 2 tháng thử việc tại công ty mới. Cho tôi checklist hành động theo tuần để ghi điểm với sếp.',
        prompt_en: 'I am starting my 2-month probation. Give me a weekly action plan to impress my manager.'
      }
    ]
  },
  {
    id: 'mid_senior',
    icon: 'TrendingUp',
    badge_vi: 'Giai đoạn 3: Đi Làm 2-5 Năm (Mid / Senior)',
    badge_en: 'Stage 3: Mid / Senior Professional (2-5 yrs)',
    title_vi: 'Thăng Tiến Quản Lý, Đàm Phán Lương & Reskilling',
    title_en: 'Management Promotion, Negotiation & Reskilling',
    subtitle_vi: 'Nâng cao năng lực lãnh đạo, làm chủ tự động hóa AI, đàm phán tăng lương 30-50% hoặc chuyển đổi nghề đột phá.',
    subtitle_en: 'Advance to Team Lead, master AI efficiency tools, negotiate 30-50% raises or switch domains.',
    salaryRange_vi: 'Thu nhập chuyên sâu: 20 - 55 triệu VNĐ/tháng',
    salaryRange_en: 'Mid/Senior salary: $1,000 - $2,500/mo',
    readinessFactors: [
      { key: 'leadership', label_vi: 'Kỹ năng Lãnh đạo nhóm & Quản lý dự án', label_en: 'Leadership & Project Management', defaultValue: 60 },
      { key: 'negotiation', label_vi: 'Năng lực Đàm phán lương & Thuyết phục', label_en: 'Salary Negotiation & Persuasion', defaultValue: 50 },
      { key: 'ai_automation', label_vi: 'Tự động hóa công việc bằng AI Workflow', label_en: 'AI Automation Workflows', defaultValue: 75 },
      { key: 'network', label_vi: 'Mạng lưới quan hệ đối tác trong ngành', label_en: 'Industry Professional Network', defaultValue: 55 }
    ],
    checklist: [
      { id: 'ms_1', title_vi: 'Xây dựng Báo cáo giá trị đóng góp (Impact Report) cho review lương', title_en: 'Build Value Impact Report for annual salary review', category: 'Salary' },
      { id: 'ms_2', title_vi: 'Thực hành kịch bản Đàm phán tăng lương 30% với Giám đốc', title_en: 'Practice 30% raise negotiation script with CEO', category: 'Negotiation' },
      { id: 'ms_3', title_vi: 'Tham gia khóa học Lãnh đạo / Quản lý dự án (Agile/PMP/Scrum)', title_en: 'Enroll in Project Management (Agile/PMP/Scrum)', category: 'Management' },
      { id: 'ms_4', title_vi: 'Xây dựng 1 hệ thống AI Workflow tự động hóa 40% công việc hàng ngày', title_en: 'Build AI Workflow automating 40% daily tasks', category: 'AI Tools' },
      { id: 'ms_5', title_vi: 'Cập nhật Profile LinkedIn chuyên gia để thu hút Headhunter', title_en: 'Optimize Executive LinkedIn Profile for Headhunters', category: 'Branding' }
    ],
    highlights_vi: [
      'Xây dựng lộ trình thăng tiến lên Trưởng nhóm (Team Lead / Manager)',
      'Đàm phán tăng lương dựa trên thành tích công việc thực tế',
      'Reskilling & Ứng dụng AI tự động hóa công việc hàng ngày',
      'Chuyển đổi nghề nghiệp sang các lĩnh vực xu hướng mới'
    ],
    highlights_en: [
      'Roadmap to advance to Team Lead / Manager',
      'Data-backed salary negotiation techniques',
      'Reskilling & integrating AI tools into daily workflows',
      'Career pivoting into emerging high-growth industries'
    ],
    actionPrompts: [
      {
        title_vi: 'Chiến lược đàm phán tăng lương 30% khi review',
        title_en: '30% Salary Increase Negotiation Blueprint',
        prompt_vi: 'Tôi đã đi làm 2 năm và đóng góp 3 dự án lớn. Hướng dẫn tôi kịch bản đàm phán tăng lương 30% với Giám đốc.',
        prompt_en: 'I have 2 years of experience and delivered 3 major projects. Provide a step-by-step 30% salary review script.'
      },
      {
        title_vi: 'Lộ trình chuyển ngành từ Marketing sang Product Manager',
        title_en: 'Marketing to Product Manager Career Pivot',
        prompt_vi: 'Tôi có 3 năm kinh nghiệm Marketing và muốn chuyển sang làm Product Manager. Lập cho tôi lộ trình 6 tháng học bổ sung.',
        prompt_en: 'I have 3 years in Marketing and want to transition to Product Manager. Create a 6-month reskilling plan.'
      }
    ]
  },
  {
    id: 'alumni',
    icon: 'Users',
    badge_vi: 'Giai đoạn 4: Cựu Sinh Viên & Expert Mentor',
    badge_en: 'Stage 4: Alumni & Expert Mentor',
    title_vi: 'Mạng Lưới Alumni, Tuyển Dụng & Truyền Trực Kinh Nghiệm',
    title_en: 'Alumni Network, Hiring & Mentorship',
    subtitle_vi: 'Kết nối mạng lưới cựu sinh viên, đăng tin tuyển dụng mentee trẻ và xây dựng thương hiệu cá nhân cấp quản lý.',
    subtitle_en: 'Connect with university alumni, hire promising mentees, and build your executive personal brand.',
    salaryRange_vi: 'Thu nhập Cấp cao & Advisory: 50 - 100+ triệu VNĐ/tháng',
    salaryRange_en: 'Executive & Advisory income: $2,500 - $5,000+/mo',
    readinessFactors: [
      { key: 'mentorship', label_vi: 'Năng lực Đào tạo & Mentoring sinh viên', label_en: 'Mentoring & Coaching Capabilities', defaultValue: 70 },
      { key: 'recruitment', label_vi: 'Mạng lưới tuyển dụng Mentee & Talent pool', label_en: 'Talent Acquisition & Mentee Pool', defaultValue: 65 },
      { key: 'brand', label_vi: 'Thương hiệu cá nhân Chuyên gia trên mạng xã hội', label_en: 'Thought Leadership Personal Brand', defaultValue: 60 },
      { key: 'alumni_network', label_vi: 'Mức độ kết nối Mạng lưới Cựu sinh viên', label_en: 'Alumni Network Connectivity', defaultValue: 80 }
    ],
    checklist: [
      { id: 'al_1', title_vi: 'Đăng ký trở thành Verified Mentor hướng dẫn sinh viên khóa dưới', title_en: 'Register as Verified Mentor for junior students', category: 'Mentorship' },
      { id: 'al_2', title_vi: 'Đăng 1 tin tuyển dụng Thực tập sinh / Junior trực tiếp cho công ty', title_en: 'Post 1 internship/junior opening for your firm', category: 'Hiring' },
      { id: 'al_3', title_vi: 'Viết 2 bài chia sẻ kinh nghiệm chuyên môn trên LinkedIn / Facebook Group', title_en: 'Publish 2 industry insight articles on LinkedIn', category: 'Thought Leadership' },
      { id: 'al_4', title_vi: 'Tham gia Sự kiện Mạng lưới Cựu Sinh viên Đại học', title_en: 'Attend University Alumni Networking Event', category: 'Networking' }
    ],
    highlights_vi: [
      'Tham gia Mạng lưới Alumni & Cựu sinh viên thành công',
      'Trở thành Mentor hướng dẫn sinh viên khóa dưới',
      'Đăng tin tuyển dụng thực tập sinh trực tiếp trên hệ thống',
      'Xây dựng thương hiệu cá nhân uy tín trong ngành'
    ],
    highlights_en: [
      'Join successful alumni network & executive circles',
      'Become a verified Mentor guiding junior students',
      'Post internship & junior job openings directly',
      'Build an influential industry personal brand'
    ],
    actionPrompts: [
      {
        title_vi: 'Tư vấn xây dựng thương hiệu cá nhân trên LinkedIn',
        title_en: 'Building an Executive Personal Brand on LinkedIn',
        prompt_vi: 'Hướng dẫn tôi chiến lược xây dựng thương hiệu cá nhân chuyên gia trên LinkedIn để thu hút cơ hội hợp tác.',
        prompt_en: 'Guide me on building an authoritative personal brand on LinkedIn to attract high-level opportunities.'
      }
    ]
  }
];

export const CareerLifecycleManager: React.FC<CareerLifecycleManagerProps> = ({
  language,
  user,
  onSendPromptToChat,
  showToast,
  onRequestUpgrade
}) => {
  const isVi = language === Language.VI;
  const currentSub = getSubscriptionDetails(user?.subscription);
  const [activeStage, setActiveStage] = useState<CareerStage>('junior');

  // Max Feature: Skill Bridge / Reskilling State
  const [currentBg, setCurrentBg] = useState('');
  const [targetSkillRole, setTargetSkillRole] = useState('');
  const [isSkillBridgeLoading, setIsSkillBridgeLoading] = useState(false);
  const [reskillingResult, setReskillingResult] = useState<{
    transferableSkills: string[];
    skillGaps: string[];
    roadmap90Days: { phase: string; title: string; tasks: string[] }[];
  } | null>(null);

  const handleGenerateReskillingRoadmap = async () => {
    if (!currentSub.unlockedFeatures?.upskillReskilling) {
      onRequestUpgrade?.(isVi ? 'Lộ trình Chuyển ngành & Upskill Chuyên Sâu (Gói CAREER MAX)' : 'Reskilling & Skill Bridge Matrix (Career MAX)');
      return;
    }

    if (!currentBg.trim() || !targetSkillRole.trim()) {
      showToast(isVi ? 'Vui lòng điền cả xuất phát điểm hiện tại và ngành tiêu điểm.' : 'Please enter both current background and target role.', 'info');
      return;
    }

    setIsSkillBridgeLoading(true);
    try {
      const prompt = `Bạn là chuyên gia tư vấn Chuyển ngành & Upskill nhân sự.
Xuất phát điểm hiện tại: ${currentBg}
Vị trí tiêu điểm muốn chuyển đến: ${targetSkillRole}

Hãy lập lộ trình chuyển ngành 90 ngày và phân tích kỹ năng.
Trả về duy nhất JSON object (không markdown):
{
  "transferableSkills": ["Kỹ năng A có thể kế thừa", "Kỹ năng B"],
  "skillGaps": ["Kỹ năng thiếu hụt 1", "Kỹ năng thiếu hụt 2"],
  "roadmap90Days": [
    { "phase": "Tháng 1 (Ngày 1-30)", "title": "Bổ sung nền tảng cốt lõi", "tasks": ["Nhiệm vụ 1", "Nhiệm vụ 2"] },
    { "phase": "Tháng 2 (Ngày 31-60)", "title": "Thực hành dự án Portfolio", "tasks": ["Nhiệm vụ 1", "Nhiệm vụ 2"] },
    { "phase": "Tháng 3 (Ngày 61-90)", "title": "Luyện CV & Phỏng vấn chuyển ngành", "tasks": ["Nhiệm vụ 1", "Nhiệm vụ 2"] }
  ]
}`;

      const rawText = await requestAiContent(prompt, "You are a career transition and upskilling consultant. Output JSON only.", language);
      const cleanJson = rawText.replace(/```json\s*|\s*```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      setReskillingResult(parsed);
      showToast(isVi ? '🌉 Đã tạo thành công Lộ trình Chuyển ngành 90 Ngày!' : '🌉 Successfully built 90-Day Reskilling Roadmap!', 'success');
    } catch (e: any) {
      console.error(e);
      showToast(e.message || (isVi ? 'Tạo lộ trình chuyển ngành thất bại.' : 'Reskilling generation failed.'), 'error');
    } finally {
      setIsSkillBridgeLoading(false);
    }
  };
  const [completedChecklist, setCompletedChecklist] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('career_lifecycle_checklist');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [factorScores, setFactorScores] = useState<Record<string, number>>({});
  const [customRole, setCustomRole] = useState('');
  const [customGoal, setCustomGoal] = useState('');

  const currentStageConfig = CAREER_STAGES.find(s => s.id === activeStage) || CAREER_STAGES[1];

  useEffect(() => {
    // Reset factor score defaults for new stage
    const initial: Record<string, number> = {};
    currentStageConfig.readinessFactors.forEach(f => {
      initial[f.key] = f.defaultValue;
    });
    setFactorScores(initial);
  }, [activeStage]);

  const toggleCheckitem = (itemId: string) => {
    setCompletedChecklist(prev => {
      const next = { ...prev, [itemId]: !prev[itemId] };
      try {
        localStorage.setItem('career_lifecycle_checklist', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
    showToast(isVi ? 'Đã cập nhật tiến độ mốc sự nghiệp!' : 'Career milestone progress updated!', 'success');
  };

  // Calculate stage completion percentage
  const stageItems = currentStageConfig.checklist;
  const completedCount = stageItems.filter(i => completedChecklist[i.id]).length;
  const stageProgressPct = Math.round((completedCount / stageItems.length) * 100);

  // Calculate overall career readiness health score
  const readinessValues = Object.values(factorScores);
  const avgReadiness = readinessValues.length > 0 
    ? Math.round(readinessValues.reduce((a, b) => a + b, 0) / readinessValues.length)
    : 70;

  const handleGenerateCustomPrompt = () => {
    if (!customRole.trim()) {
      showToast(isVi ? 'Vui lòng nhập vị trí hoặc ngành công việc!' : 'Please enter target job title or industry!', 'info');
      return;
    }
    const prompt = isVi
      ? `Tôi đang ở giai đoạn "${currentStageConfig.title_vi}" với vị trí "${customRole}". Mục tiêu chính của tôi là: "${customGoal || 'Nâng cao thu nhập & thăng tiến'}". Điểm sẵn sàng hiện tại là ${avgReadiness}/100. Hãy lập cho tôi Kế hoạch hành động 30-60-90 ngày chi tiết để đạt bứt phá.`
      : `I am in the "${currentStageConfig.title_en}" stage targeting the role "${customRole}". My goal is: "${customGoal || 'Advance career & increase salary'}". My readiness index is ${avgReadiness}/100. Generate a detailed 30-60-90 day breakthrough action plan for me.`;
    
    onSendPromptToChat(prompt);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-teal-700 via-cyan-800 to-indigo-900 text-white shadow-xl relative overflow-hidden border border-teal-700/50">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
            <Icons.Infinity className="w-4 h-4 text-cyan-300 animate-spin-slow" />
            <span>{isVi ? "Vòng Đời Sự Nghiệp Trọn Đời (Lifetime Career Lifecycle)" : "Lifetime Career Lifecycle"}</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-black tracking-tight leading-tight">
            {isVi ? "Đồng Hành Cùng Bạn Từ Ghế Nhà Trường Đến Cấp Quản Lý" : "Your Lifelong AI Career Companion"}
          </h2>
          <p className="text-cyan-100 text-xs md:text-sm max-w-3xl leading-relaxed font-sans">
            {isVi
              ? "Ứng dụng không dừng lại khi bạn ra trường! CareerGuide AI đồng hành trọn vẹn 5-10 năm đi làm: Từ chọn ngành THPT, vượt thử việc Junior, đàm phán tăng lương 30-50%, reskilling AI đến trở thành Verified Mentor."
              : "We support your full 10-year journey: From high school major selection to probation survival, 30-50% raise negotiation, AI reskilling, and becoming a Verified Alumni Mentor."}
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-extrabold text-cyan-200">
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
              <Icons.ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isVi ? "4 Giai đoạn phát triển" : "4 Career Stages"}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
              <Icons.TrendingUp className="w-4 h-4 text-amber-300" />
              <span>{isVi ? "Dự báo khoảng thu nhập" : "Income Bracket Benchmarks"}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
              <Icons.Sparkles className="w-4 h-4 text-purple-300" />
              <span>{isVi ? "AI Action Plan 30-60-90 Ngày" : "30-60-90 Day AI Action Plan"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lifecycle Stage Switcher Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {CAREER_STAGES.map(stage => {
          const isActive = activeStage === stage.id;
          const stageCheckItems = stage.checklist;
          const stageDone = stageCheckItems.filter(i => completedChecklist[i.id]).length;
          const stagePct = Math.round((stageDone / stageCheckItems.length) * 100);

          return (
            <button
              key={stage.id}
              onClick={() => setActiveStage(stage.id)}
              className={`p-4 md:p-5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3 relative group cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-b from-indigo-600 to-indigo-800 text-white border-indigo-600 shadow-lg ring-2 ring-indigo-400/30'
                  : 'bg-white dark:bg-[#111] text-gray-700 dark:text-gray-200 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg ${
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300'
                }`}>
                  {isVi ? stage.badge_vi.split(':')[0] : stage.badge_en.split(':')[0]}
                </span>
                {stagePct === 100 && (
                  <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <Icons.Check className="w-3 h-3" />
                    100%
                  </span>
                )}
              </div>

              <div>
                <h4 className="font-extrabold text-sm md:text-base leading-snug">
                  {isVi ? stage.title_vi : stage.title_en}
                </h4>
                <p className={`text-[11px] mt-1 line-clamp-1 font-medium ${isActive ? 'text-indigo-100' : 'text-gray-500'}`}>
                  {isVi ? stage.subtitle_vi : stage.subtitle_en}
                </p>
              </div>

              {/* Progress mini bar */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className={isActive ? 'text-indigo-200' : 'text-gray-400'}>
                    {isVi ? `Tiến độ mốc: ${stageDone}/${stageCheckItems.length}` : `Milestones: ${stageDone}/${stageCheckItems.length}`}
                  </span>
                  <span className={isActive ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}>{stagePct}%</span>
                </div>
                <div className={`w-full h-1.5 rounded-full overflow-hidden ${isActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-white/10'}`}>
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isActive ? 'bg-emerald-400' : 'bg-indigo-600'}`}
                    style={{ width: `${stagePct}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Active Stage Interactive Portal */}
      <div className="bg-white dark:bg-[#111] p-6 md:p-8 rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm space-y-8">
        
        {/* Stage Header Info */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-gray-100 dark:border-white/10 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                {isVi ? currentStageConfig.badge_vi : currentStageConfig.badge_en}
              </span>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Icons.TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                {isVi ? currentStageConfig.salaryRange_vi : currentStageConfig.salaryRange_en}
              </span>
            </div>

            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {isVi ? currentStageConfig.title_vi : currentStageConfig.title_en}
            </h3>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 font-sans leading-relaxed">
              {isVi ? currentStageConfig.subtitle_vi : currentStageConfig.subtitle_en}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-center">
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase">
                {isVi ? "Hoàn Thành Mốc" : "Milestones Done"}
              </span>
              <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                {completedCount}/{stageItems.length}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-center">
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase">
                {isVi ? "Chỉ Số Sẵn Sàng" : "Readiness Score"}
              </span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {avgReadiness}/100
              </span>
            </div>
          </div>
        </div>

        {/* 2-Column Grid: Left Checklist, Right Interactive Career Health Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Column 1: Checklist & Milestones (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <Icons.CheckSquare className="w-4 h-4 text-indigo-500" />
                <span>{isVi ? "Danh Sách Mốc Hành Động Quan Trọng:" : "Actionable Milestone Checklist:"}</span>
              </h4>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{stageProgressPct}% {isVi ? "Hoàn thành" : "Completed"}</span>
            </div>

            <div className="space-y-2.5">
              {stageItems.map(item => {
                const isChecked = !!completedChecklist[item.id];
                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => toggleCheckitem(item.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                      isChecked
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40'
                        : 'bg-gray-50/50 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-indigo-300'
                    }`}
                  >
                    <div className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                      isChecked
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                    }`}>
                      {isChecked && <Icons.Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-extrabold font-sans leading-snug ${
                          isChecked ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'
                        }`}>
                          {isVi ? item.title_vi : item.title_en}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300 shrink-0">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Stage Core Competencies Box */}
            <div className="p-5 rounded-2xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/15 space-y-3 mt-6">
              <h5 className="text-xs font-extrabold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
                <Icons.Award className="w-4 h-4 text-indigo-600" />
                <span>{isVi ? "Trọng Tâm Phát Triển Năng Lực" : "Core Competency Focus"}</span>
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(isVi ? currentStageConfig.highlights_vi : currentStageConfig.highlights_en).map((h, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 font-medium">
                    <Icons.CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Career Readiness Health Index Simulator (5 cols) */}
          <div className="lg:col-span-5 bg-gray-50 dark:bg-white/5 p-6 rounded-3xl border border-gray-200 dark:border-white/10 space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <Icons.Sliders className="w-4 h-4 text-emerald-500" />
                <span>{isVi ? "Đánh Giá Chỉ Số Sẵn Sàng:" : "Readiness Health Simulator:"}</span>
              </h4>
              <span className={`text-xs font-black px-2.5 py-1 rounded-xl ${
                avgReadiness >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                avgReadiness >= 60 ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' :
                'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
              }`}>
                {avgReadiness >= 80 ? (isVi ? 'Xuất Sắc (Ready)' : 'Excellent') :
                 avgReadiness >= 60 ? (isVi ? 'Đạt Tiêu Chuẩn' : 'Good') : (isVi ? 'Cần Bổ Sung' : 'Needs Work')}
              </span>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug">
              {isVi
                ? "Kéo thanh trượt đánh giá thực tế các tiêu chí bên dưới để AI tính toán mức độ tự tin và dự báo tốc độ thăng tiến."
                : "Adjust the sliders below to calculate your real-time career readiness score and growth speed."}
            </p>

            {/* Sliders */}
            <div className="space-y-4">
              {currentStageConfig.readinessFactors.map(factor => {
                const val = factorScores[factor.key] ?? factor.defaultValue;
                return (
                  <div key={factor.key} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold text-gray-700 dark:text-gray-300">
                      <span>{isVi ? factor.label_vi : factor.label_en}</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-mono">{val}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={val}
                      onChange={(e) => setFactorScores({ ...factorScores, [factor.key]: Number(e.target.value) })}
                      className="w-full accent-indigo-600 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>

            {/* AI Custom 30-60-90 Day Prompt Builder Form */}
            <div className="pt-4 border-t border-gray-200 dark:border-white/10 space-y-3">
              <h5 className="text-xs font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
                <Icons.Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{isVi ? "Tạo Kế Hoạch AI 30-60-90 Ngày Theo Mục Tiêu:" : "Generate 30-60-90 Day AI Plan:"}</span>
              </h5>

              <div className="space-y-2">
                <input
                  type="text"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  placeholder={isVi ? "Vị trí / Ngành tiêu điểm (VD: Java Dev, Digital Marketing...)" : "Target role (e.g., Java Dev, Digital Marketing...)"}
                  className="w-full bg-white dark:bg-black/30 border border-gray-250 dark:border-white/15 rounded-xl px-3 py-2 text-xs font-medium text-gray-800 dark:text-white focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  placeholder={isVi ? "Mục tiêu cụ thể (VD: Tăng lương 30%, Vượt 2 tháng thử việc...)" : "Specific goal (e.g., 30% raise, pass probation...)"}
                  className="w-full bg-white dark:bg-black/30 border border-gray-250 dark:border-white/15 rounded-xl px-3 py-2 text-xs font-medium text-gray-800 dark:text-white focus:outline-none focus:border-indigo-500"
                />

                <button
                  onClick={handleGenerateCustomPrompt}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Icons.Send className="w-3.5 h-3.5" />
                  <span>{isVi ? "Gửi Yêu Cầu Cho AI Trợ Lý" : "Ask AI Assistant"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Prompts Grid tailored for stage */}
        <div className="pt-6 border-t border-gray-100 dark:border-white/10 space-y-4">
          <h4 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Icons.Zap className="w-4 h-4 text-amber-500" />
            <span>{isVi ? "Mẫu Prompt AI Đột Phá Chuẩn Cho Giai Đoạn Này:" : "Recommended Breakthrough AI Prompts:"}</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentStageConfig.actionPrompts.map((ap, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 flex flex-col justify-between space-y-3 hover:border-indigo-400 transition-all"
              >
                <div>
                  <h5 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                    <Icons.Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{isVi ? ap.title_vi : ap.title_en}</span>
                  </h5>
                  <p className="text-xs text-gray-600 dark:text-gray-300 font-mono mt-2 bg-white dark:bg-black/40 p-3 rounded-xl border border-gray-200 dark:border-white/10 leading-relaxed">
                    "{isVi ? ap.prompt_vi : ap.prompt_en}"
                  </p>
                </div>

                <button
                  onClick={() => onSendPromptToChat(isVi ? ap.prompt_vi : ap.prompt_en)}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Icons.Send className="w-3.5 h-3.5" />
                  <span>{isVi ? "Kích Hoạt Hỏi AI Ngay" : "Ask AI Assistant"}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Skill Bridge & Reskilling Matrix Section (CAREER MAX FEATURE) */}
        <div className="pt-6 border-t border-gray-100 dark:border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[11px] font-extrabold uppercase tracking-wider mb-1">
                <Icons.Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {isVi ? 'Đặc Quyền Gói Career MAX' : 'Career MAX Exclusive'}
              </div>
              <h4 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                <span>🌉 Skill Bridge: Lộ Trình Chuyển Ngành & Upskill Matrix</span>
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isVi 
                  ? 'Phân tích kỹ năng kế thừa từ ngành cũ, xác định lỗ hổng kỹ năng cốt lõi và xây dựng kế hoạch hành động 90 ngày.' 
                  : 'Map transferable skills from your previous background, identify skill gaps, and execute a 90-day transition plan.'}
              </p>
            </div>
            {!currentSub.unlockedFeatures?.upskillReskilling && (
              <button
                onClick={() => onRequestUpgrade?.(isVi ? 'Lộ trình Chuyển ngành & Upskill Chuyên Sâu (Gói CAREER MAX)' : 'Reskilling & Skill Bridge Matrix (Career MAX)')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs shadow hover:brightness-110 transition-all self-start sm:self-auto whitespace-nowrap"
              >
                🔒 {isVi ? 'Mở Khóa Gói MAX' : 'Unlock MAX Tier'}
              </button>
            )}
          </div>

          <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-purple-500/5 border border-amber-500/20 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {isVi ? 'Xuất phát điểm hiện tại:' : 'Current Background / Major:'}
                </label>
                <input
                  type="text"
                  value={currentBg}
                  onChange={e => setCurrentBg(e.target.value)}
                  placeholder={isVi ? 'VD: Nhân viên Sales, Kế toán, Marketing, Giáo viên...' : 'e.g., Sales rep, Accountant, Teacher, Non-tech'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/40 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {isVi ? 'Vị trí / Ngành tiêu điểm muốn chuyển đến:' : 'Target Career Goal:'}
                </label>
                <input
                  type="text"
                  value={targetSkillRole}
                  onChange={e => setTargetSkillRole(e.target.value)}
                  placeholder={isVi ? 'VD: Data Analyst, AI Engineer, Product Owner...' : 'e.g., Data Analyst, AI Engineer, Product Owner'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/40 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateReskillingRoadmap}
              disabled={isSkillBridgeLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-slate-950 font-black text-xs hover:brightness-110 transition-all shadow flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSkillBridgeLoading ? <Icons.Loader2 className="w-4 h-4 animate-spin" /> : <Icons.Zap className="w-4 h-4" />}
              <span>{isVi ? '🚀 Lập Lộ Trình Chuyển Ngành 90 Ngày (AI Matrix)' : '🚀 Generate 90-Day Reskilling Roadmap'}</span>
            </button>

            {reskillingResult && (
              <div className="pt-4 border-t border-amber-500/20 space-y-4 text-xs animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-white dark:bg-gray-900 border border-emerald-500/30 space-y-1.5">
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <Icons.CheckCircle className="w-4 h-4" />
                      {isVi ? 'Kỹ năng có thể kế thừa (Transferable Skills):' : 'Transferable Skills:'}
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                      {reskillingResult.transferableSkills?.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-gray-900 border border-rose-500/30 space-y-1.5">
                    <span className="font-extrabold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <Icons.AlertCircle className="w-4 h-4" />
                      {isVi ? 'Kỹ năng cần bổ sung gấp (Skill Gaps):' : 'Critical Skill Gaps:'}
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                      {reskillingResult.skillGaps?.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <span className="font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <Icons.Calendar className="w-4 h-4 text-amber-500" />
                    {isVi ? 'Lộ Trình Hành Động 90 Ngày Chi Tiết:' : 'Detailed 90-Day Action Roadmap:'}
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {reskillingResult.roadmap90Days?.map((step, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 space-y-2">
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-[10px] block w-fit">
                          {step.phase}
                        </span>
                        <h5 className="font-extrabold text-gray-900 dark:text-white">{step.title}</h5>
                        <ul className="list-disc list-inside space-y-1 text-[11px] text-gray-600 dark:text-gray-400">
                          {step.tasks?.map((t, tidx) => (
                            <li key={tidx}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

