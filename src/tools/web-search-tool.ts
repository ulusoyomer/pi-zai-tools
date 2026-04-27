import type { AgentToolUpdateCallback } from '@mariozechner/pi-coding-agent';
import { Type } from '@sinclair/typebox';
import { formatSearchResults } from '../utils/formatting.ts';

export function createWebSearchTool(service: { search: (query: string, count?: number, freshness?: 'day' | 'week' | 'month' | 'year') => Promise<{ items: Array<Record<string, unknown>>; raw: unknown }> }) {
  return {
    name: 'zai_web_search',
    label: 'Z.AI Web Search',
    description: 'Search the web using the Z.AI Web Search MCP server. Use for: "search for...", "find...", "look up...", "what is...", "recent news about...".',
    parameters: Type.Object({
      query: Type.String({ description: 'Search query' }),
      count: Type.Optional(Type.Number({ description: 'Maximum number of results to format', minimum: 1, maximum: 10 })),
      freshness: Type.Optional(Type.Union([Type.Literal('day'), Type.Literal('week'), Type.Literal('month'), Type.Literal('year')], { description: 'Time filter: day, week, month, or year' })),
    }),
    async execute(_toolCallId: string, params: { query: string; count?: number; freshness?: 'day' | 'week' | 'month' | 'year' }, _signal: AbortSignal | undefined, onUpdate: AgentToolUpdateCallback<unknown> | undefined) {
      const queryPreview = params.query.length > 60 ? params.query.slice(0, 57) + '...' : params.query;
      if (onUpdate) {
        onUpdate({ content: [{ type: 'text' as const, text: `🔍 Z.AI Web Search — searching: "${queryPreview}"` }], details: undefined });
      }
      const result = await service.search(params.query, params.count, params.freshness);
      const formatted = formatSearchResults(result.items);
      if (onUpdate) {
        onUpdate({ content: [{ type: 'text' as const, text: `✅ Z.AI Web Search — ${result.items.length} result(s) found for "${queryPreview}"` }], details: undefined });
      }
      return {
        content: [{ type: 'text' as const, text: formatted.summary }],
        details: { ...formatted.details, raw: result.raw },
      };
    },
  };
}
