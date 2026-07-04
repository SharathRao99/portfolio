"use client";
import { motion } from "framer-motion";

/**
 * Staggered word-by-word reveal. Each word rises out of an
 * overflow-hidden mask — only transform/opacity are animated.
 */
export default function RevealText({
    text,
    as: Tag = "span",
    className = "",
    delay = 0,
    stagger = 0.045,
    once = true,
}: {
    text: string;
    as?: React.ElementType;
    className?: string;
    delay?: number;
    stagger?: number;
    once?: boolean;
}) {
    const words = text.split(" ");
    // parameterized ElementType keeps children typing intact even when
    // libraries (e.g. R3F) augment the global JSX namespace
    const Component = Tag as React.ElementType<{
        className?: string;
        children?: React.ReactNode;
    }>;
    return (
        <Component className={className}>
            <span className="sr-only">{text}</span>
            <motion.span
                aria-hidden
                initial="hidden"
                whileInView="visible"
                viewport={{ once, amount: 0.6 }}
                transition={{ staggerChildren: stagger, delayChildren: delay }}
                className="inline"
            >
                {words.map((word, i) => (
                    <span key={i} className="inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom">
                        <motion.span
                            className="inline-block will-change-transform"
                            variants={{
                                hidden: { y: "115%", rotate: 4, opacity: 0 },
                                visible: {
                                    y: "0%",
                                    rotate: 0,
                                    opacity: 1,
                                    transition: { type: "spring", stiffness: 260, damping: 30 },
                                },
                            }}
                        >
                            {word}
                        </motion.span>
                        {i < words.length - 1 && <span className="inline-block">&nbsp;</span>}
                    </span>
                ))}
            </motion.span>
        </Component>
    );
}
