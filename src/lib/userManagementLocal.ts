// Temporary user management using localStorage
// This is a fallback until the database is properly set up

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'viewer';
  created_at: string;
  updated_at: string;
  password?: string; // Add password field for login verification
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

// Default users
const defaultUsers: User[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'superadmin@example.com',
    name: 'Super Admin',
    role: 'super_admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    password: 'admin123'
  }
];

// Helper functions
const getUsersFromStorage = (): User[] => {
  if (typeof window === 'undefined') return defaultUsers;

  try {
    const stored = localStorage.getItem('users');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading users from localStorage:', error);
  }

  // Initialize with default users
  localStorage.setItem('users', JSON.stringify(defaultUsers));
  return defaultUsers;
};

const saveUsersToStorage = (users: User[]): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('users', JSON.stringify(users));
  } catch (error) {
    console.error('Error saving users to localStorage:', error);
  }
};

// Generate UUID
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Mock hash function (for demo only)
const mockHash = async (password: string): Promise<string> => {
  // Simple hash for demo - in production use proper hashing
  return 'hash_' + password;
};

// Get all users
export async function getUsers(): Promise<User[]> {
  // Simulate database delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return getUsersFromStorage();
}

// Get user by ID
export async function getUserById(id: string): Promise<User | null> {
  const users = getUsersFromStorage();
  return users.find(user => user.id === id) || null;
}

// Create new user
export async function createUser(input: CreateUserInput): Promise<User | null> {
  try {
    const users = getUsersFromStorage();

    // Check if email already exists
    const existingUser = users.find(user => user.email === input.email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const newUser: User = {
      id: generateUUID(),
      email: input.email,
      name: input.name,
      role: input.role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      password: input.password // Store password for login verification
    };

    users.push(newUser);
    saveUsersToStorage(users);

    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Update user
export async function updateUser(userId: string, input: UpdateUserInput): Promise<User | null> {
  try {
    const users = getUsersFromStorage();
    const userIndex = users.findIndex(user => user.id === userId);

    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const updatedUser = {
      ...users[userIndex],
      name: input.name || users[userIndex].name,
      role: input.role || users[userIndex].role,
      password: input.password || users[userIndex].password,
      updated_at: new Date().toISOString()
    };

    users[userIndex] = updatedUser;
    saveUsersToStorage(users);

    return updatedUser;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

// Delete user
export async function deleteUser(userId: string): Promise<boolean> {
  try {
    const users = getUsersFromStorage();
    const userIndex = users.findIndex(user => user.id === userId);

    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // Don't allow deleting super admin
    if (users[userIndex].role === 'super_admin') {
      throw new Error('Cannot delete super admin');
    }

    users.splice(userIndex, 1);
    saveUsersToStorage(users);

    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

// Check if email is available
export async function isEmailAvailable(email: string, excludeUserId?: string): Promise<boolean> {
  const users = getUsersFromStorage();
  const existingUser = users.find(user =>
    user.email === email && user.id !== excludeUserId
  );

  return !existingUser;
}