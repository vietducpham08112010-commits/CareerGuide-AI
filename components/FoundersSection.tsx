import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';
import { PERMANENT_FOUNDER_AVATARS, FOUNDER_PHOTO_PATHS, FOUNDER_ONLINE_URLS } from './founderAvatars';

interface Founder {
  id: string;
  name: string;
  school: string;
  roleVi: string;
  roleEn: string;
  taglineVi: string;
  taglineEn: string;
  mainDutyVi: string;
  mainDutyEn: string;
  skills: { name: string; category: 'tech' | 'product' | 'growth' | 'design'; level: number }[];
  highlightCompetenciesVi: string[];
  highlightCompetenciesEn: string[];
  visionQuoteVi: string;
  visionQuoteEn: string;
  bioVi: string;
  bioEn: string;
  avatarFallbackColor: string;
  badgeGradient: string;
  glowColor: string;
  accentBorder: string;
  rolePillBg: string;
  icon: string;
  avatarImage: string;
  avatarPosition: string;
}

const FOUNDERS_DATA: Founder[] = [
  {
    id: 'wang_si_qi',
    name: 'Wang Si Qi',
    school: 'THPT Vinschool Ocean Park',
    roleVi: 'Founder, Chief Executive Officer (CEO) & Tech Lead',
    roleEn: 'Founder, Chief Executive Officer (CEO) & Tech Lead',
    taglineVi: 'Kiến tạo tương lai hướng nghiệp với AI Đa phương thức và Công nghệ Tiên phong',
    taglineEn: 'Pioneering AI-driven personalized career guidance with cutting-edge multimodal tech',
    mainDutyVi: 'Định hướng chiến lược toàn diện, quản lý tổng thể dự án, lãnh đạo phát triển công nghệ & kiến trúc AI',
    mainDutyEn: 'Strategic direction, end-to-end project management, and leading AI & tech architecture development',
    avatarImage: FOUNDER_PHOTO_PATHS.wang_si_qi || PERMANENT_FOUNDER_AVATARS.wang_si_qi,
    avatarPosition: 'object-[center_15%]',
    skills: [
      { name: 'React & TypeScript High-Perf Architecture', category: 'tech', level: 98 },
      { name: 'Google Gemini Multimodal AI & Live Audio', category: 'tech', level: 99 },
      { name: 'Prompt Engineering & System Architect', category: 'tech', level: 96 },
      { name: 'Node.js, Express & Serverless APIs', category: 'tech', level: 93 },
      { name: 'Firestore Cloud DB & Security Rules', category: 'tech', level: 92 },
      { name: 'Tech Strategy & Vision Leadership', category: 'tech', level: 97 }
    ],
    highlightCompetenciesVi: [
      'Full-stack Engineering (React 19, TypeScript, Node.js)',
      'Google Gemini API & Multimodal AI Streaming (<800ms latency)',
      'Kiến trúc Trợ lý Giọng nói Real-time & Phân tích Học bạ AI Vision',
      'Firestore Database, Cloud Security & Serverless Vercel Architecture',
      'Lãnh đạo Chiến lược Công nghệ định hướng Chung kết The NEXTX'
    ],
    highlightCompetenciesEn: [
      'Full-stack Engineering (React 19, TypeScript, Node.js)',
      'Google Gemini API & Multimodal AI Streaming (<800ms latency)',
      'Real-time Voice Assistant & AI Vision Transcript Auditing',
      'Firestore Database, Cloud Security & Serverless Vercel Architecture',
      'Strategic Tech Leadership oriented towards The NEXTX Finals'
    ],
    visionQuoteVi: '"Chúng tôi xây dựng CareerGuide AI không chỉ là một công cụ công nghệ, mà là người cố vấn thông minh 24/7 giúp mọi học sinh Việt Nam tự tin khai phá đam mê, làm chủ lựa chọn và kiến tạo tương lai."',
    visionQuoteEn: '"We built CareerGuide AI not just as a tool, but as a 24/7 intelligent mentor empowering every Vietnamese student to master their career path with confidence."',
    bioVi: 'Đảm nhận vai trò Tech Lead & CEO, Wang Si Qi trực tiếp thiết kế toàn bộ hạ tầng AI đa phương thức (giọng nói hai chiều thời gian thực, soi học bạ qua ảnh chụp, phỏng vấn thử nghiệm AI Mock Interview) và dẫn dắt đội ngũ tiến vào Vòng Chung Kết The NEXTX 2026.',
    bioEn: 'Serving as CEO & Tech Lead, Wang Si Qi architected the multimodal AI engine (real-time voice, vision grade analysis, mock interview) and steered the core vision towards The NEXTX 2026 Grand Finals.',
    avatarFallbackColor: 'from-indigo-600 via-purple-600 to-pink-600',
    badgeGradient: 'from-indigo-500 via-purple-500 to-pink-500',
    glowColor: 'rgba(99, 102, 241, 0.4)',
    accentBorder: 'border-indigo-500/40 hover:border-indigo-500',
    rolePillBg: 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60',
    icon: '⚡'
  },
  {
    id: 'pham_viet_duc',
    name: 'Phạm Việt Đức',
    school: 'THPT Vinschool Ocean Park',
    roleVi: 'Chief Product Officer (CPO) / Product Owner',
    roleEn: 'Chief Product Officer (CPO) / Product Owner',
    taglineVi: 'Tối ưu hóa trải nghiệm sản phẩm & Chuẩn hóa thuật toán hướng nghiệp khoa học',
    taglineEn: 'Maximizing product-market fit & standardizing scientific career algorithms',
    mainDutyVi: 'Quản lý lộ trình phát triển sản phẩm, nghiên cứu người dùng sâu (UX Research), xây dựng thuật toán hướng nghiệp',
    mainDutyEn: 'Product roadmap management, user research (Mom Test/UX), and career matching algorithm design',
    avatarImage: FOUNDER_PHOTO_PATHS.pham_viet_duc || PERMANENT_FOUNDER_AVATARS.pham_viet_duc,
    avatarPosition: 'object-[center_15%]',
    skills: [
      { name: 'RIASEC Holland Code Engine', category: 'product', level: 98 },
      { name: 'Product Management & Agile Backlog', category: 'product', level: 95 },
      { name: 'UX Research & Deep In-depth Interviews', category: 'product', level: 93 },
      { name: 'The Mom Test Customer Discovery', category: 'product', level: 96 },
      { name: 'Behavioral Data Analytics & Retention', category: 'product', level: 91 },
      { name: 'Competency Framework & JD Matching', category: 'product', level: 94 }
    ],
    highlightCompetenciesVi: [
      'Thuật toán Trắc nghiệm Tâm lý & Hướng nghiệp RIASEC Chuẩn hóa',
      'Product Management & Chiến lược Tối ưu Hóa Giá trị Sản phẩm',
      'Nghiên cứu Người dùng Chuyên sâu (UX Research & Mom Test)',
      'Phân tích Dữ liệu Hành vi & Tối ưu Tỷ lệ Giữ chân (Retention Funnel)',
      'Mô hình Đánh giá Năng lực Học sinh & Ma trận Khớp JD Tuyển dụng'
    ],
    highlightCompetenciesEn: [
      'Standardized RIASEC Psychometric & Career Matching Algorithm',
      'Product Management & Agile Backlog Prioritization',
      'In-depth User Research (UX Interviews & The Mom Test)',
      'Behavioral Data Analytics & Retention Funnel Optimization',
      'Student Competency Framework & JD Match Matrix'
    ],
    visionQuoteVi: '"Mỗi tính năng trên CareerGuide AI đều được tôi luyện qua hàng trăm giờ phỏng vấn học sinh thực tế, nhằm xóa bỏ hoàn toàn cảm giác hoang mang, mơ hồ khi đứng trước ngưỡng cửa chọn ngành chọn trường."',
    visionQuoteEn: '"Every feature in CareerGuide AI is battle-tested through hundreds of hours of real student interviews, dismantling every barrier of career uncertainty."',
    bioVi: 'Là Product Owner, Phạm Việt Đức tập trung vào tính chuẩn xác của thuật toán RIASEC, thiết kế hệ thống lộ trình phát triển cá nhân hóa và đảm bảo mọi tính năng giải quyết đúng nỗi đau nhức nhối của thế hệ Z.',
    bioEn: 'As CPO, Pham Viet Duc focused on scientific RIASEC algorithms, gamified retention loops, and ensuring CareerGuide AI directly solves Gen Z pain points in career decision-making.',
    avatarFallbackColor: 'from-blue-600 via-cyan-600 to-teal-500',
    badgeGradient: 'from-blue-500 via-cyan-500 to-teal-500',
    glowColor: 'rgba(14, 165, 233, 0.4)',
    accentBorder: 'border-blue-500/40 hover:border-blue-500',
    rolePillBg: 'bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-800/60',
    icon: '🧭'
  },
  {
    id: 'nguyen_duc_lam',
    name: 'Nguyễn Đức Lâm',
    school: 'THPT Vinschool Ocean Park',
    roleVi: 'Chief Operating Officer (COO) / Growth & Partnerships Lead',
    roleEn: 'Chief Operating Officer (COO) / Growth & Partnerships Lead',
    taglineVi: 'Thúc đẩy tăng trưởng cộng đồng, mở rộng mạng lưới hợp tác trường học toàn quốc',
    taglineEn: 'Driving community scale & expanding nationwide educational partnership networks',
    mainDutyVi: 'Điều hành vận hành tổng thể, triển khai chiến lược Go-To-Market (GTM), phát triển đối tác trường học & tài trợ',
    mainDutyEn: 'Operations oversight, Go-To-Market (GTM) execution, and educational institutional partnerships',
    avatarImage: FOUNDER_PHOTO_PATHS.nguyen_duc_lam || PERMANENT_FOUNDER_AVATARS.nguyen_duc_lam,
    avatarPosition: 'object-[center_15%]',
    skills: [
      { name: 'Go-To-Market (GTM) & Rollout Strategy', category: 'growth', level: 96 },
      { name: 'School Pilot Program Execution', category: 'growth', level: 95 },
      { name: 'Community Building & Ambassador Networks', category: 'growth', level: 94 },
      { name: 'Operations & Execution Management', category: 'growth', level: 91 },
      { name: 'B2B Educational SaaS Sales & Pricing', category: 'growth', level: 93 },
      { name: 'Regional Subsidy Operations (50% Off)', category: 'growth', level: 92 }
    ],
    highlightCompetenciesVi: [
      'Quản lý Dự án & Vận hành Quy trình Thực thi',
      'Chiến lược Triển khai Pilot Program tại các Trường THPT',
      'Xây dựng & Phát triển Cộng đồng Học sinh Hướng nghiệp',
      'Marketing Tăng trưởng (Growth Hacking & Viral Loops)',
      'Hợp tác Chiến lược & Kết nối Ban Giám Hiệu / Cố vấn'
    ],
    highlightCompetenciesEn: [
      'Project Operations & Execution Management',
      'High School Pilot Program Implementation Strategy',
      'Student Career Community Building & Moderation',
      'Growth Marketing (Viral Loops & Organic Acquisition)',
      'Strategic Institutional Partnerships & Outreach'
    ],
    visionQuoteVi: '"Một giải pháp công nghệ vĩ đại chỉ thực sự có giá trị khi chạm tới tay từng học sinh. Chúng tôi cam kết đưa CareerGuide AI đến từng lớp học, từ trường trọng điểm đô thị đến các vùng còn nhiều khó khăn."',
    visionQuoteEn: '"An exceptional product requires robust real-world execution. We are dedicated to bringing CareerGuide AI into every classroom, from urban cities to rural regions."',
    bioVi: 'Đảm nhiệm vị trí COO, Nguyễn Đức Lâm dẫn dắt các chiến dịch thử nghiệm Pilot, thiết lập mối quan hệ với các câu lạc bộ hướng nghiệp học sinh và tối ưu mô hình trợ giá vùng miền cho học sinh toàn quốc.',
    bioEn: 'Leading operations and growth, Nguyen Duc Lam executes pilot school rollouts, builds student career networks, and drives the regional subsidy pricing model nationwide.',
    avatarFallbackColor: 'from-emerald-600 via-teal-600 to-cyan-500',
    badgeGradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    accentBorder: 'border-emerald-500/40 hover:border-emerald-500',
    rolePillBg: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
    icon: '📈'
  },
  {
    id: 'phan_bao_ngoc',
    name: 'Phan Bảo Ngọc',
    school: 'THPT Vinschool Ocean Park',
    roleVi: 'Chief Design Officer (CDO) / UI/UX & Content Lead',
    roleEn: 'Chief Design Officer (CDO) / UI/UX & Content Lead',
    taglineVi: 'Định hình ngôn ngữ thị giác hiện đại, truyền cảm hứng qua từng pixel và câu chữ',
    taglineEn: 'Crafting modern visual identity and inspiring design through every pixel and story',
    mainDutyVi: 'Thiết kế giao diện (UI/UX), tối ưu hóa trải nghiệm người dùng, xây dựng nhận diện thương hiệu & Content',
    mainDutyEn: 'UI/UX interface design, user journey optimization, branding identity, and content strategy',
    avatarImage: FOUNDER_PHOTO_PATHS.phan_bao_ngoc || PERMANENT_FOUNDER_AVATARS.phan_bao_ngoc,
    avatarPosition: 'object-[center_15%]',
    skills: [
      { name: 'Figma UI/UX & Design Systems', category: 'design', level: 98 },
      { name: 'Glassmorphism & Micro-Interactions', category: 'design', level: 97 },
      { name: 'Interactive SVG & Data Visuals', category: 'design', level: 95 },
      { name: 'Brand Identity & Visual Storytelling', category: 'design', level: 96 },
      { name: 'Content Marketing & Inspiring Copy', category: 'design', level: 93 },
      { name: 'Mobile-First Responsive UX', category: 'design', level: 96 }
    ],
    highlightCompetenciesVi: [
      'Thiết kế UI/UX Chuyên nghiệp trên Figma & Design System',
      'Phong cách Glassmorphism, Gradient & Hiệu ứng Đồ họa Hiện đại',
      'Trực quan hóa Dữ liệu Tương tác (SVG Radar & Interactive Roadmaps)',
      'Xây dựng Nhận diện Thương hiệu Nhất quán (Branding Identity)',
      'Content Marketing & Thông điệp Truyền cảm hứng cho Học sinh'
    ],
    highlightCompetenciesEn: [
      'Professional UI/UX Design in Figma & Design System',
      'Modern Glassmorphism, Gradients & Micro-animations',
      'Interactive Data Visualization (SVG Radars & Roadmaps)',
      'Consistent Brand Identity & Visual Storytelling',
      'Content Marketing & Inspiring Youth Communication'
    ],
    visionQuoteVi: '"Thiết kế hướng nghiệp không chỉ là giao diện bắt mắt, mà là cầu nối thấu cảm giúp các bạn học sinh cảm thấy được lắng nghe, thấu hiểu và tự tin theo đuổi ước mơ."',
    visionQuoteEn: '"Design in education is more than aesthetics; it is the bridge that makes students feel understood, heard, and confident in pursuing their dreams."',
    bioVi: 'Là linh hồn thị giác của CareerGuide AI, Phan Bảo Ngọc sáng tạo phong cách giao diện Glassmorphism độc bản, thiết kế toàn bộ hệ thống biểu tượng, sơ đồ năng lực và truyền tải câu chuyện sản phẩm đầy cảm xúc.',
    bioEn: 'As the visual visionary behind CareerGuide AI, Phan Bao Ngoc crafted the signature glassmorphic design system, interactive charts, and inspiring narrative across all brand touchpoints.',
    avatarFallbackColor: 'from-pink-600 via-rose-600 to-amber-500',
    badgeGradient: 'from-pink-500 via-rose-500 to-amber-500',
    glowColor: 'rgba(244, 63, 94, 0.4)',
    accentBorder: 'border-pink-500/40 hover:border-pink-500',
    rolePillBg: 'bg-pink-50 dark:bg-pink-950/70 text-pink-600 dark:text-pink-300 border-pink-200 dark:border-pink-800/60',
    icon: '🎨'
  }
];

