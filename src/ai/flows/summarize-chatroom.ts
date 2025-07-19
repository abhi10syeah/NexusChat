// SummarizeChatroom implements an AI tool to automatically summarize the last 20 messages in a chatroom upon user request.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeChatroomInputSchema = z.object({
  messages: z
    .array(z.string())
    .describe('The last 20 messages in the chatroom.'),
});
export type SummarizeChatroomInput = z.infer<typeof SummarizeChatroomInputSchema>;

const SummarizeChatroomOutputSchema = z.object({
  summary: z.string().describe('A short summary of the chatroom messages.'),
});
export type SummarizeChatroomOutput = z.infer<typeof SummarizeChatroomOutputSchema>;

export async function summarizeChatroom(input: SummarizeChatroomInput): Promise<SummarizeChatroomOutput> {
  return summarizeChatroomFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeChatroomPrompt',
  input: {schema: SummarizeChatroomInputSchema},
  output: {schema: SummarizeChatroomOutputSchema},
  prompt: `You are an AI assistant tasked with summarizing chatroom conversations.

  The following is a list of the last 20 messages in the chatroom:

  {{#each messages}}
  - {{{this}}}
  {{/each}}

  Please provide a concise summary of the main topics discussed in the messages.
  The summary should be no more than 5 sentences long.
  `,
});

const summarizeChatroomFlow = ai.defineFlow(
  {
    name: 'summarizeChatroomFlow',
    inputSchema: SummarizeChatroomInputSchema,
    outputSchema: SummarizeChatroomOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
