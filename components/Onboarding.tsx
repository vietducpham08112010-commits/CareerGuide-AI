import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  GraduationCap, 
  Compass, 
  Laptop, 
  ArrowRight, 
  ArrowLeft, 
  Award, 
  Check, 
  BrainCircuit, 
  Target, 
  Users, 
  PenTool, 
  BookOpen
} from 'lucide-react';
import { UserProfile, Language, Theme, AIProvider, PortfolioItem } from '../types';

interface OnboardingProps {
  lang: Language;
  theme: Theme;
  onComplete: (profile: Partial<UserProfile>) => void;
  onActivateDemo: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({
  lang,
  theme,
  onComplete,
  onActivateDemo
}) => {
  const isVi = lang === Language.VI;
  const [step, setStep] = useState(0);

  // Form states
  const [eduLevel, setEduLevel] = useState('');
  const [academicKhối, setAcademicKhối] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [userGoal, setUserGoal] = useState('');

  const grades = isVi ? [
    { id: '9-below', label: 'Học sinh Lớp 9 hoặc thấp hơn', desc: 'Định hướng ôn thi vào lớp 10 & lựa chọn tổ hợp môn học sớm' },
    { id: '10', label: 'Học sinh Lớp 10', desc: 'Mới vào THPT, làm quen môi trường học tập mới' },
    { id: '11', label: 'Học sinh Lớp 11', desc: 'Chọn tổ hợp chuyên sâu, bồi đắp kỹ năng' },
    { id: '12', label: 'Học sinh Lớp 12', desc: 'Ôn thi Đại học & tìm cơ hội Học bổng' },
    { id: 'uni', label: 'Sinh viên Đại học', desc: 'Cần bổ túc lộ trình việc làm, CV/Portfolio' },
    { id: 'other', label: 'Giai đoạn khác / Phụ huynh', desc: 'Hướng nghiệp cho tương lai dài hạn' },
  ] : [
    { id: '9-below', label: '9th Grade or Below Student', desc: 'Preparing for High School entrance exam & early cluster selection' },
    { id: '10', label: '10th Grade Student', desc: 'Starting high school, finding interest fields' },
    { id: '11', label: '11th Grade Student', desc: 'Diving deeper, matching skill sets' },
    { id: '12', label: '12th Grade Student', desc: 'College prep & searching scholarships' },
    { id: 'uni', label: 'University Student', desc: 'Expanding competencies, compiling Portfolio/CV' },
    { id: 'other', label: 'Other/Parent', desc: 'Guiding long-term vocational pathways' },
  ];

  const subFields = isVi ? [
    { id: 'stem', label: 'Khối Tự nhiên / STEM', desc: 'Toán, Vật Lý, Hóa Học, Công Nghệ, Lắp ráp...' },
    { id: 'social', label: 'Khối Xã hội / Nghệ thuật', desc: 'Văn học, Ngôn ngữ, Sáng tạo, Thiết kế...' },
    { id: 'biz', label: 'Kinh tế & Quản lý', desc: 'Kinh doanh, Tài chính, Khởi nghiệp, Marketing...' },
    { id: 'other', label: 'Chưa xác định rõ rệt', desc: 'Mong muốn được AI định hướng cá nhân hóa' },
  ] : [
    { id: 'stem', label: 'Natural Sciences & STEM', desc: 'Math, Physics, Computing, Engineering...' },
    { id: 'social', label: 'Social Sciences & Arts', desc: 'Literature, Creative Arts, Graphic Design...' },
    { id: 'biz', label: 'Business & Management', desc: 'Economics, Marketing, Entrepreneurship...' },
    { id: 'other', label: 'Undecided / Flexible', desc: 'Seeking personalized AI matching guidance' },
  ];

  const skills = isVi ? [
    { id: 'coding', label: 'Lập trình & Làm chủ Công nghệ', icon: Laptop },
    { id: 'logic', label: 'Tư duy Logic & Giải đề Toán', icon: BrainCircuit },
    { id: 'writing', label: 'Viết lách & Biên soạn nội dung', icon: PenTool },
    { id: 'speaking', label: 'Thuyết trình & Làm việc đám đông', icon: Users },
    { id: 'english', label: 'Ngoại ngữ & Hội nhập Quốc tế', icon: BookOpen },
    { id: 'creative', label: 'Sáng tạo Mỹ thuật & Thiết kế', icon: Award },
  ] : [
    { id: 'coding', label: 'Coding & Technology', icon: Laptop },
    { id: 'logic', label: 'Logical Math & Problem Solving', icon: BrainCircuit },
    { id: 'writing', label: 'Technical Writing & Content Creation', icon: PenTool },
    { id: 'speaking', label: 'Public Presentation & Social Skills', icon: Users },
    { id: 'english', label: 'Languages & Global Exchange', icon: BookOpen },
    { id: 'creative', label: 'Finesse Arts & Graphics Design', icon: Award },
  ];

  const goals = isVi ? [
    { id: 'riasec', label: 'Làm trắc nghiệm RIASEC tìm kiếm nhóm ngành lý tưởng nhất' },
    { id: 'roadmap', label: 'Thiết lập lộ trình học tập, phát triển kĩ năng 3 tháng' },
    { id: 'portfolio', label: 'Tích lũy hồ sơ, thành tích cá nhân để xin học bổng' },
    { id: 'interview', label: 'Luyện tập giao tiếp thông qua Phỏng vấn thử' },
  ] : [
    { id: 'riasec', label: 'Take the RIASEC test to trace ideal vocation profiles' },
    { id: 'roadmap', label: 'Set a tailored 3-month study & competency roadmap' },
    { id: 'portfolio', label: 'Build and export personal Portfolios for grants' },
    { id: 'interview', label: 'Practice communications in adaptive Mock Interviews' },
  ];

  const handleToggleSkill = (skillLabel: string) => {
    if (selectedSkills.includes(skillLabel)) {
      setSelectedSkills(prev => prev.filter(s => s !== skillLabel));
    } else {
      if (selectedSkills.length >= 3) return; // Limit to 3
      setSelectedSkills(prev => [...prev, skillLabel]);
    }
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(prev => prev + 1);
    } else {
      // Compile profile updates
      const profileUpdates: Partial<UserProfile> = {
        careerGoal: userGoal,
        careerProfile: `Học vấn/Giai đoạn: ${eduLevel}. Tổ hợp quan tâm: ${academicKhối}. Kinh nghiệm nổi bật: ${selectedSkills.join(', ')}.`,
        hasCompletedOnboarding: true,
        points: 300, // Onboarding completion bonus points!
        level: 1,
        badges: ['Onboard Star']
      };
      onComplete(profileUpdates);
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep(prev => prev - 1);
  };

  const isCurrentStepDisabled = () => {
    if (step === 0 && !eduLevel) return true;
    if (step === 1 && !academicKhối) return true;
    if (step === 2 && selectedSkills.length === 0) return true;
    if (step === 3 && !userGoal) return true;
    return false;
  };

  const progressPct = ((step + 1) / 4) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-[#fafafa]/90 dark:bg-[#070707]/90 backdrop-blur-xl overflow-y-auto flex items-start sm:items-center justify-center p-3 sm:p-4 py-8 sm:py-4">
      {/* Outer Onboarding Card Container */}
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.98 }}
        className="w-full max-w-2xl bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        style={{ boxShadow: '0 25px 60px -15px rgba(99, 102, 241, 0.15)' }}
      >
        {/* Banner with NextX Branding */}
        <div className="p-6 pb-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-indigo-600 text-white rounded-full font-extrabold text-[10px] uppercase tracking-wide">
              The NextX 2026
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
              CareerGuide AI
            </span>
          </div>

