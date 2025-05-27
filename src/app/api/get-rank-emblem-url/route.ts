
import { NextResponse } from 'next/server';
import type { RiotAccountDto, SummonerDto, LeagueEntryDto } from '@/types/riot-api-types';
import { RIOT_API_KEY, RIOT_API_REGION_ACCOUNT, RIOT_API_REGION_SUMMONER } from '@/lib/config';

interface RankEmblemRequestBody {
  summonerName?: string;
  tagLine?: string;
  queueType?: string;
}

export async function POST(request: Request) {
  let requestBody: RankEmblemRequestBody;
  try {
    requestBody = await request.json();
  } catch (error) {
    return NextResponse.json({ success: false, errorMessage: 'Invalid JSON body' }, { status: 400 });
  }

  const { summonerName, tagLine, queueType } = requestBody;

  // 1. Input Validation
  if (!summonerName || !tagLine || !queueType) {
    return NextResponse.json({ success: false, errorMessage: 'Missing summonerName, tagLine, or queueType in request body' }, { status: 400 });
  }
  // Basic validation for queueType, can be expanded
  const validQueueTypes = ["RANKED_SOLO_5x5", "RANKED_FLEX_SR", "RANKED_TFT_TURBO"]; // Add other valid types as needed
  if (!validQueueTypes.includes(queueType)) {
    return NextResponse.json({ success: false, errorMessage: `Invalid queueType: ${queueType}. Valid types include: ${validQueueTypes.join(', ')}` }, { status: 400 });
  }

  if (!RIOT_API_KEY) {
    return NextResponse.json({ success: false, errorMessage: 'API key not configured' }, { status: 500 });
  }

  let puuid: string;
  let encryptedSummonerId: string;
  let tier: string | undefined;

  try {
    // 2. Riot Account ID Retrieval (API Call 1)
    // Using summonerName from input as gameName for the Riot Account API
    const accountUrl = `https://${RIOT_API_REGION_ACCOUNT}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(summonerName)}/${encodeURIComponent(tagLine)}`;
    const accountResponse = await fetch(accountUrl, {
      headers: { 'X-Riot-Token': RIOT_API_KEY },
    });

    if (!accountResponse.ok) {
      if (accountResponse.status === 404) {
        return NextResponse.json({ success: false, errorMessage: 'Summoner not found (Riot Account)' }, { status: 404 });
      }
      const errorText = await accountResponse.text();
      console.error(`API error during PUUID retrieval: ${accountResponse.status} - ${errorText}`);
      return NextResponse.json({ success: false, errorMessage: `API error during PUUID retrieval: ${accountResponse.status}` }, { status: accountResponse.status });
    }
    const accountData = (await accountResponse.json()) as RiotAccountDto;
    puuid = accountData.puuid;

    // 3. Summoner Data Retrieval (API Call 2)
    const summonerApiUrl = `https://${RIOT_API_REGION_SUMMONER}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
    const summonerResponse = await fetch(summonerApiUrl, {
      headers: { 'X-Riot-Token': RIOT_API_KEY },
    });

    if (!summonerResponse.ok) {
      const errorText = await summonerResponse.text();
      console.error(`API error during Summoner ID retrieval: ${summonerResponse.status} - ${errorText}`);
      return NextResponse.json({ success: false, errorMessage: `API error during Summoner ID retrieval: ${summonerResponse.status}` }, { status: summonerResponse.status });
    }
    const summonerData = (await summonerResponse.json()) as SummonerDto;
    encryptedSummonerId = summonerData.id;

    // 4. League Entries Retrieval (API Call 3)
    const leagueUrl = `https://${RIOT_API_REGION_SUMMONER}.api.riotgames.com/lol/league/v4/entries/by-summoner/${encryptedSummonerId}`;
    const leagueResponse = await fetch(leagueUrl, {
      headers: { 'X-Riot-Token': RIOT_API_KEY },
    });

    if (!leagueResponse.ok) {
      const errorText = await leagueResponse.text();
      console.error(`API error during League entries retrieval: ${leagueResponse.status} - ${errorText}`);
      return NextResponse.json({ success: false, errorMessage: `API error during League entries retrieval: ${leagueResponse.status}` }, { status: leagueResponse.status });
    }
    const leagueEntries = (await leagueResponse.json()) as LeagueEntryDto[];
    
    const rankedEntry = leagueEntries.find(entry => entry.queueType === queueType);

    if (!rankedEntry) {
      return NextResponse.json({ success: false, errorMessage: `Player has no ranked data for the specified queue: ${queueType}` }, { status: 404 });
    }
    
    tier = rankedEntry.tier;
    if (!tier) {
      // This case should be rare if rankedEntry is found and is valid
      return NextResponse.json({ success: false, errorMessage: 'Tier information not found in ranked entry' }, { status: 404 });
    }

  } catch (error: any) {
    console.error('Internal server error in get-rank-emblem-url API:', error);
    return NextResponse.json({ success: false, errorMessage: `Internal server error: ${error.message}` }, { status: 500 });
  }

  // 5. Rank Image URL Construction
  const uppercaseTier = tier.toUpperCase();
  const rankEmblemUrl = `https://ddragon.leagueoflegends.com/cdn/img/ranked-emblems/EMBLEM_${uppercaseTier}.png`;

  // 6. Output
  return NextResponse.json({ success: true, imageUrl: rankEmblemUrl });
}
