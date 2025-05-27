
'use server';
/**
 * @fileOverview A League of Legends coaching AI agent.
 *
 * - getLolCoachResponse - A function that handles LoL coaching queries.
 * - LolCoachInput - The input type for the getLolCoachResponse function.
 * - LolCoachOutput - The return type for the getLolCoachResponse function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const LolCoachInputSchema = z.object({
  userMessage: z.string().describe('The user query or message related to League of Legends.'),
});
export type LolCoachInput = z.infer<typeof LolCoachInputSchema>;

const LolCoachOutputSchema = z.object({
  coachResponse: z.string().describe('The AI coach\'s response to the user\'s query.'),
});
export type LolCoachOutput = z.infer<typeof LolCoachOutputSchema>;

export async function getLolCoachResponse(input: LolCoachInput): Promise<LolCoachOutput> {
  return lolCoachFlow(input);
}

const prompt = ai.definePrompt({
  name: 'lolCoachPrompt',
  input: { schema: LolCoachInputSchema },
  output: { schema: LolCoachOutputSchema },
  prompt: `You are an expert League of Legends coach and analyst named "Coach Gemini".
Your knowledge is strictly limited to League of Legends champions, items, strategies, gameplay, runes, masteries, professional play, and patch notes.
You MUST NOT discuss any topics outside of League of Legends.
If the user asks about anything other than League of Legends, you must politely state that you can only discuss League of Legends topics and, if possible, try to gently guide the conversation back to the game.
For example, if asked "What's the weather like?", you could say: "I can only discuss League of Legends. Perhaps we could talk about how map objectives change with different elemental drakes?"

User's message: {{{userMessage}}}

Provide a helpful, insightful, and encouraging response related to League of Legends. Be specific if the user provides details about their game or champions.
Address the user directly.
Keep your responses concise and focused on the user's query.
Do not ask follow-up questions unless it's essential for clarification on a very vague LoL-related query.
`,
});

const lolCoachFlow = ai.defineFlow(
  {
    name: 'lolCoachFlow',
    inputSchema: LolCoachInputSchema,
    outputSchema: LolCoachOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      return { coachResponse: "I'm sorry, I encountered an issue and can't provide a response right now." };
    }
    return output;
  }
);
