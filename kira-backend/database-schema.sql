-- ============================================
-- KIRA Backend - Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  profile_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. JOBS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  portal VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Applied',
  apply_link VARCHAR(500),
  hr_name VARCHAR(255),
  hr_linkedin VARCHAR(500),
  notes TEXT,
  date_added TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. HR_CONTACTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS hr_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  company VARCHAR(255),
  linkedin_url VARCHAR(500),
  email VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'Not Contacted',
  notes TEXT,
  last_contact TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. DAILY_LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  log_text TEXT,
  log_date DATE NOT NULL,
  tasks_completed INTEGER DEFAULT 0,
  streak_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. APPLY_QUEUE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS apply_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  apply_link VARCHAR(500),
  portal VARCHAR(50) NOT NULL,
  difficulty VARCHAR(50) NOT NULL DEFAULT 'Medium',
  priority VARCHAR(50) NOT NULL DEFAULT 'Medium',
  fit_reason TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'To Apply',
  date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. PLANNER_TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS planner_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_slot VARCHAR(50) NOT NULL,
  task_date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CREATE INDEXES FOR BETTER PERFORMANCE
-- ============================================

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Jobs
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_user_status ON jobs(user_id, status);

-- HR Contacts
CREATE INDEX IF NOT EXISTS idx_hr_contacts_user_id ON hr_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_hr_contacts_status ON hr_contacts(status);

-- Daily Logs
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_id ON daily_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON daily_logs(user_id, log_date);

-- Apply Queue
CREATE INDEX IF NOT EXISTS idx_apply_queue_user_id ON apply_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_apply_queue_status ON apply_queue(status);
CREATE INDEX IF NOT EXISTS idx_apply_queue_archived ON apply_queue(archived);

-- Planner Tasks
CREATE INDEX IF NOT EXISTS idx_planner_tasks_user_id ON planner_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_planner_tasks_date ON planner_tasks(task_date);
CREATE INDEX IF NOT EXISTS idx_planner_tasks_user_date ON planner_tasks(user_id, task_date);

-- ============================================
-- DONE! Tables created successfully
-- ============================================
