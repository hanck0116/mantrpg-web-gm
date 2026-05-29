import type { WorkerAiResponse } from './types';

export default {
  async fetch(): Promise<Response> {
    const response: WorkerAiResponse = {
      type: 'narration-disabled',
      payload: {
        message: 'AI 라우터 Worker는 다음 단계에서 구현합니다.',
      },
    };

    return Response.json(response, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  },
};
