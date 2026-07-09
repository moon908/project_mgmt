import { NextResponse } from 'next/server';
import { isDbConnected } from '@/lib/db';

export async function GET() {
  return NextResponse.json({ dbConnected: isDbConnected });
}
