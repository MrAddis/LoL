import type { MatchDto } from '@/types/riot-api-types';
import { MatchCard } from './match-card';

interface MatchListProps {
  matches: MatchDto[];
  playerPuuid: string;
}

export function MatchList({ matches, playerPuuid }: MatchListProps) {
  if (matches.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No recent matches found for this player.</p>;
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {matches.map((match, index) => (
        <MatchCard key={match.metadata.matchId} matchData={match} playerPuuid={playerPuuid} index={index} />
      ))}
    </div>
  );
}
