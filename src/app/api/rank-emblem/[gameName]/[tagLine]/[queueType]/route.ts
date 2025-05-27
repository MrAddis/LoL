
import { NextResponse } from 'next/server';
import type { RiotAccountDto, SummonerDto, LeagueEntryDto } from '@/types/riot-api-types';
import { RIOT_API_KEY, RIOT_API_REGION_ACCOUNT, RIOT_API_REGION_SUMMONER } from '@/lib/config';

export async function GET(
  request: Request,
  { params }: { params: { gameName: string; tagLine: string; queueType: string } }
) {
  const { gameName, tagLine, queueType } = params;

  // 1. Input Validation
  if (!gameName || !tagLine || !queueType) {
    return NextResponse.json({ error: 'Missing gameName, tagLine, or queueType' }, { status: 400 });
  }

  if (!RIOT_API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  let puuid: string;
  let encryptedSummonerId: string;
  let tier: string | undefined;

  try {
    // 2. Riot Account ID Retrieval (API Call 1)
    const accountUrl = `https://${RIOT_API_REGION_ACCOUNT}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
    const accountResponse = await fetch(accountUrl, {
      headers: { 'X-Riot-Token': RIOT_API_KEY },
    });

    if (!accountResponse.ok) {
      if (accountResponse.status === 404) {
        return NextResponse.json({ error: 'Summoner not found (Riot Account)' }, { status: 404 });
      }
      const errorText = await accountResponse.text();
      console.error(`API error during PUUID retrieval: ${accountResponse.status} - ${errorText}`);
      return NextResponse.json({ error: `API error during PUUID retrieval: ${accountResponse.status}` }, { status: accountResponse.status });
    }
    const accountData = (await accountResponse.json()) as RiotAccountDto;
    puuid = accountData.puuid;

    // 3. Summoner Data Retrieval (API Call 2)
    const summonerUrl = `https://${RIOT_API_REGION_SUMMONER}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
    const summonerResponse = await fetch(summonerUrl, {
      headers: { 'X-Riot-Token': RIOT_API_KEY },
    });

    if (!summonerResponse.ok) {
      const errorText = await summonerResponse.text();
      console.error(`API error during Summoner ID retrieval: ${summonerResponse.status} - ${errorText}`);
      return NextResponse.json({ error: `API error during Summoner ID retrieval: ${summonerResponse.status}` }, { status: summonerResponse.status });
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
      return NextResponse.json({ error: `API error during League entries retrieval: ${leagueResponse.status}` }, { status: leagueResponse.status });
    }
    const leagueEntries = (await leagueResponse.json()) as LeagueEntryDto[];
    
    const rankedEntry = leagueEntries.find(entry => entry.queueType === queueType);

    if (!rankedEntry) {
      return NextResponse.json({ error: `Player has no ranked data for the specified queue: ${queueType}` }, { status: 404 });
    }
    
    tier = rankedEntry.tier;
    if (!tier) {
      // This case should be rare if rankedEntry is found and is valid
      return NextResponse.json({ error: 'Tier information not found in ranked entry' }, { status: 404 });
    }

  } catch (error: any) {
    console.error('Internal server error in rank-emblem API:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }

  // 5. Rank Image URL Construction
  const uppercaseTier = tier.toUpperCase();
  // Using the specific URL structure provided in the prompt
  const rankEmblemUrl = `https://ddragon.leagueoflegends.com/cdn/img/ranked-emblems/EMBLEM_${uppercaseTier}.png`;

  // 6. Output
  return NextResponse.json({ rankEmblemUrl });
}
