export interface GuardrailResult {
  safe: boolean;
  reason?: string;
  sanitized: string;
}
export interface RateLimiterConfig {
  maxRequests: number;
  windowMs: number;
}
export class RateLimiter {
  private timestamps: number[] = [];
  constructor(private config: RateLimiterConfig) {}
  check(): boolean {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    this.timestamps = this.timestamps.filter((t) => t > windowStart);
    if (this.timestamps.length >= this.config.maxRequests) {
      return false;
    }
    this.timestamps.push(now);
    return true;
  }
}
