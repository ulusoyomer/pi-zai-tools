import { ENABLED_MODULES } from './constants.ts';

export type EnabledModule = (typeof ENABLED_MODULES)[number];

export type EnvSource = Record<string, string | undefined>;

export interface ZaiConfig {
  apiKey?: string;
  baseUrl: string;
  timeoutMs: number;
  enabledModules: EnabledModule[];
  searchLocation?: 'cn' | 'us';
}

export interface TextContentItem {
  type: 'text';
  text: string;
}

export interface JsonContentItem {
  type: string;
  [key: string]: unknown;
}

export interface McpToolResult {
  content?: Array<TextContentItem | JsonContentItem>;
  structuredContent?: unknown;
  [key: string]: unknown;
}

export interface McpCaller {
  callTool: (toolName: string, args: Record<string, unknown>) => Promise<McpToolResult>;
}

export interface McpCallerWithCleanup extends McpCaller {
  close: () => Promise<void>;
}

export interface FormattedToolResult {
  summary: string;
  details: Record<string, unknown>;
}

