import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, AdaptiveDpr, AdaptiveEvents } from "@react-three/drei";
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
      frustumCulled={true}
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
        frustumCulled={true}
        raycast={() => null}
      >
        <boxGeometry args={[CELL * 0.4, 0.14, CELL * 0.4]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <instancedMesh
        ref={bandRef}
        args={[undefined, undefined, Math.max(bands.length, 1)]}
        frustumCulled={true}
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
      frustumCulled={true}
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

const DEFAULT_CAM: [number, number, number] = [0, 22, 28];
const DEFAULT_TARGET: [number, number, number] = [0, 1, 0];

const BEACON_COUNT = 5;
const BEACON_HEIGHT = 26;
const TOUR_SECONDS = 22;

/** Sky laser pillars over the top contribution days. */
function Beacons({ buildings }: { buildings: Building[] }) {
  const top = useMemo(
    () => [...buildings].sort((a, b) => b.count - a.count).slice(0, BEACON_COUNT),
    [buildings],
  );
  const beamRefs = useRef<Array<THREE.Mesh | null>>([]);
  const ringRefs = useRef<Array<THREE.Mesh | null>>([]);
  const t = useRef(0);

  useFrame((_, rawDelta) => {
    t.current += Math.min(rawDelta, 1 / 30);
    top.forEach((_, i) => {
      const phase = t.current * 1.6 + i * 1.3;
      const beam = beamRefs.current[i];
      if (beam) {
        const m = beam.material as THREE.MeshBasicMaterial;
        m.opacity = 0.28 + Math.sin(phase) * 0.1;
      }
      const ring = ringRefs.current[i];
      if (ring) {
        const p = (t.current * 0.6 + i * 0.2) % 1;
        ring.scale.setScalar(0.6 + p * 2.2);
        (ring.material as THREE.MeshBasicMaterial).opacity = 0.7 * (1 - p);
      }
    });
  });

  return (
    <>
      {top.map((b, i) => (
        <group key={b.date} position={[b.x, b.h, b.z]}>
          <mesh
            ref={(m) => {
              beamRefs.current[i] = m;
            }}
            position={[0, BEACON_HEIGHT / 2, 0]}
            raycast={() => null}
          >
            <cylinderGeometry args={[0.08, 0.22, BEACON_HEIGHT, 8, 1, true]} />
            <meshBasicMaterial
              color={b.color}
              transparent
              opacity={0.3}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </mesh>
          <mesh
            ref={(m) => {
              ringRefs.current[i] = m;
            }}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.2, 0]}
            raycast={() => null}
          >
            <ringGeometry args={[0.55, 0.68, 32]} />
            <meshBasicMaterial
              color={b.color}
              transparent
              depthWrite={false}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </>
  );
}

/** Cinematic drone flight: outer boulevard pass, clear rooftop flyover, then a high orbit. */
function DroneTour({
  active,
  width,
  depth,
  maxBuildingHeight,
  controlsRef,
  onDone,
}: {
  active: boolean;
  width: number;
  depth: number;
  maxBuildingHeight: number;
  controlsRef: MutableRefObject<OrbitLike | null>;
  onDone: () => void;
}) {
  const t = useRef(0);
  const curve = useMemo(() => {
    const hw = width / 2;
    const hd = depth / 2;
    const safeRoofY = Math.max(11.5, maxBuildingHeight + 3.2);
    return new THREE.CatmullRomCurve3(
      [
        // Phase 1: approach and low pass along the empty outer front road.
        new THREE.Vector3(-hw - 7, 7, hd + 7),
        new THREE.Vector3(-hw * 0.4, 4.8, hd + 4.5),
        new THREE.Vector3(hw * 0.3, 5.2, hd + 4.2),
        // Phase 2: climb around the right perimeter before crossing the skyline.
        new THREE.Vector3(hw + 6, 8.5, hd * 0.4),
        new THREE.Vector3(hw * 0.2, safeRoofY, -hd * 0.3),
        new THREE.Vector3(-hw * 0.3, safeRoofY + 1.5, -hd - 4),
        // Phase 3: panoramic orbit and return alignment.
        new THREE.Vector3(-hw - 6, 17, -hd - 6),
        new THREE.Vector3(-hw * 0.6, 18, hd + 2),
        new THREE.Vector3(0, 21, hd + 18),
      ],
      false,
      "centripetal",
    );
  }, [width, depth, maxBuildingHeight]);

  const drone = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const rotors = useRef<(THREE.Mesh | null)[]>([]);
  const lights = useRef<THREE.MeshBasicMaterial[]>([]);
  const spotlight = useRef<THREE.SpotLight>(null);
  const spotlightTarget = useRef<THREE.Object3D>(null);
  const camPos = useRef(new THREE.Vector3());
  const camLook = useRef(new THREE.Vector3());
  const tmp = useMemo(
    () => ({
      p: new THREE.Vector3(),
      a: new THREE.Vector3(),
      dir: new THREE.Vector3(),
      prevDir: new THREE.Vector3(1, 0, 0),
      want: new THREE.Vector3(),
      target: new THREE.Vector3(...DEFAULT_TARGET),
      home: new THREE.Vector3(...DEFAULT_CAM),
      bank: 0,
      speed: 0,
      started: false,
      ending: 0,
    }),
    [],
  );

  useEffect(() => {
    if (active) {
      t.current = 0;
      tmp.started = false;
      tmp.ending = 0;
      tmp.speed = 0;
    }
  }, [active, tmp]);

  useFrame((state, rawDelta) => {
    if (drone.current) drone.current.visible = active;
    if (!active) return;
    const c = controlsRef.current;
    if (!c) return;
    const dt = Math.min(rawDelta, 1 / 30);

    if (!tmp.started) {
      camPos.current.copy(c.object.position);
      camLook.current.copy(c.target);
      tmp.started = true;
    }

    // soft speed ramp: accelerate in, cruise, then brake
    const ramp = THREE.MathUtils.smoothstep(t.current, 0, 0.08) * (1 - 0.6 * THREE.MathUtils.smoothstep(t.current, 0.88, 1));
    tmp.speed += (Math.max(0.15, ramp) - tmp.speed) * (1 - Math.exp(-3 * dt));
    t.current = Math.min(1, t.current + (dt * tmp.speed) / TOUR_SECONDS);

    const u = t.current;
    curve.getPointAt(u, tmp.p);
    const halfWidth = width / 2;
    const halfDepth = depth / 2;
    // A curve can interpolate between an exterior waypoint and a roof waypoint.
    // Raise any interpolated point already over the footprint above the skyline.
    if (Math.abs(tmp.p.x) <= halfWidth + 0.5 && Math.abs(tmp.p.z) <= halfDepth + 0.5) {
      tmp.p.y = Math.max(tmp.p.y, maxBuildingHeight + 3.1);
    }
    curve.getPointAt(Math.min(1, u + 0.01), tmp.a);
    if (Math.abs(tmp.a.x) <= halfWidth + 0.5 && Math.abs(tmp.a.z) <= halfDepth + 0.5) {
      tmp.a.y = Math.max(tmp.a.y, maxBuildingHeight + 3.1);
    }
    tmp.dir.subVectors(tmp.a, tmp.p);
    if (tmp.dir.lengthSq() < 1e-6) tmp.dir.copy(tmp.prevDir);
    tmp.dir.normalize();

    // banking from turn rate
    const turn = tmp.prevDir.x * tmp.dir.z - tmp.prevDir.z * tmp.dir.x;
    const wantBank = THREE.MathUtils.clamp(-turn / Math.max(dt, 1e-3) * 0.6, -0.55, 0.55);
    tmp.bank += (wantBank - tmp.bank) * (1 - Math.exp(-4 * dt));
    tmp.prevDir.lerp(tmp.dir, 1 - Math.exp(-6 * dt)).normalize();

    const time = state.clock.elapsedTime;
    if (drone.current && body.current) {
      drone.current.position.copy(tmp.p);
      drone.current.position.y += Math.sin(time * 2.2) * 0.04;
      drone.current.rotation.set(0, Math.atan2(tmp.prevDir.x, tmp.prevDir.z), 0);
      body.current.rotation.set(0.18 * tmp.speed, 0, tmp.bank);
    }
    if (spotlight.current && spotlightTarget.current) {
      spotlight.current.target = spotlightTarget.current;
      spotlightTarget.current.updateMatrixWorld();
    }
    rotors.current.forEach((r, i) => {
      if (r) r.rotation.y += dt * (40 + i * 3) * (i % 2 ? 1 : -1);
    });
    const blink = Math.sin(time * 6) > 0.6 ? 1 : 0.25;
    lights.current.forEach((m) => m && (m.opacity = blink));

    // chase cam: behind + above the drone, heavily damped
    tmp.want.copy(tmp.p).addScaledVector(tmp.prevDir, -3.2);
    tmp.want.y += 1.4;
    // Keep the chase camera over the roofs whenever its horizontal position
    // enters the city footprint. This also avoids cutting through tower tops
    // during the rising perimeter turn.
    const hw = width / 2;
    const hd = depth / 2;
    if (Math.abs(tmp.want.x) < hw + 1 && Math.abs(tmp.want.z) < hd + 1) {
      tmp.want.y = Math.max(tmp.want.y, maxBuildingHeight + 3.2);
    }
    const endBlend = THREE.MathUtils.smoothstep(u, 0.85, 1);
    tmp.want.lerp(tmp.home, endBlend);
    tmp.a.copy(tmp.p).addScaledVector(tmp.prevDir, 2).lerp(tmp.target, endBlend);

    const k = 1 - Math.exp(-2.6 * dt);
    camPos.current.lerp(tmp.want, k);
    camLook.current.lerp(tmp.a, 1 - Math.exp(-4 * dt));
    c.object.position.copy(camPos.current);
    c.target.copy(camLook.current);
    c.update();

    if (u >= 1) {
      tmp.ending += dt;
      if (tmp.ending > 0.6 || camPos.current.distanceTo(tmp.home) < 0.2) onDone();
    }
  });

  const arms: [number, number][] = [
    [0.32, 0.32],
    [-0.32, 0.32],
    [0.32, -0.32],
    [-0.32, -0.32],
  ];

  return (
    <group ref={drone} visible={false}>
      <group ref={body} scale={0.9}>
        {/* fuselage */}
        <mesh>
          <boxGeometry args={[0.26, 0.09, 0.38]} />
          <meshStandardMaterial color="#1b2a24" metalness={0.6} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.06, -0.02]}>
          <boxGeometry args={[0.18, 0.04, 0.22]} />
          <meshStandardMaterial color="#0f1a15" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* camera lens */}
        <mesh position={[0, -0.02, 0.2]}>
          <sphereGeometry args={[0.045, 12, 10]} />
          <meshBasicMaterial color="#39ff9c" toneMapped={false} />
        </mesh>
        {arms.map(([x, z], i) => (
          <group key={i}>
            <mesh position={[x / 2, 0, z / 2]} rotation={[0, Math.atan2(x, z), 0]}>
              <boxGeometry args={[0.035, 0.03, 0.46]} />
              <meshStandardMaterial color="#26352f" metalness={0.5} roughness={0.5} />
            </mesh>
            <mesh position={[x, 0.03, z]}>
              <cylinderGeometry args={[0.035, 0.04, 0.05, 10]} />
              <meshStandardMaterial color="#111" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh ref={(m) => (rotors.current[i] = m)} position={[x, 0.065, z]}>
              <boxGeometry args={[0.3, 0.006, 0.035]} />
              <meshBasicMaterial color="#9fe8c4" transparent opacity={0.45} />
            </mesh>
            <mesh position={[x, -0.01, z]}>
              <sphereGeometry args={[0.022, 8, 6]} />
              <meshBasicMaterial
                ref={(m) => {
                  if (m) lights.current[i] = m;
                }}
                color={z > 0 ? "#3dff8a" : "#ff3d5a"}
                transparent
                toneMapped={false}
              />
            </mesh>
          </group>
        ))}
        {/* searchlight cone */}
        <mesh position={[0, -1.3, 0.15]}>
          <coneGeometry args={[0.7, 2.5, 20, 1, true]} />
          <meshBasicMaterial color="#5dffb0" transparent opacity={0.08} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
        <object3D ref={spotlightTarget} position={[0, -8, 0]} />
        <spotLight ref={spotlight} position={[0, -0.2, 0]} color="#5dffb0" intensity={5} distance={22} angle={0.48} penumbra={0.75} />
      </group>
    </group>
  );
}

