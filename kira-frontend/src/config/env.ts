/**
 * Environment Configuration
 * Centralizes all environment variable handling
 */

export const config = {
  api: {
    base: import.meta.env.VITE_API_BASE || 'http://localhost:3002/api/v1',
  },
  sentry: {
    enabled: import.meta.env.VITE_ENABLE_SENTRY === 'true',
    dsn: import.meta.env.VITE_SENTRY_DSN || '',
  },
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

/**
 * Validates that critical environment variables are set
 */
export function validateConfig(): void {
  if (!config.api.base) {
    console.error('Missing VITE_API_BASE environment variable');
  }
}

export default config;
