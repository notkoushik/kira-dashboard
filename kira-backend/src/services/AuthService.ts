import bcrypt from 'bcryptjs';
import { supabase } from '../config/database';
import { generateToken } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { logger } from '../config/logger';
import type { User, AuthResponse } from '../types';

export class AuthService {
  /**
   * Register a new user
   */
  static async register(email: string, password: string, name: string = ''): Promise<AuthResponse> {
    // Check if user already exists
    const { data: existing, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      throw createError('User already exists with this email', 409, 'USER_EXISTS');
    }

    if (checkError && checkError.code !== 'PGRST116') {
      throw createError('Failed to check user existence', 500, 'DB_ERROR');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const { data: user, error: insertError } = await supabase
      .from('users')
      .insert({
        email,
        name: name || email.split('@')[0],
        password_hash: passwordHash,
      })
      .select()
      .single();

    if (insertError || !user) {
      logger.error({ error: insertError }, 'Failed to create user');
      throw createError('Failed to create user', 500, 'DB_ERROR');
    }

    const token = generateToken(user.id, user.email);
    const { password_hash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  /**
   * Login user
   */
  static async login(email: string, password: string): Promise<AuthResponse> {
    // Get user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw createError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      throw createError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const token = generateToken(user.id, user.email);
    const { password_hash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<User | null> {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      logger.error({ error, userId }, 'Failed to get user');
      return null;
    }

    return user;
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, profileData: any) {
    const updateData: any = {
      profile_data: profileData,
      updated_at: new Date().toISOString(),
    };

    if (profileData.name) {
      updateData.name = profileData.name;
    }

    if (profileData.daily_goal) {
      updateData.daily_goal = profileData.daily_goal;
    }

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      logger.error({ error, userId }, 'Failed to update profile');
      throw createError('Failed to update profile', 500, 'DB_ERROR');
    }

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
