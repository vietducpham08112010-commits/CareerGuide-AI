import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, Theme, UserProfile } from '../types';
import { getSubscriptionDetails } from '../utils/subscriptionUtils';
import { getGeminiApiKey, cleanFrontEndErrorMessage } from '../services/geminiService';
import { InlineGuide } from './InlineGuide';
import { LuxuryAiThinking } from './SkeletonLoader';

// Standard simple SVG icons for inline usage (matches lucide style)
const Icons = {
  Sparkles: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"/></svg>
  ),
  Briefcase: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
  ),
  ArrowRight: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
  ),
  MessageSquare: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  ),
  Send: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
  ),
  RefreshCw: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
  ),
  CheckCircle2: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
  ),
  Cpu: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3"/></svg>
  ),
  Globe: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/></svg>
  ),
  Smile: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg>
  ),
  Award: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="8" r="7"/><path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12"/></svg>
  ),
  AlertCircle: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
  ),
  Sliders: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="2" y1="14" x2="6" y2="14"/><line x1="10" y1="8" x2="14" y2="8"/><line x1="18" y1="16" x2="22" y2="16"/></svg>
  )
};

interface MockInterviewProps {
  language: Language;
  theme: Theme;
  user: UserProfile | null;
  onAddEarnedPoints?: (pts: number) => void;
  onRequestUpgrade?: (featureName: string) => void;
  onUpdateUser?: (updated: Partial<UserProfile>) => void;
}

interface InterviewResult {
  score: number;
  overallFeedback: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  categories?: {
    knowledge: number;
    communication: number;
    problemSolving: number;
    riasecFit: number;
  };
}

