import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Loader2, Search, GraduationCap, Award, Landmark, Calendar, Sparkles, ShieldCheck, ArrowUpRight, HelpCircle, AlertCircle, Heart } from 'lucide-react';
import { searchScholarships } from '../services/geminiService';
import Markdown from 'react-markdown';
import { InlineGuide } from './InlineGuide';

const CURATED_SCHOLARSHIPS = [
  {
    id: 's1',
    title_vi: 'Học bổng Fulbright (Thạc sĩ Hoa Kỳ)',
    title_en: 'Fulbright Foreign Student Program (USA)',
    provider_vi: 'Bộ Ngoại giao Hoa Kỳ',
    provider_en: 'US Department of State',
    value_vi: 'Toàn phần (Học phí, sinh hoạt phí, vé máy bay & bảo hiểm)',
    value_en: 'Fully Funded (Tuition, stipend, airfare & insurance)',
    eligible_vi: 'Công dân Việt Nam, đã tốt nghiệp Đại học, ít nhất 2 năm kinh nghiệm làm việc',
    eligible_en: 'Vietnamese citizen, Bachelor holder, min 2 years of work experience',
    type: 'Graduate',
    color: 'from-blue-600 to-indigo-700',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    textColor: 'text-blue-600 dark:text-blue-400'
  },
  {
    id: 's2',
    title_vi: 'Học bổng Vingroup Khoa học Công nghệ',
    title_en: 'Vingroup Science & Technology Scholarship',
    provider_vi: 'Tập đoàn Vingroup & VinUniversity',
    provider_en: 'Vingroup Group & VinUniversity',
    value_vi: 'Toàn phần cho hệ Thạc sĩ / Tiến sĩ du học tại các trường xuất sắc thế giới',
    value_en: 'Fully Funded Master/PhD study programs abroad at top global universities',
    eligible_vi: 'Sinh viên xuất sắc ngành STEM, cam kết đóng góp cho KHCN Việt Nam',
    eligible_en: 'Excellent STEM student, committed to contributing to Vietnamese science',
    type: 'STEM Research',
    color: 'from-amber-500 to-rose-600',
    bgColor: 'bg-amber-50 dark:bg-amber-950/20',
    textColor: 'text-amber-600 dark:text-amber-400'
  },
  {
    id: 's3',
    title_vi: 'Học bổng Chính phủ Australia (AAS)',
    title_en: 'Australia Awards Scholarships (AAS)',
    provider_vi: 'Chính phủ Australia',
    provider_en: 'Australian Government',
    value_vi: 'Toàn phần bao gồm học phí, trợ cấp ban đầu và sinh hoạt phí định kỳ',
    value_en: 'Full Tuition, one-off establishment allowance, and monthly stipend',
    eligible_vi: 'Ứng viên ngành phát triển bền vững, kinh tế, biến đổi khí hậu, quản trị',
    eligible_en: 'Applicants in sustainability, economics, climate change, governance',
    type: 'Development',
    color: 'from-emerald-500 to-teal-700',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
    textColor: 'text-emerald-600 dark:text-emerald-400'
  }
];

