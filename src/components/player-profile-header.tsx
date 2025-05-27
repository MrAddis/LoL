
import Image from 'next/image';
import Link from 'next/link';
import { getProfileIconUrl, getLatestGameVersion, getDisplayChampionName } from '@/lib/dragon-data';
import { RankIcon } from './icons/rank-icon';
import { ChampionIcon } from './icons/champion-icon';
import type { AggregatedPlayerStats, ExtendedSummonerData } from '@/types/riot-api-types';
import { Trophy, Swords, BarChart2, TrendingUp, Target } from 'lucide-react'; // Added more icons for flexibility


interface PlayerProfileHeaderProps {
  playerData: ExtendedSummonerData;
  aggregatedStats: AggregatedPlayerStats;
  // ddragonVersion is fetched inside if needed, or passed from page if already available
}

export function PlayerProfileHeader({ playerData, aggregatedStats }: PlayerProfileHeaderProps) {
  const {
    profileIconId,
    gameName,
    tagLine,
    summonerLevel,
    tier,
    division,
  } = playerData;

  const { mostPlayedChampionOverall, winRateOverall, averageKDAOverall, kdaString } = aggregatedStats;

  // Fetch version inside or expect it as prop. For now, let RankIcon handle its version if not passed.
  // const latestVersion = await getLatestGameVersion(); // Removed to simplify; RankIcon handles its version.
  // const profileIconUrl = profileIconId && latestVersion ? await getProfileIconUrl(profileIconId, latestVersion) : `https://placehold.co/120x120.png`;
  // Simpler approach for profileIconUrl if version is not critical here and getProfileIconUrl can fetch it:
  const profileIconUrl = profileIconId ? getProfileIconUrl(profileIconId) : `https://placehold.co/120x120.png`;


  const displayTier = tier?.charAt(0).toUpperCase() + (tier?.slice(1).toLowerCase() || '');
  const DEFAULT_MATCH_COUNT = 20; // Define it here or pass it as a prop if it varies

  return (
    <div className="bg-card/70 p-3 md:p-4 rounded-lg shadow-lg mb-4 border border-border">
      {/* Top Row: Identity and Rank */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-3 md:mb-4 pb-3 md:pb-4 border-b border-border/50">
        {/* Left: Player Icon, Name, Level */}
        <div className="flex items-center gap-3">
          <Image
            src={profileIconUrl}
            alt={`${gameName}'s profile icon`}
            width={120} 
            height={120}
            className="rounded-md border-2 border-primary"
            data-ai-hint="profile avatar"
            key={profileIconId}
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {gameName}
              {tagLine && <span className="text-muted-foreground text-lg sm:text-xl ml-1">#{tagLine}</span>}
            </h1>
            <p className="text-sm text-muted-foreground">Level {summonerLevel}</p>
          </div>
        </div>

        {/* Right: Rank Display */}
        <div className="flex flex-col items-center text-center shrink-0 mt-2 sm:mt-0">
          {tier && tier.toUpperCase() !== 'UNRANKED' && division ? (
            <>
              <RankIcon tier={tier} size={120} /> {/* Adjusted size */}
              <p className="text-sm font-semibold text-foreground mt-1">
                {displayTier} {division}
              </p>
            </>
          ) : (
            <>
              <RankIcon tier="UNRANKED" size={120} /> {/* Adjusted size */}
              <p className="text-sm font-semibold text-muted-foreground mt-1">
                Unranked
              </p>
            </>
          )}
        </div>
      </div>

      {/* Bottom Row: Key Statistics Panel */}
      <div className="bg-background/30 p-3 rounded-md">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 text-center sm:text-left">
          Key Statistics (Last {DEFAULT_MATCH_COUNT} Games)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs sm:text-sm">
          {mostPlayedChampionOverall && mostPlayedChampionOverall.name && (
            <div className="flex items-center gap-2 bg-card/50 p-2 rounded-md hover:bg-card/80 transition-colors">
              <Trophy className="h-5 w-5 text-yellow-400 shrink-0" />
              <div>
                <span className="text-muted-foreground block text-[11px] sm:text-xs">Most Played:</span>
                <div className="flex items-center gap-1 font-medium text-foreground">
                  <ChampionIcon championName={mostPlayedChampionOverall.name} size={20} />
                  <span>{getDisplayChampionName(mostPlayedChampionOverall.name)} ({mostPlayedChampionOverall.games} games)</span>
                </div>
              </div>
            </div>
          )}
          {winRateOverall !== undefined && (
            <div className="flex items-center gap-2 bg-card/50 p-2 rounded-md hover:bg-card/80 transition-colors">
              <TrendingUp className={`h-5 w-5 shrink-0 ${winRateOverall >= 50 ? 'text-green-400' : 'text-red-400'}`} />
              <div>
                <span className="text-muted-foreground block text-[11px] sm:text-xs">Win Rate:</span>
                <span className="font-medium text-foreground">{winRateOverall.toFixed(1)}%</span>
              </div>
            </div>
          )}
          {kdaString && averageKDAOverall && (
            <div className="flex items-center gap-2 bg-card/50 p-2 rounded-md hover:bg-card/80 transition-colors">
              <Target className="h-5 w-5 text-sky-400 shrink-0" />
              <div>
                <span className="text-muted-foreground block text-[11px] sm:text-xs">Avg KDA:</span>
                <span className="font-medium text-foreground">{kdaString}</span>
                <span className="text-muted-foreground text-[10px] sm:text-xs"> ({averageKDAOverall.kills.toFixed(1)}/{averageKDAOverall.deaths.toFixed(1)}/{averageKDAOverall.assists.toFixed(1)})</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
