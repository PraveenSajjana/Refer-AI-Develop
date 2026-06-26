-- ReferAI MySQL Database Schema
-- Run this script to create the complete database

CREATE DATABASE IF NOT EXISTS referai;
USE referai;

-- Users table (base for all roles)
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  role ENUM('candidate', 'employee', 'recruiter', 'admin', 'student') NOT NULL DEFAULT 'candidate',
  is_verified BOOLEAN DEFAULT FALSE,
  points INT DEFAULT 0,
  plan ENUM('free', 'premium', 'recruiter_basic', 'recruiter_pro', 'enterprise') DEFAULT 'free',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Candidate profiles
CREATE TABLE IF NOT EXISTS candidate_profiles (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) UNIQUE NOT NULL,
  phone VARCHAR(50),
  location VARCHAR(255),
  linkedin_url VARCHAR(500),
  github_url VARCHAR(500),
  portfolio_url VARCHAR(500),
  headline VARCHAR(255),
  bio TEXT,
  years_experience INT DEFAULT 0,
  current_role_title VARCHAR(255),
  current_company VARCHAR(255),
  skills JSON DEFAULT ('[]'),
  resume_url VARCHAR(500),
  resume_score INT DEFAULT 0,
  linkedin_score INT DEFAULT 0,
  ats_score INT DEFAULT 0,
  assessment_score INT DEFAULT 0,
  interview_score INT DEFAULT 0,
  profile_completeness INT DEFAULT 0,
  referral_readiness_score INT DEFAULT 0,
  recommendation ENUM('Highly Recommended', 'Recommended', 'Not Recommended') DEFAULT 'Not Recommended',
  linkedin_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Employee profiles
CREATE TABLE IF NOT EXISTS employee_profiles (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) UNIQUE NOT NULL,
  company VARCHAR(255) NOT NULL,
  designation VARCHAR(255) NOT NULL,
  company_email VARCHAR(255),
  linkedin_url VARCHAR(500),
  company_email_verified BOOLEAN DEFAULT FALSE,
  linkedin_verified BOOLEAN DEFAULT FALSE,
  trust_score INT DEFAULT 0,
  total_referrals INT DEFAULT 0,
  successful_referrals INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Student profiles
CREATE TABLE IF NOT EXISTS student_profiles (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) UNIQUE NOT NULL,
  college VARCHAR(255),
  degree VARCHAR(255),
  branch VARCHAR(255),
  graduation_year INT,
  cgpa DECIMAL(4,2),
  skills JSON DEFAULT ('[]'),
  github_url VARCHAR(500),
  linkedin_url VARCHAR(500),
  resume_url VARCHAR(500),
  internship_readiness_score INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Companies
