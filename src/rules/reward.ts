export type Reward = {
  readonly id: string;
  readonly label: string;
  readonly description: string;
};

export function createLocalRewardOptions(): readonly Reward[] {
  return [
    {
      id: 'coin-small',
      label: '소량 코인',
      description: '임시 로컬 보상입니다. 원본 zip 확인 후 보상표로 교체합니다.',
    },
    {
      id: 'mp-rest',
      label: 'MP 회복',
      description: '임시 로컬 보상입니다. AI가 보상을 생성하지 않습니다.',
    },
  ];
}
