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
  prompt: `You are a helpful assistant for a website preview tool. A user is trying to preview a URL in an iframe, but it's not loading.

Your task is to explain that the website cannot be displayed because of its own security settings. This is not a bug with the preview tool.

Analyze the provided URL and error message.

URL: {{{url}}}
Error Message: {{{errorMessage}}}

**Instructions:**
1.  Set \`isBlocked\` to \`true\`.
2.  Write a concise, friendly, and easy-to-understand \`explanation\`.
3.  Directly state that the website at {{{url}}} has security settings (like 'X-Frame-Options' or 'Content-Security-Policy') that block it from being shown in tools like this one.
4.  Make it clear this is a deliberate security choice by that website and not something our tool can bypass.

**Example Explanation:**
"The website at {{{url}}} cannot be displayed because its security settings (specifically 'X-Frame-Options' or 'Content-Security-Policy') prevent it from being embedded in other websites. This is a security feature of that site, not a limitation of our tool."
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
