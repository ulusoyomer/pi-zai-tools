import type { AgentToolUpdateCallback } from '@mariozechner/pi-coding-agent';
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
    async execute(_toolCallId: string, params: { repo: string; query: string }, _signal: AbortSignal | undefined, onUpdate: AgentToolUpdateCallback<unknown> | undefined) {
      const queryPreview = params.query.length > 50 ? params.query.slice(0, 47) + '...' : params.query;
      if (onUpdate) {
        onUpdate({ content: [{ type: 'text' as const, text: `📚 Zread — searching docs in ${params.repo}: "${queryPreview}"` }], details: undefined });
      }
      const result = await service.searchDoc(params.repo, params.query);
      const formatted = formatSearchResults(result.items);
      if (onUpdate) {
        onUpdate({ content: [{ type: 'text' as const, text: `✅ Zread — ${result.items.length} doc result(s) in ${params.repo}` }], details: undefined });
      }
      return {
        content: [{ type: 'text' as const, text: formatted.summary }],
        details: { ...formatted.details, raw: result.raw },
      };
    },
  };
}
