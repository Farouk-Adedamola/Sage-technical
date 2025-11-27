import request from 'supertest';
import app from '../src/index';

// Mock the LLM service
jest.mock('../src/services/llmService', () => ({
  LLMService: {
    analyzeText: jest.fn()
  }
}));

import { LLMService } from '../src/services/llmService';

const mockAnalyzeText = LLMService.analyzeText as jest.MockedFunction<typeof LLMService.analyzeText>;

describe('/api/analyze endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/analyze', () => {
    it('should successfully analyze text and return expected response', async () => {
      const mockResponse = {
        summary: 'This is a test summary of the provided text.',
        sentiment: 'positive' as const,
        keywords: ['test', 'summary', 'analysis']
      };

      mockAnalyzeText.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/analyze')
        .send({
          text: 'This is a sample text for testing the API endpoint functionality.'
        })
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(mockAnalyzeText).toHaveBeenCalledWith('This is a sample text for testing the API endpoint functionality.');
      expect(mockAnalyzeText).toHaveBeenCalledTimes(1);
    });

    it('should return 400 for text shorter than minimum length', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({
          text: 'Short'
        })
        .expect(400);

      expect(response.body.error).toContain('Text must be at least 10 characters long');
      expect(mockAnalyzeText).not.toHaveBeenCalled();
    });

    it('should return 400 for empty text', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({
          text: ''
        })
        .expect(400);

      expect(response.body.error).toContain('Text cannot be empty');
      expect(mockAnalyzeText).not.toHaveBeenCalled();
    });

    it('should return 400 for whitespace-only text', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({
          text: '   \n\t   '
        })
        .expect(400);

      expect(response.body.error).toContain('Text cannot be empty');
      expect(mockAnalyzeText).not.toHaveBeenCalled();
    });

    it('should return 400 for text exceeding maximum length', async () => {
      const longText = 'a'.repeat(10001);

      const response = await request(app)
        .post('/api/analyze')
        .send({
          text: longText
        })
        .expect(400);

      expect(response.body.error).toContain('Text must not exceed 10,000 characters');
      expect(mockAnalyzeText).not.toHaveBeenCalled();
    });

    it('should return 400 for missing text field', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({})
        .expect(400);

      expect(response.body.error).toContain('text');
      expect(mockAnalyzeText).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid JSON', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      expect(mockAnalyzeText).not.toHaveBeenCalled();
    });

    it('should return 500 when LLM service fails', async () => {
      mockAnalyzeText.mockRejectedValue(new Error('OpenAI API error'));

      const response = await request(app)
        .post('/api/analyze')
        .send({
          text: 'This is a valid text for testing error handling.'
        })
        .expect(500);

      expect(response.body.error).toContain('OpenAI API error');
      expect(mockAnalyzeText).toHaveBeenCalledTimes(1);
    });

    it('should handle various text inputs correctly', async () => {
      const testCases = [
        {
          text: 'I love this amazing product! It works perfectly and exceeded my expectations.',
          expectedSentiment: 'positive'
        },
        {
          text: 'This product is terrible. It broke after one day and customer service was unhelpful.',
          expectedSentiment: 'negative'
        },
        {
          text: 'The product arrived on time. It functions as described in the specifications.',
          expectedSentiment: 'neutral'
        }
      ];

      for (const testCase of testCases) {
        mockAnalyzeText.mockResolvedValue({
          summary: 'Test summary',
          sentiment: testCase.expectedSentiment as 'positive' | 'negative' | 'neutral',
          keywords: ['test', 'keyword', 'analysis']
        });

        const response = await request(app)
          .post('/api/analyze')
          .send({ text: testCase.text })
          .expect(200);

        expect(response.body.sentiment).toBe(testCase.expectedSentiment);
      }
    });
  });

  describe('Rate limiting', () => {
    it('should handle rate limiting appropriately', async () => {
      // For now, will jus ensure the endpoint exists and respond
      const response = await request(app)
        .post('/api/analyze')
        .send({
          text: 'This is a test text for rate limiting check.'
        })
        .expect(200);

      expect(response.body).toHaveProperty('summary');
      expect(response.body).toHaveProperty('sentiment');
      expect(response.body).toHaveProperty('keywords');
    });
  });
});

describe('Health check endpoint', () => {
  it('should return OK status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body.status).toBe('OK');
    expect(response.body.timestamp).toBeDefined();
  });
});

describe('404 handling', () => {
  it('should return 404 for unknown routes', async () => {
    const response = await request(app)
      .post('/api/unknown')
      .expect(404);

    expect(response.body.error).toBe('Route not found');
  });
});
