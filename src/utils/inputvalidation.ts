import { z } from "zod";

// Input validation schema
export const analyzeSchema = z.object({
    text: z.string()
      .min(10, 'Text must be at least 10 characters long')
      .max(10000, 'Text must not exceed 10,000 characters')
      .refine(text => text.trim().length > 0, 'Text cannot be empty or whitespace only')
  });