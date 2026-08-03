import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import { Language, UserProfile } from '../types';
import { RoadmapPromptBuilder } from './RoadmapPromptBuilder';

interface PromptBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  user: UserProfile | null;
  onSendPromptToChat: (promptText: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const PromptBuilderModal: React.FC<PromptBuilderModalProps> = ({
  isOpen,
  onClose,
  language,
  user,
  onSendPromptToChat,
  showToast
}) => {
  if (!isOpen) return null;

  const isVi = language === Language.VI;

  const handleSelectPrompt = (promptText: string) => {
    onSendPromptToChat(promptText);
    onClose();
    showToast(
      isVi 
        ? "✨ Đã nạp mẫu Prompt vào khung trò chuyện!" 
        : "✨ Prompt template loaded into chat box!", 
      "success"
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-4xl max-h-[88vh] bg-white dark:bg-[#121212] rounded-3xl border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-white/10 flex items-center justify-between bg-gray-50/80 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Icons.Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-white">
                  {isVi ? "Thư Viện & Tạo Prompt AI Tự Động" : "AI Prompt Studio & Templates"}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isVi ? "Chọn hoặc tùy biến prompt chuẩn chuyên gia để nạp vào trợ lý AI" : "Select or customize expert prompt templates directly for AI Assistant"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              title="Close"
            >
              <Icons.X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-4">
            <RoadmapPromptBuilder
              language={language}
              user={user}
              onSendPromptToChat={handleSelectPrompt}
              showToast={showToast}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
