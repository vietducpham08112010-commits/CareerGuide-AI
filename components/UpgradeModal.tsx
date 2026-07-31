import React from 'react';
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
  if (!isOpen) return null;

  const isVi = language === Language.VI;
  const currentSub = getSubscriptionDetails(user?.subscription);

  const handleSelectTier = (tier: SubscriptionTier, nameVi: string, price: string) => {
    const updatedSub = createUpdatedSubscription(currentSub, tier);
    onUpdateUser({ subscription: updatedSub });
    showToast(
      isVi 
        ? `🎉 Khởi tạo thanh toán thành công cho ${nameVi} (${price})! Các tính năng đã mở khóa ngay lập tức.` 
        : `🎉 Payment initialized for ${nameVi} (${price})! Features unlocked.`,
      'success'
    );
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative space-y-6"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Icons.X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider">
              <Icons.Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              {isVi ? "Tính Năng Giới Hạn Gói" : "Feature Requires Subscription"}
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
              {featureName ? (
                isVi ? `Nâng cấp để mở khóa: ${featureName}` : `Upgrade to unlock: ${featureName}`
              ) : (
                isVi ? "Mở Khóa Toàn Bộ Tính Năng AI Hướng Nghiệp" : "Unlock All Premium AI Career Features"
              )}
            </h3>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
              {isVi
                ? "Chọn gói phù hợp với ngân sách của bạn. Mua theo lượt dùng lẻ từ 15k hoặc thuê bao trọn gói."
                : "Choose a tier tailored to your budget. Select pay-per-use or full subscription."}
            </p>
          </div>

          {/* Quick Pay-per-Use Micro-Packs */}
          <div className="space-y-3 p-4 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
            <h4 className="text-xs font-extrabold uppercase text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
              <Icons.Coins className="w-4 h-4 text-amber-500" />
              {isVi ? "Gói Mua Lẻ Nạp Nhanh (Vi Thanh Toán)" : "Quick Micro Pay-Per-Use Packs"}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              <button
                onClick={() => handleSelectTier('micro5', 'Gói lẻ 5 câu AI', '15.000 VNĐ')}
                className="p-3 bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-left transition-all group shadow-sm"
              >
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block">+5 Lượt Hỏi AI</span>
                <span className="text-sm font-black text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">15.000 VNĐ</span>
              </button>

              <button
                onClick={() => handleSelectTier('micro10', 'Gói 10 câu AI', '25.000 VNĐ')}
                className="p-3 bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-left transition-all group shadow-sm"
              >
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block">+10 Lượt Hỏi AI</span>
                <span className="text-sm font-black text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">25.000 VNĐ</span>
              </button>

              <button
                onClick={() => handleSelectTier('trial24h', 'Gói Trial 24H Full Pass', '35.000 VNĐ')}
                className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-95 rounded-xl text-left transition-all shadow-sm col-span-2 md:col-span-2"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-amber-100">🔥 Full Pass 24 Giờ</span>
                  <span className="text-sm font-black">35.000 VNĐ</span>
                </div>
                <span className="text-[10px] text-amber-100 block mt-0.5">Mở khóa 100% tính năng trong 24 giờ</span>
              </button>
            </div>
          </div>

          {/* Full Subscriptions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gói Tháng */}
            <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border-2 border-indigo-500 space-y-3 relative shadow-md">
              <span className="absolute -top-3 right-4 px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-extrabold rounded-full uppercase">
                {isVi ? "Khuyên Dùng" : "Recommended"}
              </span>
              <div>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">Gói Tháng Premium</span>
                <h4 className="text-2xl font-black text-gray-900 dark:text-white mt-1">99.000 VNĐ <span className="text-xs text-gray-500 font-normal">/tháng</span></h4>
              </div>
              <ul className="text-xs space-y-1.5 text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-1.5"><Icons.Check className="w-3.5 h-3.5 text-emerald-500" /> Chat AI Deep-Dive không giới hạn</li>
                <li className="flex items-center gap-1.5"><Icons.Check className="w-3.5 h-3.5 text-emerald-500" /> Full Mock Interview & Phỏng vấn thử</li>
                <li className="flex items-center gap-1.5"><Icons.Check className="w-3.5 h-3.5 text-emerald-500" /> Sửa bài luận học bổng & Soi CV/Học bạ</li>
              </ul>
              <button
                onClick={() => handleSelectTier('monthly', 'Gói Tháng Premium', '99.000 VNĐ')}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition-colors"
              >
                {isVi ? "Đăng Ký Gói Tháng (99k)" : "Choose Monthly Plan"}
              </button>
            </div>

            {/* Gói Năm */}
            <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-purple-300 dark:border-purple-800 space-y-3 shadow-sm">
              <div>
                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase">Gói Năm Saver</span>
                <h4 className="text-2xl font-black text-gray-900 dark:text-white mt-1">399.000 VNĐ <span className="text-xs text-gray-500 font-normal">/năm (~33k/tháng)</span></h4>
              </div>
              <ul className="text-xs space-y-1.5 text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-1.5"><Icons.Check className="w-3.5 h-3.5 text-purple-500" /> Tiết kiệm 66% so với mua tháng</li>
                <li className="flex items-center gap-1.5"><Icons.Check className="w-3.5 h-3.5 text-purple-500" /> Đầy đủ tính năng nâng cao cả năm</li>
                <li className="flex items-center gap-1.5"><Icons.Check className="w-3.5 h-3.5 text-purple-500" /> Tặng Bộ Ebook Du Học & Học Bổng</li>
              </ul>
              <button
                onClick={() => handleSelectTier('annual', 'Gói Năm Saver', '399.000 VNĐ')}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-colors"
              >
                {isVi ? "Đăng Ký Gói Năm (399k)" : "Choose Annual Plan"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
