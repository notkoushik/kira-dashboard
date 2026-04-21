/**
 * Format Utilities
 * Number, currency, and data formatting helpers
 */

/**
 * Format number with thousands separator
 */
export function formatNumber(num: number, decimals: number = 0): string {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: string = 'USD', decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format file size (B, KB, MB, GB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format duration (milliseconds to readable format)
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

/**
 * Format time (milliseconds since midnight)
 */
export function formatTime(ms: number | Date): string {
  const date = typeof ms === 'number' ? new Date(ms) : ms;
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Format date and time
 */
export function formatDateTime(date: string | Date, includeTime: boolean = true): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (includeTime) {
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format time with AM/PM
 */
export function formatTimeAmPm(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    meridiem: 'short',
  });
}

/**
 * Format hours and minutes
 */
export function formatHoursMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  }
  return `${mins}m`;
}

/**
 * Format phone number
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  return phone;
}

/**
 * Format as abbreviation (M, B, T for millions, billions, trillions)
 */
export function formatAbbreviate(num: number): string {
  if (num >= 1e12) {
    return (num / 1e12).toFixed(1) + 'T';
  }
  if (num >= 1e9) {
    return (num / 1e9).toFixed(1) + 'B';
  }
  if (num >= 1e6) {
    return (num / 1e6).toFixed(1) + 'M';
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(1) + 'K';
  }

  return num.toString();
}

/**
 * Format rating (1-5 stars)
 */
export function formatRating(rating: number): string {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  let stars = '★'.repeat(fullStars);
  if (hasHalfStar) stars += '⯨';
  stars += '☆'.repeat(5 - Math.ceil(rating));

  return stars;
}

/**
 * Truncate number with ellipsis
 */
export function truncateNumber(num: number, maxDigits: number = 6): string {
  const str = Math.abs(num).toString();

  if (str.length <= maxDigits) {
    return num.toString();
  }

  return formatAbbreviate(num);
}

/**
 * Format JSON with indentation
 */
export function formatJSON(obj: any, indent: number = 2): string {
  return JSON.stringify(obj, null, indent);
}

export default {
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatFileSize,
  formatDuration,
  formatTime,
  formatDateTime,
  formatTimeAmPm,
  formatHoursMinutes,
  formatPhoneNumber,
  formatAbbreviate,
  formatRating,
  truncateNumber,
  formatJSON,
};
