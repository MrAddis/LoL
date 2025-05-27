
import type { LeagueEntryDto } from '@/types/riot-api-types';
import { RankIcon } from './icons/rank-icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface RankedQueueStatsProps {
  queueType: string; // e.g., "Ranked Solo", "Ranked Flex"
  rankedData?: LeagueEntryDto;
}

export function RankedQueueStats({ queueType, rankedData }: RankedQueueStatsProps) {
  const displayTier = rankedData?.tier?.charAt(0).toUpperCase() + (rankedData?.tier?.slice(1).toLowerCase() || '');
  const winRate = rankedData && (rankedData.wins + rankedData.losses > 0)
    ? ((rankedData.wins / (rankedData.wins + rankedData.losses)) * 100).toFixed(0)
    : "0";

  return (
    <Card className="bg-slate-800 border-slate-700 shadow-md">
      <CardHeader className="py-2.5 px-3 border-b border-slate-700">
        <div className="flex justify-between items-center">
          <CardTitle className="text-[0.8rem] font-semibold text-slate-300">{queueType}</CardTitle>
          {/* Placeholder for season dropdown */}
          {/* <span className="text-xs text-slate-400">S2023 S2</span> */}
        </div>
      </CardHeader>
      <CardContent className="p-3">
        {rankedData && rankedData.tier ? (
          <div className="flex items-center gap-3">
            <RankIcon tier={rankedData.tier} size={48} className="shrink-0" />
            <div className="flex-grow">
              <p className="text-md font-bold text-slate-100">
                {displayTier} {rankedData.rank}
              </p>
              <p className="text-[0.7rem] text-slate-400">{rankedData.leaguePoints} LP</p>
            </div>
            <Separator orientation="vertical" className="h-8 bg-slate-600 mx-1" />
            <div className="text-right shrink-0">
              <p className="text-[0.7rem] text-slate-200">{rankedData.wins}W {rankedData.losses}L</p>
              <p className="text-[0.7rem] text-slate-400">{winRate}% WR</p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-3">Unranked</p>
        )}
      </CardContent>
    </Card>
  );
}
