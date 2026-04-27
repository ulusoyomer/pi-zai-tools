import { describe, expect, it } from 'vitest';
import { parseJsonFromText, extractItemsFromResult, extractPayloadFromResult } from '../src/utils/json-parse.ts';

describe('parseJsonFromText', () => {
  it('parses a JSON array from a string', () => {
    const input = '[{"title":"Hello","url":"https://example.com"}]';
    expect(parseJsonFromText(input)).toEqual([{ title: 'Hello', url: 'https://example.com' }]);
  });

  it('handles double-encoded JSON', () => {
    const single = JSON.stringify([{ title: 'Test' }]);
    const double = JSON.stringify(single);
    expect(parseJsonFromText(double)).toEqual([{ title: 'Test' }]);
  });

  it('returns null for non-JSON string', () => {
    expect(parseJsonFromText('plain text')).toBeNull();
  });

  it('returns null for JSON object (not array)', () => {
    expect(parseJsonFromText('{"key":"value"}')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(parseJsonFromText('')).toBeNull();
  });
});

describe('extractItemsFromResult', () => {
  it('extracts from structuredContent.items first', () => {
    const result = {
      structuredContent: { items: [{ title: 'Structured' }] },
      content: [{ type: 'text', text: '[{"title":"Text"}]' }],
    };
    const items = extractItemsFromResult(result);
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe('Structured');
  });

  it('extracts from structuredContent.results', () => {
    const result = {
      structuredContent: { results: [{ name: 'R1' }] },
    };
    const items = extractItemsFromResult(result);
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe('R1');
  });

  it('extracts from structuredContent.docs', () => {
    const result = {
      structuredContent: { docs: [{ path: 'a.ts' }] },
    };
    const items = extractItemsFromResult(result);
    expect(items).toHaveLength(1);
    expect(items[0].path).toBe('a.ts');
  });

  it('extracts from structuredContent.data', () => {
    const result = {
      structuredContent: { data: [{ id: 1 }] },
    };
    const items = extractItemsFromResult(result);
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe(1);
  });

  it('parses JSON from text content when no structuredContent', () => {
    const result = {
      content: [{ type: 'text', text: '[{"title":"FromText"}]' }],
    };
    const items = extractItemsFromResult(result);
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe('FromText');
  });

  it('handles double-encoded JSON in text content', () => {
    const single = JSON.stringify([{ title: 'Double' }]);
    const double = JSON.stringify(single);
    const result = {
      content: [{ type: 'text', text: double }],
    };
    const items = extractItemsFromResult(result);
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe('Double');
  });

  it('falls back to content items as records', () => {
    const result = {
      content: [{ type: 'json' as const, title: 'Direct', url: 'https://example.com' }],
    };
    const items = extractItemsFromResult(result);
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe('Direct');
  });

  it('returns empty for empty content', () => {
    expect(extractItemsFromResult({})).toHaveLength(0);
  });

  it('returns empty for empty array content', () => {
    expect(extractItemsFromResult({ content: [] })).toHaveLength(0);
  });
});

describe('extractPayloadFromResult', () => {
  it('returns structuredContent when available', () => {
    const result = {
      structuredContent: { title: 'Page', content: 'Hello' },
    };
    const payload = extractPayloadFromResult(result);
    expect(payload.title).toBe('Page');
    expect(payload.content).toBe('Hello');
  });

  it('extracts text from content when no structuredContent', () => {
    const result = {
      content: [{ type: 'text', text: 'raw content here' }],
    };
    const payload = extractPayloadFromResult(result);
    expect(payload.content).toBe('raw content here');
  });

  it('returns empty content when no text item found', () => {
    const result = {
      content: [{ type: 'image', data: 'base64' }],
    };
    const payload = extractPayloadFromResult(result);
    expect(payload.content).toBe('');
  });

  it('returns empty content when no content array', () => {
    const payload = extractPayloadFromResult({});
    expect(payload.content).toBe('');
  });
});
