'use client';

import { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, Grid, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '@/stores/gameStore';
import { AREAS } from '@/data/areas';
import { ENEMIES } from '@/data/enemies';
import { STORY_EVENTS } from '@/data/story';
import { Button } from '@/components/common/Button';
import { playSfx } from '@/lib/audio';

interface NPCMesh {
  id: string;
  position: [number, number, number];
  color: string;
  name: string;
  isEnemy: boolean;
  enemyId?: string;
}

function PlayerCharacter({
  position,
  color,
  onPositionChange,
}: {
  position: [number, number, number];
  color: string;
  onPositionChange: (pos: [number, number, number]) => void;
}) {
  const ref = useRef<THREE.Group>(null);
  const vel = useRef([0, 0]);
  const pos = useRef([...position] as [number, number, number]);
  const timeRef = useRef(0);
  const keys = useRef<Set<string>>(new Set());

  useEffect(() => {
    const down = (e: KeyboardEvent) => keys.current.add(e.code);
    const up = (e: KeyboardEvent) => keys.current.delete(e.code);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  useFrame((_, delta) => {
    timeRef.current += delta;
    const speed = 4;
    let dx = 0, dz = 0;

    if (keys.current.has('KeyW') || keys.current.has('ArrowUp')) dz -= speed * delta;
    if (keys.current.has('KeyS') || keys.current.has('ArrowDown')) dz += speed * delta;
    if (keys.current.has('KeyA') || keys.current.has('ArrowLeft')) dx -= speed * delta;
    if (keys.current.has('KeyD') || keys.current.has('ArrowRight')) dx += speed * delta;

    const maxBound = 9;
    pos.current[0] = Math.max(-maxBound, Math.min(maxBound, pos.current[0] + dx));
    pos.current[2] = Math.max(-maxBound, Math.min(maxBound, pos.current[2] + dz));

    if (ref.current) {
      ref.current.position.set(pos.current[0], 0, pos.current[2]);
      if (dx !== 0 || dz !== 0) {
        ref.current.rotation.y = Math.atan2(dx, dz) + Math.PI;
      }
    }

    if (dx !== 0 || dz !== 0) {
      onPositionChange([pos.current[0], 0, pos.current[2]]);
    }
  });

  const t = timeRef.current;

  return (
    <group ref={ref} position={position}>
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[0.5, 0.8, 0.3]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[0.35, 0.35, 0.35]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-0.4, 0.8, 0]}>
        <boxGeometry args={[0.18, 0.6, 0.18]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.4, 0.8, 0]}>
        <boxGeometry args={[0.18, 0.6, 0.18]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-0.15, 0.15, 0]}>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.15, 0.15, 0]}>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>

      <mesh position={[0, -0.01, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.02, 16]} />
        <meshStandardMaterial color="#FFD700" opacity={0.4} transparent />
      </mesh>

      <Text position={[0, 2.2, 0]} fontSize={0.2} color="#FFD700" anchorX="center">
        ▼ 神崎 烈
      </Text>
    </group>
  );
}

function NPCMeshComp({ npc, onInteract }: { npc: NPCMesh; onInteract: (npc: NPCMesh) => void }) {
  const ref = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (ref.current) {
      ref.current.position.y = Math.sin(timeRef.current * 1.5 + npc.position[0]) * 0.05;
    }
  });

  return (
    <group
      ref={ref}
      position={npc.position}
      onClick={() => { playSfx('menu_select'); onInteract(npc); }}
    >
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[0.5, 0.8, 0.3]} />
        <meshStandardMaterial color={npc.color} />
      </mesh>
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[0.35, 0.35, 0.35]} />
        <meshStandardMaterial color={npc.color} />
      </mesh>
      <mesh position={[-0.4, 0.8, 0]}>
        <boxGeometry args={[0.18, 0.6, 0.18]} />
        <meshStandardMaterial color={npc.color} />
      </mesh>
      <mesh position={[0.4, 0.8, 0]}>
        <boxGeometry args={[0.18, 0.6, 0.18]} />
        <meshStandardMaterial color={npc.color} />
      </mesh>

      {npc.isEnemy && (
        <mesh position={[0, 2.5, 0]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial color="#ff4444" emissive="#ff0000" emissiveIntensity={0.5} />
        </mesh>
      )}

      <Text position={[0, 2.0, 0]} fontSize={0.15} color={npc.isEnemy ? '#ff6666' : '#88ff88'} anchorX="center">
        {npc.name}
      </Text>
    </group>
  );
}

