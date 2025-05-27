
'use client';

import type { ParticipantDto } from '@/types/riot-api-types';
import { PlayerInfoCard } from './player-info-card';
import { cn } from '@/lib/utils';

interface TeamSectionProps {
  teamParticipants: ParticipantDto[];
  teamWon: boolean;
  teamLabel: string; // e.g., "Your Team (Blue)" or "Enemy Team (Red)"
  playerPuuid: string;
}

export function TeamSection({ teamParticipants, teamWon, teamLabel, playerPuuid }: TeamSectionProps) {
  const totalKills = teamParticipants.reduce((sum, p) => sum + p.kills, 0);
  const totalDeaths = teamParticipants.reduce((sum, p) => sum + p.deaths, 0);
  const totalAssists = teamParticipants.reduce((sum, p) => sum + p.assists, 0);

  return (
    <div className={cn(
      "flex-1 p-3 rounded-lg min-w-0", // min-w-0 is important for flex children
      teamWon ? "bg-primary/10 border border-primary/30" : "bg-destructive/10 border border-destructive/30"
    )}>
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-border">
        <h3 className={cn(
          "text-base font-semibold", // Changed from text-lg to text-base
          teamWon ? "text-primary" : "text-destructive"
        )}>
          {teamLabel} - {teamWon ? "Victory" : "Defeat"}
        </h3>
        <div className="text-right">
          <span className="text-xs text-muted-foreground block">Team KDA</span>
          <span className="text-sm font-bold">{`${totalKills} / ${totalDeaths} / ${totalAssists}`}</span>
        </div>
      </div>
      <div className="space-y-3"> 
        {teamParticipants.map((participant) => (
          <PlayerInfoCard
            key={participant.puuid}
            participant={participant}
            playerPuuid={playerPuuid}
          />
        ))}
      </div>
    </div>
  );
}
