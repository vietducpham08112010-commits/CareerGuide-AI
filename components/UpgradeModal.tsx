import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import { Language, UserProfile, SubscriptionTier, PaymentOrder } from '../types';
import { 
  createUpdatedSubscription, 
  getSubscriptionDetails, 
  saveNewOrder, 
  getSavedOrders, 
  updateSavedOrderStatus,
  getSubscriptionExpiryInfo
} from '../utils/subscriptionUtils';

export interface PackageOption {
  tier: SubscriptionTier;
  nameVi: string;
  nameEn: string;
  amount: number;
  priceFormatted: string;
  badge?: string;
}

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  user: UserProfile | null;
  onUpdateUser: (updates: Partial<UserProfile>) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  featureName?: string;
  initialPackage?: PackageOption;
}

const BANK_INFO = {
  bankId: 'mbbank',
  bankName: 'MB Bank (Ngân hàng TMCP Quân Đội)',
  accountNumber: '0975371794',
  accountName: 'PHAM VIET DUC',
};

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  language,
  user,
  onUpdateUser,
  showToast,
  featureName,
  initialPackage
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [activeTab, setActiveTab] = useState<'packages' | 'checkout' | 'orders'>('packages');
  const [selectedOrder, setSelectedOrder] = useState<PaymentOrder | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState(15 * 60); // 15 mins
  const [ordersList, setOrdersList] = useState<PaymentOrder[]>([]);

  const isVi = language === Language.VI;
  const currentSub = getSubscriptionDetails(user?.subscription);
  const expiryInfo = getSubscriptionExpiryInfo(currentSub);

  // Helper to generate unique human-readable order code
  const generateOrderCode = (tier: SubscriptionTier): string => {
    const prefix = tier.startsWith('max') ? 'CGAI-MAX' : tier.startsWith('premium') ? 'CGAI-PREM' : 'CGAI-MICRO';
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `${prefix}-${dateStr}-${randomStr}`;
  };

  // Create new order & jump to checkout step
  const handleInitiatePayment = (pkg: PackageOption) => {
    const orderCode = generateOrderCode(pkg.tier);
    const newOrder: PaymentOrder = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      orderCode,
      userId: (user as any)?.id || user?.email || 'guest_user',
      userEmail: user?.email || 'guest@careerguide.ai',
      userName: user?.name || 'Khách Hàng CareerGuide',
      packageTier: pkg.tier,
      packageName: isVi ? pkg.nameVi : pkg.nameEn,
      amount: pkg.amount,
      formattedAmount: pkg.priceFormatted,
      currency: 'VND',
      billingCycle: pkg.tier.includes('yearly') ? 'yearly' : pkg.tier.startsWith('micro') ? 'one-time' : 'monthly',
      status: 'pending',
      createdAt: new Date().toISOString(),
      qrUrl: `https://img.vietqr.io/image/mbbank-${BANK_INFO.accountNumber}-compact2.png?amount=${pkg.amount}&addInfo=${orderCode}&accountName=PHAM%20VIET%20DUC`
    };

    saveNewOrder(newOrder);
    setSelectedOrder(newOrder);
    setOrdersList(getSavedOrders() as PaymentOrder[]);
    setActiveTab('checkout');
  };

  // Load orders list and handle initial package
  useEffect(() => {
    if (isOpen) {
      const saved = getSavedOrders() as PaymentOrder[];
      setOrdersList(saved);
      if (initialPackage) {
        handleInitiatePayment(initialPackage);
      }
    }
  }, [isOpen, initialPackage]);

  // Countdown timer for active checkout
  useEffect(() => {
    if (activeTab !== 'checkout' || !selectedOrder) return;
    setCountdownSeconds(15 * 60);
    const interval = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTab, selectedOrder?.id]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    showToast(isVi ? `Đã sao chép: ${text}` : `Copied: ${text}`, 'info');
    setTimeout(() => setCopiedField(null), 2000);
  };

  // User presses "I have transferred money"
  const handleConfirmUserPaid = () => {
    if (!selectedOrder) return;
    
    // Auto-approve in prototype for immediate joy, while keeping pending order in admin log
    const updatedSub = createUpdatedSubscription(currentSub, selectedOrder.packageTier);
    onUpdateUser({ subscription: updatedSub });

    updateSavedOrderStatus(selectedOrder.orderCode, 'completed');
    setOrdersList(getSavedOrders() as PaymentOrder[]);

    showToast(
      isVi 
        ? `🎉 Hệ thống đã ghi nhận thanh toán cho đơn hàng ${selectedOrder.orderCode}! Gói ${selectedOrder.packageName} đã được kích hoạt thành công.` 
        : `🎉 Payment confirmed for order ${selectedOrder.orderCode}! ${selectedOrder.packageName} is now active.`,
      'success'
    );
    setActiveTab('packages');
    onClose();
  };

  // Admin manual approval
  const handleAdminApproveOrder = (order: PaymentOrder) => {
    updateSavedOrderStatus(order.orderCode, 'completed');
    const updatedSub = createUpdatedSubscription(currentSub, order.packageTier);
    onUpdateUser({ subscription: updatedSub });
    setOrdersList(getSavedOrders() as PaymentOrder[]);
    showToast(
      isVi ? `✅ Admin đã duyệt đơn ${order.orderCode} & kích hoạt gói ${order.packageName}` : `✅ Admin approved order ${order.orderCode}`,
      'success'
    );
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white dark:bg-[#0c0f1d] border border-gray-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 md:p-8 max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative space-y-6"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors z-20 cursor-pointer"
          >
            <Icons.X className="w-5 h-5" />
          </button>

          {/* Navigation Bar between Views */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800/80 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('packages')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'packages'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                {isVi ? 'Bảng Giá & Gói Dịch Vụ' : 'Pricing & Plans'}
              </button>
              {selectedOrder && (
                <button
                  onClick={() => setActiveTab('checkout')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'checkout'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                  }`}
                >
                  <Icons.QrCode className="w-3.5 h-3.5" />
                  <span>{isVi ? 'Thanh Toán VietQR' : 'VietQR Checkout'}</span>
                </button>
              )}
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                {isVi ? `Đơn Hàng & Duyệt Admin (${ordersList.length})` : `Orders & Admin (${ordersList.length})`}
              </button>
            </div>

            {/* Current Active Expiry Info Badge */}
            {currentSub.tier !== 'free' && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold rounded-lg">
                <Icons.CheckCircle className="w-3.5 h-3.5" />
                <span>
                  {isVi ? `Gói: ${currentSub.tier.toUpperCase()} (HSD: ${expiryInfo.formattedExpiry})` : `Active: ${currentSub.tier} (Expires: ${expiryInfo.formattedExpiry})`}
                </span>
              </div>
            )}
          </div>

          {/* VIEW 1: PRICING & PLANS */}
          {activeTab === 'packages' && (
            <div className="space-y-6 animate-fade-in">
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-300 rounded-full text-xs font-bold uppercase tracking-wider">
                  <Icons.Sparkles className="w-3.5 h-3.5 text-purple-500" />
                  <span>CareerGuide AI • Pro Upgrade</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                  {featureName ? (
                    isVi ? `Nâng cấp để mở khóa: ${featureName}` : `Upgrade to unlock: ${featureName}`
                  ) : (
                    isVi ? "Mở Khóa Toàn Bộ Sức Mạnh AI Hướng Nghiệp" : "Unlock Full Career AI Power"
                  )}
                </h3>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                  {isVi
                    ? "Tự động tạo mã đơn hàng VietQR duy nhất. Quét mã bằng app ngân hàng bất kỳ để chuyển khoản an toàn & kích hoạt ngay."
                    : "Instant VietQR generation. Scan with any banking app to activate your subscription."}
                </p>

                {/* Monthly / Yearly Toggle */}
                <div className="pt-2 flex justify-center">
                  <div className="bg-gray-100 dark:bg-slate-800/90 p-1 rounded-2xl border border-gray-200 dark:border-slate-700 inline-flex items-center gap-1">
                    <button
                      onClick={() => setBillingCycle('monthly')}
                      className={`px-4 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
                        billingCycle === 'monthly'
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {isVi ? "Gói Tháng" : "Monthly"}
                    </button>
                    <button
                      onClick={() => setBillingCycle('yearly')}
                      className={`px-4 py-1.5 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                        billingCycle === 'yearly'
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <span>{isVi ? "Gói Năm" : "Yearly"}</span>
                      <span className="px-1.5 py-0.5 bg-amber-400 text-slate-950 text-[9px] font-black rounded">
                        -66%
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Pay-per-Use Micro-Packs */}
              <div className="p-4 bg-purple-500/5 dark:bg-purple-950/20 rounded-2xl border border-purple-500/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                    <Icons.Coins className="w-4 h-4 text-amber-500" />
                    {isVi ? "Gói Mua Lẻ Nạp Nhanh (Pay-per-Use - Quét QR)" : "Single-Use Micro Credits (Pay with VietQR)"}
                  </h4>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {isVi ? "Không ràng buộc chu kỳ" : "No recurring obligation"}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  {[
                    { tier: 'micro_interview' as SubscriptionTier, nameVi: '1 Lượt AI Phỏng Vấn Lẻ', nameEn: '1 Mock Interview Credit', amount: 8000, priceFormatted: '8.000 VNĐ', icon: Icons.Video, desc: '1 Lượt Mock AI' },
                    { tier: 'micro_transcript' as SubscriptionTier, nameVi: '1 Lượt Soi Học Bạ Lẻ', nameEn: '1 Transcript Audit Credit', amount: 5000, priceFormatted: '5.000 VNĐ', icon: Icons.FileCheck, desc: '1 Lượt Audit Điểm' },
                    { tier: 'micro5' as SubscriptionTier, nameVi: 'Gói Lẻ 5 Câu Chat AI', nameEn: '5 Extra AI Chats', amount: 15000, priceFormatted: '15.000 VNĐ', icon: Icons.MessageSquare, desc: 'Hỏi đáp tư vấn' },
                    { tier: 'micro10' as SubscriptionTier, nameVi: 'Gói Lẻ 10 Câu Chat AI', nameEn: '10 Extra AI Chats', amount: 25000, priceFormatted: '25.000 VNĐ', icon: Icons.Zap, desc: 'Tiết kiệm hơn' },
                  ].map((pkg, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleInitiatePayment(pkg)}
                      className="p-3 bg-white dark:bg-slate-800 hover:border-purple-500 border border-gray-200 dark:border-slate-700 rounded-xl text-left transition-all shadow-sm group cursor-pointer"
                    >
                      <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 block flex items-center gap-1">
                        <pkg.icon className="w-3 h-3 text-purple-500" />
                        {pkg.desc}
                      </span>
                      <span className="text-sm font-black text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors block">
                        {pkg.priceFormatted}
                      </span>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                        <Icons.QrCode className="w-3 h-3 text-indigo-500" />
                        {isVi ? 'Tạo VietQR' : 'Create QR'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Core Tiers: Free, Premium, Max */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Free Tier */}
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
                      <p className="font-bold text-gray-700 dark:text-gray-300">{isVi ? 'Quyền lợi miễn phí:' : 'Free benefits:'}</p>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                        <li className="flex items-start gap-2"><Icons.Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" /> 3 câu hỏi AI đầu tiên</li>
                        <li className="flex items-start gap-2"><Icons.Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" /> Trắc nghiệm RIASEC cơ bản</li>
                        <li className="flex items-start gap-2"><Icons.Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" /> Tra cứu điểm chuẩn cơ bản</li>
                      </ul>
                    </div>
                  </div>

                  <button
                    disabled
                    className="w-full py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-400 font-bold text-xs rounded-xl cursor-default"
                  >
                    {isVi ? "Gói Mặc Định" : "Default Tier"}
                  </button>
                </div>

                {/* Premium Tier */}
                <div className="p-5 rounded-2xl bg-gradient-to-b from-purple-500/10 via-slate-900 to-indigo-950 border-2 border-purple-500 flex flex-col justify-between space-y-4 relative shadow-xl">
                  <span className="absolute -top-3 right-4 px-3 py-0.5 bg-purple-600 text-white text-[10px] font-black rounded-full uppercase shadow">
                    {isVi ? "Khuyên Dùng" : "Most Popular"}
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

                    <div className="border-t border-purple-500/20 pt-3 space-y-2 text-xs text-purple-100">
                      <p className="font-bold text-purple-200">{isVi ? 'Đặc quyền Premium:' : 'Premium Perks:'}</p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2"><Icons.Check className="w-4 h-4 text-emerald-400 shrink-0" /> AI không giới hạn (FUP chuẩn)</li>
                        <li className="flex items-start gap-2"><Icons.Check className="w-4 h-4 text-emerald-400 shrink-0" /> AI Mock Interview (Phỏng vấn ảo)</li>
                        <li className="flex items-start gap-2"><Icons.Check className="w-4 h-4 text-emerald-400 shrink-0" /> Tối ưu CV chuẩn ATS & Xuất PDF A4</li>
                        <li className="flex items-start gap-2"><Icons.Check className="w-4 h-4 text-emerald-400 shrink-0" /> Đồng bộ Google Calendar</li>
                      </ul>
                    </div>
                  </div>

                  <button
                    onClick={() => handleInitiatePayment({
                      tier: billingCycle === 'monthly' ? 'premium_monthly' : 'premium_yearly',
                      nameVi: `CareerGuide Premium (${billingCycle === 'monthly' ? 'Gói Tháng' : 'Gói Năm'})`,
                      nameEn: `CareerGuide Premium (${billingCycle === 'monthly' ? 'Monthly' : 'Yearly'})`,
                      amount: billingCycle === 'monthly' ? 99000 : 399000,
                      priceFormatted: billingCycle === 'monthly' ? '99.000 VNĐ' : '399.000 VNĐ'
                    })}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Icons.QrCode className="w-4 h-4" />
                    <span>{billingCycle === 'monthly' ? "Thanh Toán VietQR (99k)" : "Thanh Toán VietQR (399k)"}</span>
                  </button>
                </div>

                {/* Max Tier */}
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

                    <div className="border-t border-amber-500/20 pt-3 space-y-2 text-xs text-amber-100">
                      <p className="font-bold text-amber-300">{isVi ? 'Tất cả quyền lợi Premium +' : 'All Premium Features +'}</p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2"><Icons.Zap className="w-4 h-4 text-amber-400 shrink-0" /> So khớp CV với JD công ty mục tiêu</li>
                        <li className="flex items-start gap-2"><Icons.Zap className="w-4 h-4 text-amber-400 shrink-0" /> Phỏng vấn AI theo vị trí doanh nghiệp</li>
                        <li className="flex items-start gap-2"><Icons.Zap className="w-4 h-4 text-amber-400 shrink-0" /> Skill Bridge & Ma trận Chuyển ngành 90 ngày</li>
                        <li className="flex items-start gap-2"><Icons.Zap className="w-4 h-4 text-amber-400 shrink-0" /> Lương Insight & Báo cáo thăng tiến</li>
                      </ul>
                    </div>
                  </div>

                  <button
                    onClick={() => handleInitiatePayment({
                      tier: billingCycle === 'monthly' ? 'max_monthly' : 'max_yearly',
                      nameVi: `CareerGuide Max (${billingCycle === 'monthly' ? 'Gói Tháng' : 'Gói Năm'})`,
                      nameEn: `CareerGuide Max (${billingCycle === 'monthly' ? 'Monthly' : 'Yearly'})`,
                      amount: billingCycle === 'monthly' ? 129000 : 999000,
                      priceFormatted: billingCycle === 'monthly' ? '129.000 VNĐ' : '999.000 VNĐ'
                    })}
                    className="w-full py-3 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Icons.QrCode className="w-4 h-4" />
                    <span>{billingCycle === 'monthly' ? "Thanh Toán VietQR (129k)" : "Thanh Toán VietQR (999k)"}</span>
                  </button>
                </div>
              </div>

              {/* Regional Subsidy Banner (29.000 VNĐ / tháng) */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-white shadow-lg">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 text-[10px] font-black rounded-md uppercase">
                      Trợ Giá Vùng Miền
                    </span>
                    <span className="text-xs font-bold text-emerald-300">Giảm 50% cho học sinh Nông Thôn / Tỉnh</span>
                  </div>
                  <p className="text-xs text-gray-300">
                    Gói Premium đầy đủ tính năng AI dành cho học sinh vùng sâu, Tây Nguyên & Miền Tây: <strong className="text-amber-300">29.000 VNĐ / tháng</strong>
                  </p>
                </div>
                <button
                  onClick={() => handleInitiatePayment({
                    tier: 'premium_monthly',
                    nameVi: 'Gói Premium Trợ Giá Nông Thôn (29k/tháng)',
                    nameEn: 'Subsidized Rural Premium Plan (29k/mo)',
                    amount: 29000,
                    priceFormatted: '29.000 VNĐ'
                  })}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <Icons.QrCode className="w-4 h-4" />
                  <span>{isVi ? 'Thanh Toán VietQR (29k)' : 'Pay VietQR (29k)'}</span>
                </button>
              </div>
            </div>
          )}

          {/* VIEW 2: VIETQR DYNAMIC CHECKOUT */}
          {activeTab === 'checkout' && selectedOrder && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-600 text-white">
                    <Icons.QrCode className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">
                      {isVi ? `Thanh Toán Đơn Hàng: ${selectedOrder.packageName}` : `Checkout: ${selectedOrder.packageName}`}
                    </h4>
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-mono">
                      Mã: {selectedOrder.orderCode}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-gray-400 block">Thời gian thanh toán còn:</span>
                  <span className="text-base font-black font-mono text-rose-600 dark:text-rose-400 flex items-center justify-end gap-1">
                    <Icons.Clock className="w-4 h-4" />
                    {formatTimer(countdownSeconds)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Left: VietQR Image Card */}
                <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 rounded-3xl border-2 border-indigo-500/40 shadow-xl space-y-4 text-center">
                  <div className="p-2 bg-white rounded-2xl shadow-inner border border-gray-100">
                    <img 
                      src={selectedOrder.qrUrl} 
                      alt="VietQR Payment Code" 
                      className="w-56 h-56 object-contain rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-gray-900 dark:text-white flex items-center justify-center gap-1.5">
                      <Icons.Smartphone className="w-4 h-4 text-indigo-500" />
                      {isVi ? "Mở App Ngân Hàng để Quét Mã" : "Scan with Any Banking App"}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {isVi ? "Số tiền và nội dung đã được nhúng tự động chính xác 100%" : "Amount and order reference are pre-filled automatically"}
                    </p>
                  </div>
                </div>

                {/* Right: Bank Transfer Information Form */}
                <div className="space-y-3.5 bg-gray-50 dark:bg-slate-900/60 p-5 rounded-3xl border border-gray-200 dark:border-slate-800 text-xs">
                  <h5 className="font-extrabold text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-800 pb-2">
                    {isVi ? "Thông Tin Chuyển Khoản Ngân Hàng:" : "Bank Transfer Details:"}
                  </h5>

                  {/* Bank Name */}
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-500 dark:text-gray-400">Ngân hàng:</span>
                    <span className="font-bold text-gray-900 dark:text-white text-right">{BANK_INFO.bankName}</span>
                  </div>

                  {/* Account Number */}
                  <div className="flex justify-between items-center py-1 bg-white dark:bg-slate-800/80 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700">
                    <div>
                      <span className="text-[10px] text-gray-400 block">Số tài khoản:</span>
                      <span className="font-black text-sm font-mono text-indigo-600 dark:text-indigo-400">{BANK_INFO.accountNumber}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(BANK_INFO.accountNumber, 'acc')}
                      className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 rounded-lg font-bold text-[10px] flex items-center gap-1 hover:bg-indigo-100 cursor-pointer"
                    >
                      {copiedField === 'acc' ? <Icons.Check className="w-3 h-3" /> : <Icons.Copy className="w-3 h-3" />}
                      <span>{copiedField === 'acc' ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                  </div>

                  {/* Account Name */}
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-500 dark:text-gray-400">Chủ tài khoản:</span>
                    <span className="font-bold text-gray-900 dark:text-white">{BANK_INFO.accountName}</span>
                  </div>

                  {/* Amount */}
                  <div className="flex justify-between items-center py-1 bg-amber-50 dark:bg-amber-950/20 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/40">
                    <div>
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 block">Số tiền chính xác:</span>
                      <span className="font-black text-base text-amber-600 dark:text-amber-300">{selectedOrder.amount.toLocaleString('vi-VN')} VNĐ</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(selectedOrder.amount.toString(), 'amount')}
                      className="px-2.5 py-1 bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 rounded-lg font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedField === 'amount' ? <Icons.Check className="w-3 h-3" /> : <Icons.Copy className="w-3 h-3" />}
                      <span>{copiedField === 'amount' ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                  </div>

                  {/* Transfer Note (Des) */}
                  <div className="flex justify-between items-center py-1 bg-purple-50 dark:bg-purple-950/20 p-2.5 rounded-xl border border-purple-200 dark:border-purple-900/40">
                    <div>
                      <span className="text-[10px] text-purple-700 dark:text-purple-400 block">Nội dung chuyển khoản (Bắt buộc):</span>
                      <span className="font-black text-sm font-mono text-purple-600 dark:text-purple-300">{selectedOrder.orderCode}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(selectedOrder.orderCode, 'code')}
                      className="px-2.5 py-1 bg-purple-200/60 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200 rounded-lg font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedField === 'code' ? <Icons.Check className="w-3 h-3" /> : <Icons.Copy className="w-3 h-3" />}
                      <span>{copiedField === 'code' ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                  </div>

                  <div className="p-3 bg-indigo-500/10 rounded-xl text-[11px] text-indigo-700 dark:text-indigo-300 space-y-1">
                    <p className="font-bold flex items-center gap-1">
                      <Icons.AlertCircle className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{isVi ? "Lưu ý quan trọng:" : "Important note:"}</span>
                    </p>
                    <p>{isVi ? "Vui lòng giữ nguyên mã nội dung chuyển khoản để hệ thống tự động nhận diện và kích hoạt ngay tức thì." : "Keep the transfer description exact for instant automated verification."}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                <button
                  onClick={() => setActiveTab('packages')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  {isVi ? "← Chọn Gói Khác" : "← Change Package"}
                </button>

                <button
                  onClick={handleConfirmUserPaid}
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Icons.CheckCircle2 className="w-4 h-4" />
                  <span>{isVi ? "Tôi Đã Chuyển Khoản Thành Công (Kích Hoạt)" : "I Have Transferred (Activate)"}</span>
                </button>
              </div>
            </div>
          )}

          {/* VIEW 3: ORDER HISTORY & ADMIN CONFIRMATION */}
          {activeTab === 'orders' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-extrabold text-gray-900 dark:text-white">
                    {isVi ? "Lịch Sử Đơn Hàng & Bảng Quản Trị Duyệt (Admin Panel)" : "Order History & Admin Approval Panel"}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {isVi ? "Quản lý đơn hàng VietQR và kích hoạt gói ngay cho khách hàng." : "Manage VietQR orders and activate accounts instantly."}
                  </p>
                </div>
              </div>

              {ordersList.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-200 dark:border-slate-800 space-y-2">
                  <Icons.Receipt className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="text-xs text-gray-500">{isVi ? "Chưa có đơn hàng nào được tạo." : "No orders created yet."}</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {ordersList.map((ord) => (
                    <div 
                      key={ord.id}
                      className="p-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-xs text-indigo-600 dark:text-indigo-400">
                            {ord.orderCode}
                          </span>
                          <span className={`px-2 py-0.5 text-[10px] font-black rounded-md ${
                            ord.status === 'completed' 
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' 
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {ord.status === 'completed' ? (isVi ? 'ĐÃ KÍCH HOẠT' : 'COMPLETED') : (isVi ? 'CHỜ DUYỆT' : 'PENDING')}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">{ord.packageName}</p>
                        <p className="text-[10px] text-gray-400">
                          {new Date(ord.createdAt).toLocaleString('vi-VN')} • {ord.amount.toLocaleString('vi-VN')} VNĐ
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {ord.status === 'pending' && (
                          <button
                            onClick={() => handleAdminApproveOrder(ord)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Icons.Check className="w-3.5 h-3.5" />
                            <span>{isVi ? 'Admin Duyệt Ngay' : 'Approve'}</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedOrder(ord);
                            setActiveTab('checkout');
                          }}
                          className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Icons.QrCode className="w-3.5 h-3.5" />
                          <span>{isVi ? 'Xem Lại QR' : 'View QR'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
