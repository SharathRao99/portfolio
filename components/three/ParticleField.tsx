"use client";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * "Code constellation" background — a quiet network of connected nodes
 * (the systems I build) with a few drifting code glyphs (the language I
 * build them in). Deliberately understated: the whole scene is one
 * slowly-rotating group with eased cursor parallax; connections are
 * computed once, so per-frame cost is a couple of transforms.
 */

const PALETTE_DARK = ["#22d3ee", "#818cf8", "#e879f9", "#38bdf8"];
const PALETTE_LIGHT = ["#0891b2", "#4f46e5", "#c026d3", "#0284c7"];

const NODE_COUNT = 110;
const LINK_DISTANCE = 3.1;

function Constellation({ isDark }: { isDark: boolean }) {
    const group = useRef<THREE.Group>(null);

    const { positions, colors, linePositions } = useMemo(() => {
        const positions = new Float32Array(NODE_COUNT * 3);
        const colors = new Float32Array(NODE_COUNT * 3);
        const palette = (isDark ? PALETTE_DARK : PALETTE_LIGHT).map(
            (c) => new THREE.Color(c)
        );
        for (let i = 0; i < NODE_COUNT; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 30;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
            const color = palette[i % palette.length];
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        // connect close pairs once — the group moves rigidly afterwards
        const segments: number[] = [];
        for (let i = 0; i < NODE_COUNT; i++) {
            for (let j = i + 1; j < NODE_COUNT; j++) {
                const dx = positions[i * 3] - positions[j * 3];
                const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
                const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
                if (Math.sqrt(dx * dx + dy * dy + dz * dz) < LINK_DISTANCE) {
                    segments.push(
                        positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
                        positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
                    );
                }
            }
        }
        return { positions, colors, linePositions: new Float32Array(segments) };
    }, [isDark]);

    useFrame(({ clock, pointer }) => {
        const g = group.current;
        if (!g) return;
        const t = clock.getElapsedTime();
        g.rotation.y = t * 0.012;
        g.position.y = Math.sin(t * 0.1) * 0.4;
        // eased cursor parallax, kept gentle
        g.rotation.x += (pointer.y * 0.05 - g.rotation.x) * 0.02;
        g.rotation.z += (pointer.x * 0.03 - g.rotation.z) * 0.02;
    });

    return (
        <group ref={group} position={[0, 0, -9]}>
            <points>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                    <bufferAttribute attach="attributes-color" args={[colors, 3]} />
                </bufferGeometry>
                <pointsMaterial
                    vertexColors
                    size={0.09}
                    sizeAttenuation
                    transparent
                    opacity={isDark ? 0.55 : 0.4}
                    depthWrite={false}
                />
            </points>
            <lineSegments>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
                </bufferGeometry>
                <lineBasicMaterial
                    color={isDark ? "#818cf8" : "#4f46e5"}
                    transparent
                    opacity={isDark ? 0.08 : 0.06}
                    depthWrite={false}
                />
            </lineSegments>
        </group>
    );
}

/* ---------- floating code glyphs ---------- */

const GLYPHS = ["</>", "{ }", "=>", "()", "npm i", "git push", "<div>", "async"];

function makeTextTexture(text: string): THREE.CanvasTexture {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext("2d")!;
    ctx.font = "600 44px ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(text, 128, 64);
    return new THREE.CanvasTexture(canvas);
}

function CodeGlyphs({ isDark }: { isDark: boolean }) {
    const group = useRef<THREE.Group>(null);

    const items = useMemo(() => {
        const palette = isDark ? PALETTE_DARK : PALETTE_LIGHT;
        return GLYPHS.map((glyph, i) => ({
            texture: makeTextTexture(glyph),
            x: (Math.random() - 0.5) * 26,
            y: (Math.random() - 0.5) * 13,
            z: -6 - Math.random() * 6,
            phase: Math.random() * Math.PI * 2,
            speed: 0.15 + Math.random() * 0.2,
            color: palette[i % palette.length],
        }));
    }, [isDark]);

    useFrame(({ clock }) => {
        const g = group.current;
        if (!g) return;
        const t = clock.getElapsedTime();
        g.children.forEach((sprite, i) => {
            const item = items[i];
            sprite.position.y = item.y + Math.sin(t * item.speed + item.phase) * 0.6;
            sprite.position.x = item.x + Math.cos(t * item.speed * 0.6 + item.phase) * 0.3;
        });
    });

    return (
        <group ref={group}>
            {items.map((item, i) => (
                <sprite key={i} position={[item.x, item.y, item.z]} scale={[2.2, 1.1, 1]}>
                    <spriteMaterial
                        map={item.texture}
                        color={item.color}
                        transparent
                        opacity={isDark ? 0.16 : 0.12}
                        depthWrite={false}
                    />
                </sprite>
            ))}
        </group>
    );
}

export default function ParticleField({ isDark }: { isDark: boolean }) {
    return (
        <Canvas
            camera={{ position: [0, 0, 9], fov: 55 }}
            dpr={[1, 1.5]}
            gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
            style={{ position: "absolute", inset: 0 }}
        >
            <Constellation isDark={isDark} />
            <CodeGlyphs isDark={isDark} />
        </Canvas>
    );
}
