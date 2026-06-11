export interface DialogueLine {
  speaker: string;
  speakerJp: string;
  text: string;
  emotion?: 'normal' | 'angry' | 'happy' | 'sad' | 'surprised' | 'cool';
  sfx?: string;
  choice?: DialogueChoice[];
}

export interface DialogueChoice {
  text: string;
  action: string;
  tamashiiChange?: number;
  flagSet?: string;
}

export interface StoryEvent {
  id: string;
  title: string;
  chapter: number;
  trigger: EventTrigger;
  dialogues: DialogueLine[];
  onComplete?: string[];
  requiresFlags?: string[];
  rewardsFlags?: string[];
}

export interface EventTrigger {
  type: 'area_enter' | 'battle_win' | 'npc_talk' | 'item_use' | 'chapter_start' | 'flag';
  value?: string;
}

export interface Chapter {
  id: number;
  title: string;
  titleJp: string;
  description: string;
  events: string[];
  boss: string;
  completionFlag: string;
  bgm: string;
}

export interface NPC {
  id: string;
  name: string;
  nameJp: string;
  area: string;
  role: 'ally' | 'neutral' | 'hostile' | 'shopkeeper' | 'boss';
  dialogue: string[];
  quests?: string[];
  kizunaId?: string;
}

export interface Quest {
  id: string;
  title: string;
  titleJp: string;
  description: string;
  giver: string;
  objectives: QuestObjective[];
  rewards: QuestReward[];
  chapter: number;
}

export interface QuestObjective {
  type: 'defeat' | 'talk' | 'collect' | 'reach' | 'protect';
  target: string;
  count: number;
  current: number;
  completed: boolean;
}

export interface QuestReward {
  type: 'exp' | 'item' | 'tamashii' | 'kizuna' | 'skill' | 'fashion';
  value: string | number;
}
