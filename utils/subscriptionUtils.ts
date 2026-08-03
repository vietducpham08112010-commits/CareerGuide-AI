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
