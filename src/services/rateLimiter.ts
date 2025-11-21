interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // Time window in milliseconds
  blockDurationMs: number; // How long to block after exceeding limit
  ipWhitelist?: string[];
  endpoints?: string[];
}

interface RequestRecord {
  timestamp: number;
  count: number;
  blockedUntil?: number;
}

class RateLimiter {
  private config: RateLimitConfig;
  private requests: Map<string, RequestRecord> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor(config: RateLimitConfig) {
    this.config = config;

    // Cleanup old records every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  /**
   * Check if a request from the given identifier should be allowed
   */
  public isAllowed(identifier: string, endpoint?: string): boolean {
    // Check IP whitelist
    if (this.config.ipWhitelist?.includes(identifier)) {
      return true;
    }

    // Check endpoint-specific rules (if configured)
    if (endpoint && this.config.endpoints && !this.config.endpoints.includes(endpoint)) {
      return true; // If endpoint not in restricted list, allow
    }

    const record = this.requests.get(identifier);
    const now = Date.now();

    // If currently blocked
    if (record?.blockedUntil && now < record.blockedUntil) {
      return false;
    }

    // If no record exists or window has expired, create new record
    if (!record || now - record.timestamp >= this.config.windowMs) {
      this.requests.set(identifier, {
        timestamp: now,
        count: 1,
      });
      return true;
    }

    // Increment counter
    record.count++;

    // Check if limit exceeded
    if (record.count > this.config.maxRequests) {
      // Block the identifier
      record.blockedUntil = now + this.config.blockDurationMs;
      this.requests.set(identifier, record);
      return false;
    }

    return true;
  }

  /**
   * Get current status for an identifier
   */
  public getStatus(identifier: string): {
    requestsInWindow: number;
    windowRemainingMs: number;
    isBlocked: boolean;
    blockedRemainingMs: number;
  } {
    const record = this.requests.get(identifier);
    const now = Date.now();

    if (!record) {
      return {
        requestsInWindow: 0,
        windowRemainingMs: this.config.windowMs,
        isBlocked: false,
        blockedRemainingMs: 0,
      };
    }

    const timeInWindow = now - record.timestamp;
    const windowRemainingMs = Math.max(0, this.config.windowMs - timeInWindow);

    if (record.blockedUntil && now < record.blockedUntil) {
      return {
        requestsInWindow: record.count,
        windowRemainingMs: 0, // Reset when blocked
        isBlocked: true,
        blockedRemainingMs: record.blockedUntil - now,
      };
    }

    return {
      requestsInWindow: record.count,
      windowRemainingMs,
      isBlocked: false,
      blockedRemainingMs: 0,
    };
  }

  /**
   * Reset rate limit for an identifier (for admin purposes)
   */
  public reset(identifier: string): void {
    this.requests.delete(identifier);
  }

  /**
   * Get all currently blocked identifiers
   */
  public getBlockedIdentifiers(): Array<{ identifier: string; remainingMs: number }> {
    const now = Date.now();
    const blocked: Array<{ identifier: string; remainingMs: number }> = [];

    for (const [identifier, record] of this.requests.entries()) {
      if (record.blockedUntil && now < record.blockedUntil) {
        blocked.push({
          identifier,
          remainingMs: record.blockedUntil - now,
        });
      }
    }

    return blocked;
  }

  /**
   * Get rate limit statistics
   */
  public getStats() {
    const now = Date.now();
    let totalRequests = 0;
    let activeBlocks = 0;
    let expiredRecords = 0;

    for (const record of this.requests.values()) {
      totalRequests += record.count;

      if (record.blockedUntil && now < record.blockedUntil) {
        activeBlocks++;
      }

      if (!record.blockedUntil && now - record.timestamp >= this.config.windowMs) {
        expiredRecords++;
      }
    }

    return {
      totalTrackedIdentifiers: this.requests.size,
      totalRequests,
      activeBlocks,
      expiredRecords,
      windowMs: this.config.windowMs,
      maxRequests: this.config.maxRequests,
      blockDurationMs: this.config.blockDurationMs,
    };
  }

  /**
   * Clean up expired records
   */
  private cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [identifier, record] of this.requests.entries()) {
      // Remove if window expired and not blocked
      if (!record.blockedUntil && now - record.timestamp >= this.config.windowMs) {
        toDelete.push(identifier);
      }

      // Remove if block expired and no requests in current window
      if (record.blockedUntil && now >= record.blockedUntil && now - record.timestamp >= this.config.windowMs) {
        toDelete.push(identifier);
      }
    }

    toDelete.forEach(identifier => this.requests.delete(identifier));
  }

  /**
   * Destroy the rate limiter and cleanup resources
   */
  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.requests.clear();
  }
}

// Create rate limiter instances for different purposes

// API Rate Limiter - Strict limits for API endpoints
export const apiRateLimiter = new RateLimiter({
  maxRequests: 100, // 100 requests
  windowMs: 15 * 60 * 1000, // per 15 minutes
  blockDurationMs: 60 * 60 * 1000, // block for 1 hour
  endpoints: ['/api/'], // Apply to API endpoints
});

// Login Rate Limiter - More strict for auth endpoints
export const authRateLimiter = new RateLimiter({
  maxRequests: 5, // 5 attempts
  windowMs: 5 * 60 * 1000, // per 5 minutes
  blockDurationMs: 15 * 60 * 1000, // block for 15 minutes
  endpoints: ['/auth', '/login', '/signup'],
});

// General Rate Limiter - Loose limits for general requests
export const generalRateLimiter = new RateLimiter({
  maxRequests: 1000, // 1000 requests
  windowMs: 60 * 60 * 1000, // per hour
  blockDurationMs: 60 * 60 * 1000, // block for 1 hour
});

// Export the class for custom instances
export { RateLimiter };
export type { RateLimitConfig, RequestRecord };
