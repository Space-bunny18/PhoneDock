import type {
  AIProvider,
  AIProviderResult,
} from "./aiProvider";

export const openAIProvider: AIProvider = {
  name: "OpenAI",

  isAvailable() {
    return false;
  },
  async parseCommand(
    command: string
  ): Promise<AIProviderResult> {
    const result = await window.phoneDock.askAI(command);

    if (!result.success || !result.result) {
      return {
        success: false,
        error: result.error ?? "OpenAI request failed",
      };
    }

    try {
      const parsed = JSON.parse(result.result);

      if (!Array.isArray(parsed.actions)) {
        return {
          success: false,
          error: "Invalid AI response format",
        };
      }

        return {
        success: true,
        actions: parsed.actions,
        message: "Command processed by OpenAI",
        provider: "cloud",
        };
    } catch {
      return {
        success: false,
        error: "AI returned invalid JSON",
      };
    }
  },
};