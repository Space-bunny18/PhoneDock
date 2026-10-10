import type {
  AIProvider,
  AIProviderResult,
} from "./aiProvider";
import { localProvider } from "./localProvider";

export class ProviderManager {
  private provider: AIProvider | null = null;

  setProvider(provider: AIProvider) {
    this.provider = provider;
  }

  getProvider() {
    return this.provider;
  }

  isAvailable() {
    return this.provider?.isAvailable() ?? false;
  }

  async parseCommand(
    command: string
  ): Promise<AIProviderResult> {
    if (this.provider && this.provider.isAvailable()) {
      try {
        const result =
          await this.provider.parseCommand(command);

        if (result.success) {
          return result;
        }

        console.warn(
          `${this.provider.name} failed. Falling back to Local Parser.`
        );
      } catch (error) {
        console.warn(
          `${this.provider.name} error. Falling back to Local Parser.`,
          error
        );
      }
    }

    const localResult =
    await localProvider.parseCommand(command);

    return {
    ...localResult,
    provider: "local",
    };
  }
}
export const providerManager = new ProviderManager();
providerManager.setProvider(localProvider);