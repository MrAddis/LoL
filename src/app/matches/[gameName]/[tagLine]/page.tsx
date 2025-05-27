
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle, Home as HomeIconLucide, Bot as BotIcon, BarChart3 } from 'lucide-react';
import { Logo } from '@/components/logo';
import { MatchList } from '@/components/match-list';
import { RankedQueueStats } from '@/components/ranked-queue-stats';
import { RecentChampionStats } from '@/components/recent-champion-stats';
import { MatchHistoryControls } from '@/components/match-history-controls';
import { OverallMatchStats } from '@/components/overall-match-stats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FALLBACK_DDRAGON_VERSION, getDisplayChampionName, getProfileIconUrl as getProfileIconUrlUtil, formatGameDuration as formatGameDurationUtil, getQueueName as getQueueNameUtil } from '@/lib/dragon-data';
import { UpdateButton } from '@/components/update-button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Skeleton } from '@/components/ui/skeleton';

import type {
  MatchDto,
  LeagueEntryDto,
  AggregatedPlayerStats,
  ExtendedSummonerData,
  ChampionStatInfo,
} from '@/types/riot-api-types';


const INITIAL_MATCH_LOAD_COUNT = 20; // Default number of matches to load

interface PlayerPageProps {
  params: Promise<{ gameName: string; tagLine: string }>;
}

const queueTypeMap: Record<string, number[] | null> = {
  all: null,
  ranked_solo: [420],
  ranked_flex: [440],
  normal: [400, 430], // Normal Draft (400), Normal Blind (430)
  aram: [450],
};


