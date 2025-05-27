
'use client';

import Image from 'next/image';
import { getItemIconUrl, getLatestGameVersion } from '@/lib/dragon-data';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface ItemIconProps {
  itemId: number;
  size?: number;
  className?: string;
}

export function ItemIcon({ itemId, size = 32, className }: ItemIconProps) {
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (itemId === 0) {
      setIconUrl('empty-slot');
      setIsLoading(false);
      return;
    }

    let isActive = true;
    setIsLoading(true);

    async function fetchIcon() {
      try {
        const latestVersion = await getLatestGameVersion(); // Fetch latest version
        const url = await getItemIconUrl(itemId, latestVersion);
        if (isActive) {
          setIconUrl(url);
        }
      } catch (error) {
        console.error(`Failed to load item icon for ID ${itemId}:`, error);
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
  }, [itemId, size]);

  if (itemId === 0 || iconUrl === 'empty-slot') {
    return (
      <div
        className={cn(
          "relative rounded overflow-hidden",
          "bg-black/50",
          className
        )}
        style={{ width: size, height: size }}
        data-ai-hint="empty slot"
      />
    );
  }

  if (isLoading) {
    return <Skeleton className={cn("rounded", className)} style={{ width: size, height: size }} />;
  }

  if (!iconUrl) {
    return <div style={{ width: size, height: size }} className={cn("bg-muted rounded", className)} data-ai-hint="item generic" />;
  }

  return (
    <div
      className={cn(
        "relative rounded overflow-hidden",
        "bg-black/30 shadow-sm",
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={iconUrl}
        alt={`Item ${itemId}`}
        width={size}
        height={size}
        key={iconUrl}
        data-ai-hint="fantasy item"
      />
    </div>
  );
}
