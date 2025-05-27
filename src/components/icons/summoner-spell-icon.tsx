
'use client';

import Image from 'next/image';
import { getSummonerSpellIconUrl, getLatestGameVersion } from '@/lib/dragon-data';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface SummonerSpellIconProps {
  spellId: number;
  size?: number;
  className?: string;
}

const spellNameMap: Record<number, string> = {
  1: 'Cleanse', 3: 'Exhaust', 4: 'Flash', 6: 'Ghost', 7: 'Heal',
  11: 'Smite', 12: 'Teleport', 13: 'Clarity', 14: 'Ignite', 21: 'Barrier', 32: 'Mark'
};

export function SummonerSpellIcon({ spellId, size = 32, className }: SummonerSpellIconProps) {
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const spellName = spellNameMap[spellId] || `Spell ${spellId}`;

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);

    async function fetchIcon() {
      try {
        const latestVersion = await getLatestGameVersion(); // Fetch latest version
        const url = await getSummonerSpellIconUrl(spellId, latestVersion);
        if (isActive) {
          setIconUrl(url);
        }
      } catch (error) {
        console.error(`Failed to load summoner spell icon for ID ${spellId}:`, error);
        if (isActive) {
          setIconUrl(`https://placehold.co/${size}x${size}.png`);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    fetchIcon();

    return () => {
      isActive = false;
    };
  }, [spellId, size]);

  if (isLoading) {
    return <Skeleton className={cn("rounded", className)} style={{ width: size, height: size }} />;
  }

  if (!iconUrl) {
     return <div style={{ width: size, height: size }} className={cn("bg-muted rounded", className)} data-ai-hint="spell generic" />;
  }

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("relative transition-transform hover:scale-110", className)} style={{ width: size, height: size }}>
            <Image
              src={iconUrl}
              alt={spellName}
              width={size}
              height={size}
              className="rounded"
              data-ai-hint="magic spell"
              key={iconUrl}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{spellName}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
