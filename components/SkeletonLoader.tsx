import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Brain, Cpu, Zap, Activity, ShieldCheck, ArrowRight, 
  Compass, CheckCircle2, GraduationCap, Landmark, Mic, TrendingUp, 
  FileText, Target, Globe, Award, Scale, BarChart3, Radio
} from 'lucide-react';

export type AiThinkingVariant = 
  | 'default' 
  | 'admission' 
  | 'interview' 
  | 'salary' 
  | 'okr' 
  | 'cv' 
  | 'reskill' 
  | 'scholarship' 
  | 'compare';

export interface LuxuryAiThinkingProps {
  title?: string;
  subtitle?: string;
  stageSteps?: string[];
  currentStepIndex?: number;
  badge?: string;
  themeColor?: 'indigo' | 'amber' | 'cyan' | 'purple' | 'emerald';
  variant?: AiThinkingVariant;
  className?: string;
}

export const LuxuryAiThinking: React.FC<LuxuryAiThinkingProps> = ({
  title = "CareerGuide AI Đang Xử Lý & Phân Tích Dữ Liệu...",
  subtitle = "Hệ thống đang tích hợp mô hình Gemini AI thế hệ mới để tính toán và tối ưu hóa kết quả chính xác nhất.",
  stageSteps = [
    "Khởi tạo mạng nơ-ron phân tích dữ liệu chuyên sâu",
    "Đối chiếu tiêu chuẩn thị trường & yêu cầu tuyển dụng 2026",
    "Mô phỏng kịch bản tối ưu & chuẩn hóa thông số",
    "Hoàn thiện báo cáo chiến lược cá nhân hóa"
  ],
  currentStepIndex,
  badge = "CareerGuide AI",
  themeColor = 'indigo',
  variant = 'default',
  className = ""
}) => {
  const [internalStep, setInternalStep] = useState(0);

  useEffect(() => {
    if (typeof currentStepIndex === 'number') {
      setInternalStep(currentStepIndex);
      return;
    }
    const interval = setInterval(() => {
      setInternalStep(prev => (prev < stageSteps.length - 1 ? prev + 1 : prev));
    }, 1200);
    return () => clearInterval(interval);
  }, [currentStepIndex, stageSteps.length]);

  const activeStep = typeof currentStepIndex === 'number' ? currentStepIndex : internalStep;

  const colorStyles = {
    indigo: {
      gradient: 'from-indigo-600 via-purple-600 to-pink-500',
      glow: 'rgba(99, 102, 241, 0.25)',
      border: 'border-indigo-500/30 dark:border-indigo-500/20',
      bg: 'bg-indigo-500/5 dark:bg-indigo-950/20',
      text: 'text-indigo-600 dark:text-indigo-400',
      badgeBg: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/40',
      beam: 'from-transparent via-indigo-500 to-transparent'
    },
    amber: {
      gradient: 'from-amber-500 via-orange-500 to-rose-500',
      glow: 'rgba(245, 158, 11, 0.25)',
      border: 'border-amber-500/30 dark:border-amber-500/20',
      bg: 'bg-amber-500/5 dark:bg-amber-950/20',
      text: 'text-amber-600 dark:text-amber-400',
      badgeBg: 'bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/40',
      beam: 'from-transparent via-amber-500 to-transparent'
    },
    cyan: {
      gradient: 'from-cyan-500 via-teal-500 to-indigo-500',
      glow: 'rgba(6, 182, 212, 0.25)',
      border: 'border-cyan-500/30 dark:border-cyan-500/20',
      bg: 'bg-cyan-500/5 dark:bg-cyan-950/20',
      text: 'text-cyan-600 dark:text-cyan-400',
      badgeBg: 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/40',
      beam: 'from-transparent via-cyan-500 to-transparent'
    },
    purple: {
      gradient: 'from-purple-600 via-fuchsia-600 to-indigo-600',
      glow: 'rgba(168, 85, 247, 0.25)',
      border: 'border-purple-500/30 dark:border-purple-500/20',
      bg: 'bg-purple-500/5 dark:bg-purple-950/20',
      text: 'text-purple-600 dark:text-purple-400',
      badgeBg: 'bg-purple-50 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800/40',
      beam: 'from-transparent via-purple-500 to-transparent'
    },
    emerald: {
      gradient: 'from-emerald-500 via-teal-600 to-cyan-600',
      glow: 'rgba(16, 185, 129, 0.25)',
      border: 'border-emerald-500/30 dark:border-emerald-500/20',
      bg: 'bg-emerald-500/5 dark:bg-emerald-950/20',
      text: 'text-emerald-600 dark:text-emerald-400',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40',
      beam: 'from-transparent via-emerald-500 to-transparent'
    }
  }[themeColor];

  // Render variant-specific core animation center
  const renderVisualCenter = () => {
    switch (variant) {
      case 'admission':
        return (
          <div className="relative flex items-center justify-center w-28 h-28">
            {/* Radar Circular Sweep */}
            <motion.div
              className="absolute inset-0 rounded-full border border-indigo-400/40"
              animate={{ scale: [0.8, 1.15, 0.8] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute inset-2 rounded-full border border-dashed border-purple-400/50"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            />
            {/* Radar Beam */}
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-indigo-500/20 to-cyan-400/30 pointer-events-none"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "linear" }}
            />
            {/* Core University Gate / Cap */}
            <motion.div
              className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 flex items-center justify-center text-white shadow-xl"
              animate={{ scale: [0.95, 1.05, 0.95] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <GraduationCap className="w-7 h-7 text-white drop-shadow" />
              <motion.div
                className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
              >
                <Landmark className="w-2.5 h-2.5 text-slate-950" />
              </motion.div>
            </motion.div>
          </div>
        );

      case 'interview':
        return (
          <div className="relative flex items-center justify-center w-28 h-28">
            {/* Sound Wave Ripple Rings */}
            {[1, 1.4, 1.8].map((s, idx) => (
              <motion.div
                key={idx}
                className="absolute rounded-full border border-purple-400/30"
                style={{ width: `${s * 48}px`, height: `${s * 48}px` }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.7, 0.3]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  delay: idx * 0.4,
                  ease: "easeInOut"
                }}
              />
            ))}
            {/* Mic Core */}
            <motion.div
              className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-xl"
              animate={{ y: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Mic className="w-7 h-7 text-white" />
              <motion.div
                className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <Radio className="w-2.5 h-2.5 text-slate-950" />
              </motion.div>
            </motion.div>
          </div>
        );

      case 'salary':
        return (
          <div className="relative flex items-center justify-center w-28 h-28">
            <motion.div
              className="absolute inset-0 rounded-2xl border border-emerald-400/30 rotate-45"
              animate={{ rotate: [45, 225, 405] }}
              transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
            />
            {/* Jumping Salary Bars */}
            <div className="absolute inset-0 flex items-center justify-center gap-1.5 pointer-events-none opacity-40">
              {[0.4, 0.8, 1, 0.6].map((h, idx) => (
                <motion.div
                  key={idx}
                  className="w-1.5 bg-emerald-400 rounded-full"
                  animate={{ height: [h * 20, h * 45, h * 20] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: idx * 0.2 }}
                />
              ))}
            </div>
            <motion.div
              className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-xl z-10"
              animate={{ scale: [0.98, 1.06, 0.98] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <TrendingUp className="w-7 h-7 text-white" />
              <motion.div
                className="absolute -top-1 -right-1 px-1 py-0.5 bg-amber-400 rounded text-[9px] font-black text-slate-950 shadow"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                +35%
              </motion.div>
            </motion.div>
          </div>
        );

      case 'okr':
        return (
          <div className="relative flex items-center justify-center w-28 h-28">
            {/* Target Milestone Orbit */}
            <motion.div
              className="absolute w-22 h-22 rounded-full border-2 border-dashed border-cyan-400/50"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
            />
            <motion.div
              className="absolute w-16 h-16 rounded-full border border-teal-400/40"
              animate={{ scale: [0.9, 1.1, 0.9] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
            />
            <motion.div
              className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-600 to-teal-600 flex items-center justify-center text-white shadow-xl"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              <Target className="w-7 h-7 text-white" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center border border-white text-[9px] font-black text-slate-950">
                100
              </div>
            </motion.div>
          </div>
        );

      case 'cv':
        return (
          <div className="relative flex items-center justify-center w-28 h-28">
            {/* Laser ATS Document Scanner */}
            <div className="relative w-16 h-20 bg-white/10 dark:bg-white/5 border-2 border-purple-400/40 rounded-xl overflow-hidden p-2 flex flex-col justify-between shadow-lg">
              <div className="space-y-1">
                <div className="w-8 h-1.5 bg-purple-400/60 rounded" />
                <div className="w-12 h-1 bg-purple-300/40 rounded" />
                <div className="w-10 h-1 bg-purple-300/40 rounded" />
              </div>
              {/* Laser Line Scanning Down */}
              <motion.div
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-pink-400 to-purple-400 shadow-[0_0_8px_#d946ef]"
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              />
              <div className="flex justify-between items-center pt-1 border-t border-purple-400/20">
                <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
                <span className="text-[8px] font-mono font-black text-purple-300">ATS 98%</span>
              </div>
            </div>
          </div>
        );

      case 'reskill':
        return (
          <div className="relative flex items-center justify-center w-32 h-28">
            {/* 90-Day Bridge Connection */}
            <div className="flex items-center gap-3">
              <motion.div
                className="w-10 h-10 rounded-xl bg-gray-700/80 border border-gray-600 flex items-center justify-center text-xs font-bold text-gray-300"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                Current
              </motion.div>
              {/* Animated Connection Arrow Bridge */}
              <div className="relative flex items-center justify-center">
                <motion.div
                  className="w-8 h-1 bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
                <ArrowRight className="w-4 h-4 text-amber-400 absolute" />
              </div>
              <motion.div
                className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 flex items-center justify-center font-black shadow-lg"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.3 }}
              >
                Target
              </motion.div>
            </div>
          </div>
        );

      case 'scholarship':
        return (
          <div className="relative flex items-center justify-center w-28 h-28">
            <motion.div
              className="absolute w-20 h-20 rounded-full border border-emerald-400/40"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
            />
            {/* Orbiting Global Grant Stars */}
            {[0, 90, 180, 270].map((deg, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 text-amber-400"
                animate={{ rotate: 360 }}
                style={{ transformOrigin: "48px 48px" }}
                transition={{ repeat: Infinity, duration: 6, delay: i * 0.5, ease: "linear" }}
              >
                <Award className="w-3.5 h-3.5" />
              </motion.div>
            ))}
            <motion.div
              className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-xl"
              animate={{ scale: [0.95, 1.05, 0.95] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Globe className="w-7 h-7 text-white" />
            </motion.div>
          </div>
        );

      case 'compare':
        return (
          <div className="relative flex items-center justify-center w-28 h-28">
            <motion.div
              className="absolute w-20 h-20 rounded-full border border-dashed border-indigo-400/40"
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
            />
            <motion.div
              className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center text-white shadow-xl"
              animate={{ rotate: [-8, 8, -8] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              <Scale className="w-7 h-7 text-white" />
            </motion.div>
          </div>
        );

      default:
        return (
          <div className="relative flex items-center justify-center">
            {/* Outer Pulsing Glow */}
            <motion.div
              className={`absolute w-24 h-24 rounded-full bg-gradient-to-r ${colorStyles.gradient} opacity-20 blur-xl`}
              animate={{
                scale: [1, 1.25, 1],
                opacity: [0.15, 0.35, 0.15]
              }}
              transition={{
                repeat: Infinity,
                duration: 3,
                ease: 'easeInOut'
              }}
            />

            {/* Orbital Ring 1 */}
            <motion.div
              className="absolute w-20 h-20 rounded-full border border-dashed border-indigo-400/40 dark:border-indigo-400/30"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
            />

            {/* Orbital Ring 2 (Counter-rotate) */}
            <motion.div
              className="absolute w-16 h-16 rounded-full border border-dotted border-purple-400/50 dark:border-purple-400/30"
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
            />

            {/* Core Orb Container */}
            <motion.div
              className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${colorStyles.gradient} flex items-center justify-center text-white shadow-xl shadow-indigo-500/20`}
              animate={{
                y: [-2, 2, -2]
              }}
              transition={{
                repeat: Infinity,
                duration: 2.5,
                ease: 'easeInOut'
              }}
            >
              <Brain className="w-7 h-7 animate-pulse text-white drop-shadow-md" />
              <motion.div
                className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <Sparkles className="w-2 h-2 text-slate-950" />
              </motion.div>
            </motion.div>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -15, scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`relative overflow-hidden rounded-3xl border ${colorStyles.border} bg-white dark:bg-[#0c0c0e] shadow-2xl p-6 sm:p-8 backdrop-blur-xl ${className}`}
      style={{
        boxShadow: `0 20px 40px -15px ${colorStyles.glow}`
      }}
    >
      {/* Top Animated Laser Scanner Line */}
      <motion.div
        className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${colorStyles.beam}`}
        animate={{
          x: ['-100%', '100%']
        }}
        transition={{
          repeat: Infinity,
          duration: 2.2,
          ease: 'easeInOut'
        }}
      />

      {/* Ambient Neural Glow Orbs */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-gradient-to-tr from-cyan-500/20 via-blue-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Layout */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-6">
        {/* Luxury AI Core Icon with Variant */}
        {renderVisualCenter()}

        {/* Headings & Badge */}
        <div className="space-y-2 max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest border shadow-sm backdrop-blur-md transition-all">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="font-mono text-gray-700 dark:text-gray-200">{badge}</span>
          </div>

          <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-tight leading-snug">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-md mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Real-time Processing Steps with Smooth State Transition */}
        {stageSteps && stageSteps.length > 0 && (
          <div className="w-full max-w-lg bg-gray-50/80 dark:bg-white/[0.03] border border-gray-200/80 dark:border-white/10 rounded-2xl p-4 sm:p-5 space-y-3 text-left">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200/60 dark:border-white/5 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                <span>Tiến trình giải thuật AI</span>
              </span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400 font-extrabold">
                {Math.min(100, Math.round(((activeStep + 1) / stageSteps.length) * 100))}%
              </span>
            </div>

            {/* Step Progress Bar */}
            <div className="w-full h-1.5 bg-gray-200/60 dark:bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r ${colorStyles.gradient} rounded-full`}
                initial={{ width: '0%' }}
                animate={{ width: `${((activeStep + 1) / stageSteps.length) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>

            {/* Steps Checklist */}
            <div className="space-y-2.5 pt-1">
              {stageSteps.map((step, idx) => {
                const isDone = activeStep > idx;
                const isCurrent = activeStep === idx;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className={`flex items-center gap-3 p-2 rounded-xl text-xs transition-colors ${
                      isCurrent
                        ? `${colorStyles.bg} font-bold text-gray-900 dark:text-white border ${colorStyles.border}`
                        : isDone
                        ? 'text-gray-400 dark:text-gray-500 line-through'
                        : 'text-gray-400 dark:text-gray-600 opacity-60'
                    }`}
                  >
                    {isDone ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    ) : isCurrent ? (
                      <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-gray-300 dark:border-white/10 shrink-0" />
                    )}
                    <span className="flex-1 font-medium">{step}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Live Audio / Frequency Waveform Indicator */}
        <div className="flex items-center justify-center gap-1 py-1">
          {[0.3, 0.7, 1, 0.5, 0.8, 0.4, 0.9, 0.6, 0.3].map((height, i) => (
            <motion.div
              key={i}
              className="w-1 bg-gradient-to-t from-indigo-500 to-purple-400 rounded-full"
              animate={{
                height: [height * 8, height * 24, height * 8]
              }}
              transition={{
                repeat: Infinity,
                duration: 1.2,
                delay: i * 0.1,
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export const SkeletonCard = ({ count = 3, className = "" }: { count?: number; className?: string }) => {
  return (
    <div className={`space-y-4 w-full ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.08 }}
          className="relative overflow-hidden p-5 sm:p-6 bg-white dark:bg-[#0c0c0e] border border-gray-200/80 dark:border-white/10 rounded-2xl shadow-sm space-y-3.5"
        >
          {/* Shimmer Sweep Animation */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmerText_2s_infinite] bg-gradient-to-r from-transparent via-white/40 dark:via-white/5 to-transparent pointer-events-none" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-white/10 dark:to-white/5 shrink-0 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-500/40 animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-40 sm:w-56 bg-gray-200 dark:bg-white/10 rounded-md animate-pulse" />
                <div className="h-3 w-24 sm:w-36 bg-gray-100 dark:bg-white/5 rounded-md animate-pulse" />
              </div>
            </div>
            <div className="h-7 w-20 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 rounded-lg animate-pulse" />
          </div>

          <div className="space-y-2 pt-1">
            <div className="h-3 w-full bg-gray-100 dark:bg-white/5 rounded-md animate-pulse" />
            <div className="h-3 w-4/5 bg-gray-100 dark:bg-white/5 rounded-md animate-pulse" />
          </div>

          <div className="flex gap-2 pt-1">
            <div className="h-5 w-16 bg-gray-100 dark:bg-white/5 rounded-full animate-pulse" />
            <div className="h-5 w-24 bg-gray-100 dark:bg-white/5 rounded-full animate-pulse" />
            <div className="h-5 w-20 bg-gray-100 dark:bg-white/5 rounded-full animate-pulse" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export const SkeletonRoadmap = () => {
  return (
    <div className="w-full space-y-6">
      {/* Top Header skeleton */}
      <div className="relative overflow-hidden p-6 bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-white/10 rounded-3xl space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center">
              <Compass className="w-6 h-6 text-indigo-500 animate-spin-slow" />
            </div>
            <div className="space-y-2">
              <div className="h-5 w-52 bg-gray-200 dark:bg-white/10 rounded-lg animate-pulse" />
              <div className="h-3.5 w-36 bg-gray-100 dark:bg-white/5 rounded-md animate-pulse" />
            </div>
          </div>
          <div className="h-8 w-28 bg-indigo-100 dark:bg-indigo-950/40 rounded-xl animate-pulse" />
        </div>
        <div className="h-3 w-full bg-gray-100 dark:bg-white/5 rounded-full animate-pulse" />
      </div>

      {/* 3 Step Nodes Skeleton with Connectors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((step) => (
          <div 
            key={step} 
            className="relative overflow-hidden p-5 bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-white/10 rounded-2xl space-y-3 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-lg bg-indigo-200 dark:bg-indigo-900/50 flex items-center justify-center font-bold text-xs text-indigo-600">
                0{step}
              </div>
              <div className="h-4 w-16 bg-gray-200 dark:bg-white/10 rounded-md animate-pulse" />
            </div>
            <div className="h-4 w-3/4 bg-gray-200 dark:bg-white/10 rounded-md animate-pulse" />
            <div className="h-3 w-full bg-gray-100 dark:bg-white/5 rounded-md animate-pulse" />
            <div className="h-3 w-5/6 bg-gray-100 dark:bg-white/5 rounded-md animate-pulse" />
            <div className="pt-2 flex gap-1.5">
              <div className="h-4 w-12 bg-gray-100 dark:bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-14 bg-gray-100 dark:bg-white/5 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SkeletonInterviewFeedback = () => {
  return (
    <div className="w-full bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center">
            <Activity className="w-5 h-5 text-indigo-500 animate-pulse" />
          </div>
          <div className="space-y-1.5">
            <div className="h-4 w-44 bg-gray-200 dark:bg-white/10 rounded-md animate-pulse" />
            <div className="h-3 w-28 bg-gray-100 dark:bg-white/5 rounded-md animate-pulse" />
          </div>
        </div>
        <div className="h-10 w-16 bg-indigo-200 dark:bg-indigo-900/50 rounded-xl animate-pulse" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="p-3.5 bg-gray-50 dark:bg-white/5 rounded-xl space-y-2">
            <div className="h-3 w-20 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
            <div className="h-5 w-12 bg-gray-300 dark:bg-white/20 rounded animate-pulse" />
          </div>
        ))}
      </div>

      <div className="space-y-2.5 pt-2">
        <div className="h-3.5 w-full bg-gray-100 dark:bg-white/5 rounded-md animate-pulse" />
        <div className="h-3.5 w-11/12 bg-gray-100 dark:bg-white/5 rounded-md animate-pulse" />
        <div className="h-3.5 w-4/5 bg-gray-100 dark:bg-white/5 rounded-md animate-pulse" />
      </div>
    </div>
  );
};