// This function now runs client-side
const fetchPlayerDataAndStats = async (gameName: string, tagLine: string): Promise<{ playerData: ExtendedSummonerData | null, matches: MatchDto[], aggregatedStats: AggregatedPlayerStats | null, error?: string, latestVersion: string, rankedSolo?: LeagueEntryDto, rankedFlex?: LeagueEntryDto }> => {
  let latestVersion = FALLBACK_DDRAGON_VERSION;
  let matchFetchError: string | undefined;
  let baseUrlToUse = ''; // Will default to relative paths for client-side fetch

  // For client-side, window.location.origin can be used if NEXT_PUBLIC_BASE_URL isn't set
  // but for internal API routes, relative paths are usually sufficient.
  const envBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (envBaseUrl && envBaseUrl.trim() !== '') {
    const trimmedBaseUrl = envBaseUrl.trim();
    if (trimmedBaseUrl.startsWith('http://') || trimmedBaseUrl.startsWith('https://')) {
      baseUrlToUse = trimmedBaseUrl;
    } else {
      console.warn(`[CLIENT - fetchPlayerDataAndStats] NEXT_PUBLIC_BASE_URL ("${trimmedBaseUrl}") is set but invalid (missing http/https). Defaulting to relative paths.`);
    }
  } else {
    // console.warn("[CLIENT - fetchPlayerDataAndStats] NEXT_PUBLIC_BASE_URL is not set. Using relative paths for API calls.");
  }
  
  const ddragonVersionApiUrl = `${baseUrlToUse}/api/ddragon/versions`;
  // console.log(`[CLIENT - fetchPlayerDataAndStats @ ${Date.now()}] Attempting to fetch DDragon version from URL: ${ddragonVersionApiUrl}`);

  try {
    const versionResponse = await fetch(ddragonVersionApiUrl);
    if (versionResponse.ok) {
      const versionData = await versionResponse.json();
      if (versionData.latestVersion) {
        latestVersion = versionData.latestVersion;
        // console.log(`[CLIENT - fetchPlayerDataAndStats @ ${Date.now()}] Successfully fetched DDragon version: ${latestVersion}`);
      } else {
        // console.warn(`[CLIENT - fetchPlayerDataAndStats @ ${Date.now()}] DDragon version API response OK, but no latestVersion field. URL: ${ddragonVersionApiUrl}. Using fallback: ${FALLBACK_DDRAGON_VERSION}`);
      }
    } else {
      const errorText = await versionResponse.text();
      // console.warn(`[CLIENT - fetchPlayerDataAndStats @ ${Date.now()}] Failed to fetch DDragon version from API: ${versionResponse.status} - ${errorText}. URL: ${ddragonVersionApiUrl}. Using fallback: ${FALLBACK_DDRAGON_VERSION}`);
    }
  } catch (e: any) {
    // console.error(`[CLIENT - fetchPlayerDataAndStats @ ${Date.now()}] Error fetching DDragon version from API: ${e.message}. URL: ${ddragonVersionApiUrl}. Using fallback: ${FALLBACK_DDRAGON_VERSION}`);
  }

  try {
    const summonerApiUrl = `${baseUrlToUse}/api/summoner/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
    const summonerRes = await fetch(summonerApiUrl);

    if (!summonerRes.ok) {
      const errorText = await summonerRes.text();
      const status = summonerRes.status;
      let errorMessage = `Failed to fetch player data. Status: ${status}.`;
      if (status === 404) errorMessage = `Player "${gameName}#${tagLine}" not found. Please check the Riot ID and try again.`;
      else if (status === 401 || status === 403) errorMessage = `Riot API Key Error (${status}). Your API key may be invalid, expired, or forbidden. Development keys from the Riot Developer Portal expire daily.`;
      else if (status === 429) errorMessage = `Riot API Error: Too Many Requests (429). Please wait and try again.`;
      else errorMessage += ` Message: ${errorText || 'No additional error message.'}`;
      // console.error(`[CLIENT - fetchPlayerDataAndStats @ ${Date.now()}] Error fetching summoner: ${errorMessage} from URL: ${summonerApiUrl}`);
      throw new Error(errorMessage);
    }
    const playerDataResponse: ExtendedSummonerData = await summonerRes.json();
    
    // Extract ranked data if present (it's now part of ExtendedSummonerData from the API)
    const rankedSolo = playerDataResponse.tier && playerDataResponse.queueType === 'RANKED_SOLO_5x5' ? playerDataResponse as unknown as LeagueEntryDto : undefined;
    const rankedFlex = playerDataResponse.tier && playerDataResponse.queueType === 'RANKED_FLEX_SR' ? playerDataResponse as unknown as LeagueEntryDto : undefined;
     
    const playerData: ExtendedSummonerData = { ...playerDataResponse };


    if (!playerData?.puuid) {
      // console.error(`[CLIENT - fetchPlayerDataAndStats @ ${Date.now()}] PUUID not found for ${gameName}#${tagLine} after fetching summoner data.`);
      throw new Error("PUUID not found for the player.");
    }

    const matchesApiUrl = `${baseUrlToUse}/api/matches/${playerData.puuid}`; // Using default count from API
    const matchesRes = await fetch(matchesApiUrl);
    if (!matchesRes.ok) {
      const errorText = await matchesRes.text();
      // console.error(`[CLIENT - fetchPlayerDataAndStats @ ${Date.now()}] Failed to fetch match IDs from ${matchesApiUrl}: ${matchesRes.status} - ${errorText}`);
      throw new Error(`Failed to fetch match IDs: ${matchesRes.status}`);
    }
    const matchIds: string[] = await matchesRes.json();
    // console.log(`[CLIENT - fetchPlayerDataAndStats @ ${Date.now()}] Fetched ${matchIds.length} match IDs for PUUID ${playerData.puuid}.`);
    

    const fetchedMatches: MatchDto[] = [];
    for (const matchId of matchIds) { // Fetching all returned IDs by default
      try {
        const matchDetailApiUrl = `${baseUrlToUse}/api/match/${matchId}`;
        const matchDetailRes = await fetch(matchDetailApiUrl);
        if (!matchDetailRes.ok) {
          const errorText = await matchDetailRes.text();
          //  console.warn(`[CLIENT - fetchPlayerDataAndStats @ ${Date.now()}] Failed to fetch details for match ${matchId} from ${matchDetailApiUrl}: ${matchDetailRes.status} - ${errorText}. Skipping.`);
           if (matchDetailRes.status === 401 || matchDetailRes.status === 403) {
             matchFetchError = `Riot API Key Error (${matchDetailRes.status}) while fetching details for some matches. Key might be invalid or expired. Some matches may not load.`;
           } else if (matchDetailRes.status === 429) {
             matchFetchError = `Rate limit exceeded while fetching details for some matches. Some matches may not load.`;
           }
          continue;
        }
        fetchedMatches.push(await matchDetailRes.json());
      } catch (e: any) {
        // console.warn(`[CLIENT - fetchPlayerDataAndStats @ ${Date.now()}] Error fetching details for match ${matchId}: ${e.message}. Skipping.`);
        if (!matchFetchError) { 
            matchFetchError = `Error fetching details for match ${matchId}: ${e.message}. Some matches may not load.`;
        }
      }
    }
    
    const aggregatedStats = calculateAggregatedStats(fetchedMatches, playerData.puuid);
    return { playerData, rankedSolo, rankedFlex, matches: fetchedMatches, aggregatedStats, error: matchFetchError, latestVersion };

  } catch (e: any) {
    // console.error(`[CLIENT - fetchPlayerDataAndStats Outer Catch @ ${Date.now()}] Error for ${gameName}#${tagLine}: ${e.message}`);
    return { playerData: null, matches: [], aggregatedStats: null, error: e.message, latestVersion, rankedSolo: undefined, rankedFlex: undefined };
  }
};

