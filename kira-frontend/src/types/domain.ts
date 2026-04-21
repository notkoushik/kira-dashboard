/**
 * Domain Types
 * Core business entities and models
 */

export interface User {
  id: string;
  email: string;
  name: string;
  location?: string;
  techStack?: string[];
  targetRoles?: string[];
  experience?: string;
  github?: string;
  linkedin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  company: string;
  role: string;
  portalUrl: string;
  portal: string;
  status: 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Rejected' | 'Saved';
  hrName?: string;
  hrEmail?: string;
  jobScore?: number;
  notes?: string;
  appliedDate?: string;
  salary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HRContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  role?: string;
  status: 'Contacted' | 'Interested' | 'Rejected' | 'No Response' | 'Saved';
  linkedin?: string;
  lastOutreach?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QueueItem {
  id: string;
  jobId: string;
  company: string;
  role: string;
  priority: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: 'Pending' | 'Applied' | 'Failed' | 'Skipped';
  appliedDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyLog {
  id: string;
  date: string;
  content: string;
  jobsApplied?: number;
  hrContacted?: number;
  interviewsScheduled?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlannerTask {
  id: string;
  taskDate: string;
  timeSlot: string;
  task: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationStats {
  totalApplications: number;
  applicationsByStatus: Record<string, number>;
  applicationsPerDay: Record<string, number>;
  applicationsPerPortal: Record<string, number>;
  hrOutreachCount: number;
  hrReplyCount: number;
  interviewCount: number;
  offerCount: number;
  replyRate: number;
  currentStreak: number;
  longestStreak: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  skip: number;
  limit: number;
  timestamp: string;
}
