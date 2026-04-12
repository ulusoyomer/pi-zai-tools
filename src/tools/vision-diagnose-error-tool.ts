import { Type } from '@sinclair/typebox';
import { extractVisionText } from '../services/vision.ts';
import { truncateText } from '../utils/truncation.ts';

export function createVisionDiagnoseErrorTool(service: {
  diagnoseError: (imageSource: string, prompt: string, context?: string) => Promise<unknown>;
}) {
  return {
    name: 'zai_vision_diagnose_error',
    label: 'Z.AI Vision - Diagnose Error',
    description:
      'Analyze error screenshots (stack traces, exception messages) and propose actionable fixes with root cause analysis.',
    parameters: Type.Object({
      image_source: Type.String({ description: 'Local file path or remote URL to the error screenshot' }),
      prompt: Type.String({
        description: 'Description of what you need help with regarding this error',
      }),
      context: Type.Optional(
        Type.String({
          description:
            "Additional context about when the error occurred (e.g., 'during npm install', 'when running the app')",
        }),
      ),
    }),
    async execute(
      _toolCallId: string,
      params: { image_source: string; prompt: string; context?: string },
      _signal?: unknown,
      onUpdate?: (update: { content: Array<{ type: "text"; text: string }>; details: unknown }) => void,
    ) {
      if (onUpdate) {
        onUpdate({ content: [{ type: 'text' as const, text: `🔧 Vision — diagnosing error from screenshot...` }], details: undefined });
      }
      const result = await service.diagnoseError(params.image_source, params.prompt, params.context);
      const text = extractVisionText(result as import('../types.ts').McpToolResult);
      const truncated = truncateText(text, { maxChars: 12_000, label: 'error diagnosis' });
      if (onUpdate) {
        onUpdate({ content: [{ type: 'text' as const, text: `✅ Vision — error diagnosis complete` }], details: undefined });
      }
      return {
        content: [{ type: 'text' as const, text: truncated.text }],
        details: { raw: result, truncated: truncated.truncated },
      };
    },
  };
}
