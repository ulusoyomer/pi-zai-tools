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
});
