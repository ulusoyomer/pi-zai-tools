# pi-zai-tools

Pi package for Z.AI remote MCP tools.

It bundles one pi extension that exposes these capabilities:
- web search via Z.AI Web Search MCP
- web page reading via Z.AI Web Reader MCP
- public GitHub repository docs / structure / file access via Zread MCP
- AI-powered image and video analysis via Z.AI Vision MCP

## Included tools

### Search & Reading
- `zai_web_search`
- `zai_web_reader`

### Zread (GitHub Repos)
- `zai_zread_search_doc`
- `zai_zread_get_repo_structure`
- `zai_zread_read_file`

### Vision (Image & Video Analysis)
- `zai_vision_ui_to_artifact` — Turn UI screenshots into code, prompts, specs, or descriptions
- `zai_vision_extract_text` — OCR screenshots for code, terminals, docs, and general text
- `zai_vision_diagnose_error` — Analyze error snapshots and propose actionable fixes
- `zai_vision_understand_diagram` — Interpret architecture, flow, UML, ER, and system diagrams
- `zai_vision_analyze_data_viz` — Read charts and dashboards to surface insights and trends
- `zai_vision_ui_diff_check` — Compare two UI shots to flag visual or implementation drift
- `zai_vision_analyze_image` — General-purpose image understanding when other tools don't fit
- `zai_vision_analyze_video` — Inspect videos (local/remote ≤8 MB; MP4/MOV/M4V)

## Requirements

- [pi](https://github.com/badlogic/pi-mono)
- [Node.js](https://nodejs.org/) >= v18 (vision module uses `npx` to spawn the MCP server)
- a valid Z.AI API key with GLM Coding Plan access

## Install

### With pi

```bash
pi install npm:pi-zai-tools
```

### From a local checkout

```bash
pi install /absolute/path/to/pi-zai-tools
```

## Configuration

You can copy `examples.env` as a starting point for local development.


### Required

```bash
export ZAI_API_KEY=your_api_key
```

### Optional

Enable only selected modules:

```bash
export ZAI_ENABLED_MODULES=search,reader,zread,vision
```

Defaults to all modules when omitted.

Set search location (affects web search results):

```bash
export ZAI_SEARCH_LOCATION=us # or 'cn'
```

Defaults to `us` when omitted. Use `cn` for Chinese search results.

Override timeout and base URL:

```bash
export ZAI_TIMEOUT_MS=30000
export ZAI_BASE_URL=https://api.z.ai
```

## Module mapping

- `search` → `zai_web_search`
- `reader` → `zai_web_reader`
- `zread` → `zai_zread_search_doc`, `zai_zread_get_repo_structure`, `zai_zread_read_file`
- `vision` → `zai_vision_ui_to_artifact`, `zai_vision_extract_text`, `zai_vision_diagnose_error`, `zai_vision_understand_diagram`, `zai_vision_analyze_data_viz`, `zai_vision_ui_diff_check`, `zai_vision_analyze_image`, `zai_vision_analyze_video`

## Usage examples

### Search the web

- "Search for recent React Server Components caching guidance"
- "Find best practices for Python async retry strategies"

### Read a page

- "Read https://example.com and summarize it"
- "Fetch this documentation page and list the migration steps"

### Research a GitHub repo with Zread

- "Search docs in vercel/ai for installation steps"
- "Show me the structure of vercel/ai"
- "Read package.json from vercel/ai"

### Analyze images with Vision
- "Analyze this UI screenshot and generate React code from design.png"
- "Extract the code from this screenshot with Python language hint"
- "Diagnose this error message in error.png and suggest a fix"
- "Explain this architecture diagram in arch.png"
- "What insights can you get from this chart in dashboard.png?"
- "Compare the expected and actual UI in expected.png vs actual.png"
- "Describe what happens in this video demo.mp4"

## Tool parameters

### `zai_web_search`
- `query: string`
- `count?: number`

### `zai_web_reader`
- `url: string`

### `zai_zread_search_doc`
- `repo: string` (`owner/repo`)
- `query: string`

### `zai_zread_get_repo_structure`
- `repo: string` (`owner/repo`)

### `zai_zread_read_file`
- `repo: string` (`owner/repo`)
- `path: string`

### `zai_vision_ui_to_artifact`
- `image_source: string` (file path or URL)
- `output_type: string` (`code`, `prompt`, `spec`, or `description`)
- `prompt: string`

### `zai_vision_extract_text`
- `image_source: string` (file path or URL)
- `prompt: string`
- `programming_language?: string` (optional hint)

### `zai_vision_diagnose_error`
- `image_source: string` (file path or URL)
- `prompt: string`
- `context?: string` (optional context)

### `zai_vision_understand_diagram`
- `image_source: string` (file path or URL)
- `prompt: string`
- `diagram_type?: string` (optional hint)

### `zai_vision_analyze_data_viz`
- `image_source: string` (file path or URL)
- `prompt: string`
- `analysis_focus?: string` (optional focus)

### `zai_vision_ui_diff_check`
- `expected_image_source: string` (file path or URL)
- `actual_image_source: string` (file path or URL)
- `prompt: string`

### `zai_vision_analyze_image`
- `image_source: string` (file path or URL)
- `prompt: string`

### `zai_vision_analyze_video`
- `video_source: string` (file path or URL, MP4/MOV/M4V, ≤8 MB)
- `prompt: string`

## Troubleshooting

### Missing API key

If a tool reports that `ZAI_API_KEY` is missing, export it in your shell before launching pi.

### Invalid token / auth failure

Check that:
- the token is correct
- the token is active
- the token has quota left

### Timeout

Increase:

```bash
export ZAI_TIMEOUT_MS=60000
```

### Empty or weak results

- try a broader search query
- verify the target URL is public
- verify the target repository is public and spelled as `owner/repo`

## Validation status

This package includes:
- unit tests for config, truncation, service fallback behavior, and extension registration
- live integration tests against Z.AI MCP endpoints when `ZAI_API_KEY` is available

## Quota note

Quota is controlled by your Z.AI plan, not by this package.

## Security note

Do not hardcode API keys in the package or your repo. Prefer environment variables.

## License

MIT
