import { NextRequest, NextResponse } from "next/server";
import { validateUserCredentials as validateDbCredentials } from "@/lib/userManagementDb";

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

    const user = await validateDbCredentials(email, password);

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Invalid credentials'
      }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error('Error validating credentials:', error);
    return NextResponse.json({
      success: false,
      error: 'Validation failed'
    }, { status: 500 });
  }
}