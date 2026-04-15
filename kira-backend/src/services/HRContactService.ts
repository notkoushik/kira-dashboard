import { supabase } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { logger } from '../config/logger';
import type { HRContact } from '../types';

export class HRContactService {
  /**
   * Get all HR contacts for a user with pagination and filtering
   */
  static async getAll(
    userId: string,
    filters?: {
      search?: string;
      status?: string;
      skip?: number;
      limit?: number;
    }
  ) {
    let query = supabase
      .from('hr_contacts')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    // Apply filters
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    // Apply search filter across name and company
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      query = query.or(
        `name.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%`
      );
    }

    // Pagination
    const skip = filters?.skip || 0;
    const limit = Math.min(filters?.limit || 50, 100);
    query = query.range(skip, skip + limit - 1);

    // Sort
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      logger.error({ error, userId }, 'Failed to get HR contacts');
      throw createError('Failed to fetch HR contacts', 500, 'DB_ERROR');
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
   * Get single HR contact
   */
  static async getById(userId: string, contactId: string): Promise<HRContact | null> {
    const { data: contact, error } = await supabase
      .from('hr_contacts')
      .select('*')
      .eq('id', contactId)
      .eq('user_id', userId)
      .single();

    if (error) {
      return null;
    }

    return contact;
  }

  /**
   * Create a new HR contact
   */
  static async create(userId: string, contactData: any): Promise<HRContact> {
    const { data: contact, error } = await supabase
      .from('hr_contacts')
      .insert({
        user_id: userId,
        ...contactData,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      logger.error({ error, userId }, 'Failed to create HR contact');
      throw createError('Failed to create HR contact', 500, 'DB_ERROR');
    }

    return contact;
  }

  /**
   * Update an HR contact
   */
  static async update(userId: string, contactId: string, updates: any): Promise<HRContact> {
    const { data: contact, error } = await supabase
      .from('hr_contacts')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', contactId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      logger.error({ error, userId, contactId }, 'Failed to update HR contact');
      throw createError('Failed to update HR contact', 500, 'DB_ERROR');
    }

    return contact;
  }

  /**
   * Delete an HR contact
   */
  static async delete(userId: string, contactId: string): Promise<void> {
    const { error } = await supabase
      .from('hr_contacts')
      .delete()
      .eq('id', contactId)
      .eq('user_id', userId);

    if (error) {
      logger.error({ error, userId, contactId }, 'Failed to delete HR contact');
      throw createError('Failed to delete HR contact', 500, 'DB_ERROR');
    }
  }

  /**
   * Bulk delete HR contacts
   */
  static async bulkDelete(userId: string, contactIds: string[]): Promise<number> {
    if (!contactIds.length) {
      return 0;
    }

    const { error, count } = await supabase
      .from('hr_contacts')
      .delete()
      .eq('user_id', userId)
      .in('id', contactIds);

    if (error) {
      logger.error({ error, userId, contactIds }, 'Failed to bulk delete HR contacts');
      throw createError('Failed to delete HR contacts', 500, 'DB_ERROR');
    }

    return count || 0;
  }

  /**
   * Get HR contact statistics
   */
  static async getStats(userId: string) {
    const { data: contacts, error } = await supabase
      .from('hr_contacts')
      .select('status')
      .eq('user_id', userId);

    if (error) {
      logger.error({ error, userId }, 'Failed to get HR contact stats');
      throw createError('Failed to fetch stats', 500, 'DB_ERROR');
    }

    const stats = {
      total: contacts?.length || 0,
      notContacted: contacts?.filter((c) => c.status === 'Not Contacted').length || 0,
      emailDrafted: contacts?.filter((c) => c.status === 'Email Drafted').length || 0,
      emailSent: contacts?.filter((c) => c.status === 'Email Sent').length || 0,
      linkedinConnected: contacts?.filter((c) => c.status === 'LinkedIn Connected').length || 0,
      replied: contacts?.filter((c) => c.status === 'Replied').length || 0,
      rejected: contacts?.filter((c) => c.status === 'Rejected').length || 0,
    };

    return stats;
  }
}
