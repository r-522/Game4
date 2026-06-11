import { useGameStore } from '@/stores/gameStore';
import { act } from '@testing-library/react';

describe('GameStore', () => {
  beforeEach(() => {
    useGameStore.setState({
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
    });
  });

  describe('startNewGame', () => {
    it('creates player with correct initial state for normal difficulty', () => {
      act(() => {
        useGameStore.getState().startNewGame('normal');
      });

      const { player } = useGameStore.getState();
      expect(player).not.toBeNull();
      expect(player?.level).toBe(1);
      expect(player?.tamashii).toBe(50);
      expect(player?.banchouRank).toBe('chinpira');
      expect(player?.chapter).toBe(1);
      expect(player?.difficulty).toBe('normal');
    });

    it('creates player with correct skills', () => {
      act(() => {
        useGameStore.getState().startNewGame('normal');
      });
      const { player } = useGameStore.getState();
      expect(player?.learnedSkills).toContain('jab');
      expect(player?.learnedSkills).toContain('straight');
      expect(player?.learnedSkills).toContain('hook');
    });

    it('sets phase to dialogue after new game', () => {
      act(() => {
        useGameStore.getState().startNewGame('normal');
      });
      expect(useGameStore.getState().phase).toBe('dialogue');
    });
  });

  describe('addExp', () => {
    beforeEach(() => {
      act(() => {
        useGameStore.getState().startNewGame('normal');
      });
    });

    it('increases exp correctly', () => {
      act(() => {
        useGameStore.getState().addExp(50);
      });
      expect(useGameStore.getState().player?.exp).toBe(50);
    });

    it('levels up when exp reaches threshold', () => {
      act(() => {
        useGameStore.getState().addExp(1000);
      });
      const { player } = useGameStore.getState();
      expect(player?.level).toBeGreaterThan(1);
    });

    it('increases stats on level up', () => {
      act(() => {
        useGameStore.getState().startNewGame('normal');
      });
      const initialAtk = useGameStore.getState().player?.stats.attack || 0;
      act(() => {
        useGameStore.getState().addExp(5000);
      });
      expect(useGameStore.getState().player?.stats.attack).toBeGreaterThan(initialAtk);
    });
  });

  describe('changeTamashii', () => {
    beforeEach(() => {
      act(() => {
        useGameStore.getState().startNewGame('normal');
      });
    });

    it('increases tamashii', () => {
      act(() => {
        useGameStore.getState().changeTamashii(10);
      });
      expect(useGameStore.getState().player?.tamashii).toBe(60);
    });

    it('does not exceed 100', () => {
      act(() => {
        useGameStore.getState().changeTamashii(100);
      });
      expect(useGameStore.getState().player?.tamashii).toBe(100);
    });

    it('does not go below 0', () => {
      act(() => {
        useGameStore.getState().changeTamashii(-100);
      });
      expect(useGameStore.getState().player?.tamashii).toBe(0);
    });
  });

  describe('changeKizuna', () => {
    beforeEach(() => {
      act(() => {
        useGameStore.getState().startNewGame('normal');
      });
    });

    it('increases kizuna level', () => {
      act(() => {
        useGameStore.getState().changeKizuna('muto', 1);
      });
      expect(useGameStore.getState().player?.kizuna.muto).toBe(1);
    });

    it('does not exceed max level 5', () => {
      act(() => {
        useGameStore.getState().changeKizuna('muto', 10);
      });
      expect(useGameStore.getState().player?.kizuna.muto).toBe(5);
    });
  });

  describe('setFlag', () => {
    beforeEach(() => {
      act(() => {
        useGameStore.getState().startNewGame('normal');
      });
    });

    it('sets flag correctly', () => {
      act(() => {
        useGameStore.getState().setFlag('test_flag', true);
      });
      expect(useGameStore.getState().getFlag('test_flag')).toBe(true);
    });

    it('unsets flag correctly', () => {
      act(() => {
        useGameStore.getState().setFlag('test_flag', true);
        useGameStore.getState().setFlag('test_flag', false);
      });
      expect(useGameStore.getState().getFlag('test_flag')).toBe(false);
    });
  });

  describe('learnSkill', () => {
    beforeEach(() => {
      act(() => {
        useGameStore.getState().startNewGame('normal');
      });
    });

    it('adds skill to learnedSkills', () => {
      act(() => {
        useGameStore.getState().learnSkill('uppercut');
      });
      expect(useGameStore.getState().player?.learnedSkills).toContain('uppercut');
    });

    it('does not duplicate skills', () => {
      act(() => {
        useGameStore.getState().learnSkill('jab');
        useGameStore.getState().learnSkill('jab');
      });
      const skills = useGameStore.getState().player?.learnedSkills || [];
      const jabCount = skills.filter((s) => s === 'jab').length;
      expect(jabCount).toBe(1);
    });
  });

  describe('notifications', () => {
    it('adds and removes notifications', () => {
      act(() => {
        useGameStore.getState().addNotification('Test message', 'info');
      });
      expect(useGameStore.getState().notifications).toHaveLength(1);
      expect(useGameStore.getState().notifications[0].message).toBe('Test message');
    });
  });

  describe('healPlayer', () => {
    beforeEach(() => {
      act(() => {
        useGameStore.getState().startNewGame('normal');
      });
    });

    it('heals HP', () => {
      act(() => {
        useGameStore.getState().player!.stats.hp = 50;
        useGameStore.getState().healPlayer(30, 'hp');
      });
    });

    it('does not exceed maxHp', () => {
      act(() => {
        useGameStore.getState().healPlayer(9999, 'hp');
      });
      const { player } = useGameStore.getState();
      expect(player?.stats.hp).toBeLessThanOrEqual(player?.stats.maxHp || 0);
    });
  });

  describe('updateFashion', () => {
    beforeEach(() => {
      act(() => {
        useGameStore.getState().startNewGame('normal');
      });
    });

    it('updates fashion config', () => {
      act(() => {
        useGameStore.getState().updateFashion('hair', 'regent');
      });
      expect(useGameStore.getState().player?.fashion.hair).toBe('regent');
    });
  });
});
