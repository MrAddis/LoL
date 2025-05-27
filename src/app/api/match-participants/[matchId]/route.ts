
import { NextResponse } from 'next/server';
import type { MatchDto, ParticipantDto } from '@/types/riot-api-types';
import { RIOT_API_KEY, RIOT_API_REGION_MATCH } from '@/lib/config';

export async function GET(
  request: Request,
  { params }: { params: { matchId: string } }
) {
  const { matchId } = params;

  if (!RIOT_API_KEY) {
    return NextResponse.json({ success: false, errorMessage: 'API key not configured' }, { status: 500 });
  }

  if (!matchId) {
    return NextResponse.json({ success: false, errorMessage: 'Match ID is required' }, { status: 400 });
  }

  try {
    const matchDetailUrl = `https://${RIOT_API_REGION_MATCH}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
    const response = await fetch(matchDetailUrl, {
      headers: { 'X-Riot-Token': RIOT_API_KEY },
      next: { revalidate: 600 } // Cache match details for 10 minutes
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error fetching match details for ${matchId}: ${response.status} ${errorText}`);
      let errorMessage = `Failed to fetch match details from Riot API. Status: ${response.status}`;
      if (response.status === 404) {
        errorMessage = `Match with ID ${matchId} not found.`;
      } else if (response.status === 429) {
        errorMessage = 'Rate limit exceeded when fetching match details.';
      }
      return NextResponse.json({ success: false, errorMessage: errorMessage }, { status: response.status });
    }

    const matchData = (await response.json()) as MatchDto;

    if (!matchData || !matchData.info || !matchData.info.participants) {
      console.error(`Invalid match data structure for ${matchId}:`, matchData);
      return NextResponse.json({ success: false, errorMessage: 'Invalid match data structure received from Riot API.' }, { status: 500 });
    }

    const playerNames = matchData.info.participants.map((participant: ParticipantDto) => {
      // Prioritize riotIdName if available, as it's the more current game name
      // Fallback to summonerName
      return participant.riotIdName || participant.summonerName || "Unknown Player";
    });

    return NextResponse.json({ success: true, playerNames });

  } catch (error: any) {
    console.error(`Error in /api/match-participants/${matchId}:`, error);
    return NextResponse.json({ success: false, errorMessage: `Internal server error: ${error.message || 'Unknown error'}` }, { status: 500 });
  }
}
