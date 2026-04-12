import { Type } from '@sinclair/typebox';
import { extractVisionText } from '../services/vision.ts';
import { truncateText } from '../utils/truncation.ts';

export function createVisionExtractTextTool(service: {
  extractText: (imageSource: string, prompt: string, programmingLanguage?: string) => Promise<unknown>;
}) {
  return {
    name: 'zai_vision_extract_text',
    label: 'Z.AI Vision - Extract Text (OCR)',
    description:
      'OCR screenshots for code, terminals, docs, and general text. Optionally specify programming language for better code extraction.',
    parameters: Type.Object({
      image_source: Type.String({ description: 'Local file path or remote URL to the image' }),
      prompt: Type.String({ description: 'Instructions for text extraction and formatting requirements' }),
      programming_language: Type.Optional(
        Type.String({
          description:
            "Programming language hint if the screenshot contains code (e.g., 'python', 'javascript', 'java')",
        }),
      ),
    }),
    async execute(
      _toolCallId: string,
      params: { image_source: string; prompt: string; programming_language?: string },
      _signal?: unknown,
      onUpdate?: (update: { content: Array<{ type: "text"; text: string }>; details: unknown }) => void,
    ) {
      const langHint = params.programming_language ? ` (${params.programming_language})` : '';
      if (onUpdate) {
        onUpdate({ content: [{ type: 'text' as const, text: `📝 Vision — extracting text from image${langHint}...` }], details: undefined });
      }
      const result = await service.extractText(params.image_source, params.prompt, params.programming_language);
      const text = extractVisionText(result as import('../types.ts').McpToolResult);
      const truncated = truncateText(text, { maxChars: 12_000, label: 'extracted text' });
      if (onUpdate) {
        onUpdate({ content: [{ type: 'text' as const, text: `✅ Vision — text extracted successfully${langHint}` }], details: undefined });
      }
      return {
        content: [{ type: 'text' as const, text: truncated.text }],
        details: { raw: result, truncated: truncated.truncated },
      };
    },
  };
}
