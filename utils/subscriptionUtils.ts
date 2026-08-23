import { UserSubscription, SubscriptionTier } from '../types';
export type { SubscriptionTier };

export const DEFAULT_FREE_SUBSCRIPTION: UserSubscription = {
  tier: 'free',
  tierNameVi: 'CareerGuide Free',
  tierNameEn: 'CareerGuide Free',
  dailyQueriesUsed: 0,
  dailyQueriesLimit: 3,
  extraQueriesCredits: 0,
  mockInterviewCredits: 0,
  cvAuditCredits: 1,
  unlockedFeatures: {
    aiChat5PerDay: false,
    personalityQuiz: true,
    aiDeepDive: false,
    scholarshipEssayEditor: false,
    mentorMatch: false,
    reskillingSkillBridge: false,
    unlimitedChat: false,
    fullMockInterview: false,
    fullTranscriptAudit: false,
    aiChat3First: true,
    personalityQuizRiasec: true,
    basicCareerSuggestions: true,
    sampleRoadmap: true,
    unlimitedChatFUP: false,
    careerDnaFull: false,
    detailedRoadmap: false,
    cvReview: false,
    googleCalendarSync: false,
    cvJdAnalysis: false,
    positionInterviewAI: false,
    upskillReskilling: false,
    careerPathSalaryInsight: false,
    monthlyGoalTracking: false,
  }
};

export function getSubscriptionDetails(sub?: UserSubscription): UserSubscription {
  if (!sub) return DEFAULT_FREE_SUBSCRIPTION;
  return sub;
}

export function isFeatureUnlocked(
  userOrSub: { subscription?: UserSubscription } | UserSubscription | undefined | null,
  feature: keyof NonNullable<UserSubscription['unlockedFeatures']>
): boolean {
  if (!userOrSub) return Boolean(DEFAULT_FREE_SUBSCRIPTION.unlockedFeatures?.[feature]);
  const sub: UserSubscription = 'subscription' in userOrSub 
    ? getSubscriptionDetails(userOrSub.subscription) 
    : getSubscriptionDetails(userOrSub as UserSubscription);
  return Boolean(sub.unlockedFeatures?.[feature]);
}


