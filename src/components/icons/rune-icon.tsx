
'use client';

import Image from 'next/image';
import { getRuneIconUrl, getLatestGameVersion } from '@/lib/dragon-data'; // getLatestGameVersion might not be strictly needed if rune URLs are not versioned
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface RuneIconProps {
  runeId: number;
  size?: number;
  className?: string;
  isKeystone?: boolean;
}

const runeNameMap: Record<number, string> = {
  8005: 'Press the Attack', 8008: 'Lethal Tempo', 8021: 'Fleet Footwork', 8010: 'Conqueror',
  8112: 'Electrocute', 8124: 'Predator', 8128: 'Dark Harvest', 9923: 'Hail of Blades',
  8214: 'Summon Aery', 8229: 'Arcane Comet', 8230: 'Phase Rush',
  8437: 'Grasp of the Undying', 8439: 'Aftershock', 8465: 'Guardian',
  8351: 'Glacial Augment', 8360: 'Unsealed Spellbook', 8369: 'First Strike',
  8000: 'Precision Path', 8100: 'Domination Path', 8200: 'Sorcery Path',
  8300: 'Inspiration Path', 8400: 'Resolve Path'
};

export function RuneIcon({ runeId, size = 32, className, isKeystone = false }: RuneIconProps) {
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const runeName = runeNameMap[runeId] || `Rune ${runeId}`;
  const finalSize = isKeystone ? Math.max(size, 40) : size;

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);

    async function fetchIcon() {
      try {
        // Rune URLs from DDragon are often not directly versioned in the path like champions/items.
        // The getRuneIconUrl function uses a map that points to static paths within cdn/img/.
        // If versioning is strictly required for rune *images* themselves (uncommon for DDragon),
        // getRuneIconUrl would need to accept and use the version.
        // For now, we pass undefined or let getRuneIconUrl handle it.
        // const latestVersion = await getLatestGameVersion(); // Potentially get version if getRuneIconUrl needs it
        const url = await getRuneIconUrl(runeId /*, latestVersion */); // Pass version if getRuneIconUrl is updated
        if (isActive) {
          setIconUrl(url);
        }
      } catch (error) {
        console.error(`Failed to load rune icon for ID ${runeId}:`, error);
        if (isActive) {
          setIconUrl(`https://placehold.co/${finalSize}x${finalSize}.png`);
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
  }, [runeId, finalSize]);

  if (isLoading) {
    return <Skeleton className={cn(isKeystone ? "rounded-md" : "rounded-full", className)} style={{ width: finalSize, height: finalSize }} />;
  }

  if (!iconUrl) {
    return <div style={{ width: finalSize, height: finalSize }} className={cn("bg-muted", isKeystone ? "rounded-md" : "rounded-full", className)} data-ai-hint="rune generic" />;
  }

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("relative transition-transform hover:scale-110", className)} style={{ width: finalSize, height: finalSize }}>
            <Image
              src={iconUrl}
              alt={runeName}
              width={finalSize}
              height={finalSize}
              className={cn(isKeystone ? "rounded-md" : "rounded-full")}
              data-ai-hint="magic symbol"
              key={iconUrl}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{runeName}</p>
          {isKeystone && <p className="text-xs text-muted-foreground">Keystone Rune</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
