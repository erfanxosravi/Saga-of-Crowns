import { useState } from 'react';
import {
  Check,
  Compass,
  Flame,
  GraduationCap,
  LockOpen,
  MapPin,
  Scale,
  Shield,
  Swords,
} from 'lucide-react';
import { calculateVoyageMetrics, SETTLEMENTS, SETTLEMENTS_BY_ID } from '../data/geography';
import { hasBoathouse, isFortifiedEnemyCity, RaidTactic } from '../engine/gameEngine';
import { SETTLEMENTS_FA } from '../i18n/gameDataFa';
import { REGION_LABELS, RELIGION_LABELS, SKILL_LABELS } from '../i18n/ui';
import { FullGameState, Religion, SkillKey, TitleRank } from '../types/game';
import { NordicAccordion, NordicSelect, NordicSelectOption } from './NordicControls';

interface ActionsPanelProps {
  state: FullGameState;
  onGeneralAction: (
    actionType:
      | 'trade_voyage'
      | 'farm_settle'
      | 'attend_thing'
      | 'hold_feast'
      | 'patronize_skald'
      | 'recruit_hird'
      | 'build_longship'
      | 'build_knarr'
      | 'buy_freedom'
      | 'convert_pagan'
      | 'convert_christian',
    extra?: string
  ) => void;
  onRaid: (targetId: string, tactic: RaidTactic) => void;
  onSail: (destinationId: string) => void;
  onTrainSkill: (skill: SkillKey) => void;
  onConquerCity?: (targetId: string) => void;
}

type HallOptionId = 'land' | 'hold_feast' | 'attend_thing' | 'patronize_skald' | 'convert_faith';

const SKILL_HINTS: Record<SkillKey, { fa: string; en: string }> = {
  combat: {
    fa: 'نبرد تن‌به‌تن، غارت ساحلی و دوئل هولم‌گانگ',
    en: 'Raiding, shield-wall combat & Holmgang duels',
  },
  seamanship: {
    fa: 'کاهش خطر طوفان و مهارت هدایت کشتی',
    en: 'Safer sea voyages & storm navigation',
  },
  law: {
    fa: 'نفوذ در شورای ثینگ و داوری اختلاف‌ها',
    en: 'Influence at the Thing assembly & disputes',
  },
  diplomacy: {
    fa: 'مذاکره، پیمان صلح و روابط خاندان',
    en: 'Alliances, peace pacts & family persuasion',
  },
  skaldcraft: {
    fa: 'شعرخوانی، آوازه حماسی و اعتبار در تالار',
    en: 'Saga poetry, lasting fame & hall prestige',
  },
  trade: {
    fa: 'سود بیشتر در بازارها و معاملات دریایی',
    en: 'Higher silver profits from market voyages',
  },
  craft: {
    fa: 'آهنگری، کشتی‌سازی و ساخت تجهیزات بهتر',
    en: 'Smithing, shipbuilding & artisan mastery',
  },
  farming: {
    fa: 'برداشت غله بیشتر و رونق مزارع خاندان',
    en: 'Richer harvests & estate food stores',
  },
  seidr: {
    fa: 'شناخت اسرار سرنوشت، رون‌ها و پیشگویی',
    en: 'Rune lore, wyrd insight & mystic rites',
  },
};

