
import type { AggregatedPlayerStats, ChampionStatInfo } from '@/types/riot-api-types';
import { Card, CardContent } from '@/components/ui/card';
import { ChampionIcon } from './icons/champion-icon';
import { getDisplayChampionName } from '@/lib/dragon-data';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';
// import { TrendingUp, Target } from 'lucide-react'; // Icons removed for op.gg style

interface OverallMatchStatsProps {
  aggregatedStats: AggregatedPlayerStats;
}

function ChampionPerfItem({ champ }: { champ: ChampionStatInfo }) {
    const kdaRatio = champ.avgDeaths === 0 ? (champ.avgKills + champ.avgAssists) : (champ.avgKills + champ.avgAssists) / champ.avgDeaths;
    const kdaColor = kdaRatio >= 4 ? 'text-yellow-400' : kdaRatio >= 3 ? 'text-sky-400' : kdaRatio >=2 ? 'text-green-400' : 'text-slate-300';
    const winRateColor = champ.winRate >= 60 ? 'text-sky-400' : champ.winRate >= 40 ? 'text-slate-300' : 'text-red-400';

    return (
        <div className="flex flex-col items-center text-center p-1 rounded-md bg-slate-700/40 hover:bg-slate-700/60 transition-colors w-[70px] shrink-0"> {/* Adjusted width & padding */}
            <ChampionIcon championName={champ.championName} size={24} className="mb-0.5"/> {/* Adjusted size */}
            <p className={cn("text-[0.65rem] font-semibold", winRateColor)}>{champ.winRate.toFixed(0)}%</p> {/* Adjusted size */}
            <p className="text-[0.6rem] text-slate-400">({champ.wins}W {champ.gamesPlayed-champ.wins}L)</p> {/* Adjusted size */}
            <p className={cn("text-[0.65rem] font-medium", kdaColor)}>{kdaRatio.toFixed(2)} KDA</p> {/* Adjusted size */}
        </div>
    )
}

export function OverallMatchStats({ aggregatedStats }: OverallMatchStatsProps) {
  const { winRateOverall, averageKDAOverall, totalGames, topChampionsStats } = aggregatedStats;

  if (!totalGames || totalGames === 0) {
    return null; 
  }

  let kdaDisplay = "N/A";
  let kdaRatioNum = 0;
  let kdaStringForDisplay = "0.00 KDA";

  if (averageKDAOverall && averageKDAOverall.deaths !== undefined) {
    kdaDisplay = `${averageKDAOverall.kills?.toFixed(1) || 0}/${averageKDAOverall.deaths?.toFixed(1) || 0}/${averageKDAOverall.assists?.toFixed(1) || 0}`;
    if (averageKDAOverall.deaths === 0) {
      kdaRatioNum = (averageKDAOverall.kills || 0) + (averageKDAOverall.assists || 0);
    } else {
      kdaRatioNum = ((averageKDAOverall.kills || 0) + (averageKDAOverall.assists || 0)) / averageKDAOverall.deaths;
    }
    kdaStringForDisplay = `${kdaRatioNum.toFixed(2)} KDA`;
  }
  
  const kdaColorOverall = kdaRatioNum >= 4 ? 'text-yellow-400' : kdaRatioNum >= 3 ? 'text-sky-400' : kdaRatioNum >= 2 ? 'text-green-400' : 'text-slate-100';
  const winRateColorOverall = winRateOverall && winRateOverall >= 50 ? "text-sky-400" : "text-red-400";


  return (
    <Card className="mb-3 bg-slate-800 border-slate-700 shadow-md overflow-hidden"> {/* Adjusted margin & background */}
      <CardContent className="p-2 flex flex-col sm:flex-row items-stretch gap-2"> {/* Adjusted padding */}
        <div className="flex flex-col items-center justify-center p-2 rounded-md bg-slate-700/40 text-center sm:w-36 shrink-0"> {/* Adjusted width & padding */}
          <p className="text-[0.7rem] text-slate-400">Last {totalGames} games</p> {/* Adjusted size */}
          {winRateOverall !== undefined && (
            <p className={cn("text-xl font-bold", winRateColorOverall)}> {/* Adjusted size */}
              {winRateOverall.toFixed(0)}%
            </p>
          )}
           <p className="text-[0.65rem] text-slate-500">Win Rate</p> {/* Adjusted size */}
          {averageKDAOverall && (
            <div className="mt-0.5">
              <p className={cn("text-md font-semibold", kdaColorOverall)}>{kdaStringForDisplay}</p> {/* Adjusted size */}
              <p className="text-[0.6rem] text-slate-400">{kdaDisplay}</p> {/* Adjusted size */}
            </div>
          )}
        </div>
        
        <Separator orientation="vertical" className="h-auto bg-slate-700 hidden sm:block mx-1" />
        
        {topChampionsStats && topChampionsStats.length > 0 && (
            <div className="flex-grow flex items-center justify-start gap-1.5 p-1 rounded-md overflow-x-auto"> {/* Allow horizontal scroll if needed */}
                {topChampionsStats.map(champ => ( 
                    <ChampionPerfItem key={champ.championId} champ={champ} />
                ))}
            </div>
        )}
      </CardContent>
    </Card>
  );
}

    