interface FoundersSectionProps {
  lang: Language;
  onExploreDemo?: () => void;
  isStandaloneTab?: boolean;
}

export const FoundersSection: React.FC<FoundersSectionProps> = ({
  lang,
  onExploreDemo,
  isStandaloneTab = false
}) => {
  const isVi = lang === Language.VI;
  const [selectedFounder, setSelectedFounder] = useState<Founder>(FOUNDERS_DATA[0]);
  const [activeView, setActiveView] = useState<'grid' | 'spotlight' | 'matrix' | 'story'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  const getFounderImage = (founder: Founder) => {
    return FOUNDER_PHOTO_PATHS[founder.id] || (FOUNDER_ONLINE_URLS as any)[founder.id] || PERMANENT_FOUNDER_AVATARS[founder.id];
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, founderId: string) => {
    const target = e.currentTarget;
    const onlineUrl = (FOUNDER_ONLINE_URLS as any)[founderId];
    if (onlineUrl && target.src !== onlineUrl) {
      target.src = onlineUrl;
      return;
    }
    if (PERMANENT_FOUNDER_AVATARS[founderId] && target.src !== PERMANENT_FOUNDER_AVATARS[founderId]) {
      target.src = PERMANENT_FOUNDER_AVATARS[founderId];
    }
  };

  return (
    <section className={`relative overflow-hidden ${isStandaloneTab ? 'p-4 md:p-8 max-w-7xl mx-auto w-full' : 'py-20 md:py-32 px-4 sm:px-6 max-w-7xl mx-auto'}`}>
      {/* Dynamic Futuristic Glow Orbs */}
      <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-600/15 via-purple-600/15 to-transparent rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-20 right-10 w-[450px] h-[450px] bg-gradient-to-bl from-pink-600/15 via-amber-500/15 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Header Container */}
      <div className="text-center max-w-4xl mx-auto mb-16 space-y-6">
        {/* NextX Grand Finalist Badge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-indigo-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-300 text-xs sm:text-sm font-black tracking-wide uppercase shadow-lg shadow-amber-500/10 backdrop-blur-md"
        >
          <span className="text-lg">🏆</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 via-purple-600 to-indigo-600 dark:from-amber-300 dark:via-purple-300 dark:to-indigo-300 font-extrabold">
            THE NEXTX 2026 GRAND FINALISTS
          </span>
          <span className="text-gray-400 dark:text-gray-500 font-normal">|</span>
          <span className="font-black text-indigo-600 dark:text-indigo-300">THPT Vinschool Ocean Park</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-gray-900 dark:text-white leading-[1.15]"
        >
          {isVi ? "Đội Ngũ Sáng Lập & Lãnh Đạo" : "Founders & Leadership Team"}
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 drop-shadow-sm">
            CareerGuide AI
          </span>
        </motion.h2>

        {/* Core Mission Copy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative px-6 py-5 rounded-3xl bg-gradient-to-b from-white/90 via-indigo-50/40 to-white/70 dark:from-white/[0.05] dark:via-indigo-950/20 dark:to-white/[0.02] border border-indigo-500/20 shadow-xl backdrop-blur-xl max-w-3xl mx-auto"
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-0.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-[10px] uppercase tracking-widest shadow-md">
            {isVi ? "Sứ Mệnh Tiên Phong" : "Core Mission"}
          </div>

          <p className="text-base sm:text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-semibold">
            {isVi
              ? "Bản lĩnh tiên phong từ THPT Vinschool Ocean Park — Hội tụ 4 mảnh ghép chiến lược: Công nghệ AI Đa phương thức đỉnh cao, Khoa học dữ liệu hướng nghiệp chuẩn RIASEC, Tăng trưởng thị trường thực chiến và Thiết kế trải nghiệm vị nhân sinh. Chúng tôi mang CareerGuide AI đến Chung kết The NEXTX 2026 với sứ mệnh đồng hành, thắp sáng tiềm năng và trao quyền tự chủ tương lai cho hàng triệu học sinh Việt Nam."
              : "Pioneering ambition from Vinschool Ocean Park High School — Uniting four strategic pillars: Advanced Multimodal AI Engineering, Scientific RIASEC Psychometrics, Scalable GTM Growth, and Human-Centric Glassmorphic Design. We bring CareerGuide AI to The NEXTX 2026 Grand Finals with a singular mission: Empowering millions of Vietnamese students to discover their passion and master their career destiny."}
          </p>
        </motion.div>

        {/* View Switcher Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {[
            { id: 'grid', labelVi: '👥 Đội ngũ (3D Cards)', labelEn: '👥 Team Grid' },
            { id: 'spotlight', labelVi: '✨ Tiêu điểm (Pitch Spotlight)', labelEn: '✨ Spotlight' },
            { id: 'matrix', labelVi: '⚡ Ma trận Kỹ năng (Tech Stack)', labelEn: '⚡ Skills Matrix' },
            { id: 'story', labelVi: '🚀 Hành trình The NEXTX', labelEn: '🚀 NextX Story' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveView(mode.id as any)}
              className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all cursor-pointer flex items-center gap-2 ${
                activeView === mode.id
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 scale-105 ring-2 ring-indigo-400/40'
                  : 'bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10'
              }`}
            >
              {isVi ? mode.labelVi : mode.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW 1: EXECUTIVE 3D GRID */}
      {activeView === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FOUNDERS_DATA.map((founder, idx) => {
            const isSelected = selectedFounder.id === founder.id;
            const isHovered = hoveredCardId === founder.id;

            return (
              <motion.div
                key={founder.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                onMouseEnter={() => setHoveredCardId(founder.id)}
                onMouseLeave={() => setHoveredCardId(null)}
                onClick={() => {
                  setSelectedFounder(founder);
                }}
                className={`relative rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 cursor-pointer overflow-hidden border ${
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-500/40 bg-white dark:bg-gray-900 shadow-2xl shadow-indigo-500/20'
                    : 'border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] hover:border-indigo-400 shadow-lg hover:shadow-2xl'
                } backdrop-blur-2xl group`}
                style={{
                  boxShadow: isHovered ? `0 20px 40px -15px ${founder.glowColor}` : undefined
                }}
              >
                {/* Glowing Top Rainbow Bar */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${founder.badgeGradient}`} />

                {/* Card Header & Permanent Centered Face Frame */}
                <div className="space-y-4">
                  <div className="relative mx-auto w-36 h-40 rounded-3xl p-1 bg-gradient-to-tr from-gray-200 via-indigo-400 to-purple-500 dark:from-white/10 dark:via-indigo-500/50 dark:to-pink-500/50 shadow-xl group-hover:scale-105 transition-transform duration-300">
                    <div className="w-full h-full rounded-[22px] overflow-hidden bg-gray-950 relative flex items-center justify-center">
                      <img
                        src={getFounderImage(founder)}
                        alt={founder.name}
                        referrerPolicy="no-referrer"
                        onError={(e) => handleImageError(e, founder.id)}
                        className={`w-full h-full object-cover ${founder.avatarPosition} group-hover:scale-105 transition-transform duration-500`}
                        loading="eager"
                      />
                    </div>
                  </div>

                  {/* Member Name & Role */}
                  <div className="text-center space-y-1.5">
                    <span className={`inline-block px-3 py-1 rounded-full font-extrabold text-[10px] uppercase tracking-wider border shadow-xs ${founder.rolePillBg}`}>
                      {founder.icon} {founder.id === 'wang_si_qi' ? 'CEO & Tech Lead' : founder.id === 'pham_viet_duc' ? 'CPO / Product' : founder.id === 'nguyen_duc_lam' ? 'COO / Growth' : 'CDO / Design'}
                    </span>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {founder.name}
                    </h3>
                    <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                      <span>🏫</span> {founder.school}
                    </p>
                  </div>

                  {/* Core Duties */}
                  <div className="p-3.5 rounded-2xl bg-gray-50/90 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 space-y-1 text-left">
                    <span className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 block tracking-wider">
                      {isVi ? "Vai Trò Chiến Lược" : "Strategic Focus"}
                    </span>
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-medium leading-snug line-clamp-3">
                      {isVi ? founder.mainDutyVi : founder.mainDutyEn}
                    </p>
                  </div>

                  {/* Key Highlights */}
                  <div className="space-y-1.5 text-left">
                    <span className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 block tracking-wider">
                      {isVi ? "Năng Lực Đột Phá" : "Key Competencies"}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(isVi ? founder.highlightCompetenciesVi : founder.highlightCompetenciesEn).slice(0, 2).map((comp, cIdx) => (
                        <span
                          key={cIdx}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 text-[10px] font-bold truncate max-w-full"
                          title={comp}
                        >
                          ⚡ {comp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-5 mt-4 border-t border-gray-100 dark:border-white/5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFounder(founder);
                      setIsModalOpen(true);
                    }}
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{isVi ? "Xem Hồ Sơ Chi Tiết" : "View Full Profile"}</span>
                    <span>&rarr;</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: FOUNDER SPOTLIGHT (Pitch Mode) */}
      {activeView === 'spotlight' && (
        <div className="bg-white/90 dark:bg-gray-900/90 rounded-3xl border border-gray-200 dark:border-white/10 p-6 md:p-10 shadow-2xl backdrop-blur-2xl">
          {/* Top Founder Navigation Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {FOUNDERS_DATA.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFounder(f)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                  selectedFounder.id === f.id
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 shadow-md ring-2 ring-indigo-500/30'
                    : 'border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
              >
                <div className="w-11 h-11 rounded-xl bg-gray-950 overflow-hidden shrink-0 shadow border border-white/20">
                  <img
                    src={getFounderImage(f)}
                    alt={f.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => handleImageError(e, f.id)}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="truncate">
                  <h4 className="text-xs font-black text-gray-900 dark:text-white truncate">{f.name}</h4>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold block truncate">
                    {f.id === 'wang_si_qi' ? 'CEO & Tech' : f.id === 'pham_viet_duc' ? 'CPO / Product' : f.id === 'nguyen_duc_lam' ? 'COO / Growth' : 'CDO / Design'}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Detailed Spotlight Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Photo & Badges (5 cols) */}
            <div className="lg:col-span-5 flex flex-col items-center text-center space-y-4">
              <div className="relative w-56 h-64 sm:w-64 sm:h-72 rounded-3xl p-1.5 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-2xl">
                <div className="w-full h-full rounded-[22px] overflow-hidden bg-gray-950 flex items-center justify-center relative">
                  <img
                    src={getFounderImage(selectedFounder)}
                    alt={selectedFounder.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => handleImageError(e, selectedFounder.id)}
                    className={`w-full h-full object-cover ${selectedFounder.avatarPosition}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                  <span className="absolute bottom-3 left-3 right-3 text-center text-white text-xs font-bold truncate">
                    {selectedFounder.school}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                  {selectedFounder.name}
                </h3>
                <p className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                  {isVi ? selectedFounder.roleVi : selectedFounder.roleEn}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 italic max-w-sm">
                  &ldquo;{isVi ? selectedFounder.taglineVi : selectedFounder.taglineEn}&rdquo;
                </p>
              </div>
            </div>

            {/* Right Skills, Duties & Vision (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Vision Quote Box */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/30 space-y-2 shadow-sm">
                <span className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider flex items-center gap-2">
                  <span>💡</span> {isVi ? "Thông Điệp Tranh Biện Chung Kết The NEXTX" : "NextX Grand Finals Pitch"}
                </span>
                <p className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200 leading-relaxed italic">
                  {isVi ? selectedFounder.visionQuoteVi : selectedFounder.visionQuoteEn}
                </p>
              </div>

              {/* Roles & Bio */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider">
                  {isVi ? "Trách Nhiệm & Đóng Góp Cốt Lõi" : "Core Role & Contributions"}
                </h4>
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                  {isVi ? selectedFounder.bioVi : selectedFounder.bioEn}
                </p>
              </div>

              {/* Skill Proficiency Bars */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider">
                  {isVi ? "Thước Đo Năng Lực Chuyên Sâu" : "Skill Proficiency"}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedFounder.skills.map((sk, sIdx) => (
                    <div key={sIdx} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                        <span className="truncate">{sk.name}</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-mono">{sk.level}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${sk.level}%` }}
                          transition={{ duration: 0.8, delay: sIdx * 0.05 }}
                          className={`h-full bg-gradient-to-r ${selectedFounder.badgeGradient}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: SKILLS MATRIX (Tech & Execution Stack) */}
      {activeView === 'matrix' && (
        <div className="bg-white/90 dark:bg-gray-900/90 rounded-3xl border border-gray-200 dark:border-white/10 p-6 md:p-8 shadow-xl backdrop-blur-xl space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              {isVi ? "Ma Trận Năng Lực Toàn Diện Của Đội Ngũ" : "Comprehensive Team Competency Matrix"}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {isVi
                ? "Sự kết hợp hoàn hảo giữa Kỹ thuật Công nghệ (AI/Fullstack), Khoa học Sản phẩm (RIASEC/Psychometrics), Tăng trưởng Thực chiến (GTM/Partnerships) và Thiết kế Đỉnh cao (Glassmorphic UX)."
                : "A balanced synergy between AI/Fullstack Engineering, Scientific Product Analytics, GTM Execution, and World-class Design."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Tech Pillar */}
            <div className="p-5 rounded-3xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40 space-y-4 shadow-sm">
              <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400">
                <span className="text-3xl">💻</span>
                <div>
                  <h4 className="font-black text-sm">{isVi ? "Công Nghệ & AI" : "Tech & AI Stack"}</h4>
                  <span className="text-[10px] text-gray-500 font-bold">Wang Si Qi (Tech Lead)</span>
                </div>
              </div>
              <ul className="space-y-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                <li className="flex items-center gap-1.5"><span className="text-indigo-500">●</span> React 19, TypeScript & TailwindCSS</li>
                <li className="flex items-center gap-1.5"><span className="text-indigo-500">●</span> Google Gemini Multimodal AI Streaming</li>
                <li className="flex items-center gap-1.5"><span className="text-indigo-500">●</span> Real-time Voice Audio WebSockets</li>
                <li className="flex items-center gap-1.5"><span className="text-indigo-500">●</span> Firestore Cloud DB & Security Rules</li>
                <li className="flex items-center gap-1.5"><span className="text-indigo-500">●</span> Serverless APIs & Low Latency Architecture</li>
              </ul>
            </div>

            {/* Product Pillar */}
            <div className="p-5 rounded-3xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 space-y-4 shadow-sm">
              <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400">
                <span className="text-3xl">🧭</span>
                <div>
                  <h4 className="font-black text-sm">{isVi ? "Sản Phẩm & Khoa Học" : "Product & Science"}</h4>
                  <span className="text-[10px] text-gray-500 font-bold">Phạm Việt Đức (CPO)</span>
                </div>
              </div>
              <ul className="space-y-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                <li className="flex items-center gap-1.5"><span className="text-blue-500">●</span> RIASEC Holland Code Engine</li>
                <li className="flex items-center gap-1.5"><span className="text-blue-500">●</span> The Mom Test & In-depth Interviews</li>
                <li className="flex items-center gap-1.5"><span className="text-blue-500">●</span> Agile Product Backlog Prioritization</li>
                <li className="flex items-center gap-1.5"><span className="text-blue-500">●</span> Competency Frameworks & JD Matching</li>
                <li className="flex items-center gap-1.5"><span className="text-blue-500">●</span> Retention & Gamified Mission Loops</li>
              </ul>
            </div>

            {/* Growth & Ops Pillar */}
            <div className="p-5 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-4 shadow-sm">
              <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
                <span className="text-3xl">📈</span>
                <div>
                  <h4 className="font-black text-sm">{isVi ? "Vận Hành & Tăng Trưởng" : "Growth & Operations"}</h4>
                  <span className="text-[10px] text-gray-500 font-bold">Nguyễn Đức Lâm (COO)</span>
                </div>
              </div>
              <ul className="space-y-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                <li className="flex items-center gap-1.5"><span className="text-emerald-500">●</span> Go-To-Market (GTM) Playbook</li>
                <li className="flex items-center gap-1.5"><span className="text-emerald-500">●</span> High School Pilot Rollout Architecture</li>
                <li className="flex items-center gap-1.5"><span className="text-emerald-500">●</span> Regional Subsidy Operations (50% Off)</li>
                <li className="flex items-center gap-1.5"><span className="text-emerald-500">●</span> Student Ambassador Communities</li>
                <li className="flex items-center gap-1.5"><span className="text-emerald-500">●</span> B2B School SaaS Licensing Tiers</li>
              </ul>
            </div>

            {/* Design Pillar */}
            <div className="p-5 rounded-3xl bg-pink-50/50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-800/40 space-y-4 shadow-sm">
              <div className="flex items-center gap-2.5 text-pink-600 dark:text-pink-400">
                <span className="text-3xl">🎨</span>
                <div>
                  <h4 className="font-black text-sm">{isVi ? "Thiết Kế & Trải Nghiệm" : "Design & Branding"}</h4>
                  <span className="text-[10px] text-gray-500 font-bold">Phan Bảo Ngọc (CDO)</span>
                </div>
              </div>
              <ul className="space-y-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                <li className="flex items-center gap-1.5"><span className="text-pink-500">●</span> Figma Design System & 80+ Components</li>
                <li className="flex items-center gap-1.5"><span className="text-pink-500">●</span> Glassmorphism, Micro-Interactions & Gradients</li>
                <li className="flex items-center gap-1.5"><span className="text-pink-500">●</span> Interactive SVG Skill Radars & Roadmaps</li>
                <li className="flex items-center gap-1.5"><span className="text-pink-500">●</span> Youth Visual Storytelling & Copywriting</li>
                <li className="flex items-center gap-1.5"><span className="text-pink-500">●</span> High CSAT User Interface Design</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: NEXTX PITCH STORY */}
      {activeView === 'story' && (
        <div className="bg-white/90 dark:bg-gray-900/90 rounded-3xl border border-gray-200 dark:border-white/10 p-6 md:p-10 shadow-2xl backdrop-blur-2xl space-y-6">
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 font-black text-xs uppercase tracking-wider border border-amber-500/40">
              The NEXTX 2026 Journey
            </span>
            <span className="text-xs text-gray-500 font-bold">THPT Vinschool Ocean Park</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-snug">
            {isVi 
              ? "Từ trăn trở hướng nghiệp của học sinh THPT đến nền tảng AI đột phá chinh phục Chung kết The NEXTX"
              : "From high school career uncertainty to an AI platform commanding The NEXTX Grand Finals"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="p-6 rounded-3xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 space-y-3">
              <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">01</span>
              <h4 className="font-bold text-base text-gray-900 dark:text-white">{isVi ? "Nỗi Đau Thực Tế (Problem)" : "The Real Pain"}</h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {isVi
                  ? "Hơn 68% học sinh THPT tại Việt Nam chọn ngành nghề theo cảm tính hoặc định hướng mơ hồ, thiếu công cụ đo lường năng lực khách quan và dữ liệu thị trường việc làm cập nhật."
                  : "Over 68% of Vietnamese high schoolers choose majors intuitively without objective competency assessments or real-time labor market analytics."}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 space-y-3">
              <span className="text-3xl font-black text-purple-600 dark:text-purple-400">02</span>
              <h4 className="font-bold text-base text-gray-900 dark:text-white">{isVi ? "Giải Pháp Đột Phá (Solution)" : "Our Solution"}</h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {isVi
                  ? "CareerGuide AI tích hợp mô hình RIASEC chuẩn hóa, Trợ lý giọng nói AI tương tác tự nhiên, Soi học bạ bằng AI Vision và Mô phỏng phỏng vấn thực tế với chi phí chỉ từ 0đ - 29k/tháng."
                  : "CareerGuide AI integrates RIASEC psychometrics, multimodal voice/vision AI grade auditing, and job mock interviews starting at 0đ - 29k/mo subsidized."}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 space-y-3">
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">03</span>
              <h4 className="font-bold text-base text-gray-900 dark:text-white">{isVi ? "Cam Kết Bền Vững (Impact)" : "Long-term Impact"}</h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {isVi
                  ? "Cam kết đồng hành cùng các trường học phổ thông, hỗ trợ giảm giá 50% cho học sinh vùng khó khăn và bảo mật tuyệt đối 100% dữ liệu vị thành niên theo chuẩn giáo dục."
                  : "Committed to nationwide school adoption, 50% rural subsidies, and 100% compliant student privacy standards."}
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <span>{isVi ? "Sẵn sàng trình diễn trực tiếp tại Chung kết The NEXTX 2026" : "Ready for live demo at The NEXTX Grand Finals"}</span>
            </div>
            {onExploreDemo && (
              <button
                onClick={onExploreDemo}
                className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 via-indigo-600 to-purple-600 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl hover:shadow-emerald-500/30 transition-all cursor-pointer"
              >
                ⚡ {isVi ? "Trải Nghiệm Toàn Bộ Tính Năng Demo" : "Launch NextX Live Demo"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Full Profile Deep-Dive */}
      <AnimatePresence>
        {isModalOpen && selectedFounder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-white/10 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6"
            >
              {/* Close button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center justify-center font-bold text-lg cursor-pointer transition-colors"
              >
                &times;
              </button>

              {/* Header inside modal */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gray-950 overflow-hidden shrink-0 shadow-lg border border-white/20">
                  <img
                    src={getFounderImage(selectedFounder)}
                    alt={selectedFounder.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => handleImageError(e, selectedFounder.id)}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider mb-1 ${selectedFounder.rolePillBg}`}>
                    {selectedFounder.icon} {selectedFounder.id === 'wang_si_qi' ? 'CEO & Tech' : selectedFounder.id === 'pham_viet_duc' ? 'CPO / Product' : selectedFounder.id === 'nguyen_duc_lam' ? 'COO / Growth' : 'CDO / Design'}
                  </span>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">{selectedFounder.name}</h3>
                  <p className="text-xs font-semibold text-gray-500">{selectedFounder.school}</p>
                </div>
              </div>

              {/* Vision quote */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 text-xs font-semibold text-indigo-900 dark:text-indigo-200 italic">
                {isVi ? selectedFounder.visionQuoteVi : selectedFounder.visionQuoteEn}
              </div>

              {/* Detailed competencies */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">
                  {isVi ? "Hệ Năng Lực Trọng Tâm" : "Core Competencies"}
                </h4>
                <div className="space-y-1.5">
                  {(isVi ? selectedFounder.highlightCompetenciesVi : selectedFounder.highlightCompetenciesEn).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                      <span className="text-indigo-500">❖</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">
                  {isVi ? "Đánh Giá Trình Độ Kỹ Năng" : "Skill Levels"}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedFounder.skills.map((sk, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 space-y-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-gray-800 dark:text-gray-200 truncate">{sk.name}</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-mono">{sk.level}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${selectedFounder.badgeGradient}`} style={{ width: `${sk.level}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Close Button in modal footer */}
              <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex justify-end">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-black text-xs cursor-pointer hover:bg-gray-800 transition-colors"
                >
                  {isVi ? "Đóng" : "Close"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
