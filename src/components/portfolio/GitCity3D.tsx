import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import * as THREE from "three";
import type { DayMap, PlatformId } from "@/lib/activity/types";
import { PLATFORM_LABELS } from "@/lib/activity/types";

const CELL = 1; // world units per day footprint
const GAP = 0.35;
const STEP = CELL + GAP;
const UNIT = 0.35; // height per contribution

type Props = {
  weeks: Array<Array<string | null>>;
  merged: DayMap;
  calendars: Record<PlatformId, DayMap>;
  colors: Record<PlatformId, string>;
};

type Building = {
  date: string;
  x: number;
  z: number;
  h: number;
  count: number;
  color: string;
  parts: string[];
};

function dominant(date: string, calendars: Record<PlatformId, DayMap>) {
  let best: PlatformId | null = null;
  let bestCount = 0;
  for (const key of Object.keys(calendars) as PlatformId[]) {
    const c = calendars[key][date] ?? 0;
    if (c > bestCount) {
      bestCount = c;
      best = key;
    }
  }
  return best;
}

function Tower({
  b,
  active,
  onHover,
  onLeave,
  index,
}: {
  b: Building;
  active: boolean;
  onHover: (b: Building) => void;
  onLeave: () => void;
  index: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const grown = useRef(0);

  useFrame((_, delta) => {
    const mesh = ref.current;
    if (!mesh) return;
    // staggered grow-in animation
    const target = 1;
    const start = index * 0.0015;
    grown.current = Math.min(target, grown.current + delta * (0.9 + start * 0));
    const s = Math.max(0.001, grown.current);
    mesh.scale.y = s;
    mesh.position.y = (b.h * s) / 2;
  });

  return (
    <mesh
      ref={ref}
      position={[b.x, b.h / 2, b.z]}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(b);
      }}
      onPointerOut={() => onLeave()}
    >
      <boxGeometry args={[CELL, b.h, CELL]} />
      <meshStandardMaterial
        color={b.color}
        emissive={b.color}
        emissiveIntensity={active ? 0.9 : 0.22}
        roughness={0.35}
        metalness={0.15}
      />
    </mesh>
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
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[20, 35, 15]} intensity={1.15} />
      <directionalLight position={[-18, 12, -12]} intensity={0.35} color="#3ddc84" />

      {/* ground plate */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]} receiveShadow>
        <planeGeometry args={[width + 4, depth + 4]} />
        <meshStandardMaterial color="#0d1f16" roughness={1} />
      </mesh>
      <Grid
        position={[0, -0.04, 0]}
        args={[width + 4, depth + 4]}
        cellSize={STEP}
        cellColor="#1f5c3c"
        sectionSize={STEP * 7}
        sectionColor="#3ddc84"
        fadeDistance={90}
        fadeStrength={1.4}
        infiniteGrid={false}
      />

      {buildings.map((b, i) => (
        <Tower
          key={b.date}
          b={b}
          index={i}
          active={hoverDate === b.date}
          onHover={onHover}
          onLeave={() => onHover(null)}
        />
      ))}

      <OrbitControls
        makeDefault
        enablePan
        enableZoom
        minDistance={12}
        maxDistance={140}
        maxPolarAngle={Math.PI / 2.15}
        target={[0, 3, 0]}
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
        const top = dominant(date, calendars);
        const parts: string[] = [];
        for (const key of Object.keys(calendars) as PlatformId[]) {
          const c = calendars[key][date] ?? 0;
          if (c) parts.push(`${PLATFORM_LABELS[key]}: ${c}`);
        }
        out.push({
          date,
          x: wi * STEP - w / 2,
          z: di * STEP - d / 2,
          h: Math.min(count, 24) * UNIT + 0.25,
          count,
          color: top ? colors[top] : "#3ddc84",
          parts,
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
          camera={{ position: [22, 24, 40], fov: 45 }}
          dpr={[1, 1.8]}
          gl={{ antialias: true }}
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
          <div className="pointer-events-none absolute bottom-3 left-3 max-w-[70%] rounded-md border border-emerald-500/30 bg-black/70 px-3 py-2 font-mono text-[11px] text-emerald-200">
            <div className="font-semibold">
              {hover.date} — {hover.count} {hover.count === 1 ? "contribution" : "contributions"}
            </div>
            <div className="text-emerald-300/70">{hover.parts.join(" · ")}</div>
          </div>
        ) : null}
      </div>

      <div className="mt-2 text-xs text-muted-foreground">
        Each tower is one day — height = contributions, colour = most active platform.
      </div>
    </div>
  );
}
