import { logger } from './logger.ts';

export interface RateTrackerOptions {
  maxCalls: number;
  windowMs: number;
}

export function createRateTracker(options: RateTrackerOptions) {
  const calls: number[] = [];

  function prune() {
    const cutoff = Date.now() - options.windowMs;
    while (calls.length > 0 && calls[0]! < cutoff) {
      calls.shift();
    }
  }

  return {
    record() {
      calls.push(Date.now());
      prune();
      const used = calls.length;
      const remaining = options.maxCalls - used;
      if (remaining <= options.maxCalls * 0.2 && remaining > 0) {
        logger.debug(`⚠️ Z.AI API quota warning: ${remaining}/${options.maxCalls} calls remaining in current window`);
      }
      if (remaining <= 0) {
        logger.debug(`🚫 Z.AI API quota exhausted: ${used}/${options.maxCalls} calls in current window`);
      }
    },
    get remaining(): number {
      prune();
      return Math.max(0, options.maxCalls - calls.length);
    },
    get used(): number {
      prune();
      return calls.length;
    },
    get isLimited(): boolean {
      return this.remaining === 0;
    },
  };
}
