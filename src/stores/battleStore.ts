'use client';

import { create } from 'zustand';
import type { BattleState, BattleCharacter, HitEffect, BattleLogEntry, MenchiRound } from '@/types/battle';
import { SKILLS } from '@/data/skills';
import { ENEMIES } from '@/data/enemies';

const COMBO_TIMEOUT = 2.0;

interface BattleStore {
  state: BattleState;
  player: BattleCharacter | null;
  enemy: BattleCharacter | null;
  hitEffects: HitEffect[];
  battleLog: BattleLogEntry[];
  comboCount: number;
  maxCombo: number;
  damageDealt: number;
  damageTaken: number;
  timeElapsed: number;
  menchiRounds: MenchiRound[];
  menchiCurrentRound: number;
  playerMenchiWins: number;
  enemyMenchiWins: number;
  activeSkillCooldowns: Record<string, number>;
  inputBuffer: string[];
  lastInputTime: number;
  fleeAttempts: number;

  initBattle: (enemyId: string, playerData: import('@/types/game').PlayerData, menchiWon: boolean) => void;
  resetBattle: () => void;
  playerAttack: (skillId: string) => void;
  enemyAttack: () => void;
  playerBlock: (blocking: boolean) => void;
  playerDodge: () => void;
  playerTaunt: () => void;
  playerFlee: () => boolean;
  update: (delta: number) => void;
  addHitEffect: (pos: [number, number, number], type: HitEffect['type']) => void;
  setState: (state: BattleState) => void;
  addLog: (entry: BattleLogEntry) => void;
}

function buildBattleCharacter(
  id: string,
  name: string,
  nameJp: string,
  hp: number,
  sp: number,
  attack: number,
  defense: number,
  speed: number,
  skillIds: string[],
  isPlayer: boolean,
  position: [number, number, number]
): BattleCharacter {
  return {
    id,
    name,
    nameJp,
    hp,
    maxHp: hp,
    sp,
    maxSp: sp,
    attack,
    defense,
    speed,
    skills: skillIds.map((sid) => SKILLS[sid]).filter(Boolean),
    isPlayer,
    position,
    rotation: isPlayer ? 0 : Math.PI,
    animState: 'idle',
    isBlocking: false,
    isStunned: false,
    stunTimer: 0,
    comboCount: 0,
    comboTimer: 0,
    invincibleTimer: 0,
  };
}

const DIFFICULTY_MULTIPLIERS: Record<string, { hp: number; dmg: number }> = {
  easy: { hp: 0.6, dmg: 0.6 },
  normal: { hp: 1.0, dmg: 1.0 },
  hard: { hp: 1.3, dmg: 1.3 },
  banchou: { hp: 1.6, dmg: 1.6 },
};

