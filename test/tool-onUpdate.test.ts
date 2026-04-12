import { describe, expect, it, vi } from 'vitest';
import { createWebSearchTool } from '../src/tools/web-search-tool.ts';
import { createWebReaderTool } from '../src/tools/web-reader-tool.ts';
import { createZreadSearchDocTool } from '../src/tools/zread-search-doc-tool.ts';
import { createZreadGetRepoStructureTool } from '../src/tools/zread-get-repo-structure-tool.ts';
import { createZreadReadFileTool } from '../src/tools/zread-read-file-tool.ts';
import { createVisionAnalyzeImageTool } from '../src/tools/vision-analyze-image-tool.ts';
import { createVisionAnalyzeVideoTool } from '../src/tools/vision-analyze-video-tool.ts';
import { createVisionUiToArtifactTool } from '../src/tools/vision-ui-to-artifact-tool.ts';
import { createVisionExtractTextTool } from '../src/tools/vision-extract-text-tool.ts';
import { createVisionDiagnoseErrorTool } from '../src/tools/vision-diagnose-error-tool.ts';
import { createVisionUnderstandDiagramTool } from '../src/tools/vision-understand-diagram-tool.ts';
import { createVisionAnalyzeDataVizTool } from '../src/tools/vision-analyze-data-viz-tool.ts';
import { createVisionUiDiffCheckTool } from '../src/tools/vision-ui-diff-check-tool.ts';

