export default function Loading() {
    return (
        <div className="flex h-[calc(100vh-250px)] w-full items-center justify-center md:h-[calc(100vh-200px)]">
            <div className="relative h-12 w-12">
                <div className="absolute inset-0 animate-spin rounded-full bg-[conic-gradient(from_0deg,transparent_10%,rgb(var(--acc-cyan-400)),rgb(var(--acc-indigo-400)),rgb(var(--acc-fuchsia-400)))] [mask:radial-gradient(farthest-side,transparent_calc(100%-3px),black_calc(100%-3px))]" />
            </div>
        </div>
    );
}