type OrbitLike = {
  target: THREE.Vector3;
  object: THREE.Camera;
  update: () => void;
};

function Scene({
  buildings,
  width,
  depth,
  maxBuildingHeight,
  onHover,
  hoverDate,
  dragRef,
  zoomEnabled,
  controlsRef,
  touring,
  onTourDone,
}: {
  buildings: Building[];
  width: number;
  depth: number;
  maxBuildingHeight: number;
  onHover: (b: Building | null) => void;
  hoverDate: string | null;
  dragRef: MutableRefObject<boolean>;
  zoomEnabled: boolean;
  controlsRef: MutableRefObject<OrbitLike | null>;
  touring: boolean;
  onTourDone: () => void;
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
      <color attach="background" args={["#090d13"]} />
      <fog attach="fog" args={["#090d13", 40, 105]} />

      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#a4b7ff", "#080b10", 0.45]} />
      <directionalLight position={[25, 40, 20]} intensity={1.2} color="#eef2f8" />
      <directionalLight position={[-20, 15, -15]} intensity={0.4} color="#a4b7ff" />

      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]} frustumCulled={false} raycast={() => null}>
        <planeGeometry args={[width + 10, depth + 10]} />
        <meshStandardMaterial color="#101722" roughness={0.85} metalness={0.18} />
      </mesh>

      <Grid
        position={[0, -0.04, 0]}
        args={[width + 8, depth + 8]}
        cellSize={STEP}
        cellColor="#263446"
        sectionSize={STEP * 7}
        sectionColor="#3b4b63"
        fadeDistance={80}
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

      <Beacons buildings={buildings} />
      <DroneTour active={touring} width={width} depth={depth} maxBuildingHeight={maxBuildingHeight} controlsRef={controlsRef} onDone={onTourDone} />
      <Cars cars={cars} span={width + STEP * 4} />
      <HoverLight building={hoverBuilding} />

      <OrbitControls
        makeDefault
        ref={controlsRef as never}
        enabled={!touring}
        enablePan
        enableZoom={zoomEnabled}
        enableDamping
        dampingFactor={0.075}
        rotateSpeed={0.52}
        zoomSpeed={0.5}
        panSpeed={0.6}
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
        const topPer = per;

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
          color: topPer[0] ? (colors[topPer[0].platform] ?? "#3ddc84") : "#3ddc84",
          segments,
        });
      });
    });

    return { buildings: out, width: w, depth: d };
  }, [weeks, merged, calendars, colors]);

  const maxBuildingHeight = useMemo(
    () => Math.max(...buildings.map((b) => b.h), 4.5),
    [buildings],
  );

  const controlsRef = useRef<OrbitLike | null>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const [canvasVisible, setCanvasVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const dragRef = useRef(false);
  const downRef = useRef<{ x: number; y: number } | null>(null);
  const [zoomEnabled, setZoomEnabled] = useState(false);
  const [touring, setTouring] = useState(false);

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
    const host = canvasHostRef.current;
    if (!host) return;

    let intersectsViewport = false;
    const syncVisibility = () => {
      setPageVisible(document.visibilityState === "visible");
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        intersectsViewport = entry.isIntersecting;
        setCanvasVisible(intersectsViewport);
      },
      { rootMargin: "140px" },
    );
    observer.observe(host);
    document.addEventListener("visibilitychange", syncVisibility);
    const onBlur = () => setZoomEnabled(false);
    window.addEventListener("blur", onBlur);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncVisibility);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  return (
    <div>
      <div
        ref={canvasHostRef}
        className="relative h-[420px] w-full overflow-hidden [touch-action:pan-y] rounded-xl border border-border shadow-card"
        style={{ background: "linear-gradient(180deg, #090d13 0%, #101722 100%)" }}
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
          frameloop={(canvasVisible || touring) && pageVisible ? "always" : "never"}
          camera={{ position: DEFAULT_CAM, fov: 42 }}
          dpr={[1, 1.25]}
          gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
          onPointerMissed={() => setHover(null)}
        >
          <AdaptiveDpr />
          <AdaptiveEvents />
          <Scene
            buildings={buildings}
            width={width}
            depth={depth}
            maxBuildingHeight={maxBuildingHeight}
            onHover={setHover}
            hoverDate={hover?.date ?? null}
            dragRef={dragRef}
            zoomEnabled={zoomEnabled}
            controlsRef={controlsRef}
            touring={touring}
            onTourDone={() => setTouring(false)}
          />
        </Canvas>

        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => {
            setHover(null);
            setTouring((v) => !v);
          }}
          className="absolute right-3 top-3 rounded-lg border border-primary/40 bg-background/85 px-3 py-1.5 font-mono text-[11px] font-semibold text-primary shadow-card backdrop-blur-md transition hover:bg-primary/10"
        >
          {touring ? "■ stop tour" : "▶ drone tour"}
        </button>
        {touring ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 text-center font-mono text-[11px] tracking-[0.3em] text-primary">
            ● REC · DRONE FLYOVER
          </div>
        ) : null}

        <div className="pointer-events-none absolute left-3 top-3 rounded-lg border border-border bg-background/85 px-3 py-1.5 font-mono text-[11px] text-foreground/80 shadow-card backdrop-blur-md">
          {touring
            ? "cinematic flyover in progress…"
            : zoomEnabled
            ? "drag = rotate · scroll = zoom · right-drag = pan · double-click = reset"
            : "click the city to enable zoom · drag = rotate"}
        </div>

        {hover ? (
          <div className="pointer-events-none absolute bottom-3 left-3 max-w-[75%] rounded-xl border border-border bg-card/95 p-3.5 font-mono text-xs text-foreground shadow-card backdrop-blur-md">
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
                  <span className="text-foreground/90">{PLATFORM_LABELS[s.platform]}</span>
                  <span className="text-foreground/70">
                    {s.count} · {((s.count / hover.count) * 100).toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-2 text-xs text-muted-foreground">
        Each tower is one day — height = total contributions, and every floor band is a platform
        sized by its share of that day. Laser beacons mark your top 5 days — hit ▶ drone tour for a flyover.
      </div>
    </div>
  );
}
