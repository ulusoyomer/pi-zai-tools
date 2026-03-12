import { MCP_TOOL_NAMES } from '../constants.ts';
import type { McpCaller, McpToolResult } from '../types.ts';
import { validateUrl } from '../utils/validation.ts';

const ARG_SHAPES = [
  (url: string) => ({ url }),
  (url: string) => ({ target_url: url }),
  (url: string) => ({ webpage_url: url }),
];

export function createWebReaderService(client: McpCaller) {
  return {
    async read(url: string) {
      const normalizedUrl = validateUrl(url);
      return tryArgumentShapes(client, normalizedUrl);
    },
  };
}

async function tryArgumentShapes(client: McpCaller, url: string) {
  let lastError: unknown;

  for (const shape of ARG_SHAPES) {
    try {
      const raw = await client.callTool(MCP_TOOL_NAMES.webReader, shape(url));
      return { payload: extractPayload(raw), raw };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

function extractPayload(result: McpToolResult) {
  if (result.structuredContent && typeof result.structuredContent === 'object') {
    return result.structuredContent as Record<string, unknown>;
  }

  const text = result.content?.find((item) => item.type === 'text');
  return { content: text?.text ?? '' };
}
