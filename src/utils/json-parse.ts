import type { McpToolResult } from '../types.ts';

/**
 * Try to parse a JSON string, handling double-encoding.
 * Returns the parsed array, or null if not a valid JSON array.
 */
export function parseJsonFromText(text: string): unknown[] | null {
  try {
    let parsed: unknown = JSON.parse(text);
    // Handle double-encoded JSON strings
    if (typeof parsed === 'string') {
      try {
        parsed = JSON.parse(parsed);
      } catch {
        // Not double-encoded
      }
    }
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toRecords(values: unknown[]): Array<Record<string, unknown>> {
  return values.filter(isRecord).map((value) => ({ ...value }));
}

/**
 * Extract items from an MCP tool result.
 * Checks structuredContent first, then JSON in text content, then falls back to content items.
 */
export function extractItemsFromResult(result: McpToolResult): Array<Record<string, unknown>> {
  // 1. structuredContent
  if (result.structuredContent && typeof result.structuredContent === 'object') {
    const structured = result.structuredContent as Record<string, unknown>;
    for (const key of ['items', 'results', 'docs', 'data']) {
      const candidate = structured[key];
      if (Array.isArray(candidate)) {
        return toRecords(candidate);
      }
    }
  }

  // 2. JSON in text content
  const content = result.content ?? [];
  for (const item of content) {
    if (isRecord(item) && item.type === 'text' && typeof item.text === 'string') {
      const parsed = parseJsonFromText(item.text);
      if (parsed) {
        return toRecords(parsed);
      }
    }
  }

  // 3. Fallback: treat content items as records
  return toRecords(content);
}

/**
 * Extract a single payload object from an MCP tool result.
 * Checks structuredContent first, then text content.
 */
export function extractPayloadFromResult(result: McpToolResult): Record<string, unknown> {
  if (result.structuredContent && typeof result.structuredContent === 'object') {
    return result.structuredContent as Record<string, unknown>;
  }

  const text = result.content?.find((item) => item.type === 'text');
  return { content: text?.text ?? '' };
}
