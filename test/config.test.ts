import { describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config.ts';

describe('loadConfig', () => {
  it('enables all modules by default', () => {
    const config = loadConfig({ ZAI_API_KEY: 'test-key' });

    expect(config.apiKey).toBe('test-key');
    expect(config.enabledModules).toEqual(['search', 'reader', 'zread', 'vision']);
    expect(config.baseUrl).toBe('https://api.z.ai');
    expect(config.timeoutMs).toBe(30_000);
  });

  it('parses a custom module list', () => {
    const config = loadConfig({
      ZAI_API_KEY: 'test-key',
      ZAI_ENABLED_MODULES: 'search,reader',
      ZAI_TIMEOUT_MS: '45000',
      ZAI_BASE_URL: 'https://custom.example.com',
    });

    expect(config.enabledModules).toEqual(['search', 'reader']);
    expect(config.timeoutMs).toBe(45_000);
    expect(config.baseUrl).toBe('https://custom.example.com');
  });

  it('rejects unknown modules', () => {
    expect(() =>
      loadConfig({
        ZAI_API_KEY: 'test-key',
        ZAI_ENABLED_MODULES: 'search,unknown',
      }),
    ).toThrow('Unknown ZAI module: unknown');
  });

  it('rejects a non-positive timeout', () => {
    expect(() => loadConfig({ ZAI_API_KEY: 'test-key', ZAI_TIMEOUT_MS: '0' })).toThrow(
      'ZAI_TIMEOUT_MS must be a positive integer',
    );
  });
});
