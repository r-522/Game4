export type Difficulty = 'easy' | 'normal' | 'hard' | 'banchou';

export type GamePhase =
  | 'title'
  | 'menu'
  | 'world'
  | 'battle'
  | 'menchi'
  | 'dialogue'
  | 'minigame'
  | 'status'
  | 'fashion'
  | 'skills'
  | 'gameover'
  | 'ending';

export type AreaId =
  | 'reppuu_school'
  | 'shopping_district'
  | 'waterfront'
  | 'industrial'
  | 'hilltop_park'
  | 'akabane'
  | 'castle_ruins';

export type BanchouRank =
  | 'chinpira'
  | 'furyo'
  | 'banchou_koho'
  | 'fuku_banchou'
  | 'banchou'
  | 'densetsu';

export interface Stats {
  hp: number;
  maxHp: number;
  sp: number;
  maxSp: number;
  attack: number;
  defense: number;
  speed: number;
  stamina: number;
}

export interface PlayerData {
  id: string;
  name: string;
  level: number;
  exp: number;
  expToNext: number;
  stats: Stats;
  tamashii: number;
  banchouRank: BanchouRank;
  currentArea: AreaId;
  position: { x: number; y: number; z: number };
  unlockedSkills: string[];
  learnedSkills: string[];
  kizuna: Record<string, number>;
  fashion: FashionConfig;
  flags: Record<string, boolean>;
  chapter: number;
  playtime: number;
  difficulty: Difficulty;
}

export interface FashionConfig {
  uniform: string;
  jacket: string;
  hair: string;
  accessory: string;
  color: string;
}

export interface SaveData {
  slot: number;
  playerData: PlayerData;
  timestamp: string;
  playtime: number;
  chapter: number;
}

export interface Area {
  id: AreaId;
  name: string;
  nameJp: string;
  description: string;
  unlocked: boolean;
  enemies: string[];
  npcs: string[];
  events: string[];
  bgColor: string;
  thumbnail: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'tamashii' | 'kizuna';
  duration: number;
}

export type EndingType = 'true_banchou' | 'lone_fist' | 'jingi';
