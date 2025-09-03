'use server';

/**
 * @fileOverview Detects when a website refuses to load in an iframe due to security restrictions.
 *
 * - intelligentErrorReporting - A function that handles the error reporting process.
 * - IntelligentErrorReportingInput - The input type for the intelligentErrorReporting function.
 * - IntelligentErrorReportingOutput - The return type for the intelligentErrorReporting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IntelligentErrorReportingInputSchema = z.object({
  url: z.string().describe('The URL of the website to check.'),
  errorMessage: z.string().describe('The error message received when trying to load the website in an iframe.'),
});
export type IntelligentErrorReportingInput = z.infer<typeof IntelligentErrorReportingInputSchema>;

const IntelligentErrorReportingOutputSchema = z.object({
  isBlocked: z.boolean().describe('Whether the website is likely blocked due to security restrictions.'),
  explanation: z.string().describe('A plain-language explanation of why the website might be blocked.'),
});
export type IntelligentErrorReportingOutput = z.infer<typeof IntelligentErrorReportingOutputSchema>;

export async function intelligentErrorReporting(input: IntelligentErrorReportingInput): Promise<IntelligentErrorReportingOutput> {
  return intelligentErrorReportingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'intelligentErrorReportingPrompt',
  input: {schema: IntelligentErrorReportingInputSchema},
  output: {schema: IntelligentErrorReportingOutputSchema},
  prompt: `You are an expert web security analyst. A user tried to load a website in an iframe, but it failed.

Your goal is to explain why it failed in simple, non-technical terms. The most common reasons are the website's 'X-Frame-Options' or 'Content-Security-Policy' settings.

Analyze the provided URL and error message.

URL: {{{url}}}
Error Message: {{{errorMessage}}}

**Instructions:**
1.  Set \`isBlocked\` to \`true\` if you are confident the site is blocked by security policies.
2.  Write a concise, friendly, and easy-to-understand \`explanation\`.
3.  Focus on the key takeaway: "This website has security settings that prevent it from being shown inside other websites."
4.  Mentioning 'X-Frame-Options' or 'Content-Security-Policy' as the likely cause is good, but keep the explanation simple.

**Example good explanation:**
"The website at {{{url}}} has security settings (likely X-Frame-Options or Content-Security-Policy) that prevent it from being displayed inside other websites, including this preview tool."
`,
});

const intelligentErrorReportingFlow = ai.defineFlow(
  {
    name: 'intelligentErrorReportingFlow',
    inputSchema: IntelligentErrorReportingInputSchema,
    outputSchema: IntelligentErrorReportingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
