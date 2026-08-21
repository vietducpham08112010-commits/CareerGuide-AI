import { UserProfile, Milestone, PortfolioItem, ChatSession } from '../../types';

export const THE_NEXTX_USER_PROFILE: UserProfile = {
  name: 'THE NEXTX - Đội Business AI Arena 2026',
  email: 'thenextx.aiarena@techcombank.priv',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  isGuest: false,
  points: 9850,
  level: 10,
  badges: ['🌟 The NextX Innovator', '🏆 AI Business Champion', '🚀 Elite Founder'],
  subscription: {
    tier: 'max_yearly',
    tierNameVi: 'Gói MAX Doanh Nghiệp (The NextX VIP)',
    tierNameEn: 'MAX Enterprise Tier (The NextX VIP)',
    expiresAt: '2030-12-31T23:59:59.000Z',
    dailyQueriesUsed: 12,
    dailyQueriesLimit: 9999,
    extraQueriesCredits: 500,
    mockInterviewCredits: 99,
    cvAuditCredits: 50,
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
      careerDnaFull: true,
      detailedRoadmap: true,
      cvReview: true,
      googleCalendarSync: true,
      cvJdAnalysis: true,
      positionInterviewAI: true,
      upskillReskilling: true,
      careerPathSalaryInsight: true,
      monthlyGoalTracking: true
    }
  },
  portfolio: [
    {
      id: 'port_1',
      type: 'Personal Project',
      title: 'The NextX AI Business Copilot',
      description: 'Nền tảng AI hỗ trợ lập chiến lược kinh doanh tự động và tối ưu hóa dòng tiền cho doanh nghiệp vừa và nhỏ.',
      date: '2026-08-20',
      score: 'Giải Nhất Đấu Trường AI 2026',
      link: 'https://github.com/thenextx-ai/business-copilot'
    },
    {
      id: 'port_2',
      type: 'Certificate',
      title: 'Techcombank Private Young Leader & AI Master',
      description: 'Chứng nhận hoàn thành 18 chuyên đề lãnh đạo số và ứng dụng AI thực chiến.',
      date: '2026-07-15',
      score: '98/100 Điểm Xuất Sắc',
      link: 'https://techcombank.com.vn/thenextx/verify/nx-2026'
    },
    {
      id: 'port_3',
      type: 'Grade/Score',
      title: 'Global Young Innovator Hackathon 2026',
      description: 'Xây dựng mô hình dự báo thị trường tài chính dựa trên Deep Learning.',
      date: '2026-06-10',
      score: 'Huy Chương Vàng'
    }
  ]
};

export const THE_NEXTX_MILESTONES: Milestone[] = [
  {
    id: 'mile_1',
    title: 'Hoàn thiện Mô hình Kinh doanh Đấu trường AI 2026',
    description: 'Xây dựng pitch deck và bảo vệ đề án trước hội đồng giám khảo Techcombank & McKinsey.',
    deadline: '2026-08-29',
    status: 'done',
    comments: [
      'Mentor Techcombank: Ý tưởng ứng dụng AI vào quản trị tài chính doanh nghiệp rất sắc bén!'
    ]
  },
  {
    id: 'mile_2',
    title: 'Phát triển MVP Trợ lý Doanh nghiệp Tự động',
    description: 'Tích hợp mô hình Gemini AI qua Interactions API để tự động tổng hợp báo cáo tài chính.',
    deadline: '2026-08-25',
    status: 'done',
    comments: [
      'Tech Lead The NextX: Tốc độ phản hồi dưới 1 giây, giao diện cực kỳ chuyên nghiệp.'
    ]
  },
  {
    id: 'mile_3',
    title: 'Chinh phục Vòng Chung kết The NextX Arena',
    description: 'Thuyết trình trực tiếp bằng tiếng Anh và phản biện chiến lược kinh doanh dài hạn.',
    deadline: '2026-08-29',
    status: 'in-progress'
  }
];

export const THE_NEXTX_CHAT_SESSIONS: ChatSession[] = [
  {
    id: 'session_nextx_1',
    title: 'Chiến lược bảo vệ đề án Đấu trường AI 2026',
    date: new Date('2026-08-20T10:00:00Z'),
    isStarred: true,
    messages: [
      {
        id: 'm1',
        role: 'user',
        text: 'Làm thế nào để thuyết trình mô hình AI Business Copilot trước hội đồng đầu tư Techcombank trong 5 phút một cách ấn tượng nhất?',
        timestamp: new Date('2026-08-20T10:00:05Z')
      },
      {
        id: 'm2',
        role: 'model',
        text: 'Chào bạn đến từ **The NextX**. Để gây ấn tượng mạnh trong 5 phút trước hội đồng Techcombank và chuyên gia McKinsey, bạn nên áp dụng cấu trúc **"Hook - Problem - Solution - Traction - Vision"**:\n\n1. **Hook (30s):** Nêu thực trạng mất 40 giờ/tuần của doanh nghiệp SMEs để làm báo cáo tài chính thủ công.\n2. **Solution (90s):** Trình diễn trực tiếp The NextX AI Copilot tự động hóa 95% quy trình.\n3. **Traction & Validation (60s):** Chia sẻ số liệu thử nghiệm thực tế với độ chính xác tuyệt đối.\n4. **Vision (60s):** Định hướng mở rộng thành hệ sinh thái tài chính số toàn diện cho thế hệ doanh nghiệp mới.',
        timestamp: new Date('2026-08-20T10:00:10Z')
      }
    ]
  }
];
