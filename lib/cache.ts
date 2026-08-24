/**
 * Server-side Cache Layer for TrendScope
 * 
 * Provides an in-memory TTL caching abstraction for API responses.
 * Designed with a clean interface that can easily be swapped with SQLite,
 * Redis, or Vercel KV without modifying consuming components.
 */

interface CacheEntry<T> {
  data: T;
  createdAt: number; // unix timestamp in ms
  expiresAt: number; // unix timestamp in ms
}

class MemoryCache {
  private store: Map<string, CacheEntry<unknown>> = new Map();
  private defaultTtlMs: number = 5 * 60 * 1000; // 5 minutes

  /**
   * Retrieve item from cache if not expired
   */
  get<T>(key: string): { data: T; ageSeconds: number } | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    const ageSeconds = Math.floor((now - entry.createdAt) / 1000);
    return { data: entry.data, ageSeconds };
  }

  /**
   * Set item in cache with TTL
   */
  set<T>(key: string, data: T, ttlSeconds: number = 300): void {
    const now = Date.now();
    const expiresAt = now + ttlSeconds * 1000;

    this.store.set(key, {
      data,
      createdAt: now,
      expiresAt,
    });
  }

  /**
   * Invalidate a single key
   */
  delete(key: string): boolean {
    return this.store.delete(key);
  }

  /**
   * Invalidate all keys matching prefix
   */
  deletePrefix(prefix: string): number {
    let count = 0;
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
        count++;
      }
    }
    return count;
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Inspect cache statistics
   */
  getStats(): {
    totalEntries: number;
    activeKeys: string[];
    defaultTtlSeconds: number;
  } {
    const now = Date.now();
    const activeKeys: string[] = [];

    for (const [key, entry] of this.store.entries()) {
      if (now <= entry.expiresAt) {
        activeKeys.push(key);
      }
    }

    return {
      totalEntries: activeKeys.length,
      activeKeys,
      defaultTtlSeconds: this.defaultTtlMs / 1000,
    };
  }
}

// Global singleton instance for Next.js Node.js server context
declare global {
  var __trendScopeCache: MemoryCache | undefined;
}


export const cache = globalThis.__trendScopeCache || new MemoryCache();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__trendScopeCache = cache;
}

export default cache;
