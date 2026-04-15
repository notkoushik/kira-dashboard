import { supabase } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { logger } from '../config/logger';
import type { Job } from '../types';

export class JobService {
  /**
   * Get all jobs for a user with pagination and filtering
   */
  static async getJobs(
    userId: string,
    filters?: {
      search?: string;
      status?: string;
      portal?: string;
      dateFrom?: string;
      dateTo?: string;
      skip?: number;
      limit?: number;
    }
  ) {
    let query = supabase
      .from('jobs')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    // Apply filters
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.portal) {
      query = query.eq('portal', filters.portal);
    }
    if (filters?.dateFrom) {
      query = query.gte('date_added', filters.dateFrom);
    }
    if (filters?.dateTo) {
      query = query.lte('date_added', filters.dateTo + 'T23:59:59');
    }

    // Apply search filter using Supabase full-text search (optimized)
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      // Use or() to search across multiple fields
      query = query.or(
        `company.ilike.%${searchTerm}%,role.ilike.%${searchTerm}%,notes.ilike.%${searchTerm}%`
      );
    }

    // Pagination
    const skip = filters?.skip || 0;
    const limit = Math.min(filters?.limit || 50, 100); // Max 100
    query = query.range(skip, skip + limit - 1);

    // Sort
    query = query.order('date_added', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      logger.error({ error, userId }, 'Failed to get jobs');
      throw createError('Failed to fetch jobs', 500, 'DB_ERROR');
    }

    return {
      jobs: data || [],
      total: count || 0,
      skip,
      limit,
      hasMore: (skip + limit) < (count || 0),
    };
  }

  /**
   * Get single job
   */
  static async getJobById(userId: string, jobId: string): Promise<Job | null> {
    const { data: job, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', userId)
      .single();

    if (error) {
      return null;
    }

    return job;
  }

  /**
   * Check for duplicate job (same company + role for user, case-insensitive)
   */
  static async checkDuplicate(userId: string, company: string, role: string): Promise<{ isDuplicate: boolean; existingId?: string; existingStatus?: string } | null> {
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('id, status, company, role')
      .eq('user_id', userId)
      .ilike('company', company)
      .ilike('role', role);

    if (error) {
      logger.error({ error, userId, company, role }, 'Failed to check duplicate');
      throw createError('Failed to check for duplicates', 500, 'DB_ERROR');
    }

    if (jobs && jobs.length > 0) {
      const existing = jobs[0];
      return {
        isDuplicate: true,
        existingId: existing.id,
        existingStatus: existing.status,
      };
    }

    return { isDuplicate: false };
  }

  /**
   * Create a new job
   */
  static async createJob(userId: string, jobData: any, force: boolean = false): Promise<Job | { isDuplicate: boolean; existingId?: string; existingStatus?: string }> {
    // Check for duplicates unless force flag is set
    if (!force) {
      const duplicateCheck = await this.checkDuplicate(userId, jobData.company, jobData.role);
      if (duplicateCheck?.isDuplicate) {
        return duplicateCheck;
      }
    }

    const { data: job, error } = await supabase
      .from('jobs')
      .insert({
        user_id: userId,
        ...jobData,
        date_added: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      logger.error({ error, userId }, 'Failed to create job');
      throw createError('Failed to create job', 500, 'DB_ERROR');
    }

    return job;
  }

  /**
   * Update a job
   */
  static async updateJob(userId: string, jobId: string, updates: any): Promise<Job> {
    const { data: job, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', jobId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      logger.error({ error, userId, jobId }, 'Failed to update job');
      throw createError('Failed to update job', 500, 'DB_ERROR');
    }

    return job;
  }

  /**
   * Delete a job
   */
  static async deleteJob(userId: string, jobId: string): Promise<void> {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId)
      .eq('user_id', userId);

    if (error) {
      logger.error({ error, userId, jobId }, 'Failed to delete job');
      throw createError('Failed to delete job', 500, 'DB_ERROR');
    }
  }

  /**
   * Bulk delete jobs
   */
  static async bulkDeleteJobs(userId: string, jobIds: string[]): Promise<number> {
    if (!jobIds.length) {
      return 0;
    }

    const { error, count } = await supabase
      .from('jobs')
      .delete()
      .eq('user_id', userId)
      .in('id', jobIds);

    if (error) {
      logger.error({ error, userId, jobIds }, 'Failed to bulk delete jobs');
      throw createError('Failed to delete jobs', 500, 'DB_ERROR');
    }

    return count || 0;
  }

  /**
   * Get job statistics
   */
  static async getJobStats(userId: string) {
    // Fetch all jobs for this user
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('status, portal')
      .eq('user_id', userId);

    if (error) {
      logger.error({ error, userId }, 'Failed to get job stats');
      throw createError('Failed to fetch stats', 500, 'DB_ERROR');
    }

    const stats = {
      total: jobs?.length || 0,
      applied: jobs?.filter((j) => j.status === 'Applied').length || 0,
      screening: jobs?.filter((j) => j.status === 'Screening').length || 0,
      interview: jobs?.filter((j) => j.status === 'Interview').length || 0,
      offer: jobs?.filter((j) => j.status === 'Offer').length || 0,
      rejected: jobs?.filter((j) => j.status === 'Rejected').length || 0,
      conversionRate: jobs?.length ? ((jobs.filter((j) => j.status === 'Interview').length / jobs.length) * 100).toFixed(1) : 0,
    };

    return stats;
  }
}
