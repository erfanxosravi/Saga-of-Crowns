import { useEffect, useRef } from 'react';
import { Season } from '../types/game';

interface SeasonalWeatherOverlayProps {
  season: Season;
  enabled: boolean;
}

interface WeatherParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  length: number;
  alpha: number;
  phase: number;
}

/**
 * Full-viewport non-interactive seasonal weather overlay rendered above the main UI:
 * - Winter: Swaying Nordic snowfall of varying depth + subtle icy frost top wash
 * - Autumn: Wind-driven diagonal North Sea rain streaks + storm-slate top wash
 * - Spring: Drifting coastal thaw mist & light drizzle droplets
 * - Summer: Gentle golden sun-motes carried on fair sea breezes
 */
export function SeasonalWeatherOverlay({ season, enabled }: SeasonalWeatherOverlayProps) {
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

    const count =
      season === Season.Winter
        ? Math.min(52, Math.max(24, Math.floor(width / 28)))
        : season === Season.Autumn
          ? Math.min(58, Math.max(28, Math.floor(width / 24)))
          : season === Season.Spring
            ? Math.min(28, Math.max(14, Math.floor(width / 46)))
            : Math.min(18, Math.max(10, Math.floor(width / 64)));

    const spawnParticle = (initialRandomY: boolean): WeatherParticle => {
      if (season === Season.Winter) {
        const depth = Math.random();
        return {
          x: Math.random() * width,
          y: initialRandomY ? Math.random() * height : -12,
          vx: 0.22 + depth * 0.45,
          vy: 0.55 + depth * 1.15,
          size: 1.0 + depth * 1.9,
          length: 0,
          alpha: 0.07 + depth * 0.14,
          phase: Math.random() * Math.PI * 2,
        };
      }
      if (season === Season.Autumn) {
        const speed = 7.0 + Math.random() * 5.0;
        return {
          x: Math.random() * (width + 180) - 90,
          y: initialRandomY ? Math.random() * height : -28,
          vx: -2.0 - Math.random() * 1.0,
          vy: speed,
          size: 0.9 + Math.random() * 0.5,
          length: 12 + Math.random() * 12,
          alpha: 0.06 + Math.random() * 0.1,
          phase: Math.random() * Math.PI * 2,
        };
      }
      if (season === Season.Spring) {
        const isMistPuff = Math.random() < 0.35;
        return {
          x: Math.random() * width,
          y: initialRandomY ? Math.random() * height : -16,
          vx: 0.4 + Math.random() * 0.45,
          vy: isMistPuff ? 0.16 + Math.random() * 0.22 : 3.1 + Math.random() * 2.0,
          size: isMistPuff ? 18 + Math.random() * 24 : 0.95,
          length: isMistPuff ? 0 : 7 + Math.random() * 5,
          alpha: isMistPuff ? 0.018 + Math.random() * 0.018 : 0.05 + Math.random() * 0.08,
          phase: Math.random() * Math.PI * 2,
        };
      }
      // Summer fair-wind golden motes
      return {
        x: Math.random() * width,
        y: initialRandomY ? Math.random() * height : Math.random() * height,
        vx: 0.26 + Math.random() * 0.38,
        vy: -0.1 + (Math.random() - 0.5) * 0.2,
        size: 1.0 + Math.random() * 1.2,
        length: 0,
        alpha: 0.04 + Math.random() * 0.08,
        phase: Math.random() * Math.PI * 2,
      };
    };

    const particles: WeatherParticle[] = Array.from({ length: count }, () =>
      spawnParticle(true)
    );

    let tick = 0;
    const render = () => {
      tick += 0.016;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (season === Season.Winter) {
          p.x += p.vx + Math.sin(tick * 1.3 + p.phase) * 0.48;
          p.y += p.vy;

          if (p.y > height + 10 || p.x > width + 14 || p.x < -14) {
            particles[i] = spawnParticle(false);
            if (p.x > width + 14) particles[i].x = -8;
            continue;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(226, 238, 252, ${p.alpha.toFixed(3)})`;
          ctx.fill();
        } else if (season === Season.Autumn) {
          p.x += p.vx;
          p.y += p.vy;

          if (p.y > height + 30 || p.x < -60) {
            particles[i] = spawnParticle(false);
            continue;
          }

          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.vx * 1.6, p.y + p.length);
          ctx.strokeStyle = `rgba(155, 192, 232, ${p.alpha.toFixed(3)})`;
          ctx.lineWidth = p.size;
          ctx.lineCap = 'round';
          ctx.stroke();
        } else if (season === Season.Spring) {
          p.x += p.vx;
          p.y += p.vy;

          if (p.y > height + 36 || p.x > width + 36) {
            particles[i] = spawnParticle(false);
            continue;
          }

          if (p.length === 0) {
            // Soft coastal mist orb
            const grad = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, p.size);
            grad.addColorStop(0, `rgba(205, 222, 235, ${p.alpha.toFixed(3)})`);
            grad.addColorStop(1, 'rgba(205, 222, 235, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + p.vx * 1.1, p.y + p.length);
            ctx.strokeStyle = `rgba(182, 212, 236, ${p.alpha.toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        } else {
          // Summer breeze motes
          p.x += p.vx;
          p.y += p.vy + Math.sin(tick + p.phase) * 0.15;

          if (p.x > width + 10) p.x = -10;
          if (p.y < -10) p.y = height + 10;
          if (p.y > height + 10) p.y = -10;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 204, 128, ${p.alpha.toFixed(3)})`;
          ctx.fill();
        }
      }

      animId = window.requestAnimationFrame(render);
    };

    animId = window.requestAnimationFrame(render);
    return () => {
      window.cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [season, enabled]);

  if (!enabled) return null;

  const topAtmosphereClass =
    season === Season.Winter
      ? 'from-sky-200/[0.045] via-sky-300/[0.015] to-transparent'
      : season === Season.Autumn
        ? 'from-slate-400/[0.045] via-slate-500/[0.015] to-transparent'
        : season === Season.Spring
          ? 'from-teal-200/[0.03] via-transparent to-transparent'
          : 'from-amber-400/[0.025] via-transparent to-transparent';

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className={`absolute inset-x-0 top-0 h-28 bg-gradient-to-b ${topAtmosphereClass}`} />
      <canvas ref={canvasRef} className="w-full h-full block opacity-80" />
    </div>
  );
}
