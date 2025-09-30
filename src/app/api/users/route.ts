import { NextRequest, NextResponse } from "next/server";
import { getUsers, createUser, isEmailAvailable } from "@/lib/userManagementDb";

export async function GET(request: NextRequest) {
  try {
    // Get users from database
    const users = await getUsers();

    return NextResponse.json({
      success: true,
      users: users
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
    const { email, name, password, role } = body;

    // Validate required fields
    if (!email || !name || !password || !role) {
      return NextResponse.json({
        success: false,
        error: 'All fields are required: email, name, password, role'
      }, { status: 400 });
    }

    // Check if email is already available
    const emailExists = !(await isEmailAvailable(email));
    if (emailExists) {
      return NextResponse.json({
        success: false,
        error: 'Email already exists'
      }, { status: 400 });
    }

    // Create user in database
    const newUser = await createUser({
      email,
      name,
      password,
      role
    });

    if (!newUser) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create user'
      }, { status: 500 });
    }

    console.log('User created in database:', newUser);

    return NextResponse.json({
      success: true,
      user: newUser
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create user: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}