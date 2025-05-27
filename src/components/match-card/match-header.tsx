
import type { MatchInfoDto } from '@/types/riot-api-types';
import { getQueueName, formatGameDuration, formatGameCreationTime } from '@/lib/dragon-data';
import { cn } from '@/lib/utils';

interface MatchHeaderProps {
  matchInfo: MatchInfoDto;
  playerTeamWon: boolean;
}

export function MatchHeader({ matchInfo, playerTeamWon }: MatchHeaderProps) {
  const gameMode = getQueueName(matchInfo.queueId);
  const duration = formatGameDuration(matchInfo.gameDuration);
  const gameTime = formatGameCreationTime(matchInfo.gameCreation);

  return (
    <div className="p-3 bg-card-foreground/5 rounded-t-lg">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <span 
            className={cn(
              "font-semibold text-lg", 
              playerTeamWon ? "text-primary" : "text-destructive"
            )}
          >
            {playerTeamWon ? 'Victory' : 'Defeat'}
          </span>
          <span className="text-sm text-muted-foreground">{gameMode}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-sm text-foreground">{duration}</span>
          <span className="text-xs text-muted-foreground">{gameTime}</span>
        </div>
      </div>
    </div>
  );
}
