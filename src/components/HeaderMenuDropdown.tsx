import { useEffect, useState } from 'react';
import {
  ChevronRight,
  CloudRain,
  Globe,
  HelpCircle,
  Settings,
  Ship,
  Snowflake,
  Sun,
  Swords,
  Volume2,
  VolumeX,
  Wind,
  X,
} from 'lucide-react';
import { formatYearLabel, isRtl, SEASON_LABELS } from '../i18n/ui';
import { Language, Season } from '../types/game';

interface HeaderMenuDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSetLanguage: (next: Language) => void;
  season: Season;
  weatherName: string;
  isMapActive: boolean;
  onSelectSeasonMap: () => void;
  isAudioOn: boolean;
  onToggleAudio: () => void;
  onOpenGuide: () => void;
  onOpenSettings: () => void;
  year: number;
  hirdWarriors: number;
  fleetShips: number;
}

function renderSeasonIcon(season: Season) {
  switch (season) {
    case Season.Winter:
      return <Snowflake className="w-4 h-4 text-[#38BDF8] shrink-0" />;
    case Season.Autumn:
      return <CloudRain className="w-4 h-4 text-[#94A3B8] shrink-0" />;
    case Season.Spring:
      return <Wind className="w-4 h-4 text-teal-300 shrink-0" />;
    case Season.Summer:
      return <Sun className="w-4 h-4 text-[#F59E0B] shrink-0" />;
  }
}

