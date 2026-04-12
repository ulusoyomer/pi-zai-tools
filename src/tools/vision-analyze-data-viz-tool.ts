import { Type } from '@sinclair/typebox';
import { extractVisionText } from '../services/vision.ts';
import { truncateText } from '../utils/truncation.ts';

export function createVisionAnalyzeDataVizTool(service: {
  analyzeDataViz: (imageSource: string, prompt: string, analysisFocus?: string) => Promise<unknown>;
}) {
  return {
    name: 'zai_vision_analyze_data_viz',
    label: 'Z.AI Vision - Analyze Data Visualization',
    description:
      'Read charts and dashboards to surface insights, trends, and anomalies. Optionally specify analysis focus area.',
    parameters: Type.Object({
      image_source: Type.String({ description: 'Local file path or remote URL to the chart/dashboard image' }),
      prompt: Type.String({
        description: 'What insights or information you want to extract from this visualization',
      }),
      analysis_focus: Type.Optional(
        Type.String({
          description:
            "Focus area (e.g., 'trends', 'anomalies', 'comparisons', 'performance metrics')",
        }),
      ),
    }),
    async execute(
      _toolCallId: string,
      params: { image_source: string; prompt: string; analysis_focus?: string },
      _signal?: unknown,
      onUpdate?: (update: { content: Array<{ type: "text"; text: string }>; details: unknown }) => void,
    ) {
      const focusHint = params.analysis_focus ? ` — focus: ${params.analysis_focus}` : '';
      if (onUpdate) {
        onUpdate({ content: [{ type: 'text' as const, text: `📈 Vision — analyzing data visualization${focusHint}...` }], details: undefined });
      }
      const result = await service.analyzeDataViz(params.image_source, params.prompt, params.analysis_focus);
      const text = extractVisionText(result as import('../types.ts').McpToolResult);
      const truncated = truncateText(text, { maxChars: 12_000, label: 'data viz analysis' });
      if (onUpdate) {
        onUpdate({ content: [{ type: 'text' as const, text: `✅ Vision — data visualization analysis complete` }], details: undefined });
      }
      return {
        content: [{ type: 'text' as const, text: truncated.text }],
        details: { raw: result, truncated: truncated.truncated },
      };
    },
  };
}
