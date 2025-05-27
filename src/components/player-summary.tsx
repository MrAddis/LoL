
import Image from 'next/image';
import Link from 'next/link';
import { getProfileIconUrl, getLatestGameVersion, getDisplayChampionName } from '@/lib/dragon-data';
import { RankIcon } from './icons/rank-icon';
import { ChampionIcon } from './icons/champion-icon';
import type { TopChampionMasteryEntry } from '@/types/riot-api-types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { BarChart3, Bot, Search } from 'lucide-react';

interface PlayerSummaryProps {
  profileIconId: number;
  gameName: string;
  tagLine: string;
  summonerLevel: number;
  tier?: string;
  division?: string;
  topMasteries?: TopChampionMasteryEntry[];
  mostPlayedChampion?: { name: string; iconId: number; games: number }; // DDragon name/ID for icon
  winRate?: number;
  averageKDA?: { kills: number; deaths: number; assists: number };
}

export async function PlayerSummary({
  profileIconId,
  gameName,
  tagLine,
  summonerLevel,
  tier,
  division,
  topMasteries,
  mostPlayedChampion,
  winRate,
  averageKDA,
}: PlayerSummaryProps) {
  const latestVersion = await getLatestGameVersion();
  const profileIconUrl = await getProfileIconUrl(profileIconId, latestVersion);
  const displayTier = tier?.charAt(0).toUpperCase() + (tier?.slice(1).toLowerCase() || '');

  // console.log("[PlayerSummary] Received props:", { mostPlayedChampion, winRate, averageKDA, topMasteries });

  return (
    <div className="mb-6 md:mb-8">
      <div className="flex flex-col md:flex-row items-center gap-4 p-4 md:p-6 bg-card rounded-lg shadow-lg">
        {/* Left Column: Player Icon and Basic Info */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Image
            src={profileIconUrl}
            alt={`${gameName}'s profile icon`}
            width={80}
            height={80}
            className="rounded-full border-2 border-primary shrink-0"
            data-ai-hint="profile avatar"
          />
          <div className="flex-grow">
            <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground truncate">
              {gameName}
              <span className="text-muted-foreground text-xl md:text-2xl ml-1">#{tagLine}</span>
            </h1>
            <p className="text-md md:text-lg text-muted-foreground">Level {summonerLevel}</p>
          </div>
        </div>

        {/* Center: Key Statistics Panel */}
        <div className="flex-grow flex flex-col md:flex-row md:items-center gap-4 md:gap-6 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6 mt-4 md:mt-0 w-full">
          <div className="space-y-1.5 text-center md:text-left">
            <h3 className="text-sm font-semibold text-muted-foreground">Key Statistics</h3>
            {mostPlayedChampion ? (
              <div className="flex items-center justify-center md:justify-start gap-2 text-sm">
                <ChampionIcon championName={mostPlayedChampion.name} size={24} /> 
                <span>Most Played: {getDisplayChampionName(mostPlayedChampion.name)} ({mostPlayedChampion.games} games)</span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Most Played: N/A</p>
            )}
            {winRate !== undefined ? (
               <p className="text-sm">Win Rate: <span className="font-semibold">{winRate.toFixed(1)}%</span></p>
            ) : (
              <p className="text-sm text-muted-foreground">Win Rate: N/A</p>
            )}
            {averageKDA ? (
              <p className="text-sm">Avg KDA: <span className="font-semibold">{averageKDA.kills} / {averageKDA.deaths} / {averageKDA.assists}</span></p>
            ) : (
              <p className="text-sm text-muted-foreground">Avg KDA: N/A</p>
            )}
          </div>
        
          {/* Right: Top Mastery & Rank (Combined for better spacing) */}
          <div className="flex flex-col md:flex-row items-center md:ml-auto gap-4 md:gap-6">
            {/* Top Mastery Champions */}
            {topMasteries && topMasteries.length > 0 && (
              <div className="flex flex-col items-center md:items-start">
                <h3 className="text-sm font-semibold text-muted-foreground mb-1.5 self-center md:self-start">Top Mastery</h3>
                <div className="flex flex-row items-stretch justify-center md:justify-start gap-2">
                  {topMasteries.map((mastery) => (
                    <TooltipProvider key={mastery.championId} delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex flex-col items-center text-center p-2 bg-card-foreground/5 rounded-md hover:bg-card-foreground/10 transition-colors w-24 min-w-[96px] border border-border">
                            <ChampionIcon championName={mastery.championName} size={40} className="rounded-md mb-1" />
                            <span className="text-xs font-medium text-foreground truncate w-full" title={getDisplayChampionName(mastery.championName)}>
                              {getDisplayChampionName(mastery.championName)}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              Lvl {mastery.championLevel}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {mastery.championPoints.toLocaleString()} MP
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{getDisplayChampionName(mastery.championName)}</p>
                          <p>Level: {mastery.championLevel}</p>
                          <p>Points: {mastery.championPoints.toLocaleString()}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </div>
            )}
            
            {/* Rank Info */}
            <div className="flex flex-col items-center justify-center mt-4 md:mt-0 md:pl-4 md:border-l border-border self-stretch">
              <h3 className="text-sm font-semibold text-muted-foreground mb-1.5 md:hidden">Rank</h3>
              {tier && tier.toUpperCase() !== 'UNRANKED' && division ? (
                <>
                  <RankIcon tier={tier} ddragonVersion={latestVersion} size={56} />
                  <p className="text-xs font-semibold text-center mt-1 text-accent-foreground">
                    {displayTier} {division}
                  </p>
                </>
              ) : (
                <>
                  <RankIcon tier="UNRANKED" ddragonVersion={latestVersion} size={56} />
                  <p className="text-xs font-semibold text-center mt-1 text-muted-foreground">
                    Unranked
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-4 flex flex-col sm:flex-row justify-center gap-2 md:gap-3">
        <Button asChild variant="outline" className="flex-grow sm:flex-grow-0">
          <Link href={`/matches/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}/champions`}>
            <BarChart3 className="mr-2 h-4 w-4" /> Champion Mastery & Performance
          </Link>
        </Button>
        <Button asChild variant="outline" className="flex-grow sm:flex-grow-0">
          <Link href="/coaching">
            <Bot className="mr-2 h-4 w-4" /> AI Coaching & Strategy Chatbot
          </Link>
        </Button>
        <Button asChild variant="outline" className="flex-grow sm:flex-grow-0">
          <Link href="/">
            <Search className="mr-2 h-4 w-4" /> Search New Summoner
          </Link>
        </Button>
      </div>
    </div>
  );
}
