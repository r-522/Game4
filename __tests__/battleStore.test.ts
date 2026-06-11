import { useBattleStore } from '@/stores/battleStore';
import { useGameStore } from '@/stores/gameStore';
import { act } from '@testing-library/react';

describe('BattleStore', () => {
  let playerData: ReturnType<typeof useGameStore.getState>['player'];

  beforeEach(() => {
    act(() => {
      useGameStore.getState().startNewGame('normal');
    });
    playerData = useGameStore.getState().player;

    useBattleStore.setState({
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
    });
  });

  describe('initBattle', () => {
    it('initializes battle with correct characters', () => {
      act(() => {
        useBattleStore.getState().initBattle('street_punk', playerData!, false);
      });

      const { player, enemy, state } = useBattleStore.getState();
      expect(player).not.toBeNull();
      expect(enemy).not.toBeNull();
      expect(state).toBe('fighting');
      expect(player?.id).toBe('player');
      expect(enemy?.id).toBe('street_punk');
    });

    it('stuns enemy when menchi won', () => {
      act(() => {
        useBattleStore.getState().initBattle('street_punk', playerData!, true);
      });

      const { enemy } = useBattleStore.getState();
      expect(enemy?.isStunned).toBe(true);
      expect(enemy?.stunTimer).toBeGreaterThan(0);
    });

    it('does not stun enemy when menchi lost', () => {
      act(() => {
        useBattleStore.getState().initBattle('street_punk', playerData!, false);
      });

      const { enemy } = useBattleStore.getState();
      expect(enemy?.isStunned).toBe(false);
    });
  });

  describe('playerAttack', () => {
    beforeEach(() => {
      act(() => {
        useBattleStore.getState().initBattle('street_punk', playerData!, false);
      });
    });

    it('deals damage to enemy', () => {
      const initialHp = useBattleStore.getState().enemy?.hp || 0;
      act(() => {
        useBattleStore.getState().playerAttack('jab');
      });
      const finalHp = useBattleStore.getState().enemy?.hp || 0;
      expect(finalHp).toBeLessThan(initialHp);
    });

    it('consumes SP for skills that cost SP', () => {
      const initialSp = useBattleStore.getState().player?.sp || 0;
      act(() => {
        useBattleStore.getState().playerAttack('hook');
      });
      const finalSp = useBattleStore.getState().player?.sp || 0;
      expect(finalSp).toBeLessThan(initialSp);
    });

    it('sets victory state when enemy HP reaches 0', () => {
      act(() => {
        const store = useBattleStore.getState();
        if (store.enemy) {
          useBattleStore.setState({ enemy: { ...store.enemy, hp: 1 } });
        }
        useBattleStore.getState().playerAttack('tamashii_kudaki');
      });
    });

    it('does not attack when player is stunned', () => {
      act(() => {
        const store = useBattleStore.getState();
        if (store.player) {
          useBattleStore.setState({ player: { ...store.player, isStunned: true, stunTimer: 1 } });
        }
      });

      const initialHp = useBattleStore.getState().enemy?.hp || 0;
      act(() => {
        useBattleStore.getState().playerAttack('jab');
      });
      expect(useBattleStore.getState().enemy?.hp).toBe(initialHp);
    });
  });

  describe('playerBlock', () => {
    beforeEach(() => {
      act(() => {
        useBattleStore.getState().initBattle('street_punk', playerData!, false);
      });
    });

    it('sets isBlocking on player', () => {
      act(() => {
        useBattleStore.getState().playerBlock(true);
      });
      expect(useBattleStore.getState().player?.isBlocking).toBe(true);
    });

    it('unsets isBlocking on player', () => {
      act(() => {
        useBattleStore.getState().playerBlock(true);
        useBattleStore.getState().playerBlock(false);
      });
      expect(useBattleStore.getState().player?.isBlocking).toBe(false);
    });
  });

  describe('playerDodge', () => {
    beforeEach(() => {
      act(() => {
        useBattleStore.getState().initBattle('street_punk', playerData!, false);
      });
    });

    it('sets invincibility frame', () => {
      act(() => {
        useBattleStore.getState().playerDodge();
      });
      expect(useBattleStore.getState().player?.invincibleTimer).toBeGreaterThan(0);
    });
  });

  describe('playerTaunt', () => {
    beforeEach(() => {
      act(() => {
        useBattleStore.getState().initBattle('street_punk', playerData!, false);
      });
    });

    it('increases player SP', () => {
      act(() => {
        const store = useBattleStore.getState();
        if (store.player) {
          useBattleStore.setState({ player: { ...store.player, sp: 10 } });
        }
      });
      const initialSp = useBattleStore.getState().player?.sp || 0;
      act(() => {
        useBattleStore.getState().playerTaunt();
      });
      expect(useBattleStore.getState().player?.sp).toBeGreaterThan(initialSp);
    });
  });

  describe('playerFlee', () => {
    beforeEach(() => {
      act(() => {
        useBattleStore.getState().initBattle('street_punk', playerData!, false);
      });
    });

    it('increases flee attempts counter', () => {
      act(() => {
        useBattleStore.getState().playerFlee();
      });
      expect(useBattleStore.getState().fleeAttempts).toBe(1);
    });
  });

  describe('resetBattle', () => {
    it('resets all battle state', () => {
      act(() => {
        useBattleStore.getState().initBattle('street_punk', playerData!, false);
        useBattleStore.getState().resetBattle();
      });

      const { player, enemy, state } = useBattleStore.getState();
      expect(player).toBeNull();
      expect(enemy).toBeNull();
      expect(state).toBe('idle');
    });
  });
});
