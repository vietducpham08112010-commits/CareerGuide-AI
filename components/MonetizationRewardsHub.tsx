import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import { Language, UserProfile, SubscriptionTier } from '../types';
import { getSubscriptionDetails, createUpdatedSubscription } from '../utils/subscriptionUtils';

interface MonetizationRewardsHubProps {
  language: Language;
  user: UserProfile | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateToChat: () => void;
  onUpdateUser?: (updates: Partial<UserProfile>) => void;
}

interface PartnerOffer {
  id: string;
  partnerName: string;
  category: 'english' | 'coding' | 'soft_skills' | 'data' | 'recruitment' | 'certifications';
  title_vi: string;
  title_en: string;
  description_vi: string;
  description_en: string;
  discountBadge: string;
  voucherCode: string;
  commissionTag: string;
  link: string;
  logoUrl: string;
  cplValue: string;
}

const PARTNER_OFFERS: PartnerOffer[] = [
  {
    id: 'ielts-partner',
    partnerName: 'IELTS Master Center',
    category: 'english',
    title_vi: 'Khoá Học IELTS Cấp Tốc Cam Kết Đầu Ra 7.0+',
    title_en: 'IELTS Intensive Guarantee Program 7.0+',
    description_vi: 'Dành cho sinh viên yếu tiếng Anh muốn nâng band nhanh để đi làm hoặc săn học bổng du học.',
    description_en: 'For students looking to fast-track their IELTS for global jobs & scholarships.',
    discountBadge: 'Tặng 500,000 VNĐ',
    voucherCode: 'CAREER500K',
    commissionTag: 'Đối tác CPL - 150,000 VNĐ/Lead',
    cplValue: '150,000 VNĐ/Lead',
    link: 'https://ieltsmasters.vn',
    logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=120&q=80'
  },
  {
    id: 'elsa-speak',
    partnerName: 'ELSA Speak Vietnam',
    category: 'english',
    title_vi: 'Luyện Phát Âm & Giao Tiếp Công Sở AI Pro',
    title_en: 'ELSA AI English Pronunciation & Business Pro',
    description_vi: 'Sửa lỗi phát âm chuẩn bản xứ, luyện phản xạ phỏng vấn bằng tiếng Anh với AI.',
    description_en: 'Native-like pronunciation correction & AI job interview practice.',
    discountBadge: 'Giảm 40% Gói Trọn Đời',
    voucherCode: 'ELSACAREER40',
    commissionTag: 'Đối tác CPL - 120,000 VNĐ/Lead',
    cplValue: '120,000 VNĐ/Lead',
    link: 'https://elsaspeak.vn',
    logoUrl: 'https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&w=120&q=80'
  },
  {
    id: 'mindx-tech',
    partnerName: 'MindX Technology School',
    category: 'coding',
    title_vi: 'Lập Trình Web Fullstack & AI Engineering Bootcamp',
    title_en: 'Fullstack Web & AI Engineering Bootcamp',
    description_vi: 'Lộ trình thực chiến từ Zero đến có việc làm tại các tập đoàn công nghệ hàng đầu.',
    description_en: 'Hands-on zero to hired roadmap in top tech companies.',
    discountBadge: 'Giảm 25% Học Phí',
    voucherCode: 'MINDXPRO25',
    commissionTag: 'Đối tác CPL - 250,000 VNĐ/Lead',
    cplValue: '250,000 VNĐ/Lead',
    link: 'https://mindx.edu.vn',
    logoUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=120&q=80'
  },
  {
    id: 'coderschool-data',
    partnerName: 'CoderSchool & Data Science VN',
    category: 'data',
    title_vi: 'Khoá Học Phân Tích Dữ Liệu Data Analytics & SQL/PowerBI',
    title_en: 'Data Analytics & SQL/PowerBI Certification',
    description_vi: 'Làm chủ SQL, Python và PowerBI để trở thành Data Analyst thu nhập hấp dẫn.',
    description_en: 'Master SQL, Python & PowerBI to become a high-earning Data Analyst.',
    discountBadge: 'Tặng 2,000,000 VNĐ Học Phí',
    voucherCode: 'DATAHERO2M',
    commissionTag: 'Đối tác CPL - 300,000 VNĐ/Lead',
    cplValue: '300,000 VNĐ/Lead',
    link: 'https://coderschool.vn',
    logoUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=120&q=80'
  },
  {
    id: 'topcv-partner',
    partnerName: 'TopCV Vietnam',
    category: 'recruitment',
    title_vi: 'Gói Chuẩn Hóa CV Chuẩn ATS & Đẩy Top Tìm Kiếm HR',
    title_en: 'TopCV ATS Optimization & HR Recommendation Tier',
    description_vi: 'CV của bạn sẽ được ưu tiên xuất hiện đầu danh sách gửi tới 50,000+ nhà tuyển dụng.',
    description_en: 'Get your CV prioritized to 50,000+ hiring managers across Vietnam.',
    discountBadge: 'Miễn Phí Đánh Giá CV',
    voucherCode: 'TOPCVCAREER',
    commissionTag: 'Đối tác Tuyển dụng #1 VN',
    cplValue: '100,000 VNĐ/Lead',
    link: 'https://topcv.vn',
    logoUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=120&q=80'
  },
  {
    id: 'google-coursera',
    partnerName: 'Coursera & Google Certificates',
    category: 'certifications',
    title_vi: 'Học Bổng Trợ Giá Chứng Chỉ Google Career Certificates',
    title_en: 'Google Career Certificates Subsidized Access',
    description_vi: 'Sở hữu chứng chỉ quốc tế Google Data Analytics, IT Support, Project Management.',
    description_en: 'Earn official Google Career Certificates in Data, Cloud & Management.',
    discountBadge: 'Giảm 50% Phí Hàng Tháng',
    voucherCode: 'COURSERAGOOG50',
    commissionTag: 'Đối tác Quốc Tế - 180,000 VNĐ/Lead',
    cplValue: '180,000 VNĐ/Lead',
    link: 'https://coursera.org/google-certificates',
    logoUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=120&q=80'
  }
];

