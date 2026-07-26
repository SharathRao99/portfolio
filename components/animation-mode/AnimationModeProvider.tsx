"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

/**
 * A deliberately tiny sibling to next-themes for *animation* mode.
 *
 *  - "default"  → the existing aurora + code-constellation background
 *  - "avengers" → an SVG hero background whose emblems react on scroll
 *
 * Mode is persisted to localStorage under STORAGE_KEY and mirrored onto
 * <html data-anim="…"> so CSS can react without JS, and so the inline script
 * in app/layout.tsx can restore it *before* hydration (no flash, same trick
 * next-themes uses for the theme class).
 *
 * The heavy Avengers layer is loaded lazily only when this reports "avengers"
 * (see BackgroundAnimation.tsx), so default-mode visitors never download it and
 * the Lighthouse baseline is untouched.
 */

export type AnimationMode = "default" | "avengers";

export const ANIM_STORAGE_KEY = "portfolio-anim-mode";
export const ANIM_MODES: AnimationMode[] = ["default", "avengers"];

function isMode(value: unknown): value is AnimationMode {
    return value === "default" || value === "avengers";
}

type AnimationModeContextValue = {
    /** null until mounted, to stay SSR-safe (mirrors ThemeSwitch's mounted guard) */
    mode: AnimationMode | null;
    setMode: (mode: AnimationMode) => void;
    toggle: () => void;
};

const AnimationModeContext = createContext<AnimationModeContextValue | null>(null);

/** Read the mode the inline script already resolved onto <html>, else fall back. */
function readInitialMode(): AnimationMode {
    if (typeof document !== "undefined") {
        const attr = document.documentElement.dataset.anim;
        if (isMode(attr)) return attr;
    }
    return "default";
}

export function AnimationModeProvider({ children }: { children: React.ReactNode }) {
    const [mode, setModeState] = useState<AnimationMode | null>(null);

    // Resolve on mount from what the pre-hydration script already applied.
    useEffect(() => {
        setModeState(readInitialMode());
    }, []);

    const setMode = useCallback((next: AnimationMode) => {
        setModeState(next);
        document.documentElement.dataset.anim = next;
        try {
            localStorage.setItem(ANIM_STORAGE_KEY, next);
        } catch {
            // private mode / storage disabled — the attribute still drives the UI
        }
    }, []);

    const toggle = useCallback(() => {
        setMode(readInitialMode() === "avengers" ? "default" : "avengers");
    }, [setMode]);

    // Keep multiple tabs in sync.
    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === ANIM_STORAGE_KEY && isMode(e.newValue)) {
                setModeState(e.newValue);
                document.documentElement.dataset.anim = e.newValue;
            }
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    const value = useMemo<AnimationModeContextValue>(
        () => ({ mode, setMode, toggle }),
        [mode, setMode, toggle]
    );

    return (
        <AnimationModeContext.Provider value={value}>
            {children}
        </AnimationModeContext.Provider>
    );
}

export function useAnimationMode() {
    const ctx = useContext(AnimationModeContext);
    if (!ctx) {
        throw new Error("useAnimationMode must be used within AnimationModeProvider");
    }
    return ctx;
}

/**
 * Inline script string, run before hydration in <head>/<body> to restore the
 * saved mode onto <html data-anim> so the correct background mounts first paint.
 * Kept dependency-free and self-contained on purpose.
 */
export const animModeScript = `(function(){try{var m=localStorage.getItem('${ANIM_STORAGE_KEY}');if(m!=='avengers')m='default';document.documentElement.setAttribute('data-anim',m);}catch(e){document.documentElement.setAttribute('data-anim','default');}})();`;
