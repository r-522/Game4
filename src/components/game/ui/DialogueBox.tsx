'use client';

import { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { STORY_EVENTS } from '@/data/story';
import { playSfx } from '@/lib/audio';
import type { DialogueLine } from '@/types/story';

const SPEAKER_COLORS: Record<string, string> = {
  Retsu: '#FFD700',
  Muto: '#FF6B35',
  Kuroki: '#9999FF',
  Ren: '#88DDAA',
  Yuki: '#FF99CC',
  Akaoni: '#FF4444',
  Kageyama: '#AAAAAA',
  Kurihara: '#CC88FF',
  Narrator: '#CCCCCC',
};

const EMOTION_PORTRAITS: Record<string, string> = {
  Retsu_normal: '😤',
  Retsu_angry: '😡',
  Retsu_happy: '😄',
  Retsu_sad: '😢',
  Retsu_cool: '😎',
  Retsu_surprised: '😲',
  Muto_normal: '💪',
  Muto_angry: '😠',
  Muto_happy: '😁',
  Muto_sad: '😭',
  Kuroki_normal: '😐',
  Kuroki_cool: '🧊',
  Kuroki_sad: '😔',
  Ren_normal: '🙂',
  Ren_happy: '😊',
  Yuki_normal: '🙋',
  Yuki_angry: '😤',
  Yuki_happy: '😊',
  Akaoni_normal: '👹',
  Akaoni_angry: '😤',
  Akaoni_sad: '😞',
  Kageyama_normal: '🧔',
  Kageyama_sad: '😔',
  Narrator_normal: '📖',
};

export function DialogueBox() {
  const { currentEvent, setCurrentEvent, setPhase, setFlag, changeKizuna, addNotification, getFlag, phase } = useGameStore();
  const [lineIndex, setLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [choiceSelected, setChoiceSelected] = useState(false);

  const event = currentEvent ? STORY_EVENTS[currentEvent] : null;
  const lines: DialogueLine[] = event?.dialogues ?? [];
  const currentLine = lines[lineIndex];

  useEffect(() => {
    if (!currentLine) return;
    setDisplayedText('');
    setIsTyping(true);
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(currentLine.text.slice(0, i + 1));
      i++;
      if (i >= currentLine.text.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 30);
    if (currentLine.sfx) playSfx(currentLine.sfx);
    return () => clearInterval(interval);
  }, [lineIndex, currentLine]);

  const advance = useCallback(() => {
    if (isTyping) {
      setDisplayedText(currentLine?.text ?? '');
      setIsTyping(false);
      return;
    }
    if (currentLine?.choice && !choiceSelected) return;

    const nextIndex = lineIndex + 1;
    if (nextIndex >= lines.length) {
      if (event?.rewardsFlags) {
        event.rewardsFlags.forEach((f) => setFlag(f, true));
      }
      setCurrentEvent(null);
      setPhase('world');
      setLineIndex(0);
      setChoiceSelected(false);
    } else {
      setLineIndex(nextIndex);
      setChoiceSelected(false);
    }
  }, [isTyping, lineIndex, lines.length, event, currentLine, choiceSelected, setCurrentEvent, setPhase, setFlag]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyZ') {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [advance]);

  useEffect(() => {
    setLineIndex(0);
    setChoiceSelected(false);
  }, [currentEvent]);

  if (phase !== 'dialogue' || !currentLine) return null;

  const portraitKey = `${currentLine.speaker}_${currentLine.emotion || 'normal'}`;
  const portrait = EMOTION_PORTRAITS[portraitKey] || '👤';
  const speakerColor = SPEAKER_COLORS[currentLine.speaker] || '#FFFFFF';

  const handleChoice = (choice: { text: string; action: string; tamashiiChange?: number; flagSet?: string }) => {
    playSfx('menu_confirm');
    if (choice.tamashiiChange) {
      addNotification(`魂 ${choice.tamashiiChange > 0 ? '+' : ''}${choice.tamashiiChange}`, 'tamashii');
    }
    if (choice.flagSet) setFlag(choice.flagSet, true);
    if (choice.action === 'advance_kizuna_muto') changeKizuna('muto', 1);
    setChoiceSelected(true);
    advance();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end pointer-events-none">
      <div className="pointer-events-auto mx-4 mb-4 md:mx-8 md:mb-6">
        <div
          className="relative border-2 border-red-800 bg-black/95 p-4 md:p-6"
          style={{ boxShadow: '0 0 20px rgba(139,0,0,0.5), inset 0 0 30px rgba(0,0,0,0.5)' }}
        >
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-yellow-500" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-yellow-500" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-yellow-500" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-yellow-500" />

          <div className="flex gap-4 items-start">
            <div className="text-5xl flex-shrink-0 w-16 text-center">{portrait}</div>

            <div className="flex-1 min-w-0">
              {currentLine.speaker !== 'Narrator' && (
                <div
                  className="font-black text-sm mb-1 tracking-wider"
                  style={{ color: speakerColor }}
                >
                  {currentLine.speakerJp}
                </div>
              )}
              <p className="text-white text-base md:text-lg leading-relaxed min-h-[3rem]">
                {displayedText}
                {isTyping && <span className="animate-pulse">▌</span>}
              </p>

              {!isTyping && currentLine.choice && !choiceSelected && (
                <div className="mt-4 flex flex-col gap-2">
                  {currentLine.choice.map((c, i) => (
                    <button
                      key={i}
                      className="text-left px-4 py-2 border border-yellow-700 bg-yellow-900/20 text-yellow-300 hover:bg-yellow-900/40 hover:border-yellow-500 transition-all text-sm font-bold"
                      onClick={() => handleChoice(c)}
                    >
                      ▷ {c.text}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {!isTyping && (!currentLine.choice || choiceSelected) && (
            <div
              className="absolute bottom-2 right-4 text-yellow-500 text-xs animate-bounce cursor-pointer"
              onClick={advance}
            >
              ▼ 次へ (Z/Space)
            </div>
          )}
        </div>

        <div className="mt-1 flex justify-between text-xs text-gray-700 px-1">
          <span>{event?.title}</span>
          <span>{lineIndex + 1} / {lines.length}</span>
        </div>
      </div>
    </div>
  );
}
