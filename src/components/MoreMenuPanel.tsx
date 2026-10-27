import {
  BookOpen,
  ChevronRight,
  Crown,
  HelpCircle,
  Save,
  Ship,
  Trophy,
} from 'lucide-react';
import { getClaimableNextTitle } from '../engine/gameEngine';
import { SHORT_TITLE_LABELS } from '../i18n/ui';
import { FullGameState, TabId } from '../types/game';

interface MoreMenuPanelProps {
  state: FullGameState;
  onNavigateTab: (tab: TabId) => void;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
}

export function MoreMenuPanel({
  state,
  onNavigateTab,
  onOpenSettings,
  onOpenGuide,
}: MoreMenuPanelProps) {
  const lang = state.settings.language;
  const isFa = lang === 'fa';
  const claimable = getClaimableNextTitle(state);
  const r = state.realm;

  return (
    <div className="space-y-3 text-start">
      <p className="px-1 text-xs text-[#94A3B8]">
        {isFa
          ? 'مدیریت املاک، کشتی‌ها و ساخت‌وساز کاملاً اختیاری است؛ هر زمان هوس قدرت بیشتر کردید سر بزنید!'
          : 'Estate, fleet, and chronicle management are 100% optional — dip in whenever you want deeper control.'}
      </p>

      {/* 1. Realm, Fleet & Buildings */}
      <button
        type="button"
        onClick={() => onNavigateTab(TabId.Realm)}
        className="w-full min-h-[64px] px-4 py-3.5 rounded-xl bg-[#131D2B] border border-[#233246] hover:border-[#F59E0B] flex items-center justify-between gap-3 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3 text-start min-w-0">
          <div className="w-10 h-10 rounded-lg bg-[#1A2738] flex items-center justify-center text-[#F59E0B] shrink-0">
            <Crown className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[#F1F5F9] flex items-center gap-2">
              <span className="truncate">
                {isFa ? 'قلمرو، کشتی‌ها و ساختمان‌ها' : 'Realm, Fleet & Buildings'}
              </span>
              {claimable && (
                <span className="text-[11px] font-bold text-[#F59E0B] shrink-0">
                  {isFa
                    ? `· ارتقا به ${SHORT_TITLE_LABELS.fa[claimable]}!`
                    : `· Rank Up: ${SHORT_TITLE_LABELS.en[claimable]}!`}
                </span>
              )}
            </div>
            <div className="text-xs text-[#94A3B8] font-mono tabular-nums truncate mt-0.5">
              {isFa
                ? `${r.landFarms} مزرعه · ${r.longships + r.knarrs} کشتی · ${r.hirdWarriors} جنگجو`
                : `${r.landFarms} Farms · ${r.longships + r.knarrs} Ships · ${r.hirdWarriors} Warriors`}
            </div>
          </div>
        </div>
        <ChevronRight
          className={`w-4 h-4 text-[#94A3B8] shrink-0 ${isFa ? 'rotate-180' : ''}`}
        />
      </button>

      {/* 2. Dynasty Hall & Achievements */}
      <button
        type="button"
        onClick={() => onNavigateTab(TabId.Saga)}
        className="w-full min-h-[64px] px-4 py-3.5 rounded-xl bg-[#131D2B] border border-[#233246] hover:border-[#38BDF8] flex items-center justify-between gap-3 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3 text-start min-w-0">
          <div className="w-10 h-10 rounded-lg bg-[#1A2738] flex items-center justify-center text-[#38BDF8] shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[#F1F5F9] truncate">
              {isFa ? 'دستاوردها، چالش‌ها و شجره‌نامه' : 'Achievements, Challenges & Dynasty'}
            </div>
            <div className="text-xs text-[#94A3B8] font-mono tabular-nums truncate mt-0.5">
              {isFa
                ? `نسل ${state.generation} · ${state.achievements.length} دستاورد بازشده · شهرت ${r.fame}`
                : `Gen ${state.generation} · ${state.achievements.length} Unlocked · ${r.fame} Fame`}
            </div>
          </div>
        </div>
        <ChevronRight
          className={`w-4 h-4 text-[#94A3B8] shrink-0 ${isFa ? 'rotate-180' : ''}`}
        />
      </button>

      {/* 3. Sea Chart Shortcut */}
      <button
        type="button"
        onClick={() => onNavigateTab(TabId.Map)}
        className="w-full min-h-[60px] px-4 py-3 rounded-xl bg-[#131D2B] border border-[#233246] hover:border-[#38BDF8] flex items-center justify-between gap-3 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3 text-start min-w-0">
          <div className="w-10 h-10 rounded-lg bg-[#1A2738] flex items-center justify-center text-[#38BDF8] shrink-0">
            <Ship className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[#F1F5F9] truncate">
              {isFa ? 'نقشه دریاهای شمال و بنادر' : 'Northern Sea Chart & Ports'}
            </div>
            <div className="text-xs text-[#94A3B8] truncate mt-0.5">
              {isFa
                ? `${state.discoveredSettlements.length} بندر کشف‌شده · زوم و سفر دریایی`
                : `${state.discoveredSettlements.length} ports known · Zoom, pan & sail`}
            </div>
          </div>
        </div>
        <ChevronRight
          className={`w-4 h-4 text-[#94A3B8] shrink-0 ${isFa ? 'rotate-180' : ''}`}
        />
      </button>

      {/* 4. Save Slots & Settings */}
      <button
        type="button"
        onClick={onOpenSettings}
        className="w-full min-h-[60px] px-4 py-3 rounded-xl bg-[#131D2B] border border-[#233246] hover:border-[#F59E0B] flex items-center justify-between gap-3 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3 text-start min-w-0">
          <div className="w-10 h-10 rounded-lg bg-[#1A2738] flex items-center justify-center text-[#94A3B8] shrink-0">
            <Save className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[#F1F5F9] truncate">
              {isFa ? 'ذخیره بازی، کد خروجی و تنظیمات' : 'Save Slots, Export & Settings'}
            </div>
            <div className="text-xs text-[#94A3B8] truncate mt-0.5">
              {isFa
                ? '۳ جایگاه ذخیره، تغییر زبان، صدا و حالت خشونت ملایم'
                : '3 save slots, language, soundscape & mild mode'}
            </div>
          </div>
        </div>
        <ChevronRight
          className={`w-4 h-4 text-[#94A3B8] shrink-0 ${isFa ? 'rotate-180' : ''}`}
        />
      </button>

      {/* 5. Quick Guide & Glossary */}
      <button
        type="button"
        onClick={onOpenGuide}
        className="w-full min-h-[60px] px-4 py-3 rounded-xl bg-[#131D2B] border border-[#233246] hover:border-[#38BDF8] flex items-center justify-between gap-3 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3 text-start min-w-0">
          <div className="w-10 h-10 rounded-lg bg-[#1A2738] flex items-center justify-center text-[#94A3B8] shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[#F1F5F9] truncate flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
              <span>{isFa ? 'راهنمای سریع و واژه‌نامه وایکینگی' : 'Quick Guide & Viking Glossary'}</span>
            </div>
            <div className="text-xs text-[#94A3B8] truncate mt-0.5">
              {isFa
                ? 'آشنایی سریع با قوانین زندگی، غارت و جانشینی'
                : 'Fast overview of life choices, raids & heirs'}
            </div>
          </div>
        </div>
        <ChevronRight
          className={`w-4 h-4 text-[#94A3B8] shrink-0 ${isFa ? 'rotate-180' : ''}`}
        />
      </button>
    </div>
  );
}
