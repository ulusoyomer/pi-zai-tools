import { Type } from '@sinclair/typebox';
import { extractVisionText } from '../services/vision.ts';
import { truncateText } from '../utils/truncation.ts';

export function createVisionAnalyzeVideoTool(service: {
  analyzeVideo: (videoSource: string, prompt: string) => Promise<unknown>;
}) {
  return {
    name: 'zai_vision_analyze_video',
    label: 'Z.AI Vision - Video Analysis',
    description:
      'Inspect videos (local/remote ≤8 MB; MP4/MOV/M4V) to describe scenes, moments, and entities.',
    parameters: Type.Object({
      video_source: Type.String({
        description: 'Local file path or remote URL to the video (supports MP4, MOV, M4V)',
      }),
      prompt: Type.String({
        description: 'Detailed text prompt describing what to analyze or understand from the video',
      }),
    }),
    async execute(_toolCallId: string, params: { video_source: string; prompt: string }) {
      const result = await service.analyzeVideo(params.video_source, params.prompt);
      const text = extractVisionText(result as import('../types.ts').McpToolResult);
      const truncated = truncateText(text, { maxChars: 12_000, label: 'video analysis' });
      return {
        content: [{ type: 'text' as const, text: truncated.text }],
        details: { raw: result, truncated: truncated.truncated },
      };
    },
  };
}
