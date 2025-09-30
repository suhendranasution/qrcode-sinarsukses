import { NextRequest, NextResponse } from "next/server";
import { getUsers as getDbUsers, createUser as createDbUser } from "@/lib/userManagementDb";

export async function GET(request: NextRequest) {
  try {
    const users = await getDbUsers();

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

    // Validate input
    if (!email || !name || !password || !role) {
      return NextResponse.json({
        success: false,
        error: 'All fields are required'
      }, { status: 400 });
    }

    // Create user in database
    const user = await createDbUser({ email, name, password, role });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create user'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error('Error creating user:', error);

    // Check if it's a duplicate email error
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json({
        success: false,
        error: 'Email already exists'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to create user'
    }, { status: 500 });
  }
}