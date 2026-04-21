/**
 * Color & Status Utilities
 * Color mapping for jobs, HR contacts, and UI elements
 */

import type { Job, HRContact, QueueItem } from '../types/domain';
import { JOB_STATUSES, HR_STATUSES, QUEUE_STATUSES, DIFFICULTY_LEVELS, PRIORITY_LEVELS } from '../config/constants';

/**
 * Get color for job status
 */
export function statusColor(status: string): string {
  const statusLower = status?.toLowerCase() || '';

  if (statusLower === 'applied') return '#3b82f6'; // blue
  if (statusLower === 'screening') return '#f59e0b'; // amber
  if (statusLower === 'interview') return '#8b5cf6'; // purple
  if (statusLower === 'offer') return '#10b981'; // green
  if (statusLower === 'rejected') return '#ef4444'; // red
  if (statusLower === 'saved') return '#6b7280'; // gray

  return '#6b7280'; // default gray
}

/**
 * Get color for HR contact status
 */
export function hrStatusColor(status: string): string {
  const statusLower = status?.toLowerCase() || '';

  if (statusLower === 'contacted') return '#3b82f6'; // blue
  if (statusLower === 'interested') return '#10b981'; // green
  if (statusLower === 'no response') return '#f59e0b'; // amber
  if (statusLower === 'rejected') return '#ef4444'; // red
  if (statusLower === 'saved') return '#6b7280'; // gray

  return '#6b7280'; // default gray
}

/**
 * Get color for job portal
 */
export function portalColor(portal: string): string {
  const portalLower = portal?.toLowerCase() || '';

  if (portalLower === 'linkedin') return '#0a66c2'; // LinkedIn blue
  if (portalLower === 'indeed') return '#003da5'; // Indeed blue
  if (portalLower === 'glassdoor') return '#0caa41'; // Glassdoor green
  if (portalLower === 'angellist' || portalLower === 'wellfound') return '#000000'; // AngelList black
  if (portalLower === 'stack overflow') return '#f48024'; // Stack Overflow orange
  if (portalLower === 'github') return '#333333'; // GitHub dark
  if (portalLower === 'company website') return '#4f46e5'; // Indigo
  if (portalLower === 'referral') return '#8b5cf6'; // Purple
  if (portalLower === 'other') return '#6b7280'; // Gray

  return '#6b7280'; // default gray
}

/**
 * Get color for difficulty level
 */
export function difficultyColor(difficulty: string): string {
  const diffLower = difficulty?.toLowerCase() || '';

  if (diffLower === 'easy') return '#10b981'; // green
  if (diffLower === 'medium') return '#f59e0b'; // amber
  if (diffLower === 'hard') return '#ef4444'; // red

  return '#6b7280'; // default gray
}

/**
 * Get color for priority level (1-3)
 */
export function priorityColor(priority: number): string {
  if (priority >= 3) return '#ef4444'; // red (high)
  if (priority === 2) return '#f59e0b'; // amber (medium)
  return '#10b981'; // green (low)
}

/**
 * Get background color for badge
 */
export function badgeBackgroundColor(type: 'status' | 'portal' | 'difficulty' | 'priority', value: string | number): string {
  const color =
    type === 'status'
      ? statusColor(value as string)
      : type === 'portal'
        ? portalColor(value as string)
        : type === 'difficulty'
          ? difficultyColor(value as string)
          : priorityColor(value as number);

  // Convert hex to rgba with 15% opacity
  return color + '26'; // 26 = 15% opacity in hex
}

/**
 * Get text color contrast for background
 */
export function getContrastColor(backgroundColor: string): string {
  // Simple contrast determination - dark text on light, light text on dark
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? '#000000' : '#ffffff';
}

/**
 * Get status label with badge styling
 */
export function getStatusBadge(status: string, type: 'status' | 'portal' | 'difficulty' = 'status'): { color: string; bgColor: string } {
  const color = type === 'portal' ? portalColor(status) : type === 'difficulty' ? difficultyColor(status) : statusColor(status);

  return {
    color,
    bgColor: badgeBackgroundColor(type, status),
  };
}

/**
 * Check if status is active/positive
 */
export function isActiveStatus(status: string): boolean {
  const activeLower = status?.toLowerCase() || '';
  return !['rejected', 'saved'].includes(activeLower);
}

/**
 * Get status progress percentage
 */
export function getStatusProgress(status: string): number {
  const statusLower = status?.toLowerCase() || '';

  if (statusLower === 'applied') return 25;
  if (statusLower === 'screening') return 50;
  if (statusLower === 'interview') return 75;
  if (statusLower === 'offer') return 100;
  if (statusLower === 'rejected') return 0;

  return 0;
}

/**
 * Get emoji for status
 */
export function getStatusEmoji(status: string): string {
  const statusLower = status?.toLowerCase() || '';

  if (statusLower === 'applied') return '📨';
  if (statusLower === 'screening') return '👀';
  if (statusLower === 'interview') return '💬';
  if (statusLower === 'offer') return '🎉';
  if (statusLower === 'rejected') return '❌';
  if (statusLower === 'saved') return '📌';

  return '📋';
}

/**
 * Get emoji for difficulty
 */
export function getDifficultyEmoji(difficulty: string): string {
  const diffLower = difficulty?.toLowerCase() || '';

  if (diffLower === 'easy') return '🟢';
  if (diffLower === 'medium') return '🟡';
  if (diffLower === 'hard') return '🔴';

  return '⚪';
}

/**
 * Get emoji for portal
 */
export function getPortalEmoji(portal: string): string {
  const portalLower = portal?.toLowerCase() || '';

  if (portalLower === 'linkedin') return '💼';
  if (portalLower === 'indeed') return '🔍';
  if (portalLower === 'glassdoor') return '🏢';
  if (portalLower === 'angellist' || portalLower === 'wellfound') return '🚀';
  if (portalLower === 'stack overflow') return '🔥';
  if (portalLower === 'github') return '💻';
  if (portalLower === 'company website') return '🌐';
  if (portalLower === 'referral') return '🤝';

  return '📌';
}

export default {
  statusColor,
  hrStatusColor,
  portalColor,
  difficultyColor,
  priorityColor,
  badgeBackgroundColor,
  getContrastColor,
  getStatusBadge,
  isActiveStatus,
  getStatusProgress,
  getStatusEmoji,
  getDifficultyEmoji,
  getPortalEmoji,
};
