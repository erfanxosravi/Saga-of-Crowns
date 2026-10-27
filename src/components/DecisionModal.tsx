import { EVENTS_FA } from '../i18n/eventsFa';
import { SETTLEMENTS_FA } from '../i18n/gameDataFa';
import {
  CATEGORY_LABELS,
  formatAgeLabel,
  formatYearLabel,
  isRtl,
  SHORT_TITLE_LABELS,
  SKILL_LABELS,
  STAT_LABELS,
} from '../i18n/ui';
import { ContentIntensity, EventChoice, FullGameState, GameEvent, Language } from '../types/game';
import { EventCategoryIcon } from './EventCategoryIcon';

interface DecisionModalProps {
  event: GameEvent;
  state: FullGameState;
  onSelectChoice: (choiceId: string) => void;
}

interface ConsequenceTag {
  text: string;
  tone: 'danger' | 'cost' | 'reward' | 'neutral';
}

function getChoiceConsequences(
  ch: EventChoice,
  state: FullGameState,
  lang: Language
): ConsequenceTag[] {
  const tags: ConsequenceTag[] = [];
  const isFa = lang === 'fa';
  const eff = ch.effects;

  // 1. Silver Cost (either requiredSilver or negative effects.silver)
  const silverCost =
    ch.requiredSilver !== undefined
      ? ch.requiredSilver
      : eff?.silver !== undefined && eff.silver < 0
        ? Math.abs(eff.silver)
        : 0;

  if (silverCost > 0) {
    const lacks = ch.requiredSilver !== undefined && state.realm.silver < ch.requiredSilver;
    tags.push({
      text: lacks
        ? isFa
          ? `نیاز به ${silverCost} نقره`
          : `Needs ${silverCost} silver`
        : isFa
          ? `هزینه: ${silverCost} نقره`
          : `Costs ${silverCost} silver`,
      tone: lacks ? 'danger' : 'cost',
    });
  } else if (eff?.silver && eff.silver > 0) {
    tags.push({
      text: isFa ? `+${eff.silver} نقره` : `+${eff.silver} silver`,
      tone: 'reward',
    });
  }

  // 2. Risk & Injury Preview
  const deathRisk = ch.deathChance ?? 0;
  const injuryRisk = ch.injuryChance ?? 0;
  if (deathRisk >= 0.12) {
    tags.push({
      text: isFa ? 'خطر مرگ بالا' : 'High risk',
      tone: 'danger',
    });
  } else if (deathRisk > 0) {
    tags.push({
      text: isFa ? 'ریسک جانی' : 'Mortal risk',
      tone: 'danger',
    });
  } else if (injuryRisk >= 0.15) {
    tags.push({
      text: isFa ? 'احتمال زخم' : 'Injury risk',
      tone: 'cost',
    });
  }

  // 3. Skill / Stat Gate
  if (ch.requiredSkill) {
    const skName = SKILL_LABELS[lang][ch.requiredSkill.skill];
    const lacks = state.character.skills[ch.requiredSkill.skill] < ch.requiredSkill.min;
    tags.push({
      text: isFa ? `${skName} ${ch.requiredSkill.min}+` : `${skName} ${ch.requiredSkill.min}+`,
      tone: lacks ? 'danger' : 'neutral',
    });
  }
  if (ch.requiredStat) {
    const stName = STAT_LABELS[lang][ch.requiredStat.stat];
    const lacks = state.character.stats[ch.requiredStat.stat] < ch.requiredStat.min;
    tags.push({
      text: isFa ? `${stName} ${ch.requiredStat.min}+` : `${stName} ${ch.requiredStat.min}+`,
      tone: lacks ? 'danger' : 'neutral',
    });
  }

  // 4. Key Outcomes (Feud, Marriage, Rank, Ships, Land, Fame)
  if (eff) {
    if (eff.spawnRival) {
      tags.push({
        text: isFa ? 'دشمنی خونی!' : 'Starts feud',
        tone: 'danger',
      });
    }
    if (eff.marryRivalPeace) {
      tags.push({
        text: isFa ? 'ازدواج صلح با دشمن' : 'Marry blood enemy',
        tone: 'reward',
      });
    } else if (eff.marryRandom) {
      tags.push({
        text: isFa ? 'ازدواج' : 'Marriage',
        tone: 'reward',
      });
    }
    if (eff.newTitle) {
      tags.push({
        text: isFa
          ? `مقام: ${SHORT_TITLE_LABELS.fa[eff.newTitle]}`
          : `Rank: ${SHORT_TITLE_LABELS.en[eff.newTitle]}`,
        tone: 'reward',
      });
    }
    if (eff.landFarms && eff.landFarms > 0) {
      tags.push({
        text: isFa ? `+${eff.landFarms} مزرعه` : `+${eff.landFarms} farm`,
        tone: 'reward',
      });
    }
    if (eff.longships && eff.longships > 0) {
      tags.push({
        text: isFa ? `+${eff.longships} کشتی جنگی` : `+${eff.longships} warship`,
        tone: 'reward',
      });
    }
    if (eff.hirdWarriors && eff.hirdWarriors > 0) {
      tags.push({
        text: isFa ? `+${eff.hirdWarriors} جنگجو` : `+${eff.hirdWarriors} warriors`,
        tone: 'reward',
      });
    }
    if (eff.moveToSettlementId) {
      const destFa = SETTLEMENTS_FA[eff.moveToSettlementId]?.name;
      tags.push({
        text: isFa && destFa ? `سفر به ${destFa}` : 'Sea voyage',
        tone: 'neutral',
      });
    }
  }

  return tags.slice(0, 3);
}

