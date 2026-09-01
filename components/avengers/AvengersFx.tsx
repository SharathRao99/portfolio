"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { Fx } from "./heroes";

/**
 * Avengers-mode WebGL effects layer. A single full-screen fragment shader that
 * plays a short, hero-specific burst — emanating from the clicked icon — when a
 * character is pressed (or scrolls into view): Thor's lightning, Cap's
 * red/white/blue shockwave, Iron Man's repulsor bloom, Strange's portal ring,
 * Spider's web strands, Hulk/Thanos shockwaves, Loki/Doom's glitch.
 *
 * Mounted ONLY inside AvengersBackground (the opt-in easter egg), so default
 * mode — and its own shader hero — is never affected. The canvas is idle (zero
 * render cost) until a burst fires: `frameloop="demand"` with an rAF that only
 * invalidates for the ~1.6s a burst is alive, then stops.
 */

export type Burst = {
    fx: Fx;
    accent: string;
    origin: { x: number; y: number };
    key: number;
    // sustained effects (Thor's storm) loop until the section scrolls away,
    // rather than playing a single one-shot burst.
    sustain?: boolean;
};

const MODE: Record<Fx, number> = {
    lightning: 1,
    portal: 2,
    thruster: 3,
    shock: 4,
    illusion: 5,
    web: 6,
    shield: 7,
    none: 0,
};

const DURATION = 1.6; // seconds per burst

type FxState = {
    active: boolean;
    sustain: boolean;
    mode: number;
    start: number;
    cx: number;
    cy: number;
    color: string;
};

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uMode;
  uniform float uProgress;
  uniform float uAspect;
  uniform vec2  uCenter;
  uniform vec3  uColor;

  const float TAU = 6.28318530718;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
  float vnoise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i), b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }
  float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++){ v += a * vnoise(p); p *= 2.0; a *= 0.5; }
    return v;
  }

  void main(){
    vec2 uv = vUv;
    vec2 frag = vec2(uv.x * uAspect, uv.y);
    vec2 c = vec2(uCenter.x * uAspect, uCenter.y);
    vec2 rel = frag - c;
    float d = length(rel);
    float ang = atan(rel.y, rel.x);
    float p = uProgress;
    float fade = 1.0 - smoothstep(0.7, 1.0, p);

    vec3 col = vec3(0.0);
    float alpha = 0.0;

    if (uMode < 0.5) {
      // none
    } else if (uMode < 1.5) {
      // LIGHTNING — blue storm flash + jagged electric-blue radial bolts
      float flash = max(exp(-p * 6.0) * (0.6 + 0.4 * sin(p * 80.0)), 0.0);
      col += vec3(0.55, 0.75, 1.0) * flash * 0.7;
      alpha += flash * 0.6;
      float n = fbm(vec2(ang * 3.0, d * 6.0 - p * 4.0));
      float spokes = abs(fract(ang / TAU * 9.0 + n * 0.3) - 0.5);
      float bolt = smoothstep(0.06, 0.0, spokes) * smoothstep(0.9, 0.0, d) * step(d, p * 1.3);
      col += vec3(0.45, 0.7, 1.0) * bolt * 1.5;
      alpha += bolt;
    } else if (uMode < 2.5) {
      // PORTAL — rotating sparking ring
      float r = 0.20 + p * 0.12;
      float band = smoothstep(0.06, 0.0, abs(d - r));
      float sparks = pow(0.5 + 0.5 * sin(ang * 40.0 - p * 24.0), 6.0);
      float glow = smoothstep(0.22, 0.0, abs(d - r));
      col += uColor * 1.3 * (band * sparks * 2.0 + glow * 0.4);
      alpha += band * sparks + glow * 0.3;
    } else if (uMode < 3.5) {
      // THRUSTER — repulsor blast bloom
      float core = exp(-d * d * (60.0 / (0.05 + p)));
      float halo = exp(-d * (10.0 - p * 7.0));
      col += mix(uColor, vec3(1.0), core) * (core * 1.6 + halo * 0.5) * (1.0 - p * 0.6);
      alpha += core + halo * 0.4;
    } else if (uMode < 4.5) {
      // SHOCK — expanding shockwave ring
      float r = p * 1.3;
      float w = 0.04 + p * 0.12;
      float ring = smoothstep(w, 0.0, abs(d - r));
      col += uColor * ring * 2.0;
      alpha += ring;
      col += uColor * smoothstep(r, r - 0.3, d) * 0.05;
    } else if (uMode < 5.5) {
      // ILLUSION — green glitch shimmer
      float g = fbm(vec2(uv.x * 10.0, uv.y * 40.0 + p * 8.0));
      float scan = 0.5 + 0.5 * sin(uv.y * 180.0 + p * 30.0);
      float m = smoothstep(0.9, 0.2, d);
      col += uColor * (g * scan) * m * 1.6;
      alpha += (g * scan) * m * 0.9;
    } else if (uMode < 6.5) {
      // WEB — radial strands + rings shooting out
      float reach = p * 0.7;
      float spokes = abs(fract(ang / TAU * 8.0) - 0.5);
      float strand = smoothstep(0.03, 0.0, spokes);
      float rings = smoothstep(0.02, 0.0, abs(fract(d * 14.0) - 0.5) * 0.14);
      float mask = smoothstep(reach, reach - 0.06, d);
      float web = (strand + rings * 0.6) * mask;
      col += vec3(0.95) * web * 1.4;
      alpha += web;
    } else {
      // SHIELD — red / white / blue concentric shockwave
      float r = p * 1.2;
      float w = 0.05;
      float r1 = smoothstep(w, 0.0, abs(d - r));
      float r2 = smoothstep(w, 0.0, abs(d - (r - 0.08)));
      float r3 = smoothstep(w, 0.0, abs(d - (r - 0.16)));
      col += vec3(0.85, 0.1, 0.15) * r1 + vec3(1.0) * r2 + vec3(0.11, 0.3, 0.9) * r3;
      alpha += max(r1, max(r2, r3));
    }

    gl_FragColor = vec4(col * fade, clamp(alpha * fade, 0.0, 1.0));
  }
