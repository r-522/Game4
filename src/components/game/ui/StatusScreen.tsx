'use client';

import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/common/Button';
import { SKILLS } from '@/data/skills';
import { FASHION_OPTIONS } from '@/data/items';
import { getBanchouRankLabel, getTamashiiLabel, getKizunaLabel } from '@/lib/utils';
import { playSfx } from '@/lib/audio';

type Tab = 'status' | 'skills' | 'fashion' | 'kizuna' | 'save';

export function StatusScreen() {
  const { player, setPhase, saveGame, learnSkill, updateFashion, saves } = useGameStore();
  const [tab, setTab] = useState<Tab>('status');

  if (!player) return null;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'status', label: 'ステータス' },
    { id: 'skills', label: '技' },
    { id: 'fashion', label: 'ファッション' },
    { id: 'kizuna', label: '絆' },
    { id: 'save', label: 'セーブ' },
  ];

  const KIZUNA_CHARS = [
    { id: 'muto', name: '武藤 剛', emoji: '💪' },
    { id: 'kuroki', name: '黒木 鷹', emoji: '🦅' },
    { id: 'ren', name: '藤原 蓮', emoji: '🌿' },
    { id: 'yuki', name: '田中 ユキ', emoji: '🌸' },
    { id: 'akaoni', name: '赤木 鬼太', emoji: '👹' },
  ];

  return (
    <div className="fixed inset-0 z-40 bg-black/95 text-white flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-red-900">
        <div>
          <div className="font-black text-yellow-400 text-lg">{player.name}</div>
          <div className="text-xs text-gray-400">{getBanchouRankLabel(player.banchouRank)}</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black">Lv.{player.level}</div>
          <div className="text-xs text-gray-400">EXP {player.exp}/{player.expToNext}</div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setPhase('world')}>✕ 閉じる</Button>
      </div>

      <div className="flex border-b border-gray-800 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`px-4 py-2 text-sm font-bold whitespace-nowrap transition-colors ${
              tab === t.id
                ? 'bg-red-900 text-yellow-300 border-b-2 border-yellow-400'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => { playSfx('menu_select'); setTab(t.id); }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'status' && (
          <div className="space-y-4 max-w-md mx-auto">
            <div className="text-center text-6xl mb-4">😤</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'HP', val: `${player.stats.hp}/${player.stats.maxHp}`, color: 'text-green-400' },
                { label: 'SP', val: `${player.stats.sp}/${player.stats.maxSp}`, color: 'text-blue-400' },
                { label: '攻撃力', val: player.stats.attack, color: 'text-red-400' },
                { label: '防御力', val: player.stats.defense, color: 'text-yellow-400' },
                { label: '素早さ', val: player.stats.speed, color: 'text-cyan-400' },
                { label: '魂', val: `${player.tamashii}/100`, color: 'text-orange-400' },
              ].map((s) => (
                <div key={s.label} className="bg-gray-900 border border-gray-700 p-3">
                  <div className="text-xs text-gray-400">{s.label}</div>
                  <div className={`font-black text-xl ${s.color}`}>{s.val}</div>
                </div>
              ))}
            </div>
            <div className="bg-gray-900 border border-gray-700 p-3">
              <div className="text-xs text-gray-400 mb-1">魂の評価</div>
              <div className="text-yellow-400 font-bold">{getTamashiiLabel(player.tamashii)}</div>
              <div className="h-2 bg-gray-800 mt-2">
                <div
                  className="h-full bg-gradient-to-r from-red-700 to-yellow-500"
                  style={{ width: `${player.tamashii}%` }}
                />
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-700 p-3">
              <div className="text-xs text-gray-400 mb-1">現在地</div>
              <div className="text-white font-bold">{player.currentArea}</div>
            </div>
          </div>
        )}

        {tab === 'skills' && (
          <div className="space-y-3 max-w-lg mx-auto">
            <p className="text-xs text-gray-500 mb-4">習得済みの技を確認できる。戦闘中はZ/X/Cキーで使用。</p>
            {Object.values(SKILLS).map((skill) => {
              const learned = player.learnedSkills.includes(skill.id);
              const canLearn = !learned && player.level >= skill.unlockLevel && player.tamashii >= skill.tamashiiRequired;
              return (
                <div
                  key={skill.id}
                  className={`border p-3 ${learned ? 'border-yellow-700 bg-yellow-900/10' : 'border-gray-700 bg-gray-900 opacity-60'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-black text-sm text-yellow-300">{skill.nameJp}</div>
                      <div className="text-xs text-gray-400">{skill.name}</div>
                      <div className="text-xs text-gray-300 mt-1">{skill.description}</div>
                    </div>
                    <div className="text-right text-xs space-y-1">
                      <div className="text-red-400">ダメージ: {skill.damage}</div>
                      <div className="text-blue-400">SP: {skill.spCost}</div>
                      <div className="text-gray-400">Lv{skill.unlockLevel}習得</div>
                    </div>
                  </div>
                  {canLearn && (
                    <button
                      className="mt-2 w-full py-1 bg-green-900 border border-green-600 text-green-300 text-xs font-bold hover:bg-green-800"
                      onClick={() => { learnSkill(skill.id); playSfx('level_up'); }}
                    >
                      技を習得する！
                    </button>
                  )}
                  {!learned && !canLearn && (
                    <div className="mt-1 text-xs text-gray-600">
                      {player.level < skill.unlockLevel ? `Lv${skill.unlockLevel}で解放` : '魂ゲージが足りない'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {tab === 'fashion' && (
          <div className="space-y-6 max-w-lg mx-auto">
            <div className="text-center text-6xl mb-2">
              {player.fashion.hair === 'regent' ? '💈' : player.fashion.hair === 'mohawk' ? '⚡' : '😤'}
            </div>
            {(Object.entries(FASHION_OPTIONS) as [string, typeof FASHION_OPTIONS.uniform][]).map(([key, options]) => (
              <div key={key}>
                <div className="text-xs text-gray-400 mb-2 capitalize font-bold border-b border-gray-800 pb-1">{key}</div>
                <div className="grid grid-cols-2 gap-2">
                  {options.map((opt) => {
                    const current = player.fashion[key as keyof typeof player.fashion];
                    const selected = current === opt.id;
                    return (
                      <button
                        key={opt.id}
                        className={`p-2 text-left border text-sm transition-all ${
                          selected
                            ? 'border-yellow-500 bg-yellow-900/30 text-yellow-300'
                            : 'border-gray-700 bg-gray-900 text-gray-300 hover:border-gray-500'
                        }`}
                        onClick={() => { updateFashion(key, opt.id); playSfx('menu_select'); }}
                      >
                        <div className="font-bold text-xs">{opt.nameJp}</div>
                        {opt.stats && Object.keys(opt.stats).length > 0 && (
                          <div className="text-xs text-green-400">
                            {Object.entries(opt.stats).map(([k, v]) => `${k}:${v > 0 ? '+' : ''}${v}`).join(' ')}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'kizuna' && (
          <div className="space-y-4 max-w-md mx-auto">
            <p className="text-xs text-gray-500">仲間との絆レベル。高いほど強くなれる。</p>
            {KIZUNA_CHARS.map((c) => {
              const level = player.kizuna[c.id] || 0;
              return (
                <div key={c.id} className="bg-gray-900 border border-gray-700 p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{c.emoji}</span>
                    <div>
                      <div className="font-black text-white">{c.name}</div>
                      <div className="text-xs text-gray-400">{getKizunaLabel(level)}</div>
                    </div>
                    <div className="ml-auto text-yellow-400 font-black">Rank {level}/5</div>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div
                        key={n}
                        className={`flex-1 h-3 border ${n <= level ? 'bg-yellow-500 border-yellow-400' : 'bg-gray-800 border-gray-700'}`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'save' && (
          <div className="space-y-4 max-w-md mx-auto">
            <p className="text-sm text-gray-400 mb-4">スロットを選んでセーブ。3スロット利用可能。</p>
            {[1, 2, 3].map((slot) => {
              const existing = saves.find((s) => s.slot === slot);
              return (
                <div key={slot} className="border border-gray-700 p-4 bg-gray-900">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-black text-yellow-400">スロット {slot}</span>
                    {existing && (
                      <span className="text-xs text-gray-400">
                        第{existing.chapter}章 / Lv{existing.playerData.level}
                      </span>
                    )}
                  </div>
                  {existing && (
                    <div className="text-xs text-gray-500 mb-2">
                      {new Date(existing.timestamp).toLocaleString('ja-JP')}
                    </div>
                  )}
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => { saveGame(slot); playSfx('menu_confirm'); }}
                  >
                    {existing ? '上書きセーブ' : 'このスロットにセーブ'}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
