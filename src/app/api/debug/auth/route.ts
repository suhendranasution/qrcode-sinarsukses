import { NextResponse } from 'next/server';
import { validateUserCredentials } from '@/lib/userManagementDb';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const results = {
      timestamp: new Date().toISOString(),
      test: 'authentication-database',
      email: email || 'not-provided',
      success: false,
      message: '',
      steps: [] as Array<{
        step: string;
        status: string;
        email?: string;
        passwordLength?: number;
        user?: {
          id: string;
          email: string;
          name: string;
          role: string;
          created_at: string;
        };
        error?: string;
      }>
    };

    // Step 1: Validate input
    if (!email || !password) {
      results.steps.push({
        step: 'Input Validation',
        status: '✗ Failed',
        error: 'Email and password are required'
      });
      return NextResponse.json(results);
    }

    results.steps.push({
      step: 'Input Validation',
      status: '✓ Success',
      email: email,
      passwordLength: password.length
    });

    // Step 2: Test database authentication
    try {
      const user = await validateUserCredentials(email, password);

      if (user) {
        results.steps.push({
          step: 'Database Authentication',
          status: '✓ Success',
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            created_at: user.created_at
          }
        });

        results.success = true;
        results.message = 'Authentication successful';
      } else {
        results.steps.push({
          step: 'Database Authentication',
          status: '✗ Failed',
          error: 'Invalid credentials or user not found'
        });

        results.success = false;
        results.message = 'Authentication failed';
      }
    } catch (error) {
      results.steps.push({
        step: 'Database Authentication',
        status: '✗ Failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      results.success = false;
      results.message = 'Database error during authentication';
    }

    return NextResponse.json(results);

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Debug endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Authentication debug endpoint',
    usage: 'POST with { email, password } to test authentication',
    example: {
      email: 'superadmin@sinarsuksessejatindo.com',
      password: '12345678'
    }
  });
}