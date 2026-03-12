import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { McpToolResult, ZaiConfig } from '../types.ts';
import { AuthError, RemoteMcpError } from '../utils/errors.ts';

export interface RemoteMcpClient {
  callTool(toolName: string, args: Record<string, unknown>): Promise<McpToolResult>;
}

export function createRemoteMcpClient(config: ZaiConfig, path: string): RemoteMcpClient {
  return {
    async callTool(toolName, args) {
      if (!config.apiKey) {
        throw new AuthError();
      }

      const client = new Client({ name: 'pi-zai-tools', version: '0.1.0' });
      const transport = new StreamableHTTPClientTransport(new URL(path, config.baseUrl), {
        requestInit: {
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
          },
        },
      });

      const timeout = setTimeout(() => transport.close().catch(() => undefined), config.timeoutMs);

      try {
        await client.connect(transport);
        return (await client.callTool({ name: toolName, arguments: args })) as McpToolResult;
      } catch (error) {
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
        await transport.close().catch(() => undefined);
        await client.close().catch(() => undefined);
      }
    },
  };
}
