'use client';

import { useBattleStore } from '@/stores/battleStore';
import { useGameStore } from '@/stores/gameStore';
import { SKILLS } from '@/data/skills';
import { getHpColor, cn } from '@/lib/utils';
import { Button } from '@/components/common/Button';
import { playSfx } from '@/lib/audio';

export function BattleHUD() {
  const { player: battlePlayer, enemy, state, comboCount, damageDealt, activeSkillCooldowns, playerAttack, playerBlock, playerDodge, playerTaunt, playerFlee } = useBattleStore();
  const { player: gamePlayer, endBattle, addNotification } = useGameStore();

  if (!battlePlayer || !enemy || !gamePlayer) return null;

  const playerHpRatio = battlePlayer.hp / battlePlayer.maxHp;
  const enemyHpRatio = enemy.hp / enemy.maxHp;
  const spRatio = battlePlayer.sp / battlePlayer.maxSp;

  const learnedSkills = gamePlayer.learnedSkills.slice(0, 6);

  const handleFlee = () => {
    const success = playerFlee();
    if (success) {
      playSfx('dodge');
      addNotification('逃げた...情けない！', 'warning');
      endBattle(false, 0, -10);
    } else {
      playSfx('hit');
      addNotification('逃げ切れなかった！', 'error');
    }
  };

  if (state === 'victory') {
    const enemy_def = import('@/data/enemies').then(m => m.ENEMIES[enemy.id]);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="text-center space-y-4">
          <div className="text-6xl font-black text-yellow-400"
            style={{ textShadow: '0 0 30px rgba(234,179,8,0.8)' }}>
            勝利！
          </div>
          <div className="text-white text-xl">最大コンボ: {useBattleStore.getState().maxCombo}連撃</div>
          <div className="text-gray-300">与ダメージ: {damageDealt}</div>
          <Button
            variant="banchou"
            size="lg"
            onClick={() => {
              import('@/data/enemies').then(({ ENEMIES }) => {
                const enemyDef = ENEMIES[enemy.id];
                endBattle(true, enemyDef?.expReward || 50, enemyDef?.tamashiiReward || 5);
              });
            }}
          >
            続ける！
          </Button>
        </div>
      </div>
    );
  }

  if (state === 'defeat') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
        <div className="text-center space-y-4">
          <div className="text-6xl font-black text-red-500">敗北...</div>
          <div className="text-gray-300 text-lg">立ち上がれ。まだ終わりじゃない。</div>
          <Button variant="danger" size="lg" onClick={() => endBattle(false, 0, -5)}>
            続ける
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-30 pointer-events-none">
        <div className="flex justify-between items-start p-3 bg-gradient-to-b from-black/90 to-transparent">
          <div className="min-w-48 space-y-1">
            <div className="text-yellow-400 font-black text-sm">{battlePlayer.name}</div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-6">HP</span>
              <div className="flex-1 h-4 bg-gray-900 border border-gray-700">
                <div
                  className="h-full transition-all duration-200"
                  style={{ width: `${playerHpRatio * 100}%`, background: getHpColor(playerHpRatio) }}
                />
              </div>
              <span className="text-white text-xs w-16 text-right">{battlePlayer.hp}/{battlePlayer.maxHp}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-400 w-6">SP</span>
              <div className="flex-1 h-2 bg-gray-900 border border-gray-700">
                <div className="h-full bg-blue-500 transition-all duration-200" style={{ width: `${spRatio * 100}%` }} />
              </div>
              <span className="text-white text-xs w-16 text-right">{battlePlayer.sp}/{battlePlayer.maxSp}</span>
            </div>
          </div>

          {comboCount > 1 && (
            <div className="text-center">
              <div className="text-yellow-400 font-black text-3xl"
                style={{ textShadow: '0 0 15px rgba(234,179,8,0.6)' }}>
                {comboCount}HIT
              </div>
              <div className="text-xs text-gray-400">コンボ！</div>
            </div>
          )}

          <div className="min-w-48 space-y-1 text-right">
            <div className="text-red-400 font-black text-sm">{enemy.nameJp}</div>
            <div className="flex items-center gap-2">
              <span className="text-white text-xs w-16 text-left">{enemy.hp}/{enemy.maxHp}</span>
              <div className="flex-1 h-4 bg-gray-900 border border-gray-700">
                <div
                  className="h-full transition-all duration-200 ml-auto"
                  style={{ width: `${enemyHpRatio * 100}%`, background: getHpColor(enemyHpRatio), float: 'right' }}
                />
              </div>
              <span className="text-xs text-gray-400 w-6">HP</span>
            </div>
            {enemy.isStunned && (
              <div className="text-yellow-400 text-xs animate-pulse">⚡ スタン！</div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 p-3 bg-gradient-to-t from-black/90 to-transparent">
        <div className="flex flex-col gap-2 max-w-lg mx-auto">
          <div className="grid grid-cols-3 gap-2">
            {learnedSkills.map((skillId, i) => {
              const skill = SKILLS[skillId];
              if (!skill) return null;
              const cooldown = activeSkillCooldowns[skillId] || 0;
              const canUse = battlePlayer.sp >= skill.spCost && cooldown <= 0 && !battlePlayer.isStunned;
              const keys = ['Z', 'X', 'C', 'A', 'S', 'D'];
              return (
                <button
                  key={skillId}
                  className={cn(
                    'relative border-2 p-2 text-left transition-all text-xs',
                    canUse
                      ? 'border-red-700 bg-red-900/40 text-white hover:border-red-500 hover:bg-red-900/60 active:scale-95'
                      : 'border-gray-700 bg-gray-900/40 text-gray-600 cursor-not-allowed'
                  )}
                  onClick={() => { if (canUse) { playSfx('punch_light'); playerAttack(skillId); } }}
                  disabled={!canUse}
                >
                  {cooldown > 0 && (
                    <div
                      className="absolute inset-0 bg-black/70 flex items-center justify-center text-yellow-400 font-black text-sm"
                      style={{ borderRadius: 'inherit' }}
                    >
                      {cooldown.toFixed(1)}s
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="font-black text-yellow-400 text-xs">[{keys[i]}]</span>
                    <span className="text-blue-400 text-xs">{skill.spCost}SP</span>
                  </div>
                  <div className="font-bold text-xs mt-1 truncate">{skill.nameJp}</div>
                  <div className="text-xs text-gray-400">
                    {skill.type === 'light' ? '🥊' : skill.type === 'heavy' ? '💥' : skill.type === 'special' ? '⚡' : '🤼'} ダメ{skill.damage}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex gap-2">
            <button
              className="flex-1 py-2 border border-blue-800 bg-blue-900/40 text-blue-300 text-xs font-bold hover:bg-blue-900/60 active:scale-95 transition-all"
              onMouseDown={() => playerBlock(true)}
              onMouseUp={() => playerBlock(false)}
              onTouchStart={() => playerBlock(true)}
              onTouchEnd={() => playerBlock(false)}
            >
              🛡️ ガード [Shift]
            </button>
            <button
              className="flex-1 py-2 border border-cyan-800 bg-cyan-900/40 text-cyan-300 text-xs font-bold hover:bg-cyan-900/60 active:scale-95 transition-all"
              onClick={() => { playSfx('dodge'); playerDodge(); }}
            >
              💨 回避 [Space]
            </button>
            <button
              className="flex-1 py-2 border border-orange-800 bg-orange-900/40 text-orange-300 text-xs font-bold hover:bg-orange-900/60 active:scale-95 transition-all"
              onClick={() => { playSfx('taunt'); playerTaunt(); }}
            >
              😤 挑発 [R]
            </button>
            <button
              className="flex-1 py-2 border border-gray-700 bg-gray-900/40 text-gray-400 text-xs font-bold hover:bg-gray-900/60 active:scale-95 transition-all"
              onClick={handleFlee}
            >
              🏃 逃げる [Q]
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
