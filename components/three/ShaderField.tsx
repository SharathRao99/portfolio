"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useScroll } from "framer-motion";
import * as THREE from "three";

/**
 * Interactive fragment-shader backdrop — a flowing, domain-warped noise field
 * tinted with the site's accent palette, with a soft cursor glow and a
 * scroll-driven drift. One full-screen quad, one GPU pass; cheaper than a
 * particle system and far more of a "how did they build that" moment.
 *
 * Mounted only in default mode on desktop, motion-enabled clients (see
 * BackgroundAnimation), on the same 30fps demand budget + tab-hidden pause as
 * the old ParticleField — so it never competes with the hero's LCP and mobile /
 * crawlers keep the plain aurora fallback.
 */

const TARGET_FPS = 30;

const PALETTE = {
    dark: { a: "#22d3ee", b: "#6366f1", c: "#d946ef" },
    light: { a: "#0891b2", b: "#4f46e5", c: "#c026d3" },
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
  uniform float uTime;
  uniform float uScroll;
  uniform float uDark;
  uniform float uAspect;
  uniform float uRipple;
  uniform vec2  uMouse;
  uniform vec2  uRipplePos;
  uniform vec3  uColorA;
  uniform vec3  uColorB;
  uniform vec3  uColorC;

  // --- Ashima 2D simplex noise ---
  vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
  vec2 mod289(vec2 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
  vec3 permute(vec3 x){ return mod289(((x*34.0)+1.0)*x); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }
  float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++){ v += a * snoise(p); p *= 2.0; a *= 0.5; }
    return v;
  }

  void main(){
    vec2 uv = vUv;
    vec2 frag = vec2(uv.x * uAspect, uv.y);
    vec2 p = frag;
    float t = uTime * 0.14 + uScroll * 0.7;

    // the cursor is a soft attractor: near it, the flow bends toward the
    // pointer, so moving the mouse visibly drags the fluid around.
    vec2 m = vec2(uMouse.x * uAspect, uMouse.y);
    float d = distance(frag, m);
    float glow = exp(-d * d * 4.0);
    p += (m - frag) * glow * 0.35;

    // domain warp for a liquid, flowing feel
    vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) - t));
    float n = fbm(p + q * 1.4 + t * 0.5);
    n = n * 0.5 + 0.5;

    vec3 col = mix(uColorA, uColorB, smoothstep(0.2, 0.85, n));
    col = mix(col, uColorC, smoothstep(0.55, 1.0, fbm(p * 1.5 - t) * 0.5 + 0.5));

    // bright cursor bloom
    col += (uColorA + uColorC) * 0.9 * glow;

    // click ripple — an expanding ring that fades over ~2s
    vec2 rp = vec2(uRipplePos.x * uAspect, uRipplePos.y);
    float rd = distance(frag, rp);
    float ring = sin(rd * 26.0 - uRipple * 9.0) * exp(-rd * 4.0) * exp(-uRipple * 2.2);
    col += (uColorB + uColorC) * ring;

    float mask = smoothstep(0.15, 0.9, n);
    float base = uDark > 0.5 ? 0.62 : 0.42;
    float alpha = base * (0.5 + 0.5 * mask) + glow * 0.4 + abs(ring) * 0.4;

    gl_FragColor = vec4(col, alpha);
  }
`;

function Plane({
    isDark,
    mouse,
    scroll,
    click,
}: {
    isDark: boolean;
    mouse: React.MutableRefObject<{ x: number; y: number; tx: number; ty: number }>;
    scroll: React.MutableRefObject<number>;
    click: React.MutableRefObject<{ x: number; y: number; age: number; active: boolean }>;
}) {
    const { viewport, size } = useThree();

    const material = useMemo(() => {
        const pal = isDark ? PALETTE.dark : PALETTE.light;
        return new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            transparent: true,
            depthWrite: false,
            uniforms: {
                uTime: { value: 0 },
                uScroll: { value: 0 },
                uDark: { value: isDark ? 1 : 0 },
                uAspect: { value: 1 },
                uRipple: { value: 99 },
                uMouse: { value: new THREE.Vector2(0.5, 0.5) },
                uRipplePos: { value: new THREE.Vector2(0.5, 0.5) },
                uColorA: { value: new THREE.Color(pal.a) },
                uColorB: { value: new THREE.Color(pal.b) },
                uColorC: { value: new THREE.Color(pal.c) },
            },
        });
    }, [isDark]);

    useFrame(({ clock }, delta) => {
        const u = material.uniforms;
        u.uTime.value = clock.getElapsedTime();
        u.uAspect.value = size.width / size.height;
        u.uScroll.value = scroll.current;
        // ease the cursor toward its target for a fluid trail
        mouse.current.x += (mouse.current.tx - mouse.current.x) * 0.06;
        mouse.current.y += (mouse.current.ty - mouse.current.y) * 0.06;
        (u.uMouse.value as THREE.Vector2).set(mouse.current.x, mouse.current.y);
        // advance the click ripple until it fully fades
        if (click.current.active) {
            click.current.age += delta;
            (u.uRipplePos.value as THREE.Vector2).set(click.current.x, click.current.y);
            u.uRipple.value = click.current.age;
            if (click.current.age > 2.5) click.current.active = false;
        }
    });

    return (
        <mesh scale={[viewport.width, viewport.height, 1]} material={material}>
            <planeGeometry args={[1, 1]} />
        </mesh>
    );
}

/** 30fps demand loop that stops when the tab is hidden (mirrors ParticleField). */
function FrameBudget() {
    const invalidate = useThree((s) => s.invalidate);
    useEffect(() => {
        const interval = 1000 / TARGET_FPS;
        let rafId = 0;
        let last = 0;
        const tick = (time: number) => {
            rafId = requestAnimationFrame(tick);
            if (time - last < interval) return;
            last = time;
            invalidate();
        };
        const start = () => {
            if (!rafId) rafId = requestAnimationFrame(tick);
        };
        const stop = () => {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = 0;
        };
        const onVisibility = () => (document.hidden ? stop() : start());
        start();
        document.addEventListener("visibilitychange", onVisibility);
        return () => {
            stop();
            document.removeEventListener("visibilitychange", onVisibility);
        };
    }, [invalidate]);
    return null;
}

export default function ShaderField({ isDark }: { isDark: boolean }) {
    // cursor target (tx,ty) from a global listener; eased to (x,y) in useFrame.
    const mouse = useRef({ x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 });
    const click = useRef({ x: 0.5, y: 0.5, age: 0, active: false });
    const scroll = useRef(0);
    const { scrollYProgress } = useScroll();

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            mouse.current.tx = e.clientX / window.innerWidth;
            mouse.current.ty = 1 - e.clientY / window.innerHeight;
        };
        const onDown = (e: MouseEvent) => {
            click.current.x = e.clientX / window.innerWidth;
            click.current.y = 1 - e.clientY / window.innerHeight;
            click.current.age = 0;
            click.current.active = true;
        };
        window.addEventListener("mousemove", onMove, { passive: true });
        window.addEventListener("mousedown", onDown, { passive: true });
        const unsub = scrollYProgress.on("change", (v) => (scroll.current = v));
        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mousedown", onDown);
            unsub();
        };
    }, [scrollYProgress]);

    return (
        <Canvas
            dpr={[1, 1.5]}
            frameloop="demand"
            gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
            style={{ position: "absolute", inset: 0 }}
        >
            <FrameBudget />
            <Plane isDark={isDark} mouse={mouse} scroll={scroll} click={click} />
        </Canvas>
    );
}
