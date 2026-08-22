import React, { useState } from 'react';
import { motion } from 'motion/react';
import { InlineGuide } from './InlineGuide';

interface HotJob {
  id: string;
  title_vi: string;
  title_en: string;
  category: string;
  salary: string;
  growth: string;
  description: string;
  skills: string[];
  education: string;
  outlook: 'high' | 'very-high' | 'stable';
}

const JOBS_VIETNAM: HotJob[] = [
  // 1. Information Technology
  {
    id: 'ai-engineer',
    title_vi: 'Kỹ sư Trí tuệ nhân tạo (AI Engineer)',
    title_en: 'AI / Machine Learning Engineer',
    category: 'Information Technology',
    salary: '35,000,000 - 95,000,000 VND / tháng',
    growth: '+45% nhu cầu tuyển dụng tăng trưởng liên tục',
    description: 'Nghiên cứu, thiết kế và triển khai các thuật toán học sâu (Deep Learning), các mô hình ngôn ngữ lớn (LLM), AI tạo sinh (Generative AI) và thị giác máy tính cho doanh nghiệp.',
    skills: ['Python', 'Deep Learning', 'PyTorch / TensorFlow', 'API Integration', 'Generative AI'],
    education: 'Cử nhân CNTT, Khoa học dữ liệu, AI hoặc Toán tin ứng dụng',
    outlook: 'very-high'
  },
  {
    id: 'cybersecurity',
    title_vi: 'Chuyên gia An ninh mạng & Bảo mật hệ thống',
    title_en: 'Cybersecurity Analyst & Specialist',
    category: 'Information Technology',
    salary: '25,000,000 - 75,000,000 VND / tháng',
    growth: '+35% nhu cầu bảo vệ hạ tầng số doanh nghiệp',
    description: 'Đánh giá nguy cơ an toàn thông tin, lập kế hoạch ứng phó sự cố số và thiết lập hệ thống tường lửa, bảo mật đa lớp cho các doanh nghiệp, ngân hàng và đám mây.',
    skills: ['Network Security', 'Ethical Hacking', 'SecOps', 'SIEM / SOAR', 'Cloud Infrastructure'],
    education: 'Cử nhân An toàn thông tin hoặc Kỹ sư CNTT',
    outlook: 'very-high'
  },
  {
    id: 'fullstack-dev',
    title_vi: 'Kỹ sư Phát triển Phần mềm Full-Stack',
    title_en: 'Full-Stack Software Engineer',
    category: 'Information Technology',
    salary: '22,000,000 - 65,000,000 VND / tháng',
    growth: '+28% nhu cầu tuyển dụng các dự án phần mềm đa quốc gia',
    description: 'Phát triển toàn diện cả phần giao diện người dùng (Front-end) và máy chủ (Back-end) cho các ứng dụng web và ứng dụng di động thông minh.',
    skills: ['React / Next.js', 'Node.js', 'SQL / NoSQL', 'TypeScript', 'Docker'],
    education: 'Cử nhân Công nghệ thông tin, Khoa học máy tính',
    outlook: 'very-high'
  },
  {
    id: 'data-analyst',
    title_vi: 'Chuyên viên Phân tích Dữ liệu (Data Analyst)',
    title_en: 'Data Analyst & Business Analyst',
    category: 'Information Technology',
    salary: '18,000,000 - 48,000,000 VND / tháng',
    growth: '+30% nhu cầu số hóa kinh doanh dựa trên dữ liệu',
    description: 'Thu thập, xử lý và trực quan hóa dữ liệu để cung cấp thông tin dự báo chiến lược kinh doanh cho các bộ phận vận hành và marketing.',
    skills: ['SQL', 'Python', 'Power BI / Tableau', 'Excel', 'Statistical Analysis'],
    education: 'Cử nhân Hệ thống thông tin quản lý, Thống kê, Kinh tế đối ngoại',
    outlook: 'high'
  },
  {
    id: 'cloud-architect',
    title_vi: 'Kỹ sư Giải pháp Điện toán Đám mây',
    title_en: 'Cloud Solutions Architect',
    category: 'Information Technology',
    salary: '30,000,000 - 85,000,000 VND / tháng',
    growth: '+32% các công ty chuyển đổi lên hạ tầng Hybrid Cloud',
    description: 'Thiết kế, triển khai và quản lý kiến trúc cơ sở hạ tầng đám mây an toàn, có khả năng mở rộng linh hoạt cho doanh nghiệp.',
    skills: ['AWS / GCP / Azure', 'Terraform (IaC)', 'Kubernetes', 'Cloud Security', 'Linux'],
    education: 'Cử nhân CNTT, Kỹ thuật mạng hoặc An toàn thông tin',
    outlook: 'very-high'
  },
  {
    id: 'product-manager',
    title_vi: 'Quản lý Sản phẩm Công nghệ (Product Manager)',
    title_en: 'Technical Product Manager',
    category: 'Information Technology',
    salary: '28,000,000 - 70,000,000 VND / tháng',
    growth: '+22% số lượng startup và sản phẩm SaaS tăng trưởng',
    description: 'Đăng ký kế hoạch và định hình chiến lược phát triển sản phẩm số, điều phối giữa đội ngũ lập trình, thiết kế UI/UX và bộ phận kinh doanh.',
    skills: ['Product Roadmap', 'Agile / Scrum', 'User Research', 'Data Analysis', 'Jira / Confluence'],
    education: 'Cử nhân Quản trị kinh doanh công nghệ, Khoa học máy tính',
    outlook: 'high'
  },
  {
    id: 'iot-developer',
    title_vi: 'Kỹ sư Thiết bị Kết nối & IoT',
    title_en: 'IoT Hardware & Software Developer',
    category: 'Information Technology',
    salary: '20,000,000 - 55,000,000 VND / tháng',
    growth: '+26% ứng dụng Smart Home & Smart Factory tại VN',
    description: 'Thiết kế vi mạch, lập trình nhúng cho các thiết bị cảm biến kết nối mạng Internet nhằm giám sát, thu thập thông tin tự động hóa.',
    skills: ['C / C++', 'Microcontrollers', 'MQTT / HTTP', 'Circuit Design', 'Raspberry Pi / Arduino'],
    education: 'Kỹ sư Điện tử viễn thông, Kỹ thuật nhúng',
    outlook: 'high'
  },
  {
    id: 'blockchain-dev',
    title_vi: 'Kỹ sư Công nghệ Blockchain & Web3',
    title_en: 'Blockchain & Smart Contract Developer',
    category: 'Information Technology',
    salary: '32,000,000 - 90,000,000 VND / tháng',
    growth: '+18% các dự án lưu trữ phi tập trung & bảo mật hợp đồng',
    description: 'Thiết kế hệ thống sổ cái phi tập trung, viết và kiểm thử Hợp đồng thông minh (Smart Contract) phục vụ giao dịch tài chính an toàn.',
    skills: ['Solidity', 'Web3.js', 'Ethereum / Hyperledger', 'Cryptography', 'Smart Contracts'],
    education: 'Cử nhân Khoa học máy tính, Kỹ thuật mật mã',
    outlook: 'stable'
  },
  {
    id: 'devops-engineer',
    title_vi: 'Kỹ sư Vận hành & Phát triển DevOps',
    title_en: 'DevOps & SRE Engineer',
    category: 'Information Technology',
    salary: '28,000,000 - 80,000,000 VND / tháng',
    growth: '+38% áp dụng quy trình phát triển liên tục CI/CD',
    description: 'Thiết lập và quản lý quy trình tự động hóa tích hợp và triển khai mã nguồn, giảm thiểu thời gian lỗi và tối ưu hóa hệ thống máy chủ vận hành.',
    skills: ['CI/CD (Jenkins/GitHub Actions)', 'Docker / Kubernetes', 'Ansible / Terraform', 'Shell Scripting', 'Monitoring'],
    education: 'Cử nhân CNTT, Hệ thống máy tính hoặc Mạng máy tính',
    outlook: 'very-high'
  },
  {
    id: 'uiux-designer',
    title_vi: 'Nhà thiết kế Trải nghiệm Người dùng UI/UX',
    title_en: 'UI/UX Product Designer',
    category: 'Information Technology',
    salary: '16,000,000 - 45,000,000 VND / tháng',
    growth: '+25% ngân sách thiết kế tối ưu hóa tỷ lệ chuyển đổi số',
    description: 'Xây dựng sơ đồ tư duy người dùng, vẽ khung giao diện trực quan (wireframe) và thiết kế trải nghiệm người dùng tối ưu cho web/app di động.',
    skills: ['Figma', 'User Research', 'Wireframing', 'Prototyping', 'Design Systems'],
    education: 'Cử nhân Mỹ thuật công nghiệp, Thiết kế đa phương tiện hoặc Tâm lý học hành vi',
    outlook: 'high'
  },
  {
    id: 'business-analyst',
    title_vi: 'Chuyên viên Phân tích Nghiệp vụ (Business Analyst)',
    title_en: 'IT Business Analyst (BA)',
    category: 'Information Technology',
    salary: '18,000,000 - 45,000,000 VND / tháng',
    growth: '+24% nhu cầu cầu nối kỹ thuật - nghiệp vụ doanh nghiệp',
    description: 'Làm việc trực tiếp với khách hàng và nội bộ để thu thập, phân tích nghiệp vụ yêu cầu, viết đặc tả tài liệu kỹ thuật SRS cho dự án phần mềm.',
    skills: ['Requirement Gathering', 'UML / Wireframing', 'SQL', 'Agile / Scrum', 'Effective Communication'],
    education: 'Cử nhân Hệ thống thông tin quản lý, Quản trị kinh doanh, CNTT',
    outlook: 'high'
  },
  {
    id: 'bi-engineer',
    title_vi: 'Kỹ sư Trí tuệ Doanh nghiệp (BI Engineer)',
    title_en: 'Business Intelligence (BI) Engineer',
    category: 'Information Technology',
    salary: '22,000,000 - 55,000,000 VND / tháng',
    growth: '+27% doanh nghiệp triển khai kho dữ liệu phân tích tập trung',
    description: 'Xây dựng kho dữ liệu (Data Warehouse), thiết kế quy trình ETL và phát triển các báo cáo quản trị thông minh cho ban lãnh đạo.',
    skills: ['ETL Tools', 'Data Warehousing', 'SQL / Python', 'Power BI / Looker', 'Data Modeling'],
    education: 'Cử nhân CNTT, Khoa học dữ liệu, Hệ thống thông tin',
    outlook: 'high'
  },
  {
    id: 'digital-transformation-consultant',
    title_vi: 'Chuyên gia Tư vấn Chuyển đổi số',
    title_en: 'Digital Transformation Consultant',
    category: 'Information Technology',
    salary: '26,000,000 - 68,000,000 VND / tháng',
    growth: '+31% đề án chuyển đổi số quốc gia cho SME',
    description: 'Khảo sát hiện trạng vận hành của doanh nghiệp, tư vấn các giải pháp công nghệ (ERP, Cloud, AI) để nâng cao hiệu suất kinh doanh.',
    skills: ['ERP / CRM Integration', 'Change Management', 'Business Process Modeling', 'Digital Strategy', 'Consulting'],
    education: 'Cử nhân Quản lý công nghệ, Quản trị kinh doanh hoặc CNTT',
    outlook: 'very-high'
  },

  // 2. Healthcare & Medicine
  {
    id: 'gp-doctor',
    title_vi: 'Bác sĩ Đa khoa / Bác sĩ chuyên khoa điều trị',
    title_en: 'General Practitioner & Medical Specialist',
    category: 'Healthcare & Medicine',
    salary: '25,000,000 - 85,000,000 VND / tháng',
    growth: '+30% nhu cầu chăm sóc sức khỏe y tế chất lượng cao',
    description: 'Thăm khám, chẩn đoán lâm sàng, kê đơn và thực hiện các phác đồ điều trị nội ngoại khoa tại bệnh viện và các cơ sở y tế tư nhân cao cấp.',
    skills: ['Clinical Diagnosis', 'Patient Care', 'Emergency Medicine', 'Medical Ethics', 'Interpersonal Communication'],
    education: 'Bác sĩ Y khoa (6 năm đào tạo chính quy + chứng chỉ hành nghề)',
    outlook: 'very-high'
  },
  {
    id: 'clinical-pharmacist',
    title_vi: 'Dược sĩ Lâm sàng / Dược sĩ nghiên cứu sinh học',
    title_en: 'Clinical Pharmacist',
    category: 'Healthcare & Medicine',
    salary: '18,000,000 - 45,000,000 VND / tháng',
    growth: '+22% đẩy mạnh sử dụng thuốc an toàn & hiệu quả tại bệnh viện',
    description: 'Tư vấn phác đồ sử dụng thuốc an toàn cho bác sĩ, kiểm tra tương tác thuốc, theo dõi phản ứng có hại và phát triển các loại dược phẩm mới.',
    skills: ['Pharmacokinetics', 'Drug Interactions', 'Clinical Trials', 'Pharmaceutical Chemistry', 'Patient Counseling'],
    education: 'Dược sĩ Đại học (chuyên ngành Dược lâm sàng hoặc Dược học)',
    outlook: 'high'
  },
  {
    id: 'senior-nurse',
    title_vi: 'Điều dưỡng viên Cao cấp / Trưởng ca điều dưỡng',
    title_en: 'Senior Registered Nurse',
    category: 'Healthcare & Medicine',
    salary: '12,000,000 - 30,000,000 VND / tháng',
    growth: '+35% tỷ lệ bệnh viện công lập và quốc tế mở rộng quy mô giường bệnh',
    description: 'Thực hiện quy trình chăm sóc bệnh nhân chuyên sâu, giám sát hoạt động của hộ lý, hỗ trợ bác sĩ trong phòng mổ và quản lý hồ sơ bệnh án.',
    skills: ['Patient Monitoring', 'Nursing Care Plans', 'Medical Technology', 'Wound Care', 'Empathy & Communication'],
    education: 'Cử nhân Điều dưỡng (Đại học Y dược)',
    outlook: 'very-high'
  },
  {
    id: 'dentist',
    title_vi: 'Bác sĩ Răng Hàm Mặt (Nha sĩ)',
    title_en: 'Odonto-Stomatology Dentist / Orthodontist',
    category: 'Healthcare & Medicine',
    salary: '28,000,000 - 90,000,000 VND / tháng',
    growth: '+40% nhu cầu nha khoa thẩm mỹ & chăm sóc răng miệng tăng mạnh',
    description: 'Khám, điều trị bệnh lý về răng, nắn chỉnh răng (niềng răng), cấy ghép Implant và thực hiện các phẫu thuật thẩm mỹ hàm mặt.',
    skills: ['Oral Surgery', 'Orthodontics', 'Implantology', 'Aesthetic Dentistry', 'Dexterity'],
    education: 'Bác sĩ Răng Hàm Mặt chính quy (Đại học Y dược)',
    outlook: 'very-high'
  },
  {
    id: 'clinical-nutritionist',
    title_vi: 'Chuyên viên Dinh dưỡng Lâm sàng',
    title_en: 'Clinical Nutritionist & Dietitian',
    category: 'Healthcare & Medicine',
    salary: '12,000,000 - 28,000,000 VND / tháng',
    growth: '+25% phòng khám thiết lập chế độ ăn hồi phục sau phẫu thuật',
    description: 'Đánh giá tình trạng dinh dưỡng của bệnh nhân, thiết kế thực đơn ăn uống điều trị phù hợp cho người bệnh tiểu đường, ung thư, béo phì.',
    skills: ['Dietary Planning', 'Metabolic Assessment', 'Nutritional Science', 'Patient Motivation', 'Food Safety'],
    education: 'Cử nhân Dinh dưỡng hoặc Bác sĩ Y học dự phòng định hướng Dinh dưỡng',
    outlook: 'high'
  },
  {
    id: 'geneticist',
    title_vi: 'Bác sĩ Xét nghiệm & Di truyền học Lâm sàng',
    title_en: 'Clinical Pathologist & Geneticist',
    category: 'Healthcare & Medicine',
    salary: '22,000,000 - 55,000,000 VND / tháng',
    growth: '+30% y học chính xác ứng dụng xét nghiệm gen sàng lọc dị tật',
    description: 'Vận hành hệ thống máy giải trình tự gen thế hệ mới, phân tích tế bào và hỗ trợ chẩn đoán sớm các bệnh lý di truyền hoặc ung thư.',
    skills: ['DNA Sequencing', 'Lab Automation', 'Molecular Biology', 'Data Interpretation', 'Bioinformatics'],
    education: 'Bác sĩ Y khoa định hướng Xét nghiệm hoặc Cử nhân Kỹ thuật Xét nghiệm Y học',
    outlook: 'high'
  },
  {
    id: 'biomedical-engineer',
    title_vi: 'Kỹ sư Thiết bị Y tế (Biomedical Engineer)',
    title_en: 'Biomedical Equipment Engineer',
    category: 'Healthcare & Medicine',
    salary: '15,000,000 - 38,000,000 VND / tháng',
    growth: '+28% hiện đại hóa trang thiết bị phòng mổ và chẩn đoán hình ảnh',
    description: 'Lắp đặt, bảo trì, hiệu chuẩn các máy móc y tế phức tạp như MRI, CT, máy thở và thiết kế các cảm biến sức khỏe sinh học hiện đại.',
    skills: ['Electronics & Calibration', 'Biomedical Instrumentation', 'Medical Device Standards', 'Troubleshooting', 'SolidWorks'],
    education: 'Kỹ sư Kỹ thuật Y sinh hoặc Điện tử Y sinh',
    outlook: 'high'
  },
  {
    id: 'hospital-administrator',
    title_vi: 'Quản lý Hành chính & Dịch vụ Y tế',
    title_en: 'Healthcare & Hospital Administrator',
    category: 'Healthcare & Medicine',
    salary: '20,000,000 - 50,000,000 VND / tháng',
    growth: '+18% các tập đoàn y tế nước ngoài đầu tư xây dựng bệnh viện tư',
    description: 'Quản lý quy trình vận hành dịch vụ y tế, tối ưu hóa trải nghiệm bệnh nhân, kiểm soát ngân sách hoạt động và tuân thủ pháp luật y tế.',
    skills: ['Healthcare Operations', 'Hospitality Management', 'Budgeting', 'Healthcare Compliance', 'Leadership'],
    education: 'Cử nhân Quản lý Bệnh viện, Y tế công cộng hoặc Quản trị kinh doanh',
    outlook: 'stable'
  },
  {
    id: 'clinical-psychologist',
    title_vi: 'Chuyên gia Tâm lý học Lâm sàng',
    title_en: 'Clinical Psychologist',
    category: 'Healthcare & Medicine',
    salary: '15,000,000 - 40,000,000 VND / tháng',
    growth: '+35% nhận thức về sức khỏe tinh thần và stress học đường tăng cao',
    description: 'Thực hiện các liệu pháp tâm lý hỗ trợ khách hàng gặp rối loạn lo âu, trầm cảm, khủng hoảng tinh thần và tư vấn hàn gắn tâm lý.',
    skills: ['Psychological Therapy', 'Mental Assessment', 'Active Listening', 'Cognitive Behavioral Therapy (CBT)', 'Empathy'],
    education: 'Thạc sĩ hoặc Cử nhân Tâm lý học lâm sàng / Tâm lý học tham vấn',
    outlook: 'very-high'
  },
  {
    id: 'physical-therapist',
    title_vi: 'Chuyên gia Vật lý Trị liệu & Phục hồi chức năng',
    title_en: 'Physical & Occupational Therapist',
    category: 'Healthcare & Medicine',
    salary: '12,000,000 - 28,000,000 VND / tháng',
    growth: '+25% nhu cầu phục hồi chức năng sau tai biến & chấn thương thể thao',
    description: 'Thiết lập các bài tập vận động, sử dụng các thiết bị hồng ngoại, sóng ngắn để trị liệu phục hồi cơ khớp và chức năng sinh hoạt cho người bệnh.',
    skills: ['Kinesiology', 'Therapeutic Exercises', 'Anatomy', 'Manual Therapy', 'Patient Motivation'],
    education: 'Cử nhân Vật lý trị liệu và Phục hồi chức năng',
    outlook: 'high'
  },
  {
    id: 'speech-therapist',
    title_vi: 'Chuyên gia Trị liệu Ngôn ngữ (Âm ngữ trị liệu)',
    title_en: 'Speech-Language Pathologist',
    category: 'Healthcare & Medicine',
    salary: '14,000,000 - 35,000,000 VND / tháng',
    growth: '+30% nhu cầu can thiệp sớm cho trẻ chậm nói và người sau đột quỵ',
    description: 'Đánh giá và can thiệp điều trị cho các bệnh nhân bị rối loạn ngôn ngữ, rối loạn nuốt, nói lắp hoặc mất giọng do tổn thương thần kinh.',
    skills: ['Speech Therapy Techniques', 'Child Development', 'Swallowing Evaluation', 'Phonetics', 'Patience'],
    education: 'Cử nhân Âm ngữ trị liệu hoặc Cử nhân Giáo dục đặc biệt / Y tế định hướng âm ngữ',
    outlook: 'high'
  },

  // 3. Finance & Fintech
  {
    id: 'financial-analyst',
    title_vi: 'Chuyên viên Phân tích Đầu tư Tài chính',
    title_en: 'Financial Analyst',
    category: 'Finance & Fintech',
    salary: '16,000,000 - 45,000,000 VND / tháng',
    growth: '+20% số lượng công ty niêm yết chứng khoán & quỹ đầu tư mở rộng',
    description: 'Đánh giá tình hình tài chính doanh nghiệp, phân tích xu hướng cổ phiếu, thị trường trái phiếu để đưa ra khuyến nghị đầu tư tối ưu.',
    skills: ['Financial Modeling', 'Corporate Finance', 'Excel Pro', 'Valuation Methodologies', 'CFA Candidate'],
    education: 'Cử nhân Tài chính doanh nghiệp, Ngân hàng, Phân tích tài chính',
    outlook: 'high'
  },
  {
    id: 'risk-manager',
    title_vi: 'Chuyên gia Định giá & Quản trị Rủi ro tài chính',
    title_en: 'Risk Management & Actuary Specialist',
    category: 'Finance & Fintech',
    salary: '25,000,000 - 65,000,000 VND / tháng',
    growth: '+18% áp chuẩn quản trị rủi ro Basel II & III tại các ngân hàng Việt',
    description: 'Đo lường rủi ro tín dụng, rủi ro thị trường và xây dựng mô hình định phí bảo hiểm nhân thọ, phi nhân thọ nâng cao.',
    skills: ['Statistical Modeling', 'Basel Standards', 'Quantitative Analysis', 'SAS / R', 'Risk Assessment'],
    education: 'Cử nhân Thống kê tài chính, Định phí bảo hiểm (Actuarial), Toán tài chính',
    outlook: 'stable'
  },
  {
    id: 'corporate-auditor',
    title_vi: 'Chuyên viên Kiểm toán & Thuế Doanh nghiệp',
    title_en: 'Corporate Auditor & Tax Advisor',
    category: 'Finance & Fintech',
    salary: '15,000,000 - 40,000,000 VND / tháng',
    growth: '+15% yêu cầu minh bạch hóa báo cáo tài chính trong môi trường FDI',
    description: 'Thực hiện quy trình kiểm tra sổ sách kế toán, rà soát nghĩa vụ thuế và đảm bảo số liệu tuân thủ chuẩn mực VAS / IFRS.',
    skills: ['Accounting Standards (IFRS/VAS)', 'Auditing Procedures', 'Tax Regulations', 'Excel', 'ACCA / CPA'],
    education: 'Cử nhân Kiểm toán, Kế toán, Tài chính doanh nghiệp',
    outlook: 'stable'
  },
  {
    id: 'fintech-specialist',
    title_vi: 'Chuyên viên Phát triển Sản phẩm Fintech',
    title_en: 'Fintech Product Specialist',
    category: 'Finance & Fintech',
    salary: '25,000,000 - 60,000,000 VND / tháng',
    growth: '+35% tỷ lệ thanh toán không dùng tiền mặt và ví điện tử tích hợp AI',
    description: 'Nghiên cứu nhu cầu thanh toán di động, định cấu hình cổng giao dịch ví điện tử, cho vay ngang hàng (P2P) và đầu tư số.',
    skills: ['API Integration', 'Payment Gateways', 'User Flow Design', 'Market Analysis', 'Regulatory Tech (RegTech)'],
    education: 'Cử nhân Kinh tế đối ngoại, Công nghệ tài chính (Fintech) hoặc CNTT',
    outlook: 'very-high'
  },
  {
    id: 'investment-associate',
    title_vi: 'Nhà quản lý Quỹ & Đầu tư Mạo hiểm',
    title_en: 'Investment & Venture Capital Associate',
    category: 'Finance & Fintech',
    salary: '30,000,000 - 80,000,000 VND / tháng',
    growth: '+22% Việt Nam là điểm đến hàng đầu của các quỹ ngoại Đông Nam Á',
    description: 'Tìm kiếm dự án khởi nghiệp tiềm năng (Sourcing), thực hiện thẩm định đầu tư chuyên sâu (Due Diligence) và đàm phán thương vụ rót vốn.',
    skills: ['Due Diligence', 'Term Sheet Negotiation', 'Pitch Deck Assessment', 'Business Valuation', 'Market Trends'],
    education: 'Cử nhân/Thạc sĩ Quản trị kinh doanh, Tài chính quốc tế',
    outlook: 'high'
  },
  {
    id: 'quant-trader',
    title_vi: 'Chuyên viên Giao dịch Định lượng (Quant Trader)',
    title_en: 'Quantitative Trader / Analyst',
    category: 'Finance & Fintech',
    salary: '35,000,000 - 95,000,000 VND / tháng',
    growth: '+28% áp dụng thuật toán tự động giao dịch phái sinh & hàng hóa',
    description: 'Sử dụng toán học và lập trình để thiết kế mô hình dự báo biến động giá ngắn hạn, lập trình các robot tự động giao dịch trên sàn tài chính.',
    skills: ['Python / C++', 'Machine Learning', 'Statistical Arbitrage', 'Data Scraping', 'Time-series Analysis'],
    education: 'Cử nhân Toán tài chính, Khoa học máy tính hoặc Vật lý lý thuyết',
    outlook: 'high'
  },
  {
    id: 'financial-compliance',
    title_vi: 'Chuyên viên Phân tích An ninh Tài chính / Chống rửa tiền',
    title_en: 'AML & Financial Compliance Analyst',
    category: 'Finance & Fintech',
    salary: '18,000,000 - 45,000,000 VND / tháng',
    growth: '+30% siết chặt quy định phòng chống rửa tiền hệ thống ngân hàng số',
    description: 'Theo dõi, phát hiện các giao dịch đáng ngờ, đánh giá mức độ rủi ro tuân thủ pháp luật và chống tài trợ khủng bố cho tổ chức tài chính.',
    skills: ['AML Regulations', 'Transaction Monitoring', 'SQL', 'Forensic Audit', 'Risk Management'],
    education: 'Cử nhân Luật tài chính, Ngân hàng, Cảnh sát phòng chống tội phạm kinh tế',
    outlook: 'high'
  },

  // 4. Engineering & Environment
  {
    id: 'semiconductor-engineer',
    title_vi: 'Kỹ sư Thiết kế Vi mạch & Bán dẫn',
    title_en: 'Semiconductor & VLSI Design Engineer',
    category: 'Engineering & Environment',
    salary: '35,000,000 - 110,000,000 VND / tháng',
    growth: '+50% ưu tiên quốc gia thu hút làn sóng đầu tư Intel, Nvidia, Samsung',
    description: 'Thiết kế sơ đồ nguyên lý vi mạch tích hợp cỡ lớn (VLSI), kiểm thử chức năng logic của chip bán dẫn thế hệ mới.',
    skills: ['Verilog / VHDL', 'ASIC / FPGA Design', 'Cadence / Synopsys Tools', 'Python scripting', 'Silicon Debugging'],
    education: 'Kỹ sư Kỹ thuật Điện tử, Vi điện tử, Vật lý chất rắn',
    outlook: 'very-high'
  },
  {
    id: 'automation-engineer',
    title_vi: 'Kỹ sư Tự động hóa & Hệ thống SCADA',
    title_en: 'Automation & Control Systems Engineer',
    category: 'Engineering & Environment',
    salary: '18,000,000 - 48,000,000 VND / tháng',
    growth: '+25% xây dựng hệ thống nhà máy thông minh tự sản xuất tự động',
    description: 'Lập trình thiết bị PLC, thiết kế bảng điều khiển HMI và giám sát hệ thống điều khiển thu thập dữ liệu công nghiệp SCADA.',
    skills: ['PLC Programming (Siemens/Mitsubishi)', 'SCADA Systems', 'Industrial Networks', 'Control Theory', 'AutoCAD'],
    education: 'Kỹ sư Công nghệ kỹ thuật Điều khiển và Tự động hóa',
    outlook: 'high'
  },
  {
    id: 'mechatronics-robotics',
    title_vi: 'Kỹ sư Cơ điện tử & Thiết kế Robot',
    title_en: 'Mechatronics & Robotics Engineer',
    category: 'Engineering & Environment',
    salary: '20,000,000 - 52,000,000 VND / tháng',
    growth: '+30% triển khai cánh tay robot lắp ráp ô tô và xử lý kho hàng',
    description: 'Nghiên cứu, mô phỏng cơ học và chế tạo các cơ cấu chuyển động cơ điện tử, tích hợp trí tuệ nhân tạo điều điều khiển Robot tự hành AGV.',
    skills: ['SolidWorks / Catia', 'ROS (Robot Operating System)', 'Microcontroller Programming', 'MATLAB', 'Kinematics'],
    education: 'Kỹ sư Cơ điện tử, Kỹ thuật Robot',
    outlook: 'very-high'
  },
  {
    id: 'ev-engineer',
    title_vi: 'Kỹ sư Công nghệ Ô tô & Xe điện (EV)',
    title_en: 'EV & Electric Vehicle Powertrain Engineer',
    category: 'Engineering & Environment',
    salary: '22,000,000 - 60,000,000 VND / tháng',
    growth: '+35% chuyển dịch sang phương tiện giao thông xanh VinFast',
    description: 'Thiết kế cụm pin lithium-ion, bộ sạc, động cơ điện và hệ thống quản lý pin BMS thông minh cho các phương tiện xe điện thế hệ mới.',
    skills: ['Battery Management (BMS)', 'Electric Motors', 'AutoCAD / MATLAB', 'Embedded Systems', 'Thermal Simulation'],
    education: 'Kỹ sư Kỹ thuật Ô tô, Điện - Điện tử hoặc Kỹ thuật Nhiệt',
    outlook: 'very-high'
  },
  {
    id: 'urban-planner',
    title_vi: 'Kỹ sư Quy hoạch Đô thị & Hạ tầng thông minh',
    title_en: 'Urban Planner & Smart City Engineer',
    category: 'Engineering & Environment',
    salary: '16,000,000 - 42,000,000 VND / tháng',
    growth: '+18% đẩy mạnh hạ tầng đô thị nén và tuyến Metro đô thị',
    description: 'Quy hoạch không gian sống thông minh, tối ưu hóa giao thông công cộng, phân khu hạ tầng xanh chống ngập lụt thích ứng biến đổi khí hậu.',
    skills: ['ArcGIS / QGIS', 'Civil Engineering', 'Traffic Simulation', 'AutoCAD Map 3D', 'Zoning Regulations'],
    education: 'Kỹ sư Quy hoạch vùng và đô thị, Kỹ thuật Hạ tầng đô thị',
    outlook: 'stable'
  },
  {
    id: 'esg-advisor',
    title_vi: 'Chuyên viên Tư vấn Phát triển Bền vững & ESG',
    title_en: 'ESG & Carbon Credit Consultant',
    category: 'Engineering & Environment',
    salary: '20,000,000 - 55,000,000 VND / tháng',
    growth: '+40% yêu cầu lập báo cáo bắt buộc kiểm kê khí nhà kính',
    description: 'Tư vấn doanh nghiệp giảm phát thải các-bon, áp dụng chuẩn mực quản trị môi trường ESG, thương thảo giao dịch tín chỉ các-bon xuất khẩu.',
    skills: ['Carbon Accounting', 'ESG Frameworks (GRI/SASB)', 'Environmental Impact Assessment', 'Data Audit', 'Global Climate Policy'],
    education: 'Cử nhân Khoa học môi trường, Quản trị năng lượng bền vững, ESG hoặc Kinh tế môi trường',
    outlook: 'very-high'
  },
  {
    id: 'renewable-energy-eng',
    title_vi: 'Kỹ sư Năng lượng tái tạo (Điện gió & Mặt trời)',
    title_en: 'Renewable Energy Systems Engineer',
    category: 'Engineering & Environment',
    salary: '18,000,000 - 45,000,000 VND / tháng',
    growth: '+28% triển khai quy hoạch điện VIII đẩy mạnh điện gió ngoài khơi',
    description: 'Khảo sát thực địa, thiết kế mảng pin mặt trời áp mái và tua-bin điện gió tầm cao, bảo trì hệ thống trạm biến áp hòa lưới điện quốc gia.',
    skills: ['PVsyst (Solar Design)', 'Power Grid Simulation', 'Wind Turbine Tech', 'Electrical Safety', 'Project Engineering'],
    education: 'Kỹ sư Kỹ thuật Điện, Hệ thống điện hoặc Năng lượng tái tạo',
    outlook: 'high'
  },
  {
    id: 'green-landscape-architect',
    title_vi: 'Kiến trúc sư Cảnh quan Đô thị Xanh',
    title_en: 'Sustainable Landscape Architect',
    category: 'Engineering & Environment',
    salary: '15,000,000 - 35,000,000 VND / tháng',
    growth: '+20% nhu cầu khu đô thị sinh thái kết hợp nghỉ dưỡng xanh',
    description: 'Thiết kế không gian mở, công viên đô thị, vườn trên mái và hồ sinh học lọc nước tự nhiên giúp điều hòa vi khí hậu cho các tòa nhà.',
    skills: ['3D Modeling (SketchUp/Revit)', 'Horticulture & Botany', 'Sustainable Materials', 'Landscape Architecture', 'Creative Design'],
    education: 'Kiến trúc sư Cảnh quan (Đại học Kiến trúc / Xây dựng)',
    outlook: 'stable'
  },
  {
    id: 'cosmetic-chemical-eng',
    title_vi: 'Kỹ sư Công nghệ Hóa mỹ phẩm & Dược phẩm',
    title_en: 'Cosmetic & Pharmaceutical Formulation Chemist',
    category: 'Engineering & Environment',
    salary: '16,000,000 - 38,000,000 VND / tháng',
    growth: '+22% xu hướng sử dụng sản phẩm làm đẹp tự nhiên thảo mộc nội địa',
    description: 'Nghiên cứu, bào chế công thức kem dưỡng da, dầu gội, thuốc mỡ và thử nghiệm tính ổn định lý hóa, an toàn dị ứng sản phẩm.',
    skills: ['Formulation Science', 'Chemical Analysis', 'Lab Safety', 'FDA/GMP Standards', 'Materials Sourcing'],
    education: 'Kỹ sư Kỹ thuật Hóa học, Công nghệ Hóa mỹ phẩm',
    outlook: 'stable'
  },

  // 5. Management & Logistics
  {
    id: 'cold-chain-specialist',
    title_vi: 'Chuyên gia Chuỗi cung ứng lạnh (Nông sản & Vắc-xin)',
    title_en: 'Cold Chain & Refrigerated Logistics Specialist',
    category: 'Management & Logistics',
    salary: '18,000,000 - 42,000,000 VND / tháng',
    growth: '+30% xuất khẩu nông thủy sản và dược phẩm yêu cầu bảo quản nhiệt độ âm',
    description: 'Vận hành chuỗi xe đông lạnh, hệ thống tổng kho âm độ sâu và giám sát cảm biến đo độ ẩm, nhiệt độ từ nông trại tới tay người tiêu dùng.',
    skills: ['Temperature-controlled Logistics', 'Refrigeration Technology', 'HACCP Standards', 'Supply Chain Visibility', 'Telemetry Systems'],
    education: 'Cử nhân Logistics, Kỹ thuật nhiệt lạnh hoặc Kinh tế thủy sản',
    outlook: 'high'
  },
  {
    id: 'smart-warehouse-manager',
    title_vi: 'Quản lý Vận hành Kho thông minh (AGV & WMS)',
    title_en: 'Smart Warehouse & WMS Operations Manager',
    category: 'Management & Logistics',
    salary: '22,000,000 - 55,000,000 VND / tháng',
    growth: '+25% trung tâm chia chọn bưu phẩm siêu lớn tự động hóa',
    description: 'Giám sát điều phối hệ thống quản lý kho WMS, kiểm soát hoạt động của robot xếp dỡ hàng tự động AGV và tối ưu hóa không gian lưu kho bãi.',
    skills: ['Warehouse Management Systems (WMS)', 'Inventory Strategy', 'Robotic Logistics Coordination', 'Operations Analytics', 'Lean 5S'],
    education: 'Cử nhân Logistics và quản lý chuỗi cung ứng, Quản trị công nghiệp',
    outlook: 'very-high'
  },
  {
    id: 'import-export-specialist',
    title_vi: 'Chuyên viên Xuất Nhập Khẩu & Thương mại Quốc tế',
    title_en: 'Global Trade & Import-Export Specialist',
    category: 'Management & Logistics',
    salary: '12,000,000 - 32,000,000 VND / tháng',
    growth: '+15% thực thi hiệp định thương mại tự do thế hệ mới EVFTA, CPTPP',
    description: 'Soạn thảo hợp đồng ngoại thương, mở tờ khai hải quan, theo dõi lịch tàu biển hàng xuất nhập và kiểm soát bộ chứng từ thanh toán L/C.',
    skills: ['Incoterms 2020', 'Customs Declaration', 'International Payment', 'Shipping Documentation', 'English Negotiation'],
    education: 'Cử nhân Kinh tế đối ngoại, Thương mại quốc tế, Quản trị Logistics',
    outlook: 'stable'
  },
  {
    id: 'ecom-logistics-coordinator',
    title_vi: 'Nhà Điều phối Vận tải Thương mại Điện tử',
    title_en: 'E-commerce Last-Mile Delivery Coordinator',
    category: 'Management & Logistics',
    salary: '15,000,000 - 35,000,000 VND / tháng',
    growth: '+35% quy mô mua sắm qua TikTok Shop, Shopee tiếp tục bùng nổ',
    description: 'Tối ưu hóa chặng giao hàng cuối (Last-mile delivery), định tuyến tài xế công nghệ qua ứng dụng thông minh, xử lý khiếu nại hoàn trả hàng.',
    skills: ['Last-Mile Routing', 'Logistics Software', 'Performance Management', 'Data Analytics', 'Vendor Relationship'],
    education: 'Cử nhân Quản trị kinh doanh, Logistics hoặc Kinh tế số',
    outlook: 'very-high'
  },
  {
    id: 'logistics-manager',
    title_vi: 'Trưởng phòng Quản trị Chuỗi cung ứng & Logistics',
    title_en: 'Supply Chain & Logistics Director',
    category: 'Management & Logistics',
    salary: '35,000,000 - 85,000,000 VND / tháng',
    growth: '+28% Việt Nam là mắt xích dịch chuyển sản xuất lớn của thế giới',
    description: 'Hoạch định tổng thể dòng chảy nguyên vật liệu từ nhà cung ứng nước ngoài, điều tiết sản xuất nội địa và phân phối kênh đại lý.',
    skills: ['Strategic Sourcing', 'S&OP Planning', 'ERP / SAP', 'Contract Negotiation', 'Financial Oversight'],
    education: 'Thạc sĩ hoặc Cử nhân Quản trị chuỗi cung ứng, Kinh tế đối ngoại',
    outlook: 'very-high'
  },

  // 6. Marketing & Multimedia
  {
    id: 'digital-marketing-manager',
    title_vi: 'Quản lý Tiếp thị Kỹ thuật số (Digital Marketing)',
    title_en: 'Digital Marketing & Growth Manager',
    category: 'Marketing & Multimedia',
    salary: '20,000,000 - 55,000,000 VND / tháng',
    growth: '+20% dịch chuyển ngân sách quảng cáo truyền hình sang số hóa',
    description: 'Xây dựng chiến lược truyền thông đa kênh trực tuyến, phân bổ ngân sách quảng cáo Google/Facebook/TikTok Ads, tối ưu hóa chi phí CAC.',
    skills: ['Digital Strategy', 'Google Analytics / Ads', 'A/B Testing', 'Growth Hacking', 'Budget Allocation'],
    education: 'Cử nhân Tiếp thị (Marketing), Truyền thông chuyên nghiệp',
    outlook: 'stable'
  },
  {
    id: 'content-creator',
    title_vi: 'Chuyên viên Sáng tạo Nội dung Số (Content Creator)',
    title_en: 'Digital Content Creator & Copywriter',
    category: 'Marketing & Multimedia',
    salary: '10,000,000 - 28,000,000 VND / tháng',
    growth: '+32% các thương hiệu tận dụng video ngắn & tiếp thị người có ảnh hưởng',
    description: 'Lên ý tưởng kịch bản video xu hướng, viết bài tiếp thị chuẩn SEO, biên tập nội dung fanpage thương hiệu thu hút tương tác tự nhiên.',
    skills: ['Creative Writing', 'Video Editing (CapCut/Premiere)', 'SEO Copywriting', 'Social Media Management', 'AI Writing Assistants'],
    education: 'Cử nhân Báo chí, Ngữ văn, Quan hệ công chúng hoặc Quảng cáo',
    outlook: 'high'
  },
  {
    id: 'marketing-data-analyst',
    title_vi: 'Chuyên viên Phân tích Dữ liệu Tiếp thị',
    title_en: 'Marketing Data Analyst / MarTech Specialist',
    category: 'Marketing & Multimedia',
    salary: '18,000,000 - 45,000,000 VND / tháng',
    growth: '+28% áp dụng tiếp thị cá nhân hóa dựa trên Big Data khách hàng',
    description: 'Thu thập hành vi click chuột của khách hàng trên website, thiết lập hệ thống CDP (Customer Data Platform), đo lường chỉ số ROI quảng cáo.',
    skills: ['Google Tag Manager', 'SQL / Python', 'Customer Data Platforms (CDP)', 'Visualization (Looker)', 'Statistical Tools'],
    education: 'Cử nhân Thống kê dữ liệu, Kinh doanh số, Marketing ứng dụng',
    outlook: 'high'
  },
  {
    id: 'seo-specialist',
    title_vi: 'Chuyên gia Tối ưu hóa Tìm kiếm & Growth Hacker',
    title_en: 'SEO Specialist & Organic Traffic Architect',
    category: 'Marketing & Multimedia',
    salary: '12,000,000 - 32,000,000 VND / tháng',
    growth: '+25% tối ưu hóa lượng truy cập tự nhiên bền vững không cần trả phí quảng cáo',
    description: 'Nghiên cứu từ khóa thị trường, xây dựng chiến lược liên kết (Backlink), tối ưu hóa tốc độ tải trang kỹ thuật và cấu trúc nội dung On-page.',
    skills: ['Ahrefs / SEMrush', 'On-page / Off-page SEO', 'Technical SEO (HTML/Sitemap)', 'Keyword Research', 'Conversion Rate Optimization (CRO)'],
    education: 'Cử nhân Hệ thống thông tin, Tiếp thị số hoặc CNTT',
    outlook: 'stable'
  },
  {
    id: 'graphic-3d-designer',
    title_vi: 'Nhà Thiết kế Đồ họa & Chuyển động 3D',
    title_en: 'Graphic & 3D Motion Designer',
    category: 'Marketing & Multimedia',
    salary: '14,000,000 - 35,000,000 VND / tháng',
    growth: '+30% ngành sản xuất trò chơi, kỹ xảo điện ảnh và quảng cáo 3D phát triển',
    description: 'Tạo hình các nhân vật đồ họa, vẽ chất liệu bề mặt 3D, dựng chuyển động kỹ xảo điện ảnh và đóng gói sản phẩm truyền thông thương hiệu.',
    skills: ['Adobe Creative Suite', 'Blender / Cinema 4D', 'After Effects', 'Typography & Layout', 'Concept Design'],
    education: 'Cử nhân Mỹ thuật ứng dụng, Thiết kế đồ họa / Đa phương tiện',
    outlook: 'high'
  },
  {
    id: 'pr-manager',
    title_vi: 'Chuyên viên Quan hệ Công chúng & Thương hiệu',
    title_en: 'Public Relations (PR) Manager',
    category: 'Marketing & Multimedia',
    salary: '16,000,000 - 40,000,000 VND / tháng',
    growth: '+18% nhu cầu phòng ngừa khủng hoảng truyền thông mạng xã hội',
    description: 'Liên hệ hợp tác nhà báo, viết thông cáo báo chí sự kiện, quản trị rủi ro khủng hoảng tin đồn xấu và tổ chức các sự kiện cộng đồng CSR.',
    skills: ['Media Relations', 'Crisis Management', 'Press Release Writing', 'Corporate Communications', 'Event Organizing'],
    education: 'Cử nhân Quan hệ công chúng, Báo chí và Truyền thông',
    outlook: 'stable'
  },

  // 7. Agriculture & BioTech
  {
    id: 'food-biotech-eng',
    title_vi: 'Kỹ sư Công nghệ Sinh học Thực phẩm',
    title_en: 'Food BioTech & Fermentation Engineer',
    category: 'Agriculture & BioTech',
    salary: '16,000,000 - 38,000,000 VND / tháng',
    growth: '+22% ứng dụng vi sinh lên men bia, sữa chua và thực phẩm thuần chay',
    description: 'Nghiên cứu nuôi cấy các chủng vi sinh có lợi cho đường ruột, tối ưu quy trình lên men thực phẩm tự nhiên quy mô công nghiệp bảo vệ sức khỏe.',
    skills: ['Microbiology', 'Fermentation Engineering', 'Lab Analysis', 'GMP Food Quality', 'Enzyme Technology'],
    education: 'Kỹ sư Công nghệ sinh học, Công nghệ thực phẩm',
    outlook: 'high'
  },
  {
    id: 'aquaculture-specialist',
    title_vi: 'Chuyên gia Thủy sản & Lai tạo Giống thủy sinh',
    title_en: 'Aquaculture & Seafood Breeding Specialist',
    category: 'Agriculture & BioTech',
    salary: '15,000,000 - 35,000,000 VND / tháng',
    growth: '+25% vùng nuôi tôm cá da trơn Đồng bằng Sông Cửu Long áp chuẩn ASC/MSC',
    description: 'Kiểm soát chất lượng nước ao nuôi thâm canh, lai tạo dòng tôm sú chống bệnh đốm trắng, ứng dụng vắc-xin bảo vệ nguồn giống cá tra.',
    skills: ['Water Chemistry', 'Seafood Genetics', 'Diseases Prevention', 'ASC Certification standards', 'Hatchery Management'],
    education: 'Kỹ sư Nuôi trồng thủy sản, Bác sĩ Thú y chuyên khoa thủy sản',
    outlook: 'high'
  },
  {
    id: 'food-qaqc-engineer',
    title_vi: 'Kỹ sư Đảm bảo & Kiểm soát Chất lượng Thực phẩm',
    title_en: 'Food QA/QC Quality Engineer',
    category: 'Agriculture & BioTech',
    salary: '12,000,000 - 28,000,000 VND / tháng',
    growth: '+18% thắt chặt quy chuẩn vệ sinh an toàn thực phẩm đóng hộp xuất khẩu',
    description: 'Lấy mẫu kiểm tra hàm lượng kim loại nặng, dư lượng thuốc trừ sâu, viết quy trình thao tác chuẩn SOP đảm bảo an toàn nhà máy đóng gói đồ ăn.',
    skills: ['ISO 22000 / HACCP', 'Laboratory Testing', 'Internal Auditing', 'Food Microbiology', 'Statistical Quality Control'],
    education: 'Cử nhân Công nghệ thực phẩm, Kỹ thuật Hóa học sinh học',
    outlook: 'stable'
  },
  {
    id: 'urban-farming-specialist',
    title_vi: 'Chuyên gia Canh tác Nông nghiệp Đô thị',
    title_en: 'Urban Agriculture & Vertical Farming Specialist',
    category: 'Agriculture & BioTech',
    salary: '14,000,000 - 30,000,000 VND / tháng',
    growth: '+24% xu hướng trồng rau sạch thủy canh tuần hoàn tại các chung cư lớn',
    description: 'Thiết kế hệ thống giàn trồng rau đứng trong nhà kính (Vertical farming), tối ưu phổ ánh sáng đèn LED thay thế mặt trời cho rau củ ôn đới.',
    skills: ['Hydroponics / Aeroponics', 'Indoor Lighting Optimization', 'Nutrient Solutions Chemistry', 'Greenhouse Automation', 'Urban Agronomy'],
    education: 'Cử nhân Khoa học cây trồng, Nông nghiệp công nghệ cao',
    outlook: 'stable'
  },
  {
    id: 'agritech-iot-dev',
    title_vi: 'Kỹ sư Nông nghiệp số & IoT',
    title_en: 'AgriTech Automation & Sensor Specialist',
    category: 'Agriculture & BioTech',
    salary: '18,000,000 - 45,000,000 VND / tháng',
    growth: '+30% trang trại chăn nuôi bò sữa TH True Milk áp dụng định vị GPS hành vi',
    description: 'Tích hợp các cảm biến đo độ mặn, độ pH của đất nông nghiệp, lập trình tự động tưới phun sương nhỏ giọt Israel bằng AI điều tiết từ xa.',
    skills: ['Agricultural Sensor Protocols', 'Telemetry System Design', 'PLC / Microcontroller Programming', 'Data Analytics', 'Drone operation (GIS)'],
    education: 'Kỹ sư Cơ điện tử nông nghiệp, Kỹ thuật IoT hoặc Nông nghiệp số',
    outlook: 'very-high'
  },

  // 8. Education & Public Services
  {
    id: 'special-ed-teacher',
    title_vi: 'Giáo viên Tiểu học & Giáo dục Đặc biệt',
    title_en: 'Primary & Special Education Teacher',
    category: 'Education & Public Services',
    salary: '10,000,000 - 25,000,000 VND / tháng',
    growth: '+28% nhu cầu chăm sóc can thiệp trẻ tự kỷ & tăng động tăng nhanh',
    description: 'Thiết kế giáo án chuyên biệt giúp đỡ trẻ chậm phát triển trí tuệ, tự kỷ, tăng động giảm chú ý hòa nhập sớm vào môi trường tiểu học.',
    skills: ['Special Education Pedagogy', 'Child Psychology', 'Individualized Education Programs (IEP)', 'Behavioral Management', 'Compassion'],
    education: 'Cử nhân Giáo dục đặc biệt hoặc Giáo dục tiểu học (Đại học Sư phạm)',
    outlook: 'high'
  },
  {
    id: 'edtech-trainer',
    title_vi: 'Chuyên gia Đào tạo Doanh nghiệp & EdTech',
    title_en: 'Corporate EdTech Instructional Designer',
    category: 'Education & Public Services',
    salary: '16,000,000 - 42,000,000 VND / tháng',
    growth: '+32% các tập đoàn xây dựng nền tảng học tập trực tuyến (E-learning) nội bộ',
    description: 'Xây dựng bài giảng tương tác bằng video hoạt hình, định hình hệ thống quản trị học tập LMS phục vụ nâng cấp kỹ năng nghề nghiệp cho nhân viên.',
    skills: ['LMS Administrating', 'E-learning Authoring Tools (Articulate)', 'Curriculum Design', 'Public Speaking', 'Instructional Design'],
    education: 'Cử nhân Quản lý giáo dục, Sư phạm công nghệ hoặc Phát triển tổ chức',
    outlook: 'high'
  },
  {
    id: 'educational-consultant',
    title_vi: 'Chuyên viên Tư vấn Du học & Tuyển sinh hướng nghiệp',
    title_en: 'Study Abroad & Education Consultant',
    category: 'Education & Public Services',
    salary: '12,000,000 - 35,000,000 VND / tháng',
    growth: '+20% số lượng gia đình trung lưu mong muốn cho con đi học nước ngoài',
    description: 'Đánh giá học lực và khả năng tài chính của học sinh, xây dựng hồ sơ xin học bổng, tư vấn chọn ngành, quốc gia du học phù hợp nhất.',
    skills: ['Scholarship Coaching', 'Foreign Visa Procedures', 'Admission Essay Editing', 'English Fluency', 'Client Consultation'],
    education: 'Cử nhân Ngôn ngữ Anh, Quan hệ quốc tế hoặc Sư phạm',
    outlook: 'stable'
  },
  {
    id: 'simultaneous-interpreter',
    title_vi: 'Phiên dịch viên Cabin Cao cấp (Simultaneous)',
    title_en: 'Simultaneous Conference Interpreter',
    category: 'Education & Public Services',
    salary: '35,000,000 - 120,000,000 VND / tháng',
    growth: '+15% hội nghị thương mại Liên Hợp Quốc, ngoại giao cấp quốc gia',
    description: 'Dịch trực tiếp song song (cabin) các bài phát biểu kinh tế vĩ mô, hiệp ước quốc tế từ tiếng Anh sang tiếng Việt và ngược lại trong tích tắc.',
    skills: ['Simultaneous Translation', 'Advanced Vocabulary', 'High Concentration', 'Cultural Context Understanding', 'Professional Ethics'],
    education: 'Cử nhân/Thạc sĩ Biên phiên dịch (Đại học Ngoại ngữ / Ngoại giao)',
    outlook: 'stable'
  },
  {
    id: 'corporate-legal-counsel',
    title_vi: 'Chuyên viên Pháp lý Doanh nghiệp',
    title_en: 'Corporate Legal Counsel & Compliance Officer',
    category: 'Education & Public Services',
    salary: '18,000,000 - 55,000,000 VND / tháng',
    growth: '+22% các vụ tranh chấp sở hữu trí tuệ và thương mại đa quốc gia gia tăng',
    description: 'Soạn thảo điều khoản hợp đồng kinh tế, rà soát tính hợp pháp của các giao dịch thương mại và xử lý tranh chấp lao động doanh nghiệp.',
    skills: ['Contract Law', 'Corporate Governance', 'Intellectual Property', 'Legal Drafting', 'Dispute Resolution'],
    education: 'Cử nhân Luật kinh tế / Luật thương mại quốc tế',
    outlook: 'high'
  },
  {
    id: 'hrbp-specialist',
    title_vi: 'Chuyên viên Quản trị Nguồn nhân lực chiến lược',
    title_en: 'HR Business Partner (HRBP)',
    category: 'Education & Public Services',
    salary: '20,000,000 - 48,000,000 VND / tháng',
    growth: '+20% chuyển dịch từ nhân sự hành chính sang nhân sự chiến lược đồng hành',
    description: 'Phối hợp với các trưởng bộ phận kinh doanh để xây dựng sơ đồ tổ chức phòng ban, hoạch định nguồn nhân lực, đo lường năng suất KPI.',
    skills: ['Strategic HR Planning', 'Employee Relations', 'KPI Systems design', 'Talent Sourcing', 'Change Management'],
    education: 'Cử nhân Quản trị nguồn nhân lực, Tâm lý học lao động, Quản trị kinh doanh',
    outlook: 'high'
  },
  {
    id: 'hospitality-senior-care',
    title_vi: 'Quản lý Khu Dưỡng lão & Dịch vụ Chăm sóc cao tuổi',
    title_en: 'Elderly Care Resort & Hospitality Manager',
    category: 'Education & Public Services',
    salary: '16,000,000 - 38,000,000 VND / tháng',
    growth: '+35% xu hướng già hóa dân số nhanh tại Việt Nam mở ra ngành dưỡng lão dịch vụ',
    description: 'Điều hành khu căn hộ dưỡng lão cao cấp, thiết kế các chương trình sinh hoạt thể chất tinh thần và quản lý đội ngũ y tá chăm sóc người cao tuổi.',
    skills: ['Gerontology Services Management', 'Hospitality Operations', 'Elderly Psychology', 'Dietary Management', 'Safety standards'],
    education: 'Cử nhân Quản lý dịch vụ du lịch & lữ hành, Y tế công cộng hoặc Công tác xã hội',
    outlook: 'very-high'
  },
  {
    id: 'school-psychologist',
    title_vi: 'Chuyên gia Tâm lý học Đường & Hướng nghiệp',
    title_en: 'School Psychologist & Career Guidance Counselor',
    category: 'Education & Public Services',
    salary: '12,000,000 - 30,000,000 VND / tháng',
    growth: '+32% các trường THCS và THPT bắt buộc thành lập văn phòng tham vấn tâm lý học sinh',
    description: 'Giải quyết các lo âu, bạo lực học đường, áp lực đồng trang lứa và thực hiện các trắc nghiệm định hướng nghề nghiệp RIASEC cho học sinh.',
    skills: ['Student Counseling', 'RIASEC profiling interpretation', 'Crisis Intervention', 'Behavioral assessment', 'Workshop organizing'],
    education: 'Cử nhân Tâm lý học đường hoặc Tâm lý học sư phạm',
    outlook: 'very-high'
  },
  {
    id: 'cx-specialist',
    title_vi: 'Chuyên viên Quản trị Trải nghiệm Khách hàng',
    title_en: 'Customer Experience (CX) Specialist',
    category: 'Education & Public Services',
    salary: '15,000,000 - 38,000,000 VND / tháng',
    growth: '+25% cuộc đua nâng cao chỉ số đo lường hài lòng khách hàng NPS',
    description: 'Vẽ bản đồ hành trình trải nghiệm của khách hàng (Customer Journey Map), tìm kiếm các điểm nghẽn gây phiền lòng và đề xuất giải pháp cải thiện chất lượng phục vụ.',
    skills: ['Customer Journey Mapping', 'NPS / CSAT Measurement', 'Data Analysis', 'Empathy', 'Cross-functional Collaboration'],
    education: 'Cử nhân Tiếp thị, Quản trị kinh doanh hoặc Tâm lý xã hội',
    outlook: 'high'
  }
];

