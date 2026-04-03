import { Type } from '@sinclair/typebox';
import { extractVisionText } from '../services/vision.ts';
import { truncateText } from '../utils/truncation.ts';

export function createVisionAnalyzeImageTool(service: {
  analyzeImage: (imageSource: string, prompt: string) => Promise<unknown>;
}) {
  return {
    name: 'zai_vision_analyze_image',
    label: 'Z.AI Vision - Image Analysis',
    description:
      'General-purpose image understanding when other specialized vision tools do not fit. Flexible analysis of any visual content.',
    parameters: Type.Object({
      image_source: Type.String({ description: 'Local file path or remote URL to the image' }),
      prompt: Type.String({
        description: 'Detailed description of what you want to analyze or understand from the image',
      }),
    }),
    async execute(_toolCallId: string, params: { image_source: string; prompt: string }) {
      const result = await service.analyzeImage(params.image_source, params.prompt);
      const text = extractVisionText(result as import('../types.ts').McpToolResult);
      const truncated = truncateText(text, { maxChars: 12_000, label: 'image analysis' });
      return {
        content: [{ type: 'text' as const, text: truncated.text }],
        details: { raw: result, truncated: truncated.truncated },
      };
    },
  };
}
