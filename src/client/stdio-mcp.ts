import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import type { McpCallerWithCleanup, McpToolResult, ZaiConfig } from '../types.ts';
import { AuthError, RemoteMcpError } from '../utils/errors.ts';
import { logger } from '../utils/logger.ts';

export function createStdioMcpClient(config: ZaiConfig): McpCallerWithCleanup {
  let client: Client | null = null;
  let transport: StdioClientTransport | null = null;

  async function ensureConnected(): Promise<Client> {
    if (client) return client;

    if (!config.apiKey) {
      throw new AuthError();
    }

    client = new Client({ name: 'pi-zai-tools', version: '0.4.0' });
    transport = new StdioClientTransport({
      command: 'npx',
      args: ['-y', '@z_ai/mcp-server'],
      env: {
        Z_AI_API_KEY: config.apiKey,
        Z_AI_MODE: 'ZAI',
        PATH: process.env.PATH ?? '',
        HOME: process.env.HOME ?? '',
      },
      stderr: 'pipe',
    });

    const timeout = setTimeout(() => transport!.close().catch(() => undefined), config.timeoutMs);

    try {
      await client.connect(transport);
      logger.debug('Vision MCP server started');
      return client;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (/timeout|abort/i.test(message)) {
        throw new RemoteMcpError(`Vision MCP server timed out after ${config.timeoutMs}ms.`);
      }
      throw new RemoteMcpError(`Failed to start vision MCP server: ${message}`);
    } finally {
      clearTimeout(timeout);
    }
  }

  return {
    async callTool(toolName: string, args: Record<string, unknown>): Promise<McpToolResult> {
      const c = await ensureConnected();
      logger.debug(`→ ${toolName}`, { args });
      try {
        const result = (await c.callTool({ name: toolName, arguments: args })) as McpToolResult;
        logger.debug(`← ${toolName}`, { contentTypes: result.content?.map((c) => c.type) });
        return result;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new RemoteMcpError(message);
      }
    },

    async close(): Promise<void> {
      await transport?.close().catch(() => undefined);
      await client?.close().catch(() => undefined);
      client = null;
      transport = null;
    },
  };
}
