import { NextRequest, NextResponse } from "next/server";
import { validateUserCredentials } from "@/lib/userManagementDb";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password are required'
      }, { status: 400 });
    }

    // Validate user credentials against database
    const user = await validateUserCredentials(email, password);

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error('Error validating database credentials:', error);
    return NextResponse.json({
      success: false,
      error: 'Database validation failed'
    }, { status: 500 });
  }
}