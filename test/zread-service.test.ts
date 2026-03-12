import { describe, expect, it, vi } from 'vitest';
import { createZreadService } from '../src/services/zread.ts';

describe('createZreadService', () => {
  it('tries fallback argument shapes for search_doc', async () => {
    const callTool = vi
      .fn()
      .mockRejectedValueOnce(new Error('invalid arguments'))
      .mockResolvedValueOnce({
        content: [{ type: 'text', text: 'ok' }],
        structuredContent: { items: [{ title: 'Doc result' }] },
      });

    const service = createZreadService({ callTool });
    const result = await service.searchDoc('owner/repo', 'auth setup');

    expect(callTool).toHaveBeenCalledTimes(2);
    expect(callTool.mock.calls[0][1]).toEqual({ repo_name: 'owner/repo', query: 'auth setup' });
    expect(callTool.mock.calls[1][1]).toEqual({ repo: 'owner/repo', query: 'auth setup' });
    expect(result.items).toEqual([{ title: 'Doc result' }]);
  });
});
