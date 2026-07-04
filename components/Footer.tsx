"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import RevealText from "@/components/motion/RevealText";
import MagneticButton from "@/components/motion/MagneticButton";
import GhostWord from "@/components/motion/GhostWord";
import StatusBar from "@/components/StatusBar";
import { personalInfo } from "@/lib/data";

export default function Footer() {
    return (
        <footer className="relative mt-16 overflow-hidden border-t border-black/10 dark:border-white/10">
            {/* closing glow */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-64 opacity-70"
                style={{ background: "radial-gradient(ellipse 60% 100% at 50% 100%, var(--glow-2), transparent 70%)" }}
            />

            <GhostWord word="Contact" className="top-8" />

            <div className="container relative py-16 md:py-24">
                <div className="flex flex-col items-center gap-8 text-center">
                    <p className="eyebrow">Get in touch</p>
                    <RevealText
                        as="h2"
                        text="Let's build something together."
                        className="max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl"
                    />
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        <MagneticButton href={personalInfo.contactLink}>
                            {personalInfo.email}
                        </MagneticButton>
                    </motion.div>
                </div>

                <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-black/10 pt-8 dark:border-white/10 md:flex-row">
                    <h5 className="text-sm font-medium text-muted">Love to learn new things ❤️</h5>
                    <div className="flex items-center gap-3">
                        <SocialLink href={personalInfo.contactLink} label="Email">
                            <MailSvg className="h-5 w-5" />
                        </SocialLink>
                        <SocialLink href="https://www.linkedin.com/in/sharath-b-c-45ba01203" label="LinkedIn">
                            <LinkedInSvg className="h-5 w-5" />
                        </SocialLink>
                    </div>
                </div>
            </div>

            <StatusBar />
        </footer>
    );
}

function SocialLink({
    href,
    label,
    children,
}: {
    href: string;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <motion.div whileHover={{ scale: 1.15, rotate: 6 }} whileTap={{ scale: 0.92 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}>
            <Link
                href={href}
                target="_blank"
                aria-label={label}
                className="glass-light flex h-11 w-11 items-center justify-center rounded-full transition-shadow duration-300 hover:shadow-glow-sm"
            >
                {children}
            </Link>
        </motion.div>
    );
}

function MailSvg({ className }: { className: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={className}>
            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
        </svg>
    );
}

function LinkedInSvg({ className }: { className: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 448 512" className={className}>
            <path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.6 0 79.5 44.3 79.5 102.6V416z" />
        </svg>
    );
}
