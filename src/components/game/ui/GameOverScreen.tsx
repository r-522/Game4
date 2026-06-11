'use client';

import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/common/Button';

export function GameOverScreen() {
  const { setPhase, player, healPlayer } = useGameStore();

  const handleRetry = () => {
    if (player) {
      healPlayer(player.stats.maxHp, 'both');
    }
    setPhase('world');
  };

  return (
    <div className="fixed inset-0 z-60 bg-black flex flex-col items-center justify-center text-white">
      <div className="text-7xl font-black text-red-600 mb-4"
        style={{ textShadow: '0 0 40px rgba(220,38,38,0.8)' }}>
        GAME OVER
      </div>
      <div className="text-gray-400 text-lg mb-2">負けた。でも終わりじゃない。</div>
      <div className="text-gray-600 text-sm mb-10">
        「転んだ回数より、立ち上がった回数が多ければいい。」
      </div>

      <div className="flex flex-col gap-4 w-56">
        <Button variant="banchou" size="lg" glow onClick={handleRetry}>
          立ち上がれ！（再挑戦）
        </Button>
        <Button variant="secondary" size="lg" onClick={() => setPhase('menu')}>
          マップに戻る
        </Button>
        <Button variant="ghost" size="lg" onClick={() => setPhase('title')}>
          タイトルへ
        </Button>
      </div>
    </div>
  );
}
