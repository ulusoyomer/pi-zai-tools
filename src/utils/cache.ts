export interface TtlCacheOptions {
  ttlMs: number;
  maxSize?: number;
}

export function createTtlCache<T>(options: TtlCacheOptions) {
  const { ttlMs, maxSize = 100 } = options;
  const store = new Map<string, { value: T; expiresAt: number }>();

  function prune() {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.expiresAt) {
        store.delete(key);
      }
    }
  }

  return {
    get(key: string): T | undefined {
      const entry = store.get(key);
      if (!entry) return undefined;
      if (Date.now() > entry.expiresAt) {
        store.delete(key);
        return undefined;
      }
      return entry.value;
    },
    set(key: string, value: T) {
      prune();
      if (store.size >= maxSize && !store.has(key)) {
        // Evict oldest entry
        const firstKey = store.keys().next().value;
        if (firstKey !== undefined) store.delete(firstKey);
      }
      store.set(key, { value, expiresAt: Date.now() + ttlMs });
    },
    clear() {
      store.clear();
    },
    get size() {
      prune();
      return store.size;
    },
  };
}

export type TtlCache<T> = ReturnType<typeof createTtlCache<T>>;