export function createUpdatedSubscription(
  current: UserSubscription,
  tier: SubscriptionTier,
  customExpiresAt?: string
): UserSubscription {
  if (tier === 'free') {
    return DEFAULT_FREE_SUBSCRIPTION;
  }

  if (tier === 'micro5') {
    return {
      ...current,
      extraQueriesCredits: current.extraQueriesCredits + 5
    };
  }

  if (tier === 'micro10') {
    return {
      ...current,
      extraQueriesCredits: current.extraQueriesCredits + 10
    };
  }

  if (tier === 'micro_interview') {
    return {
      ...current,
      mockInterviewCredits: current.mockInterviewCredits + 1
    };
  }

  if (tier === 'micro_transcript') {
    return {
      ...current,
      cvAuditCredits: current.cvAuditCredits + 1
    };
  }

  if (tier === 'premium_monthly' || tier === 'monthly') {
    return {
      tier: 'premium_monthly',
      tierNameVi: 'CareerGuide Premium (Tháng)',
      tierNameEn: 'CareerGuide Premium (Monthly)',
      expiresAt: customExpiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      dailyQueriesUsed: current.dailyQueriesUsed,
      dailyQueriesLimit: 9999,
      extraQueriesCredits: current.extraQueriesCredits,
      mockInterviewCredits: Math.max(10, current.mockInterviewCredits),
      cvAuditCredits: Math.max(10, current.cvAuditCredits),
      unlockedFeatures: {
        aiChat5PerDay: true,
        personalityQuiz: true,
        aiDeepDive: true,
        scholarshipEssayEditor: true,
        mentorMatch: true,
        reskillingSkillBridge: true,
        unlimitedChat: true,
        fullMockInterview: true,
        fullTranscriptAudit: true,
        aiChat3First: true,
        personalityQuizRiasec: true,
        basicCareerSuggestions: true,
        sampleRoadmap: true,
        unlimitedChatFUP: true,
        careerDnaFull: true,
        detailedRoadmap: true,
        cvReview: true,
        googleCalendarSync: true,
        cvJdAnalysis: false,
        positionInterviewAI: false,
        upskillReskilling: false,
        careerPathSalaryInsight: false,
        monthlyGoalTracking: false,
      }
    };
  }

  if (tier === 'premium_yearly' || tier === 'annual') {
    return {
      tier: 'premium_yearly',
      tierNameVi: 'CareerGuide Premium (Năm)',
      tierNameEn: 'CareerGuide Premium (Yearly)',
      expiresAt: customExpiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      dailyQueriesUsed: current.dailyQueriesUsed,
      dailyQueriesLimit: 9999,
      extraQueriesCredits: current.extraQueriesCredits,
      mockInterviewCredits: Math.max(50, current.mockInterviewCredits),
      cvAuditCredits: Math.max(50, current.cvAuditCredits),
      unlockedFeatures: {
        aiChat5PerDay: true,
        personalityQuiz: true,
        aiDeepDive: true,
        scholarshipEssayEditor: true,
        mentorMatch: true,
        reskillingSkillBridge: true,
        unlimitedChat: true,
        fullMockInterview: true,
        fullTranscriptAudit: true,
        aiChat3First: true,
        personalityQuizRiasec: true,
        basicCareerSuggestions: true,
        sampleRoadmap: true,
        unlimitedChatFUP: true,
        careerDnaFull: true,
        detailedRoadmap: true,
        cvReview: true,
        googleCalendarSync: true,
        cvJdAnalysis: false,
        positionInterviewAI: false,
        upskillReskilling: false,
        careerPathSalaryInsight: false,
        monthlyGoalTracking: false,
      }
    };
  }

  if (tier === 'max_monthly') {
    return {
      tier: 'max_monthly',
      tierNameVi: 'CareerGuide Max (Tháng)',
      tierNameEn: 'CareerGuide Max (Monthly)',
      expiresAt: customExpiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      dailyQueriesUsed: current.dailyQueriesUsed,
      dailyQueriesLimit: 9999,
      extraQueriesCredits: current.extraQueriesCredits,
      mockInterviewCredits: 9999,
      cvAuditCredits: 9999,
      unlockedFeatures: {
        aiChat5PerDay: true,
        personalityQuiz: true,
        aiDeepDive: true,
        scholarshipEssayEditor: true,
        mentorMatch: true,
        reskillingSkillBridge: true,
        unlimitedChat: true,
        fullMockInterview: true,
        fullTranscriptAudit: true,
        aiChat3First: true,
        personalityQuizRiasec: true,
        basicCareerSuggestions: true,
        sampleRoadmap: true,
        unlimitedChatFUP: true,
        careerDnaFull: true,
        detailedRoadmap: true,
        cvReview: true,
        googleCalendarSync: true,
        cvJdAnalysis: true,
        positionInterviewAI: true,
        upskillReskilling: true,
        careerPathSalaryInsight: true,
        monthlyGoalTracking: true,
      }
    };
  }

  if (tier === 'max_yearly') {
    return {
      tier: 'max_yearly',
      tierNameVi: 'CareerGuide Max (Năm)',
      tierNameEn: 'CareerGuide Max (Yearly)',
      expiresAt: customExpiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      dailyQueriesUsed: current.dailyQueriesUsed,
      dailyQueriesLimit: 9999,
      extraQueriesCredits: current.extraQueriesCredits,
      mockInterviewCredits: 9999,
      cvAuditCredits: 9999,
      unlockedFeatures: {
        aiChat5PerDay: true,
        personalityQuiz: true,
        aiDeepDive: true,
        scholarshipEssayEditor: true,
        mentorMatch: true,
        reskillingSkillBridge: true,
        unlimitedChat: true,
        fullMockInterview: true,
        fullTranscriptAudit: true,
        aiChat3First: true,
        personalityQuizRiasec: true,
        basicCareerSuggestions: true,
        sampleRoadmap: true,
        unlimitedChatFUP: true,
        careerDnaFull: true,
        detailedRoadmap: true,
        cvReview: true,
        googleCalendarSync: true,
        cvJdAnalysis: true,
        positionInterviewAI: true,
        upskillReskilling: true,
        careerPathSalaryInsight: true,
        monthlyGoalTracking: true,
      }
    };
  }

  return current;
}

export function isTheNextXAccount(userOrEmail?: string | { email?: string; name?: string } | null): boolean {
  if (!userOrEmail) return false;
  const str = typeof userOrEmail === 'string' ? userOrEmail : `${userOrEmail.email || ''} ${userOrEmail.name || ''}`;
  const lower = str.toLowerCase();
  return (
    lower.includes('thenextx') || 
    lower.includes('nextx') || 
    lower.includes('vietducpham08112010@gmail.com') ||
    lower.includes('giamkhao') || 
    lower.includes('judge') ||
    lower.includes('ban giam khao') ||
    lower.includes('cuoc thi')
  );
}

