import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, Stars, AdaptiveDpr, AdaptiveEvents } from "@react-three/drei";
import * as THREE from "three";
import type { DayMap, PlatformId } from "@/lib/activity/types";
import { PLATFORM_LABELS } from "@/lib/activity/types";

const CELL = 1; // world units per day footprint
const GAP = 0.35;
const STEP = CELL + GAP;
const UNIT = 0.35; // height per contribution

function lighten(hex: string, amount = 0.28) {
  const c = new THREE.Color(hex);
  c.offsetHSL(0, 0, amount);
  return c;
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
  segments: Segment[];
};

type CarProp = { x: number; z: number; axis: "x" | "z"; dir: 1 | -1; speed: number };

const tmpObj = new THREE.Object3D();
const tmpColor = new THREE.Color();

/** All building floors in a single instanced draw call. */
function Towers({
  buildings,
  hoverDate,
  onHover,
  dragRef,
}: {
  buildings: Building[];
  hoverDate: string | null;
  onHover: (b: Building | null) => void;
  dragRef: MutableRefObject<boolean>;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);

  // flat segment list + which building each instance belongs to
  const { flat, owner, count } = useMemo(() => {
    const f: Array<{ b: Building; s: Segment }> = [];
    for (const b of buildings) for (const s of b.segments) f.push({ b, s });
    return { flat: f, owner: f.map((x) => x.b), count: Math.max(f.length, 1) };
  }, [buildings]);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    flat.forEach(({ b, s }, i) => {
      tmpObj.position.set(b.x, s.y, b.z);
      tmpObj.scale.set(CELL, Math.max(s.h, 0.02), CELL);
      tmpObj.rotation.set(0, 0, 0);
      tmpObj.updateMatrix();
      mesh.setMatrixAt(i, tmpObj.matrix);
      mesh.setColorAt(i, tmpColor.set(s.color));
    });
    mesh.count = flat.length;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [flat]);

  // hover highlight = recolour only the hovered day's instances
  const prev = useRef<number[]>([]);
  useEffect(() => {
    const mesh = ref.current;
    if (!mesh || !mesh.instanceColor) return;
    for (const i of prev.current) {
      const seg = flat[i];
      if (seg) mesh.setColorAt(i, tmpColor.set(seg.s.color));
    }
    prev.current = [];
    if (hoverDate) {
      flat.forEach(({ b, s }, i) => {
        if (b.date !== hoverDate) return;
        mesh.setColorAt(i, lighten(s.color, 0.28));
        prev.current.push(i);
      });
    }
    mesh.instanceColor.needsUpdate = true;
  }, [hoverDate, flat]);

  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, count]}
      frustumCulled={false}
      onPointerMove={(e) => {
        e.stopPropagation();
        if (dragRef.current) return;
        const id = e.instanceId;
        if (id == null) return;
        const b = owner[id];
        if (b && b.date !== hoverDate) onHover(b);
      }}
      onPointerOut={() => onHover(null)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.32} metalness={0.28} />
    </instancedMesh>
  );
}

