import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import { UserProfile, Language, PortfolioItem, Theme } from '../types';
import { InlineGuide } from './InlineGuide';

interface PortfolioProps {
  user: UserProfile | null;
  language: Language;
  theme: Theme;
  onUpdateUser: (updates: Partial<UserProfile>) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const Portfolio: React.FC<PortfolioProps> = ({ user, language, theme, onUpdateUser, showToast }) => {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItem, setNewItem] = useState<Partial<PortfolioItem>>({
    type: 'Certificate',
    title: '',
    description: '',
    date: '',
    score: '',
    link: ''
  });

  const t = {
    en: {
      portfolio: 'Portfolio / CV',
      portfolioDesc: 'Store your certificates, grades, and personal projects. Export as a complete CV/Portfolio for college applications.',
      addPortfolioItem: 'Add Item',
      itemType: 'Type',
      typeCertificate: 'Certificate',
      typeGrade: 'Grade/Score',
      typeProject: 'Personal Project',
      itemTitle: 'Title',
      itemDesc: 'Description',
      itemDate: 'Date/Period',
      itemScore: 'Score/Result',
      itemLink: 'Link (Optional)',
      exportCV: 'Export CV/Portfolio',
      noPortfolioItems: 'No items in your portfolio yet. Add your achievements to build your CV!',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete'
    },
    vi: {
      portfolio: 'Hồ sơ cá nhân',
      portfolioDesc: 'Lưu trữ chứng chỉ, điểm số và các dự án cá nhân. Dễ dàng trích xuất thành một CV/Portfolio hoàn chỉnh khi nộp hồ sơ xét tuyển.',
      addPortfolioItem: 'Thêm mục mới',
      itemType: 'Loại',
      typeCertificate: 'Chứng chỉ',
      typeGrade: 'Điểm số / Thành tích học tập',
      typeProject: 'Dự án cá nhân',
      itemTitle: 'Tiêu đề',
      itemDesc: 'Mô tả chi tiết',
      itemDate: 'Thời gian',
      itemScore: 'Điểm số / Kết quả',
      itemLink: 'Đường dẫn (Tùy chọn)',
      exportCV: 'Xuất CV/Portfolio',
      noPortfolioItems: 'Chưa có mục nào trong hồ sơ của bạn. Hãy thêm thành tích để xây dựng CV nhé!',
      save: 'Lưu',
      cancel: 'Hủy',
      delete: 'Xóa'
    }
  }[language === Language.EN ? 'en' : 'vi'];

  const handleAddItem = () => {
    if (!newItem.title) {
      showToast(language === Language.EN ? "Please enter a title" : "Vui lòng nhập tiêu đề", 'error');
      return;
    }

    const item: PortfolioItem = {
      id: Math.random().toString(36).substring(7),
      type: newItem.type as any,
      title: newItem.title,
      description: newItem.description || '',
      date: newItem.date || '',
      score: newItem.score || '',
      link: newItem.link || ''
    };

    const currentPortfolio = user?.portfolio || [];
    onUpdateUser({ portfolio: [...currentPortfolio, item] });
    setIsAddingItem(false);
    setNewItem({ type: 'Certificate', title: '', description: '', date: '', score: '', link: '' });
    showToast(language === Language.EN ? "Item added to portfolio" : "Đã thêm mục vào hồ sơ", 'success');
  };

