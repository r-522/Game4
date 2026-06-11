'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { GamePhase, PlayerData, SaveData, Notification, BanchouRank, Difficulty } from '@/types/game';
import { STARTER_SKILLS } from '@/data/skills';

const BANCHOU_RANK_EXP: Record<BanchouRank, number> = {
  chinpira: 0,
  furyo: 500,
  banchou_koho: 1500,
  fuku_banchou: 3500,
  banchou: 7000,
  densetsu: 15000,
};

const BANCHOU_RANK_ORDER: BanchouRank[] = [
  'chinpira', 'furyo', 'banchou_koho', 'fuku_banchou', 'banchou', 'densetsu',
];

const EXP_TO_NEXT = (level: number) => Math.floor(100 * Math.pow(1.2, level - 1));

function createDefaultPlayer(difficulty: Difficulty): PlayerData {
  return {
    id: crypto.randomUUID(),
    name: '神崎 烈',
    level: 1,
    exp: 0,
    expToNext: EXP_TO_NEXT(1),
    stats: {
      hp: 100,
      maxHp: 100,
      sp: 60,
      maxSp: 60,
      attack: 12,
      defense: 8,
      speed: 10,
      stamina: 100,
    },
    tamashii: 50,
    banchouRank: 'chinpira',
    currentArea: 'reppuu_school',
    position: { x: 0, y: 0, z: 0 },
    unlockedSkills: [...STARTER_SKILLS],
    learnedSkills: [...STARTER_SKILLS],
    kizuna: { muto: 0, kuroki: 0, ren: 0, yuki: 0, akaoni: 0 },
    fashion: {
      uniform: 'standard',
      jacket: 'none',
      hair: 'short',
      accessory: 'none',
      color: '#1a1a3a',
    },
    flags: { prologue_complete: false },
    chapter: 1,
    playtime: 0,
    difficulty,
  };
}

interface GameStore {
  phase: GamePhase;
  player: PlayerData | null;
  saves: SaveData[];
  notifications: Notification[];
  currentEnemy: string | null;
  currentEvent: string | null;
  currentDialogue: string | null;
  pendingBattle: string | null;
  bgm: string | null;
  isMuted: boolean;
  showMenchi: boolean;
  lastMenchiResult: boolean | null;

  setPhase: (phase: GamePhase) => void;
  startNewGame: (difficulty: Difficulty) => void;
  loadGame: (save: SaveData) => void;
  saveGame: (slot: number) => void;
  setCurrentArea: (areaId: string) => void;
  addExp: (amount: number) => void;
  changeTamashii: (delta: number) => void;
  changeKizuna: (characterId: string, delta: number) => void;
  setFlag: (flag: string, value: boolean) => void;
  getFlag: (flag: string) => boolean;
  startBattle: (enemyId: string, fromMenchi?: boolean) => void;
  endBattle: (won: boolean, expGained: number, tamashiiChange: number) => void;
  setCurrentEvent: (eventId: string | null) => void;
  addNotification: (message: string, type?: Notification['type']) => void;
  removeNotification: (id: string) => void;
  updateFashion: (key: string, value: string) => void;
  learnSkill: (skillId: string) => void;
  setBgm: (track: string | null) => void;
  toggleMute: () => void;
  setShowMenchi: (show: boolean) => void;
  setLastMenchiResult: (result: boolean | null) => void;
  healPlayer: (amount: number, stat?: 'hp' | 'sp' | 'both') => void;
  advanceChapter: () => void;
  unlockArea: (areaId: string) => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      phase: 'title',
      player: null,
      saves: [],
      notifications: [],
      currentEnemy: null,
      currentEvent: null,
      currentDialogue: null,
      pendingBattle: null,
      bgm: null,
      isMuted: false,
      showMenchi: false,
      lastMenchiResult: null,

      setPhase: (phase) => set({ phase }),

      startNewGame: (difficulty) => {
        const player = createDefaultPlayer(difficulty);
        set({
          player,
          phase: 'dialogue',
          currentEvent: 'prologue',
          bgm: 'chapter1_theme',
        });
      },

      loadGame: (save) => {
        set({ player: save.playerData, phase: 'world' });
      },

      saveGame: (slot) => {
        const { player, saves } = get();
        if (!player) return;
        const save: SaveData = {
          slot,
          playerData: player,
          timestamp: new Date().toISOString(),
          playtime: player.playtime,
          chapter: player.chapter,
        };
        const newSaves = saves.filter((s) => s.slot !== slot);
        newSaves.push(save);
        set({ saves: newSaves });
      },

      setCurrentArea: (areaId) => {
        set((state) => ({
          player: state.player
            ? { ...state.player, currentArea: areaId as PlayerData['currentArea'] }
            : null,
        }));
      },

