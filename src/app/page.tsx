'use client';

import dynamic from 'next/dynamic';

const GameController = dynamic(
  () => import('@/components/game/GameController').then((m) => m.GameController),
  { ssr: false, loading: () => <LoadingScreen /> }
);

function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center">
      <div className="text-red-500 text-6xl font-black mb-4"
        style={{ textShadow: '0 0 20px rgba(239,68,68,0.6)' }}>
        魂
      </div>
      <div className="text-gray-400 text-sm animate-pulse">Loading...</div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="w-full h-screen bg-black overflow-hidden">
      <GameController />
    </main>
  );
}
