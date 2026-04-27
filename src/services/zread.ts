import { MCP_TOOL_NAMES } from '../constants.ts';
import type { McpCaller } from '../types.ts';
import { extractItemsFromResult, extractPayloadFromResult } from '../utils/json-parse.ts';
import { validatePath, validateRepo } from '../utils/validation.ts';

const SEARCH_DOC_ARG_SHAPES = [
  (repo: string, query: string) => ({ repo_name: repo, query }),
  (repo: string, query: string) => ({ repo, query }),
  (repo: string, query: string) => ({ repository: repo, query }),
  (repo: string, query: string) => ({ repo, search_query: query }),
];

const REPO_STRUCTURE_ARG_SHAPES = [
  (repo: string) => ({ repo_name: repo }),
  (repo: string) => ({ repo }),
  (repo: string) => ({ repository: repo }),
];

const READ_FILE_ARG_SHAPES = [
  (repo: string, path: string) => ({ repo_name: repo, file_path: path }),
  (repo: string, path: string) => ({ repo_name: repo, path }),
  (repo: string, path: string) => ({ repo, path }),
  (repo: string, path: string) => ({ repository: repo, file_path: path }),
];

export function createZreadService(client: McpCaller) {
  return {
    async searchDoc(repo: string, query: string) {
      const normalizedRepo = validateRepo(repo);
      const normalizedQuery = query.trim();
      const raw = await tryCandidates(client, MCP_TOOL_NAMES.zreadSearchDoc, SEARCH_DOC_ARG_SHAPES.map((shape) => shape(normalizedRepo, normalizedQuery)));
      return { items: extractItemsFromResult(raw), raw };
    },
    async getRepoStructure(repo: string) {
      const normalizedRepo = validateRepo(repo);
      const raw = await tryCandidates(client, MCP_TOOL_NAMES.zreadGetRepoStructure, REPO_STRUCTURE_ARG_SHAPES.map((shape) => shape(normalizedRepo)));
      return { payload: extractPayloadFromResult(raw), raw };
    },
    async readFile(repo: string, path: string) {
      const normalizedRepo = validateRepo(repo);
      const normalizedPath = validatePath(path);
      const raw = await tryCandidates(client, MCP_TOOL_NAMES.zreadReadFile, READ_FILE_ARG_SHAPES.map((shape) => shape(normalizedRepo, normalizedPath)));
      return { payload: { ...extractPayloadFromResult(raw), path: normalizedPath }, raw };
    },
  };
}

async function tryCandidates(client: McpCaller, toolName: string, candidates: Array<Record<string, unknown>>) {
  let lastError: unknown;

  for (const candidate of candidates) {
    try {
      return await client.callTool(toolName, candidate);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}
