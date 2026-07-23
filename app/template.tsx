/**
 * Remounts on every navigation, giving each page a cinematic settle
 * (rise + blur-to-focus) that matches the section entrance language.
 *
 * A CSS keyframe rather than framer-motion: this wraps every route, so as a
 * client component it pulled the animation library into the shell of every
 * page just to play a single one-shot transition.
 */
export default function Template({ children }: { children: React.ReactNode }) {
    return <div className="enter-page">{children}</div>;
}
