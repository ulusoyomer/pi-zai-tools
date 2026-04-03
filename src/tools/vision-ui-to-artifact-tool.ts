import { Type } from '@sinclair/typebox';
import { extractVisionText } from '../services/vision.ts';
import { truncateText } from '../utils/truncation.ts';

export function createVisionUiToArtifactTool(service: {
  uiToArtifact: (imageSource: string, outputType: string, prompt: string) => Promise<unknown>;
}) {
  return {
    name: 'zai_vision_ui_to_artifact',
    label: 'Z.AI Vision - UI to Artifact',
    description:
      'Turn UI screenshots into code, prompts, specs, or descriptions. Supports output types: code, prompt, spec, description.',
    parameters: Type.Object({
      image_source: Type.String({ description: 'Local file path or remote URL to the UI screenshot' }),
      output_type: Type.String({
        description: "Type of output to generate: 'code', 'prompt', 'spec', or 'description'",
      }),
      prompt: Type.String({
        description: 'Detailed instructions describing what to generate from this UI image',
      }),
    }),
    async execute(_toolCallId: string, params: { image_source: string; output_type: string; prompt: string }) {
      const result = await service.uiToArtifact(params.image_source, params.output_type, params.prompt);
      const text = extractVisionText(result as import('../types.ts').McpToolResult);
      const truncated = truncateText(text, { maxChars: 12_000, label: 'UI to artifact result' });
      return {
        content: [{ type: 'text' as const, text: truncated.text }],
        details: { raw: result, truncated: truncated.truncated },
      };
    },
  };
}
