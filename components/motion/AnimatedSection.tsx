"use client";
import { motion } from "framer-motion";

/**
 * Section entrance: rises with a blur-to-focus settle instead of a flat fade.
 * Blur only animates during the one-shot entrance, then the element is static.
 */
export default function AnimatedSection({
    children,
    className = "",
    delay = 0,
    id,
}: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    id?: string;
}) {
    return (
        <motion.section
            id={id}
            initial={{ opacity: 0, y: 48, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ type: "spring", stiffness: 90, damping: 22, delay }}
            viewport={{ once: true, amount: 0.15 }}
            className={className}
        >
            {children}
        </motion.section>
    );
}
