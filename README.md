# pi-zai-tools

Pi package for Z.AI remote MCP tools.

It bundles one pi extension that exposes these capabilities:
- web search via Z.AI Web Search MCP
- web page reading via Z.AI Web Reader MCP
- public GitHub repository docs / structure / file access via Zread MCP

## Included tools

- `zai_web_search`
- `zai_web_reader`
- `zai_zread_search_doc`
- `zai_zread_get_repo_structure`
- `zai_zread_read_file`

## Requirements

- [pi](https://github.com/badlogic/pi-mono)
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
export ZAI_ENABLED_MODULES=search,reader,zread
```

Defaults to all modules when omitted.

Override timeout and base URL:

```bash
export ZAI_TIMEOUT_MS=30000
export ZAI_BASE_URL=https://api.z.ai
```

## Module mapping

- `search` → `zai_web_search`
- `reader` → `zai_web_reader`
- `zread` → `zai_zread_search_doc`, `zai_zread_get_repo_structure`, `zai_zread_read_file`

## Usage examples

### Search the web

- “Search for recent React Server Components caching guidance”
- “Find best practices for Python async retry strategies”

### Read a page

- “Read https://example.com and summarize it”
- “Fetch this documentation page and list the migration steps”

### Research a GitHub repo with Zread

- “Search docs in vercel/ai for installation steps”
- “Show me the structure of vercel/ai”
- “Read package.json from vercel/ai”

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
