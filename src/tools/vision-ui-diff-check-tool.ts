import { Type } from '@sinclair/typebox';
import { extractVisionText } from '../services/vision.ts';
import { truncateText } from '../utils/truncation.ts';

export function createVisionUiDiffCheckTool(service: {
  uiDiffCheck: (expectedImageSource: string, actualImageSource: string, prompt: string) => Promise<unknown>;
}) {
  return {
    name: 'zai_vision_ui_diff_check',
    label: 'Z.AI Vision - UI Diff Check',
    description:
      'Compare two UI screenshots to flag visual or implementation drift between expected/reference and actual/current designs.',
    parameters: Type.Object({
      expected_image_source: Type.String({
        description: 'Local file path or remote URL to the expected/reference UI image',
      }),
      actual_image_source: Type.String({
        description: 'Local file path or remote URL to the actual/current UI image',
      }),
      prompt: Type.String({
        description: 'Instructions for the comparison. Specify what aspects to focus on.',
      }),
    }),
    async execute(
      _toolCallId: string,
      params: {
        expected_image_source: string;
        actual_image_source: string;
        prompt: string;
      },
      _signal?: unknown,
      onUpdate?: (update: { content: Array<{ type: "text"; text: string }>; details: unknown }) => void,
    ) {
      if (onUpdate) {
        onUpdate({ content: [{ type: 'text' as const, text: `🔎 Vision — comparing UI screenshots...` }], details: undefined });
      }
      const result = await service.uiDiffCheck(
        params.expected_image_source,
        params.actual_image_source,
        params.prompt,
      );
      const text = extractVisionText(result as import('../types.ts').McpToolResult);
      const truncated = truncateText(text, { maxChars: 12_000, label: 'UI diff check' });
      if (onUpdate) {
        onUpdate({ content: [{ type: 'text' as const, text: `✅ Vision — UI comparison complete` }], details: undefined });
      }
      return {
        content: [{ type: 'text' as const, text: truncated.text }],
        details: { raw: result, truncated: truncated.truncated },
      };
    },
  };
}
