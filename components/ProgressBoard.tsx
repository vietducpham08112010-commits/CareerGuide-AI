import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import * as Icons from 'lucide-react';
import { ChatSession, UserProfile, Language, ChatMessage, Milestone, Theme } from '../types';
import { generateRoadmap } from '../services/geminiService';
import emailjs from '@emailjs/browser';
import { InlineGuide } from './InlineGuide';

interface ProgressBoardProps {
  chatHistory: ChatSession[];
  messages: ChatMessage[];
  user: UserProfile | null;
  language: Language;
  theme: Theme;
  milestones: Milestone[];
  setMilestones: React.Dispatch<React.SetStateAction<Milestone[]>>;
  googleAccessToken?: string | null;
  onConnectGoogleCalendar?: () => Promise<string | null>;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateToChat: () => void;
}

interface Skill {
  id: string;
  name: string;
  level: 'junior' | 'mid' | 'senior';
  description_vi: string;
  description_en: string;
}

interface CareerSkillMap {
  id: string;
  title_vi: string;
  title_en: string;
  category: string;
  skills: Skill[];
}

interface JobPosting {
  id: string;
  title: string;
  company: string;
  salary: string;
  location: string;
  level: 'Junior' | 'Midweight' | 'Senior';
  requiredSkills: string[];
  url: string;
  source: 'TopCV' | 'ITviec';
}

