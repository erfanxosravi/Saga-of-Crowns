import { useState } from 'react';
import { Award, BookOpen, Check, Copy, Flame, GitBranch } from 'lucide-react';
import { BITLIFE_ACHIEVEMENTS } from '../data/deathsAndAchievements';
import { calculateLegacyScore } from '../engine/gameEngine';
import { formatDynastyName, formatPersonName } from '../i18n/gameDataFa';
import { SHORT_TITLE_LABELS } from '../i18n/ui';
import { FullGameState } from '../types/game';
import longhouseHearthUrl from '../assets/images/norse_longhouse_hearth_fire_1793047791880.jpg';

interface SagaChroniclePanelProps {
  state: FullGameState;
}

export function SagaChroniclePanel({ state }: SagaChroniclePanelProps) {
  const lang = state.settings.language;
  const isFa = lang === 'fa';
  const [subTab, setSubTab] = useState<'badges' | 'ancestors' | 'history'>('badges');
  const [imgFailed, setImgFailed] = useState(false);
  const [copiedSeed, setCopiedSeed] = useState(false);

  const legacyScore = calculateLegacyScore(state);

  const handleCopySeed = () => {
    navigator.clipboard?.writeText(state.seedString).catch(() => {});
    setCopiedSeed(true);
    setTimeout(() => setCopiedSeed(false), 1800);
  };

  const divergencesList = isFa
    ? state.divergencesFa && state.divergencesFa.length > 0
      ? state.divergencesFa
      : state.divergences
    : state.divergences;

  const unlockedCount = BITLIFE_ACHIEVEMENTS.filter((ach) => {
    const p = ach.getProgress(state);
    return state.achievements.includes(ach.id) || p.current >= p.target;
  }).length;

  return (
    <div className="space-y-4 text-start">
      {/* Compact Nordic Banner */}
      <div className="relative h-36 rounded-xl overflow-hidden border border-[#1E2D40] bg-[#0F1722]">
        {!imgFailed ? (
          <img
            src={longhouseHearthUrl}
            alt="Norse longhouse hearth"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover opacity-75"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#131D2B]">
            <Flame className="w-8 h-8 text-[#F59E0B]" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1118] via-[#0B1118]/60 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] font-mono text-[#38BDF8] truncate">
              {isFa
                ? `نسل ${state.generation} · کد دنیا ${state.seedString}`
                : `Gen ${state.generation} · Seed ${state.seedString}`}
            </div>
            <h2 className="font-saga text-2xl font-bold text-[#F1F5F9] truncate">
              {formatDynastyName(state.dynastyName, lang)}
            </h2>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="text-end">
              <div className="text-[10px] text-[#94A3B8]">
                {isFa ? 'امتیاز میراث' : 'Legacy Score'}
              </div>
              <div className="text-lg font-mono font-bold tabular-nums text-[#FBBF24]">
                {legacyScore.toLocaleString()}
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopySeed}
              title={isFa ? 'کپی کد دنیا' : 'Copy Seed'}
              className="min-w-[44px] min-h-[44px] px-2.5 rounded-xl bg-[#131D2B]/90 border border-[#24354C] hover:border-[#38BDF8] text-[#F1F5F9] flex items-center justify-center cursor-pointer transition-colors"
            >
              {copiedSeed ? (
                <Check className="w-4 h-4 text-[#34D399]" />
              ) : (
                <Copy className="w-4 h-4 text-[#94A3B8]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-[#0F1722] border border-[#1E2D40] rounded-xl">
        <button
          type="button"
          onClick={() => setSubTab('badges')}
          className={`min-h-[44px] min-w-0 px-1.5 sm:px-3 text-[11px] sm:text-xs font-semibold rounded-lg inline-flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer transition-colors ${
            subTab === 'badges'
              ? 'bg-[#38BDF8] text-[#0B1118]'
              : 'text-[#94A3B8] hover:text-[#F1F5F9]'
          }`}
        >
          <Award className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">
            {isFa
              ? `چالش‌ها (${unlockedCount}/${BITLIFE_ACHIEVEMENTS.length})`
              : `Challenges (${unlockedCount}/${BITLIFE_ACHIEVEMENTS.length})`}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setSubTab('ancestors')}
          className={`min-h-[44px] min-w-0 px-1.5 sm:px-3 text-[11px] sm:text-xs font-semibold rounded-lg inline-flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer transition-colors ${
            subTab === 'ancestors'
              ? 'bg-[#38BDF8] text-[#0B1118]'
              : 'text-[#94A3B8] hover:text-[#F1F5F9]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">
            {isFa ? `نیاکان (${state.ancestors.length})` : `Lineage (${state.ancestors.length})`}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setSubTab('history')}
          className={`min-h-[44px] min-w-0 px-1.5 sm:px-3 text-[11px] sm:text-xs font-semibold rounded-lg inline-flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer transition-colors ${
            subTab === 'history'
              ? 'bg-[#38BDF8] text-[#0B1118]'
              : 'text-[#94A3B8] hover:text-[#F1F5F9]'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">
            {isFa
              ? `تاریخ بدیل (${divergencesList.length})`
              : `Alt-History (${divergencesList.length})`}
          </span>
        </button>
      </div>

      {subTab === 'badges' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {BITLIFE_ACHIEVEMENTS.map((ach) => {
            const prog = ach.getProgress(state);
            const earned = state.achievements.includes(ach.id) || prog.current >= prog.target;
            const pct = Math.min(100, Math.round((prog.current / Math.max(1, prog.target)) * 100));

            return (
              <div
                key={ach.id}
                className={`p-3.5 rounded-xl border space-y-2 transition-colors ${
                  earned
                    ? 'bg-[#132030] border-[#F59E0B]/70 text-[#F1F5F9]'
                    : 'bg-[#0F1722] border-[#1E2D40] text-[#94A3B8]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="text-xs font-bold text-[#F1F5F9]">
                    {isFa ? ach.nameFa : ach.nameEn}
                  </div>
                  <span
                    className={`text-[11px] font-mono font-bold tabular-nums shrink-0 ${
                      earned ? 'text-[#FBBF24]' : 'text-[#64748B]'
                    }`}
                  >
                    {earned ? '✓' : `${prog.current}/${prog.target}`}
                  </span>
                </div>
                <div className="text-[11px] text-[#94A3B8] leading-snug">
                  {isFa ? ach.descFa : ach.descEn}
                </div>
                <svg
                  viewBox="0 0 100 6"
                  preserveAspectRatio="none"
                  className="h-2 w-full rounded-xs overflow-hidden block"
                  aria-hidden="true"
                >
                  <rect x="0" y="0" width="100" height="6" className="fill-[#090E15]" />
                  <rect
                    x={isFa ? 100 - pct : 0}
                    y="0"
                    width={pct}
                    height="6"
                    className={`transition-all duration-300 ${
                      earned ? 'fill-[#F59E0B]' : 'fill-[#38BDF8]/65'
                    }`}
                  />
                </svg>
              </div>
            );
          })}
        </div>
      )}

      {subTab === 'ancestors' && (
        <div className="space-y-2.5">
          {state.ancestors.length === 0 ? (
            <div className="p-5 rounded-xl bg-[#0F1722] border border-[#1E2D40] text-xs text-[#94A3B8] text-center leading-relaxed">
              {isFa
                ? `«${formatPersonName(state.character.givenName, 'fa')}» نسل اول خاندان شماست. پس از مرگ و ادامه بازی با وارث، کارنامه فرمانروایان پیشین در اینجا ثبت می‌شود.`
                : `${state.character.givenName} is Generation 1. Past rulers and their obituaries appear here when you continue as an heir.`}
            </div>
          ) : (
            state.ancestors.map((anc) => (
              <div
                key={anc.id}
                className="p-4 rounded-xl bg-[#0F1722] border border-[#1E2D40] space-y-1.5"
              >
                <div className="flex justify-between text-xs text-[#38BDF8] font-mono tabular-nums">
                  <span>
                    {isFa
                      ? `نسل ${anc.generation} · ${SHORT_TITLE_LABELS.fa[anc.title]}`
                      : `Gen ${anc.generation} · ${SHORT_TITLE_LABELS.en[anc.title]}`}
                  </span>
                  <span>
                    {isFa
                      ? `${anc.birthYear}–${anc.deathYear} م (${anc.ageAtDeath} سال)`
                      : `${anc.birthYear}–${anc.deathYear} AD (Age ${anc.ageAtDeath})`}
                  </span>
                </div>
                <div className="font-saga text-lg font-bold text-[#F1F5F9]">
                  {formatPersonName(anc.fullName.replace(/"/g, ''), lang)}
                </div>
                <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
                  {isFa ? anc.obituaryProseFa ?? anc.obituaryProse : anc.obituaryProse}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {subTab === 'history' && (
        <div className="space-y-2">
          {divergencesList.length === 0 ? (
            <div className="p-5 rounded-xl bg-[#0F1722] border border-[#1E2D40] text-xs text-[#94A3B8] text-center leading-relaxed">
              {isFa
                ? 'مسیر تاریخ هنوز مطابق روایت‌های واقعی پیش می‌رود. با رقم‌زدن انتخاب‌های متفاوت در رویدادهای بزرگ تاریخی، تغییرات شما در اینجا ثبت می‌شود.'
                : 'History still flows on its recorded course. Alter major historical events to record divergences here.'}
            </div>
          ) : (
            divergencesList.map((d, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-[#131D2B] border border-[#38BDF8]/40 font-saga text-base text-[#F1F5F9]"
              >
                ᛫ {d}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
