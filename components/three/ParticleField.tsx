"use client";
import { useEffect, useRef } from "react";

/**
 * "Code constellation" background — a quiet network of connected nodes
 * (the systems I build) with a few drifting code glyphs (the language I
 * build them in). Deliberately understated: the whole scene is one
 * slowly-rotating group with eased cursor parallax; connections are
 * computed once, so per-frame cost is a projection + a few hundred draw
 * calls on a plain 2D canvas — no WebGL context, no three.js/@react-three
 * bundle (that alone is ~215KB gzipped and was the dominant cost in
 * desktop bootup-time/TBT).
 */

const PALETTE_DARK = ["#22d3ee", "#818cf8", "#e879f9", "#38bdf8"];
const PALETTE_LIGHT = ["#0891b2", "#4f46e5", "#c026d3", "#0284c7"];

const NODE_COUNT = 110;
const LINK_DISTANCE = 3.1;
const GLYPHS = ["</>", "{ }", "=>", "()", "npm i", "git push", "<div>", "async"];

// mirrors the three.js scene's camera/group placement so the projected
// look matches the previous WebGL version
const CAMERA_Z = 9;
const GROUP_Z = -9;
const FOV_DEG = 55;

const TARGET_FPS = 30;

type RGB = [number, number, number];

function hexToRgb(hex: string): RGB {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

type Node = { x: number; y: number; z: number; color: RGB };
type Glyph = {
    text: string;
    x: number;
    y: number;
    z: number;
    phase: number;
    speed: number;
    color: RGB;
};

function buildScene(isDark: boolean) {
    const palette = (isDark ? PALETTE_DARK : PALETTE_LIGHT).map(hexToRgb);

    const nodes: Node[] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
        nodes.push({
            x: (Math.random() - 0.5) * 30,
            y: (Math.random() - 0.5) * 16,
            z: (Math.random() - 0.5) * 8,
            color: palette[i % palette.length],
        });
    }

    // connect close pairs once — the group moves rigidly afterwards
    const segments: [number, number][] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
        for (let j = i + 1; j < NODE_COUNT; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const dz = nodes[i].z - nodes[j].z;
            if (Math.sqrt(dx * dx + dy * dy + dz * dz) < LINK_DISTANCE) {
                segments.push([i, j]);
            }
        }
    }

    const glyphs: Glyph[] = GLYPHS.map((text, i) => ({
        text,
        x: (Math.random() - 0.5) * 26,
        y: (Math.random() - 0.5) * 13,
        z: -6 - Math.random() * 6,
        phase: Math.random() * Math.PI * 2,
        speed: 0.15 + Math.random() * 0.2,
        color: palette[i % palette.length],
    }));

    const lineColor = hexToRgb(isDark ? "#818cf8" : "#4f46e5");

    return { nodes, segments, glyphs, lineColor };
}

