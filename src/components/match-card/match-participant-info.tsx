import type { ParticipantDto } from '@/types/riot-api-types';
import { ChampionIcon } from '@/components/icons/champion-icon';
import { SummonerSpellIcon } from '@/components/icons/summoner-spell-icon';
import { RuneIcon } from '@/components/icons/rune-icon';

interface MatchParticipantInfoProps {
  participant: ParticipantDto;
}

export async function MatchParticipantInfo({ participant }: MatchParticipantInfoProps) {
  const keystone = participant.perks.styles.find(style => style.description === 'primaryStyle')?.selections[0]?.perk;
  const primaryPath = participant.perks.styles.find(style => style.description === 'primaryStyle')?.style;
  
  return (
    <div className="flex flex-col items-center gap-2 w-24 md:w-28">
      <ChampionIcon championName={participant.championName} size={64} />
      <div className="flex gap-1">
        <SummonerSpellIcon spellId={participant.summoner1Id} size={24} />
        <SummonerSpellIcon spellId={participant.summoner2Id} size={24} />
      </div>
      <div className="flex gap-1 items-center">
        {keystone && <RuneIcon runeId={keystone} size={28} isKeystone />}
        {primaryPath && <RuneIcon runeId={primaryPath} size={20} />}
      </div>
    </div>
  );
}
