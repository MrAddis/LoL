
// Basic types, can be expanded as needed

export interface RiotAccountDto {
  puuid: string;
  gameName: string;
  tagLine: string;
}

export interface SummonerDto {
  id: string; // Summoner ID (Encrypted Summoner ID)
  accountId: string;
  puuid: string;
  name: string; // Summoner Name (can be different from Riot ID gameName)
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
}

export interface MatchDto {
  metadata: MatchMetadataDto;
  info: MatchInfoDto;
}

export interface MatchMetadataDto {
  dataVersion: string;
  matchId: string;
  participants: string[]; // List of PUUIDs
}

export interface MatchInfoDto {
  gameCreation: number;
  gameDuration: number;
  gameId: number;
  gameMode: string;
  gameName: string;
  gameStartTimeStamp: number;
  gameType: string;
  gameVersion: string;
  mapId: number;
  participants: ParticipantDto[];
  platformId: string;
  queueId: number;
  teams: TeamDto[];
  tournamentCode?: string;
}

export interface ParticipantDto {
  assists: number;
  baronKills: number;
  bountyLevel: number;
  champExperience: number;
  champLevel: number;
  championId: number;
  championName: string; // This is often the DDragon ID like "MissFortune"
  championTransform: number;
  consumablesPurchased: number;
  damageDealtToBuildings: number;
  damageDealtToObjectives: number;
  damageDealtToTurrets: number;
  damageSelfMitigated: number;
  deaths: number;
  detectorWardsPlaced: number;
  doubleKills: number;
  dragonKills: number;
  firstBloodAssist: boolean;
  firstBloodKill: boolean;
  firstTowerAssist: boolean;
  firstTowerKill: boolean;
  gameEndedInEarlySurrender: boolean;
  gameEndedInSurrender: boolean;
  goldEarned: number;
  goldSpent: number;
  individualPosition: string; // "TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY", "Invalid"
  inhibitorKills: number;
  inhibitorTakedowns: number;
  inhibitorsLost: number;
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number; // Trinket
  itemsPurchased: number;
  killingSprees: number;
  kills: number;
  lane: string;
  largestCriticalStrike: number;
  largestKillingSpree: number;
  largestMultiKill: number;
  longestTimeSpentLiving: number;
  magicDamageDealt: number;
  magicDamageDealtToChampions: number;
  magicDamageTaken: number;
  neutralMinionsKilled: number;
  nexusKills: number;
  nexusTakedowns: number;
  nexusLost: number;
  objectivesStolen: number;
  objectivesStolenAssists: number;
  participantId: number;
  pentaKills: number;
  perks: PerksDto;
  physicalDamageDealt: number;
  physicalDamageDealtToChampions: number;
  physicalDamageTaken: number;
  profileIcon: number;
  puuid: string;
  quadraKills: number;
  riotIdName?: string; 
  riotIdTagline?: string;
  role: string;
  sightWardsBoughtInGame: number;
  spell1Casts: number;
  spell2Casts: number;
  spell3Casts: number;
  spell4Casts: number;
  summoner1Casts: number;
  summoner1Id: number;
  summoner2Casts: number;
  summoner2Id: number;
  summonerId: string;
  summonerLevel: number;
  summonerName: string; // In-game name - can be legacy or different from riotIdName
  teamEarlySurrendered: boolean;
  teamId: number; // 100 for blue, 200 for red
  teamPosition: string; // e.g. "TOP", "JUNGLE" if not individualPosition
  timeCCingOthers: number;
  timePlayed: number;
  totalDamageDealt: number;
  totalDamageDealtToChampions: number;
  totalDamageShieldedOnTeammates: number;
  totalDamageTaken: number;
  totalHeal: number;
  totalHealsOnTeammates: number;
  totalMinionsKilled: number;
  totalTimeCCDealt: number;
  totalTimeSpentDead: number;
  totalUnitsHealed: number;
  tripleKills: number;
  trueDamageDealt: number;
  trueDamageDealtToChampions: number;
  trueDamageTaken: number;
  turretKills: number;
  turretTakedowns: number;
  turretsLost: number;
  unrealKills: number;
  visionScore: number;
  visionWardsBoughtInGame: number;
  wardsKilled: number;
  wardsPlaced: number;
  win: boolean;
}

export interface PerksDto {
  statPerks: PerkStatsDto;
  styles: PerkStyleDto[];
}

export interface PerkStatsDto {
  defense: number;
  flex: number;
  offense: number;
}

export interface PerkStyleDto {
  description: string; // "primaryStyle" or "subStyle"
  selections: PerkStyleSelectionDto[];
  style: number; // Rune path ID
}

export interface PerkStyleSelectionDto {
  perk: number; // Rune ID
  var1: number;
  var2: number;
  var3: number;
}

export interface TeamDto {
  bans: BanDto[];
  objectives: ObjectivesDto;
  teamId: number; // 100 or 200
  win: boolean;
}

export interface BanDto {
  championId: number;
  pickTurn: number;
}

export interface ObjectivesDto {
  baron: ObjectiveDto;
  champion: ObjectiveDto;
  dragon: ObjectiveDto;
  inhibitor: ObjectiveDto;
  riftHerald: ObjectiveDto;
  tower: ObjectiveDto;
}

export interface ObjectiveDto {
  first: boolean;
  kills: number;
}

export interface DDragonVersion {
  versions: string[];
}

// Types for League Entries (Ranked Information)
export interface LeagueEntryDto {
  leagueId: string;
  summonerId: string; // Encrypted summoner ID
  summonerName: string;
  queueType: string; // e.g., "RANKED_SOLO_5x5", "RANKED_FLEX_SR"
  tier: string; // e.g., "GOLD", "DIAMOND", "IRON", "UNRANKED" (though unranked typically means no entry)
  rank: string; // Roman numeral for division, e.g., "I", "IV"
  leaguePoints: number;
  wins: number;
  losses: number;
  hotStreak: boolean;
  veteran: boolean;
  freshBlood: boolean;
  inactive: boolean;
  miniSeries?: MiniSeriesDto;
}

export interface MiniSeriesDto {
  losses: number;
  progress: string; // e.g., "WLN" (Win, Loss, No result)
  target: number; // Number of wins required
  wins: number;
}

// Types for Champion Mastery
export interface ChampionMasteryDto {
  championId: number;
  championLevel: number;
  championPoints: number;
  lastPlayTime: number;
  championPointsSinceLastLevel: number;
  championPointsUntilNextLevel: number;
  chestGranted: boolean;
  tokensEarned: number;
  summonerId: string;
}

export interface TopChampionMasteryEntry {
  championId: number;
  championName: string; // This will be the DDragon ID, e.g. "MissFortune"
  championLevel: number;
  championPoints: number;
}

// Extended summoner data type for our API response
export interface ExtendedSummonerData extends SummonerDto {
  gameName: string; 
  tagLine: string;  
  tier?: string;
  division?: string;
  topMasteries?: TopChampionMasteryEntry[];
}

// For aggregated stats
export interface ChampionStatInfo {
  championId: number; 
  championName: string; // DDragon ID
  gamesPlayed: number;
  wins: number;
  winRate: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
}
export interface AggregatedPlayerStats {
  mostPlayedChampionOverall?: { name: string; iconId: number; games: number }; 
  winRateOverall?: number;
  averageKDAOverall?: { kills: number; deaths: number; assists: number };
  kdaString?: string; // e.g., "2.77 KDA" or "K/D/A" string
  totalGames?: number;
  topChampionsStats?: ChampionStatInfo[]; // For sidebar and overall stats bar
}

    