function AreaEnvironment({ areaId }: { areaId: string }) {
  const colors: Record<string, { floor: string; sky: string; ambient: string }> = {
    reppuu_school: { floor: '#1a2a4a', sky: '#0a1a3a', ambient: '#334466' },
    shopping_district: { floor: '#2a1a0a', sky: '#3a1a0a', ambient: '#664422' },
    waterfront: { floor: '#0a1a2a', sky: '#051020', ambient: '#223344' },
    industrial: { floor: '#1a1a0a', sky: '#0a0a05', ambient: '#333322' },
    hilltop_park: { floor: '#1a2a1a', sky: '#102010', ambient: '#223322' },
    akabane: { floor: '#2a0a0a', sky: '#1a0505', ambient: '#442222' },
    castle_ruins: { floor: '#0a0a1a', sky: '#050510', ambient: '#222233' },
  };
  const c = colors[areaId] || colors.reppuu_school;

  return (
    <>
      <color attach="background" args={[c.sky]} />
      <fog attach="fog" args={[c.sky, 10, 30]} />
      <ambientLight intensity={0.5} color={c.ambient} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color={c.floor} />
      </mesh>

      <Grid
        args={[40, 40]}
        cellSize={2}
        cellThickness={0.3}
        cellColor="#333333"
        sectionColor="#444444"
        position={[0, -0.09, 0]}
      />

      {areaId === 'reppuu_school' && (
        <>
          <mesh position={[0, 3, -8]}>
            <boxGeometry args={[12, 6, 1]} />
            <meshStandardMaterial color="#2a3a5a" />
          </mesh>
          <mesh position={[0, 3, -8.5]}>
            <boxGeometry args={[10, 4, 0.3]} />
            <meshStandardMaterial color="#334466" />
          </mesh>
          <Text position={[0, 5.5, -7.8]} fontSize={0.4} color="#88aaff" anchorX="center">
            烈風高校
          </Text>
        </>
      )}

      {areaId === 'shopping_district' && Array.from({ length: 6 }).map((_, i) => (
        <group key={i} position={[(i - 2.5) * 3.5, 0, -6]}>
          <mesh position={[0, 2, 0]}>
            <boxGeometry args={[3, 4, 2]} />
            <meshStandardMaterial color={`hsl(${i * 40}, 30%, 25%)`} />
          </mesh>
        </group>
      ))}

      {areaId === 'waterfront' && (
        <>
          <mesh position={[5, 5, -5]}>
            <cylinderGeometry args={[0.3, 0.4, 10, 8]} />
            <meshStandardMaterial color="#445566" />
          </mesh>
          <mesh position={[-5, 3, -4]}>
            <boxGeometry args={[4, 6, 2]} />
            <meshStandardMaterial color="#334455" />
          </mesh>
        </>
      )}
    </>
  );
}

function CameraController({ targetPosition }: { targetPosition: [number, number, number] }) {
  const { camera } = useThree();
  const lerpPos = useRef(new THREE.Vector3(0, 6, 8));

  useFrame(() => {
    const target = new THREE.Vector3(targetPosition[0], targetPosition[1] + 4, targetPosition[2] + 7);
    lerpPos.current.lerp(target, 0.05);
    camera.position.copy(lerpPos.current);
    camera.lookAt(targetPosition[0], 1, targetPosition[2]);
  });

  return null;
}

function ProximityTrigger({
  playerPos,
  npcs,
  onNearNPC,
}: {
  playerPos: [number, number, number];
  npcs: NPCMesh[];
  onNearNPC: (npc: NPCMesh | null) => void;
}) {
  const prevNear = useRef<string | null>(null);

  useFrame(() => {
    let nearest: NPCMesh | null = null;
    let minDist = 2.5;

    for (const npc of npcs) {
      const dx = npc.position[0] - playerPos[0];
      const dz = npc.position[2] - playerPos[2];
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < minDist) {
        minDist = dist;
        nearest = npc;
      }
    }

    const nearId = nearest?.id || null;
    if (nearId !== prevNear.current) {
      prevNear.current = nearId;
      onNearNPC(nearest);
    }
  });

  return null;
}

