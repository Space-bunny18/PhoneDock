export interface AIProviderResult {
  success: boolean;
  actions?: string[];
  message?: string;
  error?: string;
  provider?: "cloud" | "local";
}
export interface AIProvider {
  name: string;

  isAvailable(): boolean;

  parseCommand(
    command: string
  ): Promise<AIProviderResult>;
}