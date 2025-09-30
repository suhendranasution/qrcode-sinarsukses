// Authentication utilities for manual auth system
import { createSupabaseServerClient } from "@/lib/supabase";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

// Function to hash password using SHA-256 for demo
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Function to verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const hashedInput = await hashPassword(password);
  return hashedInput === hashedPassword;
}

export async function loginAdmin(email: string, password: string): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  try {
    // Use hardcoded users for now (this runs on server-side)
    const hardcodedUsers = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'superadmin@example.com',
        password: 'admin123',
        name: 'Super Admin',
        role: 'super_admin'
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        email: 'admin@example.com',
        password: 'admin123',
        name: 'Admin',
        role: 'admin'
      }
    ];

    // Find user by email and verify password
    const user = hardcodedUsers.find(u => u.email === email && u.password === password);

    if (!user) {
      return { success: false, error: "Email atau password salah" };
    }

    // Generate session token
    const sessionToken = crypto.randomUUID();

    const userData: AdminUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    // Set session cookies (only in browser environment)
    if (typeof document !== 'undefined') {
      document.cookie = `admin-token=${sessionToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      document.cookie = `user-role=${user.role}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      document.cookie = `user-id=${user.id}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      document.cookie = `admin-user=${JSON.stringify(userData)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    }

    return { success: true, user: userData };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: "Terjadi kesalahan sistem" };
  }
}

export function logoutAdmin(): void {
  try {
    const sessionToken = getSessionToken();
    if (sessionToken) {
      // Note: In production, you might want to clean up the session from database
      // For now, we'll just clear cookies
    }
  } catch (error) {
    console.error('Session cleanup error:', error);
  }

  // Clear all auth cookies
  if (typeof document !== 'undefined') {
    document.cookie = 'admin-token=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'user-role=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'user-id=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'admin-user=; path=/; max-age=0; SameSite=Lax';
    window.location.href = "/login";
  }
}

export function getCurrentAdmin(): AdminUser | null {
  if (typeof document === 'undefined') return null;

  const userCookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('admin-user='));

  if (userCookie) {
    try {
      const userData = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
      return userData;
    } catch (error) {
      console.error('Error parsing user cookie:', error);
      return null;
    }
  }

  return null;
}

export function getUserRole(): string | null {
  if (typeof document === 'undefined') return null;

  const roleMatch = document.cookie.match(/user-role=([^;]+)/);
  return roleMatch ? decodeURIComponent(roleMatch[1]) : null;
}

export function getUserId(): string | null {
  if (typeof document === 'undefined') return null;

  const userIdMatch = document.cookie.match(/user-id=([^;]+)/);
  return userIdMatch ? decodeURIComponent(userIdMatch[1]) : null;
}

export function getSessionToken(): string | null {
  if (typeof document === 'undefined') return null;

  const tokenMatch = document.cookie.match(/admin-token=([^;]+)/);
  return tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;
}

export function isLoggedIn(): boolean {
  if (typeof document === 'undefined') return false;

  return document.cookie.includes('admin-token');
}

export function requireAuth(): AdminUser | null {
  if (typeof document === 'undefined') return null;

  const user = getCurrentAdmin();
  if (!user || !isLoggedIn()) {
    window.location.href = "/login";
    return null;
  }
  return user;
}

// Role-based access control
export function hasRole(requiredRole: string): boolean {
  const userRole = getUserRole();
  if (!userRole) return false;

  const roleHierarchy = {
    'super_admin': 3,
    'admin': 2,
    'viewer': 1
  };

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy];
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy];

  return userLevel !== undefined && requiredLevel !== undefined && userLevel >= requiredLevel;
}

export function canAccess(feature: string): boolean {
  const role = getUserRole();
  if (!role) return false;

  const permissions = {
    'super_admin': ['users', 'brands', 'certificates', 'dashboard'],
    'admin': ['brands', 'certificates', 'dashboard'],
    'viewer': ['dashboard']
  };

  const rolePermissions = permissions[role as keyof typeof permissions];
  return Array.isArray(rolePermissions) && rolePermissions.includes(feature);
}