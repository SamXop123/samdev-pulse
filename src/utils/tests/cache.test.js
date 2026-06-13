import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import Cache from '../cache.js';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Cache', () => {
  let cache;

  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2026-06-13T12:00:00Z') });
    cache = new Cache(10000, 5); // 10s default TTL, max 5 entries
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // -----------------------------------------------------------------------
  //  set()
  // -----------------------------------------------------------------------

  describe('set()', () => {
    test('stores a value with default TTL', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    test('stores a value with custom TTL', () => {
      cache.set('key1', 'value1', 5000);
      expect(cache.get('key1')).toBe('value1');
    });

    test('overwrites existing key and refreshes TTL', () => {
      cache.set('key1', 'old');
      jest.advanceTimersByTime(5000);
      cache.set('key1', 'new');
      // TTL should be refreshed from now, so still valid after another 5s
      jest.advanceTimersByTime(5000);
      expect(cache.get('key1')).toBe('new');
    });

    test('evicts the LRU entry when at max capacity', () => {
      // Fill to maxSize = 5
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
      cache.set('d', 4);
      cache.set('e', 5);
      expect(cache.size()).toBe(5);

      // Add one more — 'a' is the LRU and should be evicted
      cache.set('f', 6);
      expect(cache.size()).toBe(5);
      expect(cache.get('a')).toBeNull(); // evicted
      expect(cache.get('f')).toBe(6);    // present
    });

    test('evicts the correct LRU when get reorders entries', () => {
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
      cache.set('d', 4);
      cache.set('e', 5);

      // Access 'a' to move it to MRU position
      expect(cache.get('a')).toBe(1);

      // Now 'b' is LRU (oldest among remaining)
      cache.set('f', 6);
      expect(cache.get('b')).toBeNull(); // evicted
      expect(cache.get('a')).toBe(1);    // still present
    });

    test('does NOT evict when same key is set repeatedly', () => {
      cache.set('a', 1);
      cache.set('a', 2);
      cache.set('a', 3);
      cache.set('a', 4);
      cache.set('a', 5);
      cache.set('a', 6); // This should NOT trigger eviction
      expect(cache.size()).toBe(1);
      expect(cache.get('a')).toBe(6);
    });

    test('with TTL=0 expires the entry immediately', () => {
      cache.set('key1', 'value1', 0);
      // Even without advancing time, TTL=0 means expiresAt === now
      // Date.now() > expiresAt is false if they're equal (not strictly greater)
      // But the entry was created with Date.now() + 0, so expiresAt = now
      // A subsequent get will check Date.now() > expiresAt -> false (they're equal)
      // So it should still be valid... unless we advance past it
      expect(cache.get('key1')).toBe('value1'); // still valid at the same timestamp

      jest.advanceTimersByTime(1);
      expect(cache.get('key1')).toBeNull(); // expired now
    });

    test('with negative TTL expires immediately even at same timestamp', () => {
      cache.set('key1', 'value1', -1);
      // expiresAt = now - 1, so Date.now() > expiresAt is true
      expect(cache.get('key1')).toBeNull();
    });

    test('handles cache with maxSize = 1', () => {
      const tiny = new Cache(10000, 1);
      tiny.set('a', 1);
      expect(tiny.get('a')).toBe(1);

      tiny.set('b', 2);
      expect(tiny.get('a')).toBeNull(); // evicted
      expect(tiny.get('b')).toBe(2);
    });
  });

  // -----------------------------------------------------------------------
  //  get()
  // -----------------------------------------------------------------------

  describe('get()', () => {
    test('returns value for existing key', () => {
      cache.set('key1', 'hello');
      expect(cache.get('key1')).toBe('hello');
    });

    test('returns null for missing key', () => {
      expect(cache.get('nonexistent')).toBeNull();
    });

    test('returns null for expired entry and removes it', () => {
      cache.set('key1', 'value1');
      jest.advanceTimersByTime(10001); // past 10s TTL

      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key1')).toBeNull(); // already deleted, hits the missing path
    });

    test('moves accessed entry to MRU position', () => {
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);

      // Access 'a' to make it MRU
      cache.get('a');

      // Fill to capacity — 'b' should be evicted, not 'a'
      cache.set('d', 4);
      cache.set('e', 5);
      cache.set('f', 6); // triggers eviction

      expect(cache.get('b')).toBeNull(); // evicted (LRU)
      expect(cache.get('a')).toBe(1);    // kept (MRU via get)
    });

    test('does not reorder entry that remains expired', () => {
      cache.set('a', 1);
      cache.set('b', 2);
      jest.advanceTimersByTime(10001);

      // Expired — returns null and deletes
      expect(cache.get('a')).toBeNull();
      expect(cache.size()).toBe(1); // only 'b' remains (also expired but not accessed)
    });

    test('stores complex objects and returns them', () => {
      const obj = { foo: [1, 2, 3], bar: { baz: 'qux' } };
      cache.set('obj', obj);
      expect(cache.get('obj')).toEqual(obj);
    });

    test('stores null as a value', () => {
      cache.set('null', null);
      expect(cache.get('null')).toBeNull();
    });

    test('stores false as a value', () => {
      cache.set('false', false);
      expect(cache.get('false')).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  //  has()
  // -----------------------------------------------------------------------

  describe('has()', () => {
    test('returns true for existing key', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
    });

    test('returns false for missing key', () => {
      expect(cache.has('nonexistent')).toBe(false);
    });

    test('returns false for expired key and removes it', () => {
      cache.set('key1', 'value1');
      jest.advanceTimersByTime(10001);

      expect(cache.has('key1')).toBe(false);
      expect(cache.has('key1')).toBe(false); // already deleted
    });

    test('does NOT update hit/miss stats', () => {
      cache.set('key1', 'value1');

      cache.has('key1'); // should exist
      cache.has('missing');

      const stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });

    test('does NOT reorder LRU order', () => {
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);

      // Check 'a' via has() — should NOT make it MRU
      cache.has('a');

      // Fill to capacity — 'a' should be evicted (still LRU)
      cache.set('d', 4);
      cache.set('e', 5);
      cache.set('f', 6);

      expect(cache.get('a')).toBeNull(); // evicted
      expect(cache.get('b')).toBe(2);    // kept
    });
  });

  // -----------------------------------------------------------------------
  //  delete()
  // -----------------------------------------------------------------------

  describe('delete()', () => {
    test('removes a key from cache', () => {
      cache.set('key1', 'value1');
      cache.delete('key1');
      expect(cache.get('key1')).toBeNull();
    });

    test('does nothing when key does not exist', () => {
      expect(() => cache.delete('nonexistent')).not.toThrow();
    });

    test('reduces cache size', () => {
      cache.set('a', 1);
      cache.set('b', 2);
      expect(cache.size()).toBe(2);

      cache.delete('a');
      expect(cache.size()).toBe(1);
    });
  });

  // -----------------------------------------------------------------------
  //  clear()
  // -----------------------------------------------------------------------

  describe('clear()', () => {
    test('removes all entries', () => {
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
      expect(cache.size()).toBe(3);

      cache.clear();
      expect(cache.size()).toBe(0);
      expect(cache.get('a')).toBeNull();
      expect(cache.get('b')).toBeNull();
    });

    test('resets all stats to zero', () => {
      cache.set('a', 1);
      cache.get('a'); // hit
      cache.get('missing'); // miss
      cache.set('b', 2);
      cache.set('c', 3);
      cache.set('d', 4);
      cache.set('e', 5);
      cache.set('f', 6); // eviction of 'a'? No, 'a' was already accessed and made MRU
      // Actually this won't trigger eviction predictably for this test
      // Let me just verify stats are reset
      cache.clear();

      const stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.evictions).toBe(0);
      expect(stats.size).toBe(0);
    });
  });

  // -----------------------------------------------------------------------
  //  size()
  // -----------------------------------------------------------------------

  describe('size()', () => {
    test('returns 0 for empty cache', () => {
      expect(cache.size()).toBe(0);
    });

    test('returns correct count of entries', () => {
      expect(cache.size()).toBe(0);
      cache.set('a', 1);
      expect(cache.size()).toBe(1);
      cache.set('b', 2);
      expect(cache.size()).toBe(2);
    });

    test('decreases after deletion', () => {
      cache.set('a', 1);
      cache.set('b', 2);
      cache.delete('a');
      expect(cache.size()).toBe(1);
    });
  });

  // -----------------------------------------------------------------------
  //  getStats()
  // -----------------------------------------------------------------------

  describe('getStats()', () => {
    test('returns initial zeroed stats', () => {
      expect(cache.getStats()).toEqual({
        hits: 0,
        misses: 0,
        evictions: 0,
        size: 0,
      });
    });

    test('tracks hits correctly', () => {
      cache.set('a', 1);
      cache.get('a'); // hit
      cache.get('a'); // hit

      expect(cache.getStats().hits).toBe(2);
    });

    test('tracks misses correctly', () => {
      cache.get('missing1'); // miss
      cache.get('missing2'); // miss

      expect(cache.getStats().misses).toBe(2);
    });

    test('tracks misses for expired entries', () => {
      cache.set('a', 1);
      jest.advanceTimersByTime(10001);

      cache.get('a'); // miss (expired)
      expect(cache.getStats().misses).toBe(1);
    });

    test('tracks evictions correctly', () => {
      cache = new Cache(10000, 3);
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
      cache.set('d', 4); // evicts 'a'

      expect(cache.getStats().evictions).toBe(1);
      expect(cache.getStats().size).toBe(3);
    });

    test('returns a snapshot (immutable) of stats', () => {
      cache.set('a', 1);
      const stats = cache.getStats();
      stats.hits = 999; // modify the returned object

      // Original stats should remain unchanged
      expect(cache.getStats().hits).toBe(0);
    });
  });

  // -----------------------------------------------------------------------
  //  LRU ordering
  // -----------------------------------------------------------------------

  describe('LRU eviction order', () => {
    test('newly set entries are MRU (evicts oldest first)', () => {
      cache = new Cache(10000, 3);
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
      // a is LRU, c is MRU

      cache.set('d', 4); // evicts 'a' (LRU)
      expect(cache.get('a')).toBeNull();
      expect(cache.get('b')).toBe(2);
      expect(cache.get('c')).toBe(3);
      expect(cache.get('d')).toBe(4);
    });

    test('set on existing key moves it to MRU', () => {
      cache = new Cache(10000, 3);
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);

      // Overwrite 'a' — this should make 'a' MRU
      cache.set('a', 10); // Map: [b, c, a]

      cache.set('d', 4); // evicts 'b' (LRU)
      expect(cache.get('b')).toBeNull();
      expect(cache.get('a')).toBe(10);
      expect(cache.get('c')).toBe(3);
    });

    test('multiple accesses keep hot keys in cache', () => {
      cache = new Cache(10000, 3);
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);

      // Make 'c' the hottest by accessing it repeatedly
      cache.get('c');
      cache.get('c');
      cache.get('c'); // Map: [a, b, c]

      // Add 'd' — evicts 'a' (coldest/LRU)
      cache.set('d', 4);
      expect(cache.get('a')).toBeNull();
      expect(cache.get('b')).toBe(2);
      expect(cache.get('c')).toBe(3);
      expect(cache.get('d')).toBe(4);

      // Access 'b' to make it MRU
      cache.get('b'); // Map: [c, d, b]

      // Add 'e' — evicts 'c' (now LRU)
      cache.set('e', 5);
      expect(cache.get('c')).toBeNull();
      expect(cache.get('b')).toBe(2);
      expect(cache.get('d')).toBe(4);
      expect(cache.get('e')).toBe(5);
    });
  });

  // -----------------------------------------------------------------------
  //  TTL expiration
  // -----------------------------------------------------------------------

  describe('TTL expiration', () => {
    test('entries expire after default TTL', () => {
      cache.set('a', 1);
      jest.advanceTimersByTime(10001);
      expect(cache.get('a')).toBeNull();
    });

    test('entries are valid before TTL', () => {
      cache.set('a', 1);
      jest.advanceTimersByTime(9999);
      expect(cache.get('a')).toBe(1);
    });

    test('entries with different TTLs expire independently', () => {
      cache.set('a', 1, 5000);  // 5s
      cache.set('b', 2, 15000); // 15s

      jest.advanceTimersByTime(6000);
      expect(cache.get('a')).toBeNull(); // expired
      expect(cache.get('b')).toBe(2);    // still valid

      jest.advanceTimersByTime(10000);
      expect(cache.get('b')).toBeNull(); // now expired
    });

    test('expired entries are cleaned up by has()', () => {
      cache.set('a', 1);
      jest.advanceTimersByTime(10001);

      cache.has('a'); // detects expiry, deletes key
      expect(cache.size()).toBe(0);
    });

    test('expired entries are cleaned up by get()', () => {
      cache.set('a', 1);
      jest.advanceTimersByTime(10001);

      cache.get('a'); // detects expiry, deletes key
      expect(cache.size()).toBe(0);
    });
  });

  // -----------------------------------------------------------------------
  //  Singleton (githubCache)
  // -----------------------------------------------------------------------

  describe('githubCache singleton', () => {
    test('is a Cache instance', async () => {
      const { githubCache } = await import('../cache.js');
      expect(githubCache).toBeInstanceOf(Cache);
    });

    test('starts empty', async () => {
      const { githubCache } = await import('../cache.js');
      // Clear any state from other tests
      githubCache.clear();
      expect(githubCache.size()).toBe(0);
    });
  });
});
