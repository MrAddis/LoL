
import type { DDragonVersion, ChampionJsonData } from '@/types/riot-api-types';
import { formatDistanceToNowStrict } from 'date-fns';

// --- Game Version ---
export const FALLBACK_DDRAGON_VERSION = '14.14.1'; // A recent fallback

// Simplified version fetching, relying on Next.js fetch caching
export async function getLatestGameVersion(): Promise<string> {
  try {
    const envVersion = process.env.DDRAGON_VERSION;
    if (envVersion && envVersion.trim() !== '') {
      console.log(`[LoL Insights Debug - DataDragon] Using DDragon version from environment: ${envVersion}`);
      return envVersion;
    }

    console.log("[LoL Insights Debug - DataDragon] Fetching new latest game version from Riot...");
    const response = await fetch('https://ddragon.leagueoflegends.com/api/versions.json', {
      next: { revalidate: 60 }, // Revalidate from origin cache no more than once per minute
    });

    if (!response.ok) {
      console.warn(`[LoL Insights Debug - DataDragon] Failed to fetch Data Dragon versions: ${response.status}. Falling back to: ${FALLBACK_DDRAGON_VERSION}`);
      return FALLBACK_DDRAGON_VERSION;
    }

    const versionsData = (await response.json()) as string[];
    if (versionsData && versionsData.length > 0) {
      const newLatestVersion = versionsData[0];
      console.log("[LoL Insights Debug - DataDragon] Fetched latest game version:", newLatestVersion);
      return newLatestVersion;
    }

    console.warn(`[LoL Insights Debug - DataDragon] No versions found in DDragon API response. Falling back to: ${FALLBACK_DDRAGON_VERSION}`);
    return FALLBACK_DDRAGON_VERSION;

  } catch (error: any) {
    console.error(`[LoL Insights Debug - DataDragon] Error fetching latest game version: ${error.message}. Falling back to: ${FALLBACK_DDRAGON_VERSION}`);
    return FALLBACK_DDRAGON_VERSION;
  }
}

// --- Champion Data Caching & Name Retrieval ---
let cachedChampionJson: { version: string | null, data: ChampionJsonData | null } = { version: null, data: null };

async function getChampionData(version: string): Promise<ChampionJsonData | null> {
  if (cachedChampionJson.version === version && cachedChampionJson.data) {
    // console.log(`[LoL Insights Debug - DataDragon] Using cached champion.json for version ${version}`);
    return cachedChampionJson.data;
  }
  // console.log(`[LoL Insights Debug - DataDragon] Fetching champion.json for version ${version}`);
  try {
    const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`, {
      next: { revalidate: 3600 } // Cache champion.json for 1 hour
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch champion.json for version ${version}: ${response.status}`);
    }
    const championData = await response.json() as ChampionJsonData;
    cachedChampionJson = { version, data: championData };
    return championData;
  } catch (error) {
    console.error(`[LoL Insights Debug - DataDragon] Error fetching champion.json for version ${version}:`, error);
    return null;
  }
}

export async function getChampionNameById(championId: number, version: string): Promise<string> {
  const championData = await getChampionData(version);
  if (!championData) {
    // console.warn(`[LoL Insights Debug - DataDragon] Champion data not available for version ${version} to find name for ID ${championId}.`);
    return `Champion ${championId}`; // Fallback
  }
  const championIdStr = championId.toString();
  for (const championKey in championData.data) {
    if (championData.data[championKey].key === championIdStr) {
      return championData.data[championKey].id; // This is the DDragon ID like "MissFortune"
    }
  }
  // console.warn(`[LoL Insights Debug - DataDragon] Champion name not found for ID ${championId} in version ${version}.`);
  return `Champion ${championId}`;
}


// --- Icon URL Constructors ---

