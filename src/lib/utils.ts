import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function getBanchouRankLabel(rank: string): string {
  const labels: Record<string, string> = {
    chinpira: 'チンピラ',
    furyo: '不良',
    banchou_koho: '番長候補',
    fuku_banchou: '副番長',
    banchou: '番長',
    densetsu: '伝説の番長',
  };
  return labels[rank] || rank;
}

export function getTamashiiLabel(tamashii: number): string {
  if (tamashii >= 80) return '漢の中の漢';
  if (tamashii >= 60) return '真の番長';
  if (tamashii >= 40) return '義理堅い男';
  if (tamashii >= 20) return '普通の不良';
  return 'チキン野郎';
}

export function getKizunaLabel(level: number): string {
  const labels = ['見知らぬ人', '顔見知り', '友達', '仲間', '盟友', '魂の兄弟'];
  return labels[Math.min(level, 5)];
}

export function getHpColor(ratio: number): string {
  if (ratio > 0.6) return '#22c55e';
  if (ratio > 0.3) return '#eab308';
  return '#ef4444';
}

export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
