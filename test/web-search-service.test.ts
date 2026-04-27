import { describe, expect, it, vi } from 'vitest';
import { createWebSearchService } from '../src/services/web-search.ts';

describe('createWebSearchService', () => {
  it('falls back to the prefixed remote tool name when the documented name is unavailable', async () => {
    const callTool = vi
      .fn()
      .mockRejectedValueOnce(new Error('Tool not found: webSearchPrime'))
      .mockResolvedValueOnce({
        structuredContent: { items: [{ title: 'Example Domain', url: 'https://example.com' }] },
      });

    const service = createWebSearchService({ callTool });
    const result = await service.search('example domain', 3);

    expect(callTool.mock.calls[0][0]).toBe('web_search_prime');
    expect(callTool.mock.calls[1][0]).toBe('webSearchPrime');
    expect(result.items[0]?.title).toBe('Example Domain');
  });

  describe('JSON string parsing', () => {
    it('parses search results from JSON string in text content', async () => {
      const callTool = vi.fn().mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify([
              { title: 'Result 1', url: 'https://example.com/1', summary: 'Summary 1' },
              { title: 'Result 2', url: 'https://example.com/2', summary: 'Summary 2' },
            ]),
          },
        ],
      });

      const service = createWebSearchService({ callTool });
      const result = await service.search('test query');

      expect(result.items).toHaveLength(2);
      expect(result.items[0]?.title).toBe('Result 1');
      expect(result.items[0]?.url).toBe('https://example.com/1');
      expect(result.items[1]?.title).toBe('Result 2');
    });

    it('handles double-encoded JSON strings', async () => {
      const singleEncoded = JSON.stringify([
        { title: 'Double Encoded', url: 'https://example.com/double' },
      ]);
      const doubleEncoded = JSON.stringify(singleEncoded);

      const callTool = vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: doubleEncoded }],
      });

      const service = createWebSearchService({ callTool });
      const result = await service.search('test query');

      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.title).toBe('Double Encoded');
    });

    it('returns content items as records for non-array JSON in text content', async () => {
      const callTool = vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify({ error: 'not an array' }) }],
      });

      const service = createWebSearchService({ callTool });
      const result = await service.search('test query');

      // JSON parsed but not an array, falls back to content items as records
      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.type).toBe('text');
    });

    it('falls back to content items as records when text is not JSON', async () => {
      const callTool = vi.fn().mockResolvedValue({
        content: [
          { type: 'text', text: 'plain text response' },
          { title: 'Structured Item', url: 'https://example.com' },
        ],
      });

      const service = createWebSearchService({ callTool });
      const result = await service.search('test query');

      expect(result.items).toHaveLength(2);
      expect(result.items[0]?.type).toBe('text');
      expect(result.items[1]?.title).toBe('Structured Item');
    });

    it('ignores content items without text property', async () => {
      const callTool = vi.fn().mockResolvedValue({
        content: [{ type: 'image', data: 'base64data' }],
      });

      const service = createWebSearchService({ callTool });
      const result = await service.search('test query');

      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.type).toBe('image');
    });

    it('prefers structuredContent over JSON text parsing', async () => {
      const callTool = vi.fn().mockResolvedValue({
        structuredContent: {
          items: [{ title: 'Structured Result', url: 'https://structured.com' }],
        },
        content: [
          {
            type: 'text',
            text: JSON.stringify([{ title: 'Text Result', url: 'https://text.com' }]),
          },
        ],
      });

      const service = createWebSearchService({ callTool });
      const result = await service.search('test query');

      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.title).toBe('Structured Result');
    });
  });

  describe('searchLocation', () => {
    it('passes searchLocation to the MCP tool args', async () => {
      const callTool = vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify([]) }],
      });

      const service = createWebSearchService({ callTool }, { searchLocation: 'us' });
      await service.search('test query');

      expect(callTool.mock.calls[0][1]).toHaveProperty('location', 'us');
    });

    it('omits location when searchLocation is not set', async () => {
      const callTool = vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify([]) }],
      });

      const service = createWebSearchService({ callTool });
      await service.search('test query');

      expect(callTool.mock.calls[0][1]).not.toHaveProperty('location');
    });
  });
});
