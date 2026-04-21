/**
 * Daily Logs Service
 * Handles daily work log entries and streak tracking
 */

import { apiClient } from './api';
import { stateManager, eventBus } from './state';
import { monitor } from './monitor';
import type { DailyLog } from '../types/domain';
import type { CreateLogRequest, UpdateLogRequest, LogsListRequest } from '../types/api';

export class LogsService {
  /**
   * Get logs with optional date range filtering
   */
  async getLogs(filters: LogsListRequest = {}): Promise<DailyLog[]> {
    const wrapped = monitor.wrap(async () => {
      const params = new URLSearchParams();

      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);

      const skip = filters.skip ?? 0;
      const limit = filters.limit ?? 100;
      params.append('skip', skip.toString());
      params.append('limit', limit.toString());

      const response = await apiClient.get<DailyLog[]>(`/logs?${params}`);
      return response;
    }, 'getLogs');

    return wrapped();
  }

  /**
   * Get single log by ID
   */
  async getLogById(id: string): Promise<DailyLog> {
    const wrapped = monitor.wrap(async () => {
      const log = await apiClient.get<DailyLog>(`/logs/${id}`);
      return log;
    }, 'getLogById');

    return wrapped();
  }

  /**
   * Create new log entry
   */
  async createLog(request: CreateLogRequest): Promise<DailyLog> {
    const wrapped = monitor.wrap(async () => {
      const log = await apiClient.post<DailyLog>('/logs', request);
      eventBus.emit('log:created', { log });
      return log;
    }, 'createLog');

    return wrapped();
  }

  /**
   * Update log entry
   */
  async updateLog(id: string, request: UpdateLogRequest): Promise<DailyLog> {
    const wrapped = monitor.wrap(async () => {
      const log = await apiClient.patch<DailyLog>(`/logs/${id}`, request);
      eventBus.emit('log:updated', { log });
      return log;
    }, 'updateLog');

    return wrapped();
  }

  /**
   * Delete log entry
   */
  async deleteLog(id: string): Promise<void> {
    const wrapped = monitor.wrap(async () => {
      await apiClient.delete(`/logs/${id}`);
    }, 'deleteLog');

    return wrapped();
  }

  /**
   * Get current streak
   */
  async getCurrentStreak(): Promise<number> {
    const wrapped = monitor.wrap(async () => {
      const response = await apiClient.get<{ streak: number }>('/logs/streak/current');
      return response.streak || 0;
    }, 'getCurrentStreak');

    return wrapped();
  }

  /**
   * Get log statistics
   */
  async getLogStats(): Promise<any> {
    const wrapped = monitor.wrap(async () => {
      const stats = await apiClient.get('/logs/stats/summary');
      return stats;
    }, 'getLogStats');

    return wrapped();
  }

  /**
   * Save work log for today
   */
  async saveWorkLog(content: string, metrics?: Partial<CreateLogRequest>): Promise<DailyLog> {
    const today = new Date().toISOString().split('T')[0];

    const wrapped = monitor.wrap(async () => {
      const request: CreateLogRequest = {
        date: today,
        content,
        jobsApplied: metrics?.jobsApplied,
        hrContacted: metrics?.hrContacted,
        interviewsScheduled: metrics?.interviewsScheduled,
      };

      const log = await this.createLog(request);
      eventBus.emit('log:created', { log });
      return log;
    }, 'saveWorkLog');

    return wrapped();
  }

  /**
   * Sync logs to state
   */
  async syncLogs(filters?: LogsListRequest): Promise<void> {
    try {
      stateManager.setState('isLoading', true);
      const logs = await this.getLogs(filters);
      stateManager.setState('logs', logs);
      stateManager.setState('isLoading', false);
    } catch (error) {
      stateManager.setState('isLoading', false);
      throw error;
    }
  }
}

/**
 * Global logs service instance
 */
export const logsService = new LogsService();

export default logsService;
