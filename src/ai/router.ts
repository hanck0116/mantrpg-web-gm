import type { AiNarrationRequest, AiNarrationResponse, AiProviderStatus } from './types';

export function getAiProviderStatus(): AiProviderStatus {
  return 'disabled';
}

export async function requestOptionalNarration(_request: AiNarrationRequest): Promise<AiNarrationResponse> {
  return {
    narration: 'AI 서술 기능은 선택 기능이며 이번 단계에서는 호출하지 않습니다.',
  };
}
