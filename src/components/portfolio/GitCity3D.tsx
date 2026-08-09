import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Grid,
  RoundedBox,
  MeshReflectorMaterial,
  Stars,
  Instances,
  Instance,
  Environment,
} from "@react-three/drei";
import * as THREE from "three";
import type { DayMap, PlatformId } from "@/lib/activity/types";
import { PLATFORM_LABELS } from "@/lib/activity/types";

const CELL = 1; // world units per day footprint
const GAP = 0.35;
const STEP = CELL + GAP;
const UNIT = 0.35; // height per contribution

const WINDOW_W = 0.16;
const WINDOW_H = 0.16;
const WINDOW_D = 0.035;

function lighten(hex: string, amount = 0.28) {
  const c = new THREE.Color(hex);
  c.offsetHSL(0, 0, amount);
  return `#${c.getHexString()}`;
}

type Props = {
  weeks: Array<Array<string | null>>;
  merged: DayMap;
  calendars: Record<PlatformId, DayMap>;
  colors: Record<PlatformId, string>;
};

type Segment = {
  platform: PlatformId;
  count: number;
  h: number;
  y: number; // center y
  color: string;
};

type Building = {
  date: string;
  x: number;
  z: number;
  h: number;
  count: number;
  color: string;
  parts: string[];
  segments: Segment[];
};

type WindowLight = {
  id: string;
  position: [number, number, number];
  color: string;
  scale: number;
};

function Tower({
  b,
  active,
  onHover,
  onLeave,
}: {
  b: Building;
  active: boolean;
  onHover: (b: Building) => void;
  onLeave: () => void;
}) {
  const ref = useRef<THREE.Group>(null);
  const grown = useRef(0);

  useFrame((_, delta) => {
    const g = ref.current;
    if (!g) return;
    grown.current = Math.min(1, grown.current + delta * 0.9);
    const ease = 1 - Math.pow(1 - grown.current, 3);
    g.scale.y = Math.max(0.001, ease);

    // subtle hover pop
    const targetXZ = active ? 1.06 : 1.0;
    g.scale.x = THREE.MathUtils.lerp(g.scale.x, targetXZ, delta * 6);
    g.scale.z = THREE.MathUtils.lerp(g.scale.z, targetXZ, delta * 6);
  });

  return (
    <group
      ref={ref}
      position={[b.x, 0, b.z]}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(b);
      }}
      onPointerOut={() => onLeave()}
    >
      {b.segments.map((s, i) => (
        <group key={s.platform} position={[0, s.y, 0]}>
          <RoundedBox
            args={[CELL, s.h, CELL]}
            radius={0.05}
            smoothness={2}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial
              color={s.color}
              emissive={s.color}
              emissiveIntensity={active ? 0.55 : 0.18}
              roughness={0.25}
              metalness={0.2}
            />
          </RoundedBox>
          {/* thin divider between floors */}
          {i < b.segments.length - 1 ? (
            <mesh position={[0, s.h / 2 + 0.02, 0]} castShadow>
              <boxGeometry args={[CELL * 1.08, 0.04, CELL * 1.08]} />
              <meshStandardMaterial color="#04120b" roughness={1} />
            </mesh>
          ) : null}
        </group>
      ))}

      {/* rooftop marker in dominant platform colour */}
      <mesh position={[0, b.h + 0.08, 0]} castShadow>
        <boxGeometry args={[CELL * 0.35, 0.16, CELL * 0.35]} />
        <meshStandardMaterial
          color={b.color}
          emissive={b.color}
          emissiveIntensity={active ? 1.6 : 0.8}
          roughness={0.2}
          metalness={0.3}
        />
      </mesh>

      {/* antenna */}
      <mesh position={[0.18, b.h + 0.45, 0.18]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.7, 8]} />
        <meshStandardMaterial color="#8aa" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* blinking beacon */}
      <Beacon position={[0.18, b.h + 0.85, 0.18]} color={b.color} active={active} />
    </group>
  );
}

function Beacon({
  position,
  color,
  active,
}: {
  position: [number, number, number];
  color: string;
  active: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const pulse = active
      ? 1.4 + Math.sin(clock.getElapsedTime() * 8) * 0.6
      : 0.55 + Math.sin(clock.getElapsedTime() * 3 + position[0]) * 0.15;
    const mat = ref.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = pulse;
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.07, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.55}
        toneMapped={false}
      />
    </mesh>
  );
}

