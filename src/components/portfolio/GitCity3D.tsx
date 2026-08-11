import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MutableRefObject } from "react";
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
  dragRef,
}: {
  b: Building;
  active: boolean;
  onHover: (b: Building) => void;
  onLeave: () => void;
  dragRef: MutableRefObject<boolean>;
}) {
  const ref = useRef<THREE.Group>(null);
  const grown = useRef(0);

  useFrame((_, rawDelta) => {
    const g = ref.current;
    if (!g) return;
    // clamp delta: a tab switch / GC pause can deliver a huge delta which used
    // to make the lerp alpha exceed 1 and blow the tower scale up
    const delta = Math.min(rawDelta, 1 / 30);
    grown.current = Math.min(1, grown.current + delta * 0.9);
    const ease = 1 - Math.pow(1 - grown.current, 3);
    g.scale.y = Math.max(0.001, ease);

    // subtle hover pop (exponential smoothing, always stable)
    const targetXZ = active ? 1.06 : 1.0;
    const a = 1 - Math.exp(-6 * delta);
    g.scale.x = THREE.MathUtils.clamp(THREE.MathUtils.lerp(g.scale.x, targetXZ, a), 0.9, 1.1);
    g.scale.z = THREE.MathUtils.clamp(THREE.MathUtils.lerp(g.scale.z, targetXZ, a), 0.9, 1.1);
  });


  return (
    <group
      ref={ref}
      position={[b.x, 0, b.z]}
      onPointerOver={(e) => {
        e.stopPropagation();
        // ignore hover while the camera is being dragged
        if (dragRef.current) return;
        onHover(b);
      }}
      onPointerMove={(e) => {
        e.stopPropagation();
        if (dragRef.current) return;
        if (!active) onHover(b);
      }}
      onPointerOut={() => onLeave()}
    >

      {/* foundation plinth */}
      <mesh position={[0, 0.04, 0]} receiveShadow castShadow>
        <boxGeometry args={[CELL * 1.12, 0.08, CELL * 1.12]} />
        <meshStandardMaterial color="#05140d" roughness={0.9} metalness={0.1} />
      </mesh>

      {b.segments.map((s, i) => (
        <group key={s.platform} position={[0, s.y, 0]}>
          {/* glass facade shell */}
          <RoundedBox
            args={[CELL, s.h, CELL]}
            radius={0.05}
            smoothness={2}
            castShadow
            receiveShadow
          >
            <meshPhysicalMaterial
              color={s.color}
              emissive={s.color}
              emissiveIntensity={active ? 0.62 : 0.16}
              roughness={0.12}
              metalness={0.35}
              transmission={0.35}
              thickness={0.6}
              transparent
              opacity={active ? 0.68 : 0.55}
              depthWrite={false}
            />
          </RoundedBox>
          {/* inner structural core so the tower still reads as solid */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[CELL * 0.52, Math.max(s.h * 0.9, 0.02), CELL * 0.52]} />
            <meshStandardMaterial
              color="#06170f"
              emissive={s.color}
              emissiveIntensity={active ? 0.32 : 0.1}
              roughness={0.65}
              metalness={0.3}
            />
          </mesh>
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
      <RoundedBox
        args={[CELL * 0.35, 0.16, CELL * 0.35]}
        radius={0.03}
        smoothness={2}
        position={[0, b.h + 0.08, 0]}
        castShadow
      >
        <meshStandardMaterial
          color={b.color}
          emissive={b.color}
          emissiveIntensity={active ? 1.8 : 0.95}
          roughness={0.2}
          metalness={0.3}
        />
      </RoundedBox>

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
            scale={isActive ? [1.55, 1.55, 1.55] : [1, 1, 1]}
            color={isActive ? lighten(w.color, 0.55) : w.color}
          />
        );
      })}
    </Instances>
  );
}

type FacadeBand = {
  key: string;
  date: string;
  position: [number, number, number];
  color: string;
};

