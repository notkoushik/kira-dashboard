// ============================================
// DATABASE TYPES
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  daily_goal?: number;
  profile_data?: {
    location?: string;
    tech_stack?: string;
    target_roles?: string;
    experience?: string;
    github?: string;
    linkedin?: string;
  };
  created_at: string;
  updated_at: string;
}

export type JobStatus = 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Rejected';
export type JobPortal = 'LinkedIn' | 'Naukri' | 'Wellfound' | 'Hirist' | 'Foundit' | 'Cutshort' | 'Instahyre' | 'Direct' | 'Other';

export interface Job {
  id: string;
  user_id: string;
  company: string;
  role: string;
  portal: JobPortal;
  status: JobStatus;
  apply_link?: string;
  hr_name?: string;
  hr_linkedin?: string;
  notes?: string;
  date_added: string;
  created_at: string;
  updated_at: string;
}

export type HRStatus = 'Not Contacted' | 'Email Drafted' | 'Email Sent' | 'LinkedIn Connected' | 'Replied' | 'Rejected';

export interface HRContact {
  id: string;
  user_id: string;
  name: string;
  title?: string;
  company?: string;
  linkedin_url?: string;
  email?: string;
  status: HRStatus;
  notes?: string;
  last_contact?: string;
  created_at: string;
  updated_at: string;
}

export interface DailyLog {
  id: string;
  user_id: string;
  log_text: string;
  log_date: string;
  tasks_completed: number;
  streak_count: number;
  created_at: string;
}

export type QueueStatus = 'To Apply' | 'Applied' | 'Skipped';
export type Priority = 'High' | 'Medium';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface ApplyQueue {
  id: string;
  user_id: string;
  company: string;
  role: string;
  apply_link?: string;
  portal: JobPortal;
  difficulty: Difficulty;
  priority: Priority;
  fit_reason?: string;
  status: QueueStatus;
  date_added: string;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlannerTask {
  id: string;
  user_id: string;
  task_slot: string; // '8:00 AM', '10:00 AM', '12:00 PM', '6:00 PM'
  task_date: string;
  completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================
// AUTH TYPES
// ============================================

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password_hash'>;
  token: string;
  refreshToken?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

// ============================================
// ERROR TYPES
// ============================================

export interface AppError extends Error {
  status: number;
  code: string;
  details?: any;
}

// ============================================
// REQUEST EXTENSION
// ============================================

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      email?: string;
      user?: Omit<User, 'password_hash'>;
    }
  }
}
