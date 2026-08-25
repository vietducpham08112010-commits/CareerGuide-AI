
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Language, Theme, AppMode, DashboardTab, ChatMessage, ChatSession, AuthState, Transcript, UserProfile, AIProvider, Milestone, PortfolioItem, Clarification } from './types';
import { AVATARS, CAREER_TAGS, CAREER_QUOTES, SUGGESTION_PROMPTS, TRANSLATIONS, HOT_INDUSTRIES } from './constants';
import { sendChatMessage, LiveSessionManager, generateChatTitle } from './services/geminiService';
import { decode, encode, decodeAudioData, createPcmBlob } from './utils/audio';
import { Visualizer } from './components/Visualizer';
import { ProgressBoard } from './components/ProgressBoard';
import { Portfolio } from './components/Portfolio';
import { Scholarships } from './components/Scholarships';
import { UniversityScores } from './components/UniversityScores';
import { CareerCompare } from './components/CareerCompare';
import { ClarificationCard } from './components/ClarificationCard';
import { HotCareersVietnam } from './components/HotCareersVietnam';
import { FeedbackModal } from './components/FeedbackModal';
import { MockInterview } from './components/MockInterview';
import { InlineGuide } from './components/InlineGuide';
import { Onboarding } from './components/Onboarding';
import { RoadmapPromptBuilder } from './components/RoadmapPromptBuilder';
import { CareerLifecycleManager } from './components/CareerLifecycleManager';
import { MonetizationRewardsHub } from './components/MonetizationRewardsHub';
import { CvBuilder } from './components/CvBuilder';
import { UpgradeModal } from './components/UpgradeModal';
import { PromptBuilderModal } from './components/PromptBuilderModal';
import { FoundersSection } from './components/FoundersSection';
import { getSubscriptionDetails, DEFAULT_FREE_SUBSCRIPTION } from './utils/subscriptionUtils';
import { 
  syncUserProfileToCloud, 
  fetchUserProfileFromCloud, 
  syncRoadmapToCloud, 
  fetchRoadmapFromCloud, 
  syncChatSessionToCloud, 
  fetchChatSessionsFromCloud, 
  deleteChatSessionFromCloud,
  saveFeedbackToCloud,
  firebaseAuth,
  googleProvider,
  firebaseInitError
} from './services/firestoreService';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider
} from 'firebase/auth';
import { storage } from './utils/storage';
import { THE_NEXTX_USER_PROFILE, THE_NEXTX_MILESTONES, THE_NEXTX_CHAT_SESSIONS } from './src/utils/nextxSampleData';

// --- CONFIGURATION ---
const EMAILJS_CONFIG = {
  SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID || "",
  TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "",
  PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || ""
};

// --- Icons ---
const Icons = {
  Headset: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 0 1 18 0m0 0h-3a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-5Z"/><path d="M21 16v2a2 2 0 0 1-2 2h-1.5"/></svg>,
  Home: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  X: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Microphone: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>,
  MessageSquare: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  User: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  LogOut: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>,
  Send: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Globe: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"/></svg>,
  Camera: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>,
  Sun: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  Moon: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  Google: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" {...props}><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>,
  ArrowRight: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  History: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/></svg>,
  Flame: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-5 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>,
  Refresh: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>,
  FileText: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></svg>,
  TrendingUp: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Briefcase: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>,
  Zap: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
  Compass: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>,
  Target: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  Heart: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  ChevronDown: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 9l6 6 6-6"/></svg>,
  Stars: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  Sparkles: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"/></svg>,
  Leaf: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>,
  Shield: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Activity: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Cpu: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="15" x2="23" y2="15"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="15" x2="4" y2="15"/></svg>,
  CreditCard: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  BookOpen: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  Eye: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  EyeOff: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  Server: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>,
  Key: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>,
  ChevronLeft: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="15 18 9 12 15 6"/></svg>,
  ChevronRight: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="9 18 15 12 9 6"/></svg>,
  Check: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="20 6 9 17 4 12"/></svg>,
  Search: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Plus: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Menu: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  PanelLeftClose: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><path d="m16 15-3-3 3-3"/></svg>,
  PanelLeftOpen: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><path d="m14 9 3 3-3 3"/></svg>,
  Save: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  RefreshCw: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>,
  CheckCircle2: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>,
  AlertCircle: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  BarChart3: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 3v18h18"/><rect x="7" y="10" width="4" height="8" rx="1"/><rect x="13" y="6" width="4" height="12" rx="1"/><rect x="19" y="12" width="4" height="6" rx="1"/></svg>,
  Award: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="8" r="7"/><path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12"/></svg>,
  Play: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  Info: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  MoreVertical: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>,
  Edit2: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>,
  Trash2: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>,
  Star: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  FolderOpen: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"/></svg>,
  HelpCircle: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Square: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="18" x="3" y="3" rx="2"/></svg>,
  Settings: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
  Lock: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  ExternalLink: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  PhoneCall: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  Database: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/></svg>,
};

// --- CAREER GUIDE AI LOGO ---
const CareerGuideLogo = ({ className = "w-24 h-24", isThinking = false }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="stair-gradient" x1="0" y1="100" x2="100" y2="0">
        <stop offset="0%" stopColor="#4c1d95" /> {/* deep purple */}
        <stop offset="30%" stopColor="#7e22ce" /> {/* purple */}
        <stop offset="70%" stopColor="#d946ef" /> {/* fuchsia */}
        <stop offset="100%" stopColor="#f472b6" /> {/* pink */}
      </linearGradient>
      <linearGradient id="star-gradient" x1="0" y1="100" x2="100" y2="0">
        <stop offset="0%" stopColor="#c084fc" />
        <stop offset="100%" stopColor="#f472b6" />
      </linearGradient>
      <filter id="glow-star" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur1" />
        <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur2" />
        <feMerge>
          <feMergeNode in="blur2" />
          <feMergeNode in="blur1" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    
    {/* Stairs */}
    <path 
      d="M 25 80 L 40 80 L 50 55 L 65 55 L 75 30 L 90 30" 
      stroke="url(#stair-gradient)" 
      strokeWidth="12" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    
    {/* Crystal/Star */}
    <motion.path 
       d="M 0 -12 Q 0 0 12 0 Q 0 0 0 12 Q 0 0 -12 0 Q 0 0 0 -12 Z"
       fill="url(#star-gradient)"
       filter="url(#glow-star)"
       initial="initial"
       variants={{
         initial: { x: 57.5, y: 35, opacity: 1, scale: 1 },
         hover: { 
           x: [57.5, 65, 73.75, 82.5, 82.5, 57.5], 
           y: [35, 20, -5, 5, 5, 35], 
           opacity: [1, 1, 1, 1, 0, 1],
           transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
         }
       }}
       animate={isThinking ? {
           x: [32.5, 41.25, 50, 57.5, 65, 73.75, 82.5, 82.5, 32.5],
           y: [60, 35, 40, 15, 20, -5, 5, 5, 60],
           opacity: [0, 1, 1, 1, 1, 1, 1, 0, 0],
           scale: [0.5, 1, 1, 1, 1, 1, 1, 0.5, 0]
       } : undefined}
       transition={isThinking ? {
           duration: 2,
           repeat: Infinity,
           times: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 0.95, 1],
           ease: "easeInOut"
       } : { duration: 0.5 }}
    />
  </svg>
);

