import { Type } from '@sinclair/typebox';
import { formatSearchResults } from '../utils/formatting.ts';

export function createZreadSearchDocTool(service: { searchDoc: (repo: string, query: string) => Promise<{ items: Array<Record<string, unknown>>; raw: unknown }> }) {
  return {
    name: 'zai_zread_search_doc',
    label: 'Z.AI Zread Search Docs',
    description: 'Search documentation and repository knowledge for a public GitHub repo using Zread.',
    parameters: Type.Object({
      repo: Type.String({ description: 'Repository in owner/repo format' }),
      query: Type.String({ description: 'Documentation query' }),
    }),
    async execute(_toolCallId: string, params: { repo: string; query: string }) {
      const result = await service.searchDoc(params.repo, params.query);
      const formatted = formatSearchResults(result.items);
      return {
        content: [{ type: 'text' as const, text: formatted.summary }],
        details: { ...formatted.details, raw: result.raw },
      };
    },
  };
}
