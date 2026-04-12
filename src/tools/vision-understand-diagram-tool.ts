import { Type } from '@sinclair/typebox';
import { extractVisionText } from '../services/vision.ts';
import { truncateText } from '../utils/truncation.ts';

export function createVisionUnderstandDiagramTool(service: {
  understandDiagram: (imageSource: string, prompt: string, diagramType?: string) => Promise<unknown>;
}) {
  return {
    name: 'zai_vision_understand_diagram',
    label: 'Z.AI Vision - Understand Diagram',
    description:
      'Interpret architecture, flow, UML, ER, and system diagrams. Optionally specify diagram type for better analysis.',
    parameters: Type.Object({
      image_source: Type.String({ description: 'Local file path or remote URL to the diagram image' }),
      prompt: Type.String({ description: 'What you want to understand or extract from this diagram' }),
      diagram_type: Type.Optional(
        Type.String({
          description:
            "Diagram type hint (e.g., 'architecture', 'flowchart', 'uml', 'er-diagram', 'sequence')",
        }),
      ),
    }),
    async execute(
      _toolCallId: string,
      params: { image_source: string; prompt: string; diagram_type?: string },
      _signal?: unknown,
      onUpdate?: (update: { content: Array<{ type: "text"; text: string }>; details: unknown }) => void,
    ) {
      const typeHint = params.diagram_type ? ` (${params.diagram_type})` : '';
      if (onUpdate) {
        onUpdate({ content: [{ type: 'text' as const, text: `📊 Vision — analyzing diagram${typeHint}...` }], details: undefined });
      }
      const result = await service.understandDiagram(params.image_source, params.prompt, params.diagram_type);
      const text = extractVisionText(result as import('../types.ts').McpToolResult);
      const truncated = truncateText(text, { maxChars: 12_000, label: 'diagram analysis' });
      if (onUpdate) {
        onUpdate({ content: [{ type: 'text' as const, text: `✅ Vision — diagram analysis complete${typeHint}` }], details: undefined });
      }
      return {
        content: [{ type: 'text' as const, text: truncated.text }],
        details: { raw: result, truncated: truncated.truncated },
      };
    },
  };
}
