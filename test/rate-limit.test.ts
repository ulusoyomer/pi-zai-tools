import { describe, expect, it, vi } from 'vitest';
import { createRateTracker } from '../src/utils/rate-limit.ts';

describe('createRateTracker', () => {
  it('tracks remaining calls', () => {
    const tracker = createRateTracker({ maxCalls: 5, windowMs: 60_000 });
    expect(tracker.remaining).toBe(5);
    expect(tracker.used).toBe(0);
  });

  it('decrements remaining on record', () => {
    const tracker = createRateTracker({ maxCalls: 5, windowMs: 60_000 });
    tracker.record();
    tracker.record();
    expect(tracker.remaining).toBe(3);
    expect(tracker.used).toBe(2);
  });

  it('reports isLimited when exhausted', () => {
    const tracker = createRateTracker({ maxCalls: 3, windowMs: 60_000 });
    tracker.record();
    tracker.record();
    tracker.record();
    expect(tracker.isLimited).toBe(true);
    expect(tracker.remaining).toBe(0);
  });

  it('is not limited when calls remain', () => {
    const tracker = createRateTracker({ maxCalls: 5, windowMs: 60_000 });
    tracker.record();
    expect(tracker.isLimited).toBe(false);
  });

  it('expires old calls after window', async () => {
    const tracker = createRateTracker({ maxCalls: 2, windowMs: 50 });
    tracker.record();
    tracker.record();
    expect(tracker.remaining).toBe(0);
    await new Promise((r) => setTimeout(r, 100));
    expect(tracker.remaining).toBe(2);
  });
});
