import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Language } from '../types';
import { searchUniversityScores } from '../services/geminiService';
import { InlineGuide } from './InlineGuide';
import { Globe, ExternalLink, ShieldCheck, Search, BookOpen, GraduationCap, Award, RefreshCw, Sparkles, Landmark, Star, AlertCircle } from 'lucide-react';

const MOCK_DATA = [
  { id: 1, name: 'Đại học Bách Khoa Hà Nội', major: 'Khoa học Máy tính (IT1)', year: 2023, score: 29.42, group: 'A00, A01', type: 'Engineering' },
  { id: 2, name: 'Đại học Bách Khoa Hà Nội', major: 'Kỹ thuật Máy tính (IT2)', year: 2023, score: 28.29, group: 'A00, A01', type: 'Engineering' },
  { id: 3, name: 'Đại học Công nghệ - ĐHQGHN', major: 'Công nghệ Thông tin', year: 2023, score: 27.85, group: 'A00, A01', type: 'Technology' },
  { id: 4, name: 'Đại học Kinh tế Quốc dân', major: 'Logistics và QLCCTU', year: 2023, score: 27.4, group: 'A00, A01, D01, D07', type: 'Business' },
  { id: 5, name: 'Đại học Ngoại thương', major: 'Kinh tế đối ngoại', year: 2023, score: 28.3, group: 'A00, A01, D01', type: 'Business' },
];

