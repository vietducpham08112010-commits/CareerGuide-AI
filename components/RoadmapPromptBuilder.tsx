import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import { Language, UserProfile } from '../types';

interface RoadmapPromptBuilderProps {
  language: Language;
  user: UserProfile | null;
  onSendPromptToChat: (promptText: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export interface PromptTemplate {
  id: string;
  category: 'career' | 'tech' | 'business' | 'languages' | 'interview' | 'promotion' | 'reskill' | 'ai_tools';
  title_vi: string;
  title_en: string;
  desc_vi: string;
  desc_en: string;
  prompt_vi: string;
  prompt_en: string;
  tags: string[];
}

const SAMPLE_TEMPLATES: PromptTemplate[] = [
  {
    id: 'zero-to-fullstack',
    category: 'tech',
    title_vi: 'Lộ trình từ con số 0 trở thành Lập trình viên Web Fullstack (6 tháng)',
    title_en: 'Zero to Fullstack Web Developer (6 Months)',
    desc_vi: 'Học HTML/CSS, JavaScript, React, Node.js, REST API và triển khai sản phẩm thực tế.',
    desc_en: 'Master HTML/CSS, JS, React, Node.js, REST APIs and deploy real products.',
    prompt_vi: `Hãy lập cho tôi một Lộ Trình Học Tập chi tiết từ con số 0 trở thành Lập trình viên Web Fullstack trong 6 tháng.
Tôi dành 15-20 giờ/tuần.
Yêu cầu:
1. Chia làm 6 cột mốc hàng tháng với kiến thức trọng tâm (Frontend & Backend).
2. Chi tiết từng dự án nhỏ cần xây dựng cho Portfolio (E-commerce, Task Manager, Realtime Chat).
3. Nguồn học miễn phí chất lượng và bộ checklist chuẩn bị đi phỏng vấn.`,
    prompt_en: `Build a step-by-step roadmap to become a Fullstack Web Developer from scratch in 6 months.
I dedicate 15-20 hours/week.
Requirements:
1. 6 monthly milestones covering Frontend and Backend.
2. Concrete Portfolio Projects (E-commerce, Task Manager, Realtime Chat).
3. Top free resources and interview readiness checklist.`,
    tags: ['Fullstack', 'Web Dev', 'React', 'Node.js']
  },
  {
    id: 'ai-ml-engineer',
    category: 'tech',
    title_vi: 'Lộ trình trở thành AI & Machine Learning Engineer chuyên nghiệp',
    title_en: 'AI & Machine Learning Engineer Career Roadmap',
    desc_vi: 'Làm chủ Python, Toán ứng dụng, Scikit-Learn, PyTorch và Gemini LLM APIs.',
    desc_en: 'Master Python, Math, Scikit-Learn, PyTorch, and LLM APIs.',
    prompt_vi: `Hãy xây dựng cho tôi lộ trình 6 tháng học AI & Machine Learning Engineer từ trình độ cơ bản.
Nội dung yêu cầu:
1. Tháng 1-2: Python, NumPy, Pandas, Giải tích & Xác suất thống kê.
2. Tháng 3-4: Machine Learning truyền thống (Regression, Classification, Clustering) & Deep Learning.
3. Tháng 5-6: GenAI, RAG (Retrieval-Augmented Generation), Fine-tuning & Tích hợp Gemini API vào ứng dụng.
4. Đề xuất 3 dự án AI thực chiến để đưa vào CV tuyển dụng.`,
    prompt_en: `Create a 6-month roadmap to become an AI & Machine Learning Engineer from basic level.
Requirements:
1. Months 1-2: Python, Pandas, Math & Statistics.
2. Months 3-4: Classical Machine Learning & Neural Networks.
3. Months 5-6: Generative AI, RAG architecture, LLM fine-tuning & Gemini API integration.
4. 3 hands-on AI projects for my resume.`,
    tags: ['AI', 'Machine Learning', 'Python', 'LLM']
  },
  {
    id: 'data-analyst-bi',
    category: 'tech',
    title_vi: 'Lộ trình trở thành Data Analyst & Business Intelligence (4 tháng)',
    title_en: 'Data Analyst & Business Intelligence Roadmap (4 Months)',
    desc_vi: 'Làm chủ SQL nâng cao, Excel, PowerBI/Tableau và Phân tích chỉ số kinh doanh.',
    desc_en: 'Master Advanced SQL, Excel, PowerBI/Tableau, and Business Metrics.',
    prompt_vi: `Lập cho tôi lộ trình 4 tháng tự học trở thành Data Analyst.
Các học phần bắt buộc:
1. SQL từ cơ bản đến nâng cao (CTEs, Window Functions, Optimization).
2. Trực quan hóa dữ liệu với Power BI / Tableau và xây dựng Dashboard tương tác.
3. Python cho Data Analysis (Pandas, Matplotlib, Seaborn).
4. Phân tích case study kinh doanh thực tế (Churn rate, Customer Lifetime Value, A/B Testing).`,
    prompt_en: `Build a 4-month self-study roadmap to become a Data Analyst.
Core modules:
1. SQL (Basic to Window Functions & Optimization).
2. Data Visualization with Power BI / Tableau dashboards.
3. Python for Data Analysis (Pandas, Seaborn).
4. Real-world business case studies (Churn analysis, LTV, A/B testing).`,
    tags: ['Data Analyst', 'SQL', 'Power BI', 'Business']
  },
  {
    id: 'product-manager-pivot',
    category: 'business',
    title_vi: 'Lộ trình chuyển ngành sang Product Manager (PM) trong 6 tháng',
    title_en: 'Product Manager Transition Roadmap (6 Months)',
    desc_vi: 'Tư duy sản phẩm, Wireframing, Agile/Scrum, User Research & Metrics.',
    desc_en: 'Product Thinking, Wireframing, Agile/Scrum, User Research & Product Metrics.',
    prompt_vi: `Tôi muốn chuyển hướng sự nghiệp sang làm Product Manager (PM).
Hãy thiết kế lộ trình 6 tháng giúp tôi:
1. Đọc hiểu & viết PRD (Product Requirement Document) chuẩn doanh nghiệp.
2. Phương pháp User Research, Wireframing (Figma) và A/B Testing.
3. Quản lý dự án Agile/Scrum và giao tiếp hiệu quả với Đội Kỹ Thuật (Developers).
4. Xây dựng Product Portfolio mô phỏng cải tiến một sản phẩm ứng dụng thực tế.`,
    prompt_en: `Design a 6-month career transition roadmap to Product Manager.
Requirements:
1. Writing professional Product Requirement Documents (PRDs).
2. User Research, Figma wireframing, and product analytics.
3. Agile/Scrum project management & dev team collaboration.
4. Building a Product Portfolio tearing down and improving a real app.`,
    tags: ['Product Manager', 'Agile', 'Figma', 'PRD']
  },
  {
    id: 'ui-ux-design-hero',
    category: 'business',
    title_vi: 'Lộ trình từ con số 0 đến UI/UX Designer có Portfolio chuyên nghiệp',
    title_en: 'Zero to Professional UI/UX Designer Roadmap',
    desc_vi: 'Nghiên cứu trải nghiệm người dùng, Design System, Figma và xây dựng Case Study.',
    desc_en: 'UX Research, Design Systems, Figma prototyping, and Case Study creation.',
    prompt_vi: `Tôi muốn trở thành UI/UX Designer trong vòng 4 tháng.
Hãy cho tôi lộ trình từng bước:
1. Nguyên lý thiết kế giao diện (Grid, Typography, Color Theory, Accessibility).
2. Quy trình UX Research, Wireframing, Prototyping và Design System trên Figma.
3. Cách thực hiện 2 Case Study hoàn chỉnh (Web & Mobile App) từ ý tưởng đến kiểm thử người dùng.
4. Mẹo chuẩn bị Portfolio trên Behance / Notion thu hút nhà tuyển dụng.`,
    prompt_en: `Generate a 4-month roadmap to become a UI/UX Designer.
Requirements:
1. UI fundamentals (Grids, Typography, Color, Accessibility).
2. UX Research, Figma prototyping & Design Systems.
3. 2 complete UX Case Studies (Mobile & Web) from research to user testing.
4. Portfolio presentation tips on Behance / Notion.`,
    tags: ['UI/UX', 'Figma', 'Design', 'Portfolio']
  },
  {
    id: 'digital-marketing-growth',
    category: 'business',
    title_vi: 'Lộ trình làm chủ Digital Marketing & Performance Growth Hacking',
    title_en: 'Digital Marketing & Growth Hacking Mastery Roadmap',
    desc_vi: 'SEO, Facebook/Google Ads, Content Strategy, Analytics & Funnel Optimization.',
    desc_en: 'SEO, Ads, Content Strategy, Analytics & Conversion Funnel Optimization.',
    prompt_vi: `Hãy thiết kế cho tôi lộ trình 3 tháng học Digital Marketing thực chiến:
1. SEO Website, Content Marketing & Copywriting thu hút.
2. Chạy quảng cáo Facebook Ads, Google Performance Max & TikTok Ads tối ưu ROI.
3. Phân tích số liệu với Google Analytics 4 (GA4) và tối ưu phễu chuyển đổi (Conversion Funnel).
4. Kế hoạch chạy chiến dịch Marketing thực tế cho một thương hiệu bán lẻ/SaaS.`,
    prompt_en: `Build a 3-month practical Digital Marketing roadmap:
1. SEO, Content Marketing & Copywriting.
2. Paid Ads (Facebook, Google Performance Max, TikTok) with ROI focus.
3. Analytics with GA4 and Conversion Funnel optimization.
4. Execution plan for a real-world marketing campaign.`,
    tags: ['Marketing', 'SEO', 'Facebook Ads', 'GA4']
  },
  {
    id: 'university-cutoff-orientation',
    category: 'career',
    title_vi: 'Tư vấn chọn ngành & trường đại học theo điểm thi THPT quốc gia',
    title_en: 'University & Major Recommendation Based on High School Exam Scores',
    desc_vi: 'Phân tích tổng điểm các khối thi (A00, A01, B00, D01) và gợi ý trường uy tín.',
    desc_en: 'Analyze high school exam scores across combinations (A00, A01, D01) & recommend universities.',
    prompt_vi: `Tôi vừa thi THPT Quốc gia khối A01 với tổng điểm 26.0 điểm.
Tôi yêu thích công nghệ thông tin và trí tuệ nhân tạo, mong muốn học tại Hà Nội hoặc TP.HCM.
Hãy tư vấn cho tôi:
1. Danh sách 5 trường Đại học phù hợp nhất chia làm 3 nhóm: An toàn, Vừa sức và Thử thách dựa trên điểm chuẩn 3 năm gần nhất.
2. Phân tích cơ hội việc làm & mức lương khởi điểm của các ngành thuộc các trường này.
3. Lời khuyên sắp xếp thứ tự nguyện vọng thông minh để tỉ lệ trúng tuyển cao nhất.`,
    prompt_en: `I scored 26.0 points in high school exam combination A01.
I love IT and AI and want to study in Hanoi or HCMC.
Please recommend:
1. 5 universities grouped into Safety, Target, and Reach based on 3-year cutoff scores.
2. Job prospects and starting salary analysis for these majors.
3. Strategic preference ranking (Nguyện vọng) advice to maximize admission chances.`,
    tags: ['Đại học', 'Điểm chuẩn', 'Chọn ngành', 'THPT']
  },
  {
    id: 'ielts-upgrade',
    category: 'languages',
    title_vi: 'Lộ trình tăng điểm IELTS từ 4.5 lên 7.0 cấp tốc trong 4 tháng',
    title_en: 'Fast-track IELTS 4.5 to 7.0 Roadmap in 4 Months',
    desc_vi: 'Mẫu prompt chi tiết từng kỹ năng Nghe-Nói-Đọc-Viết kèm tài liệu tự học.',
    desc_en: 'Skills-focused prompt covering Listening, Speaking, Reading, Writing with self-study resources.',
    prompt_vi: `Tôi muốn nâng band điểm IELTS từ 4.5 lên 7.0 trong 4 tháng tới (tự học tại nhà, 2 giờ/ngày).
Hãy lập cho tôi một lộ trình chi tiết:
1. Phân bổ thời gian cho 4 kỹ năng Listening, Speaking, Reading, Writing.
2. Chiến lược khắc phục điểm yếu từ vựng academic và ngữ pháp phức tạp.
3. Đề xuất các nguồn tài liệu miễn phí chất lượng cao và lịch luyện giải đề thi thật (Actual Tests).
4. Gợi ý bài tập giúp tự kiểm tra Speaking & Writing hiệu quả.`,
    prompt_en: `I want to improve my IELTS score from 4.5 to 7.0 in 4 months (self-study at home, 2 hours/day).
Please generate a detailed roadmap:
1. Time allocation across Listening, Speaking, Reading, Writing.
2. Strategies for vocabulary building and grammar improvement.
3. Recommended free study materials and practice exam schedules.
4. Self-evaluation tips for Speaking and Writing sections.`,
    tags: ['Ngoại ngữ', 'IELTS', 'Cấp tốc']
  },
  {
    id: 'business-english-it',
    category: 'languages',
    title_vi: 'Lộ trình Tiếng Anh Giao Tiếp & Email Chuyên Ngành Công Nghệ',
    title_en: 'Business English & Workplace Communication for Tech Professionals',
    desc_vi: 'Luyện giao tiếp với khách hàng nước ngoài, viết email, báo cáo và thuyết trình.',
    desc_en: 'Practice speaking with foreign clients, writing emails, standup reporting & presentations.',
    prompt_vi: `Tôi là Lập trình viên muốn nâng cao Tiếng Anh công sở để làm việc với khách hàng Global / Outsource.
Hãy thiết kế lộ trình 3 tháng học Tiếng Anh Chuyên Ngành IT:
1. Từ vựng & Mẫu câu giao tiếp trong các buổi họp Daily Standup, Sprint Planning, Demo.
2. Kỹ năng viết Email, Slack message & Technical Documentation chuyên nghiệp.
3. Kịch bản giải quyết xung đột ý kiến hoặc giải thích Bug với khách hàng nước ngoài.
4. Bài tập thực hành mẫu phản xạ nói mỗi ngày.`,
    prompt_en: `I am a Software Engineer aiming to improve Business English for global client collaboration.
Create a 3-month IT Business English roadmap:
1. Vocabulary & phrases for Daily Standups, Sprint Planning, and Demo meetings.
2. Writing professional emails, Slack messages, and technical documentation.
3. Scripts for resolving client conflicts or explaining bugs gracefully.
4. Daily speaking practice exercises.`,
    tags: ['Tiếng Anh', 'Công sở', 'IT English']
  },
  {
    id: 'mock-interview-fpt',
    category: 'interview',
    title_vi: 'Kịch bản luyện phỏng vấn thử 1-1 vị trí Junior Developer / Analyst',
    title_en: '1-on-1 Mock Interview Simulation for Junior Roles',
    desc_vi: 'Đóng vai nhà tuyển dụng hỏi 5 câu kỹ thuật & 3 câu tình huống thực tế.',
    desc_en: 'Roleplay as Tech Lead asking 5 technical & 3 behavioral questions.',
    prompt_vi: `Hãy đóng vai Trưởng phòng Kỹ thuật (Tech Lead) tại một tập đoàn công nghệ lớn.
Tôi đang ứng tuyển vị trí Junior Web Developer.
Hãy thực hiện một buổi Phỏng Vấn Thử với tôi:
1. Đặt từng câu hỏi một (tổng cộng 5 câu kỹ thuật + 2 câu tình huống).
2. Sau khi tôi trả lời từng câu, hãy nhận xét chi tiết điểm tốt, điểm cần cải thiện và câu trả lời mẫu chuẩn 10/10.
3. Bắt đầu bằng câu hỏi giới thiệu bản thân đầu tiên.`,
    prompt_en: `Act as a Engineering Manager at a tech enterprise interviewing me for a Junior Web Developer position.
Conduct a mock interview:
1. Ask one question at a time (5 technical + 2 behavioral questions).
2. After each response, provide detailed feedback, areas of improvement, and a 10/10 model answer.
3. Start by asking me to introduce myself.`,
    tags: ['Phỏng vấn', 'Mock Interview', 'Luyện tập']
  },
  {
    id: 'probation-success-checklist',
    category: 'interview',
    title_vi: 'Chiến lược vượt 2 tháng thử việc với đánh giá Xuất Sắc',
    title_en: 'Strategy & Checklist to Pass 2-Month Probation with Distinction',
    desc_vi: 'Checklist theo tuần ghi điểm với Sếp, bàn giao dự án và đạt KPI thử việc.',
    desc_en: 'Weekly action plan to impress managers, deliver tasks, and exceed KPIs.',
    prompt_vi: `Tôi chuẩn bị bắt đầu 2 tháng thử việc tại công ty mới ở vị trí Chuyên viên Phân Tích.
Hãy lập cho tôi kịch bản hành động chi tiết theo tuần:
1. Tuần 1-2: Cách hòa nhập nhanh, tìm hiểu quy trình & văn hóa công ty.
2. Tuần 3-6: Chiến lược chủ động nhận việc, báo cáo tiến độ và tạo ấn tượng với sếp trực tiếp.
3. Tuần 7-8: Đóng gói thành tựu thử việc, chuẩn bị bài thuyết trình Review đánh giá chính thức.
4. Mẹo giao tiếp với đồng nghiệp để nhận sự hỗ trợ tối đa.`,
    prompt_en: `I am starting my 2-month probation as an Analyst at a new company.
Create a weekly strategy guide:
1. Weeks 1-2: Fast onboarding, understanding company culture & workflows.
2. Weeks 3-6: Proactive task execution, status reporting, impress your manager.
3. Weeks 7-8: Packaging achievements & preparing official probation presentation.
4. Workplace communication tips to gain colleague support.`,
    tags: ['Thử việc', 'Kỹ năng công sở', 'KPI']
  },
  {
    id: 'salary-negotiation-30-percent',
    category: 'promotion',
    title_vi: 'Kịch bản đàm phán tăng lương 30-50% trong buổi Performance Review',
    title_en: '30-50% Salary Negotiation Script for Annual Performance Review',
    desc_vi: 'Cách tổng hợp số liệu đóng góp, khảo sát mặt bằng lương và đàm phán thuyết phục.',
    desc_en: 'Data-driven accomplishment showcase, market salary benchmarking & review scripts.',
    prompt_vi: `Tôi đã đi làm 2 năm tại công ty hiện tại và vừa hoàn thành xuất sắc 2 dự án lớn mang lại doanh thu.
Tôi sắp có buổi Đánh giá năng lực (Performance Review) và muốn đàm phán tăng lương 30%.
Hãy chuẩn bị cho tôi:
1. Khung cấu trúc bản báo cáo thành tích (Brag Document) dựa trên con số thực tế.
2. Kịch bản thoại chi tiết khi đàm phán trực tiếp với Giám đốc/HR.
3. Cách ứng phó khi công ty từ chối hoặc viện lý do ngân sách hạn hẹp (Đề xuất các phúc lợi thay thế).`,
    prompt_en: `I have worked 2 years at my current company and delivered 2 major high-impact projects.
I have an upcoming Performance Review and want to negotiate a 30% raise.
Prepare for me:
1. Accomplishment report structure (Brag Document) driven by metrics.
2. Step-by-step negotiation dialog scripts with Director/HR.
3. Backup strategies if company cites budget constraints (alternative benefits).`,
    tags: ['Tăng lương', 'Đàm phán', 'Performance Review']
  },
  {
    id: 'junior-to-senior',
    category: 'promotion',
    title_vi: 'Lộ trình thăng tiến từ Junior lên Senior/Trưởng Nhóm trong 2 năm',
    title_en: 'Accelerated Junior to Senior / Lead Career Roadmap',
    desc_vi: 'Dành cho người đã đi làm muốn nâng cao năng lực quản lý và thu nhập.',
    desc_en: 'For working professionals seeking leadership roles and higher compensation.',
    prompt_vi: `Tôi hiện là Junior Chuyên viên Phân tích Dữ liệu (1 năm kinh nghiệm).
Hãy xây dựng lộ trình 2 năm giúp tôi thăng tiến lên Senior Data Analyst / Team Lead.
Lộ trình cần nêu rõ:
1. Các kỹ năng kỹ thuật nâng cao cần làm chủ (Mô hình hóa, SQL nâng cao, System Architecture).
2. Kỹ năng mềm & Quản lý: Quản lý dự án, giao tiếp với Stakeholders, lãnh đạo nhóm.
3. Các KPI & thành tựu công việc cần đạt để chứng minh năng lực vượt trội.`,
    prompt_en: `I am currently a Junior Data Analyst with 1 year experience.
Please create a 2-year roadmap to transition to Senior Data Analyst / Team Lead.
Requirements:
1. Advanced technical competencies to master.
2. Leadership & Soft skills: Stakeholder management, project ownership.
3. Performance KPIs to prove senior capability.`,
    tags: ['Đi làm', 'Thăng tiến', 'Lương cao']
  },
  {
    id: 'reskill-non-tech-to-ai',
    category: 'reskill',
    title_vi: 'Chuyển ngành từ Kinh Tế / Ngôn Ngữ sang AI & Data Prompt Specialist',
    title_en: 'Career Transition: Non-Tech to AI & Data Prompt Specialist',
    desc_vi: 'Lộ trình đón đầu xu hướng AI cho người không có nền tảng CNTT.',
    desc_en: 'Future-proof career pivoting roadmap leveraging AI tools for non-technical backgrounds.',
    prompt_vi: `Tôi tốt nghiệp ngành Ngôn ngữ/Kinh tế và muốn chuyển sang làm Chuyên gia Ứng dụng AI & Prompt Engineering trong các doanh nghiệp.
Hãy thiết kế lộ trình 3-6 tháng giúp tôi:
1. Tận dụng thế mạnh tư duy ngôn ngữ & phân tích kinh doanh có sẵn.
2. Học cách làm chủ các công cụ AI (Gemini, ChatGPT, Midjourney, n8n automation).
3. Xây dựng bộ sản phẩm Portfolio thực tế để chứng minh năng lực ứng tuyển.
4. Danh sách các vị trí công việc phù hợp với mức lương tham khảo.`,
    prompt_en: `I graduated in Business/Languages and want to pivot to an AI Prompt & Application Specialist role.
Create a 3-6 month transition roadmap helping me:
1. Leverage my existing business analysis and communication strengths.
2. Master modern AI tools (Gemini, Automation workflows, LLM agents).
3. Build a practical project portfolio to demonstrate proof of skill to recruiters.
4. Target job roles with compensation benchmarks in Vietnam.`,
    tags: ['Chuyển ngành', 'Xu hướng AI', 'Dễ học']
  },
  {
    id: 'n8n-workflow-automation',
    category: 'ai_tools',
    title_vi: 'Lộ trình ứng dụng AI & Tự động hóa công việc với n8n / Zapier',
    title_en: 'Workplace AI & Workflow Automation Roadmap with n8n / Zapier',
    desc_vi: 'Tự động hóa báo cáo, chăm sóc khách hàng, trích xuất dữ liệu bằng AI Agent.',
    desc_en: 'Automate reporting, customer support & data extraction using AI Agents.',
    prompt_vi: `Hãy lập cho tôi lộ trình 2 tháng học và triển khai Tự động hóa quy trình làm việc (Workflow Automation) bằng AI:
1. Cấu hình các công cụ No-code / Low-code như n8n, Make.com, Zapier.
2. Tích hợp AI (Gemini / OpenAI API) vào luồng công việc để tự động trả lời email, tổng hợp báo cáo.
3. 3 kịch bản tự động hóa thực tế cho doanh nghiệp: Tự động gửi hóa đơn, chăm sóc Lead, quét dữ liệu mạng xã hội.
4. Đánh giá thời gian và chi phí tiết kiệm được sau khi triển khai.`,
    prompt_en: `Build a 2-month roadmap to learn and implement AI Workflow Automation:
1. Setup No-code / Low-code tools like n8n, Make, and Zapier.
2. Integrate AI APIs (Gemini/OpenAI) to automate emails, summary reports, and chat responses.
3. 3 practical automation workflows: Automated invoicing, Lead nurturing, Social data scraping.
4. ROI and time-saving calculation framework.`,
    tags: ['n8n', 'Automation', 'No-code', 'AI Tools']
  },
  {
    id: 'linkedin-personal-brand',
    category: 'promotion',
    title_vi: 'Xây dựng Thương hiệu Cá nhân Chuyên gia trên LinkedIn & Thu hút cơ hội',
    title_en: 'Executive Personal Branding & Inbound Networking on LinkedIn',
    desc_vi: 'Tối ưu Profile LinkedIn, chiến lược sáng tạo nội dung bài viết và kết nối Headhunter.',
    desc_en: 'Optimize LinkedIn Profile, content strategy, and inbound Headhunter attraction.',
    prompt_vi: `Tôi muốn xây dựng thương hiệu cá nhân uy tín trên LinkedIn trong ngành Công nghệ / Marketing để thu hút các nhà tuyển dụng (Headhunter) chủ động liên hệ.
Hãy tư vấn chiến lược 3 tháng:
1. Tối ưu Headline, About section, Featured media và Kinh nghiệm chuẩn SEO LinkedIn.
2. Lịch đăng bài 3 lần/tuần với các chủ đề: Bài học ngành, Case study dự án, Xu hướng công nghệ.
3. Mẹo chủ động networking với các Managing Director, Tech Lead và HR Manager.
4. Công thức viết bài hút tương tác cao mà không bị mang tiếng "khoe khoang".`,
    prompt_en: `I want to build an authoritative personal brand on LinkedIn to attract inbound Headhunter opportunities.
Provide a 3-month strategy:
1. SEO-optimized Headline, About section, Featured items & Work experience.
2. 3x/week content calendar: Industry insights, project case studies, tech trends.
3. Strategic networking tips with Directors, Tech Leads, and Recruiters.
4. High-engagement writing formulas without sounding arrogant.`,
    tags: ['LinkedIn', 'Branding', 'Headhunter', 'Networking']
  }
];

export const RoadmapPromptBuilder: React.FC<RoadmapPromptBuilderProps> = ({
  language,
  user,
  onSendPromptToChat,
  showToast
}) => {
  const isVi = language === Language.VI;
  const [activeTab, setActiveTab] = useState<'interactive' | 'templates'>('templates');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Custom Builder State
  const [goal, setGoal] = useState('');
  const [level, setLevel] = useState('beginner');
  const [duration, setDuration] = useState('6m');
  const [weeklyHours, setWeeklyHours] = useState('15');
  const [priority, setPriority] = useState('projects');
  const [customNotes, setCustomNotes] = useState('');

  // Generated custom prompt
  const [generatedCustomPrompt, setGeneratedCustomPrompt] = useState('');

  const handleBuildPrompt = () => {
    if (!goal.trim()) {
      showToast(
        isVi ? "Vui lòng nhập mục tiêu lộ trình của bạn!" : "Please enter your career or learning goal!",
        "error"
      );
      return;
    }

    const levelText = {
      beginner: isVi ? "Bắt đầu từ số 0 (Chưa có kiến thức)" : "Absolute beginner (Zero prior knowledge)",
      intermediate: isVi ? "Đã có nền tảng cơ bản (Sơ cấp/Trung cấp)" : "Intermediate baseline (Basic knowledge)",
      advanced: isVi ? "Đã đi làm / Đã có kinh nghiệm (Nâng cao)" : "Experienced professional (Advanced)"
    }[level];

    const durationText = {
      '1m': isVi ? "1 tháng (Cấp tốc)" : "1 month (Bootcamp)",
      '3m': isVi ? "3 tháng" : "3 months",
      '6m': isVi ? "6 tháng" : "6 months",
      '1y': isVi ? "1 năm" : "1 year"
    }[duration];

    const priorityText = {
      projects: isVi ? "Thực hành làm dự án thực tế (Hands-on Projects)" : "Hands-on practical projects",
      certificates: isVi ? "Luyện thi chứng chỉ uy tín quốc tế" : "International certification prep",
      job_interview: isVi ? "Luyện CV và chuẩn bị phỏng vấn tuyển dụng" : "CV optimization & mock interview prep",
      promotion: isVi ? "Tăng hiệu suất làm việc & thăng tiến quản lý" : "Work performance & management promotion"
    }[priority];

    const prompt = isVi
      ? `🎯 **MỤC TIÊU LỘ TRÌNH HỌC TẬP & SỰ NGHIỆP**:
Tôi muốn xây dựng lộ trình chuẩn chỉnh để đạt mục tiêu: **"${goal}"**

📌 **THÔNG TIN NỀN TẢNG CÁ NHÂN**:
- **Trình độ hiện tại**: ${levelText}
- **Khung thời gian dự kiến**: ${durationText}
- **Thời gian cam kết**: ${weeklyHours} giờ / tuần
- **Ưu tiên tập trung**: ${priorityText}
${customNotes ? `- **Yêu cầu bổ sung**: ${customNotes}` : ''}

🚀 **YÊU CẦU AI THIẾT KẾ LỘ TRÌNH**:
1. Chia lộ trình thành các Cột Mốc Thời Gian (Milestones) rõ ràng theo tuần/tháng.
2. Mỗi cột mốc cần nêu cụ thể:
   - Kiến thức/Kỹ năng cốt lõi cần nắm vững
   - Sản phẩm/Dự án thực hành cụ thể để ghi vào CV
   - Nguồn tài liệu / Khóa học gợi ý (ưu tiên tài liệu miễn phí chất lượng)
3. Đưa ra 3 câu hỏi gợi ý để tôi kiểm tra lại mức độ hoàn thành sau từng giai đoạn.`
      : `🎯 **LEARNING & CAREER ROADMAP CREATION**:
I want a detailed step-by-step roadmap to achieve: **"${goal}"**

📌 **MY PERSONAL CONTEXT**:
- **Current Baseline**: ${levelText}
- **Target Duration**: ${durationText}
- **Weekly Time Commitment**: ${weeklyHours} hours/week
- **Primary Focus**: ${priorityText}
${customNotes ? `- **Additional Notes**: ${customNotes}` : ''}

🚀 **AI ROADMAP GENERATION REQUIREMENTS**:
1. Divide into clear, time-bound Milestones (by week/month).
2. For each milestone, provide:
   - Core knowledge/skills to master
   - Concrete hands-on project to build for my portfolio/CV
   - Recommended high-quality learning resources
3. Provide 3 check-in questions to evaluate my progress at the end of each stage.`;

    setGeneratedCustomPrompt(prompt);
    showToast(isVi ? "✨ Đã tạo prompt chuẩn AI thành công!" : "✨ AI prompt generated successfully!", "success");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast(isVi ? "Đã chép prompt vào khay nhớ tạm!" : "Copied prompt to clipboard!", "success");
  };

  const filteredTemplates = SAMPLE_TEMPLATES.filter(t => {
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery = !query || 
      t.title_vi.toLowerCase().includes(query) || 
      t.title_en.toLowerCase().includes(query) || 
      t.desc_vi.toLowerCase().includes(query) || 
      t.desc_en.toLowerCase().includes(query) ||
      t.tags.some(tag => tag.toLowerCase().includes(query));
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
            <Icons.Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
            {isVi ? "Kho Mẫu Prompt AI Chuyên Nghiệp" : "Professional AI Prompt Library"}
          </div>
          <h2 className="text-2xl md:text-3xl font-black">
            {isVi ? "Thư Viện Mẫu Câu Hỏi Chọn Sẵn & Trình Tạo Prompt AI" : "Curated AI Prompts & Interactive Builder"}
          </h2>
          <p className="text-indigo-100 text-sm max-w-3xl leading-relaxed">
            {isVi
              ? "Bộ sưu tập mẫu prompt chất lượng cao giúp bạn tạo lộ trình tự học, chuẩn bị phỏng vấn thử, đàm phán lương và ứng dụng AI tự động hóa công việc chỉ với 1 cú nhấp chuột."
              : "Comprehensive library of curated prompts for learning roadmaps, mock interviews, salary negotiation, and AI automation."}
          </p>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 dark:border-gray-700 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'templates'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Icons.BookOpen className="w-4 h-4 text-amber-400" />
            {isVi ? `📚 Kho Mẫu Prompt (${SAMPLE_TEMPLATES.length})` : `📚 Prompt Library (${SAMPLE_TEMPLATES.length})`}
          </button>
          <button
            onClick={() => setActiveTab('interactive')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'interactive'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Icons.Wand2 className="w-4 h-4 text-cyan-400" />
            {isVi ? "🛠️ Tự Tạo Prompt Theo Ý Muốn" : "🛠️ Interactive Builder"}
          </button>
        </div>
      </div>

      {/* Interactive Builder */}
      {activeTab === 'interactive' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Icons.Sliders className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              {isVi ? "Nhập Thông Tin Để Tạo Prompt Chuyên Nghiệp" : "Customize Your Roadmap Variables"}
            </h3>

            {/* Goal */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1">
                {isVi ? "🎯 Mục tiêu học tập / Ngành nghề mơ ước *" : "🎯 Learning Goal / Target Career *"}
              </label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder={isVi ? "Ví dụ: Lập trình viên AI, Quản lý Marketing, IELTS 7.0, Data Analyst..." : "e.g. AI Engineer, Marketing Manager, IELTS 7.0..."}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Baseline Level */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1">
                  {isVi ? "📊 Trình độ hiện tại" : "📊 Current Level"}
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                >
                  <option value="beginner">{isVi ? "Mới bắt đầu (Số 0)" : "Beginner (Scratch)"}</option>
                  <option value="intermediate">{isVi ? "Đã có nền tảng cơ bản" : "Intermediate"}</option>
                  <option value="advanced">{isVi ? "Đã đi làm / Nâng cao" : "Advanced"}</option>
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1">
                  {isVi ? "⏱️ Khung thời gian" : "⏱️ Target Duration"}
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                >
                  <option value="1m">{isVi ? "1 tháng (Cấp tốc)" : "1 Month (Fast)"}</option>
                  <option value="3m">{isVi ? "3 tháng" : "3 Months"}</option>
                  <option value="6m">{isVi ? "6 tháng (Khuyên dùng)" : "6 Months (Recommended)"}</option>
                  <option value="1y">{isVi ? "1 năm" : "1 Year"}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Weekly hours */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1">
                  {isVi ? "⏳ Số giờ học / tuần" : "⏳ Dedicated Hours/Week"}
                </label>
                <input
                  type="number"
                  min="2"
                  max="60"
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1">
                  {isVi ? "🔥 Ưu tiên tập trung" : "🔥 Main Priority"}
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                >
                  <option value="projects">{isVi ? "Làm dự án thực tế" : "Practical Projects"}</option>
                  <option value="certificates">{isVi ? "Luyện thi chứng chỉ" : "Certifications"}</option>
                  <option value="job_interview">{isVi ? "Chuẩn bị xin việc / Phỏng vấn" : "Job Interview Prep"}</option>
                  <option value="promotion">{isVi ? "Thăng tiến & Tăng lương" : "Career Advancement"}</option>
                </select>
              </div>
            </div>

            {/* Custom Notes */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1">
                {isVi ? "📝 Yêu cầu riêng (Tùy chọn)" : "📝 Additional Requirements (Optional)"}
              </label>
              <textarea
                rows={2}
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder={isVi ? "Ví dụ: Ưu tiên học các công cụ miễn phí, thích học qua video YouTube..." : "e.g. Prefer free tools, project-based learning..."}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
              />
            </div>

            <button
              onClick={handleBuildPrompt}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Icons.Sparkles className="w-4 h-4 text-yellow-300" />
              {isVi ? "Tạo Prompt Chuẩn AI Ngay" : "Generate Structured Prompt"}
            </button>
          </div>

          {/* Generated Result Output */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-gray-900 text-gray-100 p-6 rounded-2xl shadow-xl border border-gray-800 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Icons.Terminal className="w-4 h-4" />
                  {isVi ? "Kết Quả Prompt Tạo Ra" : "Generated AI Prompt"}
                </span>
                {generatedCustomPrompt && (
                  <button
                    onClick={() => copyToClipboard(generatedCustomPrompt)}
                    className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <Icons.Copy className="w-3.5 h-3.5" />
                    {isVi ? "Sao chép" : "Copy"}
                  </button>
                )}
              </div>

              {generatedCustomPrompt ? (
                <div className="max-h-[340px] overflow-y-auto pr-2 text-xs font-mono leading-relaxed whitespace-pre-wrap bg-gray-950 p-4 rounded-xl border border-gray-800 text-indigo-200">
                  {generatedCustomPrompt}
                </div>
              ) : (
                <div className="h-[280px] flex flex-col items-center justify-center text-center p-6 text-gray-500 border border-dashed border-gray-800 rounded-xl space-y-2">
                  <Icons.Wand2 className="w-10 h-10 text-gray-600 animate-pulse" />
                  <p className="text-xs font-medium">
                    {isVi
                      ? "Điền thông tin bên trái và bấm 'Tạo Prompt Chuẩn AI Ngay' để xem kết quả tại đây."
                      : "Fill in your details on the left and click 'Generate Structured Prompt' to preview."}
                  </p>
                </div>
              )}
            </div>

            {generatedCustomPrompt && (
              <button
                onClick={() => onSendPromptToChat(generatedCustomPrompt)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Icons.Send className="w-4 h-4" />
                {isVi ? "🚀 Gửi Sang Trợ Lý Chat Để Tạo Lộ Trình" : "🚀 Send to AI Chat & Build Roadmap"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Pre-built Templates Library */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          {/* Controls: Search and Categories */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Category filter */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label_vi: 'Tất cả', label_en: 'All' },
                { id: 'tech', label_vi: 'IT, AI & Data', label_en: 'IT & Data' },
                { id: 'business', label_vi: 'Marketing & PM', label_en: 'Business & PM' },
                { id: 'career', label_vi: 'Đại Học & Chọn Ngành', label_en: 'College & Majors' },
                { id: 'languages', label_vi: 'Ngoại Ngữ (IELTS/TOEIC)', label_en: 'Languages' },
                { id: 'interview', label_vi: 'Phỏng Vấn & Thử Việc', label_en: 'Interview & Probation' },
                { id: 'promotion', label_vi: 'Tăng Lương & LinkedIn', label_en: 'Salary & Personal Brand' },
                { id: 'reskill', label_vi: 'Chuyển Ngành', label_en: 'Career Pivot' },
                { id: 'ai_tools', label_vi: 'Tự Động Hóa AI', label_en: 'AI Automation' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {isVi ? cat.label_vi : cat.label_en}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative shrink-0 min-w-[220px]">
              <Icons.Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isVi ? "Tìm kiếm mẫu câu hỏi..." : "Search prompt templates..."}
                className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map(tmpl => (
              <motion.div
                key={tmpl.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between space-y-4 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                      {tmpl.category}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {tmpl.tags.map((t, idx) => (
                        <span key={idx} className="text-[10px] text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-base">
                    {isVi ? tmpl.title_vi : tmpl.title_en}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    {isVi ? tmpl.desc_vi : tmpl.desc_en}
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-mono text-gray-700 dark:text-gray-300 max-h-28 overflow-y-auto">
                    {isVi ? tmpl.prompt_vi : tmpl.prompt_en}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700/50">
                  <button
                    onClick={() => copyToClipboard(isVi ? tmpl.prompt_vi : tmpl.prompt_en)}
                    className="flex-1 py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Icons.Copy className="w-3.5 h-3.5" />
                    {isVi ? "Sao chép" : "Copy"}
                  </button>
                  <button
                    onClick={() => onSendPromptToChat(isVi ? tmpl.prompt_vi : tmpl.prompt_en)}
                    className="flex-1 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <Icons.Send className="w-3.5 h-3.5" />
                    {isVi ? "Dùng Mẫu Prompt Này" : "Use Prompt"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="p-8 text-center text-gray-500 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl">
              <Icons.Search className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm font-medium">
                {isVi ? "Không tìm thấy mẫu prompt nào phù hợp từ khóa." : "No prompt templates matched your search."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
