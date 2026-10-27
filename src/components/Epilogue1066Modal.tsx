import { Compass, Crown, Flame, RotateCcw, Sparkles } from 'lucide-react';
import { BITLIFE_ACHIEVEMENTS } from '../data/deathsAndAchievements';
import { calculateLegacyScore } from '../engine/gameEngine';
import { formatDynastyName } from '../i18n/gameDataFa';
import { isRtl } from '../i18n/ui';
import { FullGameState } from '../types/game';

interface Epilogue1066ModalProps {
  state: FullGameState;
  onContinueFreeMode: () => void;
  onStartNewSaga: () => void;
}

export function Epilogue1066Modal({
  state,
  onContinueFreeMode,
  onStartNewSaga,
}: Epilogue1066ModalProps) {
  const lang = state.settings.language;
  const isFa = lang === 'fa';
  const rtl = isRtl(lang);

  const legacyScore = calculateLegacyScore(state);
  const dynastyDisplay = formatDynastyName(state.dynastyName, lang);
  const totalRaids = state.ancestors.reduce(
    (sum, anc) => sum + anc.raidsLed,
    state.character.raidsLed
  );
  const totalShips = state.realm.longships + state.realm.knarrs;
  const unlockedCount = BITLIFE_ACHIEVEMENTS.filter((ach) => {
    const p = ach.getProgress(state);
    return state.achievements.includes(ach.id) || p.current >= p.target;
  }).length;

  const divergencesList = isFa
    ? state.divergencesFa && state.divergencesFa.length > 0
      ? state.divergencesFa
      : state.divergences
    : state.divergences;

  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 bg-[#05080D]/88 backdrop-blur-xs flex items-end sm:items-center justify-center p-2.5 sm:p-4 select-none"
    >
      <div className="w-full max-w-xl max-h-[calc(100dvh-1.25rem)] sm:max-h-[min(90dvh,780px)] flex flex-col overflow-hidden rounded-2xl bg-[#0F1722] border border-[#F59E0B]/45 shadow-2xl text-start">
        {/* Header */}
        <div className="shrink-0 px-4 sm:px-6 pt-4 sm:pt-5 pb-3.5 border-b border-[#1E2D40] bg-[#131D2B]/90 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-mono text-[#F59E0B]">
            <Flame className="w-4 h-4 shrink-0" />
            <span>
              {isFa
                ? '۱۰۶۶ میلادی · پایان عصر وایکینگ‌ها'
                : '1066 AD · End of the Viking Age'}
            </span>
          </div>
          <h2 className="font-saga text-xl sm:text-2xl font-bold text-[#F1F5F9] leading-snug break-words">
            {isFa
              ? `کارنامه دودمان ${dynastyDisplay}`
              : `Twilight of the North: ${dynastyDisplay}`}
          </h2>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4">
          <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
            {isFa
              ? 'با نبردهای سرنوشت‌ساز سال ۱۰۶۶ در استمفورد بریج و هیستینگز، دوران تاریخی پادشاهان دریانورد و کشتی‌های اژدهاپیکر به پایان رسید؛ اما آوازه‌ی خاندان شما در تالارهای شمال جاودانه ماند.'
              : 'With the fateful clashes of 1066 at Stamford Bridge and Hastings, the historic age of dragon-prowed sea-kings draws to a close—yet the word-fame of your bloodline echoes across every northern hall.'}
          </p>

          {/* Dynasty Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 sm:p-4 rounded-xl bg-[#131D2B] border border-[#233246]">
            <div className="min-w-0">
              <div className="text-[11px] text-[#94A3B8]">
                {isFa ? 'امتیاز میراث' : 'Legacy Score'}
              </div>
              <div className="font-mono tabular-nums text-lg font-bold text-[#F59E0B]">
                {legacyScore}
              </div>
            </div>

            <div className="min-w-0">
              <div className="text-[11px] text-[#94A3B8]">
                {isFa ? 'نسل‌های دودمان' : 'Generations'}
              </div>
              <div className="font-mono tabular-nums text-lg font-bold text-[#F1F5F9]">
                {state.generation}
              </div>
            </div>

            <div className="min-w-0">
              <div className="text-[11px] text-[#94A3B8]">
                {isFa ? 'شهرت خاندان' : 'Word-Fame'}
              </div>
              <div className="font-mono tabular-nums text-lg font-bold text-[#38BDF8]">
                {state.realm.fame}
              </div>
            </div>

            <div className="min-w-0">
              <div className="text-[11px] text-[#94A3B8]">
                {isFa ? 'غارت‌های دودمان' : 'Dynasty Raids'}
              </div>
              <div className="font-mono tabular-nums text-base font-semibold text-[#F1F5F9]">
                {totalRaids}
              </div>
            </div>

            <div className="min-w-0">
              <div className="text-[11px] text-[#94A3B8]">
                {isFa ? 'املاک و ناوگان' : 'Farms & Fleet'}
              </div>
              <div className="font-mono tabular-nums text-sm sm:text-base font-semibold text-[#F1F5F9]">
                {isFa
                  ? `${state.realm.landFarms} مزرعه · ${totalShips} کشتی`
                  : `${state.realm.landFarms}F · ${totalShips}S`}
              </div>
            </div>

            <div className="min-w-0">
              <div className="text-[11px] text-[#94A3B8]">
                {isFa ? 'دستاوردها' : 'Achievements'}
              </div>
              <div className="font-mono tabular-nums text-base font-semibold text-emerald-400">
                {unlockedCount}/{BITLIFE_ACHIEVEMENTS.length}
              </div>
            </div>
          </div>

          {/* Historical Divergences if any */}
          {divergencesList.length > 0 && (
            <div className="space-y-2 border-t border-[#1E2D40] pt-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#38BDF8]">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {isFa
                    ? 'ردپای خاندان شما بر تغییر تاریخ:'
                    : 'How Your Dynasty Changed History:'}
                </span>
              </div>
              <ul className="space-y-1.5 text-xs text-[#E2E8F0] leading-relaxed">
                {divergencesList.slice(0, 4).map((divText, idx) => (
                  <li key={`ep_div_${idx}`} className="flex items-start gap-2">
                    <Crown className="w-3.5 h-3.5 text-[#F59E0B] shrink-0 mt-0.5" />
                    <span>{divText}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="shrink-0 px-4 sm:px-6 py-3.5 border-t border-[#1E2D40] bg-[#131D2B]/90 space-y-2">
          <button
            type="button"
            onClick={onContinueFreeMode}
            className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] text-[#0B1118] font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Compass className="w-4 h-4 shrink-0" />
            <span>
              {isFa
                ? 'ادامه بازی در حالت آزاد (پس از ۱۰۶۶)'
                : 'Continue in Free Mode'}
            </span>
          </button>

          <button
            type="button"
            onClick={onStartNewSaga}
            className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-[#0F1722] hover:bg-[#19283B] border border-[#233246] text-[#F1F5F9] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
            <span>
              {isFa ? 'پایان این حماسه و شروع زندگی جدید' : 'Start a New Saga'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
