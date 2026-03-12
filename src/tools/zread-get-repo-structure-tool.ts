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
    async execute(_toolCallId: string, params: { repo: string }) {
      const result = await service.getRepoStructure(params.repo);
      const formatted = formatRepoStructure(result.payload);
      return {
        content: [{ type: 'text' as const, text: formatted.summary }],
        details: { ...formatted.details, raw: result.raw },
      };
    },
  };
}
