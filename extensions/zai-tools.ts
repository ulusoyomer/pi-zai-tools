import type { ExtensionAPI } from '@mariozechner/pi-coding-agent';
import { MCP_SERVER_PATHS } from '../src/constants.ts';
import { loadConfig } from '../src/config.ts';
import { createRemoteMcpClient } from '../src/client/remote-mcp.ts';
import { createWebReaderService } from '../src/services/web-reader.ts';
import { createWebSearchService } from '../src/services/web-search.ts';
import { createZreadService } from '../src/services/zread.ts';
import { createWebReaderTool } from '../src/tools/web-reader-tool.ts';
import { createWebSearchTool } from '../src/tools/web-search-tool.ts';
import { createZreadGetRepoStructureTool } from '../src/tools/zread-get-repo-structure-tool.ts';
import { createZreadReadFileTool } from '../src/tools/zread-read-file-tool.ts';
import { createZreadSearchDocTool } from '../src/tools/zread-search-doc-tool.ts';
import type { EnvSource } from '../src/types.ts';

interface ExtensionOptions {
  env?: EnvSource;
}

export default function zaiToolsExtension(pi: ExtensionAPI, options?: ExtensionOptions) {
  const config = loadConfig(options?.env);

  if (config.enabledModules.includes('search')) {
    const client = createRemoteMcpClient(config, MCP_SERVER_PATHS.search);
    const service = createWebSearchService(client);
    pi.registerTool(createWebSearchTool(service));
  }

  if (config.enabledModules.includes('reader')) {
    const client = createRemoteMcpClient(config, MCP_SERVER_PATHS.reader);
    const service = createWebReaderService(client);
    pi.registerTool(createWebReaderTool(service));
  }

  if (config.enabledModules.includes('zread')) {
    const client = createRemoteMcpClient(config, MCP_SERVER_PATHS.zread);
    const service = createZreadService(client);
    pi.registerTool(createZreadSearchDocTool(service));
    pi.registerTool(createZreadGetRepoStructureTool(service));
    pi.registerTool(createZreadReadFileTool(service));
  }
}
