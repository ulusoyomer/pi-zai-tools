export const DEFAULT_BASE_URL = 'https://api.z.ai';
export const DEFAULT_TIMEOUT_MS = 30_000;

export const ENABLED_MODULES = ['search', 'reader', 'zread', 'vision'] as const;

export const MCP_SERVER_PATHS = {
  search: '/api/mcp/web_search_prime/mcp',
  reader: '/api/mcp/web_reader/mcp',
  zread: '/api/mcp/zread/mcp',
} as const;

export const MCP_TOOL_NAMES = {
  webSearch: ['web_search_prime', 'webSearchPrime', 'web_search_prime_web_search_prime'],
  webReader: 'webReader',
  zreadSearchDoc: 'search_doc',
  zreadGetRepoStructure: 'get_repo_structure',
  zreadReadFile: 'read_file',
  visionUiToArtifact: 'ui_to_artifact',
  visionExtractText: 'extract_text_from_screenshot',
  visionDiagnoseError: 'diagnose_error_screenshot',
  visionUnderstandDiagram: 'understand_technical_diagram',
  visionAnalyzeDataViz: 'analyze_data_visualization',
  visionUiDiffCheck: 'ui_diff_check',
  visionAnalyzeImage: 'analyze_image',
  visionAnalyzeVideo: 'analyze_video',
} as const;
