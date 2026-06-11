'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/common/Button';
import type { Difficulty } from '@/types/game';
import { playSfx, playBgm } from '@/lib/audio';

export function TitleScreen() {
  const { setPhase, startNewGame, saves, loadGame } = useGameStore();
  const [screen, setScreen] = useState<'main' | 'new_game' | 'load' | 'credits'>('main');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('normal');
  const [flickerOn, setFlickerOn] = useState(true);

  useEffect(() => {
    playBgm('chapter1_theme');
    const interval = setInterval(() => setFlickerOn((v) => !v), 800);
    return () => clearInterval(interval);
  }, []);

  const difficulties: { id: Difficulty; label: string; desc: string }[] = [
    { id: 'easy', label: 'ゆるめ', desc: 'HP多め・ダメージ少なめ。物語を楽しみたい人向け。' },
    { id: 'normal', label: 'ノーマル', desc: '標準的な難易度。これが本来の喧嘩番長。' },
    { id: 'hard', label: 'ハード', desc: '手加減なし。本物の喧嘩師向け。' },
    { id: 'banchou', label: '番長', desc: '死ぬほどキツい。真の番長だけが挑め。' },
  ];

  if (screen === 'new_game') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-8">
        <h2 className="text-3xl font-black mb-2 text-yellow-400">難易度選択</h2>
        <p className="text-gray-400 mb-8 text-sm">お前の魂の強さを選べ</p>
        <div className="flex flex-col gap-4 w-full max-w-md">
          {difficulties.map((d) => (
            <button
              key={d.id}
              className={`p-4 border-2 text-left transition-all ${
                selectedDifficulty === d.id
                  ? 'border-yellow-400 bg-yellow-900/30 text-yellow-300'
                  : 'border-gray-700 bg-gray-900 text-gray-300 hover:border-gray-500'
              }`}
              onClick={() => { playSfx('menu_select'); setSelectedDifficulty(d.id); }}
            >
              <div className="font-black text-lg">{d.label}</div>
              <div className="text-sm opacity-70">{d.desc}</div>
            </button>
          ))}
        </div>
        <div className="flex gap-4 mt-8">
          <Button variant="secondary" onClick={() => setScreen('main')}>戻る</Button>
          <Button
            variant="banchou"
            size="lg"
            glow
            onClick={() => startNewGame(selectedDifficulty)}
          >
            ゲームスタート！
          </Button>
        </div>
      </div>
    );
  }

  if (screen === 'load') {
    const validSaves = saves.filter(Boolean);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-8">
        <h2 className="text-3xl font-black mb-8 text-yellow-400">セーブデータ選択</h2>
        {validSaves.length === 0 ? (
          <p className="text-gray-500">セーブデータがありません。</p>
        ) : (
          <div className="flex flex-col gap-4 w-full max-w-md">
            {validSaves.map((save) => (
              <button
                key={save.slot}
                className="p-4 border-2 border-gray-700 bg-gray-900 text-left hover:border-yellow-500 transition-all"
                onClick={() => { playSfx('menu_confirm'); loadGame(save); }}
              >
                <div className="font-black text-yellow-300">スロット {save.slot}</div>
                <div className="text-sm text-gray-300">第{save.chapter}章 / Lv {save.playerData.level}</div>
                <div className="text-xs text-gray-500">{new Date(save.timestamp).toLocaleString('ja-JP')}</div>
              </button>
            ))}
          </div>
        )}
        <Button variant="secondary" className="mt-8" onClick={() => setScreen('main')}>戻る</Button>
      </div>
    );
  }

  if (screen === 'credits') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-8">
        <h2 className="text-3xl font-black mb-8 text-yellow-400">クレジット</h2>
        <div className="text-center text-gray-300 space-y-2 max-w-md">
          <p className="text-xl font-black text-white">魂番長 ～俺たちの青春伝説～</p>
          <p className="text-sm">TAMASHII BANCHOU</p>
          <div className="border-t border-gray-700 my-4" />
          <p>企画・設計・実装・全部</p>
          <p className="text-yellow-400 font-bold">魂番長制作委員会</p>
          <div className="border-t border-gray-700 my-4" />
          <p className="text-xs text-gray-500">
            本作品はフィクションです。実在の人物・団体とは一切関係ありません。
          </p>
          <p className="text-xs text-gray-500 mt-2">
            喧嘩は作品の中だけにしておけ。現実では法律を守れよ。
          </p>
        </div>
        <Button variant="secondary" className="mt-8" onClick={() => setScreen('main')}>戻る</Button>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-black overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-red-950/20 via-black to-black" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-px bg-red-800/20"
            style={{
              left: `${(i * 5.26)}%`,
              height: '100%',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-2 text-red-500 text-sm font-mono tracking-widest opacity-70">
          TAMASHII BANCHOU
        </div>

        <h1 className="text-center mb-1">
          <span className="block text-6xl md:text-8xl font-black text-white leading-none"
            style={{ textShadow: '0 0 30px rgba(239,68,68,0.8), 0 0 60px rgba(239,68,68,0.4)' }}>
            魂
          </span>
          <span className="block text-4xl md:text-6xl font-black text-red-500 leading-none"
            style={{ textShadow: '0 0 20px rgba(239,68,68,0.6)' }}>
            番長
          </span>
        </h1>

        <div className="text-yellow-400 text-sm md:text-base font-bold mt-2 mb-12 tracking-widest">
          ～俺たちの青春伝説～
        </div>

        {flickerOn && (
          <div className="text-gray-400 text-sm mb-8 animate-pulse">
            ─ クリックして始める ─
          </div>
        )}

        <div className="flex flex-col gap-4 w-56">
          <Button variant="banchou" size="lg" glow onClick={() => setScreen('new_game')}>
            新しくはじめる
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={() => setScreen('load')}
            disabled={saves.length === 0}
          >
            つづきから
          </Button>
          <Button variant="secondary" size="lg" onClick={() => setScreen('credits')}>
            クレジット
          </Button>
        </div>

        <div className="mt-16 text-xs text-gray-700 text-center">
          <p>WASD/矢印キー: 移動 / Z: 軽攻撃 / X: 重攻撃</p>
          <p>C: 必殺技 / Space: 回避 / Shift: ガード / R: 挑発</p>
        </div>
      </div>
    </div>
  );
}
