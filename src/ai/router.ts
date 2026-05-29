import type { AiPayload, AiProvider, AiProviderStatus, AiResponse, AiTask } from './types';

const fallbackResponse: AiResponse = {
  narration: 'AI 응답 없이 로컬 규칙 결과만 반영합니다.',
  combat_log: ['fallback:local-only'],
  ui_tags: ['fallback'],
};

export function getAiProviderStatus(): AiProviderStatus {
  return 'disabled';
}

export function routeProviders(task: AiTask, priority: readonly AiProvider[] = []): readonly AiProvider[] {
  if (priority.length > 0) {
    const providers: AiProvider[] = [...priority, 'openrouter'];
    return providers.filter((provider, index, allProviders) => allProviders.indexOf(provider) === index);
  }

  if (task === 'interpret' || task === 'narrate') {
    return ['groq', 'openrouter'];
  }

  if (task === 'summarize' || task === 'generate-skill') {
    return ['gemini', 'openrouter'];
  }

  return ['openrouter'];
}

export async function callLLM(_task: AiTask, _payload: AiPayload): Promise<AiResponse> {
  return fallbackResponse;
}
