import type { AgentToolUpdateCallback } from '@mariozechner/pi-coding-agent';
import { Type } from '@sinclair/typebox';
import { formatRepoStructure } from '../utils/formatting.ts';

export function createZreadGetRepoStructureTool(service: { getRepoStructure: (repo: string) => Promise<{ payload: Record<string, unknown>; raw: unknown }> }) {
  return {
    name: 'zai_zread_get_repo_structure',
    label: 'Z.AI Zread Repo Structure',
    description: 'Get a public GitHub repository structure using Zread.',
    parameters: Type.Object({
      repo: Type.String({ description: 'Repository in owner/repo format' }),
    }),
    async execute(_toolCallId: string, params: { repo: string }, _signal: AbortSignal | undefined, onUpdate: AgentToolUpdateCallback<unknown> | undefined) {
      if (onUpdate) {
        onUpdate({ content: [{ type: 'text' as const, text: `📂 Zread — fetching repo structure: ${params.repo}` }], details: undefined });
      }
      const result = await service.getRepoStructure(params.repo);
      const formatted = formatRepoStructure(result.payload);
      if (onUpdate) {
        onUpdate({ content: [{ type: 'text' as const, text: `✅ Zread — structure loaded for ${params.repo}` }], details: undefined });
      }
      return {
        content: [{ type: 'text' as const, text: formatted.summary }],
        details: { ...formatted.details, raw: result.raw },
      };
    },
  };
}
