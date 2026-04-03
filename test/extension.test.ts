import { describe, expect, it, vi } from 'vitest';
import extension from '../extensions/zai-tools.ts';

describe('zai tools extension', () => {
  it('registers only enabled module tools', () => {
    const registerTool = vi.fn();

    extension({
      registerTool,
      exec: vi.fn(),
      on: vi.fn(),
      registerCommand: vi.fn(),
      registerShortcut: vi.fn(),
      registerFlag: vi.fn(),
      getFlag: vi.fn(),
      sendMessage: vi.fn(),
      sendUserMessage: vi.fn(),
      appendEntry: vi.fn(),
      setSessionName: vi.fn(),
      getSessionName: vi.fn(),
      setLabel: vi.fn(),
      getCommands: vi.fn(() => []),
      registerMessageRenderer: vi.fn(),
      getActiveTools: vi.fn(() => []),
      getAllTools: vi.fn(() => []),
      setActiveTools: vi.fn(),
      setModel: vi.fn(),
      getThinkingLevel: vi.fn(),
      setThinkingLevel: vi.fn(),
      events: { on: vi.fn(), emit: vi.fn() },
      registerProvider: vi.fn(),
      unregisterProvider: vi.fn(),
    } as never, {
      env: {
        ZAI_API_KEY: 'test-key',
        ZAI_ENABLED_MODULES: 'search,reader',
      },
    });

    const names = registerTool.mock.calls.map(([tool]) => tool.name);
    expect(names).toEqual(['zai_web_search', 'zai_web_reader']);
  });

  it('registers vision tools when vision module is enabled', () => {
    const registerTool = vi.fn();

    extension({
      registerTool,
      exec: vi.fn(),
      on: vi.fn(),
      registerCommand: vi.fn(),
      registerShortcut: vi.fn(),
      registerFlag: vi.fn(),
      getFlag: vi.fn(),
      sendMessage: vi.fn(),
      sendUserMessage: vi.fn(),
      appendEntry: vi.fn(),
      setSessionName: vi.fn(),
      getSessionName: vi.fn(),
      setLabel: vi.fn(),
      getCommands: vi.fn(() => []),
      registerMessageRenderer: vi.fn(),
      getActiveTools: vi.fn(() => []),
      getAllTools: vi.fn(() => []),
      setActiveTools: vi.fn(),
      setModel: vi.fn(),
      getThinkingLevel: vi.fn(),
      setThinkingLevel: vi.fn(),
      events: { on: vi.fn(), emit: vi.fn() },
      registerProvider: vi.fn(),
      unregisterProvider: vi.fn(),
    } as never, {
      env: {
        ZAI_API_KEY: 'test-key',
        ZAI_ENABLED_MODULES: 'vision',
      },
    });

    const names = registerTool.mock.calls.map(([tool]) => tool.name);
    expect(names).toEqual([
      'zai_vision_ui_to_artifact',
      'zai_vision_extract_text',
      'zai_vision_diagnose_error',
      'zai_vision_understand_diagram',
      'zai_vision_analyze_data_viz',
      'zai_vision_ui_diff_check',
      'zai_vision_analyze_image',
      'zai_vision_analyze_video',
    ]);
  });

  it('registers all tools when all modules are enabled', () => {
    const registerTool = vi.fn();

    extension({
      registerTool,
      exec: vi.fn(),
      on: vi.fn(),
      registerCommand: vi.fn(),
      registerShortcut: vi.fn(),
      registerFlag: vi.fn(),
      getFlag: vi.fn(),
      sendMessage: vi.fn(),
      sendUserMessage: vi.fn(),
      appendEntry: vi.fn(),
      setSessionName: vi.fn(),
      getSessionName: vi.fn(),
      setLabel: vi.fn(),
      getCommands: vi.fn(() => []),
      registerMessageRenderer: vi.fn(),
      getActiveTools: vi.fn(() => []),
      getAllTools: vi.fn(() => []),
      setActiveTools: vi.fn(),
      setModel: vi.fn(),
      getThinkingLevel: vi.fn(),
      setThinkingLevel: vi.fn(),
      events: { on: vi.fn(), emit: vi.fn() },
      registerProvider: vi.fn(),
      unregisterProvider: vi.fn(),
    } as never, {
      env: {
        ZAI_API_KEY: 'test-key',
        ZAI_ENABLED_MODULES: 'search,reader,zread,vision',
      },
    });

    const names = registerTool.mock.calls.map(([tool]) => tool.name);
    expect(names).toEqual([
      'zai_web_search',
      'zai_web_reader',
      'zai_zread_search_doc',
      'zai_zread_get_repo_structure',
      'zai_zread_read_file',
      'zai_vision_ui_to_artifact',
      'zai_vision_extract_text',
      'zai_vision_diagnose_error',
      'zai_vision_understand_diagram',
      'zai_vision_analyze_data_viz',
      'zai_vision_ui_diff_check',
      'zai_vision_analyze_image',
      'zai_vision_analyze_video',
    ]);
  });
});
