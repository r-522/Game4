'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { TitleScreen } from './ui/TitleScreen';
import { DialogueBox } from './ui/DialogueBox';
import { MenchiSystem } from './ui/MenchiSystem';
import { BattleArena } from './battle/BattleArena';
import { WorldScene } from './world/WorldScene';
import { HUD } from './ui/HUD';
import { NotificationStack } from './ui/NotificationStack';
import { StatusScreen } from './ui/StatusScreen';
import { WorldMap } from './ui/WorldMap';
import { GameOverScreen } from './ui/GameOverScreen';
import { EndingScreen } from './ui/EndingScreen';
import { playBgm, setMuted } from '@/lib/audio';
import { STORY_EVENTS } from '@/data/story';

export function GameController() {
  const {
    phase,
    player,
    showMenchi,
    pendingBattle,
    currentEnemy,
    lastMenchiResult,
    isMuted,
    setShowMenchi,
    setLastMenchiResult,
    setPhase,
    startBattle,
    bgm,
    addNotification,
    setFlag,
    setCurrentEvent,
    advanceChapter,
  } = useGameStore();

  const [menchiWon, setMenchiWon] = useState(false);

  useEffect(() => {
    setMuted(isMuted);
  }, [isMuted]);

  useEffect(() => {
    if (bgm) playBgm(bgm);
  }, [bgm]);

  useEffect(() => {
    if (!player) return;

    const checkEvents = () => {
      const pendingEvent = Object.values(STORY_EVENTS).find((ev) => {
        if (player.flags[`${ev.id}_done`]) return false;
        if (ev.requiresFlags?.some((f) => !player.flags[f])) return false;

        if (ev.trigger.type === 'chapter_start' && String(player.chapter) === ev.trigger.value) {
          return true;
        }
        return false;
      });

      if (pendingEvent) {
        setCurrentEvent(pendingEvent.id);
      }
    };

    checkEvents();
  }, [player?.chapter, setCurrentEvent]);

  const handleMenchiComplete = (won: boolean) => {
    setMenchiWon(won);
    setLastMenchiResult(won);
    setShowMenchi(false);
    if (pendingBattle) {
      startBattle(pendingBattle, true);
    }
  };

  useEffect(() => {
    if (phase === 'world' && player?.flags['ch5_complete'] && !player?.flags['ending_shown']) {
      setTimeout(() => {
        setFlag('ending_shown', true);
        setPhase('ending');
      }, 1000);
    }
  }, [phase, player?.flags, setFlag, setPhase]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black select-none">
      {phase === 'title' && <TitleScreen />}

      {(phase === 'world' || phase === 'dialogue') && player && (
        <>
          <WorldScene />
          <HUD />
        </>
      )}

      {phase === 'battle' && currentEnemy && (
        <BattleArena enemyId={currentEnemy} menchiWon={menchiWon} />
      )}

      {phase === 'status' && <StatusScreen />}

      {phase === 'menu' && <WorldMap />}

      {phase === 'gameover' && <GameOverScreen />}

      {phase === 'ending' && <EndingScreen />}

      {showMenchi && pendingBattle && (
        <MenchiSystem enemyId={pendingBattle} onComplete={handleMenchiComplete} />
      )}

      {(phase === 'dialogue' || (phase === 'world' && useGameStore.getState().currentEvent)) && (
        <DialogueBox />
      )}

      <NotificationStack />

      <MuteButton />
    </div>
  );
}

function MuteButton() {
  const { isMuted, toggleMute } = useGameStore();
  return (
    <button
      className="fixed top-4 right-4 z-50 bg-black/50 border border-gray-700 px-3 py-1.5 text-gray-400 text-xs hover:text-white transition-all"
      onClick={toggleMute}
    >
      {isMuted ? '🔇 音OFF' : '🔊 音ON'}
    </button>
  );
}
