import { supabase } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { logger } from '../config/logger';
import type { DailyLog } from '../types';

export class DailyLogService {
  /**
   * Get all daily logs for a user with pagination and filtering
   */
  static async getAll(
    userId: string,
    filters?: {
      dateFrom?: string;
      dateTo?: string;
      skip?: number;
      limit?: number;
    }
  ) {
    let query = supabase
      .from('daily_logs')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    // Apply date filters
    if (filters?.dateFrom) {
      query = query.gte('log_date', filters.dateFrom);
    }
    if (filters?.dateTo) {
      query = query.lte('log_date', filters.dateTo);
    }

    // Pagination
    const skip = filters?.skip || 0;
    const limit = Math.min(filters?.limit || 50, 100);
    query = query.range(skip, skip + limit - 1);

    // Sort by date descending (newest first)
    query = query.order('log_date', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      logger.error({ error, userId }, 'Failed to get daily logs');
      throw createError('Failed to fetch daily logs', 500, 'DB_ERROR');
    }

    return {
      items: data || [],
      total: count || 0,
      skip,
      limit,
      hasMore: (skip + limit) < (count || 0),
    };
  }

  /**
   * Get single daily log
   */
  static async getById(userId: string, logId: string): Promise<DailyLog | null> {
    const { data: log, error } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('id', logId)
      .eq('user_id', userId)
      .single();

    if (error) {
      return null;
    }

    return log;
  }

  /**
   * Create a new daily log
   */
  static async create(userId: string, logData: any): Promise<DailyLog> {
    const { data: log, error } = await supabase
      .from('daily_logs')
      .insert({
        user_id: userId,
        ...logData,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      logger.error({ error, userId }, 'Failed to create daily log');
      throw createError('Failed to create daily log', 500, 'DB_ERROR');
    }

    return log;
  }

  /**
   * Update a daily log
   */
  static async update(userId: string, logId: string, updates: any): Promise<DailyLog> {
    const { data: log, error } = await supabase
      .from('daily_logs')
      .update(updates)
      .eq('id', logId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      logger.error({ error, userId, logId }, 'Failed to update daily log');
      throw createError('Failed to update daily log', 500, 'DB_ERROR');
    }

    return log;
  }

  /**
   * Delete a daily log
   */
  static async delete(userId: string, logId: string): Promise<void> {
    const { error } = await supabase
      .from('daily_logs')
      .delete()
      .eq('id', logId)
      .eq('user_id', userId);

    if (error) {
      logger.error({ error, userId, logId }, 'Failed to delete daily log');
      throw createError('Failed to delete daily log', 500, 'DB_ERROR');
    }
  }

  /**
   * Bulk delete daily logs
   */
  static async bulkDelete(userId: string, logIds: string[]): Promise<number> {
    if (!logIds.length) {
      return 0;
    }

    const { error, count } = await supabase
      .from('daily_logs')
      .delete()
      .eq('user_id', userId)
      .in('id', logIds);

    if (error) {
      logger.error({ error, userId, logIds }, 'Failed to bulk delete daily logs');
      throw createError('Failed to delete daily logs', 500, 'DB_ERROR');
    }

    return count || 0;
  }

  /**
   * Get daily log statistics
   */
  static async getStats(userId: string) {
    const { data: logs, error } = await supabase
      .from('daily_logs')
      .select('tasks_completed, streak_count')
      .eq('user_id', userId);

    if (error) {
      logger.error({ error, userId }, 'Failed to get daily log stats');
      throw createError('Failed to fetch stats', 500, 'DB_ERROR');
    }

    const totalLogs = logs?.length || 0;
    const totalTasksCompleted = logs?.reduce((sum, log) => sum + (log.tasks_completed || 0), 0) || 0;
    const maxStreak = logs?.reduce((max, log) => Math.max(max, log.streak_count || 0), 0) || 0;
    const avgTasksPerDay = totalLogs > 0 ? (totalTasksCompleted / totalLogs).toFixed(1) : '0';

    const stats = {
      totalLogs,
      totalTasksCompleted,
      maxStreak,
      avgTasksPerDay: parseFloat(avgTasksPerDay as string),
    };

    return stats;
  }
}
