/**
 * Data Utilities
 * Filtering, sorting, and data transformation helpers
 */

import type { Job, HRContact, QueueItem, DailyLog } from '../types/domain';

/**
 * General search filter
 */
export function searchFilter<T extends Record<string, any>>(
  items: T[],
  searchTerm: string,
  fields: (keyof T)[]
): T[] {
  if (!searchTerm) return items;

  const term = searchTerm.toLowerCase();
  return items.filter(item =>
    fields.some(field => {
      const value = item[field];
      return String(value).toLowerCase().includes(term);
    })
  );
}

/**
 * Filter jobs by status
 */
export function filterJobsByStatus(jobs: Job[], status: string): Job[] {
  if (!status) return jobs;
  return jobs.filter(job => job.status === status);
}

/**
 * Filter jobs by portal
 */
export function filterJobsByPortal(jobs: Job[], portal: string): Job[] {
  if (!portal) return jobs;
  return jobs.filter(job => job.portal === portal);
}

/**
 * Filter jobs by date range
 */
export function filterJobsByDateRange(
  jobs: Job[],
  fromDate?: string,
  toDate?: string
): Job[] {
  if (!fromDate && !toDate) return jobs;

  return jobs.filter(job => {
    if (!job.appliedDate) return false;

    const jobDate = new Date(job.appliedDate);
    if (fromDate && jobDate < new Date(fromDate)) return false;
    if (toDate && jobDate > new Date(toDate)) return false;

    return true;
  });
}

/**
 * Filter jobs by score range
 */
export function filterJobsByScore(jobs: Job[], minScore: number, maxScore: number = 100): Job[] {
  return jobs.filter(job => {
    const score = job.jobScore || 0;
    return score >= minScore && score <= maxScore;
  });
}

/**
 * Search jobs across multiple fields
 */
export function searchJobs(jobs: Job[], term: string): Job[] {
  return searchFilter(jobs, term, ['company', 'role', 'portal', 'hrName', 'notes'] as (keyof Job)[]);
}

/**
 * Search HR contacts
 */
export function searchHRContacts(contacts: HRContact[], term: string): HRContact[] {
  return searchFilter(contacts, term, ['name', 'email', 'company', 'role', 'notes'] as (keyof HRContact)[]);
}

/**
 * Sort jobs by field
 */
export function sortJobs(jobs: Job[], sortBy: 'date' | 'score' | 'status' = 'date', ascending = false): Job[] {
  const sorted = [...jobs];

  if (sortBy === 'date') {
    sorted.sort((a, b) => {
      const dateA = new Date(a.appliedDate || 0).getTime();
      const dateB = new Date(b.appliedDate || 0).getTime();
      return ascending ? dateA - dateB : dateB - dateA;
    });
  } else if (sortBy === 'score') {
    sorted.sort((a, b) => {
      const scoreA = a.jobScore || 0;
      const scoreB = b.jobScore || 0;
      return ascending ? scoreA - scoreB : scoreB - scoreA;
    });
  } else if (sortBy === 'status') {
    const statusOrder = ['Applied', 'Screening', 'Interview', 'Offer', 'Rejected', 'Saved'];
    sorted.sort((a, b) => {
      const indexA = statusOrder.indexOf(a.status);
      const indexB = statusOrder.indexOf(b.status);
      return ascending ? indexA - indexB : indexB - indexA;
    });
  }

  return sorted;
}

/**
 * Group jobs by status
 */
export function groupJobsByStatus(jobs: Job[]): Record<string, Job[]> {
  return jobs.reduce((acc, job) => {
    const status = job.status || 'Unknown';
    if (!acc[status]) acc[status] = [];
    acc[status].push(job);
    return acc;
  }, {} as Record<string, Job[]>);
}

/**
 * Group jobs by portal
 */
export function groupJobsByPortal(jobs: Job[]): Record<string, Job[]> {
  return jobs.reduce((acc, job) => {
    const portal = job.portal || 'Other';
    if (!acc[portal]) acc[portal] = [];
    acc[portal].push(job);
    return acc;
  }, {} as Record<string, Job[]>);
}

/**
 * Count jobs by field
 */
export function countBy<T extends Record<string, any>>(
  items: T[],
  field: keyof T
): Record<string, number> {
  return items.reduce((acc, item) => {
    const value = String(item[field]);
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Get unique values for field
 */
export function getUniqueValues<T extends Record<string, any>>(items: T[], field: keyof T): any[] {
  return [...new Set(items.map(item => item[field]))].filter(Boolean);
}

/**
 * Paginate array
 */
export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

/**
 * Calculate statistics for numeric field
 */
export function calculateStats(items: Job[], field: 'jobScore'): {
  min: number;
  max: number;
  avg: number;
  total: number;
} {
  const scores = items
    .map(item => item[field] || 0)
    .filter(score => score > 0);

  if (scores.length === 0) {
    return { min: 0, max: 0, avg: 0, total: 0 };
  }

  return {
    min: Math.min(...scores),
    max: Math.max(...scores),
    avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    total: scores.length,
  };
}

/**
 * Format list for display (e.g., "A, B, and C")
 */
export function formatList(items: string[], conjunction: string = 'and'): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;

  return `${items.slice(0, -1).join(', ')}, ${conjunction} ${items[items.length - 1]}`;
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Merge objects
 */
export function mergeObjects<T extends Record<string, any>>(...objects: Partial<T>[]): T {
  return Object.assign({}, ...objects) as T;
}

/**
 * Check if object is empty
 */
export function isEmpty(obj: Record<string, any>): boolean {
  return Object.keys(obj).length === 0;
}

export default {
  searchFilter,
  filterJobsByStatus,
  filterJobsByPortal,
  filterJobsByDateRange,
  filterJobsByScore,
  searchJobs,
  searchHRContacts,
  sortJobs,
  groupJobsByStatus,
  groupJobsByPortal,
  countBy,
  getUniqueValues,
  paginate,
  calculateStats,
  formatList,
  deepClone,
  mergeObjects,
  isEmpty,
};
