import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import { Language, UserProfile, SubscriptionTier } from '../types';
import { createUpdatedSubscription, getSubscriptionDetails } from '../utils/subscriptionUtils';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  user: UserProfile | null;
  onUpdateUser: (updates: Partial<UserProfile>) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  featureName?: string;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  language,
  user,
  onUpdateUser,
  showToast,
  featureName
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  if (!isOpen) return null;

  const isVi = language === Language.VI;
  const currentSub = getSubscriptionDetails(user?.subscription);

  const handleSelectTier = (tier: SubscriptionTier, nameVi: string, price: string) => {
    const updatedSub = createUpdatedSubscription(currentSub, tier);
    onUpdateUser({ subscription: updatedSub });
    showToast(
      isVi 
        ? `🎉 Kích hoạt thành công ${nameVi} (${price})! Các tính năng đã mở khóa ngay lập tức.` 
        : `🎉 Activated ${nameVi} (${price})! Features unlocked.`,
      'success'
    );
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white dark:bg-[#0a0f1d] border border-gray-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative space-y-6"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors z-20"
          >
            <Icons.X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-300 rounded-full text-xs font-bold uppercase tracking-wider">
              <Icons.Sparkles className="w-3.5 h-3.5 text-purple-500" />
              {isVi ? "Nâng Cấp Tài Khoản CareerGuide" : "Upgrade CareerGuide Account"}
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
              {featureName ? (
                isVi ? `Nâng cấp để mở khóa: ${featureName}` : `Upgrade to unlock: ${featureName}`
              ) : (
                isVi ? "Mở Khóa Toàn Bộ Sức Mạnh AI Hướng Nghiệp" : "Unlock Full Career AI Power"
              )}
            </h3>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              {isVi
                ? "Lựa chọn gói dịch vụ theo tháng hoặc năm. Mua theo lượt lẻ hoặc đăng ký trọn gói không giới hạn."
                : "Choose monthly or yearly subscription plans, or purchase micro-credits per session."}
            </p>

            {/* Monthly / Yearly Toggle Switch (Claude/Grok style) */}
            <div className="pt-2 flex justify-center">
              <div className="bg-gray-100 dark:bg-slate-800/90 p-1.5 rounded-2xl border border-gray-200 dark:border-slate-700 inline-flex items-center gap-2 relative">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-5 py-2 text-xs font-black rounded-xl transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {isVi ? "Thanh Toán Theo Tháng" : "Monthly Billing"}
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-5 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-2 ${
                    billingCycle === 'yearly'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <span>{isVi ? "Thanh Toán Theo Năm" : "Yearly Billing"}</span>
                  <span className="px-2 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded-md animate-pulse">
                    {isVi ? "Tiết Kiệm -66%" : "Save 66%"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Pay-per-Use Micro-Packs */}
          <div className="space-y-3 p-4 bg-purple-500/5 dark:bg-purple-950/20 rounded-2xl border border-purple-500/20">
            <h4 className="text-xs font-extrabold uppercase text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
              <Icons.Coins className="w-4 h-4 text-amber-500" />
              {isVi ? "Gói Mua Lẻ Nạp Nhanh Theo Lượt (Pay-per-Use)" : "Pay-per-Use Micro Packs"}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              <button
                onClick={() => handleSelectTier('micro_interview', '1 Lượt AI Phỏng Vấn Lẻ', '8.000 VNĐ')}
                className="p-3 bg-white dark:bg-slate-800 hover:border-purple-500 border border-gray-200 dark:border-slate-700 rounded-xl text-left transition-all shadow-sm group"
              >
                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 block flex items-center gap-1">
                  <Icons.Video className="w-3 h-3 text-purple-500" />
                  Phỏng Vấn Lẻ
                </span>
                <span className="text-sm font-black text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors">8.000 VNĐ</span>
                <span className="text-[10px] text-gray-400 block mt-0.5">1 Lượt Mock AI</span>
              </button>

              <button
                onClick={() => handleSelectTier('micro_transcript', '1 Lượt Soi Học Bạ Lẻ', '5.000 VNĐ')}
                className="p-3 bg-white dark:bg-slate-800 hover:border-purple-500 border border-gray-200 dark:border-slate-700 rounded-xl text-left transition-all shadow-sm group"
              >
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block flex items-center gap-1">
                  <Icons.FileCheck className="w-3 h-3 text-emerald-500" />
                  Soi Học Bạ Lẻ
                </span>
                <span className="text-sm font-black text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">5.000 VNĐ</span>
                <span className="text-[10px] text-gray-400 block mt-0.5">1 Lượt Audit Điểm</span>
              </button>

              <button
                onClick={() => handleSelectTier('micro5', 'Gói Lẻ 5 Câu Chat AI', '15.000 VNĐ')}
                className="p-3 bg-white dark:bg-slate-800 hover:border-purple-500 border border-gray-200 dark:border-slate-700 rounded-xl text-left transition-all shadow-sm group"
              >
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 block flex items-center gap-1">
                  <Icons.MessageSquare className="w-3 h-3 text-blue-500" />
                  +5 Câu AI Chat
                </span>
                <span className="text-sm font-black text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">15.000 VNĐ</span>
                <span className="text-[10px] text-gray-400 block mt-0.5">Hỏi đáp tư vấn</span>
              </button>

              <button
                onClick={() => handleSelectTier('micro10', 'Gói Lẻ 10 Câu Chat AI', '25.000 VNĐ')}
                className="p-3 bg-white dark:bg-slate-800 hover:border-purple-500 border border-gray-200 dark:border-slate-700 rounded-xl text-left transition-all shadow-sm group"
              >
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block flex items-center gap-1">
                  <Icons.Zap className="w-3 h-3 text-indigo-500" />
                  +10 Câu AI Chat
                </span>
                <span className="text-sm font-black text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">25.000 VNĐ</span>
                <span className="text-[10px] text-gray-400 block mt-0.5">Tiết kiệm hơn</span>
              </button>
            </div>
          </div>

          {/* 3 Core Tiers Display (Free, Premium, Max) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Tier 1: Free */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="px-3 py-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 text-xs font-black rounded-lg inline-block">
                  CareerGuide Free
                </span>
                <div>
                  <h4 className="text-2xl font-black text-gray-900 dark:text-white">0 VNĐ</h4>
                  <span className="text-xs text-gray-400">/ {isVi ? "vĩnh viễn" : "forever free"}</span>
                </div>

                <div className="border-t border-gray-100 dark:border-slate-800 pt-3 space-y-2 text-xs">
                  <p className="font-bold text-gray-700 dark:text-gray-300">Quyền lợi bao gồm:</p>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li className="flex items-start gap-2">
                      <Icons.Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>3 câu hỏi AI đầu tiên</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icons.Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>Trắc nghiệm RIASEC cơ bản</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icons.Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>Gợi ý ngành nghề cơ bản</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icons.Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>Xem lộ trình học tập mẫu</span>
                    </li>
                  </ul>

                  <p className="font-bold text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-100 dark:border-slate-800">Tính năng bị khóa 🔒:</p>
                  <ul className="space-y-1.5 text-gray-400 dark:text-gray-500 text-[11px]">
                    <li className="flex items-center gap-1.5 line-through"><Icons.Lock className="w-3 h-3 text-amber-500/70" /> AI không giới hạn (FUP)</li>
                    <li className="flex items-center gap-1.5 line-through"><Icons.Lock className="w-3 h-3 text-amber-500/70" /> AI Phỏng Vấn & CV Review</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => handleSelectTier('free', 'CareerGuide Free', '0 VNĐ')}
                className="w-full py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold text-xs rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              >
                {isVi ? "Đang Sử Dụng Free" : "Use Free Tier"}
              </button>
            </div>

            {/* Tier 2: Premium */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-purple-500/10 via-slate-900 to-indigo-950 border-2 border-purple-500 flex flex-col justify-between space-y-4 relative shadow-xl">
              <span className="absolute -top-3 right-4 px-3 py-0.5 bg-purple-600 text-white text-[10px] font-black rounded-full uppercase shadow">
                {isVi ? "Phổ Biến Nhất" : "Most Popular"}
              </span>

              <div className="space-y-3">
                <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-black rounded-lg inline-block">
                  CareerGuide Premium
                </span>
                <div>
                  <h4 className="text-2xl font-black text-white">
                    {billingCycle === 'monthly' ? "99.000 VNĐ" : "399.000 VNĐ"}
                  </h4>
                  <span className="text-xs text-purple-200">
                    {billingCycle === 'monthly' ? "/ tháng" : "/ năm (~33k/tháng)"}
                  </span>
                </div>

                <div className="border-t border-purple-500/20 pt-3 space-y-2 text-xs">
                  <p className="font-bold text-purple-200">Quyền lợi đặc quyền Premium:</p>
                  <ul className="space-y-2 text-purple-100">
                    <li className="flex items-start gap-2">
                      <Icons.Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>AI không giới hạn (trong phạm vi FUP hợp lý)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icons.Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Career DNA đầy đủ</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icons.Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Road Map lộ trình chi tiết</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icons.Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>AI Mock Interview (Phỏng vấn ảo)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icons.Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>CV Review & Chỉnh sửa CV</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icons.Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Đồng bộ Google Calendar</span>
                    </li>
                  </ul>

                  <p className="font-bold text-purple-300/60 pt-2 border-t border-purple-500/20">Tính năng nâng cấp lên MAX 🔒:</p>
                  <ul className="space-y-1 text-purple-300/50 text-[11px]">
                    <li className="flex items-center gap-1.5 line-through"><Icons.Lock className="w-3 h-3 text-amber-400/80" /> Phân tích CV theo JD & Lương Insight</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => {
                  if (billingCycle === 'monthly') {
                    handleSelectTier('premium_monthly', 'CareerGuide Premium (Tháng)', '99.000 VNĐ');
                  } else {
                    handleSelectTier('premium_yearly', 'CareerGuide Premium (Năm)', '399.000 VNĐ');
                  }
                }}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-lg transition-all"
              >
                {billingCycle === 'monthly' ? "Đăng Ký Premium (99k/tháng)" : "Đăng Ký Premium (399k/năm)"}
              </button>
            </div>

            {/* Tier 3: Max */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-indigo-900 via-slate-900 to-amber-950/40 border-2 border-amber-500/80 flex flex-col justify-between space-y-4 relative shadow-xl">
              <span className="absolute -top-3 right-4 px-3 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-[10px] font-black rounded-full uppercase shadow">
                🔥 VIP Career MAX
              </span>

              <div className="space-y-3">
                <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black rounded-lg inline-block">
                  CareerGuide Max
                </span>
                <div>
                  <h4 className="text-2xl font-black text-amber-300">
                    {billingCycle === 'monthly' ? "129.000 VNĐ" : "999.000 VNĐ"}
                  </h4>
                  <span className="text-xs text-amber-200/80">
                    {billingCycle === 'monthly' ? "/ tháng" : "/ năm (~83k/tháng)"}
                  </span>
                </div>

                <div className="border-t border-amber-500/20 pt-3 space-y-2 text-xs">
                  <p className="font-bold text-amber-300">Tất cả đặc quyền Premium + MỚI MAX:</p>
                  <ul className="space-y-2 text-amber-100">
                    <li className="flex items-start gap-2">
                      <Icons.Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span>Phân tích CV theo JD (Job Description)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icons.Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span>Phỏng vấn AI theo từng vị trí cụ thể</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icons.Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span>Gợi ý Upskill / Reskill chuyên sâu</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icons.Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span>CareerPath & Salary Insight</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icons.Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span>Theo dõi mục tiêu nghề nghiệp theo tháng</span>
                    </li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => {
                  if (billingCycle === 'monthly') {
                    handleSelectTier('max_monthly', 'CareerGuide Max (Tháng)', '129.000 VNĐ');
                  } else {
                    handleSelectTier('max_yearly', 'CareerGuide Max (Năm)', '999.000 VNĐ');
                  }
                }}
                className="w-full py-3 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all"
              >
                {billingCycle === 'monthly' ? "Kích Hoạt Gói Max (129k/tháng)" : "Kích Hoạt Gói Max (999k/năm)"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