const AnimatedLogoButton = ({ onClick, text, isCollapsed = false, className = "" }: { onClick: () => void, text?: string, isCollapsed?: boolean, className?: string }) => (
  <motion.button 
    onClick={onClick}
    className={`flex items-center gap-3 text-left group relative ${className}`}
    whileHover="hover"
    initial="initial"
  >
    <div className="relative flex items-center justify-center p-1">
      {/* Glowing floating aura */}
      <motion.div
         variants={{
           initial: { opacity: 0, scale: 0.8 },
           hover: { opacity: 0.7, scale: 1.4, rotate: 180 }
         }}
         transition={{ duration: 3, ease: "linear", repeat: Infinity }}
         className="absolute inset-0 bg-gradient-to-tr from-indigo-500 via-purple-500 to-fuchsia-500 rounded-full blur-md"
      />
      {/* Core logo */}
      <motion.div
         variants={{
           initial: { scale: 1, y: 0 },
           hover: { scale: 1.05, y: -2 }
         }}
         className="relative z-10"
      >
        <CareerGuideLogo className="w-8 h-8" />
      </motion.div>
    </div>
    {!isCollapsed && text && (
      <motion.span 
        variants={{
          initial: { backgroundPosition: "0% 50%" },
          hover: { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        style={{ backgroundSize: "200% 200%" }}
        className="font-bold text-base sm:text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-pink-500 dark:from-indigo-400 dark:via-fuchsia-400 dark:to-pink-400 whitespace-nowrap"
      >
        {text}
      </motion.span>
    )}
  </motion.button>
);

const ScrollReveal = ({ children, delay = 0, duration = 0.65, y = 30 }: { children: React.ReactNode, delay?: number, duration?: number, y?: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: duration, delay: delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
};

const StaggerContainer = ({ children, delay = 0, once = true }: { children: React.ReactNode, delay?: number, once?: boolean }) => {
  return (
    <motion.div
      initial="initial"
      whileInView="animate"
      viewport={{ once: once, margin: "-40px" }}
      variants={{
        initial: {},
        animate: {
          transition: {
            staggerChildren: 0.12,
            delayChildren: delay,
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
};

const StaggerItem = ({ children, y = 24, className = "" }: { children: React.ReactNode, y?: number, className?: string }) => {
  return (
    <motion.div
      className={className}
      variants={{
        initial: { opacity: 0, y: y },
        animate: { 
          opacity: 1, 
          y: 0,
          transition: {
            type: "spring",
            stiffness: 100,
            damping: 15
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
};

const ShimmerText = ({ text }: { text: string }) => (
    <div className="inline-block animate-shimmer-text font-medium text-lg tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-gray-500 via-gray-900 to-gray-500 dark:from-gray-400 dark:via-white dark:to-gray-400 bg-[length:200%_auto]">
        {text}
    </div>
);

const cleanText = (text: string) => {
    // Hide JSON blocks from the chat UI
    let cleaned = text.replace(/```json\s*[\s\S]*?\s*```/g, '');
    // Also hide raw clarification JSON if it exists
    cleaned = cleaned.replace(/\{\s*"type":\s*"clarification"[\s\S]*?\}/g, '');
    // Also hide raw roadmap JSON if it exists (starts with [ { "id": ...)
    cleaned = cleaned.replace(/\[\s*\{\s*"id":[\s\S]*?\}\s*\]/g, '');
    return cleaned.trim();
};

// --- HELPER FOR THINKING TEXT ---
const getThinkingMessage = (input: string, lang: Language) => {
    const lower = input.toLowerCase();
    const t = TRANSLATIONS[lang];
    
    if (lower.includes('đam mê') || lower.includes('passion') || lower.includes('thích') || lower.includes('like')) {
        return t.thinkingPassions;
    }
    if (lower.includes('việc') || lower.includes('job') || lower.includes('career') || lower.includes('nghề')) {
        return t.thinkingOpportunities;
    }
    if (lower.includes('lương') || lower.includes('salary') || lower.includes('money') || lower.includes('thu nhập')) {
        return t.thinkingMarket;
    }
    if (lower.includes('cv') || lower.includes('hồ sơ') || lower.includes('resume')) {
        return t.thinkingProfile;
    }
    if (lower.includes('học') || lower.includes('learn') || lower.includes('study') || lower.includes('trường')) {
        return t.thinkingPaths;
    }
    
    return t.thinking;
};

const CareerQuiz = ({ lang, t, onComplete }: { lang: Language, t: any, onComplete: (result: string) => void }) => {
  const isVi = lang === Language.VI;
  const [quizLength, setQuizLength] = useState<number | null>(null);
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState({ R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 });
  const [answersHistory, setAnswersHistory] = useState<{ step: number; value: number; type: string }[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const [detailedResult, setDetailedResult] = useState<{
    topCode: string;
    sortedScores: { type: string; score: number; percentage: number }[];
    topDescription: string;
  } | null>(null);

  const allQuestions = isVi ? [
    // Round 1 (1-6)
    { text: 'Mình thích làm việc với động vật, công cụ hoặc máy móc.', type: 'R' },
    { text: 'Mình thích giải các bài toán và vấn đề khoa học.', type: 'I' },
    { text: 'Mình thích các hoạt động sáng tạo như nghệ thuật, kịch hoặc âm nhạc.', type: 'A' },
    { text: 'Mình thích giúp đỡ, dạy bảo hoặc cung cấp dịch vụ cho người khác.', type: 'S' },
    { text: 'Mình thích lãnh đạo và thuyết phục mọi người.', type: 'E' },
    { text: 'Mình thích làm việc với con số, hồ sơ hoặc máy móc một cách ngăn nắp.', type: 'C' },
    // Round 2 (7-12)
    { text: 'Mình thích sửa chữa đồ đạc hoặc các thiết bị trong nhà.', type: 'R' },
    { text: 'Mình thích thực hiện các thí nghiệm hoặc nghiên cứu khoa học.', type: 'I' },
    { text: 'Mình thích viết lách (truyện, làm thơ, viết blog) hoặc vẽ tranh.', type: 'A' },
    { text: 'Mình thích tham gia các hoạt động tình nguyện hoặc công tác xã hội.', type: 'S' },
    { text: 'Mình thích khởi nghiệp, kinh doanh hoặc bán một sản phẩm nào đó.', type: 'E' },
    { text: 'Mình thích sắp xếp dữ liệu, lưu trữ hồ sơ và tài liệu gọn gàng.', type: 'C' },
    // Round 3 (13-18)
    { text: 'Mình thích tự tay lắp ráp mô hình, thiết kế các đồ dùng bằng tay.', type: 'R' },
    { text: 'Mình thích phân tích số liệu, giải thích các quy luật hoặc xu hướng.', type: 'I' },
    { text: 'Mình thích thiết kế giao diện, làm áp phích hoặc sáng tạo hình ảnh.', type: 'A' },
    { text: 'Mình thích trò chuyện, chia sẻ và giải quyết mâu thuẫn cho bạn bè.', type: 'S' },
    { text: 'Mình thích lập kế hoạch, điều hành các buổi họp hoặc sự kiện.', type: 'E' },
    { text: 'Mình thích làm việc có quy trình, tuân thủ các quy định rõ ràng.', type: 'C' },
    // Round 4 (19-24)
    { text: 'Mình thích hoạt động ngoài trời, thể thao hoặc công việc đòi hỏi thể lực.', type: 'R' },
    { text: 'Mình thích tìm hiểu nguyên lý hoạt động của công nghệ hoặc cơ thể người.', type: 'I' },
    { text: 'Mình thích chơi nhạc cụ, ca hát hoặc tham gia các hoạt động biểu diễn.', type: 'A' },
    { text: 'Mình thích hướng dẫn học tập cho các em nhỏ hoặc người khác.', type: 'S' },
    { text: 'Mình thích thuyết trình ý tưởng, đàm phán hoặc thuyết phục đám đông.', type: 'E' },
    { text: 'Mình thích kiểm tra độ chính xác của các số liệu hoặc văn bản.', type: 'C' },
    // Round 5 (25-30)
    { text: 'Mình thích vận hành các thiết bị cơ khí, điện tử hoặc lái xe.', type: 'R' },
    { text: 'Mình thích nghiên cứu khoa học hoặc giải quyết các bài toán hóc búa.', type: 'I' },
    { text: 'Mình thích sáng tác bài hát, thiết kế thời trang hoặc đồ họa.', type: 'A' },
    { text: 'Mình thích tư vấn tâm lý, lắng nghe và đưa ra lời khuyên cho mọi người.', type: 'S' },
    { text: 'Mình thích quản lý một đội nhóm, chịu trách nhiệm về chỉ tiêu doanh số.', type: 'E' },
    { text: 'Mình thích lập báo cáo chi tiết, thống kê số liệu trên máy tính.', type: 'C' },
    // Round 6 (31-36)
    { text: 'Mình thích đo đạc, khảo sát địa hình hoặc chăm sóc cây trồng, nông nghiệp.', type: 'R' },
    { text: 'Mình thích đọc tạp chí khoa học, tìm hiểu giả thuyết toán học mới.', type: 'I' },
    { text: 'Mình thích thiết kế nội thất, sáng tạo kịch bản quảng cáo hoặc quay phim.', type: 'A' },
    { text: 'Mình thích hỗ trợ Y tế, chăm sóc sức khỏe cộng đồng và người bệnh.', type: 'S' },
    { text: 'Mình thích kêu gọi vốn đầu tư, đàm phán các giao dịch thương mại lớn.', type: 'E' },
    { text: 'Mình thích quản lý ngân sách thu chi, lập hóa đơn và rà soát kế toán.', type: 'C' },
    // Round 7 (37-42)
    { text: 'Mình thích lắp ráp, bảo trì hệ thống rô-bốt hoặc tự động hóa công nghiệp.', type: 'R' },
    { text: 'Mình thích nghiên cứu thuật toán máy tính, mô phỏng dữ liệu hoặc AI.', type: 'I' },
    { text: 'Mình thích chụp ảnh nghệ thuật, biên tập video chuyên nghiệp hoặc làm gốm.', type: 'A' },
    { text: 'Mình thích kết nối cộng đồng, tổ chức chương trình hỗ trợ thanh thiếu niên.', type: 'S' },
    { text: 'Mình thích tiếp thị sản phẩm, xây dựng thương hiệu cá nhân hoặc truyền thông.', type: 'E' },
    { text: 'Mình thích kiểm toán giấy tờ, lưu trữ hồ sơ thuế và hợp đồng pháp lý.', type: 'C' },
    // Round 8 (43-48)
    { text: 'Mình thích chế tác đồ gỗ, làm mộc hoặc thi công công trình xây dựng.', type: 'R' },
    { text: 'Mình thích điều tra, khám phá nguyên nhân của các hiện tượng tự nhiên.', type: 'I' },
    { text: 'Mình thích hòa âm phối khí, sản xuất âm nhạc hoặc dàn dựng sân khấu.', type: 'A' },
    { text: 'Mình thích tham vấn tâm lý học đường, hỗ trợ trẻ em có hoàn cảnh khó khăn.', type: 'S' },
    { text: 'Mình thích quản trị chuỗi cung ứng, mở rộng chi nhánh hoặc thương lượng mua bán.', type: 'E' },
    { text: 'Mình thích cập nhật bảng lương, kiểm kê kho hàng và quản lý tài sản cố định.', type: 'C' },
    // Round 9 (49-54)
    { text: 'Mình thích sửa chữa phần cứng máy tính, thiết bị điện dân dụng hoặc viễn thông.', type: 'R' },
    { text: 'Mình thích viết bài báo khoa học hoặc tham gia phát minh sáng chế mới.', type: 'I' },
    { text: 'Mình thích múa, đạo diễn sân khấu kịch hoặc sáng tạo nghệ thuật đương đại.', type: 'A' },
    { text: 'Mình thích làm công tác cứu trợ thiên tai, phụng sự cộng đồng xã hội.', type: 'S' },
    { text: 'Mình thích điều hành công ty, đưa ra các quyết định chiến lược kinh doanh.', type: 'E' },
    { text: 'Mình thích xây dựng danh mục tài liệu ngăn nắp và tự động hóa quy trình văn phòng.', type: 'C' },
    // Round 10 (55-60)
    { text: 'Mình thích bảo dưỡng xe cộ, máy móc công nghiệp nặng hoặc thiết bị hàng không.', type: 'R' },
    { text: 'Mình thích giải mã dữ liệu y sinh, phân tích gen hoặc sinh học phân tử.', type: 'I' },
    { text: 'Mình thích vẽ tranh minh họa, thiết kế phụ kiện thời trang hoặc thủ công mỹ nghệ.', type: 'A' },
    { text: 'Mình thích làm huấn luyện viên cá nhân (coaching), định hướng phát triển con người.', type: 'S' },
    { text: 'Mình thích quản lý dự án quy mô lớn và thúc đẩy tăng trưởng doanh thu.', type: 'E' },
    { text: 'Mình thích rà soát tính tuân thủ pháp lý, đối chiếu sổ sách và chứng từ doanh nghiệp.', type: 'C' }
  ] : [
    // Round 1 (1-6)
    { text: 'I like to work with animals, tools, or machines.', type: 'R' },
    { text: 'I like to solve math and science problems.', type: 'I' },
    { text: 'I like to do creative activities like art, drama, or music.', type: 'A' },
    { text: 'I like to help, teach, or provide service to others.', type: 'S' },
    { text: 'I like to lead and persuade people.', type: 'E' },
    { text: 'I like to work with numbers, records, or files in an orderly way.', type: 'C' },
    // Round 2 (7-12)
    { text: 'I enjoy repairing things or home appliances.', type: 'R' },
    { text: 'I enjoy conducting scientific experiments or research.', type: 'I' },
    { text: 'I enjoy writing stories, blog posts, or poetry.', type: 'A' },
    { text: 'I enjoy volunteering for social or charity causes.', type: 'S' },
    { text: 'I enjoy starting my own business or selling products.', type: 'E' },
    { text: 'I enjoy organizing data, files, and keeping archives organized.', type: 'C' },
    // Round 3 (13-18)
    { text: 'I like to design or build scale models and handcrafts.', type: 'R' },
    { text: 'I like to analyze data trends, patterns, or formulas.', type: 'I' },
    { text: 'I like to design websites, posters, or visual layouts.', type: 'A' },
    { text: 'I like to talk, share, and resolve conflicts for friends.', type: 'S' },
    { text: 'I like to plan, organize, and direct meetings or events.', type: 'E' },
    { text: 'I like following clear, structured procedures and rules.', type: 'C' },
    // Round 4 (19-24)
    { text: 'I like outdoor activities, sports, or physical work.', type: 'R' },
    { text: 'I like to research how technology or the human body works.', type: 'I' },
    { text: 'I like to play musical instruments, sing, or perform.', type: 'A' },
    { text: 'I like to tutor, teach, or guide children and others.', type: 'S' },
    { text: 'I like to pitch ideas, negotiate, or speak in public.', type: 'E' },
    { text: 'I like to verify figures or documents for total accuracy.', type: 'C' },
    // Round 5 (25-30)
    { text: 'I like operating mechanical, electronic equipment or driving.', type: 'R' },
    { text: 'I like doing scientific research or solving complex puzzles.', type: 'I' },
    { text: 'I like songwriting, fashion design, or graphic illustration.', type: 'A' },
    { text: 'I like counseling, active listening, and giving life advice.', type: 'S' },
    { text: 'I like managing a team and being responsible for targets.', type: 'E' },
    { text: 'I like compiling detailed reports and typing database entries.', type: 'C' },
    // Round 6 (31-36)
    { text: 'I enjoy land surveying, agriculture, or working with crops.', type: 'R' },
    { text: 'I enjoy reading scientific journals and investigating mathematical theories.', type: 'I' },
    { text: 'I enjoy interior decoration, filmmaking, or advertising concepts.', type: 'A' },
    { text: 'I enjoy healthcare assistance, patient care, or community health.', type: 'S' },
    { text: 'I enjoy venture fundraising, investing, and commercial deal-making.', type: 'E' },
    { text: 'I enjoy budget accounting, invoicing, and auditing financial ledgers.', type: 'C' },
    // Round 7 (37-42)
    { text: 'I enjoy assembling, testing, or maintaining robotics hardware.', type: 'R' },
    { text: 'I enjoy researching computer algorithms, data simulation, or AI.', type: 'I' },
    { text: 'I enjoy artistic photography, video editing, or pottery crafting.', type: 'A' },
    { text: 'I enjoy community outreach and organizing youth empowerment programs.', type: 'S' },
    { text: 'I enjoy product marketing, personal branding, and media campaigns.', type: 'E' },
    { text: 'I enjoy auditing tax documents, contract compliance, and legal filing.', type: 'C' },
    // Round 8 (43-48)
    { text: 'I enjoy woodworking, carpentry, or civil construction work.', type: 'R' },
    { text: 'I enjoy investigating the scientific causes behind natural phenomena.', type: 'I' },
    { text: 'I enjoy music arrangement, sound engineering, or stage directing.', type: 'A' },
    { text: 'I enjoy school counseling and supporting underprivileged youth.', type: 'S' },
    { text: 'I enjoy managing supply chains, branch expansion, or corporate M&A.', type: 'E' },
    { text: 'I enjoy payroll administration, inventory auditing, and asset logs.', type: 'C' },
    // Round 9 (49-54)
    { text: 'I enjoy repairing computer hardware, electrical wiring, or telecom equipment.', type: 'R' },
    { text: 'I enjoy writing scientific papers or inventing technological solutions.', type: 'I' },
    { text: 'I enjoy dance choreography, theater direction, or contemporary art.', type: 'A' },
    { text: 'I enjoy disaster relief work and humanitarian community service.', type: 'S' },
    { text: 'I enjoy executive leadership, business strategy, and risk governance.', type: 'E' },
    { text: 'I enjoy structuring corporate filing systems and workflow automation.', type: 'C' },
    // Round 10 (55-60)
    { text: 'I enjoy heavy machinery maintenance, automotive or aviation engineering.', type: 'R' },
    { text: 'I enjoy genomic analysis, microbiological testing, or biomedical data.', type: 'I' },
    { text: 'I enjoy book illustration, fashion accessory design, or artisan crafts.', type: 'A' },
    { text: 'I enjoy professional career coaching and personal development mentoring.', type: 'S' },
    { text: 'I enjoy directing enterprise-scale projects and scaling revenue growth.', type: 'E' },
    { text: 'I enjoy legal compliance auditing, financial reconciliations, and bookkeeping.', type: 'C' }
  ];

  const questions = quizLength ? allQuestions.slice(0, quizLength) : [];

  const handleAnswer = (value: number) => {
    const q = questions[step];
    const typeKey = q.type as keyof typeof scores;
    const newScores = { ...scores, [typeKey]: scores[typeKey] + value };
    setScores(newScores);
    setAnswersHistory([...answersHistory, { step, value, type: q.type }]);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      calculateResult(newScores, questions);
    }
  };

  const handlePrevQuestion = () => {
    if (step <= 0 || answersHistory.length === 0) return;
    const lastAns = answersHistory[answersHistory.length - 1];
    const typeKey = lastAns.type as keyof typeof scores;
    setScores({ ...scores, [typeKey]: Math.max(0, scores[typeKey] - lastAns.value) });
    setAnswersHistory(answersHistory.slice(0, -1));
    setStep(step - 1);
  };

  const calculateResult = (finalScores: typeof scores, activeQuestions: typeof questions) => {
    const counts = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    activeQuestions.forEach(q => {
      const typeKey = q.type as keyof typeof counts;
      counts[typeKey]++;
    });

    const normalized = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    Object.keys(finalScores).forEach(key => {
      const k = key as keyof typeof scores;
      normalized[k] = counts[k] > 0 ? (finalScores[k] / (counts[k] * 2)) * 100 : 0;
    });

    const sortedEntries = Object.entries(normalized).sort((a, b) => b[1] - a[1]);
    const topType = sortedEntries[0][0];
    const topCode = sortedEntries.slice(0, 3).map(([type]) => type).join('');

    const sortedScores = sortedEntries.map(([type, percentage]) => ({
      type,
      score: finalScores[type as keyof typeof scores],
      percentage: Math.round(percentage)
    }));

    const descriptions: any = {
      R: t.quizRealistic,
      I: t.quizInvestigative,
      A: t.quizArtistic,
      S: t.quizSocial,
      E: t.quizEnterprising,
      C: t.quizConventional,
    };

    setDetailedResult({
      topCode,
      sortedScores,
      topDescription: descriptions[topType] || descriptions['R']
    });

    setResult(`Mã Holland (RIASEC): ${topCode} - ${descriptions[topType] || ''}`);
  };

  const resetQuiz = () => {
    setStep(0);
    setScores({ R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 });
    setAnswersHistory([]);
    setResult(null);
    setDetailedResult(null);
    setQuizLength(null);
  };

  if (quizLength === null) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto p-4 sm:p-6 text-center space-y-6 w-full"
      >
        <div className="space-y-2">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {isVi ? 'Chọn phiên bản trắc nghiệm RIASEC' : 'Select RIASEC Quiz Version'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            {isVi 
              ? 'Lựa chọn số lượng câu hỏi phù hợp với quỹ thời gian của bạn. Phiên bản 60 câu là bài trắc nghiệm chuẩn quốc tế gốc (Holland Code).' 
              : 'Choose the question count that fits your time. The 60-question version is the original full Holland Code standard assessment.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 items-stretch">
          {[
            { 
              length: 13, 
              title: isVi ? 'Bản Rút gọn' : 'Quick Version', 
              desc: isVi ? 'Khảo sát nhanh sơ lược tính cách & sở thích cốt lõi.' : 'Fast core estimation', 
              time: isVi ? '⏱️ 2 phút' : '⏱️ 2 mins', 
              badge: isVi ? 'Nhanh' : 'Fast',
              icon: Icons.Zap,
              color: 'from-amber-500 to-orange-500',
              bgColor: 'bg-amber-50 dark:bg-amber-950/20',
              borderColor: 'hover:border-amber-400 dark:hover:border-amber-800',
              textColor: 'text-amber-600 dark:text-amber-400',
              glowColor: 'shadow-amber-500/5 hover:shadow-amber-500/15'
            },
            { 
              length: 20, 
              title: isVi ? 'Bản Tiêu chuẩn' : 'Standard Version', 
              desc: isVi ? 'Đo lường cân bằng, tối ưu hóa độ chính xác nghề nghiệp.' : 'Balanced & optimized', 
              time: isVi ? '⏱️ 4 phút' : '⏱️ 4 mins', 
              badge: isVi ? 'Khuyên dùng' : 'Recommended',
              icon: Icons.Sparkles,
              color: 'from-indigo-500 to-purple-500',
              bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
              borderColor: 'hover:border-indigo-400 dark:hover:border-indigo-800',
              textColor: 'text-indigo-600 dark:text-indigo-400',
              glowColor: 'shadow-indigo-500/5 hover:shadow-indigo-500/15'
            },
            { 
              length: 30, 
              title: isVi ? 'Bản Chuyên sâu' : 'In-depth Version', 
              desc: isVi ? 'Phân tích chi tiết các nhóm sở thích hành vi.' : 'Fully comprehensive', 
              time: isVi ? '⏱️ 6 phút' : '⏱️ 6 mins', 
              badge: isVi ? 'Toàn diện' : 'Complete',
              icon: Icons.Award,
              color: 'from-emerald-500 to-teal-500',
              bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
              borderColor: 'hover:border-emerald-400 dark:hover:border-emerald-800',
              textColor: 'text-emerald-600 dark:text-emerald-400',
              glowColor: 'shadow-emerald-500/5 hover:shadow-emerald-500/15'
            },
            { 
              length: 60, 
              title: isVi ? 'Bản Gốc Đầy Đủ' : 'Original Standard', 
              desc: isVi ? 'Bộ câu hỏi Holland Code gốc 60 câu, đo đạc tối đa độ chính xác cho 6 nhóm RIASEC.' : 'Original full 60-item Holland Code questionnaire for ultimate accuracy.', 
              time: isVi ? '⏱️ 10-12 phút' : '⏱️ 10-12 mins', 
              badge: isVi ? 'Chuẩn Quốc Tế' : 'Official Full',
              icon: Icons.Compass,
              color: 'from-rose-500 to-pink-600',
              bgColor: 'bg-pink-50 dark:bg-pink-950/20',
              borderColor: 'hover:border-pink-400 dark:hover:border-pink-800',
              textColor: 'text-pink-600 dark:text-pink-400',
              glowColor: 'shadow-pink-500/5 hover:shadow-pink-500/15'
            },
          ].map((opt, optIndex) => {
            const IconComponent = opt.icon;
            return (
              <motion.div 
                key={`quiz-opt-${opt.length}-${optIndex}`} 
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setQuizLength(opt.length);
                  setStep(0);
                  setScores({ R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 });
                  setAnswersHistory([]);
                }} 
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setQuizLength(opt.length);
                    setStep(0);
                    setScores({ R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 });
                    setAnswersHistory([]);
                  }
                }}
                className={`p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-white/5 bg-white dark:bg-[#0c0c0c] ${opt.borderColor} hover:bg-gray-50/50 dark:hover:bg-white/[0.02] text-left flex flex-col justify-between transition-all shadow-md hover:shadow-xl ${opt.glowColor} relative overflow-hidden group h-full cursor-pointer`}
              >
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${opt.color}`} />
                
                <div className="space-y-3 sm:space-y-4 w-full flex-1 flex flex-col">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-xl ${opt.bgColor} ${opt.textColor}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full text-white bg-gradient-to-r ${opt.color} tracking-wider`}>
                      {opt.badge}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className={`text-2xl font-black ${opt.textColor}`}>
                      {opt.length} <span className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">{isVi ? 'Câu' : 'Qs'}</span>
                    </span>
                    <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors pt-1">
                      {opt.title}
                    </h4>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed flex-1 pt-1">
                    {opt.desc}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs font-bold text-gray-400 dark:text-gray-500 w-full">
                  <span className="flex items-center gap-1.5">
                    {opt.time}
                  </span>
                  <div className={`flex items-center gap-1 font-semibold ${opt.textColor} group-hover:translate-x-1 transition-transform`}>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] uppercase tracking-wider">{isVi ? 'Bắt đầu' : 'Start'}</span>
                    <Icons.ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    );
  }

  const traitLabels: Record<string, { label: string; labelEn: string; color: string }> = {
    R: { label: "Thực tế (Realistic)", labelEn: "Realistic", color: "from-blue-500 to-indigo-500" },
    I: { label: "Nghiên cứu (Investigative)", labelEn: "Investigative", color: "from-indigo-500 to-purple-500" },
    A: { label: "Nghệ thuật (Artistic)", labelEn: "Artistic", color: "from-fuchsia-500 to-pink-500" },
    S: { label: "Xã hội (Social)", labelEn: "Social", color: "from-emerald-500 to-teal-500" },
    E: { label: "Thuyết phục (Enterprising)", labelEn: "Enterprising", color: "from-amber-500 to-orange-500" },
    C: { label: "Quy chuẩn (Conventional)", labelEn: "Conventional", color: "from-slate-500 to-gray-600" }
  };

  if (result && detailedResult) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center p-4 sm:p-6 text-center max-w-2xl mx-auto w-full"
      >
        <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-16 h-16 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-green-500/20"
        >
          <Icons.Check className="w-8 h-8" />
        </motion.div>
        
        <h3 className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">{t.quizResultTitle}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
          {isVi ? `Đã hoàn thành phiên bản ${quizLength} câu hỏi chuẩn RIASEC` : `Completed ${quizLength}-question RIASEC assessment`}
        </p>

        <div className="bg-white dark:bg-[#0d0d0d] p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-xl w-full text-left space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4">
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{isVi ? 'Mã Holland chính' : 'Primary Holland Code'}</span>
              <h4 className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">{detailedResult.topCode}</h4>
            </div>
            <div className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold border border-indigo-200 dark:border-indigo-800/40">
              {detailedResult.sortedScores[0]?.percentage}% {isVi ? 'Độ khớp' : 'Match'}
            </div>
          </div>

          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
            {detailedResult.topDescription}
          </p>

          <div className="space-y-3 pt-2">
            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{isVi ? 'Biểu đồ điểm số 6 nhóm RIASEC' : '6 RIASEC Scores Breakdown'}</h5>
            <div className="space-y-2.5">
              {detailedResult.sortedScores.map((item) => {
                const trait = traitLabels[item.type] || { label: item.type, labelEn: item.type, color: 'from-gray-500 to-slate-500' };
                return (
                  <div key={item.type} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-gray-800 dark:text-gray-200 font-semibold">{isVi ? trait.label : trait.labelEn}</span>
                      <span className="font-mono font-bold text-gray-600 dark:text-gray-400">{item.percentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${trait.color} rounded-full transition-all duration-700`} 
                        style={{ width: `${Math.max(8, item.percentage)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-6 w-full justify-center">
            <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={resetQuiz} 
                className="px-5 py-2.5 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-sm"
            >
            {t.retakeQuiz}
            </motion.button>
            <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onComplete(result)} 
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-500 hover:to-purple-500 transition-colors shadow-lg flex items-center gap-2 text-sm"
            >
            <Icons.MessageSquare className="w-4 h-4" /> {t.discussWithAI}
            </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto p-4 sm:p-6 w-full"
    >
      <div className="mb-6">
        <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
          <span>{t.question} {step + 1} {t.of} {questions.length}</span>
          <span className="text-indigo-600 dark:text-indigo-400 font-mono">{Math.round(((step + 1) / questions.length) * 100)}%</span>
        </div>
        <div className="w-full h-2.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden p-0.5 border border-gray-200/50 dark:border-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
          />
        </div>
      </div>

      <div className="min-h-[7rem] flex items-center justify-center mb-8 p-4 bg-gray-50/50 dark:bg-white/[0.02] rounded-2xl border border-gray-100 dark:border-white/5">
        <AnimatePresence mode="wait">
          <motion.h3 
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white text-center leading-relaxed w-full"
          >
            {questions[step]?.text}
          </motion.h3>
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: t.quizNo, value: 0, color: 'bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 border-red-200 dark:border-red-500/20' },
          { label: t.quizMaybe, value: 1, color: 'bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-500/10 dark:hover:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20' },
          { label: t.quizYes, value: 2, color: 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-600 border-emerald-200 dark:border-emerald-500/20' },
        ].map((opt) => (
          <motion.button 
            key={opt.value} 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleAnswer(opt.value)} 
            className={`p-4 rounded-xl border-2 font-bold text-base transition-all ${opt.color} flex flex-col items-center justify-center gap-1 shadow-sm hover:shadow cursor-pointer`}
          >
            {opt.label}
          </motion.button>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between text-xs">
        {step > 0 ? (
          <button 
            onClick={handlePrevQuestion}
            className="flex items-center gap-1.5 font-bold text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
          >
            <Icons.ChevronDown className="w-4 h-4 rotate-90" />
            <span>{isVi ? 'Câu trước' : 'Previous'}</span>
          </button>
        ) : <div />}

        <button 
          onClick={resetQuiz}
          className="text-gray-400 hover:text-red-500 transition-colors font-medium py-2 px-3 cursor-pointer"
        >
          {isVi ? 'Đổi phiên bản' : 'Change version'}
        </button>
      </div>
    </motion.div>
  );
};

// --- Main Component ---

const SidebarChatItem = ({ 
    session, 
    onClick, 
    onRename, 
    onStar, 
    onDelete, 
    t 
}: { 
    session: ChatSession, 
    onClick: () => void, 
    onRename: (id: string, newTitle: string) => void,
    onStar: (id: string) => void,
    onDelete: (e: React.MouseEvent, id: string) => void,
    t: any
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(session.title);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        if (isMenuOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuOpen]);

    const handleSaveEdit = () => {
        if (editValue.trim() && editValue !== session.title) {
            onRename(session.id, editValue.trim());
        } else {
            setEditValue(session.title);
        }
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="w-full flex items-center px-2 py-1 mb-1">
                <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit();
                        if (e.key === 'Escape') { setIsEditing(false); setEditValue(session.title); }
                    }}
                    onBlur={handleSaveEdit}
                    autoFocus
                    className="w-full bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1 text-sm text-gray-900 dark:text-white outline-none focus:border-indigo-500"
                />
            </div>
        );
    }

    return (
        <div className="relative group flex items-center w-full mb-1" ref={menuRef}>
            <motion.button 
                whileHover={{ scale: 1.01, x: 2 }}
                whileTap={{ scale: 0.99 }}
                onClick={onClick} 
                className="flex-1 flex items-center gap-2 text-left px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg truncate transition-colors pr-8"
            >
                {session.isStarred && <Icons.Star className="w-3 h-3 text-yellow-500 flex-shrink-0" fill="currentColor" />}
                <span className="truncate">{session.title}</span>
            </motion.button>
            <button
                onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-white/20 rounded-md transition-all z-10"
            >
                <Icons.MoreVertical className="w-4 h-4 text-gray-400" />
            </button>

            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 top-10 w-40 bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-xl shadow-lg overflow-hidden z-50 flex flex-col p-1 text-sm text-gray-700 dark:text-gray-300"
                    >
                        <button
                            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-left"
                            onClick={(e) => { e.stopPropagation(); onStar(session.id); setIsMenuOpen(false); }}
                        >
                            <Icons.Star className="w-4 h-4" /> {session.isStarred ? 'Unstar' : 'Star'}
                        </button>
                        <button
                            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-left"
                            onClick={(e) => { e.stopPropagation(); setIsEditing(true); setIsMenuOpen(false); }}
                        >
                            <Icons.Edit2 className="w-4 h-4" /> Rename
                        </button>
                        <button
                            className="flex items-center gap-2 px-3 py-2 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-left mt-1 border-t border-gray-100 dark:border-white/5 pt-2"
                            onClick={(e) => { onDelete(e, session.id); setIsMenuOpen(false); }}
                        >
                            <Icons.Trash2 className="w-4 h-4" /> Delete
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function App() {
  const [lang, setLang] = useState<Language>(Language.VI);
  const t = TRANSLATIONS[lang];
  // Default to LIGHT theme to avoid "black screen" feeling
  const [theme, setTheme] = useState<Theme>(Theme.LIGHT);
  const [mode, setMode] = useState<AppMode>(AppMode.LANDING);
  const [tab, setTab] = useState<DashboardTab>(DashboardTab.CHAT);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const landingCareersScrollRef = useRef<HTMLDivElement>(null);
  const scrollLandingCareersLeft = () => {
    if (landingCareersScrollRef.current) {
      landingCareersScrollRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };
  const scrollLandingCareersRight = () => {
    if (landingCareersScrollRef.current) {
      landingCareersScrollRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isFoundersModalOpen, setIsFoundersModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [upgradeFeatureName, setUpgradeFeatureName] = useState<string | undefined>(undefined);

  const triggerUpgradeModal = useCallback((featureName?: string) => {
    setUpgradeFeatureName(featureName);
    setIsUpgradeModalOpen(true);
  }, []);
  const [searchQuery, setSearchQuery] = useState('');

  const [auth, setAuth] = useState<AuthState>({ isAuthenticated: false, user: null });
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [authType, setAuthType] = useState<'login' | 'register' | 'forgot-password'>('login');
  const [authError, setAuthError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [isResetSending, setIsResetSending] = useState(false);
  const [isResetSent, setIsResetSent] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'success' | 'failed' | null>(null);

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTemporaryChat, setIsTemporaryChat] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentChatTitle, setCurrentChatTitle] = useState<string>('');
  const [welcomePhrase, setWelcomePhrase] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const recognitionRef = useRef<any>(null);
  
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    let g = lang === Language.VI ? 'Chào buổi sáng' : 'Good morning';
    if (hour >= 12 && hour < 18) {
        g = lang === Language.VI ? 'Chào buổi chiều' : 'Good afternoon';
    } else if (hour >= 18) {
        g = lang === Language.VI ? 'Chào buổi tối' : 'Good evening';
    }
    return {
      text: g,
      name: auth.user?.name || t.guest
    };
  }, [lang, auth.user?.name, t.guest]);

  const isSendingRef = useRef(false);

  useEffect(() => {
    if (t.welcomePhrases && t.welcomePhrases.length > 0) {
      setWelcomePhrase(t.welcomePhrases[Math.floor(Math.random() * t.welcomePhrases.length)]);
    }
  }, [lang, t.welcomePhrases]);

  useEffect(() => {
    if (messages.length === 0 && t.welcomePhrases && t.welcomePhrases.length > 0) {
        setWelcomePhrase(t.welcomePhrases[Math.floor(Math.random() * t.welcomePhrases.length)]);
    }
  }, [messages.length, t.welcomePhrases]);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);

  // Load chat history and current messages from IndexedDB on mount
  useEffect(() => {
    const loadChatData = async () => {
      if (auth.user?.email || auth.user?.isGuest) {
        setIsLoadingData(true);
        const userKey = auth.user?.email || 'guest';
        
        // Load History
        const storedHistory = await storage.get<ChatSession[]>(`chatHistory_${userKey}`);
        if (storedHistory) {
          // Ensure dates are actual Date objects
          const historyWithDates = storedHistory.map((session: any) => ({
            ...session,
            date: new Date(session.date),
            messages: session.messages.map((m: any) => ({
              ...m,
              timestamp: new Date(m.timestamp)
            }))
          }));
          setChatHistory(historyWithDates);
        } else {
          setChatHistory([]);
        }

        // Load Current Messages
        const storedMessages = await storage.get<ChatMessage[]>(`currentMessages_${userKey}`);
        if (storedMessages) {
          // Ensure dates are actual Date objects
          const messagesWithDates = storedMessages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }));
          setMessages(messagesWithDates);
        } else {
          setMessages([]);
        }
        setIsLoadingData(false);
      }
    };
    loadChatData();
  }, [auth.user?.email, auth.user?.isGuest]);

  // Save chat history to IndexedDB whenever it changes
  useEffect(() => {
    const saveHistory = async () => {
      if (auth.user?.email || auth.user?.isGuest) {
        const userKey = auth.user?.email || 'guest';
        await storage.set(`chatHistory_${userKey}`, chatHistory);
      }
    };
    saveHistory();
  }, [chatHistory, auth.user?.email, auth.user?.isGuest]);

  // Save current messages to IndexedDB whenever they change
  useEffect(() => {
    const saveMessages = async () => {
      if (auth.user?.email || auth.user?.isGuest) {
        const userKey = auth.user?.email || 'guest';
        await storage.set(`currentMessages_${userKey}`, messages);
      }
    };
    saveMessages();
  }, [messages, auth.user?.email, auth.user?.isGuest]);

  const [inputMsg, setInputMsg] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [thinkingText, setThinkingText] = useState(''); 
  const [selectedFile, setSelectedFile] = useState<{ data: string; mimeType: string; name: string } | null>(null);
  const [pastedTexts, setPastedTexts] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [inputDevices, setInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [selectedVoice, setSelectedVoice] = useState<string>('Aoede');
  const [voiceInputText, setVoiceInputText] = useState('');
  const liveSessionRef = useRef<LiveSessionManager | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hasAcceptedTerms') === 'true';
    }
    return true;
  });
  const [showCamera, setShowCamera] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const acceptTerms = () => {
    localStorage.setItem('hasAcceptedTerms', 'true');
    setHasAcceptedTerms(true);
  };

  // Load milestones from local storage on mount
  useEffect(() => {
    if (auth.user?.email) {
      const stored = localStorage.getItem(`roadmap_${auth.user.email}`);
      if (stored) {
        try {
          setMilestones(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse stored roadmap");
        }
      } else {
          setMilestones([]);
      }
    }
  }, [auth.user?.email]);

  // Save milestones to local storage whenever they change
  useEffect(() => {
    if (auth.user?.email && milestones.length > 0) {
      localStorage.setItem(`roadmap_${auth.user.email}`, JSON.stringify(milestones));
    }
  }, [milestones, auth.user?.email]);

  const extractRoadmapJson = (text: string): Milestone[] | null => {
    if (!text) return null;

    // 1. Try parsing structured JSON block first (Standard AI output for roadmap requests)
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\[\s*\{\s*"id":[\s\S]*?\}\s*\]/);
    if (jsonMatch) {
      try {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        const data = JSON.parse(jsonStr);
        if (Array.isArray(data) && data.length > 0 && data[0].id && data[0].title) {
          return data;
        }
      } catch (e) {
        // Fall through to strict phase parsing
      }
    }

    // 2. Strict phase-based parsing ONLY if the message explicitly organizes by months/phases (Tháng 1, Giai đoạn 1, Month 1, Phase 1)
    const lower = text.toLowerCase();
    const hasExplicitPhases = 
      (lower.includes("tháng 1") && lower.includes("tháng 2")) ||
      (lower.includes("giai đoạn 1") && lower.includes("giai đoạn 2")) ||
      (lower.includes("month 1") && lower.includes("month 2")) ||
      (lower.includes("phase 1") && lower.includes("phase 2"));

    if (!hasExplicitPhases) return null;

    const lines = text.split('\n');
    const parsedMilestones: Milestone[] = [];
    let currentTitle = '';
    let currentDesc: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      const isPhaseHeader = (
        /^\*\*(?:tháng|giai đoạn|month|phase)\s*\d+.*?\*\*/i.test(trimmed) ||
        /^(?:tháng|giai đoạn|month|phase)\s*\d+[:\.\-]/i.test(trimmed) ||
        /^#{1,4}\s+(?:tháng|giai đoạn|month|phase)\s*\d+/i.test(trimmed)
      ) && trimmed.length < 100;

      if (isPhaseHeader) {
        if (currentTitle) {
          parsedMilestones.push({
            id: `ms-gen-${parsedMilestones.length + 1}`,
            title: currentTitle.replace(/\*+/g, '').replace(/^#+\s*/, '').trim(),
            description: currentDesc.join(' ').replace(/\*+/g, '').trim() || currentTitle,
            status: parsedMilestones.length === 0 ? 'in-progress' : 'todo'
          });
        }
        currentTitle = trimmed.replace(/^#+\s*/, '').replace(/\*+/g, '').trim();
        currentDesc = [];
      } else if (currentTitle && trimmed && !trimmed.startsWith('```')) {
        currentDesc.push(trimmed);
      }
    }

    if (currentTitle) {
      parsedMilestones.push({
        id: `ms-gen-${parsedMilestones.length + 1}`,
        title: currentTitle.replace(/\*+/g, '').replace(/^#+\s*/, '').trim(),
        description: currentDesc.join(' ').replace(/\*+/g, '').trim() || currentTitle,
        status: parsedMilestones.length === 0 ? 'in-progress' : 'todo'
      });
    }

    if (parsedMilestones.length >= 2) {
      return parsedMilestones.slice(0, 6);
    }

    return null;
  };

  const extractClarificationJson = (text: string): Clarification | null => {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{\s*"type":\s*"clarification"[\s\S]*?\}/);
    if (jsonMatch) {
      try {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        const data = JSON.parse(jsonStr);
        if (data.type === 'clarification' && data.question && Array.isArray(data.options)) {
          return data;
        }
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const handleSyncRoadmap = (jsonMilestones: Milestone[]) => {
    const processed = jsonMilestones.map(m => ({
        ...m,
        id: m.id || Math.random().toString(36).substring(7),
        status: m.status || 'todo',
        comments: m.comments || []
    }));
    setMilestones(processed);
    setTab(DashboardTab.PROGRESS);
    showToast(t.roadmapUpdated, 'success');
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleLoadTheNextXPreset = () => {
    setAuth({
      isAuthenticated: true,
      user: THE_NEXTX_USER_PROFILE
    });
    setMilestones(THE_NEXTX_MILESTONES);
    setChatHistory(THE_NEXTX_CHAT_SESSIONS);
    if (THE_NEXTX_CHAT_SESSIONS.length > 0) {
      setMessages(THE_NEXTX_CHAT_SESSIONS[0].messages);
      setCurrentSessionId(THE_NEXTX_CHAT_SESSIONS[0].id);
      setCurrentChatTitle(THE_NEXTX_CHAT_SESSIONS[0].title);
    }
    setTab(DashboardTab.CHAT);
    showToast('🌟 Đã tải toàn bộ mẫu số liệu tài khoản THE NEXTX (Đấu trường AI Kinh doanh 2026) thành công!', 'success');
  };

  const startCamera = async () => {
    try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setCameraStream(mediaStream);
        setShowCamera(true);
        // Need a small timeout to ensure video element is rendered
        setTimeout(() => {
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        }, 100);
    } catch (err) {
        showToast(t.cameraDenied, 'error');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            const base64Data = dataUrl.split(',')[1];
            setSelectedFile({ data: base64Data, mimeType: 'image/jpeg', name: 'photo.jpg' });
            stopCamera();
        }
    }
  };


  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          if (!file.type.startsWith('image/')) {
              showToast(t.invalidImage, 'error');
              if (e.target) e.target.value = '';
              return;
          }
          if (file.size > 5 * 1024 * 1024) { // 5MB limit
              showToast(t.imageTooLarge, 'error');
              if (e.target) e.target.value = '';
              return;
          }
          const reader = new FileReader();
          reader.onload = (event) => {
              const img = new Image();
              img.onload = () => {
                  const canvas = document.createElement('canvas');
                  const MAX_WIDTH = 1024;
                  const MAX_HEIGHT = 1024;
                  let width = img.width;
                  let height = img.height;

                  if (width > height) {
                      if (width > MAX_WIDTH) {
                          height *= MAX_WIDTH / width;
                          width = MAX_WIDTH;
                      }
                  } else {
                      if (height > MAX_HEIGHT) {
                          width *= MAX_HEIGHT / height;
                          height = MAX_HEIGHT;
                      }
                  }

                  canvas.width = width;
                  canvas.height = height;
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                      ctx.imageSmoothingEnabled = true;
                      ctx.imageSmoothingQuality = 'high';
                      ctx.drawImage(img, 0, 0, width, height);
                  }
                  
                  // Use WebP or JPEG with high quality to balance size and quality
                  const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
                  updateUserProfile({ avatar: dataUrl });
              };
              img.onerror = () => {
                  showToast(t.failedToLoadImage, 'error');
              };
              if (typeof event.target?.result === 'string') {
                  img.src = event.target.result;
              }
          };
          reader.onerror = () => {
              showToast(t.failedToReadFile, 'error');
          };
          reader.readAsDataURL(file);
      }
      if (e.target) e.target.value = '';
  };

  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'Escape' && isProfileModalOpen) {
              setIsProfileModalOpen(false);
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isProfileModalOpen]);

  // Custom Model State
  const [customEndpoint, setCustomEndpoint] = useState('http://localhost:11434/v1/chat/completions');
  const [customModelName, setCustomModelName] = useState('llama3');
  
  useEffect(() => {
    if (theme === Theme.DARK) { document.documentElement.classList.add('dark'); } 
    else { document.documentElement.classList.remove('dark'); }
  }, [theme]);
  
  // Listen for Firebase Auth State Changes
  useEffect(() => {
      if (!firebaseAuth) {
          const storedUser = localStorage.getItem('currentUser');
          if (storedUser) {
              try {
                  let userObj = JSON.parse(storedUser);
                  setAuth({ isAuthenticated: true, user: userObj });
                  if (mode === AppMode.AUTH && !userObj.isGuest) {
                      setMode(AppMode.DASHBOARD);
                  }
              } catch (e) {
                  setAuth({ isAuthenticated: false, user: null });
              }
          }
          return;
      }

      const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
          if (firebaseUser) {
              let avatarUrl = firebaseUser.photoURL || AVATARS[Math.floor(Math.random() * AVATARS.length)];
              
              let user: UserProfile = {
                  name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "User",
                  email: firebaseUser.email || "",
                  avatar: avatarUrl,
                  careerGoal: 'Undecided',
                  isGuest: false,
                  aiProvider: AIProvider.GEMINI,
                  provider: 'google'
              };

              // Check if we already have a cached 'currentUser' in local storage for this email to retain progress
              const storedUserStr = localStorage.getItem('currentUser');
              if (storedUserStr) {
                  try {
                      const cachedUser = JSON.parse(storedUserStr);
                      if (cachedUser.email === user.email) {
                          user = { ...user, ...cachedUser };
                      }
                  } catch (e) {
                      console.error("Failed to parse cached user:", e);
                  }
              }

              // Immediately authenticate locally and redirect to dashboard to prevent freezing/hanging
              setAuth({ isAuthenticated: true, user });
              localStorage.setItem('currentUser', JSON.stringify(user));
              
              if (mode === AppMode.AUTH && !user.isGuest) {
                  setMode(AppMode.DASHBOARD);
              }

              // Pull cloud synchronization asynchronously in the background so it doesn't block the UI switch
              (async () => {
                  try {
                      let updatedUser = { ...user };
                      const cloudProfile = await fetchUserProfileFromCloud(firebaseUser.uid);
                      if (cloudProfile) {
                          updatedUser = { ...updatedUser, ...cloudProfile };
                          // Sync local state with refreshed cloud settings
                          setAuth({ isAuthenticated: true, user: updatedUser });
                          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                      } else {
                          // First time logging in with a new account - synchronize initial profile settings
                          await syncUserProfileToCloud(firebaseUser.uid, updatedUser);
                      }

                      // Retrieve their saved roadmaps/milestones
                      const cloudRoadmap = await fetchRoadmapFromCloud(firebaseUser.uid);
                      if (cloudRoadmap && cloudRoadmap.length > 0) {
                          setMilestones(cloudRoadmap);
                      }

                      // Retrieve all chat sessions
                      const cloudSessions = await fetchChatSessionsFromCloud(firebaseUser.uid);
                      if (cloudSessions && cloudSessions.length > 0) {
                          setChatHistory(cloudSessions);
                      }
                  } catch (cloudErr) {
                      console.error("Failed to fetch cloud sync on login:", cloudErr);
                  }
              })();
          } else {
              // If not logged in via Firebase, check local storage for custom login or guest
              const storedUser = localStorage.getItem('currentUser');
              if (storedUser) {
                  try {
                      let userObj = JSON.parse(storedUser);
                      setAuth({ isAuthenticated: true, user: userObj });
                      localStorage.setItem('currentUser', JSON.stringify(userObj));
                      if (mode === AppMode.AUTH && !userObj.isGuest) {
                          setMode(AppMode.DASHBOARD);
                      }
                  } catch (e) {
                      setAuth({ isAuthenticated: false, user: null });
                  }
              } else {
                  setAuth({ isAuthenticated: false, user: null });
              }
          }
      });
      return () => unsubscribe();
  }, [mode]);

  useEffect(() => {
      if (auth.user?.customEndpoint) setCustomEndpoint(auth.user.customEndpoint);
      if (auth.user?.customModelName) setCustomModelName(auth.user.customModelName);
  }, [auth.user]);

  // Removed redundant localStorage check since it's handled in onAuthStateChanged

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
  useEffect(() => { scrollToBottom(); }, [messages, isChatLoading]);
  useEffect(() => { transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [transcripts]);

  const toggleLang = () => { setLang(l => l === Language.EN ? Language.VI : Language.EN); };
  const toggleTheme = () => { setTheme(t => t === Theme.LIGHT ? Theme.DARK : Theme.LIGHT); };
  const getRandomAvatar = () => AVATARS[Math.floor(Math.random() * AVATARS.length)];
  
  const updateUserProfile = (updates: Partial<UserProfile>) => {
      if (!auth.user) return;
      
      const newUser = { ...auth.user, ...updates };
      setAuth({ ...auth, user: newUser });
      
      try {
          localStorage.setItem('currentUser', JSON.stringify(newUser));
          if (updates.customWsUrl !== undefined) {
              if (updates.customWsUrl) {
                  localStorage.setItem('gemini_live_ws_url', updates.customWsUrl);
              } else {
                  localStorage.removeItem('gemini_live_ws_url');
              }
          }
          if (firebaseAuth?.currentUser) {
              syncUserProfileToCloud(firebaseAuth.currentUser.uid, newUser).catch(e => console.error("Cloud profile sync failed:", e));
          }
      } catch (e) {
          console.error("Failed to save user profile to localStorage", e);
          showToast(t.failedToSaveProfile, 'error');
      }
  };

  const awardExperiencePoints = (earned: number, newBadgeId?: string) => {
      if (!auth.user) return;
      const currentPoints = auth.user.points || 0;
      const updatedPoints = currentPoints + earned;
      const updatedLevel = Math.floor(updatedPoints / 300) + 1;
      
      const updatedBadges = [...(auth.user.badges || [])];
      if (newBadgeId && !updatedBadges.includes(newBadgeId)) {
          updatedBadges.push(newBadgeId);
          showToast(lang === Language.VI 
            ? `🎉 Bạn đã mở khóa huy hiệu: ${newBadgeId.toUpperCase()}` 
            : `🎉 Unlocked badge! ${newBadgeId.toUpperCase()}`, 'success');
      }

      updateUserProfile({
          points: updatedPoints,
          level: updatedLevel,
          badges: updatedBadges
      });

      showToast(lang === Language.VI ? `✨ +${earned} Điểm kinh nghiệm!` : `✨ +${earned} XP!`, 'success');
  };

  // Synchronize milestones to Firestore cloud persistently
  React.useEffect(() => {
      if (firebaseAuth?.currentUser && milestones.length > 0) {
          syncRoadmapToCloud(firebaseAuth.currentUser.uid, milestones).catch(e => console.error("Milestones sync failed:", e));
      }
  }, [milestones]);

  // Synchronize active chat session to cloud persistently
  React.useEffect(() => {
      if (messages.length > 0 && !isTemporaryChat && firebaseAuth?.currentUser) {
          const firstText = messages[0]?.text || 'New Chat';
          const title = currentChatTitle || (firstText.length > 30 ? firstText.substring(0, 30) + "..." : firstText);
          const activeSessionId = currentSessionId || Date.now().toString();
          
          const activeSession: ChatSession = {
              id: activeSessionId,
              title,
              date: new Date(),
              messages: [...messages]
          };
          syncChatSessionToCloud(firebaseAuth.currentUser.uid, activeSession).catch(e => console.error("Cloud chat sync failed:", e));
      }
  }, [messages, currentChatTitle, currentSessionId, isTemporaryChat]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const name = nameRef.current?.value;
    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;

    if (!name || !email || !password) return setAuthError(t.fillAllFields);

    if (!firebaseAuth) {
        return setAuthError(t.firebaseNotConfigured);
    }

    setIsGoogleLoading(true);
    try {
        const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        const firebaseUser = userCredential.user;

        const newUser: UserProfile = { 
            name, 
            email, 
            careerGoal: t.undecided || 'Undecided', 
            avatar: getRandomAvatar(),
            aiProvider: AIProvider.GEMINI,
            customEndpoint: 'http://localhost:11434/v1/chat/completions',
            customModelName: 'llama3',
            provider: 'email',
            subscription: DEFAULT_FREE_SUBSCRIPTION
        };

        // Sync initially to cloud
        await syncUserProfileToCloud(firebaseUser.uid, newUser);
        
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        setAuth({ isAuthenticated: true, user: newUser });
        setMode(AppMode.DASHBOARD);
    } catch (error: any) {
        console.error("Firebase Register Error", error);
        let errMsg = error.message || String(error);
        if (errMsg.includes("api-key-not-valid") || errMsg.includes("invalid-api-key") || error.code === 'auth/invalid-api-key') {
            setAuthError(lang === Language.VI 
                ? "Lỗi khóa API Firebase (auth/api-key-not-valid): Khóa API Key của bạn không hợp lệ hoặc đã bị Google thu hồi/vô hiệu hóa. Vui lòng vào Google Cloud Console hoặc Firebase Console để kích hoạt lại danh mục khóa hoặc tạo khóa mới, sau đó cập nhật trong tệp cấu hình."
                : "Firebase API Key error (auth/api-key-not-valid): Your API Key is invalid or has been revoked/deactivated by Google. Please check Google Cloud Console or Firebase Console to reactivate or create a new key, then update your configuration.");
        } else if (error.code === 'auth/email-already-in-use') {
            setAuthError(t.emailRegistered || "This email is already registered.");
        } else if (error.code === 'auth/weak-password') {
            setAuthError(lang === Language.VI ? "Mật khẩu quá yếu (tối thiểu 6 ký tự)." : "Password is too weak (minimum 6 characters).");
        } else if (error.code === 'auth/invalid-email') {
            setAuthError(lang === Language.VI ? "Địa chỉ email không hợp lệ." : "Invalid email address.");
        } else {
            setAuthError(errMsg);
        }
    } finally {
        setIsGoogleLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;

    if (!email || !password) return setAuthError(t.fillAllFields);

    if (!firebaseAuth) {
        return setAuthError(t.firebaseNotConfigured);
    }

    setIsGoogleLoading(true);
    try {
        await signInWithEmailAndPassword(firebaseAuth, email, password);
    } catch (error: any) {
        console.error("Firebase Login Error", error);
        let errMsg = error.message || String(error);
        if (errMsg.includes("api-key-not-valid") || errMsg.includes("invalid-api-key") || error.code === 'auth/invalid-api-key') {
            setAuthError(lang === Language.VI 
                ? "Lỗi khóa API Firebase (auth/api-key-not-valid): Khóa API Key của bạn không hợp lệ hoặc đã bị Google thu hồi/vô hiệu hóa. Vui lòng vào Google Cloud Console hoặc Firebase Console để kích hoạt lại danh mục khóa hoặc tạo khóa mới, sau đó cập nhật trong tệp cấu hình."
                : "Firebase API Key error (auth/api-key-not-valid): Your API Key is invalid or has been revoked/deactivated by Google. Please check Google Cloud Console or Firebase Console to reactivate or create a new key, then update your configuration.");
        } else if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            setAuthError(t.invalidLogin || "Invalid email or password.");
        } else if (error.code === 'auth/invalid-email') {
            setAuthError(lang === Language.VI ? "Địa chỉ email không hợp lệ." : "Invalid email address.");
        } else {
            setAuthError(error.message || t.invalidLogin);
        }
    } finally {
        setIsGoogleLoading(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    setAuthError('');
    if (!firebaseAuth || !googleProvider) {
        if (firebaseInitError) {
            const errMsg = firebaseInitError.message || String(firebaseInitError);
            if (errMsg.includes("invalid-api-key") || errMsg.includes("invalid-credential") || errMsg.includes("API key")) {
                setAuthError(lang === Language.VI 
                    ? "Lỗi kết nối Firebase (auth/invalid-api-key): Khóa API Key của bạn bị Google thu hồi hoặc từ chối do lộ tệp cấu hình trên Git công khai. Vui lòng vào Google Cloud / Firebase Console để kích hoạt lại danh mục khóa API Key hoặc Tạo khóa mới và cập nhật trong tệp cấu hình."
                    : "Firebase connection error (auth/invalid-api-key): Your API Key was revoked or deactivated by Google because it was exposed publicly on Git. Please visit Firebase/Google Cloud Console to reactivate your API Key, or create a new key and update your configuration.");
                return;
            }
            setAuthError(`${t.firebaseNotConfigured}: ${errMsg}`);
            return;
        }
        setAuthError(t.firebaseNotConfigured);
        return;
    }

    setIsGoogleLoading(true);
    try {
        const result = await signInWithPopup(firebaseAuth, googleProvider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential?.accessToken) {
            setGoogleAccessToken(credential.accessToken);
        }
    } catch (error: any) {
        console.error("Google Auth Error", error);
        let errMsg = error.message || String(error);
        if (errMsg.includes("api-key-not-valid") || errMsg.includes("invalid-api-key") || error.code === 'auth/invalid-api-key') {
            setAuthError(lang === Language.VI 
                ? "Lỗi khóa API Firebase (auth/api-key-not-valid): Khóa API Key của bạn không hợp lệ hoặc đã bị Google thu hồi/vô hiệu hóa. Vui lòng vào Google Cloud Console hoặc Firebase Console để kích hoạt lại danh mục khóa hoặc tạo khóa mới, sau đó cập nhật trong tệp cấu hình."
                : "Firebase API Key error (auth/api-key-not-valid): Your API Key is invalid or has been revoked/deactivated by Google. Please check Google Cloud Console or Firebase Console to reactivate or create a new key, then update your configuration.");
        } else if (error.code === 'auth/unauthorized-domain' || error.message?.includes('auth/unauthorized-domain')) {
             setAuthError(lang === Language.VI 
                ? `Lỗi: Tên miền hiện tại chưa được cấp phép. Vui lòng hướng dẫn thêm "${window.location.hostname}" vào Authorized domains trong Firebase Console > Authentication > Settings.` 
                : `Error: The current domain is unauthorized. Please add "${window.location.hostname}" to Authorized domains in Firebase Console > Authentication > Settings.`);
        } else if (error.code === 'auth/popup-closed-by-user' || error.message?.includes('popup-closed-by-user')) {
             setAuthError(lang === Language.VI
                ? `Đăng nhập thất bại: Bạn đã đóng cửa sổ đăng nhập Google quá sớm hoặc trình duyệt đang chặn Pop-up (auth/popup-closed-by-user).`
                : `Login failed: The sign-in popup was closed before completion, or your browser is blocking popups (auth/popup-closed-by-user).`);
        } else {
             setAuthError(`${t.loginFailed} ${error.message}`);
        }
    } finally {
        setIsGoogleLoading(false);
    }
  };

  const handleGoogleCalendarConnect = async (): Promise<string | null> => {
    if (!firebaseAuth || !googleProvider) {
        showToast(lang === Language.VI ? "Lỗi: Chưa cấu hình Firebase." : "Error: Firebase is not configured.", 'error');
        return null;
    }
    try {
        googleProvider.addScope('https://www.googleapis.com/auth/calendar.events');
        googleProvider.addScope('https://www.googleapis.com/auth/calendar');
        
        const result = await signInWithPopup(firebaseAuth, googleProvider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential?.accessToken) {
            setGoogleAccessToken(credential.accessToken);
            showToast(lang === Language.VI ? "Kết nối Google Calendar thành công!" : "Connected to Google Calendar successfully!", 'success');
            return credential.accessToken;
        }
        return null;
    } catch (error: any) {
        console.error("Calendar integration error:", error);
        showToast(lang === Language.VI ? "Kết nối Google Calendar thất bại." : "Failed to connect to Google Calendar.", 'error');
        return null;
    }
  };
  
  const handleSendResetCode = async (e: React.FormEvent) => {
      e.preventDefault();
      setAuthError('');
      const email = emailRef.current?.value;
      if (!email) return setAuthError(t.enterEmail);

      if (!firebaseAuth) {
          return setAuthError(t.firebaseNotConfigured);
      }

      setIsResetSending(true);
      try {
          await sendPasswordResetEmail(firebaseAuth, email);
          setIsResetSent(true);
          showToast(t.linkSent || "Success! Please check your email for the reset link.", 'success');
      } catch (error: any) {
          console.error("Firebase Reset Error:", error);
          if (error.code === 'auth/user-not-found') {
              setAuthError(t.emailNotFound || "Email address not found.");
          } else if (error.code === 'auth/invalid-email') {
              setAuthError(lang === Language.VI ? "Địa chỉ email không hợp lệ." : "Invalid email address.");
          } else {
              setAuthError(error.message || String(error));
          }
      } finally {
          setIsResetSending(false);
      }
  };

  const handleGuestLogin = () => {
    const guestUser = { name: t.guest, email: '', careerGoal: t.exploring, isGuest: true, avatar: getRandomAvatar(), aiProvider: AIProvider.GEMINI, subscription: DEFAULT_FREE_SUBSCRIPTION };
    localStorage.setItem('currentUser', JSON.stringify(guestUser));
    setAuth({ isAuthenticated: true, user: guestUser });
    setMode(AppMode.DASHBOARD);
  };

  const handleActivateDemo = async () => {
    const isVi = lang === Language.VI;
    const demoEmail = "trial.nextx2026@gmail.com";
    
    const demoUserByLanguage: UserProfile = {
      name: isVi ? "Nguyễn Đức Anh (NextX 2026 Preview)" : "Alex Nguyen (NextX 2026 Preview)",
      email: demoEmail,
      careerGoal: isVi 
        ? "Kỹ sư Trí tuệ Nhân tạo / ML Engineer chuyên sâu Thị giác Máy tính" 
        : "AI Engineer / ML Specialist focusing on Computer Vision",
      careerProfile: isVi 
        ? "Lớp 11 chuyên Tin học. Tổ hợp quan tâm: STEM (A00, A01). Năng lực thế mạnh: Lập trình, Toán Logic. Có điểm RIASEC ưu tiên cao ở tính cách Realistic (Kỹ thuật) dồi dào và Investigative (Nghiên cứu) nhạy bén."
        : "11th Grade STEM Student. Competency focus: Coding & Tech, Logical Math. High RIASEC prioritizations in Realistic and Investigative traits.",
      isGuest: true,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      streak: 7,
      points: 1550,
      level: 4,
      badges: ["NextX 2026 Pioneer", "Code Ninja", "High Achiever", "Scholar Champion"],
      hasCompletedOnboarding: true,
      subscription: DEFAULT_FREE_SUBSCRIPTION,
      portfolio: [
        {
          id: 'p1',
          type: 'Grade/Score',
          title: isVi ? 'Điểm Toán THPT học kỳ II' : 'High School Math GPA',
          description: isVi ? 'Đạt điểm tổng kết môn Toán lớp 11: 9.8/10. Môn Tin học đạt tối đa 10/10.' : 'Completed 11th Grade with 9.8/10 Math Grade and 10/10 Computer Science score.',
          date: '2025-06-01',
          score: '9.8 GPA'
        },
        {
          id: 'p2',
          type: 'Certificate',
          title: 'IELTS Academic International',
          description: isVi ? 'Chứng chỉ ngoại ngữ quốc tế cấp bởi IDP Education.' : 'Global Academic English certificate compiled by IDP Education.',
          date: '2026-01-15',
          score: '7.5 IELTS'
        },
        {
          id: 'p3',
          type: 'Personal Project',
          title: isVi ? 'Hệ thống Robot AI phân loại rác thông minh' : 'Smart Recycling AI classification robot',
          description: isVi 
            ? 'Thiết kế Robot sử dụng camera OpenCV, mạng nơ-ron YOLOv8 để phân tách rác thải hữu cơ/ vô cơ. Đạt giải Nhất hội thi Tin học trẻ Thành Phố.'
            : 'Designed visual sorting arm using OpenCV and custom YOLOv8 deep learning. Awarded 1st place in City Science Fair.',
          date: '2026-04-20',
          score: '1st Place'
        }
      ]
    };

    const mockRoadmap: Milestone[] = [
      {
        id: 'r1',
        title: isVi ? 'Tháng 1: Học Python chuyên sâu & Giải thuật ML' : 'Month 1: Advanced Python & ML Architectures',
        description: isVi 
          ? 'Nắm chắc kiến thức hồi quy tuyến tính, SVM, mạng nơ-ron nhân tạo thông qua PyTorch.' 
          : 'Complete linear models, SVMs, neural networks via PyTorch core modules.',
        status: 'done',
        deadline: '2026-07-15'
      },
      {
        id: 'r2',
        title: isVi ? 'Tháng 2: Tích hợp thư viện OpenCV & mô hình YOLOv9' : 'Month 2: OpenCV & YOLOv9 Deployment',
        description: isVi 
          ? 'Thử nghiệm xử lý luồng dữ liệu hình ảnh trực tiếp từ camera, tối ưu hóa thời gian xử lý.' 
          : 'Deploy real-time camera inference models, optimizing CPU bounding box speeds.',
        status: 'in-progress',
        deadline: '2026-08-15'
      },
      {
        id: 'r3',
        title: isVi ? 'Tháng 3: Triển khai Đám mây & Rèn luyện Phỏng vấn thử' : 'Month 3: Cloud API Deploy & Mock Interviews',
        description: isVi 
          ? 'Đóng gói sản phẩm qua Docker, thực hành phỏng vấn thử trên ứng dụng để cải thiện câu trả lời.' 
          : 'Package code with Docker registries and practice multiple mock interview simulations.',
        status: 'todo',
        deadline: '2026-09-15'
      }
    ];

    const mockSession: ChatSession = {
      id: 'demo-chat-session',
      title: isVi ? 'Định hướng Kỹ sư Trí tuệ Nhân tạo' : 'AI Specialist Consultation',
      date: new Date(),
      messages: [
        {
          id: 'm1',
          role: 'user',
          text: isVi ? 'Mình muốn tìm hiểu về lộ trình học tập để trở thành một Kỹ sư Trí tuệ Nhân tạo (AI Engineer) tại Việt Nam trong năm 2026. Nên chuẩn bị những gì?' : 'Show me advice on becoming an AI Engineer in Vietnam with my specific STEM background?',
          timestamp: new Date(Date.now() - 3600000)
        },
        {
          id: 'm2',
          role: 'model',
          text: isVi 
            ? "### Chào Đức Anh! Chúc mừng bạn đã đăng ký trải nghiệm CareerGuide AI!\n\nDựa trên hồ sơ rực rỡ của bạn với thế mạnh môn Toán học (9.8 GPA), tiếng Anh tự tin (IELTS 7.5) và đạt giải Nhất dự án sáng chế Robot AI, bạn đang sở hữu nền tảng lý tưởng hàng đầu Việt Nam hiện nay để tự tin đạt được hoài bão.\n\nDưới đây là định hướng cập nhật thực tế năm 2026 dành riêng cho bạn:\n\n*   **Về xu hướng tuyển dụng:** Các doanh nghiệp công nghệ lớn của Việt Nam (như FPT, VinAI, VNG) đang ưu tiên các ứng viên có kỹ năng thực hành (Hands-on) tốt và am hiểu Cloud (AWS, GCP). \n*   **Thu nhập trung bình:** Mức thu nhập khởi điểm Junior ML/AI Engineer dao động ở mức **18,000,000đ - 25,000,000đ/tháng**, và có thể đạt **60,000,000đ/tháng** trở lên sau 3 năm lăn lộn.\n*   **Gợi ý Học bổng & Đại học:** Bạn nên nhắm trực tiếp vào Ngành Khoa học Máy tính tiên tiến tại Đại học Bách Khoa TP.HCM (hoặc Hà Nội) hay VinUni để tham khảo thêm học bổng tài trợ tài năng.\n\nHãy nhấp vào tab **Lộ trình (Progress)** để xem bản đồ mạng lưới kỹ năng (Skill Maps) trực quan được thiết kế riêng dựa trên mục tiêu này nhé!"
            : "### Welcome back, Alex!\n\nGiven your exceptional profile including a 9.8 THPT Math GPA, 7.5 IELTS proficiency, and first-place young creators robotics prize, you are in peak position to master AI/ML applications.\n\n*   **2026 Corporate Demand:** Top R&D hubs like VinAI, FPT, and VNG represent massive recruiting streams, in search of candidates with solid OpenCV foundations and cloud hosting configurations.\n*   **Compensation levels:** Junior AI specialists start at **$800 - $1100 USD/month**, and scale past **$2500 USD/month** at Lead levels.\n*   **Next step:** Choose our Progress tab to inspect the interactive Roadmap calendar we have prepared for you!",
          timestamp: new Date(Date.now() - 3500000)
        }
      ]
    };

    try {
      localStorage.setItem('currentUser', JSON.stringify(demoUserByLanguage));
      localStorage.setItem(`roadmap_${demoEmail}`, JSON.stringify(mockRoadmap));
      
      const demoSkillProgress = {
        python: 100,
        sql: 80,
        stats: 75,
        dml: 90,
        pytorch: 60,
        nlp: 45,
        cv: 85,
        apis: 70,
        mlops: 30,
        dist: 20,
        finetuning: 15
      };
      localStorage.setItem(`skill_progress_${demoEmail}`, JSON.stringify(demoSkillProgress));

      await storage.set(`chatHistory_${demoEmail}`, [mockSession]);
      
      // Update main states
      setAuth({ isAuthenticated: true, user: demoUserByLanguage });
      setMilestones(mockRoadmap);
      setChatHistory([mockSession]);
      setMessages([]);
      
      setMode(AppMode.DASHBOARD);
      setTab(DashboardTab.PROGRESS); 
      showToast(isVi ? "🎉 Đã kích hoạt Chế độ Thử nghiệm NextX 2026 thành công!" : "🎉 Loaded NextX 2026 Trial Mode successfully!", "success");
    } catch (e) {
      console.error(e);
      showToast("Failed to load demo data", "error");
    }
  };

  const changeAvatar = () => { 
      updateUserProfile({ avatar: getRandomAvatar() });
  };

  const clearChatHistory = async () => {
    if (!auth.user) return;
    const userKey = auth.user.email || 'guest';
    await storage.delete(`chatHistory_${userKey}`);
    setChatHistory([]);
    showToast(t.chatCleared, 'info');
  };

  const clearCurrentSession = async () => {
    if (!auth.user) return;
    const userKey = auth.user.email || 'guest';
    await storage.delete(`currentMessages_${userKey}`);
    setMessages([]);
    showToast(t.sessionCleared, 'info');
  };

  const renameSession = (id: string, newTitle: string) => {
      setChatHistory(prev => prev.map(s => s.id === id ? { ...s, title: newTitle } : s));
  };

  const toggleStarSession = (id: string) => {
      setChatHistory(prev => prev.map(s => s.id === id ? { ...s, isStarred: !s.isStarred } : s));
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setChatHistory(prev => prev.filter(s => s.id !== id));
      if (currentSessionId === id) {
          startNewChat(false);
      }
  };

  const handleLogout = async () => {
    try {
        if (firebaseAuth) await signOut(firebaseAuth);
    } catch (e) {
        console.error("Firebase logout error", e);
    }
    localStorage.removeItem('currentUser');
    setAuth({ isAuthenticated: false, user: null });
    setMode(AppMode.LANDING);
    setMessages([]);
    setChatHistory([]);
    if (isVoiceActive) handleVoiceToggle();
  };

  const startNewChat = (saveCurrent = true) => {
      if (saveCurrent && messages.length > 0 && !isTemporaryChat) {
          const firstText = messages[0]?.text || 'New Chat';
          const title = currentChatTitle || (firstText.length > 30 ? firstText.substring(0, 30) + "..." : firstText);
          const newSession: ChatSession = { id: currentSessionId || Date.now().toString(), title, date: new Date(), messages: [...messages] };
          setChatHistory(prev => [newSession, ...prev.filter(s => s.id !== newSession.id)]);
      }
      setMessages([]);
      setCurrentSessionId(null);
      setCurrentChatTitle('');
      setIsTemporaryChat(false);
      setTab(DashboardTab.CHAT);
  };

  const startTemporaryChat = () => {
      startNewChat(false);
      setIsTemporaryChat(true);
  };

  const loadSession = (session: ChatSession) => {
      if (!session) return;
      if (messages.length > 0 && !isTemporaryChat) {
           const firstText = messages[0]?.text || 'New Chat';
           const title = currentChatTitle || (firstText.length > 30 ? firstText.substring(0, 30) + "..." : firstText);
           const currentSession: ChatSession = { id: currentSessionId || Date.now().toString(), title, date: new Date(), messages: [...messages] };
           setChatHistory(prev => [currentSession, ...prev.filter(s => s.id !== currentSession.id && s.id !== session.id)]);
      } else {
           setChatHistory(prev => prev.filter(s => s.id !== session.id));
      }
      setMessages(session.messages || []);
      setCurrentSessionId(session.id);
      setCurrentChatTitle(session.title || 'Chat');
      setIsTemporaryChat(false); // Turn off temporary chat when loading a saved session
      setTab(DashboardTab.CHAT);
  };

  const handleSendMessage = async (e?: React.FormEvent, overrideText?: string) => {
    if (e) e.preventDefault();
    if (isChatLoading || isSendingRef.current) return; 
    
    const textToSend = (overrideText || inputMsg).trim();
    const currentPastedTexts = [...pastedTexts];
    
    if (!textToSend && !selectedFile && currentPastedTexts.length === 0) return;

    // Check freemium query limit (3 questions hook for Free tier)
    const subDetails = getSubscriptionDetails(auth.user?.subscription);
    if (subDetails.tier === 'free') {
      if (subDetails.dailyQueriesUsed >= subDetails.dailyQueriesLimit && (subDetails.extraQueriesCredits || 0) <= 0) {
        triggerUpgradeModal(lang === Language.VI ? 'Hạn ngạch 3 câu hỏi AI (Gói Career Guide Free)' : '3 Free AI Questions Limit (Free Tier)');
        showToast(lang === Language.VI ? 'Bạn đã dùng hết 3 lượt hỏi AI miễn phí! Nâng cấp gói Premium/Max hoặc mua AI Credits (25k/10 câu) để tiếp tục.' : 'You reached your 3 free AI question limit! Upgrade or buy AI Credits for more.', 'error');
        return;
      }
    }
    
    isSendingRef.current = true;
    if (!overrideText) {
        setInputMsg('');
        setPastedTexts([]);
    }
    
    // Auto generate chat title if it's the first message
    if (messages.length === 0 && !currentChatTitle) {
         generateChatTitle(textToSend, lang)
             .then(title => { if (title) setCurrentChatTitle(title); })
             .catch(e => console.error("Auto title failed:", e));
    }
    
    setThinkingText(getThinkingMessage(textToSend, lang));
    
    const newMsg: ChatMessage = { 
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
        role: 'user', 
        text: textToSend, 
        timestamp: new Date(),
        file: selectedFile ? { data: selectedFile.data, mimeType: selectedFile.mimeType, name: selectedFile.name } : undefined,
        pastedTexts: currentPastedTexts.length > 0 ? currentPastedTexts : undefined
    };
    setMessages(prev => [...prev, newMsg]);
    setIsChatLoading(true);
    const currentFile = selectedFile;
    setSelectedFile(null); // Clear file after sending

    try {
      const history = messages
        .filter(m => !m.text.startsWith('⚠️ Error') && !m.text.startsWith('⚠️ Chưa cấu hình'))
        .map(m => {
            let fullText = m.text;
            if (m.pastedTexts && m.pastedTexts.length > 0) {
                fullText = `${m.pastedTexts.join('\n\n---\n\n')}\n\n${fullText}`;
            }
            return { role: m.role, text: fullText };
        });
        
      let fullTextToSend = textToSend;
      if (currentPastedTexts.length > 0) {
          fullTextToSend = `${currentPastedTexts.join('\n\n---\n\n')}\n\n${fullTextToSend}`;
      }
        
      const responseText = await sendChatMessage(history, fullTextToSend, lang, auth.user, currentFile);
      setMessages(prev => [...prev, { id: `${Date.now()}-ai-${Math.random().toString(36).substr(2, 9)}`, role: 'model', text: responseText || '', timestamp: new Date() }]);

      // Increment query count if on free plan or using extra credits
      if (subDetails.tier === 'free') {
        if ((subDetails.extraQueriesCredits || 0) > 0) {
          updateUserProfile({
            subscription: {
              ...subDetails,
              extraQueriesCredits: (subDetails.extraQueriesCredits || 0) - 1
            } as any
          });
        } else {
          updateUserProfile({
            subscription: {
              ...subDetails,
              dailyQueriesUsed: subDetails.dailyQueriesUsed + 1
            } as any
          });
        }
      }
    } catch (error: any) {
        let errorMsg = error.message || JSON.stringify(error) || t.error;
        console.error("Chat Error UI:", error);
        
        if (errorMsg.includes("503") || errorMsg.includes("high demand") || errorMsg.includes("busy")) {
            errorMsg = t.aiBusy;
        }

        setMessages(prev => [...prev, { id: `${Date.now()}-ai-${Math.random().toString(36).substr(2, 9)}`, role: 'model', text: `⚠️ ${errorMsg}`, timestamp: new Date() }]);
    } finally { 
        setIsChatLoading(false); 
        isSendingRef.current = false;
    }
  };

  useEffect(() => {
    const loadDevices = async () => {
        const tempSession = new LiveSessionManager(lang, auth.user); 
        const devices = await tempSession.getAudioInputDevices();
        setInputDevices(devices);
        if (devices.length > 0) setSelectedDeviceId(devices[0].deviceId);
    };
    if (tab === DashboardTab.VOICE) loadDevices();
  }, [tab, lang, auth.user]);

  const handleVoiceToggle = useCallback(async () => {
    if (isVoiceActive) {
      setVoiceStatus(t.disconnecting);
      liveSessionRef.current?.disconnect();
      setIsVoiceActive(false);
      setVoiceStatus('');
      setAudioLevel(0);
    } else {
      setVoiceStatus(t.connecting);
      setTranscripts([]);
      const session = new LiveSessionManager(lang, auth.user, selectedVoice);
      session.speechRate = speechRate;
      session.onConnect = () => { setIsVoiceActive(true); setVoiceStatus(t.listening); };
      session.onDisconnect = () => { 
          setIsVoiceActive(false); 
          setVoiceStatus(prev => {
              // If the current status is an error message (not one of the standard states), keep it
              if (prev && prev !== t.listening && prev !== t.connecting && prev !== t.disconnecting && prev !== t.speaking) {
                  return prev;
              }
              return '';
          });
      };
      session.onError = (err: any) => { 
          const isVi = lang === Language.VI;
          const errMsg = typeof err === 'string' ? err : (err?.message || (isVi ? 'Không thể kết nối dịch vụ thoại.' : 'Voice connection error.'));
          console.warn("Session Error / Notice:", errMsg); 
          setVoiceStatus(errMsg); 
          setIsVoiceActive(false); 
      };
      session.onAudioLevel = (level: number) => { setAudioLevel(level); };
      session.onTranscript = (text: string, isUser: boolean) => {
          setTranscripts(prev => {
              const last = prev[prev.length - 1];
              if (last && last.isUser === isUser) { return [...prev.slice(0, -1), { isUser, text: last.text + text }]; }
              return [...prev, { isUser, text }];
          });
      };
      liveSessionRef.current = session;
      try {
          await session.connect(selectedDeviceId, decodeAudioData, createPcmBlob, decode);
      } catch (err: any) {
          console.warn("Mic connection notice:", err);
          const isVi = lang === Language.VI;
          const msg = (err?.name === 'NotAllowedError' || err?.message?.includes('Permission denied') || err?.message?.includes('denied'))
            ? (isVi ? 'Trình duyệt chưa được cấp quyền micro. Vui lòng cho phép quyền micro trên trình duyệt.' : 'Microphone permission denied. Please allow microphone access in your browser.')
            : (err?.message || t.micPermission);
          setVoiceStatus(msg);
          setIsVoiceActive(false);
      }
    }
  }, [isVoiceActive, lang, t, selectedDeviceId, speechRate, selectedVoice]);

  const handleSendVoiceQuestion = async (queryText?: string) => {
    const textToSend = (queryText || voiceInputText).trim();
    if (!textToSend) return;
    setVoiceInputText('');

    if (!isVoiceActive || !liveSessionRef.current) {
      setVoiceStatus(lang === Language.VI ? 'Đang kết nối thoại...' : 'Connecting voice...');
      await handleVoiceToggle();
      setTimeout(async () => {
        if (liveSessionRef.current) {
          await liveSessionRef.current.sendTextMessage(textToSend);
        }
      }, 600);
    } else {
      await liveSessionRef.current.sendTextMessage(textToSend);
    }
  };

  const switchToVoice = () => {
      setTab(DashboardTab.VOICE);
      if (!isVoiceActive) { handleVoiceToggle(); }
  };

  const toggleVoiceInput = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast(lang === Language.VI ? 'Trình duyệt không hỗ trợ nhận diện giọng nói.' : 'Browser does not support Speech Recognition.', 'error');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === Language.VI ? 'vi-VN' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech') {
        console.error('Speech recognition error', event.error);
      }
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputMsg(prev => prev + (prev.trim() ? ' ' : '') + transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isListening, lang]);

  useEffect(() => { return () => { liveSessionRef.current?.disconnect(); }; }, []);
  
  // Save Custom Model Settings including User API Key
  const saveCustomSettings = () => {
      updateUserProfile({ 
          customEndpoint, 
          customModelName,
          aiProvider: auth.user?.aiProvider || AIProvider.GEMINI 
      });
      showToast(t.profileSaved, 'success');
  };

  const renderLanding = () => {
    return (
      <div className="min-h-screen bg-white dark:bg-[#050505] text-slate-900 dark:text-white transition-colors duration-500 overflow-x-hidden bg-mesh-grid">
        <nav className="fixed w-full z-50 px-3 sm:px-6 py-3 sm:py-4 flex justify-between items-center backdrop-blur-sm bg-white/70 dark:bg-[#050505]/70 border-b border-gray-200 dark:border-white/5">
          <AnimatedLogoButton 
            onClick={() => { setMode(AppMode.LANDING); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
            text={t.appName} 
          />
          <div className="flex items-center gap-1.5 sm:gap-4">
             <button onClick={toggleLang} className="flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm font-medium hover:text-indigo-500 transition-colors text-gray-600 dark:text-gray-300">
                <Icons.Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{lang === Language.EN ? 'VI' : 'EN'}</span>
             </button>
             <button onClick={toggleTheme} className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                {theme === Theme.LIGHT ? <Icons.Moon className="w-4 h-4 sm:w-5 sm:h-5"/> : <Icons.Sun className="w-4 h-4 sm:w-5 sm:h-5"/>}
              </button>

             {/* Exclusive Glowing Judge Privilege Bypass Button on Navbar */}
             <button 
                onClick={() => setIsFoundersModalOpen(true)} 
                className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-black transition-all cursor-pointer shadow-xs"
             >
                <span>🏆 {lang === Language.VI ? "Đội Ngũ Sáng Lập" : "NextX Founders"}</span>
             </button>

             <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleActivateDemo}
                className="hidden sm:flex items-center gap-1.5 px-4.5 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 text-white text-xs font-black rounded-full uppercase tracking-wider shadow-lg shadow-emerald-500/20 hover:shadow-indigo-500/30 transition-all border border-emerald-400/20 animate-pulse"
             >
                <Icons.Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-bounce" />
                <span>{lang === Language.VI ? "Đặc Quyền BGK (60s)" : "Judge Privilege (60s)"}</span>
             </motion.button>
             
             {auth.isAuthenticated ? (
                 <div className="flex items-center gap-2">
                    {auth.user?.isGuest && (
                        <button 
                           onClick={() => { setMode(AppMode.AUTH); setAuthType('login'); }} 
                           className="hidden md:block font-bold text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors px-3 py-2 rounded-full"
                        >
                           {t.login}
                        </button>
                    )}
                    <motion.button 
                       whileHover={{ scale: 1.05 }}
                       whileTap={{ scale: 0.95 }}
                       onClick={() => setMode(AppMode.DASHBOARD)} 
                       className="bg-black dark:bg-white text-white dark:text-black px-3.5 py-1.5 sm:px-6 sm:py-2.5 rounded-full font-bold transition-shadow hover:shadow-lg hover:shadow-indigo-500/20 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-base"
                    >
                       <Icons.Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                       {t.dashboard}
                    </motion.button>
                 </div>
             ) : (
                 <>
                    <button onClick={() => { setMode(AppMode.AUTH); setAuthType('login'); }} className="hidden md:block font-medium hover:text-indigo-500 transition-colors">{t.login}</button>
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setMode(AppMode.AUTH); setAuthType('login'); }} 
                        className="bg-black dark:bg-white text-white dark:text-black px-3.5 py-1.5 sm:px-6 sm:py-2.5 rounded-full font-bold transition-shadow hover:shadow-lg hover:shadow-indigo-500/20 text-xs sm:text-base"
                    >
                        {t.getStarted}
                    </motion.button>
                 </>
             )}
          </div>
        </nav>

        <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center relative">
          {/* Animated Background Blobs */}
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob dark:opacity-10"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000 dark:opacity-10"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000 dark:opacity-10"></div>
          
          {/* Floating Orbs */}
          <div className="absolute top-32 left-10 w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full blur-xl opacity-40 dark:opacity-30 animate-float" style={{ animationDelay: '0s' }}></div>
          <div className="absolute bottom-40 right-10 w-32 h-32 bg-gradient-to-br from-fuchsia-400 to-pink-500 rounded-full blur-2xl opacity-30 dark:opacity-20 animate-float" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full blur-lg opacity-50 dark:opacity-40 animate-float" style={{ animationDelay: '3s' }}></div>

          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.12,
                  delayChildren: 0.1
                }
              }
            }}
            className="max-w-4xl space-y-8 flex flex-col items-center"
          >
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 15, scale: 0.95 },
                visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 200, damping: 15 } }
              }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-900/10 text-sm font-medium text-indigo-600 dark:text-indigo-300"
            >
               <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
               {t.heroBadge}
            </motion.div>
            
            <motion.h1 
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 150, damping: 18 } }
              }}
              className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold leading-tight md:leading-[1.1] tracking-tight text-balance px-4"
            >
              {t.heroTitlePrefix}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-500 animate-gradient-x">{t.heroTitleSuffix}</span>
            </motion.h1>
            
            <motion.p 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 15 } }
              }}
              className="text-xl text-gray-500 dark:text-gray-400 max-w-lg leading-relaxed"
            >
              {t.subTagline}
            </motion.p>

            {auth.isAuthenticated && (
                <motion.p 
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="text-indigo-600 dark:text-indigo-400 font-medium mb-2"
                >
                    {t.continueJourney} {auth.user?.name ? auth.user.name.split(' ')[0] : (lang === Language.VI ? "Khách" : "Guest")}?
                </motion.p>
            )}
 
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
              }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-sm sm:max-w-none px-4"
            >
              {auth.isAuthenticated ? (
                  <div className="flex flex-col sm:flex-row gap-4 items-center w-full justify-center">
                    <motion.button 
                        whileHover={{ scale: 1.05, y: -4 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setMode(AppMode.DASHBOARD)} 
                        className="w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-extrabold text-sm sm:text-lg transition-shadow shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 flex items-center justify-center gap-2"
                    >
                        {t.goToDashboard} <Icons.ArrowRight className="w-5 h-5" />
                    </motion.button>
                    
                    {auth.user?.isGuest && (
                      <motion.button 
                          whileHover={{ scale: 1.05, y: -4 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleActivateDemo} 
                          className="w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 bg-gradient-to-r from-emerald-500 via-teal-600 to-indigo-600 text-white rounded-2xl font-extrabold text-sm sm:text-lg transition-shadow shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 flex items-center justify-center gap-2"
                      >
                          <Icons.Sparkles className="w-5 h-5 text-yellow-300 animate-bounce" />
                          {lang === Language.VI ? "Kích hoạt Đặc Quyền BGK (Bypass 60s)" : "Activate Judge Privilege (60s)"}
                      </motion.button>
                    )}
                  </div>
              ) : (
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full">
                    <motion.button 
                        whileHover={{ scale: 1.05, y: -4 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setMode(AppMode.AUTH); setAuthType('login'); }} 
                        className="w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-extrabold text-sm sm:text-lg transition-all border border-transparent dark:hover:bg-slate-100"
                    >
                        {t.getStarted}
                    </motion.button>

                    {/* Highly prominent pulsing Judge bypass button in the Hero area */}
                    <motion.button 
                        whileHover={{ scale: 1.08, y: -4 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleActivateDemo} 
                        className="w-full sm:w-auto px-5 py-3.5 sm:px-8 sm:py-4 bg-gradient-to-r from-emerald-500 via-teal-600 to-indigo-600 text-white rounded-2xl font-black text-sm sm:text-lg transition-shadow shadow-xl shadow-emerald-500/40 hover:shadow-emerald-500/60 flex items-center justify-center gap-2.5 animate-pulse"
                    >
                        <Icons.Sparkles className="w-5.5 h-5.5 text-yellow-300 animate-bounce" />
                        <span>{lang === Language.VI ? "TRẢI NGHIỆM NHANH (Bypass 60s)" : "FAST EXPERIENCE (60s Bypass)"}</span>
                    </motion.button>

                    <button 
                        onClick={handleGuestLogin} 
                        className="text-sm font-semibold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors py-2 underline hover:underline"
                    >
                        {t.guestLogin}
                    </button>
                  </div>
              )}
            </motion.div>
          </motion.div>
        </section>

        <section className="py-12 md:py-20 px-6 max-w-7xl mx-auto">
             <ScrollReveal>
                 <div className="glass-card rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 bg-gradient-to-br from-indigo-600/5 to-fuchsia-600/5 border border-indigo-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                        <div className="flex-1 text-center md:text-center">
                            <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6">{t.vnLaborMarketTitle}</h2>
                            <p className="text-base md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-6 md:mb-8">
                                {t.vnLaborMarketDesc}
                            </p>
                            <div className="flex flex-wrap justify-center gap-2 md:gap-4">
                                {t.laborMarketTags.map((tag: any, tagIdx: number) => (
                                    <span key={`lmt-${tag.en || tagIdx}-${tagIdx}`} className="px-3 py-1.5 md:px-4 md:py-2 bg-white dark:bg-white/10 rounded-full text-[10px] md:text-sm font-bold border border-indigo-500/20">{lang === Language.EN ? tag.en : tag.vi}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                 </div>
             </ScrollReveal>
        </section>

        <div className="py-10 bg-gray-50 dark:bg-[#0a0a0a] border-y border-gray-200 dark:border-white/5 overflow-hidden relative">
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-gray-50 via-transparent to-gray-50 dark:from-[#0a0a0a] dark:via-transparent dark:to-[#0a0a0a] z-10"></div>
            <div className="flex gap-8 whitespace-nowrap animate-marquee">
                {[...CAREER_TAGS, ...CAREER_TAGS].map((tag, i) => (
                    <div key={`ctag-${tag.en || i}-${i}`} className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-gray-300 to-gray-400 dark:from-white/20 dark:to-white/5 uppercase tracking-widest">{lang === Language.EN ? tag.en : tag.vi}</div>
                ))}
            </div>
        </div>
        
        <section className="py-20 px-6 max-w-7xl mx-auto">
             <ScrollReveal>
                 <div className="mb-12 text-center md:text-left relative">
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl"></div>
                    <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold leading-tight mb-4 relative z-10">{t.hotIndustriesTitle}</h2>
                    <p className="text-lg sm:text-xl text-gray-500 max-w-2xl relative z-10">{t.hotIndustriesSub}</p>
                 </div>
             </ScrollReveal>
             
             <StaggerContainer>
                 <div ref={landingCareersScrollRef} style={{ touchAction: 'pan-x' }} className="flex overflow-x-auto pb-8 snap-x snap-mandatory gap-6 hide-scrollbar md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible md:pb-0 md:snap-none">
                     {HOT_INDUSTRIES.map((industry, indIdx) => {
                         const iconKey = industry.icon as keyof typeof Icons;
                         const IconComponent = Icons[iconKey] || Icons.TrendingUp;
                         
                         return (
                            <StaggerItem key={`hot-ind-${industry.id || indIdx}-${indIdx}`} className="min-w-[85vw] snap-center md:min-w-0 md:w-auto">
                                <motion.div 
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className="glass-card rounded-3xl p-6 relative overflow-hidden group transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-500/30 h-full"
                                >
                                     <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-white/5 rounded-bl-full pointer-events-none group-hover:to-indigo-500/10 transition-colors"></div>
                                     <motion.div 
                                         whileHover={{ scale: 1.1, rotate: 3 }}
                                         className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${industry.color} flex items-center justify-center text-white mb-6 shadow-lg transition-all duration-300`}
                                     >
                                         <IconComponent className="w-7 h-7" />
                                     </motion.div>
                                     <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                                         {lang === Language.EN ? industry.name_en : industry.name_vi}
                                     </h3>
                                     <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                                         {lang === Language.EN ? industry.desc_en : industry.desc_vi}
                                     </p>
                                </motion.div>
                            </StaggerItem>
                         );
                     })}
                 </div>

                 {/* Mobile Scroll Navigation Arrows & Swipe Hint */}
                 <div className="flex md:hidden items-center justify-between mt-2 px-2">
                   <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 animate-pulse flex items-center gap-1">
                     <Icons.Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                     {lang === Language.VI ? "Vuốt ngang hoặc nhấn nút để xem tiếp" : "Swipe or click to view more"}
                   </span>
                   <div className="flex gap-2">
                     <button 
                       onClick={scrollLandingCareersLeft}
                       className="p-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 transition-all active:scale-90"
                       title="Left"
                     >
                       <Icons.ChevronLeft className="w-4 h-4" />
                     </button>
                     <button 
                       onClick={scrollLandingCareersRight}
                       className="p-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 transition-all active:scale-90"
                       title="Right"
                     >
                       <Icons.ChevronRight className="w-4 h-4" />
                     </button>
                   </div>
                 </div>
             </StaggerContainer>
        </section>

        <section className="py-16 md:py-24 px-6 max-w-7xl mx-auto">
             <ScrollReveal>
                 <div className="mb-12 md:mb-16">
                     <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold leading-tight mb-4 md:mb-6 text-balance">{t.featureHeader} <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-fuchsia-500 italic">{t.featureHeaderHighlight}</span> {t.featureHeaderSuffix}</h2>
                     <p className="text-lg md:text-xl text-gray-500 max-w-2xl">{t.featureSub}</p>
                 </div>
             </ScrollReveal>

             <StaggerContainer>
                 <div className="bento-grid">
                     <StaggerItem>
                         <motion.div 
                             whileHover={{ scale: 1.02 }}
                             transition={{ type: "spring", stiffness: 300, damping: 20 }}
                             className="glass-card rounded-[1.5rem] md:rounded-3xl p-6 md:p-8 relative overflow-hidden group hover:border-red-500/50 transition-colors md:col-span-2 h-full"
                         >
                             <div className="relative z-10">
                                 <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                                     <Icons.Microphone className="w-5 h-5 md:w-6 md:h-6" />
                                 </div>
                                 <h3 className="text-xl md:text-2xl font-bold mb-2">{t.featureVoiceTitle}</h3>
                                 <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">{t.featureVoiceDesc}</p>
                             </div>
                             <div className="absolute right-0 bottom-0 w-48 md:w-64 h-48 md:h-64 bg-gradient-to-tl from-red-500/10 to-transparent rounded-full translate-x-10 translate-y-10 md:translate-x-20 md:translate-y-20 group-hover:scale-110 transition-transform duration-500"></div>
                         </motion.div>
                     </StaggerItem>

                     <StaggerItem>
                         <motion.div 
                             whileHover={{ scale: 1.02 }}
                             transition={{ type: "spring", stiffness: 300, damping: 20 }}
                             className="glass-card rounded-[1.5rem] md:rounded-3xl p-6 md:p-8 relative overflow-hidden group hover:border-blue-500/50 transition-colors h-full"
                         >
                             <div className="relative z-10">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                                     <Icons.Stars className="w-5 h-5 md:w-6 md:h-6" />
                                 </div>
                                 <h3 className="text-xl md:text-2xl font-bold mb-2">{t.feature247Title}</h3>
                                 <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">{t.feature247Desc}</p>
                             </div>
                             <div className="absolute right-0 top-0 w-24 md:w-32 h-24 md:h-32 bg-blue-500/5 rounded-bl-full group-hover:bg-blue-500/10 transition-colors"></div>
                         </motion.div>
                     </StaggerItem>

                     <StaggerItem>
                         <motion.div 
                             whileHover={{ scale: 1.02 }}
                             transition={{ type: "spring", stiffness: 300, damping: 20 }}
                             className="glass-card rounded-[1.5rem] md:rounded-3xl p-6 md:p-8 relative overflow-hidden group hover:border-purple-500/50 transition-colors h-full"
                         >
                             <div className="relative z-10">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                                     <Icons.FileText className="w-5 h-5 md:w-6 md:h-6" />
                                 </div>
                                 <h3 className="text-xl md:text-2xl font-bold mb-2">{t.featureScanTitle}</h3>
                                 <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">{t.featureScanDesc}</p>
                             </div>
                             <div className="absolute left-0 bottom-0 w-24 md:w-32 h-24 md:h-32 bg-purple-500/5 rounded-tr-full group-hover:bg-purple-500/10 transition-colors"></div>
                         </motion.div>
                     </StaggerItem>

                     <StaggerItem>
                         <motion.div 
                             whileHover={{ scale: 1.02 }}
                             transition={{ type: "spring", stiffness: 300, damping: 20 }}
                             className="glass-card rounded-[1.5rem] md:rounded-3xl p-6 md:p-8 relative overflow-hidden group hover:border-green-500/50 transition-colors md:col-span-2 h-full"
                         >
                             <div className="relative z-10">
                                 <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-red-400 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                                     <Icons.Compass className="w-5 h-5 md:w-6 md:h-6" />
                                  </div>
                                 <h3 className="text-xl md:text-2xl font-bold mb-2">{t.featureRoadmapTitle}</h3>
                                 <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">{t.featureRoadmapDesc}</p>
                             </div>
                              <div className="absolute right-0 bottom-0 w-48 md:w-64 h-48 md:h-64 bg-gradient-to-tl from-green-500/10 to-transparent rounded-full translate-x-10 translate-y-10 md:translate-x-20 md:translate-y-20 group-hover:scale-110 transition-transform duration-500"></div>
                         </motion.div>
                     </StaggerItem>
                 </div>
             </StaggerContainer>
        </section>

        <section className="py-20 px-6 bg-gray-100 dark:bg-[#0a0a0a] relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-30"></div>
             <div className="max-w-4xl mx-auto text-center relative z-10">
                 <div className="inline-block mb-6 p-3 bg-white dark:bg-white/5 rounded-full shadow-md">
                    <Icons.MessageSquare className="w-6 h-6 text-indigo-500" />
                 </div>
                 <p className="text-2xl md:text-4xl font-sans font-medium italic leading-relaxed text-gray-800 dark:text-gray-200">
                     "{lang === Language.EN ? CAREER_QUOTES[1].text : CAREER_QUOTES[1].text_vi}"
                 </p>
                 <div className="mt-8 flex items-center justify-center gap-4">
                     <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-indigo-500"></div>
                     <span className="text-sm font-bold uppercase tracking-widest text-indigo-500">{CAREER_QUOTES[1].author}</span>
                     <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-indigo-500"></div>
                 </div>
             </div>
        </section>

        {/* NextX 2026 Special Presentation Section */}
        <section className="py-16 px-6 max-w-7xl mx-auto border-t border-gray-200 dark:border-white/5 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Presentation Left Panel */}
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-3">
                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-black rounded-full uppercase tracking-wider">
                  The NextX 2026 Special Entry
                </span>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white leading-tight">
                  {lang === Language.VI 
                    ? "Tại sao CareerGuide AI thay đổi cách học sinh kiến tạo tương lai?" 
                    : "How CareerGuide AI is Revolutionizing Career Orientation?"}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-500 dark:text-gray-400">
                  <span>🚀 Team: <strong className="text-indigo-600 dark:text-indigo-400">CareerGuide AI</strong></span>
                  <span className="text-gray-300 dark:text-white/10">|</span>
                  <span>🎓 Members: Phạm Việt Đức, Wang Si Qi, Nguyễn Đức Lâm, Phan Bảo Ngọc</span>
                </div>
              </div>



              {/* Differentiators */}
              <div className="space-y-4">
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <Icons.Flame className="w-5 h-5 text-indigo-500" />
                  <span>{lang === Language.VI ? "Điểm Khác Biệt Độc Nhất So Với Thị Trường" : "How CareerGuide AI Outperforms Standard Options"}</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex gap-3 bg-indigo-50/20 dark:bg-indigo-950/5 p-4 rounded-2xl border border-indigo-500/10 hover:border-indigo-500/25 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <Icons.MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">AI-Powered Interaction & HR Rubric</h4>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                        {lang === Language.VI 
                          ? "Phỏng vấn giả lập chuyên sâu, phản hồi lập tức và chấm điểm theo bộ tiêu chí tiêu chuẩn nhân sự (HR Rubric) thực thụ chứ không chỉ làm trắc nghiệm tĩnh." 
                          : "High-fidelity mock interviews with instant analytic feedback utilizing real professional HR grading rubrics."}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 bg-indigo-50/20 dark:bg-indigo-950/5 p-4 rounded-2xl border border-indigo-500/10 hover:border-indigo-500/25 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <Icons.Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">Localized High-School / University Benchmarks</h4>
                      <p className="text-xs text-gray-405 mt-1 leading-relaxed">
                        {lang === Language.VI 
                          ? "Tự động gợi ý nguyện vọng, đối khớp điểm chuẩn học bạ/đại học thực tế tại Việt Nam cùng tính năng tìm kiếm nguồn học bổng có dẫn chứng (Grounding)." 
                          : "Directly matches high-school benchmarks and real Vietnamese universities combined with Grounded real-time scholarship searches."}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 bg-indigo-50/20 dark:bg-indigo-950/5 p-4 rounded-2xl border border-indigo-500/10 hover:border-indigo-500/25 transition-colors md:col-span-2">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <Icons.Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">Micro-Actionable 3-Month Radial Skill Roadmap</h4>
                      <p className="text-xs text-gray-405 mt-1 leading-relaxed">
                        {lang === Language.VI 
                          ? "Bản đồ kỹ năng tròn đồng tâm trực quan dựa trên lý thuyết giáo dục tiên tiến, chuyển hóa tầm nhìn sự nghiệp mơ hồ thành các lộ trình hành động 3 tháng cực kỳ rõ ràng." 
                          : "Interactive radial skill maps of concentric circles that breakdown high-level career concepts into hyper-focused 3-month skill nodes."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Presentation Right Panel: 60s Demo & Interactive Quick Guide */}
            <div className="lg:col-span-5 bg-white dark:bg-[#0c0c0c] border border-gray-150 dark:border-white/5 rounded-[2rem] p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full pointer-events-none"></div>
              
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white">
                  ⚡ {lang === Language.VI ? "Hướng dẫn khám phá trong 60 giây" : "60-Second Demo & Run Scenarios"}
                </h3>
                <p className="text-xs text-gray-500 mt-1 font-sans">
                  {lang === Language.VI ? "Danh sách kịch bản để trải nghiệm sản phẩm nhanh và tối ưu nhất:" : "Follow these preset scenarios for instant product evaluation:"}
                </p>
              </div>

              {/* Steps Tracker */}
              <div className="space-y-4 font-sans text-xs flex flex-col justify-start">
                {/* Step 1 */}
                <div className="flex gap-3 text-left">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0">1</div>
                  <div className="space-y-1">
                    <strong className="text-gray-900 dark:text-white">
                      {lang === Language.VI ? "Bật 1-Click Demo Session" : "Trigger Demo Session with 1-Click"}
                    </strong>
                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-left">
                      {lang === Language.VI 
                        ? "Click nút màu xanh lá phía dưới đây để đăng nhập trực tiếp làm ứng viên Nguyễn Đức Anh (IELTS 7.5, Giải nhất Robot)." 
                        : "Click the green button directly below to load candidate Alex's high-fidelity context."}
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-3 text-left">
                  <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold shrink-0">2</div>
                  <div className="space-y-1">
                    <strong className="text-gray-900 dark:text-white">
                      {lang === Language.VI ? "Kiểm tra Lộ Trình & Bản Đồ" : "Audit Roadmaps & Skill Maps"}
                    </strong>
                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-left">
                      {lang === Language.VI 
                        ? "Xem sơ đồ mạng lưới kĩ năng SVG, lộ trình phát triển 3 tháng chi tiết cho ngành AI Engineer cực kì mượt mà." 
                        : "Open the Progress tab to inspect calculated Skill Nodes and real historical milestones."}
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-3 text-left">
                  <div className="w-6 h-6 rounded-full bg-violet-500 text-white flex items-center justify-center font-bold shrink-0">3</div>
                  <div className="space-y-1">
                    <strong className="text-gray-900 dark:text-white">
                      {lang === Language.VI ? "Thử nghiệm Chat & Phỏng vấn" : "Practice Mock Interview"}
                    </strong>
                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-left">
                      {lang === Language.VI 
                        ? "Trải nghiệm hội thoại đính kèm File, và bắt đầu phỏng vấn thử để thấy biểu điểm Rubric đánh giá khoa học!" 
                        : "Review real-time chats with dynamic citations or complete interview queries to see rubric-based grading."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mock Player Screen representing the Screencast */}
              <div 
                onClick={handleActivateDemo}
                className="group/player cursor-pointer bg-slate-900 border border-white/5 rounded-2xl aspect-video relative overflow-hidden flex flex-col justify-between p-4 shadow-inner"
              >
                {/* Visualizer overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 opacity-80 group-hover/player:opacity-90 transition-opacity"></div>
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="w-16 h-16 rounded-full bg-white/10 group-hover/player:bg-indigo-600/90 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl group-hover/player:scale-110 transition-transform duration-300">
                    <Icons.Play className="w-6 h-6 text-white ml-1 fill-white" />
                  </div>
                </div>

                {/* UI top badges */}
                <div className="relative z-20 flex justify-between items-center text-[10px] text-white/60 font-mono">
                  <span className="px-2 py-0.5 bg-black/40 rounded backdrop-blur font-bold text-white font-sans">CareerGuide AI</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping text-white"></span> 01:30 DEMO HD</span>
                </div>

                {/* UI bot labels */}
                <div className="relative z-20 text-left font-sans">
                  <p className="text-xs text-indigo-300 font-extrabold tracking-wider uppercase">{lang === Language.VI ? 'Tổng quan tính năng' : 'Screencast Overview'}</p>
                  <p className="text-xs text-white font-bold truncate mt-0.5 font-sans">
                    {lang === Language.VI ? "Nhấn vào đây để khởi chạy nhanh trải nghiệm thực tế" : "Click to launch mock session and see all charts instantly"}
                  </p>
                </div>
              </div>

              {/* Quick Demo CTA Button under the video screen */}
              <motion.button 
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleActivateDemo} 
                  className="w-full py-4.5 bg-gradient-to-r from-emerald-500 via-teal-600 to-indigo-600 text-white rounded-2xl font-extrabold text-[15px] transition-shadow shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 flex items-center justify-center gap-2.5"
              >
                  <Icons.Sparkles className="w-5 h-5 text-yellow-300 animate-bounce shrink-0" />
                  <span className="font-extrabold tracking-tight">{lang === Language.VI ? "Dùng thử ngay với dữ liệu mẫu (NextX Demo)" : "Try with Sample Demo Data (NextX 1 Click)"}</span>
              </motion.button>

            </div>
          </div>
        </section>

        {/* The NEXTX 2026 Grand Finalists & Founders Showcase Section */}
        <section id="founders-section" className="border-t border-gray-200/80 dark:border-white/5 bg-gradient-to-b from-transparent via-indigo-500/[0.03] to-transparent">
          <FoundersSection 
            lang={lang} 
            onExploreDemo={handleActivateDemo} 
          />
        </section>

        <footer className="py-16 px-6 border-t border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-[#070709] transition-colors">
             <div className="max-w-6xl mx-auto space-y-8 text-center md:text-left">
                 <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-gray-200 dark:border-white/5">
                     <div className="flex items-center gap-3">
                         <CareerGuideLogo className="w-8 h-8" />
                         <div>
                             <span className="font-extrabold text-lg bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">{t.appName}</span>
                             <p className="text-xs text-gray-500">{lang === Language.VI ? 'Nền tảng Hướng nghiệp & Phát triển Năng lực Cá nhân hóa AI' : 'Personalized AI Career Guidance & Competency Platform'}</p>
                         </div>
                     </div>
                     <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-gray-600 dark:text-gray-400">
                         <button onClick={() => setIsFoundersModalOpen(true)} className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold hover:underline transition-colors">
                             <span>🏆 {lang === Language.VI ? 'Đội Ngũ Sáng Lập (The NextX)' : 'Founders Showcase'}</span>
                         </button>
                         <span>•</span>
                         <button onClick={() => setHasAcceptedTerms(false)} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                             {lang === Language.VI ? 'Điều khoản sử dụng' : 'Terms of Service'}
                         </button>
                         <span>•</span>
                         <button onClick={() => setHasAcceptedTerms(false)} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                             {lang === Language.VI ? 'Chính sách bảo mật (<18)' : 'Privacy Policy (<18)'}
                         </button>
                         <span>•</span>
                         <button onClick={() => setIsFeedbackOpen(true)} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                             {lang === Language.VI ? 'Góp ý & Báo lỗi' : 'Feedback & Contact'}
                         </button>
                     </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                     <div className="space-y-1.5 bg-white dark:bg-white/[0.02] p-4 rounded-2xl border border-gray-200/60 dark:border-white/5">
                         <p className="font-bold text-gray-900 dark:text-gray-200 flex items-center gap-1.5">
                             <Icons.Shield className="w-3.5 h-3.5 text-indigo-500" />
                             <span>{lang === Language.VI ? 'Tuân thủ Bảo mật Học sinh' : 'Youth Privacy Protection'}</span>
                         </p>
                         <p className="text-[11px]">
                             {lang === Language.VI 
                                 ? 'Dữ liệu cá nhân của học sinh & thanh thiếu niên (<18 tuổi) được bảo vệ nghiêm ngặt. Không bán, không chia sẻ cho bên thứ ba vì mục đích thương mại.' 
                                 : 'Student & minor (<18) personal data is strictly protected. Never sold or shared for third-party commercial marketing.'}
                         </p>
                     </div>

                     <div className="space-y-1.5 bg-white dark:bg-white/[0.02] p-4 rounded-2xl border border-gray-200/60 dark:border-white/5">
                         <p className="font-bold text-gray-900 dark:text-gray-200 flex items-center gap-1.5">
                             <Icons.Database className="w-3.5 h-3.5 text-emerald-500" />
                             <span>{lang === Language.VI ? 'Nguồn Dữ Liệu Tham Chiếu' : 'Verified Data Sources'}</span>
                         </p>
                         <p className="text-[11px]">
                             {lang === Language.VI 
                                 ? 'Dữ liệu hướng nghiệp & điểm chuẩn tham chiếu từ Bộ GD&ĐT, Tổng cục Thống kê, ONET, và cổng tuyển sinh các trường ĐH chính quy.' 
                                 : 'Career benchmarks aggregated from official education portals, MOET standards, ONET classifications, and live university admissions.'}
                         </p>
                     </div>

                     <div className="space-y-1.5 bg-white dark:bg-white/[0.02] p-4 rounded-2xl border border-gray-200/60 dark:border-white/5">
                         <p className="font-bold text-gray-900 dark:text-gray-200 flex items-center gap-1.5">
                             <Icons.AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                             <span>{lang === Language.VI ? 'Miễn trừ Trách nhiệm AI' : 'AI Output Advisory'}</span>
                         </p>
                         <p className="text-[11px]">
                             {lang === Language.VI 
                                 ? 'Mô hình AI đưa ra các gợi ý định hướng mang tính chất tham khảo học tập. Người học nên đối chiếu với thầy cô, gia đình và quy chế chính thức.' 
                                 : 'AI insights serve as guidance and personal development suggestions. Please verify with certified counselors and official admissions guidelines.'}
                         </p>
                     </div>
                 </div>

                 <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 text-[11px] text-gray-400">
                     <p>© 2026 {t.appName}. {t.empoweringFutures}.</p>
                     <div className="flex items-center gap-2">
                         <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-mono font-bold">v2.4.0 (NextX 2026 Edition)</span>
                         <span className="text-emerald-500 font-semibold flex items-center gap-1">
                             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                             All Systems Operational
                         </span>
                     </div>
                 </div>
             </div>
        </footer>
      </div>
    );
  }

  const renderAuth = () => (
    <div className="min-h-screen bg-white dark:bg-[#050505] flex items-center justify-center p-4 transition-colors duration-300 relative overflow-hidden">
      {/* Auth Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-[120px] animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-500/20 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="glass-card bg-white/60 dark:bg-[#111]/80 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-gray-100 dark:border-white/10 relative z-10 p-8 transform transition-all duration-300 hover:shadow-indigo-500/20"
      >
            <div className="flex justify-center mb-6">
                <CareerGuideLogo className="w-16 h-16" />
            </div>
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2 tracking-tight">
                {authType === 'login' ? t.login : authType === 'register' ? t.register : t.resetPasswordTitle}
            </h2>
            <p className="text-center text-gray-500 dark:text-gray-400 mb-8 text-sm">
                {authType === 'forgot-password' ? (isResetSent ? (lang === Language.VI ? 'Kiểm tra hộp thư' : 'Check your inbox') : t.resetPasswordDesc) : t.tagline}
            </p>
            
            {authError && (
                <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-xl text-left animate-shake shadow-md">
                    <p className="text-red-700 dark:text-red-400 text-sm font-bold text-center mb-2">{authError}</p>
                    
                    {(authError.includes('unauthorized-domain') || authError.includes('Tên miền hiện tại') || authError.includes('unauthorized domain')) && (
                        <div className="mt-3 pt-3 border-t border-red-200/50 dark:border-red-800/30 text-xs text-gray-700 dark:text-gray-300 space-y-2">
                            <p className="font-bold text-red-800 dark:text-red-300">
                                {lang === Language.VI ? "🛠️ HƯỚNG DẪN CẤU HÌNH NHANH:" : "🛠️ QUICK FIX GUIDANCE:"}
                            </p>
                            <ol className="list-decimal list-inside space-y-1">
                                {lang === Language.VI ? (
                                    <>
                                        <li>Truy cập <a href="https://console.firebase.google.com/project/careerguideaiforeveryone-1/authentication/settings" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 underline font-semibold">Firebase Console &gt; Authentication &gt; Settings</a></li>
                                        <li>Tìm phần <strong>Authorized domains</strong> chọn "Add domain"</li>
                                        <li>Thêm lần lượt 2 tên miền sau:</li>
                                    </>
                                ) : (
                                    <>
                                        <li>Visit <a href="https://console.firebase.google.com/project/careerguideaiforeveryone-1/authentication/settings" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 underline font-semibold">Firebase Console &gt; Authentication &gt; Settings</a></li>
                                        <li>Find <strong>Authorized domains</strong> and click "Add domain"</li>
                                        <li>Add the following 2 domains:</li>
                                    </>
                                )}
                            </ol>
                            <div className="p-2.5 bg-white dark:bg-black/40 rounded-lg border border-red-200 dark:border-red-800/20 font-mono text-[11px] text-indigo-600 dark:text-indigo-400 break-all select-all font-semibold space-y-1 shadow-inner">
                                <div>• {window.location.hostname}</div>
                                <div>• {window.location.hostname.replace('ais-dev', 'ais-pre')}</div>
                            </div>
                            <p className="text-[10px] text-gray-500 italic text-center">
                                {lang === Language.VI ? "💡 Nhấp đúp vào khung văn bản trên để bôi đen toàn bộ và sao chép dễ dàng!" : "💡 Double click on the box above to select all and copy easily!"}
                            </p>
                        </div>
                    )}

                    {(authError.includes('popup-closed-by-user') || authError.includes('đóng cửa sổ') || authError.includes('popup was closed')) && (
                        <div className="mt-3 pt-3 border-t border-red-200/50 dark:border-red-800/30 text-xs text-gray-700 dark:text-gray-300 space-y-2">
                            <p className="font-bold text-red-850 dark:text-red-300 flex items-center gap-1">
                                {lang === Language.VI ? "💡 CÁCH KHẮC PHỤC LỖI POP-UP:" : "💡 HOW TO RESOLVE POP-UP ISSUES:"}
                            </p>
                            <ul className="list-disc list-inside space-y-1.5 pl-1">
                                {lang === Language.VI ? (
                                    <>
                                        <li><strong>Không đóng cửa sổ sớm:</strong> Hãy giữ nguyên cửa sổ đăng nhập Google mới mở và hoàn tất đăng nhập cho đến khi nó tự động đóng hoàn toàn.</li>
                                        <li><strong>Kiểm tra Chặn Pop-up:</strong> Hãy xem ở góc phải thanh địa chỉ trình duyệt xem có biểu tượng "Chặn Pop-up" (có hình biểu tượng cửa sổ kèm dấu x đỏ) không, và nhấn vào chọn "Luôn cho phép hiển thị cửa sổ bật lên" từ trang này.</li>
                                        <li><strong>Tắt Chặn quảng cáo / Lá chắn:</strong> Nếu bạn dùng Brave, hãy tạm tắt Tấm lá chắn hỗ trợ hoặc tắt trình chặn quảng cáo (như Adblock, uBlock Origin) cho trang này.</li>
                                        <li><strong>Mở tab mới (Khuyên dùng):</strong> Nhấp vào biểu tượng ↗️ ở góc trên bên phải khung Iframe xem trước của AI Studio để chạy ứng dụng trong màn hình Tab độc lập mới. Việc này sẽ gỡ bỏ tất cả giới hạn bảo mật Iframe.</li>
                                    </>
                                ) : (
                                    <>
                                        <li><strong>Keep the popup open:</strong> Do not close the Google sign-in popup window manually until the redirection and login are fully finished.</li>
                                        <li><strong>Check your Popup Blocker:</strong> Check the right side of your browser's address bar for a blocked popup icon. Click on it and choose "Always allow popups and redirects" for this site.</li>
                                        <li><strong>Disable Shields / Adblockers:</strong> If using Brave browser or plugins like uBlock Origin or Adblock Plus, temporarily disable them for this page.</li>
                                        <li><strong>Open in a New Tab (Recommended):</strong> Click the ↗️ button in the top-right corner of the AI Studio preview window to open the app in a standalone browser tab, completely avoiding sandbox constraints.</li>
                                    </>
                                )}
                            </ul>
                        </div>
                    )}

                    {(authError.includes('api-key-not-valid') || authError.includes('invalid-api-key') || authError.includes('API key') || authError.includes('firebaseNotConfigured') || authError.includes('Firebase connection error') || authError.includes('Firebase: Error')) && (
                        <div className="mt-3 pt-3 border-t border-red-200/50 dark:border-red-800/30 text-xs text-gray-700 dark:text-gray-300 space-y-3">
                            <p className="font-bold text-red-800 dark:text-red-300">
                                {lang === Language.VI ? "💡 GIẢI PHÁP BỎ QUA NHANH:" : "💡 QUICK BYPASS SOLUTIONS:"}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 text-[11px] leading-relaxed">
                                {lang === Language.VI 
                                    ? "Do bạn chưa hoàn thành cấu hình hoặc khóa Firebase không hợp lệ, bạn vẫn có thể trải nghiệm toàn bộ tính năng của ứng dụng (Định hướng, Chat AI, lộ trình học tập, v.v.) bằng chế độ Khách hoặc Trải Nghiệm Nhanh sau đây:"
                                    : "Since Firebase is not fully configured or the API Key is invalid, you can still experience all the features of the app (Career guidance, AI Chat, Roadmaps, etc.) using the Guest or Demo modes:"}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-2 pt-1.5">
                                <button
                                    type="button"
                                    onClick={handleGuestLogin}
                                    className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs text-center transition-colors shadow-sm cursor-pointer"
                                >
                                    {lang === Language.VI ? "Chế độ Khách (Guest Mode)" : "Guest Mode"}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleActivateDemo}
                                    className="flex-1 px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-lg text-xs text-center transition-colors shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                                >
                                    <Icons.Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                                    {lang === Language.VI ? "Trải Nghiệm Nhanh (Demo)" : "Demo Mode"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            {authType === 'forgot-password' && isResetSent ? (
                <div className="text-center animate-fade-in-up space-y-6">
                    <div className="flex flex-col items-center justify-center gap-4 mb-2">
                         <div className="bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 p-4 rounded-full">
                            <Icons.Check className="w-10 h-10 animate-bounce" />
                         </div>
                         <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-2">
                             {lang === Language.VI ? "Đã gửi liên kết thành công!" : "Reset Link Sent Successfully!"}
                         </h3>
                         <p className="text-sm font-medium text-gray-500 dark:text-gray-300 px-2 leading-relaxed">
                             {t.linkSent || (lang === Language.VI 
                                 ? "Thành công! Vui lòng kiểm tra hộp thư đến của bạn để lấy liên kết cài đặt lại mật khẩu của bạn." 
                                 : "Success! Please check your email inbox for the link to reset your password.")}
                         </p>
                    </div>

                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button" 
                        onClick={() => { setIsResetSent(false); setAuthType('login'); setAuthError(''); }}
                        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-3.5 rounded-xl hover:from-indigo-500 hover:to-violet-500 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                    >
                        {t.backToLogin}
                    </motion.button>
                </div>
            ) : (
                <form onSubmit={authType === 'forgot-password' ? handleSendResetCode : authType === 'login' ? handleLogin : handleRegister} className="space-y-4">
                    {authType === 'register' && (<div><label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">{t.fullName}</label><input ref={nameRef} type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white" placeholder={t.placeholderName} /></div>)}
                    
                    <div><label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">{t.email}</label><input ref={emailRef} type="email" required className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white" placeholder={t.placeholderEmail} /></div>
                    
                    {authType !== 'forgot-password' && (
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">{t.password}</label>
                            <div className="relative">
                                <input ref={passwordRef} type={showPassword ? "text" : "password"} required className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white" placeholder={t.placeholderPassword} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500">{showPassword ? <Icons.EyeOff className="w-5 h-5" /> : <Icons.Eye className="w-5 h-5" />}</button>
                            </div>
                        </div>
                    )}

                    {authType === 'login' && (<div className="flex justify-end"><button type="button" onClick={() => { setAuthType('forgot-password'); setIsResetSent(false); setAuthError(''); }} className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">{t.forgotPassword}</button></div>)}
                    
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit" 
                        disabled={isResetSending} 
                        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-3.5 rounded-xl hover:from-indigo-500 hover:to-violet-500 transition-all shadow-lg shadow-indigo-500/20 mt-2 flex items-center justify-center gap-2"
                    >
                        {isResetSending && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                        {authType === 'login' ? t.login : authType === 'register' ? t.register : t.sendLink}
                    </motion.button>
                </form>
            )}

            {authType !== 'forgot-password' && (
                <>
                    <div className="relative my-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-white/10"></div></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-white dark:bg-[#111] text-gray-500">{t.or}</span></div></div>
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleGoogleLogin} 
                        disabled={isGoogleLoading} 
                        className="w-full flex items-center justify-center gap-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white font-medium py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isGoogleLoading ? <div className="w-5 h-5 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div> : <Icons.Google className="w-5 h-5" />}
                        {isGoogleLoading ? t.connecting : t.loginWithGoogle}
                    </motion.button>
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleGuestLogin} 
                        className="w-full mt-3 flex items-center justify-center gap-3 bg-transparent border border-dashed border-gray-300 dark:border-white/20 text-gray-500 dark:text-gray-400 font-medium py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                        {t.guestLogin}
                    </motion.button>
                    <div className="mt-8 text-center text-sm"><span className="text-gray-500">{authType === 'login' ? t.dontHaveAccount : t.alreadyHaveAccount}{' '}</span><button onClick={() => { setAuthType(authType === 'login' ? 'register' : 'login'); setAuthError(''); }} className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">{authType === 'login' ? t.register : t.login}</button></div>
                </>
            )}
            
            {authType === 'forgot-password' && !isResetSent && (
                 <div className="mt-8 text-center text-sm">
                    <button onClick={() => { setAuthType('login'); setAuthError(''); }} className="font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">{t.backToLogin}</button>
                 </div>
            )}
            
        <div className="mt-6 text-center"><button onClick={() => setMode(AppMode.LANDING)} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">← {t.backToHome}</button></div>
      </motion.div>
    </div>
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const data = event.target?.result as string;
            const base64Data = data.split(',')[1];
            const mimeType = file.type || 'application/octet-stream';
            setSelectedFile({ data: base64Data, mimeType, name: file.name });
        };
        reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };

  const getStreakColor = (streak: number) => {
      if (streak >= 100) return 'text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]';
      if (streak >= 50) return 'text-purple-500 drop-shadow-[0_0_5px_rgba(168,85,247,0.6)]';
      if (streak >= 10) return 'text-blue-500 drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]';
      return 'text-orange-500';
  };

  const renderDashboard = () => {
    const filteredHistory = chatHistory.filter(session => (session.title || '').toLowerCase().includes((searchQuery || '').toLowerCase()));
    return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#050505] overflow-hidden transition-colors duration-300 relative font-sans">
      {/* Onboarding Overlay */}
      <AnimatePresence>
        {auth.isAuthenticated && !auth.user?.hasCompletedOnboarding && (
          <Onboarding 
            lang={lang} 
            theme={theme} 
            onComplete={(profileUpdates) => {
              updateUserProfile({ ...profileUpdates, hasCompletedOnboarding: true });
            }}
            onActivateDemo={handleActivateDemo}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsMobileSidebarOpen(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[65] md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#0a0a0a] z-[70] md:hidden flex flex-col border-r border-gray-200 dark:border-white/5 shadow-2xl"
            >
            <div className="p-4 flex items-center justify-between">
                <AnimatedLogoButton 
                    onClick={() => { setMode(AppMode.LANDING); setIsMobileSidebarOpen(false); }} 
                    text={t.appName} 
                />
                <button onClick={() => setIsMobileSidebarOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl">
                    <Icons.PanelLeftClose className="w-5 h-5" />
                </button>
            </div>
            
            <div className="px-4 mb-2 space-y-2">
                <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { startNewChat(); setIsMobileSidebarOpen(false); }} 
                    className="w-full flex items-center justify-center gap-3 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold shadow-lg"
                >
                    <span className="text-xl leading-none">+</span> {t.newChat}
                </motion.button>
                <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { startTemporaryChat(); setIsMobileSidebarOpen(false); }} 
                    className="w-full flex items-center justify-center gap-3 py-3 border border-dashed border-amber-500/50 dark:border-amber-400/30 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-400/10 rounded-xl font-bold transition-all shadow-sm"
                >
                    <Icons.Shield className="w-4 h-4 text-amber-500" /> {t.temporaryChat}
                </motion.button>
            </div>
            
            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setTab(DashboardTab.CHAT); setIsMobileSidebarOpen(false); }} className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium transition-all ${tab === DashboardTab.CHAT ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}><Icons.MessageSquare className="w-5 h-5" />{t.chatMode}</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setTab(DashboardTab.VOICE); setIsMobileSidebarOpen(false); }} className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium transition-all ${tab === DashboardTab.VOICE ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}><Icons.Microphone className="w-5 h-5" />{t.voiceMode}</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setTab(DashboardTab.QUIZ); setIsMobileSidebarOpen(false); }} className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium transition-all ${tab === DashboardTab.QUIZ ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}><Icons.Zap className="w-5 h-5" />{t.careerQuizTitle}</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setTab(DashboardTab.CAREER_LIFECYCLE); setIsMobileSidebarOpen(false); }} className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium transition-all ${tab === DashboardTab.CAREER_LIFECYCLE ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}><Icons.Compass className="w-5 h-5 text-teal-500" />{t.careerLifecycle || 'Vòng đời sự nghiệp'}</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setTab(DashboardTab.PROGRESS); setIsMobileSidebarOpen(false); }} className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium transition-all ${tab === DashboardTab.PROGRESS ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}><Icons.Target className="w-5 h-5" />{t.progress}</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setTab(DashboardTab.PROMPT_BUILDER); setIsMobileSidebarOpen(false); }} className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium transition-all ${tab === DashboardTab.PROMPT_BUILDER ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}><Icons.Sparkles className="w-5 h-5 text-indigo-500" />{t.promptBuilder || 'Mẫu & Tạo Prompt AI'}</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setTab(DashboardTab.MOCK_INTERVIEW); setIsMobileSidebarOpen(false); }} className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium transition-all ${tab === DashboardTab.MOCK_INTERVIEW ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}><Icons.Cpu className="w-5 h-5" />{t.mockInterview}</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setTab(DashboardTab.TRENDING); setIsMobileSidebarOpen(false); }} className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium transition-all ${tab === DashboardTab.TRENDING ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}><Icons.Flame className="w-5 h-5" />{t.trendingCareers}</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setTab(DashboardTab.COMPARE); setIsMobileSidebarOpen(false); }} className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium transition-all ${tab === DashboardTab.COMPARE ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}><Icons.Activity className="w-5 h-5" />{t.careerCompare}</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setTab(DashboardTab.SCORES); setIsMobileSidebarOpen(false); }} className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium transition-all ${tab === DashboardTab.SCORES ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}><Icons.BookOpen className="w-5 h-5" />{t.universityScores}</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setTab(DashboardTab.SCHOLARSHIPS); setIsMobileSidebarOpen(false); }} className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium transition-all ${tab === DashboardTab.SCHOLARSHIPS ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}><Icons.Search className="w-5 h-5" />{t.scholarships}</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setTab(DashboardTab.PORTFOLIO); setIsMobileSidebarOpen(false); }} className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium transition-all ${tab === DashboardTab.PORTFOLIO ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}><Icons.Briefcase className="w-5 h-5" />{t.portfolio}</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setTab(DashboardTab.CV_BUILDER); setIsMobileSidebarOpen(false); }} className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium transition-all ${tab === DashboardTab.CV_BUILDER ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}><Icons.FileText className="w-5 h-5 text-indigo-500" />{lang === Language.VI ? 'Tạo CV Tự Động AI' : 'AI CV Builder'}</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setTab(DashboardTab.FOUNDERS); setIsMobileSidebarOpen(false); }} className={`w-full flex items-center justify-between py-3 px-4 rounded-xl text-sm font-bold transition-all ${tab === DashboardTab.FOUNDERS ? 'bg-gradient-to-r from-amber-500/20 to-purple-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                  <div className="flex items-center gap-3">
                    <Icons.Award className="w-5 h-5 text-amber-500" />
                    <span>{lang === Language.VI ? 'Đội Ngũ Sáng Lập (NextX)' : 'NextX Founders'}</span>
                  </div>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase">Final</span>
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setTab(DashboardTab.MONETIZATION_PARTNERS); setIsMobileSidebarOpen(false); }} className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium transition-all ${tab === DashboardTab.MONETIZATION_PARTNERS ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}><Icons.CreditCard className="w-5 h-5 text-emerald-500" />{t.monetizationPartners || 'Gói cước & Đối tác'}</motion.button>
                
                {chatHistory.length > 0 ? (
                    <div className="mt-8">
                        <div className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Icons.History className="w-3 h-3" />{t.chatHistory}</div>
                        <div className="space-y-1">
                            {chatHistory.slice(0, 10).map((session, idx) => (
                                <SidebarChatItem
                                    key={session.id ? `${session.id}-${idx}` : `session-${idx}`}
                                    session={session}
                                    onClick={() => { loadSession(session); setIsMobileSidebarOpen(false); }}
                                    onRename={renameSession}
                                    onStar={toggleStarSession}
                                    onDelete={deleteSession}
                                    t={t}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="mt-8 animate-fade-in">
                        <div className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2"><Icons.History className="w-3 h-3" />{t.chatHistory}</div>
                        </div>
                        <div className="text-center p-4 border border-dashed border-gray-200 dark:border-white/10 rounded-xl mx-2">
                            <Icons.MessageSquare className="w-6 h-6 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                            <p className="text-xs text-gray-500 dark:text-gray-400">{lang === Language.VI ? 'Chưa có lịch sử trò chuyện. Hãy bắt đầu một cuộc hội thoại mới!' : 'No chat history yet. Start a new conversation!'}</p>
                        </div>
                    </div>
                )}
            </nav>
            
            <div className="p-4 border-t border-gray-200 dark:border-white/5 bg-white/50 dark:bg-white/5 space-y-3">
                <div className="flex gap-2">
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleLang} 
                        className="flex-1 flex items-center justify-center py-2 text-xs font-bold text-gray-500 dark:text-gray-400 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10 transition-all"
                    >
                        <span className="uppercase">{lang}</span>
                    </motion.button>
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleTheme} 
                        className="flex-1 flex items-center justify-center py-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10 transition-all"
                    >
                        {theme === Theme.LIGHT ? <Icons.Moon className="w-4 h-4"/> : <Icons.Sun className="w-4 h-4"/>}
                    </motion.button>
                </div>
                <div className="flex items-center justify-between">
                    <div onClick={() => { setIsProfileModalOpen(true); setIsMobileSidebarOpen(false); }} className="flex items-center gap-3 cursor-pointer p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors flex-1 overflow-hidden">
                        <img src={auth.user?.avatar || AVATARS[0]} alt="Avatar" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=User&background=random'; }} className="w-9 h-9 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm"/>
                        <div className="overflow-hidden flex-1">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{auth.user?.name}</p>
                            <p className="text-[10px] text-gray-500 truncate">{auth.user?.isGuest ? t.guestSession : auth.user?.email}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors ml-2">
                        <Icons.LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
          </motion.aside>
          </>
        )}
      </AnimatePresence>

      <aside className={`hidden md:flex flex-col transition-all duration-300 h-full border-r border-gray-200 dark:border-white/5 z-10 bg-white/80 dark:bg-[#0a0a0a]/90 backdrop-blur-lg ${isSidebarOpen ? 'w-72' : 'w-20'}`}>
        <div className="p-4 flex items-center justify-between">
            <AnimatedLogoButton 
                    onClick={() => setMode(AppMode.LANDING)} 
                    text={t.appName}
                    isCollapsed={!isSidebarOpen}
                />
        </div>
        
        <div className="px-4 mb-2 space-y-2">
            <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startNewChat()} 
                className={`w-full flex items-center justify-center gap-3 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl transition-all font-bold shadow-lg ${isSidebarOpen ? 'px-4' : 'px-0'}`}
                title={t.newChat}
            >
                <Icons.Plus className="w-5 h-5 flex-shrink-0" /> {isSidebarOpen && t.newChat}
            </motion.button>
            <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startTemporaryChat()} 
                className={`w-full flex items-center justify-center gap-3 py-3 border border-dashed border-amber-500/50 dark:border-amber-400/30 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-400/10 rounded-xl transition-all font-bold shadow-sm ${isSidebarOpen ? 'px-4' : 'px-0'}`}
                title={t.temporaryChat}
            >
                <Icons.Shield className="w-5 h-5 flex-shrink-0 text-amber-500 animate-pulse" /> {isSidebarOpen && t.temporaryChat}
            </motion.button>
        </div>
        
            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto overflow-x-hidden">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setTab(DashboardTab.CHAT)} className={`group w-full flex items-center gap-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${tab === DashboardTab.CHAT ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'} ${isSidebarOpen ? 'px-4' : 'justify-center px-0'}`} title={t.chatMode}><Icons.MessageSquare className="w-5 h-5 flex-shrink-0 text-indigo-500 transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110" />{isSidebarOpen && <span className="truncate">{t.chatMode}</span>}</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setTab(DashboardTab.VOICE)} className={`group w-full flex items-center gap-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${tab === DashboardTab.VOICE ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'} ${isSidebarOpen ? 'px-4' : 'justify-center px-0'}`} title={t.voiceMode}><Icons.Microphone className="w-5 h-5 flex-shrink-0 text-rose-500 transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110" />{isSidebarOpen && <span className="truncate">{t.voiceMode}</span>}</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setTab(DashboardTab.QUIZ)} className={`group w-full flex items-center gap-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${tab === DashboardTab.QUIZ ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'} ${isSidebarOpen ? 'px-4' : 'justify-center px-0'}`} title={t.careerQuizTitle}><Icons.Zap className="w-5 h-5 flex-shrink-0 text-amber-500 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />{isSidebarOpen && <span className="truncate">{t.careerQuizTitle}</span>}</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setTab(DashboardTab.PROGRESS)} className={`group w-full flex items-center gap-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${tab === DashboardTab.PROGRESS ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'} ${isSidebarOpen ? 'px-4' : 'justify-center px-0'}`} title={lang === Language.VI ? 'Tiến Độ & Vòng Đời AI' : 'Progress & Career Lifecycle'}><Icons.Target className="w-5 h-5 flex-shrink-0 text-emerald-500 transition-transform duration-300 group-hover:rotate-45 group-hover:scale-110" />{isSidebarOpen && <span className="truncate">{lang === Language.VI ? 'Tiến Độ & Vòng Đời AI' : 'Progress & Career Lifecycle'}</span>}</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setTab(DashboardTab.MOCK_INTERVIEW)} className={`group w-full flex items-center gap-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${tab === DashboardTab.MOCK_INTERVIEW ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'} ${isSidebarOpen ? 'px-4' : 'justify-center px-0'}`} title={t.mockInterview}><Icons.Cpu className="w-5 h-5 flex-shrink-0 text-cyan-500 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />{isSidebarOpen && <span className="truncate">{t.mockInterview}</span>}</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setTab(DashboardTab.TRENDING)} className={`group w-full flex items-center gap-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${tab === DashboardTab.TRENDING ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'} ${isSidebarOpen ? 'px-4' : 'justify-center px-0'}`} title={t.trendingCareers}><Icons.Flame className="w-5 h-5 flex-shrink-0 text-orange-500 transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110" />{isSidebarOpen && <span className="truncate">{t.trendingCareers}</span>}</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setTab(DashboardTab.COMPARE)} className={`group w-full flex items-center gap-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${tab === DashboardTab.COMPARE ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'} ${isSidebarOpen ? 'px-4' : 'justify-center px-0'}`} title={t.careerCompare}><Icons.Activity className="w-5 h-5 flex-shrink-0 text-teal-500 transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110" />{isSidebarOpen && <span className="truncate">{t.careerCompare}</span>}</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setTab(DashboardTab.SCORES)} className={`group w-full flex items-center gap-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${tab === DashboardTab.SCORES ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'} ${isSidebarOpen ? 'px-4' : 'justify-center px-0'}`} title={t.universityScores}><Icons.BookOpen className="w-5 h-5 flex-shrink-0 text-blue-500 transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110" />{isSidebarOpen && <span className="truncate">{t.universityScores}</span>}</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setTab(DashboardTab.SCHOLARSHIPS)} className={`group w-full flex items-center gap-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${tab === DashboardTab.SCHOLARSHIPS ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'} ${isSidebarOpen ? 'px-4' : 'justify-center px-0'}`} title={t.scholarships}><Icons.Search className="w-5 h-5 flex-shrink-0 text-sky-500 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />{isSidebarOpen && <span className="truncate">{t.scholarships}</span>}</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setTab(DashboardTab.PORTFOLIO)} className={`group w-full flex items-center gap-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${tab === DashboardTab.PORTFOLIO ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'} ${isSidebarOpen ? 'px-4' : 'justify-center px-0'}`} title={t.portfolio}><Icons.Briefcase className="w-5 h-5 flex-shrink-0 text-purple-500 transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110" />{isSidebarOpen && <span className="truncate">{t.portfolio}</span>}</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setTab(DashboardTab.CV_BUILDER)} className={`group w-full flex items-center gap-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${tab === DashboardTab.CV_BUILDER ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'} ${isSidebarOpen ? 'px-4' : 'justify-center px-0'}`} title={lang === Language.VI ? 'Tạo CV Tự Động AI' : 'AI CV Builder'}><Icons.FileText className="w-5 h-5 flex-shrink-0 text-indigo-500 transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110" />{isSidebarOpen && <span className="truncate">{lang === Language.VI ? 'Tạo CV Tự Động AI' : 'AI CV Builder'}</span>}</motion.button>
                
                {chatHistory.length > 0 && isSidebarOpen ? (
                <div className="mt-8 animate-fade-in">
                    <div className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2"><Icons.History className="w-3 h-3" />{t.chatHistory}</div>
                    </div>
                    <div className="mb-3 relative">
                        <Icons.Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t.searchChats} className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors" />
                    </div>
                    <div className="space-y-1">
                        {filteredHistory.map((session, idx) => (
                            <SidebarChatItem
                                key={session.id ? `${session.id}-${idx}` : `filt-session-${idx}`}
                                session={session}
                                onClick={() => loadSession(session)}
                                onRename={renameSession}
                                onStar={toggleStarSession}
                                onDelete={deleteSession}
                                t={t}
                            />
                        ))}
                        {filteredHistory.length === 0 && <div className="text-xs text-center py-2 text-gray-400">{t.noResultsFound}</div>}
                    </div>
                </div>
            ) : isSidebarOpen ? (
                <div className="mt-8 animate-fade-in">
                    <div className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2"><Icons.History className="w-3 h-3" />{t.chatHistory}</div>
                    </div>
                    <div className="text-center p-4 border border-dashed border-gray-200 dark:border-white/10 rounded-xl">
                        <Icons.MessageSquare className="w-6 h-6 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">{lang === Language.VI ? 'Chưa có lịch sử trò chuyện. Hãy bắt đầu một cuộc hội thoại mới!' : 'No chat history yet. Start a new conversation!'}</p>
                    </div>
                </div>
            ) : null}
        </nav>
        
        <div className="p-3 border-t border-gray-200 dark:border-white/5 bg-white/50 dark:bg-white/5 backdrop-blur-sm flex flex-col gap-2">
            {isSidebarOpen ? (
                <>
                    <motion.div 
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="p-3 rounded-2xl bg-gray-50/80 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 hover:border-indigo-500/40 transition-all cursor-pointer group space-y-2.5 shadow-2xs" 
                        onClick={() => setIsProfileModalOpen(true)}
                    >
                        {/* Avatar & User Name Header */}
                        <div className="flex items-center gap-3">
                            <img 
                                src={auth.user?.avatar || AVATARS[0]} 
                                alt="Avatar" 
                                referrerPolicy="no-referrer" 
                                onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=User&background=random'; }} 
                                className="w-11 h-11 rounded-full object-cover border-2 border-indigo-500/20 group-hover:border-indigo-500/60 transition-colors shadow-xs flex-shrink-0"
                            />
                            <div className="overflow-hidden flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {auth.user?.name}
                                    </p>
                                    {(() => {
                                        const userSub = getSubscriptionDetails(auth.user?.subscription);
                                        const isFreeSub = userSub.tier === 'free';
                                        const isMaxSub = userSub.tier === 'max_monthly' || userSub.tier === 'max_yearly';
                                        return (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setIsUpgradeModalOpen(true); }}
                                                className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase border transition-all flex items-center gap-0.5 flex-shrink-0 cursor-pointer ${
                                                    isFreeSub
                                                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                                                        : isMaxSub
                                                        ? 'bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30'
                                                        : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                                }`}
                                                title="Bấm để xem/nâng cấp gói"
                                            >
                                                <Icons.Zap className="w-2.5 h-2.5 fill-current" />
                                                {isFreeSub ? 'FREE' : isMaxSub ? 'MAX VIP' : 'PREMIUM'}
                                            </button>
                                        );
                                    })()}
                                </div>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{auth.user?.isGuest ? t.guestSession : auth.user?.email}</p>
                            </div>
                        </div>

                        {/* Level, Points & Streak Row */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 dark:border-white/5 text-[10px] font-bold">
                            <div className="flex items-center gap-1.5">
                                <span className="bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md">
                                    LV {auth.user?.level || 1}
                                </span>
                                <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md font-mono">
                                    {auth.user?.points || 0} CP
                                </span>
                            </div>

                            {auth.user?.streak !== undefined && auth.user.streak > 0 && (
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-md border border-amber-500/20" title={t.streakTooltip.replace('{{streak}}', auth.user.streak.toString())}>
                                    <Icons.Flame className={`w-3.5 h-3.5 ${getStreakColor(auth.user.streak)}`} />
                                    <span>{auth.user.streak}d</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsUpgradeModalOpen(true)} 
                        className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-gray-800 dark:text-gray-100 bg-gradient-to-r from-amber-500/15 via-indigo-500/15 to-purple-500/15 border border-amber-500/30 dark:border-indigo-500/30 rounded-xl hover:from-amber-500/25 hover:to-purple-500/25 transition-all cursor-pointer shadow-2xs"
                    >
                        <div className="flex items-center gap-2">
                            <Icons.Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span>{lang === Language.VI ? 'Nâng cấp Gói Pro & Đổi thưởng' : 'Upgrade Plan & Rewards'}</span>
                        </div>
                        <Icons.ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    </motion.button>
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsFeedbackOpen(true)} 
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-extrabold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl hover:bg-amber-500/20 transition-all cursor-pointer"
                    >
                        <Icons.Star className="w-3.5 h-3.5 fill-current text-yellow-500 dark:text-yellow-400" />
                        <span>{lang === Language.VI ? 'Đánh Giá & Góp Ý' : 'Rate & Feedback'}</span>
                    </motion.button>
                    <div className="flex gap-2 mb-2">
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleLang} 
                            className="flex-1 flex items-center justify-center px-3 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10 transition-all"
                        >
                            <span className="uppercase">{lang}</span>
                        </motion.button>
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleTheme} 
                            className="flex-1 flex items-center justify-center px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10 transition-all"
                        >
                            {theme === Theme.LIGHT ? <Icons.Moon className="w-4 h-4"/> : <Icons.Sun className="w-4 h-4"/>}
                        </motion.button>
                    </div>
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogout} 
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                        <Icons.LogOut className="w-4 h-4" />{t.logout}
                    </motion.button>
                </>
            ) : (
                <>
                    <motion.img 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        src={auth.user?.avatar || AVATARS[0]} 
                        alt="Avatar" 
                        referrerPolicy="no-referrer" 
                        onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=User&background=random'; }} 
                        className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm mx-auto mb-2 cursor-pointer" 
                        onClick={() => setIsProfileModalOpen(true)} 
                        title={t.profile} 
                    />
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleLang} 
                        className="w-full flex items-center justify-center py-2 text-xs font-bold text-gray-500 dark:text-gray-400 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10 transition-all mb-2"
                    >
                        <span className="uppercase">{lang}</span>
                    </motion.button>
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleTheme} 
                        className="w-full flex items-center justify-center py-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10 transition-all mb-2"
                    >
                        {theme === Theme.LIGHT ? <Icons.Moon className="w-4 h-4"/> : <Icons.Sun className="w-4 h-4"/>}
                    </motion.button>
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLogout} 
                        className="w-full flex items-center justify-center py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" 
                        title={t.logout}
                    >
                        <Icons.LogOut className="w-4 h-4" />
                    </motion.button>
                </>
            )}
        </div>
      </aside>
      <main className="flex-1 flex flex-col h-full relative w-full bg-white dark:bg-[#050505] z-10">
        <div className="absolute top-4 left-4 z-30 hidden md:block">
            <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                className="p-2 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white shadow-sm hover:shadow-md transition-all" 
                title={isSidebarOpen ? t.collapseSidebar : t.expandSidebar}
            >
                {isSidebarOpen ? <Icons.PanelLeftClose className="w-5 h-5" /> : <Icons.PanelLeftOpen className="w-5 h-5" />}
            </motion.button>
        </div>
        {/* Mobile Header */}
        <header className="md:hidden h-14 flex items-center justify-between px-4 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5 z-50 sticky top-0">
            <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMobileSidebarOpen(true)} 
                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors"
            >
                <Icons.Menu className="w-5 h-5" />
            </motion.button>
            <div className="flex items-center gap-1.5">
                <CareerGuideLogo className="w-5 h-5" />
                <span className="font-bold text-xs tracking-tight text-gray-900 dark:text-white uppercase">{t.appName}</span>
                {(() => {
                    const userSub = getSubscriptionDetails(auth.user?.subscription);
                    const isFreeSub = userSub.tier === 'free';
                    const isMaxSub = userSub.tier === 'max_monthly' || userSub.tier === 'max_yearly';
                    return (
                        <button
                            onClick={() => setIsUpgradeModalOpen(true)}
                            className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase border flex items-center gap-1 cursor-pointer ${
                                isFreeSub
                                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                    : isMaxSub
                                    ? 'bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30'
                                    : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            }`}
                        >
                            <Icons.Zap className="w-2.5 h-2.5 fill-current text-amber-500" />
                            {isFreeSub ? 'FREE' : isMaxSub ? 'MAX VIP' : 'PREMIUM'}
                        </button>
                    );
                })()}
            </div>
            <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => startNewChat()} 
                className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-colors"
            >
                <Icons.Plus className="w-5 h-5" />
            </motion.button>
        </header>
        
        {/* 60-Second Onboarding Flow Banner for Guest / Judges */}
        {auth.user?.isGuest && (
          <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-emerald-500/10 border-b border-indigo-200/50 dark:border-indigo-900/30 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs z-20 shrink-0">
            <div className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-200">
              <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black text-[10px] tracking-wide uppercase shadow-sm">
                60s Flow
              </span>
              <span>
                {lang === Language.VI 
                  ? 'Bắt đầu nhanh: 1. Trắc nghiệm RIASEC → 2. Lộ trình (Roadmap) → 3. Phỏng vấn thử' 
                  : 'Fast Flow: 1. RIASEC Quiz → 2. Career Roadmap → 3. Mock Interview'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setTab(DashboardTab.QUIZ)} 
                className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${tab === DashboardTab.QUIZ ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white dark:bg-white/10 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-white/20'}`}
              >
                {lang === Language.VI ? '1. Trắc nghiệm' : '1. RIASEC Quiz'}
              </button>
              <button 
                onClick={() => setTab(DashboardTab.PROGRESS)} 
                className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${tab === DashboardTab.PROGRESS ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white dark:bg-white/10 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-white/20'}`}
              >
                {lang === Language.VI ? '2. Lộ trình' : '2. Roadmap'}
              </button>
              <button 
                onClick={() => setTab(DashboardTab.MOCK_INTERVIEW)} 
                className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${tab === DashboardTab.MOCK_INTERVIEW ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white dark:bg-white/10 text-purple-600 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-white/20'}`}
              >
                {lang === Language.VI ? '3. Phỏng vấn' : '3. Interview'}
              </button>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex-1 flex flex-col min-h-0 overflow-hidden relative"
          >
            {tab === DashboardTab.CHAT && (
            <div className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
                {/* Chat Top Bar with Live Model / API Key Connection Indicator */}
                <div className="w-full bg-white/80 dark:bg-[#111]/80 backdrop-blur-md border-b border-gray-200/80 dark:border-white/5 px-4 py-2.5 flex items-center justify-between gap-3 text-xs z-10 shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                        <span className="font-bold text-gray-800 dark:text-gray-200 truncate">
                            {(currentChatTitle && !currentChatTitle.includes('Generate title') && !currentChatTitle.includes('Chào bạn') && currentChatTitle.length <= 50) 
                                ? currentChatTitle 
                                : (lang === Language.VI ? 'Trợ lý Hướng nghiệp AI' : 'AI Career Assistant')}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 shadow-xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>{lang === Language.VI ? 'AI Trực Tuyến' : 'AI Active'}</span>
                        </div>

                        <button
                            onClick={() => startNewChat()}
                            className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                            title={lang === Language.VI ? 'Đoạn chat mới' : 'New Chat'}
                        >
                            <Icons.Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {isTemporaryChat && (
                    <div className="w-full bg-amber-500/10 dark:bg-amber-400/5 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-xs text-amber-700 dark:text-amber-400 z-20 animate-fade-in">
                        <div className="flex items-center gap-2">
                            <Icons.Shield className="w-4 h-4 text-amber-500 flex-shrink-0 animate-pulse" />
                            <span className="font-medium">
                                {lang === Language.VI 
                                    ? "Chế độ Trò chuyện tạm thời đang hoạt động. Tin nhắn trong phiên này sẽ không được lưu." 
                                    : "Temporary Chat mode is active. Messages in this session will not be saved."}
                            </span>
                        </div>
                        <button 
                            onClick={() => startNewChat()}
                            className="text-[10px] font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-amber-300 px-2 py-1 rounded transition-colors cursor-pointer"
                        >
                            {lang === Language.VI ? "Thoát" : "Exit"}
                        </button>
                    </div>
                )}
                <div className={`overflow-y-auto p-4 md:p-8 scroll-smooth flex-1 ${messages.length === 0 ? 'flex flex-col items-center justify-center' : ''}`}>
                    <div className="w-full max-w-4xl mx-auto space-y-4 md:space-y-6 flex flex-col">
                    {isLoadingData ? (
                        <div className="w-full h-full flex flex-col justify-end gap-6 p-4">
                            <div className="flex items-start gap-4 animate-pulse">
                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                                <div className="space-y-3 flex-1 max-w-[70%]">
                                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-2xl rounded-tl-none w-full" />
                                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-2/3" />
                                </div>
                            </div>
                            <div className="flex justify-end animate-pulse">
                                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl rounded-tr-none w-1/2" />
                            </div>
                        </div>
                    ) : (
                        <>
                            {messages.length === 0 && (
                                <div className="w-full max-w-3xl mx-auto flex-col flex justify-center items-center py-6 sm:py-12">
                                    <motion.h2 
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                        className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500 text-center mb-2"
                                    >
                                        {greeting.text}, {greeting.name}!
                                    </motion.h2>
                                    <motion.p
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                        className="text-gray-500 dark:text-gray-400 text-sm sm:text-base md:text-lg text-center max-w-xl mt-3 px-4"
                                    >
                                        {welcomePhrase}
                                    </motion.p>
                                </div>
                            )}
                            {messages.map((m, idx) => (
                        <motion.div 
                            key={m.id ? `${m.id}-${idx}` : `msg-${idx}`} 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                            className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {m.role === 'model' && (<div className="hidden md:flex w-8 h-8 mr-4 flex-shrink-0 bg-indigo-600 rounded-full items-center justify-center text-white shadow-sm mt-1"><CareerGuideLogo className="w-5 h-5 text-white" /></div>)}
                            <div className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} max-w-[95%] md:max-w-[75%]`}>
                                 <div className={`px-4 md:px-6 py-2.5 md:py-3.5 rounded-2xl shadow-sm relative transition-all duration-300 ${m.role === 'user' ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-tr-none' : 'bg-white dark:bg-white/10 text-gray-900 dark:text-white border border-gray-200 dark:border-white/5 rounded-tl-none shadow-sm'}`}>
                                    {m.pastedTexts && m.pastedTexts.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 md:gap-2 mb-2 md:mb-3">
                                            {m.pastedTexts.map((text, idx) => (
                                                <div key={`pt-${m.id || ''}-${idx}-${text.slice(0, 10)}`} className="h-14 w-20 md:h-24 md:w-32 flex flex-col bg-white/10 rounded-lg md:rounded-2xl border border-white/20 shadow-sm p-1.5 md:p-3 overflow-hidden">
                                                    <p className="text-[7px] md:text-[10px] text-white/80 line-clamp-2 md:line-clamp-3 mb-auto leading-relaxed">{text}</p>
                                                    <div className="mt-1 md:mt-2 text-[6px] md:text-[9px] font-bold uppercase tracking-wider text-white/60 border border-white/20 rounded-md px-1 md:px-1.5 py-0.5 self-start bg-white/5">
                                                        {t.pasted}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {m.file && (
                                        <div className="mb-2 max-w-full overflow-hidden rounded-lg">
                                            {m.file.mimeType.startsWith('image/') ? (
                                                <img src={`data:${m.file.mimeType};base64,${m.file.data}`} alt="Uploaded" className="max-h-32 md:max-h-60 object-contain rounded-lg" referrerPolicy="no-referrer" />
                                            ) : (
                                                <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-white/10 rounded-xl border border-white/20">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white md:w-5 md:h-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                                    <span className="text-[10px] md:text-sm font-medium truncate max-w-[100px] md:max-w-[200px]">{m.file.name}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div className="leading-normal text-[14px] md:text-[15px] markdown-body">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{cleanText(m.text)}</ReactMarkdown>
                                    </div>
                                    {m.role === 'model' && extractClarificationJson(m.text) && (
                                        <ClarificationCard 
                                            clarification={extractClarificationJson(m.text)!} 
                                            onSelect={(option) => handleSendMessage(undefined, option)}
                                            disabled={isChatLoading}
                                        />
                                    )}
                                    {m.role === 'model' && (() => {
                                        const prevUserMsg = messages.slice(0, idx).reverse().find(msg => msg.role === 'user')?.text || '';
                                        const isExplicitRoadmapRequest = 
                                            /(lập|tạo|xây dựng|thiết kế|lên|cho tôi|hãy làm)\s*(lộ trình|roadmap|kế hoạch\s*\d+\s*tháng|bảng tiến độ)/i.test(prevUserMsg) ||
                                            /(lộ trình|roadmap)\s*(3 tháng|\d+\s*tháng|chi tiết|từng tháng)/i.test(prevUserMsg);
                                        const hasExplicitRoadmapJson = /```json\s*\[\s*\{\s*"id":/i.test(m.text) || /\[\s*\{\s*"id":\s*"\d+"[\s\S]*?"title":/i.test(m.text);

                                        if (!isExplicitRoadmapRequest && !hasExplicitRoadmapJson) return null;

                                        const parsedRoadmap = extractRoadmapJson(m.text);
                                        if (!parsedRoadmap || parsedRoadmap.length === 0) return null;

                                        return (
                                            <motion.button
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => handleSyncRoadmap(parsedRoadmap)}
                                                className="mt-4 flex items-center gap-2.5 px-5 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-2xl text-xs md:text-sm font-extrabold transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
                                            >
                                                <Icons.Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                                                <span>{lang === Language.VI ? '🚀 Đồng bộ Lộ trình này vào Tiến độ AI' : '🚀 Sync Roadmap to Progress Board'}</span>
                                            </motion.button>
                                        );
                                    })()}
                                </div>
                                <span className={`text-[10px] mt-1.5 opacity-40 font-bold px-1 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>{m.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                        </motion.div>
                    ))}
                    </>
                    )}
                    {isChatLoading && (
                        <motion.div 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                            className="flex w-full justify-start items-start gap-3 mt-2"
                        >
                            <div className="flex w-8 h-8 flex-shrink-0 bg-indigo-600 rounded-full items-center justify-center text-white shadow-sm mt-0.5">
                                <CareerGuideLogo className="w-5 h-5 text-white" isThinking={true} />
                            </div>
                            <div className="px-5 py-3.5 bg-white dark:bg-white/10 rounded-2xl rounded-tl-none border border-gray-200/80 dark:border-white/10 shadow-sm flex items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
                                    <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse delay-75"></span>
                                    <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse delay-150"></span>
                                </div>
                                <ShimmerText text={thinkingText} />
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} className="h-4" />
                    </div>
                </div>
                <div className="p-4 bg-white dark:bg-[#050505] w-full flex flex-col items-center border-t border-gray-200 dark:border-white/5 relative">
                    {showCamera && (
                        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4">
                            <div className="relative w-full max-w-md bg-black rounded-3xl overflow-hidden border border-white/20 shadow-2xl">
                                <video ref={videoRef} autoPlay playsInline className="w-full h-auto max-h-[70vh] object-cover" />
                                <div className="absolute bottom-6 left-0 w-full flex justify-center gap-8 px-6">
                                    <button onClick={stopCamera} className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                    <button onClick={capturePhoto} className="w-16 h-16 rounded-full bg-white border-4 border-gray-300 flex items-center justify-center hover:scale-105 transition-transform shadow-lg">
                                        <div className="w-12 h-12 rounded-full border border-gray-200"></div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSendMessage} className={`relative w-full flex flex-col transition-all shadow-sm ${messages.length === 0 ? 'max-w-3xl bg-gray-100 dark:bg-[#2F2F2F] rounded-[24px]' : 'max-w-4xl bg-gray-100 dark:bg-[#1e1e1e] rounded-[24px] md:rounded-[32px]'} p-3 md:p-4`}>
                        <input type="file" id="chat-file-upload" className="hidden" accept="image/*,application/pdf,text/plain,text/csv" onChange={(e) => { handleFileUpload(e); setShowAttachmentMenu(false); }} />
                        
                        {/* File Preview Area */}
                        <AnimatePresence>
                            <div className="flex flex-wrap gap-2 md:gap-3 mb-2 md:mb-3">
                                {selectedFile && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="relative inline-block self-start"
                                    >
                                        {selectedFile.mimeType.startsWith('image/') ? (
                                            <img src={`data:${selectedFile.mimeType};base64,${selectedFile.data}`} alt="Preview" className="h-12 w-12 md:h-16 md:w-16 object-cover rounded-xl md:rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm" referrerPolicy="no-referrer" />
                                        ) : (
                                            <div className="h-12 w-12 md:h-16 md:w-16 flex flex-col items-center justify-center bg-white dark:bg-white/5 rounded-xl md:rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm p-1.5 md:p-2 text-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500 mb-0.5 md:mb-1"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                                <span className="text-[7px] md:text-[8px] font-medium text-gray-600 dark:text-gray-300 truncate w-full">{selectedFile.name}</span>
                                            </div>
                                        )}
                                        <button type="button" onClick={() => setSelectedFile(null)} className="absolute -top-1.5 -right-1.5 bg-gray-800 dark:bg-gray-600 text-white rounded-full p-0.5 md:p-1 shadow-md hover:bg-gray-900 dark:hover:bg-gray-500 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        </button>
                                    </motion.div>
                                )}
                                {pastedTexts.map((text, index) => (
                                    <motion.div 
                                        key={`pasted-prev-${index}-${text.slice(0, 10)}`}
                                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="relative inline-block self-start"
                                    >
                                        <div className="h-16 w-24 md:h-24 md:w-32 flex flex-col bg-white dark:bg-white/5 rounded-xl md:rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm p-2 md:p-3 overflow-hidden">
                                            <p className="text-[8px] md:text-[10px] text-gray-600 dark:text-gray-300 line-clamp-2 md:line-clamp-3 mb-auto leading-relaxed">{text}</p>
                                            <div className="mt-1 md:mt-2 text-[7px] md:text-[9px] font-bold uppercase tracking-wider text-gray-400 border border-gray-200 dark:border-white/10 rounded-md px-1 md:px-1.5 py-0.5 self-start bg-gray-50 dark:bg-white/5">
                                                {t.pasted}
                                            </div>
                                        </div>
                                        <button type="button" onClick={() => setPastedTexts(prev => prev.filter((_, i) => i !== index))} className="absolute -top-1.5 -right-1.5 bg-gray-800 dark:bg-gray-600 text-white rounded-full p-0.5 md:p-1 shadow-md hover:bg-gray-900 dark:hover:bg-gray-500 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </AnimatePresence>

                        {/* Text Input Area */}
                        <textarea 
                            value={inputMsg} 
                            onClick={() => setShowAttachmentMenu(false)} 
                            onChange={(e) => {
                                setInputMsg(e.target.value);
                                e.target.style.height = 'auto';
                                e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                            }} 
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey && window.innerWidth > 768) {
                                    if (e.nativeEvent.isComposing) return; // Prevent Enter during IME composition
                                    e.preventDefault();
                                    if ((inputMsg.trim() || selectedFile || pastedTexts.length > 0) && !isChatLoading) {
                                        handleSendMessage();
                                    }
                                }
                            }}
                            onPaste={(e) => {
                                const text = e.clipboardData.getData('text');
                                if (text && (text.length > 200 || text.split('\n').length > 3)) {
                                    e.preventDefault();
                                    setPastedTexts(prev => [...prev, text]);
                                }
                            }}
                            placeholder={t.chatPlaceholder} 
                            className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-gray-900 dark:text-[#EBEBEB] placeholder-gray-500 dark:placeholder-gray-400 text-[13px] md:text-base resize-none min-h-[36px] md:min-h-[44px] max-h-[200px] overflow-y-auto mb-1 md:mb-2"
                            rows={1}
                        />

                        {/* Bottom Toolbar */}
                        <div className="flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-1 relative">
                                <motion.button 
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    type="button" 
                                    onClick={() => setShowAttachmentMenu(!showAttachmentMenu)} 
                                    className={`p-2.5 md:p-2 rounded-full transition-colors ${showAttachmentMenu ? 'bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'}`}
                                    title={lang === Language.VI ? 'Đính kèm' : 'Attach'}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 md:w-5 md:h-5 ${showAttachmentMenu ? 'rotate-45' : ''}`}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                </motion.button>

                                <AnimatePresence>
                                    {showAttachmentMenu && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.15, ease: "easeOut" }}
                                            className="absolute bottom-full left-0 mb-2 bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden flex flex-col py-1 md:py-2 min-w-[140px] md:min-w-[160px] z-50 origin-bottom-left"
                                        >
                                            <button 
                                                type="button" 
                                                onClick={() => { document.getElementById('chat-file-upload')?.click(); setShowAttachmentMenu(false); }} 
                                                className="flex items-center gap-3 px-4 py-3 md:py-3 text-sm md:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left"
                                            >
                                                <Icons.FileText className="w-[18px] h-[18px] md:w-[18px] md:h-[18px] text-indigo-500" />
                                                {t.uploadFile}
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={() => { startCamera(); setShowAttachmentMenu(false); }} 
                                                className="flex items-center gap-3 px-4 py-3 md:py-3 text-sm md:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left"
                                            >
                                                <Icons.Camera className="w-[18px] h-[18px] md:w-[18px] md:h-[18px] text-fuchsia-500" />
                                                {t.takePhoto}
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="flex items-center gap-1.5 md:gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="button"
                                    onClick={() => setIsPromptModalOpen(true)}
                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors shadow-xs"
                                    title={lang === Language.VI ? "Thư viện & Tạo Prompt AI" : "AI Prompt Templates"}
                                >
                                    <Icons.Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                    <span className="hidden sm:inline">{lang === Language.VI ? "Mẫu Prompt AI" : "AI Prompts"}</span>
                                </motion.button>

                                <div className="relative group">
                                    <motion.button 
                                        whileHover={{ scale: 1.05 }} 
                                        whileTap={{ scale: 0.95 }} 
                                        type="button" 
                                        onClick={toggleVoiceInput} 
                                        className={`p-2.5 md:p-2 rounded-full transition-colors relative z-10 ${isListening ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-[#EBEBEB]'}`} 
                                        aria-label={t.voiceInput}
                                    >
                                        <div className="relative">
                                            <Icons.Microphone className={`w-5 h-5 md:w-5 md:h-5 transition-transform duration-300 ${isListening ? 'animate-pulse scale-110' : 'group-hover:scale-110 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`} />
                                            {isListening && (
                                                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                                </span>
                                            )}
                                        </div>
                                    </motion.button>
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 dark:bg-gray-800 text-white text-[11px] font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-20">
                                        {isListening ? t.stopListening : t.voiceInput}
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-800 rotate-45"></div>
                                    </div>
                                </div>
                                <div className="relative group">
                                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button" onClick={switchToVoice} className="p-2.5 md:p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-[#EBEBEB] transition-colors relative z-10" aria-label={t.switchToVoice}>
                                        <Icons.Headset className="w-5 h-5 md:w-5 md:h-5 transition-transform duration-300 group-hover:scale-110 group-hover:text-amber-600 dark:group-hover:text-amber-500" />
                                    </motion.button>
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 dark:bg-gray-800 text-white text-[11px] font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-20">
                                        {t.switchToVoice}
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-800 rotate-45"></div>
                                    </div>
                                </div>
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" disabled={(!inputMsg.trim() && !selectedFile && pastedTexts.length === 0) || isChatLoading} className="p-2.5 md:p-2 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-400 disabled:opacity-30 disabled:hover:bg-indigo-600 transition-all shadow-md ml-1">
                                    {isChatLoading ? <div className="w-5 h-5 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Icons.Send className="w-5 h-5 md:w-5 md:h-5" />}
                                </motion.button>
                            </div>
                        </div>

                    </form>

                    <AnimatePresence>
                        {messages.length === 0 && !inputMsg.trim() && (
                            <motion.div 
                                initial={{ opacity: 0, y: 15, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                exit={{ opacity: 0, y: 15, height: 0 }}
                                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                className="flex flex-wrap justify-center gap-2 mt-4 max-w-3xl mb-4 overflow-hidden"
                            >
                                {SUGGESTION_PROMPTS[lang] && SUGGESTION_PROMPTS[lang].map((suggestion, idx) => {
                                    const IconComponent = (Icons as any)[suggestion.icon] || Icons.MessageSquare;
                                    return (
                                        <motion.button
                                            key={`sug-${lang}-${idx}-${suggestion.title}`}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleSendMessage(undefined, suggestion.prompt)}
                                            className="px-4 py-2 rounded-full border border-gray-200 dark:border-white/10 text-xs sm:text-sm font-medium transition-all hover:bg-gray-100 dark:hover:bg-white/10 bg-white dark:bg-white/5 flex items-center gap-2 text-gray-700 dark:text-gray-300 shadow-sm"
                                        >
                                            <IconComponent className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                                            {suggestion.title}
                                        </motion.button>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                 <div className="text-center pb-2 text-[10px] text-gray-400 uppercase tracking-widest font-bold opacity-60">{t.footerDisclaimer}</div>
            </div>
        )}
        {tab === DashboardTab.VOICE && (
             <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-slate-50 via-indigo-50/20 to-slate-100 dark:from-[#06060a] dark:via-[#090912] dark:to-[#030303] overflow-hidden relative">
                 {/* Abstract ambient background */}
                 <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] bg-gradient-to-tr from-indigo-500/20 via-purple-500/15 to-transparent blur-[120px] rounded-full transition-all duration-1000 ${isVoiceActive ? 'scale-110 opacity-100' : 'scale-90 opacity-40'}`} />
                 </div>

                 {/* Top Status Header */}
                 <div className="relative z-10 pt-6 pb-2 px-6 text-center flex-shrink-0">
                    <div className="inline-flex flex-wrap items-center justify-center gap-2 mb-2">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-white/5 border border-gray-200/60 dark:border-white/10 shadow-sm backdrop-blur-md">
                            <div className={`w-2.5 h-2.5 rounded-full ${isVoiceActive ? (audioLevel > 0.1 ? 'bg-purple-500 animate-ping' : 'bg-emerald-500 animate-pulse') : 'bg-gray-400'}`} />
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                {isVoiceActive 
                                    ? (audioLevel > 0.1 ? (lang === Language.VI ? 'AI đang nói...' : 'AI Speaking...') : (lang === Language.VI ? 'Đang lắng nghe...' : 'Listening...')) 
                                    : (lang === Language.VI ? 'Chưa kết nối' : 'Disconnected')}
                            </span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50/90 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 shadow-sm backdrop-blur-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            <span>Gemini Live API (gemini-3.1-flash-live-preview)</span>
                        </div>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {lang === Language.VI ? 'Trợ lý Giọng nói CareerGuide AI' : 'CareerGuide AI Voice Counselor'}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 max-w-md mx-auto truncate">
                        {voiceStatus || (isVoiceActive 
                            ? (lang === Language.VI ? 'Trò chuyện hai chiều thời gian thực qua Gemini Live' : 'Real-time duplex voice session via Gemini Live') 
                            : (lang === Language.VI ? 'Nhấn "Kết nối thoại" bên dưới để bắt đầu hội thoại' : 'Click "Connect Voice" below to start conversation'))}
                    </p>
                 </div>

                 {/* Center Orb Stage */}
                 <div className="relative z-10 flex-shrink-0 my-3 sm:my-5 flex items-center justify-center">
                    <div 
                        className="relative w-36 h-36 sm:w-48 sm:h-48 flex items-center justify-center cursor-pointer group"
                        onClick={handleVoiceToggle}
                    >
                        {/* Audio Reactive Rings */}
                        {isVoiceActive && (
                            <>
                                <div className="absolute inset-0 rounded-full border-2 border-indigo-500/30 animate-[ping_2.5s_ease-out_infinite]" style={{ transform: `scale(${1 + (audioLevel / 100) * 0.4})` }} />
                                <div className="absolute inset-[-15px] rounded-full border border-purple-500/20 animate-[ping_3.5s_ease-out_infinite_300ms]" style={{ transform: `scale(${1 + (audioLevel / 100) * 0.6})` }} />
                            </>
                        )}
                        
                        {/* Main Sphere */}
                        <div className={`relative w-full h-full rounded-full flex flex-col items-center justify-center transition-all duration-500 overflow-hidden shadow-2xl backdrop-blur-md border ${isVoiceActive ? 'bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 border-indigo-400/50 scale-105 shadow-indigo-500/30' : 'bg-white/80 dark:bg-white/5 border-gray-200 dark:border-white/10 group-hover:scale-105 group-hover:border-indigo-500/50 shadow-black/5'}`}>
                            {isVoiceActive && <div className="absolute inset-0 bg-black/10 animate-pulse" />}
                            <Icons.Microphone className={`w-12 h-12 sm:w-16 sm:h-16 transition-colors duration-500 relative z-10 ${isVoiceActive ? 'text-white drop-shadow-lg' : 'text-gray-400 group-hover:text-indigo-500'}`} />
                        </div>
                    </div>
                 </div>

                 {/* Dedicated Transcript Display (Scrollable Box BELOW the Orb) */}
                 <div className="relative z-10 flex-1 max-w-2xl w-full mx-auto px-4 min-h-0 flex flex-col justify-end mb-28">
                    {/* Quick Question Chips */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2 mb-2">
                        {[
                            { vi: "🎯 Gợi ý nghề nghiệp phù hợp", en: "🎯 Career recommendations" },
                            { vi: "🚀 Lộ trình phát triển IT / AI", en: "🚀 IT / AI roadmap" },
                            { vi: "💼 Kỹ năng phỏng vấn xin việc", en: "💼 Interview preparation" },
                            { vi: "📈 Xu hướng tuyển dụng 2026", en: "📈 Job market trends 2026" }
                        ].map((chip, idx) => (
                            <button
                                key={`chip-${idx}`}
                                onClick={() => handleSendVoiceQuestion(lang === Language.VI ? chip.vi : chip.en)}
                                className="whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold bg-white/80 dark:bg-white/10 hover:bg-indigo-50 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200 border border-gray-200/80 dark:border-white/10 transition-all shadow-xs cursor-pointer flex-shrink-0"
                            >
                                {lang === Language.VI ? chip.vi : chip.en}
                            </button>
                        ))}
                    </div>

                    <div className="w-full h-full max-h-[28vh] sm:max-h-[32vh] overflow-y-auto px-4 py-3 space-y-3 rounded-2xl bg-white/70 dark:bg-[#121216]/70 backdrop-blur-md border border-gray-200/60 dark:border-white/10 shadow-inner no-scrollbar">
                        {transcripts.length === 0 ? (
                            <div className="h-full min-h-[90px] flex flex-col items-center justify-center text-center p-3 text-gray-400 dark:text-gray-500">
                                <Icons.MessageSquare className="w-5 h-5 mb-1.5 opacity-50 text-indigo-500" />
                                <p className="text-xs sm:text-sm font-medium">
                                    {isVoiceActive 
                                        ? (lang === Language.VI ? '🎤 Đang lắng nghe... Bạn hãy nói hoặc gõ câu hỏi bên dưới.' : '🎤 Listening... Please speak or type your question below.')
                                        : (lang === Language.VI ? 'Nhấn "Kết nối thoại" hoặc bấm vào câu hỏi gợi ý để bắt đầu.' : 'Click "Connect Voice" or tap any topic chip above to start.')}
                                </p>
                            </div>
                        ) : (
                            transcripts.map((tr, i) => (
                                <div key={`tr-${i}-${tr.isUser ? 'u' : 'm'}`} className={`flex ${tr.isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                    <div className={`max-w-[88%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                                        tr.isUser 
                                            ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-xs' 
                                            : 'bg-white dark:bg-[#1e1e24] text-gray-800 dark:text-gray-100 rounded-tl-xs border border-gray-200/70 dark:border-white/10'
                                    }`}>
                                        <div className="text-[10px] uppercase font-bold tracking-wider mb-1 opacity-75">
                                            {tr.isUser ? (lang === Language.VI ? 'Bạn' : 'You') : 'CareerGuide AI'}
                                        </div>
                                        {tr.text}
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={transcriptEndRef} />
                    </div>

                    {/* Interactive Direct Message Input */}
                    <form 
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSendVoiceQuestion();
                        }}
                        className="mt-2 flex items-center gap-2 bg-white/90 dark:bg-[#18181f]/90 backdrop-blur-md rounded-xl p-1.5 border border-gray-200/80 dark:border-white/10 shadow-sm"
                    >
                        <input 
                            type="text"
                            value={voiceInputText}
                            onChange={(e) => setVoiceInputText(e.target.value)}
                            placeholder={lang === Language.VI ? "Nhập câu hỏi hoặc nói trực tiếp qua micro..." : "Type question or speak directly via mic..."}
                            className="flex-1 bg-transparent px-3 py-1.5 text-xs sm:text-sm text-gray-800 dark:text-gray-100 focus:outline-none placeholder:text-gray-400"
                        />
                        <button
                            type="submit"
                            disabled={!voiceInputText.trim()}
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer flex-shrink-0"
                        >
                            <span>{lang === Language.VI ? 'Gửi' : 'Send'}</span>
                            <Icons.Send className="w-3.5 h-3.5" />
                        </button>
                    </form>
                 </div>

                 {/* Fixed Controls Toolbar */}
                 <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[95%] max-w-2xl flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 bg-white/95 dark:bg-[#111]/95 backdrop-blur-xl px-4 py-2.5 rounded-2xl sm:rounded-full border border-gray-200/80 dark:border-white/10 shadow-2xl z-30">
                     <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                         <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-2.5 py-1 rounded-full">
                            <Icons.Microphone className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                            <select 
                               value={selectedDeviceId} 
                               onChange={(e) => setSelectedDeviceId(e.target.value)} 
                               disabled={isVoiceActive} 
                               className="appearance-none bg-transparent text-gray-700 dark:text-gray-300 focus:outline-none font-medium text-xs max-w-[100px] sm:max-w-[120px] truncate cursor-pointer disabled:opacity-50"
                            >
                                {inputDevices.map((device, devIdx) => (
                                    <option key={device.deviceId ? `${device.deviceId}-${devIdx}` : `dev-${devIdx}`} value={device.deviceId} className="bg-white dark:bg-black">
                                        {device.label || `${t.microphone} ${devIdx + 1}`}
                                    </option>
                                ))}
                            </select>
                            <Icons.ChevronDown className="w-3 h-3 text-gray-400 pointer-events-none flex-shrink-0" />
                         </div>

                         {/* Voice Persona Selector */}
                         <div className="flex items-center gap-1 bg-purple-50 dark:bg-purple-950/60 border border-purple-200/70 dark:border-purple-800/70 px-2.5 py-1 rounded-full">
                            <Icons.Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                            <select
                               value={selectedVoice}
                               onChange={(e) => setSelectedVoice(e.target.value)}
                               disabled={isVoiceActive}
                               className="appearance-none bg-transparent text-purple-700 dark:text-purple-300 font-semibold text-xs focus:outline-none cursor-pointer disabled:opacity-50"
                            >
                                <option value="Aoede" className="bg-white dark:bg-black text-gray-900 dark:text-white">Aoede (Nữ truyền cảm)</option>
                                <option value="Kore" className="bg-white dark:bg-black text-gray-900 dark:text-white">Kore (Nữ chuẩn mực)</option>
                                <option value="Puck" className="bg-white dark:bg-black text-gray-900 dark:text-white">Puck (Nam năng động)</option>
                                <option value="Fenrir" className="bg-white dark:bg-black text-gray-900 dark:text-white">Fenrir (Nam trầm ấm)</option>
                                <option value="Zephyr" className="bg-white dark:bg-black text-gray-900 dark:text-white">Zephyr (Nam cân bằng)</option>
                            </select>
                            <Icons.ChevronDown className="w-3 h-3 text-purple-500 pointer-events-none flex-shrink-0" />
                         </div>

                         {/* Speech Rate */}
                         <div className="flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 px-2.5 py-1 rounded-full">
                             <select
                                value={speechRate}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    setSpeechRate(val);
                                    if (liveSessionRef.current) {
                                        liveSessionRef.current.speechRate = val;
                                    }
                                }}
                                className="appearance-none bg-transparent text-indigo-700 dark:text-indigo-300 font-bold text-xs focus:outline-none cursor-pointer pr-1"
                             >
                                 <option value="0.9" className="bg-white dark:bg-black text-gray-900 dark:text-white">0.9x (Chậm rãi)</option>
                                 <option value="1" className="bg-white dark:bg-black text-gray-900 dark:text-white">1.0x (Tự nhiên)</option>
                                 <option value="1.1" className="bg-white dark:bg-black text-gray-900 dark:text-white">1.1x (Vừa phải)</option>
                                 <option value="1.25" className="bg-white dark:bg-black text-gray-900 dark:text-white">1.25x (Nhanh)</option>
                             </select>
                             <Icons.ChevronDown className="w-3 h-3 text-indigo-500 pointer-events-none flex-shrink-0" />
                         </div>
                     </div>
                     
                     <div className="flex items-center gap-2 ml-auto">
                        <button
                            onClick={handleVoiceToggle}
                            className={`whitespace-nowrap flex-shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
                                isVoiceActive
                                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
                            }`}
                        >
                            {isVoiceActive ? (
                                <>
                                    <Icons.Square className="w-3.5 h-3.5 fill-current flex-shrink-0" />
                                    <span>{lang === Language.VI ? 'Dừng cuộc gọi' : 'End Call'}</span>
                                </>
                            ) : (
                                <>
                                    <Icons.PhoneCall className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span>{lang === Language.VI ? 'Kết nối thoại' : 'Connect Voice'}</span>
                                </>
                            )}
                        </button>
                     </div>
                 </div>
             </div>
        )}
        {tab === DashboardTab.QUIZ && (
            <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#050505] overflow-y-auto">
                <div className="w-full p-6 border-b border-gray-200 dark:border-white/5">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{t.careerQuizTitle}</h2>
                    <p className="text-sm text-gray-500 font-medium">{t.careerQuizDesc}</p>
                </div>
                <div className="p-6 pb-0">
                  <InlineGuide 
                    sectionKey="riasec-quiz"
                    lang={lang === Language.VI ? 'vi' : 'en'}
                    title={lang === Language.VI ? "💡 Hướng dẫn trắc nghiệm RIASEC lý tưởng" : "💡 Career Quiz / RIASEC Guide"}
                    steps={lang === Language.VI ? [
                      "Bài khảo sát gồm các phiên bản linh hoạt: 13 câu (rút gọn), 20 câu (tiêu chuẩn) hoặc 30 câu (chuyên sâu) đo đạc 6 nhóm sở thích nghề nghiệp RIASEC.",
                      "Hãy lựa chọn khách quan theo mức độ hứng thú thật của bản thân mà không cần đắn đo về năng lực chuyên môn hiện thực.",
                      "Khi làm xong, hệ thống tự động lưu điểm RIASEC vào hồ sơ cá nhân và kích hoạt cuộc tư vấn định vị thế mạnh độc quyền với AI."
                    ] : [
                      "The survey offers flexible versions: 13 (quick), 20 (standard), or 30 (comprehensive) questions measuring the 6 RIASEC interest types.",
                      "Respond based on your native passion and real hobby preferences, separate from active skills validation.",
                      "Once done, points sync with your profile metadata, launching an automated customized consultation plan via AI."
                    ]}
                  />
                </div>
                <div className="flex-1 flex items-center justify-center p-6">
                    <CareerQuiz lang={lang} t={t} onComplete={(result) => {
                        const prompt = t.quizAdvicePrompt.replace('{{result}}', result || '');
                        
                        // Update user profile with career profile
                        if (auth.user) {
                            updateUserProfile({ careerProfile: result });
                        }
                        
                        setTab(DashboardTab.CHAT);
                        handleSendMessage(undefined, prompt);
                    }} />
                </div>
            </div>
        )}
        {tab === DashboardTab.PROGRESS && (
            <ProgressBoard 
                chatHistory={chatHistory} 
                messages={messages}
                user={auth.user} 
                language={lang} 
                theme={theme}
                milestones={milestones}
                setMilestones={setMilestones}
                googleAccessToken={googleAccessToken}
                onConnectGoogleCalendar={handleGoogleCalendarConnect}
                showToast={showToast}
                onNavigateToChat={() => setTab(DashboardTab.CHAT)} 
                onSendPromptToChat={(promptText) => {
                    setTab(DashboardTab.CHAT);
                    handleSendMessage(undefined, promptText);
                }}
                onRequestUpgrade={(feature) => setIsUpgradeModalOpen(true)}
            />
        )}
        {tab === DashboardTab.PROMPT_BUILDER && (
            <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#050505] overflow-y-auto p-4 md:p-6">
                <RoadmapPromptBuilder
                    language={lang}
                    user={auth.user}
                    onSendPromptToChat={(promptText) => {
                        setTab(DashboardTab.CHAT);
                        handleSendMessage(undefined, promptText);
                    }}
                    showToast={showToast}
                />
            </div>
        )}
        {tab === DashboardTab.CAREER_LIFECYCLE && (
            <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#050505] overflow-y-auto p-4 md:p-6">
                <CareerLifecycleManager
                    language={lang}
                    user={auth.user}
                    onSendPromptToChat={(promptText) => {
                        setTab(DashboardTab.CHAT);
                        handleSendMessage(undefined, promptText);
                    }}
                    showToast={showToast}
                    onRequestUpgrade={(feature) => setIsUpgradeModalOpen(true)}
                />
            </div>
        )}
        {tab === DashboardTab.MONETIZATION_PARTNERS && (
            <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#050505] overflow-y-auto p-4 md:p-6">
                <MonetizationRewardsHub
                    language={lang}
                    user={auth.user}
                    showToast={showToast}
                    onNavigateToChat={() => setTab(DashboardTab.CHAT)}
                    onUpdateUser={updateUserProfile}
                />
            </div>
        )}
        {tab === DashboardTab.MOCK_INTERVIEW && (
            <MockInterview 
                language={lang} 
                theme={theme} 
                user={auth.user} 
                onAddEarnedPoints={awardExperiencePoints} 
                onRequestUpgrade={triggerUpgradeModal}
                onUpdateUser={updateUserProfile}
            />
        )}
        {tab === DashboardTab.PORTFOLIO && (
            <Portfolio 
                user={auth.user} 
                language={lang} 
                theme={theme}
                onUpdateUser={updateUserProfile}
                showToast={showToast}
            />
        )}
        {tab === DashboardTab.SCHOLARSHIPS && (
            <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#050505] overflow-y-auto p-4 md:p-8">
              <Scholarships language={lang} userProfile={auth.user} />
            </div>
        )}
        {tab === DashboardTab.SCORES && (
            <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#050505] overflow-y-auto p-4 md:p-8">
              <UniversityScores lang={lang} t={t} Icons={Icons} />
            </div>
        )}
        {tab === DashboardTab.COMPARE && (
            <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#050505] overflow-y-auto p-4 md:p-8">
              <CareerCompare lang={lang} t={t} Icons={Icons} />
            </div>
        )}
        {tab === DashboardTab.TRENDING && (
            <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#050505] overflow-y-auto p-4 md:p-8">
              <HotCareersVietnam 
                  lang={lang} 
                  onConsult={(jobTitle) => {
                      setTab(DashboardTab.CHAT);
                      setTimeout(() => {
                          handleSendMessage(undefined, lang === Language.VI 
                            ? `Tôi muốn được tư vấn định hướng kỹ lưỡng về ngành nghề "${jobTitle}" hiện tại tại Việt Nam.` 
                            : `I would like structured counseling about the "${jobTitle}" career in Vietnam.`);
                      }, 50);
                  }} 
              />
            </div>
        )}
        {tab === DashboardTab.CV_BUILDER && (
            <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#050505] overflow-y-auto p-4 md:p-8">
              <CvBuilder 
                  language={lang} 
                  theme={theme} 
                  user={auth.user} 
                  showToast={showToast} 
                  onNavigateToChat={() => setTab(DashboardTab.CHAT)} 
                  onRequestUpgrade={triggerUpgradeModal}
              />
            </div>
        )}
        {tab === DashboardTab.FOUNDERS && (
            <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#050505] overflow-y-auto">
              <FoundersSection 
                  lang={lang} 
                  isStandaloneTab={true}
                  onExploreDemo={handleActivateDemo}
              />
            </div>
        )}
        </motion.div>
        </AnimatePresence>
      </main>

      {/* Profile Modal */}
      <AnimatePresence>
        {isProfileModalOpen && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={() => setIsProfileModalOpen(false)}
            >
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="profile-modal-title"
                >
                    <button 
                        onClick={() => setIsProfileModalOpen(false)}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors"
                        aria-label={lang === Language.VI ? 'Đóng' : 'Close'}
                    >
                        <Icons.X className="w-5 h-5" />
                    </button>
                    
                    <h2 id="profile-modal-title" className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t.profile}</h2>
                    
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <img src={auth.user?.avatar || AVATARS[0]} alt="Profile" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=User&background=random'; }} className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 dark:border-white/5 shadow-xl group-hover:scale-105 transition-transform"/>
                                <div className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 border-2 border-white dark:border-black rounded-full flex items-center justify-center text-white shadow-lg">
                                    <Icons.Camera className="w-4 h-4" />
                                </div>
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
                            <button onClick={changeAvatar} className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline uppercase tracking-wider">{t.randomAvatar}</button>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-3 mb-1">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{auth.user?.name}</h3>
                                {auth.user?.streak !== undefined && auth.user.streak > 0 && (
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-[#1a1a1a] rounded-lg shadow-inner border border-gray-200 dark:border-white/5" title={t.streakTooltip.replace('{{streak}}', auth.user.streak.toString())}>
                                        <Icons.Flame className={`w-4 h-4 ${getStreakColor(auth.user.streak)}`} />
                                        <span className={`text-xs font-black ${getStreakColor(auth.user.streak)}`}>{auth.user.streak}</span>
                                    </div>
                                )}
                            </div>
                            <p className="text-gray-500 text-sm">{auth.user?.isGuest ? t.guestMode : auth.user?.email}</p>
                            {auth.user?.isGuest && <span className="inline-block mt-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 text-[10px] rounded-full font-black uppercase tracking-wider">{t.guestMode}</span>}
                        </div>
                    </div>
                    
                    <div className="mb-8">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">{t.chooseAvatar}</label>
                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                            {AVATARS.slice(0, 10).map((avatar, idx) => (
                                <img 
                                    key={`avatar-${idx}-${avatar}`} 
                                    src={avatar} 
                                    alt={`Avatar ${idx}`} 
                                    referrerPolicy="no-referrer"
                                    onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=User&background=random'; }}
                                    onClick={() => updateUserProfile({ avatar })}
                                    className={`w-10 h-10 rounded-full object-cover cursor-pointer transition-transform hover:scale-110 border-2 ${auth.user?.avatar === avatar ? 'border-indigo-500 shadow-md' : 'border-transparent'}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">{t.careerGoal}</label>
                            <input disabled={auth.user?.isGuest} value={auth.user?.careerGoal || ''} onChange={(e) => updateUserProfile({ careerGoal: e.target.value })} placeholder={t.placeholderCareerGoal} className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl text-gray-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed" />
                            {auth.user?.isGuest && <p className="text-[10px] text-gray-500 mt-1">{t.loginToSetGoal}</p>}
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">{t.prefLang}</label>
                            <select value={lang} onChange={(e) => setLang(e.target.value as Language)} className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl text-gray-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer">
                                <option value={Language.EN}>{t.langEn}</option>
                                <option value={Language.VI}>{t.langVi}</option>
                            </select>
                        </div>
                    </div>

                    {/* AI Configuration Section */}
                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5 space-y-4">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Icons.Cpu className="w-4 h-4 text-indigo-500" />
                            {t.aiConfigTitle}
                        </h4>
                        
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">{t.aiProvider}</label>
                            <select 
                                value={auth.user?.aiProvider || AIProvider.GEMINI} 
                                onChange={(e) => updateUserProfile({ aiProvider: e.target.value as AIProvider })} 
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl text-gray-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
                            >
                                <option value={AIProvider.GEMINI}>{t.providerGemini}</option>
                                <option value={AIProvider.CUSTOM}>{t.providerCustom}</option>
                                <option value={AIProvider.N8N}>{t.providerN8N}</option>
                            </select>
                        </div>

                        {/* CareerGuide AI Built-in Engine Indicator */}
                        {(auth.user?.aiProvider === AIProvider.GEMINI || !auth.user?.aiProvider) && (
                            <div className="p-3.5 bg-gradient-to-r from-indigo-50/80 via-purple-50/80 to-emerald-50/80 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-emerald-950/30 border border-indigo-200/60 dark:border-indigo-800/40 rounded-2xl flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                                    ⚡
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-900 dark:text-white">
                                        {lang === Language.VI ? "Động Cơ CareerGuide AI (Tự động tích hợp sẵn)" : "CareerGuide AI Engine (Built-in Active)"}
                                    </p>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                        {lang === Language.VI 
                                            ? "Hệ thống tự động kết nối và xử lý toàn bộ các yêu cầu qua máy chủ AI bảo mật." 
                                            : "The system automatically connects and handles all requests via secure built-in AI servers."}
                                    </p>
                                </div>
                            </div>
                        )}



                        {/* If Custom is selected */}
                        {auth.user?.aiProvider === AIProvider.CUSTOM && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">{t.endpointUrl}</label>
                                    <input 
                                        value={auth.user?.customEndpoint || ''} 
                                        onChange={(e) => updateUserProfile({ customEndpoint: e.target.value })} 
                                        placeholder="http://localhost:11434/v1/chat/completions" 
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl text-gray-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">{t.modelName}</label>
                                    <input 
                                        value={auth.user?.customModelName || ''} 
                                        onChange={(e) => updateUserProfile({ customModelName: e.target.value })} 
                                        placeholder="llama3" 
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl text-gray-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-500 col-span-2">{t.endpointNote}</p>
                            </div>
                        )}

                        {/* If n8n is selected */}
                        {auth.user?.aiProvider === AIProvider.N8N && (
                            <div className="space-y-2">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">{t.n8nWebhookUrl}</label>
                                    <input 
                                        value={auth.user?.customEndpoint || ''} 
                                        onChange={(e) => updateUserProfile({ customEndpoint: e.target.value })} 
                                        placeholder="https://primary-production.up.railway.app/webhook/..." 
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl text-gray-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-500">{t.n8nNote}</p>
                            </div>
                        )}
                        {/* Voice Engine & Custom Gemini Live WebSocket Server */}
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 space-y-2">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                {lang === Language.VI ? '🎙️ Cấu hình Máy Chủ Gemini Live (WebSocket URL)' : '🎙️ Gemini Live WebSocket Server URL'}
                            </label>
                            <input 
                                value={auth.user?.customWsUrl || ''} 
                                onChange={(e) => updateUserProfile({ customWsUrl: e.target.value })} 
                                placeholder="wss://your-backend.up.railway.app/ws (để trống nếu dùng mặc định)" 
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl text-gray-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-gray-400"
                            />
                            <p className="text-[10px] text-gray-500 leading-relaxed">
                                {lang === Language.VI 
                                    ? "• Khi chạy trên Vercel: Để trống sẽ tự động dùng Bộ phát âm thanh AI Serverless Neural Voice (tránh tiếng robot). Hoặc nhập WebSocket URL backend của bạn (Railway, Render, VPS) để kết nối trực tiếp Gemini Live 2 chiều." 
                                    : "• On Vercel: Leave blank to use Built-in Serverless Neural Voice TTS (eliminates robotic voice), or provide your backend WS URL (Railway/Render) for full Gemini Live speech-to-speech."}
                            </p>
                        </div>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex flex-col">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">{t.storageManagement}</h4>
                            <p className="text-[10px] text-gray-500">{t.manageChatData}</p>
                        </div>
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowClearHistoryConfirm(true)}
                            className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors w-full sm:w-auto"
                        >
                            {t.clearAllHistory}
                        </motion.button>
                    </div>

                    {/* Quick Button to Open Founders Showcase */}
                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/5">
                        <button
                            type="button"
                            onClick={() => {
                                setIsProfileModalOpen(false);
                                setIsFoundersModalOpen(true);
                            }}
                            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-500/30 hover:border-amber-500/60 text-amber-700 dark:text-amber-300 font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
                        >
                            <Icons.Award className="w-4 h-4 text-amber-500" />
                            <span>{lang === Language.VI ? '🏆 Xem Hồ Sơ Đội Ngũ Sáng Lập (The NextX 2026)' : '🏆 View The NextX Founders & Finalists Profile'}</span>
                        </button>
                    </div>

                    <AnimatePresence>
                        {showClearHistoryConfirm && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-500/20 rounded-2xl"
                            >
                                <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-3">{t.clearHistoryConfirm}</p>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => {
                                            clearChatHistory();
                                            setShowClearHistoryConfirm(false);
                                            setIsProfileModalOpen(false);
                                        }}
                                        className="flex-1 py-2 bg-red-600 text-white text-[10px] font-bold rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        {t.delete}
                                    </button>
                                    <button 
                                        onClick={() => setShowClearHistoryConfirm(false)}
                                        className="flex-1 py-2 bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 text-[10px] font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-white/20 transition-colors"
                                    >
                                        {t.cancel}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Modal */}
      <FeedbackModal 
          isOpen={isFeedbackOpen} 
          onClose={() => setIsFeedbackOpen(false)} 
          userId={firebaseAuth?.currentUser?.uid || auth.user?.email || 'guest'} 
          lang={lang} 
          onAddEarnedPoints={awardExperiencePoints} 
      />


    </div>
    );
  };

  const renderContent = () => {
    switch (mode) {
      case AppMode.AUTH: return renderAuth();
      case AppMode.DASHBOARD: return renderDashboard();
      case AppMode.LANDING: default: return renderLanding();
    }
  };

  return (
    <>
      {!hasAcceptedTerms && (
        <div 
          onClick={acceptTerms}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden cursor-default"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-fuchsia-500"></div>
            
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white pr-2">{t.termsTitle}</h2>
                <div className="flex items-center gap-2">
                  <button 
                      onClick={() => setLang(lang === Language.EN ? Language.VI : Language.EN)}
                      className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-white/10 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                  >
                      {lang === Language.EN ? 'Tiếng Việt' : 'English'}
                  </button>
                  <button
                    onClick={acceptTerms}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    title={lang === Language.VI ? 'Đóng' : 'Close'}
                  >
                    <Icons.X className="w-5 h-5" />
                  </button>
                </div>
            </div>

            <div className="space-y-3.5 text-gray-600 dark:text-gray-300 text-sm max-h-64 overflow-y-auto pr-2 leading-relaxed">
              <p><strong>{t.terms1}</strong> {t.terms1Desc}</p>
              <p><strong>{t.terms2}</strong> {t.terms2Desc}</p>
              <p><strong>{t.terms3}</strong> {t.terms3Desc}</p>
              <p><strong>{t.terms4}</strong> {t.terms4Desc}</p>
              <p><strong>{t.terms5}</strong> {t.terms5Desc}</p>
            </div>
            
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={acceptTerms}
                className="w-full sm:w-auto px-5 py-3 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                {lang === Language.VI ? 'Bỏ qua & Xem nhanh' : 'Skip & Preview'}
              </button>
              <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={acceptTerms} 
                  className="w-full flex-1 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-bold text-base transition-all shadow-lg text-center"
              >
                {t.termsAccept}
              </motion.button>
            </div>
          </div>
        </div>
      )}
      {/* Upgrade & Monetization Hub Modal Window */}
      {isUpgradeModalOpen && (
        <MonetizationRewardsHub
          isModal={true}
          onClose={() => setIsUpgradeModalOpen(false)}
          language={lang}
          user={auth.user}
          showToast={showToast}
          onNavigateToChat={() => {
            setIsUpgradeModalOpen(false);
            setTab(DashboardTab.CHAT);
          }}
          onUpdateUser={updateUserProfile}
        />
      )}

      {/* Prompt Builder Modal */}
      <PromptBuilderModal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        language={lang}
        user={auth.user}
        onSendPromptToChat={(promptText) => {
          setInputMsg(promptText);
          setTab(DashboardTab.CHAT);
        }}
        showToast={showToast}
      />

      {/* The NextX Founders & Finalists Showcase Modal */}
      {isFoundersModalOpen && (
        <div 
          onClick={() => setIsFoundersModalOpen(false)}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in cursor-pointer"
        >
          <motion.div 
            initial={{ scale: 0.94, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#0c0c12] border border-gray-200 dark:border-white/10 rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden cursor-default"
          >
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-200 dark:border-white/10 bg-gray-50/80 dark:bg-white/[0.03]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 text-lg font-black shrink-0">
                  🏆
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-white">
                    {lang === Language.VI ? 'Hồ Sơ Đội Ngũ Sáng Lập (The NextX 2026)' : 'NextX 2026 Founders & Finalists'}
                  </h3>
                  <p className="text-xs text-gray-500">CareerGuide AI • THPT Vinschool Ocean Park</p>
                </div>
              </div>
              <button 
                onClick={() => setIsFoundersModalOpen(false)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                title={lang === Language.VI ? 'Đóng' : 'Close'}
              >
                <Icons.X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-2 sm:p-6 flex-1">
              <FoundersSection 
                lang={lang} 
                isStandaloneTab={true}
                onExploreDemo={() => {
                  setIsFoundersModalOpen(false);
                  handleActivateDemo();
                }}
              />
            </div>
          </motion.div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (Optimized for Mobile Judge Experience) */}
      {mode === AppMode.DASHBOARD && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0a0a0a]/95 border-t border-gray-200 dark:border-white/10 flex items-center justify-around py-2 px-1 backdrop-blur-xl shadow-2xl">
          <button 
            onClick={() => setTab(DashboardTab.CHAT)} 
            className={`flex flex-col items-center gap-1 min-w-[56px] py-1 px-2 rounded-xl transition-all cursor-pointer ${tab === DashboardTab.CHAT ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/40' : 'text-gray-500 dark:text-gray-400'}`}
          >
            <Icons.MessageSquare className="w-5 h-5" />
            <span className="text-[10px]">{lang === Language.VI ? 'Trò chuyện' : 'Chat'}</span>
          </button>

          <button 
            onClick={() => setTab(DashboardTab.PROGRESS)} 
            className={`flex flex-col items-center gap-1 min-w-[56px] py-1 px-2 rounded-xl transition-all cursor-pointer ${tab === DashboardTab.PROGRESS || tab === DashboardTab.CAREER_LIFECYCLE ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/40' : 'text-gray-500 dark:text-gray-400'}`}
          >
            <Icons.Target className="w-5 h-5" />
            <span className="text-[10px]">{lang === Language.VI ? 'Tiến độ AI' : 'Progress'}</span>
          </button>

          <button 
            onClick={() => setTab(DashboardTab.CV_BUILDER)} 
            className={`flex flex-col items-center gap-1 min-w-[56px] py-1 px-2 rounded-xl transition-all cursor-pointer ${tab === DashboardTab.CV_BUILDER ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/40' : 'text-gray-500 dark:text-gray-400'}`}
          >
            <Icons.FileText className="w-5 h-5" />
            <span className="text-[10px]">{lang === Language.VI ? 'Tạo CV' : 'CV Builder'}</span>
          </button>

          <button 
            onClick={() => setTab(DashboardTab.MOCK_INTERVIEW)} 
            className={`flex flex-col items-center gap-1 min-w-[56px] py-1 px-2 rounded-xl transition-all cursor-pointer ${tab === DashboardTab.MOCK_INTERVIEW ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/40' : 'text-gray-500 dark:text-gray-400'}`}
          >
            <Icons.Cpu className="w-5 h-5" />
            <span className="text-[10px]">{lang === Language.VI ? 'Phỏng vấn' : 'Interview'}</span>
          </button>

          <button 
            onClick={() => setIsUpgradeModalOpen(true)} 
            className="flex flex-col items-center gap-1 min-w-[56px] py-1 px-2 rounded-xl text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/30 border border-amber-500/20 cursor-pointer"
          >
            <Icons.Zap className="w-5 h-5 fill-current text-amber-500" />
            <span className="text-[10px]">{lang === Language.VI ? 'Gói cước' : 'Upgrade'}</span>
          </button>
        </div>
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 20, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] pointer-events-none"
          >
            <div className={`px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-xl ${
              toast.type === 'success' 
                ? 'bg-emerald-500/90 border-emerald-400/50 text-white' 
                : toast.type === 'error'
                ? 'bg-rose-500/90 border-rose-400/50 text-white'
                : 'bg-indigo-500/90 border-indigo-400/50 text-white'
            }`}>
              {toast.type === 'success' && <Icons.CheckCircle2 className="w-5 h-5" />}
              {toast.type === 'error' && <Icons.AlertCircle className="w-5 h-5" />}
              {toast.type === 'info' && <Icons.Info className="w-5 h-5" />}
              <span className="font-bold tracking-tight">{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {renderContent()}
    </>
  );
}
