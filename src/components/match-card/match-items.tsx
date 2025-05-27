import type { ParticipantDto } from '@/types/riot-api-types';
import { ItemIcon } from '@/components/icons/item-icon';

interface MatchItemsProps {
  participant: ParticipantDto;
}

export function MatchItems({ participant }: MatchItemsProps) {
  const items = [
    participant.item0, participant.item1, participant.item2,
    participant.item3, participant.item4, participant.item5,
  ];
  const trinket = participant.item6;

  return (
    <div className="flex flex-col items-center justify-center gap-1 flex-grow">
      <div className="grid grid-cols-3 gap-1">
        {items.map((itemId, index) => (
          <ItemIcon key={index} itemId={itemId} size={30} />
        ))}
      </div>
      {trinket !== 0 && (
        <div className="mt-1">
          <ItemIcon itemId={trinket} size={24} />
        </div>
      )}
    </div>
  );
}