describe('tool onUpdate progress messages', () => {
  it('web search tool calls onUpdate with progress info', async () => {
    const service = {
      search: vi.fn().mockResolvedValue({
        items: [{ title: 'Test', url: 'https://example.com', snippet: 'test snippet' }],
        raw: {},
      }),
    };
    const tool = createWebSearchTool(service);
    const onUpdate = vi.fn();

    await tool.execute('call-1', { query: 'test query' }, undefined, onUpdate);

    expect(onUpdate).toHaveBeenCalledTimes(2);
    expect(onUpdate.mock.calls[0][0].content[0].text).toContain('searching');
    expect(onUpdate.mock.calls[0][0].content[0].text).toContain('test query');
    expect(onUpdate.mock.calls[1][0].content[0].text).toContain('result(s) found');
  });

  it('web reader tool calls onUpdate with progress info', async () => {
    const service = {
      read: vi.fn().mockResolvedValue({
        payload: { title: 'Test Page', content: 'Hello world' },
        raw: {},
      }),
    };
    const tool = createWebReaderTool(service);
    const onUpdate = vi.fn();

    await tool.execute('call-1', { url: 'https://example.com/path' }, undefined, onUpdate);

    expect(onUpdate).toHaveBeenCalledTimes(2);
    expect(onUpdate.mock.calls[0][0].content[0].text).toContain('reading');
    expect(onUpdate.mock.calls[0][0].content[0].text).toContain('example.com');
    expect(onUpdate.mock.calls[1][0].content[0].text).toContain('loaded');
  });

  it('zread search doc tool calls onUpdate with progress info', async () => {
    const service = {
      searchDoc: vi.fn().mockResolvedValue({
        items: [{ title: 'Doc1' }],
        raw: {},
      }),
    };
    const tool = createZreadSearchDocTool(service);
    const onUpdate = vi.fn();

    await tool.execute('call-1', { repo: 'owner/repo', query: 'how to test' }, undefined, onUpdate);

    expect(onUpdate).toHaveBeenCalledTimes(2);
    expect(onUpdate.mock.calls[0][0].content[0].text).toContain('searching docs');
    expect(onUpdate.mock.calls[0][0].content[0].text).toContain('owner/repo');
    expect(onUpdate.mock.calls[1][0].content[0].text).toContain('doc result');
  });

  it('zread get repo structure tool calls onUpdate with progress info', async () => {
    const service = {
      getRepoStructure: vi.fn().mockResolvedValue({
        payload: { structure: 'src/\n  index.ts' },
        raw: {},
      }),
    };
    const tool = createZreadGetRepoStructureTool(service);
    const onUpdate = vi.fn();

    await tool.execute('call-1', { repo: 'owner/repo' }, undefined, onUpdate);

    expect(onUpdate).toHaveBeenCalledTimes(2);
    expect(onUpdate.mock.calls[0][0].content[0].text).toContain('fetching repo structure');
    expect(onUpdate.mock.calls[1][0].content[0].text).toContain('structure loaded');
  });

  it('zread read file tool calls onUpdate with progress info', async () => {
    const service = {
      readFile: vi.fn().mockResolvedValue({
        payload: { content: 'export default {}', path: 'src/index.ts' },
        raw: {},
      }),
    };
    const tool = createZreadReadFileTool(service);
    const onUpdate = vi.fn();

    await tool.execute('call-1', { repo: 'owner/repo', path: 'src/index.ts' }, undefined, onUpdate);

    expect(onUpdate).toHaveBeenCalledTimes(2);
    expect(onUpdate.mock.calls[0][0].content[0].text).toContain('reading');
    expect(onUpdate.mock.calls[0][0].content[0].text).toContain('src/index.ts');
    expect(onUpdate.mock.calls[1][0].content[0].text).toContain('file loaded');
  });

  it('vision analyze image tool calls onUpdate with progress info', async () => {
    const service = {
      analyzeImage: vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: 'An image of a cat' }],
      }),
    };
    const tool = createVisionAnalyzeImageTool(service);
    const onUpdate = vi.fn();

    await tool.execute('call-1', { image_source: '/tmp/cat.png', prompt: 'describe' }, undefined, onUpdate);

    expect(onUpdate).toHaveBeenCalledTimes(2);
    expect(onUpdate.mock.calls[0][0].content[0].text).toContain('analyzing image');
    expect(onUpdate.mock.calls[1][0].content[0].text).toContain('image analysis complete');
  });

  it('vision analyze video tool calls onUpdate with progress info', async () => {
    const service = {
      analyzeVideo: vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: 'A video of a demo' }],
      }),
    };
    const tool = createVisionAnalyzeVideoTool(service);
    const onUpdate = vi.fn();

    await tool.execute('call-1', { video_source: '/tmp/demo.mp4', prompt: 'describe' }, undefined, onUpdate);

    expect(onUpdate).toHaveBeenCalledTimes(2);
    expect(onUpdate.mock.calls[0][0].content[0].text).toContain('analyzing video');
    expect(onUpdate.mock.calls[1][0].content[0].text).toContain('video analysis complete');
  });

  it('vision ui to artifact tool calls onUpdate with progress info', async () => {
    const service = {
      uiToArtifact: vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: '<button>Click</button>' }],
      }),
    };
    const tool = createVisionUiToArtifactTool(service);
    const onUpdate = vi.fn();

    await tool.execute('call-1', { image_source: '/tmp/ui.png', output_type: 'code', prompt: 'generate code' }, undefined, onUpdate);

    expect(onUpdate).toHaveBeenCalledTimes(2);
    expect(onUpdate.mock.calls[0][0].content[0].text).toContain('generating code');
    expect(onUpdate.mock.calls[1][0].content[0].text).toContain('code generated');
  });

  it('vision extract text tool calls onUpdate with progress info', async () => {
    const service = {
      extractText: vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: 'extracted code here' }],
      }),
    };
    const tool = createVisionExtractTextTool(service);
    const onUpdate = vi.fn();

    await tool.execute('call-1', { image_source: '/tmp/code.png', prompt: 'extract' }, undefined, onUpdate);

    expect(onUpdate).toHaveBeenCalledTimes(2);
    expect(onUpdate.mock.calls[0][0].content[0].text).toContain('extracting text');
    expect(onUpdate.mock.calls[1][0].content[0].text).toContain('text extracted');
  });

  it('vision diagnose error tool calls onUpdate with progress info', async () => {
    const service = {
      diagnoseError: vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: 'Fix the null pointer' }],
      }),
    };
    const tool = createVisionDiagnoseErrorTool(service);
    const onUpdate = vi.fn();

    await tool.execute('call-1', { image_source: '/tmp/error.png', prompt: 'diagnose' }, undefined, onUpdate);

    expect(onUpdate).toHaveBeenCalledTimes(2);
    expect(onUpdate.mock.calls[0][0].content[0].text).toContain('diagnosing error');
    expect(onUpdate.mock.calls[1][0].content[0].text).toContain('error diagnosis complete');
  });

  it('vision understand diagram tool calls onUpdate with progress info', async () => {
    const service = {
      understandDiagram: vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: 'This is a flowchart' }],
      }),
    };
    const tool = createVisionUnderstandDiagramTool(service);
    const onUpdate = vi.fn();

    await tool.execute('call-1', { image_source: '/tmp/diagram.png', prompt: 'explain' }, undefined, onUpdate);

    expect(onUpdate).toHaveBeenCalledTimes(2);
    expect(onUpdate.mock.calls[0][0].content[0].text).toContain('analyzing diagram');
    expect(onUpdate.mock.calls[1][0].content[0].text).toContain('diagram analysis complete');
  });

  it('vision analyze data viz tool calls onUpdate with progress info', async () => {
    const service = {
      analyzeDataViz: vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: 'Sales are increasing' }],
      }),
    };
    const tool = createVisionAnalyzeDataVizTool(service);
    const onUpdate = vi.fn();

    await tool.execute('call-1', { image_source: '/tmp/chart.png', prompt: 'analyze' }, undefined, onUpdate);

    expect(onUpdate).toHaveBeenCalledTimes(2);
    expect(onUpdate.mock.calls[0][0].content[0].text).toContain('analyzing data visualization');
    expect(onUpdate.mock.calls[1][0].content[0].text).toContain('data visualization analysis complete');
  });

  it('vision ui diff check tool calls onUpdate with progress info', async () => {
    const service = {
      uiDiffCheck: vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: 'No differences found' }],
      }),
    };
    const tool = createVisionUiDiffCheckTool(service);
    const onUpdate = vi.fn();

    await tool.execute('call-1', { expected_image_source: '/tmp/a.png', actual_image_source: '/tmp/b.png', prompt: 'compare' }, undefined, onUpdate);

    expect(onUpdate).toHaveBeenCalledTimes(2);
    expect(onUpdate.mock.calls[0][0].content[0].text).toContain('comparing UI screenshots');
    expect(onUpdate.mock.calls[1][0].content[0].text).toContain('UI comparison complete');
  });

  it('tools work without onUpdate (backward compatible)', async () => {
    const service = {
      search: vi.fn().mockResolvedValue({
        items: [{ title: 'Test', url: 'https://example.com' }],
        raw: {},
      }),
    };
    const tool = createWebSearchTool(service);

    const result = await tool.execute('call-1', { query: 'test' }, undefined, undefined);
    expect(result.content[0].type).toBe('text');
  });
});
