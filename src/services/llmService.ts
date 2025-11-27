import OpenAI from 'openai';
import { AnalyzeResponse } from '../types/api';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class LLMService {
  private static readonly MAX_TOKENS = 1000;
  private static readonly MODEL = 'gpt-3.5-turbo';

  static async analyzeText(text: string): Promise<AnalyzeResponse> {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = this.buildAnalysisPrompt(text);

    try {
      const response = await openai.chat.completions.create({
        model: this.MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: this.MAX_TOKENS,
        temperature: 0.3, 
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI API');
      }

      return this.parseAnalysisResponse(content);
    } catch (error) {
      console.error('OpenAI API error:', error);

      // Handle specific OpenAI errors with user-friendly messages
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('billing')) {
          throw new Error('OpenAI API quota exceeded');
        }
        if (errorMessage.includes('401') || errorMessage.includes('unauthorized') || errorMessage.includes('invalid api key')) {
          throw new Error('Invalid OpenAI API key');
        }

        //permissions error
        if (errorMessage.includes('403') || errorMessage.includes('forbidden')) {
          throw new Error('OpenAI API access forbidden.');
        }
        if (errorMessage.includes('500') || errorMessage.includes('502') || errorMessage.includes('503')) {
          throw new Error('OpenAI API service temporarily unavailable. Please try again later');
        }
      }

      throw new Error('Failed to analyze text with AI service.');
    }
  }


  // LLM promtp
  private static buildAnalysisPrompt(text: string): string {
    return `Analyze the following text and provide a JSON response with exactly these three fields:
- "summary": A concise 1-2 sentence summary of the text
- "sentiment": One of "positive", "negative", or "neutral"
- "keywords": An array of exactly 3 relevant keywords extracted from the text

Text to analyze:
"${text}"

Respond with valid JSON only, no additional text or formatting.`;
  }

  private static parseAnalysisResponse(content: string): AnalyzeResponse {
    try {
      // Clean the response by removing potential markdown formatting
      const cleanedContent = content.replace(/```json\s*|\s*```/g, '').trim();

      const parsed = JSON.parse(cleanedContent);

      // Validate the response structure
      if (!parsed.summary || typeof parsed.summary !== 'string') {
        throw new Error('Invalid summary in response');
      }

      if (!['positive', 'negative', 'neutral'].includes(parsed.sentiment)) {
        throw new Error('Invalid sentiment value');
      }

      if (!Array.isArray(parsed.keywords) || parsed.keywords.length !== 3) {
        throw new Error('Keywords must be an array of exactly 3 strings');
      }

      // Ensure all keywords are strings
      parsed.keywords = parsed.keywords.map((kw: any) => String(kw));

      return parsed as AnalyzeResponse;
    } catch (error) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid response format from AI service');
    }
  }
}
