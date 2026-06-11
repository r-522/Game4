'use client';

import { cn } from '@/lib/utils';
import { playSfx } from '@/lib/audio';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'banchou';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  glow?: boolean;
}

export function Button({ variant = 'primary', size = 'md', glow, className, onClick, children, ...props }: ButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    playSfx('menu_confirm');
    onClick?.(e);
  };

  return (
    <button
      className={cn(
        'relative font-bold tracking-wider uppercase transition-all duration-150 active:scale-95 border-2 select-none',
        variant === 'primary' && 'bg-red-900 border-red-500 text-yellow-300 hover:bg-red-800 hover:border-yellow-400',
        variant === 'secondary' && 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700 hover:border-gray-400',
        variant === 'danger' && 'bg-red-700 border-red-400 text-white hover:bg-red-600',
        variant === 'ghost' && 'bg-transparent border-gray-700 text-gray-300 hover:bg-gray-900 hover:border-gray-500',
        variant === 'banchou' && 'bg-yellow-600 border-yellow-400 text-black hover:bg-yellow-500 font-black',
        size === 'sm' && 'px-3 py-1 text-xs',
        size === 'md' && 'px-5 py-2 text-sm',
        size === 'lg' && 'px-7 py-3 text-base',
        size === 'xl' && 'px-10 py-4 text-lg',
        glow && 'shadow-[0_0_15px_rgba(239,68,68,0.6)]',
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}
