
// src/lib/debug-utils.ts
import type { MatchInfoDto, ParticipantDto } from '@/types/riot-api-types';

const isValidString = (str: any): str is string => typeof str === 'string' && str.trim() !== '';

interface NameVerificationResult {
  Succeeded: boolean;
  Log: string[];
  FoundMainPlayerName: boolean;
}

export function verifyParticipantNames(matchInfo: MatchInfoDto, playerPuuid: string): NameVerificationResult {
  const result: NameVerificationResult = {
    Succeeded: true,
    Log: [],
    FoundMainPlayerName: false,
  };

  if (!matchInfo || !matchInfo.participants || matchInfo.participants.length === 0) {
    result.Succeeded = false;
    result.Log.push('[NameVerify CRITICAL] Participants array is missing, null, or empty.');
    // console.log(`[DEBUG PAGE - NameVerify CRITICAL @ ${Date.now()}] Participants array is missing, null, or empty for a match.`);
    return result;
  }

  const timestamp = Date.now();
  // result.Log.push(`[DEBUG PAGE - NameVerify - MatchID_Placeholder @ ${timestamp}] Starting name integrity check for ${matchInfo.participants.length} participants.`);

  let allParticipantNamesValid = true;

  matchInfo.participants.forEach((participant, index) => {
    let currentParticipantNameValid = false;
    const pRiotIdName = participant.riotIdGameName;
    const pRiotIdTagline = participant.riotIdTagline;
    const pSummonerName = participant.summonerName;

    if (isValidString(pRiotIdName)) {
      currentParticipantNameValid = true;
    } else if (isValidString(pSummonerName)) {
      currentParticipantNameValid = true;
    }

    if (!currentParticipantNameValid) {
      allParticipantNamesValid = false;
      // Simplified logging for now
      // result.Log.push(`  [PARTICIPANT_FAIL Index: ${index}] Name check failed. PUUID: ${participant.puuid}, Champion: ${participant.championName}`);
      // result.Log.push(`    API riotIdGameName: "${pRiotIdName}", API riotIdTagline: "${pRiotIdTagline}", API summonerName: "${pSummonerName}"`);
    }

    if (participant.puuid === playerPuuid) {
      result.FoundMainPlayerName = currentParticipantNameValid;
      // if (!currentParticipantNameValid) {
      //   result.Log.push(`  [MainPlayer Check - FAIL] Main player (PUUID: ${playerPuuid}) name is MISSING/INVALID.`);
      // }
    }
  });

  if (!allParticipantNamesValid) {
    result.Succeeded = false;
    // result.Log.push('[NameVerify SUMMARY] At least one participant has a missing/invalid name.');
  }

  if (!result.FoundMainPlayerName && matchInfo.participants.some(p => p.puuid === playerPuuid)) {
      result.Succeeded = false;
      // result.Log.push(`[NameVerify CRITICAL] Main player (PUUID: ${playerPuuid}) was present but their name could not be verified.`);
  }
  
  // console.log(`[DEBUG PAGE - NameVerify - MatchID_Placeholder @ ${Date.now()}] Finished. Succeeded: ${result.Succeeded}, FoundMainPlayerName: ${result.FoundMainPlayerName}`);
  return result;
}