export const Scholarships = ({
  language,
  userProfile
}: {
  language: Language;
  userProfile: any;
}) => {
  const t = TRANSLATIONS[language];
  const isVi = language === Language.VI;
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<string>('');

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    setResults('');
    
    try {
      const resultText = await searchScholarships(query, language, userProfile);
      setResults(resultText);
    } catch (e: any) {
      console.error(e);
      setResults(isVi ? "Xin lỗi, tôi không thể tìm thấy học bổng lúc này. Vui lòng thử lại." : "Sorry, I couldn't find scholarships right now. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full max-w-5xl mx-auto flex flex-col items-stretch px-4 md:px-0"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-3 tracking-wide uppercase">
          <Award className="w-4 h-4" />
          <span>{isVi ? 'Hỗ trợ tài chính & Học bổng' : 'Scholarships & Grants'}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-950 dark:text-white mb-3">
          {t.scholarships}
        </h1>
        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          {t.scholarshipDesc}
        </p>
      </div>

      <InlineGuide 
        sectionKey="scholarships"
        lang={language === Language.VI ? 'vi' : 'en'}
        title={language === Language.VI ? "💡 Hướng dẫn săn học bổng" : "💡 Scholarships Guide"}
        steps={language === Language.VI ? [
          "Nhập từ khóa gồm ngành học, hệ đào tạo hoặc quốc gia mơ ước (vd: Học bổng du học sinh ngành Sinh học Canada).",
          "Hệ thống sẽ dùng AI kết nối internet thời gian thực để rà soát danh sách học bổng còn hiệu lực đăng ký.",
          "Kết quả trả về tự ứng hợp cấu trúc hồ sơ hiện tại của bạn, hiển thị cụ thể điều kiện xét tuyển, hồ sơ chuẩn bị và giá trị tài trợ."
        ] : [
          "Input keywords specifying your study major, region or grade levels (e.g., Undergraduate Data Science grants Sweden).",
          "AI scans web sources in real-time to find valid open scholarships fitting your search query.",
          "The returned list matches your active profile metrics, specifying full eligibility standards, required documents, and grant values."
        ]}
      />

      <div className="w-full relative mb-10 group">
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20 dark:opacity-30 blur-lg group-hover:opacity-30 dark:group-hover:opacity-45 transition-all duration-300" />
        <div className="relative flex items-center bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl transition-all duration-300 overflow-hidden pr-2">
          <div className="pl-5 text-gray-400 dark:text-gray-500 flex-shrink-0">
            <Search className="w-5 h-5" />
          </div>
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={t.scholarshipSearchPlaceholder}
            className="w-full bg-transparent border-0 py-4.5 pl-3 pr-4 text-gray-950 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-0 text-base md:text-lg font-medium"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching || !query.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 text-sm md:text-base flex items-center gap-2 shrink-0 shadow-md hover:shadow-indigo-600/10"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{isSearching ? (isVi ? 'Đang lọc...' : 'Searching...') : (isVi ? 'Tìm học bổng' : 'Find')}</span>
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
              {isVi ? "Đang dò quét & kết nối nguồn lực học bổng thời gian thực..." : "Scanning & matching global live scholarships..."}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-sm text-center">
              {isVi ? 'AI đang liên kết với các quỹ giáo dục và các trang thông tin uy tín.' : 'AI is querying verified education ministries and institutional portals.'}
            </p>
          </motion.div>
        )}

        {results && !isSearching && (
          <motion.div 
            key="result" 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
            
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100 dark:border-white/5">
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-md font-bold text-gray-900 dark:text-white leading-tight">
                  {isVi ? 'Danh Sách Học Bổng Đề Xuất Cho Bạn' : 'AI matched Scholarship Portfolio'}
                </h4>
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 dark:text-gray-500">
                  Targeted profiles match active
                </span>
              </div>
            </div>

            <div className="markdown-body">
              <Markdown>{results}</Markdown>
            </div>
          </motion.div>
        )}

        {!results && !isSearching && (
          <motion.div 
            key="empty" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="w-full space-y-4"
          >
            <div className="flex items-center gap-2 pl-1">
              <Landmark className="w-5 h-5 text-indigo-500" />
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
                {isVi ? 'Các chương trình học bổng tiêu biểu' : 'Prestigious Open Scholarship Programs'}
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {CURATED_SCHOLARSHIPS.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-white/10 rounded-2xl p-6 hover:border-indigo-400 dark:hover:border-indigo-800 transition-all shadow-sm hover:shadow-md flex flex-col justify-between relative overflow-hidden group"
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.color}`} />
                  
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-md">
                          {item.type}
                        </span>
                        <h4 className="text-lg font-bold text-gray-950 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors pt-2 leading-snug">
                          {isVi ? item.title_vi : item.title_en}
                        </h4>
                        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500">
                          {isVi ? `Quỹ tài trợ: ${item.provider_vi}` : `Sponsor: ${item.provider_en}`}
                        </p>
                      </div>
                      <div className={`p-2.5 rounded-xl ${item.bgColor} ${item.textColor} shrink-0`}>
                        <Award className="w-5 h-5" />
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
                          {isVi ? 'Điều kiện ứng tuyển' : 'Eligibility'}
                        </span>
                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                          {isVi ? item.eligible_vi : item.eligible_en}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
