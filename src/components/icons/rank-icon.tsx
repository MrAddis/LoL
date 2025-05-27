
"use client";

import Image from 'next/image';
import { getLatestGameVersion } from '@/lib/dragon-data'; // Import getLatestGameVersion
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';


interface RankIconProps {
  tier?: string;
  ddragonVersion?: string; // Prop for version, if passed from server component
  size?: number;
  className?: string;
}

const getRankEmblemUrl = (tierFromApi: string | undefined, versionToUse: string): string => {
  let tierNameForFile: string;

  if (!tierFromApi || tierFromApi.toUpperCase() === 'UNRANKED' || tierFromApi.toUpperCase() === 'NONE') {
    tierNameForFile = 'Unranked';
  } else {
    const lowerTier = tierFromApi.toLowerCase();
    tierNameForFile = lowerTier.charAt(0).toUpperCase() + lowerTier.slice(1);
  }
  // Rank emblems might not be versioned in DDragon path like other assets, often they are static under /img/ranked-emblems/
  // However, the prompt implies versioning for all assets.
  // For consistency with other icons that are versioned:
  // const url = `https://ddragon.leagueoflegends.com/cdn/${versionToUse}/img/ranked-emblem/Emblem_${tierNameForFile}.png`;
  // Standard DDragon path for ranked emblems (usually not versioned in the path):
  const url = `https://ddragon.leagueoflegends.com/cdn/img/ranked-emblems/EMBLEM_${tierNameForFile.toUpperCase()}.png`;

  // console.log(`[LoL Insights Debug - RankIcon] DDragon Version Used: ${versionToUse} (may not apply to rank emblem path), API Tier: ${tierFromApi}, Filename Tier: ${tierNameForFile}, URL: ${url}`);
  return url;
};

export function RankIcon({ tier, ddragonVersion: versionProp, size = 40, className }: RankIconProps) {
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [effectiveVersion, setEffectiveVersion] = useState<string | null>(versionProp || null);

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);

    async function fetchVersionAndSetUrl() {
      let currentVersion = effectiveVersion;
      if (!currentVersion) {
        try {
          currentVersion = await getLatestGameVersion();
          if (isActive) setEffectiveVersion(currentVersion);
        } catch (e) {
          console.error("Failed to fetch DDragon version for RankIcon", e);
          if (isActive) {
            // Use a known recent fallback if version fetch fails
            currentVersion = "14.14.1"; 
            setEffectiveVersion(currentVersion);
          } else {
            setIsLoading(false);
            return;
          }
        }
      }
      
      if (currentVersion && isActive) {
        const url = getRankEmblemUrl(tier, currentVersion);
        setIconUrl(url);
      }
      if (isActive) setIsLoading(false);
    }

    fetchVersionAndSetUrl();

    return () => { isActive = false; };
  }, [tier, versionProp, effectiveVersion]);


  if (isLoading) {
    return <Skeleton className={cn("rounded-full", className)} style={{ width: size, height: size }} />;
  }

  if (!iconUrl) {
    // Fallback if URL couldn't be constructed
    return <div style={{ width: size, height: size }} className={cn("bg-muted rounded-full", className)} data-ai-hint="rank emblem generic" />;
  }
  
  let altText = 'Rank Emblem';
  if (tier && tier.toUpperCase() !== 'UNRANKED' && tier.toUpperCase() !== 'NONE') {
    const displayTier = tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase();
    altText = `${displayTier} Rank Emblem`;
  } else {
    altText = 'Unranked Emblem';
  }

  return (
    <Image
      src={iconUrl}
      alt={altText}
      width={size}
      height={size}
      className={className}
      data-ai-hint={`rank emblem ${tier?.toLowerCase() || 'unranked'}`}
      key={iconUrl} // Added key
      onError={(e) => {
        console.warn(`[LoL Insights Debug - RankIcon ERROR] Failed to load rank emblem. URL: ${iconUrl}, Tier: ${tier}, DDragon Version: ${effectiveVersion}`);
        // Optionally set to a placeholder on error
        // if (iconUrl !== `https://placehold.co/${size}x${size}.png`) { // Avoid error loop
        //   setIconUrl(`https://placehold.co/${size}x${size}.png`);
        // }
      }}
    />
  );
}
