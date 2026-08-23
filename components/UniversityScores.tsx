import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Language } from '../types';
import { searchUniversityScores } from '../services/geminiService';
import { InlineGuide } from './InlineGuide';
import { 
  Globe, ExternalLink, ShieldCheck, Search, GraduationCap, 
  RefreshCw, Sparkles, AlertCircle, RotateCcw, CheckCircle2, Copy
} from 'lucide-react';
import { LuxuryAiThinking } from './SkeletonLoader';

const QUICK_CHIPS = [
  'Đại học Bách Khoa Hà Nội',
  'Đại học Ngoại Thương',
  'Đại học Kinh tế Quốc dân',
  'Đại học Y Hà Nội',
  'Đại học Bách Khoa TP.HCM',
  'Ngành Công nghệ Thông tin (IT)'
];

export const UniversityScores = ({ lang, t, Icons }: { lang: Language, t: any, Icons: any }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchedTerm, setSearchedTerm] = useState('Đại học Bách Khoa, Ngoại Thương, Kinh tế Quốc dân');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [groundingMetadata, setGroundingMetadata] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
            ? 'Hệ thống tra cứu điểm chuẩn THPT, phân tích tổ hợp xét tuyển và đưa ra đánh giá cơ hội trúng tuyển thời gian thực từ CareerGuide AI.' 
            : 'Track admission thresholds, analyze exam code combinations, and receive real-time match forecasts from CareerGuide AI.'}
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
            onClick={() => handleSearch()}
            disabled={isSearching}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 text-sm md:text-base flex items-center gap-2 shrink-0 shadow-md hover:shadow-indigo-600/10 cursor-pointer"
          >
            {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{isSearching ? (lang === Language.VI ? 'Đang tra...' : 'Searching...') : (lang === Language.VI ? 'Tra cứu AI' : 'AI Search')}</span>
          </button>
        </div>

        {/* Quick Search Chips */}
        <div className="flex items-center gap-2 mt-3 flex-wrap px-1">
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            {lang === Language.VI ? 'Gợi ý tìm kiếm AI:' : 'AI Suggestions:'}
          </span>
          {QUICK_CHIPS.map((chip, idx) => (
            <button
              key={`chip-${idx}`}
              onClick={() => handleSearch(chip)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-100 hover:bg-indigo-50 dark:bg-white/5 dark:hover:bg-indigo-950/40 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-gray-200/80 dark:border-white/10 transition-all cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

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
              title={lang === Language.VI ? `CareerGuide AI Đang Tra Cứu Điểm Chuẩn Cho "${searchedTerm}"...` : `CareerGuide AI is Querying Official Admission Scores for "${searchedTerm}"...`}
              subtitle={lang === Language.VI ? "Kết nối Google Search Grounding thời gian thực để trích xuất điểm chuẩn, tổ hợp xét tuyển và chỉ tiêu mới nhất." : "Connecting real-time Google Search Grounding to extract verified cutoff scores and admission criteria."}
              badge="CareerGuide AI"
              themeColor="indigo"
              stageSteps={
                lang === Language.VI ? [
                  `Quét radar cổng tuyển sinh & Đề án tuyển sinh "${searchedTerm}"`,
                  "Đối chiếu điểm chuẩn các năm gần nhất & biến động tổ hợp môn",
                  "Xác thực nguồn tin qua Google Search Grounding thời gian thực",
                  "Hoàn thiện báo cáo chiến lược xếp thứ tự nguyện vọng"
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
            <h4 className="text-base font-bold">{lang === Language.VI ? 'Không thể tải dữ liệu điểm chuẩn' : 'Admission Query Failed'}</h4>
            <p className="text-xs text-rose-600 dark:text-rose-400 max-w-md mx-auto leading-relaxed">{error}</p>
            <button
              onClick={() => handleSearch()}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === Language.VI ? 'Thử lại ngay' : 'Retry Now'}</span>
            </button>
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
              className="w-full space-y-6"
            >
              {/* Premium Redesigned Header Banner */}
              <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-indigo-500/20">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white text-xs font-black uppercase tracking-wider backdrop-blur-md">
                      <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                      <span>CareerGuide AI • Admission Report</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                      {searchedTerm.toUpperCase()}
                    </h3>
                    <p className="text-xs sm:text-sm text-indigo-200/80 max-w-xl">
                      {lang === Language.VI 
                        ? 'Dữ liệu điểm chuẩn, tổ hợp môn thi & chiến lược phân bổ nguyện vọng đã được tổng hợp và đối soát thời gian thực.' 
                        : 'Verified admission metrics, exam groups, and preference allocation strategy grounded in real-time.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={copyResult}
                      className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer text-white shadow-sm"
                    >
                      {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? (lang === Language.VI ? 'Đã sao chép' : 'Copied') : (lang === Language.VI ? 'Sao chép' : 'Copy')}</span>
                    </button>
                    <button
                      onClick={() => handleSearch()}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer text-white shadow-lg shadow-indigo-600/30"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>{lang === Language.VI ? 'Cập nhật lại' : 'Refresh'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Main Content Layout with Refined Markdown Styling */}
              <div className="bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl">
                <div className="prose prose-indigo dark:prose-invert max-w-none 
                  prose-headings:font-black prose-headings:tracking-tight 
                  prose-h1:text-xl sm:prose-h1:text-2xl prose-h1:border-b prose-h1:pb-3 prose-h1:border-gray-200 dark:prose-h1:border-white/10
                  prose-h2:text-lg sm:prose-h2:text-xl prose-h2:text-indigo-600 dark:prose-h2:text-indigo-400 prose-h2:mt-6
                  prose-h3:text-base prose-h3:text-gray-800 dark:prose-h3:text-gray-200
                  prose-p:text-sm sm:prose-p:text-base prose-p:leading-relaxed prose-p:text-gray-700 dark:prose-p:text-gray-300
                  prose-table:w-full prose-table:border-collapse prose-table:my-4
                  prose-th:bg-gray-100 dark:prose-th:bg-white/5 prose-th:p-3 prose-th:text-xs prose-th:font-black prose-th:uppercase prose-th:tracking-wider prose-th:border prose-th:border-gray-200 dark:prose-th:border-white/10
                  prose-td:p-3 prose-td:text-xs sm:prose-td:text-sm prose-td:border prose-td:border-gray-200 dark:prose-td:border-white/10
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

                {/* Verified Grounding Citations & Direct Link Portals */}
                <div className="mt-10 pt-6 border-t border-gray-100 dark:border-white/5 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>
                      {lang === Language.VI 
                        ? "Nguồn thông tin & Link đối chiếu trực tiếp:" 
                        : "Verified Sources & Direct Reference Links:"}
                    </span>
                  </div>

                  {uniqueCitations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
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
                            className="flex items-center justify-between gap-3 px-4 py-3 bg-gray-50 hover:bg-indigo-50/50 dark:bg-white/[0.02] dark:hover:bg-indigo-950/20 text-xs text-gray-700 dark:text-gray-300 rounded-xl border border-gray-200/80 dark:border-white/10 transition-all duration-200 font-medium group cursor-pointer shadow-sm hover:border-indigo-300"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center shrink-0">
                                <Globe className="w-3.5 h-3.5" />
                              </div>
                              <span className="truncate pr-1 font-semibold text-gray-800 dark:text-gray-200">
                                {cit.title || cit.uri}
                              </span>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-500 shrink-0" />
                          </a>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <a
                        href="https://thisinh.thitotnghiepthpt.edu.vn"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-2 px-3.5 py-2.5 bg-gray-50 hover:bg-indigo-50/50 dark:bg-white/[0.02] dark:hover:bg-indigo-950/20 text-xs text-gray-700 dark:text-gray-300 rounded-xl border border-gray-200/80 dark:border-white/10 transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Globe className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="truncate font-semibold text-gray-800 dark:text-gray-200">Cổng Tuyển sinh Bộ GD&ĐT</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-500 shrink-0" />
                      </a>
                      <a
                        href="https://vnexpress.net/giao-duc/tuyen-sinh"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-2 px-3.5 py-2.5 bg-gray-50 hover:bg-indigo-50/50 dark:bg-white/[0.02] dark:hover:bg-indigo-950/20 text-xs text-gray-700 dark:text-gray-300 rounded-xl border border-gray-200/80 dark:border-white/10 transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Globe className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="truncate font-semibold text-gray-800 dark:text-gray-200">VnExpress Tuyển sinh</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-500 shrink-0" />
                      </a>
                      <a
                        href="https://tuoitre.vn/giao-duc.htm"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-2 px-3.5 py-2.5 bg-gray-50 hover:bg-indigo-50/50 dark:bg-white/[0.02] dark:hover:bg-indigo-950/20 text-xs text-gray-700 dark:text-gray-300 rounded-xl border border-gray-200/80 dark:border-white/10 transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Globe className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="truncate font-semibold text-gray-800 dark:text-gray-200">Tuổi Trẻ Giáo dục</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-500 shrink-0" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })()}

        {!aiResult && !isSearching && !error && (
          <motion.div 
            key="empty" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="w-full bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-white/10 rounded-3xl p-8 text-center space-y-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center mx-auto shadow-md">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-950 dark:text-white">
              {lang === Language.VI ? 'Tra cứu điểm chuẩn đại học bằng AI thời gian thực' : 'Real-time AI University Admission Search'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
              {lang === Language.VI 
                ? 'Nhập tên trường, ngành học hoặc chọn các từ khóa gợi ý phía trên để CareerGuide AI truy vấn dữ liệu điểm chuẩn mới nhất cùng trích dẫn nguồn uy tín.' 
                : 'Enter target school, major, or click suggestion chips above to let CareerGuide AI pull live cutoff metrics.'}
            </p>
            <div className="flex justify-center pt-2">
              <button
                onClick={() => handleSearch('Điểm chuẩn các trường Đại học Bách Khoa, Ngoại Thương, Kinh tế Quốc dân 2024-2025')}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg inline-flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{lang === Language.VI ? 'Xem tổng hợp điểm chuẩn các trường Top' : 'Search Top University Cutoff Scores'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


