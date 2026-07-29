import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import { Language, UserProfile } from '../types';

interface MonetizationRewardsHubProps {
  language: Language;
  user: UserProfile | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateToChat: () => void;
}

interface PartnerOffer {
  id: string;
  partnerName: string;
  category: 'english' | 'coding' | 'soft_skills' | 'data';
  title_vi: string;
  title_en: string;
  description_vi: string;
  description_en: string;
  discountBadge: string;
  voucherCode: string;
  commissionTag: string;
  link: string;
  logoUrl: string;
}

const PARTNER_OFFERS: PartnerOffer[] = [
  {
    id: 'ielts-partner',
    partnerName: 'IELTS Master Center',
    category: 'english',
    title_vi: 'Khoá Học IELTS Cấp Tốc Cam Kết Đầu Ra 7.0+',
    title_en: 'IELTS Intensive Guarantee Program 7.0+',
    description_vi: 'Dành cho sinh viên yếu tiếng Anh muốn nâng band nhanh để đi làm hoặc du học.',
    description_en: 'For students looking to fast-track their IELTS for global jobs & scholarships.',
    discountBadge: 'Tặng 500,000 VNĐ',
    voucherCode: 'CAREER500K',
    commissionTag: 'Đối tác chiến lược - Hoa hồng tài trợ 10%',
    link: 'https://ieltsmasters.vn',
    logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=120&q=80'
  },
  {
    id: 'fullstack-bootcamp',
    partnerName: 'CodeAcademy Vietnam',
    category: 'coding',
    title_vi: 'Bootcamp Lập Trình Thực Chiến 1-1 Kèm Mentor',
    title_en: 'Practical Coding Bootcamp 1-on-1 Mentorship',
    description_vi: 'Học thực tế trên dự án doanh nghiệp, hỗ trợ xin việc ngay sau 4 tháng.',
    description_en: 'Learn by building enterprise projects with direct hiring support.',
    discountBadge: 'Giảm 30% Học Phí',
    voucherCode: 'CODEPRO30',
    commissionTag: 'Đối tác tài trợ - Chiết khấu 15%',
    link: 'https://codeacademy.vn',
    logoUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=120&q=80'
  },
  {
    id: 'soft-skill-hub',
    partnerName: 'Future Leaders Institute',
    category: 'soft_skills',
    title_vi: 'Khoá Kỹ Năng Mềm & Phỏng Vấn Tuyển Dụng Chuyên Sâu',
    title_en: 'Soft Skills & Interview Mastery Course',
    description_vi: 'Luyện giao tiếp, thuyết trình, làm việc nhóm và đàm phán lương.',
    description_en: 'Master workplace communication, presentation, and salary negotiation.',
    discountBadge: 'Voucher 200,000 VNĐ',
    voucherCode: 'LEADER200',
    commissionTag: 'Đối tác giáo dục',
    link: 'https://futureleaders.edu.vn',
    logoUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=120&q=80'
  }
];

