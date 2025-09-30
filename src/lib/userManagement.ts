import { createSupabaseServerClient } from "@/lib/supabase";
import { hashPassword } from "@/lib/auth";

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'viewer';
  created_at: string;
  updated_at: string;
}

export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
  role: 'super_admin' | 'admin' | 'viewer';
}

export interface UpdateUserInput {
  name?: string;
  role?: 'super_admin' | 'admin' | 'viewer';
  password?: string;
}

// Get all users (only accessible by super_admin)
export async function getUsers(): Promise<User[]> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUsers:', error);
    throw error;
  }
}

// Get user by ID
export async function getUserById(id: string): Promise<User | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return data;
}

// Create new user (only accessible by super_admin)
export async function createUser(input: CreateUserInput): Promise<User | null> {
  try {
    const supabase = await createSupabaseServerClient();

    // Hash password
    const passwordHash = await hashPassword(input.password);

    const { data, error } = await supabase
      .from('users')
      .insert({
        email: input.email,
        name: input.name,
        password_hash: passwordHash,
        role: input.role
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Update user (super_admin can update any user, users can update their own profile)
export async function updateUser(userId: string, input: UpdateUserInput): Promise<User | null> {
  try {
    const supabase = await createSupabaseServerClient();

    const updateData: { name?: string; role?: 'super_admin' | 'admin' | 'viewer'; password_hash?: string } = {};

    if (input.name) updateData.name = input.name;
    if (input.role) updateData.role = input.role;
    if (input.password) {
      updateData.password_hash = await hashPassword(input.password);
    }

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
}

// Delete user (only accessible by super_admin)
export async function deleteUser(userId: string): Promise<boolean> {
  try {
    const supabase = await createSupabaseServerClient();

    // Delete user sessions first
    await supabase
      .from('user_sessions')
      .delete()
      .eq('user_id', userId);

    // Delete user
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
}

// Check if email is available
export async function isEmailAvailable(email: string, excludeUserId?: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from('users')
    .select('id')
    .eq('email', email);

  if (excludeUserId) {
    query = query.neq('id', excludeUserId);
  }

  const { data, error } = await query.single();

  // If no data found, email is available
  return !data;
}