/** Rooftop caps + thin floor bands, each one instanced draw call. */
function Details({ buildings }: { buildings: Building[] }) {
  const roofRef = useRef<THREE.InstancedMesh>(null);
  const bandRef = useRef<THREE.InstancedMesh>(null);

  const bands = useMemo(() => {
    const out: Array<{ x: number; y: number; z: number; color: string }> = [];
    for (const b of buildings) {
      for (const s of b.segments) {
        // cap visual bands to keep draw calls light while still showing platform layers
        const floors = Math.min(Math.max(Math.round(s.h / 0.8), 1), 2);
        const top = s.y + s.h / 2;
        const step = s.h / (floors + 1);
        for (let f = 1; f <= floors; f++) {
          out.push({ x: b.x, y: top - f * step, z: b.z, color: s.color });
        }
      }
    }
    return out;
  }, [buildings]);

  useLayoutEffect(() => {
    const roof = roofRef.current;
    if (roof) {
      buildings.forEach((b, i) => {
        tmpObj.position.set(b.x, b.h + 0.07, b.z);
        tmpObj.scale.set(1, 1, 1);
        tmpObj.rotation.set(0, 0, 0);
        tmpObj.updateMatrix();
        roof.setMatrixAt(i, tmpObj.matrix);
        roof.setColorAt(i, lighten(b.color, 0.2));
      });
      roof.count = buildings.length;
      roof.instanceMatrix.needsUpdate = true;
      if (roof.instanceColor) roof.instanceColor.needsUpdate = true;
    }
    const band = bandRef.current;
    if (band) {
      bands.forEach((f, i) => {
        tmpObj.position.set(f.x, f.y, f.z);
        tmpObj.scale.set(1, 1, 1);
        tmpObj.rotation.set(0, 0, 0);
        tmpObj.updateMatrix();
        band.setMatrixAt(i, tmpObj.matrix);
        band.setColorAt(i, lighten(f.color, 0.42));
      });
      band.count = bands.length;
      band.instanceMatrix.needsUpdate = true;
      if (band.instanceColor) band.instanceColor.needsUpdate = true;
    }
  }, [buildings, bands]);

  return (
    <>
      <instancedMesh
        ref={roofRef}
        args={[undefined, undefined, Math.max(buildings.length, 1)]}
        frustumCulled={false}
        raycast={() => null}
      >
        <boxGeometry args={[CELL * 0.4, 0.14, CELL * 0.4]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <instancedMesh
        ref={bandRef}
        args={[undefined, undefined, Math.max(bands.length, 1)]}
        frustumCulled={false}
        raycast={() => null}
      >
        <boxGeometry args={[CELL * 1.03, 0.02, CELL * 1.03]} />
        <meshBasicMaterial toneMapped={false} transparent opacity={0.45} />
      </instancedMesh>
    </>
  );
}

/** A few tiny vehicles gliding along the outer lanes (one instanced mesh). */
function Cars({ cars, span }: { cars: CarProp[]; span: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const offsets = useRef<number[]>(cars.map((_, i) => (i / cars.length) * span));

  useFrame((_, rawDelta) => {
    const mesh = ref.current;
    if (!mesh) return;
    const delta = Math.min(rawDelta, 1 / 30);
    for (let i = 0; i < cars.length; i++) {
      const c = cars[i]!;
      let o = (offsets.current[i] ?? 0) + delta * c.speed;
      while (o > span) o -= span;
      offsets.current[i] = o;
      const t = -span / 2 + o;
      if (c.axis === "x") {
        tmpObj.position.set(c.dir === 1 ? t : -t, 0.09, c.z);
        tmpObj.rotation.set(0, 0, 0);
      } else {
        tmpObj.position.set(c.x, 0.09, c.dir === 1 ? t : -t);
        tmpObj.rotation.set(0, Math.PI / 2, 0);
      }
      tmpObj.scale.set(1, 1, 1);
      tmpObj.updateMatrix();
      mesh.setMatrixAt(i, tmpObj.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  if (!cars.length) return null;
  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, cars.length]}
      frustumCulled={false}
      raycast={() => null}
    >
      <boxGeometry args={[0.26, 0.09, 0.13]} />
      <meshBasicMaterial color="#6df3a6" toneMapped={false} />
    </instancedMesh>
  );
}

/** One shared grow-in animation for the whole skyline. */
function GrowIn({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const t = useRef(0);
  const done = useRef(false);
  useFrame((_, rawDelta) => {
    if (done.current || !ref.current) return;
    t.current = Math.min(1, t.current + Math.min(rawDelta, 1 / 30) * 1.2);
    const ease = 1 - Math.pow(1 - t.current, 3);
    ref.current.scale.y = Math.max(0.001, ease);
    if (t.current >= 1) {
      ref.current.scale.y = 1;
      done.current = true;
    }
  });
  return <group ref={ref}>{children}</group>;
}

function HoverLight({ building }: { building: Building | null }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const targetPos = useRef(new THREE.Vector3(0, -100, 0));
  const targetInt = useRef(0);
  useFrame(() => {
    const light = lightRef.current;
    if (!light) return;
    if (building) {
      targetPos.current.set(building.x, building.h + 1.6, building.z);
      targetInt.current = 9;
    } else {
      targetInt.current = 0;
    }
    light.position.lerp(targetPos.current, 0.18);
    light.intensity = THREE.MathUtils.lerp(light.intensity, targetInt.current, 0.18);
  });
  return (
    <pointLight
      ref={lightRef}
      position={[0, -100, 0]}
      distance={11}
      decay={2}
      color="#3ddc84"
      intensity={0}
    />
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
  const cars = useMemo<CarProp[]>(() => {
    const laneZ = depth / 2 + STEP * 0.9;
    return [
      { x: 0, z: -laneZ, axis: "x", dir: 1, speed: 2.4 },
      { x: 0, z: laneZ, axis: "x", dir: -1, speed: 2.1 },
      { x: -width / 2 - STEP * 0.9, z: 0, axis: "z", dir: 1, speed: 1.7 },
      { x: width / 2 + STEP * 0.9, z: 0, axis: "z", dir: -1, speed: 2.0 },
    ];
  }, [width, depth]);

  const hoverBuilding = useMemo(
    () => buildings.find((b) => b.date === hoverDate) ?? null,
    [buildings, hoverDate],
  );

  return (
    <>
      <color attach="background" args={["#08150f"]} />
      <fog attach="fog" args={["#08150f", 35, 90]} />
      <Stars radius={120} depth={50} count={320} factor={4} saturation={0} fade speed={0.4} />

      <ambientLight intensity={0.75} />
      <hemisphereLight args={["#a8ffbe", "#04120b", 0.6]} />
      <directionalLight position={[22, 34, 18]} intensity={1.05} />
      <directionalLight position={[-18, 12, -12]} intensity={0.35} color="#3ddc84" />

      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]} frustumCulled={false} raycast={() => null}>
        <planeGeometry args={[width + 10, depth + 10]} />
        <meshStandardMaterial color="#0a1a12" roughness={0.9} metalness={0.1} />
      </mesh>

      <Grid
        position={[0, -0.04, 0]}
        args={[width + 8, depth + 8]}
        cellSize={STEP}
        cellColor="#1f5c3c"
        sectionSize={STEP * 7}
        sectionColor="#3ddc84"
        fadeDistance={75}
        fadeStrength={1.4}
        infiniteGrid={false}
      />

      <GrowIn>
        <Towers
          buildings={buildings}
          hoverDate={hoverDate}
          onHover={onHover}
          dragRef={dragRef}
        />
        <Details buildings={buildings} />
      </GrowIn>

      <Cars cars={cars} span={width + STEP * 4} />
      <HoverLight building={hoverBuilding} />

      <OrbitControls
        makeDefault
        ref={controlsRef as never}
        enablePan
        enableZoom={zoomEnabled}
        enableDamping
        dampingFactor={0.1}
        rotateSpeed={0.55}
        zoomSpeed={0.6}
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
        // cap platforms per day to keep segment/instance count low without losing top contributors
        const topPer = per.slice(0, 3);

        const total = topPer.reduce((s, p) => s + p.count, 0) || 1;
        const h = Math.min(count, 24) * UNIT + 0.25;

        const segments: Segment[] = [];
        let y = 0;
        for (const p of topPer) {
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
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          onPointerMissed={() => setHover(null)}
        >
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />
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