export const MonetizationRewardsHub: React.FC<MonetizationRewardsHubProps> = ({
  language,
  user,
  showToast,
  onNavigateToChat
}) => {
  const isVi = language === Language.VI;
  const [activeTab, setActiveTab] = useState<'rewards' | 'pricing' | 'regional' | 'partners'>('rewards');

  // User Gamification States
  const [points, setPoints] = useState<number>(user?.points || 450);
  const [dailyCheckInDone, setDailyCheckInDone] = useState<boolean>(false);
  const [streakDays, setStreakDays] = useState<number>(user?.streak || 4);
  const [freeQueriesLeft, setFreeQueriesLeft] = useState<number>(38); // Out of 50 monthly free

  // Region Location PPP Pricing state
  const [selectedRegion, setSelectedRegion] = useState<'tier1' | 'tier2' | 'tier3'>('tier3');

  // Missions
  const [missions, setMissions] = useState([
    { id: 'checkin', title_vi: 'Điểm danh hàng ngày', title_en: 'Daily Check-in', reward: '+20 CP & +2 Lượt AI', done: dailyCheckInDone },
    { id: 'roadmap_step', title_vi: 'Hoàn thành 1 mốc Lộ trình học', title_en: 'Complete 1 Roadmap Milestone', reward: '+50 CP', done: false },
    { id: 'interview_practice', title_vi: 'Thực hành 1 phiên Phỏng vấn thử AI', title_en: 'Practice 1 AI Mock Interview', reward: '+100 CP', done: false }
  ]);

  // Handle Daily Check-in
  const handleDailyCheckIn = () => {
    if (dailyCheckInDone) {
      showToast(isVi ? "Bạn đã điểm danh hôm nay rồi!" : "You have already checked in today!", "info");
      return;
    }

    setDailyCheckInDone(true);
    setStreakDays(prev => prev + 1);
    setPoints(prev => prev + 20);
    setFreeQueriesLeft(prev => prev + 2);
    setMissions(prev => prev.map(m => m.id === 'checkin' ? { ...m, done: true } : m));

    showToast(
      isVi 
        ? `🎉 Điểm danh thành công! Chuỗi ${streakDays + 1} ngày liên tiếp (+20 CP & +2 lượt AI)` 
        : `🎉 Check-in success! ${streakDays + 1} day streak (+20 CP & +2 AI Queries)`, 
      "success"
    );
  };

  const handleClaimVoucher = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast(
      isVi ? `Đã sao chép mã ưu đãi ${code}! Vui lòng dùng khi đăng ký đối tác.` : `Copied voucher code ${code}!`,
      "success"
    );
  };

  const handleRedeemTokens = (cost: number, tokens: number) => {
    if (points < cost) {
      showToast(
        isVi ? `Bạn cần ${cost} CP để đổi. Hãy tích điểm thêm nhé!` : `You need ${cost} CP to redeem.`,
        "error"
      );
      return;
    }

    setPoints(prev => prev - cost);
    setFreeQueriesLeft(prev => prev + tokens);
    showToast(
      isVi ? `🎉 Đã đổi thành công +${tokens} Lượt AI Chat bằng ${cost} CP!` : `🎉 Successfully redeemed +${tokens} AI Queries!`,
      "success"
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Overview */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-900 text-white shadow-xl relative overflow-hidden border border-indigo-800/40">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-xs font-bold text-indigo-300 uppercase tracking-wider">
              <Icons.Coins className="w-3.5 h-3.5 text-yellow-400" />
              {isVi ? "Ví Điểm Thưởng & Hệ Sinh Thái Doanh Thu" : "Rewards & Monetization Hub"}
            </div>
            <h2 className="text-2xl md:text-3xl font-black">
              {isVi ? "Học Miễn Phí Mỗi Tháng - Tích Điểm Đổi Ưu Đãi" : "Monthly Free Allowance & Partner Marketplace"}
            </h2>
            <p className="text-gray-300 text-sm max-w-2xl leading-relaxed">
              {isVi
                ? "Dành tặng 50 Lượt AI miễn phí mỗi tháng cho học sinh sinh viên. Tích điểm danh hàng ngày, mua gói nạp lẻ linh hoạt hoặc nhận voucher trợ giá từ đối tác!"
                : "Free 50 monthly AI queries for students. Earn daily check-in points, purchase micro-packs, or redeem partner scholarship vouchers!"}
            </p>
          </div>

          {/* User Credits & Points Card */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 flex items-center gap-4 flex-shrink-0">
            <div className="text-center px-2">
              <span className="text-[10px] font-bold uppercase text-indigo-300 block">
                {isVi ? "Lượt AI Tháng Này" : "Monthly Free AI"}
              </span>
              <span className="text-2xl font-black text-emerald-400">{freeQueriesLeft} / 50</span>
              <span className="text-[10px] text-gray-400 block mt-0.5">{isVi ? "Tự reset ngày 1" : "Resets 1st of month"}</span>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center px-2">
              <span className="text-[10px] font-bold uppercase text-indigo-300 block">
                {isVi ? "Điểm Career Points" : "Career Points"}
              </span>
              <span className="text-2xl font-black text-yellow-400">{points} CP</span>
              <span className="text-[10px] text-amber-300 flex items-center justify-center gap-1 mt-0.5">
                <Icons.Flame className="w-3 h-3 text-orange-400 fill-orange-400" /> {streakDays} {isVi ? "ngày streak" : "day streak"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Sub Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-3">
        <button
          onClick={() => setActiveTab('rewards')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'rewards'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <Icons.Gift className="w-4 h-4" />
          {isVi ? "🎁 Điểm Danh & Tích Điểm" : "🎁 Daily Check-in & Rewards"}
        </button>
        <button
          onClick={() => setActiveTab('pricing')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'pricing'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <Icons.CreditCard className="w-4 h-4" />
          {isVi ? "💳 Gói Đăng Ký Chia Nhỏ" : "💳 Micro-Subscriptions"}
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
          {isVi ? "🌾 Trợ Giá Vùng Miền & IP" : "🌾 Regional PPP Subsidies"}
        </button>
        <button
          onClick={() => setActiveTab('partners')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'partners'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <Icons.Handshake className="w-4 h-4" />
          {isVi ? "🤝 Ưu Đãi Trung Tâm Đối Tác" : "🤝 Partner Affiliates"}
        </button>
      </div>

      {/* Tab 1: Daily Check-in & Missions */}
      {activeTab === 'rewards' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Daily Streak & Check-in box */}
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
                ? "Duy trì thói quen học tập hàng ngày để tích lũy thêm điểm thưởng Career Points (CP) và lượt chat AI miễn phí."
                : "Build your daily career development habit to earn bonus Career Points (CP) and free AI tokens."}
            </p>

            {/* 7-day visual tracker */}
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

          {/* Redeem CP for AI tokens */}
          <div className="lg:col-span-6 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Icons.Gift className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              {isVi ? "Đổi Điểm Thưởng Lấy Lượt AI" : "Redeem Points for AI Queries"}
            </h3>

            <div className="space-y-3">
              {[
                { cpCost: 100, aiQueries: 10, title_vi: 'Gói 10 Lượt Chat AI', title_en: '10 AI Queries Pack' },
                { cpCost: 250, aiQueries: 30, title_vi: 'Gói 30 Lượt Chat AI + Tạo Lộ Trình', title_en: '30 AI Queries + Roadmap Pack' },
                { cpCost: 500, aiQueries: 70, title_vi: 'Gói 70 Lượt AI Pro (Thưởng 20%)', title_en: '70 AI Queries Pro (20% Bonus)' }
              ].map((pack, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between gap-4"
                >
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                      {isVi ? pack.title_vi : pack.title_en}
                    </h4>
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                      +{pack.aiQueries} {isVi ? "lượt dùng" : "queries"}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRedeemTokens(pack.cpCost, pack.aiQueries)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Icons.Coins className="w-3.5 h-3.5 text-yellow-300" />
                    {pack.cpCost} CP
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Micro-Subscriptions */}
      {activeTab === 'pricing' && (
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
              {isVi ? "Gói Đăng Ký Lựa Chọn Linh Hoạt" : "Flexible Micro-Subscriptions & Pay-per-use"}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              {isVi
                ? "Chia nhỏ chi phí theo lượt dùng giúp sinh viên tiết kiệm tối đa, không phải cam kết gói dài hạn đắt đỏ!"
                : "Micro-packages designed for student budgets with flexible pay-per-use credits!"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Micro pass */}
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase text-indigo-600 dark:text-indigo-400 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">
                  {isVi ? "Gói Nạp Lẻ" : "Micro Pay-Per-Use"}
                </span>
                <h4 className="text-xl font-extrabold text-gray-900 dark:text-white">10,000 VNĐ</h4>
                <p className="text-xs text-gray-500">
                  {isVi ? "Mua 20 Lượt AI Chat & Tạo Lộ Trình (Hạn 30 ngày)" : "20 AI Queries & Roadmap creation (Valid 30 days)"}
                </p>
                <ul className="text-xs space-y-2 text-gray-600 dark:text-gray-300 pt-2">
                  <li className="flex items-center gap-2"><Icons.Check className="w-4 h-4 text-emerald-500" /> {isVi ? "Dùng đến đâu trả đến đó" : "Pay as you go"}</li>
                  <li className="flex items-center gap-2"><Icons.Check className="w-4 h-4 text-emerald-500" /> {isVi ? "Phù hợp mùa ôn thi" : "Ideal for exam prep"}</li>
                </ul>
              </div>
              <button
                onClick={() => showToast(isVi ? "Hệ thống thanh toán QR MoMo/ZaloPay đã sẵn sàng!" : "QR Payment ready!", "success")}
                className="w-full py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl text-xs hover:opacity-90 transition-opacity"
              >
                {isVi ? "Nạp 10k Ngay" : "Buy 10k Pack"}
              </button>
            </div>

            {/* Student Flex Monthly */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-950/40 dark:to-gray-800 border-2 border-indigo-500 shadow-lg relative flex flex-col justify-between space-y-4">
              <div className="absolute -top-3 right-4 bg-indigo-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                {isVi ? "Phổ biến nhất" : "Most Popular"}
              </div>
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase text-indigo-600 dark:text-indigo-400 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 rounded-full">
                  {isVi ? "Học Sinh / Sinh Viên" : "Student Saver Monthly"}
                </span>
                <div className="flex items-baseline gap-1">
                  <h4 className="text-3xl font-black text-gray-900 dark:text-white">29,000 VNĐ</h4>
                  <span className="text-xs text-gray-500">/ {isVi ? "tháng" : "month"}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  {isVi ? "Không giới hạn câu hỏi định hướng & lộ trình học tập hàng ngày." : "Unlimited career advice & daily roadmaps."}
                </p>
                <ul className="text-xs space-y-2 text-gray-600 dark:text-gray-300 pt-2">
                  <li className="flex items-center gap-2"><Icons.Check className="w-4 h-4 text-indigo-500" /> {isVi ? "Không giới hạn Chat AI" : "Unlimited AI Chat"}</li>
                  <li className="flex items-center gap-2"><Icons.Check className="w-4 h-4 text-indigo-500" /> {isVi ? "Tạo Lộ trình & Sơ đồ Kỹ năng" : "Roadmaps & Skill maps"}</li>
                  <li className="flex items-center gap-2"><Icons.Check className="w-4 h-4 text-indigo-500" /> {isVi ? "Đồng bộ Google Calendar" : "Google Calendar Sync"}</li>
                </ul>
              </div>
              <button
                onClick={() => showToast(isVi ? "Hệ thống thanh toán QR MoMo/ZaloPay đã sẵn sàng!" : "QR Payment ready!", "success")}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
              >
                {isVi ? "Đăng Ký Gói 29k/Tháng" : "Subscribe 29k/Month"}
              </button>
            </div>

            {/* Pro Career Unlimited */}
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase text-purple-600 dark:text-purple-400 px-3 py-1 bg-purple-50 dark:bg-purple-900/30 rounded-full">
                  {isVi ? "Chuyên Nghiệp Pro" : "Pro Career"}
                </span>
                <div className="flex items-baseline gap-1">
                  <h4 className="text-2xl font-black text-gray-900 dark:text-white">79,000 VNĐ</h4>
                  <span className="text-xs text-gray-500">/ {isVi ? "tháng" : "month"}</span>
                </div>
                <p className="text-xs text-gray-500">
                  {isVi ? "Dành cho người đi làm, luyện phỏng vấn thực tế & kết nối Mentor." : "For job seekers, mock interviews & mentor access."}
                </p>
                <ul className="text-xs space-y-2 text-gray-600 dark:text-gray-300 pt-2">
                  <li className="flex items-center gap-2"><Icons.Check className="w-4 h-4 text-purple-500" /> {isVi ? "Toàn bộ tính năng Student Saver" : "All Student Saver features"}</li>
                  <li className="flex items-center gap-2"><Icons.Check className="w-4 h-4 text-purple-500" /> {isVi ? "Luyện phỏng vấn AI không giới hạn" : "Unlimited AI Mock Interviews"}</li>
                  <li className="flex items-center gap-2"><Icons.Check className="w-4 h-4 text-purple-500" /> {isVi ? "Ưu tiên Mentor & CV Review" : "Priority CV Review & Mentors"}</li>
                </ul>
              </div>
              <button
                onClick={() => showToast(isVi ? "Hệ thống thanh toán QR MoMo/ZaloPay đã sẵn sàng!" : "QR Payment ready!", "success")}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-colors"
              >
                {isVi ? "Đăng Ký Pro 79k" : "Subscribe Pro"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Regional Dynamic Pricing (IP / PPP) */}
      {activeTab === 'regional' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Icons.MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                {isVi ? "Chính Sách Trợ Giá Theo Địa Bàn & Vùng Nông Thôn" : "Purchasing Power Parity (PPP) Regional Subsidies"}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                {isVi
                  ? "Đảm bảo mọi học sinh ở vùng sâu vùng xa, miền núi đều có cơ hội tiếp cận công nghệ hướng nghiệp bình đẳng."
                  : "Ensuring equal access to AI career guidance for students from rural and developing regions."}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-200 dark:border-emerald-800">
              <Icons.Globe className="w-4 h-4" />
              {isVi ? "Tự động nhận diện IP vùng miền" : "Auto IP Regional Detection"}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                id: 'tier1',
                title_vi: 'Vùng 1 (Thành thị lớn)',
                title_en: 'Tier 1 (Major Metropolitan)',
                areas: 'Hà Nội, TP. HCM, Đà Nẵng, Hải Phòng',
                discount: '0%',
                price_vi: '49,000 VNĐ/tháng',
                price_en: '$2.00/month'
              },
              {
                id: 'tier2',
                title_vi: 'Vùng 2 (Đô thị tỉnh lẻ)',
                title_en: 'Tier 2 (Regional Urban)',
                areas: 'Các thành phố thuộc tỉnh, thị xã',
                discount: 'Giảm 35%',
                price_vi: '29,000 VNĐ/tháng',
                price_en: '$1.20/month'
              },
              {
                id: 'tier3',
                title_vi: 'Vùng 3 (Nông thôn / Miền núi)',
                title_en: 'Tier 3 (Rural & Developing Regions)',
                areas: 'Các huyện nông thôn, xã vùng sâu vùng xa',
                discount: 'Trợ giá 65%',
                price_vi: '15,000 VNĐ/tháng',
                price_en: '$0.60/month'
              }
            ].map(tier => (
              <div
                key={tier.id}
                onClick={() => setSelectedRegion(tier.id as any)}
                className={`p-5 rounded-xl border cursor-pointer transition-all space-y-3 ${
                  selectedRegion === tier.id
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-2 ring-emerald-500/30'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-900 dark:text-white">
                    {isVi ? tier.title_vi : tier.title_en}
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300">
                    {tier.discount}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{tier.areas}</p>
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <span className="text-xs text-gray-500">{isVi ? "Mức giá trợ giá:" : "Subsidized rate:"}</span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    {isVi ? tier.price_vi : tier.price_en}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 flex items-start gap-3 text-xs text-indigo-900 dark:text-indigo-200">
            <Icons.Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">
                {isVi ? "💡 Cam kết bao trùm xã hội:" : "💡 Social Inclusion Commitment:"}
              </span>
              <p className="leading-relaxed">
                {isVi
                  ? "Chúng tôi cam kết sử dụng doanh thu từ người dùng thành thị và nhà tài trợ để bù đắp 100% chi phí máy chủ cho các bạn học sinh nông thôn, đảm bảo không ai bị bỏ lại phía sau."
                  : "We use revenue from urban users and corporate sponsors to subsidize server costs for rural students, ensuring no student is left behind."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Partner Affiliates */}
      {activeTab === 'partners' && (
        <div className="space-y-6">
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
            <Icons.ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">
                {isVi ? "Minh Bạch Mạng Lưới Đối Tác & Tài Trợ:" : "Partner Network & Sponsorship Transparency:"}
              </span>
              <p className="mt-1 leading-relaxed">
                {isVi
                  ? "Khi bạn đăng ký khóa học qua các đối tác uy tín được kiểm duyệt, CareerGuide AI nhận một khoản hoa hồng giới thiệu nhỏ. Số tiền này giúp chúng tôi tiếp tục duy trì dịch vụ miễn phí cho học sinh hoàn cảnh khó khăn."
                  : "When you enroll through verified partner institutions, CareerGuide AI earns a small referral fee which directly funds our free access program for underprivileged students."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PARTNER_OFFERS.map(offer => (
              <div
                key={offer.id}
                className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between space-y-4 hover:border-indigo-500 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={offer.logoUrl}
                      alt={offer.partnerName}
                      className="w-10 h-10 rounded-xl object-cover border border-gray-200 dark:border-gray-700"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">{offer.partnerName}</h4>
                      <span className="text-[10px] text-gray-500">{offer.commissionTag}</span>
                    </div>
                  </div>

                  <h5 className="font-bold text-gray-800 dark:text-gray-100 text-sm leading-snug">
                    {isVi ? offer.title_vi : offer.title_en}
                  </h5>

                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    {isVi ? offer.description_vi : offer.description_en}
                  </p>

                  <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between text-xs font-bold text-indigo-700 dark:text-indigo-300">
                    <span>{offer.discountBadge}</span>
                    <span className="font-mono bg-white dark:bg-gray-900 px-2 py-0.5 rounded border border-indigo-300">
                      {offer.voucherCode}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleClaimVoucher(offer.voucherCode)}
                    className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <Icons.Copy className="w-3.5 h-3.5" />
                    {isVi ? "Lấy Mã" : "Get Code"}
                  </button>
                  <a
                    href={offer.link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-1"
                  >
                    {isVi ? "Xem Khoá Học" : "Visit Course"}
                    <Icons.ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
