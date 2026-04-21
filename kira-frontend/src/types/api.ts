/**
 * API Types
 * Request and response schemas for backend communication
 */

import type {
  User,
  Job,
  HRContact,
  QueueItem,
  DailyLog,
  PlannerTask,
  ApplicationStats,
} from './domain';

// Auth API
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: User;
}

export interface ProfileUpdateRequest {
  name?: string;
  location?: string;
  techStack?: string[];
  targetRoles?: string[];
  experience?: string;
  github?: string;
  linkedin?: string;
}

// Job API
export interface CreateJobRequest {
  company: string;
  role: string;
  portalUrl: string;
  portal: string;
  status?: string;
  hrName?: string;
  hrEmail?: string;
  notes?: string;
  salary?: string;
}

export interface UpdateJobRequest extends Partial<CreateJobRequest> {}

export interface JobsListRequest {
  search?: string;
  status?: string;
  portal?: string;
  dateFrom?: string;
  dateTo?: string;
  skip?: number;
  limit?: number;
}

// HR Contacts API
export interface CreateHRRequest {
  name: string;
  email: string;
  phone?: string;
  company: string;
  role?: string;
  status?: string;
  linkedin?: string;
  notes?: string;
}

export interface UpdateHRRequest extends Partial<CreateHRRequest> {}

export interface HRListRequest {
  search?: string;
  status?: string;
  skip?: number;
  limit?: number;
}

// Queue API
export interface CreateQueueRequest {
  jobId: string;
  company: string;
  role: string;
  priority: number;
  difficulty: string;
  notes?: string;
}

export interface UpdateQueueRequest extends Partial<CreateQueueRequest> {}

export interface QueueListRequest {
  priority?: number;
  status?: string;
  difficulty?: string;
  search?: string;
  skip?: number;
  limit?: number;
}

// Logs API
export interface CreateLogRequest {
  date: string;
  content: string;
  jobsApplied?: number;
  hrContacted?: number;
  interviewsScheduled?: number;
}

export interface UpdateLogRequest extends Partial<CreateLogRequest> {}

export interface LogsListRequest {
  dateFrom?: string;
  dateTo?: string;
  skip?: number;
  limit?: number;
}

// Planner API
export interface CreatePlannerRequest {
  taskDate: string;
  timeSlot: string;
  task: string;
  completed?: boolean;
}

export interface UpdatePlannerRequest extends Partial<CreatePlannerRequest> {}

export interface PlannerListRequest {
  taskDate?: string;
  completed?: boolean;
  skip?: number;
  limit?: number;
}

// API Error Response
export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  timestamp: string;
}

// Batch operations
export interface BulkDeleteRequest {
  ids: string[];
}

export interface BulkStatusUpdateRequest {
  ids: string[];
  status: string;
}