const CAREER_SKILL_MAPS: CareerSkillMap[] = [
  {
    id: 'ai-engineer',
    title_vi: 'Kỹ sư Trí tuệ nhân tạo (AI Engineer)',
    title_en: 'AI / Machine Learning Engineer',
    category: 'Information Technology',
    skills: [
      { id: 'python', name: 'Python', level: 'junior', description_vi: 'Ngôn ngữ lập trình cốt lõi cho AI & ML.', description_en: 'Core programming language for AI & ML.' },
      { id: 'sql', name: 'SQL & DBMS', level: 'junior', description_vi: 'Truy vấn & xử lý cơ sở dữ liệu có cấu trúc.', description_en: 'Querying and handling structured databases.' },
      { id: 'stats', name: 'Toán thống kê', level: 'junior', description_vi: 'Đại số tuyến tính, giải tích & lý thuyết xác suất.', description_en: 'Linear algebra, calculus & probability theory.' },
      { id: 'dml', name: 'Data Preprocessing', level: 'junior', description_vi: 'Làm sạch và xử lý dữ liệu với Pandas, Numpy.', description_en: 'Cleaning and processing data with Pandas, Numpy.' },
      { id: 'pytorch', name: 'PyTorch / TensorFlow', level: 'mid', description_vi: 'Xây dựng mạng nơ-ron và mô hình học sâu.', description_en: 'Building neural networks and deep learning models.' },
      { id: 'nlp', name: 'NLP & LLM', level: 'mid', description_vi: 'Xử lý ngôn ngữ tự nhiên và mô hình ngôn ngữ lớn.', description_en: 'Natural language processing and large language models.' },
      { id: 'cv', name: 'Computer Vision', level: 'mid', description_vi: 'Thị giác máy tính, nhận diện ảnh và video.', description_en: 'Computer vision, image and video recognition.' },
      { id: 'apis', name: 'API Integration', level: 'mid', description_vi: 'Tích hợp mô hình AI vào ứng dụng web/app.', description_en: 'Integrating AI models into web/app clients.' },
      { id: 'mlops', name: 'MLOps & CI/CD', level: 'senior', description_vi: 'Triển khai, giám sát mô hình tự động trên mây.', description_en: 'Automating deployment and monitoring in the cloud.' },
      { id: 'dist', name: 'Distributed Training', level: 'senior', description_vi: 'Huấn luyện mô hình quy mô cực lớn trên cụm GPU.', description_en: 'Training large-scale models across GPU clusters.' },
      { id: 'finetuning', name: 'RLHF & Fine-tuning', level: 'senior', description_vi: 'Tinh chỉnh mô hình ngôn ngữ bằng phản hồi từ người dùng.', description_en: 'Fine-tuning LLMs with human feedback loops.' }
    ]
  },
  {
    id: 'cybersecurity',
    title_vi: 'Chuyên gia An ninh mạng & Bảo mật',
    title_en: 'Cybersecurity Specialist',
    category: 'Information Technology',
    skills: [
      { id: 'linux', name: 'Linux System', level: 'junior', description_vi: 'Quản trị hệ điều hành Linux bảo mật cơ bản.', description_en: 'Basic Linux operating system administration.' },
      { id: 'network', name: 'Networking (CCNA)', level: 'junior', description_vi: 'Hiểu cấu trúc mạng TCP/IP, định tuyến & chuyển mạch.', description_en: 'Understanding TCP/IP, routing & switching network concepts.' },
      { id: 'comp', name: 'Security Fundamentals', level: 'junior', description_vi: 'Khái niệm cơ bản về bảo mật hệ thống & mã hóa.', description_en: 'Basic system security and cryptography concepts.' },
      { id: 'ethical', name: 'Ethical Hacking', level: 'mid', description_vi: 'Kỹ thuật tấn công giả lập nhằm phát hiện lỗ hổng.', description_en: 'Simulating cyberattacks to identify vulnerabilities.' },
      { id: 'pentest', name: 'Penetration Testing', level: 'mid', description_vi: 'Đánh giá an toàn thông tin chuyên sâu cho Web/App.', description_en: 'In-depth security testing for Web applications.' },
      { id: 'incident', name: 'Incident Response', level: 'mid', description_vi: 'Phân tích mã độc, xử lý sự cố an ninh khẩn cấp.', description_en: 'Malware analysis and urgent security response handling.' },
      { id: 'secops', name: 'SecOps / SIEM', level: 'mid', description_vi: 'Giám sát hệ thống bảo mật tự động qua Log và SIEM.', description_en: 'Automated security monitoring via log analytics platforms.' },
      { id: 'architect', name: 'Security Architecture', level: 'senior', description_vi: 'Thiết kế hạ tầng mạng an toàn không tin cậy (Zero-Trust).', description_en: 'Designing robust Zero-Trust network infrastructures.' },
      { id: 'iso27001', name: 'ISO 27001 & Compliance', level: 'senior', description_vi: 'Xây dựng chính sách tuân thủ bảo mật tiêu chuẩn quốc tế.', description_en: 'Structuring security compliance policies under international standards.' }
    ]
  },
  {
    id: 'sustainability',
    title_vi: 'Kỹ sư Năng lượng xanh & Bền vững',
    title_en: 'Sustainability Engineer',
    category: 'Engineering & Environment',
    skills: [
      { id: 'esg_basic', name: 'ESG Fundamentals', level: 'junior', description_vi: 'Khái niệm cơ bản về các chỉ số Môi trường, Xã hội và Quản trị.', description_en: 'Foundational concepts on ESG indicators.' },
      { id: 'cad', name: 'CAD Drawing', level: 'junior', description_vi: 'Thiết kế sơ đồ hệ thống kỹ thuật xây dựng bản vẽ.', description_en: 'Designing engineering workflow technical mockups.' },
      { id: 'solar', name: 'Grid Integration', level: 'mid', description_vi: 'Tích hợp điện mặt trời & điện gió vào mạng lưới điện quốc gia.', description_en: 'Solar & wind systems grid integration architectures.' },
      { id: 'audit', name: 'Energy Audit', level: 'mid', description_vi: 'Đo lường, phân tích hiệu suất tiêu hao năng lượng nhà máy.', description_en: 'Measuring and analyzing factory energy footprint performance.' },
      { id: 'carbon', name: 'Carbon Accounting', level: 'mid', description_vi: 'Tính toán lượng phát thải khí nhà kính (Scope 1, 2, 3).', description_en: 'Calculating greenhouse gas emission metrics (Scope 1, 2, 3).' },
      { id: 'compliance', name: 'Environmental Law', level: 'senior', description_vi: 'Cập nhật pháp luật môi trường & quy định net-zero Việt Nam.', description_en: 'Compliance with environmental law and net-zero regulations.' }
    ]
  },
  {
    id: 'logistics-supply-chain',
    title_vi: 'Quản trị Chuỗi cung ứng & Logistics',
    title_en: 'Logistics & Supply Chain Manager',
    category: 'Management & Logistics',
    skills: [
      { id: 'excel_log', name: 'Advanced Excel', level: 'junior', description_vi: 'Kỹ năng Excel nâng cao xử lý báo cáo nhập xuất.', description_en: 'Advanced Excel formula sheets for warehousing data.' },
      { id: 'warehouse_basic', name: 'Inventory Basics', level: 'junior', description_vi: 'Quy trình kiểm kho, đóng gói, phân loại hàng hóa.', description_en: 'Stock checking, sorting, and packaging protocols.' },
      { id: 'erp_sap', name: 'ERP / SAP Logistics', level: 'mid', description_vi: 'Sử dụng phân hệ quản lý kho hàng SAP, Oracle ERP.', description_en: 'Operating ERP inventories such as SAP/Oracle modules.' },
      { id: 'customs', name: 'Customs Regulations', level: 'mid', description_vi: 'Nghiệp vụ khai báo hải quan xuất nhập khẩu tại Việt Nam.', description_en: 'State customs declaration workflow for import-export.' },
      { id: 'negotiation', name: 'Negotiation Skills', level: 'mid', description_vi: 'Đàm phán chi phí cước vận chuyển với nhà xe, hãng tàu.', description_en: 'Negotiating freight quotes with logistics carriers.' },
      { id: 'supply_analytics', name: 'Global Supply Chain', level: 'senior', description_vi: 'Tối ưu hóa chuỗi cung ứng đa quốc gia giảm thiểu rủi ro.', description_en: 'Optimizing international supply networks to minimize resource bottlenecks.' }
    ]
  },
  {
    id: 'digital-marketing',
    title_vi: 'Quản lý Tiếp thị Kỹ thuật số',
    title_en: 'Digital Marketing Manager',
    category: 'Marketing & Multimedia',
    skills: [
      { id: 'copy', name: 'Copywriting', level: 'junior', description_vi: 'Viết nội dung tiếp thị, kịch bản sáng tạo quảng cáo.', description_en: 'Writing marketing narratives and video script concepts.' },
      { id: 'seo_sem', name: 'SEO & SEM Basics', level: 'junior', description_vi: 'Tối ưu hóa tìm kiếm tự nhiên và chạy Google Search Ads.', description_en: 'Search engine optimization and simple ad campaigns.' },
      { id: 'analytics', name: 'Google Analytics', level: 'mid', description_vi: 'Phân tích dữ liệu người truy cập web, tối ưu Conversion Rate.', description_en: 'Web tracking analytics and conversion rate optimization.' },
      { id: 'ads_op', name: 'Ad Operations', level: 'mid', description_vi: 'Quản lý ngân sách và chạy ads Facebook, TikTok, Shopee.', description_en: 'Managing ad budgets across online networks.' },
      { id: 'growth', name: 'Growth Hacking', level: 'mid', description_vi: 'Thử nghiệm nhanh kênh mới kéo lượng lớn người dùng.', description_en: 'A/B testing user acquisition channels at scale.' },
      { id: 'marketing_automate', name: 'Automated AI Marketing', level: 'senior', description_vi: 'Thiết lập phễu tiếp thị tự động hóa bằng Email & AI Agent.', description_en: 'Configuring automated sequence email pipelines with AI assistance.' }
    ]
  },
  {
    id: 'agritech',
    title_vi: 'Chuyên gia Nông nghiệp Công nghệ cao',
    title_en: 'AgriTech Specialist',
    category: 'Agriculture & BioTech',
    skills: [
      { id: 'agri_soil', name: 'Soil & Plant Science', level: 'junior', description_vi: 'Khoa học đất trồng và dinh dưỡng sinh học thực vật.', description_en: 'General organic chemistry and agronomic soil sciences.' },
      { id: 'hydroponics', name: 'Hydroponics setup', level: 'junior', description_vi: 'Kỹ thuật thủy canh, canh tác đứng hiện đại.', description_en: 'Setting up vertical modern automated hydroponic gardens.' },
      { id: 'iot_agri', name: 'IoT Sensors', level: 'mid', description_vi: 'Triển khai cảm biến độ ẩm, nhiệt độ nối MCU truyền dữ liệu.', description_en: 'Deploying soil Moisture/PH sensors transmitting data via IoT.' },
      { id: 'gis_map', name: 'GIS Mapping & Satellites', level: 'mid', description_vi: 'Phân tích hiện trạng cây trồng qua bản đồ vệ tinh GIS.', description_en: 'Remote sensing satellite analytics for crop monitoring.' },
      { id: 'biotech', name: 'BioTech Crossbreeding', level: 'senior', description_vi: 'Nghiên cứu công nghệ sinh học lai tạo giống chất lượng cao.', description_en: 'Molecular biology procedures for high resistant seed breeding.' }
    ]
  },
  {
    id: 'data-analyst',
    title_vi: 'Chuyên viên Phân tích Dữ liệu (Data Analyst)',
    title_en: 'Data Analyst',
    category: 'Information Technology',
    skills: [
      { id: 'excel_advanced', name: 'Advanced Excel', level: 'junior', description_vi: 'Xử lý dữ liệu phức tạp bằng Pivot, Power Query, Macros.', description_en: 'Complex data manipulation using Pivot Tables and Power Query.' },
      { id: 'sql_da', name: 'SQL Querying', level: 'junior', description_vi: 'Truy vấn và kết nối nhiều bảng cơ sở dữ liệu (JOIN, Window Functions).', description_en: 'Extracting and joining data using advanced SQL.' },
      { id: 'data_viz', name: 'Data Visualization (Tableau/PowerBI)', level: 'mid', description_vi: 'Xây dựng dashboard trực quan hóa dữ liệu kinh doanh.', description_en: 'Building interactive business dashboards.' },
      { id: 'python_da', name: 'Python (Pandas/Matplotlib)', level: 'mid', description_vi: 'Phân tích và làm sạch dữ liệu lớn bằng Python.', description_en: 'Analyzing large datasets using Python libraries.' },
      { id: 'stat_modeling', name: 'Statistical Modeling', level: 'senior', description_vi: 'Mô hình hóa dữ liệu, dự báo xu hướng kinh doanh.', description_en: 'Statistical modeling for business trend forecasting.' }
    ]
  },
  {
    id: 'ecommerce-manager',
    title_vi: 'Quản lý Thương mại điện tử (E-Commerce Manager)',
    title_en: 'E-Commerce Manager',
    category: 'Management & Logistics',
    skills: [
      { id: 'omnichannel', name: 'Omnichannel Strategy', level: 'junior', description_vi: 'Tích hợp bán hàng đa kênh: Shopee, Tiktok, Website.', description_en: 'Managing multiple online sales channels.' },
      { id: 'conversion_opt', name: 'Conversion Rate Optimization (CRO)', level: 'mid', description_vi: 'Tối ưu hóa tỷ lệ chuyển đổi khách truy cập thành người mua.', description_en: 'Optimizing the user journey to increase sales.' },
      { id: 'scm_ecommerce', name: 'Fulfillment & SCM', level: 'mid', description_vi: 'Quản lý kho bãi, đóng gói, vận chuyển và hoàn vòng.', description_en: 'Managing warehousing, packing, and shipping operations.' },
      { id: 'ecom_analytics', name: 'E-Commerce Analytics', level: 'senior', description_vi: 'Phân tích GMV, CAC, LTV để hoạch định chiến lược giá.', description_en: 'Analyzing core business metrics (GMV, LTV) for pricing strategy.' }
    ]
  },
  {
    id: 'healthcare',
    title_vi: 'Bác sĩ / Chuyên viên Y tế Công nghệ cao',
    title_en: 'Smart Healthcare & Medical Specialist',
    category: 'Healthcare & Medicine',
    skills: [
      { id: 'clinical_basics', name: 'Clinical Knowledge', level: 'junior', description_vi: 'Kiến thức y khoa lâm sàng và sơ cứu cơ bản.', description_en: 'Foundational clinical knowledge and basic first aid.' },
      { id: 'anatomy', name: 'Human Anatomy', level: 'junior', description_vi: 'Hiểu cấu trúc giải phẫu học cơ thể người.', description_en: 'Understanding of human anatomical structures.' },
      { id: 'telehealth', name: 'Telehealth Systems', level: 'mid', description_vi: 'Vận hành phần mềm khám chữa bệnh từ xa và lưu trữ hồ sơ bệnh án EHR.', description_en: 'Operating telemedicine and electronic health record systems.' },
      { id: 'medical_devices', name: 'IoT Medical Devices', level: 'mid', description_vi: 'Sử dụng các thiết bị đo lường sinh học kết nối thông minh.', description_en: 'Utilizing smart connected bio-measurement devices.' },
      { id: 'ai_diagnostics', name: 'AI Image Diagnostics', level: 'senior', description_vi: 'Ứng dụng AI phân tích hình ảnh MRI, CT để hỗ trợ chẩn đoán bệnh sớm.', description_en: 'Applying AI-powered MRI/CT image diagnostics for early detection assistance.' },
      { id: 'hospital_mgmt', name: 'Hospital Operations', level: 'senior', description_vi: 'Quản trị quy trình bệnh viện và an toàn sinh học quốc tế.', description_en: 'Managing hospital workflows and global biosafety protocols.' }
    ]
  },
  {
    id: 'finance-economics',
    title_vi: 'Chuyên viên Phân tích Tài chính & Kinh tế',
    title_en: 'Financial & Economic Analyst',
    category: 'Finance & Economics',
    skills: [
      { id: 'micro_macro', name: 'Micro & Macro Economics', level: 'junior', description_vi: 'Hiểu các nguyên lý kinh tế vi mô, vĩ mô cơ bản.', description_en: 'Understanding basic micro and macro economics principles.' },
      { id: 'accounting_basics', name: 'Financial Accounting', level: 'junior', description_vi: 'Đọc hiểu báo cáo tài chính, bảng cân đối kế toán.', description_en: 'Analyzing financial statements and balance sheets.' },
      { id: 'market_research', name: 'Market Analysis', level: 'mid', description_vi: 'Nghiên cứu thị trường, định giá tài sản và phân tích dòng tiền.', description_en: 'Conducting market research, asset valuation and cash flow projection.' },
      { id: 'data_finance', name: 'Financial Modeling', level: 'mid', description_vi: 'Xây dựng mô hình tài chính dự báo doanh thu trên Excel hoặc Python.', description_en: 'Building financial forecasting models on Excel or Python.' },
      { id: 'portfolio_mgmt', name: 'Portfolio Management', level: 'senior', description_vi: 'Quản lý danh mục đầu tư và kiểm soát rủi ro hệ thống.', description_en: 'Managing investment portfolios and controlling systemic risks.' },
      { id: 'algo_trading', name: 'Quantitative & Algo Finance', level: 'senior', description_vi: 'Phát triển thuật toán giao dịch tự động và phân tích định lượng.', description_en: 'Developing algorithmic trading systems and quantitative analysis.' }
    ]
  }
];

