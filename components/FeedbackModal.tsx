import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { saveFeedbackToCloud } from '../services/firestoreService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  lang: 'en' | 'vi';
  onAddEarnedPoints: (pts: number) => void;
}

export const FeedbackModal: React.FC<Props> = ({ isOpen, onClose, userId, lang, onAddEarnedPoints }) => {
  const [activeTab, setActiveTab] = useState<'app' | 'google_form'>('google_form');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const googleFormUrl = "https://forms.gle/Sza1jSmxRFf7A2q47";

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const targetUid = userId || 'anonymous_user';
      await saveFeedbackToCloud(targetUid, rating, comment);
      setIsSubmitted(true);
      onAddEarnedPoints(50); // Give +50 points reward!
      setTimeout(() => {
        setIsSubmitted(false);
        setComment('');
        setRating(5);
        onClose();
      }, 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(googleFormUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-2xl bg-white dark:bg-[#090d16] border border-purple-500/30 rounded-3xl p-6 shadow-2xl overflow-hidden relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors z-20"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header Title Bar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-2xl shadow-lg shadow-purple-500/20">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                {lang === 'vi' ? 'Khảo Sát & Góp Ý Ứng Dụng' : 'User Survey & Feedback'}
              </h3>
              <span className="px-2 py-0.5 text-[10px] bg-purple-500/20 border border-purple-500/30 text-purple-600 dark:text-purple-300 font-bold rounded-full">
                Google Forms
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {lang === 'vi' ? 'Đóng góp ý kiến để nhận ngay điểm thưởng +30 CP vào tài khoản!' : 'Provide feedback to earn +30 CP instantly!'}
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-gray-100 dark:bg-slate-800/80 p-1 rounded-2xl mb-5 border border-gray-200 dark:border-slate-700/60">
          <button
            onClick={() => setActiveTab('google_form')}
            className={`flex-1 py-2.5 px-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'google_form'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
            {lang === 'vi' ? '📝 Google Form Khảo Sát (Chính Thức)' : '📝 Official Google Form'}
          </button>
          <button
            onClick={() => setActiveTab('app')}
            className={`flex-1 py-2.5 px-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'app'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {lang === 'vi' ? '⭐ Đánh Giá Nhanh (+50 XP)' : '⭐ Quick Rating (+50 XP)'}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'google_form' ? (
            <motion.div
              key="google_form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Premium Google Form Callout Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/40 text-white shadow-xl relative overflow-hidden space-y-4">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-purple-500/20 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-purple-500/30 border border-purple-400/40 text-purple-300 text-[11px] font-black rounded-lg">
                      FORM KHẢO SÁT CHÍNH THỨC
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Verified Google Link
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 bg-amber-400/20 text-amber-300 text-xs font-mono font-black rounded-md border border-amber-400/30">
                    +30 CP REWARD
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-base font-extrabold text-purple-100">
                    {lang === 'vi' ? 'Form Khảo Sát Nâng Cấp Chất Lượng Trải Nghiệm AI' : 'AI Quality & Career Guidance Survey'}
                  </h4>
                  <p className="text-xs text-purple-200/80 leading-relaxed">
                    {lang === 'vi'
                      ? 'Ý kiến đóng góp của bạn giúp nhóm phát triển tối ưu hóa thuật toán AI tư vấn hướng nghiệp, cập nhật điểm chuẩn đại học và giao diện.'
                      : 'Your insights directly empower us to improve career prompts, university scores matching, and UI experience.'}
                  </p>
                </div>

                {/* Primary Action Button Bar */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                  <a
                    href={googleFormUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      onAddEarnedPoints(30);
                    }}
                    className="w-full sm:flex-1 py-3 px-5 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 hover:from-purple-600 hover:to-indigo-700 text-white font-black text-xs rounded-xl shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 group"
                  >
                    <span>{lang === 'vi' ? '🚀 Mở Google Form Trên Tab Mới' : '🚀 Open Google Form'}</span>
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>

                  <button
                    onClick={handleCopyLink}
                    className="w-full sm:w-auto py-3 px-4 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    {copiedLink ? (
                      <span className="text-emerald-400 font-bold">{lang === 'vi' ? '✓ Đã sao chép Link' : '✓ Link Copied'}</span>
                    ) : (
                      <span>{lang === 'vi' ? '📋 Chép Đường Link' : '📋 Copy Link'}</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Embedded Google Form Container with fallback iframe */}
              <div className="border border-purple-500/30 rounded-2xl overflow-hidden bg-slate-900 shadow-inner">
                <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-2 font-mono text-[11px] text-purple-300">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    https://forms.gle/Sza1jSmxRFf7A2q47
                  </span>
                  <a
                    href={googleFormUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 text-[11px] font-bold underline"
                  >
                    {lang === 'vi' ? 'Toàn màn hình ↗' : 'Fullscreen ↗'}
                  </a>
                </div>
                
                {/* Embedded Form Preview / Iframe */}
                <div className="relative w-full h-[280px] bg-slate-900 flex flex-col items-center justify-center p-4 text-center">
                  <iframe
                    src="https://docs.google.com/forms/d/e/1FAIpQLSe-0_placeholder/viewform?embedded=true"
                    title="Google Form Feedback"
                    className="w-full h-full rounded-xl border-0 opacity-90 hover:opacity-100 transition-opacity"
                    onError={(e) => console.log(e)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/90 to-transparent flex flex-col items-center justify-end p-6 pointer-events-auto">
                    <div className="p-3 bg-purple-500/20 border border-purple-400/30 rounded-2xl mb-3 text-purple-200 text-xs max-w-md">
                      {lang === 'vi'
                        ? 'Bấm nút bên dưới để mở Form Google Forms chính thức hoàn thành khảo sát và nhận thưởng ngay!'
                        : 'Click below to open official Google Forms survey in a new tab!'}
                    </div>
                    <a
                      href={googleFormUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => onAddEarnedPoints(30)}
                      className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-xl shadow-lg transition-all"
                    >
                      {lang === 'vi' ? 'Điền Google Form Ngay (+30 CP) ↗' : 'Fill Google Form (+30 CP) ↗'}
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : !isSubmitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              <div className="text-center">
                <div className="inline-flex p-3 rounded-full bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 mb-2">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.253.58 1.802l-3.957 2.871a1 1 0 00-.364 1.118l1.52 4.674c.3.922-.755 1.688-1.538 1.118l-3.957-2.87a1 1 0 00-1.171 0l-3.957 2.87c-.783.57-1.838-.197-1.538-1.118l1.52-4.674a1 1 0 00-.364-1.118L2.05 9.75c-.78-.549-.38-1.802.58-1.802h4.907a1 1 0 00.95-.69l1.519-4.674z" />
                  </svg>
                </div>
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
                  {lang === 'vi' ? 'Đánh Giá Trực Tiếp Nhanh' : 'Rate Your Experience'}
                </h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {lang === 'vi' 
                    ? 'Bạn có thấy những gợi ý và câu hỏi của AI thực sự hữu ích không? Phản hồi của bạn giúp chúng tôi nâng cấp hệ thống!'
                    : 'Were the AI recommendations and guidance useful? Leave your insights to help us optimize prompts.'}
                </p>
              </div>

              {/* STAR RATING */}
              <div className="flex justify-center items-center gap-1.5 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 focus:outline-none transition-transform active:scale-95"
                  >
                    <svg
                      className={`w-8 h-8 transition-colors ${
                        star <= (hoverRating || rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-200 dark:text-slate-700'
                      }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>

              {/* COMMENT BOX */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">
                  {lang === 'vi' ? 'GÓP Ý CHI TIẾT (TÙY CHỌN)' : 'DETAILED FEEDBACK (OPTIONAL)'}
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={
                    lang === 'vi' 
                      ? 'AI cần trả lời tập trung hơn, hay giao diện cần thêm gì...' 
                      : 'E.g. AI prompts could be more customized...'
                  }
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-indigo-500 dark:text-white resize-none"
                />
              </div>

              {/* ACTION BUTTON */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold rounded-2xl text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>{lang === 'vi' ? 'Gửi Điểm & Đánh Giá (+50 XP)' : 'Submit Review (+50 XP)'}</span>
                )}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="py-8 flex flex-col items-center justify-center text-center space-y-3"
            >
              <div className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center animate-bounce shadow-lg">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
                {lang === 'vi' ? 'Gửi thành công! +50 XP' : 'Thank You! +50 XP'}
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {lang === 'vi' 
                  ? 'Góp ý vàng của bạn đã được ghi nhận trực tiếp vào hệ thống.' 
                  : 'Your feedback was saved successfully.'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

