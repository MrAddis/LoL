
// Try to get the API key from environment variables first
const apiKeyFromEnv = process.env.RIOT_API_KEY;

// Fallback API key if the environment variable is not set or is empty
const FALLBACK_RIOT_API_KEY = "RGAPI-6697ea52-0bb0-4254-9352-d509d9ef6804";

export const RIOT_API_KEY = (apiKeyFromEnv && apiKeyFromEnv.trim() !== '') ? apiKeyFromEnv : FALLBACK_RIOT_API_KEY;

// Hardcoded regions for EUW
export const RIOT_API_REGION_ACCOUNT = 'europe'; // For Account API v1
export const RIOT_API_REGION_SUMMONER = 'euw1';   // For Summoner API v4 (EUW1)
export const RIOT_API_REGION_MATCH = 'europe';   // For Match API v5 (Europe)

export const DDRAGON_BASE_URL = 'https://ddragon.leagueoflegends.com';

if (process.env.NODE_ENV !== 'production') {
  if (!apiKeyFromEnv || apiKeyFromEnv.trim() === '') {
    console.warn(
      `[LoL Insights - WARNING] RIOT_API_KEY environment variable is not set or is empty. ` +
      `Using fallback API key. ` +
      `This key may be expired or rate-limited. For reliable operation, please set RIOT_API_KEY in your .env.local file. ` +
      `Development keys from Riot Developer Portal expire daily.`
    );
  } else if (RIOT_API_KEY === FALLBACK_RIOT_API_KEY && apiKeyFromEnv !== FALLBACK_RIOT_API_KEY) {
    // This case should ideally not be hit if apiKeyFromEnv is prioritized correctly
    console.warn(
      `[LoL Insights - WARNING] RIOT_API_KEY from environment ("${apiKeyFromEnv}") was not used. ` +
      `Falling back to hardcoded key. Please check configuration.`
    );
  }
}