export function createTheNextXMaxSubscription(): UserSubscription {
  const oneYearLater = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  return {
    tier: 'max_yearly',
    tierNameVi: 'CareerGuide MAX (The NEXTx VIP)',
    tierNameEn: 'CareerGuide MAX (The NEXTx VIP)',
    expiresAt: oneYearLater,
    dailyQueriesUsed: 0,
    dailyQueriesLimit: 9999,
    extraQueriesCredits: 9999,
    mockInterviewCredits: 9999,
    cvAuditCredits: 9999,
    unlockedFeatures: {
      aiChat5PerDay: true,
      personalityQuiz: true,
      aiDeepDive: true,
      scholarshipEssayEditor: true,
      mentorMatch: true,
      reskillingSkillBridge: true,
      unlimitedChat: true,
      fullMockInterview: true,
      fullTranscriptAudit: true,
      aiChat3First: true,
      personalityQuizRiasec: true,
      basicCareerSuggestions: true,
      sampleRoadmap: true,
      unlimitedChatFUP: true,
      careerDnaFull: true,
      detailedRoadmap: true,
      cvReview: true,
      googleCalendarSync: true,
      cvJdAnalysis: true,
      positionInterviewAI: true,
      upskillReskilling: true,
      careerPathSalaryInsight: true,
      monthlyGoalTracking: true,
    }
  };
}

export interface ExpiryInfo {
  hasExpiry: boolean;
  isExpired: boolean;
  daysLeft: number;
  hoursLeft: number;
  formattedExpiry: string;
  badgeTextVi: string;
  badgeTextEn: string;
}

export function getSubscriptionExpiryInfo(sub?: UserSubscription): ExpiryInfo {
  if (!sub || !sub.expiresAt || sub.tier === 'free') {
    return {
      hasExpiry: false,
      isExpired: false,
      daysLeft: 0,
      hoursLeft: 0,
      formattedExpiry: '',
      badgeTextVi: 'Gói Miễn Phí (Vĩnh viễn)',
      badgeTextEn: 'Free Tier (Permanent)'
    };
  }

  const now = new Date();
  const expireDate = new Date(sub.expiresAt);
  const diffMs = expireDate.getTime() - now.getTime();
  const isExpired = diffMs <= 0;

  const daysLeft = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  const hoursLeft = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));

  const formattedExpiry = expireDate.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  let badgeTextVi = '';
  let badgeTextEn = '';

  if (isExpired) {
    badgeTextVi = `Đã hết hạn (${formattedExpiry})`;
    badgeTextEn = `Expired (${formattedExpiry})`;
  } else if (daysLeft > 0) {
    badgeTextVi = `Còn ${daysLeft} ngày (Hết hạn: ${formattedExpiry})`;
    badgeTextEn = `${daysLeft} days remaining (Expires: ${formattedExpiry})`;
  } else {
    badgeTextVi = `Còn ${hoursLeft} giờ (Hết hạn hôm nay)`;
    badgeTextEn = `${hoursLeft} hours left (Expires today)`;
  }

  return {
    hasExpiry: true,
    isExpired,
    daysLeft,
    hoursLeft,
    formattedExpiry,
    badgeTextVi,
    badgeTextEn
  };
}

// Payment Order Storage Helpers
const ORDERS_STORAGE_KEY = 'careerguide_payment_orders';

export function getSavedOrders(): any[] {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load orders", e);
    return [];
  }
}

export function saveNewOrder(order: any): any[] {
  try {
    const current = getSavedOrders();
    const updated = [order, ...current.filter(o => o.id !== order.id)];
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Failed to save order", e);
    return [];
  }
}

export function updateSavedOrderStatus(orderId: string, status: 'pending' | 'completed' | 'cancelled'): any[] {
  try {
    const current = getSavedOrders();
    const updated = current.map(o => {
      if (o.id === orderId || o.orderCode === orderId) {
        return {
          ...o,
          status,
          completedAt: status === 'completed' ? new Date().toISOString() : o.completedAt
        };
      }
      return o;
    });
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Failed to update order status", e);
    return [];
  }
}

export function generateOrderCode(tierPrefix: string = 'PREM'): string {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, ''); // e.g. 260821
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CGAI-${tierPrefix}-${dateStr}-${rand}`;
}

