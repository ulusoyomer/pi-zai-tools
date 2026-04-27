import { describe, expect, it } from 'vitest';
import { createTtlCache } from '../src/utils/cache.ts';

describe('createTtlCache', () => {
  it('returns undefined for missing key', () => {
    const cache = createTtlCache<string>({ ttlMs: 5000 });
    expect(cache.get('missing')).toBeUndefined();
  });

  it('stores and retrieves values within TTL', () => {
    const cache = createTtlCache<string>({ ttlMs: 5000 });
    cache.set('key', 'value');
    expect(cache.get('key')).toBe('value');
  });

  it('expires entries after TTL', async () => {
    const cache = createTtlCache<string>({ ttlMs: 50 });
    cache.set('key', 'value');
    await new Promise((r) => setTimeout(r, 100));
    expect(cache.get('key')).toBeUndefined();
  });

  it('clears all entries', () => {
    const cache = createTtlCache<string>({ ttlMs: 5000 });
    cache.set('a', '1');
    cache.set('b', '2');
    cache.clear();
    expect(cache.get('a')).toBeUndefined();
    expect(cache.get('b')).toBeUndefined();
  });

  it('reports correct size', () => {
    const cache = createTtlCache<string>({ ttlMs: 5000 });
    cache.set('a', '1');
    cache.set('b', '2');
    expect(cache.size).toBe(2);
  });

  it('evicts oldest entry when maxSize reached', () => {
    const cache = createTtlCache<string>({ ttlMs: 5000, maxSize: 2 });
    cache.set('a', '1');
    cache.set('b', '2');
    cache.set('c', '3');
    expect(cache.get('a')).toBeUndefined();
    expect(cache.get('b')).toBe('2');
    expect(cache.get('c')).toBe('3');
  });

  it('overwrites existing key without eviction', () => {
    const cache = createTtlCache<string>({ ttlMs: 5000, maxSize: 2 });
    cache.set('a', '1');
    cache.set('b', '2');
    cache.set('a', 'updated');
    expect(cache.get('a')).toBe('updated');
    expect(cache.get('b')).toBe('2');
    expect(cache.size).toBe(2);
  });
});
