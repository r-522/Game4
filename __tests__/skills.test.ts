import { SKILLS, STARTER_SKILLS } from '@/data/skills';

describe('Skills Data', () => {
  it('has all starter skills defined', () => {
    STARTER_SKILLS.forEach((id) => {
      expect(SKILLS[id]).toBeDefined();
    });
  });

  it('all skills have required fields', () => {
    Object.values(SKILLS).forEach((skill) => {
      expect(skill.id).toBeDefined();
      expect(skill.name).toBeDefined();
      expect(skill.nameJp).toBeDefined();
      expect(skill.damage).toBeGreaterThanOrEqual(0);
      expect(skill.spCost).toBeGreaterThanOrEqual(0);
      expect(skill.cooldown).toBeGreaterThan(0);
      expect(skill.unlockLevel).toBeGreaterThan(0);
    });
  });

  it('jab is a light attack with no SP cost', () => {
    expect(SKILLS.jab.type).toBe('light');
    expect(SKILLS.jab.spCost).toBe(0);
  });

  it('tamashii_kaihou requires 50 tamashii', () => {
    expect(SKILLS.tamashii_kaihou.tamashiiRequired).toBe(50);
  });

  it('shippuu_randa has 7 combo count', () => {
    expect(SKILLS.shippuu_randa.comboCount).toBe(7);
  });

  it('skills balance: ultimate moves have longer cooldowns', () => {
    const jab = SKILLS.jab;
    const ultimate = SKILLS.tamashii_kaihou;
    expect(ultimate.cooldown).toBeGreaterThan(jab.cooldown);
    expect(ultimate.damage).toBeGreaterThan(jab.damage);
  });

  it('skills balance: higher level skills do more damage', () => {
    const earlySkill = SKILLS.jab;
    const lateSkill = SKILLS.tamashii_kaihou;
    expect(lateSkill.unlockLevel).toBeGreaterThan(earlySkill.unlockLevel);
    expect(lateSkill.damage).toBeGreaterThan(earlySkill.damage);
  });
});
