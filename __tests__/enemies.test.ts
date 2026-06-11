import { ENEMIES } from '@/data/enemies';
import { SKILLS } from '@/data/skills';

describe('Enemies Data', () => {
  it('all enemies have required fields', () => {
    Object.values(ENEMIES).forEach((enemy) => {
      expect(enemy.id).toBeDefined();
      expect(enemy.name).toBeDefined();
      expect(enemy.nameJp).toBeDefined();
      expect(enemy.level).toBeGreaterThan(0);
      expect(enemy.stats.hp).toBeGreaterThan(0);
      expect(enemy.expReward).toBeGreaterThan(0);
    });
  });

  it('all enemy skills exist in SKILLS data', () => {
    Object.values(ENEMIES).forEach((enemy) => {
      enemy.skills.forEach((skillId) => {
        expect(SKILLS[skillId]).toBeDefined();
      });
    });
  });

  it('bosses have higher stats than regular enemies', () => {
    const bosses = Object.values(ENEMIES).filter((e) => e.isBoss);
    const regulars = Object.values(ENEMIES).filter((e) => !e.isBoss);

    const avgBossHp = bosses.reduce((sum, b) => sum + b.stats.hp, 0) / bosses.length;
    const avgRegularHp = regulars.reduce((sum, r) => sum + r.stats.hp, 0) / regulars.length;

    expect(avgBossHp).toBeGreaterThan(avgRegularHp);
  });

  it('final boss has highest level', () => {
    const maxLevel = Math.max(...Object.values(ENEMIES).map((e) => e.level));
    expect(ENEMIES.kageyama_gohi.level).toBe(maxLevel);
  });

  it('enemies have dialogue', () => {
    Object.values(ENEMIES).forEach((enemy) => {
      expect(enemy.dialogue.prebattle).toBeDefined();
      expect(enemy.dialogue.defeat).toBeDefined();
    });
  });

  it('enemy levels are in reasonable range', () => {
    Object.values(ENEMIES).forEach((enemy) => {
      expect(enemy.level).toBeGreaterThanOrEqual(1);
      expect(enemy.level).toBeLessThanOrEqual(50);
    });
  });

  describe('balance checks', () => {
    it('final boss has enough skills', () => {
      expect(ENEMIES.kageyama_gohi.skills.length).toBeGreaterThanOrEqual(5);
    });

    it('starter enemies are appropriately weak', () => {
      expect(ENEMIES.street_punk.stats.hp).toBeLessThan(200);
      expect(ENEMIES.street_punk.stats.attack).toBeLessThan(30);
    });
  });
});
