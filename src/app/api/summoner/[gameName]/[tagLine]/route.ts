
import { NextResponse } from 'next/server';
import type { RiotAccountDto, SummonerDto, LeagueEntryDto, ChampionMasteryDto, TopChampionMasteryEntry, ExtendedSummonerData } from '@/types/riot-api-types';
import { RIOT_API_KEY, RIOT_API_REGION_ACCOUNT, RIOT_API_REGION_SUMMONER } from '@/lib/config';
import { getLatestGameVersion, getChampionNameById } from '@/lib/dragon-data';

export async function GET(
  request: Request,
  { params }: { params: { gameName: string; tagLine: string } }
) {
  const { gameName, tagLine } = params;

  if (!RIOT_API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    // 1. Get PUUID from Riot ID
    const accountUrl = `https://${RIOT_API_REGION_ACCOUNT}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
    const accountResponse = await fetch(accountUrl, {
      headers: { 'X-Riot-Token': RIOT_API_KEY },
    });

    if (!accountResponse.ok) {
      if (accountResponse.status === 404) {
        return NextResponse.json({ error: 'Player not found' }, { status: 404 });
      }
      console.error(`Error fetching account: ${accountResponse.status} ${await accountResponse.text()}`);
      return NextResponse.json({ error: 'Failed to fetch player account data from Riot API' }, { status: accountResponse.status });
    }
    const accountData = (await accountResponse.json()) as RiotAccountDto;
    const puuid = accountData.puuid;

    // 2. Get Summoner data from PUUID
    const summonerUrl = `https://${RIOT_API_REGION_SUMMONER}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
    const summonerResponse = await fetch(summonerUrl, {
      headers: { 'X-Riot-Token': RIOT_API_KEY },
    });

    if (!summonerResponse.ok) {
      console.error(`Error fetching summoner: ${summonerResponse.status} ${await summonerResponse.text()}`);
      return NextResponse.json({ error: 'Failed to fetch summoner data from Riot API' }, { status: summonerResponse.status });
    }
    const summonerData = (await summonerResponse.json()) as SummonerDto;

    // 3. Get League Entries (Ranked Info)
    let soloQueueRank: LeagueEntryDto | undefined;
    const leagueUrl = `https://${RIOT_API_REGION_SUMMONER}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerData.id}`;
    const leagueResponse = await fetch(leagueUrl, {
      headers: { 'X-Riot-Token': RIOT_API_KEY },
    });
    if (leagueResponse.ok) {
      const leagueEntries = (await leagueResponse.json()) as LeagueEntryDto[];
      soloQueueRank = leagueEntries.find(entry => entry.queueType === 'RANKED_SOLO_5x5');
    } else {
      console.warn(`Failed to fetch league entries for ${summonerData.id}: ${leagueResponse.status}`);
    }

    // 4. Get Top Champion Masteries
    let topMasteriesData: TopChampionMasteryEntry[] = [];
    const masteryUrl = `https://${RIOT_API_REGION_SUMMONER}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${summonerData.id}`;
    const masteryResponse = await fetch(masteryUrl, {
      headers: { 'X-Riot-Token': RIOT_API_KEY },
    });

    if (masteryResponse.ok) {
      const allMasteries = (await masteryResponse.json()) as ChampionMasteryDto[];
      const topThreeMasteries = allMasteries.slice(0, 3);
      const latestVersion = await getLatestGameVersion();

      for (const mastery of topThreeMasteries) {
        const championName = await getChampionNameById(mastery.championId, latestVersion);
        topMasteriesData.push({
          championId: mastery.championId,
          championName: championName || `Champ ${mastery.championId}`, // Fallback name
          championLevel: mastery.championLevel,
          championPoints: mastery.championPoints,
        });
      }
    } else {
      console.warn(`Failed to fetch champion masteries for ${summonerData.id}: ${masteryResponse.status}`);
    }
    
    const responseData: ExtendedSummonerData = {
      ...summonerData, // Spread existing summoner data
      gameName: accountData.gameName,
      tagLine: accountData.tagLine,
      tier: soloQueueRank?.tier,
      division: soloQueueRank?.rank,
      topMasteries: topMasteriesData.length > 0 ? topMasteriesData : undefined, // Add top masteries
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error in /api/summoner:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
