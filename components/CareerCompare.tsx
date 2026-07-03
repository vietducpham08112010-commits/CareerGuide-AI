import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';
import { compareCareers } from '../services/geminiService';
import { InlineGuide } from './InlineGuide';

const PRESETS_VI = [
  { c1: 'Kỹ sư Phần mềm', c2: 'Thiết kế UI/UX', label: 'Công nghệ vs Thiết kế' },
  { c1: 'Khoa học Dữ liệu', c2: 'Kỹ sư Trí tuệ Nhân tạo (AI)', label: 'Dữ liệu vs Trí tuệ nhân tạo' },
  { c1: 'Quản trị Kinh doanh', c2: 'Marketing Kỹ thuật số', label: 'Quản trị vs Marketing' },
  { c1: 'Quản lý Dự án (PM)', c2: 'Phân tích Nghiệp vụ (BA)', label: 'Quản lý vs Nghiệp vụ' },
];

const PRESETS_EN = [
  { c1: 'Software Engineer', c2: 'UI/UX Designer', label: 'Tech vs Design' },
  { c1: 'Data Scientist', c2: 'AI Engineer', label: 'Data vs AI' },
  { c1: 'Business Administration', c2: 'Digital Marketing', label: 'Business vs Marketing' },
  { c1: 'Project Manager', c2: 'Business Analyst', label: 'PM vs BA' },
];

const DEFAULT_RESULT_VI = {
  career1: {
    name: "Kỹ sư Phần mềm (Software Engineer)",
    description: "Thiết kế, xây dựng, kiểm thử và bảo trì các hệ thống phần mềm, ứng dụng web hoặc di động để giải quyết các vấn đề thực tế.",
    salary: "15 - 55 triệu VNĐ/tháng (Fresher: 12-18M, Senior: 35-60M+)",
    demand: "Rất cao (+25% tăng trưởng tuyển dụng hàng năm, nhu cầu chuyển đổi số lớn)",
    competition: "Cao (Đặc biệt ở cấp độ Intern/Junior do lượng sinh viên đông đảo)",
    workLife: "Trung bình (Áp lực deadline lớn, OT khi có sự cố, thời gian linh hoạt)",
    skills: ["Ngôn ngữ lập trình (JS/Python/Java)", "Cấu trúc dữ liệu & Thuật toán", "Kiến trúc hệ thống & Cơ sở dữ liệu"],
    careerPath: "Junior Developer → Senior Developer → Tech Lead / Software Architect / Engineering Manager",
    aiRisk: "Thấp - Trung bình (AI hỗ trợ viết mã nhanh hơn nhưng không thể thay thế tư duy thiết kế hệ thống phức tạp)",
    education: "Bằng Đại học CNTT, Khoa học Máy tính hoặc các chứng chỉ/Bootcamp lập trình uy tín.",
    suitability: "Người thích giải quyết vấn đề, có tư duy logic cao, kiên trì gỡ lỗi (debug) và không ngại học công nghệ mới liên tục."
  },
  career2: {
    name: "Nhà khoa học Dữ liệu (Data Scientist)",
    description: "Thu thập, phân tích và diễn giải các tập dữ liệu lớn phức tạp để xây dựng mô hình dự báo và đưa ra quyết định kinh doanh chiến lược.",
    salary: "20 - 65 triệu VNĐ/tháng (Junior: 15-25M, Senior: 40-70M+)",
    demand: "Cao (Nhu cầu khai thác Big Data và tích hợp AI trong doanh nghiệp bùng nổ)",
    competition: "Trung bình - Cao (Yêu cầu chuyên môn sâu về Toán học và Xác suất Thống kê)",
    workLife: "Tốt (Ít khi phải trực hệ thống 24/7 như SE, nhưng áp lực từ việc thuyết trình dữ liệu cho ban giám đốc)",
    skills: ["Toán thống kê & Machine Learning", "Lập trình phân tích (Python/R, SQL)", "Trực quan hóa dữ liệu (Tableau, PowerBI)"],
    careerPath: "Data Analyst → Data Scientist → Senior Data Scientist → Lead Data Scientist / Chief Data Officer",
    aiRisk: "Thấp (AI xử lý dữ liệu thô tốt nhưng phần phân tích ngữ cảnh kinh doanh và đưa ra quyết định chiến lược cần con người)",
    education: "Bằng Cử nhân/Thạc sĩ/Tiến sĩ ngành Toán Thống kê, Khoa học dữ liệu, Hệ thống thông tin quản lý.",
    suitability: "Người yêu thích những con số, thích tò mò khám phá các xu hướng ẩn giấu, tư duy nghiên cứu học thuật kết hợp giao tiếp tốt."
  },
  comparisonPoints: {
    salaryWinner: "career2",
    demandWinner: "career1",
    workLifeWinner: "career2",
    aiResilienceWinner: "tie",
    summaryAnalysis: "Kỹ sư Phần mềm (SE) tập trung vào xây dựng sản phẩm và kiến trúc hệ thống, có cơ hội việc làm rộng mở và trực quan hơn. Trong khi đó, Khoa học Dữ liệu (DS) đi sâu vào phân tích và mô hình hóa toán học, mang tính chất nghiên cứu và ra quyết định chiến lược hơn. Mức lương khởi điểm của DS thường cao hơn một chút, nhưng số lượng vị trí tuyển dụng của SE lại vượt trội hoàn toàn.",
    recommendation: "Chọn Kỹ sư Phần mềm nếu bạn yêu thích cảm giác tự tay tạo ra sản phẩm hoàn chỉnh, thích lập trình thuần túy. Chọn Khoa học Dữ liệu nếu bạn đam mê toán học, thống kê, thích đào sâu vào dữ liệu để tìm ra các quy luật có giá trị cho doanh nghiệp."
  }
};