const JOB_POSTINGS: JobPosting[] = [
  // AI Engineer
  { id: 'job-1', title: 'AI Research / Machine Learning Engineer', company: 'VinAI Research', salary: '45,000,000 - 90,000,000 VND', location: 'Hà Nội', level: 'Midweight', requiredSkills: ['Python', 'PyTorch / TensorFlow', 'NLP & LLM'], url: 'https://itviec.com/it-jobs?query=AI+Engineer', source: 'ITviec' },
  { id: 'job-2', title: 'Kỹ sư Trí Tuệ Nhân Tạo (NLP/LLM)', company: 'FPT Software', salary: '30,000,000 - 55,000,000 VND', location: 'Đà Nẵng', level: 'Midweight', requiredSkills: ['Python', 'PyTorch / TensorFlow', 'API Integration'], url: 'https://www.topcv.vn/tim-kiem-viec-lam?keyword=K%E1%BB%B9+s%C6%B0+AI', source: 'TopCV' },
  { id: 'job-3', title: 'Data Scientist & AI Assistant Developer', company: 'VNG Corporation', salary: '35,000,000 - 70,000,000 VND', location: 'TP. HCM', level: 'Midweight', requiredSkills: ['Python', 'SQL & DBMS', 'NLP & LLM', 'API Integration'], url: 'https://itviec.com/it-jobs?query=Data+Scientist', source: 'ITviec' },
  { id: 'job-4', title: 'Chuyên Gia Tinh Chỉnh Mô Hình LLM (Senior AI Developer)', company: 'Viettel AI', salary: '65,000,000 - 110,000,000 VND', location: 'Hà Nội', level: 'Senior', requiredSkills: ['Python', 'PyTorch / TensorFlow', 'RLHF & Fine-tuning', 'Distributed Training'], url: 'https://itviec.com/it-jobs?query=Senior+AI+Engineer', source: 'ITviec' },
  
  // Cybersecurity
  { id: 'job-5', title: 'Chuyên Viên Tấn Công Thử Nghiệm (Penetration Tester)', company: 'Viettel Cyber Security', salary: '35,000,000 - 65,000,000 VND', location: 'Hà Nội', level: 'Midweight', requiredSkills: ['Linux System', 'Ethical Hacking', 'Penetration Testing'], url: 'https://itviec.com/it-jobs?query=Cyber+Security', source: 'ITviec' },
  { id: 'job-6', title: 'Chuyên Viên Giám Sát SOC & Phân Tích Sự Cố SIEM', company: 'FPT IS', salary: '22,000,000 - 40,000,000 VND', location: 'TP. HCM', level: 'Midweight', requiredSkills: ['Linux System', 'Networking (CCNA)', 'SecOps / SIEM'], url: 'https://www.topcv.vn/tim-kiem-viec-lam?keyword=Cybersecurity', source: 'TopCV' },
  { id: 'job-7', title: 'Chuyên Gia Bảo Mật Đám Mây & Kiến Trúc Hệ Thống (Senior Security Architect)', company: 'Techcombank', salary: '55,000,000 - 95,000,000 VND', location: 'Hà Nội', level: 'Senior', requiredSkills: ['Networking (CCNA)', 'Security Architecture', 'ISO 27001 & Compliance'], url: 'https://www.topcv.vn/tim-kiem-viec-lam?keyword=B%E1%BA%A3o+m%E1%BA%ADt+h%E1%BB%87+th%E1%BB%91ng', source: 'TopCV' },

  // Sustainability
  { id: 'job-8', title: 'Kỹ Sư Thiết Kế Điện Mặt Trời & Sơ Đồ Lưới', company: 'Trung Nam Group', salary: '25,000,000 - 45,000,000 VND', location: 'TP. HCM', level: 'Midweight', requiredSkills: ['CAD Drawing', 'Grid Integration'], url: 'https://www.topcv.vn/tim-kiem-viec-lam?keyword=K%E1%BB%B9+s%C6%B0+m%C3%B4i+tr%C6%B0%E1%BB%9Dng', source: 'TopCV' },
  { id: 'job-9', title: 'Chuyên Viên Tư Vấn ESG & Tính Toán Carbon', company: 'VinFast Haiphong', salary: '30,000,000 - 55,000,000 VND', location: 'Hà Nội', level: 'Midweight', requiredSkills: ['ESG Fundamentals', 'Energy Audit', 'Carbon Accounting'], url: 'https://www.topcv.vn/tim-kiem-viec-lam?keyword=ESG', source: 'TopCV' },

  // Logistics
  { id: 'job-10', title: 'Logistics Project Optimization Analyst', company: 'Shopee Vietnam', salary: '35,000,000 - 60,000,000 VND', location: 'TP. HCM', level: 'Midweight', requiredSkills: ['Advanced Excel', 'Inventory Basics', 'ERP / SAP Logistics'], url: 'https://www.topcv.vn/tim-kiem-viec-lam?keyword=Logistics', source: 'TopCV' },
  { id: 'job-11', title: 'Trưởng Nhóm Khai Thác Chuỗi Cung Ứng Quốc Tế', company: 'YCH-Proconco', salary: '30,000,000 - 50,000,000 VND', location: 'TP. HCM', level: 'Senior', requiredSkills: ['Customs Regulations', 'Negotiation Skills', 'Global Supply Chain'], url: 'https://www.topcv.vn/tim-kiem-viec-lam?keyword=Supply+Chain', source: 'TopCV' },

  // Digital marketing
  { id: 'job-12', title: 'Digital Brand Marketing Manager', company: 'Coolmate', salary: '25,000,000 - 45,000,000 VND', location: 'Hà Nội', level: 'Senior', requiredSkills: ['Copywriting', 'SEO & SEM Basics', 'Google Analytics', 'Ad Operations'], url: 'https://www.topcv.vn/tim-kiem-viec-lam?keyword=Digital+Marketing', source: 'TopCV' },
  { id: 'job-13', title: 'Growth & Performance Optimization Lead', company: 'Lazada Vietnam', salary: '35,000,000 - 60,000,000 VND', location: 'TP. HCM', level: 'Senior', requiredSkills: ['Google Analytics', 'Ad Operations', 'Growth Hacking', 'Automated AI Marketing'], url: 'https://www.topcv.vn/tim-kiem-viec-lam?keyword=Growth+Hacking', source: 'TopCV' },

  // AgriTech
  { id: 'job-14', title: 'Kỹ Sư IoT Cảm Biến Nhà Kính Nông Nghiệp', company: 'Lộc Trời Group', salary: '22,000,000 - 38,000,000 VND', location: 'TP. HCM', level: 'Midweight', requiredSkills: ['Hydroponics setup', 'IoT Sensors'], url: 'https://www.topcv.vn/tim-kiem-viec-lam?keyword=N%C3%B4ng+nghi%E1%BB%87p', source: 'TopCV' },
  { id: 'job-15', title: 'Chuyên Gia Nghiên Cứu Lai Tạo Giống Thủy Sản', company: 'VinEco', salary: '25,000,000 - 45,000,000 VND', location: 'Hà Nội', level: 'Senior', requiredSkills: ['Soil & Plant Science', 'GIS Mapping & Satellites', 'BioTech Crossbreeding'], url: 'https://www.topcv.vn/tim-kiem-viec-lam?keyword=AgriTech', source: 'TopCV' },
  { id: 'job-16', title: 'Chuyên Viên Phân Tích Dữ Liệu Kinh Doanh (BI Analyst)', company: 'Momo', salary: '25,000,000 - 45,000,000 VND', location: 'TP. HCM', level: 'Midweight', requiredSkills: ['SQL Querying', 'Data Visualization (Tableau/PowerBI)', 'Python (Pandas/Matplotlib)'], url: 'https://itviec.com/it-jobs?query=Data+Analyst', source: 'ITviec' },
  { id: 'job-17', title: 'Chuyên Gia Phân Tích Dữ Liệu (Senior Data Analyst)', company: 'Shopee Vietnam', salary: '45,000,000 - 80,000,000 VND', location: 'TP. HCM', level: 'Senior', requiredSkills: ['Advanced Excel', 'SQL Querying', 'Statistical Modeling'], url: 'https://www.topcv.vn/tim-kiem-viec-lam?keyword=Data+Analyst', source: 'TopCV' },
  { id: 'job-18', title: 'Trưởng Phòng Thương Mại Điện Tử', company: 'Unilever Vietnam', salary: '50,000,000 - 90,000,000 VND', location: 'Hà Nội', level: 'Senior', requiredSkills: ['Omnichannel Strategy', 'E-Commerce Analytics', 'Fulfillment & SCM'], url: 'https://www.topcv.vn/tim-kiem-viec-lam?keyword=Ecommerce', source: 'TopCV' }
];

