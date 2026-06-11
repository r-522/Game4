import {
  formatTime,
  lerp,
  clamp,
  getBanchouRankLabel,
  getTamashiiLabel,
  getKizunaLabel,
  getHpColor,
} from '@/lib/utils';

describe('Utils', () => {
  describe('formatTime', () => {
    it('formats seconds correctly', () => {
      expect(formatTime(65)).toBe('1:05');
      expect(formatTime(3661)).toBe('1:01:01');
      expect(formatTime(0)).toBe('0:00');
    });
  });

  describe('lerp', () => {
    it('interpolates correctly', () => {
      expect(lerp(0, 100, 0.5)).toBe(50);
      expect(lerp(0, 100, 0)).toBe(0);
      expect(lerp(0, 100, 1)).toBe(100);
    });
  });

  describe('clamp', () => {
    it('clamps values within range', () => {
      expect(clamp(150, 0, 100)).toBe(100);
      expect(clamp(-10, 0, 100)).toBe(0);
      expect(clamp(50, 0, 100)).toBe(50);
    });
  });

  describe('getBanchouRankLabel', () => {
    it('returns correct labels', () => {
      expect(getBanchouRankLabel('chinpira')).toBe('チンピラ');
      expect(getBanchouRankLabel('banchou')).toBe('番長');
      expect(getBanchouRankLabel('densetsu')).toBe('伝説の番長');
    });
  });

  describe('getTamashiiLabel', () => {
    it('returns correct soul labels', () => {
      expect(getTamashiiLabel(90)).toBe('漢の中の漢');
      expect(getTamashiiLabel(65)).toBe('真の番長');
      expect(getTamashiiLabel(45)).toBe('義理堅い男');
      expect(getTamashiiLabel(25)).toBe('普通の不良');
      expect(getTamashiiLabel(10)).toBe('チキン野郎');
    });
  });

  describe('getKizunaLabel', () => {
    it('returns correct bond labels', () => {
      expect(getKizunaLabel(0)).toBe('見知らぬ人');
      expect(getKizunaLabel(3)).toBe('仲間');
      expect(getKizunaLabel(5)).toBe('魂の兄弟');
    });
  });

  describe('getHpColor', () => {
    it('returns green for high HP', () => {
      expect(getHpColor(1.0)).toBe('#22c55e');
      expect(getHpColor(0.7)).toBe('#22c55e');
    });

    it('returns yellow for medium HP', () => {
      expect(getHpColor(0.5)).toBe('#eab308');
    });

    it('returns red for low HP', () => {
      expect(getHpColor(0.2)).toBe('#ef4444');
    });
  });
});