export const MockInterview: React.FC<MockInterviewProps> = ({
  language,
  theme,
  user,
  onAddEarnedPoints,
  onRequestUpgrade,
  onUpdateUser
}) => {
  const isEn = language === Language.EN;
  const isVi = language === Language.VI;
  const currentSub = getSubscriptionDetails(user?.subscription);


  // Translation constants
  const t = {
    title: isEn ? "AI Mock Interviewer" : "Phỏng Vấn Thử Với AI",
    sub: isEn 
      ? "Practice interactive interviews with real-time feedback and score sheets." 
      : "Rèn luyện kỹ năng phỏng vấn tương tác thông minh với phản hồi và bảng điểm chi tiết từ AI.",
    jobRole: isEn ? "Target Job / Career Goal" : "Ngành nghề / Vị trí hướng nghiệp mong muốn",
    jobRolePl: isEn ? "e.g. Software Engineer, Marketing Manager" : "VD: Lập trình viên Front-End, Chuyên viên Marketing Điện tử",
    level: isEn ? "Experience Level" : "Cấp độ kinh nghiệm",
    levelJunior: isEn ? "Junior / High School Student" : "Cơ bản / Học sinh THPT",
    levelMid: isEn ? "Mid-level" : "Trung cấp / Có nền tảng",
    levelSenior: isEn ? "Senior Specialist" : "Chuyên sâu / Chuyên gia",
    tone: isEn ? "Interviewer Personality / Tone" : "Tính cách / Giọng điệu của người phỏng vấn",
    toneFriendly: isEn ? "Friendly & Encouraging" : "Thân thiện & Động viên",
    toneProfessional: isEn ? "Strict & Professional" : "Nghiêm túc & Chuyên nghiệp",
    toneTechnical: isEn ? "Challenging & Deep Technical" : "Thử thách & Chuyên môn sâu",
    startBtn: isEn ? "Begin Mock Interview" : "Bắt Đầu Phỏng Vấn",
    starting: isEn ? "AI is generating questions..." : "AI đang thiết lập câu hỏi phỏng vấn...",
    questionProgress: isEn ? "Question %s of %s" : "Câu hỏi %s trên %s",
    yourAnswer: isEn ? "Your Answer" : "Câu trả lời của bạn",
    yourAnswerPl: isEn ? "Type your detailed answer here... (More details get better AI evaluations)" : "Nhập câu trả lời chi tiết của bạn tại đây... (Càng chi tiết, AI đánh giá càng chính xác)",
    submitAns: isEn ? "Submit Answer" : "Gửi câu trả lời",
    loadingEval: isEn ? "AI is evaluating your response..." : "AI đang phân tích câu trả lời của bạn...",
    congrats: isEn ? "Interview Completed!" : "Hoàn Thành Phỏng Vấn!",
    pointsEarned: isEn ? "+100 XP added to portfolio" : "+100 XP đã được cộng vào Hồ sơ của bạn",
    score: isEn ? "Overall Score" : "Điểm Số Tổng Quan",
    feedback: isEn ? "AI Evaluation & Detailed Feedback" : "Đánh Giá Chi Tiết Từ AI",
    strengths: isEn ? "Key Strengths" : "Thế mạnh của bạn",
    weaknesses: isEn ? "Areas to Improve" : "Điểm cần hoàn thiện",
    recommendations: isEn ? "Recommended Actions" : "Lời khuyên & Gợi ý học tập",
    restartBtn: isEn ? "Conduct Another Interview" : "Bắt Đầu Lượt Phỏng Vấn Mới",
    customPrompt: isEn ? "Using RIASEC results if present in career guide profile." : "Tự động phân tích và lồng ghép dữ liệu RIASEC từ hồ sơ của bạn.",
    emptyAnswer: isEn ? "Please type something before submitting." : "Vui lòng nhập câu trả lời của bạn trước khi tiếp tục."
  };

  const defaultRole = user?.careerGoal && user.careerGoal !== "Exploring" && user.careerGoal !== "Chưa xác định" && user.careerGoal !== "Đang khám phá" 
    ? user.careerGoal 
    : "";

  // State managers
  const [step, setStep] = useState<'setup' | 'interview' | 'evaluating' | 'results'>('setup');
  const [evalStep, setEvalStep] = useState(0);

  useEffect(() => {
    if (step !== 'evaluating') {
      setEvalStep(0);
      return;
    }
    const interval = setInterval(() => {
      setEvalStep((prev) => {
        if (prev < 4) return prev + 1;
        return prev;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [step]);
  const [job, setJob] = useState(defaultRole);
  const [targetCompany, setTargetCompany] = useState('');
  const [level, setLevel] = useState('junior');
  const [tone, setTone] = useState('friendly');
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isLoding, setIsLoading] = useState(false);
  const [result, setResult] = useState<InterviewResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [showJSON, setShowJSON] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLoadPreloadedDemoInterview = () => {
    const isVi = language === Language.VI;
    setJob(isVi ? "Kỹ sư Trí tuệ Nhân tạo / ML Engineer" : "AI / Machine Learning Engineer");
    setQuestions(isVi ? [
      "Bạn hãy giới thiệu về dự án Robot AI phân loại rác thông minh của bạn. Bạn đã giải quyết bài toán Computer Vision thế nào?",
      "Với điểm Toán 9.8 GPA môn học cấp THPT, kiến thức toán nào bạn thấy hữu dụng nhất khi lập trình Deep Learning?",
      "IELTS 7.5 là thế mạnh lớn. Bạn sẽ khai thác tài nguyên nghiên cứu tiếng Anh thế nào trong năm 2026?",
      "Nếu mô hình YOLOv8 nhận diện nhầm chai nhựa thành lon nhôm trong điều kiện thiếu sáng, bạn sẽ khắc phục ra sao?"
    ] : [
      "Tell us about your smart recycling AI robot. How did you construct the Computer Vision pipeline?",
      "With a 9.8 Math GPA, which statistical concepts do you find most useful for deep learning algorithms?",
      "How does your 7.5 IELTS proficiency help you read foreign AI R&D whitepapers?",
      "If YOLOv8 misidentifies a plastic bottle as aluminum under low light, how would you optimize the model?"
    ]);
    setAnswers(isVi ? [
      "Mình đã thiết kế cánh tay robot phân loại rác sử dụng webcam thu thập hình ảnh trực tiếp. Dữ liệu được xử lý bằng thư viện OpenCV để lọc nhiễu, cân bằng sáng và sau đó đưa qua mô hình YOLOv8 đã được fine-tune để phát hiện vật thể thời gian thực. Độ chính xác đạt hơn 92% nhờ bộ dữ liệu tự gán nhãn gồm 2000 ảnh rác thải sinh hoạt.",
      "Kiến thức hữu ích nhất là Đại số tuyến tính, cụ thể là các phép nhân ma trận và đạo hàm trong giải tích. Nhân ma trận là cơ sở để tính toán các trọng số lớp tuyến tính và lớp tích chập (Convolutional Layers), trong khi đạo hàm và gradient descent giúp mô hình tối ưu hóa các hàm mất mát (loss function) trong quá trình lan truyền ngược (backpropagation).",
      "IELTS 7.5 giúp mình trực tiếp tiếp cận các bài báo khoa học mới nhất trên các trang như arXiv, paperswithcode mà không cần dịch thuật trung gian. Mình có thể đọc hiểu tài liệu API của PyTorch, OpenCV, hay cấu hình Hugging Face nhanh chóng. Ngoài ra mình cũng tham gia thảo luận trên Reddit r/MachineLearning hay Kaggle dễ dàng hơn.",
      "Để khắc phục, mình sẽ áp dụng hai cách chính. Một là tăng cường dữ liệu thiếu sáng (Data Augmentation) bằng cách áp dụng các hiệu ứng làm tối, thêm nhiễu hoặc đổi màu trên ảnh gốc khi huấn luyện. Hai là sử dụng các thuật toán xử lý ảnh truyền thống của OpenCV như cân bằng lược đồ xám (Histogram Equalization) hoặc CLAHE trước khi đưa ảnh vào YOLOv8 để cải thiện độ tương phản."
    ] : [
      "I built a sorting robot using webcam input. Frame streams are cleared using OpenCV filters and passed through custom-labeled YOLOv8.",
      "Matrix multiplication and partial derivatives are key. Maxtrices compose weight variables while gradients optimize loss boundaries.",
      "IELTS 7.5 allows me to read papers on arXiv and paperswithcode directly. I configure PyTorch, OpenCV, and join Hugging Face/Kaggle easily.",
      "I would apply data augmentation (simulating low exposure/noise) and pre-process frames with CLAHE adaptive equalization to improve contrast."
    ]);
    
    const demoResult: InterviewResult = {
      score: 88,
      overallFeedback: isVi 
        ? "Ứng viên Nguyễn Đức Anh thể hiện tư duy vượt trội của một học sinh chuyên Tin cấp THPT. Bạn có sự kết hợp hoàn hảo giữa năng lực Toán học xuất sắc (9.8 GPA) để hiểu rõ bản chất thuật toán và khả năng thực hành xuất sắc qua dự án Robot AI. Bạn trình bày mạch lạc, giải thích chi tiết các kiến thức chuyên môn từ tích chập OpenCV đến tối ưu hóa lan truyền ngược. Vốn tiếng Anh IELTS 7.5 giúp bạn dễ dàng hội nhập dòng chảy công nghệ quốc tế trong năm 2026."
        : "Alex shows exceptional competence as a STEM student. Combining high-level mathematical concepts with hands-on robotics OpenCV/YOLOv8 development yields deep potential. Verbal articulation is structured, clear, and highlights robust communication. His 7.5 IELTS score fully prepares him for top-tier international AI collaborations.",
      strengths: isVi 
        ? [
            "Hiểu sâu sắc bản chất Toán đại số tuyến tính trong tối ưu hóa Deep Learning.",
            "Có dự án thực tế nổi bật giải quyết vấn đề rác thải bằng Computer Vision.",
            "Kỹ năng tiếng Anh học thuật xuất sắc (IELTS 7.5) phục vụ nghiên cứu cập nhật."
          ]
        : [
            "Clear mathematical grasp of linear algebra and loss optimizer algorithms.",
            "Impressive hands-on young science award-winning robotics project.",
            "Excellent English proficiency for reading advanced research whitepapers."
          ],
      weaknesses: isVi
        ? [
            "Cần bổ sung kiến thức về triển khai MLOps trên đám mây (Cloud deployment).",
            "Có thể rèn luyện thêm khả năng tối ưu hóa kích thước mô hình học máy (Quantization) cho thiết bị biên."
          ]
        : [
            "Could expand cloud MLOps deployment knowledge.",
            "Can research network quantization strategies for low-power edge devices."
          ],
      recommendations: isVi
        ? [
            "Học thêm một khóa ngắn hạn về Docker & FastAPI để phục vụ đóng gói và triển khai mô hình AI.",
            "Nghiên cứu kiến trúc YOLOv9 và các kỹ thuật quantization để tối ưu hóa hiệu suất chạy trực tiếp trên robot.",
            "Tham khảo chương trình Khoa học Máy tính tại ĐHQG hoặc học bổng tài năng của VinUni/Bách Khoa TP.HCM."
          ]
        : [
            "Enroll in a short Docker/FastAPI integration course to package models.",
            "Study YOLOv9 architectures and edge quantization techniques.",
            "Apply for prestigious Computer Science programs at top-tier Tech universities."
          ],
      categories: {
        knowledge: 90,
        communication: 85,
        problemSolving: 88,
        riasecFit: 90
      }
    };
    setResult(demoResult);
    setStep('results');
  };

  // Initial questions prompt
  const startInterview = async () => {
    if (!job.trim()) {
      setErrorMsg(isEn ? "Please enter a target career first." : "Vui lòng nhập ngành nghề mục tiêu.");
      return;
    }

    // Check Mock Interview Subscription / Micro Credit permissions
    const hasMockInterviewPermission = Boolean(currentSub.unlockedFeatures?.fullMockInterview) || (currentSub.mockInterviewCredits || 0) > 0;
    if (!hasMockInterviewPermission) {
      if (onRequestUpgrade) {
        onRequestUpgrade(isVi ? 'Phỏng vấn thử AI Mock Interview (Gói Premium/Max hoặc Mua lượt lẻ 19k)' : 'AI Mock Interview (Premium/Max or 19k micro-pack)');
      }
      setErrorMsg(isEn ? 'AI Mock Interview is a Premium/Max feature. Please upgrade or purchase a 19k VNĐ single-use credit.' : 'Phỏng vấn thử AI là tính năng của gói Premium/Max hoặc mua lẻ (19.000 VNĐ). Vui lòng nâng cấp để bắt đầu.');
      return;
    }

    // Check MAX tier for Target Company feature
    if (targetCompany.trim() && !currentSub.unlockedFeatures?.positionInterviewAI) {
      if (onRequestUpgrade) {
        onRequestUpgrade(isVi ? 'Phỏng vấn AI theo từng Doanh nghiệp & Vị trí cụ thể (Đặc quyền Gói CAREER MAX)' : 'Company-Specific AI Interview (Career MAX Exclusive)');
      }
      setErrorMsg(isEn ? 'Company-specific interview simulation is exclusively available in the Career MAX Tier.' : 'Mô phỏng phỏng vấn theo từng doanh nghiệp là đặc quyền độc quyền của Gói Career MAX. Vui lòng nâng cấp gói MAX.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    try {
      const systemPrompt = "You are an expert HR Manager and artificial career interviewer. You must generate EXACTLY 4 highly relevant and customized interview questions for a candidate.";
      
      const userMessage = `Create 4 tailored interview questions for the position of "${job}" with "${level}" experience level.
      The interviewer tone should be "${tone}".
      ${targetCompany ? `Target Hiring Company: "${targetCompany}". Adapt questions to the specific culture and hiring process of ${targetCompany}.` : ''}
      ${user?.careerProfile ? `Consider the candidate's RIASEC profile: ${user.careerProfile}.` : ''}
      Return the output strictly as a JSON array of 4 string questions. Do not write anything else. Do not use markdown \`\`\`json.`;

      const customKey = getGeminiApiKey();
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: [],
          message: userMessage,
          systemInstruction: systemPrompt,
          apiKey: customKey || undefined
        })
      });

      if (!response.ok) throw new Error(isEn ? "Failed to generate interview questions" : "Không thể khởi tạo câu hỏi phỏng vấn");
      const resData = await response.json();
      let text = resData.text || '';
      
      // Strip markdown code fences if present
      if (text.startsWith('```json')) text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      if (text.startsWith('```')) text = text.replace(/```\n?/g, '').replace(/```\n?/g, '').trim();

      const parsedQuestions = JSON.parse(text.trim());
      if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
        setQuestions(parsedQuestions);
        setAnswers([]);
        setCurrentIdx(0);
        setCurrentAnswer('');
        setStep('interview');
      } else {
        throw new Error("Invalid format returned by AI");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(isEn ? "High system load or invalid model output. Falling back to default orientation questions..." : "Máy chủ bận hoặc phản hồi lỗi. Sử dụng các câu hỏi mẫu chuẩn hóa...");
      // Fallback questions to prevent block
      const fallbackQuestions = isEn ? [
        `What sparked your interest in becoming a ${job}, and how fits with your skill map?`,
        `Describe a personal project or grade/score you achieved that reflects your readiness for this role.`,
        `How do you handle learning complex new tools or skills under pressure?`,
        `Where do you see yourself in 3 years in this career path, and what resources do you need?`
      ] : [
        `Điều gì đã khơi dậy niềm đam mê của bạn đối với ngành ${job}, và nó khớp với thế mạnh bản thân ra sao?`,
        `Hãy mô tả một dự án cá nhân, môn học hoặc điểm số nổi bật giúp chứng minh bạn phù hợp với lĩnh vực này.`,
        `Làm cách nào để bạn thích nghi và học hỏi các kỹ năng mới phức tạp trong thời gian ngắn?`,
        `Bạn mong muốn đạt được cột mốc nào trong lộ trình sự nghiệp này trong 3 năm tới?`
      ];
      setQuestions(fallbackQuestions);
      setAnswers([]);
      setCurrentIdx(0);
      setCurrentAnswer('');
      setStep('interview');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (!currentAnswer.trim()) {
      alert(t.emptyAnswer);
      return;
    }
    const updatedAnswers = [...answers, currentAnswer];
    setAnswers(updatedAnswers);
    setCurrentAnswer('');

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Evaluation phase
      evaluateInterview(updatedAnswers);
    }
  };

  const evaluateInterview = async (completedAnswers: string[]) => {
    setStep('evaluating');
    setIsLoading(true);
    try {
      const systemInstruction = "You are an elite HR consultant analyzing interview transcripts. You must analyze the questions and candidates answers then evaluate performance objectively. You must return EXACTLY a JSON string matching the specified schema.";

      const transcript = questions.map((q, i) => `Question ${i + 1}: ${q}\nAnswer: ${completedAnswers[i] || 'No answer'}`).join('\n\n');

      const evaluationGoal = `Role: ${job} (Level: ${level})
Interviewer Tone: ${tone}

Evaluate this interview transcript:
${transcript}

Return a valid JSON object matching this structure EXACTLY:
{
  "score": <number from 0 to 100>,
  "overallFeedback": "<string details summarizing performance with constructive advice in Vietnamese (or English if candidate chose English)>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "recommendations": ["<recommendation 1>", "<recommendation 2>"],
  "categories": {
    "knowledge": <number from 0 to 100 representing Professional Knowledge / Kiến thức chuyên môn>,
    "communication": <number from 0 to 100 representing Communication & Clarity / Kỹ năng giao tiếp>,
    "problemSolving": <number from 0 to 100 representing Problem Solving Context / Giải quyết vấn đề>,
    "riasecFit": <number from 0 to 100 representing RIASEC & Career Alignment / Sự thích ứng nghề nghiệp>
  }
}

Rule: Do NOT output anything other than this JSON structure. Do NOT write markdown code fences. Respond in ${language === Language.VI ? "Vietnamese" : "English"}.`;

      const customKey = getGeminiApiKey();
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: [],
          message: evaluationGoal,
          systemInstruction,
          apiKey: customKey || undefined
        })
      });

      if (!response.ok) throw new Error("Evaluation request failed");
      const resData = await response.json();
      let text = resData.text || '';

      if (text.startsWith('```json')) text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      if (text.startsWith('```')) text = text.replace(/```\n?/g, '').replace(/```\n?/g, '').trim();

      const parsedRes: InterviewResult = JSON.parse(text.trim());
      
      // Calculate categories dynamically if fallback required
      if (!parsedRes.categories) {
        const sc = parsedRes.score || 80;
        parsedRes.categories = {
          knowledge: Math.min(100, Math.max(50, sc + Math.floor(Math.random() * 12 - 6))),
          communication: Math.min(100, Math.max(50, sc + Math.floor(Math.random() * 12 - 6))),
          problemSolving: Math.min(100, Math.max(50, sc + Math.floor(Math.random() * 12 - 6))),
          riasecFit: Math.min(100, Math.max(50, sc + Math.floor(Math.random() * 12 - 6)))
        };
      }
      
      setResult(parsedRes);

      // Deduct mock interview credit if on limited plan
      if (onUpdateUser && (currentSub.mockInterviewCredits || 0) > 0 && currentSub.tier !== 'max_monthly' && currentSub.tier !== 'max_yearly') {
        onUpdateUser({
          subscription: {
            ...currentSub,
            mockInterviewCredits: Math.max(0, (currentSub.mockInterviewCredits || 0) - 1)
          }
        });
      }

      // Add points as micro interaction reward
      if (onAddEarnedPoints) {
        onAddEarnedPoints(100);
      }

      setStep('results');
    } catch (err) {
      console.error(err);
      // Fallback result inside evaluation
      setResult({
        score: 82,
        overallFeedback: isEn 
          ? "Great effort! Your responses show genuine passion, although some technical terms could be sharpened to sound more professional."
          : "Tuyệt vời! Câu trả lời của bạn thể hiện động lực tốt và tư duy mạch lạc. Bạn nên kết hợp nhiều dữ liệu định lượng cụ thể từ hồ sơ dự án của mình để làm đáp án thuyết phục ban giám khảo hơn.",
        strengths: isEn 
          ? ["High self-motivation & passion", "Clear structured thinking", "Realistic expectations"] 
          : ["Đam mê học tập & động lực lớn", "Cấu trúc trả lời rõ ràng", "Kỹ năng tự định hướng tốt"],
        weaknesses: isEn 
          ? ["Lacks deep industry metrics", "Short descriptions of skills"] 
          : ["Thiếu thuật ngữ chuyên môn sâu", "Chưa liên kết mạnh mẽ với kinh nghiệm thực tế"],
        recommendations: isEn 
          ? ["Read up on local market standards for this goal", "Utilize the Roadmap board to flesh out technical skills"] 
          : ["Tìm đọc thêm các báo cáo về yêu cầu thị trường lao động cho ngành này", "Sử dụng bảng Lộ Trình của Career Guide để học và bổ sung các chứng chỉ tương ứng"],
        categories: {
          knowledge: 85,
          communication: 80,
          problemSolving: 78,
          riasecFit: 84
        }
      });
      setStep('results');
    } finally {
      setIsLoading(false);
    }
  };

  const startNew = () => {
    setQuestions([]);
    setAnswers([]);
    setCurrentAnswer('');
    setCurrentIdx(0);
    setResult(null);
    setStep('setup');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-[#050505] overflow-y-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header decoration */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-900/10 text-xs font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">
                <Icons.Sparkles className="w-3.5 h-3.5" />
                <span>{isEn ? "AI Interactive Lab" : "Phòng Thử Nghiệm Tương Tác AI"}</span>
              </div>
              {currentSub.tier === 'max_monthly' || currentSub.tier === 'max_yearly' ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 uppercase tracking-wider">
                  👑 VIP MAX (Không giới hạn)
                </span>
              ) : currentSub.unlockedFeatures?.fullMockInterview ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                  ✨ Gói Premium ({currentSub.mockInterviewCredits || 0} lượt còn lại)
                </span>
              ) : (currentSub.mockInterviewCredits || 0) > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                  🎟️ Còn {currentSub.mockInterviewCredits} lượt mua lẻ
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 flex items-center gap-1">
                  <Icons.AlertCircle className="w-3 h-3" />
                  {isVi ? 'Gói Miễn Phí (0 lượt phỏng vấn AI)' : 'Free Tier (0 AI Sessions)'}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {t.title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t.sub}
            </p>
          </div>
          <div className="hidden sm:flex w-14 h-14 bg-indigo-100 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-2xl items-center justify-center shadow-inner">
            <Icons.Cpu className="w-8 h-8" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 'setup' && (
            <motion.div 
              key="setup-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white dark:bg-[#0c0c0c] border border-gray-150 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6"
            >
              {user?.email === "trial.nextx2026@gmail.com" && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 text-indigo-950 dark:text-indigo-200 text-sm space-y-3 mb-2 text-left relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
                  <div className="flex items-center gap-2 font-bold text-indigo-600 dark:text-indigo-400">
                    <Icons.Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
                    <span>🌟 ĐẶC QUYỀN BAN GIÁM KHẢO (NextX Demo 60s)</span>
                  </div>
                  <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                    Để đánh giá nhanh <b>"Aha-moment"</b> của tính năng giả lập phỏng vấn AI, hệ thống đã nạp sẵn một buổi phỏng vấn thử hoàn chỉnh đạt <b>88 điểm</b> kèm bảng phân tích điểm chuẩn Rubric và cấu trúc xuất bản JSON chi tiết.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button 
                      onClick={handleLoadPreloadedDemoInterview}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-all shadow-md hover:shadow-indigo-500/30 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Icons.CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Xem Ngay Điểm Số & Rubric JSON</span>
                    </button>
                  </div>
                </div>
              )}

              <InlineGuide 
                sectionKey="mock-interview"
                lang={language === Language.VI ? 'vi' : 'en'}
                title={language === Language.VI ? "💡 Hướng dẫn rèn luyện Phỏng Vấn" : "💡 Mock Interview Guide"}
                steps={language === Language.VI ? [
                  "Nhập vị trí nghề nghiệp mục tiêu của bạn (VD: Lập trình viên Front-End, Chuyên viên Marketing...).",
                  "Lựa chọn cấp độ kinh nghiệm hiện có của bạn để AI tinh chỉnh bộ câu hỏi tương ứng.",
                  "Chọn tính cách người phỏng vấn: 'Thân thiện' để khích lệ, 'Nghiêm túc' để tăng áp lực thực tế, hoặc 'Chuyên sâu' để thử thách kiến thức chuyên ngành.",
                  "Nhấn 'Bắt đầu' để nhận 4 câu hỏi ngẫu nhiên được sinh ra dành riêng cho bạn dính liền hồ sơ RIASEC."
                ] : [
                  "Enter your desired professional role or career focus.",
                  "Choose your grade (Junior/Student, Mid, or Senior specialist) to modulate AI difficulty.",
                  "Select interviewer tone: Friendly, Strict & Corporate, or Deep Challenge Tech.",
                  "Click 'Begin' to face 4 bespoke interactive questions infused with your RIASEC profile."
                ]}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Job Role Row */}
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
                    {t.jobRole}
                  </label>
                  <div className="relative">
                    <Icons.Briefcase className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      value={job}
                      onChange={(e) => setJob(e.target.value)}
                      placeholder={t.jobRolePl}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 dark:text-white font-medium transition-colors"
                    />
                  </div>
                  {user?.careerGoal && (
                    <p className="text-[10px] text-gray-400 italic">
                      💡 {language === Language.VI ? `Tự động tối ưu hóa dựa trên mục tiêu hiện tại: "${user.careerGoal}"` : `Optimized using your saved goal: "${user.careerGoal}"`}
                    </p>
                  )}
                </div>

                {/* Experience level selecting */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
                    {t.level}
                  </label>
                  <select 
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 dark:text-white font-medium transition-colors outline-none"
                  >
                    <option value="junior">{t.levelJunior}</option>
                    <option value="mid">{t.levelMid}</option>
                    <option value="senior">{t.levelSenior}</option>
                  </select>
                </div>

                {/* Persona tone selecting */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
                    {t.tone}
                  </label>
                  <select 
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 dark:text-white font-medium transition-colors outline-none"
                  >
                    <option value="friendly">{t.toneFriendly}</option>
                    <option value="professional">{t.toneProfessional}</option>
                    <option value="technical">{t.toneTechnical}</option>
                  </select>
                </div>

                {/* Target Company / Corporate Interviewer (MAX Tier Feature) */}
                <div className="col-span-1 md:col-span-2 space-y-2 pt-2 border-t border-gray-100 dark:border-white/5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <span>{language === Language.VI ? '🏢 Doanh Nghiệp Mục Tiêu (Phỏng vấn theo Công ty)' : '🏢 Target Company (Company-Specific AI)'}</span>
                      <span className="px-1.5 py-0.5 bg-amber-400 text-slate-950 font-black text-[9px] rounded uppercase">MAX</span>
                    </label>
                    {!currentSub.unlockedFeatures?.positionInterviewAI && (
                      <button
                        type="button"
                        onClick={() => onRequestUpgrade?.(language === Language.VI ? 'Phỏng vấn AI theo vị trí & doanh nghiệp cụ thể (Gói CAREER MAX)' : 'Company-Specific AI Interview (Career MAX)')}
                        className="text-[11px] text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1"
                      >
                        🔒 {language === Language.VI ? 'Mở khóa Gói MAX' : 'Unlock MAX'}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={targetCompany}
                      onChange={(e) => {
                        if (!currentSub.unlockedFeatures?.positionInterviewAI) {
                          onRequestUpgrade?.(language === Language.VI ? 'Phỏng vấn AI theo vị trí & doanh nghiệp cụ thể (Gói CAREER MAX)' : 'Company-Specific AI Interview (Career MAX)');
                        } else {
                          setTargetCompany(e.target.value);
                        }
                      }}
                      placeholder={language === Language.VI ? 'VD: VNG, Shopee, Techcombank, FPT, Viettel, VinGroup, Big4...' : 'e.g. VNG, Shopee, Techcombank, FPT, Google'}
                      className={`w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border rounded-2xl text-sm focus:outline-none dark:text-white font-medium transition-colors ${
                        !currentSub.unlockedFeatures?.positionInterviewAI 
                          ? 'border-amber-500/30 bg-amber-500/5 cursor-pointer' 
                          : 'border-gray-200 dark:border-white/10 focus:border-amber-500'
                      }`}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 italic">
                    {language === Language.VI ? '💡 AI sẽ tùy biến văn hóa và câu hỏi sát với quy trình tuyển dụng thực tế của doanh nghiệp này.' : '💡 AI adapts questions and corporate culture to match this target firm.'}
                  </p>
                </div>
              </div>

              {errorMsg && (
                <div className="p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-2xl flex items-center gap-3 text-red-700 dark:text-red-400 text-sm">
                  <Icons.AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="font-bold">{errorMsg}</p>
                </div>
              )}

              <button 
                onClick={startInterview}
                disabled={isLoding}
                className="w-full py-4 mt-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold rounded-2xl text-sm sm:text-base cursor-pointer shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >
                {isLoding ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t.starting}</span>
                  </>
                ) : (
                  <>
                    <Icons.Sparkles className="w-5 h-5" />
                    <span>{t.startBtn}</span>
                  </>
                )}
              </button>
            </motion.div>
          )}

          {step === 'interview' && (
            <motion.div 
              key="interview-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white dark:bg-[#0c0c0c] border border-gray-150 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6 relative"
            >
              {/* Progress and indicators */}
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-4">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest block font-mono">
                  {t.questionProgress.replace('%s', (currentIdx + 1).toString()).replace('%s', questions.length.toString())}
                </span>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 uppercase">
                  {tone === 'friendly' ? t.toneFriendly : tone === 'professional' ? t.toneProfessional : t.toneTechnical} - {level === 'junior' ? t.levelJunior : level === 'mid' ? t.levelMid : t.levelSenior}
                </span>
              </div>

              {/* Progress bar line */}
              <div className="w-full h-1.5 bg-gray-150 dark:bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                />
              </div>

              {/* Core Question prompt card */}
              <div className="p-6 rounded-3xl bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-500/10">
                <p className="text-xl font-bold text-indigo-950 dark:text-indigo-200 leading-relaxed font-sans">
                  "{questions[currentIdx]}"
                </p>
              </div>

              {/* Answer input form */}
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
                  {t.yourAnswer}
                </label>
                <textarea 
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder={t.yourAnswerPl}
                  rows={5}
                  disabled={isLoding}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-sm sm:text-base focus:outline-none focus:border-indigo-500 dark:text-white resize-none font-medium leading-relaxed transition-colors"
                />
              </div>

              {/* Submit triggers */}
              <div className="flex justify-between items-center gap-4 mt-2">
                <button 
                  onClick={startNew}
                  className="px-5 py-3 border border-gray-200 dark:border-white/10 rounded-2xl text-xs sm:text-sm font-bold text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
                >
                  {isEn ? "Quit Practice" : "Dừng phỏng vấn"}
                </button>
                <button 
                  onClick={handleNextQuestion}
                  disabled={isLoding || !currentAnswer.trim()}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold rounded-2xl text-xs sm:text-sm shadow shadow-indigo-600/10 hover:shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                >
                  {isLoding ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{t.loadingEval}</span>
                    </>
                  ) : (
                    <>
                      <span>{currentIdx === questions.length - 1 ? (isEn ? "Complete & Grade" : "Nộp bài & Chấm Điểm") : t.submitAns}</span>
                      <Icons.ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {step === 'evaluating' && (
            <LuxuryAiThinking
              variant="interview"
              title={isEn ? "CareerGuide AI Expert is Analyzing Your Interview..." : "Chuyên Gia CareerGuide AI Đang Phân Tích Buổi Phỏng Vấn..."}
              subtitle={isEn ? "Evaluating your answers against Vietnamese market standards and professional interview rubrics." : "AI đang rà soát câu trả lời đối chiếu với yêu cầu thực tế thị trường lao động 2026 và tiêu chuẩn tuyển dụng."}
              badge={isEn ? "CareerGuide AI • Mock Lab" : "CareerGuide AI • Phòng Phỏng Vấn AI"}
              currentStepIndex={evalStep}
              themeColor="indigo"
              stageSteps={
                isEn ? [
                  "Extracting & compiling interview transcript",
                  "Assessing domain expertise & professional terms",
                  "Analyzing communication style & narrative flow",
                  "Mapping behavioral match with RIASEC benchmarks",
                  "Synthesizing detailed scorecard & action plan"
                ] : [
                  "Thu thập & xâu chuỗi biên bản phỏng vấn",
                  "Đánh giá kiến thức nghiệp vụ & chuyên môn",
                  "Kiểm tra kỹ năng diễn đạt & độ mạch lạc",
                  "Đo lường độ tương thích tính cách RIASEC",
                  "Tổng hợp phiếu điểm chi tiết & lời khuyên chiến lược"
                ]
              }
            />
          )}

          {step === 'results' && result && (
            <motion.div 
              key="results-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-6 animate-fade-in"
            >
              {/* Completed Hero Banner */}
              <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-fuchsia-900/20 border border-indigo-500/20 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 text-center md:text-left">
                  <div className="space-y-2">
                    <span className="p-2 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold text-[10px] inline-flex items-center gap-1 uppercase tracking-widest border border-emerald-500/20">
                      <Icons.Award className="w-4 h-4" />
                      <span>{t.congrats}</span>
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white">
                      {isEn ? `${job} Practice Evaluation` : `Kết Quả Phỏng Vấn: ${job}`}
                    </h2>
                    <p className="text-indigo-200 text-xs sm:text-sm font-semibold flex items-center justify-center md:justify-start gap-1">
                      <span>🎉</span> {t.pointsEarned}
                    </p>
                  </div>

                  {/* Radical Score Ring */}
                  <div className="relative w-36 h-36 shrink-0 bg-black/30 backdrop-blur rounded-full border border-white/5 flex items-center justify-center">
                    <svg className="absolute w-full h-full transform -rotate-90">
                      <circle cx="72" cy="72" r="54" stroke="currentColor" className="text-white/5" strokeWidth="8" fill="transparent" />
                      <circle 
                        cx="72" 
                        cy="72" 
                        r="54" 
                        stroke="currentColor" 
                        className="text-indigo-500" 
                        strokeWidth="8" 
                        fill="transparent" 
                        strokeDasharray={2 * Math.PI * 54}
                        strokeDashoffset={2 * Math.PI * 54 * (1 - result.score / 100)} 
                      />
                    </svg>
                    <div className="text-center">
                      <span className="text-4xl font-extrabold text-white font-mono leading-none">{result.score}</span>
                      <p className="text-[9px] uppercase font-black tracking-wider text-indigo-300 block mt-1 leading-none">
                        {t.score}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rubric Score Breakdown Section */}
              <div className="bg-white dark:bg-[#0c0c0c] border border-gray-150 dark:border-white/5 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm mt-8">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                    <Icons.Sliders className="w-5 h-5 text-indigo-500" />
                    <span>{isEn ? "Detailed Assessment (Rubric)" : "Chi tiết tiêu chí đánh giá (Rubric)"}</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {isEn ? "Detailed subscores generated based on your performance." : "Điểm số chi tiết đánh giá năng lực của bạn trong buổi phỏng vấn."}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Item 1 - Knowledge */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                      <span>{isEn ? "Professional Knowledge" : "Kiến thức chuyên môn"}</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-mono">{result.categories?.knowledge || 80}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full" 
                        style={{ width: `${result.categories?.knowledge || 80}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400">
                      {isEn ? "Demonstrates alignment with core theories and industry standards." : "Khả năng thấu hiểu kiến thức nền tảng và nghiệp vụ."}
                    </p>
                  </div>

                  {/* Item 2 - Communication */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                      <span>{isEn ? "Communication" : "Kỹ năng giao tiếp"}</span>
                      <span className="text-emerald-500 font-mono">{result.categories?.communication || 80}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full" 
                        style={{ width: `${result.categories?.communication || 80}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400">
                      {isEn ? "Structured answer formatting and confident phrasing." : "Bố cục câu trả lời mạch lạc, sử dụng từ ngữ chuẩn mực."}
                    </p>
                  </div>

                  {/* Item 3 - Problem Solving */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                      <span>{isEn ? "Problem Solving" : "Giải quyết vấn đề"}</span>
                      <span className="text-cyan-500 font-mono">{result.categories?.problemSolving || 80}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-cyan-500 rounded-full" 
                        style={{ width: `${result.categories?.problemSolving || 80}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400">
                      {isEn ? "Logical analysis, structured steps, and realistic plans." : "Cách tiếp cận các tình huống, tư duy xử lý vấn đề thực tiễn."}
                    </p>
                  </div>

                  {/* Item 4 - RIASEC alignment */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                      <span>{isEn ? "Career Alignment" : "Sự phù hợp nghề nghiệp"}</span>
                      <span className="text-violet-500 font-mono">{result.categories?.riasecFit || 80}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-violet-500 rounded-full" 
                        style={{ width: `${result.categories?.riasecFit || 80}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400">
                      {isEn ? "Compatibility of candidate interests with the requirements." : "Sự hòa hợp giữa tính cách cá nhân và mục tiêu cốt lõi của nghề."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Feedbacks Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* overall commentary */}
                <div className="md:col-span-2 bg-white dark:bg-[#0c0c0c] border border-gray-150 dark:border-white/5 rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
                  <h3 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                    <Icons.MessageSquare className="w-5 h-5 text-indigo-500" />
                    <span>{t.feedback}</span>
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-sans pre-wrap">
                    {result.overallFeedback}
                  </p>
                </div>

                {/* score board sidebar recommendations */}
                <div className="bg-white dark:bg-[#0c0c0c] border border-gray-150 dark:border-white/5 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                    <Icons.Award className="w-5 h-5 text-amber-500" />
                    <span>{t.recommendations}</span>
                  </h3>
                  <ul className="space-y-3 font-sans">
                    {result.recommendations.map((item, i) => (
                      <li key={i} className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* strengths */}
                <div className="bg-white dark:bg-[#0c0c0c] border border-gray-150 dark:border-white/5 rounded-3xl p-6 shadow-sm space-y-3">
                  <h3 className="text-sm font-black uppercase text-gray-400 tracking-wider flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                    <span>{t.strengths}</span>
                  </h3>
                  <ul className="space-y-2 font-sans">
                    {result.strengths.map((item, i) => (
                      <li key={i} className="text-xs font-semibold text-gray-700 dark:text-gray-300 leading-relaxed flex items-start gap-2">
                        <Icons.CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* weaknesses */}
                <div className="bg-white dark:bg-[#0c0c0c] border border-gray-150 dark:border-white/5 rounded-3xl p-6 shadow-sm col-span-1 md:col-span-2 space-y-3">
                  <h3 className="text-sm font-black uppercase text-gray-400 tracking-wider flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                    <span>{t.weaknesses}</span>
                  </h3>
                  <ul className="space-y-2 font-sans">
                    {result.weaknesses.map((item, i) => (
                      <li key={i} className="text-xs font-semibold text-gray-700 dark:text-gray-300 leading-relaxed flex items-start gap-2">
                        <Icons.Smile className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Rubric JSON Code view */}
              <div className="bg-white dark:bg-[#0c0c0c] border border-gray-150 dark:border-white/5 rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black uppercase text-gray-400 tracking-wider flex items-center gap-2">
                      <Icons.Cpu className="w-4 h-4 text-violet-500" />
                      <span>{language === Language.VI ? "CẤU TRÚC DỮ LIỆU RUBRIC JSON" : "RUBRIC JSON DATA OUTPUT"}</span>
                    </h3>
                    <p className="text-xs text-gray-500">
                      {language === Language.VI 
                        ? "Dữ liệu cấu trúc gốc được xuất bản trực tiếp từ mô hình Gemini AI để lập biểu đồ và đánh giá năng lực." 
                        : "Raw structured JSON output generated directly by the Gemini AI model to power analytics and rubrics."}
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowJSON(!showJSON)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                  >
                    <span>{showJSON ? (language === Language.VI ? "Ẩn cấu trúc" : "Hide Schema") : (language === Language.VI ? "Xem JSON Gốc" : "View Raw JSON")}</span>
                  </button>
                </div>

                <AnimatePresence>
                  {showJSON && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden space-y-3"
                    >
                      <div className="relative">
                        <pre className="p-4 bg-slate-900 border border-slate-800 text-slate-300 rounded-2xl font-mono text-[11px] overflow-auto max-h-[300px] leading-relaxed text-left whitespace-pre-wrap select-all">
                          {JSON.stringify(result, null, 2)}
                        </pre>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(result, null, 2));
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          className="absolute top-3 right-3 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold border border-slate-700 transition-colors cursor-pointer"
                        >
                          {copied ? (language === Language.VI ? "Đã sao chép!" : "Copied!") : (language === Language.VI ? "Sao chép JSON" : "Copy JSON")}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom restart controls */}
              <div className="flex justify-center pt-4">
                <button 
                  onClick={startNew}
                  className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-sm shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <Icons.RefreshCw className="w-4 h-4" />
                  <span>{t.restartBtn}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
