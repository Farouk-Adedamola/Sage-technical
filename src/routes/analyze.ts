import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { LLMService } from '../services/llmService';
import { AnalyzeRequest, AnalyzeResponse } from '../types/api';
import { AppError } from '../middleware/errorHandler';
import { analyzeSchema } from '../utils/inputvalidation';

const router = Router();

const validateAnalyzeRequest = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const validatedData = analyzeSchema.parse(req.body);
    req.body = validatedData;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues.map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`).join(', ');
      const appError: AppError = new Error(`Validation error: ${errorMessage}`);
      appError.statusCode = 400;
      next(appError);
    } else {
      next(error);
    }
  }
};

router.post('/', validateAnalyzeRequest, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { text }: AnalyzeRequest = req.body;

    const result: AnalyzeResponse = await LLMService.analyzeText(text);

    res.json(result);
  } catch (error) {
    // LLM service errors are already handled in the service layer
    next(error);
  }
});

export { router as analyzeText };
