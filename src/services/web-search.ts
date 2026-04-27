import { MCP_TOOL_NAMES } from '../constants.ts';
import type { McpCaller, McpToolResult, ZaiConfig } from '../types.ts';
import { assertNonEmptyString } from '../utils/validation.ts';

export function createWebSearchService(client: McpCaller, config?: Pick<ZaiConfig, 'searchLocation'>) {
  return {
    async search(query: string, count = 5) {
      const normalizedQuery = assertNonEmptyString(query, 'query');
      const normalizedCount = Math.min(Math.max(Math.trunc(count), 1), 10);
      const args: Record<string, unknown> = {
        search_query: normalizedQuery,
        content_size: 'medium',
      };
      if (config?.searchLocation) {
        args.location = config.searchLocation;
      }
      const result = await tryToolNames(client, args);

      const items = extractItems(result).slice(0, normalizedCount);
      return { items, raw: result };
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

function extractItems(result: McpToolResult): Array<Record<string, unknown>> {
  // First check structured content
  if (result.structuredContent && typeof result.structuredContent === 'object') {
    const structured = result.structuredContent as Record<string, unknown>;
    const candidates = [structured.items, structured.results, structured.data];
    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return toRecords(candidate);
      }
    }
  }

  // Check content items for JSON strings (Z.AI API format)
  const content = result.content ?? [];
  for (const item of content) {
    if (isRecord(item) && item.type === 'text' && typeof item.text === 'string') {
      try {
        let parsed = JSON.parse(item.text);
        // Handle double-encoded JSON strings
        if (typeof parsed === 'string') {
          try {
            parsed = JSON.parse(parsed);
          } catch {
            // Second parse failed, use original parsed value
          }
        }
        if (Array.isArray(parsed)) {
          return toRecords(parsed);
        }
      } catch {
        // Not valid JSON, continue
      }
    }
  }

  // Fallback: treat content items as records
  return toRecords(content);
}

function toRecords(values: unknown[]): Array<Record<string, unknown>> {
  return values.filter(isRecord).map((value) => ({ ...value }));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
