export interface TruncateOptions {
  maxChars: number;
  label?: string;
}

export interface TruncateResult {
  text: string;
  truncated: boolean;
}

export function truncateText(text: string, options: TruncateOptions): TruncateResult {
  if (text.length <= options.maxChars) {
    return { text, truncated: false };
  }

  const label = options.label ?? 'content';
  const head = text.slice(0, options.maxChars);
  const suffix = `\n\n[${label} truncated: showing ${options.maxChars} of ${text.length} characters]`;
  return { text: `${head}${suffix}`, truncated: true };
}
