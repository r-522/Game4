'use client';

import { useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useBattleStore } from '@/stores/battleStore';
import { useGameStore } from '@/stores/gameStore';
import { ENEMIES } from '@/data/enemies';
import { SKILLS } from '@/data/skills';
import { playSfx, playBgm } from '@/lib/audio';
import { BattleHUD } from './BattleHUD';

function CharacterMesh({
  position,
  color,
  isPlayer,
  animState,
  isStunned,
  hp,
  maxHp,
  name,
}: {
  position: [number, number, number];
  color: string;
  isPlayer: boolean;
  animState: string;
  isStunned: boolean;
  hp: number;
  maxHp: number;
  name: string;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const armLRef = useRef<THREE.Mesh>(null);
  const armRRef = useRef<THREE.Mesh>(null);
  const legLRef = useRef<THREE.Mesh>(null);
  const legRRef = useRef<THREE.Mesh>(null);

  const timeRef = useRef(0);
  const hitFlashRef = useRef(0);
  const attackRef = useRef(0);

  useEffect(() => {
    if (animState === 'hit') hitFlashRef.current = 0.3;
    if (animState === 'attack_light' || animState === 'attack_heavy') attackRef.current = 0.5;
  }, [animState]);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (hitFlashRef.current > 0) hitFlashRef.current -= delta;
    if (attackRef.current > 0) attackRef.current -= delta;

    if (!groupRef.current) return;

    const t = timeRef.current;

    groupRef.current.position.set(position[0], position[1], position[2]);
    if (!isPlayer) {
      groupRef.current.rotation.y = Math.PI;
    }

    if (isStunned) {
      groupRef.current.rotation.z = Math.sin(t * 15) * 0.2;
    } else {
      groupRef.current.rotation.z = 0;
    }

    if (animState === 'idle') {
      if (bodyRef.current) bodyRef.current.position.y = Math.sin(t * 2) * 0.02;
      if (headRef.current) headRef.current.position.y = 1.6 + Math.sin(t * 2) * 0.02;
    }

    if (animState === 'attack_light' || attackRef.current > 0) {
      if (armRRef.current) {
        armRRef.current.rotation.x = Math.sin(t * 20) * 1.2;
      }
    } else if (animState === 'idle') {
      if (armLRef.current) armLRef.current.rotation.x = Math.sin(t * 2 + 1) * 0.15;
      if (armRRef.current) armRRef.current.rotation.x = Math.sin(t * 2) * 0.15;
    }

    if (animState === 'dodge') {
      groupRef.current.position.x = position[0] + (isPlayer ? -0.5 : 0.5);
    }

    if (animState === 'walk' || animState === 'run') {
      const speed = animState === 'run' ? 8 : 4;
      if (legLRef.current) legLRef.current.rotation.x = Math.sin(t * speed) * 0.6;
      if (legRRef.current) legRRef.current.rotation.x = Math.sin(t * speed + Math.PI) * 0.6;
      if (armLRef.current) armLRef.current.rotation.x = Math.sin(t * speed + Math.PI) * 0.4;
      if (armRRef.current) armRRef.current.rotation.x = Math.sin(t * speed) * 0.4;
    }

    const isFlashing = hitFlashRef.current > 0;
    const matColor = isFlashing ? '#ff4444' : color;

    [bodyRef, headRef, armLRef, armRRef, legLRef, legRRef].forEach((ref) => {
      if (ref.current) {
        (ref.current.material as THREE.MeshStandardMaterial).color.setStyle(matColor);
        (ref.current.material as THREE.MeshStandardMaterial).emissive.setStyle(
          isFlashing ? '#ff0000' : '#000000'
        );
      }
    });
  });

  const hpRatio = hp / maxHp;

  return (
    <group ref={groupRef} position={position}>
      <mesh ref={bodyRef} position={[0, 0.8, 0]}>
        <boxGeometry args={[0.5, 0.8, 0.3]} />
        <meshStandardMaterial color={color} />
      </mesh>

      <mesh ref={headRef} position={[0, 1.6, 0]}>
        <boxGeometry args={[0.35, 0.35, 0.35]} />
        <meshStandardMaterial color={color} />
      </mesh>

      <mesh ref={armLRef} position={[-0.4, 0.8, 0]}>
        <boxGeometry args={[0.18, 0.6, 0.18]} />
        <meshStandardMaterial color={color} />
      </mesh>

      <mesh ref={armRRef} position={[0.4, 0.8, 0]}>
        <boxGeometry args={[0.18, 0.6, 0.18]} />
        <meshStandardMaterial color={color} />
      </mesh>

      <mesh ref={legLRef} position={[-0.15, 0.2, 0]}>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>

      <mesh ref={legRRef} position={[0.15, 0.2, 0]}>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {isStunned && (
        <Text position={[0, 2.2, 0]} fontSize={0.3} color="#FFD700" anchorX="center">
          ★★★
        </Text>
      )}

      <group position={[-0.5, 2.0, 0]}>
        <mesh position={[0.5, 0, 0]}>
          <boxGeometry args={[1, 0.08, 0.05]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        <mesh position={[hpRatio * 0.5, 0, 0.01]}>
          <boxGeometry args={[hpRatio, 0.08, 0.05]} />
          <meshStandardMaterial
            color={hpRatio > 0.6 ? '#22c55e' : hpRatio > 0.3 ? '#eab308' : '#ef4444'}
          />
        </mesh>
      </group>

      <Text position={[0, 2.3, 0]} fontSize={0.15} color="#ffffff" anchorX="center">
        {name}
      </Text>
    </group>
  );
}

