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

    it('handles double-encoded JSON strings (Z.AI API format)', async () => {
      const callTool = vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: '"[]"' }],
      });

      const service = createWebSearchService({ callTool });
      const result = await service.search('test query');

      expect(result.items).toEqual([]);
    });

    it('handles actual double-encoded search results', async () => {
      const searchResults = [
        { title: 'AI News', url: 'https://example.com', summary: 'Latest AI' },
      ];
      const doubleEncoded = JSON.stringify(JSON.stringify(searchResults));
      const callTool = vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: doubleEncoded }],
      });

      const service = createWebSearchService({ callTool });
      const result = await service.search('test query');

      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.title).toBe('AI News');
    });

    it('falls back to structured content when available', async () => {
      const callTool = vi.fn().mockResolvedValue({
        structuredContent: {
          results: [{ title: 'Structured Result', url: 'https://example.com' }],
        },
      });

      const service = createWebSearchService({ callTool });
      const result = await service.search('test query');

      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.title).toBe('Structured Result');
    });

    it('handles empty results gracefully', async () => {
      const callTool = vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: '"[]"' }],
      });

      const service = createWebSearchService({ callTool });
      const result = await service.search('test query');

      expect(result.items).toEqual([]);
    });
  });

  describe('search location', () => {
    it('includes location parameter when configured', async () => {
      const callTool = vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: '"[]"' }],
      });

      const service = createWebSearchService({ callTool }, { searchLocation: 'us' });
      await service.search('test query');

      expect(callTool).toHaveBeenCalledWith(
        'web_search_prime',
        expect.objectContaining({
          search_query: 'test query',
          content_size: 'medium',
          location: 'us',
        })
      );
    });

    it('omits location parameter when not configured', async () => {
      const callTool = vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: '"[]"' }],
      });

      const service = createWebSearchService({ callTool });
      await service.search('test query');

      expect(callTool).toHaveBeenCalledWith(
        'web_search_prime',
        expect.objectContaining({
          search_query: 'test query',
          content_size: 'medium',
        })
      );
      expect(callTool).toHaveBeenCalledWith(
        'web_search_prime',
        expect.not.objectContaining({ location: expect.anything() })
      );
    });
  });
});
