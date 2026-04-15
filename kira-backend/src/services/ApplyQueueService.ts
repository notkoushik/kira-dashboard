import { supabase } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { logger } from '../config/logger';
import type { ApplyQueue } from '../types';

export class ApplyQueueService {
  /**
   * Get all apply queue items for a user with pagination and filtering
   */
  static async getAll(
    userId: string,
    filters?: {
      search?: string;
      status?: string;
      difficulty?: string;
      priority?: string;
      skip?: number;
      limit?: number;
    }
  ) {
    let query = supabase
      .from('apply_queue')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('archived', false); // Exclude archived by default

    // Apply filters
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }

    // Apply search filter across company and role
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      query = query.or(
        `company.ilike.%${searchTerm}%,role.ilike.%${searchTerm}%`
      );
    }

    // Pagination
    const skip = filters?.skip || 0;
    const limit = Math.min(filters?.limit || 50, 100);
    query = query.range(skip, skip + limit - 1);

    // Sort by date added descending
    query = query.order('date_added', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      logger.error({ error, userId }, 'Failed to get apply queue items');
      throw createError('Failed to fetch apply queue', 500, 'DB_ERROR');
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
   * Get single apply queue item
   */
  static async getById(userId: string, queueId: string): Promise<ApplyQueue | null> {
    const { data: item, error } = await supabase
      .from('apply_queue')
      .select('*')
      .eq('id', queueId)
      .eq('user_id', userId)
      .single();

    if (error) {
      return null;
    }

    return item;
  }

  /**
   * Create a new apply queue item
   */
  static async create(userId: string, queueData: any): Promise<ApplyQueue> {
    const { data: item, error } = await supabase
      .from('apply_queue')
      .insert({
        user_id: userId,
        ...queueData,
        date_added: new Date().toISOString(),
        archived: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      logger.error({ error, userId }, 'Failed to create apply queue item');
      throw createError('Failed to create apply queue item', 500, 'DB_ERROR');
    }

    return item;
  }

  /**
   * Update an apply queue item
   */
  static async update(userId: string, queueId: string, updates: any): Promise<ApplyQueue> {
    const { data: item, error } = await supabase
      .from('apply_queue')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', queueId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      logger.error({ error, userId, queueId }, 'Failed to update apply queue item');
      throw createError('Failed to update apply queue item', 500, 'DB_ERROR');
    }

    return item;
  }

  /**
   * Delete an apply queue item
   */
  static async delete(userId: string, queueId: string): Promise<void> {
    const { error } = await supabase
      .from('apply_queue')
      .delete()
      .eq('id', queueId)
      .eq('user_id', userId);

    if (error) {
      logger.error({ error, userId, queueId }, 'Failed to delete apply queue item');
      throw createError('Failed to delete apply queue item', 500, 'DB_ERROR');
    }
  }

  /**
   * Bulk delete apply queue items
   */
  static async bulkDelete(userId: string, queueIds: string[]): Promise<number> {
    if (!queueIds.length) {
      return 0;
    }

    const { error, count } = await supabase
      .from('apply_queue')
      .delete()
      .eq('user_id', userId)
      .in('id', queueIds);

    if (error) {
      logger.error({ error, userId, queueIds }, 'Failed to bulk delete apply queue items');
      throw createError('Failed to delete apply queue items', 500, 'DB_ERROR');
    }

    return count || 0;
  }

  /**
   * Get apply queue statistics
   */
  static async getStats(userId: string) {
    const { data: items, error } = await supabase
      .from('apply_queue')
      .select('status, difficulty, priority, archived')
      .eq('user_id', userId);

    if (error) {
      logger.error({ error, userId }, 'Failed to get apply queue stats');
      throw createError('Failed to fetch stats', 500, 'DB_ERROR');
    }

    const activeItems = items?.filter(i => !i.archived) || [];
    const stats = {
      total: activeItems.length,
      toApply: activeItems.filter(i => i.status === 'To Apply').length,
      applied: activeItems.filter(i => i.status === 'Applied').length,
      skipped: activeItems.filter(i => i.status === 'Skipped').length,
      easyCount: activeItems.filter(i => i.difficulty === 'Easy').length,
      mediumCount: activeItems.filter(i => i.difficulty === 'Medium').length,
      hardCount: activeItems.filter(i => i.difficulty === 'Hard').length,
      highPriority: activeItems.filter(i => i.priority === 'High').length,
      mediumPriority: activeItems.filter(i => i.priority === 'Medium').length,
      archived: (items?.filter(i => i.archived) || []).length,
    };

    return stats;
  }
}
