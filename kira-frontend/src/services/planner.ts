/**
 * Planner Service
 * Handles daily planner tasks and streak tracking
 */

import { apiClient } from './api';
import { stateManager, eventBus } from './state';
import { monitor } from './monitor';
import type { PlannerTask } from '../types/domain';
import type { CreatePlannerRequest, UpdatePlannerRequest, PlannerListRequest } from '../types/api';

export class PlannerService {
  /**
   * Get planner tasks with optional filtering
   */
  async getPlannerTasks(filters: PlannerListRequest = {}): Promise<PlannerTask[]> {
    const wrapped = monitor.wrap(async () => {
      const params = new URLSearchParams();

      if (filters.taskDate) params.append('taskDate', filters.taskDate);
      if (filters.completed !== undefined) params.append('completed', String(filters.completed));

      const skip = filters.skip ?? 0;
      const limit = filters.limit ?? 50;
      params.append('skip', skip.toString());
      params.append('limit', limit.toString());

      const response = await apiClient.get<PlannerTask[]>(`/planner?${params}`);
      return response;
    }, 'getPlannerTasks');

    return wrapped();
  }

  /**
   * Get single planner task by ID
   */
  async getTaskById(id: string): Promise<PlannerTask> {
    const wrapped = monitor.wrap(async () => {
      const task = await apiClient.get<PlannerTask>(`/planner/${id}`);
      return task;
    }, 'getTaskById');

    return wrapped();
  }

  /**
   * Get today's planner tasks
   */
  async getTodaysTasks(): Promise<PlannerTask[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getPlannerTasks({ taskDate: today });
  }

  /**
   * Create planner task
   */
  async createTask(request: CreatePlannerRequest): Promise<PlannerTask> {
    const wrapped = monitor.wrap(async () => {
      const task = await apiClient.post<PlannerTask>('/planner', request);
      eventBus.emit('planner:task:created', { task });
      return task;
    }, 'createTask');

    return wrapped();
  }

  /**
   * Update planner task
   */
  async updateTask(id: string, request: UpdatePlannerRequest): Promise<PlannerTask> {
    const wrapped = monitor.wrap(async () => {
      const task = await apiClient.patch<PlannerTask>(`/planner/${id}`, request);
      eventBus.emit('planner:task:updated', { task });
      return task;
    }, 'updateTask');

    return wrapped();
  }

  /**
   * Mark task as completed
   */
  async completeTask(id: string): Promise<PlannerTask> {
    const wrapped = monitor.wrap(async () => {
      const task = await apiClient.patch<PlannerTask>(`/planner/${id}`, {
        completed: true,
        completedAt: new Date().toISOString(),
      });
      eventBus.emit('planner:task:completed', { task });
      return task;
    }, 'completeTask');

    return wrapped();
  }

  /**
   * Delete task
   */
  async deleteTask(id: string): Promise<void> {
    const wrapped = monitor.wrap(async () => {
      await apiClient.delete(`/planner/${id}`);
    }, 'deleteTask');

    return wrapped();
  }

  /**
   * Get planner statistics
   */
  async getPlannerStats(): Promise<any> {
    const wrapped = monitor.wrap(async () => {
      const stats = await apiClient.get('/planner/stats/summary');
      return stats;
    }, 'getPlannerStats');

    return wrapped();
  }

  /**
   * Get today's completion percentage
   */
  async getTodaysProgress(): Promise<number> {
    try {
      const tasks = await this.getTodaysTasks();
      if (tasks.length === 0) return 0;

      const completed = tasks.filter(t => t.completed).length;
      return Math.round((completed / tasks.length) * 100);
    } catch (error) {
      monitor.warn('Failed to get today progress', { operation: 'getTodaysProgress' });
      return 0;
    }
  }

  /**
   * Sync planner to state
   */
  async syncPlanner(filters?: PlannerListRequest): Promise<void> {
    try {
      stateManager.setState('isLoading', true);
      const tasks = await this.getPlannerTasks(filters);
      stateManager.setState('planner', tasks);
      stateManager.setState('isLoading', false);
    } catch (error) {
      stateManager.setState('isLoading', false);
      throw error;
    }
  }
}

/**
 * Global planner service instance
 */
export const plannerService = new PlannerService();

export default plannerService;
