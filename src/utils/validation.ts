import { ENABLED_MODULES } from '../constants.ts';
import type { EnabledModule } from '../types.ts';
import { ConfigError, ValidationError } from './errors.ts';

const enabledModuleSet = new Set<string>(ENABLED_MODULES);

export function parseEnabledModules(value?: string): EnabledModule[] {
  if (!value?.trim()) return [...ENABLED_MODULES];

  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      if (!enabledModuleSet.has(part)) {
        throw new ConfigError(`Unknown ZAI module: ${part}`);
      }
      return part as EnabledModule;
    });
}

export function parseTimeoutMs(value?: string): number {
  if (!value?.trim()) return 30_000;

  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ConfigError('ZAI_TIMEOUT_MS must be a positive integer');
  }
  return parsed;
}

export function assertNonEmptyString(value: string, label: string): string {
  if (!value.trim()) {
    throw new ValidationError(`${label} must not be empty`);
  }
  return value.trim();
}

export function validateRepo(repo: string): string {
  const normalized = assertNonEmptyString(repo, 'repo');
  if (!/^[^/\s]+\/[^/\s]+$/.test(normalized)) {
    throw new ValidationError('Invalid repo format. Expected "owner/repo".');
  }
  return normalized;
}

export function validateUrl(url: string): string {
  const normalized = assertNonEmptyString(url, 'url');
  try {
    const parsed = new URL(normalized);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new ValidationError('URL must start with http:// or https://');
    }
    return parsed.toString();
  } catch (error) {
    if (error instanceof ValidationError) throw error;
    throw new ValidationError('Invalid URL');
  }
}

export function validatePath(path: string): string {
  return assertNonEmptyString(path, 'path');
}
