"use client";

import { useEffect, useRef } from "react";

export function GridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const gridSize = 48;
      const cols = Math.ceil(canvas.width / gridSize) + 1;
      const rows = Math.ceil(canvas.height / gridSize) + 1;

      ctx.strokeStyle = "oklch(1 0 0 / 3.5%)";
      ctx.lineWidth = 1;
      for (let x = 0; x < cols; x++) {
        ctx.beginPath();
        ctx.moveTo(x * gridSize, 0);
        ctx.lineTo(x * gridSize, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < rows; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * gridSize);
        ctx.lineTo(canvas.width, y * gridSize);
        ctx.stroke();
      }

      for (let i = 0; i < 18; i++) {
        const x =
          ((Math.sin(t * 0.0003 + i * 1.1) * 0.5 + 0.5) * canvas.width * 1.2) -
          canvas.width * 0.1;
        const y =
          ((Math.cos(t * 0.0004 + i * 0.9) * 0.5 + 0.5) * canvas.height * 1.2) -
          canvas.height * 0.1;
        const alpha = (Math.sin(t * 0.001 + i) * 0.5 + 0.5) * 0.35 + 0.05;
        const r = Math.sin(t * 0.0008 + i * 0.7) * 1.5 + 2.5;

        const isBlue = i % 3 !== 2;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, r * 6);
        if (isBlue) {
          gradient.addColorStop(0, `oklch(0.62 0.22 240 / ${alpha})`);
          gradient.addColorStop(1, "transparent");
        } else {
          gradient.addColorStop(0, `oklch(0.55 0.18 280 / ${alpha})`);
          gradient.addColorStop(1, "transparent");
        }
        ctx.beginPath();
        ctx.arc(x, y, r * 6, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      t++;
      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none opacity-70 z-0"
    />
  );
}