`;

function FxPlane({
    stateRef,
    invalidateRef,
}: {
    stateRef: React.MutableRefObject<FxState>;
    invalidateRef: React.MutableRefObject<((frames?: number) => void) | null>;
}) {
    const { viewport, size } = useThree();
    const invalidate = useThree((s) => s.invalidate);
    useEffect(() => {
        invalidateRef.current = invalidate;
    }, [invalidate, invalidateRef]);

    const material = useMemo(
        () =>
            new THREE.ShaderMaterial({
                vertexShader,
                fragmentShader,
                transparent: true,
                depthWrite: false,
                uniforms: {
                    uMode: { value: 0 },
                    uProgress: { value: 2 },
                    uAspect: { value: 1 },
                    uCenter: { value: new THREE.Vector2(0.5, 0.5) },
                    uColor: { value: new THREE.Color("#ffffff") },
                },
            }),
        []
    );

    useFrame(({ clock }) => {
        const s = stateRef.current;
        const u = material.uniforms;
        u.uAspect.value = size.width / size.height;
        // uProgress > 1 fully fades the shader, so an inactive layer draws nothing
        if (!s.active) {
            u.uProgress.value = 2;
            return;
        }
        if (s.start < 0) s.start = clock.getElapsedTime();
        const p = (clock.getElapsedTime() - s.start) / DURATION;
        u.uMode.value = s.mode;
        (u.uCenter.value as THREE.Vector2).set(s.cx, s.cy);
        (u.uColor.value as THREE.Color).set(s.color);
        if (s.sustain) {
            // loop the storm until the section scrolls away (burst cleared)
            u.uProgress.value = p % 1;
        } else {
            u.uProgress.value = p;
            if (p >= 1) s.active = false;
        }
    });

    return (
        <mesh scale={[viewport.width, viewport.height, 1]} material={material}>
            <planeGeometry args={[1, 1]} />
        </mesh>
    );
}

export default function AvengersFx({ burst }: { burst: Burst | null }) {
    const stateRef = useRef<FxState>({
        active: false,
        sustain: false,
        mode: 0,
        start: -1,
        cx: 0.5,
        cy: 0.5,
        color: "#ffffff",
    });
    const invalidateRef = useRef<((frames?: number) => void) | null>(null);

    useEffect(() => {
        if (!burst) return;
        const mode = MODE[burst.fx] ?? 0;
        if (mode === 0) return;
        const s = stateRef.current;
        s.mode = mode;
        s.cx = burst.origin.x;
        s.cy = burst.origin.y;
        s.color = burst.accent;
        s.sustain = !!burst.sustain;
        s.start = -1;
        s.active = true;

        // drive the demand loop only while the burst is alive
        let raf = 0;
        const tick = () => {
            invalidateRef.current?.();
            if (stateRef.current.active) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => {
            cancelAnimationFrame(raf);
            // stop + clear the layer when the burst ends / is cleared (sustained
            // storms rely on this to disappear once the section scrolls away)
            stateRef.current.active = false;
            invalidateRef.current?.();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [burst?.key]);

    return (
        <Canvas
            dpr={[1, 1.5]}
            frameloop="demand"
            gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
            <FxPlane stateRef={stateRef} invalidateRef={invalidateRef} />
        </Canvas>
    );
}
