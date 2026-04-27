import type { AgentToolUpdateCallback } from '@mariozechner/pi-coding-agent';
import { Type } from '@sinclair/typebox';
import { formatReaderResult } from '../utils/formatting.ts';

export function createWebReaderTool(service: { read: (url: string) => Promise<{ payload: Record<string, unknown>; raw: unknown }> }) {
  return {
    name: 'zai_web_reader',
    label: 'Z.AI Web Reader',
    description: 'Read a web page using the Z.AI Web Reader MCP server. Use for: "read this URL", "fetch this page", "summarize this article", "get the content of...".',
    parameters: Type.Object({
      url: Type.String({ description: 'The URL to read' }),
    }),
    async execute(_toolCallId: string, params: { url: string }, _signal: AbortSignal | undefined, onUpdate: AgentToolUpdateCallback<unknown> | undefined) {
      let urlPreview: string;
      try {
        const parsed = new URL(params.url);
        urlPreview = parsed.hostname + (parsed.pathname.length > 30 ? parsed.pathname.slice(0, 27) + '...' : parsed.pathname);
      } catch {
        urlPreview = params.url.length > 50 ? params.url.slice(0, 47) + '...' : params.url;
      }
      if (onUpdate) {
        onUpdate({ content: [{ type: 'text' as const, text: `🌐 Z.AI Web Reader — reading: ${urlPreview}` }], details: undefined });
      }
      const result = await service.read(params.url);
      const formatted = formatReaderResult(result.payload);
      const title = String(result.payload.title ?? 'Untitled');
      if (onUpdate) {
        onUpdate({ content: [{ type: 'text' as const, text: `✅ Z.AI Web Reader — loaded "${title}"` }], details: undefined });
      }
      return {
        content: [{ type: 'text' as const, text: formatted.summary }],
        details: { ...formatted.details, raw: result.raw },
      };
    },
  };
}