export const useBattleStore = create<BattleStore>((set, get) => ({
  state: 'idle',
  player: null,
  enemy: null,
  hitEffects: [],
  battleLog: [],
  comboCount: 0,
  maxCombo: 0,
  damageDealt: 0,
  damageTaken: 0,
  timeElapsed: 0,
  menchiRounds: [],
  menchiCurrentRound: 0,
  playerMenchiWins: 0,
  enemyMenchiWins: 0,
  activeSkillCooldowns: {},
  inputBuffer: [],
  lastInputTime: 0,
  fleeAttempts: 0,

  initBattle: (enemyId, playerData, menchiWon) => {
    const enemyDef = ENEMIES[enemyId];
    if (!enemyDef) return;

    const diff = playerData.difficulty || 'normal';
    const mult = DIFFICULTY_MULTIPLIERS[diff] || DIFFICULTY_MULTIPLIERS.normal;

    const playerChar = buildBattleCharacter(
      'player',
      playerData.name,
      playerData.name,
      playerData.stats.hp,
      playerData.stats.sp,
      playerData.stats.attack,
      playerData.stats.defense,
      playerData.stats.speed,
      playerData.learnedSkills,
      true,
      [-2, 0, 0]
    );

    const enemyHp = Math.floor(enemyDef.stats.hp * mult.hp);
    const enemyChar = buildBattleCharacter(
      enemyDef.id,
      enemyDef.name,
      enemyDef.nameJp,
      enemyHp,
      enemyDef.stats.sp,
      Math.floor(enemyDef.stats.attack * mult.dmg),
      enemyDef.stats.defense,
      enemyDef.stats.speed,
      enemyDef.skills,
      false,
      [2, 0, 0]
    );

    if (menchiWon) {
      enemyChar.isStunned = true;
      enemyChar.stunTimer = 2.0;
    }

    set({
      player: playerChar,
      enemy: enemyChar,
      state: 'fighting',
      hitEffects: [],
      battleLog: [],
      comboCount: 0,
      maxCombo: 0,
      damageDealt: 0,
      damageTaken: 0,
      timeElapsed: 0,
      activeSkillCooldowns: {},
      fleeAttempts: 0,
    });
  },

  resetBattle: () => {
    set({
      state: 'idle',
      player: null,
      enemy: null,
      hitEffects: [],
      battleLog: [],
      comboCount: 0,
      maxCombo: 0,
      damageDealt: 0,
      damageTaken: 0,
    });
  },

  playerAttack: (skillId) => {
    const { player, enemy, state, activeSkillCooldowns, addHitEffect, addLog } = get();
    if (!player || !enemy || state !== 'fighting') return;
    if (player.isStunned) return;
    if (activeSkillCooldowns[skillId] > 0) return;

    const skill = SKILLS[skillId];
    if (!skill) return;
    if (player.sp < skill.spCost) return;

    let damage = Math.max(1, (player.attack + skill.damage) - enemy.defense * 0.5);

    if (enemy.isBlocking) {
      damage = Math.floor(damage * 0.2);
      addHitEffect(enemy.position, 'block');
    } else {
      addHitEffect(enemy.position, skill.type === 'light' ? 'light' : 'heavy');
    }

    const newEnemyHp = Math.max(0, enemy.hp - damage);

    const cooldowns = { ...activeSkillCooldowns, [skillId]: skill.cooldown };
    const newCombo = get().comboCount + skill.comboCount;
    const newMax = Math.max(get().maxCombo, newCombo);

    let stunned = enemy.isStunned;
    let stunTimer = enemy.stunTimer;
    for (const eff of skill.effects) {
      if (eff.type === 'stun' || eff.type === 'knockdown') {
        stunned = true;
        stunTimer = eff.duration;
      }
    }

    addLog({
      time: get().timeElapsed,
      actorId: 'player',
      action: skill.nameJp,
      damage,
    });

    set((s) => ({
      enemy: s.enemy
        ? { ...s.enemy, hp: newEnemyHp, isStunned: stunned, stunTimer, animState: damage > 0 ? 'hit' : 'block' }
        : null,
      player: s.player ? { ...s.player, sp: s.player.sp - skill.spCost } : null,
      activeSkillCooldowns: cooldowns,
      comboCount: newCombo,
      maxCombo: newMax,
      damageDealt: s.damageDealt + damage,
      state: newEnemyHp <= 0 ? 'victory' : 'fighting',
    }));
  },

  enemyAttack: () => {
    const { player, enemy, state, addHitEffect, addLog } = get();
    if (!player || !enemy || state !== 'fighting') return;
    if (enemy.isStunned || enemy.hp <= 0) return;

    const availableSkills = enemy.skills.filter((s) => enemy.sp >= s.spCost);
    if (availableSkills.length === 0) return;

    const skill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
    let damage = Math.max(1, (enemy.attack + skill.damage) - player.defense * 0.5);

    if (player.isBlocking) {
      damage = Math.floor(damage * 0.15);
      addHitEffect(player.position, 'block');
    } else if (player.invincibleTimer > 0) {
      addHitEffect(player.position, 'miss');
      return;
    } else {
      addHitEffect(player.position, 'light');
    }

    const newPlayerHp = Math.max(0, player.hp - damage);

    addLog({
      time: get().timeElapsed,
      actorId: enemy.id,
      action: skill.nameJp,
      damage,
    });

    set((s) => ({
      player: s.player
        ? { ...s.player, hp: newPlayerHp, animState: damage > 0 ? 'hit' : 'block' }
        : null,
      enemy: s.enemy ? { ...s.enemy, sp: s.enemy.sp - skill.spCost } : null,
      damageTaken: s.damageTaken + damage,
      comboCount: 0,
      state: newPlayerHp <= 0 ? 'defeat' : 'fighting',
    }));
  },

  playerBlock: (blocking) => {
    set((s) => ({ player: s.player ? { ...s.player, isBlocking: blocking } : null }));
  },

  playerDodge: () => {
    set((s) => ({
      player: s.player ? { ...s.player, invincibleTimer: 0.5, animState: 'dodge' } : null,
    }));
  },

  playerTaunt: () => {
    set((s) => ({
      player: s.player
        ? { ...s.player, sp: Math.min(s.player.maxSp, s.player.sp + 10), animState: 'taunt' }
        : null,
    }));
  },

  playerFlee: () => {
    const attempts = get().fleeAttempts;
    const chance = 0.3 + attempts * 0.15;
    const success = Math.random() < chance;
    set((s) => ({ fleeAttempts: s.fleeAttempts + 1 }));
    if (success) {
      set({ state: 'flee' });
    }
    return success;
  },

  update: (delta) => {
    const { state, enemy, player, activeSkillCooldowns } = get();
    if (state !== 'fighting') return;

    set((s) => ({ timeElapsed: s.timeElapsed + delta }));

    const cooldowns = { ...activeSkillCooldowns };
    let changed = false;
    for (const key of Object.keys(cooldowns)) {
      if (cooldowns[key] > 0) {
        cooldowns[key] = Math.max(0, cooldowns[key] - delta);
        changed = true;
      }
    }
    if (changed) set({ activeSkillCooldowns: cooldowns });

    if (enemy && enemy.isStunned && enemy.stunTimer > 0) {
      const newTimer = enemy.stunTimer - delta;
      set((s) => ({
        enemy: s.enemy ? { ...s.enemy, stunTimer: newTimer, isStunned: newTimer > 0 } : null,
      }));
    }

    if (player && player.invincibleTimer > 0) {
      set((s) => ({
        player: s.player ? { ...s.player, invincibleTimer: Math.max(0, s.player.invincibleTimer - delta) } : null,
      }));
    }

    if (get().comboCount > 0) {
      const timeSinceLast = get().timeElapsed - get().lastInputTime;
      if (timeSinceLast > COMBO_TIMEOUT) {
        set({ comboCount: 0 });
      }
    }

    set((s) => ({
      hitEffects: s.hitEffects
        .map((e) => ({ ...e, timer: e.timer - delta }))
        .filter((e) => e.timer > 0),
    }));

    if (enemy && !enemy.isStunned && enemy.hp > 0 && player && player.hp > 0) {
      const attackInterval = Math.max(0.8, 2.0 - enemy.speed * 0.05);
      if (get().timeElapsed % attackInterval < delta) {
        get().enemyAttack();
      }
    }
  },

  addHitEffect: (pos, type) => {
    const id = crypto.randomUUID();
    set((s) => ({
      hitEffects: [...s.hitEffects, { id, position: pos, type, timer: 0.5 }],
    }));
  },

  setState: (state) => set({ state }),

  addLog: (entry) => {
    set((s) => ({ battleLog: [...s.battleLog, entry] }));
  },
}));
