import { Type } from '@sinclair/typebox';
import { formatReaderResult } from '../utils/formatting.ts';

export function createWebReaderTool(service: { read: (url: string) => Promise<{ payload: Record<string, unknown>; raw: unknown }> }) {
  return {
    name: 'zai_web_reader',
    label: 'Z.AI Web Reader',
    description: 'Read a web page using the Z.AI Web Reader MCP server.',
    parameters: Type.Object({
      url: Type.String({ description: 'The URL to read' }),
    }),
    async execute(_toolCallId: string, params: { url: string }) {
      const result = await service.read(params.url);
      const formatted = formatReaderResult(result.payload);
      return {
        content: [{ type: 'text' as const, text: formatted.summary }],
        details: { ...formatted.details, raw: result.raw },
      };
    },
  };
}
