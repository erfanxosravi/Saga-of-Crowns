import { ReactNode, useEffect, useRef, useState } from 'react';
import { Language } from '../types/game';

export type StatAccent = 'health' | 'honor' | 'strength' | 'happiness' | 'icy';

interface StatBarProps {
  label: string;
  value: number;
  max?: number;
  compact?: boolean;
  isDangerWhenLow?: boolean;
  lowThreshold?: number;
  accent?: StatAccent;
  icon?: ReactNode;
  lang?: Language;
}

export function StatBar({
  label,
  value,
  max = 100,
  compact = false,
  isDangerWhenLow = false,
  lowThreshold = 30,
  accent = 'icy',
  icon,
  lang = 'en',
}: StatBarProps) {
  const clamped = Math.max(0, Math.min(max, Math.round(value)));
  const ratio = Math.max(0, Math.min(1, clamped / max));
  const isLow = isDangerWhenLow && clamped < lowThreshold;
  const isCritical = isDangerWhenLow && clamped <= 15;

  const prevRef = useRef<number>(clamped);
  const [deltaFlash, setDeltaFlash] = useState<number>(0);

  useEffect(() => {
    const diff = clamped - prevRef.current;
    prevRef.current = clamped;
    if (diff !== 0) {
      setDeltaFlash(diff);
      const timer = window.setTimeout(() => setDeltaFlash(0), 1400);
      return () => window.clearTimeout(timer);
    }
  }, [clamped]);

  const barFillClass =
    deltaFlash > 0
      ? 'fill-emerald-400'
      : deltaFlash < 0 || isCritical
        ? 'fill-red-500'
        : isLow
          ? 'fill-rose-500'
          : accent === 'health'
            ? 'fill-emerald-400'
            : accent === 'honor'
              ? 'fill-amber-300'
              : accent === 'strength'
                ? 'fill-indigo-400'
                : 'fill-sky-400';

  const iconToneClass = isLow
    ? 'text-rose-400'
    : accent === 'health'
      ? 'text-emerald-400'
      : accent === 'honor'
        ? 'text-amber-300'
        : accent === 'strength'
          ? 'text-indigo-300'
          : 'text-sky-400';

  const isRtl = lang === 'fa';
  const pctWidth = Math.round(ratio * 100);

  return (
    <div className={compact ? 'space-y-1.5' : 'space-y-2'}>
      <div className="flex items-center justify-between gap-1.5 text-xs leading-tight">
        <span className="inline-flex items-center gap-1.5 min-w-0">
          {icon && <span className={`shrink-0 flex items-center ${iconToneClass}`}>{icon}</span>}
          <span
            className={`font-semibold truncate ${isLow ? 'text-rose-200' : 'text-[#E2E8F0]'}`}
          >
            {label}
          </span>
        </span>

        <span className="inline-flex items-center gap-1 font-mono text-xs tabular-nums shrink-0">
          {deltaFlash !== 0 && (
            <span
              className={`text-xs font-bold transition-opacity duration-300 ${
                deltaFlash > 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {deltaFlash > 0 ? `+${deltaFlash}` : deltaFlash}
            </span>
          )}
          <span
            className={
              isLow
                ? 'text-rose-400 font-bold'
                : deltaFlash > 0
                  ? 'text-emerald-300 font-semibold'
                  : deltaFlash < 0
                    ? 'text-rose-300 font-semibold'
                    : 'text-[#CBD5E1] font-medium'
            }
          >
            {clamped}
          </span>
        </span>
      </div>

      <div
        className={`w-full ${compact ? 'h-[7px]' : 'h-2'} rounded-full overflow-hidden ring-1 ring-inset ${
          isLow ? 'bg-rose-950/65 ring-rose-500/35' : 'bg-[#1A2738] ring-white/6'
        }`}
      >
        <svg
          viewBox="0 0 100 8"
          preserveAspectRatio="none"
          className="w-full h-full block"
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label}
        >
          <rect
            x={isRtl ? 100 - pctWidth : 0}
            y="0"
            width={pctWidth}
            height="8"
            className={`transition-all duration-500 ease-out ${barFillClass}`}
          />
        </svg>
      </div>
    </div>
  );
}
