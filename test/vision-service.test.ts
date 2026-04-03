import { describe, expect, it, vi } from 'vitest';
import { createVisionService, extractVisionText } from '../src/services/vision.ts';

describe('createVisionService', () => {
  const callTool = vi.fn().mockResolvedValue({
    structuredContent: { content: 'Generated code result' },
  });

  const service = createVisionService({ callTool });

  it('calls ui_to_artifact with correct args', async () => {
    await service.uiToArtifact('design.png', 'code', 'Generate React components');
    expect(callTool).toHaveBeenCalledWith('ui_to_artifact', {
      image_source: 'design.png',
      output_type: 'code',
      prompt: 'Generate React components',
    });
  });

  it('calls extract_text with required args and optional language', async () => {
    await service.extractText('screenshot.png', 'Extract all code', 'python');
    expect(callTool).toHaveBeenCalledWith('extract_text_from_screenshot', {
      image_source: 'screenshot.png',
      prompt: 'Extract all code',
      programming_language: 'python',
    });
  });

  it('calls extract_text without optional language', async () => {
    await service.extractText('screenshot.png', 'Extract text');
    expect(callTool).toHaveBeenCalledWith('extract_text_from_screenshot', {
      image_source: 'screenshot.png',
      prompt: 'Extract text',
    });
  });

  it('calls diagnose_error with context', async () => {
    await service.diagnoseError('error.png', 'What went wrong?', 'during npm install');
    expect(callTool).toHaveBeenCalledWith('diagnose_error_screenshot', {
      image_source: 'error.png',
      prompt: 'What went wrong?',
      context: 'during npm install',
    });
  });

  it('calls understand_diagram with diagram type', async () => {
    await service.understandDiagram('arch.png', 'Explain the flow', 'sequence');
    expect(callTool).toHaveBeenCalledWith('understand_technical_diagram', {
      image_source: 'arch.png',
      prompt: 'Explain the flow',
      diagram_type: 'sequence',
    });
  });

  it('calls analyze_data_viz with focus', async () => {
    await service.analyzeDataViz('chart.png', 'What trends do you see?', 'trends');
    expect(callTool).toHaveBeenCalledWith('analyze_data_visualization', {
      image_source: 'chart.png',
      prompt: 'What trends do you see?',
      analysis_focus: 'trends',
    });
  });

  it('calls ui_diff_check with both images', async () => {
    await service.uiDiffCheck('expected.png', 'actual.png', 'Compare layouts');
    expect(callTool).toHaveBeenCalledWith('ui_diff_check', {
      expected_image_source: 'expected.png',
      actual_image_source: 'actual.png',
      prompt: 'Compare layouts',
    });
  });

  it('calls analyze_image with image and prompt', async () => {
    await service.analyzeImage('photo.png', 'Describe this image');
    expect(callTool).toHaveBeenCalledWith('analyze_image', {
      image_source: 'photo.png',
      prompt: 'Describe this image',
    });
  });

  it('calls analyze_video with video source', async () => {
    await service.analyzeVideo('demo.mp4', 'Summarize the key actions');
    expect(callTool).toHaveBeenCalledWith('analyze_video', {
      video_source: 'demo.mp4',
      prompt: 'Summarize the key actions',
    });
  });
});

describe('extractVisionText', () => {
  it('extracts from structuredContent.content', () => {
    const result = { structuredContent: { content: 'hello world' } };
    expect(extractVisionText(result)).toBe('hello world');
  });

  it('extracts from structuredContent.result', () => {
    const result = { structuredContent: { result: 'fallback result' } };
    expect(extractVisionText(result)).toBe('fallback result');
  });

  it('extracts from structuredContent.text', () => {
    const result = { structuredContent: { text: 'text field' } };
    expect(extractVisionText(result)).toBe('text field');
  });

  it('extracts from content array text item', () => {
    const result = { content: [{ type: 'text', text: 'content text' }] };
    expect(extractVisionText(result)).toBe('content text');
  });

  it('returns empty string when no text found', () => {
    expect(extractVisionText({})).toBe('');
  });

  it('prioritizes structuredContent over content array', () => {
    const result = {
      structuredContent: { content: 'structured' },
      content: [{ type: 'text', text: 'array text' }],
    };
    expect(extractVisionText(result)).toBe('structured');
  });
});
