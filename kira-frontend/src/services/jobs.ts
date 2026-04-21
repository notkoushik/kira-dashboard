/**
 * Jobs Service
 * Handles CRUD operations for job applications
 */

import { apiClient } from './api';
import { stateManager, eventBus } from './state';
import { monitor } from './monitor';
import type { Job } from '../types/domain';
import type { CreateJobRequest, UpdateJobRequest, JobsListRequest, BulkDeleteRequest } from '../types/api';
import type { PaginatedResponse } from '../types/domain';

export class JobsService {
  /**
   * Get list of jobs with filtering and pagination
   */
  async getJobs(filters: JobsListRequest = {}): Promise<Job[]> {
    const wrapped = monitor.wrap(async () => {
      const params = new URLSearchParams();

      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.portal) params.append('portal', filters.portal);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);

      const skip = filters.skip ?? 0;
      const limit = filters.limit ?? 50;
      params.append('skip', skip.toString());
      params.append('limit', limit.toString());

      const response = await apiClient.get<Job[]>(`/jobs?${params}`);
      return response;
    }, 'getJobs');

    return wrapped();
  }

  /**
   * Get single job by ID
   */
  async getJobById(id: string): Promise<Job> {
    const wrapped = monitor.wrap(async () => {
      const job = await apiClient.get<Job>(`/jobs/${id}`);
      return job;
    }, 'getJobById');

    return wrapped();
  }

  /**
   * Create new job
   */
  async createJob(request: CreateJobRequest): Promise<Job> {
    const wrapped = monitor.wrap(async () => {
      const job = await apiClient.post<Job>('/jobs', request);
      eventBus.emit('job:created', { job });
      return job;
    }, 'createJob');

    return wrapped();
  }

  /**
   * Update existing job
   */
  async updateJob(id: string, request: UpdateJobRequest): Promise<Job> {
    const wrapped = monitor.wrap(async () => {
      const job = await apiClient.patch<Job>(`/jobs/${id}`, request);
      eventBus.emit('job:updated', { job });
      return job;
    }, 'updateJob');

    return wrapped();
  }

  /**
   * Update job status
   */
  async updateJobStatus(id: string, status: string): Promise<Job> {
    const wrapped = monitor.wrap(async () => {
      const job = await apiClient.patch<Job>(`/jobs/${id}`, { status });
      eventBus.emit('job:statusChanged', { jobId: id, status });
      return job;
    }, 'updateJobStatus');

    return wrapped();
  }

  /**
   * Delete job
   */
  async deleteJob(id: string): Promise<void> {
    const wrapped = monitor.wrap(async () => {
      await apiClient.delete(`/jobs/${id}`);
      eventBus.emit('job:deleted', { jobId: id });
    }, 'deleteJob');

    return wrapped();
  }

  /**
   * Delete multiple jobs
   */
  async deleteJobsBulk(ids: string[]): Promise<void> {
    const wrapped = monitor.wrap(async () => {
      await apiClient.post('/jobs/bulk/delete', { ids } as BulkDeleteRequest);
      eventBus.emit('job:deleted', { jobIds: ids });
    }, 'deleteJobsBulk');

    return wrapped();
  }

  /**
   * Get job statistics
   */
  async getJobStats(): Promise<any> {
    const wrapped = monitor.wrap(async () => {
      const stats = await apiClient.get('/jobs/stats/summary');
      return stats;
    }, 'getJobStats');

    return wrapped();
  }

  /**
   * Sync jobs to state
   */
  async syncJobs(filters?: JobsListRequest): Promise<void> {
    try {
      stateManager.setState('isLoading', true);
      const jobs = await this.getJobs(filters);
      stateManager.setState('jobs', jobs);
      stateManager.setState('isLoading', false);
    } catch (error) {
      stateManager.setState('isLoading', false);
      throw error;
    }
  }
}

/**
 * Global jobs service instance
 */
export const jobsService = new JobsService();

export default jobsService;
