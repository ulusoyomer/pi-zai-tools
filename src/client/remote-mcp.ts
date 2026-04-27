import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { McpToolResult, ZaiConfig } from '../types.ts';
import { AuthError, RemoteMcpError } from '../utils/errors.ts';
import { withRetry } from '../utils/retry.ts';

export interface RemoteMcpClient {
  callTool(toolName: string, args: Record<string, unknown>): Promise<McpToolResult>;
}

export function createRemoteMcpClient(config: ZaiConfig, path: string): RemoteMcpClient {
  let client: Client | null = null;
  let transport: StreamableHTTPClientTransport | null = null;

  async function ensureConnected(): Promise<Client> {
    if (client) return client;

    if (!config.apiKey) {
      throw new AuthError();
    }

    client = new Client({ name: 'pi-zai-tools', version: '0.4.0' });
    transport = new StreamableHTTPClientTransport(new URL(path, config.baseUrl), {
      requestInit: {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
        },
      },
    });

    const timeout = setTimeout(() => transport!.close().catch(() => undefined), config.timeoutMs);

    try {
      await client.connect(transport);
      return client;
    } catch (error) {
      client = null;
      transport = null;
      const message = error instanceof Error ? error.message : String(error);
      if (/401|403|unauthor/i.test(message)) {
        throw new RemoteMcpError('Z.AI authentication failed. Check ZAI_API_KEY.');
      }
      if (/timeout|abort/i.test(message)) {
        throw new RemoteMcpError(`Z.AI request timed out after ${config.timeoutMs}ms.`);
      }
      throw new RemoteMcpError(message);
    } finally {
      clearTimeout(timeout);
    }
  }

  function resetConnection() {
    transport?.close().catch(() => undefined);
    client?.close().catch(() => undefined);
    client = null;
    transport = null;
  }

  return {
    async callTool(toolName, args) {
      return withRetry(
        async () => {
          const c = await ensureConnected();
          try {
            return (await c.callTool({ name: toolName, arguments: args })) as McpToolResult;
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            // Reset connection on disconnect/reset errors so next call reconnects
            if (/disconnect|closed|reset|transport/i.test(message)) {
              resetConnection();
            }
            throw new RemoteMcpError(message);
          }
        },
        { maxAttempts: 2, delayMs: 500 },
      );
    },
  };
}