export async function getProfileIconUrl(profileIconId: number, version?: string): Promise<string> {
  const ver = version || await getLatestGameVersion();
  const url = `https://ddragon.leagueoflegends.com/cdn/${ver}/img/profileicon/${profileIconId}.png`;
  // console.log(`[LoL Insights Debug - ProfileIcon] Version: ${ver}, ID: ${profileIconId}, URL: ${url}`);
  return url;
}

const championNameMap: Record<string, string> = {
  "Aurelion Sol": "AurelionSol", "AurelionSol": "AurelionSol",
  "Cho'Gath": "Chogath", "Chogath": "Chogath",
  "Dr. Mundo": "DrMundo", "DrMundo": "DrMundo",
  "Fiddlesticks": "Fiddlesticks", "FiddleSticks": "Fiddlesticks", // Note: Fiddlesticks DDragon ID is "Fiddlesticks"
  "Jarvan IV": "JarvanIV", "JarvanIV": "JarvanIV",
  "Kai'Sa": "Kaisa", "Kaisa": "Kaisa",
  "Kha'Zix": "Khazix", "Khazix": "Khazix",
  "Kog'Maw": "KogMaw", "KogMaw": "KogMaw",
  "LeBlanc": "Leblanc", "Leblanc": "Leblanc",
  "Lee Sin": "LeeSin", "LeeSin": "LeeSin",
  "Master Yi": "MasterYi", "MasterYi": "MasterYi",
  "Miss Fortune": "MissFortune", "MissFortune": "MissFortune",
  "Nunu & Willump": "Nunu", "Nunu": "Nunu",
  "Rek'Sai": "RekSai", "RekSai": "RekSai",
  "Renata Glasc": "Renata", "Renata": "Renata",
  "Tahm Kench": "TahmKench", "TahmKench": "TahmKench",
  "Twisted Fate": "TwistedFate", "TwistedFate": "TwistedFate",
  "Vel'Koz": "Velkoz", "Velkoz": "Velkoz",
  "Xin Zhao": "XinZhao", "XinZhao": "XinZhao",
  "Wukong": "MonkeyKing", "MonkeyKing": "MonkeyKing", // Wukong's DDragon ID is MonkeyKing
  "K'Sante": "KSante", "KSante": "KSante",
};

const ddragonIdToDisplayNameMap: Record<string, string> = {
  "AurelionSol": "Aurelion Sol",
  "Chogath": "Cho'Gath",
  "DrMundo": "Dr. Mundo",
  "Fiddlesticks": "Fiddlesticks",
  "JarvanIV": "Jarvan IV",
  "Kaisa": "Kai'Sa",
  "Khazix": "Kha'Zix",
  "KogMaw": "Kog'Maw",
  "Leblanc": "LeBlanc",
  "LeeSin": "Lee Sin",
  "MasterYi": "Master Yi",
  "MissFortune": "Miss Fortune",
  "Nunu": "Nunu & Willump",
  "RekSai": "Rek'Sai",
  "Renata": "Renata Glasc",
  "TahmKench": "Tahm Kench",
  "TwistedFate": "Twisted Fate",
  "Velkoz": "Vel'Koz",
  "XinZhao": "Xin Zhao",
  "MonkeyKing": "Wukong",
  "KSante": "K'Sante",
};

export function getDisplayChampionName(rawChampionNameOrDDragonId: string): string {
  if (!rawChampionNameOrDDragonId) return "Unknown Champion";
  // If it's already a display name (contains space or is specifically mapped value)
  if (Object.values(ddragonIdToDisplayNameMap).includes(rawChampionNameOrDDragonId)) {
    return rawChampionNameOrDDragonId;
  }
  // If it's a DDragon ID (key in map)
  return ddragonIdToDisplayNameMap[rawChampionNameOrDDragonId] || rawChampionNameOrDDragonId;
}


