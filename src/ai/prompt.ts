import type { AiTask } from './types';

export function buildLocalOnlyPrompt(task: AiTask): string {
  return [
    `task:${task}`,
    'AI는 규칙 판정자가 아니며, 로컬 규칙 결과를 바꾸지 않는다.',
    '이번 단계에서는 실제 provider 호출 없이 fallback 응답만 사용한다.',
  ].join('\n');
}