/** Thin horizontal floor bands + vertical mullions, all instanced (2 draw calls). */
function FacadeGrid({
  bands,
  mullions,
  hoverDate,
}: {
  bands: FacadeBand[];
  mullions: FacadeBand[];
  hoverDate: string | null;
}) {
  return (
    <>
      <Instances limit={Math.max(bands.length, 1)} frustumCulled={false}>
        <boxGeometry args={[CELL * 1.015, 0.014, CELL * 1.015]} />
        <meshBasicMaterial toneMapped={false} transparent opacity={0.5} />
        {bands.map((f) => (
          <Instance
            key={f.key}
            position={f.position}
            color={hoverDate === f.date ? lighten(f.color, 0.45) : f.color}
          />
        ))}
      </Instances>
      <Instances limit={Math.max(mullions.length, 1)} frustumCulled={false}>
        <boxGeometry args={[0.035, 1, 0.035]} />
        <meshBasicMaterial toneMapped={false} transparent opacity={0.42} />
        {mullions.map((m) => (
          <Instance
            key={m.key}
            position={m.position}
            scale={[1, m.position[1] * 2, 1]}
            color={hoverDate === m.date ? lighten(m.color, 0.4) : m.color}
          />
        ))}
      </Instances>
    </>
  );
}

type Prop3D = { x: number; z: number };
type CarProp = { x: number; z: number; axis: "x" | "z"; dir: 1 | -1; speed: number; color: string };

/** Tiny street lights: shared pole geometry + emissive head, instanced. */
function StreetLights({ spots }: { spots: Prop3D[] }) {
  return (
    <>
      <Instances limit={Math.max(spots.length, 1)}>
        <cylinderGeometry args={[0.018, 0.024, 0.9, 6]} />
        <meshStandardMaterial color="#123a29" metalness={0.6} roughness={0.4} />
        {spots.map((s, i) => (
          <Instance key={`p${i}`} position={[s.x, 0.45, s.z]} />
        ))}
      </Instances>
      <Instances limit={Math.max(spots.length, 1)}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#bdffd6" toneMapped={false} />
        {spots.map((s, i) => (
          <Instance key={`h${i}`} position={[s.x, 0.94, s.z]} />
        ))}
      </Instances>
    </>
  );
}

