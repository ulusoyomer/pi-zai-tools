const DEBUG = process.env.ZAI_DEBUG === 'true';

export const logger = {
  debug(message: string, data?: unknown) {
    if (!DEBUG) return;
    const timestamp = new Date().toISOString();
    const payload = data ? ' ' + (typeof data === 'string' ? data : JSON.stringify(data)) : '';
    process.stderr.write(`[ZAI ${timestamp}] ${message}${payload}\n`);
  },
};