          <button 
            onClick={onActivateDemo}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-full border border-indigo-200/50 dark:border-indigo-500/10 transition-colors duration-200"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isVi ? 'Dùng thử dữ liệu mẫu' : 'Load Demo Session'}</span>
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div className="px-6 pt-4">
          <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between items-center mt-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            <span>{isVi ? `BƯỚC ${step + 1} / 4` : `STEP ${step + 1} / 4`}</span>
            <span>
              {step === 0 && (isVi ? 'HỘ KHẨU HỌC VẤN' : 'ACADEMIC LEVEL')}
              {step === 1 && (isVi ? 'KHỐI ƯU THẾ' : 'CORE PATHWAY')}
              {step === 2 && (isVi ? 'NĂNG LỰC NỔI BẬT' : 'CHOSEN SKILLS')}
              {step === 3 && (isVi ? 'MỤC TIÊU NGHỀ NGHIỆP' : 'STUDENT OBJECTIVE')}
            </span>
          </div>
        </div>

        {/* Onboarding Questions content */}
        <div className="p-6 sm:p-8 flex-1 min-h-[340px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                    {isVi ? 'Bạn hiện đang ở giai đoạn học tập nào?' : 'What is your current academic stage?'}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {isVi ? 'Lựa chọn giúp AI căn chỉnh từ vựng tư vấn và độ khó của các kịch bản tuyển sinh dán sãn.' : 'Helps AI align vocabulary and context scenarios.'}
                  </p>
                </div>

