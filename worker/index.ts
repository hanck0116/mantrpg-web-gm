import type { WorkerAiResponse } from './types';

export default {
  async fetch(): Promise<Response> {
    const response: WorkerAiResponse = {
      narration: 'AI 응답 없이 로컬 규칙 결과만 반영합니다.',
      combat_log: ['fallback:local-only'],
      ui_tags: ['fallback'],
    };

    return Response.json(response, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  },
};
