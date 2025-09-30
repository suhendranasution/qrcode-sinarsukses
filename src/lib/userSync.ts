// User synchronization between localStorage and server
import type { User } from './userManagementLocal';

export async function syncUsersToServer(users: User[]): Promise<void> {
  try {
    const response = await fetch('/api/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ users }),
    });

    if (!response.ok) {
      console.error('Failed to sync users to server');
    }
  } catch (error) {
    console.error('Error syncing users to server:', error);
  }
}

export function getUsersFromLocalStorage(): User[] {
  if (typeof window === 'undefined') return [];

  try {
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      return JSON.parse(storedUsers);
    }
  } catch (error) {
    console.error('Error reading users from localStorage:', error);
  }

  // Initialize with default users if localStorage is empty
  const defaultUsers = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'superadmin@example.com',
      name: 'Super Admin',
      role: 'super_admin',
      password: 'admin123',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      email: 'admin@example.com',
      name: 'Admin',
      role: 'admin',
      password: 'admin123',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // Save default users to localStorage
  saveUsersToLocalStorage(defaultUsers);

  return defaultUsers;
}

export function saveUsersToLocalStorage(users: User[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('users', JSON.stringify(users));
    console.log('Users saved to localStorage:', users.length);
  } catch (error) {
    console.error('Error saving users to localStorage:', error);
  }
}