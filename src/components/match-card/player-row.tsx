
"use client";
import type { ParticipantDto } from '@/types/riot-api-types';
import { ChampionIcon } from '@/components/icons/champion-icon';
import { SummonerSpellIcon } from '@/components/icons/summoner-spell-icon';
import { ItemIcon } from '@/components/icons/item-icon';
import { RuneIcon } from '@/components/icons/rune-icon';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PlayerRowProps {
  participant: ParticipantDto;
  isPlayer: boolean;
  playerPuuid: string; 
  maxDamageInGame: number;
}

const isValidString = (str: any): str is string => typeof str === 'string' && str.trim() !== '';

export function PlayerRow({ participant, isPlayer, playerPuuid, maxDamageInGame }: PlayerRowProps) {
  const {
    champLevel,
    championName,
    summoner1Id,
    summoner2Id,
    perks,
    kills,
    deaths,
    assists,
    totalDamageDealtToChampions,
    goldEarned,
    totalMinionsKilled,
    neutralMinionsKilled,
    // visionWardsBoughtInGame, // Used for ward calculation
    detectorWardsPlaced, // Used for ward calculation
    item0, item1, item2, item3, item4, item5, item6,
    puuid,
    riotIdGameName,
    riotIdTagline,
    summonerName,
    visionScore,
    wardsPlaced, // Using this directly if available, otherwise sum of others
    controlWardsPurchased, // More direct field for control wards if available and needed
  } = participant;

  let displayIdentifier: string;
  let linkGameName: string = "Player";
  let linkTagLine: string = ""; 

  if (isValidString(riotIdGameName) && isValidString(riotIdTagline)) {
    displayIdentifier = `${riotIdGameName}#${riotIdTagline}`;
    linkGameName = riotIdGameName;
    linkTagLine = riotIdTagline;
  } else if (isValidString(riotIdGameName)) {
    displayIdentifier = riotIdGameName;
    linkGameName = riotIdGameName;
  } else if (isValidString(summonerName)) {
    displayIdentifier = summonerName;
    linkGameName = summonerName; 
  } else {
    displayIdentifier = "Unknown Player";
  }
  
  const kdaString = `${kills}/${deaths}/${assists}`;
  let kdaRatio: string | number;
  if (deaths === 0) {
    kdaRatio = (kills > 0 || assists > 0) ? "Perfect" : 0;
  } else {
    kdaRatio = ((kills + assists) / deaths).toFixed(2);
  }

  const items = [item0, item1, item2, item3, item4, item5];
  const trinketItem = item6;

  const cs = totalMinionsKilled + neutralMinionsKilled;
  const goldK = (goldEarned / 1000).toFixed(1);
  
  // Prefer direct wardsPlaced if available and non-zero, else sum. Riot's API can be inconsistent.
  const wardsCount = (wardsPlaced && wardsPlaced > 0) ? wardsPlaced : (participant.visionWardsBoughtInGame || 0) + (detectorWardsPlaced || 0);


  const primaryRuneStyle = perks.styles.find(style => style.description === 'primaryStyle');
  const keystonePerk = primaryRuneStyle?.selections[0]?.perk;
  const secondaryRuneStyleId = perks.styles.find(style => style.description === 'subStyle')?.style;

  const damagePercentage = maxDamageInGame > 0 ? (totalDamageDealtToChampions / maxDamageInGame) * 100 : 0;

  const kdaRatioNumber = parseFloat(kdaRatio as string); // Handle "Perfect" case
  const kdaColor = kdaRatio === "Perfect" ? 'text-yellow-400' : // Changed to yellow for "Perfect"
                   kdaRatioNumber >= 5 ? 'text-red-400' :
                   kdaRatioNumber >= 4 ? 'text-primary' :
                   kdaRatioNumber >= 3 ? 'text-blue-400' :
                   'text-foreground';

  // Column classes for md and up (when header is visible)
  const columnBase = "py-1 px-0.5 md:px-1 flex items-center";
  const playerInfoCol = cn(columnBase, "w-full md:w-auto md:flex-grow md:min-w-[180px] gap-1.5");
  const kdaCol = cn(columnBase, "w-[70px] md:w-[80px] shrink-0 flex-col justify-center text-center");
  const damageCol = cn(columnBase, "w-[80px] md:w-[90px] shrink-0 flex-col justify-center text-center");
  const goldCol = cn(columnBase, "w-[40px] md:w-[45px] shrink-0 justify-center text-center");
  const csCol = cn(columnBase, "w-[35px] md:w-[40px] shrink-0 justify-center text-center");
  const wardsCol = cn(columnBase, "w-[35px] md:w-[40px] shrink-0 justify-center text-center");
  const itemsCol = cn(columnBase, "w-full md:w-[140px] shrink-0 flex-wrap gap-0.5 justify-start md:justify-center mt-1 md:mt-0");


  return (
    <div
      className={cn(
        "flex flex-col md:flex-row items-stretch md:items-center md:gap-1 p-1.5 border-b border-card-foreground/10 last:border-b-0 text-xs",
        isPlayer ? "bg-primary/20" : "hover:bg-muted/20"
      )}
    >
      {/* Player Info Column (Champion, Spells, Runes, Name) */}
      <div className={playerInfoCol}>
        <span className="hidden md:inline-block w-4 text-center font-medium text-muted-foreground">{champLevel}</span>
        <div className="flex items-center gap-1">
          <ChampionIcon championName={championName} size={32} className="rounded-full" />
          <div className="flex flex-col gap-0.5">
            <SummonerSpellIcon spellId={summoner1Id} size={16} />
            <SummonerSpellIcon spellId={summoner2Id} size={16} />
          </div>
          <div className="flex flex-col gap-0.5">
            {keystonePerk && <RuneIcon runeId={keystonePerk} size={16} isKeystone />}
            {secondaryRuneStyleId && <RuneIcon runeId={secondaryRuneStyleId} size={16} />}
          </div>
        </div>
        <div className="flex-grow min-w-0 ml-1 md:ml-0">
          <Link
            href={`/matches/${encodeURIComponent(linkGameName)}/${encodeURIComponent(linkTagLine || 'EUW')}`}
            className={cn(
              "font-medium hover:text-primary truncate block text-sm",
              isPlayer ? "text-primary-foreground font-semibold" : "text-foreground"
            )}
            title={displayIdentifier}
          >
            {displayIdentifier}
          </Link>
          <span className="text-muted-foreground text-[10px] md:hidden">Lvl {champLevel}</span>
        </div>
      </div>

      {/* KDA Column */}
      <div className={kdaCol}>
        <span className="font-mono text-sm">{kdaString}</span>
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={cn("text-[10px] font-bold", kdaColor)}>{kdaRatio} KDA</span>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs p-2">
              <p>Kills: {kills}</p><p>Deaths: {deaths}</p><p>Assists: {assists}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Damage Column */}
      <div className={damageCol}>
        <span className="text-[11px]">{totalDamageDealtToChampions.toLocaleString()}</span>
        <div className="w-full h-1.5 bg-muted/50 rounded-full overflow-hidden mt-0.5">
          <div
            className="h-full bg-red-500/70"
            style={{ width: `${damagePercentage}%` }}
            title={`Damage: ${damagePercentage.toFixed(0)}% of max in game (${totalDamageDealtToChampions.toLocaleString()})`}
          />
        </div>
      </div>

      {/* Gold Column */}
      <div className={goldCol}>
        <span className="text-[11px]">{goldK}k</span>
      </div>

      {/* CS Column */}
      <div className={csCol}>
        <span className="text-[11px]">{cs}</span>
      </div>

      {/* Wards Column */}
      <div className={wardsCol}>
         <TooltipProvider delayDuration={100}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span className="text-[11px]">{wardsCount}</span>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs p-2">
                    <p>Wards Placed: {wardsPlaced || 'N/A'}</p>
                    <p>Control Wards: {detectorWardsPlaced || 'N/A'}</p>
                    <p>Vision Score: {visionScore}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
      </div>

      {/* Items Column */}
      <div className={itemsCol}>
        {items.map((itemId, index) => (
          <ItemIcon key={`item-${puuid}-${index}-${itemId}`} itemId={itemId} size={22} className="rounded" />
        ))}
        <div className="ml-0.5">
          <ItemIcon key={`trinket-${puuid}-${trinketItem}`} itemId={trinketItem} size={22} className="rounded" />
        </div>
      </div>
    </div>
  );
}
