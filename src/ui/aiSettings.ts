import { getAiProviderStatus } from '../ai/router';

export function renderAiSettingsPanel(): string {
  return `
    <details class="panel ai-panel">
      <summary>AI 설정</summary>
      <p>선택형 AI 서술자 자리입니다. API 키 없이도 게임은 로컬 규칙으로 진행됩니다.</p>
      <dl class="compact-list">
        <div><dt>상태</dt><dd>${getAiProviderStatus()}</dd></div>
        <div><dt>판정 관여</dt><dd>불가</dd></div>
        <div><dt>실제 호출</dt><dd>다음 단계 구현</dd></div>
      </dl>
    </details>
  `;
}
