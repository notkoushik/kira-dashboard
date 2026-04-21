/**
 * String Utilities
 * Common string manipulation and validation functions
 */

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHTML(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Unescape HTML entities
 */
export function unescapeHTML(text: string): string {
  const div = document.createElement('div');
  div.innerHTML = text;
  return div.textContent || '';
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number = 100, suffix: string = '...'): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + suffix;
}

/**
 * Truncate at word boundary
 */
export function truncateAtWord(text: string, length: number = 100): string {
  if (text.length <= length) return text;

  const truncated = text.slice(0, length);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > 0) {
    return truncated.slice(0, lastSpace) + '...';
  }

  return truncated + '...';
}

/**
 * Convert timestamp to relative time format (e.g., "2 hours ago")
 */
export function relativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (secondsAgo < 60) return 'just now';
    if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
    if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h ago`;
    if (secondsAgo < 604800) return `${Math.floor(secondsAgo / 86400)}d ago`;

    const weeks = Math.floor(secondsAgo / 604800);
    return `${weeks}w ago`;
  } catch {
    return 'Invalid date';
  }
}

/**
 * Format date to readable string
 */
export function formatDate(dateString: string, format: 'short' | 'long' = 'short'): string {
  try {
    const date = new Date(dateString);

    if (format === 'short') {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: '2-digit',
      });
    }

    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'Invalid date';
  }
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Convert camelCase to title case
 */
export function camelCaseToTitleCase(text: string): string {
  return text
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate URL is safe (prevents javascript: and data: URLs)
 */
export function isSafeUrl(url: string): boolean {
  if (!isValidUrl(url)) return false;
  const unsafeProtocols = ['javascript', 'data', 'vbscript'];
  return !unsafeProtocols.includes(new URL(url).protocol.replace(':', ''));
}

/**
 * Slugify text (convert to URL-safe format)
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate unique ID
 */
export function generateId(prefix: string = ''): string {
  return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number = 300
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delayMs);
  };
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number = 300
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return function (...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastCall >= delayMs) {
      lastCall = now;
      fn(...args);
    }
  };
}

/**
 * Highlight text with HTML spans
 */
export function highlightText(text: string, searchTerm: string): string {
  if (!searchTerm) return escapeHTML(text);

  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return escapeHTML(text).replace(regex, '<mark>$1</mark>');
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
}

export default {
  escapeHTML,
  unescapeHTML,
  truncate,
  truncateAtWord,
  relativeTime,
  formatDate,
  capitalize,
  camelCaseToTitleCase,
  isValidEmail,
  isValidUrl,
  isSafeUrl,
  slugify,
  generateId,
  debounce,
  throttle,
  highlightText,
  extractDomain,
};
