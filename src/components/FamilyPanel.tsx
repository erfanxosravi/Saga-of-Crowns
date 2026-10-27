import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Flame,
  Gift,
  GraduationCap,
  HeartHandshake,
  MessageCircle,
  Skull,
  Swords,
  Users,
} from 'lucide-react';
import type { FamilyInteractionType } from '../engine/gameEngine';
import { formatPersonName } from '../i18n/gameDataFa';
import { EPITHET_FA, formatAgeLabel, ROLE_LABELS } from '../i18n/ui';
import { FullGameState, RelationshipPerson } from '../types/game';
import { NordicAccordion } from './NordicControls';

interface FamilyPanelProps {
  state: FullGameState;
  onFamilyAction: (
    action: 'court_spouse' | 'divorce_spouse' | 'pay_wergild' | 'holmgang_rival',
    targetId?: string
  ) => void;
  onMemberInteraction: (personId: string, interaction: FamilyInteractionType) => void;
}

export function FamilyPanel({
  state,
  onFamilyAction,
  onMemberInteraction,
}: FamilyPanelProps) {
  const lang = state.settings.language;
  const isFa = lang === 'fa';
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const livingSpouse = state.relationships.find((r) => r.role === 'Spouse' && r.alive);
  const livingKin = state.relationships.filter(
    (r) => r.alive && r.role !== 'Rival' && r.role !== 'Blood-Feud Enemy'
  );
  const livingRivals = state.relationships.filter(
    (r) => r.alive && (r.role === 'Rival' || r.role === 'Blood-Feud Enemy')
  );
  const fallenRel = state.relationships.filter((r) => !r.alive);

  const [kinOpen, setKinOpen] = useState<boolean>(true);
  const [rivalsOpen, setRivalsOpen] = useState<boolean>(true);
  const [fallenOpen, setFallenOpen] = useState<boolean>(false);

  const isAdult = state.character.age >= 17;
  const divorceCost = Math.min(
    state.realm.silver,
    Math.max(10, Math.round(state.realm.silver * 0.2))
  );

  const renderRow = (p: RelationshipPerson) => {
    const isEnemy = p.role === 'Rival' || p.role === 'Blood-Feud Enemy';
    const isChildOrFoster = p.role === 'Child' || p.role === 'Foster-Child';
    const usedThisYear = Boolean(state.familyInteractionsUsed?.[p.id]);
    const isExpanded = expandedId === p.id;
    const pct = Math.max(0, Math.min(100, isEnemy ? 100 - p.affinity : p.affinity));
    const displayName = formatPersonName(p.name, lang);
    const epText = p.epithet
      ? isFa
        ? ` «${EPITHET_FA[p.epithet] ?? p.epithet}»`
        : ` "${p.epithet}"`
      : '';

    return (
      <div
        key={p.id}
        className={`rounded-xl border transition-colors overflow-hidden ${
          isEnemy
            ? 'bg-[#191116] border-[#7F1D1D]/70'
            : isExpanded
              ? 'bg-[#131F30] border-[#38BDF8]/60'
              : 'bg-[#0F1722] border-[#1E2D40] hover:border-[#2E4460]'
        }`}
      >
        <button
          type="button"
          onClick={() => setExpandedId(isExpanded ? null : p.id)}
          className="w-full min-h-[54px] p-3.5 text-start flex items-center justify-between gap-3 cursor-pointer"
        >
          <div className="min-w-0">
            <div className="text-sm font-bold text-[#F1F5F9] truncate">
              {displayName}
              {epText}
            </div>
            <div className="text-xs text-[#94A3B8] mt-0.5">
              {ROLE_LABELS[lang][p.role]} · {formatAgeLabel(p.age, lang)}
              {p.isHeirEligible && (
                <span className="text-[#FBBF24] font-semibold">
                  {isFa ? ' · وارث خاندان' : ' · Eligible Heir'}
                </span>
              )}
              {usedThisYear && !isEnemy && (
                <span className="text-[#34D399]">
                  {isFa ? ' · تعامل انجام شد' : ' · Visited'}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-24 space-y-1">
              <div className="text-[10px] font-mono tabular-nums text-end text-[#94A3B8]">
                {isEnemy
                  ? isFa
                    ? `خصومت ${pct}%`
                    : `Hostility ${pct}%`
                  : isFa
                    ? `صمیمیت ${pct}%`
                    : `Bond ${pct}%`}
              </div>
              <svg
                viewBox="0 0 100 6"
                preserveAspectRatio="none"
                className="h-1.5 w-full rounded-sm overflow-hidden block"
                aria-hidden="true"
              >
                <rect x="0" y="0" width="100" height="6" className="fill-[#090E15]" />
                <rect
                  x={isFa ? 100 - pct : 0}
                  y="0"
                  width={pct}
                  height="6"
                  className={`transition-all duration-300 motion-reduce:transition-none ${
                    isEnemy ? 'fill-[#EF4444]' : 'fill-[#38BDF8]'
                  }`}
                />
              </svg>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-[#38BDF8]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#64748B]" />
            )}
          </div>
        </button>

        {isExpanded && (
          <div className="px-3.5 pb-3.5 pt-2 border-t border-[#1E2D40]/70 space-y-2">
            {!isEnemy ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  disabled={usedThisYear}
                  onClick={() => onMemberInteraction(p.id, 'talk')}
                  className="min-h-[44px] px-3 py-2 rounded-lg bg-[#162232] hover:bg-[#1E2F45] disabled:opacity-45 border border-[#26384F] text-xs font-semibold text-[#F1F5F9] inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
                  <span>{isFa ? 'گپ زدن' : 'Talk'}</span>
                </button>

                <button
                  type="button"
                  disabled={usedThisYear || state.realm.silver < 5}
                  onClick={() => onMemberInteraction(p.id, 'gift')}
                  className="min-h-[44px] px-3 py-2 rounded-lg bg-[#162232] hover:bg-[#1E2F45] disabled:opacity-45 border border-[#26384F] text-xs font-semibold text-[#F1F5F9] inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Gift className="w-3.5 h-3.5 text-[#FBBF24] shrink-0" />
                  <span>{isFa ? 'هدیه (۵ نقره)' : 'Gift (5 Silver)'}</span>
                </button>

                {isChildOrFoster && p.age >= 5 && (
                  <button
                    type="button"
                    disabled={usedThisYear}
                    onClick={() => onMemberInteraction(p.id, 'teach')}
                    className="min-h-[44px] px-3 py-2 rounded-lg bg-[#162232] hover:bg-[#1E2F45] disabled:opacity-45 border border-[#34D399]/50 text-xs font-semibold text-[#34D399] inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                    <span>{isFa ? 'آموزش مهارت' : 'Teach Skill'}</span>
                  </button>
                )}

                <button
                  type="button"
                  disabled={usedThisYear}
                  onClick={() => onMemberInteraction(p.id, 'argue')}
                  className="min-h-[44px] px-3 py-2 rounded-lg bg-[#1A1216] hover:bg-[#271820] disabled:opacity-45 border border-[#7F1D1D]/60 text-xs font-semibold text-[#FCA5A5] inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Flame className="w-3.5 h-3.5 text-[#EF4444] shrink-0" />
                  <span>{isFa ? 'بحث و کل‌کل' : 'Argue'}</span>
                </button>
              </div>
            ) : (
              isAdult && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => onFamilyAction('holmgang_rival', p.id)}
                    className="min-h-[44px] px-3 text-xs font-bold bg-[#DC2626] hover:bg-[#EF4444] text-white rounded-lg inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Swords className="w-3.5 h-3.5 shrink-0" />
                    <span>{isFa ? 'دوئل تن‌به‌تن' : 'Duel (Holmgang)'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={state.realm.silver < 30}
                    onClick={() => onFamilyAction('pay_wergild', p.id)}
                    className="min-h-[44px] px-3 text-xs font-semibold bg-[#131D2B] border border-[#24354C] hover:border-[#FBBF24] disabled:opacity-45 text-[#F1F5F9] rounded-lg cursor-pointer whitespace-nowrap"
                  >
                    {isFa ? 'خون‌بها (۳۰ نقره)' : 'Wergild (30 Silver)'}
                  </button>

                  {!livingSpouse && (
                    <button
                      type="button"
                      onClick={() => onMemberInteraction(p.id, 'peace_marry')}
                      className="min-h-[44px] px-3 text-xs font-semibold bg-[#132030] border border-[#38BDF8]/60 hover:bg-[#192C42] text-[#38BDF8] rounded-lg inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <HeartHandshake className="w-3.5 h-3.5 shrink-0" />
                      <span>{isFa ? 'وصلتِ صلح!' : 'Peace Marriage'}</span>
                    </button>
                  )}
                </div>
              )
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3.5 text-start">
      {/* Marriage & Divorce Card */}
      {isAdult && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#131D2B] border border-[#233246]">
          <div className="text-xs min-w-0 space-y-0.5">
            <div className="text-sm font-bold text-[#F1F5F9] truncate">
              {livingSpouse
                ? isFa
                  ? `همسر شما: ${formatPersonName(livingSpouse.name, 'fa')}`
                  : `Married to ${livingSpouse.name}`
                : isFa
                  ? 'مجرد (بدون همسر)'
                  : 'Currently Unmarried'}
            </div>
            <div className="text-[#94A3B8]">
              {livingSpouse
                ? isFa
                  ? `عواقب طلاق: هزینه ${divorceCost} نقره · شادی ۱۴- · احتمال کینه فامیل همسر`
                  : `Divorce cost: ${divorceCost} silver · -14 Happiness · 40% blood-feud risk`
                : isFa
                  ? 'برای داشتن فرزند و ادامه نسل خاندان ازدواج کنید'
                  : 'Marry to raise heirs and secure your dynasty'}
            </div>
          </div>

          {!livingSpouse ? (
            <button
              type="button"
              disabled={state.realm.silver < 15}
              onClick={() => onFamilyAction('court_spouse')}
              className="min-h-[44px] px-4 text-xs font-bold bg-[#F59E0B] hover:bg-[#FBBF24] disabled:bg-[#1E2D40] disabled:text-[#64748B] text-[#0B1118] rounded-xl inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap transition-colors"
            >
              <HeartHandshake className="w-4 h-4 shrink-0" />
              <span>{isFa ? 'ازدواج (۱۵ نقره)' : 'Marry (15 Silver)'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onFamilyAction('divorce_spouse')}
              className="min-h-[44px] px-3.5 text-xs font-semibold bg-[#1A1116] border border-[#7F1D1D] hover:border-[#EF4444] text-[#FCA5A5] rounded-xl cursor-pointer shrink-0 whitespace-nowrap transition-colors"
            >
              {isFa
                ? `طلاق (${divorceCost} نقره · ریسک کینه)`
                : `Divorce (${divorceCost} Silver · Feud Risk)`}
            </button>
          )}
        </div>
      )}

      {/* 1. Living Kin & Heirs Accordion */}
      <NordicAccordion
        title={
          isFa
            ? `خویشاوندان و وارثان خاندان (${livingKin.length})`
            : `Living Kin & Heirs (${livingKin.length})`
        }
        subtitle={
          isFa
            ? 'روی نام هر عضو خانواده بزن تا گزینه‌های گپ، هدیه یا آموزش باز شود'
            : 'Tap any relative to talk, give silver gifts, teach skills, or argue'
        }
        icon={<Users className="w-4 h-4" />}
        accent="ice"
        isOpen={kinOpen}
        onToggle={() => setKinOpen((prev) => !prev)}
      >
        {livingKin.length === 0 ? (
          <div className="py-3 text-xs text-[#94A3B8] text-center">
            {isFa
              ? 'در حال حاضر خویشاوند زنده‌ای در کنارت نیست.'
              : 'You have no living close relatives right now.'}
          </div>
        ) : (
          <div className="space-y-2">{livingKin.map(renderRow)}</div>
        )}
      </NordicAccordion>

      {/* 2. Rivals & Blood-Feuds Accordion */}
      {livingRivals.length > 0 && (
        <NordicAccordion
          title={
            isFa
              ? `رقیبان و دشمنان خونی (${livingRivals.length})`
              : `Rivals & Blood-Feud Enemies (${livingRivals.length})`
          }
          subtitle={
            isFa
              ? 'حل اختلاف با دوئل هولم‌گانگ، پرداخت خون‌بها یا وصلت صلح'
              : 'Settle feuds by Holmgang duel, Wergild silver, or peace marriage'
          }
          icon={<Swords className="w-4 h-4" />}
          accent="crimson"
          isOpen={rivalsOpen}
          onToggle={() => setRivalsOpen((prev) => !prev)}
        >
          <div className="space-y-2">{livingRivals.map(renderRow)}</div>
        </NordicAccordion>
      )}

      {/* 3. Fallen & Late Kin Accordion (collapsed by default) */}
      {fallenRel.length > 0 && (
        <NordicAccordion
          title={
            isFa
              ? `درگذشتگان خاندان (${fallenRel.length})`
              : `Late Kin & Fallen (${fallenRel.length})`
          }
          subtitle={
            isFa
              ? 'یادبود نیاکان و بستگان ازدست‌رفته'
              : 'Memorial roll of departed relatives and rivals'
          }
          icon={<Skull className="w-4 h-4" />}
          accent="neutral"
          isOpen={fallenOpen}
          onToggle={() => setFallenOpen((prev) => !prev)}
        >
          <div className="space-y-1.5">
            {fallenRel.map((d) => (
              <div
                key={d.id}
                className="px-3.5 py-2.5 rounded-xl bg-[#0B1118] border border-[#192536] flex items-center justify-between gap-3 text-xs text-[#94A3B8]"
              >
                <span className="font-medium text-[#CBD5E1]">
                  {formatPersonName(d.name, lang)} ·{' '}
                  {isFa ? `${ROLE_LABELS.fa[d.role]} مرحوم` : `Late ${ROLE_LABELS.en[d.role]}`}
                </span>
                <span className="text-end text-[11px] text-[#64748B] truncate max-w-[55%]">
                  {isFa
                    ? d.causeOfDeathFa ?? d.causeOfDeath ?? 'درگذشته'
                    : d.causeOfDeath ?? 'Passed'}
                </span>
              </div>
            ))}
          </div>
        </NordicAccordion>
      )}
    </div>
  );
}
