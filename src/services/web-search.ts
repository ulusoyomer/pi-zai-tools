import { MCP_TOOL_NAMES } from '../constants.ts';
import type { McpCaller, ZaiConfig } from '../types.ts';
import { extractItemsFromResult } from '../utils/json-parse.ts';
import { createTtlCache, type TtlCache } from '../utils/cache.ts';
import { assertNonEmptyString } from '../utils/validation.ts';

export type SearchFreshness = 'day' | 'week' | 'month' | 'year';

export function createWebSearchService(client: McpCaller, config?: Pick<ZaiConfig, 'searchLocation'> & { cache?: TtlCache<{ items: Array<Record<string, unknown>>; raw: unknown }> }) {
  const cache = config?.cache ?? createTtlCache<{ items: Array<Record<string, unknown>>; raw: unknown }>({ ttlMs: 60_000, maxSize: 50 });
  return {
    async search(query: string, count = 5, freshness?: SearchFreshness) {
      const normalizedQuery = assertNonEmptyString(query, 'query');
      const normalizedCount = Math.min(Math.max(Math.trunc(count), 1), 10);

      const cacheKey = `${normalizedQuery}:${normalizedCount}:${freshness ?? 'none'}:${config?.searchLocation ?? 'default'}`;
      const cached = cache.get(cacheKey);
      if (cached) return cached;

      const args: Record<string, unknown> = {
        search_query: normalizedQuery,
        content_size: 'medium',
      };
      if (config?.searchLocation) {
        args.location = config.searchLocation;
      }
      if (freshness) {
        args.freshness = freshness;
      }
      const result = await tryToolNames(client, args);

      const items = extractItemsFromResult(result).slice(0, normalizedCount);
      const entry = { items, raw: result };
      cache.set(cacheKey, entry);
      return entry;
    },
  };
}

async function tryToolNames(client: McpCaller, args: Record<string, unknown>) {
  let lastError: unknown;

  for (const toolName of MCP_TOOL_NAMES.webSearch) {
    try {
      return await client.callTool(toolName, args);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}
