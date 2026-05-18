export interface GuardrailResult {
  safe: boolean;
  reason?: string;
  sanitized: string;
}
export interface RateLimiterConfig {
  maxRequests: number;
  windowMs: number;
}
