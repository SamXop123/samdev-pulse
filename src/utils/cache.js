// TTL-based in-memory cache with LRU eviction

const DEFAULT_CACHE_TTL = process.env.NODE_ENV === 'production' ? 1800000 : 300000;
const DEFAULT_MAX_SIZE = parseInt(process.env.CACHE_MAX_SIZE, 10) || 1000;

class Cache {
  constructor(defaultTTL = DEFAULT_CACHE_TTL, maxSize = DEFAULT_MAX_SIZE) {
    this.defaultTTL = defaultTTL;
    this.maxSize = maxSize;
    this.store = new Map();
    this.stats = { hits: 0, misses: 0, evictions: 0 };
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry || Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.stats.misses++;
      return null;
    }
    // Move to end (most recently used)
    this.store.delete(key);
    this.store.set(key, entry);
    this.stats.hits++;
    return entry.value;
  }

  set(key, value, ttl = this.defaultTTL) {
    if (this.store.size >= this.maxSize && !this.store.has(key)) {
      const oldestKey = this.store.keys().next().value;
      this.store.delete(oldestKey);
      this.stats.evictions++;
    }
    const expiresAt = Date.now() + ttl;
    this.store.set(key, { value, expiresAt });
  }

  has(key) {
    return this.get(key) !== null;
  }

  delete(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
    this.stats = { hits: 0, misses: 0, evictions: 0 };
  }

  size() {
    return this.store.size;
  }

  getStats() {
    return { ...this.stats, size: this.store.size };
  }
}

export const githubCache = new Cache();
export default Cache;
