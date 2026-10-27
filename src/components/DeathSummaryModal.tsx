import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Crown,
  Download,
  RotateCcw,
  Share2,
  Skull,
  Sparkles,
} from 'lucide-react';
import { evaluateLifeReportTitle } from '../data/deathsAndAchievements';
import { formatDynastyName, formatPersonName } from '../i18n/gameDataFa';
import { EPITHET_FA, formatAgeLabel, isRtl, ROLE_LABELS, SHORT_TITLE_LABELS } from '../i18n/ui';
import { FullGameState } from '../types/game';
import { VikingPortrait } from './VikingPortrait';

interface DeathSummaryModalProps {
  state: FullGameState;
  onContinueWithHeir: (heirId: string) => void;
  onQuickNewLife?: () => void;
  onEndDynastyAndRestart: () => void;
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function DeathSummaryModal({
  state,
  onContinueWithHeir,
  onQuickNewLife,
  onEndDynastyAndRestart,
}: DeathSummaryModalProps) {
  const [showOtherHeirs, setShowOtherHeirs] = useState(false);
  const [showFullSaga, setShowFullSaga] = useState(false);
  const [cardSavedToast, setCardSavedToast] = useState(false);

  const death = state.pendingDeath;
  if (!death) return null;

  const lang = state.settings.language;
  const isFa = lang === 'fa';
  const rtl = isRtl(lang);
  const c = state.character;

  const fullName = formatPersonName(`${c.givenName} ${c.patronymic}`, lang);
  const epText = c.epithet
    ? isFa
      ? ` «${EPITHET_FA[c.epithet] ?? c.epithet}»`
      : ` "${c.epithet}"`
    : '';

  const fallbackTitle = evaluateLifeReportTitle(state);
  const lifeTitle = isFa
    ? death.lifeTitleFa ?? fallbackTitle.titleFa
    : death.lifeTitle ?? fallbackTitle.titleEn;
  const closingLine = isFa
    ? death.closingLineFa ?? 'والهالا چشم‌به‌راهته!'
    : death.closingLine ?? 'Valhalla awaits!';
  const causeText = isFa
    ? death.causeOfDeathFa ?? death.causeOfDeath
    : death.causeOfDeath;

  const primaryHeir = death.eligibleHeirs[0] ?? null;
  const otherHeirs = death.eligibleHeirs.slice(1);
  const childrenCount = state.relationships.filter((r) => r.role === 'Child' && r.alive).length;

  const handleSaveOrShareCard = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.direction = isFa ? 'rtl' : 'ltr';

    // Nordic Slate Gradient Background
    const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bg.addColorStop(0, '#0B1118');
    bg.addColorStop(0.55, '#111B28');
    bg.addColorStop(1, '#090D13');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle Double Nordic Frame
    ctx.strokeStyle = '#1E2D40';
    ctx.lineWidth = 6;
    ctx.strokeRect(38, 38, canvas.width - 76, canvas.height - 76);
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 2;
    ctx.strokeRect(54, 54, canvas.width - 108, canvas.height - 108);

    ctx.textAlign = 'center';

    // Header Kicker
    ctx.fillStyle = '#EF4444';
    ctx.font = 'bold 28px system-ui, sans-serif';
    ctx.fillText(
      isFa
        ? `کارنامه پایان زندگی · ${c.birthYear} تا ${state.year} میلادی`
        : `VIKING LIFE REPORT CARD · ${c.birthYear}–${state.year} AD`,
      540,
      135
    );

    // Character Name
    ctx.fillStyle = '#F1F5F9';
    ctx.font = 'bold 62px Georgia, serif';
    ctx.fillText(`${fullName}${epText}`, 540, 225);

    // Dynasty & Age
    ctx.fillStyle = '#94A3B8';
    ctx.font = '32px system-ui, sans-serif';
    const rankStr = SHORT_TITLE_LABELS[lang][c.title];
    const dynStr = formatDynastyName(state.dynastyName, lang);
    ctx.fillText(
      isFa
        ? `${rankStr} از ${dynStr} · عمر: ${c.age} سال`
        : `${rankStr} of ${dynStr} · Died at Age ${c.age}`,
      540,
      285
    );

    // Earned Title Box
    ctx.fillStyle = '#162232';
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 3;
    ctx.fillRect(120, 340, 840, 150);
    ctx.strokeRect(120, 340, 840, 150);

    ctx.fillStyle = '#FBBF24';
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.fillText(isFa ? 'لقب کارنامه زندگی' : 'EARNED SAGA TITLE', 540, 390);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Georgia, serif';
    ctx.fillText(lifeTitle, 540, 455);

    // Cause of Death Box
    ctx.fillStyle = '#1A1116';
    ctx.strokeStyle = '#991B1B';
    ctx.lineWidth = 2;
    ctx.fillRect(100, 535, 880, 310);
    ctx.strokeRect(100, 535, 880, 310);

    ctx.fillStyle = '#F87171';
    ctx.font = 'bold 26px system-ui, sans-serif';
    ctx.fillText(isFa ? 'علت مرگ' : 'CAUSE OF DEATH', 540, 588);

    ctx.fillStyle = '#E2E8F0';
    ctx.font = '32px system-ui, sans-serif';
    const causeLines = wrapCanvasText(ctx, causeText, 800).slice(0, 4);
    causeLines.forEach((ln, idx) => {
      ctx.fillText(ln, 540, 648 + idx * 44);
    });

    ctx.fillStyle = '#FBBF24';
    ctx.font = 'italic bold 28px Georgia, serif';
    ctx.fillText(closingLine, 540, 815);

    // 4 Stat Tiles
    const statsGrid = isFa
      ? [
          { k: 'امتیاز میراث', v: death.legacyScore.toLocaleString() },
          { k: 'نقره خزانه', v: `${state.realm.silver}` },
          { k: 'غارت‌های دریایی', v: `${c.raidsLed}` },
          { k: 'فرزندان زنده', v: `${childrenCount}` },
        ]
      : [
          { k: 'LEGACY SCORE', v: death.legacyScore.toLocaleString() },
          { k: 'SILVER HOARD', v: `${state.realm.silver}` },
          { k: 'SEA RAIDS', v: `${c.raidsLed}` },
          { k: 'LIVING KIDS', v: `${childrenCount}` },
        ];

    statsGrid.forEach((item, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 100 + col * 450;
      const y = 890 + row * 150;
      ctx.fillStyle = '#131D2B';
      ctx.strokeStyle = '#24354C';
      ctx.lineWidth = 2;
      ctx.fillRect(x, y, 430, 128);
      ctx.strokeRect(x, y, 430, 128);

      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.fillText(item.k, x + 215, y + 48);

      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 44px monospace';
      ctx.fillText(item.v, x + 215, y + 102);
    });

    // Footer Watermark
    ctx.fillStyle = '#64748B';
    ctx.font = '24px system-ui, sans-serif';
    ctx.fillText(
      isFa
        ? `حماسه اخگرها (Eldsaga) · نسل ${state.generation} · کد دنیا: ${state.seedString}`
        : `ELDSAGA: VIKING LIFE · Gen ${state.generation} · Seed ${state.seedString}`,
      540,
      1265
    );

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const fileName = `eldsaga-${c.givenName.toLowerCase()}-${state.year}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      if (
        typeof navigator !== 'undefined' &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        try {
          await navigator.share({
            title: `${fullName} — ${lifeTitle}`,
            text: `${fullName} (${c.age}): ${causeText} ${closingLine}`,
            files: [file],
          });
          setCardSavedToast(true);
          setTimeout(() => setCardSavedToast(false), 2400);
          return;
        } catch {
          // Fall through to PNG download if user cancels share sheet
        }
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setCardSavedToast(true);
      setTimeout(() => setCardSavedToast(false), 2400);
    }, 'image/png');
  };

  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#05080D]/85 backdrop-blur-xs p-2.5 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="death-modal-title"
    >
      <div className="w-full max-w-xl max-h-[calc(100dvh-1.25rem)] sm:max-h-[min(90dvh,800px)] flex flex-col bg-[#0F1722] border border-[#991B1B] rounded-2xl shadow-[0_0_55px_rgba(220,38,38,0.28)] overflow-hidden text-start">
        {/* Top Report Header */}
        <div className="shrink-0 px-4 sm:px-5 py-3.5 sm:py-4 bg-[#131D2B] border-b border-[#1E2D40] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <VikingPortrait
              age={c.age}
              sex={c.sex}
              traits={c.traits}
              title={c.title}
              appearance={c.appearance}
              seedId={c.id}
              size={60}
              className="shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-mono text-[#F87171] flex items-center gap-1.5">
                <Skull className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {isFa
                    ? `پایان زندگی در ${c.age} سالگی · ${state.year} م`
                    : `DIED AT AGE ${c.age} · ${state.year} AD`}
                </span>
              </div>
              <h2
                id="death-modal-title"
                className="font-saga text-xl sm:text-2xl font-bold text-[#F1F5F9] line-clamp-2 break-words leading-snug"
              >
                {fullName}
                {epText}
              </h2>
              <div className="text-xs text-[#FBBF24] font-semibold truncate mt-0.5">
                {isFa ? `لقب کارنامه: ${lifeTitle}` : `Title: ${lifeTitle}`}
              </div>
            </div>
          </div>

          <div className="text-end shrink-0">
            <div className="text-[10px] text-[#94A3B8]">
              {isFa ? 'امتیاز کل' : 'Score'}
            </div>
            <div className="text-lg sm:text-xl font-mono font-bold tabular-nums text-[#38BDF8]">
              {death.legacyScore.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 py-4 space-y-4">
          {/* Darkly Funny Cause + Closing Line */}
          <div className="p-4 rounded-xl bg-[#1A1116] border border-[#7F1D1D]/70 space-y-2">
            <p className="text-sm sm:text-base font-medium text-[#F1F5F9] leading-relaxed">
              {causeText}
            </p>
            <p className="font-saga text-base sm:text-lg font-bold text-[#FBBF24]">
              « {closingLine} »
            </p>
          </div>

          {/* Compact Report Metrics */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-[#131D2B] border border-[#1E2D40]">
              <div className="text-[11px] text-[#94A3B8]">{isFa ? 'غارت‌ها' : 'Raids'}</div>
              <div className="text-sm font-mono font-bold text-[#F1F5F9] tabular-nums">
                {c.raidsLed}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#131D2B] border border-[#1E2D40]">
              <div className="text-[11px] text-[#94A3B8]">{isFa ? 'نقره' : 'Silver'}</div>
              <div className="text-sm font-mono font-bold text-[#FBBF24] tabular-nums">
                {state.realm.silver}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#131D2B] border border-[#1E2D40]">
              <div className="text-[11px] text-[#94A3B8]">{isFa ? 'مزارع' : 'Farms'}</div>
              <div className="text-sm font-mono font-bold text-[#34D399] tabular-nums">
                {state.realm.landFarms}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#131D2B] border border-[#1E2D40]">
              <div className="text-[11px] text-[#94A3B8]">{isFa ? 'فرزندان' : 'Kids'}</div>
              <div className="text-sm font-mono font-bold text-[#38BDF8] tabular-nums">
                {childrenCount}
              </div>
            </div>
          </div>

          {/* Save / Share Image Button + Expandable Full Obituary */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleSaveOrShareCard}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#162232] hover:bg-[#1E2F45] border border-[#38BDF8]/50 text-xs font-semibold text-[#38BDF8] inline-flex items-center gap-2 cursor-pointer whitespace-nowrap transition-colors"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>
                {cardSavedToast
                  ? isFa
                    ? 'تصویر کارنامه ذخیره شد!'
                    : 'Report Card Saved!'
                  : isFa
                    ? 'ذخیره / اشتراک تصویر کارنامه'
                    : 'Save / Share Report Image'}
              </span>
              <Share2 className="w-3.5 h-3.5 opacity-75 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => setShowFullSaga((v) => !v)}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#131D2B] border border-[#1E2D40] text-xs text-[#94A3B8] hover:text-[#F1F5F9] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span>{isFa ? 'متن کامل حماسه' : 'Full Obituary'}</span>
              {showFullSaga ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {showFullSaga && (
            <div className="p-3.5 rounded-xl bg-[#0B1118] border border-[#1E2D40] text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
              {isFa ? death.obituaryProseFa ?? death.obituaryProse : death.obituaryProse}
            </div>
          )}

          {/* ONE-CLICK NEXT LIFE / HEIR ACTIONS */}
          <div className="pt-2 border-t border-[#1E2D40] space-y-2.5">
            {primaryHeir ? (
              <>
                <button
                  type="button"
                  onClick={() => onContinueWithHeir(primaryHeir.id)}
                  className="w-full min-h-[54px] px-5 py-3 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] text-[#0B1118] font-bold text-sm sm:text-base shadow-lg flex items-center justify-between gap-3 cursor-pointer transition-colors"
                >
                  <span className="inline-flex items-center gap-2 min-w-0 truncate">
                    <Crown className="w-5 h-5 shrink-0" />
                    <span className="truncate">
                      {isFa
                        ? `ادامه با وارث: ${formatPersonName(primaryHeir.name, 'fa')} (${formatAgeLabel(Math.max(6, primaryHeir.age), 'fa')})`
                        : `Continue as ${primaryHeir.name} (${formatAgeLabel(Math.max(6, primaryHeir.age), 'en')})`}
                    </span>
                  </span>
                  <span className="text-xs font-extrabold whitespace-nowrap shrink-0">
                    {isFa ? 'نسل بعد ←' : '1-Click →'}
                  </span>
                </button>

                {otherHeirs.length > 0 && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowOtherHeirs((v) => !v)}
                      className="text-xs text-[#94A3B8] hover:text-[#38BDF8] inline-flex items-center gap-1 cursor-pointer py-1"
                    >
                      <span>
                        {isFa
                          ? `انتخاب از بین ${otherHeirs.length} وارث دیگر`
                          : `Or pick from ${otherHeirs.length} other heir${otherHeirs.length === 1 ? '' : 's'}`}
                      </span>
                      {showOtherHeirs ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {showOtherHeirs && (
                      <div className="mt-1.5 space-y-1.5">
                        {otherHeirs.map((heir) => (
                          <button
                            key={heir.id}
                            type="button"
                            onClick={() => onContinueWithHeir(heir.id)}
                            className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#131D2B] hover:bg-[#1A273A] border border-[#24354C] flex items-center justify-between gap-2 text-xs text-[#F1F5F9] cursor-pointer"
                          >
                            <span className="font-semibold truncate">
                              {formatPersonName(heir.name, lang)} · {ROLE_LABELS[lang][heir.role]} ·{' '}
                              {formatAgeLabel(Math.max(6, heir.age), lang)}
                            </span>
                            <span className="text-[#FBBF24] font-bold whitespace-nowrap">
                              {isFa ? 'انتخاب' : 'Play'}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="p-3 rounded-xl bg-[#1A1116] border border-[#7F1D1D]/60 text-xs text-[#FCA5A5]">
                {isFa
                  ? 'هیچ وارث زنده‌ای باقی نمانده است؛ اما با یک کلیک می‌توانید یک زندگی جدید را آغاز کنید!'
                  : 'No living heirs remain — start a fresh Viking life in one tap!'}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {onQuickNewLife && (
                <button
                  type="button"
                  onClick={onQuickNewLife}
                  className="min-h-[46px] px-4 py-2.5 rounded-xl bg-[#38BDF8] hover:bg-[#7DD3FC] text-[#0B1118] text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap transition-colors"
                >
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>
                    {isFa ? 'زندگی تصادفی جدید (۱ کلیک)' : 'Random New Life (1-Click)'}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={onEndDynastyAndRestart}
                className={`min-h-[46px] px-4 py-2.5 rounded-xl bg-[#131D2B] hover:bg-[#1B293D] border border-[#24354C] text-xs font-semibold text-[#CBD5E1] inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
                  onQuickNewLife ? '' : 'sm:col-span-2'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {isFa ? 'ساخت شخصیت دلخواه جدید' : 'Custom New Character'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
