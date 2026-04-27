# Changelog

## 0.4.0

Reliability and performance release — adds connection reuse, retry logic, caching, rate tracking, debug logging, search freshness filter, and richer tool descriptions.

### Added
- **JSON string parsing** for all MCP result types — `extractItemsFromResult()` and `extractPayloadFromResult()` shared utilities (`src/utils/json-parse.ts`)
- **Connection reuse** for remote MCP client — lazy-connect pattern, reused across calls with automatic reconnection on disconnect (`src/client/remote-mcp.ts`)
- **Retry logic** with linear backoff — retries transient errors (timeout, ECONNRESET, etc.) up to 2 attempts with 500ms delay (`src/utils/retry.ts`)
- **Search freshness filter** — optional `freshness` parameter on `zai_web_search` tool: `day`, `week`, `month`, or `year`
- **Debug logging** — set `ZAI_DEBUG=true` to log MCP request/response details to stderr (`src/utils/logger.ts`)
- **Search result caching** — TTL-based cache (60s, 50 entries max) avoids redundant API calls for identical queries (`src/utils/cache.ts`)
- **Rate limit tracking** — tracks API call count per 60s window, warns at 80% quota via debug logging (`src/utils/rate-limit.ts`)
- **Richer tool descriptions** — all tools now include example trigger phrases for better agent tool selection
- **`ZAI_SEARCH_LOCATION`** config — defaults to `us` (international results); set to `cn` for Chinese region results
- 43 new unit tests (91 total unit + 5 live integration = 96)

### Changed
- Extracted shared `parseJsonFromText`, `extractItemsFromResult`, `extractPayloadFromResult` utilities — DRY across web-search, web-reader, and zread services
- Remote MCP client no longer creates a new connection per `callTool()` call — significant latency reduction
- Tool version strings updated to `0.4.0`

### Fixed
- Z.AI search API JSON string responses now parsed correctly (double-encoded JSON handling)
- Default search location changed from `cn` to `us` for non-Chinese users

## 0.3.0

UX improvement release — adds real-time progress feedback to all tools.

### Added
- `onUpdate` progress callbacks to all 13 tools, showing real-time status in the pi TUI during execution:
  - **Web Search**: `🔍 Z.AI Web Search — searching: "..."` → `✅ Z.AI Web Search — N result(s) found`
  - **Web Reader**: `🌐 Z.AI Web Reader — reading: hostname/path` → `✅ Z.AI Web Reader — loaded "title"`
  - **Zread Search Doc**: `📚 Zread — searching docs in owner/repo: "..."` → `✅ Zread — N doc result(s)`
  - **Zread Repo Structure**: `📂 Zread — fetching repo structure: owner/repo` → `✅ Zread — structure loaded`
  - **Zread Read File**: `📄 Zread — reading owner/repo/path` → `✅ Zread — file loaded: path`
  - **Vision (all 8 tools)**: Tool-specific progress messages (e.g. `🎨 generating code`, `📝 extracting text`, `🔧 diagnosing error`, `📊 analyzing diagram`, `📈 analyzing data visualization`, `🔎 comparing UI screenshots`, `🖼️ analyzing image`, `🎬 analyzing video`)
- 14 new unit tests for `onUpdate` progress messages (`test/tool-onUpdate.test.ts`)

### Changed
- Refactored extension test helper to use `createMockPi()` factory for DRY test setup
- All tool `execute` signatures now accept optional `signal` and `onUpdate` parameters (backward compatible)

## 0.2.0

Feature release — adds AI-powered image and video analysis via Z.AI Vision MCP.

### Added
- `vision` module with stdio-based MCP client (`src/client/stdio-mcp.ts`)
- `zai_vision_ui_to_artifact` — turn UI screenshots into code, prompts, specs, or descriptions
- `zai_vision_extract_text` — OCR screenshots for code, terminals, docs, and general text
- `zai_vision_diagnose_error` — analyze error snapshots and propose actionable fixes
- `zai_vision_understand_diagram` — interpret architecture, flow, UML, ER, and system diagrams
- `zai_vision_analyze_data_viz` — read charts and dashboards to surface insights and trends
- `zai_vision_ui_diff_check` — compare two UI shots to flag visual or implementation drift
- `zai_vision_analyze_image` — general-purpose image understanding when other tools don't fit
- `zai_vision_analyze_video` — inspect videos (local/remote ≤8 MB; MP4/MOV/M4V)
- `McpCallerWithCleanup` type in `src/types.ts`
- `extractVisionText` helper in `src/services/vision.ts`
- unit tests for vision service (15 tests) and extension registration (2 new tests)

### Changed
- `ENABLED_MODULES` now includes `vision` by default
- `examples.env` updated to list `vision` in module options
- `README.md` updated with vision tools, parameters, and usage examples
- `package.json` description and keywords updated to include vision

## 0.1.2

Metadata update release.

### Added
- Added `repository`, `homepage`, and `bugs` metadata to `package.json`

## 0.1.1

Bug fix release.

### Fixed
- Added `noEmit: true` to tsconfig.json to resolve TypeScript error with `allowImportingTsExtensions`

## 0.1.0

Initial release.

### Added
- `zai_web_search` tool backed by Z.AI Web Search MCP
- `zai_web_reader` tool backed by Z.AI Web Reader MCP
- `zai_zread_search_doc` tool backed by Zread MCP
- `zai_zread_get_repo_structure` tool backed by Zread MCP
- `zai_zread_read_file` tool backed by Zread MCP
- env-based module enable/disable with `ZAI_ENABLED_MODULES`
- unit and live integration tests
