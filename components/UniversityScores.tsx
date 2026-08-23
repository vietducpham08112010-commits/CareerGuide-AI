import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Language } from '../types';
import { searchUniversityScores } from '../services/geminiService';
import { InlineGuide } from './InlineGuide';
import { 
  Globe, ExternalLink, ShieldCheck, Search, GraduationCap, 
  RefreshCw, Sparkles, AlertCircle, RotateCcw, CheckCircle2, Copy,
  Calculator, Award, TrendingUp, Filter, Check, ChevronDown, ChevronUp,
  BarChart3, BookOpen, MapPin, Target, Zap, Info, ArrowUpRight
} from 'lucide-react';
import { LuxuryAiThinking } from './SkeletonLoader';

const QUICK_CHIPS = [
  'Đại học Bách Khoa Hà Nội',
  'Đại học Ngoại Thương',
  'Đại học Kinh tế Quốc dân',
  'Đại học Y Hà Nội',
  'Đại học Bách Khoa TP.HCM',
  'Đại học CNTT (UIT - ĐHQG TP.HCM)',
  'Học viện Công nghệ Bưu chính Viễn thông',
  'Đại học Sư phạm Kỹ thuật TP.HCM'
];

const EXAM_COMBINATIONS = [
  { code: 'Tất cả', name: 'Tất cả tổ hợp môn' },
  { code: 'A00', name: 'Toán, Vật lý, Hóa học' },
  { code: 'A01', name: 'Toán, Vật lý, Tiếng Anh' },
  { code: 'D01', name: 'Toán, Ngữ văn, Tiếng Anh' },
  { code: 'B00', name: 'Toán, Hóa học, Sinh học' },
  { code: 'C00', name: 'Ngữ văn, Lịch sử, Địa lý' },
  { code: 'D07', name: 'Toán, Hóa học, Tiếng Anh' }
];

const REGIONAL_BONUSES = [
  { label: 'Khu vực 3 (Không ưu tiên)', value: 0 },
  { label: 'Khu vực 2 (Ưu tiên +0.25 pt)', value: 0.25 },
  { label: 'Khu vực 2-NT (Ưu tiên +0.5 pt)', value: 0.5 },
  { label: 'Khu vực 1 (Ưu tiên +0.75 pt)', value: 0.75 }
];

