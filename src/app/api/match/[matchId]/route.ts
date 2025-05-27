import { NextResponse } from 'next/server';
import type { MatchDto } from '@/types/riot-api-types';
import { RIOT_API_KEY, RIOT_API_REGION_MATCH } from '@/lib/config';

export async function GET(
  request: Request,
  { params }: { params: { matchId: string } }
) {
  const { matchId } = params;

  if (!RIOT_API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const matchDetailUrl = `https://${RIOT_API_REGION_MATCH}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
    const response = await fetch(matchDetailUrl, {
      headers: { 'X-Riot-Token': RIOT_API_KEY },
    });

    if (!response.ok) {
      console.error(`Error fetching match detail: ${response.status} ${await response.text()}`);
      return NextResponse.json({ error: 'Failed to fetch match details from Riot API' }, { status: response.status });
    }

    const matchData = (await response.json()) as MatchDto;
    return NextResponse.json(matchData);
  } catch (error) {
    console.error('Error in /api/match:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
