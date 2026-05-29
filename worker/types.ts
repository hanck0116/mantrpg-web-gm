export type WorkerAiRequest = {
  readonly type: 'narrate';
  readonly payload: {
    readonly prompt: string;
  };
};

export type WorkerAiResponse = {
  readonly type: 'narration-disabled';
  readonly payload: {
    readonly message: string;
  };
};