      addExp: (amount) => {
        set((state) => {
          if (!state.player) return {};
          const p = { ...state.player };
          p.exp += amount;

          while (p.exp >= p.expToNext && p.level < 50) {
            p.exp -= p.expToNext;
            p.level += 1;
            p.expToNext = EXP_TO_NEXT(p.level);
            p.stats = {
              ...p.stats,
              maxHp: p.stats.maxHp + 10,
              hp: Math.min(p.stats.hp + 10, p.stats.maxHp + 10),
              maxSp: p.stats.maxSp + 5,
              sp: Math.min(p.stats.sp + 5, p.stats.maxSp + 5),
              attack: p.stats.attack + 2,
              defense: p.stats.defense + 1,
              speed: p.stats.speed + 1,
            };
          }

          const rankIdx = BANCHOU_RANK_ORDER.indexOf(p.banchouRank);
          const totalExp = p.exp + BANCHOU_RANK_ORDER.slice(0, rankIdx).reduce((acc, r) => acc + BANCHOU_RANK_EXP[r], 0);
          for (let i = BANCHOU_RANK_ORDER.length - 1; i >= 0; i--) {
            if (totalExp >= BANCHOU_RANK_EXP[BANCHOU_RANK_ORDER[i]]) {
              p.banchouRank = BANCHOU_RANK_ORDER[i];
              break;
            }
          }

          return { player: p };
        });
      },

      changeTamashii: (delta) => {
        set((state) => {
          if (!state.player) return {};
          const tamashii = Math.max(0, Math.min(100, state.player.tamashii + delta));
          return { player: { ...state.player, tamashii } };
        });
      },

      changeKizuna: (characterId, delta) => {
        set((state) => {
          if (!state.player) return {};
          const kizuna = { ...state.player.kizuna };
          kizuna[characterId] = Math.max(0, Math.min(5, (kizuna[characterId] || 0) + delta));
          return { player: { ...state.player, kizuna } };
        });
      },

      setFlag: (flag, value) => {
        set((state) => {
          if (!state.player) return {};
          return {
            player: {
              ...state.player,
              flags: { ...state.player.flags, [flag]: value },
            },
          };
        });
      },

      getFlag: (flag) => {
        return get().player?.flags[flag] ?? false;
      },

      startBattle: (enemyId, fromMenchi = false) => {
        if (!fromMenchi) {
          set({ pendingBattle: enemyId, showMenchi: true });
        } else {
          set({ currentEnemy: enemyId, phase: 'battle', pendingBattle: null });
        }
      },

      endBattle: (won, expGained, tamashiiChange) => {
        const { addExp, changeTamashii, addNotification } = get();
        if (won) {
          addExp(expGained);
          changeTamashii(tamashiiChange);
          addNotification(`勝利！ EXP +${expGained}`, 'success');
        } else {
          changeTamashii(-5);
          addNotification('敗北...しかし諦めるな！', 'warning');
        }
        set({ phase: won ? 'world' : 'gameover', currentEnemy: null });
      },

      setCurrentEvent: (eventId) => {
        set({ currentEvent: eventId });
        if (eventId) set({ phase: 'dialogue' });
      },

      addNotification: (message, type = 'info') => {
        const id = crypto.randomUUID();
        set((state) => ({
          notifications: [...state.notifications, { id, message, type, duration: 3000 }],
        }));
        setTimeout(() => {
          get().removeNotification(id);
        }, 3500);
      },

      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      updateFashion: (key, value) => {
        set((state) => {
          if (!state.player) return {};
          return {
            player: {
              ...state.player,
              fashion: { ...state.player.fashion, [key]: value },
            },
          };
        });
      },

      learnSkill: (skillId) => {
        set((state) => {
          if (!state.player) return {};
          if (state.player.learnedSkills.includes(skillId)) return {};
          return {
            player: {
              ...state.player,
              learnedSkills: [...state.player.learnedSkills, skillId],
            },
          };
        });
      },

      setBgm: (track) => set({ bgm: track }),
      toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
      setShowMenchi: (show) => set({ showMenchi: show }),
      setLastMenchiResult: (result) => set({ lastMenchiResult: result }),

      healPlayer: (amount, stat = 'hp') => {
        set((state) => {
          if (!state.player) return {};
          const s = { ...state.player.stats };
          if (stat === 'hp' || stat === 'both') {
            s.hp = Math.min(s.maxHp, s.hp + amount);
          }
          if (stat === 'sp' || stat === 'both') {
            s.sp = Math.min(s.maxSp, s.sp + amount);
          }
          return { player: { ...state.player, stats: s } };
        });
      },

      advanceChapter: () => {
        set((state) => {
          if (!state.player) return {};
          return { player: { ...state.player, chapter: state.player.chapter + 1 } };
        });
      },

      unlockArea: (areaId) => {
        const { addNotification } = get();
        addNotification(`新エリア解放！ ${areaId}`, 'success');
      },
    }),
    {
      name: 'tamashii-banchou-save',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ saves: state.saves, isMuted: state.isMuted }),
    }
  )
);
