export type AiNarrationRequest = {
  readonly playerInput: string;
  readonly rulesSummary: string;
  readonly currentLog: readonly string[];
};

export type AiNarrationResponse = {
  readonly narration: string;
};

export type AiProviderStatus = 'disabled' | 'not-configured' | 'ready';
