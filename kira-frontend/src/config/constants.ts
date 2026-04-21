/**
 * Application Constants
 * Single source of truth for all magic strings and values
 */

// Status values
export const JOB_STATUSES = {
  APPLIED: 'Applied',
  SCREENING: 'Screening',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  REJECTED: 'Rejected',
  SAVED: 'Saved',
} as const;

export const HR_STATUSES = {
  CONTACTED: 'Contacted',
  INTERESTED: 'Interested',
  REJECTED: 'Rejected',
  NO_RESPONSE: 'No Response',
  SAVED: 'Saved',
} as const;

export const QUEUE_STATUSES = {
  PENDING: 'Pending',
  APPLIED: 'Applied',
  FAILED: 'Failed',
  SKIPPED: 'Skipped',
} as const;

// Priority levels
export const PRIORITY_LEVELS = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
} as const;

// Difficulty levels
export const DIFFICULTY_LEVELS = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
} as const;

// Job portals/sources
export const JOB_PORTALS = [
  'LinkedIn',
  'Indeed',
  'Glassdoor',
  'AngelList',
  'Wellfound',
  'Stack Overflow',
  'GitHub',
  'Company Website',
  'Referral',
  'Other',
] as const;

// Tech skills with weights
export const TECH_SKILLS = {
  'typescript': 10,
  'javascript': 10,
  'react': 15,
  'vue': 15,
  'node.js': 10,
  'nodejs': 10,
  'express': 8,
  'python': 10,
  'django': 8,
  'fastapi': 8,
  'java': 10,
  'spring': 8,
  'go': 10,
  'rust': 10,
  'aws': 8,
  'gcp': 8,
  'azure': 8,
  'docker': 8,
  'kubernetes': 8,
  'postgres': 8,
  'mongodb': 8,
  'redis': 8,
  'graphql': 8,
  'rest api': 6,
} as const;

// Daily planner time slots
export const PLANNER_SLOTS = [
  { time: '8:00 AM', task: 'Run KIRA job search' },
  { time: '10:00 AM', task: 'Apply to top 5 jobs' },
  { time: '12:00 PM', task: 'Message 5 HRs' },
  { time: '6:00 PM', task: 'Update tracker & follow-ups' },
] as const;

// Inspirational quotes
export const MOTIVATIONAL_QUOTES = [
  'Every application is one step closer to your dream role.',
  'Your persistence today is your success tomorrow.',
  'Great things never came from comfort zones.',
  'The only way to do great work is to love what you do.',
  'Success is the sum of small efforts repeated day in and day out.',
  'You are closer than you think.',
  'Consistency beats intensity.',
  'The best time to plant a tree was 20 years ago. The second best time is now.',
  'Your future is created by what you do today, not tomorrow.',
  'Sometimes the best things take time. Keep pushing.',
];

// Analytics chart colors
export const CHART_COLORS = {
  primary: '#00b4d8',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  blue: '#3b82f6',
} as const;

// Animation timings
export const ANIMATION_TIMING = {
  fast: 150,
  normal: 200,
  slow: 300,
} as const;

// API pagination
export const PAGINATION = {
  DEFAULT_LIMIT: 50,
  DEFAULT_SKIP: 0,
  MAX_LIMIT: 100,
} as const;

// Toast notification durations
export const TOAST_DURATION = {
  SHORT: 2000,
  NORMAL: 3000,
  LONG: 5000,
} as const;

// Tab IDs
export const TABS = {
  COMMAND: 'command',
  PLANNER: 'planner',
  JOBS: 'jobs',
  QUEUE: 'queue',
  HR: 'hr',
  INBOX: 'inbox',
  ANALYTICS: 'analytics',
  SETTINGS: 'settings',
} as const;

export default {
  JOB_STATUSES,
  HR_STATUSES,
  QUEUE_STATUSES,
  PRIORITY_LEVELS,
  DIFFICULTY_LEVELS,
  JOB_PORTALS,
  TECH_SKILLS,
  PLANNER_SLOTS,
  MOTIVATIONAL_QUOTES,
  CHART_COLORS,
  ANIMATION_TIMING,
  PAGINATION,
  TOAST_DURATION,
  TABS,
};
