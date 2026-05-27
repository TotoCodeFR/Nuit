import { useEffect, useRef } from "react";
import useDocumentTitle from "../hooks/useDocumentTitle";
import "./Homepage.css";

export default function Home() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useDocumentTitle("Nuit");

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d")!;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const onResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", onResize);

        type Star = {
            x: number;
            y: number;
            size: number;
            baseSpeed: number;
            opacity: number;
            twinkle: number;
        };

        const createStar = (): Star => ({
            x: Math.random() * canvas.width,
            y: -Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            baseSpeed: Math.random() * 0.7 + 0.3,
            opacity: Math.random() * 0.5 + 0.5,
            twinkle: Math.random() * 0.05,
        });

        const stars: Star[] = Array.from({ length: 25 }, createStar);

        let speedMultiplier = 20;
        let easingTriggered = false;
        let easingStartTime: number | null = null;
        const easeDuration = 3000;
        let rafId: number;

        const easeOutExpo = (t: number) =>
            t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (easingTriggered && easingStartTime) {
                const elapsed = Date.now() - easingStartTime;
                const t = Math.min(elapsed / easeDuration, 1);
                speedMultiplier = 1 + (20 - 1) * (1 - easeOutExpo(t));
            }

            for (const star of stars) {
                star.opacity += (Math.random() - 0.75) * star.twinkle;
                star.opacity = Math.max(0.2, Math.min(star.opacity, 1));

                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
                ctx.fill();

                star.y += star.baseSpeed * speedMultiplier;

                if (!easingTriggered && star.y >= canvas.height) {
                    easingTriggered = true;
                    easingStartTime = Date.now();
                }

                if (star.y > canvas.height + star.size) {
                    Object.assign(star, createStar());
                    star.y = -star.size;
                }
            }

            rafId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener("resize", onResize);
            cancelAnimationFrame(rafId);
        };
    }, []);

    return (
        <main className="home">
            <canvas ref={canvasRef} className="star-canvas" />
            <div className="hero">
                <div className="tags">
                    <span className="tag tag-foss">
                        Free and Open Source Software
                    </span>
                    <span className="tag tag-selfhost">Self-hostable</span>
                    <span className="tag tag-license">AGPL-3.0 License</span>
                </div>
                <h1 className="hero-primary">
                    A Discord bot that
                    <br />
                    works <span className="italic">your</span> way, not{" "}
                    <span className="through">theirs</span>.
                </h1>
                <p className="hero-desc">
                    Nuit is a fully customizable, self-hostable Discord bot. No
                    locked features, no paid services, just your server and your
                    rules.
                </p>
                <div className="hero-buttons">
                    <a
                        href="/login"
                        className="btn-hero primary"
                    >
                        Login to Discord
                    </a>
                    <a
                        href="https://github.com/Nuit-Bot/Nuit#production"
                        className="btn-hero secondary"
                        target="_blank"
                        rel="noreferrer"
                    >
                        {" "}
                        Self-host yours
                    </a>
                </div>
            </div>
        </main>
    );
}
