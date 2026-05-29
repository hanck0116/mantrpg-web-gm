export type AiTask = 'interpret' | 'narrate' | 'summarize' | 'generate-skill';

export type AiProvider = 'groq' | 'gemini' | 'openrouter';

export type AiPayload = Record<string, unknown>;

export type AiResponse = {
  readonly narration: string;
  readonly combat_log: readonly string[];
  readonly ui_tags: readonly string[];
};

export type AiProviderStatus = 'disabled' | 'not-configured' | 'ready';