const DEFAULT_RESULT_EN = {
  career1: {
    name: "Software Engineer",
    description: "Design, build, test, and maintain software systems, web, or mobile applications to solve real-world problems.",
    salary: "$80,000 - $140,000/year (Entry: $65k-$85k, Senior: $120k-$180k+)",
    demand: "Very High (+22% projected growth, huge digital transformation demand globally)",
    competition: "High (Especially at entry/Junior levels due to bootcamp and CS graduates)",
    workLife: "Moderate (Tight project deadlines, occasional emergency debugging, high flexibility)",
    skills: ["Programming languages (JS/Python/Java)", "Data Structures & Algorithms", "Software Architecture & Databases"],
    careerPath: "Junior Developer → Senior Developer → Tech Lead / Software Architect / Engineering Manager",
    aiRisk: "Low - Medium (AI speeds up coding, but cannot replace complex system design and business alignment)",
    education: "Bachelor's in Computer Science, Software Engineering, or reputable Coding Bootcamps.",
    suitability: "Logical thinkers, problem solvers, persistent debuggers, and life-long learners of new frameworks."
  },
  career2: {
    name: "Data Scientist",
    description: "Collect, clean, and interpret massive complex datasets to build predictive models and guide strategic business choices.",
    salary: "$90,000 - $150,000/year (Entry: $75k-$95k, Senior: $130k-$190k+)",
    demand: "High (Rapidly growing demand for AI, ML, and big data utilization in enterprises)",
    competition: "Medium - High (Steep learning curve requiring deep mathematics and analytical expertise)",
    workLife: "Good (Less on-call stress than SE, but high cognitive load and pressure to explain insights to executives)",
    skills: ["Math, Statistics & Machine Learning", "Data tools & Programming (Python, R, SQL)", "Data Visualization (Tableau, PowerBI)"],
    careerPath: "Data Analyst → Data Scientist → Senior Data Scientist → Lead Data Scientist / Chief Data Officer",
    aiRisk: "Low (AI processes raw data, but business domain integration and strategic reasoning remain human-dependent)",
    education: "Bachelor's/Master's/Ph.D. in Statistics, Mathematics, Data Science, or Economics.",
    suitability: "Analytical minds, naturally curious, academic research oriented, and capable of translating numbers into business impact."
  },
  comparisonPoints: {
    salaryWinner: "career2",
    demandWinner: "career1",
    workLifeWinner: "career2",
    aiResilienceWinner: "tie",
    summaryAnalysis: "Software Engineering (SE) focuses on system building and concrete product delivery, offering a vast job market. Data Science (DS) focuses on predictive modeling and statistical discovery, which is highly strategic and research-driven. DS usually enjoys slightly higher median starting salaries, but SE has far more total open roles across industries.",
    recommendation: "Choose Software Engineering if you love creating concrete apps, debugging systems, and coding products. Choose Data Science if you love math, statistical proof, big data analysis, and translating raw data into business intelligence."
  }
};