  const deleteItem = (id: string) => {
    const currentPortfolio = user?.portfolio || [];
    onUpdateUser({ portfolio: currentPortfolio.filter(item => item.id !== id) });
    showToast(language === Language.EN ? "Item removed" : " Đã xóa mục", 'info');
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'Certificate': return <Icons.Award className="w-5 h-5" />;
      case 'Grade/Score': return <Icons.GraduationCap className="w-5 h-5" />;
      case 'Personal Project': return <Icons.Code className="w-5 h-5" />;
      default: return <Icons.FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-[#050505] overflow-y-auto">
      <div className="w-full p-4 md:p-8 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {t.portfolio}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {t.portfolioDesc}
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={() => setIsAddingItem(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20"
            >
              <Icons.Plus className="w-5 h-5" />
              <span>{t.addPortfolioItem}</span>
            </button>
          </div>
        </div>

        <InlineGuide 
          sectionKey="portfolio-cv"
          lang={language === Language.VI ? 'vi' : 'en'}
          title={language === Language.VI ? "💡 Hướng dẫn lưu trữ & kết xuất hồ sơ tuyển sinh" : "💡 Portfolio / CV Guide"}
          steps={language === Language.VI ? [
            "Tập hợp các giải thưởng, điểm tổng kết hoặc chứng chỉ ngoại ngữ mà bạn đã gặt hái vào các nhóm chuyên biệt.",
            "AI tự động bóc tách các mốc này nhằm gia vị cho các cuộc tư vấn lộ trình và buổi phỏng vấn thử đạt độ cá nhân hóa đỉnh cao.",
            "Click nút 'Xuất Portfolio' ở danh mục bên dưới để in ngay một bản sơ yếu định dạng PDF trang nhã làm hồ sơ xin học bổng."
          ] : [
            "Input certificates (IELTS, SAT, etc.), academic grades, or personal projects that you've earned.",
            "AI integrates these records seamlessly to fine-tune your career guidance sessions and mock interview contexts.",
            "Click the export action links to compile and download your records into a standard premium formatted CV PDF."
          ]}
        />

        <AnimatePresence>
          {isAddingItem && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-white/10 p-6 mb-8 shadow-xl"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t.addPortfolioItem}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">{t.itemType}</label>
                  <select 
                    value={newItem.type} 
                    onChange={(e) => setNewItem({...newItem, type: e.target.value as any})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Certificate">{t.typeCertificate}</option>
                    <option value="Grade/Score">{t.typeGrade}</option>
                    <option value="Personal Project">{t.typeProject}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">{t.itemTitle}</label>
                  <input 
                    type="text" 
                    value={newItem.title} 
                    onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                    placeholder={language === Language.EN ? "e.g. IELTS 8.0" : "VD: IELTS 8.0"}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">{t.itemDesc}</label>
                  <textarea 
                    value={newItem.description} 
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">{t.itemDate}</label>
                  <input 
                    type="text" 
                    value={newItem.date} 
                    onChange={(e) => setNewItem({...newItem, date: e.target.value})}
                    placeholder="2023 - 2024"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">{t.itemScore}</label>
                  <input 
                    type="text" 
                    value={newItem.score} 
                    onChange={(e) => setNewItem({...newItem, score: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setIsAddingItem(false)}
                  className="px-6 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {t.cancel}
                </button>
                <button 
                  onClick={handleAddItem}
                  className="px-8 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all"
                >
                  {t.save}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {(!user?.portfolio || user.portfolio.length === 0) ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-[#111] rounded-3xl border border-dashed border-gray-300 dark:border-white/10 p-12 text-center"
              >
                <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icons.FolderOpen className="w-8 h-8" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">{t.noPortfolioItems}</p>
              </motion.div>
            ) : (
              user.portfolio.map((item, index) => (
                <motion.div 
                  key={item.id ? `${item.id}-${index}` : `pf-item-${index}`}
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{ 
                    duration: 0.3,
                    delay: index * 0.05
                  }}
                  className="bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-white/10 p-5 flex items-start gap-4 group hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all"
                >
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  {getItemIcon(item.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-gray-900 dark:text-white">{item.title}</h4>
                    <button 
                      onClick={() => deleteItem(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Icons.Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.description}</p>
                  <div className="flex flex-wrap gap-4 mt-3">
                    {item.date && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Icons.Calendar className="w-3.5 h-3.5" />
                        {item.date}
                      </div>
                    )}
                    {item.score && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        <Icons.Star className="w-3.5 h-3.5" />
                        {item.score}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
