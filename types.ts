export enum Language {
  EN = 'en',
  VI = 'vi'
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark'
}

export enum AppMode {
  LANDING = 'LANDING',
  AUTH = 'AUTH',
  DASHBOARD = 'DASHBOARD'
}

export enum DashboardTab {
  CHAT = 'CHAT',
  VOICE = 'VOICE',
  QUIZ = 'QUIZ',
  PROGRESS = 'PROGRESS',
  CV_BUILDER = 'CV_BUILDER',
  PROMPT_BUILDER = 'PROMPT_BUILDER',
  CAREER_LIFECYCLE = 'CAREER_LIFECYCLE',
  MONETIZATION_PARTNERS = 'MONETIZATION_PARTNERS',
  PORTFOLIO = 'PORTFOLIO',
  SCHOLARSHIPS = 'SCHOLARSHIPS',
  SCORES = 'SCORES',
  COMPARE = 'COMPARE',
  TRENDING = 'TRENDING',
  MOCK_INTERVIEW = 'MOCK_INTERVIEW'
}

export enum AIProvider {
  GEMINI = 'GEMINI',
  CUSTOM = 'CUSTOM', // For Llama 3, Mistral, Ollama, etc.
  N8N = 'N8N' // n8n Workflow Webhook
}

export interface Clarification {
  question: string;
  options: string[];
  allowMultiple?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  file?: { data: string; mimeType: string; name: string }; // Base64 file data
  pastedTexts?: string[]; // Array of long pasted texts
  clarification?: Clarification;
}

export interface ChatSession {
  id: string;
  title: string;
  date: Date;
  messages: ChatMessage[];
  isStarred?: boolean;
}

export interface PortfolioItem {
  id: string;
  type: 'Certificate' | 'Grade/Score' | 'Personal Project';
  title: string;
  description: string;
  date: string;
  score?: string;
  link?: string;
}

export type SubscriptionTier = 
  | 'free' 
  | 'micro5' 
  | 'micro10' 
  | 'micro_interview' 
  | 'micro_transcript' 
  | 'premium_monthly' 
  | 'premium_yearly' 
  | 'max_monthly' 
  | 'max_yearly' 
  | 'monthly' 
  | 'annual' 
  | 'season' 
  | 'reskilling';

export interface UserSubscription {
  tier: SubscriptionTier;
  tierNameVi: string;
  tierNameEn: string;
  expiresAt?: string;
  dailyQueriesUsed: number;
  dailyQueriesLimit: number;
  extraQueriesCredits: number;
  mockInterviewCredits: number;
  cvAuditCredits: number;
  unlockedFeatures: {
    aiChat5PerDay: boolean;
    personalityQuiz: boolean;
    aiDeepDive: boolean;
    scholarshipEssayEditor: boolean;
    mentorMatch: boolean;
    reskillingSkillBridge: boolean;
    unlimitedChat: boolean;
    fullMockInterview: boolean;
    fullTranscriptAudit: boolean;
    // New structured permissions
    aiChat3First?: boolean;
    personalityQuizRiasec?: boolean;
    basicCareerSuggestions?: boolean;
    sampleRoadmap?: boolean;
    unlimitedChatFUP?: boolean;
    careerDnaFull?: boolean;
    detailedRoadmap?: boolean;
    cvReview?: boolean;
    googleCalendarSync?: boolean;
    cvJdAnalysis?: boolean;
    positionInterviewAI?: boolean;
    upskillReskilling?: boolean;
    careerPathSalaryInsight?: boolean;
    monthlyGoalTracking?: boolean;
  };
}

export interface UserProfile {
  name: string;
  email: string;
  careerGoal?: string;
  careerProfile?: string;
  isGuest?: boolean;
  avatar?: string;
  aiProvider?: AIProvider;
  customEndpoint?: string; // e.g., http://localhost:11434/v1/chat/completions OR n8n Webhook URL
  customModelName?: string; // e.g., llama3 (Not used for n8n)
  customGeminiApiKey?: string; // Custom Gemini API Key provided by user
  streak?: number;
  lastCheckIn?: string;
  provider?: 'google' | 'local' | 'email';
  portfolio?: PortfolioItem[];
  points?: number;
  level?: number;
  badges?: string[];
  hasCompletedOnboarding?: boolean;
  subscription?: UserSubscription;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
}

export interface Transcript {
  isUser: boolean;
  text: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  comments?: string[];
  deadline?: string; // YYYY-MM-DD format
  isSyncedCalendar?: boolean;
  isSyncedEmail?: boolean;
}

export interface PaymentOrder {
  id: string;
  orderCode: string; // e.g. CGAI-PREM-260821-X8Y2
  userId?: string;
  userEmail: string;
  userName?: string;
  packageTier: SubscriptionTier;
  packageName: string;
  amount: number;
  formattedAmount: string;
  currency?: string;
  billingCycle: 'monthly' | 'yearly' | 'one-time';
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  expiresAt?: string;
  completedAt?: string;
  qrUrl?: string;
  note?: string;
}
