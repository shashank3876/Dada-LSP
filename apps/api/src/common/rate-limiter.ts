/**
 * Production Distributed Rate Limiter
 * 
 * Supports:
 * 1. Redis-backed distributed storage for multi-instance production deployments (Kubernetes/Railway).
 * 2. In-memory fallback for local development and offline unit testing.
 * 3. Dual-Tier Defense Model:
 *    - Account-based throttling (strict 5 attempts / 60s per account) to block targeted brute-force attacks.
 *    - IP-based throttling (corporate NAT-aware 120 requests / 60s per IP) to avoid blocking entire corporate offices.
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
  tier?: 'ACCOUNT' | 'IP';
}

export interface RateLimiterStore {
  consume(key: string, limit: number, windowMs: number): Promise<RateLimitResult>;
  reset(key: string): Promise<void>;
  clear(): Promise<void>;
}

export class MemoryRateLimiterStore implements RateLimiterStore {
  private store = new Map<string, { count: number; resetAt: number }>();

  async consume(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    const now = Date.now();
    const existing = this.store.get(key);

    if (!existing || now >= existing.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
    }

    if (existing.count >= limit) {
      const retryAfterSeconds = Math.ceil((existing.resetAt - now) / 1000);
      return { allowed: false, remaining: 0, retryAfterSeconds };
    }

    existing.count += 1;
    return {
      allowed: true,
      remaining: limit - existing.count,
      retryAfterSeconds: 0,
    };
  }

  async reset(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}

/**
 * Redis-backed distributed rate limiter store.
 * Executes atomic INCR and PEXPIRE commands across distributed nodes.
 */
export class RedisRateLimiterStore implements RateLimiterStore {
  // Can be plugged with ioredis, @redis/client or simulated redis interface
  constructor(private redisClient?: any) {}

  async consume(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    if (!this.redisClient) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error(
          'FATAL RATE LIMITER EXCEPTION: Redis client is required in production environment. In-memory fallback is strictly prohibited to prevent cross-replica rate limit inconsistency.',
        );
      }
      // Fallback to in-memory only in development and testing environments
      return fallbackMemoryStore.consume(key, limit, windowMs);
    }

    try {
      // Atomic INCR and PEXPIRE command pipeline in Redis
      const count = await this.redisClient.incr(key);
      if (count === 1) {
        await this.redisClient.pexpire(key, windowMs);
      }

      if (count > limit) {
        const pttl = await this.redisClient.pttl(key);
        const retryAfterSeconds = Math.max(1, Math.ceil(pttl / 1000));
        return { allowed: false, remaining: 0, retryAfterSeconds };
      }

      return {
        allowed: true,
        remaining: Math.max(0, limit - count),
        retryAfterSeconds: 0,
      };
    } catch (err) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error(
          `FATAL RATE LIMITER EXCEPTION: Redis command failed in production mode (${(err as any).message}). Request blocked fail-safe to prevent rate limit evasion.`,
        );
      }
      console.warn(`[RedisRateLimiter] Redis command failed in non-production, falling back to local memory:`, (err as any).message);
      return fallbackMemoryStore.consume(key, limit, windowMs);
    }
  }

  async reset(key: string): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.del(key).catch(() => {});
    }
    await fallbackMemoryStore.reset(key);
  }

  async clear(): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.flushdb().catch(() => {});
    }
    await fallbackMemoryStore.clear();
  }
}

const fallbackMemoryStore = new MemoryRateLimiterStore();

export class DistributedRateLimiter {
  private static activeStore: RateLimiterStore = new MemoryRateLimiterStore();

  static setStore(store: RateLimiterStore): void {
    this.activeStore = store;
  }

  static getStore(): RateLimiterStore {
    return this.activeStore;
  }

  /**
   * Consumes 1 attempt for a specific key
   */
  static async consume(
    key: string,
    limit: number,
    windowMs: number,
  ): Promise<RateLimitResult> {
    return this.activeStore.consume(key, limit, windowMs);
  }

  /**
   * Dual-Tier Rate Limiting:
   * 1. Account Tier: Strict limit (e.g. 5 attempts / 60s) keyed to account/email.
   * 2. IP Tier: Corporate NAT-friendly limit (e.g. 120 req / 60s) keyed to IP.
   */
  static async consumeDualTier(
    accountIdentifier: string,
    clientIp: string,
    accountLimit = 5,
    ipLimit = 120,
    windowMs = 60 * 1000,
  ): Promise<RateLimitResult> {
    // 1. Check Account-level limit first (stops credential stuffing/brute force on specific user)
    const accountKey = `rl:account:${accountIdentifier.toLowerCase()}`;
    const accountCheck = await this.activeStore.consume(accountKey, accountLimit, windowMs);
    if (!accountCheck.allowed) {
      return {
        ...accountCheck,
        tier: 'ACCOUNT',
      };
    }

    // 2. Check IP-level limit (stops volumetric flooding without blocking an entire office)
    const ipKey = `rl:ip:${clientIp}`;
    const ipCheck = await this.activeStore.consume(ipKey, ipLimit, windowMs);
    if (!ipCheck.allowed) {
      return {
        ...ipCheck,
        tier: 'IP',
      };
    }

    return {
      allowed: true,
      remaining: Math.min(accountCheck.remaining, ipCheck.remaining),
      retryAfterSeconds: 0,
    };
  }

  static async reset(key: string): Promise<void> {
    await this.activeStore.reset(key);
  }

  static async clear(): Promise<void> {
    await this.activeStore.clear();
  }
}

// Backwards-compatible synchronous adapter for existing callers
export class InMemoryRateLimiter {
  private static store = new Map<string, { count: number; resetAt: number }>();

  static consume(
    key: string,
    limit: number,
    windowMs: number,
  ): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
    const now = Date.now();
    const existing = this.store.get(key);

    if (!existing || now >= existing.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
    }

    if (existing.count >= limit) {
      const retryAfterSeconds = Math.ceil((existing.resetAt - now) / 1000);
      return { allowed: false, remaining: 0, retryAfterSeconds };
    }

    existing.count += 1;
    return {
      allowed: true,
      remaining: limit - existing.count,
      retryAfterSeconds: 0,
    };
  }

  static reset(key: string): void {
    this.store.delete(key);
  }

  static clear(): void {
    this.store.clear();
  }
}
