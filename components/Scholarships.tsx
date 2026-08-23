import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, UserProfile } from '../types';
import { TRANSLATIONS } from '../constants';
import { 
  Loader2, 
  Search, 
  Award, 
  Landmark, 
  Sparkles, 
  ArrowUpRight, 
  Filter, 
  Copy, 
  Check, 
  Globe2, 
  Target,
  ExternalLink,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { searchScholarships } from '../services/geminiService';
import Markdown from 'react-markdown';
import { InlineGuide } from './InlineGuide';
import { LuxuryAiThinking } from './SkeletonLoader';

enum ScholarshipTab {
  AI_SEARCH = 'ai_search',
  CURATED = 'curated'
}

const REGION_FILTERS = [
  { id: 'all', label_vi: 'Tất cả khu vực', label_en: 'All Regions' },
  { id: 'vietnam', label_vi: '🇻🇳 Việt Nam', label_en: '🇻🇳 Vietnam' },
  { id: 'usa', label_vi: '🇺🇸 Mỹ & Canada', label_en: '🇺🇸 USA & Canada' },
  { id: 'uk_eu', label_vi: '🇬🇧 Anh & Châu Âu', label_en: '🇬🇧 UK & Europe' },
  { id: 'australia', label_vi: '🇦🇺 Úc & New Zealand', label_en: '🇦🇺 Australia & NZ' },
  { id: 'asia', label_vi: '🇯🇵 Nhật, Hàn & Singapore', label_en: '🇯🇵 Japan, Korea & SG' }
];

const DEGREE_FILTERS = [
  { id: 'all', label_vi: 'Tất cả bậc học', label_en: 'All Levels' },
  { id: 'bachelor', label_vi: '🎓 Đại học (Cử nhân)', label_en: '🎓 Undergraduate' },
  { id: 'master', label_vi: '📜 Thạc sĩ (Master)', label_en: '📜 Master' },
  { id: 'phd', label_vi: '🔬 Tiến sĩ (PhD)', label_en: '🔬 PhD / Research' },
  { id: 'exchange', label_vi: '✈️ Trao đổi & Khóa hè', label_en: '✈️ Exchange / Summer' }
];

const QUICK_PROMPTS = [
  {
    title_vi: '🌟 Top 5 Học bổng Toàn phần Du học Mỹ & Úc ngành CNTT / AI 2026',
    title_en: '🌟 Top 5 Full-Ride Scholarships for Computer Science & AI in USA & Australia 2026',
    query_vi: 'Top 5 học bổng toàn phần ngành Khoa học Máy tính và Trí tuệ Nhân tạo tại Mỹ và Úc năm 2026',
    query_en: 'Top 5 fully funded scholarships for Computer Science and AI in USA and Australia 2026'
  },
  {
    title_vi: '🇬🇧 Điều kiện & Tiêu chí Học bổng Chevening của Chính phủ Anh',
    title_en: '🇬🇧 UK Government Chevening Scholarship: Eligibility & Criteria',
    query_vi: 'Điều kiện xét tuyển, tiêu chí đánh giá và bí quyết ứng tuyển học bổng Chevening Vương Quốc Anh',
    query_en: 'Eligibility criteria, assessment standards and winning tips for UK Chevening Scholarships'
  },
  {
    title_vi: '🇻🇳 Học bổng Tài năng VinUni & RMIT Việt Nam: So sánh & Tiêu chí',
    title_en: '🇻🇳 VinUni & RMIT Vietnam Merit Scholarships: Comparison & Criteria',
    query_vi: 'Học bổng tài năng toàn phần và bán phần tại VinUniversity và RMIT Việt Nam',
    query_en: 'Full and partial merit scholarships at VinUniversity and RMIT Vietnam criteria comparison'
  },
  {
    title_vi: '🇯🇵 Học bổng Chính phủ Nhật Bản MEXT: Hướng dẫn từ A-Z',
    title_en: '🇯🇵 Japan MEXT Government Scholarship: Complete Roadmap from A-Z',
    query_vi: 'Hướng dẫn chuẩn bị hồ sơ xin học bổng MEXT Nhật Bản qua Đại sứ quán và tiến cử của trường',
    query_en: 'Complete roadmap and document checklist for Japan MEXT Government Scholarship'
  }
];

const CURATED_SCHOLARSHIPS = [
  {
    id: 's1',
    title_vi: 'Học bổng Toàn phần Fulbright (Thạc sĩ Hoa Kỳ)',
    title_en: 'Fulbright Foreign Student Program (USA)',
    provider_vi: 'Bộ Ngoại giao Hoa Kỳ',
    provider_en: 'US Department of State',
    value_vi: 'Toàn phần 100% (Học phí, sinh hoạt phí, vé máy bay & bảo hiểm y tế)',
    value_en: '100% Fully Funded (Tuition, monthly stipend, airfare & health insurance)',
    eligible_vi: 'Công dân Việt Nam, tốt nghiệp Đại học GPA ≥ 7.0/10, ít nhất 2 năm kinh nghiệm làm việc, IELTS ≥ 6.5',
    eligible_en: 'Vietnamese citizen, Bachelor GPA ≥ 3.0/4.0, min 2 years of work experience, IELTS ≥ 6.5',
    type: 'Thạc sĩ Quốc tế',
    country: 'Hoa Kỳ',
    deadline: 'Hàng năm (Tháng 12 - Tháng 4)',
    color: 'from-blue-600 to-indigo-700',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    textColor: 'text-blue-600 dark:text-blue-400'
  },
  {
    id: 's2',
    title_vi: 'Học bổng Khoa học Công nghệ Vingroup (Thạc sĩ & Tiến sĩ Quốc tế)',
    title_en: 'Vingroup Science & Technology Scholarship Program',
    provider_vi: 'Tập đoàn Vingroup & VinUniversity',
    provider_en: 'Vingroup Group & VinUniversity',
    value_vi: 'Toàn phần cho hệ Thạc sĩ / Tiến sĩ du học tại các trường Đại học Top 100 thế giới',
    value_en: 'Fully Funded Master/PhD study programs abroad at top 100 global universities',
    eligible_vi: 'Sinh viên xuất sắc ngành STEM, AI, Công nghệ Sinh học, Khoa học Máy tính, cam kết đóng góp cho KHCN Việt Nam',
    eligible_en: 'Outstanding STEM/AI students committed to contributing to Vietnamese science & tech',
    type: 'STEM Research',
    country: 'Toàn cầu / Global',
    deadline: 'Đợt 1 (Tháng 4) & Đợt 2 (Tháng 9)',
    color: 'from-amber-500 to-rose-600',
    bgColor: 'bg-amber-50 dark:bg-amber-950/20',
    textColor: 'text-amber-600 dark:text-amber-400'
  },
  {
    id: 's3',
    title_vi: 'Học bổng Chính phủ Australia (Australia Awards Scholarships - AAS)',
    title_en: 'Australia Awards Scholarships (AAS)',
    provider_vi: 'Bộ Ngoại giao và Thương mại Australia (DFAT)',
    provider_en: 'Australian Government (DFAT)',
    value_vi: 'Toàn phần bao gồm 100% học phí, trợ cấp ban đầu 5.000 AUD và sinh hoạt phí định kỳ',
    value_en: 'Full Tuition, one-off 5,000 AUD establishment allowance, and monthly living stipend',
    eligible_vi: 'Ứng viên ngành phát triển bền vững, kinh tế, biến đổi khí hậu, quản trị, y tế công cộng; IELTS ≥ 6.5',
    eligible_en: 'Applicants in sustainability, economics, climate change, governance, health; IELTS ≥ 6.5',
    type: 'Chính phủ',
    country: 'Australia',
    deadline: 'Tháng 2 - Tháng 4 hàng năm',
    color: 'from-emerald-500 to-teal-700',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
    textColor: 'text-emerald-600 dark:text-emerald-400'
  },
  {
    id: 's4',
    title_vi: 'Học bổng Tài năng VinUniversity (Lên tới 100% + Sinh hoạt phí)',
    title_en: 'VinUniversity President & Dean Merit Scholarships',
    provider_vi: 'Trường Đại học VinUni (Hợp tác Cornell & UPenn)',
    provider_en: 'VinUniversity (in collaboration with Cornell & UPenn)',
    value_vi: '50% - 100% Học phí toàn khóa học + Trợ cấp sinh hoạt 35 triệu/năm cho sinh viên xuất sắc',
    value_en: '50% - 100% Full 4-year tuition + Living allowance for top tier students',
    eligible_vi: 'Học sinh THPT có thành tích học tập vượt trội, năng lực tư duy (A-A-C-C criteria), IELTS ≥ 6.5',
    eligible_en: 'High school graduates with exceptional academic records, leadership, IELTS ≥ 6.5',
    type: 'Cử nhân ĐH',
    country: 'Việt Nam',
    deadline: 'Kỳ tuyển sinh Sớm & Thường xuyên',
    color: 'from-purple-600 to-pink-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    textColor: 'text-purple-600 dark:text-purple-400'
  }
];

export const Scholarships = ({
  language,
  userProfile
}: {
  language: Language;
  userProfile?: UserProfile | null;
}) => {
  const t = TRANSLATIONS[language];
  const isVi = language === Language.VI;
  
  const [activeTab, setActiveTab] = useState<ScholarshipTab>(ScholarshipTab.AI_SEARCH);
  
  // Search State
  const [query, setQuery] = useState('');
  const [searchedQuery, setSearchedQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedDegree, setSelectedDegree] = useState('all');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<string>('');
  const [groundingMetadata, setGroundingMetadata] = useState<any | null>(null);
  const [copiedResult, setCopiedResult] = useState(false);

  const handleSearch = async (overrideQuery?: string) => {
    let finalQuery = (overrideQuery !== undefined ? overrideQuery : query).trim();
    if (!finalQuery) return;

    if (overrideQuery !== undefined) {
      setQuery(overrideQuery);
    }
    setSearchedQuery(finalQuery);

    // Append filter context if relevant
    let filterContext = '';
    if (selectedRegion !== 'all') {
      const reg = REGION_FILTERS.find(r => r.id === selectedRegion);
      if (reg) filterContext += ` tại khu vực ${isVi ? reg.label_vi : reg.label_en}`;
    }
    if (selectedDegree !== 'all') {
      const deg = DEGREE_FILTERS.find(d => d.id === selectedDegree);
      if (deg) filterContext += ` cho bậc học ${isVi ? deg.label_vi : deg.label_en}`;
    }

    const searchQueryWithFilters = `${finalQuery}${filterContext}`;

    setIsSearching(true);
    setSearchResults('');
    setGroundingMetadata(null);
    setActiveTab(ScholarshipTab.AI_SEARCH);
    
    try {
      const result = await searchScholarships(searchQueryWithFilters, language, userProfile);
      if (result && typeof result === 'object' && 'text' in result) {
        setSearchResults(result.text || '');
        setGroundingMetadata(result.groundingMetadata || null);
      } else {
        setSearchResults(typeof result === 'string' ? result : '');
        setGroundingMetadata(null);
      }
    } catch (e: any) {
      console.error(e);
      setSearchResults(
        isVi 
          ? "Hệ thống CareerGuide AI đang tạm thời đồng bộ dữ liệu học bổng. Vui lòng nhấn Tìm kiếm lại sau giây lát." 
          : "CareerGuide AI is currently synchronizing scholarship databases. Please retry shortly."
      );
    } finally {
      setIsSearching(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedResult(true);
    setTimeout(() => setCopiedResult(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full max-w-5xl mx-auto flex flex-col items-stretch px-4 md:px-0 pb-16"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-emerald-500/10 border border-indigo-200 dark:border-indigo-800/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-3 tracking-wide uppercase shadow-xs">
          <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
          <span>{isVi ? 'Tra Cứu Học Bổng & Hỗ Trợ Tài Chính AI' : 'Scholarship & Financial Aid Intelligence'}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-950 dark:text-white mb-3">
          {t.scholarships}
        </h1>
        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          {isVi 
            ? 'Tra cứu và tìm kiếm các chương trình học bổng toàn phần, bán phần và hỗ trợ tài chính với Trí tuệ Nhân tạo CareerGuide AI.' 
            : 'Find 100% fully funded scholarships and financial aid opportunities powered by CareerGuide AI.'}
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-center gap-2 mb-8 bg-gray-100/80 dark:bg-white/[0.04] p-1.5 rounded-2xl border border-gray-200 dark:border-white/10 max-w-md mx-auto shadow-inner">
        <button
          onClick={() => setActiveTab(ScholarshipTab.AI_SEARCH)}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
            activeTab === ScholarshipTab.AI_SEARCH
              ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>{isVi ? '🔍 Tra Cứu & Lọc AI' : '🔍 AI Search & Filters'}</span>
        </button>

        <button
          onClick={() => setActiveTab(ScholarshipTab.CURATED)}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
            activeTab === ScholarshipTab.CURATED
              ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>{isVi ? '🏆 Học Bổng Tiêu Biểu' : '🏆 Curated Top Programs'}</span>
        </button>
      </div>

      {/* TAB 1: AI SEARCH & LIVE MATCHING */}
      {activeTab === ScholarshipTab.AI_SEARCH && (
        <div className="space-y-6">
          <InlineGuide 
            sectionKey="scholarships"
            lang={isVi ? 'vi' : 'en'}
            title={isVi ? "💡 Cách tra cứu học bổng hiệu quả với AI" : "💡 How to Discover Scholarships with AI"}
            steps={isVi ? [
              "Nhập ngành học, trường đại học hoặc đất nước bạn mơ ước (vd: Học bổng toàn phần ngành Trí tuệ Nhân tạo tại Úc).",
              "Chọn bộ lọc khu vực và bậc học bên dưới để AI thu hẹp danh sách mục tiêu chính xác.",
              "AI sẽ phân tích điều kiện tuyển sinh, giá trị tài trợ và các mốc thời gian nộp hồ sơ thực tế."
            ] : [
              "Type your dream major, university, or destination (e.g., Fully funded AI master scholarships Australia).",
              "Apply regional and degree level filters below for precision matching.",
              "AI audits eligibility standards, funding values, and upcoming application deadlines."
            ]}
          />

          {/* Search Bar */}
          <div className="w-full relative group">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 opacity-20 dark:opacity-30 blur-lg group-hover:opacity-35 transition-all duration-300" />
            <div className="relative flex items-center bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden pr-2">
              <div className="pl-5 text-indigo-500 flex-shrink-0">
                <Search className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={isVi ? "Nhập ngành học, trường hoặc học bổng (vd: Học bổng STEM Úc, VinUni, Fulbright...)" : "Search by major, grant name or country (e.g. Fulbright USA, VinUni, STEM Australia)..."}
                className="w-full bg-transparent border-0 py-4.5 pl-3 pr-4 text-gray-950 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-0 text-sm md:text-base font-medium"
              />
              <button
                onClick={() => handleSearch()}
                disabled={isSearching || !query.trim()}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold px-6 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 text-xs md:text-sm flex items-center gap-2 shrink-0 shadow-md cursor-pointer"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{isSearching ? (isVi ? 'AI Đang Tra Cứu...' : 'AI Scanning...') : (isVi ? 'Tra Cứu Học Bổng' : 'Search Scholarships')}</span>
              </button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="space-y-3 bg-white dark:bg-[#0c0c0c] p-4 rounded-2xl border border-gray-200 dark:border-white/5 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5 text-indigo-500" />
              <span>{isVi ? 'Bộ lọc nhanh AI' : 'AI Filter Presets'}</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-gray-400 mr-1">{isVi ? 'Khu vực:' : 'Region:'}</span>
              {REGION_FILTERS.map(f => (
                <button
                  key={f.id}
                  onClick={() => {
                    setSelectedRegion(f.id);
                    if (query.trim()) handleSearch();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    selectedRegion === f.id
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-300 dark:border-indigo-700 shadow-xs'
                      : 'bg-gray-50 dark:bg-white/[0.02] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/5 hover:border-gray-300'
                  }`}
                >
                  {isVi ? f.label_vi : f.label_en}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-semibold text-gray-400 mr-1">{isVi ? 'Bậc học:' : 'Degree:'}</span>
              {DEGREE_FILTERS.map(f => (
                <button
                  key={f.id}
                  onClick={() => {
                    setSelectedDegree(f.id);
                    if (query.trim()) handleSearch();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    selectedDegree === f.id
                      ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-700 shadow-xs'
                      : 'bg-gray-50 dark:bg-white/[0.02] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/5 hover:border-gray-300'
                  }`}
                >
                  {isVi ? f.label_vi : f.label_en}
                </button>
              ))}
            </div>
          </div>

          {/* Quick AI Search Suggestions */}
          {!searchResults && !isSearching && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 pl-1 text-xs font-extrabold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{isVi ? 'Gợi ý tra cứu phổ biến từ cộng đồng' : 'Trending Scholarship Queries'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearch(isVi ? prompt.query_vi : prompt.query_en)}
                    className="p-3.5 text-left bg-white dark:bg-[#0c0c0c] hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 border border-gray-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-700 rounded-2xl transition-all shadow-xs group cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {isVi ? prompt.title_vi : prompt.title_en}
                      </p>
                      <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* AI Search Loading State */}
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
                  variant="scholarship"
                  title={isVi ? `CareerGuide AI Đang Tìm Kiếm & So Khớp Học Bổng Cho "${searchedQuery || query}"...` : `CareerGuide AI is Scanning & Matching Scholarships for "${searchedQuery || query}"...`}
                  subtitle={isVi ? `Rà soát các quỹ học bổng Chính phủ, Tập đoàn & Tổ chức Quốc tế phù hợp với mục tiêu và hồ sơ học thuật.` : `Searching government, corporate, and university grant databases tailored to your academic profile.`}
                  badge="CareerGuide AI"
                  themeColor="emerald"
                  stageSteps={
                    isVi ? [
                      `Rà soát kho học bổng toàn cầu cho từ khóa "${searchedQuery || query}"`,
                      "Phân tích điều kiện xét tuyển (GPA, IELTS/TOEFL, tiêu chí)",
                      "Kiểm tra giá trị học bổng (Toàn phần 100%, bán phần, trợ cấp sinh hoạt)",
                      "Tổng hợp danh mục học bổng khả thi nhất kèm mốc thời gian nộp đơn"
                    ] : [
                      `Querying global scholarship databases for "${searchedQuery || query}"`,
                      "Auditing eligibility criteria (GPA, English proficiency)",
                      "Evaluating funding value (Full tuition, partial, living stipends)",
                      "Compiling targeted scholarship list with application timelines"
                    ]
                  }
                />
              </motion.div>
            )}

            {/* AI Search Results */}
            {searchResults && !isSearching && (() => {
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
                  className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden space-y-6"
                >
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight">
                          {isVi ? `Kết Quả Học Bổng AI Đề Xuất Cho: "${searchedQuery}"` : `AI-Matched Scholarship Results: "${searchedQuery}"`}
                        </h4>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          {isVi ? 'Dữ liệu thời gian thực từ CareerGuide AI' : 'Live Data from CareerGuide AI'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(searchResults)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        {copiedResult ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedResult ? (isVi ? 'Đã sao chép' : 'Copied') : (isVi ? 'Sao chép' : 'Copy')}</span>
                      </button>
                    </div>
                  </div>

                  <div className="markdown-body text-sm md:text-base leading-relaxed text-gray-800 dark:text-gray-200">
                    <Markdown
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
                      {searchResults}
                    </Markdown>
                  </div>

                  {/* Grounding & Official Portals Link Section */}
                  <div className="pt-6 border-t border-gray-100 dark:border-white/5 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>
                        {isVi 
                          ? "Cổng nộp đơn & Nguồn học bổng trực tiếp:" 
                          : "Official Application Portals & References:"}
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
                              key={cit.uri || `sch-cit-${idx}`}
                              href={linkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between gap-3 px-4 py-3 bg-gray-50 hover:bg-indigo-50/50 dark:bg-white/[0.02] dark:hover:bg-indigo-950/20 text-xs text-gray-700 dark:text-gray-300 rounded-xl border border-gray-200/80 dark:border-white/10 transition-all duration-200 font-medium group cursor-pointer shadow-sm hover:border-indigo-300"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
                                  <Globe className="w-3.5 h-3.5" />
                                </div>
                                <span className="truncate pr-1 font-semibold text-gray-800 dark:text-gray-200">
                                  {cit.title || cit.uri}
                                </span>
                              </div>
                              <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-500 shrink-0" />
                            </a>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <a
                          href="https://www.chevening.org"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between gap-2 px-3.5 py-2.5 bg-gray-50 hover:bg-indigo-50/50 dark:bg-white/[0.02] dark:hover:bg-indigo-950/20 text-xs text-gray-700 dark:text-gray-300 rounded-xl border border-gray-200/80 dark:border-white/10 transition-all duration-200 group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate font-semibold text-gray-800 dark:text-gray-200">UK Chevening Portal</span>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-500 shrink-0" />
                        </a>
                        <a
                          href="https://vn.usembassy.gov/education-culture/fulbright-program-vietnam"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between gap-2 px-3.5 py-2.5 bg-gray-50 hover:bg-indigo-50/50 dark:bg-white/[0.02] dark:hover:bg-indigo-950/20 text-xs text-gray-700 dark:text-gray-300 rounded-xl border border-gray-200/80 dark:border-white/10 transition-all duration-200 group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate font-semibold text-gray-800 dark:text-gray-200">US Fulbright Vietnam</span>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-500 shrink-0" />
                        </a>
                        <a
                          href="https://vinuni.edu.vn/admission"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between gap-2 px-3.5 py-2.5 bg-gray-50 hover:bg-indigo-50/50 dark:bg-white/[0.02] dark:hover:bg-indigo-950/20 text-xs text-gray-700 dark:text-gray-300 rounded-xl border border-gray-200/80 dark:border-white/10 transition-all duration-200 group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate font-semibold text-gray-800 dark:text-gray-200">VinUni Scholarships</span>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-500 shrink-0" />
                        </a>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>
      )}

      {/* TAB 2: CURATED PRESTIGIOUS SCHOLARSHIPS */}
      {activeTab === ScholarshipTab.CURATED && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pl-1 mb-2">
            <div className="flex items-center gap-2">
              <Landmark className="w-5 h-5 text-indigo-500" />
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
                {isVi ? 'Các chương trình học bổng toàn phần danh giá nhất' : 'Prestigious Global & Vietnam Scholarships'}
              </h3>
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {isVi ? 'Nhấn thẻ để AI tra cứu chi tiết' : 'Click to run deep AI search'}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {CURATED_SCHOLARSHIPS.map((item) => (
              <div 
                key={item.id}
                onClick={() => handleSearch(isVi ? item.title_vi : item.title_en)}
                className="bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-white/10 rounded-2xl p-6 hover:border-indigo-400 dark:hover:border-indigo-800 transition-all shadow-sm hover:shadow-md flex flex-col justify-between relative overflow-hidden group cursor-pointer"
              >
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${item.color}`} />
                
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-md">
                          {item.type}
                        </span>
                        <span className="text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-md">
                          📍 {item.country}
                        </span>
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-md">
                          ⏳ {item.deadline}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-gray-950 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors pt-1 leading-snug">
                        {isVi ? item.title_vi : item.title_en}
                      </h4>
                      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500">
                        {isVi ? `Quỹ / Đơn vị cấp: ${item.provider_vi}` : `Sponsor: ${item.provider_en}`}
                      </p>
                    </div>
                    <div className={`p-2.5 rounded-xl ${item.bgColor} ${item.textColor} shrink-0 group-hover:scale-110 transition-transform`}>
                      <Award className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-white/5 text-xs">
                    <div>
                      <span className="block font-bold text-gray-400 uppercase tracking-wider text-[9px] mb-1">
                        {isVi ? 'Giá trị học bổng' : 'Scholarship Value'}
                      </span>
                      <p className="font-bold text-gray-800 dark:text-gray-200 leading-relaxed">
                        {isVi ? item.value_vi : item.value_en}
                      </p>
                    </div>
                    <div>
                      <span className="block font-bold text-gray-400 uppercase tracking-wider text-[9px] mb-1">
                        {isVi ? 'Điều kiện ứng tuyển cơ bản' : 'Eligibility Baseline'}
                      </span>
                      <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                        {isVi ? item.eligible_vi : item.eligible_en}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      {isVi ? 'Bấm để yêu cầu AI tra cứu & phân tích chi tiết' : 'Click to run deep AI search'}
                    </span>
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