                <div className="space-y-2 mt-4 max-h-[220px] overflow-y-auto pr-1">
                  {grades.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setEduLevel(g.label)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between group ${eduLevel === g.label ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-500 text-indigo-700 dark:text-indigo-300' : 'bg-transparent border-gray-150 dark:border-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                    >
                      <div>
                        <p className="text-sm font-semibold">{g.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{g.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${eduLevel === g.label ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-gray-350 dark:border-white/10'}`}>
                        {eduLevel === g.label && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                    {isVi ? 'Bạn có thiên hướng về tổ hợp hay khối nào nhất?' : 'Which educational cluster do you align with?'}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {isVi ? 'Năng lực sở trường trong môn học giúp AI khoanh vùng ngành phổ biến.' : 'Your academic leaning helps find relevant university majors.'}
                  </p>
                </div>

                <div className="space-y-2.5 mt-4">
                  {subFields.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setAcademicKhối(f.label)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between ${academicKhối === f.label ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-500 text-indigo-700 dark:text-indigo-300' : 'bg-transparent border-gray-150 dark:border-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                    >
                      <div>
                        <p className="text-sm font-bold">{f.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${academicKhối === f.label ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-gray-350 dark:border-white/10'}`}>
                        {academicKhối === f.label && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                    {isVi ? 'Đâu là những thế mạnh nổi bật tự tin nhất?' : 'What are your top strength areas?'}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {isVi ? 'Hãy chọn tối đa 3 kỹ năng bạn cảm thấy tự tin và hứng thú nhất.' : 'Select up to 3 values or skills you feel confident about.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  {skills.map((skill) => {
                    const SkillIcon = skill.icon;
                    const isSelected = selectedSkills.includes(skill.label);
                    return (
                      <button
                        key={skill.id}
                        onClick={() => handleToggleSkill(skill.label)}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 ${isSelected ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-500 text-indigo-700 dark:text-indigo-300' : 'bg-transparent border-gray-150 dark:border-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'} ${!isSelected && selectedSkills.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className={`p-2 rounded-xl ${isSelected ? 'bg-indigo-500/10 text-indigo-500' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
                          <SkillIcon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold shrink-0 max-w-[200px] truncate">{skill.label}</span>
                        {isSelected && <Check className="w-4 h-4 text-indigo-500 ml-auto shrink-0" />}
                      </button>
                    );
                  })}
                </div>
                <div className="text-right text-[10px] text-gray-400 font-semibold">
                  {isVi ? `Đã chọn: ${selectedSkills.length}/3` : `Selected: ${selectedSkills.length}/3`}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                    {isVi ? 'Nguyện vọng hoặc Mục tiêu nghề nghiệp mơ ước?' : 'What is your dream career or target?'}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {isVi ? 'Hãy nhập tự do ngành nghề bạn quan tâm (Ví dụ: Kỹ sư phần mềm, Thiết kế giao diện UI, Bác sĩ học...)' : 'Type freely the vocational major or job you are aiming for (e.g. AI Engineer, UI Designer, Biologist, Doctor...)'}
                  </p>
                </div>

                <div className="space-y-4 mt-4">
                  <input
                    type="text"
                    value={userGoal}
                    onChange={(e) => setUserGoal(e.target.value)}
                    placeholder={isVi ? "Ví dụ: Kỹ sư phần mềm khối STEM..." : "E.g., Software Engineer STEM..."}
                    className="w-full px-4 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />

                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{isVi ? 'Hoặc tham khảo các ý tưởng:' : 'Or tap to select ideas:'}</p>
                    <div className="flex flex-wrap gap-2">
                      {goals.map((g, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setUserGoal(g.label)}
                          className={`text-xs px-3 py-2 rounded-xl border transition-all ${userGoal === g.label ? 'bg-indigo-500/15 border-indigo-450 text-indigo-700 dark:text-indigo-300' : 'bg-gray-50 dark:bg-white/5 border-gray-150 dark:border-white/5 text-gray-600 dark:text-gray-450 hover:bg-gray-100 dark:hover:bg-white/10'}`}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer controls */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-[#0c0c0c] border-t border-gray-150 dark:border-white/5 flex items-center justify-between">
          <button
            onClick={handlePrev}
            style={{ opacity: step === 0 ? 0 : 1, pointerEvents: step === 0 ? 'none' : 'auto' }}
            className="inline-flex items-center gap-1.5 px-4 py-2 hover:bg-gray-150 dark:hover:bg-white/5 text-gray-640 dark:text-gray-400 rounded-xl text-xs font-bold transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isVi ? 'Quay lại' : 'Back'}</span>
          </button>

          <button
            onClick={handleNext}
            disabled={isCurrentStepDisabled()}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:pointer-events-none text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/10"
          >
            <span>{step === 3 ? (isVi ? 'Hoàn thành' : 'Launch Guide') : (isVi ? 'Tiếp theo' : 'Next')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