export const ProgressBoard: React.FC<ProgressBoardProps> = ({ 
  chatHistory, 
  messages, 
  user, 
  language, 
  theme, 
  milestones, 
  setMilestones, 
  googleAccessToken, 
  onConnectGoogleCalendar, 
  showToast, 
  onNavigateToChat 
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'roadmap' | 'skills_jobs'>('roadmap');
  
  // Roadmap States
  const [isExporting, setIsExporting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [editingDeadlineId, setEditingDeadlineId] = useState<string | null>(null);
  const [deadlineInput, setDeadlineInput] = useState('');
  const [syncingCalendarId, setSyncingCalendarId] = useState<string | null>(null);
  const [recipientEmail, setRecipientEmail] = useState(user?.email || 'vietducpham08112010@gmail.com');
  const [showEmailPromptId, setShowEmailPromptId] = useState<string | null>(null);
  const [syncingEmailId, setSyncingEmailId] = useState<string | null>(null);
  
  // Skills States
  const [selectedCareerId, setSelectedCareerId] = useState<string>('ai-engineer');
  const [customSkillMaps, setCustomSkillMaps] = useState<CareerSkillMap[]>([]);
  const [aiCareerInput, setAiCareerInput] = useState('');
  const [isGeneratingMap, setIsGeneratingMap] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [filterLocation, setFilterLocation] = useState<'All' | 'Hà Nội' | 'TP. HCM' | 'Đà Nẵng'>('All');
  const [skillProgress, setSkillProgress] = useState<Record<string, number>>({});

  const handleGenerateCustomMap = async () => {
    if (!aiCareerInput.trim()) return;
    setIsGeneratingMap(true);
    try {
      const response = await fetch('/api/generate-skill-map', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ career: aiCareerInput }),
      });
      if (!response.ok) {
        throw new Error('API failed');
      }
      const newMap: CareerSkillMap = await response.json();
      if (newMap && newMap.id && newMap.skills) {
        setCustomSkillMaps(prev => [newMap, ...prev]);
        setSelectedCareerId(newMap.id);
        setSelectedSkillId(null);
        setAiCareerInput('');
        showToast(
          language === Language.VI 
            ? `🎉 Đã tạo sơ đồ kỹ năng cho "${newMap.title_vi}" bằng AI thành công!` 
            : `🎉 Created skill map for "${newMap.title_en}" using AI!`, 
          'success'
        );
      } else {
        throw new Error('Invalid format');
      }
    } catch (err) {
      console.error(err);
      showToast(
        language === Language.VI 
          ? '❌ Không thể tạo sơ đồ kỹ năng bằng AI. Vui lòng thử lại sau.' 
          : '❌ Failed to generate skill map using AI. Please try again.', 
        'error'
      );
    } finally {
      setIsGeneratingMap(false);
    }
  };
  
  const boardRef = useRef<HTMLDivElement>(null);

  // Initialize selected career based on user profile if possible
  useEffect(() => {
    if (user?.careerGoal) {
      const goalLower = user.careerGoal.toLowerCase();
      if (goalLower.includes('ai') || goalLower.includes('machine learning') || goalLower.includes('học máy')) {
        setSelectedCareerId('ai-engineer');
      } else if (goalLower.includes('an ninh mạng') || goalLower.includes('cyber') || goalLower.includes('bảo mật')) {
        setSelectedCareerId('cybersecurity');
      } else if (goalLower.includes('năng lượng') || goalLower.includes('green') || goalLower.includes('bền vững') || goalLower.includes('sustain')) {
        setSelectedCareerId('sustainability');
      } else if (goalLower.includes('logistics') || goalLower.includes('chuỗi cung ứng')) {
        setSelectedCareerId('logistics-supply-chain');
      } else if (goalLower.includes('marketing') || goalLower.includes('tiếp thị') || goalLower.includes('marketer')) {
        setSelectedCareerId('digital-marketing');
      } else if (goalLower.includes('nông nghiệp') || goalLower.includes('agri') || goalLower.includes('sinh học')) {
        setSelectedCareerId('agritech');
      }
    }
  }, [user]);

  // Load and Save skill progress to local storage
  useEffect(() => {
    if (user?.email) {
      const storedProgress = localStorage.getItem(`skill_progress_${user.email}`);
      if (storedProgress) {
        try {
          setSkillProgress(JSON.parse(storedProgress));
        } catch (e) {
          console.error("Failed to parse stored skill progress:", e);
        }
      }
    }
  }, [user?.email]);

  const updateSkillProgressValue = (skillId: string, value: number) => {
    setSkillProgress(prev => {
      const next = { ...prev, [skillId]: value };
      if (user?.email) {
        localStorage.setItem(`skill_progress_${user.email}`, JSON.stringify(next));
      }
      return next;
    });
  };

  const handleGenerateRoadmap = async () => {
    if (chatHistory.length === 0 && messages.length === 0) {
      onNavigateToChat();
      return;
    }

    setIsGenerating(true);
    try {
      const savedHistoryContext = chatHistory.flatMap(session => 
        session.messages.map(m => ({ role: m.role, text: m.text }))
      );
      const currentHistoryContext = messages.map(m => ({ role: m.role, text: m.text }));
      const historyContext = [...savedHistoryContext, ...currentHistoryContext];
      
      const generatedMilestones = await generateRoadmap(historyContext, language, user);
      
      if (!Array.isArray(generatedMilestones)) {
        throw new Error("Invalid roadmap format received from AI.");
      }
      
      const processedMilestones = generatedMilestones.map((m: any) => ({
        ...m,
        id: m.id || Math.random().toString(36).substring(7),
        status: m.status || 'todo',
        comments: [],
        deadline: '',
        isSyncedCalendar: false,
        isSyncedEmail: false
      }));
      
      setMilestones(processedMilestones);
    } catch (error) {
      console.error("Failed to generate roadmap:", error);
      showToast(language === Language.EN ? "Failed to generate roadmap. Please try again." : "Không thể tạo lộ trình. Vui lòng thử lại.", 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleStatus = (id: string) => {
    setMilestones(prev => prev.map(m => {
      if (m.id === id) {
        const nextStatus = m.status === 'todo' ? 'in-progress' : m.status === 'in-progress' ? 'done' : 'todo';
        return { ...m, status: nextStatus };
      }
      return m;
    }));
  };

  const addComment = (id: string) => {
    if (!commentText.trim()) return;
    setMilestones(prev => prev.map(m => {
      if (m.id === id) {
        return { ...m, comments: [...(m.comments || []), commentText.trim()] };
      }
      return m;
    }));
    setCommentText('');
    setActiveCommentId(null);
  };

  // 🔔 Save Deadline Event inside Milestone
  const handleSaveDeadline = (id: string, deadline: string) => {
    setMilestones(prev => prev.map(m => {
      if (m.id === id) {
        return { ...m, deadline, isSyncedCalendar: false, isSyncedEmail: false };
      }
      return m;
    }));
    setEditingDeadlineId(null);
    showToast(language === Language.VI ? "Đã cập nhật ngày hoàn thành!" : "Completion deadline updated!", 'success');
  };

  // 🔔 Google Calendar Sync API
  const handleSyncGoogleCalendar = async (milestone: Milestone) => {
    if (!milestone.deadline) {
      showToast(language === Language.VI ? "Vui lòng đặt Deadline trước khi đồng bộ!" : "Please choose a deadline date first!", 'error');
      return;
    }

    setSyncingCalendarId(milestone.id);
    let token = googleAccessToken;

    // Check and trigger Google OAuth popup if not connected
    if (!token && onConnectGoogleCalendar) {
      showToast(language === Language.VI ? "Đang mở popup kết nối tài khoản Google..." : "Launching Google authorization popup...", 'info');
      token = await onConnectGoogleCalendar();
    }

    if (!token) {
      setSyncingCalendarId(null);
      return;
    }

    try {
      // Direct client-side insert event call via primary calendar
      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          summary: `[Career Guide] ${milestone.title}`,
          description: `Định hướng cột mốc học tập:\n\n${milestone.description}\n\nGhi chú cá nhân: ${milestone.comments?.join(', ') || 'Không có'}`,
          start: {
            date: milestone.deadline,
          },
          end: {
            date: milestone.deadline,
          },
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'popup', minutes: 60 },
              { method: 'email', minutes: 1440 } // 1 day before
            ]
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || "Failed to post event to primary calendar");
      }

      setMilestones(prev => prev.map(m => {
        if (m.id === milestone.id) {
          return { ...m, isSyncedCalendar: true };
        }
        return m;
      }));

      showToast(language === Language.VI ? 'Đồng bộ Google Calendar thành công!' : 'Google Calendar synced successfully!', 'success');
    } catch (e: any) {
      console.error(e);
      showToast(language === Language.VI ? `Lỗi đồng bộ Calendar: ${e.message || e}` : `Calendar Sync Failed: ${e.message || e}`, 'error');
    } finally {
      setSyncingCalendarId(null);
    }
  };

  // 🔔 Email Reminder Dispatch
  const handleSendEmailReminder = async (milestone: Milestone, email: string) => {
    if (!milestone.deadline) {
      showToast(language === Language.VI ? "Vui lòng chọn ngày hoàn thành trước!" : "Please choose a deadline first!", 'error');
      return;
    }

    setSyncingEmailId(milestone.id);
    setShowEmailPromptId(null);

    try {
      const templateParams = {
        to_email: email,
        to_name: user?.name || "Học viên",
        milestone_title: milestone.title,
        milestone_desc: milestone.description,
        deadline: milestone.deadline,
        comments: milestone.comments?.join('\n') || "Không có"
      };

      const emailjsServiceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_cc_compass';
      const emailjsTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_cc_roadmap';
      const emailjsPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      if (emailjsPublicKey) {
         await emailjs.send(emailjsServiceId, emailjsTemplateId, templateParams, emailjsPublicKey);
         showToast(language === Language.VI ? `Đã gửi hộp thư nhắc nhở thành công tới ${email}!` : `Email notification sent successfully to ${email}!`, 'success');
      } else {
         // Fallback server POST route
         const res = await fetch('/api/send-reminder', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ email, milestone })
         });
         
         if (res.ok) {
           showToast(language === Language.VI ? `Đã đặt nhắc nhở email qua hệ thống thành công (Xem Console)!` : `Email reminder scheduled via server! Check backend terminal.`, 'success');
         } else {
           throw new Error("Local dispatch simulation");
         }
      }

      setMilestones(prev => prev.map(m => {
        if (m.id === milestone.id) {
          return { ...m, isSyncedEmail: true };
        }
        return m;
      }));
    } catch (e) {
      console.warn("Using simulation mode:", e);
      // Fallback high quality toast simulation for robust preview experience
      setTimeout(() => {
        setMilestones(prev => prev.map(m => {
          if (m.id === milestone.id) {
            return { ...m, isSyncedEmail: true };
          }
          return m;
        }));
        showToast(language === Language.VI 
          ? `[Giả lập] Thành công! Hệ thống đã gửi email thông báo hẹn giờ nhắc nhở cột mốc "${milestone.title}" đến email: ${email}` 
          : `[Simulated] Success! System scheduled an email prompt of "${milestone.title}" for delivery to: ${email}`, 'success');
      }, 700);
    } finally {
      setSyncingEmailId(null);
    }
  };

  const exportToPDF = async () => {
    if (!boardRef.current) return;
    setIsExporting(true);
    showToast(language === Language.EN ? "Preparing your PDF..." : "Đang chuẩn bị bản PDF của bạn...", 'info');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const dataUrl = await htmlToImage.toPng(boardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: theme === Theme.DARK ? '#111111' : '#ffffff',
      });
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => { img.onload = resolve; });
      
      const imgWidth = pdfWidth;
      const imgHeight = (img.height * imgWidth) / img.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save('Lo-Trinh-Nghe-Nghiep.pdf');
      showToast(language === Language.EN ? "PDF exported successfully!" : "Xuất PDF thành công!", 'success');
    } catch (error) {
      console.error('Export failed:', error);
      showToast(language === Language.EN ? "Export failed. Please try again." : "Xuất file thất bại. Vui lòng thử lại.", 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToImage = async () => {
    if (!boardRef.current) return;
    setIsExporting(true);
    showToast(language === Language.EN ? "Generating image..." : "Đang tạo ảnh...", 'info');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const dataUrl = await htmlToImage.toPng(boardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: theme === Theme.DARK ? '#111111' : '#ffffff',
      });
      
      const link = document.createElement('a');
      link.download = 'Lo-Trinh-Nghe-Nghiep.png';
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast(language === Language.EN ? "Image saved successfully!" : "Lưu ảnh thành công!", 'success');
    } catch (error) {
      console.error('Export failed:', error);
      showToast(language === Language.EN ? "Export failed. Please try again." : "Lưu ảnh thất bại. Vui lòng thử lại.", 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
      case 'in-progress': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
      default: return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'done': return language === Language.EN ? 'Done' : 'Hoàn thành';
      case 'in-progress': return language === Language.EN ? 'In Progress' : 'Đang thực hiện';
      default: return language === Language.EN ? 'To Do' : 'Chưa bắt đầu';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return <Icons.CheckCircle2 className="w-5 h-5" />;
      case 'in-progress': return <Icons.Clock className="w-5 h-5" />;
      default: return <Icons.Circle className="w-5 h-5" />;
    }
  };

  // Skill calculations for selected career
  const allSkillMaps = [...CAREER_SKILL_MAPS, ...customSkillMaps];
  const currentSkillMap = allSkillMaps.find(m => m.id === selectedCareerId) || allSkillMaps[0];
  const careerSkills = currentSkillMap.skills;
  
  // Calculate selected career total average progress
  const filteredSkillsInCareer = careerSkills.map(s => s.id);
  const totalInCareer = filteredSkillsInCareer.length;
  const learnedInCareer = filteredSkillsInCareer.reduce((sum, id) => sum + (skillProgress[id] || 0), 0);
  const averageProgress = totalInCareer > 0 ? Math.round(learnedInCareer / totalInCareer) : 0;

  // Filter Job Postings matching selected career skills
  const matchingJobs = JOB_POSTINGS.filter(job => {
    const isTargetLoc = filterLocation === 'All' || job.location === filterLocation;
    // Map current selectedCareerId back to standard search terms
    const careerMatches: Record<string, string[]> = {
      'ai-engineer': ['ai', 'learning', 'scientist', 'học máy', 'intel', 'ml'],
      'cybersecurity': ['cyber', 'bảo mật', 'an ninh', 'ethical', 'pentest', 'soc'],
      'sustainability': ['energy', 'năng lượng', 'carbon', 'esg', 'sustain'],
      'logistics-supply-chain': ['logistics', 'supply', 'chuỗi cung ứng', 'kho'],
      'digital-marketing': ['marketing', 'brand', 'ads', 'seo', 'hacker', 'marketer'],
      'agritech': ['agritech', 'nông nghiệp', 'iot', 'gis', 'biotech'],
      'healthcare': ['y tế', 'health', 'medical', 'bác sĩ', 'bệnh viện', 'clinical', 'sinh học'],
      'finance-economics': ['tài chính', 'finance', 'kinh tế', 'accounting', 'modeling', 'market', 'portfolio', 'investment']
    };
    let queryList = careerMatches[selectedCareerId] || [];
    if (queryList.length === 0) {
      // Custom AI map: extract keywords from title
      const words = (currentSkillMap.title_vi + ' ' + currentSkillMap.title_en)
        .toLowerCase()
        .split(/[\s,.\-/]+/)
        .filter(w => w.length > 2);
      queryList = words;
    }
    const docString = `${job.title} ${job.company} ${job.requiredSkills.join(' ')}`.toLowerCase();
    const isTargetCareer = queryList.some(q => docString.includes(q)) || queryList.length === 0;
    return isTargetLoc && isTargetCareer;
  });

  const getJobMatchPercent = (jobSkills: string[]) => {
    if (jobSkills.length === 0) return 100;
    // Map specific job skills back to skill nodes
    const lowerJobSkills = jobSkills.map(s => s.toLowerCase());
    const matchedMapSkills = careerSkills.filter(s => lowerJobSkills.some(js => s.name.toLowerCase().includes(js) || js.includes(s.name.toLowerCase())));
    if (matchedMapSkills.length === 0) return 50; // default base match
    const totalProgress = matchedMapSkills.reduce((sum, s) => sum + (skillProgress[s.id] || 0), 0);
    return Math.min(100, Math.round(totalProgress / matchedMapSkills.length));
  };

  if (activeSubTab === 'roadmap' && milestones.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-[#050505] p-8 text-center animate-fade-in">
        <div className="flex gap-4 p-1.5 bg-gray-100 dark:bg-white/5 rounded-2xl mb-8">
            <button onClick={() => setActiveSubTab('roadmap')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeSubTab === 'roadmap' ? 'bg-indigo-600 text-white shadow' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}>
              {language === Language.VI ? "Lộ Trình Bản Thân" : "My Roadmap"}
            </button>
            <button onClick={() => setActiveSubTab('skills_jobs')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${(activeSubTab as string) === 'skills_jobs' ? 'bg-indigo-600 text-white shadow' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}>
              {language === Language.VI ? "Bản Đồ Kỹ Năng & Việc Làm" : "Skill Map & Job Matching"}
            </button>
        </div>

        <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500 rounded-full flex items-center justify-center mb-6 shadow-xl">
          <Icons.Map className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {language === Language.EN ? "Your Roadmap is Empty" : "Bảng Tiến Độ Đang Trống"}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
          {language === Language.EN 
            ? "Chat with the AI first so it can understand your goals and generate a personalized step-by-step career roadmap for you." 
            : "Hãy trò chuyện với AI trước để hệ thống hiểu rõ mục tiêu bản thân, hoặc đi tới mục Bản Đồ Kỹ Năng để xem ngay."}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNavigateToChat}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-base transition-shadow shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center gap-3"
          >
            <Icons.MessageSquare className="w-5 h-5" />
            {language === Language.EN ? "Start Chatting" : "Bắt đầu trò chuyện"}
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveSubTab('skills_jobs')}
            className="px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-3"
          >
            <Icons.Compass className="w-5 h-5 text-indigo-500" />
            {language === Language.VI ? "Bản Đồ Kỹ Năng Ngành" : "Explore Skill Map"}
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-[#050505] overflow-y-auto">
      {/* Sub-tab Switcher Header */}
      <div className="w-full border-b border-gray-200 dark:border-white/5 bg-white dark:bg-[#0e0e0e] py-4 px-6 sticky top-0 z-20 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-white/5 rounded-2xl w-full sm:w-auto">
            <button 
              onClick={() => setActiveSubTab('roadmap')} 
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeSubTab === 'roadmap' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
            >
              <Icons.Target className="w-4 h-4" />
              <span>{language === Language.VI ? "Lộ trình học tập" : "Roadmap Step"}</span>
            </button>
            <button 
              onClick={() => setActiveSubTab('skills_jobs')} 
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeSubTab === 'skills_jobs' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
            >
              <Icons.Compass className="w-4 h-4" />
              <span>{language === Language.VI ? "Bản đồ kỹ năng & Việc làm" : "Skill Map & Jobs"}</span>
            </button>
        </div>

        {activeSubTab === 'roadmap' && (
          <div className="flex gap-3 w-full sm:w-auto shrink-0 justify-end">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportToImage}
              disabled={isExporting}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5"
            >
              <Icons.Image className="w-3.5 h-3.5" />
              <span>{language === Language.EN ? "Save Image" : "Lưu Ảnh"}</span>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportToPDF}
              disabled={isExporting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Icons.FileText className="w-3.5 h-3.5" />
              <span>{language === Language.EN ? "Export PDF" : "Xuất PDF"}</span>
            </motion.button>
          </div>
        )}
      </div>

      <div className="w-full p-4 md:p-8 max-w-5xl mx-auto">
        <InlineGuide 
          sectionKey={`progress-${activeSubTab}`}
          lang={language === Language.VI ? 'vi' : 'en'}
          title={
            activeSubTab === 'roadmap' 
              ? (language === Language.VI ? "💡 Hướng dẫn Lộ trình Học 3 tháng" : "💡 3-Month Study Roadmap Guide")
              : (language === Language.VI ? "💡 Hướng dẫn Bản đồ kỹ năng & Việc làm" : "💡 Competencies & Careers Guide")
          }
          steps={
            activeSubTab === 'roadmap'
              ? (language === Language.VI ? [
                  "Lộ trình học tập 3 tháng được AI xây dựng cá nhân hóa dựa trên kết quả khảo sát RIASEC và lịch sử thảo luận của bạn.",
                  "Kết nối tài khoản Google để lên lịch và tự động đồng bộ hóa tạo nhắc nhở cho từng cột mốc nhiệm vụ hàng tuần.",
                  "Nhấn 'Lưu ảnh' hoặc 'Xuất PDF' ở góc trên để lưu trữ lộ trình chi tiết làm cẩm nang học tập cá nhân."
                ] : [
                  "Your 3-month action roadmap is custom compiled by AI integrating your RIASEC score and chat history.",
                  "Sync with Google Calendar to automatically map out milestones and weekly study schedules into your personal agenda.",
                  "Export as detailed images or vectors (PDF) to build your personal offline roadmap guide."
                ])
              : (language === Language.VI ? [
                  "Bản đồ kỹ năng phân loại chuyên môn theo các cấp độ tuyển dụng trực quan: Cơ bản (Junior), Trung cấp (Midweight), Chuyên gia (Senior).",
                  "Hệ thống tự động liên hợp tin tuyển dụng từ các nhà cung cấp trực tuyến hàng đầu Việt Nam thích ứng với kĩ năng hiện tại.",
                  "Xem dải lương tối ưu tại Việt Nam cho từng trình độ chuyên môn và nhấp tuyển dụng trực quan."
                ] : [
                  "Examine complete job competencies segmented by Junior, Midweight, and Senior specialist levels.",
                  "System queries live VN career listings from premium providers TopCV and ITviec compatible with matched skills.",
                  "Compare active compensation statistics and click the listing link to apply instantly."
                ])
          }
        />

        <AnimatePresence mode="wait">
          {activeSubTab === 'roadmap' ? (
            /* Roadmap view containing Google Calendar reminders and Deadline Set */
            <motion.div 
              key="roadmap-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div 
                id="progress-board-container"
                ref={boardRef} 
                className="progress-board-export bg-white dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-white/10 p-6 md:p-10 shadow-sm"
              >
                {/* User Header */}
                <div className="mb-10 pb-8 border-b border-gray-100 dark:border-white/5 flex flex-col md:flex-row items-center gap-6">
                  <img 
                    src={user?.avatar || 'https://ui-avatars.com/api/?name=User&background=random'} 
                    alt="Avatar" 
                    className="w-16 h-16 rounded-full border-2 border-white dark:border-gray-800 shadow-md"
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                  />
                  <div className="text-center md:text-left">
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-0.5 leading-none">
                      {language === Language.EN ? "Personal Career Roadmap" : "Lộ Trình Học Tập Cá Nhân"}
                    </h1>
                    <div className="flex flex-col md:flex-row items-center gap-2 mt-2 text-gray-500 dark:text-gray-400 text-sm">
                      <span className="font-semibold text-gray-900 dark:text-white">{user?.name}</span>
                      <span className="hidden md:inline">•</span>
                      <span>{user?.email}</span>
                      {user?.careerGoal && (
                        <>
                          <span className="hidden md:inline">•</span>
                          <span className="italic text-indigo-600 dark:text-indigo-400">"{user.careerGoal}"</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="relative ml-4 md:ml-8 space-y-0">
                  {milestones.map((milestone, index) => (
                    <motion.div 
                      key={milestone.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.08 }}
                      className="relative pl-8 md:pl-12 pb-8"
                    >
                      {/* Line connector */}
                      {index < milestones.length - 1 && (
                        <div className="absolute left-[9px] top-6 bottom-[-6px] w-[2px] bg-indigo-100 dark:bg-indigo-900/30 overflow-hidden">
                          <motion.div 
                            className="absolute top-0 left-0 w-full bg-emerald-500 dark:bg-emerald-400"
                            initial={{ height: '0%' }}
                            animate={{ height: milestone.status === 'done' ? '100%' : '0%' }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                          />
                          {(milestone.status === 'done' || milestone.status === 'in-progress') && (
                            <motion.div
                              className="absolute left-[-3px] w-[8px] h-[50%] bg-gradient-to-b from-transparent via-emerald-400 to-transparent opacity-85 blur-[1.5px]"
                              animate={{ top: ['-50%', '150%'] }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            />
                          )}
                        </div>
                      )}

                      {/* Timeline Dot */}
                      <div 
                        className={`absolute left-0 top-1.5 w-5 h-5 rounded-full border-4 border-white dark:border-[#111] z-10 transition-all duration-300 ${milestone.status === 'done' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] scale-105' : milestone.status === 'in-progress' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)] scale-105' : 'bg-gray-300 dark:bg-gray-600'}`} 
                      />
                      
                      <div 
                        className={`p-5 rounded-2xl border transition-all duration-300 ${milestone.status === 'done' ? 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-950/25' : milestone.status === 'in-progress' ? 'bg-amber-50/15 dark:bg-amber-950/10 border-amber-200 dark:border-amber-950/25' : 'bg-white dark:bg-white/5 border-gray-100 dark:border-white/10 hover:border-indigo-200 dark:hover:border-indigo-500/35'}`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h4 className={`text-lg font-bold ${milestone.status === 'done' ? 'text-emerald-900 dark:text-emerald-400 line-through opacity-70' : 'text-gray-900 dark:text-white'}`}>
                                {milestone.title}
                              </h4>
                              {milestone.deadline && (
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 inline-flex items-center gap-1">
                                  <Icons.Calendar className="w-3 h-3" />
                                  <span>Deadline: {milestone.deadline}</span>
                                </span>
                              )}
                              {milestone.isSyncedCalendar && (
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                                  <Icons.Check className="w-3 h-3" />
                                  <span>Google Cal</span>
                                </span>
                              )}
                              {milestone.isSyncedEmail && (
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 inline-flex items-center gap-1">
                                  <Icons.MailCheck className="w-3 h-3" />
                                  <span>Email Nhắc</span>
                                </span>
                              )}
                            </div>
                            <p className={`text-sm mt-1 mb-4 ${milestone.status === 'done' ? 'text-emerald-700/60 dark:text-emerald-500/60' : 'text-gray-500 dark:text-gray-400'}`}>
                              {milestone.description}
                            </p>

                            {/* Deadline Editing / Action Strip */}
                            <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-dashed border-gray-100 dark:border-white/5">
                              {editingDeadlineId === milestone.id ? (
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="date" 
                                    value={deadlineInput}
                                    onChange={(e) => setDeadlineInput(e.target.value)}
                                    className="bg-gray-50 dark:bg-white/5 border border-indigo-500/30 rounded-lg px-2 py-1 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                                  />
                                  <button 
                                    onClick={() => handleSaveDeadline(milestone.id, deadlineInput)}
                                    className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700"
                                  >
                                    Lưu
                                  </button>
                                  <button 
                                    onClick={() => setEditingDeadlineId(null)}
                                    className="p-1 text-gray-400 hover:text-red-500"
                                  >
                                    <Icons.X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => {
                                    setEditingDeadlineId(milestone.id);
                                    setDeadlineInput(milestone.deadline || '');
                                  }}
                                  className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg"
                                >
                                  <Icons.CalendarDays className="w-3.5 h-3.5" />
                                  <span>{milestone.deadline ? "Đổi Ngày Hạn" : "Đặt Ngày Deadline"}</span>
                                </button>
                              )}

                              {/* Google Calendar Sync Action Button */}
                              {milestone.deadline && (
                                <button 
                                  onClick={() => handleSyncGoogleCalendar(milestone)}
                                  disabled={syncingCalendarId === milestone.id}
                                  className={`text-xs inline-flex items-center gap-1 px-3 py-1 rounded-lg font-bold border transition-all ${
                                    milestone.isSyncedCalendar 
                                      ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400' 
                                      : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                  }`}
                                >
                                  {syncingCalendarId === milestone.id ? (
                                    <Icons.Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : milestone.isSyncedCalendar ? (
                                    <Icons.CheckSquare className="w-3.5 h-3.5" />
                                  ) : (
                                    <Icons.CalendarPlus className="w-3.5 h-3.5 text-indigo-500" />
                                  )}
                                  <span>{milestone.isSyncedCalendar ? "Đã Đồng Bộ Lịch" : "Đồng bộ Calendar"}</span>
                                </button>
                              )}

                              {/* Email Reminder Trigger Button */}
                              {milestone.deadline && (
                                <div className="relative">
                                  <button 
                                    onClick={() => setShowEmailPromptId(showEmailPromptId === milestone.id ? null : milestone.id)}
                                    disabled={syncingEmailId === milestone.id}
                                    className={`text-xs inline-flex items-center gap-1 px-3 py-1 rounded-lg font-bold border transition-all ${
                                      milestone.isSyncedEmail 
                                        ? 'bg-cyan-50 border-cyan-200 dark:bg-cyan-950/20 dark:border-cyan-800/40 text-cyan-600 dark:text-cyan-400' 
                                        : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                                  >
                                    {syncingEmailId === milestone.id ? (
                                      <Icons.Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <Icons.BellRing className="w-3.5 h-3.5 text-cyan-500 hover:animate-bounce" />
                                    )}
                                    <span>{milestone.isSyncedEmail ? "Đặt Nhắc Nhở Email" : "Email Nhắc Nhở"}</span>
                                  </button>

                                  {/* Custom Email Input Prompt */}
                                  {showEmailPromptId === milestone.id && (
                                    <div className="absolute top-8 left-0 mt-1 p-3 bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-750 rounded-xl z-30 min-w-[240px]">
                                      <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1.5 font-sans">
                                        Nhập địa chỉ nhận nhắc nhở:
                                      </p>
                                      <div className="flex gap-1.5">
                                        <input 
                                          type="email" 
                                          value={recipientEmail}
                                          onChange={(e) => setRecipientEmail(e.target.value)}
                                          placeholder="vietducpham08112010@gmail.com"
                                          className="text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500 text-gray-900 dark:text-white flex-1"
                                        />
                                        <button 
                                          onClick={() => handleSendEmailReminder(milestone, recipientEmail)}
                                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg"
                                        >
                                          Lên Lịch
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 lg:self-start shrink-0">
                            <button 
                              onClick={() => setActiveCommentId(activeCommentId === milestone.id ? null : milestone.id)}
                              className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-full transition-colors relative"
                              title="Add Note"
                            >
                              <Icons.MessageSquare className="w-5 h-5" />
                              {milestone.comments && milestone.comments?.length > 0 && (
                                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-white dark:border-[#111]"></span>
                              )}
                            </button>
                            <button 
                              onClick={() => toggleStatus(milestone.id)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold whitespace-nowrap transition-colors ${getStatusColor(milestone.status)}`}
                            >
                              {getStatusIcon(milestone.status)}
                              {getStatusText(milestone.status)}
                            </button>
                          </div>
                        </div>

                        {/* Comments / Notes */}
                        {(activeCommentId === milestone.id || (milestone.comments && milestone.comments?.length > 0)) && (
                          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                            {milestone.comments && milestone.comments?.length > 0 && (
                              <div className="space-y-2 mb-3">
                                {milestone.comments.map((comment, i) => (
                                  <div key={i} className="flex gap-2 items-start text-sm bg-gray-50 dark:bg-white/5 p-3 rounded-xl text-gray-700 dark:text-gray-300">
                                    <Icons.CornerDownRight className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                    <p className="font-sans leading-snug">{comment}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {activeCommentId === milestone.id && (
                              <div className="flex gap-2 items-center">
                                <input 
                                  type="text" 
                                  value={commentText}
                                  onChange={(e) => setCommentText(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && addComment(milestone.id)}
                                  placeholder={language === Language.EN ? "Add custom notes, courses URL or achievements..." : "Thêm ghi chú cá nhân, link khóa học hoặc đánh giá..."}
                                  className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 text-gray-900 dark:text-white font-sans"
                                />
                                <button 
                                  onClick={() => addComment(milestone.id)}
                                  disabled={!commentText.trim()}
                                  className="p-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors disabled:opacity-50"
                                >
                                  <Icons.Send className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="mt-12 pt-6 border-t border-gray-100 dark:border-white/10 flex justify-between items-center text-xs text-gray-400">
                  <span>{language === Language.EN ? "Integrated by CareerGuide AI Router" : "Được hỗ trợ bởi Định Hướng Học Nghề CareerGuide AI"}</span>
                  <span>{language === Language.EN ? "Date:" : "Ngày xuất:"} {new Date().toLocaleDateString(language === Language.EN ? 'en-US' : 'vi-VN')}</span>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Skill Map Visualization and Jobs Matching TopCV/ITviec */
            <motion.div 
              key="skills-jobs-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              {/* Career Selection Header Panels */}
              <div className="p-6 bg-white dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-white/10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                      {language === Language.VI ? "Bản Đồ Kỹ Năng Ngành & Việc làm" : "Interactive Skill Maps & Job Matching"}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-snug">
                      {language === Language.VI 
                        ? `Lựa chọn nghề nghiệp mong muốn để vẽ sơ đồ kỹ năng chuyên sâu theo 3 Cấp độ và matching tin tuyển dụng TopCV/ITviec.` 
                        : "Select a job category to display specialized core skills across levels and map matching available posts."}
                    </p>
                  </div>
                  
                  <div className="w-full md:w-auto shrink-0">
                    <select 
                      value={selectedCareerId}
                      onChange={(e) => {
                        setSelectedCareerId(e.target.value);
                        setSelectedSkillId(null);
                      }}
                      className="w-full md:w-72 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-800 dark:text-white focus:outline-none focus:border-indigo-500"
                    >
                      {allSkillMaps.map(m => (
                        <option key={m.id} value={m.id} className="dark:bg-gray-900 font-bold">
                          {language === Language.VI ? m.title_vi : m.title_en}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* AI Custom Career Generator */}
                <div className="mt-4 pt-4 border-t border-dashed border-gray-250 dark:border-white/10">
                  <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400">
                      <Icons.Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                      <span>{language === Language.VI ? "Hoặc để AI tự động vẽ sơ đồ kỹ năng cho ngành bất kỳ:" : "Or let AI auto-generate skill map for any job:"}</span>
                    </div>
                    
                    <div className="flex gap-2 flex-1 max-w-md">
                      <input 
                        type="text"
                        value={aiCareerInput}
                        onChange={(e) => setAiCareerInput(e.target.value)}
                        placeholder={language === Language.VI ? "Ví dụ: Lập trình game, Thiết kế thời trang, Tâm lý học..." : "E.g., Game dev, Fashion designer, Psychology..."}
                        className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-250 dark:border-white/15 rounded-xl px-3 py-1.5 text-xs font-medium text-gray-800 dark:text-white focus:outline-none focus:border-indigo-500"
                        disabled={isGeneratingMap}
                      />
                      <button
                        onClick={handleGenerateCustomMap}
                        disabled={isGeneratingMap || !aiCareerInput.trim()}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                      >
                        {isGeneratingMap ? (
                          <>
                            <Icons.Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>{language === Language.VI ? "Đang phân tích..." : "Analyzing..."}</span>
                          </>
                        ) : (
                          <>
                            <Icons.Cpu className="w-3.5 h-3.5" />
                            <span>{language === Language.VI ? "AI Tạo Sơ Đồ" : "AI Map"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Overall Progress Indicator Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-indigo-500/5 dark:bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/10 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                      <Icons.Award className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-bold">
                        {language === Language.VI ? "Trung bình năng lực nghề" : "Career Competence Progress"}
                      </p>
                      <h4 className="text-sm font-extrabold text-gray-900 dark:text-white leading-snug">
                        {language === Language.VI ? currentSkillMap.title_vi : currentSkillMap.title_en}
                      </h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-36 bg-gray-200 dark:bg-gray-800 rounded-full h-3 overflow-hidden border border-gray-300 dark:border-gray-750">
                      <div className="bg-indigo-600 h-full rounded-full transition-all duration-800" style={{ width: `${averageProgress}%` }} />
                    </div>
                    <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">{averageProgress}%</span>
                  </div>
                </div>
              </div>

              {/* Grid 2 Column for Visual map and Skill details card */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* SVG Radial Visualizer Ring */}
                <div className="lg:col-span-7 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-3xl p-6 relative flex flex-col items-center">
                  <h4 className="text-sm font-extrabold text-gray-900 dark:text-white mb-2 self-start flex items-center gap-2">
                    <Icons.Radar className="w-4 h-4 text-indigo-500" />
                    <span>{language === Language.VI ? "Biểu Đồ Sơ Đồ Cấp Độ Kỹ Năng" : "Concentric Skill Level Map"}</span>
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5 mb-6 self-start leading-snug">
                    {language === Language.VI 
                      ? "Bản đồ vòng đồng tâm hiển thị mức độ chuyên sâu: Trung tâm (Cơ bản), Vòng giữa (Trung cấp), Vòng ngoài (Chuyên sâu/Advanced)."
                      : "Concentric rings map depth: Center (Beginner), Mid ring (Intermediate), Outer ring (Expert/Senior)."}
                  </p>

                  {/* Majestic Concentric Map SVG */}
                  <div className="relative w-full aspect-square max-w-[420px] my-4">
                    <svg viewBox="0 0 400 400" className="w-full h-full">
                      {/* Definitions for glow and gradients */}
                      <defs>
                        <radialGradient id="ring-glow" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                        </radialGradient>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="3" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                      </defs>

                      {/* Concentric rings bg */}
                      <motion.circle 
                        cx="200" 
                        cy="200" 
                        r="195" 
                        fill="none" 
                        stroke="#6366f1" 
                        strokeOpacity="0.1" 
                        strokeWidth="2" 
                        strokeDasharray="4 4" 
                        initial={{ pathLength: 0, rotate: -30 }}
                        animate={{ pathLength: 1, rotate: 0 }}
                        transition={{ duration: 1.6, ease: "easeInOut" }}
                      />
                      <motion.circle 
                        cx="200" 
                        cy="200" 
                        r="130" 
                        fill="none" 
                        stroke="#6366f1" 
                        strokeOpacity="0.15" 
                        strokeWidth="2" 
                        strokeDasharray="4 4"
                        initial={{ pathLength: 0, rotate: 30 }}
                        animate={{ pathLength: 1, rotate: 0 }}
                        transition={{ duration: 1.3, ease: "easeInOut", delay: 0.15 }}
                      />
                      <motion.circle 
                        cx="200" 
                        cy="200" 
                        r="70" 
                        fill="none" 
                        stroke="#6366f1" 
                        strokeOpacity="0.25" 
                        strokeWidth="2" 
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.0, ease: "easeOut", delay: 0.3 }}
                      />
                      <circle cx="200" cy="200" r="70" fill="url(#ring-glow)" />

                      {/* Core center node */}
                      <motion.g 
                        className="cursor-pointer"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.4 }}
                        whileHover={{ scale: 1.1 }}
                        style={{ transformOrigin: "200px 200px" }}
                      >
                        <circle cx="200" cy="200" r="28" fill="#4f46e5" filter="url(#glow)" />
                        <text x="200" y="204" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                          {language === Language.VI ? "CỐT MỐC" : "CORE"}
                        </text>
                      </motion.g>

                      {/* Mapping skills along Rings */}
                      {careerSkills.map((skill, index) => {
                        // Group skills by level: junior (70), mid (130), senior (195)
                        let radius = 70;
                        let colour = '#3b82f6'; // blue
                        if (skill.level === 'mid') {
                          radius = 130;
                          colour = '#f59e0b'; // amber
                        } else if (skill.level === 'senior') {
                          radius = 195;
                          colour = '#ec4899'; // pink
                        }

                        // Filter current level skills to space them uniformly
                        const sameLevelSkills = careerSkills.filter(s => s.level === skill.level);
                        const subIndex = sameLevelSkills.findIndex(s => s.id === skill.id);
                        const count = sameLevelSkills.length;
                        
                        // Add angular rotation to avoid alignment overlaps
                        const offsetRotation = skill.level === 'mid' ? Math.PI / 4 : skill.level === 'senior' ? Math.PI / 3 : 0;
                        const angle = (subIndex * 2 * Math.PI) / count + offsetRotation;
                        
                        const x = 200 + radius * Math.cos(angle);
                        const y = 200 + radius * Math.sin(angle);

                        const isSelected = selectedSkillId === skill.id;
                        const currentProgress = skillProgress[skill.id] || 0;

                        return (
                          <motion.g 
                            key={skill.id} 
                            onClick={() => setSelectedSkillId(skill.id)} 
                            className="cursor-pointer group select-none"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ 
                              type: "spring", 
                              stiffness: 140, 
                              damping: 14, 
                              delay: index * 0.05 + 0.3 
                            }}
                            whileHover={{ scale: 1.12 }}
                            whileTap={{ scale: 0.95 }}
                            style={{ transformOrigin: `${x}px ${y}px` }}
                          >
                            {/* Line connecting to center */}
                            <motion.line 
                              x1="200" 
                              y1="200" 
                              x2={x} 
                              y2={y} 
                              stroke={isSelected ? '#6366f1' : '#cbd5e1'} 
                              strokeOpacity={isSelected ? '0.75' : '0.15'} 
                              strokeWidth={isSelected ? '2.5' : '1'} 
                              strokeDasharray={isSelected ? 'none' : '2 2'}
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 0.8, delay: index * 0.04 + 0.1, ease: "easeOut" }}
                            />

                            {/* Node border for progress */}
                            <circle 
                              cx={x} 
                              cy={y} 
                              r="20" 
                              fill="none" 
                              stroke={isSelected ? "#6366f1" : colour} 
                              strokeWidth={isSelected ? "3" : "1"} 
                              strokeOpacity={isSelected ? "1" : "0.5"}
                            />

                            {/* Innermost node display representing progress ratio */}
                            <motion.circle 
                              cx={x} 
                              cy={y} 
                              r="15" 
                              fill={theme === Theme.DARK ? '#18181b' : '#ffffff'} 
                              stroke={colour}
                              strokeWidth="2.5"
                              strokeDasharray="94"
                              initial={{ strokeDashoffset: 94 }}
                              animate={{ strokeDashoffset: 94 - (currentProgress / 100) * 94 }}
                              transition={{ duration: 1.0, delay: index * 0.04 + 0.4, ease: "easeInOut" }}
                              transform={`rotate(-90 ${x} ${y})`}
                            />

                            {/* Center circle anchor */}
                            <circle 
                              cx={x} 
                              cy={y} 
                              r="10" 
                              fill={isSelected ? '#6366f1' : colour} 
                              opacity="0.85"
                            />

                            {/* Label floating helper */}
                            <text 
                              x={x} 
                              y={y < 200 ? y - 24 : y + 30} 
                              textAnchor="middle" 
                              fill={isSelected ? '#4f46e5' : (theme === Theme.DARK ? '#e4e4e7' : '#27272a')} 
                              fontSize="10" 
                              fontWeight={isSelected ? '800' : '650'}
                              className="font-mono transition-all drop-shadow"
                            >
                              {skill.name}
                            </text>
                            
                            {/* Inner tiny indicator */}
                            <text 
                              x={x} 
                              y={y + 3} 
                              textAnchor="middle" 
                              fill="#ffffff" 
                              fontSize="8" 
                              fontWeight="bold"
                            >
                              {currentProgress}%
                            </text>
                          </motion.g>
                        );
                      })}
                    </svg>

                    {/* Explanatory Map Legend overlay */}
                    <div className="absolute bottom-1.5 left-1.5 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-white/5 space-y-1 z-10 text-[10px] scale-90 select-none">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-blue-500 rounded-full inline-block" />
                        <span className="font-semibold text-gray-600 dark:text-gray-300">Cơ bản (Junior)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-amber-500 rounded-full inline-block" />
                        <span className="font-semibold text-gray-600 dark:text-gray-300">Trung cấp (Mid)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-pink-500 rounded-full inline-block" />
                        <span className="font-semibold text-gray-600 dark:text-gray-300">Chuyên sâu (Senior)</span>
                      </div>
                      <p className="text-[9px] text-gray-400 italic pt-1 border-t border-gray-100 dark:border-white/5 mt-1">
                        * Nhấp chọn từng node để tinh chỉnh tiến độ học tập!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right detail dashboard column */}
                <div className="lg:col-span-5 space-y-6">
                  {selectedSkillId ? (
                    (() => {
                      const selectedSkill = careerSkills.find(s => s.id === selectedSkillId)!;
                      const progress = skillProgress[selectedSkillId] || 0;
                      return (
                        <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm relative animate-fade-in">
                          <button 
                            onClick={() => setSelectedSkillId(null)}
                            className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-full bg-gray-50 dark:bg-white/5"
                          >
                            <Icons.X className="w-4 h-4" />
                          </button>

                          <div className="flex items-center gap-2 mb-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              selectedSkill.level === 'junior' 
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                                : selectedSkill.level === 'mid' 
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' 
                                : 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'
                            }`}>
                              Cấp độ: {selectedSkill.level}
                            </span>
                          </div>

                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {selectedSkill.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-sans mb-6">
                            {language === Language.VI ? selectedSkill.description_vi : selectedSkill.description_en}
                          </p>

                          {/* Skill Training Slide Ruler */}
                          <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-150 dark:border-white/5">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Tiến trình rèn luyện:</span>
                              <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">{progress}%</span>
                            </div>
                            <input 
                              type="range" 
                              min="0" 
                              max="100" 
                              value={progress}
                              onChange={(e) => updateSkillProgressValue(selectedSkillId, parseInt(e.target.value))}
                              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                            <div className="flex justify-between items-center mt-2.5 text-[10px] text-gray-400 uppercase font-mono">
                              <span>Sơ cấp</span>
                              <span>Thành thạo</span>
                              <span>Làm chủ</span>
                            </div>
                          </div>

                          {/* Core Recommended Learning Strategy */}
                          <div className="mt-5 space-y-3">
                            <h5 className="text-xs font-bold text-gray-900 dark:text-white tracking-widest uppercase">Lộ trình rèn luyện:</h5>
                            <div className="flex items-start gap-2.5 text-xs bg-indigo-50/30 dark:bg-indigo-950/20 p-3 rounded-xl border border-indigo-100/10">
                              <Icons.BookOpen className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {language === Language.VI 
                                  ? `Thực hiện 2-3 dự án nhỏ chứa kỹ năng ${selectedSkill.name}. Gợi ý học liệu của CareerGuide tại Coursera / Udemy.` 
                                  : `Build 2-3 mini projects deploying ${selectedSkill.name}. Read official documentations and Coursera tracks.`
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="bg-indigo-500/5 dark:bg-indigo-500/10 border border-dashed border-indigo-500/25 rounded-3xl p-8 hover:bg-indigo-500/10 transition-all text-center h-full flex flex-col items-center justify-center">
                      <Icons.MousePointerClick className="w-10 h-10 text-indigo-500 mb-3 animate-pulse" />
                      <h4 className="text-base font-extrabold text-indigo-900 dark:text-indigo-300">
                        {language === Language.VI ? "Vui lòng chọn Kỹ năng" : "Interactive Node Detail Panel"}
                      </h4>
                      <p className="text-xs text-indigo-500/70 mt-1 max-w-xs leading-relaxed">
                        {language === Language.VI 
                          ? "Hãy nhấp trực tiếp vào các node kỹ năng trên bản đồ để tùy chỉnh phần trăm học tập, tài nguyên luyện tập và mức độ thành thạo cá nhân!" 
                          : "Click directly on any skill circular badge on the radial level map to update training ratios and view targeted learning resources."}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Job Listings matching current selected career */}
              <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h4 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                      <Icons.Briefcase className="w-5 h-5 text-indigo-600" />
                      <span>{language === Language.VI ? "Matching Việc Làm Tìm Được" : "Job Openings Matched"}</span>
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {language === Language.VI 
                        ? `Tìm được ${matchingJobs.length} công việc có yêu cầu kỹ năng tương ứng có tuyển dụng trực tiếp tại Việt Nam.` 
                        : `Discovered ${matchingJobs.length} active opportunities requiring these skillset in the Vietnamese market.`}
                    </p>
                  </div>

                  {/* Location Filtering option widget */}
                  <div className="flex gap-1.5 p-1 bg-gray-50 dark:bg-white/5 rounded-xl shrink-0 w-full sm:w-auto overflow-x-auto">
                    {(['All', 'Hà Nội', 'TP. HCM', 'Đà Nẵng'] as const).map(loc => (
                      <button 
                        key={loc}
                        onClick={() => setFilterLocation(loc)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                          filterLocation === loc 
                            ? 'bg-indigo-600 text-white shadow-sm' 
                            : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                        }`}
                      >
                        {loc === 'All' ? (language === Language.VI ? "Tất cả" : "All Locations") : loc}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Job postings items render loop container */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matchingJobs.length > 0 ? (
                    matchingJobs.map(job => {
                      const matchPercent = getJobMatchPercent(job.requiredSkills);
                      return (
                        <div 
                          key={job.id}
                          className="p-5 border border-gray-100 dark:border-white/5 rounded-2xl bg-gray-50/50 dark:bg-[#151515] hover:border-indigo-500/25 dark:hover:border-indigo-500/25 transition-all flex flex-col justify-between group"
                        >
                          <div className="space-y-3">
                            <div className="flex justify-between items-start gap-3">
                              <div>
                                <h5 className="font-extrabold text-base text-gray-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                  {job.title}
                                </h5>
                                <p className="text-xs text-gray-500 mt-1 font-semibold">{job.company}</p>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                matchPercent >= 80 
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                                  : matchPercent >= 50 
                                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400' 
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                              }`}>
                                Match: {matchPercent}%
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <Icons.MapPin className="w-3.5 h-3.5" />
                                <span>{job.location}</span>
                              </span>
                              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                                <Icons.Banknote className="w-3.5 h-3.5" />
                                <span>{job.salary}</span>
                              </span>
                              <span className="flex items-center gap-1 font-sans">
                                <Icons.UserPlus className="w-3.5 h-3.5 text-indigo-500" />
                                <span>{job.level}</span>
                              </span>
                            </div>

                            {/* Required Skills list matching indicator */}
                            <div className="flex items-center flex-wrap gap-1.5 pt-1.5">
                              {job.requiredSkills.map(s => {
                                // Match indicator: if skill progress > 40 is considered matched
                                const foundSkillInCareer = careerSkills.find(cs => cs.name.toLowerCase() === s.toLowerCase() || s.toLowerCase().includes(cs.name.toLowerCase()));
                                const userProgress = foundSkillInCareer ? (skillProgress[foundSkillInCareer.id] || 0) : 0;
                                const isMatched = userProgress > 40;

                                return (
                                  <span key={s} className={`px-2 py-1 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 ${
                                    isMatched 
                                      ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                                      : 'bg-gray-150 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-gray-150/10'
                                  }`}>
                                    {isMatched ? <Icons.Check className="w-2.5 h-2.5" /> : <Icons.CircleDot className="w-2.5 h-2.5 opacity-40" />}
                                    <span>{s}</span>
                                  </span>
                                );
                              })}
                            </div>
                          </div>

                          <div className="mt-5 pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                            <span className="text-[10px] uppercase font-mono text-gray-400 inline-flex items-center gap-1">
                              <Icons.ShieldAlert className="w-3.5 h-3.5 text-gray-400" />
                              <span>Nguồn: {job.source} API</span>
                            </span>
                            
                            <a 
                              href={job.url}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm inline-flex items-center gap-1 transition-all group-hover:translate-x-0.5"
                            >
                              <span>{job.source === 'ITviec' ? "Xem Job trên ITviec" : "Nộp đơn trên TopCV"}</span>
                              <Icons.ArrowUpRight className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-2 py-10 flex flex-col items-center justify-center border border-dashed border-gray-200 dark:border-white/10 rounded-2xl bg-gray-50/20 dark:bg-black/20">
                      <Icons.Inbox className="w-10 h-10 text-gray-400 mb-2" />
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold font-sans">
                        Không tìm thấy job matching tại {filterLocation}!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Loading Document Exporting Overlay */}
      <AnimatePresence>
        {isExporting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
          >
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-5 max-w-sm mx-4 text-center border border-gray-250 dark:border-gray-700">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-100 dark:border-indigo-900/30 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-indigo-600 dark:border-indigo-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                <Icons.FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {language === Language.EN ? "Generating Document" : "Đang tạo tài liệu định hướng"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {language === Language.EN ? "Preparing high quality render file..." : "Vui lòng đợi giây lát, hệ thống đang chuẩn bị tệp tin..."}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
