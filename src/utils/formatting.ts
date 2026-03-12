import type { FormattedToolResult } from '../types.ts';
import { truncateText } from './truncation.ts';

export function formatSearchResults(items: Array<Record<string, unknown>>): FormattedToolResult {
  if (items.length === 0) {
    return { summary: 'No search results returned.', details: { items } };
  }

  const lines = items.map((item, index) => {
    const title = String(item.title ?? item.name ?? `Result ${index + 1}`);
    const url = String(item.url ?? item.link ?? '');
    const summary = String(item.summary ?? item.snippet ?? '').trim();
    return [`${index + 1}. ${title}`, url && `   ${url}`, summary && `   ${summary}`]
      .filter(Boolean)
      .join('\n');
  });

  return { summary: lines.join('\n\n'), details: { items } };
}

export function formatReaderResult(payload: Record<string, unknown>): FormattedToolResult {
  const title = String(payload.title ?? 'Untitled page');
  const content = String(payload.content ?? payload.mainContent ?? payload.text ?? '');
  const truncated = truncateText(content, { maxChars: 8_000, label: 'page content' });
  const summary = [`# ${title}`, truncated.text].filter(Boolean).join('\n\n');
  return { summary, details: { ...payload, truncated: truncated.truncated } };
}

export function formatRepoStructure(payload: Record<string, unknown>): FormattedToolResult {
  const structure = String(payload.structure ?? payload.tree ?? payload.content ?? '');
  const truncated = truncateText(structure, { maxChars: 8_000, label: 'repo structure' });
  return { summary: truncated.text || 'No repository structure returned.', details: { ...payload, truncated: truncated.truncated } };
}

export function formatFileContent(payload: Record<string, unknown>): FormattedToolResult {
  const path = String(payload.path ?? 'unknown');
  const content = String(payload.content ?? payload.text ?? '');
  const truncated = truncateText(content, { maxChars: 8_000, label: 'file content' });
  const summary = [`# ${path}`, truncated.text].join('\n\n');
  return { summary, details: { ...payload, truncated: truncated.truncated } };
}
