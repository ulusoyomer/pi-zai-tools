import { MCP_TOOL_NAMES } from '../constants.ts';
import type { McpCaller, McpToolResult } from '../types.ts';
import { assertNonEmptyString } from '../utils/validation.ts';

export function createVisionService(client: McpCaller) {
  return {
    async uiToArtifact(imageSource: string, outputType: string, prompt: string) {
      const args = {
        image_source: assertNonEmptyString(imageSource, 'image_source'),
        output_type: assertNonEmptyString(outputType, 'output_type'),
        prompt: assertNonEmptyString(prompt, 'prompt'),
      };
      return client.callTool(MCP_TOOL_NAMES.visionUiToArtifact, args);
    },

    async extractText(imageSource: string, prompt: string, programmingLanguage?: string) {
      const args: Record<string, unknown> = {
        image_source: assertNonEmptyString(imageSource, 'image_source'),
        prompt: assertNonEmptyString(prompt, 'prompt'),
      };
      if (programmingLanguage?.trim()) {
        args.programming_language = programmingLanguage.trim();
      }
      return client.callTool(MCP_TOOL_NAMES.visionExtractText, args);
    },

    async diagnoseError(imageSource: string, prompt: string, context?: string) {
      const args: Record<string, unknown> = {
        image_source: assertNonEmptyString(imageSource, 'image_source'),
        prompt: assertNonEmptyString(prompt, 'prompt'),
      };
      if (context?.trim()) {
        args.context = context.trim();
      }
      return client.callTool(MCP_TOOL_NAMES.visionDiagnoseError, args);
    },

    async understandDiagram(imageSource: string, prompt: string, diagramType?: string) {
      const args: Record<string, unknown> = {
        image_source: assertNonEmptyString(imageSource, 'image_source'),
        prompt: assertNonEmptyString(prompt, 'prompt'),
      };
      if (diagramType?.trim()) {
        args.diagram_type = diagramType.trim();
      }
      return client.callTool(MCP_TOOL_NAMES.visionUnderstandDiagram, args);
    },

    async analyzeDataViz(imageSource: string, prompt: string, analysisFocus?: string) {
      const args: Record<string, unknown> = {
        image_source: assertNonEmptyString(imageSource, 'image_source'),
        prompt: assertNonEmptyString(prompt, 'prompt'),
      };
      if (analysisFocus?.trim()) {
        args.analysis_focus = analysisFocus.trim();
      }
      return client.callTool(MCP_TOOL_NAMES.visionAnalyzeDataViz, args);
    },

    async uiDiffCheck(expectedImageSource: string, actualImageSource: string, prompt: string) {
      return client.callTool(MCP_TOOL_NAMES.visionUiDiffCheck, {
        expected_image_source: assertNonEmptyString(expectedImageSource, 'expected_image_source'),
        actual_image_source: assertNonEmptyString(actualImageSource, 'actual_image_source'),
        prompt: assertNonEmptyString(prompt, 'prompt'),
      });
    },

    async analyzeImage(imageSource: string, prompt: string) {
      return client.callTool(MCP_TOOL_NAMES.visionAnalyzeImage, {
        image_source: assertNonEmptyString(imageSource, 'image_source'),
        prompt: assertNonEmptyString(prompt, 'prompt'),
      });
    },

    async analyzeVideo(videoSource: string, prompt: string) {
      return client.callTool(MCP_TOOL_NAMES.visionAnalyzeVideo, {
        video_source: assertNonEmptyString(videoSource, 'video_source'),
        prompt: assertNonEmptyString(prompt, 'prompt'),
      });
    },
  };
}

export function extractVisionText(result: McpToolResult): string {
  if (result.structuredContent && typeof result.structuredContent === 'object') {
    const structured = result.structuredContent as Record<string, unknown>;
    for (const key of ['content', 'result', 'text', 'output'] as const) {
      if (typeof structured[key] === 'string') return structured[key];
    }
  }

  const textItem = result.content?.find((item) => item.type === 'text');
  return typeof textItem?.text === 'string' ? textItem.text : '';
}