function HitEffect({ position, type }: { position: [number, number, number]; type: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (meshRef.current) {
      meshRef.current.scale.setScalar(1 + timeRef.current * 3);
      meshRef.current.rotation.z += delta * 5;
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = Math.max(0, 1 - timeRef.current * 3);
    }
  });

  const colors: Record<string, string> = {
    light: '#FFD700',
    heavy: '#FF4444',
    special: '#FF00FF',
    block: '#4488FF',
    miss: '#888888',
  };

  return (
    <mesh ref={meshRef} position={position}>
      <ringGeometry args={[0.1, 0.3, 8]} />
      <meshStandardMaterial color={colors[type] || '#FFD700'} transparent opacity={1} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Arena({ areaColor }: { areaColor: string }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color={areaColor} />
      </mesh>
      <Grid args={[20, 20]} cellSize={1} cellThickness={0.5} cellColor="#444444" sectionColor="#666666" position={[0, 0, 0]} />

      {[-3, 3].map((x) =>
        [-3, 3].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 1, z]}>
            <boxGeometry args={[0.3, 2, 0.3]} />
            <meshStandardMaterial color="#555555" />
          </mesh>
        ))
      )}

      <mesh position={[0, 0, -5]} rotation={[0, 0, 0]}>
        <boxGeometry args={[10, 3, 0.5]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
    </group>
  );
}

function BattleScene() {
  const { player, enemy, hitEffects, state, update } = useBattleStore();
  const { player: gamePlayer } = useGameStore();

  useFrame((_, delta) => {
    update(delta);
  });

  if (!player || !enemy) return null;

  const areaColors: Record<string, string> = {
    reppuu_school: '#2a3a5a',
    shopping_district: '#3a2a1a',
    waterfront: '#1a2a3a',
    industrial: '#2a2a1a',
    akabane: '#3a0a0a',
    castle_ruins: '#1a1a2a',
  };
  const areaColor = areaColors[gamePlayer?.currentArea || 'reppuu_school'] || '#2a2a2a';

  return (
    <>
      <Arena areaColor={areaColor} />

      <CharacterMesh
        position={player.position}
        color={gamePlayer?.fashion?.color || '#1a1a3a'}
        isPlayer={true}
        animState={player.animState}
        isStunned={player.isStunned}
        hp={player.hp}
        maxHp={player.maxHp}
        name={player.nameJp}
      />

      <CharacterMesh
        position={enemy.position}
        color={ENEMIES[enemy.id]?.modelColor || '#666666'}
        isPlayer={false}
        animState={enemy.animState}
        isStunned={enemy.isStunned}
        hp={enemy.hp}
        maxHp={enemy.maxHp}
        name={enemy.nameJp}
      />

      {hitEffects.map((eff) => (
        <HitEffect key={eff.id} position={eff.position} type={eff.type} />
      ))}

      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={1.0} castShadow />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#ff4444" />
    </>
  );
}

function InputHandler() {
  const { playerAttack, playerBlock, playerDodge, playerTaunt, playerFlee, state } = useBattleStore();
  const { player: gamePlayer, endBattle, addNotification } = useGameStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state !== 'fighting') return;

      const skills = gamePlayer?.learnedSkills || [];
      const keyMap: Record<string, number> = {
        KeyZ: 0, KeyX: 1, KeyC: 2, KeyA: 3, KeyS: 4, KeyD: 5,
        KeyJ: 0, KeyK: 1, KeyL: 2,
      };

      if (e.code in keyMap) {
        const idx = keyMap[e.code];
        const skillId = skills[idx];
        if (skillId) {
          playSfx('punch_light');
          playerAttack(skillId);
        }
      }

      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        playerBlock(true);
      }
      if (e.code === 'Space') {
        e.preventDefault();
        playSfx('dodge');
        playerDodge();
      }
      if (e.code === 'KeyR') {
        playSfx('taunt');
        playerTaunt();
      }
      if (e.code === 'KeyQ') {
        const success = playerFlee();
        if (success) {
          playSfx('dodge');
          addNotification('逃げた...情けない！', 'warning');
          endBattle(false, 0, -10);
        } else {
          playSfx('hit');
          addNotification('逃げ切れなかった！', 'error');
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        playerBlock(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [state, gamePlayer, playerAttack, playerBlock, playerDodge, playerTaunt, playerFlee, endBattle, addNotification]);

  return null;
}

interface BattleArenaProps {
  enemyId: string;
  menchiWon: boolean;
}

export function BattleArena({ enemyId, menchiWon }: BattleArenaProps) {
  const { initBattle, state } = useBattleStore();
  const { player, endBattle } = useGameStore();

  useEffect(() => {
    if (player) {
      initBattle(enemyId, player, menchiWon);
      playBgm('battle_theme');
    }
  }, [enemyId, player, menchiWon, initBattle]);

  useEffect(() => {
    if (state === 'victory') playSfx('victory');
    if (state === 'defeat') playSfx('defeat');
  }, [state]);

  if (!player) return null;

  return (
    <div className="fixed inset-0 z-20 bg-black">
      <Canvas
        camera={{ position: [0, 4, 8], fov: 60 }}
        shadows
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <BattleScene />
        </Suspense>
      </Canvas>

      <InputHandler />
      <BattleHUD />
    </div>
  );
}
