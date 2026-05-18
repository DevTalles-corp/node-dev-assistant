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
  reset(): void {
    this.timestamps = [];
  }
  get remaining(): number {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    const active = this.timestamps.filter((t) => t > windowStart).length;
    return Math.max(0, this.config.maxRequests - active);
  }
}
const INJECTION_PATTERNS: Array<{ name: string; regex: RegExp }> = [
  // --- Inglés ---
  {
    name: "ignore instructions",
    regex: /ignore\s+(?:\w+\s+){0,3}instructions?/i,
  },
  {
    name: "forget instructions",
    regex:
      /forget\s+(everything|all|your\s+instructions?|what\s+you\s+were\s+told)/i,
  },
  {
    name: "you are now",
    regex: /you\s+are\s+now\s+/i,
  },
  {
    name: "act as",
    regex: /act\s+as\s+(if\s+)?you\s+(are|were)\s+/i,
  },
  {
    name: "disregard",
    regex: /disregard\s+(your|all|previous|the)\s+/i,
  },
  {
    name: "new instructions",
    regex: /new\s+instructions?\s*:/i,
  },
  {
    name: "system override",
    regex: /system\s*:?\s*you\s+/i,
  },
  {
    name: "override system prompt",
    regex: /override\s+(the\s+)?(system\s+prompt|your\s+instructions?)/i,
  },

  // --- Español ---
  {
    name: "ignorar instrucciones (es)",
    regex:
      /ignora\s+(las\s+)?(instrucciones?\s+)?(anteriores?|previas?|todas?)/i,
  },
  {
    name: "olvida instrucciones (es)",
    regex:
      /olvida\s+(todo|las\s+instrucciones?|lo\s+que\s+te\s+(dijeron|indicaron))/i,
  },
  {
    name: "ahora eres (es)",
    regex: /ahora\s+(eres|serás|actúas?\s+como)\s+/i,
  },
  {
    name: "actúa como (es)",
    regex: /actúa\s+(como\s+si\s+)?(fueras?|eres)\s+/i,
  },
  {
    name: "nuevas instrucciones (es)",
    regex: /nuevas?\s+instrucciones?\s*:/i,
  },
  {
    name: "ignora todo (es)",
    regex: /ignora\s+todo\s+(lo\s+anterior|lo\s+que\s+)/i,
  },
  {
    name: "eres libre (es)",
    regex: /eres\s+libre\s+(de|para)\s+/i,
  },
  {
    name: "sin restricciones (es)",
    regex: /sin\s+(ninguna\s+)?(restricci[oó]n|l[ií]mite|instrucci[oó]n)/i,
  },
];
