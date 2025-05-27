
'use client';

import type { ParticipantDto } from '@/types/riot-api-types';
import { ChampionIcon } from '@/components/icons/champion-icon';
import { ItemIcon } from '@/components/icons/item-icon';
import { RuneIcon } from '@/components/icons/rune-icon';
import { SummonerSpellIcon } from '@/components/icons/summoner-spell-icon';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface PlayerInfoCardProps {
  participant: ParticipantDto;
  playerPuuid: string; // To identify the main player, if needed for special styling
}

export function PlayerInfoCard({ participant, playerPuuid }: PlayerInfoCardProps) {
  const {
    summonerName: apiSummonerName, // This is legacy, prefer riotIdName
    riotIdGameName,
    riotIdTagline,
    championName,
    champLevel,
    kills,
    deaths,
    assists,
    item0, item1, item2, item3, item4, item5, item6, // item6 is trinket
    perks,
    summoner1Id,
    summoner2Id,
    totalDamageDealtToChampions,
    totalMinionsKilled,
    neutralMinionsKilled,
    goldEarned,
  } = participant;

  const isMainPlayer = participant.puuid === playerPuuid;

  // Determine the display name and link components
  let displayIdentifier: string;
  let linkGameName: string | undefined = riotIdGameName;
  let linkTagLine: string | undefined = riotIdTagline;

  if (riotIdGameName && riotIdGameName.trim() !== '') {
    if (riotIdTagline && riotIdTagline.trim() !== '') {
      displayIdentifier = `${riotIdGameName}#${riotIdTagline}`;
    } else {
      displayIdentifier = riotIdGameName;
    }
  } else if (apiSummonerName && apiSummonerName.trim() !== '') {
    displayIdentifier = apiSummonerName;
    // If using apiSummonerName, we might not have a tagline for linking
    linkGameName = apiSummonerName;
    linkTagLine = undefined; 
  } else {
    displayIdentifier = 'Unknown Player';
    linkGameName = undefined; // Cannot form a meaningful link
    linkTagLine = undefined;
  }


  const kdaString = `${kills}/${deaths}/${assists}`;
  const cs = totalMinionsKilled + neutralMinionsKilled;
  const goldK = (goldEarned / 1000).toFixed(1);

  const primaryKeystone = perks.styles.find(style => style.description === 'primaryStyle')?.selections[0]?.perk;
  const secondaryPath = perks.styles.find(style => style.description === 'subStyle')?.style;

  const items = [item0, item1, item2, item3, item4, item5];
  const trinket = item6;

  return (
    <div
      className={cn(
        "flex flex-col gap-2 p-3 rounded-lg bg-card/50 shadow", // Increased gap to gap-2
        isMainPlayer ? "ring-2 ring-primary" : "border border-border"
      )}
    >
      {/* Top section: Player Name, Champ Icon, Name, Spells, Runes */}
      <div className="flex items-start gap-2">
        <ChampionIcon championName={championName} size={48} className="mt-1" />
        <div className="flex-grow min-w-0">
          {linkGameName ? (
             <Link href={`/matches/${encodeURIComponent(linkGameName)}/${encodeURIComponent(linkTagLine || 'EUW')}`} className="block">
                <h4 className="text-sm font-semibold truncate hover:text-primary transition-colors" title={displayIdentifier}>
                {displayIdentifier}
                </h4>
            </Link>
          ) : (
            <h4 className="text-sm font-semibold truncate" title={displayIdentifier}>
              {displayIdentifier}
            </h4>
          )}
          <p className="text-xs text-muted-foreground">{championName} - Lvl {champLevel}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex gap-1">
              <SummonerSpellIcon spellId={summoner1Id} size={20} />
              <SummonerSpellIcon spellId={summoner2Id} size={20} />
            </div>
            <div className="flex gap-1">
              {primaryKeystone && <RuneIcon runeId={primaryKeystone} size={20} isKeystone />}
              {secondaryPath && <RuneIcon runeId={secondaryPath} size={18} />}
            </div>
          </div>
        </div>
      </div>

      {/* Middle section: Items */}
      <div className="flex items-center gap-1 flex-wrap">
        {items.map((itemId, index) => (
          <ItemIcon key={`item-${participant.puuid}-${index}-${itemId}`} itemId={itemId} size={28} />
        ))}
        <ItemIcon key={`trinket-${participant.puuid}-${trinket}`} itemId={trinket} size={28} />
      </div>

      {/* Bottom section: KDA and Key Stats */}
      <div className="flex items-end justify-between gap-2 mt-1">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">KDA</span>
          <span className="text-sm font-semibold">{kdaString}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-muted-foreground">Damage</span>
          <span className="text-sm font-semibold">{totalDamageDealtToChampions.toLocaleString()}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-muted-foreground">CS</span>
          <span className="text-sm font-semibold">{cs}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-muted-foreground">Gold</span>
          <span className="text-sm font-semibold">{goldK}k</span>
        </div>
      </div>
    </div>
  );
}
