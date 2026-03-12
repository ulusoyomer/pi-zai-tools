import { describe, expect, it } from 'vitest';
import { truncateText } from '../src/utils/truncation.ts';

describe('truncateText', () => {
  it('returns the original text when it fits the limits', () => {
    expect(truncateText('short text', { maxChars: 50 }).text).toBe('short text');
  });

  it('appends a truncation message when the text exceeds the limit', () => {
    const result = truncateText('abcdefghij', { maxChars: 5, label: 'page content' });

    expect(result.text).toContain('abcde');
    expect(result.text).toContain('[page content truncated');
    expect(result.truncated).toBe(true);
  });
});
