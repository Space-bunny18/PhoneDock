import type {
  AIProvider,
  AIProviderResult,
} from "./aiProvider";

import { parseCommand } from "../commandParser";

export const localProvider: AIProvider = {
  name: "Local Parser",

  isAvailable() {
    return true;
  },

  async parseCommand(
    command: string
  ): Promise<AIProviderResult> {
    const parsed = parseCommand(command);

    if (parsed.length === 0) {
      return {
        success: false,
        error: "No recognized PhoneDock action",
      };
    }

        return {
        success: true,
        actions: parsed.map((item) => item.action),
        message: "Command processed locally",
        provider: "local",
        };
  },
};