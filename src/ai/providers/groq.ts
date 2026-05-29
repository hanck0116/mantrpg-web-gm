import type { AiPayload, AiResponse, AiTask } from '../types';

export async function callGroqStub(_task: AiTask, _payload: AiPayload): Promise<AiResponse> {
  return {
    narration: 'AI 응답 없이 로컬 규칙 결과만 반영합니다.',
    combat_log: ['fallback:local-only'],
    ui_tags: ['fallback'],
  };
}
