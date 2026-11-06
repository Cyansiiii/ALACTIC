"use client";
/* R3F idiom: uniforms, refs and instance buffers are mutated inside useFrame every
   frame, outside React's render model. The React Compiler rules below don't apply. */
/* eslint-disable react-hooks/refs, react-hooks/immutability */
/**
 * The ALACTIC vault-orb. A faceted glass core inside a fresnel shell, circled by
 * a ring of "committed leaves". Red attack shards fly in, hit the shell, ripple
 * it, and bounce away. The vault never opens.
 *
 * Perf: one transmission material, instanced leaves + shards, procedural
 * environment (no HDR download), DPR capped, frameloop paused offscreen.
 */
import { Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { heroMotion } from "@/lib/motion/hero-store";

const SHELL_R = 1.75;
const RING_R = 2.45;
const SPAWN_R = 7.5;
const SHARDS = 14;
const LEAVES = 28;
const MAX_HITS = 6;

type Palette = { accent: string; verified: string; danger: string; core: string; additive: boolean };

const PALETTES: Record<"dark" | "light", Palette> = {
  dark: { accent: "#7c6cff", verified: "#3ddc97", danger: "#ff5c6c", core: "#151033", additive: true },
  light: { accent: "#4b3be8", verified: "#0b9f63", danger: "#e0364c", core: "#d9d5ff", additive: false },
};

// ─── Fresnel shell with hit ripples ─────────────────────────────────────────
const shellVertex = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying vec3 vObjNormal;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vViewDir = normalize(cameraPosition - world.xyz);
    vObjNormal = normalize(position);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const shellFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uHitColor;
  uniform float uTime;
  uniform vec4 uHits[${MAX_HITS}]; // xyz = object-space dir, w = hit time
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying vec3 vObjNormal;
  void main() {
    float fres = pow(1.0 - abs(dot(vNormalW, vViewDir)), 2.6);
    float ripple = 0.0;
    for (int i = 0; i < ${MAX_HITS}; i++) {
      float age = uTime - uHits[i].w;
      if (age < 0.0 || age > 1.4) continue;
      float ang = acos(clamp(dot(vObjNormal, uHits[i].xyz), -1.0, 1.0));
      float front = age * 1.6;
      float ring = smoothstep(0.22, 0.0, abs(ang - front)) * (1.0 - age / 1.4);
      float core = smoothstep(0.35, 0.0, ang) * max(0.0, 1.0 - age * 3.0);
      ripple += ring * 0.9 + core * 1.4;
    }
    vec3 col = uColor * (fres * 1.1 + 0.03) + uHitColor * ripple;
    float alpha = clamp(fres * 0.85 + ripple * 0.8 + 0.02, 0.0, 1.0);
    gl_FragColor = vec4(col, alpha);
  }
`;

function Shell({ palette, hitsRef }: { palette: Palette; hitsRef: React.RefObject<THREE.Vector4[]> }) {
  const [uniforms] = useState(() => ({
    uColor: { value: new THREE.Color(palette.accent) },
    uHitColor: { value: new THREE.Color(palette.danger) },
    uTime: { value: 0 },
    uHits: { value: hitsRef.current },
  }));
  useEffect(() => {
    uniforms.uColor.value.set(palette.accent);
    uniforms.uHitColor.value.set(palette.danger);
  }, [palette, uniforms]);
  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.elapsedTime;
  });
  return (
    <mesh>
      <icosahedronGeometry args={[SHELL_R, 24]} />
      <shaderMaterial
        vertexShader={shellVertex}
        fragmentShader={shellFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={palette.additive ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </mesh>
  );
}

// ─── Core: faceted glass + inner glow + cage ────────────────────────────────
function Core({ palette }: { palette: Palette }) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!group.current || !heroMotion.animate) return;
    group.current.rotation.y += dt * 0.18;
    group.current.rotation.x += dt * 0.07;
  });
  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[1, 0]} />
        {/* Glassy, not transmissive: transmission samples the transparent canvas and goes black. */}
        <meshPhysicalMaterial
          color={palette.core}
          metalness={0.35}
          roughness={0.18}
          iridescence={1}
          iridescenceIOR={1.4}
          iridescenceThicknessRange={[180, 720]}
          clearcoat={1}
          clearcoatRoughness={0.08}
          transparent
          opacity={0.78}
          flatShading
          envMapIntensity={2.2}
          emissive={palette.accent}
          emissiveIntensity={0.12}
        />
      </mesh>
      <mesh scale={0.36}>
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color={palette.accent} toneMapped={false} />
      </mesh>
      <mesh scale={0.62}>
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color={palette.accent} transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh scale={1.38}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color={palette.accent} wireframe transparent opacity={0.09} />
      </mesh>
    </group>
  );
}

// ─── Ring of committed leaves ───────────────────────────────────────────────
function LeafRing({ palette }: { palette: Palette }) {
  const ring = useRef<THREE.Group>(null);
  const inst = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const m = new THREE.Object3D();
    for (let i = 0; i < LEAVES; i++) {
      const a = (i / LEAVES) * Math.PI * 2;
      m.position.set(Math.cos(a) * RING_R, 0, Math.sin(a) * RING_R);
      m.rotation.set(0, -a, 0);
      const s = i % 7 === 0 ? 1.5 : 1;
      m.scale.set(0.028 * s, 0.028 * s, 0.11 * s);
      m.updateMatrix();
      inst.current!.setMatrixAt(i, m.matrix);
    }
    inst.current!.instanceMatrix.needsUpdate = true;
  }, []);
  useFrame((_, dt) => {
    if (ring.current && heroMotion.animate) ring.current.rotation.y -= dt * 0.08;
  });
  return (
    <group rotation={[0.42, 0, -0.28]}>
      <group ref={ring}>
        <instancedMesh ref={inst} args={[undefined, undefined, LEAVES]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color={palette.verified} toneMapped={false} />
        </instancedMesh>
      </group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[RING_R, 0.005, 6, 160]} />
        <meshBasicMaterial color={palette.verified} transparent opacity={0.3} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[RING_R + 0.5, 0.004, 6, 160]} />
        <meshBasicMaterial color={palette.accent} transparent opacity={0.18} />
      </mesh>
    </group>
  );
}

// ─── Attack shards that bounce off the shell ────────────────────────────────
type Shard = { pos: THREE.Vector3; vel: THREE.Vector3; bounced: boolean; life: number; delay: number };

/** Deterministic PRNG so the first frame (and the poster) is stable. */
function seededRandom(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function spawn(s: Shard, rand: () => number, initial = false) {
  const dir = new THREE.Vector3(rand() * 2 - 1, (rand() * 2 - 1) * 0.6, rand() * 2 - 1).normalize();
  s.pos.copy(dir).multiplyScalar(SPAWN_R);
  // Aim near the center with some spread so hits land all over the shell.
  const target = new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).multiplyScalar(1.6);
  s.vel.copy(target.sub(s.pos)).normalize().multiplyScalar(2.6 + rand() * 1.6);
  s.bounced = false;
  s.life = 0;
  s.delay = initial ? rand() * 2.5 : 0.3 + rand() * 1.2;
}

function Shards({ palette, hitsRef }: { palette: Palette; hitsRef: React.RefObject<THREE.Vector4[]> }) {
  const inst = useRef<THREE.InstancedMesh>(null);
  const hitCursor = useRef(0);
  const shards = useMemo<Shard[]>(() => {
    const rand = seededRandom(7);
    return Array.from({ length: SHARDS }, () => {
      const s = { pos: new THREE.Vector3(), vel: new THREE.Vector3(), bounced: false, life: 0, delay: 0 };
      spawn(s, rand, true);
      return s;
    });
  }, []);
  const tmp = useMemo(() => new THREE.Object3D(), []);
  const normal = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }, rawDt) => {
    const mesh = inst.current;
    if (!mesh) return;
    const dt = Math.min(rawDt, 1 / 30);
    shards.forEach((s, i) => {
      if (heroMotion.animate) {
        if (s.delay > 0) {
          s.delay -= dt;
        } else {
          s.pos.addScaledVector(s.vel, dt);
          if (!s.bounced && s.pos.length() <= SHELL_R) {
            normal.copy(s.pos).normalize();
            s.pos.copy(normal).multiplyScalar(SHELL_R + 0.01);
            s.vel.reflect(normal).multiplyScalar(0.75);
            s.bounced = true;
            const slot = hitsRef.current[hitCursor.current++ % MAX_HITS];
            slot.set(normal.x, normal.y, normal.z, clock.elapsedTime);
          }
          if (s.bounced) s.life += dt;
          if (s.life > 1.6 || s.pos.length() > SPAWN_R + 1) spawn(s, Math.random);
        }
      }
      const visible = s.delay <= 0;
      const fade = s.bounced ? Math.max(0, 1 - s.life / 1.6) : 1;
      tmp.position.copy(s.pos);
      tmp.lookAt(s.pos.x + s.vel.x, s.pos.y + s.vel.y, s.pos.z + s.vel.z);
      const k = visible ? fade : 0;
      tmp.scale.set(0.045 * k, 0.045 * k, 0.42 * k);
      tmp.updateMatrix();
      mesh.setMatrixAt(i, tmp.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={inst} args={[undefined, undefined, SHARDS]} frustumCulled={false}>
      <octahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color={palette.danger} toneMapped={false} />
    </instancedMesh>
  );
}

// ─── Rig: scroll rotation + pointer parallax ────────────────────────────────
function Rig({ children }: { children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!g.current) return;
    const k = 1 - Math.exp(-dt * 4);
    const targetY = heroMotion.pointerX * 0.25 + heroMotion.scroll * Math.PI * 0.9;
    const targetX = -heroMotion.pointerY * 0.18 + heroMotion.scroll * 0.4;
    g.current.rotation.y += (targetY - g.current.rotation.y) * k;
    g.current.rotation.x += (targetX - g.current.rotation.x) * k;
  });
  return <group ref={g}>{children}</group>;
}

export default function VaultScene({
  theme,
  active,
  onReady,
}: {
  theme: "dark" | "light";
  /** false when offscreen: stops the render loop. */
  active: boolean;
  onReady?: () => void;
}) {
  const palette = PALETTES[theme];
  const hitsRef = useRef<THREE.Vector4[]>(Array.from({ length: MAX_HITS }, () => new THREE.Vector4(0, 1, 0, -10)));

  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0.2, 8.2], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        requestAnimationFrame(() => onReady?.());
      }}
      aria-hidden
    >
      <ambientLight intensity={0.25} />
      <directionalLight position={[4, 5, 3]} intensity={1.6} color="#ffffff" />
      <pointLight position={[-4, -2, 2]} intensity={18} color={palette.accent} />
      <Environment resolution={128} frames={1}>
        {/* Deep indigo base so reflections are never pure black. */}
        <color attach="background" args={[theme === "dark" ? "#1a1540" : "#c9c4f5"]} />
        <Lightformer form="rect" intensity={2.4} position={[0, 4, 2]} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={3} color={palette.accent} position={[-5, 0, 1]} scale={[3, 8, 1]} />
        <Lightformer form="rect" intensity={1.4} color={palette.verified} position={[5, -1, -2]} scale={[2, 5, 1]} />
        <Lightformer form="circle" intensity={2} color="#ff9ad5" position={[3, 3, -4]} scale={2} />
        <Lightformer form="ring" intensity={1.5} position={[0, 0, -6]} scale={4} />
      </Environment>
      <Rig>
        <Core palette={palette} />
        <Shell palette={palette} hitsRef={hitsRef} />
        <LeafRing palette={palette} />
        <Shards palette={palette} hitsRef={hitsRef} />
      </Rig>
    </Canvas>
  );
}
