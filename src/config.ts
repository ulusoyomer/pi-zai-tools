import { DEFAULT_BASE_URL, DEFAULT_TIMEOUT_MS } from './constants.ts';
import type { EnvSource, ZaiConfig } from './types.ts';
import { parseEnabledModules, parseTimeoutMs } from './utils/validation.ts';

function parseSearchLocation(value?: string): ZaiConfig['searchLocation'] {
  if (!value) return 'us';
  const normalized = value.trim().toLowerCase();
  if (normalized === 'cn' || normalized === 'us') {
    return normalized;
  }
  return 'us';
}

export function loadConfig(env: EnvSource = process.env): ZaiConfig {
  return {
    apiKey: env.ZAI_API_KEY?.trim() || undefined,
    baseUrl: env.ZAI_BASE_URL?.trim() || DEFAULT_BASE_URL,
    timeoutMs: env.ZAI_TIMEOUT_MS?.trim() ? parseTimeoutMs(env.ZAI_TIMEOUT_MS) : DEFAULT_TIMEOUT_MS,
    enabledModules: parseEnabledModules(env.ZAI_ENABLED_MODULES),
    searchLocation: parseSearchLocation(env.ZAI_SEARCH_LOCATION),
  };
}
