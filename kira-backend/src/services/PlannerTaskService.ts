import { supabase } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { logger } from '../config/logger';
import type { PlannerTask } from '../types';

export class PlannerTaskService {
  /**
   * Get all planner tasks for a user with pagination and filtering
   */
  static async getAll(
    userId: string,
    filters?: {
      taskDate?: string;
      completed?: boolean;
      skip?: number;
      limit?: number;
    }
  ) {
    let query = supabase
      .from('planner_tasks')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    // Apply filters
    if (filters?.taskDate) {
      query = query.eq('task_date', filters.taskDate);
    }
    if (filters?.completed !== undefined) {
      query = query.eq('completed', filters.completed);
    }

    // Pagination
    const skip = filters?.skip || 0;
    const limit = Math.min(filters?.limit || 50, 100);
    query = query.range(skip, skip + limit - 1);

    // Sort by date descending, then by task slot
    query = query.order('task_date', { ascending: false })
      .order('task_slot', { ascending: true });

    const { data, error, count } = await query;

    if (error) {
      logger.error({ error, userId }, 'Failed to get planner tasks');
      throw createError('Failed to fetch planner tasks', 500, 'DB_ERROR');
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
   * Get single planner task
   */
  static async getById(userId: string, taskId: string): Promise<PlannerTask | null> {
    const { data: task, error } = await supabase
      .from('planner_tasks')
      .select('*')
      .eq('id', taskId)
      .eq('user_id', userId)
      .single();

    if (error) {
      return null;
    }

    return task;
  }

  /**
   * Create a new planner task
   */
  static async create(userId: string, taskData: any): Promise<PlannerTask> {
    const { data: task, error } = await supabase
      .from('planner_tasks')
      .insert({
        user_id: userId,
        ...taskData,
        completed: taskData.completed || false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      logger.error({ error, userId }, 'Failed to create planner task');
      throw createError('Failed to create planner task', 500, 'DB_ERROR');
    }

    return task;
  }

  /**
   * Update a planner task
   */
  static async update(userId: string, taskId: string, updates: any): Promise<PlannerTask> {
    // If marked as completed, set completed_at timestamp
    const updateData = { ...updates };
    if (updates.completed === true && !updates.completed_at) {
      updateData.completed_at = new Date().toISOString();
    } else if (updates.completed === false) {
      updateData.completed_at = null;
    }

    const { data: task, error } = await supabase
      .from('planner_tasks')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      logger.error({ error, userId, taskId }, 'Failed to update planner task');
      throw createError('Failed to update planner task', 500, 'DB_ERROR');
    }

    return task;
  }

  /**
   * Delete a planner task
   */
  static async delete(userId: string, taskId: string): Promise<void> {
    const { error } = await supabase
      .from('planner_tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', userId);

    if (error) {
      logger.error({ error, userId, taskId }, 'Failed to delete planner task');
      throw createError('Failed to delete planner task', 500, 'DB_ERROR');
    }
  }

  /**
   * Bulk delete planner tasks
   */
  static async bulkDelete(userId: string, taskIds: string[]): Promise<number> {
    if (!taskIds.length) {
      return 0;
    }

    const { error, count } = await supabase
      .from('planner_tasks')
      .delete()
      .eq('user_id', userId)
      .in('id', taskIds);

    if (error) {
      logger.error({ error, userId, taskIds }, 'Failed to bulk delete planner tasks');
      throw createError('Failed to delete planner tasks', 500, 'DB_ERROR');
    }

    return count || 0;
  }

  /**
   * Get planner task statistics
   */
  static async getStats(userId: string) {
    const { data: tasks, error } = await supabase
      .from('planner_tasks')
      .select('completed, task_date')
      .eq('user_id', userId);

    if (error) {
      logger.error({ error, userId }, 'Failed to get planner task stats');
      throw createError('Failed to fetch stats', 500, 'DB_ERROR');
    }

    const totalTasks = tasks?.length || 0;
    const completedTasks = tasks?.filter(t => t.completed).length || 0;
    const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : '0';

    // Get today's tasks
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks?.filter(t => t.task_date === today) || [];
    const todayCompleted = todayTasks.filter(t => t.completed).length;

    const stats = {
      totalTasks,
      completedTasks,
      completionRate: parseFloat(completionRate as string),
      todayTasks: todayTasks.length,
      todayCompleted,
    };

    return stats;
  }
}
