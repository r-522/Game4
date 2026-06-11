'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/common/Button';
import { playSfx } from '@/lib/audio';

interface RhythmTankaProps {
  onComplete: (score: number) => void;
}

const TANKA_LINES = [
  { text: 'この拳が', timing: 1.0, key: 'Z' },
  { text: '正義だと', timing: 0.8, key: 'X' },
  { text: '俺は知ってる', timing: 1.2, key: 'Z' },
  { text: 'バカ野郎が', timing: 0.9, key: 'C' },
  { text: '何でもいいから', timing: 1.0, key: 'X' },
  { text: 'かかってこい', timing: 0.8, key: 'Z' },
  { text: '俺の魂', timing: 1.1, key: 'C' },
  { text: '燃やしてやる', timing: 1.3, key: 'X' },
];

type HitResult = 'perfect' | 'good' | 'miss';

export function RhythmTanka({ onComplete }: RhythmTankaProps) {
  const [phase, setPhase] = useState<'intro' | 'playing' | 'result'>('intro');
  const [currentLine, setCurrentLine] = useState(0);
  const [results, setResults] = useState<HitResult[]>([]);
  const [score, setScore] = useState(0);
  const [targetVisible, setTargetVisible] = useState(false);
  const [meterPos, setMeterPos] = useState(50);
  const [meterDir, setMeterDir] = useState(1);
  const [lastHitResult, setLastHitResult] = useState<HitResult | null>(null);

  useEffect(() => {
    if (phase !== 'playing') return;
    let pos = 50;
    let dir = 1;
    const speed = 80 + currentLine * 3;

    setTargetVisible(true);
    const interval = setInterval(() => {
      pos += dir * speed * 0.016;
      if (pos >= 100) { pos = 100; dir = -1; }
      if (pos <= 0) { pos = 0; dir = 1; }
      setMeterPos(pos);
      setMeterDir(dir);
    }, 16);

    return () => clearInterval(interval);
  }, [phase, currentLine]);

  const handleInput = useCallback(() => {
    if (phase !== 'playing') return;

    const distance = Math.abs(meterPos - 50);
    let result: HitResult;
    if (distance < 10) {
      result = 'perfect';
      setScore((s) => s + 100);
      playSfx('punch_special');
    } else if (distance < 25) {
      result = 'good';
      setScore((s) => s + 50);
      playSfx('punch_light');
    } else {
      result = 'miss';
      playSfx('hit');
    }

    setLastHitResult(result);
    const newResults = [...results, result];
    setResults(newResults);

    setTimeout(() => {
      setLastHitResult(null);
      if (currentLine + 1 >= TANKA_LINES.length) {
        setPhase('result');
      } else {
        setCurrentLine((l) => l + 1);
      }
    }, 500);
  }, [phase, meterPos, results, currentLine]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (phase === 'intro' && e.code === 'Space') {
        setPhase('playing');
        return;
      }
      if (phase === 'playing' && ['KeyZ', 'KeyX', 'KeyC', 'Space'].includes(e.code)) {
        e.preventDefault();
        handleInput();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [phase, handleInput]);

  const currentTanka = TANKA_LINES[currentLine];
  const perfectCount = results.filter((r) => r === 'perfect').length;
  const goodCount = results.filter((r) => r === 'good').length;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center text-white">
      <div className="max-w-md w-full p-8 border-2 border-red-800 bg-gray-900 space-y-6">
        <div className="text-center">
          <div className="text-yellow-400 font-black text-2xl">リズム啖呵</div>
          <div className="text-gray-400 text-sm">タイミングよくボタンを押せ！</div>
        </div>

        {phase === 'intro' && (
          <div className="text-center space-y-4">
            <div className="text-6xl">😤</div>
            <p className="text-gray-300">メーターの中央（黄色ゾーン）でボタンを押せ！</p>
            <div className="text-xs text-gray-500">PERFECT: 中心±10% / GOOD: 中心±25%</div>
            <Button variant="banchou" size="lg" className="w-full" onClick={() => setPhase('playing')}>
              啖呵を切れ！（スペース）
            </Button>
          </div>
        )}

        {phase === 'playing' && currentTanka && (
          <div className="space-y-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">{currentLine + 1}/{TANKA_LINES.length}</span>
              <span className="text-yellow-400 font-black">{score}点</span>
            </div>

            <div className="text-center">
              <div className="text-4xl font-black text-white mb-2">{currentTanka.text}</div>
              <div className="text-sm text-gray-400">キー: [{currentTanka.key}] またはスペース</div>
            </div>

            {lastHitResult && (
              <div className={`text-center text-2xl font-black animate-bounce ${
                lastHitResult === 'perfect' ? 'text-yellow-400' :
                lastHitResult === 'good' ? 'text-green-400' : 'text-red-400'
              }`}>
                {lastHitResult === 'perfect' ? '🔥 PERFECT！' :
                 lastHitResult === 'good' ? '✊ GOOD！' : '💀 MISS...'}
              </div>
            )}

            <div className="space-y-2">
              <div className="relative h-8 bg-gray-800 border border-gray-600">
                <div className="absolute inset-y-0 bg-yellow-600/40 border-x border-yellow-500" style={{ left: '40%', width: '20%' }} />
                <div className="absolute inset-y-0 bg-green-600/20 border-x border-green-700" style={{ left: '25%', width: '50%' }} />
                <div
                  className="absolute inset-y-0 w-1 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-none"
                  style={{ left: `${meterPos}%` }}
                />
              </div>
            </div>

            <button
              className="w-full py-4 bg-red-900 border-2 border-red-500 text-white font-black text-xl hover:bg-red-800 active:scale-95 transition-all"
              onClick={handleInput}
            >
              ✊ 今だ！ [{currentTanka.key}]
            </button>
          </div>
        )}

        {phase === 'result' && (
          <div className="text-center space-y-4">
            <div className="text-5xl font-black text-yellow-400">{score}点！</div>
            <div className="space-y-1 text-sm">
              <div className="text-yellow-400">PERFECT: {perfectCount}回</div>
              <div className="text-green-400">GOOD: {goodCount}回</div>
              <div className="text-red-400">MISS: {results.filter((r) => r === 'miss').length}回</div>
            </div>
            <div className="text-lg font-bold">
              {score >= 700 ? '🔥 伝説の啖呵！' :
               score >= 500 ? '💪 立派な啖呵！' :
               score >= 300 ? '😤 まあまあ' : '😅 もっと修行しろ'}
            </div>
            <Button variant="banchou" size="lg" className="w-full" onClick={() => onComplete(score)}>
              終了
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
