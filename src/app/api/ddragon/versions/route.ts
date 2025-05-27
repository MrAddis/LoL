
import { NextResponse } from 'next/server';
import { getLatestGameVersion } from '@/lib/dragon-data'; // Updated import

export async function GET() {
  try {
    const version = await getLatestGameVersion(); // Use the new cached function
    return NextResponse.json({ latestVersion: version });
  } catch (error) {
    console.error('Error fetching DDragon version for API route:', error);
    // Fallback in case getLatestGameVersion itself throws an unexpected error
    // although it's designed to return a fallback string.
    return NextResponse.json({ error: 'Failed to fetch DDragon version', latestVersion: "14.14.1" }, { status: 500 });
  }
}
