export type WorkerAiRequest = {
  readonly task: 'interpret' | 'narrate' | 'summarize' | 'generate-skill';
  readonly payload: Record<string, unknown>;
};

export type WorkerAiResponse = {
  readonly narration: string;
  readonly combat_log: readonly string[];
  readonly ui_tags: readonly string[];
};
