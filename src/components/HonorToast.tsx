import { useEffect, useState } from 'react';
import { Crown, Shield, ShieldAlert, ShieldOff } from 'lucide-react';
import { isRtl } from '../i18n/ui';
import { Language } from '../types/game';

export const SIGNIFICANT_HONOR_DELTA = 5;

export interface HonorToastPayload {
  id: number;
  delta: number;
  currentHonor: number;
}

interface HonorToastProps {
  toast: HonorToastPayload | null;
  lang: Language;
  onDismiss: () => void;
}

function getHonorStatusCopy(delta: number, currentHonor: number, lang: Language): {
  title: string;
  subtitle: string;
} {
  const isFa = lang === 'fa';

  if (delta >= 12) {
    return {
      title: isFa ? 'آوازه‌ی افتخار در آبدره‌ها' : 'Renown Across the Fjords',
      subtitle:
        currentHonor >= 85
          ? isFa
            ? 'نامت افسانه‌ای شد'
            : 'Legendary standing achieved'
          : isFa
            ? 'اسکالدها نامت را می‌ستایند'
            : 'Skalds praise your name',
    };
  }

  if (delta > 0) {
    return {
      title: isFa ? 'افزایش شرافت' : 'Honor Gained',
      subtitle:
        currentHonor >= 85
          ? isFa
            ? 'جایگاه افسانه‌ای در تالار'
            : 'Revered across the hall'
          : isFa
            ? 'جایگاهت در تالار بالاتر رفت'
            : 'Your standing in the hall rises',
    };
  }

  if (delta <= -12) {
    return {
      title: isFa ? 'لکه‌ی ننگ سنگین' : 'Deep Dishonor',
      subtitle:
        currentHonor <= 15
          ? isFa
            ? 'در آستانه‌ی طرد شدن'
            : 'Near outcast standing'
          : isFa
            ? 'زمزمه‌ی رسوایی در تالار پیچید'
            : 'Whispers of shame spread',
    };
  }

  return {
    title: isFa ? 'کاهش شرافت' : 'Honor Stained',
    subtitle:
      currentHonor <= 15
        ? isFa
          ? 'در آستانه‌ی بی‌اعتباری کامل'
          : 'Standing dangerously low'
        : isFa
          ? 'اعتبارت نزد جنگجویان آسیب دید'
          : 'Your word carries less weight',
  };
}

export function HonorToast({ toast, lang, onDismiss }: HonorToastProps) {
  const [renderedToast, setRenderedToast] = useState<HonorToastPayload | null>(toast);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    if (!toast) {
      setIsVisible(false);
      const cleanupTimer = window.setTimeout(() => {
        setRenderedToast(null);
      }, 280);
      return () => window.clearTimeout(cleanupTimer);
    }

    setRenderedToast(toast);

    const enterFrame = window.requestAnimationFrame(() => {
      setIsVisible(true);
    });

    const autoHideTimer = window.setTimeout(() => {
      setIsVisible(false);
    }, 2900);

    const clearTimer = window.setTimeout(() => {
      onDismiss();
    }, 3200);

    return () => {
      window.cancelAnimationFrame(enterFrame);
      window.clearTimeout(autoHideTimer);
      window.clearTimeout(clearTimer);
    };
  }, [toast, onDismiss]);

  if (!renderedToast) return null;

  const rtl = isRtl(lang);
  const isFa = lang === 'fa';
  const isGain = renderedToast.delta > 0;
  const isMajor = Math.abs(renderedToast.delta) >= 12;
  const { title, subtitle } = getHonorStatusCopy(
    renderedToast.delta,
    renderedToast.currentHonor,
    lang
  );
  const signedDelta =
    renderedToast.delta > 0 ? `+${renderedToast.delta}` : `${renderedToast.delta}`;

  const handleManualClose = () => {
    setIsVisible(false);
    window.setTimeout(() => {
      onDismiss();
    }, 220);
  };

  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      role="status"
      aria-live="polite"
      className="fixed top-16 sm:top-18 inset-x-0 z-60 flex justify-center px-3 pointer-events-none"
    >
      <button
        type="button"
        onClick={handleManualClose}
        aria-label={isFa ? 'بستن اعلان شرافت' : 'Dismiss honor notification'}
        className={`pointer-events-auto w-auto max-w-[calc(100vw-1.5rem)] sm:max-w-md min-w-[230px] sm:min-w-[290px] min-h-[48px] px-3.5 py-2.5 rounded-xl bg-[#0F1722]/95 backdrop-blur-md border flex items-center gap-3 cursor-pointer transition-all duration-300 ease-out motion-reduce:transition-none motion-reduce:translate-y-0 ${
          isGain
            ? 'border-[#F59E0B]/45 shadow-[0_10px_28px_rgba(0,0,0,0.65),0_0_20px_rgba(245,158,11,0.14)] hover:border-[#F59E0B]/70'
            : 'border-[#EF4444]/45 shadow-[0_10px_28px_rgba(0,0,0,0.65),0_0_20px_rgba(239,68,68,0.14)] hover:border-[#EF4444]/70'
        } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
      >
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            isGain ? 'bg-[#F59E0B]/15 text-[#FBBF24]' : 'bg-[#EF4444]/15 text-[#F87171]'
          }`}
        >
          {isGain ? (
            isMajor ? (
              <Crown className="w-4 h-4" />
            ) : (
              <Shield className="w-4 h-4" />
            )
          ) : isMajor ? (
            <ShieldOff className="w-4 h-4" />
          ) : (
            <ShieldAlert className="w-4 h-4" />
          )}
        </div>

        <div className="min-w-0 flex-1 text-start">
          <div className="font-saga text-sm font-bold text-[#F1F5F9] leading-tight truncate">
            {title}
          </div>
          <div className="text-[11px] text-[#94A3B8] leading-snug truncate mt-0.5">
            {subtitle} ·{' '}
            <span className="font-mono tabular-nums text-[#CBD5E1]">
              {isFa ? `شرافت ${renderedToast.currentHonor}` : `Honor ${renderedToast.currentHonor}`}
            </span>
          </div>
        </div>

        <div className="shrink-0 ps-1.5">
          <span
            dir="ltr"
            className={`font-mono tabular-nums text-sm sm:text-base font-extrabold ${
              isGain ? 'text-[#FBBF24]' : 'text-[#F87171]'
            }`}
          >
            {signedDelta}
          </span>
        </div>
      </button>
    </div>
  );
}
