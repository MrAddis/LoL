import type { ParticipantDto, MatchInfoDto } from '@/types/riot-api-types';
import { ChampionIcon } from '@/components/icons/champion-icon';
import { formatGameDuration, getQueueName } from '@/lib/dragon-data';
import { cn } from '@/lib/utils';

interface MatchTeamStatsProps {
  mainParticipant: ParticipantDto;
  matchInfo: MatchInfoDto;
}

export async function MatchTeamStats({ mainParticipant, matchInfo }: MatchTeamStatsProps) {
  const teammates = matchInfo.participants.filter(
    p => p.teamId === mainParticipant.teamId && p.puuid !== mainParticipant.puuid
  ).slice(0, 4); // Show up to 4 teammates

  const kda = `${mainParticipant.kills}/${mainParticipant.deaths}/${mainParticipant.assists}`;
  const kdaRatio = mainParticipant.deaths === 0 
    ? (mainParticipant.kills + mainParticipant.assists) 
    : (mainParticipant.kills + mainParticipant.assists) / mainParticipant.deaths;

  const kdaColor = kdaRatio >= 4 ? 'text-green-400' : kdaRatio >= 2.5 ? 'text-blue-400' : 'text-foreground';

  return (
    <div className="flex flex-col items-center md:items-end gap-2 w-full md:w-auto text-center md:text-right">
      <div className={cn(
        "px-3 py-1 rounded font-semibold text-sm",
        mainParticipant.win ? "bg-win-color/80 text-white" : "bg-loss-color/80 text-white"
      )}>
        {mainParticipant.win ? 'Victory' : 'Defeat'}
      </div>
      <div className="font-mono text-lg">
        KDA: <span className={kdaColor}>{kda}</span>
      </div>
      <p className="text-xs text-muted-foreground">{formatGameDuration(matchInfo.gameDuration)}</p>
      <p className="text-xs text-muted-foreground">{getQueueName(matchInfo.queueId)}</p>
      
      <div className="flex gap-1 mt-2 justify-center md:justify-end">
        {teammates.map(tm => (
          <ChampionIcon key={tm.puuid} championName={tm.championName} size={24} />
        ))}
      </div>
    </div>
  );
}