export const UniversityScores = ({ lang, t, Icons }: { lang: Language, t: any, Icons: any }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [groundingMetadata, setGroundingMetadata] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    setError(null);
    setAiResult(null);
    setGroundingMetadata(null);
    try {
      const response = await searchUniversityScores(searchTerm, lang);
      setAiResult(response.text);
      setGroundingMetadata(response.groundingMetadata);
    } catch (err: any) {
      setError(err.message || "Failed to fetch scores.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-stretch px-4 md:px-0">
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-3 tracking-wide uppercase">
          <GraduationCap className="w-4 h-4" />
          <span>{lang === Language.VI ? 'Hồ sơ tuyển sinh & Ngưỡng điểm' : 'University Admissions'}</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-gray-950 dark:text-white tracking-tight mb-3">
          {t.universityScores || 'Tra cứu điểm chuẩn'}
        </h2>
        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          {lang === Language.VI 
            ? 'Hệ thống tra cứu điểm chuẩn THPT, phân tích tổ hợp xét tuyển và đưa ra đánh giá cơ hội trúng tuyển thời gian thực từ AI.' 
            : 'Track admission thresholds, analyze exam code combinations, and receive real-time match forecasts from AI.'}
        </p>
      </motion.div>

      <InlineGuide 
        sectionKey="scores"
        lang={lang === Language.VI ? 'vi' : 'en'}
        title={lang === Language.VI ? "💡 Hướng dẫn tra cứu điểm chuẩn" : "💡 Admission Lookup Guide"}
        steps={lang === Language.VI ? [
          "Gõ tên trường, tên ngành hoặc tổ hợp môn thi (vd: Đại học Ngoại thương Kinh tế đối ngoại, hoặc Điểm chuẩn Bách khoa khoa học máy tính).",
          "AI sẽ tự động rà soát, hiển thị điểm chuẩn chính xác cùng các nguồn tham khảo chính thức thời gian thực.",
          "Bạn sẽ nhận được phân tích xu hướng biến động điểm số cùng những lời khuyên chiến lược đăng ký nguyện vọng tối ưu."
        ] : [
          "Type in your target university, major name, or exam codes (e.g., NEU Business Analytics admission score).",
          "AI automatically parses historical grids, returning verified admission baselines with links to authoritative citations.",
          "Receive customized expert insights on score volatility and target alignment strategy."
        ]}
      />

      <div className="w-full relative mb-10 group">
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 opacity-20 dark:opacity-30 blur-lg group-hover:opacity-30 dark:group-hover:opacity-45 transition-all duration-300" />
        <div className="relative flex items-center bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl transition-all duration-300 overflow-hidden pr-2">
          <div className="pl-5 text-gray-400 dark:text-gray-500 flex-shrink-0">
            <Search className="w-5 h-5" />
          </div>
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={lang === Language.VI ? 'Nhập tên trường, ngành học (vd: Bách khoa CNTT, Kinh tế Quốc dân)...' : 'Search university or major (e.g., FTU International Business)...'}
            className="w-full bg-transparent border-0 py-4.5 pl-3 pr-4 text-gray-950 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-0 text-base md:text-lg font-medium"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchTerm.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 text-sm md:text-base flex items-center gap-2 shrink-0 shadow-md hover:shadow-indigo-600/10"
          >
            {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{isSearching ? (lang === Language.VI ? 'Đang tra...' : 'Searching...') : (lang === Language.VI ? 'Tra cứu' : 'Search')}</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isSearching && (
          <motion.div 
            key="loading" 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }} 
            className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-white/[0.01] rounded-3xl border border-dashed border-gray-200 dark:border-white/5"
          >
            <div className="relative mb-4">
              <div className="w-12 h-12 rounded-full border-4 border-indigo-200 dark:border-indigo-950/50 border-t-indigo-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <p className="font-bold text-gray-800 dark:text-gray-200">
              {lang === Language.VI ? 'Đang kết nối cơ sở dữ liệu & tìm kiếm thực tế...' : 'Connecting to admissions database...'}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-sm text-center">
              {lang === Language.VI ? 'AI đang tổng hợp dữ liệu điểm chuẩn mới nhất từ các nguồn chính thống.' : 'AI is compiling raw admission data from official school publications.'}
            </p>
          </motion.div>
        )}
        
        {error && !isSearching && (
          <motion.div 
            key="error" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="w-full bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-5 rounded-2xl border border-red-100 dark:border-red-950/20 text-center flex items-center justify-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="font-semibold">{error}</span>
          </motion.div>
        )}

        {aiResult && !isSearching && (() => {
          const webCitations = (groundingMetadata?.groundingChunks || [])
            .map((chunk: any) => chunk?.web)
            .filter((webItem: any) => webItem && webItem.uri);

          const uniqueCitations: { uri: string; title?: string }[] = [];
          const seenUris = new Set();
          for (const webItem of webCitations) {
            if (webItem && webItem.uri && !seenUris.has(webItem.uri)) {
              seenUris.add(webItem.uri);
              uniqueCitations.push(webItem);
            }
          }

          return (
            <motion.div 
              key="result" 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500" />
              
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100 dark:border-white/5">
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-md font-bold text-gray-900 dark:text-white leading-tight">
                    {lang === Language.VI ? 'Kết Quả Phân Tích Điểm Chuẩn' : 'Admission Score Analytics'}
                  </h4>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 dark:text-gray-500">
                    Real-time AI Grounding Active
                  </span>
                </div>
              </div>

              <div className="prose prose-indigo dark:prose-invert max-w-none markdown-body mb-6">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {aiResult}
                </ReactMarkdown>
              </div>

              {uniqueCitations.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
                  <div className="flex items-center gap-2 mb-4 text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
                    <span>
                      {lang === Language.VI 
                        ? "Nguồn thông tin xác thực thời gian thực:" 
                        : "Verified live citations referenced by AI:"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {uniqueCitations.map((cit, idx) => (
                      <a
                        key={idx}
                        href={cit.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-3 px-4 py-3 bg-gray-50 hover:bg-indigo-50/50 dark:bg-white/[0.02] dark:hover:bg-indigo-950/20 text-xs text-gray-700 dark:text-gray-300 rounded-xl border border-gray-200/60 dark:border-white/5 transition-all duration-200 font-medium group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Globe className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 flex-shrink-0" />
                          <span className="truncate pr-1 font-semibold text-gray-800 dark:text-gray-200">{cit.title || cit.uri}</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-500 flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })()}

        {!aiResult && !isSearching && !error && (
          <motion.div 
            key="empty" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="w-full space-y-4"
          >
            <div className="flex items-center justify-between pl-1">
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <Landmark className="w-5 h-5 text-indigo-500" />
                <span>{lang === Language.VI ? 'Điểm chuẩn tham khảo tiêu biểu' : 'Featured Baseline Scores'}</span>
              </h3>
              <span className="text-xs font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-lg">
                {lang === Language.VI ? 'Dữ liệu: Năm 2023' : 'Year: 2023'}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {MOCK_DATA.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-white/10 rounded-2xl p-5 hover:border-indigo-400 dark:hover:border-indigo-800 transition-all shadow-sm hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 dark:text-white text-md">
                          {item.name}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400">
                          {item.type}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                        {item.major}
                      </p>
                      <div className="flex gap-1.5 flex-wrap pt-1">
                        {item.group.split(',').map((gp) => (
                          <span key={gp} className="text-[10px] font-mono font-bold bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded border border-gray-100 dark:border-white/5">
                            {gp.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-gray-100 dark:border-white/5">
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-medium md:hidden">
                      {lang === Language.VI ? 'Điểm chuẩn:' : 'Score:'}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-2xl font-black text-gray-950 dark:text-white leading-tight">
                          {item.score}
                        </div>
                        <span className="text-[9px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold">
                          {lang === Language.VI ? 'Điểm xét tuyển' : 'Admission Point'}
                        </span>
                      </div>
                      <div className="p-1 rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-500">
                        <Star className="w-5 h-5 fill-current" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

