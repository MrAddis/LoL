
import { NextResponse } from 'next/server';
import { RIOT_API_KEY, RIOT_API_REGION_MATCH } from '@/lib/config';

export async function GET(
  request: Request,
  { params }: { params: { puuid: string } }
) {
  const { puuid } = params;

  if (!RIOT_API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const count = 30; // Increased from 20 to 30
    const matchesUrl = `https://${RIOT_API_REGION_MATCH}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?count=${count}`;
    
    const response = await fetch(matchesUrl, {
      headers: { 'X-Riot-Token': RIOT_API_KEY },
    });

    if (!response.ok) {
      console.error(`Error fetching matches: ${response.status} ${await response.text()}`);
      return NextResponse.json({ error: 'Failed to fetch match IDs from Riot API' }, { status: response.status });
    }

    const matchIds = (await response.json()) as string[];
    return NextResponse.json(matchIds);
  } catch (error) {
    console.error('Error in /api/matches:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