export function WorldScene() {
  const { player, setPhase, startBattle, setCurrentEvent, addNotification } = useGameStore();
  const [playerPos, setPlayerPos] = useState<[number, number, number]>([0, 0, 0]);
  const [nearNPC, setNearNPC] = useState<NPCMesh | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  if (!player) return null;

  const area = AREAS[player.currentArea];
  if (!area) return null;

  const spawnPositions: [number, number, number][] = [
    [4, 0, 3], [-3, 0, 4], [5, 0, -2], [-5, 0, -3], [2, 0, -5], [-2, 0, 5], [6, 0, 1], [-6, 0, 2],
  ];

  const npcs: NPCMesh[] = [
    ...area.enemies.slice(0, 4).map((eid, i): NPCMesh => ({
      id: `enemy_${eid}_${i}`,
      position: spawnPositions[i] || [i * 2, 0, 3],
      color: ENEMIES[eid]?.modelColor || '#666666',
      name: ENEMIES[eid]?.nameJp || eid,
      isEnemy: true,
      enemyId: eid,
    })),
    ...area.npcs.slice(0, 2).map((nid, i): NPCMesh => ({
      id: `npc_${nid}_${i}`,
      position: spawnPositions[i + 4] || [-i * 2, 0, -3],
      color: '#66AA66',
      name: nid,
      isEnemy: false,
    })),
  ];

  const handleNPCInteract = (npc: NPCMesh) => {
    if (npc.isEnemy && npc.enemyId) {
      startBattle(npc.enemyId);
    } else {
      const event = Object.values(STORY_EVENTS).find(
        (e) => e.trigger.type === 'npc_talk' && e.trigger.value === npc.id.replace(/npc_|_\d+$/, '')
          && !player.flags[`${e.id}_done`]
      );
      if (event) {
        setCurrentEvent(event.id);
      } else {
        addNotification(`${npc.name}: 「よう。」`, 'info');
      }
    }
  };

  const handleInteractKey = (e: KeyboardEvent) => {
    if (e.code === 'KeyE' || e.code === 'KeyF') {
      if (nearNPC) {
        handleNPCInteract(nearNPC);
      }
    }
    if (e.code === 'Escape' || e.code === 'KeyM') {
      setShowMenu((v) => !v);
    }
  };

  return (
    <div className="fixed inset-0 z-10 bg-black">
      <Canvas
        camera={{ position: [0, 6, 8], fov: 55 }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <AreaEnvironment areaId={player.currentArea} />

          <PlayerCharacter
            position={[0, 0, 0]}
            color={player.fashion?.color || '#1a2a8a'}
            onPositionChange={setPlayerPos}
          />

          {npcs.map((npc) => (
            <NPCMeshComp key={npc.id} npc={npc} onInteract={handleNPCInteract} />
          ))}

          <ProximityTrigger playerPos={playerPos} npcs={npcs} onNearNPC={setNearNPC} />
          <CameraController targetPosition={playerPos} />
        </Suspense>
      </Canvas>

      <WorldHUD
        areaName={area.nameJp}
        nearNPC={nearNPC}
        onMenu={() => setShowMenu(true)}
        onMap={() => setPhase('menu')}
      />

      {showMenu && <QuickMenu onClose={() => setShowMenu(false)} />}
    </div>
  );
}

function WorldHUD({
  areaName,
  nearNPC,
  onMenu,
  onMap,
}: {
  areaName: string;
  nearNPC: NPCMesh | null;
  onMenu: () => void;
  onMap: () => void;
}) {
  return (
    <>
      <div className="fixed top-20 left-4 z-20 pointer-events-none">
        <div className="text-white font-black text-sm opacity-70">{areaName}</div>
      </div>

      {nearNPC && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="bg-black/80 border border-yellow-500 px-4 py-2 text-yellow-300 text-sm font-bold animate-pulse">
            {nearNPC.isEnemy ? `⚔️ ${nearNPC.name}に喧嘩を売る [E]` : `💬 ${nearNPC.name}に話しかける [E]`}
          </div>
        </div>
      )}

      <div className="fixed bottom-4 right-4 z-20 flex flex-col gap-2">
        <Button variant="secondary" size="sm" onClick={onMap}>🗺️ マップ</Button>
        <Button variant="secondary" size="sm" onClick={onMenu}>📋 メニュー</Button>
      </div>

      <div className="fixed bottom-4 left-4 z-20 text-xs text-gray-600 space-y-0.5 pointer-events-none">
        <div>WASD: 移動</div>
        <div>E: 話す/喧嘩</div>
        <div>M/Esc: メニュー</div>
      </div>
    </>
  );
}

function QuickMenu({ onClose }: { onClose: () => void }) {
  const { setPhase } = useGameStore();

  const options = [
    { label: '📊 ステータス', action: () => { setPhase('status'); onClose(); } },
    { label: '🗺️ ワールドマップ', action: () => { setPhase('menu'); onClose(); } },
    { label: '✕ 閉じる', action: onClose },
  ];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div
        className="bg-gray-900 border border-red-800 p-6 w-64 space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-yellow-400 font-black text-lg mb-4">メニュー</div>
        {options.map((o) => (
          <button
            key={o.label}
            className="w-full p-3 text-left border border-gray-700 text-white hover:border-yellow-500 hover:bg-gray-800 transition-all font-bold"
            onClick={() => { playSfx('menu_confirm'); o.action(); }}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
