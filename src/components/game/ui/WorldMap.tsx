'use client';

import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { AREAS, AREA_ORDER } from '@/data/areas';
import { ENEMIES } from '@/data/enemies';
import { STORY_EVENTS } from '@/data/story';
import { Button } from '@/components/common/Button';
import { playSfx } from '@/lib/audio';

export function WorldMap() {
  const { player, setCurrentArea, startBattle, setCurrentEvent, setPhase, addNotification } = useGameStore();
  const [selectedArea, setSelectedArea] = useState<string>(player?.currentArea || 'reppuu_school');
  const [showAreaDetail, setShowAreaDetail] = useState(false);

  if (!player) return null;

  const area = AREAS[selectedArea];
  const isUnlocked = selectedArea === 'reppuu_school' ||
    player.flags[`area_${selectedArea}_unlocked`] ||
    (selectedArea === 'shopping_district' && player.flags['ch1_complete']) ||
    (selectedArea === 'waterfront' && player.flags['ch2_complete']) ||
    (selectedArea === 'industrial' && player.flags['ch3_complete']) ||
    (selectedArea === 'hilltop_park' && player.flags['ch2_complete']) ||
    (selectedArea === 'akabane' && player.flags['ch3_complete']) ||
    (selectedArea === 'castle_ruins' && player.flags['ch4_complete']);

  const handleEnterArea = () => {
    if (!isUnlocked) {
      addNotification('このエリアはまだ解放されていない！', 'warning');
      return;
    }
    playSfx('menu_confirm');
    setCurrentArea(selectedArea);
    setPhase('world');
    setShowAreaDetail(false);

    const areaEvent = Object.values(STORY_EVENTS).find(
      (e) => e.trigger.type === 'area_enter' &&
        e.trigger.value === selectedArea &&
        !player.flags[`${e.id}_done`]
    );
    if (areaEvent) {
      setTimeout(() => setCurrentEvent(areaEvent.id), 300);
    }
  };

  const handleFight = (enemyId: string) => {
    if (!isUnlocked) return;
    playSfx('menu_confirm');
    startBattle(enemyId);
  };

  return (
    <div className="fixed inset-0 z-35 bg-black/95 text-white flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-red-900">
        <h2 className="font-black text-yellow-400 text-xl">鉄義市マップ</h2>
        <Button variant="ghost" size="sm" onClick={() => setPhase('world')}>✕ 閉じる</Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/3 border-r border-gray-800 overflow-y-auto">
          {AREA_ORDER.map((areaId) => {
            const a = AREAS[areaId];
            const unlocked = areaId === 'reppuu_school' ||
              player.flags[`area_${areaId}_unlocked`] ||
              (areaId === 'shopping_district' && player.flags['ch1_complete']) ||
              (areaId === 'waterfront' && player.flags['ch2_complete']) ||
              (areaId === 'industrial' && player.flags['ch3_complete']) ||
              (areaId === 'hilltop_park' && player.flags['ch2_complete']) ||
              (areaId === 'akabane' && player.flags['ch3_complete']) ||
              (areaId === 'castle_ruins' && player.flags['ch4_complete']);

            return (
              <button
                key={areaId}
                className={`w-full p-3 text-left border-b border-gray-800 transition-all ${
                  selectedArea === areaId
                    ? 'bg-red-900/40 border-l-4 border-l-red-500'
                    : 'hover:bg-gray-900'
                } ${!unlocked ? 'opacity-40' : ''}`}
                onClick={() => { playSfx('menu_select'); setSelectedArea(areaId); }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{a.thumbnail}</span>
                  <div>
                    <div className={`font-bold text-sm ${unlocked ? 'text-white' : 'text-gray-600'}`}>
                      {a.nameJp}
                    </div>
                    <div className="text-xs text-gray-500">{unlocked ? '解放済み' : '🔒 未解放'}</div>
                  </div>
                  {player.currentArea === areaId && (
                    <span className="ml-auto text-xs text-yellow-400">現在地</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {area && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{area.thumbnail}</span>
                <div>
                  <h3 className="font-black text-2xl text-yellow-400">{area.nameJp}</h3>
                  <div className="text-sm text-gray-400">{area.name}</div>
                </div>
              </div>

              <p className="text-gray-300 text-sm leading-relaxed">{area.description}</p>

              {isUnlocked ? (
                <>
                  <Button variant="banchou" size="lg" className="w-full" onClick={handleEnterArea}>
                    このエリアに行く！
                  </Button>

                  {area.enemies.length > 0 && (
                    <div>
                      <div className="text-xs text-gray-400 mb-2 font-bold border-b border-gray-800 pb-1">
                        出現する相手
                      </div>
                      <div className="space-y-2">
                        {area.enemies.map((eid) => {
                          const enemy = ENEMIES[eid];
                          if (!enemy) return null;
                          return (
                            <div key={eid} className="flex items-center justify-between border border-gray-700 bg-gray-900 p-3">
                              <div>
                                <div
                                  className="font-bold text-sm"
                                  style={{ color: enemy.modelColor || '#ffffff' }}
                                >
                                  {enemy.nameJp}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Lv.{enemy.level} / {enemy.isBoss ? '🔥 ボス' : '雑魚'}
                                </div>
                              </div>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleFight(eid)}
                              >
                                喧嘩を売る
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="border border-gray-700 bg-gray-900 p-4 text-center">
                  <div className="text-gray-500 font-bold">🔒 このエリアはまだ解放されていない</div>
                  <div className="text-xs text-gray-600 mt-1">ストーリーを進めると解放される</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