const calculateAggregatedStats = (matches: MatchDto[], playerPuuid: string): AggregatedPlayerStats => {
  if (!matches || matches.length === 0) {
    return { totalGames: 0, topChampionsStats: [] };
  }

  let totalKills = 0;
  let totalDeaths = 0;
  let totalAssists = 0;
  let totalWins = 0;
  const championPlayCounts: Record<string, { championId: number; championNameDDragon: string; games: number; wins: number; kills: number; deaths: number; assists: number; kda: {kills:number, deaths:number, assists:number} }> = {};

  for (const match of matches) {
    if (!match || !match.info || !match.info.participants) continue;
    const playerParticipant = match.info.participants.find(p => p.puuid === playerPuuid);
    if (playerParticipant) {
      totalKills += playerParticipant.kills;
      totalDeaths += playerParticipant.deaths;
      totalAssists += playerParticipant.assists;
      if (playerParticipant.win) {
        totalWins++;
      }

      const champNameDDragon = playerParticipant.championName; 
      const champId = playerParticipant.championId;

      if (champNameDDragon && champId) {
        if (!championPlayCounts[champNameDDragon]) {
          championPlayCounts[champNameDDragon] = { 
            championId: champId, 
            championNameDDragon: champNameDDragon, 
            games: 0, wins: 0, kills: 0, deaths: 0, assists: 0,
            kda: {kills:0, deaths:0, assists:0}
          };
        }
        championPlayCounts[champNameDDragon].games++;
        championPlayCounts[champNameDDragon].kills += playerParticipant.kills;
        championPlayCounts[champNameDDragon].deaths += playerParticipant.deaths;
        championPlayCounts[champNameDDragon].assists += playerParticipant.assists;
        if (playerParticipant.win) {
          championPlayCounts[champNameDDragon].wins++;
        }
      }
    }
  }
  
  const sortedChampionPlays = Object.values(championPlayCounts).sort((a, b) => b.games - a.games);
  
  const topNChampionsForDisplay = 5; 
  const topChampionsStatsOutput: ChampionStatInfo[] = sortedChampionPlays
    .slice(0, topNChampionsForDisplay)
    .map(champStat => ({
      championId: champStat.championId,
      championName: champStat.championNameDDragon, 
      gamesPlayed: champStat.games,
      wins: champStat.wins,
      winRate: champStat.games > 0 ? (champStat.wins / champStat.games) * 100 : 0,
      kda: { 
        kills: champStat.games > 0 ? parseFloat((champStat.kills / champStat.games).toFixed(1)) : 0,
        deaths: champStat.games > 0 ? parseFloat((champStat.deaths / champStat.games).toFixed(1)) : 0,
        assists: champStat.games > 0 ? parseFloat((champStat.assists / champStat.games).toFixed(1)) : 0,
      },
      // These individual avg stats are fine for display if needed, kda object is more structured
      avgKills: champStat.games > 0 ? parseFloat((champStat.kills / champStat.games).toFixed(1)) : 0, 
      avgDeaths: champStat.games > 0 ? parseFloat((champStat.deaths / champStat.games).toFixed(1)) : 0,
      avgAssists: champStat.games > 0 ? parseFloat((champStat.assists / champStat.games).toFixed(1)) : 0,
    }));

  const kdaRatioNum = totalDeaths === 0 ? (totalKills + totalAssists) : (totalKills + totalAssists) / totalDeaths;
  const kdaStringForDisplay = `${kdaRatioNum.toFixed(2)} KDA (${(totalKills/matches.length).toFixed(1)}/${(totalDeaths/matches.length).toFixed(1)}/${(totalAssists/matches.length).toFixed(1)})`;

  return {
    mostPlayedChampionOverall: sortedChampionPlays.length > 0 ? { name: sortedChampionPlays[0].championNameDDragon, iconId: sortedChampionPlays[0].championId, games: sortedChampionPlays[0].games } : undefined,
    winRateOverall: matches.length > 0 ? (totalWins / matches.length) * 100 : 0,
    averageKDAOverall: {
      kills: matches.length > 0 ? parseFloat((totalKills / matches.length).toFixed(1)) : 0,
      deaths: matches.length > 0 ? parseFloat((totalDeaths / matches.length).toFixed(1)) : 0,
      assists: matches.length > 0 ? parseFloat((totalAssists / matches.length).toFixed(1)) : 0,
    },
    kdaString: kdaStringForDisplay,
    totalGames: matches.length,
    topChampionsStats: topChampionsStatsOutput.length > 0 ? topChampionsStatsOutput : [],
  };
};