function WindowLights({
  windows,
  activeIds,
}: {
  windows: WindowLight[];
  activeIds: Set<string>;
}) {
  return (
    <Instances limit={windows.length}>
      <boxGeometry args={[WINDOW_W, WINDOW_H, WINDOW_D]} />
      <meshBasicMaterial toneMapped={false} />
      {windows.map((w) => {
        const isActive = activeIds.has(w.id);
        return (
          <Instance
            key={w.id}
            position={w.position}
            scale={isActive ? [1.35, 1.35, 1.35] : [1, 1, 1]}
            color={isActive ? lighten(w.color, 0.45) : w.color}
          />
        );
      })}
    </Instances>
  );
}

function ActiveGlow({
  building,
}: {
  building: Building | null;
}) {
  const lightRef = useRef<THREE.PointLight>(null);
  const beamRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!lightRef.current || !building) return;
    const pulse = 1.2 + Math.sin(clock.getElapsedTime() * 6) * 0.5;
    lightRef.current.intensity = pulse * 3.5;
    lightRef.current.color.set(building.color);
  });

  if (!building) return null;
  return (
    <group position={[building.x, 0, building.z]}>
      <pointLight
        ref={lightRef}
        position={[0, building.h + 1.4, 0]}
        distance={10}
        decay={2}
        color={building.color}
        intensity={4}
      />
      <mesh ref={beamRef} position={[0, building.h / 2 + 0.5, 0]}>
        <cylinderGeometry args={[0.12, 0.35, building.h + 1.2, 16, 1, true]} />
        <meshBasicMaterial
          color={building.color}
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function Scene({
  buildings,
  width,
  depth,
  onHover,
  hoverDate,
}: {
  buildings: Building[];
  width: number;
  depth: number;
  onHover: (b: Building | null) => void;
  hoverDate: string | null;
}) {
  const windows = useMemo<WindowLight[]>(() => {
    const out: WindowLight[] = [];
    let id = 0;
    for (const b of buildings) {
      for (const s of b.segments) {
        const rows = Math.min(Math.max(Math.round(s.h / 0.34), 1), 5);
        const cols = 2;
        const startY = s.y - s.h / 2 + 0.12;
        const stepY = (s.h - 0.24) / Math.max(rows - 1, 1);
        const startX = -CELL * 0.22;
        const stepX = CELL * 0.44;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            // skip some windows randomly for a lived-in look
            if (Math.random() > 0.82) continue;
            out.push({
              id: `${b.date}-${s.platform}-${id++}`,
              position: [
                b.x + startX + c * stepX,
                startY + r * stepY,
                b.z + CELL / 2 + 0.035,
              ],
              color: lighten(s.color, 0.22),
              scale: 1,
            });
          }
        }
      }
    }
    return out;
  }, [buildings]);

  const activeIds = useMemo(() => {
    const set = new Set<string>();
    if (!hoverDate) return set;
    const b = buildings.find((x) => x.date === hoverDate);
    if (!b) return set;
    for (const s of b.segments) {
      for (const w of windows) {
        if (w.id.startsWith(`${b.date}-${s.platform}-`)) set.add(w.id);
      }
    }
    return set;
  }, [buildings, hoverDate, windows]);

  const hoverBuilding = useMemo(
    () => buildings.find((b) => b.date === hoverDate) ?? null,
    [buildings, hoverDate],
  );

  return (
    <>
      <color attach="background" args={["#08150f"]} />
      <fog attach="fog" args={["#08150f", 28, 95]} />
      <Environment preset="city" />
      <Stars radius={120} depth={60} count={2500} factor={4} saturation={0} fade speed={0.6} />

      <ambientLight intensity={0.35} />
      <directionalLight
        position={[22, 40, 18]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={120}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
      />
      <directionalLight position={[-18, 12, -12]} intensity={0.35} color="#3ddc84" />
      <pointLight position={[0, 18, 0]} intensity={0.6} color="#a8ffbe" distance={60} decay={2} />

      {/* reflective ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]} receiveShadow>
        <planeGeometry args={[width + 10, depth + 10]} />
        <MeshReflectorMaterial
          blur={[300, 120]}
          resolution={1024}
          mixBlur={0.8}
          mixStrength={0.45}
          roughness={0.65}
          depthScale={1}
          color="#0d1f16"
          metalness={0.2}
          mirror={0.55}
        />
      </mesh>

      <Grid
        position={[0, -0.06, 0]}
        args={[width + 10, depth + 10]}
        cellSize={STEP}
        cellColor="#1f5c3c"
        sectionSize={STEP * 7}
        sectionColor="#3ddc84"
        fadeDistance={90}
        fadeStrength={1.4}
        infiniteGrid={false}
      />

      {buildings.map((b) => (
        <Tower
          key={b.date}
          b={b}
          active={hoverDate === b.date}
          onHover={onHover}
          onLeave={() => onHover(null)}
        />
      ))}

      <WindowLights windows={windows} activeIds={activeIds} />
      <ActiveGlow building={hoverBuilding} />

      <OrbitControls
        makeDefault
        enablePan
        enableZoom
        minDistance={12}
        maxDistance={140}
        maxPolarAngle={Math.PI / 2.15}
        target={[0, 1, 0]}
      />
    </>
  );
}

export default function GitCity3D({ weeks, merged, calendars, colors }: Props) {
  const [hover, setHover] = useState<Building | null>(null);

  const { buildings, width, depth } = useMemo(() => {
    const out: Building[] = [];
    const w = weeks.length * STEP;
    const d = 7 * STEP;
    weeks.forEach((week, wi) => {
      week.forEach((date, di) => {
        if (!date) return;
        const count = merged[date] ?? 0;
        if (count === 0) return;

        const per: Array<{ platform: PlatformId; count: number }> = [];
        for (const key of Object.keys(calendars) as PlatformId[]) {
          const c = calendars[key][date] ?? 0;
          if (c) per.push({ platform: key, count: c });
        }
        per.sort((a, b) => b.count - a.count);

        const parts = per.map((p) => `${PLATFORM_LABELS[p.platform]}: ${p.count}`);
        const total = per.reduce((s, p) => s + p.count, 0) || 1;
        const h = Math.min(count, 24) * UNIT + 0.25;

        const segments: Segment[] = [];
        let y = 0;
        for (const p of per) {
          const sh = (p.count / total) * h;
          segments.push({
            platform: p.platform,
            count: p.count,
            h: sh,
            y: y + sh / 2,
            color: colors[p.platform] ?? "#3ddc84",
          });
          y += sh;
        }

        out.push({
          date,
          x: wi * STEP - w / 2,
          z: di * STEP - d / 2,
          h,
          count,
          color: per[0] ? (colors[per[0].platform] ?? "#3ddc84") : "#3ddc84",
          parts,
          segments,
        });
      });
    });

    return { buildings: out, width: w, depth: d };
  }, [weeks, merged, calendars, colors]);

  return (
    <div>
      <div
        className="relative h-[420px] w-full overflow-hidden rounded-xl border border-emerald-500/25"
        style={{ background: "linear-gradient(180deg,#08150f 0%,#0d1f16 100%)" }}
      >
        <Canvas
          camera={{ position: [18, 22, 34], fov: 42 }}
          dpr={[1, 1.6]}
          gl={{ antialias: true, alpha: false }}
          shadows
          onPointerMissed={() => setHover(null)}
        >
          <Scene
            buildings={buildings}
            width={width}
            depth={depth}
            onHover={setHover}
            hoverDate={hover?.date ?? null}
          />
        </Canvas>

        <div className="pointer-events-none absolute left-3 top-3 rounded-md border border-emerald-500/25 bg-black/40 px-2 py-1 font-mono text-[10px] text-emerald-300/80">
          drag = rotate · scroll = zoom · right-drag = pan
        </div>

        {hover ? (
          <div className="pointer-events-none absolute bottom-3 left-3 max-w-[75%] rounded-md border border-emerald-500/30 bg-black/75 px-3 py-2 font-mono text-[11px] text-emerald-200">
            <div className="font-semibold">
              {hover.date} — {hover.count} {hover.count === 1 ? "contribution" : "contributions"}
            </div>
            <div className="mt-1 space-y-0.5">
              {hover.segments.map((s) => (
                <div key={s.platform} className="flex items-center gap-2">
                  <span
                    className="inline-block h-2 w-2 rounded-[2px]"
                    style={{ background: s.color }}
                  />
                  <span className="text-emerald-100/90">{PLATFORM_LABELS[s.platform]}</span>
                  <span className="text-emerald-300/70">
                    {s.count} · {Math.round((s.count / hover.count) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-2 text-xs text-muted-foreground">
        Each tower is one day — height = total contributions, and every floor band is a platform
        sized by its share of that day.
      </div>
    </div>
  );
}