export default function ParticleField({ isDark }: { isDark: boolean }) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const pointer = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const { nodes, segments, glyphs, lineColor } = buildScene(isDark);
        const pointAlpha = isDark ? 0.55 : 0.4;
        const lineAlpha = isDark ? 0.08 : 0.06;
        const glyphAlpha = isDark ? 0.16 : 0.12;

        let width = 0;
        let height = 0;
        const resize = () => {
            const rect = canvas.parentElement?.getBoundingClientRect();
            width = Math.round(rect?.width ?? window.innerWidth);
            height = Math.round(rect?.height ?? window.innerHeight);
            // intentionally 1:1 with CSS pixels (no devicePixelRatio scaling) —
            // a soft, low-opacity haze gains nothing from a retina backing
            // store, and this more than halves fill work per frame
            canvas.width = width;
            canvas.height = height;
        };
        resize();
        window.addEventListener("resize", resize, { passive: true });

        const handlePointer = (e: PointerEvent) => {
            pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
        };
        window.addEventListener("pointermove", handlePointer, { passive: true });

        // eased cursor parallax + slow yaw, matching the previous
        // group.rotation.{x,y,z} / group.position.y behavior
        let rx = 0;
        let rz = 0;
        const start = performance.now();

        // projected per-node screen state, refreshed once per drawn frame
        const projX = new Float32Array(NODE_COUNT);
        const projY = new Float32Array(NODE_COUNT);
        const projSize = new Float32Array(NODE_COUNT);
        const projAlpha = new Float32Array(NODE_COUNT);

        const project = (
            lx: number,
            ly: number,
            lz: number,
            ry: number,
            rx_: number,
            rz_: number,
            tz: number,
            bobY: number,
            focal: number
        ) => {
            // pitch (X)
            let x = lx;
            let y = ly * Math.cos(rx_) - lz * Math.sin(rx_);
            let z = ly * Math.sin(rx_) + lz * Math.cos(rx_);
            // yaw (Y)
            const x2 = x * Math.cos(ry) + z * Math.sin(ry);
            const z2 = -x * Math.sin(ry) + z * Math.cos(ry);
            x = x2;
            z = z2;
            // roll (Z)
            const x3 = x * Math.cos(rz_) - y * Math.sin(rz_);
            const y3 = x * Math.sin(rz_) + y * Math.cos(rz_);
            x = x3;
            y = y3;

            const worldY = y + bobY;
            const worldZ = z + tz;
            const viewZ = CAMERA_Z - worldZ;
            const f = focal / viewZ;
            return { sx: width / 2 + x * f, sy: height / 2 - worldY * f, f };
        };

        let rafId = 0;
        let last = 0;
        const interval = 1000 / TARGET_FPS;

        const draw = (now: number) => {
            rafId = requestAnimationFrame(draw);
            if (now - last < interval) return;
            last = now;

            const t = (now - start) / 1000;
            const fovRad = (FOV_DEG * Math.PI) / 180;
            const focal = height / 2 / Math.tan(fovRad / 2);

            const yaw = t * 0.012;
            rx += (pointer.current.y * 0.05 - rx) * 0.04;
            rz += (pointer.current.x * 0.03 - rz) * 0.04;
            const bobY = Math.sin(t * 0.1) * 0.4;

            ctx.clearRect(0, 0, width, height);

            // nodes
            for (let i = 0; i < NODE_COUNT; i++) {
                const n = nodes[i];
                const { sx, sy, f } = project(n.x, n.y, n.z, yaw, rx, rz, GROUP_Z, bobY, focal);
                projX[i] = sx;
                projY[i] = sy;
                projSize[i] = Math.max(0.6, Math.min(3.2, 0.09 * f));
                projAlpha[i] = pointAlpha;
            }

            // connecting lines (drawn first, under the nodes)
            ctx.strokeStyle = `rgba(${lineColor[0]}, ${lineColor[1]}, ${lineColor[2]}, ${lineAlpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (const [a, b] of segments) {
                ctx.moveTo(projX[a], projY[a]);
                ctx.lineTo(projX[b], projY[b]);
            }
            ctx.stroke();

            // nodes
            for (let i = 0; i < NODE_COUNT; i++) {
                const c = nodes[i].color;
                ctx.fillStyle = `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${projAlpha[i]})`;
                ctx.beginPath();
                ctx.arc(projX[i], projY[i], projSize[i], 0, Math.PI * 2);
                ctx.fill();
            }

            // drifting code glyphs (no group rotation — direct camera-space drift)
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            for (const g of glyphs) {
                const gx = g.x + Math.cos(t * g.speed * 0.6 + g.phase) * 0.3;
                const gy = g.y + Math.sin(t * g.speed + g.phase) * 0.6;
                const viewZ = CAMERA_Z - g.z;
                const f = focal / viewZ;
                const sx = width / 2 + gx * f;
                const sy = height / 2 - gy * f;
                const fontSize = Math.max(9, Math.min(22, 0.42 * f));
                ctx.font = `600 ${fontSize}px ui-monospace, monospace`;
                ctx.fillStyle = `rgba(${g.color[0]}, ${g.color[1]}, ${g.color[2]}, ${glyphAlpha})`;
                ctx.fillText(g.text, sx, sy);
            }
        };

        const stop = () => {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = 0;
        };
        const onVisibility = () => (document.hidden ? stop() : (rafId ||= requestAnimationFrame(draw)));

        rafId = requestAnimationFrame(draw);
        document.addEventListener("visibilitychange", onVisibility);

        return () => {
            stop();
            window.removeEventListener("resize", resize);
            window.removeEventListener("pointermove", handlePointer);
            document.removeEventListener("visibilitychange", onVisibility);
        };
        // rebuild the whole scene (and restart the loop) on theme change,
        // matching the previous useMemo(..., [isDark]) behavior
    }, [isDark]);

    return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0 }} />;
}
