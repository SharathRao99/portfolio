"use client";
import { motion } from "framer-motion";

export default function SectionWrapper({ children }: { children: React.ReactNode }) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, amount: 0.2 }}
            className="py-6"
        >
            {children}
        </motion.section>
    );
}