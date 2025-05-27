"use client";

import type { MatchDto, ParticipantDto } from '@/types/riot-api-types';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card'; // Added Card components
import { cn } from '@/lib/utils';
import { TeamDisplay } from './match-card/team-display'; 
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CollapsedMatchCardContent } from './match-card/collapsed-match-card-content';


interface MatchCardProps {
  matchData: MatchDto;
  playerPuuid: string;
  index: number; 
}

const ROLE_ORDER: Record<string, number> = {
  TOP: 0, JUNGLE: 1, MIDDLE: 2,
  BOTTOM: 3, 
  UTILITY: 4, 
  NONE: 5,
  INVALID: 6,
};

function getSortableRoleValue(participant: ParticipantDto): number {
  const position = participant.individualPosition?.toUpperCase() || participant.teamPosition?.toUpperCase();
  if (position && typeof ROLE_ORDER[position] !== 'undefined') {
    return ROLE_ORDER[position];
  }
  return ROLE_ORDER.INVALID;
}

export function MatchCard({ matchData, playerPuuid, index }: MatchCardProps) {
  const mainParticipant = matchData.info.participants.find(p => p.puuid === playerPuuid);

  if (!mainParticipant) {
    return (
      <Card className="p-4 text-destructive-foreground bg-destructive match-card-appear" style={{ animationDelay: `${index * 0.05}s` }}>
        Error: Player data not found in this match.
      </Card>
    );
  }

  const cardDelay = `${index * 0.05}s`;
  const playerTeamId = mainParticipant.teamId;
  const playerTeamWon = mainParticipant.win;

  let maxDamageInGame = 0;
  matchData.info.participants.forEach(p => {
    if (p.totalDamageDealtToChampions > maxDamageInGame) {
      maxDamageInGame = p.totalDamageDealtToChampions;
    }
  });
  if (maxDamageInGame === 0) maxDamageInGame = 1;

  const playerTeamParticipants = matchData.info.participants
    .filter(p => p.teamId === playerTeamId)
    .sort((a, b) => getSortableRoleValue(a) - getSortableRoleValue(b));

  const enemyTeamId = playerTeamId === 100 ? 200 : 100;
  const enemyTeamObject = matchData.info.teams.find(team => team.teamId === enemyTeamId);
  const enemyTeamWon = enemyTeamObject ? enemyTeamObject.win : !playerTeamWon;

  const enemyTeamParticipants = matchData.info.participants
    .filter(p => p.teamId !== playerTeamId)
    .sort((a, b) => getSortableRoleValue(a) - getSortableRoleValue(b));
  
  // Background and border for the entire card based on win/loss
  const cardOutcomeClass = playerTeamWon ? "bg-sky-900/20 border-sky-700/70" : "bg-red-900/20 border-red-700/70";

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all hover:shadow-xl match-card-appear",
        cardOutcomeClass 
      )}
      style={{ animationDelay: cardDelay }}
    >
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={`match-${matchData.metadata.matchId}`} className="border-b-0">
          <AccordionTrigger 
            className={cn(
              "p-0 hover:no-underline focus:outline-none group/trigger",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card rounded-t-md",
              // "data-[state=open]:rounded-b-none" // Keep rounded top when open
            )}
          >
            <CollapsedMatchCardContent
              matchInfo={matchData.info}
              mainParticipant={mainParticipant}
              playerPuuid={playerPuuid}
            />
          </AccordionTrigger>
          <AccordionContent className="p-2 md:p-3 bg-slate-800/50 border-t border-slate-700">
            <div className="flex flex-col gap-3 mt-1">
              <TeamDisplay
                teamParticipants={playerTeamParticipants}
                teamId={playerTeamId}
                teamWon={playerTeamWon}
                playerPuuid={playerPuuid}
                maxDamageInGame={maxDamageInGame}
                teamLabel={playerTeamId === 100 ? "Blue Team" : "Red Team"}
              />
              <TeamDisplay
                teamParticipants={enemyTeamParticipants}
                teamId={enemyTeamId}
                teamWon={enemyTeamWon}
                playerPuuid={playerPuuid}
                maxDamageInGame={maxDamageInGame}
                teamLabel={enemyTeamId === 100 ? "Blue Team" : "Red Team"}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}