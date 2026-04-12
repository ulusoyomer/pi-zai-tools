import type { AgentToolUpdateCallback } from '@mariozechner/pi-coding-agent';
import { Type } from '@sinclair/typebox';
import { formatFileContent } from '../utils/formatting.ts';

export function createZreadReadFileTool(service: { readFile: (repo: string, path: string) => Promise<{ payload: Record<string, unknown>; raw: unknown }> }) {
  return {
    name: 'zai_zread_read_file',
    label: 'Z.AI Zread Read File',
    description: 'Read a file from a public GitHub repository using Zread.',
    parameters: Type.Object({
      repo: Type.String({ description: 'Repository in owner/repo format' }),
      path: Type.String({ description: 'File path within the repository' }),
    }),
    async execute(_toolCallId: string, params: { repo: string; path: string }, _signal: AbortSignal | undefined, onUpdate: AgentToolUpdateCallback<unknown> | undefined) {
      if (onUpdate) {
        onUpdate({ content: [{ type: 'text' as const, text: `📄 Zread — reading ${params.repo}/${params.path}` }], details: undefined });
      }
      const result = await service.readFile(params.repo, params.path);
      const formatted = formatFileContent(result.payload);
      if (onUpdate) {
        onUpdate({ content: [{ type: 'text' as const, text: `✅ Zread — file loaded: ${params.path}` }], details: undefined });
      }
      return {
        content: [{ type: 'text' as const, text: formatted.summary }],
        details: { ...formatted.details, raw: result.raw },
      };
    },
  };
}
