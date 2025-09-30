import { NextRequest, NextResponse } from "next/server";

// In-memory storage for users (fallback when localStorage is not available)
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

export async function GET(request: NextRequest) {
  try {
    // Check if users are sent in request body (from client-side localStorage)
    const body = await request.json().catch(() => ({}));

    if (body.users && Array.isArray(body.users)) {
      // Update in-memory storage with client-side users
      inMemoryUsers = body.users;
      console.log('In-memory users synced from client:', inMemoryUsers.length);
    }

    return NextResponse.json({
      success: true,
      users: inMemoryUsers
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch users'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if this is a sync operation
    if (body.sync && body.users) {
      inMemoryUsers = body.users;
      console.log('Users synced to server:', inMemoryUsers.length);
      return NextResponse.json({
        success: true,
        message: 'Users synced successfully'
      });
    }

    // Regular user creation
    const { email, name, password, role } = body;

    // Check if user already exists
    const existingUser = inMemoryUsers.find(u => u.email === email);
    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'Email already exists'
      }, { status: 400 });
    }

    // Create new user
    const newUser = {
      id: crypto.randomUUID(),
      email,
      name,
      role,
      password, // Store password as-is for demo
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    inMemoryUsers.push(newUser);

    console.log('User created:', newUser);

    return NextResponse.json({
      success: true,
      user: newUser
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create user'
    }, { status: 500 });
  }
}