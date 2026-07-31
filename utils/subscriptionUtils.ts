import { UserSubscription, SubscriptionTier } from '../types';
export type { SubscriptionTier };

export const DEFAULT_FREE_SUBSCRIPTION: UserSubscription = {
  tier: 'free',
  tierNameVi: 'Gói Miễn Phí (Free Tier)',
  tierNameEn: 'Free Tier',
  dailyQueriesUsed: 2, // 2/5 used today
  dailyQueriesLimit: 5,
  extraQueriesCredits: 0,
  mockInterviewCredits: 0,
  cvAuditCredits: 0,
  unlockedFeatures: {
    aiChat5PerDay: true,
    personalityQuiz: true,
    aiDeepDive: false,
    scholarshipEssayEditor: false,
    mentorMatch: false,
    reskillingSkillBridge: false,
    unlimitedChat: false,
    fullMockInterview: false,
    fullTranscriptAudit: false,
  }
};

export function getSubscriptionDetails(sub?: UserSubscription): UserSubscription {
  if (!sub) return DEFAULT_FREE_SUBSCRIPTION;
  return sub;
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

  if (tier === 'monthly') {
    return {
      tier: 'monthly',
      tierNameVi: 'Gói Tháng Premium',
      tierNameEn: 'Monthly Premium Tier',
      expiresAt: customExpiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      dailyQueriesUsed: current.dailyQueriesUsed,
      dailyQueriesLimit: 9999,
      extraQueriesCredits: current.extraQueriesCredits,
      mockInterviewCredits: Math.max(5, current.mockInterviewCredits),
      cvAuditCredits: Math.max(5, current.cvAuditCredits),
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
      }
    };
  }

  if (tier === 'season') {
    return {
      tier: 'season',
      tierNameVi: 'Gói Mùa Thi Premium',
      tierNameEn: 'Exam Season Pass',
      expiresAt: customExpiresAt || new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
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
      }
    };
  }

  if (tier === 'annual') {
    return {
      tier: 'annual',
      tierNameVi: 'Gói Năm Saver',
      tierNameEn: 'Annual Saver Pass',
      expiresAt: customExpiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      dailyQueriesUsed: current.dailyQueriesUsed,
      dailyQueriesLimit: 9999,
      extraQueriesCredits: current.extraQueriesCredits,
      mockInterviewCredits: Math.max(20, current.mockInterviewCredits),
      cvAuditCredits: Math.max(20, current.cvAuditCredits),
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
      }
    };
  }

  if (tier === 'reskilling') {
    return {
      tier: 'reskilling',
      tierNameVi: 'Gói Chuyển Ngành Lao Động',
      tierNameEn: 'Working Professional Reskilling Pass',
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
      }
    };
  }

  if (tier === 'trial24h') {
    return {
      tier: 'trial24h',
      tierNameVi: 'Gói Trial 24H Full Pass',
      tierNameEn: '24-Hour Premium Trial Pass',
      expiresAt: customExpiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      dailyQueriesUsed: current.dailyQueriesUsed,
      dailyQueriesLimit: 9999,
      extraQueriesCredits: current.extraQueriesCredits,
      mockInterviewCredits: Math.max(3, current.mockInterviewCredits),
      cvAuditCredits: Math.max(3, current.cvAuditCredits),
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
      }
    };
  }

  return current;
}
