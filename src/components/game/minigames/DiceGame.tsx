'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/common/Button';
import { playSfx } from '@/lib/audio';

interface DiceGameProps {
  onComplete: (won: boolean, prize: number) => void;
}

export function DiceGame({ onComplete }: DiceGameProps) {
  const { player, healPlayer, addNotification } = useGameStore();
  const [phase, setPhase] = useState<'bet' | 'rolling' | 'result'>('bet');
  const [betAmount, setBetAmount] = useState(0);
  const [betType, setBetType] = useState<'even' | 'odd'>('even');
  const [diceValues, setDiceValues] = useState([1, 1]);
  const [rolling, setRolling] = useState(false);
  const [playerMoney, setPlayerMoney] = useState(500);
  const [result, setResult] = useState<'win' | 'lose' | null>(null);

  const rollDice = () => {
    if (betAmount <= 0 || betAmount > playerMoney) {
      addNotification('賭け金を設定してください', 'warning');
      return;
    }
    playSfx('punch_light');
    setRolling(true);
    setPhase('rolling');

    let rolls = 0;
    const interval = setInterval(() => {
      setDiceValues([Math.ceil(Math.random() * 6), Math.ceil(Math.random() * 6)]);
      rolls++;
      if (rolls >= 15) {
        clearInterval(interval);
        const final = [Math.ceil(Math.random() * 6), Math.ceil(Math.random() * 6)];
        setDiceValues(final);
        const sum = final[0] + final[1];
        const isEven = sum % 2 === 0;
        const won = (betType === 'even' && isEven) || (betType === 'odd' && !isEven);

        setResult(won ? 'win' : 'lose');
        setRolling(false);
        setPhase('result');

        if (won) {
          setPlayerMoney((m) => m + betAmount);
          playSfx('victory');
          addNotification(`丁！${betAmount}円ゲット！`, 'success');
        } else {
          setPlayerMoney((m) => m - betAmount);
          playSfx('defeat');
          addNotification(`半！${betAmount}円失った...`, 'error');
        }
      }
    }, 100);
  };

  const DICE_FACES = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center text-white">
      <div className="max-w-md w-full p-8 border-2 border-red-800 bg-gray-900 space-y-6">
        <div className="text-center">
          <div className="text-yellow-400 font-black text-2xl">喧嘩サイコロ</div>
          <div className="text-gray-400 text-sm">丁半ゲーム！</div>
        </div>

        <div className="flex justify-between">
          <div>所持金: <span className="text-yellow-400 font-black">{playerMoney}円</span></div>
          <div>賭け金: <span className="text-red-400 font-black">{betAmount}円</span></div>
        </div>

        <div className="flex justify-center gap-8 text-6xl">
          {diceValues.map((v, i) => (
            <div
              key={i}
              className={rolling ? 'animate-spin' : ''}
              style={{ animationDuration: '0.1s' }}
            >
              {DICE_FACES[v]}
            </div>
          ))}
        </div>

        {phase !== 'result' && (
          <>
            <div>
              <div className="text-xs text-gray-400 mb-2">賭け金</div>
              <div className="flex gap-2">
                {[50, 100, 200, 500].map((amt) => (
                  <button
                    key={amt}
                    className={`flex-1 py-2 border text-sm font-bold ${
                      betAmount === amt ? 'border-yellow-500 bg-yellow-900/30 text-yellow-300' : 'border-gray-700 text-gray-400 hover:border-gray-500'
                    }`}
                    onClick={() => { playSfx('menu_select'); setBetAmount(amt); }}
                    disabled={amt > playerMoney}
                  >
                    {amt}円
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-400 mb-2">丁か半か</div>
              <div className="flex gap-4">
                {(['even', 'odd'] as const).map((t) => (
                  <button
                    key={t}
                    className={`flex-1 py-3 border-2 font-black text-lg ${
                      betType === t ? 'border-yellow-500 bg-yellow-900/30 text-yellow-300' : 'border-gray-700 text-gray-400 hover:border-gray-500'
                    }`}
                    onClick={() => { playSfx('menu_select'); setBetType(t); }}
                  >
                    {t === 'even' ? '丁（偶数）' : '半（奇数）'}
                  </button>
                ))}
              </div>
            </div>

            <Button variant="banchou" size="lg" className="w-full" onClick={rollDice} disabled={rolling}>
              サイコロを振れ！
            </Button>
          </>
        )}

        {phase === 'result' && (
          <div className="text-center space-y-4">
            <div className={`text-3xl font-black ${result === 'win' ? 'text-yellow-400' : 'text-red-400'}`}>
              {result === 'win' ? '🎲 丁！勝ち！' : '🎲 半！負け...'}
            </div>
            <div className="text-gray-300">合計: {diceValues[0] + diceValues[1]}（{(diceValues[0] + diceValues[1]) % 2 === 0 ? '丁' : '半'}）</div>
            <div className="flex gap-4">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => { setPhase('bet'); setResult(null); setBetAmount(0); }}
                disabled={playerMoney <= 0}
              >
                もう一回
              </Button>
              <Button variant="ghost" className="flex-1" onClick={() => onComplete(result === 'win', playerMoney)}>
                やめる
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
