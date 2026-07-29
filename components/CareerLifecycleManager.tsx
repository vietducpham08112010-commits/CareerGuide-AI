import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import { Language, UserProfile } from '../types';

interface CareerLifecycleManagerProps {
  language: Language;
  user: UserProfile | null;
  onSendPromptToChat: (promptText: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export type CareerStage = 'student' | 'junior' | 'mid_senior' | 'alumni';

interface StageConfig {
  id: CareerStage;
  icon: string;
  badge_vi: string;
  badge_en: string;
  title_vi: string;
  title_en: string;
  subtitle_vi: string;
  subtitle_en: string;
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
    subtitle_vi: 'Chọn đúng ngành học, đạt điểm chuẩn, luyện tiếng Anh và tạo Portfolio sinh viên ấn tượng.',
    subtitle_en: 'Select right major, meet cutoff scores, master English & build early portfolio.',
    highlights_vi: [
      'Tra cứu điểm chuẩn đại học & học bổng mới nhất',
      'Đánh giá trắc nghiệm tính cách & sở thích nghề nghiệp',
      'Luyện thi chứng chỉ tiếng Anh (IELTS / TOEIC)',
      'Tham gia hoạt động ngoại khóa & dự án cá nhân'
    ],
    highlights_en: [
      'Check latest university cutoff scores & scholarships',
      'Personality & career orientation quiz',
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
    subtitle_vi: 'Tạo CV chuẩn ATS, luyện phỏng vấn thực tế với AI, vượt 2 tháng thử việc và đạt KPI đầu tiên.',
    subtitle_en: 'Build ATS resumes, practice mock interviews, pass 2-month probation & hit first KPIs.',
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
    subtitle_vi: 'Nâng cao năng lực lãnh đạo, làm chủ công cụ AI hiện đại, đàm phán tăng lương 30-50% hoặc chuyển ngành.',
    subtitle_en: 'Advance to Team Lead, master AI efficiency tools, negotiate 30-50% raises or switch domains.',
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
    subtitle_vi: 'Kết nối mạng lưới cựu sinh viên, đăng tin tuyển dụng mentee trẻ và xây dựng thương hiệu cá nhân.',
    subtitle_en: 'Connect with university alumni, hire promising mentees, and build your executive personal brand.',
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
  showToast
}) => {
  const isVi = language === Language.VI;
  const [activeStage, setActiveStage] = useState<CareerStage>('junior');

  const currentStageConfig = CAREER_STAGES.find(s => s.id === activeStage) || CAREER_STAGES[1];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-700 via-cyan-800 to-blue-900 text-white shadow-xl relative overflow-hidden border border-teal-700/50">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
            <Icons.Infinity className="w-4 h-4 text-cyan-300" />
            {isVi ? "Vòng Đời Sự Nghiệp Trọn Đời" : "Lifetime Career Life Cycle"}
          </div>
          <h2 className="text-2xl md:text-3xl font-black">
            {isVi ? "Đồng Hành Cùng Bạn Từ Ghế Nhà Trường Đến Cấp Quản Lý" : "Your Lifelong AI Career Companion"}
          </h2>
          <p className="text-cyan-100 text-sm max-w-3xl leading-relaxed">
            {isVi
              ? "App không chỉ dừng lại khi bạn ra trường! CareerGuide AI tiếp tục đồng hành trong suốt 5-10 năm đi làm: từ thử việc, thăng tiến, đàm phán lương đến trở thành Mentor truyền cảm hứng."
              : "We don't stop after graduation! CareerGuide AI supports your 5-10 year journey: from probation to management, salary negotiation, and becoming a Mentor."}
          </p>
        </div>
      </div>

      {/* Lifecycle Stage Switcher Buttons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {CAREER_STAGES.map(stage => {
          const isActive = activeStage === stage.id;
          return (
            <button
              key={stage.id}
              onClick={() => setActiveStage(stage.id)}
              className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                isActive
                  ? 'bg-gradient-to-b from-indigo-600 to-indigo-800 text-white border-indigo-600 shadow-md ring-2 ring-indigo-400/30'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/60'
              }`}
            >
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full w-fit ${
                isActive ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}>
                {isVi ? stage.badge_vi.split(':')[0] : stage.badge_en.split(':')[0]}
              </span>

              <h4 className="font-bold text-sm leading-snug">
                {isVi ? stage.title_vi : stage.title_en}
              </h4>

              <div className="flex items-center justify-between text-xs pt-1 opacity-90">
                <span className="text-[11px] truncate">{isVi ? stage.badge_vi.split(':')[1] : stage.badge_en.split(':')[1]}</span>
                {isActive && <Icons.CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Stage Detail Panel */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
          <div>
            <span className="text-xs font-bold uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
              {isVi ? currentStageConfig.badge_vi : currentStageConfig.badge_en}
            </span>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
              {isVi ? currentStageConfig.title_vi : currentStageConfig.title_en}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
              {isVi ? currentStageConfig.subtitle_vi : currentStageConfig.subtitle_en}
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center gap-1.5 w-fit">
            <Icons.Check className="w-4 h-4 text-emerald-500" />
            {isVi ? "Giai đoạn hoạt động hiện tại" : "Active career stage"}
          </span>
        </div>

        {/* Highlight points */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(isVi ? currentStageConfig.highlights_vi : currentStageConfig.highlights_en).map((h, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-start gap-3"
            >
              <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                {idx + 1}
              </div>
              <span className="text-xs text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                {h}
              </span>
            </div>
          ))}
        </div>

        {/* Action Prompts tailored for stage */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Icons.Sparkles className="w-4 h-4 text-amber-500" />
            {isVi ? "Câu Hỏi Gợi Ý Chuẩn AI Cho Giai Đoạn Này" : "Recommended AI Prompts for This Stage"}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentStageConfig.actionPrompts.map((ap, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col justify-between space-y-3"
              >
                <div>
                  <h5 className="font-bold text-sm text-gray-900 dark:text-white">
                    {isVi ? ap.title_vi : ap.title_en}
                  </h5>
                  <p className="text-xs text-gray-500 font-mono mt-2 bg-gray-50 dark:bg-gray-950 p-2.5 rounded-lg border border-gray-200 dark:border-gray-800">
                    "{isVi ? ap.prompt_vi : ap.prompt_en}"
                  </p>
                </div>

                <button
                  onClick={() => onSendPromptToChat(isVi ? ap.prompt_vi : ap.prompt_en)}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <Icons.Send className="w-3.5 h-3.5" />
                  {isVi ? "Hỏi Trợ Lý AI Ngay" : "Ask AI Assistant"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
