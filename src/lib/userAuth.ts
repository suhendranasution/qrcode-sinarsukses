// Client-side authentication for dynamically created users
import type { AdminUser } from './auth';

export interface DynamicUser {
  id: string;
  email: string;
  name: string;
  role: string;
  password: string;
  created_at: string;
}

// Get all users (including dynamic ones)
export function getAllUsers(): DynamicUser[] {
  if (typeof window === 'undefined') return [];

  try {
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      return JSON.parse(storedUsers);
    }
  } catch (error) {
    console.error('Error reading users from localStorage:', error);
  }

  return [];
}

// Get user by email
export function getUserByEmail(email: string): DynamicUser | null {
  const users = getAllUsers();
  return users.find(u => u.email === email) || null;
}

// Validate user credentials (client-side only)
export function validateUserCredentials(email: string, password: string): AdminUser | null {
  if (typeof window === 'undefined') return null;

  const user = getUserByEmail(email);
  if (!user) return null;

  // Check password
  if (user.password === password) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };
  }

  return null;
}

// Check if user exists (for validation)
export function userExists(email: string): boolean {
  return getUserByEmail(email) !== null;
}