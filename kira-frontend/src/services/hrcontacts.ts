/**
 * HR Contacts Service
 * Handles CRUD operations for HR contact management
 */

import { apiClient } from './api';
import { stateManager, eventBus } from './state';
import { monitor } from './monitor';
import type { HRContact } from '../types/domain';
import type { CreateHRRequest, UpdateHRRequest, HRListRequest } from '../types/api';

export class HRContactsService {
  /**
   * Get list of HR contacts with filtering
   */
  async getHRContacts(filters: HRListRequest = {}): Promise<HRContact[]> {
    const wrapped = monitor.wrap(async () => {
      const params = new URLSearchParams();

      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);

      const skip = filters.skip ?? 0;
      const limit = filters.limit ?? 50;
      params.append('skip', skip.toString());
      params.append('limit', limit.toString());

      const response = await apiClient.get<HRContact[]>(`/hrcontacts?${params}`);
      return response;
    }, 'getHRContacts');

    return wrapped();
  }

  /**
   * Get single HR contact by ID
   */
  async getHRContactById(id: string): Promise<HRContact> {
    const wrapped = monitor.wrap(async () => {
      const contact = await apiClient.get<HRContact>(`/hrcontacts/${id}`);
      return contact;
    }, 'getHRContactById');

    return wrapped();
  }

  /**
   * Create new HR contact
   */
  async createHRContact(request: CreateHRRequest): Promise<HRContact> {
    const wrapped = monitor.wrap(async () => {
      const contact = await apiClient.post<HRContact>('/hrcontacts', request);
      eventBus.emit('hr:created', { contact });
      return contact;
    }, 'createHRContact');

    return wrapped();
  }

  /**
   * Update HR contact
   */
  async updateHRContact(id: string, request: UpdateHRRequest): Promise<HRContact> {
    const wrapped = monitor.wrap(async () => {
      const contact = await apiClient.patch<HRContact>(`/hrcontacts/${id}`, request);
      eventBus.emit('hr:updated', { contact });
      return contact;
    }, 'updateHRContact');

    return wrapped();
  }

  /**
   * Delete HR contact
   */
  async deleteHRContact(id: string): Promise<void> {
    const wrapped = monitor.wrap(async () => {
      await apiClient.delete(`/hrcontacts/${id}`);
      eventBus.emit('hr:deleted', { id });
    }, 'deleteHRContact');

    return wrapped();
  }

  /**
   * Get HR statistics
   */
  async getHRStats(): Promise<any> {
    const wrapped = monitor.wrap(async () => {
      const stats = await apiClient.get('/hrcontacts/stats/summary');
      return stats;
    }, 'getHRStats');

    return wrapped();
  }

  /**
   * Sync HR contacts to state
   */
  async syncHRContacts(filters?: HRListRequest): Promise<void> {
    try {
      stateManager.setState('isLoading', true);
      const contacts = await this.getHRContacts(filters);
      stateManager.setState('hrContacts', contacts);
      stateManager.setState('isLoading', false);
    } catch (error) {
      stateManager.setState('isLoading', false);
      throw error;
    }
  }
}

/**
 * Global HR contacts service instance
 */
export const hrContactsService = new HRContactsService();

export default hrContactsService;
