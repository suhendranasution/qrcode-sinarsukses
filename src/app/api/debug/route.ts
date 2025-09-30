import { NextRequest, NextResponse } from "next/server";
import { debugTableStructure } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    console.log('Starting database debug...');

    const result = await debugTableStructure();

    return NextResponse.json({
      success: result,
      message: result ? 'Database debug completed successfully' : 'Database debug failed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}