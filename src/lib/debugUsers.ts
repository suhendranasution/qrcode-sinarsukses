// Debug utility to check users in localStorage
export interface DebugUser {
  id: string;
  email: string;
  name: string;
  role: string;
  password?: string;
  created_at: string;
}

export function getUsersFromLocalStorage(): DebugUser[] {
  if (typeof window === 'undefined') return [];

  try {
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      const users = JSON.parse(storedUsers);
      console.log('Users from localStorage:', users);
      return users;
    } else {
      console.log('No users found in localStorage');
      return [];
    }
  } catch (error) {
    console.error('Error reading users from localStorage:', error);
    return [];
  }
}

export function clearAllUsers(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('users');
    console.log('All users cleared from localStorage');
  } catch (error) {
    console.error('Error clearing users from localStorage:', error);
  }
}

export function addUserForTesting(user: DebugUser): void {
  if (typeof window === 'undefined') return;

  try {
    const existingUsers = getUsersFromLocalStorage();
    existingUsers.push(user);
    localStorage.setItem('users', JSON.stringify(existingUsers));
    console.log('Test user added:', user);
  } catch (error) {
    console.error('Error adding test user:', error);
  }
}