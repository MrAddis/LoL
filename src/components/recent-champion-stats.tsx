
import type { ChampionStatInfo } from '@/types/riot-api-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChampionIcon } from './icons/champion-icon';
import { getDisplayChampionName } from '@/lib/dragon-data';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface RecentChampionStatsProps {
  championStats?: ChampionStatInfo[]; // Made optional for safety
}

export function RecentChampionStats({ championStats }: RecentChampionStatsProps) {
  if (!championStats || championStats.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700 shadow-md"> {/* Adjusted background */}
        <CardHeader className="py-2.5 px-3">
          <CardTitle className="text-[0.8rem] font-semibold text-slate-300">Champion Stats (Recent {championStats?.length || 0} Games)</CardTitle> {/* Adjusted size */}
        </CardHeader>
        <CardContent className="p-3">
          <p className="text-xs text-slate-400 text-center">No recent champion data.</p> {/* Adjusted size */}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700 shadow-md"> {/* Adjusted background */}
      <CardHeader className="py-2.5 px-3 border-b border-slate-700">
        <div className="flex justify-between items-center">
            <CardTitle className="text-[0.8rem] font-semibold text-slate-300">Champion Stats (Recent Games)</CardTitle> {/* Adjusted size */}
            {/* <span className="text-xs text-slate-400">All Ranked</span> Placeholder */}
        </div>
      </CardHeader>
      <CardContent className="p-1.5 space-y-1"> {/* Adjusted padding */}
        {championStats.slice(0, 5).map((champ, index) => { // Show top 5 or less
          const kdaString = `${champ.avgKills}/${champ.avgDeaths}/${champ.avgAssists}`;
          const kdaRatio = champ.avgDeaths === 0 ? (champ.avgKills + champ.avgAssists) : (champ.avgKills + champ.avgAssists) / champ.avgDeaths;
          const kdaColor = kdaRatio >= 4 ? 'text-yellow-400' : kdaRatio >= 2.5 ? 'text-sky-400' : 'text-slate-300';
          const winRateColor = champ.winRate >= 60 ? 'text-green-400' : champ.winRate >= 40 ? 'text-slate-300' : 'text-red-400';

          return (
            <TooltipProvider key={champ.championId} delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 p-1 rounded-md hover:bg-slate-700/60 transition-colors cursor-default"> {/* Adjusted padding & gap */}
                    <ChampionIcon championName={champ.championName} size={32} /> {/* Adjusted size */}
                    <div className="flex-grow min-w-0">
                      <p className="text-[0.7rem] font-medium text-slate-100 truncate" title={getDisplayChampionName(champ.championName)}> {/* Adjusted size */}
                        {getDisplayChampionName(champ.championName)}
                      </p>
                      <p className={cn("text-[0.65rem] font-semibold", kdaColor)}>{kdaString}</p> {/* Adjusted size */}
                    </div>
                    <div className="text-right shrink-0 ml-1.5"> {/* Adjusted margin */}
                      <p className={cn("text-[0.7rem] font-semibold", winRateColor)}>{champ.winRate.toFixed(0)}%</p> {/* Adjusted size */}
                      <p className="text-[0.65rem] text-slate-400">{champ.gamesPlayed} games</p> {/* Adjusted size */}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs p-2 bg-slate-900 border-slate-700 text-slate-200">
                    <p>{getDisplayChampionName(champ.championName)}</p>
                    <p>KDA: {kdaString} ({kdaRatio.toFixed(2)}:1)</p>
                    <p>Win Rate: {champ.winRate.toFixed(0)}% ({champ.wins}W {champ.gamesPlayed - champ.wins}L)</p>
                    <p>Games: {champ.gamesPlayed}</p>
                </TooltipContent>
              </Tooltip>
              {index < championStats.slice(0, 5).length -1 && <Separator className="bg-slate-700/50 my-0.5" />}
            </TooltipProvider>
          );
        })}
      </CardContent>
    </Card>
  );
}

    