export function HeaderMenuDropdown({
  isOpen,
  onClose,
  lang,
  onSetLanguage,
  season,
  weatherName,
  isMapActive,
  onSelectSeasonMap,
  isAudioOn,
  onToggleAudio,
  onOpenGuide,
  onOpenSettings,
  year,
  hirdWarriors,
  fleetShips,
}: HeaderMenuDropdownProps) {
  const [shouldRender, setShouldRender] = useState<boolean>(isOpen);
  const [isAnimatedIn, setIsAnimatedIn] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const frame = window.requestAnimationFrame(() => {
        setIsAnimatedIn(true);
      });
      return () => window.cancelAnimationFrame(frame);
    }

    setIsAnimatedIn(false);
    const timer = window.setTimeout(() => {
      setShouldRender(false);
    }, 200);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!shouldRender) return null;

  const isFa = lang === 'fa';
  const rtl = isRtl(lang);

  const rowBaseClass =
    'group w-full min-h-[52px] px-2.5 py-2 rounded-xl flex items-center justify-between gap-3 text-start transition-all duration-200 ease-out motion-reduce:transition-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]/70';

  const iconTileBaseClass =
    'w-8 h-8 rounded-lg bg-[#142030] border border-[#22344D] flex items-center justify-center shrink-0 transition-all duration-200 ease-out motion-reduce:transition-none motion-reduce:transform-none group-hover:scale-105';

  const chevronClass = `w-4 h-4 text-[#64748B] group-hover:text-[#F1F5F9] shrink-0 transition-all duration-200 ease-out motion-reduce:transition-none motion-reduce:transform-none ${
    rtl ? 'rotate-180 group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5'
  }`;

  return (
    <>
      {/* Smooth Fading Click-Outside Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-30 bg-[#05080D]/55 backdrop-blur-[1px] transition-opacity duration-200 ease-out motion-reduce:transition-none ${
          isAnimatedIn ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      <div
        id="header-menu-dropdown"
        dir={rtl ? 'rtl' : 'ltr'}
        role="dialog"
        aria-modal="false"
        aria-label={isFa ? 'منوی سریع بازی' : 'Quick Game Menu'}
        className={`absolute top-full end-2.5 sm:end-5 mt-1.5 z-50 w-[calc(100vw-1.25rem)] max-w-[332px] max-h-[calc(100dvh-5rem)] overflow-y-auto rounded-2xl bg-[#0D1520]/98 backdrop-blur-md border border-[#26384F] shadow-[0_20px_48px_rgba(0,0,0,0.86)] transition-all duration-200 ease-out motion-reduce:transition-none ${
          isAnimatedIn
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 -translate-y-1.5 scale-[0.98] pointer-events-none'
        }`}
      >
        {/* Top Saga Status Strip + Close Button */}
        <div className="px-3.5 py-1.5 border-b border-[#1E2D40] flex items-center justify-between gap-2 bg-[#121C2B]/85">
          <div className="flex items-center gap-2.5 text-[11px] font-mono tabular-nums text-[#94A3B8] min-w-0 flex-wrap">
            <span className="text-[#F1F5F9] font-semibold">{formatYearLabel(year, lang)}</span>
            <span aria-hidden="true" className="text-[#475569]">
              ·
            </span>
            <span
              className="inline-flex items-center gap-1"
              title={isFa ? 'جنگجویان تالار' : 'Household Warriors'}
            >
              <Swords className="w-3.5 h-3.5 text-[#EF4444] shrink-0" />
              <span className="text-[#F1F5F9]">{hirdWarriors}</span>
            </span>
            <span aria-hidden="true" className="text-[#475569]">
              ·
            </span>
            <span
              className="inline-flex items-center gap-1"
              title={isFa ? 'مجموع کشتی‌ها' : 'Fleet Ships'}
            >
              <Ship className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
              <span className="text-[#F1F5F9]">{fleetShips}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={isFa ? 'بستن منو' : 'Close menu'}
            className="min-w-[44px] min-h-[44px] -me-2 rounded-xl flex items-center justify-center text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#19283B] transition-colors shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]/70"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Grouped Menu Categories */}
        <div className="p-2">
          {/* Category 1: Game Controls (Season/Sea Chart & Saga Guide) */}
          <div
            role="group"
            aria-label={isFa ? 'کنترل‌ها و راهنمای بازی' : 'Game Controls'}
            className="space-y-0.5"
          >
            <div className="px-2.5 pt-0.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#64748B] select-none">
              {isFa ? 'کنترل‌ها و راهنما' : 'Game Controls'}
            </div>

            {/* 1. Season & Sea Weather */}
            <button
              type="button"
              onClick={() => {
                onSelectSeasonMap();
                onClose();
              }}
              className={`${rowBaseClass} ${
                isMapActive
                  ? 'bg-[#17283D] text-[#38BDF8]'
                  : 'hover:bg-[#152233]/90 active:bg-[#1A2A3F] text-[#F1F5F9]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className={`${iconTileBaseClass} ${
                    isMapActive
                      ? 'border-[#38BDF8]/60 bg-[#182E46]'
                      : 'group-hover:border-[#38BDF8]/50 group-hover:bg-[#17283D]'
                  }`}
                >
                  {renderSeasonIcon(season)}
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className={`text-xs font-semibold leading-tight truncate transition-colors ${
                      isMapActive ? 'text-[#38BDF8]' : 'text-[#F1F5F9] group-hover:text-white'
                    }`}
                  >
                    {isFa ? 'فصل و وضعیت دریا' : 'Season & Sea Chart'}
                  </div>
                  <div className="text-[11px] text-[#94A3B8] truncate mt-0.5">
                    {SEASON_LABELS[lang][season]} · {weatherName}
                  </div>
                </div>
              </div>
              <ChevronRight className={chevronClass} />
            </button>

            {/* 2. Quick Saga Guide */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenGuide();
              }}
              className={`${rowBaseClass} hover:bg-[#152233]/90 active:bg-[#1A2A3F]`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className={`${iconTileBaseClass} group-hover:border-[#38BDF8]/50 group-hover:bg-[#17283D]`}
                >
                  <HelpCircle className="w-4 h-4 text-[#38BDF8] shrink-0" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-[#F1F5F9] group-hover:text-white leading-tight truncate transition-colors">
                    {isFa ? 'راهنمای بازی و واژه‌نامه' : 'Saga Guide & Glossary'}
                  </div>
                  <div className="text-[11px] text-[#94A3B8] truncate mt-0.5">
                    {isFa ? 'قوانین، القاب و مفاهیم نورس' : 'Rules, ranks & Norse lore'}
                  </div>
                </div>
              </div>
              <ChevronRight className={chevronClass} />
            </button>
          </div>

          <hr className="border-t border-[#1E2D40] my-2" />

          {/* Category 2: Settings, Audio & Language */}
          <div
            role="group"
            aria-label={isFa ? 'تنظیمات و زبان' : 'Settings & Language'}
            className="space-y-0.5"
          >
            <div className="px-2.5 pt-0.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#64748B] select-none">
              {isFa ? 'تنظیمات و زبان' : 'Settings & Language'}
            </div>

            {/* 3. Language Switcher */}
            <div className="group min-h-[54px] px-2.5 py-1.5 rounded-xl hover:bg-[#152233]/85 flex items-center justify-between gap-3 transition-all duration-200 ease-out motion-reduce:transition-none">
              <div className="flex items-center gap-3 min-w-0 flex-1 text-start">
                <div
                  className={`${iconTileBaseClass} group-hover:border-[#F59E0B]/50 group-hover:bg-[#1B283B]`}
                >
                  <Globe className="w-4 h-4 text-[#F59E0B] shrink-0" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-[#F1F5F9] group-hover:text-white leading-tight truncate transition-colors">
                    {isFa ? 'زبان بازی' : 'Language'}
                  </div>
                  <div className="text-[11px] text-[#94A3B8] truncate mt-0.5">
                    {isFa ? 'فارسی / English' : 'English / فارسی'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#090F17] border border-[#223247] shrink-0">
                <button
                  type="button"
                  onClick={() => onSetLanguage('fa')}
                  className={`min-h-[44px] min-w-[54px] px-2.5 rounded-md text-xs font-bold transition-all duration-150 motion-reduce:transition-none cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]/70 ${
                    lang === 'fa'
                      ? 'bg-[#F59E0B] text-[#0B1118] shadow-[0_2px_8px_rgba(245,158,11,0.28)]'
                      : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#131F2E]'
                  }`}
                >
                  فارسی
                </button>
                <button
                  type="button"
                  onClick={() => onSetLanguage('en')}
                  className={`min-h-[44px] min-w-[54px] px-2.5 rounded-md text-xs font-bold transition-all duration-150 motion-reduce:transition-none cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]/70 ${
                    lang === 'en'
                      ? 'bg-[#F59E0B] text-[#0B1118] shadow-[0_2px_8px_rgba(245,158,11,0.28)]'
                      : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#131F2E]'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* 4. Sound & Ambience Toggle */}
            <button
              type="button"
              role="switch"
              aria-checked={isAudioOn}
              onClick={onToggleAudio}
              className={`${rowBaseClass} hover:bg-[#152233]/90 active:bg-[#1A2A3F]`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className={`${iconTileBaseClass} ${
                    isAudioOn
                      ? 'group-hover:border-[#38BDF8]/55 group-hover:bg-[#16293E]'
                      : 'group-hover:border-[#475569] group-hover:bg-[#182434]'
                  }`}
                >
                  {isAudioOn ? (
                    <Volume2 className="w-4 h-4 text-[#38BDF8] shrink-0" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-[#94A3B8] shrink-0" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-[#F1F5F9] group-hover:text-white leading-tight truncate transition-colors">
                    {isFa ? 'صدای بازی و محیط' : 'Sound & Ambience'}
                  </div>
                  <div className="text-[11px] text-[#94A3B8] truncate mt-0.5">
                    {isAudioOn
                      ? isFa
                        ? 'موسیقی محیطی و افکت‌ها فعال'
                        : 'Viking ambience & SFX active'
                      : isFa
                        ? 'تمامی صداها بی‌صدا شده'
                        : 'All game audio muted'}
                  </div>
                </div>
              </div>

              <span
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide border shrink-0 transition-colors duration-200 ${
                  isAudioOn
                    ? 'bg-[#F59E0B]/15 border-[#F59E0B]/45 text-[#FBBF24]'
                    : 'bg-[#0B1118] border-[#223247] text-[#94A3B8] group-hover:text-[#CBD5E1]'
                }`}
              >
                {isAudioOn ? (isFa ? 'روشن' : 'On') : isFa ? 'خاموش' : 'Off'}
              </span>
            </button>

            {/* 5. Save Slots & Full Settings */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className={`${rowBaseClass} hover:bg-[#152233]/90 active:bg-[#1A2A3F]`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className={`${iconTileBaseClass} group-hover:border-[#F59E0B]/55 group-hover:bg-[#1D2838]`}
                >
                  <Settings className="w-4 h-4 text-[#F59E0B] shrink-0 transition-transform duration-300 ease-out motion-reduce:transition-none motion-reduce:transform-none group-hover:rotate-45" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-[#F1F5F9] group-hover:text-white leading-tight truncate transition-colors">
                    {isFa ? 'ذخیره بازی و تنظیمات کامل' : 'Save Slots & Settings'}
                  </div>
                  <div className="text-[11px] text-[#94A3B8] truncate mt-0.5">
                    {isFa
                      ? 'جایگاه‌های ذخیره، سختی و نمایش'
                      : 'Manage saves, difficulty & display'}
                  </div>
                </div>
              </div>
              <ChevronRight className={chevronClass} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
