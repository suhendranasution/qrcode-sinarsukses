import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUsers } from '@/lib/userManagementDb';

export async function GET() {
  try {
    const results: any = {
      timestamp: new Date().toISOString(),
      test: 'user-management-database',
      environment: process.env.NODE_ENV,
      steps: []
    };

    // Step 1: Check environment variables
    results.steps.push({
      step: 'Environment Check',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing',
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing'
    });

    // Step 2: Test basic database connection
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });

        if (error) {
          results.steps.push({
            step: 'Database Connection',
            status: '✗ Failed',
            error: error.message
          });
        } else {
          results.steps.push({
            step: 'Database Connection',
            status: '✓ Success',
            userCount: data?.[0]?.count || 0
          });
        }
      } catch (error) {
        results.steps.push({
          step: 'Database Connection',
          status: '✗ Failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Step 3: Test users table structure
    try {
      const { data: sampleUsers, error } = await supabase.from('users').select('*').limit(1);

      if (error) {
        results.steps.push({
          step: 'Users Table Access',
          status: '✗ Failed',
          error: error.message
        });
      } else {
        results.steps.push({
          step: 'Users Table Access',
          status: '✓ Success',
          columns: sampleUsers?.[0] ? Object.keys(sampleUsers[0]) : 'No data',
          sampleCount: sampleUsers?.length || 0
        });
      }
    } catch (error) {
      results.steps.push({
        step: 'Users Table Access',
        status: '✗ Failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Step 4: Test getUsers function
    try {
      const users = await getUsers();
      results.steps.push({
        step: 'getUsers Function',
        status: '✓ Success',
        userCount: users.length,
        users: users.map(u => ({ id: u.id, email: u.email, role: u.role }))
      });
    } catch (error) {
      results.steps.push({
        step: 'getUsers Function',
        status: '✗ Failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Step 5: Test user creation (dry run - check table structure)
    try {
      const { data: columns, error } = await supabase.from('users').select('*').limit(0);

      if (error) {
        results.steps.push({
          step: 'User Creation Test',
          status: '✗ Failed',
          error: error.message
        });
      } else {
        results.steps.push({
          step: 'User Creation Test',
          status: '✓ Table ready for user creation'
        });
      }
    } catch (error) {
      results.steps.push({
        step: 'User Creation Test',
        status: '✗ Failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Summary
    const failedSteps = results.steps.filter((step: any) => step.status?.includes('✗'));
    const passedSteps = results.steps.filter((step: any) => step.status?.includes('✓'));

    results.summary = {
      totalSteps: results.steps.length,
      passed: passedSteps.length,
      failed: failedSteps.length,
      overall: failedSteps.length === 0 ? '✓ All systems operational' : '✗ Some issues detected',
      issues: failedSteps.map((step: any) => `${step.step}: ${step.error || 'Unknown error'}`)
    };

    return NextResponse.json(results);

  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: 'Debug endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}