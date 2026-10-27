import { useEffect, useRef } from 'react';
import {
  Coins,
  Crown,
  Flame,
  Heart,
  Scale,
  Shield,
  Ship,
  Smile,
  Sparkles,
  Swords,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import { CATEGORY_LABELS, formatAgeLabel, formatYearLabel } from '../i18n/ui';
import { Language, LogEntry } from '../types/game';
import { EventCategoryIcon, resolveEventIconType } from './EventCategoryIcon';

interface LifeFeedProps {
  entries: LogEntry[];
  lang: Language;
  onboardingStep?: number;
  onboardingDismissed?: boolean;
  onDismissOnboarding?: () => void;
}

type DeltaTone = 'pos' | 'neg' | 'neutral';

function classifyDeltaTone(deltaText: string): DeltaTone {
  const trimmed = deltaText.trim();
  if (
    /(?:^|\s)-\d/.test(trimmed) ||
    trimmed.startsWith('-') ||
    trimmed.startsWith('Scar:') ||
    trimmed.startsWith('جراحت:') ||
    trimmed.includes('Outlaw') ||
    trimmed.includes('طرد') ||
    trimmed.includes('Gale') ||
    trimmed.includes('Storm') ||
    trimmed.includes('کولاک') ||
    trimmed.includes('طوفان')
  ) {
    return 'neg';
  }
  if (
    trimmed.includes('+') ||
    trimmed.includes('Cleared') ||
    trimmed.includes('رفع') ||
    trimmed.includes('Rank:') ||
    trimmed.includes('مقام') ||
    trimmed.includes('Married') ||
    trimmed.includes('ازدواج') ||
    trimmed.includes('Child') ||
    trimmed.includes('فرزند')
  ) {
    return 'pos';
  }
  return 'neutral';
}

function renderDeltaChipIcon(deltaText: string, tone: DeltaTone) {
  const lower = deltaText.toLowerCase();

  if (
    lower.includes('silver') ||
    lower.includes('loot') ||
    lower.includes('wealth') ||
    deltaText.includes('نقره') ||
    deltaText.includes('سکه') ||
    deltaText.includes('غنائم')
  ) {
    return <Coins className="w-3.5 h-3.5 shrink-0" />;
  }

  if (
    lower.includes('health') ||
    lower.includes('scar') ||
    lower.includes('wound') ||
    deltaText.includes('سلامتی') ||
    deltaText.includes('جراحت') ||
    deltaText.includes('زخم')
  ) {
    return <Heart className="w-3.5 h-3.5 shrink-0" />;
  }

  if (
    lower.includes('honor') ||
    lower.includes('fame') ||
    lower.includes('renown') ||
    deltaText.includes('شرافت') ||
    deltaText.includes('آبرو') ||
    deltaText.includes('شهرت')
  ) {
    return <Shield className="w-3.5 h-3.5 shrink-0" />;
  }

  if (
    lower.includes('strength') ||
    lower.includes('power') ||
    lower.includes('combat') ||
    lower.includes('warrior') ||
    lower.includes('hird') ||
    deltaText.includes('قدرت') ||
    deltaText.includes('رزم') ||
    deltaText.includes('شمشیر') ||
    deltaText.includes('جنگجو')
  ) {
    return <Swords className="w-3.5 h-3.5 shrink-0" />;
  }

  if (
    lower.includes('joy') ||
    lower.includes('happiness') ||
    deltaText.includes('شادی') ||
    deltaText.includes('روحیه')
  ) {
    return <Smile className="w-3.5 h-3.5 shrink-0" />;
  }

  if (
    lower.includes('law') ||
    lower.includes('diplomacy') ||
    lower.includes('cunning') ||
    deltaText.includes('قانون') ||
    deltaText.includes('سیاست') ||
    deltaText.includes('مذاکره') ||
    deltaText.includes('ذکاوت')
  ) {
    return <Scale className="w-3.5 h-3.5 shrink-0" />;
  }

  if (
    lower.includes('sail') ||
    lower.includes('ship') ||
    lower.includes('knarr') ||
    deltaText.includes('دریانوردی') ||
    deltaText.includes('کشتی') ||
    deltaText.includes('ناوگان')
  ) {
    return <Ship className="w-3.5 h-3.5 shrink-0" />;
  }

  if (
    lower.includes('faith') ||
    lower.includes('wyrd') ||
    lower.includes('mystic') ||
    deltaText.includes('ایمان') ||
    deltaText.includes('تقدیر') ||
    deltaText.includes('ویرد') ||
    deltaText.includes('جادو')
  ) {
    return <Flame className="w-3.5 h-3.5 shrink-0" />;
  }

  if (
    lower.includes('rank') ||
    lower.includes('married') ||
    lower.includes('child') ||
    deltaText.includes('مقام') ||
    deltaText.includes('ازدواج') ||
    deltaText.includes('فرزند')
  ) {
    return <Crown className="w-3.5 h-3.5 shrink-0" />;
  }

  if (tone === 'pos') return <TrendingUp className="w-3.5 h-3.5 shrink-0" />;
  if (tone === 'neg') return <TrendingDown className="w-3.5 h-3.5 shrink-0" />;
  return <Sparkles className="w-3.5 h-3.5 shrink-0" />;
}

function getCategoryChipClasses(entry: LogEntry): string {
  if (entry.isDivergence) {
    return 'bg-sky-500/15 border-sky-400/35 text-sky-300';
  }
  if (entry.category === 'Succession') {
    return 'bg-amber-500/14 border-amber-400/35 text-amber-200';
  }
  if (entry.category === 'Chronicle') {
    return 'bg-slate-400/12 border-slate-400/25 text-slate-300';
  }

  const iconKind = resolveEventIconType(entry.category, entry.iconType, entry.isDanger);
  switch (iconKind) {
    case 'sword':
      return 'bg-rose-500/14 border-rose-400/30 text-rose-300';
    case 'skull':
      return 'bg-red-500/16 border-red-400/35 text-red-300';
    case 'ship':
      return 'bg-sky-500/14 border-sky-400/30 text-sky-300';
    case 'heart':
      return 'bg-pink-500/14 border-pink-400/30 text-pink-300';
    case 'family':
      return 'bg-emerald-500/14 border-emerald-400/30 text-emerald-300';
    case 'religion':
      return 'bg-violet-500/14 border-violet-400/30 text-violet-300';
    case 'coin':
      return 'bg-teal-500/14 border-teal-400/30 text-teal-300';
    case 'crown':
    default:
      return 'bg-indigo-400/14 border-indigo-400/30 text-indigo-200';
  }
}

const ONBOARDING_HINTS: Record<Language, { title: string; body: string }[]> = {
  en: [
    {
      title: 'Year 1 Tip · Just Tap "Next Year"',
      body: 'Live one year at a time! Each year brings a quick event with risk and cost hints right on the choices.',
    },
    {
      title: 'Year 2 Tip · Quick Yearly Activities',
      body: 'Want extra silver, combat training, or a raid? Open "Activities" below — each button works once per year.',
    },
    {
      title: 'Year 3 Tip · Heirs Keep Your Saga Alive',
      body: 'Watch your 4 stat bars below. Marry in "Kin" so when you die, you continue as your child in one click!',
    },
  ],
  fa: [
    {
      title: 'نکته سال اول · فقط دکمه «سال بعد» رو بزن!',
      body: 'زندگی سال‌به‌سال جلو می‌ره! هر سال یه اتفاق سریع برات میفته و ریسک و هزینه هر انتخاب رو همون‌جا می‌بینی.',
    },
    {
      title: 'نکته سال دوم · فعالیت‌های سبک سالانه',
      body: 'هوس پول بیشتر، تمرین شمشیرزنی یا غارت کردی؟ از پایین برو تو «فعالیت‌ها»؛ هر کدوم سالی یک‌بار قابل استفاده‌ست.',
    },
    {
      title: 'نکته سال سوم · با وارثت ادامه بده!',
      body: 'حواست به ۴ نوار پایین باشه. تو تب «خاندان» ازدواج کن تا بعد از مرگ، فقط با یک کلیک جای بچه‌ت بازی رو ادامه بدی!',
    },
  ],
};

export function LifeFeed({
  entries,
  lang,
  onboardingStep = 3,
  onboardingDismissed = true,
  onDismissOnboarding,
}: LifeFeedProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const isFa = lang === 'fa';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [entries.length]);

  const showOnboarding = !onboardingDismissed && onboardingStep < 3;
  const activeHint = ONBOARDING_HINTS[lang][Math.max(0, Math.min(2, onboardingStep))];

  return (
    <div className="space-y-3 pb-2 text-start">
      {showOnboarding && activeHint && (
        <div className="p-4 rounded-xl bg-[#132134] border border-[#38BDF8]/40 flex items-start justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-2.5 min-w-0">
            <Sparkles className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-bold text-[#38BDF8] leading-snug">
                {activeHint.title}
              </div>
              <p className="text-xs sm:text-sm text-[#E2E8F0] leading-relaxed mt-1">
                {activeHint.body}
              </p>
            </div>
          </div>
          {onDismissOnboarding && (
            <button
              type="button"
              onClick={onDismissOnboarding}
              className="min-h-[44px] px-3.5 rounded-xl bg-[#0B1118]/90 hover:bg-[#0B1118] border border-[#24354C] text-xs font-semibold text-[#CBD5E1] hover:text-[#F8FAFC] inline-flex items-center gap-1.5 shrink-0 cursor-pointer whitespace-nowrap transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>{isFa ? 'رد کردن' : 'Skip'}</span>
            </button>
          )}
        </div>
      )}

      {entries.map((entry, idx) => {
        const isLatest = idx === entries.length - 1;
        const isSuccession = entry.category === 'Succession';
        const isChronicle = entry.category === 'Chronicle';
        const displayTitle = isFa ? entry.titleFa ?? entry.title : entry.title;
        const displayText = isFa ? entry.textFa ?? entry.text : entry.text;
        const categoryLabel = CATEGORY_LABELS[lang][entry.category];
        const cardDeltas =
          (isFa ? entry.deltasFa ?? entry.deltas : entry.deltas)?.filter(Boolean) ?? [];
        const categoryChipClass = getCategoryChipClasses(entry);

        const surfaceClasses = entry.isDanger
          ? isLatest
            ? 'bg-[#221218] border-rose-500/60 shadow-[0_8px_24px_rgba(0,0,0,0.42)]'
            : 'bg-[#171014] border-[#4A1D24] opacity-80 hover:opacity-100'
          : isSuccession
            ? isLatest
              ? 'bg-[#1E1911] border-amber-400/55 shadow-[0_8px_24px_rgba(0,0,0,0.42)]'
              : 'bg-[#16140F] border-[#523E1A] opacity-80 hover:opacity-100'
            : isChronicle
              ? isLatest
                ? 'bg-[#142032] border-[#38BDF8]/45 shadow-[0_8px_24px_rgba(0,0,0,0.38)]'
                : 'bg-[#0F1824] border-[#1A2738] opacity-80 hover:opacity-100'
              : isLatest
                ? 'bg-[#162438] border-[#38BDF8]/55 shadow-[0_8px_24px_rgba(0,0,0,0.38)]'
                : 'bg-[#101926] border-[#1C2A3D] opacity-80 hover:opacity-100';

        return (
          <article
            key={`${entry.id}_${idx}`}
            className={`p-4 rounded-xl border transition-all duration-200 ${surfaceClasses}`}
          >
            {/* Meta Row: Age Badge + Muted Neutral Year + Colored Category Chip with Icon */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-[#1B2B40] border border-[#2C425E] text-xs font-semibold font-mono tabular-nums text-[#F1F5F9] whitespace-nowrap">
                  {formatAgeLabel(entry.age, lang)}
                </span>
                <span className="text-xs font-mono tabular-nums text-[#8A9BB0] whitespace-nowrap">
                  {formatYearLabel(entry.year, lang)}
                </span>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-medium leading-snug max-w-full ${categoryChipClass}`}
              >
                {entry.isDivergence ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span className="whitespace-normal break-words">
                      {isFa ? 'تغییر تاریخ' : 'Alt-History'}
                    </span>
                  </>
                ) : (
                  <>
                    <EventCategoryIcon
                      category={entry.category}
                      iconType={entry.iconType}
                      isDanger={entry.isDanger}
                      inheritColor
                      className="w-3.5 h-3.5"
                    />
                    <span className="whitespace-normal break-words">{categoryLabel}</span>
                  </>
                )}
              </span>
            </div>

            {/* Dedicated Event Title Line (Bold, never truncated with '…', wraps cleanly) */}
            {displayTitle && (
              <h3
                className={`mt-2.5 font-saga text-base sm:text-lg font-bold leading-snug whitespace-normal break-words ${
                  isLatest ? 'text-[#F8FAFC]' : 'text-[#E2E8F0]'
                }`}
              >
                {displayTitle}
              </h3>
            )}

            {/* Event Prose */}
            <p
              className={`${displayTitle ? 'mt-1.5' : 'mt-2.5'} font-saga text-base sm:text-lg leading-relaxed ${
                isLatest ? 'text-[#F1F5F9]' : 'text-[#CBD5E1]'
              }`}
            >
              {displayText}
            </p>

            {/* Stat Changes as Tinted Pill Chips with Icon */}
            {cardDeltas.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-white/8 flex flex-wrap items-center gap-2">
                {cardDeltas.map((d, dIdx) => {
                  const tone = classifyDeltaTone(d);
                  const chipColorClass =
                    tone === 'pos'
                      ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300'
                      : tone === 'neg'
                        ? 'bg-rose-500/15 border-rose-400/30 text-rose-300'
                        : 'bg-sky-500/12 border-sky-400/25 text-sky-200';

                  return (
                    <span
                      key={dIdx}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs sm:text-[13px] font-semibold font-mono tabular-nums leading-snug ${chipColorClass}`}
                    >
                      {renderDeltaChipIcon(d, tone)}
                      <span className="whitespace-normal break-words">{d}</span>
                    </span>
                  );
                })}
              </div>
            )}
          </article>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
}
