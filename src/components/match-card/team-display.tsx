
import type { ParticipantDto } from '@/types/riot-api-types';
import { PlayerRow } from './player-row';
import { cn } from '@/lib/utils';

interface TeamDisplayProps {
  teamParticipants: ParticipantDto[];
  teamId: number;
  teamWon: boolean;
  playerPuuid: string;
  maxDamageInGame: number;
  isPlayerTeam: boolean; 
  teamLabel: string; 
}

export function TeamDisplay({ teamParticipants, teamId, teamWon, playerPuuid, maxDamageInGame, isPlayerTeam, teamLabel }: TeamDisplayProps) {
  const totalKills = teamParticipants.reduce((sum, p) => sum + p.kills, 0);
  const totalDeaths = teamParticipants.reduce((sum, p) => sum + p.deaths, 0);
  const totalAssists = teamParticipants.reduce((sum, p) => sum + p.assists, 0);

  const headers = ["Player", "KDA", "Damage", "Gold", "CS", "Wards", "Items"];
  // Adjusted widths for potentially more compact display within accordion
  const headerWidths = ["flex-grow min-w-[180px]", "w-[80px]", "w-[90px]", "w-[45px]", "w-[40px]", "w-[40px]", "w-[140px]"];


  return (
    <div className={cn(
        "flex flex-col rounded-md overflow-hidden border",
        teamWon ? "border-blue-600/70 bg-blue-900/20" : "border-red-600/70 bg-red-900/20",
      )}
    >
      {/* Team Header: Result and Total KDA */}
      <div className={cn(
        "flex justify-between items-center p-2 text-sm font-semibold",
        teamWon ? "bg-blue-500/30 text-blue-100" : "bg-red-500/30 text-red-100"
      )}>
        <span className="text-base">{teamWon ? "Victory" : "Defeat"} <span className="text-xs opacity-80">({teamLabel})</span></span>
        <span className="font-mono text-sm">{totalKills} / {totalDeaths} / {totalAssists}</span>
      </div>

      {/* Stats Header Row - For expanded view */}
      <div className="hidden md:flex items-center gap-1 p-1.5 bg-card-foreground/10 text-muted-foreground text-[11px] font-medium border-b border-t border-card-foreground/10">
        {headers.map((header, index) => (
          <div key={header} className={cn(headerWidths[index], "shrink-0", index > 0 ? "text-center" : "pl-1")}>
            {header}
          </div>
        ))}
      </div>
      
      {/* Player Rows */}
      <div className="flex flex-col">
        {teamParticipants.map((participant) => (
          <PlayerRow
            key={participant.puuid}
            participant={participant}
            isPlayer={participant.puuid === playerPuuid}
            playerPuuid={playerPuuid}
            maxDamageInGame={maxDamageInGame}
          />
        ))}
      </div>
    </div>
  );
}