CREATE TABLE IF NOT EXISTS companies (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  logo_url VARCHAR(500),
  industry VARCHAR(255),
  size VARCHAR(100),
  website VARCHAR(500),
  description TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jobs
CREATE TABLE IF NOT EXISTS jobs (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  title VARCHAR(255) NOT NULL,
  company_id CHAR(36),
  company_name VARCHAR(255) NOT NULL,
  company_logo VARCHAR(500),
  location VARCHAR(255),
  job_type ENUM('full_time', 'part_time', 'contract', 'internship', 'remote') DEFAULT 'full_time',
  experience_min INT DEFAULT 0,
  experience_max INT DEFAULT 10,
  salary_min INT,
  salary_max INT,
  description TEXT,
  requirements JSON DEFAULT ('[]'),
  skills_required JSON DEFAULT ('[]'),
  skills_preferred JSON DEFAULT ('[]'),
  posted_by CHAR(36),
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  application_count INT DEFAULT 0,
  views INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (posted_by) REFERENCES users(id)
);

-- Internships
CREATE TABLE IF NOT EXISTS internships (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  title VARCHAR(255) NOT NULL,
  company_id CHAR(36),
  company_name VARCHAR(255) NOT NULL,
  company_logo VARCHAR(500),
  location VARCHAR(255),
  is_remote BOOLEAN DEFAULT FALSE,
  duration VARCHAR(100),
  stipend_min INT,
  stipend_max INT,
  description TEXT,
  skills_required JSON DEFAULT ('[]'),
  openings INT DEFAULT 1,
  posted_by CHAR(36),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (posted_by) REFERENCES users(id)
);

-- Referral requests
CREATE TABLE IF NOT EXISTS referral_requests (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  candidate_id CHAR(36) NOT NULL,
  employee_id CHAR(36) NOT NULL,
  job_id CHAR(36),
  status ENUM('requested', 'accepted', 'rejected', 'referred', 'shortlisted', 'interview', 'offer', 'hired') DEFAULT 'requested',
  cover_letter TEXT,
  jd_match_score INT,
  candidate_message TEXT,
  employee_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (candidate_id) REFERENCES users(id),
  FOREIGN KEY (employee_id) REFERENCES users(id),
  FOREIGN KEY (job_id) REFERENCES jobs(id)
);

-- Assessments
CREATE TABLE IF NOT EXISTS assessments (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  job_id CHAR(36),
  assessment_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  questions JSON DEFAULT ('[]'),
  total_questions INT DEFAULT 0,
  time_limit INT DEFAULT 30,
  status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
  score INT,
  integrity_score INT DEFAULT 100,
  started_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (job_id) REFERENCES jobs(id)
);

-- Interview sessions
CREATE TABLE IF NOT EXISTS interview_sessions (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  job_id CHAR(36),
  mode ENUM('text', 'voice') DEFAULT 'text',
  interview_type ENUM('technical', 'hr', 'mixed') DEFAULT 'technical',
  questions JSON DEFAULT ('[]'),
  answers JSON DEFAULT ('[]'),
  technical_score INT,
  communication_score INT,
  confidence_score INT,
  problem_solving_score INT,
  overall_score INT,
  status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
  report JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (job_id) REFERENCES jobs(id)
);

-- Resume analyses
CREATE TABLE IF NOT EXISTS resume_analyses (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  resume_url VARCHAR(500),
  extracted_skills JSON DEFAULT ('[]'),
  experience_years INT,
  education_data JSON DEFAULT ('[]'),
  certifications JSON DEFAULT ('[]'),
  projects_data JSON DEFAULT ('[]'),
  resume_score INT,
  missing_skills JSON DEFAULT ('[]'),
  suggestions JSON DEFAULT ('[]'),
  ats_score INT,
  ats_keywords_missing JSON DEFAULT ('[]'),
  ats_suggestions JSON DEFAULT ('[]'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  link VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Community forums
CREATE TABLE IF NOT EXISTS forum_posts (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  author_id CHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category ENUM('general', 'interview_tips', 'career_advice', 'company_reviews', 'job_search', 'study_groups') DEFAULT 'general',
  tags JSON DEFAULT ('[]'),
  upvotes INT DEFAULT 0,
  views INT DEFAULT 0,
  reply_count INT DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id)
);

-- Forum replies
CREATE TABLE IF NOT EXISTS forum_replies (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  post_id CHAR(36) NOT NULL,
  author_id CHAR(36) NOT NULL,
  content TEXT NOT NULL,
  upvotes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id)
);

-- Badges
CREATE TABLE IF NOT EXISTS user_badges (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  badge_type VARCHAR(100) NOT NULL,
  badge_name VARCHAR(255) NOT NULL,
  awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  plan VARCHAR(100) NOT NULL,
  status ENUM('active', 'cancelled', 'expired') DEFAULT 'active',
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  amount INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Education entries
CREATE TABLE IF NOT EXISTS education (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  institution VARCHAR(255) NOT NULL,
  degree VARCHAR(255) NOT NULL,
  field VARCHAR(255),
  start_year INT,
  end_year INT,
  grade VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Experience entries
CREATE TABLE IF NOT EXISTS work_experience (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  company VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  tech_stack JSON DEFAULT ('[]'),
  url VARCHAR(500),
  github_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Certifications
CREATE TABLE IF NOT EXISTS certifications (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  issuer VARCHAR(255),
  issue_date DATE,
  expiry_date DATE,
  credential_id VARCHAR(255),
  credential_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert seed companies
INSERT INTO companies (id, name, industry, size, description, verified) VALUES
('10000000-0000-0000-0000-000000000001', 'Google', 'Technology', 'Enterprise', 'Leading technology company', TRUE),
('10000000-0000-0000-0000-000000000002', 'Microsoft', 'Technology', 'Enterprise', 'Software and cloud solutions', TRUE),
('10000000-0000-0000-0000-000000000003', 'Amazon', 'Technology/E-commerce', 'Enterprise', 'E-commerce and cloud computing', TRUE),
('10000000-0000-0000-0000-000000000004', 'Flipkart', 'E-commerce', 'Enterprise', 'Leading Indian e-commerce platform', TRUE),
('10000000-0000-0000-0000-000000000005', 'Infosys', 'IT Services', 'Enterprise', 'Global IT consulting firm', TRUE),
('10000000-0000-0000-0000-000000000006', 'TCS', 'IT Services', 'Enterprise', 'India''s largest IT company', TRUE),
('10000000-0000-0000-0000-000000000007', 'Swiggy', 'Food Tech', 'Mid-size', 'Food delivery platform', TRUE),
('10000000-0000-0000-0000-000000000008', 'Zomato', 'Food Tech', 'Mid-size', 'Restaurant discovery and food delivery', TRUE),
('10000000-0000-0000-0000-000000000009', 'PhonePe', 'Fintech', 'Mid-size', 'Digital payments platform', TRUE),
('10000000-0000-0000-0000-000000000010', 'Razorpay', 'Fintech', 'Mid-size', 'Payment gateway solutions', TRUE)
ON DUPLICATE KEY UPDATE name = VALUES(name);
