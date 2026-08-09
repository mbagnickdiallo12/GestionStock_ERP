"use client";

import React, { useEffect, useRef } from "react";

export const AnimatedTechBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Laser scan lines
    let scanY = 0;
    let scanY2 = height * 0.5;

    // Glowing inventory particles
    const particles = Array.from({ length: 35 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 1,
      speedY: - (Math.random() * 0.4 + 0.1),
      alpha: Math.random() * 0.7 + 0.3,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Moving Horizontal Scan Beam (Warehouse Stock Scanner)
      scanY = (scanY + 0.8) % height;
      scanY2 = (scanY2 + 1.2) % height;

      // Laser Scanner 1
      const grad1 = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 30);
      grad1.addColorStop(0, "rgba(16, 185, 129, 0)");
      grad1.addColorStop(0.5, "rgba(16, 185, 129, 0.25)");
      grad1.addColorStop(1, "rgba(16, 185, 129, 0)");
      ctx.fillStyle = grad1;
      ctx.fillRect(0, scanY - 30, width, 60);

      ctx.strokeStyle = "rgba(52, 211, 153, 0.7)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(width, scanY);
      ctx.stroke();

      // Laser Scanner 2
      const grad2 = ctx.createLinearGradient(0, scanY2 - 20, 0, scanY2 + 20);
      grad2.addColorStop(0, "rgba(245, 158, 11, 0)");
      grad2.addColorStop(0.5, "rgba(245, 158, 11, 0.15)");
      grad2.addColorStop(1, "rgba(245, 158, 11, 0)");
      ctx.fillStyle = grad2;
      ctx.fillRect(0, scanY2 - 20, width, 40);

      // 2. Render Dust/Pollen Floating Particles in Warehouse
      particles.forEach((p) => {
        p.y += p.speedY;
        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.shadowBlur = 8;
        ctx.shadowColor = "#10b981";
        ctx.fillStyle = `rgba(16, 185, 129, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* 3D Warehouse Illustration Image with Subtle Slow Motion Pan */}
      <div 
        className="absolute inset-0 bg-cover bg-center scale-105 animate-pulse duration-[8000ms] transition-transform"
        style={{ backgroundImage: `url('/images/warehouse_illustration.png')` }}
      />

      {/* Dark Vignette Overlay for Form Contrast on the Left Side */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-slate-950/30" />

      {/* Dynamic Laser Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block z-10 opacity-70" />

      {/* Floating Stock Pulse Indicators */}
      <div className="hidden lg:block absolute top-[30%] right-[32%] z-20">
        <div className="relative flex items-center gap-2 bg-[#0f172a]/90 backdrop-blur-md border border-emerald-500/40 px-3 py-1.5 rounded-full shadow-lg shadow-emerald-950/60 animate-bounce duration-[3500ms]">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[11px] font-extrabold text-white">Stock Dépôt Port: 14,500 Sacs (50kg)</span>
        </div>
      </div>

      <div className="hidden lg:block absolute bottom-[28%] right-[18%] z-20">
        <div className="relative flex items-center gap-2 bg-[#0f172a]/90 backdrop-blur-md border border-amber-500/40 px-3 py-1.5 rounded-full shadow-lg shadow-emerald-950/60">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[11px] font-extrabold text-white">Quai N°2: Arrivage Conteneur Riz Parfumé</span>
        </div>
      </div>
    </div>
  );
};
