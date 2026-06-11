'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { ENEMIES } from '@/data/enemies';
import { playSfx } from '@/lib/audio';

interface MenchiSystemProps {
  enemyId: string;
  onComplete: (playerWon: boolean) => void;
}

type RoundResult = 'player' | 'enemy' | null;

export function MenchiSystem({ enemyId, onComplete }: MenchiSystemProps) {
  const { player } = useGameStore();
  const enemy = ENEMIES[enemyId];

  const [phase, setPhase] = useState<'intro' | 'staredown' | 'result' | 'summary'>('intro');
  const [round, setRound] = useState(1);
  const [playerWins, setPlayerWins] = useState(0);
  const [enemyWins, setEnemyWins] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [targetZone, setTargetZone] = useState({ start: 30, end: 70 });
  const [meterValue, setMeterValue] = useState(50);
  const [meterDir, setMeterDir] = useState(1);
  const [pressCount, setPressCount] = useState(0);
  const [roundResult, setRoundResult] = useState<RoundResult>(null);
  const [intensity, setIntensity] = useState(1);
  const [shakeX, setShakeX] = useState(0);
  const animRef = useRef<number | undefined>(undefined);
  const lastTime = useRef(0);
  const meterSpeed = useRef(40 + (enemy?.stats.speed || 5) * 2);

  const generateTargetZone = useCallback(() => {
    const size = Math.max(15, 35 - round * 3);
    const start = Math.random() * (80 - size) + 10;
    setTargetZone({ start, end: start + size });
    setMeterValue(50);
    setMeterDir(1);
  }, [round]);

  useEffect(() => {
    if (phase === 'staredown') {
      generateTargetZone();
      setPressCount(0);
      setRoundResult(null);
    }
  }, [phase, generateTargetZone]);

  useEffect(() => {
    if (phase !== 'staredown') return;

    let localMeter = meterValue;
    let dir = meterDir;
    const speed = meterSpeed.current * (1 + (round - 1) * 0.15);

    const animate = (time: number) => {
      const delta = (time - lastTime.current) / 1000;
      lastTime.current = time;

      localMeter += dir * speed * delta;
      if (localMeter >= 100) { localMeter = 100; dir = -1; }
      if (localMeter <= 0) { localMeter = 0; dir = 1; }

      setMeterValue(localMeter);
      setMeterDir(dir);
      setShakeX(Math.sin(time / 80) * intensity * 2);

      animRef.current = requestAnimationFrame(animate);
    };

    lastTime.current = performance.now();
    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [phase, round, intensity, meterDir]);

  const handlePress = useCallback(() => {
    if (phase !== 'staredown' || roundResult) return;
    playSfx('menu_select');

    const newCount = pressCount + 1;
    setPressCount(newCount);
    setIntensity((p) => Math.min(p + 0.3, 3));

    if (newCount >= 3) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      const inZone = meterValue >= targetZone.start && meterValue <= targetZone.end;
      const result: RoundResult = inZone ? 'player' : 'enemy';
      setRoundResult(result);

      if (inZone) {
        playSfx('menchi_win');
        setPlayerWins((p) => p + 1);
      } else {
        playSfx('menchi_lose');
        setEnemyWins((p) => p + 1);
      }

      setResults((r) => [...r, result]);
      setPhase('result');

      setTimeout(() => {
        if (round >= 3 || playerWins + (inZone ? 1 : 0) >= 2 || enemyWins + (!inZone ? 1 : 0) >= 2) {
          setPhase('summary');
        } else {
          setRound((r) => r + 1);
          setIntensity(1);
          setPhase('staredown');
        }
      }, 1500);
    }
  }, [phase, pressCount, meterValue, targetZone, round, playerWins, enemyWins, roundResult]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'KeyZ') {
        e.preventDefault();
        if (phase === 'intro') setPhase('staredown');
        else if (phase === 'summary') {
          const won = playerWins > enemyWins;
          onComplete(won);
        } else handlePress();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [phase, handlePress, playerWins, enemyWins, onComplete]);

  if (!enemy || !player) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/90">
      <div
        className="w-full max-w-2xl p-8 text-white"
        style={{ transform: `translateX(${shakeX}px)` }}
      >
        {phase === 'intro' && (
          <div className="text-center space-y-6">
            <div className="text-red-500 text-lg font-bold tracking-widest">─ メンチシステム ─</div>
            <div className="text-4xl font-black text-yellow-400">睨み合い！</div>
            <div className="flex justify-between items-center text-xl font-black px-8">
              <div className="text-yellow-300">{player.name}</div>
              <div className="text-4xl">👁️ VS 👁️</div>
              <div className="text-red-300">{enemy.nameJp}</div>
            </div>
            <div className="text-gray-300 text-sm">
              3回ボタンを押し、メーターがゾーンに入ったタイミングで止めろ！
            </div>
            <div className="text-yellow-400 animate-pulse">スペース/Zキーで開始</div>
          </div>
        )}

        {(phase === 'staredown' || phase === 'result') && (
          <div className="space-y-6">
            <div className="flex justify-between text-sm font-bold">
              <span className="text-yellow-400">第{round}ラウンド</span>
              <div className="flex gap-4">
                <span>自分: {'⭐'.repeat(playerWins)}</span>
                <span>相手: {'💀'.repeat(enemyWins)}</span>
              </div>
            </div>

            <div className="text-center text-6xl">
              {roundResult === 'player' ? '😤 > 😨' : roundResult === 'enemy' ? '😨 < 😤' : '😤 👁️ 😤'}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>弱気</span>
                <span>強気</span>
              </div>
              <div className="relative h-8 bg-gray-800 border border-gray-600">
                <div
                  className="absolute inset-y-0 bg-green-600/50 border-x border-green-400"
                  style={{ left: `${targetZone.start}%`, width: `${targetZone.end - targetZone.start}%` }}
                />
                <div
                  className="absolute inset-y-0 w-1 bg-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.8)]"
                  style={{ left: `${meterValue}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500 font-bold pointer-events-none">
                  ここに止めろ！
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-3 mt-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className={`w-12 h-12 border-2 flex items-center justify-center font-black text-lg ${
                    n <= pressCount
                      ? 'border-yellow-400 bg-yellow-900 text-yellow-300'
                      : 'border-gray-600 bg-gray-900 text-gray-600'
                  }`}
                >
                  {n <= pressCount ? '✊' : n}
                </div>
              ))}
            </div>

            {roundResult && (
              <div className={`text-center text-2xl font-black ${roundResult === 'player' ? 'text-yellow-400' : 'text-red-400'}`}>
                {roundResult === 'player' ? '💪 メンチ勝ち！' : '😰 メンチ負け...'}
              </div>
            )}

            {phase === 'staredown' && !roundResult && (
              <button
                className="w-full py-4 bg-red-900 border-2 border-red-500 text-white font-black text-lg hover:bg-red-800 active:scale-95 transition-all"
                onClick={handlePress}
              >
                ✊ 気合を入れろ！（{3 - pressCount}回残り）
              </button>
            )}
          </div>
        )}

        {phase === 'summary' && (
          <div className="text-center space-y-6">
            <div className={`text-5xl font-black ${playerWins > enemyWins ? 'text-yellow-400' : 'text-red-400'}`}>
              {playerWins > enemyWins ? '🔥 睨み勝ち！' : '💀 睨み負け...'}
            </div>
            <div className="text-gray-300">
              {playerWins > enemyWins
                ? '先手有利！相手はひるんだ！'
                : '先手を取られた...気合を立て直せ！'}
            </div>
            <div className="flex justify-center gap-8 text-lg font-bold">
              <div>勝ち: {playerWins}</div>
              <div className="text-gray-500">vs</div>
              <div>負け: {enemyWins}</div>
            </div>
            <button
              className="px-8 py-3 bg-red-900 border-2 border-red-500 text-white font-black text-lg hover:bg-red-800 transition-all"
              onClick={() => onComplete(playerWins > enemyWins)}
            >
              喧嘩開始！（スペース/Z）
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
