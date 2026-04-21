/**
 * Utilities Index
 * Centralized exports for all utility modules
 */

// String utilities
export * from './string';

// Color utilities
export * from './color';

// Data utilities
export * from './data';

// DOM utilities
export * from './dom';

// Format utilities
export * from './format';

export default {
  // String
  escapeHTML: () => import('./string').then(m => m.escapeHTML),
  truncate: () => import('./string').then(m => m.truncate),
  relativeTime: () => import('./string').then(m => m.relativeTime),

  // Color
  statusColor: () => import('./color').then(m => m.statusColor),
  portalColor: () => import('./color').then(m => m.portalColor),

  // Data
  searchJobs: () => import('./data').then(m => m.searchJobs),
  sortJobs: () => import('./data').then(m => m.sortJobs),

  // DOM
  query: () => import('./dom').then(m => m.query),
  createElement: () => import('./dom').then(m => m.createElement),

  // Format
  formatNumber: () => import('./format').then(m => m.formatNumber),
  formatCurrency: () => import('./format').then(m => m.formatCurrency),
};