export function ActionsPanel({
  state,
  onGeneralAction,
  onRaid,
  onSail,
  onTrainSkill,
  onConquerCity,
}: ActionsPanelProps) {
  const lang = state.settings.language;
  const isFa = lang === 'fa';
  const [expandedDrawer, setExpandedDrawer] = useState<
    'train' | 'voyage' | 'raid' | 'hall' | null
  >('train');

  const otherPorts = SETTLEMENTS.filter((s) => s.id !== state.character.locationId);
  const [selectedSkill, setSelectedSkill] = useState<SkillKey>('combat');
  const [raidTargetId, setRaidTargetId] = useState<string>(
    otherPorts.find((s) => s.id === 'lindisfarne')?.id ?? otherPorts[0].id
  );
  const [raidTactic, setRaidTactic] = useState<RaidTactic>('shield_wall');
  const [sailDestId, setSailDestId] = useState<string>(
    otherPorts.find((s) => s.id === 'jorvik')?.id ?? otherPorts[0].id
  );
  const [hallOption, setHallOption] = useState<HallOptionId>('attend_thing');

  const used = state.yearlyActivitiesUsed ?? {};
  const famUsed = state.familyInteractionsUsed ?? {};
  const isChild = state.character.age < 15;
  const currentLoc = SETTLEMENTS_BY_ID[state.character.locationId] ?? SETTLEMENTS[0];
  const currentLocName = isFa
    ? SETTLEMENTS_FA[currentLoc.id]?.name ?? currentLoc.name
    : currentLoc.name.split(' (')[0];

  const validRaidTargetId = otherPorts.some((p) => p.id === raidTargetId)
    ? raidTargetId
    : otherPorts[0].id;
  const validSailDestId = otherPorts.some((p) => p.id === sailDestId)
    ? sailDestId
    : otherPorts[0].id;

  const sailDest = SETTLEMENTS_BY_ID[validSailDestId] ?? otherPorts[0];
  const sailDestName = isFa
    ? SETTLEMENTS_FA[sailDest.id]?.name ?? sailDest.name
    : sailDest.name.split(' (')[0];

  const effectiveSeamanship = state.character.skills.seamanship + (hasBoathouse(state) ? 3 : 0);
  const locIsFortified = isFortifiedEnemyCity(state, currentLoc.id);

  const voyageInfo = calculateVoyageMetrics(
    currentLoc,
    sailDest,
    state.season,
    state.year,
    effectiveSeamanship,
    state.realm.knarrs > 0
  );

  const canRaid =
    !used.raid && !isChild && state.realm.longships > 0 && state.realm.hirdWarriors > 0;
  const hasShips = state.realm.longships + state.realm.knarrs > 0;

  const skillOptions: NordicSelectOption<SkillKey>[] = (
    ['combat', 'seamanship', 'law', 'diplomacy', 'skaldcraft', 'trade'] as SkillKey[]
  ).map((skKey) => ({
    value: skKey,
    label: SKILL_LABELS[lang][skKey],
    sublabel: isFa ? SKILL_HINTS[skKey].fa : SKILL_HINTS[skKey].en,
    badge: isFa
      ? `سطح ${state.character.skills[skKey]}`
      : `Lv ${state.character.skills[skKey]}`,
    badgeTone: 'ice',
  }));

  const raidPortOptions: NordicSelectOption<string>[] = otherPorts.map((s) => {
    const sName = isFa ? SETTLEMENTS_FA[s.id]?.name ?? s.name : s.name;
    const regName = REGION_LABELS[lang][s.regionGroup];
    return {
      value: s.id,
      label: sName,
      sublabel: regName,
      badge: isFa
        ? `غنیمت ${s.baseWealth}/10 · دفاع ${s.baseDefense}/10`
        : `Loot ${s.baseWealth}/10 · Def ${s.baseDefense}/10`,
      badgeTone: s.baseDefense >= 7 ? 'danger' : 'gold',
    };
  });

  const raidTacticOptions: NordicSelectOption<RaidTactic>[] = [
    {
      value: 'shield_wall',
      label: isFa ? 'دیوار سپرها' : 'Shield Wall',
      sublabel: isFa
        ? 'نبرد مستقیم و متعادل با تکیه بر جنگجویان هیرد'
        : 'Balanced frontline clash relying on Hird strength',
      badge: isFa ? 'متعادل' : 'Balanced',
      badgeTone: 'ice',
    },
    {
      value: 'surprise',
      label: isFa ? 'شبیخون سحرگاه' : 'Dawn Ambush',
      sublabel: isFa
        ? 'یورش برق‌آسا قبل از طلوع · غنیمت بیشتر با ریسک بالاتر'
        : 'Strike before sunrise · Higher loot with sharper risk',
      badge: isFa ? 'ذکاوت' : 'Cunning',
      badgeTone: 'gold',
    },
    {
      value: 'ransom',
      label: isFa ? 'محاصره و گرفتن باج' : 'Demand Tribute',
      sublabel: isFa
        ? 'تهدید بندر به تسلیم نقره با تلفات کمتر'
        : 'Intimidate the port into paying silver with fewer casualties',
      badge: isFa ? 'کم‌خطر' : 'Safer',
      badgeTone: 'emerald',
    },
    {
      value: 'feigned_retreat',
      label: isFa ? 'فرار ساختگی' : 'Feigned Flight',
      sublabel: isFa
        ? 'کشاندن مدافعان به تله و شکستن صف دشمن'
        : 'Lure defenders out of formation into an ambush',
      badge: isFa ? 'تاکتیکی' : 'Tactical',
      badgeTone: 'ice',
    },
  ];

  const sailPortOptions: NordicSelectOption<string>[] = otherPorts.map((s) => {
    const sName = isFa ? SETTLEMENTS_FA[s.id]?.name ?? s.name : s.name;
    const regName = REGION_LABELS[lang][s.regionGroup];
    return {
      value: s.id,
      label: sName,
      sublabel: regName,
      badge: isFa ? `بازار ${s.baseWealth}/10` : `Wealth ${s.baseWealth}/10`,
      badgeTone: 'ice',
    };
  });

  const hallOptions: NordicSelectOption<HallOptionId>[] = [
    locIsFortified && onConquerCity
      ? {
          value: 'land',
          label: isFa
            ? `فتح نظامی دژ ${currentLocName}`
            : `Conquer Fortified ${currentLocName}`,
          sublabel: isFa
            ? 'حمله به دژ مستحکم با ۱ کشتی جنگی و حداقل ۱۲ جنگجو'
            : 'Storm the stronghold with 1 Longship & 12+ Warriors',
          badge: used.settle
            ? isFa
              ? 'انجام شد ✓'
              : 'Done ✓'
            : isFa
              ? '۱۲+ جنگجو'
              : '12+ Warriors',
          badgeTone: used.settle ? 'emerald' : 'danger',
        }
      : {
          value: 'land',
          label: isFa ? `خرید مزرعه در ${currentLocName}` : `Buy Farmland in ${currentLocName}`,
          sublabel: isFa
            ? 'گسترش املاک خاندان و افزایش درآمد سالانه نقره'
            : 'Expand dynasty estates & boost yearly silver income',
          badge: used.settle
            ? isFa
              ? 'انجام شد ✓'
              : 'Done ✓'
            : isFa
              ? '35 نقره'
              : '35 Silver',
          badgeTone: used.settle ? 'emerald' : 'gold',
        },
    {
      value: 'hold_feast',
      label: isFa ? 'برگزاری سوروسات بزرگ در تالار' : 'Host Great Mead-Hall Feast',
      sublabel: isFa
        ? 'باده و خوراک برای یاران · +۱۰ شادی و محبوبیت'
        : 'Ale & roast boar for the hall · +10 Joy & morale',
      badge: famUsed.act_hold_feast
        ? isFa
          ? 'انجام شد ✓'
          : 'Done ✓'
        : isFa
          ? '16 نقره'
          : '16 Silver',
      badgeTone: famUsed.act_hold_feast ? 'emerald' : 'gold',
    },
    {
      value: 'attend_thing',
      label: isFa ? 'سخنرانی در شورای ثینگ' : 'Speak at the Thing Assembly',
      sublabel: isFa
        ? 'دفاع از حق و قانون در جمع آزادمردان · +۶ شرافت'
        : 'Speak before the assembly of freemen · +6 Honor',
      badge: famUsed.act_attend_thing
        ? isFa
          ? 'انجام شد ✓'
          : 'Done ✓'
        : isFa
          ? 'رایگان'
          : 'Free',
      badgeTone: 'emerald',
    },
    {
      value: 'patronize_skald',
      label: isFa ? 'استخدام شاعر حماسه‌سرا (اسکالد)' : 'Hire a Skald Poet',
      sublabel: isFa
        ? 'سرایش اشعار رزمی به نام تو · +۲۶ شهرت'
        : 'Compose saga verses of your deeds · +26 Fame',
      badge: famUsed.act_patronize_skald
        ? isFa
          ? 'انجام شد ✓'
          : 'Done ✓'
        : isFa
          ? '15 نقره'
          : '15 Silver',
      badgeTone: famUsed.act_patronize_skald ? 'emerald' : 'gold',
    },
    {
      value: 'convert_faith',
      label:
        state.character.religion === Religion.Christian
          ? isFa
            ? 'بازگشت به آیین خدایان نورس'
            : 'Return to Old Norse Gods'
          : isFa
            ? 'پذیرش غسل تعمید مسیحی'
            : 'Accept Christian Baptism',
      sublabel: isFa
        ? `آیین کنونی: ${RELIGION_LABELS[lang][state.character.religion]}`
        : `Current faith: ${RELIGION_LABELS[lang][state.character.religion]}`,
      badge:
        famUsed.act_convert_pagan || famUsed.act_convert_christian
          ? isFa
            ? 'انجام شد ✓'
            : 'Done ✓'
          : isFa
            ? 'تغییر آیین'
            : 'Convert',
      badgeTone:
        famUsed.act_convert_pagan || famUsed.act_convert_christian ? 'emerald' : 'ice',
    },
  ];

  const canExecuteHallOption = (() => {
    switch (hallOption) {
      case 'land':
        if (locIsFortified && onConquerCity) {
          return !used.settle && state.realm.longships > 0 && state.realm.hirdWarriors >= 12;
        }
        return !used.settle && state.realm.silver >= 35;
      case 'hold_feast':
        return !famUsed.act_hold_feast && state.realm.silver >= 16;
      case 'attend_thing':
        return !famUsed.act_attend_thing;
      case 'patronize_skald':
        return !famUsed.act_patronize_skald && state.realm.silver >= 15;
      case 'convert_faith':
        return !(famUsed.act_convert_pagan || famUsed.act_convert_christian);
    }
  })();

  const handleExecuteHallOption = () => {
    switch (hallOption) {
      case 'land':
        if (locIsFortified && onConquerCity) {
          onConquerCity(currentLoc.id);
        } else {
          onGeneralAction('farm_settle');
        }
        break;
      case 'hold_feast':
        onGeneralAction('hold_feast');
        break;
      case 'attend_thing':
        onGeneralAction('attend_thing');
        break;
      case 'patronize_skald':
        onGeneralAction('patronize_skald');
        break;
      case 'convert_faith':
        onGeneralAction(
          state.character.religion === Religion.Christian ? 'convert_pagan' : 'convert_christian'
        );
        break;
    }
  };

  return (
    <div className="space-y-3 text-start">
      <div className="px-1 text-xs text-[#94A3B8]">
        {isFa
          ? 'فعالیت‌های امسال را از منوهای کشویی زیر انتخاب کن؛ هر بخش سالی یک‌بار باز است.'
          : 'Pick your yearly actions from the drawers below — each resets when you advance the year.'}
      </div>

      {/* Thrall Freedom Option */}
      {state.character.title === TitleRank.Thrall && (
        <button
          type="button"
          disabled={state.realm.silver < 25}
          onClick={() => onGeneralAction('buy_freedom')}
          className="w-full min-h-[58px] px-4 py-3 rounded-xl bg-[#1F1A12] border border-[#F59E0B] disabled:opacity-45 flex items-center justify-between gap-3 cursor-pointer"
        >
          <div className="flex items-center gap-3 text-start">
            <div className="w-9 h-9 rounded-lg bg-[#F59E0B]/15 flex items-center justify-center text-[#F59E0B] shrink-0">
              <LockOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#F1F5F9]">
                {isFa ? 'خریدن آزادی خودت!' : 'Buy Your Freedom'}
              </div>
              <div className="text-xs text-[#94A3B8]">
                {isFa ? 'آزاد شو و حق حمل سلاح بگیر · +۲۰ شرافت' : 'Become freeborn · +20 Honor'}
              </div>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-[#F59E0B] shrink-0 whitespace-nowrap">
            {isFa ? '25 نقره' : '25 Silver'}
          </span>
        </button>
      )}

      {/* 1. Train a Skill */}
      <NordicAccordion
        title={isFa ? 'تمرین و پرورش مهارت' : 'Train a Personal Skill'}
        subtitle={
          used.train
            ? isFa
              ? 'امسال تمرینت را انجام دادی'
              : 'Completed training for this year'
            : isFa
              ? 'انتخاب مهارت از لیست کشویی و افزایش سطح'
              : 'Choose a skill from the dropdown to hone this year'
        }
        icon={<GraduationCap className="w-4 h-4" />}
        accent="ice"
        statusNode={
          used.train ? <Check className="w-4 h-4 text-emerald-400 shrink-0" /> : undefined
        }
        isOpen={expandedDrawer === 'train'}
        onToggle={() => setExpandedDrawer(expandedDrawer === 'train' ? null : 'train')}
      >
        <div className="space-y-3">
          <NordicSelect
            label={isFa ? 'مهارت مورد نظر' : 'Select Skill'}
            value={selectedSkill}
            options={skillOptions}
            onChange={setSelectedSkill}
            disabled={Boolean(used.train)}
            icon={<GraduationCap className="w-4 h-4 text-[#38BDF8]" />}
          />
          <button
            type="button"
            disabled={Boolean(used.train)}
            onClick={() => {
              onTrainSkill(selectedSkill);
              setExpandedDrawer(null);
            }}
            className="w-full min-h-[44px] px-4 rounded-xl bg-[#0284C7] hover:bg-[#38BDF8] hover:text-[#0B1118] disabled:bg-[#1E293B] disabled:text-[#64748B] text-white font-bold text-xs transition-colors cursor-pointer"
          >
            {used.train
              ? isFa
                ? 'امسال تمرین انجام شده است'
                : 'Already Trained This Year'
              : isFa
                ? `تمرین ${SKILL_LABELS[lang][selectedSkill]}`
                : `Train ${SKILL_LABELS[lang][selectedSkill]}`}
          </button>
        </div>
      </NordicAccordion>

      {/* 2. Maritime Trade & Sea Voyage */}
      <NordicAccordion
        title={isFa ? 'تجارت و سفر دریایی' : 'Market Trade & Sea Voyage'}
        subtitle={
          isFa
            ? `معامله در بازار ${currentLocName} یا دریانوردی به بندر جدید`
            : `Trade goods in ${currentLocName} or sail to another port`
        }
        icon={<Compass className="w-4 h-4" />}
        accent="gold"
        statusNode={
          used.trade && used.travel ? (
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : !used.trade && !isChild ? (
            <span className="text-[11px] font-mono font-semibold text-emerald-400">
              {isFa ? '+نقره' : '+Silver'}
            </span>
          ) : undefined
        }
        isOpen={expandedDrawer === 'voyage'}
        onToggle={() => setExpandedDrawer(expandedDrawer === 'voyage' ? null : 'voyage')}
      >
        <div className="space-y-3.5">
          {/* Quick Trade Row */}
          <div className="p-3 rounded-xl bg-[#121C2A] border border-[#223247] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/15 text-[#F59E0B] flex items-center justify-center shrink-0">
                <Scale className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-[#F1F5F9] truncate">
                  {isFa ? `کاسبی در بازار ${currentLocName}` : `Market Trade in ${currentLocName}`}
                </div>
                <div className="text-[11px] text-[#94A3B8] truncate">
                  {isChild
                    ? isFa
                      ? 'نیازمند حداقل ۱۵ سال سن'
                      : 'Available at age 15+'
                    : used.trade
                      ? isFa
                        ? 'امسال معامله کردی'
                        : 'Traded this year'
                      : isFa
                        ? 'فروش خز و کهربا برای نقره نقد'
                        : 'Sell furs & amber for instant silver'}
                </div>
              </div>
            </div>
            <button
              type="button"
              disabled={Boolean(used.trade) || isChild}
              onClick={() => onGeneralAction('trade_voyage')}
              className="min-h-[44px] px-3.5 rounded-lg bg-[#F59E0B] hover:bg-[#FBBF24] disabled:bg-[#1E293B] disabled:text-[#64748B] text-[#0B1118] font-bold text-xs shrink-0 transition-colors cursor-pointer"
            >
              {used.trade ? (isFa ? 'انجام شد' : 'Done') : isFa ? 'معامله' : 'Trade'}
            </button>
          </div>

          {/* Sea Voyage Selector */}
          <div className="pt-2 border-t border-[#1E2D40] space-y-2.5">
            <NordicSelect
              label={isFa ? 'مقصد سفر دریایی' : 'Voyage Destination Port'}
              value={validSailDestId}
              options={sailPortOptions}
              onChange={setSailDestId}
              disabled={Boolean(used.travel)}
              icon={<MapPin className="w-4 h-4 text-[#38BDF8]" />}
            />

            <div className="flex items-center justify-between text-xs text-[#94A3B8] font-mono tabular-nums px-1">
              <span>
                {isFa
                  ? `${voyageInfo.nauticalMiles} مایل · ~${voyageInfo.sailingDays} روز`
                  : `${voyageInfo.nauticalMiles} NM · ~${voyageInfo.sailingDays} days`}
              </span>
              <span className={voyageInfo.dangerPct >= 30 ? 'text-rose-400' : 'text-[#38BDF8]'}>
                {isFa ? `خطر دریا ${voyageInfo.dangerPct}%` : `Sea Risk ${voyageInfo.dangerPct}%`}
              </span>
            </div>

            <button
              type="button"
              disabled={!hasShips || Boolean(used.travel)}
              onClick={() => onSail(validSailDestId)}
              className="w-full min-h-[44px] px-4 rounded-xl bg-[#0284C7] hover:bg-[#38BDF8] hover:text-[#0B1118] disabled:bg-[#1E293B] disabled:text-[#64748B] text-white font-bold text-xs transition-colors cursor-pointer"
            >
              {used.travel
                ? isFa
                  ? 'امسال سفر دریایی رفته‌ای'
                  : 'Already Sailed This Year'
                : hasShips
                  ? isFa
                    ? `حرکت به سوی ${sailDestName}`
                    : `Sail to ${sailDestName}`
                  : isFa
                    ? 'نیازمند ساخت کشتی (در بخش قلمرو)'
                    : 'Needs a Ship (build in Realm)'}
            </button>
          </div>
        </div>
      </NordicAccordion>

      {/* 3. Sea Raid */}
      <NordicAccordion
        title={isFa ? 'غارت و شبیخون دریایی' : 'Launch a Sea Raid'}
        subtitle={
          used.raid
            ? isFa
              ? 'امسال غارت دریایی انجام شد'
              : 'Completed coastal raid this year'
            : state.realm.longships === 0 || state.realm.hirdWarriors === 0
              ? isFa
                ? 'نیازمند ۱ کشتی جنگی و جنگجو در بخش قلمرو'
                : 'Needs 1 Longship & Warriors in Realm'
              : isFa
                ? 'انتخاب بندر هدف و تاکتیک حمله از منوی کشویی'
                : 'Choose target port & battle tactic'
        }
        icon={<Swords className="w-4 h-4" />}
        accent="crimson"
        statusNode={
          used.raid ? <Check className="w-4 h-4 text-emerald-400 shrink-0" /> : undefined
        }
        isOpen={expandedDrawer === 'raid'}
        onToggle={() => setExpandedDrawer(expandedDrawer === 'raid' ? null : 'raid')}
      >
        <div className="space-y-3">
          <NordicSelect
            label={isFa ? 'بندر هدف برای غارت' : 'Target Coastal Port'}
            value={validRaidTargetId}
            options={raidPortOptions}
            onChange={setRaidTargetId}
            disabled={Boolean(used.raid)}
            icon={<MapPin className="w-4 h-4 text-[#EF4444]" />}
          />

          <NordicSelect
            label={isFa ? 'تاکتیک حمله' : 'Battle Tactic'}
            value={raidTactic}
            options={raidTacticOptions}
            onChange={setRaidTactic}
            disabled={Boolean(used.raid)}
            icon={<Shield className="w-4 h-4 text-[#F59E0B]" />}
          />

          <button
            type="button"
            disabled={!canRaid}
            onClick={() => onRaid(validRaidTargetId, raidTactic)}
            className="w-full min-h-[46px] px-4 rounded-xl bg-[#DC2626] hover:bg-[#EF4444] disabled:bg-[#1E293B] disabled:text-[#64748B] text-white font-bold text-xs transition-colors cursor-pointer"
          >
            {used.raid
              ? isFa
                ? 'امسال غارت رفتی!'
                : 'Already Raided This Year'
              : canRaid
                ? isFa
                  ? 'فرمان یورش به ساحل!'
                  : 'Launch Coastal Raid!'
                : isFa
                  ? 'نیازمند سن ۱۵+، کشتی جنگی و جنگجو'
                  : 'Requires Age 15+, Longship & Warriors'}
          </button>
        </div>
      </NordicAccordion>

      {/* 4. Hall, Council, Land & Faith */}
      {!isChild && (
        <NordicAccordion
          title={isFa ? 'تالار، شورا، زمین و آیین' : 'Hall, Council, Land & Faith'}
          subtitle={
            isFa
              ? 'جشن، خرید مزرعه، سخنرانی در ثینگ، شاعر یا تغییر آیین'
              : 'Feasts, farmland, Thing speeches, skalds & faith'
          }
          icon={<Flame className="w-4 h-4" />}
          accent="gold"
          isOpen={expandedDrawer === 'hall'}
          onToggle={() => setExpandedDrawer(expandedDrawer === 'hall' ? null : 'hall')}
        >
          <div className="space-y-3">
            <NordicSelect
              label={isFa ? 'انتخاب تصمیم تالار و شورا' : 'Choose Hall or Council Action'}
              value={hallOption}
              options={hallOptions}
              onChange={setHallOption}
              icon={<Flame className="w-4 h-4 text-[#F59E0B]" />}
            />

            <button
              type="button"
              disabled={!canExecuteHallOption}
              onClick={handleExecuteHallOption}
              className="w-full min-h-[46px] px-4 rounded-xl bg-[#E07A2F] hover:bg-[#F59E0B] disabled:bg-[#1E293B] disabled:text-[#64748B] text-[#0B1118] font-bold text-xs transition-colors cursor-pointer"
            >
              {canExecuteHallOption
                ? isFa
                  ? 'اجرای تصمیم انتخاب‌شده'
                  : 'Enact Selected Action'
                : isFa
                  ? 'انجام شده یا نقره/نیروی کافی نداری'
                  : 'Already Done or Insufficient Silver / Forces'}
            </button>
          </div>
        </NordicAccordion>
      )}
    </div>
  );
}
