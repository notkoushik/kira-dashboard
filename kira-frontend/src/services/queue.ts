/**
 * Apply Queue Service
 * Handles job application queue management
 */

import { apiClient } from './api';
import { stateManager, eventBus } from './state';
import { monitor } from './monitor';
import type { QueueItem } from '../types/domain';
import type { CreateQueueRequest, UpdateQueueRequest, QueueListRequest, BulkDeleteRequest } from '../types/api';

export class QueueService {
  /**
   * Get queue items with filtering
   */
  async getQueue(filters: QueueListRequest = {}): Promise<QueueItem[]> {
    const wrapped = monitor.wrap(async () => {
      const params = new URLSearchParams();

      if (filters.priority !== undefined) params.append('priority', filters.priority.toString());
      if (filters.status) params.append('status', filters.status);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.search) params.append('search', filters.search);

      const skip = filters.skip ?? 0;
      const limit = filters.limit ?? 50;
      params.append('skip', skip.toString());
      params.append('limit', limit.toString());

      const response = await apiClient.get<QueueItem[]>(`/queue?${params}`);
      return response;
    }, 'getQueue');

    return wrapped();
  }

  /**
   * Get single queue item by ID
   */
  async getQueueItemById(id: string): Promise<QueueItem> {
    const wrapped = monitor.wrap(async () => {
      const item = await apiClient.get<QueueItem>(`/queue/${id}`);
      return item;
    }, 'getQueueItemById');

    return wrapped();
  }

  /**
   * Add job to queue
   */
  async addToQueue(request: CreateQueueRequest): Promise<QueueItem> {
    const wrapped = monitor.wrap(async () => {
      const item = await apiClient.post<QueueItem>('/queue', request);
      eventBus.emit('queue:item:added', { item });
      return item;
    }, 'addToQueue');

    return wrapped();
  }

  /**
   * Update queue item
   */
  async updateQueueItem(id: string, request: UpdateQueueRequest): Promise<QueueItem> {
    const wrapped = monitor.wrap(async () => {
      const item = await apiClient.patch<QueueItem>(`/queue/${id}`, request);
      eventBus.emit('queue:item:updated', { item });
      return item;
    }, 'updateQueueItem');

    return wrapped();
  }

  /**
   * Update queue item status
   */
  async updateQueueStatus(id: string, status: string): Promise<QueueItem> {
    const wrapped = monitor.wrap(async () => {
      const item = await apiClient.patch<QueueItem>(`/queue/${id}`, { status });
      eventBus.emit('queue:item:updated', { item });
      return item;
    }, 'updateQueueStatus');

    return wrapped();
  }

  /**
   * Remove item from queue
   */
  async removeFromQueue(id: string): Promise<void> {
    const wrapped = monitor.wrap(async () => {
      await apiClient.delete(`/queue/${id}`);
      eventBus.emit('queue:item:deleted', { id });
    }, 'removeFromQueue');

    return wrapped();
  }

  /**
   * Remove multiple items from queue
   */
  async removeQueueItemsBulk(ids: string[]): Promise<void> {
    const wrapped = monitor.wrap(async () => {
      await apiClient.post('/queue/bulk/delete', { ids } as BulkDeleteRequest);
      eventBus.emit('queue:item:deleted', { ids });
    }, 'removeQueueItemsBulk');

    return wrapped();
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<any> {
    const wrapped = monitor.wrap(async () => {
      const stats = await apiClient.get('/queue/stats/summary');
      return stats;
    }, 'getQueueStats');

    return wrapped();
  }

  /**
   * Sync queue to state
   */
  async syncQueue(filters?: QueueListRequest): Promise<void> {
    try {
      stateManager.setState('isLoading', true);
      const items = await this.getQueue(filters);
      stateManager.setState('queue', items);
      stateManager.setState('isLoading', false);
    } catch (error) {
      stateManager.setState('isLoading', false);
      throw error;
    }
  }
}

/**
 * Global queue service instance
 */
export const queueService = new QueueService();

export default queueService;