/** A handful of tiny vehicles gliding along empty lanes (one instanced mesh). */
function Cars({ cars, span }: { cars: CarProp[]; span: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const offsets = useRef<number[]>(cars.map(() => Math.random() * span));

  useFrame((_, rawDelta) => {
    const mesh = ref.current;
    if (!mesh) return;
    const delta = Math.min(rawDelta, 1 / 30);
    cars.forEach((c, i) => {
      let o = (offsets.current[i] ?? 0) + delta * c.speed;
      while (o > span) o -= span;

      offsets.current[i] = o;
      const t = -span / 2 + o;
      if (c.axis === "x") {
        dummy.position.set(c.dir === 1 ? t : -t, 0.09, c.z);
        dummy.rotation.set(0, 0, 0);
      } else {
        dummy.position.set(c.x, 0.09, c.dir === 1 ? t : -t);
        dummy.rotation.set(0, Math.PI / 2, 0);
      }
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  if (!cars.length) return null;
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, cars.length]} frustumCulled={false}>
      <boxGeometry args={[0.26, 0.09, 0.13]} />
      <meshStandardMaterial
        color="#6df3a6"
        emissive="#6df3a6"
        emissiveIntensity={0.9}
        toneMapped={false}
        roughness={0.3}
        metalness={0.4}
      />
    </instancedMesh>
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

const DEFAULT_CAM: [number, number, number] = [18, 22, 34];
const DEFAULT_TARGET: [number, number, number] = [0, 1, 0];

type OrbitLike = {
  target: THREE.Vector3;
  object: THREE.Camera;
  update: () => void;
};

function Scene({
  buildings,
  width,
  depth,
  onHover,
  hoverDate,
  dragRef,
  zoomEnabled,
  controlsRef,
}: {
  buildings: Building[];
  width: number;
  depth: number;
  onHover: (b: Building | null) => void;
  hoverDate: string | null;
  dragRef: MutableRefObject<boolean>;
  zoomEnabled: boolean;
  controlsRef: MutableRefObject<OrbitLike | null>;
}) {

  const windows = useMemo<WindowLight[]>(() => {
    const out: WindowLight[] = [];
    let id = 0;
    for (const b of buildings) {
      for (const s of b.segments) {
        const rows = Math.min(Math.max(Math.round(s.h / 0.32), 1), 6);
        const cols = 2;
        const startY = s.y - s.h / 2 + 0.12;
        const stepY = rows > 1 ? (s.h - 0.24) / (rows - 1) : 0;
        const startX = -CELL * 0.22;
        const stepX = CELL * 0.44;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            // skip some windows randomly for a lived-in look
            if (Math.random() > 0.78) continue;
            const y = rows === 1 ? s.y : startY + r * stepY;
            // front face windows
            out.push({
              id: `${b.date}-${s.platform}-f-${id++}`,
              position: [
                b.x + startX + c * stepX,
                y,
                b.z + CELL / 2 + 0.045,
              ],
              color: lighten(s.color, 0.35),
              scale: 1,
            });
            // right face windows
            out.push({
              id: `${b.date}-${s.platform}-r-${id++}`,
              position: [
                b.x + CELL / 2 + 0.045,
                y,
                b.z + startX + c * stepX,
              ],
              color: lighten(s.color, 0.28),
              scale: 1,
            });
          }
        }
      }
    }
    return out;
  }, [buildings]);

  // Facade floor bands + corner mullions (2 instanced draw calls total).
  const { bands, mullions } = useMemo(() => {
    const bandOut: FacadeBand[] = [];
    const mullOut: FacadeBand[] = [];
    for (const b of buildings) {
      for (const s of b.segments) {
        const floors = Math.min(Math.max(Math.round(s.h / 0.42), 1), 8);
        const top = s.y + s.h / 2;
        const step = s.h / floors;
        for (let f = 1; f < floors; f++) {
          bandOut.push({
            key: `${b.date}-${s.platform}-b${f}`,
            date: b.date,
            position: [b.x, top - f * step, b.z],
            color: lighten(s.color, 0.18),
          });
        }
      }
      const half = CELL / 2 + 0.012;
      const corners: Array<[number, number]> = [
        [-half, -half],
        [half, -half],
        [-half, half],
        [half, half],
      ];
      corners.forEach(([dx, dz], i) => {
        mullOut.push({
          key: `${b.date}-m${i}`,
          date: b.date,
          position: [b.x + dx, b.h / 2, b.z + dz],
          color: lighten(b.color, 0.1),
        });
      });
    }
    return { bands: bandOut, mullions: mullOut };
  }, [buildings]);

  // Small city props placed only on genuinely empty grid cells.
  const { lights, cars } = useMemo(() => {
    const occupied = new Set(
      buildings.map((b) => `${Math.round(b.x / STEP)}|${Math.round(b.z / STEP)}`),
    );
    const cols = Math.round(width / STEP);
    const rows = 7;
    const free: Prop3D[] = [];
    for (let wi = 0; wi < cols; wi++) {
      for (let di = 0; di < rows; di++) {
        const x = wi * STEP - width / 2;
        const z = di * STEP - depth / 2;
        if (occupied.has(`${Math.round(x / STEP)}|${Math.round(z / STEP)}`)) continue;
        free.push({ x, z });
      }
    }
    // keep it sparse: at most ~14 lights, evenly sampled
    const maxLights = Math.min(14, Math.floor(free.length / 6));
    const stride = maxLights > 0 ? Math.floor(free.length / maxLights) : 0;
    const lightOut: Prop3D[] = [];
    for (let i = 0; stride > 0 && i < free.length && lightOut.length < maxLights; i += stride) {
      const cell = free[i];
      if (cell) lightOut.push({ x: cell.x + STEP * 0.32, z: cell.z + STEP * 0.32 });
    }

    // a few vehicles gliding along the outer lanes only
    const laneZ = depth / 2 + STEP * 0.9;
    const carOut: CarProp[] = [
      { x: 0, z: -laneZ, axis: "x", dir: 1, speed: 2.4, color: "#6df3a6" },
      { x: 0, z: -laneZ + 0.3, axis: "x", dir: -1, speed: 1.9, color: "#6df3a6" },
      { x: 0, z: laneZ, axis: "x", dir: -1, speed: 2.1, color: "#6df3a6" },
      { x: 0, z: laneZ - 0.3, axis: "x", dir: 1, speed: 1.6, color: "#6df3a6" },
      { x: -width / 2 - STEP * 0.9, z: 0, axis: "z", dir: 1, speed: 1.7, color: "#6df3a6" },
      { x: width / 2 + STEP * 0.9, z: 0, axis: "z", dir: -1, speed: 2.0, color: "#6df3a6" },
    ];
    return { lights: lightOut, cars: carOut };
  }, [buildings, width, depth]);


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
      <fog attach="fog" args={["#08150f", 32, 90]} />
      <Environment preset="night" />
      <Stars radius={140} depth={70} count={3000} factor={4} saturation={0} fade speed={0.5} />

      <ambientLight intensity={0.45} />
      <directionalLight
        position={[22, 40, 18]}
        intensity={1.35}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={120}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
      />
      <directionalLight position={[-18, 12, -12]} intensity={0.45} color="#3ddc84" />
      <pointLight position={[0, 20, 0]} intensity={0.9} color="#a8ffbe" distance={70} decay={2} />

      {/* reflective ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]} receiveShadow>
        <planeGeometry args={[width + 10, depth + 10]} />
        <MeshReflectorMaterial
          blur={[400, 160]}
          resolution={1024}
          mixBlur={0.9}
          mixStrength={0.28}
          roughness={0.85}
          depthScale={0.8}
          color="#0a1a12"
          metalness={0.15}
          mirror={0.35}
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
          dragRef={dragRef}
        />
      ))}

      <FacadeGrid bands={bands} mullions={mullions} hoverDate={hoverDate} />
      <WindowLights windows={windows} activeIds={activeIds} />
      <StreetLights spots={lights} />
      <Cars cars={cars} span={width + STEP * 4} />
      <ActiveGlow building={hoverBuilding} />


      <OrbitControls
        makeDefault
        ref={controlsRef as never}
        enablePan
        enableZoom={zoomEnabled}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.55}
        zoomSpeed={0.5}
        panSpeed={0.5}
        screenSpacePanning={false}
        touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
        minDistance={16}
        maxDistance={Math.max(70, width * 0.9)}
        minPolarAngle={0.18}
        maxPolarAngle={Math.PI / 2.15}
        target={DEFAULT_TARGET}
        onChange={() => {
          const c = controlsRef.current;
          if (!c) return;
          const limX = width / 2 + 4;
          const limZ = depth / 2 + 6;
          const t = c.target;
          const nx = THREE.MathUtils.clamp(t.x, -limX, limX);
          const ny = THREE.MathUtils.clamp(t.y, 0, 8);
          const nz = THREE.MathUtils.clamp(t.z, -limZ, limZ);
          if (nx !== t.x || ny !== t.y || nz !== t.z) {
            c.object.position.x += nx - t.x;
            c.object.position.y += ny - t.y;
            c.object.position.z += nz - t.z;
            t.set(nx, ny, nz);
          }
          // never let the camera dip below the ground plane
          if (c.object.position.y < 1.5) c.object.position.y = 1.5;
        }}
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

  const controlsRef = useRef<OrbitLike | null>(null);
  const dragRef = useRef(false);
  const downRef = useRef<{ x: number; y: number } | null>(null);
  const [zoomEnabled, setZoomEnabled] = useState(false);

  const endDrag = useCallback(() => {
    downRef.current = null;
    // clear on the next frame so the pending click/hover events are ignored
    requestAnimationFrame(() => {
      dragRef.current = false;
    });
  }, []);

  const resetCamera = useCallback(() => {
    const c = controlsRef.current;
    if (!c) return;
    c.object.position.set(...DEFAULT_CAM);
    c.target.set(...DEFAULT_TARGET);
    c.update();
  }, []);

  // release the wheel back to the page whenever the pointer leaves the canvas
  useEffect(() => {
    const onBlur = () => setZoomEnabled(false);
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, []);

  return (
    <div>
      <div
        className="relative h-[420px] w-full overflow-hidden [touch-action:pan-y] rounded-xl border border-emerald-500/25"
        style={{ background: "linear-gradient(180deg,#08150f 0%,#0d1f16 100%)" }}
        onPointerDown={(e) => {
          downRef.current = { x: e.clientX, y: e.clientY };
          dragRef.current = false;
          setZoomEnabled(true);
        }}
        onPointerMove={(e) => {
          const d = downRef.current;
          if (!d || dragRef.current) return;
          if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 5) {
            dragRef.current = true;
            setHover(null);
          }
        }}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={() => {
          endDrag();
          setHover(null);
          setZoomEnabled(false);
        }}
        onDoubleClick={resetCamera}
      >
        <Canvas
          camera={{ position: DEFAULT_CAM, fov: 42 }}
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
            dragRef={dragRef}
            zoomEnabled={zoomEnabled}
            controlsRef={controlsRef}
          />
        </Canvas>

        <div className="pointer-events-none absolute left-3 top-3 rounded-md border border-emerald-500/25 bg-black/40 px-2 py-1 font-mono text-[10px] text-emerald-300/80">
          {zoomEnabled
            ? "drag = rotate · scroll = zoom · right-drag = pan · double-click = reset"
            : "click the city to enable zoom · drag = rotate"}
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
