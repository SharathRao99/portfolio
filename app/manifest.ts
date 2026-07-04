import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Sharath B C — Full Stack Developer",
        short_name: "Sharath B C",
        description:
            "Portfolio of Sharath B C, a Full-Stack Developer building scalable web and mobile applications.",
        start_url: "/",
        display: "standalone",
        background_color: "#05060d",
        theme_color: "#05060d",
        icons: [{ src: "/icon.png", sizes: "any", type: "image/png" }],
    };
}