interface Props {
  lang: 'en' | 'vi';
  onConsult: (careerTitle: string) => void;
}

export const HotCareersVietnam: React.FC<Props> = ({ lang, onConsult }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const categories = [
    'All', 
    'Information Technology', 
    'Healthcare & Medicine', 
    'Finance & Fintech', 
    'Engineering & Environment', 
    'Management & Logistics', 
    'Marketing & Multimedia', 
    'Agriculture & BioTech', 
    'Education & Public Services'
  ];

  const getCategoryLabel = (cat: string) => {
    if (lang !== 'vi') return cat;
    const map: Record<string, string> = {
      'All': 'Tất cả',
      'Information Technology': 'Công nghệ thông tin',
      'Healthcare & Medicine': 'Y tế & Y khoa',
      'Finance & Fintech': 'Tài chính & Fintech',
      'Engineering & Environment': 'Kỹ thuật & Môi trường',
      'Management & Logistics': 'Chuỗi cung ứng & Vận tải',
      'Marketing & Multimedia': 'Tiếp thị & Truyền thông số',
      'Agriculture & BioTech': 'Nông nghiệp & Sinh học',
      'Education & Public Services': 'Giáo dục & Dịch vụ công',
    };
    return map[cat] || cat;
  };

  const filteredJobs = JOBS_VIETNAM.filter(job => {
    const matchesCat = selectedCategory === 'All' || job.category === selectedCategory;
    const matchesSearch = job.title_vi.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.title_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-gray-50/50 dark:bg-black p-6">
      
      {/* Upper Intro & Disclaimer */}
      <div className="mb-8 max-w-4xl">
        <div className="flex items-center gap-2 mb-2 text-xs font-bold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase">
          <span>● TRENDING IN VIETNAM</span>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">
          {lang === 'vi' ? 'Gợi Ý Nghề Nghiệp Khởi Sắc 2026' : 'Trending Careers Vietnam 2026'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-4">
          {lang === 'vi' 
            ? 'Danh sách các ngành nghề dẫn đầu về nhu cầu tuyển dụng, thu hút nguồn vốn FDI vững mạnh và phát triển sôi nổi tại thị trường Việt Nam hiện nay.' 
            : 'Explore top roles leading the Vietnamese job market in employment growth, FDI investments, and industry revolutions.'}
        </p>

        {/* HIGHLY COMPLIANT DISCLAIMER IN GOLD CANVASES */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs leading-relaxed flex gap-3">
          <svg className="w-5 h-5 flex-shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <strong>{lang === 'vi' ? 'Tuyên bố miễn trừ trách nhiệm:' : 'Disclaimer:'}</strong>{' '}
            {lang === 'vi'
              ? 'Mọi số liệu và gợi ý xu hướng chỉ mang tính chất tham khảo dựa trên báo cáo thị trường lao động tổng quát 2026. Công nghệ AI hay các bộ gợi ý hoàn toàn không thay thế được sự tư vấn, tầm nhìn sắc bén từ các tư vấn viên nghề nghiệp chuyên nghiệp thực tế.'
              : 'All market trends and salary estimates are for informational reference purposes. AI recommendations do NOT substitute for direct strategic consultations with human professional career coaches.'}
          </div>
        </div>

        <div className="mt-4">
          <InlineGuide 
            sectionKey="trending-careers"
            lang={lang === 'vi' ? 'vi' : 'en'}
            title={lang === 'vi' ? "💡 Hướng dẫn khám phá xu hướng" : "💡 Trending Careers Guide"}
            steps={lang === 'vi' ? [
              "Chọn một Danh mục ngành nghề ở bộ lọc (vd: Công nghệ thông tin, Nông nghiệp...) hoặc nhập từ khóa tìm kiếm.",
              "Đọc kĩ phân tích chi tiết về mức thu nhập trung bình tại Việt Nam, tăng trưởng việc làm và kiến thức cần tích lũy.",
              "Click 'Thảo luận với AI' ở góc bất kỳ thẻ nghề nghiệp nào. Hệ thống tự động chuyển sang trang Trò chuyện với câu hỏi nạp sẵn về cách dấn thân lập nghiệp cho ngành đó."
            ] : [
              "Select an Industry category or type key terms inside the search field.",
              "Examine custom metrics: Average VN income bands, national growth ratios, core skills, and degrees.",
              "Click 'Discuss with AI' on any career profile to jump directly to Chat, pre-populated with questions about building a career path for that specific job."
            ]}
          />
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'bg-white dark:bg-[#111] border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-indigo-400'
              }`}
            >
              {getCategoryLabel(cat)}
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={lang === 'vi' ? 'Tìm kiếm tên nghề...' : 'Search jobs...'}
            className="w-full md:w-64 pl-9 pr-4 py-2 bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-indigo-500 dark:text-white transition-all"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Bento Grid layout of Jobs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map(job => (
          <motion.div
            key={job.id}
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="glow-card rounded-3xl p-6 bg-white dark:bg-[#0c0c0c] border border-gray-100 dark:border-white/5 shadow-sm flex flex-col justify-between cursor-pointer"
          >
            <div>
              {/* Category tag */}
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                  {getCategoryLabel(job.category)}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${
                  job.outlook === 'very-high' 
                    ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400'
                    : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                }`}>
                  {job.outlook === 'very-high' 
                    ? (lang === 'vi' ? 'Tăng trưởng phi mã' : 'Booming Outlook')
                    : (lang === 'vi' ? 'Ổn định & Cao' : 'High Growth')}
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 leading-snug">
                {lang === 'vi' ? job.title_vi : job.title_en}
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mb-3">
                {lang === 'vi' ? job.title_en : job.title_vi}
              </p>

              {/* Salary Section */}
              <div className="p-3 bg-gray-50 dark:bg-[#111] rounded-xl border border-gray-100 dark:border-white/5 mb-4">
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                  {lang === 'vi' ? 'THU NHẬP ƯỚC TÍNH' : 'ESTIMATED SALARY'}
                </div>
                <div className="text-sm font-black text-indigo-600 dark:text-indigo-400 font-mono">
                  {job.salary}
                </div>
                <div className="text-[10px] text-emerald-500 font-medium mt-1">
                  {job.growth}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                {job.description}
              </p>

              {/* Essential Skills */}
              <div className="mb-4">
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">
                  {lang === 'vi' ? 'KỸ NĂNG THEN CHỐT' : 'ESSENTIAL SKILLS'}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {job.skills.map((skill, sIdx) => (
                    <span key={`${job.id}-${skill}-${sIdx}`} className="px-2 py-0.5 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 rounded text-[10px] font-mono border border-gray-200/40 dark:border-white/5">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div className="mb-4">
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                  {lang === 'vi' ? 'ĐỊNH HƯỚNG HỌC PHẦN' : 'RECOMMENDED DEGREE'}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 block font-medium">
                  {job.education}
                </p>
              </div>
            </div>

            {/* Quick Consultation Trigger */}
            <button
              onClick={() => onConsult(lang === 'vi' ? job.title_vi : job.title_en)}
              className="mt-2 w-full flex items-center justify-center gap-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {lang === 'vi' ? 'Tư vấn chuyên sâu qua AI' : 'Consult with Career AI'}
            </button>
          </motion.div>
        ))}

        {filteredJobs.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400 text-sm">
            {lang === 'vi' ? 'Không tìm thấy kết quả nào phù hợp.' : 'No matching career found.'}
          </div>
        )}
      </div>
    </div>
  );
};
