import { Type } from '@sinclair/typebox';
import { formatSearchResults } from '../utils/formatting.ts';

export function createWebSearchTool(service: { search: (query: string, count?: number) => Promise<{ items: Array<Record<string, unknown>>; raw: unknown }> }) {
  return {
    name: 'zai_web_search',
    label: 'Z.AI Web Search',
    description: 'Search the web using the Z.AI Web Search MCP server.',
    parameters: Type.Object({
      query: Type.String({ description: 'Search query' }),
      count: Type.Optional(Type.Number({ description: 'Maximum number of results to format', minimum: 1, maximum: 10 })),
    }),
    async execute(_toolCallId: string, params: { query: string; count?: number }) {
      const result = await service.search(params.query, params.count);
      const formatted = formatSearchResults(result.items);
      return {
        content: [{ type: 'text' as const, text: formatted.summary }],
        details: { ...formatted.details, raw: result.raw },
      };
    },
  };
}
