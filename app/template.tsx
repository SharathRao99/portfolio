"use client";
import { motion } from "framer-motion";

/**
 * Remounts on every navigation, giving each page a cinematic settle
 * (rise + blur-to-focus) that matches the section entrance language.
 */
export default function Template({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ type: "spring", stiffness: 90, damping: 22 }}
        >
            {children}
        </motion.div>
    );
}
