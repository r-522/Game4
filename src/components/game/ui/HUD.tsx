'use client';

import { useGameStore } from '@/stores/gameStore';
import { getHpColor, getBanchouRankLabel, getTamashiiLabel } from '@/lib/utils';

export function HUD() {
  const { player, phase } = useGameStore();

  if (!player || phase === 'title' || phase === 'dialogue' || phase === 'battle' || phase === 'menchi') return null;

  const hpRatio = player.stats.hp / player.stats.maxHp;
  const spRatio = player.stats.sp / player.stats.maxSp;
  const expRatio = player.exp / player.expToNext;

  return (
    <div className="fixed top-0 left-0 right-0 z-30 pointer-events-none">
      <div className="flex justify-between items-start p-3 bg-gradient-to-b from-black/80 to-transparent">
        <div className="space-y-1 min-w-48">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 text-xs font-bold w-6">HP</span>
            <div className="flex-1 h-3 bg-gray-900 border border-gray-700 overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{ width: `${hpRatio * 100}%`, background: getHpColor(hpRatio) }}
              />
            </div>
            <span className="text-white text-xs w-16 text-right">
              {player.stats.hp}/{player.stats.maxHp}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-blue-400 text-xs font-bold w-6">SP</span>
            <div className="flex-1 h-2 bg-gray-900 border border-gray-700 overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${spRatio * 100}%` }}
              />
            </div>
            <span className="text-white text-xs w-16 text-right">
              {player.stats.sp}/{player.stats.maxSp}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-purple-400 text-xs font-bold w-6">EX</span>
            <div className="flex-1 h-1 bg-gray-900 border border-gray-700 overflow-hidden">
              <div
                className="h-full bg-purple-500 transition-all duration-300"
                style={{ width: `${expRatio * 100}%` }}
              />
            </div>
            <span className="text-gray-400 text-xs w-16 text-right">
              Lv.{player.level}
            </span>
          </div>
        </div>

        <div className="text-center">
          <div className="text-yellow-400 text-xs font-bold">第{player.chapter}章</div>
          <div className="text-white text-xs">{getBanchouRankLabel(player.banchouRank)}</div>
        </div>

        <div className="text-right space-y-1 min-w-32">
          <div className="text-xs text-gray-400">魂ゲージ</div>
          <div className="flex items-center gap-1 justify-end">
            <div className="w-24 h-3 bg-gray-900 border border-gray-700 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-700 to-yellow-500 transition-all duration-500"
                style={{ width: `${player.tamashii}%` }}
              />
            </div>
            <span className="text-yellow-400 text-xs">{player.tamashii}</span>
          </div>
          <div className="text-xs text-gray-500">{getTamashiiLabel(player.tamashii)}</div>
        </div>
      </div>
    </div>
  );
}
