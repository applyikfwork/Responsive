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

Based on the URL and the error message, determine if the website is likely blocked due to security restrictions (like X-Frame-Options or Content-Security-Policy).

URL: {{{url}}}
Error Message: {{{errorMessage}}}

Provide a clear, plain-language explanation of the issue, suitable for a non-technical user.  Be specific about the security restriction that is likely in place.

Set isBlocked to true if you believe the website is blocked, and false otherwise.
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
