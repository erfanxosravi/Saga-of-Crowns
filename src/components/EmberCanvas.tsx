import { useEffect, useRef } from 'react';

interface EmberCanvasProps {
  enabled: boolean;
}

interface EmberParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  warmth: number;
}

export function EmberCanvas({ enabled }: EmberCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const count = Math.min(34, Math.max(16, Math.floor(width / 55)));
    const particles: EmberParticle[] = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.28,
      vy: -(0.22 + Math.random() * 0.48),
      size: 1.0 + Math.random() * 1.9,
      alpha: Math.random() * 0.45,
      decay: 0.0012 + Math.random() * 0.002,
      warmth: Math.random(),
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.x += p.vx + Math.sin(p.y * 0.015) * 0.14;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0.02 || p.y < -10) {
          p.x = Math.random() * width;
          p.y = height + 8;
          p.alpha = 0.25 + Math.random() * 0.4;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle =
          p.warmth > 0.5
            ? `rgba(255, 140, 26, ${p.alpha.toFixed(3)})`
            : `rgba(255, 106, 0, ${p.alpha.toFixed(3)})`;
        ctx.fill();
      }
      animId = window.requestAnimationFrame(render);
    };

    animId = window.requestAnimationFrame(render);
    return () => {
      window.cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 opacity-60"
    />
  );
}