export default function MatchHistoryPage({ params: paramsPromise }: PlayerPageProps) {
  const params = React.use(paramsPromise);

  const [playerData, setPlayerData] = useState<ExtendedSummonerData | null>(null);
  const [rankedSolo, setRankedSolo] = useState<LeagueEntryDto | undefined>(undefined);
  const [rankedFlex, setRankedFlex] = useState<LeagueEntryDto | undefined>(undefined);
  
  const [allMatches, setAllMatches] = useState<MatchDto[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<MatchDto[]>([]);
  
  const [aggregatedStatsForAllMatches, setAggregatedStatsForAllMatches] = useState<AggregatedPlayerStats | null>(null);
  const [aggregatedStatsForFilteredMatches, setAggregatedStatsForFilteredMatches] = useState<AggregatedPlayerStats | null>(null);
  
  const [latestVersion, setLatestVersion] = useState<string>(FALLBACK_DDRAGON_VERSION);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const [championFilter, setChampionFilter] = useState('');
  const [queueTypeFilter, setQueueTypeFilter] = useState<string>("all"); 

  const [profileIconUrl, setProfileIconUrl] = useState<string>(`https://placehold.co/120x120.png`);

  const { gameName: rawGameName, tagLine: rawTagLine } = params; 
  const gameName = decodeURIComponent(rawGameName);
  const tagLine = decodeURIComponent(rawTagLine);
  
  const coachAiPath = `/matches/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}/ai-coach`;
  const championMasteryPath = `/matches/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}/champion-mastery`;


  useEffect(() => {
    const loadData = async () => {
      if (!gameName || !tagLine) {
        setError("Summoner name or tagline is missing.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(undefined); 
      try {
        const result = await fetchPlayerDataAndStats(gameName, tagLine);

        if (result.error && !result.playerData) { 
          setError(result.error);
          setPlayerData(null);
          setAllMatches([]);
          setAggregatedStatsForAllMatches(null);
        } else {
          setPlayerData(result.playerData);
          setRankedSolo(result.rankedSolo); 
          setRankedFlex(result.rankedFlex); 
          setAllMatches(result.matches);
          setAggregatedStatsForAllMatches(result.aggregatedStats);
          if(result.error) { 
            setError(prevError => prevError ? `${prevError}\n${result.error}` : result.error);
          }
        }
        setLatestVersion(result.latestVersion);
      } catch (e: any) {
        // console.error(`[CLIENT - loadData Effect CATCH @ ${Date.now()}] Critical error during loadData for ${gameName}#${tagLine}: ${e.message}`);
        setError(e.message || "An unknown error occurred during data fetching.");
        setPlayerData(null);
        setAllMatches([]);
        setAggregatedStatsForAllMatches(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [gameName, tagLine]); 

 useEffect(() => {
    if (!playerData || !playerData.puuid) {
      setFilteredMatches([]);
      setAggregatedStatsForFilteredMatches(null);
      return;
    }

    let currentMatches = allMatches;

    const targetQueueIds = queueTypeMap[queueTypeFilter];
    if (targetQueueIds && targetQueueIds.length > 0) {
      currentMatches = currentMatches.filter(match => match.info && targetQueueIds.includes(match.info.queueId));
    } else if (queueTypeFilter !== "all") { 
      currentMatches = [];
    }

    if (championFilter.trim() !== '') {
      currentMatches = currentMatches.filter(match => {
        if (!match.info || !match.info.participants) return false;
        const mainParticipant = match.info.participants.find(p => p.puuid === playerData.puuid);
        // Ensure championName exists and is a string before calling toLowerCase
        return mainParticipant && mainParticipant.championName && typeof mainParticipant.championName === 'string' && mainParticipant.championName.toLowerCase().includes(championFilter.toLowerCase());
      });
    }

    setFilteredMatches(currentMatches);
    if (playerData.puuid) {
      setAggregatedStatsForFilteredMatches(calculateAggregatedStats(currentMatches, playerData.puuid));
    } else {
      setAggregatedStatsForFilteredMatches(null);
    }
  }, [allMatches, championFilter, playerData, queueTypeFilter]);

  useEffect(() => {
    if (playerData?.profileIconId && latestVersion) {
      // Use the imported utility function directly
      getProfileIconUrlUtil(playerData.profileIconId, latestVersion).then(url => {
        if (url) setProfileIconUrl(url);
      }).catch(err => {
        console.error("Error fetching profile icon URL in useEffect:", err);
        setProfileIconUrl(`https://placehold.co/120x120.png`);
      });
    } else if (!playerData?.profileIconId && !isLoading) { 
        setProfileIconUrl(`https://placehold.co/120x120.png`);
    }
  }, [playerData?.profileIconId, latestVersion, isLoading]);


  if (isLoading && !playerData) { 
    return (
      <div className="container mx-auto px-2 py-4 md:py-8 max-w-6xl"> {/* Updated to max-w-6xl */}
        <header className="mb-6 md:mb-8 flex justify-between items-center">
          <Link href="/" aria-label="Back to Home"> <Logo /> </Link>
          <div className="flex items-center gap-2">
             <Button asChild variant="outline" size="sm" disabled>
                <Link href="/"> <ArrowLeft className="mr-1 h-4 w-4" /> New Search </Link>
            </Button>
            <UpdateButton /> 
          </div>
        </header>
        <div className="flex items-center gap-4 p-4 md:p-6 bg-card rounded-lg shadow-lg mb-4">
            <Skeleton className="h-24 w-24 rounded-md" /> 
            <div className="flex-grow space-y-2">
                <Skeleton className="h-8 w-48" /> 
                <Skeleton className="h-6 w-24" /> 
            </div>
            <Skeleton className="h-20 w-20 rounded-md" /> 
        </div>
        <Skeleton className="h-10 w-full mb-4" /> 
        
        <div className="flex flex-col lg:flex-row gap-4">
          <aside className="w-full lg:w-[300px] shrink-0 space-y-4">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
          </aside>
          <main className="flex-grow min-w-0">
            <Skeleton className="h-12 w-full mb-3 rounded-lg" /> 
            <Skeleton className="h-16 w-full mb-4 rounded-lg" /> 
            <div className="space-y-3 md:space-y-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error && !playerData) { 
    return (
      <div className="container mx-auto px-2 py-4 md:py-8 max-w-6xl text-center"> {/* Updated to max-w-6xl */}
        <Link href="/" className="inline-block mb-8"> <Logo /> </Link>
        <div className="bg-destructive/10 border border-destructive text-destructive-foreground p-4 rounded-md max-w-lg mx-auto">
          <div className="flex items-center justify-center mb-2">
            <AlertTriangle className="h-6 w-6 mr-2" />
            <h1 className="text-xl font-semibold">Error Loading Player Data</h1>
          </div>
          <p className="text-sm mb-6 whitespace-pre-wrap">{error}</p>
          <Button asChild variant="outline" className="border-destructive text-destructive-foreground hover:bg-destructive/20">
            <Link href="/" legacyBehavior passHref><a> <ArrowLeft className="mr-2 h-4 w-4" /> Go Back to Search </a></Link>
          </Button>
        </div>
      </div>
    );
  }
  
  if (!playerData && !isLoading) { 
    return (
        <div className="container mx-auto px-2 py-4 md:py-8 max-w-6xl text-center"> {/* Updated to max-w-6xl */}
            <Link href="/" className="inline-block mb-8"> <Logo /> </Link>
            <p>Player data could not be loaded. Try refreshing or a new search.</p>
            <Button asChild variant="outline" className="mt-4">
                <Link href="/" legacyBehavior passHref><a> <ArrowLeft className="mr-2 h-4 w-4" /> New Search </a></Link>
            </Button>
        </div>
    );
  }

  const headerGameName = playerData?.gameName || gameName; 
  const headerTagLine = playerData?.tagLine || tagLine;   
  const summonerLevel = playerData?.summonerLevel || 0;
  const profileIconId = playerData?.profileIconId;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">

      <header className="container mx-auto max-w-6xl px-4 py-3 flex justify-between items-center border-b border-border sticky top-0 z-50 bg-background/90 backdrop-blur-sm"> {/* Updated to max-w-6xl */}
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="Back to Home">
            <Logo />
          </Link>
           <Button asChild variant="outline" size="sm">
            <Link href="/" legacyBehavior passHref>
              <a><ArrowLeft className="mr-1 h-4 w-4" /> New Search</a>
            </Link>
          </Button>
        </div>
        
        {playerData && profileIconId && (
            <div className="flex items-center gap-3">
                 <Image
                    src={profileIconUrl} 
                    alt={`${headerGameName}'s profile icon`}
                    width={40} 
                    height={40}
                    className="rounded-md border-2 border-primary" 
                    data-ai-hint="profile avatar"
                    key={profileIconUrl} 
                />
                <div>
                    <h1 className="text-xl font-bold text-foreground">
                    {headerGameName} <span className="text-muted-foreground">#{headerTagLine}</span>
                    </h1>
                    {summonerLevel > 0 && <p className="text-xs text-muted-foreground">Level {summonerLevel}</p>}
                </div>
            </div>
        )}

        <div className="flex items-center gap-2">
           <UpdateButton />
        </div>
      </header>

      <div className="container mx-auto max-w-6xl px-4 py-2"> {/* Updated to max-w-6xl */}
        <Tabs defaultValue="overview" className="w-full">
          <div className="flex justify-between items-center border-b border-border pb-2 mb-3">
            <TabsList className="bg-slate-800 p-1 rounded-md inline-flex space-x-1">
              <TabsTrigger value="overview" className="px-3 py-1.5 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-slate-700 rounded-sm">Overview</TabsTrigger>
              
              {playerData && ( 
                <Button asChild variant="ghost" className="px-3 py-1.5 text-sm text-slate-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-slate-700 rounded-sm h-auto">
                  <Link href={coachAiPath}>
                    <BotIcon className="mr-1.5 h-4 w-4" />Coach AI
                  </Link>
                </Button>
              )}
              
              <Link href="/" legacyBehavior passHref>
                <a className="px-3 py-1.5 text-sm text-slate-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-slate-700 rounded-sm h-auto inline-flex items-center justify-center ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">Home</a>
              </Link>
            </TabsList>
            <Button asChild variant="outline" size="sm" className="ml-auto">
              <Link href="/" legacyBehavior passHref>
                <a><HomeIconLucide className="mr-2 h-4 w-4" /> Home</a>
              </Link>
            </Button>
          </div>
              
          <TabsContent value="overview" className="mt-0"> 
              <div className="flex flex-col lg:flex-row gap-4">
              <aside className="w-full lg:w-[300px] shrink-0 space-y-4">
                  {playerData && rankedSolo && <RankedQueueStats queueType="Ranked Solo" rankedData={rankedSolo} />}
                  {playerData && rankedFlex && <RankedQueueStats queueType="Ranked Flex" rankedData={rankedFlex} />}
                  {playerData && aggregatedStatsForAllMatches?.topChampionsStats && (
                      <RecentChampionStats championStats={aggregatedStatsForAllMatches.topChampionsStats} />
                  )}
                  {!playerData && isLoading && ( 
                      <>
                          <Skeleton className="h-24 w-full rounded-lg" />
                          <Skeleton className="h-24 w-full rounded-lg" />
                          <Skeleton className="h-40 w-full rounded-lg" />
                      </>
                  )}
              </aside>

              <main className="flex-grow min-w-0">
                  {playerData && ( 
                      <>
                          <MatchHistoryControls
                              championFilterValue={championFilter}
                              onChampionFilterChange={setChampionFilter}
                              matchTypeValue={queueTypeFilter} 
                              onMatchTypeChange={setQueueTypeFilter} 
                          />
                          {filteredMatches.length > 0 && aggregatedStatsForFilteredMatches && (
                              <OverallMatchStats aggregatedStats={aggregatedStatsForFilteredMatches} />
                          )}
                          {error && filteredMatches.length > 0 && ( 
                              <div className="text-center py-4 bg-destructive/20 border border-destructive text-red-400 p-3 rounded-md shadow-md my-3 text-sm">
                                  <p className="font-semibold mb-1">Note: Some match details might be missing or failed to load.</p>
                                  <p className="text-xs text-slate-300 whitespace-pre-wrap">{error}</p>
                              </div>
                          )}
                          {filteredMatches.length > 0 && playerData?.puuid ? (
                              <MatchList matches={filteredMatches} playerPuuid={playerData.puuid} />
                          ) : !error && isLoading && allMatches.length === 0 ? ( 
                              <div className="text-center text-slate-400 py-10"><LoadingSpinner size={32} /> <p className="mt-2">Loading matches...</p></div>
                          ) : !error && filteredMatches.length === 0 && championFilter.trim() !== '' ? (
                              <div className="text-center text-slate-400 py-10">No matches found for champion: "{championFilter}"</div>
                          ) : !error && filteredMatches.length === 0 && queueTypeFilter !== "all" ? (
                            <div className="text-center text-slate-400 py-10">No matches found for queue: {getQueueNameUtil(queueTypeMap[queueTypeFilter]?.[0] ?? -1) || queueTypeFilter.replace("_", " ")}</div>
                          ) : !error && allMatches.length === 0 && !isLoading ? ( 
                              <div className="text-center text-slate-400 py-10">No recent matches found for this player.</div>
                          ) : null
                          }
                      </>
                  )}
                  {!playerData && isLoading && ( 
                       <div className="space-y-3 md:space-y-4">
                          <Skeleton className="h-12 w-full mb-3 rounded-lg" /> 
                          <Skeleton className="h-16 w-full mb-4 rounded-lg" /> 
                          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
                      </div>
                  )}
              </main>
              </div>
          </TabsContent>
        </Tabs>
      </div>

      <footer className="py-6 border-t border-border mt-auto">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row mx-auto max-w-6xl px-4"> {/* Updated to max-w-6xl */}
          <p className="text-balance text-center text-xs leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} LoL Insights. Not affiliated with Riot Games. Data provided by Riot Games API.
          </p>
        </div>
      </footer>
      
    </div>
  );
}
