export type BattleState =
  | 'idle'
  | 'menchi'
  | 'fighting'
  | 'player_attack'
  | 'enemy_attack'
  | 'player_stunned'
  | 'enemy_stunned'
  | 'victory'
  | 'defeat'
  | 'flee';

export type AttackType = 'light' | 'heavy' | 'special' | 'throw' | 'counter';

export type AnimState =
  | 'idle'
  | 'walk'
  | 'run'
  | 'attack_light'
  | 'attack_heavy'
  | 'attack_special'
  | 'block'
  | 'dodge'
  | 'hit'
  | 'knockdown'
  | 'getup'
  | 'victory'
  | 'defeat'
  | 'taunt';

export interface Skill {
  id: string;
  name: string;
  nameJp: string;
  description: string;
  damage: number;
  spCost: number;
  tamashiiRequired: number;
  type: AttackType;
  comboCount: number;
  range: 'close' | 'mid' | 'far';
  effects: SkillEffect[];
  animation: AnimState;
  cooldown: number;
  unlockLevel: number;
}

export interface SkillEffect {
  type: 'stun' | 'knockdown' | 'guard_break' | 'heal' | 'buff' | 'debuff' | 'area';
  value: number;
  duration: number;
}

export interface BattleCharacter {
  id: string;
  name: string;
  nameJp: string;
  hp: number;
  maxHp: number;
  sp: number;
  maxSp: number;
  attack: number;
  defense: number;
  speed: number;
  skills: Skill[];
  isPlayer: boolean;
  position: [number, number, number];
  rotation: number;
  animState: AnimState;
  isBlocking: boolean;
  isStunned: boolean;
  stunTimer: number;
  comboCount: number;
  comboTimer: number;
  invincibleTimer: number;
}

export interface BattleResult {
  winner: 'player' | 'enemy';
  comboMax: number;
  damageDealt: number;
  damageTaken: number;
  timeElapsed: number;
  skillsUsed: string[];
  expGained: number;
  tamashiiChange: number;
  perfect: boolean;
}

export interface Projectile {
  id: string;
  position: [number, number, number];
  direction: [number, number, number];
  speed: number;
  damage: number;
  ownerId: string;
}

export interface HitEffect {
  id: string;
  position: [number, number, number];
  type: 'light' | 'heavy' | 'special' | 'block' | 'miss';
  timer: number;
}

export interface BattleLogEntry {
  time: number;
  actorId: string;
  action: string;
  damage?: number;
}

export interface MenchiRound {
  round: number;
  playerWon: boolean | null;
  playerInput: number;
  targetWindow: [number, number];
}

export interface EnemyData {
  id: string;
  name: string;
  nameJp: string;
  title: string;
  description: string;
  level: number;
  stats: {
    hp: number;
    sp: number;
    attack: number;
    defense: number;
    speed: number;
  };
  skills: string[];
  expReward: number;
  tamashiiReward: number;
  dropItems: string[];
  aiPattern: 'aggressive' | 'defensive' | 'balanced' | 'random';
  dialogue: {
    prebattle: string;
    midBattle: string;
    defeat: string;
  };
  modelColor: string;
  isBoss: boolean;
}
