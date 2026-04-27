export interface RetryOptions {
  maxAttempts: number;
  delayMs: number;
  isRetryable?: (error: Error) => boolean;
}

const DEFAULT_IS_RETRYABLE = (error: Error): boolean => {
  const msg = error.message.toLowerCase();
  return /timeout|abort|econnreset|econnrefused|socket hang up|fetch failed/.test(msg);
};

export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions): Promise<T> {
  const { maxAttempts, delayMs, isRetryable = DEFAULT_IS_RETRYABLE } = options;
  let lastError: Error = new Error('No attempts made');

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt === maxAttempts || !isRetryable(lastError)) {
        throw lastError;
      }
      // Linear backoff: delayMs * attempt
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }

  throw lastError;
}
