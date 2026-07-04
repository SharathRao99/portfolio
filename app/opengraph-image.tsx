import { ImageResponse } from "next/og";

export const alt = "Sharath B C — Full Stack Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: "80px",
                    background: "#05060d",
                    position: "relative",
                    fontFamily: "sans-serif",
                }}
            >
                {/* aurora accents */}
                <div
                    style={{
                        position: "absolute",
                        top: "-200px",
                        left: "-100px",
                        width: "600px",
                        height: "600px",
                        borderRadius: "50%",
                        background:
                            "radial-gradient(circle, rgba(34,211,238,0.28), transparent 65%)",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        bottom: "-250px",
                        right: "-100px",
                        width: "700px",
                        height: "700px",
                        borderRadius: "50%",
                        background:
                            "radial-gradient(circle, rgba(232,121,249,0.22), transparent 65%)",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        top: "150px",
                        right: "200px",
                        width: "500px",
                        height: "500px",
                        borderRadius: "50%",
                        background:
                            "radial-gradient(circle, rgba(129,140,248,0.25), transparent 65%)",
                    }}
                />

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        color: "#969ab8",
                        fontSize: "26px",
                        letterSpacing: "8px",
                        textTransform: "uppercase",
                    }}
                >
                    Full Stack Developer
                </div>
                <div
                    style={{
                        marginTop: "24px",
                        fontSize: "110px",
                        fontWeight: 700,
                        color: "#eef0f8",
                        letterSpacing: "-3px",
                    }}
                >
                    Sharath B C
                </div>
                <div
                    style={{
                        marginTop: "16px",
                        fontSize: "44px",
                        fontWeight: 600,
                        backgroundImage:
                            "linear-gradient(90deg, #22d3ee, #818cf8, #e879f9)",
                        backgroundClip: "text",
                        color: "transparent",
                    }}
                >
                    builds digital products.
                </div>
                <div
                    style={{
                        marginTop: "48px",
                        display: "flex",
                        gap: "16px",
                        fontSize: "24px",
                        color: "#969ab8",
                    }}
                >
                    React.js · Next.js · Node.js · React Native · TypeScript
                </div>
            </div>
        ),
        { ...size }
    );
}
