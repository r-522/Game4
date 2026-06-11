'use client';

import { useGameStore } from '@/stores/gameStore';
import { cn } from '@/lib/utils';

export function NotificationStack() {
  const { notifications } = useGameStore();

  return (
    <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={cn(
            'px-4 py-2 border font-bold text-sm max-w-xs text-right',
            'animate-[slideInRight_0.3s_ease-out]',
            n.type === 'success' && 'bg-green-900/90 border-green-500 text-green-300',
            n.type === 'warning' && 'bg-yellow-900/90 border-yellow-500 text-yellow-300',
            n.type === 'error' && 'bg-red-900/90 border-red-500 text-red-300',
            n.type === 'tamashii' && 'bg-orange-900/90 border-orange-500 text-orange-300',
            n.type === 'kizuna' && 'bg-pink-900/90 border-pink-500 text-pink-300',
            (n.type === 'info' || !n.type) && 'bg-gray-900/90 border-gray-500 text-gray-300',
          )}
        >
          {n.message}
        </div>
      ))}
    </div>
  );
}
