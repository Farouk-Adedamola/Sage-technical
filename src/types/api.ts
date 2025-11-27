export interface AnalyzeRequest {
  text: string;
}

export interface AnalyzeResponse {
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  keywords: string[];
}

export interface ErrorResponse {
  error: string;
  timestamp: string;
  stack?: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
}
