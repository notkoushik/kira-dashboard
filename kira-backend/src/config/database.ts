import { createClient } from '@supabase/supabase-js';
import { config } from './env';
import { logger } from './logger';

// Initialize Supabase client with SERVICE ROLE KEY (server-side only)
export const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

// Health check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('jobs')
      .select('id')
      .limit(1);

    if (error) {
      logger.error({ error }, 'Database connection failed');
      return false;
    }

    logger.info('Database connection successful');
    return true;
  } catch (err) {
    logger.error({ err }, 'Database connection error');
    return false;
  }
}
