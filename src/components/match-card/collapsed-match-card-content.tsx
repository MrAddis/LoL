
"use client";

import type { MatchInfoDto, ParticipantDto } from '@/types/riot-api-types';
import { ChampionIcon } from '@/components/icons/champion-icon';
import { ItemIcon } from '@/components/icons/item-icon';
import { SummonerSpellIcon } from '@/components/icons/summoner-spell-icon';
import { RuneIcon } from '@/components/icons/rune-icon';
import { formatGameDuration, formatGameCreationTime, getQueueName } from '@/lib/dragon-data';
import { cn } from '@/lib/utils';
import { Users, ShieldAlert, ShieldCheck, Sword, Coins, Target, Eye } from 'lucide-react';

interface CollapsedMatchCardContentProps {
  matchInfo: MatchInfoDto;
  mainParticipant: ParticipantDto;
  playerPuuid: string;
}

export function CollapsedMatchCardContent({ matchInfo, mainParticipant, playerPuuid }: CollapsedMatchCardContentProps) {
  const {
    championName,
    champLevel,
    item0, item1, item2, item3, item4, item5, item6, // item6 is trinket
    summoner1Id,
    summoner2Id,
    perks,
    totalMinionsKilled,
    neutralMinionsKilled,
    kills,
    deaths,
    assists,
    visionScore,
    win,
  } = mainParticipant;

  const items = [item0, item1, item2, item3, item4, item5];
  const trinket = item6;
  const cs = totalMinionsKilled + neutralMinionsKilled;
  const csPerMin = matchInfo.gameDuration > 0 ? (cs / (matchInfo.gameDuration / 60)).toFixed(1) : "0.0";
  const gameMode = getQueueName(matchInfo.queueId);
  const duration = formatGameDuration(matchInfo.gameDuration);
  const timeAgo = formatGameCreationTime(matchInfo.gameCreation);
  
  const kdaString = `${kills} / ${deaths} / ${assists}`;
  let kdaRatioText: string;
  if (deaths === 0) {
    kdaRatioText = (kills > 0 || assists > 0) ? "Perfect" : "0.00";
  } else {
    kdaRatioText = ((kills + assists) / deaths).toFixed(2);
  }

  const primaryKeystone = perks.styles.find(style => style.description === 'primaryStyle')?.selections[0]?.perk;

  const outcomeTextClass = win ? "text-sky-400" : "text-red-500";
  const outcomeText = win ? 'VICTORY' : 'DEFEAT';
  
  let kdaColor = 'text-slate-300'; // Default color
  const kdaRatioNum = parseFloat(kdaRatioText);
  if (kdaRatioText === "Perfect") {
    kdaColor = 'text-yellow-400';
  } else if (!isNaN(kdaRatioNum)) {
    if (kdaRatioNum >= 4) kdaColor = 'text-yellow-400'; // Example: Good KDA
    else if (kdaRatioNum >= 2.5) kdaColor = 'text-sky-400'; // Example: Decent KDA
  }


  const allies = matchInfo.participants.filter(p => p.teamId === mainParticipant.teamId).sort((a, b) => a.participantId - b.participantId);
  const enemies = matchInfo.participants.filter(p => p.teamId !== mainParticipant.teamId).sort((a, b) => a.participantId - b.participantId);

  const getPlayerDisplayId = (participant: ParticipantDto) => {
    if (participant.riotIdGameName && participant.riotIdGameName.trim() !== '') {
      if (participant.riotIdTagline && participant.riotIdTagline.trim() !== '') {
        return `${participant.riotIdGameName}#${participant.riotIdTagline}`;
      }
      return participant.riotIdGameName;
    }
    return participant.summonerName || "Unknown Player";
  };

  return (
    <div className={cn(
      "flex items-center w-full p-2 gap-3 text-xs relative", 
    )}>
      {/* Left Border Win/Loss Indicator */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-md", win ? "bg-sky-500" : "bg-red-600")}></div>

      {/* Section 1: Game Info */}
      <div className="flex flex-col justify-center items-start w-[100px] shrink-0 pl-2 space-y-0.5">
        <p className="text-xs font-semibold text-slate-300 leading-tight">{gameMode}</p>
        <p className="text-[0.65rem] text-slate-400 leading-tight">{timeAgo}</p>
        <p className={cn("text-sm font-bold leading-tight", outcomeTextClass)}>{outcomeText}</p>
        <p className="text-xs text-slate-400 leading-tight">{duration}</p>
      </div>

      {/* Section 2: Player Champion & Spells */}
      <div className="flex items-center gap-1 shrink-0 w-[85px]"> 
        <div className="relative">
          <ChampionIcon championName={championName} size={48} className="rounded-md" />
          <div className="absolute -bottom-1 -left-1 bg-slate-900 bg-opacity-75 text-slate-100 text-[0.65rem] font-bold px-1 rounded-sm border border-slate-700">
            {champLevel}
          </div>
        </div>
        <div className="flex flex-col gap-0.5">
          <SummonerSpellIcon spellId={summoner1Id} size={22} />
          <SummonerSpellIcon spellId={summoner2Id} size={22} />
        </div>
        <div className="ml-0.5">
          {primaryKeystone && <RuneIcon runeId={primaryKeystone} size={20} isKeystone />}
        </div>
      </div>

      {/* Section 3: Player Stats (KDA, CS, Vision) */}
      <div className="flex flex-col justify-center items-center text-center w-[90px] shrink-0 space-y-0.5">
        <p className="text-sm font-bold text-slate-100 leading-tight">{kdaString}</p>
        <p className={cn("text-xs font-semibold leading-tight", kdaColor)}>
          {kdaRatioText} KDA
        </p>
        <p className="text-[0.65rem] text-slate-400 leading-tight">{cs} CS ({csPerMin})</p>
        <p className="text-[0.65rem] text-slate-400 leading-tight">{visionScore} Vision</p>
      </div>

      {/* Section 4: Items */}
      <div className="grid grid-cols-3 gap-0.5 w-[66px] place-items-center shrink-0">
        {items.map((itemId, index) => (
          <ItemIcon key={`collapsed-item-${index}-${itemId}`} itemId={itemId} size={20} className="rounded-sm" />
        ))}
         <div className="col-span-1 flex justify-start items-center pl-px"> 
          <ItemIcon itemId={trinket} size={20} className="rounded-sm" />
        </div>
      </div>
      
      <div className="w-px bg-slate-700 self-stretch mx-2 hidden sm:block"></div> {/* Vertical Separator */}

      {/* Section 5: Player Lists */}
      <div className="flex-grow flex items-stretch justify-around gap-2 min-w-[180px] overflow-hidden">
        {/* Allies */}
        <div className="flex flex-col gap-px w-[85px] justify-center">
          {allies.slice(0, 5).map(p => (
            <div key={`ally-${p.puuid}`} className="flex items-center gap-1">
              <ChampionIcon championName={p.championName} size={20} className="rounded-full" />
              <span className={cn(
                  "text-[0.65rem] text-slate-400 truncate hover:text-slate-200 w-full",
                  p.puuid === playerPuuid && "font-bold text-sky-300"
                )} 
                title={getPlayerDisplayId(p)}
              >
                {getPlayerDisplayId(p)}
              </span>
            </div>
          ))}
        </div>
        {/* Enemies */}
        <div className="flex flex-col gap-px w-[85px] justify-center">
          {enemies.slice(0, 5).map(p => (
            <div key={`enemy-${p.puuid}`} className="flex items-center gap-1">
              <ChampionIcon championName={p.championName} size={20} className="rounded-full" />
              <span className="text-[0.65rem] text-slate-400 truncate hover:text-slate-200 w-full" title={getPlayerDisplayId(p)}>
                {getPlayerDisplayId(p)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
