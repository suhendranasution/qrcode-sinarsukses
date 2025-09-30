import { NextResponse } from 'next/server';

export async function GET() {
  // Debug endpoint untuk melihat semua environment variables
  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_ADMIN_EMAIL: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
    NEXT_PUBLIC_ADMIN_PASSWORD: process.env.NEXT_PUBLIC_ADMIN_PASSWORD ? '***HIDDEN***' : undefined,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,
  };

  const issues: string[] = [];

  // Check untuk masalah umum
  if (!envVars.NEXT_PUBLIC_SUPABASE_URL) {
    issues.push('NEXT_PUBLIC_SUPABASE_URL is missing');
  }

  if (!envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    issues.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is missing');
  }

  if (envVars.NEXT_PUBLIC_SUPABASE_URL && !envVars.NEXT_PUBLIC_SUPABASE_URL.startsWith('https://')) {
    issues.push('NEXT_PUBLIC_SUPABASE_URL should start with https://');
  }

  if (envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY && envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY.length < 50) {
    issues.push('NEXT_PUBLIC_SUPABASE_ANON_KEY seems too short');
  }

  const results = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercel_env: process.env.VERCEL_ENV,
    variables: envVars,
    issues
  };

  return NextResponse.json(results);
}