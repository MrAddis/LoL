
'use client';

import Image from 'next/image';
import { getChampionSquareAssetUrl, getLatestGameVersion, getDisplayChampionName } from '@/lib/dragon-data';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface ChampionIconProps {
  championName: string; // This is the raw name from the API, e.g., "Aurelion Sol" or potentially "MissFortune"
  size?: number;
  className?: string;
}

export function ChampionIcon({ championName, size = 48, className }: ChampionIconProps) {
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Format the champion name for display (tooltip, alt text)
  const displayFormattedName = getDisplayChampionName(championName);

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);

    async function fetchIcon() {
      if (!championName) {
        if (isActive) {
          setIconUrl(`https://placehold.co/${size}x${size}.png?text=N/A`);
          setIsLoading(false);
        }
        return;
      }
      try {
        // Fetch the DDragon version first
        const ddragonVersionResponse = await fetch('/api/ddragon/versions');
        if (!ddragonVersionResponse.ok) {
            throw new Error('Failed to fetch DDragon version for champion icon');
        }
        const versionData = await ddragonVersionResponse.json();
        const latestVersion = versionData.latestVersion;

        if (!latestVersion) {
            throw new Error('DDragon version not available for champion icon');
        }
        // Use the raw championName (from API) to get the DDragon ID for the URL
        const url = await getChampionSquareAssetUrl(championName, latestVersion);
        if (isActive) {
          setIconUrl(url);
        }
      } catch (error) {
        console.error(`Failed to load champion icon for ${championName}:`, error);
        if (isActive) {
          setIconUrl(`https://placehold.co/${size}x${size}.png`); // Fallback placeholder
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
  }, [championName, size]);

  if (isLoading) {
    return <Skeleton className={cn("rounded", className)} style={{ width: size, height: size }} />;
  }

  if (!iconUrl) {
    return <div style={{ width: size, height: size }} className={cn("bg-muted rounded", className)} data-ai-hint="character generic" />;
  }

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("relative transition-transform hover:scale-110", className)} style={{ width: size, height: size }}>
            <Image
              src={iconUrl}
              alt={displayFormattedName || 'Champion'}
              width={size}
              height={size}
              className="rounded"
              data-ai-hint="character game"
              key={iconUrl} // Add key here
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{displayFormattedName || 'Unknown Champion'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