export const MonetizationRewardsHub: React.FC<MonetizationRewardsHubProps> = ({
  language,
  user,
  showToast,
  onNavigateToChat,
  onUpdateUser
}) => {
  const isVi = language === Language.VI;
  const [activeTab, setActiveTab] = useState<'active_sub' | 'b2c_pricing' | 'northstar_trial' | 'regional' | 'b2b_school' | 'b2b_affiliate' | 'rewards'>('active_sub');
  const [partnerCategory, setPartnerCategory] = useState<'all' | 'english' | 'coding' | 'data' | 'recruitment' | 'certifications'>('all');

  const currentSub = getSubscriptionDetails(user?.subscription);

  // User Gamification & Usage States
  const [points, setPoints] = useState<number>(user?.points || 450);
  const [dailyCheckInDone, setDailyCheckInDone] = useState<boolean>(false);
  const [streakDays, setStreakDays] = useState<number>(user?.streak || 4);
  const [freeQueriesToday, setFreeQueriesToday] = useState<number>(currentSub.dailyQueriesUsed);
  const [completedMilestonesLastMonth, setCompletedMilestonesLastMonth] = useState<number>(4);

  // Regional pricing selection
  const [selectedRegion, setSelectedRegion] = useState<'tier1' | 'tier23'>('tier1');
  const [userDeclaredSchool, setUserDeclaredSchool] = useState<string>('THPT Chuyên Hà Nội - Amsterdam');

  // B2B School SaaS Calculator State
  const [schoolStudentCount, setSchoolStudentCount] = useState<number>(800);

  // Missions
  const [missions, setMissions] = useState([
    { id: 'checkin', title_vi: 'Điểm danh hàng ngày', title_en: 'Daily Check-in', reward: '+20 CP & +1 Lượt AI', done: dailyCheckInDone },
    { id: 'roadmap_step', title_vi: 'Hoàn thành 1 mốc kỹ năng (North Star)', title_en: 'Complete 1 Skill Milestone (North Star)', reward: '+50 CP', done: false },
    { id: 'mock_interview', title_vi: 'Thực hành 1 phiên Phỏng vấn thử AI', title_en: 'Practice 1 AI Mock Interview', reward: '+100 CP', done: false }
  ]);

  const handleSwitchTier = (tier: SubscriptionTier, nameVi: string) => {
    if (!onUpdateUser) {
      showToast(isVi ? `Đã chuyển sang ${nameVi}` : `Switched to ${nameVi}`, "success");
      return;
    }
    const updatedSub = createUpdatedSubscription(currentSub, tier);
    onUpdateUser({ subscription: updatedSub });
    showToast(
      isVi ? `🎉 Đã kích hoạt ${nameVi}! Mở khóa các tính năng tương ứng.` : `🎉 Activated ${nameVi}!`,
      "success"
    );
  };

  const handleDailyCheckIn = () => {
    if (dailyCheckInDone) {
      showToast(isVi ? "Bạn đã điểm danh hôm nay rồi!" : "Already checked in today!", "info");
      return;
    }
    const newStreak = streakDays + 1;
    const newPoints = points + 20;
    setDailyCheckInDone(true);
    setStreakDays(newStreak);
    setPoints(newPoints);
    setFreeQueriesToday(prev => Math.min(5, prev + 1));
    setMissions(prev => prev.map(m => m.id === 'checkin' ? { ...m, done: true } : m));

    if (onUpdateUser && user) {
      onUpdateUser({
        streak: newStreak,
        points: newPoints,
      });
    }

    showToast(
      isVi 
        ? `🎉 Điểm danh thành công! Chuỗi ${newStreak} ngày liên tiếp (+20 CP & +1 lượt AI)` 
        : `🎉 Check-in success! ${newStreak} day streak (+20 CP & +1 AI Query)`, 
      "success"
    );
  };

  const handleRedeemPoints = (cost: number, rewardType: 'queries' | 'mock' | 'trial', rewardTitleVi: string) => {
    if (points < cost) {
      showToast(isVi ? `Bạn cần tối thiểu ${cost} CP để đổi. Hiện có: ${points} CP.` : `Insufficient CP. Need ${cost} CP. You have ${points} CP.`, "error");
      return;
    }

    const newPoints = points - cost;
    setPoints(newPoints);

    if (onUpdateUser && user) {
      let updatedSub = { ...currentSub };
      if (rewardType === 'queries') {
        updatedSub.extraQueriesCredits = (updatedSub.extraQueriesCredits || 0) + 5;
      } else if (rewardType === 'mock') {
        updatedSub.mockInterviewCredits = (updatedSub.mockInterviewCredits || 0) + 1;
      } else if (rewardType === 'trial') {
        updatedSub.tier = 'trial24h';
        updatedSub.tierNameVi = 'Trial 24H (Đổi từ CP)';
        updatedSub.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      }

      onUpdateUser({
        points: newPoints,
        subscription: updatedSub as any
      });
    }

    showToast(isVi ? `🎉 Đã đổi thành công ${rewardTitleVi}! -${cost} CP` : `🎉 Redeemed ${rewardTitleVi}! -${cost} CP`, "success");
  };

  const handleClaimVoucher = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast(
      isVi ? `Đã sao chép mã ưu đãi ${code}! Vui lòng dùng khi đăng ký đối tác.` : `Copied voucher code ${code}!`,
      "success"
    );
  };

  const handleSimulatePurchase = (packageName: string, price: string, tierKey?: SubscriptionTier) => {
    if (tierKey && onUpdateUser) {
      const updatedSub = createUpdatedSubscription(currentSub, tierKey);
      onUpdateUser({ subscription: updatedSub });
    }
    showToast(
      isVi 
        ? `🎉 Đã đăng ký thành công ${packageName} (${price})! Tính năng đã được mở khóa ngay lập tức.` 
        : `🎉 Successfully activated ${packageName} (${price})! Features unlocked immediately.`,
      "success"
    );
  };

  const calculateSchoolPricing = (students: number) => {
    if (students <= 500) return { price: "15.000.000 VNĐ / năm học", tier: "Trường quy mô Vừa (dưới 500 học sinh)" };
    if (students <= 1200) return { price: "22.000.000 VNĐ / năm học", tier: "Trường quy mô Tiêu chuẩn (500 - 1200 học sinh)" };
    return { price: "30.000.000 VNĐ / năm học", tier: "Trường quy mô Lớn (trên 1200 học sinh)" };
  };

  const schoolPriceInfo = calculateSchoolPricing(schoolStudentCount);

  return (
    <div className="space-y-6">
      {/* Top Banner Overview */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white shadow-xl relative overflow-hidden border border-indigo-800/40">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {isVi ? "Hệ Sinh Thái Gói Dịch Vụ & Mở Khóa Tính Năng" : "Monetization & Feature Gating System"}
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
              {isVi ? "Quản Lý Gói Đăng Ký & Mở Khóa Tính Năng AI" : "Subscription Tiers & AI Feature Unlocking"}
            </h2>
            <p className="text-gray-300 text-xs md:text-sm max-w-2xl leading-relaxed">
              {isVi
                ? "Theo dõi gói dịch vụ đang sử dụng, hạn ngạch lượt hỏi AI hàng ngày và quản lý nâng cấp gói linh hoạt từ 15k, 35k, 99k đến 399k."
                : "Manage your active subscription tier, track daily AI queries, and unlock premium features smoothly."}
            </p>
          </div>

          {/* Current Active Plan Quick Badge */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 flex items-center gap-4 flex-shrink-0">
            <div className="text-center px-2">
              <span className="text-[10px] font-bold uppercase text-indigo-300 block">
                {isVi ? "Gói Đang Dùng" : "Active Plan"}
              </span>
              <span className="text-base font-black text-amber-300 block mt-0.5">
                {isVi ? currentSub.tierNameVi : currentSub.tierNameEn}
              </span>
              <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">
                {currentSub.tier === 'free' ? (isVi ? "Free 5 câu/ngày" : "5 queries/day") : (isVi ? "⚡ Mở khóa Premium" : "⚡ Premium Unlocked")}
              </span>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center px-2">
              <span className="text-[10px] font-bold uppercase text-indigo-300 block">
                {isVi ? "Free Chat Hôm Nay" : "Daily Usage"}
              </span>
              <span className="text-xl font-black text-emerald-400">
                {currentSub.dailyQueriesLimit >= 9999 ? "∞" : `${freeQueriesToday}/${currentSub.dailyQueriesLimit}`}
              </span>
              <span className="text-[10px] text-gray-300 block mt-0.5">
                {isVi ? "Reset mỗi 00:00" : "Resets 00:00"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs (Cleaned up: No redundant icons, no 'Nguồn Thu 1', 'Đô Thị I') */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-3">
        <button
          onClick={() => setActiveTab('active_sub')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'active_sub'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <Icons.ShieldCheck className="w-4 h-4 text-emerald-400" />
          {isVi ? "Gói Đang Sử Dụng" : "Active Subscription"}
        </button>
        <button
          onClick={() => setActiveTab('b2c_pricing')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'b2c_pricing'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <Icons.CreditCard className="w-4 h-4" />
          {isVi ? "Gói Cá Nhân & Vi Thanh Toán" : "Personal Plans & Micro-Packs"}
        </button>
        <button
          onClick={() => setActiveTab('northstar_trial')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'northstar_trial'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <Icons.RefreshCw className="w-4 h-4 text-amber-400" />
          {isVi ? "Reset Free Trial & Mốc Kỹ Năng" : "Monthly Free Trial Reset"}
        </button>
        <button
          onClick={() => setActiveTab('regional')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'regional'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <Icons.MapPin className="w-4 h-4" />
          {isVi ? "Trợ Giá Vùng Miền & Nông Thôn" : "Regional Subsidized Rates"}
        </button>
        <button
          onClick={() => setActiveTab('b2b_school')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'b2b_school'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <Icons.School className="w-4 h-4 text-emerald-400" />
          {isVi ? "Giải Pháp Trường Học SaaS" : "School Board SaaS"}
        </button>
        <button
          onClick={() => setActiveTab('b2b_affiliate')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'b2b_affiliate'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <Icons.TrendingUp className="w-4 h-4 text-purple-400" />
          {isVi ? "Kết Nối Đào Tạo & Tuyển Dụng" : "Education & Career Partners"}
        </button>
        <button
          onClick={() => setActiveTab('rewards')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'rewards'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <Icons.Gift className="w-4 h-4" />
          {isVi ? "Điểm Thưởng CP & Điểm Danh" : "Career Points & Missions"}
        </button>
      </div>

      {/* TAB 0: CURRENT ACTIVE SUBSCRIPTION VIEW ("Gói đang sử dụng") */}
      {activeTab === 'active_sub' && (
        <div className="space-y-6 animate-fade-in">
          {/* Main Active Subscription Card */}
          <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white shadow-2xl border border-indigo-700/50 relative overflow-hidden">
            <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              {/* Header Status Row */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
                <div className="space-y-1">
                  <span className="text-xs font-black uppercase tracking-widest text-indigo-300">
                    {isVi ? "Trạng Thái Tài Khoản & Gói Đang Sử Dụng" : "Account Subscription Status"}
                  </span>
                  <h3 className="text-3xl font-black text-white flex items-center gap-3">
                    {isVi ? currentSub.tierNameVi : currentSub.tierNameEn}
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      🟢 {isVi ? "Đang Hoạt Động" : "Active"}
                    </span>
                  </h3>
                  <p className="text-xs text-gray-300">
                    {currentSub.expiresAt 
                      ? (isVi ? `Hạn sử dụng gói: ${new Date(currentSub.expiresAt).toLocaleDateString('vi-VN')}` : `Expires at: ${new Date(currentSub.expiresAt).toLocaleDateString()}`)
                      : (isVi ? "Hạn sử dụng: Vô thời hạn (Gói mặc định)" : "Expiration: Permanent free tier")}
                  </p>
                </div>

                {/* Quick Action Switcher */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleSwitchTier('monthly', 'Gói Tháng Premium')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Icons.Zap className="w-3.5 h-3.5 text-amber-300" />
                    {isVi ? "Dùng Thử Gói Tháng (99k)" : "Try Monthly (99k)"}
                  </button>
                  <button
                    onClick={() => handleSwitchTier('trial24h', 'Gói Trial 24H')}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
                  >
                    🔥 {isVi ? "Trial 24H (35k)" : "24H Pass (35k)"}
                  </button>
                  {currentSub.tier !== 'free' && (
                    <button
                      onClick={() => handleSwitchTier('free', 'Gói Miễn Phí')}
                      className="px-3 py-2 bg-white/10 hover:bg-white/20 text-gray-300 font-bold text-xs rounded-xl transition-all"
                    >
                      {isVi ? "Chuyển Về Free" : "Switch to Free"}
                    </button>
                  )}
                </div>
              </div>

              {/* Meter Grid: Daily Chat + Extra Credits */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
                  <span className="text-[11px] font-bold text-indigo-300 uppercase block">💬 Lượt Hỏi AI Hôm Nay</span>
                  <span className="text-2xl font-black text-white">
                    {currentSub.dailyQueriesLimit >= 9999 ? "Không giới hạn" : `${freeQueriesToday} / ${currentSub.dailyQueriesLimit}`}
                  </span>
                  <span className="text-[10px] text-gray-300 block">Tự động làm mới mỗi 00:00</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
                  <span className="text-[11px] font-bold text-indigo-300 uppercase block">➕ Lượt Hỏi AI Nạp Thêm</span>
                  <span className="text-2xl font-black text-emerald-400">
                    +{currentSub.extraQueriesCredits} {isVi ? "câu" : "queries"}
                  </span>
                  <button
                    onClick={() => handleSwitchTier('micro5', 'Nạp Gói 5 Câu (15k)')}
                    className="text-[10px] text-amber-300 underline font-bold block mt-1 hover:text-amber-200"
                  >
                    + Nạp thêm gói 15k
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
                  <span className="text-[11px] font-bold text-indigo-300 uppercase block">🎙️ Phỏng Vấn Thử AI</span>
                  <span className="text-2xl font-black text-purple-300">
                    {currentSub.unlockedFeatures.fullMockInterview ? (isVi ? "Không giới hạn" : "Unlimited") : `${currentSub.mockInterviewCredits} lượt`}
                  </span>
                  <span className="text-[10px] text-gray-300 block">Chấm điểm & feedback AI</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
                  <span className="text-[11px] font-bold text-indigo-300 uppercase block">📝 Sửa Bài Luận & CV</span>
                  <span className="text-2xl font-black text-amber-300">
                    {currentSub.unlockedFeatures.scholarshipEssayEditor ? (isVi ? "Không giới hạn" : "Unlimited") : `${currentSub.cvAuditCredits} lượt`}
                  </span>
                  <span className="text-[10px] text-gray-300 block">Sửa bài luận săn học bổng</span>
                </div>
              </div>

              {/* Feature Unlocked Checklist Matrix */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <h4 className="font-extrabold text-sm text-indigo-200 uppercase tracking-wider flex items-center gap-2">
                  <Icons.CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {isVi ? "Danh Sách Tính Năng Được Phép Sử Dụng Trong Gói Hiện Tại" : "Feature Privilege Matrix"}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  <div className={`p-3 rounded-xl border flex items-center gap-3 ${currentSub.unlockedFeatures.aiChat5PerDay ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' : 'bg-white/5 border-white/10 text-gray-400'}`}>
                    <Icons.CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{isVi ? "Chat AI Hướng Nghiệp (5 câu/ngày)" : "Daily AI Chat (5 queries)"}</span>
                  </div>

                  <div className={`p-3 rounded-xl border flex items-center gap-3 ${currentSub.unlockedFeatures.personalityQuiz ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' : 'bg-white/5 border-white/10 text-gray-400'}`}>
                    <Icons.CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{isVi ? "Trắc nghiệm Holland/MBTI Cơ Bản" : "Basic Holland/MBTI Assessment"}</span>
                  </div>

                  <div className={`p-3 rounded-xl border flex items-center gap-3 ${currentSub.unlockedFeatures.aiDeepDive ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' : 'bg-red-500/10 border-red-500/30 text-gray-400'}`}>
                    {currentSub.unlockedFeatures.aiDeepDive ? <Icons.CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <Icons.Lock className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                    <span>{isVi ? "AI Deep-Dive Phân tích ngành sâu" : "AI Deep-Dive Career Analytics"}</span>
                  </div>

                  <div className={`p-3 rounded-xl border flex items-center gap-3 ${currentSub.unlockedFeatures.fullMockInterview ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' : 'bg-red-500/10 border-red-500/30 text-gray-400'}`}>
                    {currentSub.unlockedFeatures.fullMockInterview ? <Icons.CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <Icons.Lock className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                    <span>{isVi ? "Phỏng Vấn Thử AI & Rubric Chuẩn" : "AI Mock Interview & Scoring Rubric"}</span>
                  </div>

                  <div className={`p-3 rounded-xl border flex items-center gap-3 ${currentSub.unlockedFeatures.scholarshipEssayEditor ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' : 'bg-red-500/10 border-red-500/30 text-gray-400'}`}>
                    {currentSub.unlockedFeatures.scholarshipEssayEditor ? <Icons.CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <Icons.Lock className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                    <span>{isVi ? "Sửa Bài Luận Học Bổng & Audit Học Bạ" : "Scholarship Essay & Grade Audit"}</span>
                  </div>

                  <div className={`p-3 rounded-xl border flex items-center gap-3 ${currentSub.unlockedFeatures.reskillingSkillBridge ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' : 'bg-red-500/10 border-red-500/30 text-gray-400'}`}>
                    {currentSub.unlockedFeatures.reskillingSkillBridge ? <Icons.CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <Icons.Lock className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                    <span>{isVi ? "Skill Bridge Chuyển Ngành Lao Động" : "Skill Bridge Career Reskilling"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: B2C FREEMIUM & MICRO PACKAGES */}
      {activeTab === 'b2c_pricing' && (
        <div className="space-y-8 animate-fade-in">
          {/* Free Model Info Header */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600 text-white rounded-xl shadow-sm">
                <Icons.Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">
                  {isVi ? "Mô hình Miễn phí (Free Tier Default)" : "Default Free Tier Policy"}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                  {isVi
                    ? "Tất cả người dùng mới được phép Chat AI 5 câu/ngày + 1 bài trắc nghiệm tính cách (Holland/MBTI) cơ bản."
                    : "All users enjoy 5 free AI chats per day + 1 basic Holland/MBTI personality assessment."}
                </p>
              </div>
            </div>
            <div className="px-3.5 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 font-bold text-xs flex items-center gap-1.5 flex-shrink-0">
              <Icons.Lock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              {isVi ? "Free 5 câu/ngày" : "Free 5 queries/day"}
            </div>
          </div>

          {/* Section 1: Major Subscription Tiers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">
                  {isVi ? "1. Gói Thuê Bao Thuần (B2C Subscriptions)" : "1. Core B2C Subscription Packages"}
                </h3>
                <p className="text-xs text-gray-500">
                  {isVi ? "Đầy đủ tính năng AI Deep-Dive, Phân tích học bạ, Sửa bài luận học bổng & Mentor 1-1" : "Unlock full AI Deep-Dive, Transcript Analysis, Essay Edits & 1-1 Mentors"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Gói Tháng Standard */}
              <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border-2 border-indigo-500 shadow-md flex flex-col justify-between space-y-4 relative">
                <div className="absolute -top-3 right-4 bg-indigo-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                  {isVi ? "Phổ biến" : "Popular"}
                </div>
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase text-indigo-600 dark:text-indigo-400 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full inline-block">
                    {isVi ? "Gói Tháng Standard" : "Monthly Subscription"}
                  </span>
                  <div>
                    <h4 className="text-3xl font-black text-gray-900 dark:text-white">99.000 VNĐ</h4>
                    <span className="text-xs text-gray-500">/ {isVi ? "tháng" : "month"}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {isVi ? "Giá chuẩn mở khóa toàn bộ tính năng AI Deep-Dive & Tư vấn định hướng không giới hạn." : "Full AI Deep-Dive access & unlimited career consulting."}
                  </p>
                  <ul className="text-xs space-y-2 text-gray-600 dark:text-gray-300 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <li className="flex items-center gap-2"><Icons.Check className="w-4 h-4 text-emerald-500" /> {isVi ? "Chat AI Deep-Dive không giới hạn" : "Unlimited AI Deep-Dive Chat"}</li>
                    <li className="flex items-center gap-2"><Icons.Check className="w-4 h-4 text-emerald-500" /> {isVi ? "Phân tích chi tiết 150+ Trường ĐH" : "Deep Analysis for 150+ Universities"}</li>
                    <li className="flex items-center gap-2"><Icons.Check className="w-4 h-4 text-emerald-500" /> {isVi ? "Sửa bài luận săn học bổng" : "Scholarship Essay Corrections"}</li>
                    <li className="flex items-center gap-2"><Icons.Check className="w-4 h-4 text-emerald-500" /> {isVi ? "Kết nối Mentor 1-1 sinh viên Top" : "1-1 Top Student Mentor Match"}</li>
                  </ul>
                </div>
                <button
                  onClick={() => handleSimulatePurchase("Gói Tháng Premium Standard", "99.000 VNĐ", "monthly")}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
                >
                  {isVi ? "Đăng Ký Gói Tháng (99k)" : "Subscribe Monthly (99k)"}
                </button>
              </div>

              {/* Gói Mùa Thi */}
              <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400 px-3 py-1 bg-amber-50 dark:bg-amber-900/30 rounded-full inline-block">
                    {isVi ? "Gói Mùa Thi (Season Pass)" : "Exam Season Pass"}
                  </span>
                  <div>
                    <h4 className="text-3xl font-black text-gray-900 dark:text-white">299.000 VNĐ</h4>
                    <span className="text-xs text-gray-500">/ {isVi ? "mùa thi (4 tháng)" : "exam season (4 months)"}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {isVi ? "Đồng hành xuyên suốt mùa ôn thi Đánh giá năng lực & Tuyển sinh Đại học." : "Full coverage through exam seasons & university admission cycles."}
                  </p>
                  <ul className="text-xs space-y-2 text-gray-600 dark:text-gray-300 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <li className="flex items-center gap-2"><Icons.Check className="w-4 h-4 text-emerald-500" /> {isVi ? "Tiết kiệm 25% so với gói tháng" : "Save 25% compared to monthly"}</li>
                    <li className="flex items-center gap-2"><Icons.Check className="w-4 h-4 text-emerald-500" /> {isVi ? "Dự đoán điểm chuẩn ĐH theo học bạ" : "University score predictor"}</li>
                    <li className="flex items-center gap-2"><Icons.Check className="w-4 h-4 text-emerald-500" /> {isVi ? "Full bộ Mock Interview phỏng vấn" : "Full AI Mock Interview practice"}</li>
                  </ul>
                </div>
                <button
                  onClick={() => handleSimulatePurchase("Gói Mùa Thi Premium", "299.000 VNĐ", "season")}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
                >
                  {isVi ? "Mua Gói Mùa Thi (299k)" : "Buy Season Pass (299k)"}
                </button>
              </div>

              {/* Gói Năm Saver */}
              <div className="p-6 rounded-2xl bg-gradient-to-b from-purple-50 to-white dark:from-purple-950/30 dark:to-gray-800 border-2 border-purple-500 shadow-md flex flex-col justify-between space-y-4 relative">
                <div className="absolute -top-3 right-4 bg-purple-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                  {isVi ? "Tiết kiệm 66%" : "Save 66%"}
                </div>
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase text-purple-600 dark:text-purple-400 px-3 py-1 bg-purple-100 dark:bg-purple-900/50 rounded-full inline-block">
                    {isVi ? "Gói Năm (Best Value)" : "Annual Subscription"}
                  </span>
                  <div>
                    <h4 className="text-3xl font-black text-gray-900 dark:text-white">399.000 VNĐ</h4>
                    <span className="text-xs text-gray-500">/ {isVi ? "năm (chỉ ~33k/tháng)" : "year (~33k/mo)"}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {isVi ? "Gói năm toàn diện dành cho học sinh THPT & Sinh viên năm nhất muốn chuẩn bị sớm." : "Full annual pass for high schoolers & freshmen preparing early."}
                  </p>
                  <ul className="text-xs space-y-2 text-gray-600 dark:text-gray-300 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <li className="flex items-center gap-2"><Icons.Check className="w-4 h-4 text-purple-500" /> {isVi ? "Đầy đủ 100% tính năng Premium" : "All Premium features included"}</li>
                    <li className="flex items-center gap-2"><Icons.Check className="w-4 h-4 text-purple-500" /> {isVi ? "Ưu tiên hỗ trợ kỹ thuật 24/7" : "Priority 24/7 technical support"}</li>
                    <li className="flex items-center gap-2"><Icons.Check className="w-4 h-4 text-purple-500" /> {isVi ? "Tặng bộ Ebook lộ trình du học" : "Free Abroad Scholarship Ebook Pack"}</li>
                  </ul>
                </div>
                <button
                  onClick={() => handleSimulatePurchase("Gói Năm Premium", "399.000 VNĐ", "annual")}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
                >
                  {isVi ? "Đăng Ký Gói Năm (399k)" : "Subscribe Annual (399k)"}
                </button>
              </div>

              {/* Gói Premium cho nhóm Lao Động (Career Reskilling) */}
              <div className="p-6 rounded-2xl bg-gradient-to-b from-teal-50 to-white dark:from-teal-950/30 dark:to-gray-800 border-2 border-teal-500 shadow-md flex flex-col justify-between space-y-4 relative">
                <div className="absolute -top-3 right-4 bg-teal-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                  {isVi ? "Chuyển Ngành" : "Career Switch"}
                </div>
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase text-teal-700 dark:text-teal-300 px-3 py-1 bg-teal-100 dark:bg-teal-900/50 rounded-full inline-block">
                    {isVi ? "Gói Người Đi Làm" : "Working Professional Tier"}
                  </span>
                  <div>
                    <h4 className="text-2xl font-black text-gray-900 dark:text-white">149.000 - 199.000 VNĐ</h4>
                    <span className="text-xs text-gray-500">/ {isVi ? "tháng" : "month"}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {isVi ? "Dành cho người đi làm chuyển ngành hoặc nâng cấp kỹ năng với công cụ chuyên sâu." : "For working adults switching fields or upgrading mid-career competencies."}
                  </p>
                  <ul className="text-xs space-y-2 text-gray-600 dark:text-gray-300 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <li className="flex items-center gap-2"><Icons.Check className="w-4 h-4 text-teal-600" /> {isVi ? "Skill Bridge Analysis (Kế thừa kỹ năng)" : "Skill Bridge Analysis (Transferable skills)"}</li>
                    <li className="flex items-center gap-2"><Icons.Check className="w-4 h-4 text-teal-600" /> {isVi ? "Mock Interview chuẩn Rubric ngành mới" : "Mock Interview with new industry rubric"}</li>
                    <li className="flex items-center gap-2"><Icons.Check className="w-4 h-4 text-teal-600" /> {isVi ? "Mạng lưới Alumni & Mentor Network" : "Alumni & Professional Mentor Network"}</li>
                  </ul>
                </div>
                <button
                  onClick={() => handleSimulatePurchase("Gói Premium Lao Động", "149.000 VNĐ", "reskilling")}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
                >
                  {isVi ? "Đăng Ký Gói Chuyển Ngành" : "Subscribe Career Switch"}
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Pay-Per-Use Micro Packages */}
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Icons.Coins className="w-5 h-5 text-amber-500" />
                {isVi ? "2. Gói Vi Thanh Toán Theo Lượt Sử Dụng (Pay-per-Use Micro Packages)" : "2. Pay-Per-Use Micro Packages"}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {isVi
                  ? "Dành cho nhóm người dùng không có nhu cầu thuê bao dài hạn, nạp linh hoạt theo nhu cầu thực tế."
                  : "Designed for users with low or irregular budgets who prefer flexible per-item purchases."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Gói lẻ 5 câu */}
              <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded">
                    {isVi ? "Gói Lẻ 5 Câu" : "5 Queries Pack"}
                  </span>
                  <h5 className="text-xl font-black text-gray-900 dark:text-white mt-2">15.000 VNĐ</h5>
                  <p className="text-[11px] text-gray-500 mt-1">
                    {isVi ? "Nạp thêm 5 lượt hỏi AI định hướng công việc tức thì." : "Instant 5 additional AI career guidance prompts."}
                  </p>
                </div>
                <button
                  onClick={() => handleSimulatePurchase("Gói lẻ 5 câu", "15.000 VNĐ", "micro5")}
                  className="w-full py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-xs rounded-lg hover:opacity-90 transition-opacity"
                >
                  {isVi ? "Mua 15k / 5 câu" : "Buy 15k (5 Pack)"}
                </button>
              </div>

              {/* Gói lẻ 10 câu */}
              <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded">
                    {isVi ? "Gói Lẻ 10 Câu" : "10 Queries Pack"}
                  </span>
                  <h5 className="text-xl font-black text-gray-900 dark:text-white mt-2">25.000 VNĐ</h5>
                  <p className="text-[11px] text-gray-500 mt-1">
                    {isVi ? "Tiết kiệm hơn khi nạp 10 lượt tư vấn sâu." : "Better value pack with 10 deep consultation queries."}
                  </p>
                </div>
                <button
                  onClick={() => handleSimulatePurchase("Gói 10 câu", "25.000 VNĐ", "micro10")}
                  className="w-full py-2 bg-indigo-600 text-white font-bold text-xs rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {isVi ? "Mua 25k / 10 câu" : "Buy 25k (10 Pack)"}
                </button>
              </div>

              {/* Mock Interview Lẻ */}
              <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded">
                    {isVi ? "Phỏng Vấn Lẻ" : "Mock Interview"}
                  </span>
                  <h5 className="text-xl font-black text-gray-900 dark:text-white mt-2">10.000 - 15.000 VNĐ</h5>
                  <p className="text-[11px] text-gray-500 mt-1">
                    {isVi ? "1 Phiên Phỏng vấn thử AI với chấm điểm & phản hồi ngay." : "1 AI Mock interview session with instant feedback."}
                  </p>
                </div>
                <button
                  onClick={() => handleSimulatePurchase("1 lượt Mock Interview", "15.000 VNĐ")}
                  className="w-full py-2 bg-purple-600 text-white font-bold text-xs rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {isVi ? "Mua Lượt Phỏng Vấn" : "Buy Mock Session"}
                </button>
              </div>

              {/* Phân Tích CV/Học Bạ Lẻ */}
              <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded">
                    {isVi ? "Soi CV / Học Bạ" : "CV & Grade Audit"}
                  </span>
                  <h5 className="text-xl font-black text-gray-900 dark:text-white mt-2">5.000 - 8.000 VNĐ</h5>
                  <p className="text-[11px] text-gray-500 mt-1">
                    {isVi ? "1 lượt AI audit học bạ hoặc sửa CV chuyên sâu." : "1 deep AI audit session for CV or high school transcript."}
                  </p>
                </div>
                <button
                  onClick={() => handleSimulatePurchase("Lượt Phân tích CV/Học bạ", "8.000 VNĐ")}
                  className="w-full py-2 bg-emerald-600 text-white font-bold text-xs rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  {isVi ? "Soi CV/Học Bạ (5k-8k)" : "Buy Audit (5k-8k)"}
                </button>
              </div>

              {/* Trial 24h Pass */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-black/20 text-yellow-200 rounded">
                    {isVi ? "Trial Premium 24H" : "24H Full Pass"}
                  </span>
                  <h5 className="text-xl font-black mt-2">35.000 VNĐ</h5>
                  <p className="text-[11px] text-amber-100 mt-1 leading-snug">
                    {isVi
                      ? "Mở khóa TẤT CẢ tính năng nâng cao trong 24 giờ."
                      : "Unlock ALL premium tools for 24 hours."}
                  </p>
                </div>
                <button
                  onClick={() => handleSimulatePurchase("Gói Trial Premium 24H", "35.000 VNĐ", "trial24h")}
                  className="w-full py-2 bg-white text-orange-700 font-extrabold text-xs rounded-lg hover:bg-amber-50 transition-colors shadow-sm"
                >
                  {isVi ? "Kích Hoạt 24H (35k)" : "Activate 24H Pass"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MONTHLY FREE TRIAL RESET */}
      {activeTab === 'northstar_trial' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-6 animate-fade-in">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 rounded-full text-xs font-bold mb-2">
                <Icons.Target className="w-3.5 h-3.5" />
                {isVi ? "Cơ Chế 'Làm Mới' Hạn Ngạch Premium Hàng Tháng" : "Monthly Premium Trial Refresh"}
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white">
                {isVi ? "Cơ Chế Free Trial Định Kỳ (Tự Động Reset Ngày 1 Hàng Tháng)" : "Monthly Free Trial Refresh"}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 max-w-3xl leading-relaxed">
                {isVi
                  ? "Thay vì đóng khung vĩnh viễn ở mức miễn phí cơ bản, hệ thống thiết lập cơ chế 'làm mới' vào ngày 1 hàng tháng: Mỗi tài khoản Free được cấp 1 hạn ngạch trải nghiệm Premium (3 lượt Mock Interview hoặc 1 lượt AI Deep-Dive học bạ). ĐIỀU KIỆN: Hoàn thành tối thiểu 3 mốc kỹ năng trong tháng trước đó!"
                  : "Every 1st of the month, free accounts receive a Premium Trial allowance (3 Mock Interviews or 1 Deep-Dive audit), provided they completed at least 3 skill milestones in the previous month."}
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white space-y-4 shadow-lg border border-indigo-800/40">
            <h4 className="font-extrabold text-base flex items-center gap-2 text-amber-300">
              <Icons.Award className="w-5 h-5 text-amber-400" />
              {isVi ? "Trạng Thái Điều Kiện Tháng Này (North Star Metric)" : "Current Qualification Progress"}
            </h4>

            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-300">{isVi ? "Mốc kỹ năng đã hoàn thành tháng trước:" : "Milestones completed last month:"}</span>
                <span className="font-black text-amber-300 text-sm">{completedMilestonesLastMonth} / 3 mốc</span>
              </div>
              <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500"
                  style={{ width: `${Math.min(100, (completedMilestonesLastMonth / 3) * 100)}%` }}
                />
              </div>
              <div className="text-[11px] text-gray-300 flex items-center justify-between">
                <span>{completedMilestonesLastMonth >= 3 ? (isVi ? "✅ Đã đủ điều kiện nhận Trial Premium ngày 1 tới" : "✅ Qualified for 1st of Month Trial") : (isVi ? "⚠️ Cần thêm mốc để unlock" : "⚠️ Need more milestones")}</span>
                <span className="text-emerald-400 font-bold">{completedMilestonesLastMonth >= 3 ? "+3 Mock Interviews Free" : "0 / 3 unlocked"}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-gray-300 block">{isVi ? "Thử nghiệm cơ chế hoàn thành mốc:" : "Simulate milestone progress:"}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setCompletedMilestonesLastMonth(prev => prev + 1);
                    showToast(isVi ? "🎉 Đã hoàn thành 1 mốc kỹ năng mới! Đã cộng vào North Star Metric." : "🎉 Completed 1 milestone!", "success");
                  }}
                  className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <Icons.PlusCircle className="w-4 h-4" />
                  {isVi ? "+1 Mốc Kỹ Năng" : "+1 Milestone"}
                </button>
                <button
                  onClick={() => {
                    setCompletedMilestonesLastMonth(0);
                    showToast(isVi ? "Đã reset tiến độ về 0 mốc." : "Reset milestones to 0.", "info");
                  }}
                  className="py-2 px-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-colors"
                >
                  {isVi ? "Reset" : "Reset"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REGIONAL PRICING WITH GOOGLE MAPS & IP INSPECTOR */}
      {activeTab === 'regional' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-6 animate-fade-in">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Icons.MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                {isVi ? "Kiểm Tra Vị Trí IP & Google Maps Trợ Giá Vùng Miền Nông Thôn" : "IP & Google Maps Geolocation Regional Subsidies"}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 max-w-3xl">
                {isVi
                  ? "Tự động kết hợp kiểm tra IP địa lý và Bản đồ Google Maps để trợ giá 30% - 50% cho học sinh thuộc các Tỉnh/Thành Nông Thôn, Tây Nguyên, Đồng Bằng Sông Cửu Long & Vùng Sâu Vùng Xa."
                  : "Combines IP geolocation & Google Maps to automatically issue 30% - 50% regional purchasing parity discounts for rural students."}
              </p>
            </div>
          </div>

          {/* Interactive IP & Google Maps Location Verifier Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-emerald-950 text-white space-y-4 border border-emerald-500/30 shadow-lg">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                  🌐 Google Maps & IP Verification Engine
                </span>
                <h4 className="text-lg font-bold">
                  {isVi ? "Trình Kiểm Tra IP & Định Vị Bản Đồ Vùng Ưu Đãi" : "IP & Google Map Location Inspector"}
                </h4>
              </div>

              <button
                onClick={() => {
                  showToast(isVi ? "🔍 Đã quét thành công IP: 113.161.xx.xx (Đắk Lắk - Tây Nguyên)! Đã áp dụng giảm giá Vùng II & III." : "Verified IP location!", "success");
                }}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <Icons.MapPin className="w-4 h-4" />
                {isVi ? "Bấm Quét IP & Tọa Độ Bản Đồ" : "Scan IP & Coordinates"}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2">
              <div className="lg:col-span-5 space-y-3">
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 text-xs space-y-2">
                  <div className="flex justify-between items-center text-gray-300">
                    <span>IP Địa Lý Hiện Tại:</span>
                    <strong className="text-emerald-400 font-mono">113.161.72.109 (Viettel-VN)</strong>
                  </div>
                  <div className="flex justify-between items-center text-gray-300">
                    <span>Vùng Xác Thực:</span>
                    <strong className="text-amber-300">Tây Nguyên / Nông Thôn (Cấp Trợ Giá II & III)</strong>
                  </div>
                  <div className="flex justify-between items-center text-gray-300">
                    <span>Độ Tin Cậy IP & GPS:</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">98.5% Verified</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">
                    {isVi ? "Chọn Tỉnh / Thành phố để kiểm tra mức trợ giá:" : "Select Province to inspect rate:"}
                  </label>
                  <select
                    value={userDeclaredSchool}
                    onChange={(e) => {
                      setUserDeclaredSchool(e.target.value);
                      setSelectedRegion(e.target.value.includes('Hà Nội') || e.target.value.includes('TP. Hồ Chí Minh') || e.target.value.includes('Đà Nẵng') ? 'tier1' : 'tier23');
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-indigo-700/60 rounded-xl text-xs font-bold text-white focus:outline-none"
                  >
                    <option value="THPT Chuyên Hà Nội - Amsterdam (Hà Nội - Đô thị I)">Hà Nội (Khu vực Đô thị I - Mức chuẩn)</option>
                    <option value="THPT Nguyễn Hữu Huân (TP. Hồ Chí Minh - Đô thị I)">TP. Hồ Chí Minh (Khu vực Đô thị I - Mức chuẩn)</option>
                    <option value="THPT Chuyên Nguyễn Du (Đắk Lắk - Tây Nguyên)">Đắk Lắk (Trợ Giá Nông Thôn / Tây Nguyên -30%)</option>
                    <option value="THPT Chuyên Lê Quý Đôn (Gia Lai)">Gia Lai (Trợ Giá Nông Thôn / Tây Nguyên -40%)</option>
                    <option value="THPT Chuyên Hùng Vương (Phú Thọ)">Phú Thọ (Trợ Giá Vùng Trung Du -30%)</option>
                    <option value="THPT Chuyên Hùng Vương (Cà Mau)">Cà Mau (Trợ Giá Miền Tây / Nông Thôn -50%)</option>
                    <option value="THPT Vùng Cao Việt Bắc (Thái Nguyên / Hà Giang)">Hà Giang / Vùng Sâu Vùng Xa (Trợ Giá Mức Cao Nhất -50%)</option>
                  </select>
                </div>
              </div>

              {/* Simulated Map Canvas View */}
              <div className="lg:col-span-7 bg-slate-900/90 rounded-xl border border-indigo-500/30 overflow-hidden relative min-h-[160px] flex flex-col justify-between p-4">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                <div className="flex items-center justify-between text-xs relative z-10">
                  <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                    <Icons.Compass className="w-4 h-4 text-emerald-400 animate-spin" />
                    Google Maps Satellite Region Radar
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    LAT: 12.6667, LNG: 108.0500
                  </span>
                </div>

                <div className="my-auto text-center relative z-10 py-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/40 rounded-full text-emerald-300 text-xs font-bold mb-1">
                    📍 {userDeclaredSchool}
                  </div>
                  <p className="text-[11px] text-gray-300">
                    Mức Trợ Giá Tự Động Được Áp Dụng: <strong className="text-amber-300 font-extrabold">{selectedRegion === 'tier23' ? '29.000 VNĐ / tháng (-50% OFF)' : '99.000 VNĐ / tháng (Giá Đô Thị)'}</strong>
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-white/10 pt-2 text-[10px] text-gray-400 relative z-10">
                  <span>Powering Location Matching via Google Maps Platform</span>
                  <button 
                    onClick={() => handleSimulatePurchase("Gói Trợ Giá Vùng Miền Nông Thôn", "29.000 VNĐ", "monthly")}
                    className="text-amber-300 font-bold hover:underline"
                  >
                    Kích hoạt ngay với giá 29k &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div 
              onClick={() => setSelectedRegion('tier1')}
              className={`p-6 rounded-2xl border cursor-pointer transition-all space-y-4 ${
                selectedRegion === 'tier1'
                  ? 'border-indigo-600 bg-indigo-50/30 dark:bg-indigo-950/20 ring-2 ring-indigo-500/30'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-base text-gray-900 dark:text-white">
                  {isVi ? "Khu Vực Đô Thị (Hà Nội, TP.HCM, Đà Nẵng)" : "Tier I Metropolitan (Hanoi, HCMC, Da Nang)"}
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200">
                  {isVi ? "Mức Giá Chuẩn" : "Standard Price"}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                {isVi ? "Áp dụng cho người dùng tại các trung tâm đô thị lớn." : "Standard subscription rate for major urban centers."}
              </p>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <span className="text-xs text-gray-500">{isVi ? "Mức giá Premium:" : "Premium monthly rate:"}</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">99.000 VNĐ / tháng</span>
              </div>
            </div>

            <div 
              onClick={() => setSelectedRegion('tier23')}
              className={`p-6 rounded-2xl border cursor-pointer transition-all space-y-4 ${
                selectedRegion === 'tier23'
                  ? 'border-emerald-600 bg-emerald-50/30 dark:bg-emerald-950/20 ring-2 ring-emerald-500/30'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-base text-gray-900 dark:text-white">
                  {isVi ? "Tỉnh, Nông Thôn & Vùng Sâu Vùng Xa" : "Provinces & Rural Regions"}
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                  {isVi ? "Ưu Đãi Trợ Giá 30% - 50%" : "30-50% Regional Subsidy"}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                {isVi ? "Trợ giá sâu cho cùng một gói Premium giúp học sinh vùng xa tiếp cận AI công bằng." : "Deeply subsidized rate for the identical Premium package."}
              </p>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <span className="text-xs text-gray-500">{isVi ? "Mức giá ưu đãi trợ giá:" : "Subsidized monthly rate:"}</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">29.000 - 39.000 VNĐ / tháng</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: B2B SCHOOL SAAS */}
      {activeTab === 'b2b_school' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-6 animate-fade-in">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 rounded-full text-xs font-bold mb-2">
                <Icons.Building2 className="w-3.5 h-3.5" />
                {isVi ? "B2B School SaaS (Triển khai Trường Học)" : "B2B School SaaS"}
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white">
                {isVi ? "Giải Pháp 'Trường Học Thông Minh - Hướng Nghiệp Số' Cho THPT Tư Thục" : "Smart School Digital Career Guidance SaaS"}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 max-w-3xl leading-relaxed">
                {isVi
                  ? "Nhà trường trả phí bản quyền phần mềm để TOÀN BỘ học sinh trong trường được dùng gói Premium. Ban giám hiệu nhận về Dashboard phân tích real-time tâm lý & nguyện vọng học sinh."
                  : "Schools pay a software license fee for all students to access Premium. School management gains real-time analytical dashboards."}
              </p>
            </div>
            <div className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-md flex-shrink-0">
              15.000.000 - 30.000.000 VNĐ / {isVi ? "năm học" : "school year"}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950 to-slate-900 text-white space-y-4 shadow-lg border border-emerald-800/40">
            <h4 className="font-extrabold text-base flex items-center gap-2 text-emerald-300">
              <Icons.Calculator className="w-5 h-5 text-emerald-400" />
              {isVi ? "Bảng Tính Phí Bản Quyền Theo Quy Mô Trường" : "School SaaS License Pricing Estimator"}
            </h4>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-300 font-bold">
                <span>{isVi ? "Số lượng học sinh trong trường:" : "Total students in school:"}</span>
                <span className="text-emerald-400 font-black text-sm">{schoolStudentCount} {isVi ? "học sinh" : "students"}</span>
              </div>
              <input
                type="range"
                min="200"
                max="2500"
                step="50"
                value={schoolStudentCount}
                onChange={(e) => setSchoolStudentCount(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>200 {isVi ? "học sinh" : "students"}</span>
                <span>1200 {isVi ? "học sinh" : "students"}</span>
                <span>2500+ {isVi ? "học sinh" : "students"}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 border border-white/10">
              <div>
                <span className="text-xs text-emerald-300 font-bold block">{schoolPriceInfo.tier}</span>
                <span className="text-2xl font-black text-white">{schoolPriceInfo.price}</span>
              </div>
              <button
                onClick={() => showToast(isVi ? "Đã gửi đề xuất Demo B2B cho Ban Giám Hiệu!" : "Sent B2B proposal to school board!", "success")}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
              >
                <Icons.Send className="w-4 h-4" />
                {isVi ? "Đăng Ký Bản Quyền Trường" : "Request School License"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: B2B AFFILIATE & LEAD GEN */}
      {activeTab === 'b2b_affiliate' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-6 animate-fade-in">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 rounded-full text-xs font-bold mb-2">
                <Icons.TrendingUp className="w-3.5 h-3.5" />
                {isVi ? "B2B Lead Generation & Affiliate" : "B2B Lead Gen & Affiliate"}
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white">
                {isVi ? "Phễu Lọc Hướng Nghiệp & Thu Phí Cost Per Lead (CPL)" : "AI Career Funnel & Cost Per Lead Monetization"}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 max-w-3xl leading-relaxed">
                {isVi
                  ? "Khi AI nhận diện học sinh có nhu cầu nâng cao kỹ năng, hệ thống kết nối khóa học uy tín từ đối tác kiểm định hoặc ngành học Đại học."
                  : "AI detects student skill gaps and recommends verified partner courses."}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                {isVi ? "Danh Sách Trung Tâm & Trường Đại Học Đã Kiểm Định" : "Verified Educational Partners & Universities"}
              </h4>
              <div className="flex gap-2">
                {['all', 'english', 'coding', 'data'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setPartnerCategory(cat as any)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold capitalize ${
                      partnerCategory === cat
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PARTNER_OFFERS
                .filter(o => partnerCategory === 'all' || o.category === partnerCategory)
                .slice(0, 6)
                .map(offer => (
                  <div key={offer.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <img src={offer.logoUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                        <div>
                          <h5 className="font-bold text-xs text-gray-900 dark:text-white">{offer.partnerName}</h5>
                          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-extrabold">{offer.commissionTag}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">{offer.title_vi}</p>
                    </div>

                    <button
                      onClick={() => handleClaimVoucher(offer.voucherCode)}
                      className="w-full py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <Icons.ExternalLink className="w-3.5 h-3.5" />
                      {isVi ? "Nhận Tư Vấn CPL" : "Get Advice CPL"}
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: GAMIFICATION & REWARDS */}
      {activeTab === 'rewards' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          <div className="lg:col-span-6 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Icons.CalendarCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                {isVi ? "Chuỗi Điểm Danh Hàng Ngày" : "Daily Check-in Streak"}
              </h3>
              <span className="text-xs font-extrabold px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 rounded-full flex items-center gap-1">
                <Icons.Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {streakDays} {isVi ? "ngày" : "days"}
              </span>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              {isVi
                ? "Duy trì thói quen điểm danh mỗi ngày để tích lũy Career Points (CP) và cộng thêm lượt chat AI."
                : "Maintain daily attendance to earn bonus Career Points (CP) and extra AI tokens."}
            </p>

            <div className="grid grid-cols-7 gap-2 py-2">
              {[1, 2, 3, 4, 5, 6, 7].map(day => {
                const isCompleted = day <= streakDays;
                return (
                  <div
                    key={day}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isCompleted
                        ? 'bg-gradient-to-b from-amber-400 to-orange-500 text-white border-amber-500 font-bold shadow-sm'
                        : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-400'
                    }`}
                  >
                    <span className="text-[10px] block font-extrabold uppercase">{isVi ? `Ngày ${day}` : `Day ${day}`}</span>
                    <Icons.CheckCircle2 className={`w-4 h-4 mx-auto mt-1 ${isCompleted ? 'text-white' : 'opacity-30'}`} />
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleDailyCheckIn}
              disabled={dailyCheckInDone}
              className={`w-full py-3 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 text-sm ${
                dailyCheckInDone
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white'
              }`}
            >
              <Icons.Sparkles className="w-4 h-4" />
              {dailyCheckInDone
                ? (isVi ? "Đã điểm danh hôm nay" : "Checked in today")
                : (isVi ? "Bấm Điểm Danh Hôm Nay (+20 CP)" : "Claim Daily Check-in (+20 CP)")}
            </button>
          </div>

          <div className="lg:col-span-6 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Icons.Gift className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              {isVi ? "Cửa Hàng Đổi Điểm CP & Nhiệm Vụ" : "CP Points Store & Missions"}
            </h3>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center justify-between text-xs">
              <span className="font-bold text-amber-900 dark:text-amber-200">
                {isVi ? "Số điểm CP hiện có:" : "Your Current CP Balance:"}
              </span>
              <span className="text-base font-black text-amber-600 dark:text-amber-400">
                {points} CP
              </span>
            </div>

            {/* Redeem Options */}
            <div className="space-y-2 pt-1">
              <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                {isVi ? "Đổi Điểm Lấy Tính Năng AI:" : "Redeem CP for AI Privileges:"}
              </h4>

              <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between gap-2">
                <div>
                  <h5 className="font-bold text-xs text-gray-900 dark:text-white">+5 Lượt Hỏi AI Nạp Thêm</h5>
                  <span className="text-[10px] text-gray-500">Đổi 100 CP</span>
                </div>
                <button
                  onClick={() => handleRedeemPoints(100, 'queries', '+5 Lượt hỏi AI')}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors"
                >
                  Đổi (100 CP)
                </button>
              </div>

              <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between gap-2">
                <div>
                  <h5 className="font-bold text-xs text-gray-900 dark:text-white">+1 Lượt Phỏng Vấn Thử AI</h5>
                  <span className="text-[10px] text-gray-500">Đổi 200 CP</span>
                </div>
                <button
                  onClick={() => handleRedeemPoints(200, 'mock', '+1 Lượt Phỏng vấn')}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors"
                >
                  Đổi (200 CP)
                </button>
              </div>

              <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between gap-2">
                <div>
                  <h5 className="font-bold text-xs text-gray-900 dark:text-white">Full Trial Premium 24H</h5>
                  <span className="text-[10px] text-gray-500">Đổi 300 CP</span>
                </div>
                <button
                  onClick={() => handleRedeemPoints(300, 'trial', 'Pass Trial Premium 24H')}
                  className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs rounded-lg shadow-sm hover:opacity-90 transition-opacity"
                >
                  Đổi (300 CP)
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                {isVi ? "Nhiệm Vụ Hàng Ngày:" : "Daily Missions:"}
              </h4>
              {missions.map((mission) => (
                <div
                  key={mission.id}
                  className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between gap-4"
                >
                  <div>
                    <h5 className="font-bold text-xs text-gray-900 dark:text-white">
                      {isVi ? mission.title_vi : mission.title_en}
                    </h5>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                      {mission.reward}
                    </span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${mission.done ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'}`}>
                    {mission.done ? (isVi ? "Hoàn thành" : "Done") : (isVi ? "Chưa xong" : "Pending")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
