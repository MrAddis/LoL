
// This component's functionality (Navigation and Champion Stats for sidebar)
// is now integrated into /src/app/matches/[gameName]/[tagLine]/page.tsx
// using new components like RankedQueueStats and RecentChampionStats
// within the left column of the new layout.
// This file can be deleted if no longer imported anywhere.

import type { ChampionStatInfo } from '@/types/riot-api-types';

interface LeftSidebarProps {
  topChampionsStats?: ChampionStatInfo[];
  gameName: string; 
  tagLine: string;  
}

export function LeftSidebar({}: LeftSidebarProps) {
  return null; // Or a placeholder div
}

    