export function DecisionModal({ event, state, onSelectChoice }: DecisionModalProps) {
  const lang = state.settings.language;
  const isFa = lang === 'fa';
  const rtl = isRtl(lang);
  const isMild = state.settings.contentIntensity === ContentIntensity.Mild;

  const evFa = EVENTS_FA[event.id];
  const displayTitle = isFa ? evFa?.title ?? event.title : event.title;
  const narrativeText = isFa
    ? (isMild && evFa?.mildText ? evFa.mildText : evFa?.text) ?? event.text
    : isMild && event.mildText
      ? event.mildText
      : event.text;

  const categoryText = CATEGORY_LABELS[lang][event.category];
  const ageText = formatAgeLabel(state.character.age, lang);
  const yearText = formatYearLabel(state.year, lang);

  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#05080D]/85 backdrop-blur-xs p-2.5 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="decision-modal-title"
    >
      <div className="w-full max-w-xl max-h-[calc(100dvh-1.25rem)] sm:max-h-[min(88dvh,740px)] flex flex-col bg-[#0F1722] border border-[#283B52] rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.88)] overflow-hidden">
        <div className="shrink-0 px-4 sm:px-6 pt-4 sm:pt-5 pb-3.5 text-center space-y-1.5 border-b border-[#1E2D40] bg-[#121C2B]/85">
          <div className="inline-flex items-center justify-center gap-1.5 text-xs text-[#38BDF8] font-medium">
            <EventCategoryIcon
              category={event.category}
              iconType={event.iconType}
              className="w-4 h-4"
            />
            <span>
              {ageText} · {yearText} · {categoryText}
            </span>
          </div>
          <h2
            id="decision-modal-title"
            className="font-saga text-xl sm:text-2xl font-bold text-[#F1F5F9] leading-snug"
          >
            {displayTitle}
          </h2>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-4">
          <p className="font-saga text-base sm:text-lg leading-relaxed text-[#E2E8F0] text-center">
            {narrativeText}
          </p>

          <div className="space-y-2.5 pt-1">
            {event.choices.map((ch) => {
              const lacksSilver =
                ch.requiredSilver !== undefined && state.realm.silver < ch.requiredSilver;
              const lacksSkill =
                ch.requiredSkill !== undefined &&
                state.character.skills[ch.requiredSkill.skill] < ch.requiredSkill.min;
              const lacksStat =
                ch.requiredStat !== undefined &&
                state.character.stats[ch.requiredStat.stat] < ch.requiredStat.min;
              const isLocked = lacksSilver || lacksSkill || lacksStat;

              const chFa = evFa?.choices[ch.id];
              const label = isFa
                ? (isMild && chFa?.mildLabel ? chFa.mildLabel : chFa?.label) ?? ch.label
                : isMild && ch.mildLabel
                  ? ch.mildLabel
                  : ch.label;

              const consequences = getChoiceConsequences(ch, state, lang);

              return (
                <button
                  key={ch.id}
                  type="button"
                  disabled={isLocked}
                  onClick={() => onSelectChoice(ch.id)}
                  className={`w-full min-h-[56px] px-4 py-3 rounded-xl border text-center transition-all ${
                    isLocked
                      ? 'bg-[#0B1118] border-[#1B2636] text-[#475569] cursor-not-allowed'
                      : 'bg-[#162232] border-[#2C425E] hover:border-[#F59E0B] hover:bg-[#1C2B3F] text-[#F1F5F9] cursor-pointer active:scale-[0.99]'
                  }`}
                >
                  <div className="text-sm sm:text-[15px] font-semibold leading-snug">{label}</div>

                  {consequences.length > 0 && (
                    <div className="mt-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-xs font-mono tabular-nums">
                      {consequences.map((tag, idx) => {
                        const color =
                          tag.tone === 'danger'
                            ? 'text-rose-400 font-semibold'
                            : tag.tone === 'cost'
                              ? 'text-[#F59E0B]'
                              : tag.tone === 'reward'
                                ? 'text-emerald-400'
                                : 'text-[#38BDF8]';
                        return (
                          <span key={idx} className={color}>
                            {idx > 0 && <span className="text-[#64748B] me-2">·</span>}
                            {tag.text}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
