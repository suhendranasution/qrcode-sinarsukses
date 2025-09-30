import { NextRequest, NextResponse } from "next/server";

// In-memory storage for users (sync with the users route)
let inMemoryUsers = [
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Find user by email
    const user = inMemoryUsers.find(u => u.email === email);

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // Check password
    if (user.password !== password) {
      return NextResponse.json({
        success: false,
        error: 'Invalid password'
      }, { status: 401 });
    }

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error validating credentials:', error);
    return NextResponse.json({
      success: false,
      error: 'Validation failed'
    }, { status: 500 });
  }
}