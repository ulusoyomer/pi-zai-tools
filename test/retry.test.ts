import { describe, expect, it, vi } from 'vitest';
import { withRetry } from '../src/utils/retry.ts';

describe('withRetry', () => {
  it('returns result on first successful attempt', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const result = await withRetry(fn, { maxAttempts: 3, delayMs: 10 });
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on failure and succeeds on second attempt', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('timeout'))
      .mockResolvedValue('success');
    const result = await withRetry(fn, { maxAttempts: 3, delayMs: 10 });
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('throws after max attempts exhausted', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('persistent timeout'));
    await expect(withRetry(fn, { maxAttempts: 3, delayMs: 10 })).rejects.toThrow('persistent timeout');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('does not retry on non-retryable errors', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('auth failed'));
    await expect(
      withRetry(fn, { maxAttempts: 3, delayMs: 10, isRetryable: (e) => !/auth/i.test(e.message) }),
    ).rejects.toThrow('auth failed');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries retryable errors by default (timeout, econnreset)', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('ECONNRESET'))
      .mockResolvedValue('ok');
    const result = await withRetry(fn, { maxAttempts: 2, delayMs: 10 });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('does not retry errors that do not match default retryable patterns', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('Some random error'));
    await expect(withRetry(fn, { maxAttempts: 3, delayMs: 10 })).rejects.toThrow('Some random error');
    // Default only retries timeout/abort/econnreset etc., so random errors are retried
    // because the default isRetryable only returns false for truly non-matching messages
    // Actually "Some random error" does NOT match the default patterns, so it should NOT retry
    // But looking at the code: it throws immediately when isRetryable returns false
    // and "Some random error" does NOT match any default pattern, so fn should be called 1 time
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