export async function getChampionSquareAssetUrl(championName: string, version: string): Promise<string> {
  if (!championName || typeof championName !== 'string' || championName.trim() === "") {
    // console.log(`[LoL Insights Debug - ChampionSquareAsset] Invalid championName input: '${championName}'. Using placeholder.`);
    return `https://placehold.co/48x48.png?text=NoCh`;
  }

  let ddragonId = championNameMap[championName];

  if (!ddragonId) {
    // Fallback sanitization if not in map
    const sanitizedName = championName.replace(/[^a-zA-Z0-9\s']/g, ''); // Allow spaces and apostrophes initially
    const parts = sanitizedName.split(/\s+/);
    // Capitalize first letter of each part, join, then remove apostrophes
    ddragonId = parts.map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join('').replace(/'/g, '');
    
    // Specific overrides if sanitization isn't perfect for all DDragon IDs
    // These might be needed if API names are very different from DDragon IDs and not covered by championNameMap
    if (ddragonId === "Reksai") ddragonId = "RekSai";
    if (ddragonId === "Ksante") ddragonId = "KSante";
    if (ddragonId === "LeBlanc") ddragonId = "Leblanc";
    // console.log(`[LoL Insights Debug - ChampionSquareAsset] Sanitized '${championName}' to DDragon ID '${ddragonId}'`);
  } else {
    // console.log(`[LoL Insights Debug - ChampionSquareAsset] Mapped '${championName}' to DDragon ID '${ddragonId}' from championNameMap.`);
  }

  if (!ddragonId || ddragonId.trim() === "") {
    // console.log(`[LoL Insights Debug - ChampionSquareAsset] DDragon ID is empty for '${championName}' after mapping/sanitization. Using placeholder.`);
    return `https://placehold.co/48x48.png?text=${championName.substring(0,3)}`;
  }

  const url = `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${ddragonId}.png`;
  // console.log(`[LoL Insights Debug - ChampionSquareAsset] Constructed URL for ${championName} (ID: ${ddragonId}, Version: ${version}): ${url}`);
  return url;
}

export async function getItemIconUrl(itemId: number, version: string): Promise<string> {
  if (itemId === 0 || typeof itemId !== 'number') {
    // console.log(`[LoL Insights Debug - ItemIconUrl] Invalid itemId: ${itemId}. Returning 'empty-slot'.`);
    return 'empty-slot';
  }
  const url = `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${itemId}.png`;
  // console.log(`[LoL Insights Debug - ItemIconUrl] Constructed URL for item ${itemId} (Version: ${version}): ${url}`);
  return url;
}

const summonerSpellMap: Record<number, string> = {
  1: 'SummonerBoost', // Cleanse
  3: 'SummonerExhaust',
  4: 'SummonerFlash',
  6: 'SummonerHaste', // Ghost
  7: 'SummonerHeal',
  11: 'SummonerSmite',
  12: 'SummonerTeleport',
  13: 'SummonerMana', // Clarity
  14: 'SummonerDot', // Ignite
  21: 'SummonerBarrier',
  32: 'SummonerSnowball' // Mark (ARAM)
};

export async function getSummonerSpellIconUrl(spellId: number, version: string): Promise<string> {
  const spellKey = summonerSpellMap[spellId];
  if (!spellKey) {
    // console.warn(`[LoL Insights Debug - SummonerSpellUrl] Spell key not found for ID ${spellId}. Using placeholder.`);
    return `https://placehold.co/32x32.png?text=S${spellId}`;
  }
  const url = `https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spellKey}.png`;
  // console.log(`[LoL Insights Debug - SummonerSpellUrl] Constructed URL for spell ${spellId} (Key: ${spellKey}, Version: ${version}): ${url}`);
  return url;
}

const runeIconMap: Record<number, string> = {
  // Precision
  8005: 'perk-images/Styles/Precision/PressTheAttack/PressTheAttack.png',
  8008: 'perk-images/Styles/Precision/LethalTempo/LethalTempoTemp.png', // Note: LethalTempoTemp might be old, check DDragon
  8021: 'perk-images/Styles/Precision/FleetFootwork/FleetFootwork.png',
  8010: 'perk-images/Styles/Precision/Conqueror/Conqueror.png',
  // Domination
  8112: 'perk-images/Styles/Domination/Electrocute/Electrocute.png',
  8124: 'perk-images/Styles/Domination/Predator/Predator.png',
  8128: 'perk-images/Styles/Domination/DarkHarvest/DarkHarvest.png',
  9923: 'perk-images/Styles/Domination/HailOfBlades/HailOfBlades.png',
  // Sorcery
  8214: 'perk-images/Styles/Sorcery/SummonAery/SummonAery.png',
  8229: 'perk-images/Styles/Sorcery/ArcaneComet/ArcaneComet.png',
  8230: 'perk-images/Styles/Sorcery/PhaseRush/PhaseRush.png',
  // Resolve
  8437: 'perk-images/Styles/Resolve/GraspOfTheUndying/GraspOfTheUndying.png',
  8439: 'perk-images/Styles/Resolve/VeteranAftershock/VeteranAftershock.png', // Aftershock
  8465: 'perk-images/Styles/Resolve/Guardian/Guardian.png',
  // Inspiration
  8351: 'perk-images/Styles/Inspiration/GlacialAugment/GlacialAugment.png',
  8360: 'perk-images/Styles/Inspiration/UnsealedSpellbook/UnsealedSpellbook.png',
  8369: 'perk-images/Styles/Inspiration/FirstStrike/FirstStrike.png',
  // Rune Tree/Path Icons (Primary Style IDs)
  8000: 'perk-images/Styles/7201_Precision.png',
  8100: 'perk-images/Styles/7200_Domination.png',
  8200: 'perk-images/Styles/7202_Sorcery.png',
  8300: 'perk-images/Styles/7203_Whimsy.png', // Inspiration
  8400: 'perk-images/Styles/7204_Resolve.png'
  // Add more specific runes if needed, or fetch runesReforged.json
};

export async function getRuneIconUrl(runeId: number, _version?: string): Promise<string> {
  // Rune icons are generally not versioned in their direct DDragon path like champions/items.
  // The paths in runeIconMap point to static locations within cdn/img/.
  const iconPath = runeIconMap[runeId];
  if (!iconPath) {
    // console.warn(`[LoL Insights Debug - RuneIconUrl] Icon path not found for rune ID ${runeId}. Using placeholder.`);
    return `https://placehold.co/32x32.png?text=R${runeId}`;
  }
  // The version parameter is typically not used for rune icon paths in DDragon.
  const url = `https://ddragon.leagueoflegends.com/cdn/img/${iconPath}`;
  // console.log(`[LoL Insights Debug - RuneIconUrl] Constructed URL for rune ${runeId} (Path: ${iconPath}): ${url}`);
  return url;
}

// --- Utility Functions ---

export const getQueueName = (queueId: number): string => {
  const map: Record<number, string> = {
    0: "Custom", 400: "Normal Draft", 420: "Ranked Solo/Duo",
    430: "Normal Blind", 440: "Ranked Flex", 450: "ARAM",
    480: "Swiftplay", 
    700: "Clash", 830: "Co-op vs AI Intro", 840: "Co-op vs AI Beginner",
    850: "Co-op vs AI Intermediate", 900: "URF", 1020: "One for All",
    1300: "Nexus Blitz", 1400: "Ultimate Spellbook", 1700: "Arena",
    1900: "Pick URF", 2000: "Tutorial 1", 2010: "Tutorial 2",
    2020: "Tutorial 3", 720: "ARAM Clash",
  };
  return map[queueId] || `Queue ${queueId}`;
};

export function formatGameDuration(durationInSeconds: number): string {
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = durationInSeconds % 60;
  return `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;
}

export function formatGameCreationTime(timestamp: number): string {
  if (!timestamp) return 'Unknown time';
  try {
    return formatDistanceToNowStrict(new Date(timestamp), { addSuffix: true });
  } catch (error) {
    // console.error(`[LoL Insights Debug - DataDragon] Error formatting game creation time for timestamp ${timestamp}:`, error);
    return "Invalid date";
  }
}
