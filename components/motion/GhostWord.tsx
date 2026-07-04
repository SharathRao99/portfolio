import ParallaxLayer from "@/components/motion/ParallaxLayer";

/**
 * Oversized outlined word floating behind a section heading.
 * Parent section must be `relative`; page-level overflow guards clip it.
 */
export default function GhostWord({
    word,
    className = "",
}: {
    word: string;
    className?: string;
}) {
    return (
        <div
            aria-hidden
            className={`pointer-events-none absolute inset-x-0 -top-6 -z-10 select-none overflow-hidden md:-top-10 ${className}`}
        >
            <ParallaxLayer speed={24}>
                <span className="text-outline block whitespace-nowrap text-[22vw] font-black uppercase leading-none tracking-tighter opacity-[0.05] dark:opacity-[0.07] md:text-[16vw]">
                    {word}
                </span>
            </ParallaxLayer>
        </div>
    );
}