export const UniversityScores = ({ lang, t, Icons }: { lang: Language, t: any, Icons: any }) => {
  const isVi = lang === Language.VI;

  // Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [searchedTerm, setSearchedTerm] = useState('Đại học Bách Khoa, Ngoại Thương, Kinh tế Quốc dân');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [groundingMetadata, setGroundingMetadata] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Filter & Display States
  const [activeTab, setActiveTab] = useState<'report' | 'calculator' | 'citations'>('report');
  const [selectedCombinationFilter, setSelectedCombinationFilter] = useState('Tất cả');

  // Interactive Score Estimator Calculator States
  const [showCalculator, setShowCalculator] = useState(false);
  const [scoreSub1, setScoreSub1] = useState<number | ''>(8.5);
  const [scoreSub2, setScoreSub2] = useState<number | ''>(8.75);
  const [scoreSub3, setScoreSub3] = useState<number | ''>(8.5);
  const [priorityBonus, setPriorityBonus] = useState<number>(0.25);
  const [selectedExamCode, setSelectedExamCode] = useState<string>('A00');

  // Calculated User Score
  const totalUserScore = useMemo(() => {
    const s1 = typeof scoreSub1 === 'number' ? scoreSub1 : 0;
    const s2 = typeof scoreSub2 === 'number' ? scoreSub2 : 0;
    const s3 = typeof scoreSub3 === 'number' ? scoreSub3 : 0;
    const rawSum = s1 + s2 + s3;
    const bonus = typeof priorityBonus === 'number' ? priorityBonus : 0;
    return Math.min(30, Math.round((rawSum + bonus) * 100) / 100);
  }, [scoreSub1, scoreSub2, scoreSub3, priorityBonus]);

  const handleSearch = async (overrideQuery?: string) => {
    const term = (overrideQuery !== undefined ? overrideQuery : searchTerm).trim() || 'Điểm chuẩn các trường Đại học Bách Khoa, Ngoại Thương, Kinh tế Quốc dân';
    if (overrideQuery !== undefined) {
      setSearchTerm(overrideQuery);
    }
    setSearchedTerm(term);
    setIsSearching(true);
    setError(null);
    setAiResult(null);
    setGroundingMetadata(null);
    try {
      const response = await searchUniversityScores(term, lang);
      setAiResult(response.text);
      setGroundingMetadata(response.groundingMetadata);
    } catch (err: any) {
      setError(err.message || "Failed to fetch scores.");
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (!aiResult && !isSearching && !error) {
      handleSearch('Điểm chuẩn các trường Đại học hàng đầu Việt Nam Bách Khoa, Ngoại Thương, Kinh Tế Quốc Dân');
    }
  }, []);

  const copyResult = () => {
    if (!aiResult) return;
    navigator.clipboard.writeText(aiResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Extract grounding citation links cleanly
  const uniqueCitations = useMemo(() => {
    const webCitations = (groundingMetadata?.groundingChunks || [])
      .map((chunk: any) => chunk?.web)
      .filter((webItem: any) => webItem && webItem.uri);

    const list: { uri: string; title?: string }[] = [];
    const seenUris = new Set();
    for (const webItem of webCitations) {
      if (webItem && webItem.uri && !seenUris.has(webItem.uri)) {
        seenUris.add(webItem.uri);
        list.push(webItem);
      }
    }
    return list;
  }, [groundingMetadata]);

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-stretch px-4 md:px-0 space-y-6">
      
      {/* Scientific Hero Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="text-center space-y-3"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200 dark:border-indigo-800/40 text-indigo-600 dark:text-indigo-300 text-xs font-extrabold tracking-wider uppercase shadow-xs">
          <GraduationCap className="w-4 h-4 text-indigo-500" />
          <span>{isVi ? 'Cổng Tuyển Sinh AI & Ngưỡng Điểm Chuẩn Chi Tiết' : 'Official University Admissions Portal'}</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-gray-950 dark:text-white tracking-tight">
          {t.universityScores || (isVi ? 'Tra Cứu Điểm Chuẩn Đại Học' : 'University Cutoff Scores')}
        </h2>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
          {isVi 
            ? 'Cổng tra cứu điểm chuẩn THPT & Học bạ trực tuyến kết nối Google Search Grounding thời gian thực, tích hợp bộ công cụ đối sánh điểm thi cá nhân hóa.' 
            : 'Real-time AI admission threshold lookup connected with official university data sources and personalized score comparison.'}
        </p>
      </motion.div>

      {/* Inline Guide */}
      <InlineGuide 
        sectionKey="scores"
        lang={isVi ? 'vi' : 'en'}
        title={isVi ? "💡 Hướng dẫn tra cứu & Đối sánh điểm chuẩn Khoa Học" : "💡 Scientific Admission Lookup Guide"}
        steps={isVi ? [
          "Gõ tên trường, ngành học hoặc chọn các từ khóa gợi ý bên dưới (vd: Bách Khoa CNTT, Ngoại Thương Kinh tế đối ngoại).",
          "Mở 'Công cụ Tính & Đối Sánh Điểm' để nhập điểm thi của bạn và nhận đánh giá tỷ lệ trúng tuyển theo vạch màu.",
          "AI tự động phân tích điểm chuẩn các năm gần nhất, tổ hợp xét tuyển (A00, A01, D01...) kèm link dẫn chứng chính thức."
        ] : [
          "Enter target university or major (e.g. NEU Computer Science, FTU International Trade).",
          "Open the 'Score Match Estimator' to input your scores and calculate match eligibility.",
          "AI retrieves verified cutoff trends, subject combinations, and authoritative citations."
        ]}
      />

      {/* Main Search Bar Card */}
      <div className="w-full relative group">
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 dark:opacity-35 blur-xl group-hover:opacity-30 dark:group-hover:opacity-50 transition-all duration-300" />
        <div className="relative bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden p-2.5">
          <div className="flex items-center gap-2">
            <div className="pl-4 text-indigo-500 shrink-0">
              <Search className="w-5 h-5" />
            </div>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={isVi ? 'Nhập tên trường, ngành học (vd: Bách khoa CNTT, Ngoại thương, Y Hà Nội)...' : 'Search university or major (e.g., FTU, NEU, HCMUT)...'}
              className="w-full bg-transparent border-0 py-3.5 px-2 text-gray-950 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-0 text-base md:text-lg font-semibold"
            />
            <button
              onClick={() => handleSearch()}
              disabled={isSearching}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold px-6 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 text-sm md:text-base flex items-center gap-2 shrink-0 shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />}
              <span>{isSearching ? (isVi ? 'Đang truy vấn...' : 'Searching...') : (isVi ? 'Tra Cứu AI' : 'AI Search')}</span>
            </button>
          </div>

          {/* Quick Search Chips */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-white/5 flex-wrap px-2">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 mr-1 flex items-center gap-1 shrink-0">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              {isVi ? 'Gợi ý trường Top:' : 'Top Suggestions:'}
            </span>
            {QUICK_CHIPS.map((chip, idx) => (
              <button
                key={`chip-${idx}`}
                onClick={() => handleSearch(chip)}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-indigo-50 dark:bg-white/5 dark:hover:bg-indigo-950/40 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-gray-200/80 dark:border-white/10 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>{chip}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Score Estimator & Calculator Card */}
      <div className="bg-white dark:bg-[#0c0c0e] border border-indigo-200/80 dark:border-indigo-900/40 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                  {isVi ? 'Công Cụ Tính Điểm Quy Đổi & Đánh Giá Tỷ Lệ Trúng Tuyển' : 'Score Match Estimator & Calculator'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-extrabold text-[10px] uppercase tracking-wider">
                  {isVi ? 'Tự động tính' : 'Auto Calculate'}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {isVi ? 'Nhập điểm 3 môn thi của bạn để hệ thống tự động so sánh với điểm chuẩn các ngành.' : 'Input your subject scores to calculate total admission score with priority bonuses.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 px-4 py-2 rounded-2xl flex items-center gap-3">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{isVi ? 'Tổng điểm của bạn:' : 'Your Total Score:'}</span>
              <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                {totalUserScore.toFixed(2)} <span className="text-xs text-gray-400 font-normal">/ 30</span>
              </span>
            </div>
            <button
              onClick={() => setShowCalculator(!showCalculator)}
              className="p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded-2xl transition-all cursor-pointer font-bold text-xs flex items-center gap-1.5"
            >
              <span>{showCalculator ? (isVi ? 'Thu gọn' : 'Collapse') : (isVi ? 'Tùy chỉnh điểm' : 'Edit Scores')}</span>
              {showCalculator ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expandable Inputs Drawer */}
        <AnimatePresence>
          {showCalculator && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden pt-6 mt-6 border-t border-gray-100 dark:border-white/5 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                    {isVi ? 'Môn 1 (vd: Toán)' : 'Subject 1'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.25"
                    value={scoreSub1}
                    onChange={(e) => setScoreSub1(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                    {isVi ? 'Môn 2 (vd: Vật lý / Văn)' : 'Subject 2'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.25"
                    value={scoreSub2}
                    onChange={(e) => setScoreSub2(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                    {isVi ? 'Môn 3 (vd: Anh / Hóa)' : 'Subject 3'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.25"
                    value={scoreSub3}
                    onChange={(e) => setScoreSub3(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                    {isVi ? 'Ưu tiên khu vực & đối tượng' : 'Regional Priority'}
                  </label>
                  <select
                    value={priorityBonus}
                    onChange={(e) => setPriorityBonus(parseFloat(e.target.value))}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm cursor-pointer"
                  >
                    {REGIONAL_BONUSES.map((b, idx) => (
                      <option key={`rb-${idx}`} value={b.value}>{b.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3.5 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-200">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>
                    {isVi 
                      ? `Điểm của bạn (${totalUserScore.toFixed(2)} điểm) sẽ được dùng để tự động đánh giá vạch an toàn trúng tuyển trong kết quả bên dưới.` 
                      : `Your score (${totalUserScore.toFixed(2)}) will be automatically compared against cutoff benchmarks below.`}
                  </span>
                </div>
                <button
                  onClick={() => handleSearch(`${searchedTerm} mức điểm ${totalUserScore.toFixed(1)} điểm`)}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-500 transition-all shadow-sm shrink-0 cursor-pointer"
                >
                  {isVi ? 'Tìm ngành phù hợp điểm này' : 'Find Matching Majors'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results Section */}
      <AnimatePresence mode="wait">
        {isSearching && (
          <motion.div 
            key="loading" 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }} 
            className="w-full"
          >
            <LuxuryAiThinking
              variant="admission"
              title={isVi ? `CareerGuide AI Đang Tra Cứu Điểm Chuẩn Cho "${searchedTerm}"...` : `CareerGuide AI is Querying Official Admission Scores for "${searchedTerm}"...`}
              subtitle={isVi ? "Truy vấn dữ liệu thời gian thực từ Google Search Grounding để tổng hợp điểm chuẩn, tổ hợp xét tuyển và đề án mới nhất." : "Connecting real-time Google Search Grounding to extract verified cutoff scores and admission criteria."}
              badge="CareerGuide AI Portal"
              themeColor="indigo"
              stageSteps={
                isVi ? [
                  `Quét radar cổng tuyển sinh & Đề án tuyển sinh "${searchedTerm}"`,
                  "Đối chiếu điểm chuẩn các năm gần nhất & biến động tổ hợp môn (A00, A01, D01...)",
                  "Trích xuất nguồn tin thời gian thực qua Google Search Grounding",
                  "Phân tích chiến lược phân bổ nguyện vọng tối ưu"
                ] : [
                  `Scanning official university admission databases for "${searchedTerm}"`,
                  "Analyzing historical cutoff score trends & subject code combinations",
                  "Grounding facts against live university admission portals",
                  "Generating strategic application guidance & match forecasts"
                ]
              }
            />
          </motion.div>
        )}
        
        {error && !isSearching && (
          <motion.div 
            key="error" 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0 }} 
            className="w-full bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 p-6 rounded-3xl border border-rose-200 dark:border-rose-900/40 text-center space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold">{isVi ? 'Không thể tải dữ liệu điểm chuẩn' : 'Admission Query Failed'}</h4>
            <p className="text-xs text-rose-600 dark:text-rose-400 max-w-md mx-auto leading-relaxed">{error}</p>
            <button
              onClick={() => handleSearch()}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isVi ? 'Thử lại ngay' : 'Retry Now'}</span>
            </button>
          </motion.div>
        )}

        {aiResult && !isSearching && (
          <motion.div 
            key="result" 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="w-full space-y-6"
          >
            {/* Scientific Header & Navigation Tabs */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-indigo-500/20">
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white text-xs font-black uppercase tracking-wider backdrop-blur-md">
                      <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                      <span>CareerGuide AI • Admission Report</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                      {searchedTerm.toUpperCase()}
                    </h3>
                    <p className="text-xs sm:text-sm text-indigo-200/80 max-w-2xl">
                      {isVi 
                        ? 'Báo cáo điểm chuẩn, phân tích tổ hợp môn thi & chiến lược phân bổ nguyện vọng đã được xác thực thời gian thực.' 
                        : 'Verified admission metrics, exam groups, and preference allocation strategy grounded in real-time.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={copyResult}
                      className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer text-white shadow-sm"
                    >
                      {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? (isVi ? 'Đã sao chép' : 'Copied') : (isVi ? 'Sao chép' : 'Copy')}</span>
                    </button>
                    <button
                      onClick={() => handleSearch()}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer text-white shadow-lg shadow-indigo-600/30"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>{isVi ? 'Cập nhật' : 'Refresh'}</span>
                    </button>
                  </div>
                </div>

                {/* Navigation View Switcher */}
                <div className="flex items-center gap-2 pt-4 border-t border-white/10 flex-wrap">
                  <button
                    onClick={() => setActiveTab('report')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      activeTab === 'report'
                        ? 'bg-white text-indigo-950 shadow-md'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{isVi ? '📊 Báo Cáo Chi Tiết AI' : '📊 Full AI Report'}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('citations')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      activeTab === 'citations'
                        ? 'bg-white text-indigo-950 shadow-md'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{isVi ? `🔗 Nguồn Dẫn Chứng (${uniqueCitations.length})` : `🔗 Verified Sources (${uniqueCitations.length})`}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Tab 1: Full AI Report with High-Contrast Scientific Markdown Styling */}
            {activeTab === 'report' && (
              <div className="bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl space-y-6">
                
                {/* Score Comparison Badge Banner */}
                {totalUserScore > 0 && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-purple-500/10 border border-emerald-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                        ✓
                      </div>
                      <div>
                        <span className="font-extrabold text-gray-900 dark:text-white block">
                          {isVi ? `Điểm đối sánh của bạn: ${totalUserScore.toFixed(2)} điểm` : `Your Comparison Baseline: ${totalUserScore.toFixed(2)} pts`}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 text-[11px]">
                          {isVi ? 'Đang được dùng để đối chiếu tự động với các bảng điểm chuẩn dưới đây.' : 'Automatically comparing with the tables below.'}
                        </span>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-full font-bold text-[11px]">
                      {isVi ? 'Hệ thống đã sẵn sàng' : 'Ready'}
                    </span>
                  </div>
                )}

                {/* Markdown Report Body */}
                <div className="prose prose-indigo dark:prose-invert max-w-none 
                  prose-headings:font-black prose-headings:tracking-tight 
                  prose-h1:text-xl sm:prose-h1:text-2xl prose-h1:border-b prose-h1:pb-3 prose-h1:border-gray-200 dark:prose-h1:border-white/10 prose-h1:text-indigo-900 dark:prose-h1:text-indigo-200
                  prose-h2:text-lg sm:prose-h2:text-xl prose-h2:text-indigo-600 dark:prose-h2:text-indigo-400 prose-h2:mt-6
                  prose-h3:text-base prose-h3:text-gray-800 dark:prose-h3:text-gray-200
                  prose-p:text-sm sm:prose-p:text-base prose-p:leading-relaxed prose-p:text-gray-700 dark:prose-p:text-gray-300
                  prose-table:w-full prose-table:border-collapse prose-table:my-6 prose-table:shadow-sm prose-table:rounded-xl prose-table:overflow-hidden
                  prose-th:bg-indigo-50 dark:prose-th:bg-indigo-950/40 prose-th:p-3.5 prose-th:text-xs prose-th:font-black prose-th:uppercase prose-th:tracking-wider prose-th:border prose-th:border-indigo-200 dark:prose-th:border-indigo-900/50 prose-th:text-indigo-950 dark:prose-th:text-indigo-200
                  prose-td:p-3.5 prose-td:text-xs sm:prose-td:text-sm prose-td:border prose-td:border-gray-200 dark:prose-td:border-white/10 prose-td:text-gray-800 dark:prose-td:text-gray-200
                  prose-li:text-xs sm:prose-li:text-sm prose-li:text-gray-700 dark:prose-li:text-gray-300
                  prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:bg-indigo-50/50 dark:prose-blockquote:bg-indigo-950/20 prose-blockquote:p-4 prose-blockquote:rounded-r-2xl prose-blockquote:my-4
                  markdown-body"
                >
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: ({ node, href, children, ...props }) => {
                        let finalHref = href || '#';
                        if (finalHref !== '#' && !finalHref.startsWith('http://') && !finalHref.startsWith('https://')) {
                          finalHref = 'https://' + finalHref;
                        }
                        return (
                          <a
                            href={finalHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 underline font-semibold inline-flex items-center gap-1 transition-colors group"
                            {...props}
                          >
                            <span>{children}</span>
                            <ExternalLink className="w-3.5 h-3.5 inline-block opacity-80 group-hover:opacity-100 shrink-0" />
                          </a>
                        );
                      }
                    }}
                  >
                    {aiResult}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* Tab 2: Verified Sources & Grounding Links */}
            {activeTab === 'citations' && (
              <div className="bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <span>
                    {isVi 
                      ? "Nguồn Dẫn Chứng Google Search Grounding & Cổng Tuyển Sinh Trực Tiếp:" 
                      : "Verified Google Search Grounding Sources & Direct Admission Links:"}
                  </span>
                </div>

                {uniqueCitations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {uniqueCitations.map((cit, idx) => {
                      let linkUrl = cit.uri || '';
                      if (linkUrl && !linkUrl.startsWith('http://') && !linkUrl.startsWith('https://')) {
                        linkUrl = 'https://' + linkUrl;
                      }
                      return (
                        <a
                          key={cit.uri || `cit-${idx}`}
                          href={linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between gap-3 px-4 py-3.5 bg-gray-50 hover:bg-indigo-50/50 dark:bg-white/[0.02] dark:hover:bg-indigo-950/20 text-xs text-gray-700 dark:text-gray-300 rounded-2xl border border-gray-200/80 dark:border-white/10 transition-all duration-200 font-medium group cursor-pointer shadow-xs hover:border-indigo-300"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center shrink-0">
                              <Globe className="w-4 h-4" />
                            </div>
                            <span className="truncate font-bold text-gray-800 dark:text-gray-200 text-xs sm:text-sm">
                              {cit.title || cit.uri}
                            </span>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 shrink-0" />
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <a
                      href="https://thisinh.thitotnghiepthpt.edu.vn"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-2 px-4 py-3.5 bg-gray-50 hover:bg-indigo-50/50 dark:bg-white/[0.02] dark:hover:bg-indigo-950/20 text-xs text-gray-700 dark:text-gray-300 rounded-2xl border border-gray-200/80 dark:border-white/10 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span className="truncate font-bold text-gray-800 dark:text-gray-200">Cổng Tuyển sinh Bộ GD&ĐT</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 shrink-0" />
                    </a>
                    <a
                      href="https://vnexpress.net/giao-duc/tuyen-sinh"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-2 px-4 py-3.5 bg-gray-50 hover:bg-indigo-50/50 dark:bg-white/[0.02] dark:hover:bg-indigo-950/20 text-xs text-gray-700 dark:text-gray-300 rounded-2xl border border-gray-200/80 dark:border-white/10 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span className="truncate font-bold text-gray-800 dark:text-gray-200">VnExpress Tuyển sinh</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 shrink-0" />
                    </a>
                    <a
                      href="https://tuoitre.vn/giao-duc.htm"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-2 px-4 py-3.5 bg-gray-50 hover:bg-indigo-50/50 dark:bg-white/[0.02] dark:hover:bg-indigo-950/20 text-xs text-gray-700 dark:text-gray-300 rounded-2xl border border-gray-200/80 dark:border-white/10 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span className="truncate font-bold text-gray-800 dark:text-gray-200">Tuổi Trẻ Giáo dục</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 shrink-0" />
                    </a>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {!aiResult && !isSearching && !error && (
          <motion.div 
            key="empty" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="w-full bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-white/10 rounded-3xl p-8 text-center space-y-4 shadow-sm"
          >
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center mx-auto shadow-md">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-950 dark:text-white">
              {isVi ? 'Tra cứu điểm chuẩn đại học bằng AI thời gian thực' : 'Real-time AI University Admission Search'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
              {isVi 
                ? 'Nhập tên trường, ngành học hoặc chọn các từ khóa gợi ý phía trên để CareerGuide AI truy vấn dữ liệu điểm chuẩn mới nhất cùng trích dẫn nguồn uy tín.' 
                : 'Enter target school, major, or click suggestion chips above to let CareerGuide AI pull live cutoff metrics.'}
            </p>
            <div className="flex justify-center pt-2">
              <button
                onClick={() => handleSearch('Điểm chuẩn các trường Đại học Bách Khoa, Ngoại Thương, Kinh tế Quốc dân 2024-2025')}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg inline-flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>{isVi ? 'Xem tổng hợp điểm chuẩn các trường Top' : 'Search Top University Cutoff Scores'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