export const CareerCompare = ({ lang, t, Icons }: { lang: Language, t: any, Icons: any }) => {
  const [career1, setCareer1] = useState<string>('');
  const [career2, setCareer2] = useState<string>('');
  const [isComparing, setIsComparing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const defaultData = lang === Language.VI ? DEFAULT_RESULT_VI : DEFAULT_RESULT_EN;
  const [result, setResult] = useState<any>(defaultData);

  const handleCompare = async (c1Arg?: string, c2Arg?: string) => {
    const targetC1 = c1Arg || career1;
    const targetC2 = c2Arg || career2;

    if (!targetC1.trim() || !targetC2.trim()) return;
    
    setIsComparing(true);
    setError(null);
    setResult(null);
    try {
      const data = await compareCareers(targetC1, targetC2, lang);
      setResult(data);
    } catch (err: any) {
      setError(err.message || (lang === Language.VI ? 'Lỗi khi so sánh các ngành nghề.' : 'Failed to compare careers.'));
    } finally {
      setIsComparing(false);
    }
  };

  const handlePresetClick = (c1: string, c2: string) => {
    setCareer1(c1);
    setCareer2(c2);
    handleCompare(c1, c2);
  };

  const getMetricColor = (metric: string) => {
    if (!metric) return '';
    const m = metric.toLowerCase();
    if (m.includes('very high') || m.includes('rất cao') || m.includes('tốt') || m.includes('excellent') || m.includes('good') || m.includes('low risk') || m.includes('rủi ro thấp') || m.includes('thấp - trung bình') || m.includes('thấp')) {
      return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30';
    }
    if (m.includes('medium') || m.includes('trung bình') || m.includes('moderate') || m.includes('average')) {
      return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30';
    }
    if (m.includes('high') || m.includes('cao') || m.includes('kém') || m.includes('high risk') || m.includes('rủi ro cao')) {
      return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/30';
    }
    return 'text-gray-900 dark:text-white bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10';
  };

  const presets = lang === Language.VI ? PRESETS_VI : PRESETS_EN;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-stretch pb-12">
      {/* Title */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
          {lang === Language.VI ? 'Đối Soạn Ngành Nghề Đa Chiều' : 'Multi-Dimensional Career Comparison'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          {lang === Language.VI 
            ? 'Phân tích đối đầu chuyên sâu giữa 2 ngành nghề trên nhiều khía cạnh: kỹ năng, lộ trình thăng tiến, mức độ sẵn sàng thích ứng AI, và sự phù hợp tố chất bản thân.' 
            : 'Deep side-by-side analysis between two careers across skills, timelines, AI displacement resilience, educational paths, and psychological suitability.'}
        </p>
      </motion.div>

      {/* Inline Guide */}
      <InlineGuide 
        sectionKey="compare-careers"
        lang={lang === Language.VI ? 'vi' : 'en'}
        title={lang === Language.VI ? "💡 Hướng dẫn so sánh nâng cao" : "💡 Advanced Comparison Guide"}
        steps={lang === Language.VI ? [
          "Nhập tên 2 ngành nghề bạn đang cân nhắc hoặc nhấp chọn một cặp gợi ý phổ biến ở bên dưới.",
          "Tham khảo bảng phân tích 8 khía cạnh chuyên sâu từ AI, giúp bạn lượng hóa sự khác biệt.",
          "Phân tích kết quả \"AI Showdown\" để đánh giá bên nào ưu việt hơn về tài chính hay độ bền vững tương lai."
        ] : [
          "Enter any two careers side-by-side, or click any of the curated industry showdown presets below.",
          "Review the deep 8-aspect matrix breakdown highlighting skills, AI risk levels, and advancement tracks.",
          "Study the \"AI Showdown\" verdicts to see trade-offs in income potential versus long-term resilience."
        ]}
      />

      {/* Inputs Form */}
      <div className="w-full bg-gray-50 dark:bg-[#0c0c0e] border border-gray-150 dark:border-white/5 rounded-3xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="flex flex-col gap-2 relative">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">
              {lang === Language.VI ? 'Ngành nghề thứ nhất' : 'First Career'}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-500"></span>
              <input 
                type="text"
                value={career1}
                onChange={(e) => setCareer1(e.target.value)}
                placeholder={lang === Language.VI ? 'Ví dụ: Kỹ sư Phần mềm' : 'e.g. Software Engineer'}
                className="w-full bg-white dark:bg-[#121215] border border-gray-200 dark:border-white/10 rounded-2xl pl-9 pr-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 shadow-sm text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 relative">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">
              {lang === Language.VI ? 'Ngành nghề thứ hai' : 'Second Career'}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-purple-500"></span>
              <input 
                type="text"
                value={career2}
                onChange={(e) => setCareer2(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCompare()}
                placeholder={lang === Language.VI ? 'Ví dụ: Thiết kế UI/UX' : 'e.g. UI/UX Designer'}
                className="w-full bg-white dark:bg-[#121215] border border-gray-200 dark:border-white/10 rounded-2xl pl-9 pr-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 shadow-sm text-sm"
              />
            </div>
          </div>
        </div>

        {/* Action Button & Presets */}
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-150 dark:border-white/5 pt-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">
              {lang === Language.VI ? 'Gợi ý so sánh:' : 'Popular Pairings:'}
            </span>
            {presets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handlePresetClick(preset.c1, preset.c2)}
                className="text-xs bg-white dark:bg-[#1a1a1f] hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-300 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/5 transition-all font-medium"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleCompare()}
            disabled={isComparing || !career1.trim() || !career2.trim()}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 text-sm"
          >
            {isComparing ? <Icons.Refresh className="w-4 h-4 animate-spin" /> : <Icons.Activity className="w-4 h-4" />}
            {lang === Language.VI ? 'Bắt đầu so sánh' : 'Run Deep Compare'}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isComparing && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-20 text-gray-500">
            <div className="relative mb-4">
              <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
              <Icons.Activity className="w-5 h-5 text-indigo-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 animate-pulse">
              {lang === Language.VI ? 'Đang gọi AI phân tích sâu các khía cạnh...' : 'Gemini is running multi-dimensional comparison...'}
            </p>
          </motion.div>
        )}
        
        {error && !isComparing && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/30 text-center text-sm font-medium">
            {error}
          </motion.div>
        )}

        {result && !isComparing && (
          <motion.div key="result" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Side-by-side Hero Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {/* Career 1 Card */}
              <div className="bg-white dark:bg-[#121215] border border-gray-150 dark:border-white/5 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">
                      A
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400">
                      {lang === Language.VI ? 'Ngành 1' : 'Career A'}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {result.career1?.name || career1}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                    {result.career1?.description}
                  </p>
                </div>
              </div>

              {/* Career 2 Card */}
              <div className="bg-white dark:bg-[#121215] border border-gray-150 dark:border-white/5 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-purple-500"></div>
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-lg">
                      B
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400">
                      {lang === Language.VI ? 'Ngành 2' : 'Career B'}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {result.career2?.name || career2}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                    {result.career2?.description}
                  </p>
                </div>
              </div>
            </div>

            {/* In-depth Showdown Verdict Dashboard */}
            <div className="bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 dark:from-indigo-950/10 dark:via-[#121215] dark:to-purple-950/10 border border-indigo-100 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Icons.Award className="w-5 h-5 text-indigo-500 animate-bounce" />
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                  {lang === Language.VI ? 'Kết quả đối đầu AI (AI Showdown)' : 'AI Showdown Highlights'}
                </h4>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {/* Salary Winner */}
                <div className="bg-white dark:bg-[#121215]/50 border border-gray-150 dark:border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    {lang === Language.VI ? 'Thu nhập cao hơn' : 'Higher Income'}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      result.comparisonPoints?.salaryWinner === 'career1' 
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                        : result.comparisonPoints?.salaryWinner === 'career2'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-gray-300'
                    }`}>
                      {result.comparisonPoints?.salaryWinner === 'career1' 
                        ? (lang === Language.VI ? 'Ngành A' : 'Career A') 
                        : result.comparisonPoints?.salaryWinner === 'career2'
                        ? (lang === Language.VI ? 'Ngành B' : 'Career B')
                        : (lang === Language.VI ? 'Ngang nhau' : 'Tie')}
                    </span>
                  </div>
                </div>

                {/* Market Demand Winner */}
                <div className="bg-white dark:bg-[#121215]/50 border border-gray-150 dark:border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    {lang === Language.VI ? 'Nhu cầu tuyển dụng' : 'Higher Demand'}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      result.comparisonPoints?.demandWinner === 'career1' 
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                        : result.comparisonPoints?.demandWinner === 'career2'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-gray-300'
                    }`}>
                      {result.comparisonPoints?.demandWinner === 'career1' 
                        ? (lang === Language.VI ? 'Ngành A' : 'Career A') 
                        : result.comparisonPoints?.demandWinner === 'career2'
                        ? (lang === Language.VI ? 'Ngành B' : 'Career B')
                        : (lang === Language.VI ? 'Ngang nhau' : 'Tie')}
                    </span>
                  </div>
                </div>

                {/* Work Life Winner */}
                <div className="bg-white dark:bg-[#121215]/50 border border-gray-150 dark:border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    {lang === Language.VI ? 'Cân bằng công việc' : 'Better Work-Life'}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      result.comparisonPoints?.workLifeWinner === 'career1' 
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                        : result.comparisonPoints?.workLifeWinner === 'career2'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-gray-300'
                    }`}>
                      {result.comparisonPoints?.workLifeWinner === 'career1' 
                        ? (lang === Language.VI ? 'Ngành A' : 'Career A') 
                        : result.comparisonPoints?.workLifeWinner === 'career2'
                        ? (lang === Language.VI ? 'Ngành B' : 'Career B')
                        : (lang === Language.VI ? 'Ngang nhau' : 'Tie')}
                    </span>
                  </div>
                </div>

                {/* AI Resilience Winner */}
                <div className="bg-white dark:bg-[#121215]/50 border border-gray-150 dark:border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    {lang === Language.VI ? 'Khả năng kháng AI' : 'AI Resilience'}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      result.comparisonPoints?.aiResilienceWinner === 'career1' 
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                        : result.comparisonPoints?.aiResilienceWinner === 'career2'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-gray-300'
                    }`}>
                      {result.comparisonPoints?.aiResilienceWinner === 'career1' 
                        ? (lang === Language.VI ? 'Ngành A' : 'Career A') 
                        : result.comparisonPoints?.aiResilienceWinner === 'career2'
                        ? (lang === Language.VI ? 'Ngành B' : 'Career B')
                        : (lang === Language.VI ? 'Ngang nhau' : 'Tie')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t border-gray-150 dark:border-white/5 pt-5 text-left">
                <div>
                  <h5 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                    {lang === Language.VI ? '📊 Phân tích cân nhắc đánh đổi:' : '📊 Comparative Analysis Trade-offs:'}
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {result.comparisonPoints?.summaryAnalysis}
                  </p>
                </div>
                <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/20">
                  <h5 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-1 flex items-center gap-1.5">
                    <Icons.Zap className="w-4 h-4" />
                    {lang === Language.VI ? '💡 Đề xuất định hướng từ AI:' : '💡 Personalized Actionable Recommendation:'}
                  </h5>
                  <p className="text-sm text-indigo-950/80 dark:text-indigo-200 leading-relaxed">
                    {result.comparisonPoints?.recommendation}
                  </p>
                </div>
              </div>
            </div>

            {/* Deep Aspect-by-Aspect Matrix Table */}
            <div className="bg-white dark:bg-[#121215] border border-gray-150 dark:border-white/5 rounded-3xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-150 dark:border-white/5 flex items-center gap-2">
                <Icons.Activity className="w-5 h-5 text-purple-500" />
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                  {lang === Language.VI ? 'Bảng Đánh Giá Chi Tiết 8 Khía Cạnh' : 'Deep 8-Aspect Matrix Breakdown'}
                </h4>
              </div>

              <div className="divide-y divide-gray-150 dark:divide-white/5">
                {/* 1. Mức lương */}
                <div className="p-6 md:p-8 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="md:w-1/4">
                      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-wider mb-2">
                        <Icons.CreditCard className="w-4 h-4" />
                        {lang === Language.VI ? 'Mức thu nhập' : 'Income & Salary'}
                      </div>
                    </div>
                    <div className="md:w-3/8 pr-4">
                      <div className="text-xs text-gray-400 font-bold uppercase mb-1">{lang === Language.VI ? 'Ngành A' : 'Career A'}</div>
                      <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{result.career1?.salary}</p>
                    </div>
                    <div className="md:w-3/8">
                      <div className="text-xs text-purple-400 font-bold uppercase mb-1">{lang === Language.VI ? 'Ngành B' : 'Career B'}</div>
                      <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{result.career2?.salary}</p>
                    </div>
                  </div>
                </div>

                {/* 2. Nhu cầu */}
                <div className="p-6 md:p-8 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="md:w-1/4">
                      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-wider mb-2">
                        <Icons.TrendingUp className="w-4 h-4" />
                        {lang === Language.VI ? 'Nhu cầu tuyển dụng' : 'Market Demand'}
                      </div>
                    </div>
                    <div className="md:w-3/8 pr-4">
                      <div className="text-xs text-gray-400 font-bold uppercase mb-1">{lang === Language.VI ? 'Ngành A' : 'Career A'}</div>
                      <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{result.career1?.demand}</p>
                    </div>
                    <div className="md:w-3/8">
                      <div className="text-xs text-purple-400 font-bold uppercase mb-1">{lang === Language.VI ? 'Ngành B' : 'Career B'}</div>
                      <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{result.career2?.demand}</p>
                    </div>
                  </div>
                </div>

                {/* 3. Cạnh tranh */}
                <div className="p-6 md:p-8 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="md:w-1/4">
                      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-wider mb-2">
                        <Icons.Search className="w-4 h-4" />
                        {lang === Language.VI ? 'Tỷ lệ cạnh tranh' : 'Competition Level'}
                      </div>
                    </div>
                    <div className="md:w-3/8 pr-4">
                      <div className="text-xs text-gray-400 font-bold uppercase mb-1">{lang === Language.VI ? 'Ngành A' : 'Career A'}</div>
                      <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{result.career1?.competition}</p>
                    </div>
                    <div className="md:w-3/8">
                      <div className="text-xs text-purple-400 font-bold uppercase mb-1">{lang === Language.VI ? 'Ngành B' : 'Career B'}</div>
                      <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{result.career2?.competition}</p>
                    </div>
                  </div>
                </div>

                {/* 4. Work-Life */}
                <div className="p-6 md:p-8 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="md:w-1/4">
                      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-wider mb-2">
                        <Icons.Activity className="w-4 h-4" />
                        {lang === Language.VI ? 'Cân bằng cuộc sống' : 'Work-life Balance'}
                      </div>
                    </div>
                    <div className="md:w-3/8 pr-4">
                      <div className="text-xs text-gray-400 font-bold uppercase mb-1">{lang === Language.VI ? 'Ngành A' : 'Career A'}</div>
                      <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{result.career1?.workLife}</p>
                    </div>
                    <div className="md:w-3/8">
                      <div className="text-xs text-purple-400 font-bold uppercase mb-1">{lang === Language.VI ? 'Ngành B' : 'Career B'}</div>
                      <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{result.career2?.workLife}</p>
                    </div>
                  </div>
                </div>

                {/* 5. AI Risk */}
                <div className="p-6 md:p-8 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="md:w-1/4">
                      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-wider mb-2">
                        <Icons.Cpu className="w-4 h-4" />
                        {lang === Language.VI ? 'Sự đe dọa của AI' : 'AI Disruption Risk'}
                      </div>
                    </div>
                    <div className="md:w-3/8 pr-4">
                      <div className="text-xs text-gray-400 font-bold uppercase mb-1">{lang === Language.VI ? 'Ngành A' : 'Career A'}</div>
                      <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{result.career1?.aiRisk}</p>
                    </div>
                    <div className="md:w-3/8">
                      <div className="text-xs text-purple-400 font-bold uppercase mb-1">{lang === Language.VI ? 'Ngành B' : 'Career B'}</div>
                      <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{result.career2?.aiRisk}</p>
                    </div>
                  </div>
                </div>

                {/* 6. Skills Required */}
                <div className="p-6 md:p-8 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="md:w-1/4">
                      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-wider mb-2">
                        <Icons.Target className="w-4 h-4" />
                        {lang === Language.VI ? 'Kỹ năng cốt lõi' : 'Core Skills'}
                      </div>
                    </div>
                    <div className="md:w-3/8 pr-4">
                      <div className="text-xs text-gray-400 font-bold uppercase mb-1">{lang === Language.VI ? 'Ngành A' : 'Career A'}</div>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {Array.isArray(result.career1?.skills) ? (
                          result.career1.skills.map((skill: string, idx: number) => (
                            <span key={idx} className="text-xs bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-300 px-2.5 py-1 rounded-xl font-medium border border-indigo-100/50 dark:border-indigo-900/10">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <p className="text-sm text-gray-800 dark:text-gray-200">{result.career1?.skills}</p>
                        )}
                      </div>
                    </div>
                    <div className="md:w-3/8">
                      <div className="text-xs text-purple-400 font-bold uppercase mb-1">{lang === Language.VI ? 'Ngành B' : 'Career B'}</div>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {Array.isArray(result.career2?.skills) ? (
                          result.career2.skills.map((skill: string, idx: number) => (
                            <span key={idx} className="text-xs bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-300 px-2.5 py-1 rounded-xl font-medium border border-purple-100/50 dark:border-purple-900/10">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <p className="text-sm text-gray-800 dark:text-gray-200">{result.career2?.skills}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 7. Lộ trình */}
                <div className="p-6 md:p-8 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="md:w-1/4">
                      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-wider mb-2">
                        <Icons.Briefcase className="w-4 h-4" />
                        {lang === Language.VI ? 'Lộ trình thăng tiến' : 'Advancement Path'}
                      </div>
                    </div>
                    <div className="md:w-3/8 pr-4">
                      <div className="text-xs text-gray-400 font-bold uppercase mb-1">{lang === Language.VI ? 'Ngành A' : 'Career A'}</div>
                      <p className="text-sm text-gray-800 dark:text-gray-200 font-medium leading-relaxed">{result.career1?.careerPath}</p>
                    </div>
                    <div className="md:w-3/8">
                      <div className="text-xs text-purple-400 font-bold uppercase mb-1">{lang === Language.VI ? 'Ngành B' : 'Career B'}</div>
                      <p className="text-sm text-gray-800 dark:text-gray-200 font-medium leading-relaxed">{result.career2?.careerPath}</p>
                    </div>
                  </div>
                </div>

                {/* 8. Học vấn */}
                <div className="p-6 md:p-8 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="md:w-1/4">
                      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-wider mb-2">
                        <Icons.BookOpen className="w-4 h-4" />
                        {lang === Language.VI ? 'Bằng cấp & Chứng chỉ' : 'Education & Certs'}
                      </div>
                    </div>
                    <div className="md:w-3/8 pr-4">
                      <div className="text-xs text-gray-400 font-bold uppercase mb-1">{lang === Language.VI ? 'Ngành A' : 'Career A'}</div>
                      <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-medium">{result.career1?.education}</p>
                    </div>
                    <div className="md:w-3/8">
                      <div className="text-xs text-purple-400 font-bold uppercase mb-1">{lang === Language.VI ? 'Ngành B' : 'Career B'}</div>
                      <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-medium">{result.career2?.education}</p>
                    </div>
                  </div>
                </div>

                {/* 9. Tính cách phù hợp */}
                <div className="p-6 md:p-8 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="md:w-1/4">
                      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-wider mb-2">
                        <Icons.User className="w-4 h-4" />
                        {lang === Language.VI ? 'Tố chất phù hợp' : 'Ideal Personality'}
                      </div>
                    </div>
                    <div className="md:w-3/8 pr-4">
                      <div className="text-xs text-gray-400 font-bold uppercase mb-1">{lang === Language.VI ? 'Ngành A' : 'Career A'}</div>
                      <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-medium">{result.career1?.suitability}</p>
                    </div>
                    <div className="md:w-3/8">
                      <div className="text-xs text-purple-400 font-bold uppercase mb-1">{lang === Language.VI ? 'Ngành B' : 'Career B'}</div>
                      <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-medium">{result.career2?.suitability}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
