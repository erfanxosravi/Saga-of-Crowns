import { useState } from 'react';
import {
  Calendar,
  Compass,
  Crown,
  Dices,
  FolderOpen,
  HelpCircle,
  MapPin,
  Play,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { SETTLEMENTS } from '../data/geography';
import {
  FEMALE_NAMES_BY_REGION,
  HISTORICAL_ERAS,
  MALE_NAMES_BY_REGION,
  makePatronymic,
  PREMADE_CHARACTERS,
  SELECTABLE_TRAITS,
  SOCIAL_CLASS_CONFIG,
  WIN_GOALS,
} from '../data/namesAndTraits';
import { NewGameParams } from '../engine/gameEngine';
import { generateReadableSeed } from '../engine/prng';
import {
  formatPersonName,
  PREMADE_CHARACTERS_FA,
  SETTLEMENTS_FA,
  SOCIAL_CLASS_FA,
  TRAITS_FA,
  WIN_GOALS_FA,
} from '../i18n/gameDataFa';
import {
  CLASS_SHORT_LABELS_I18N,
  formatAgeLabel,
  formatYearLabel,
  isRtl,
  REGION_LABELS,
  RELIGION_LABELS,
} from '../i18n/ui';
import {
  CharacterAppearance,
  FullGameState,
  Language,
  PremadeCharacter,
  RegionGroup,
  Religion,
  Sex,
  SocialClass,
} from '../types/game';
import longshipHeroUrl from '../assets/images/viking_longship_ember_dusk_1793047790383.jpg';
import { NordicAccordion, NordicSelect } from './NordicControls';
import { VikingPortrait } from './VikingPortrait';

interface CharacterCreationProps {
  lang: Language;
  onOpenGuide: () => void;
  savedGame: FullGameState | null;
  onResumeSaved: () => void;
  onStartNewGame: (params: NewGameParams) => void;
  onOpenLoadModal: () => void;
}

const REGION_IDS: RegionGroup[] = [
  'Norway',
  'Denmark',
  'Sweden',
  'British Isles',
  'Ireland',
  'Continent',
  'North Atlantic',
];

const CLASS_IDS: SocialClass[] = [
  SocialClass.Thrall,
  SocialClass.Karl,
  SocialClass.Bonde,
  SocialClass.HersirKin,
  SocialClass.JarlKin,
  SocialClass.Royal,
];

const HAIR_COLORS: CharacterAppearance['hairColor'][] = ['blonde', 'red', 'brown', 'black'];

const ERA_INFO: Record<
  1 | 2 | 3 | 4,
  { year: number; shortEn: string; shortFa: string; descEn: string; descFa: string }
> = {
  1: {
    year: 793,
    shortEn: '793 · First Raids',
    shortFa: '۷۹۳ · آغاز غارت‌ها',
    descEn: 'Early coastal raids on Lindisfarne, Iona, Dublin & Frankish rivers.',
    descFa: 'اولین یورش‌های دریایی به صومعه لیندیسفارن، ایرلند و رودهای فرانسه.',
  },
  2: {
    year: 865,
    shortEn: '865 · Great Army',
    shortFa: '۸۶۵ · ارتش بزرگ',
    descEn: 'Conquest of York & Danelaw, Harald Fairhair in Norway & settling Iceland.',
    descFa: 'لشکرکشی پسران راگنار به انگلستان، اتحاد نروژ و کوچ بزرگ به ایسلند.',
  },
  3: {
    year: 960,
    shortEn: '960 · Kings & West',
    shortFa: '۹۶۰ · شاهان و غرب',
    descEn: 'Great Scandinavian kingdoms, conversion debates, Greenland & Vinland.',
    descFa: 'پادشاهی‌های شمال، کشمکش خدایان کهن با مسیحیت، کشف گرینلند و وینلند.',
  },
  4: {
    year: 1016,
    shortEn: '1016 · Sea Empire',
    shortFa: '۱۰۱۶ · امپراتوری دریا',
    descEn: 'Cnut’s North Sea Empire down to Harald Hardrada & Stamford Bridge (1066).',
    descFa: 'امپراتوری کانوت کبیر تا نبرد پایانی عصر وایکینگ‌ها در سال ۱۰۶۶ میلادی.',
  },
};

export function CharacterCreation({
  lang,
  onOpenGuide,
  savedGame,
  onResumeSaved,
  onStartNewGame,
  onOpenLoadModal,
}: CharacterCreationProps) {
  const isFa = lang === 'fa';
  const rtl = isRtl(lang);

  const [mode, setMode] = useState<'create' | 'presets'>('create');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [bgFailed, setBgFailed] = useState(false);

  const [selectedEra, setSelectedEra] = useState<1 | 2 | 3 | 4>(2);
  const [year, setYear] = useState<number>(865);
  const [regionGroup, setRegionGroup] = useState<RegionGroup>('Norway');
  const [birthplaceId, setBirthplaceId] = useState<string>('nidaros');
  const [sex, setSex] = useState<Sex>(Sex.Male);
  const [givenName, setGivenName] = useState<string>('Sigurd');
  const [patronymic, setPatronymic] = useState<string>('Hakonsson');
  const [socialClass, setSocialClass] = useState<SocialClass>(SocialClass.Bonde);
  const [religion, setReligion] = useState<Religion>(Religion.NorsePagan);
  const [startAge, setStartAge] = useState<number>(16);
  const [selectedTraits, setSelectedTraits] = useState<string[]>(['brave', 'seafarer']);
  const [winGoalId, setWinGoalId] = useState<string>('freeform_dynasty');
  const [seedString, setSeedString] = useState<string>(() => generateReadableSeed());
  const [appearance, setAppearance] = useState<CharacterAppearance>({
    skinTone: 1,
    hairColor: 'blonde',
    hairStyle: 1,
    beardStyle: 2,
  });

  const settlementsInRegion = SETTLEMENTS.filter((s) => s.regionGroup === regionGroup);
  const classCfg = SOCIAL_CLASS_CONFIG[socialClass];

  const rollName = (reg: RegionGroup, nextSex: Sex) => {
    const gPool = nextSex === Sex.Male ? MALE_NAMES_BY_REGION[reg] : FEMALE_NAMES_BY_REGION[reg];
    const fPool = MALE_NAMES_BY_REGION[reg];
    const g = gPool[Math.floor(Math.random() * gPool.length)];
    const f = fPool[Math.floor(Math.random() * fPool.length)];
    setGivenName(g);
    setPatronymic(makePatronymic(f, nextSex));
  };

  const cycleAppearance = () => {
    setAppearance({
      skinTone: Math.floor(Math.random() * 4) as 0 | 1 | 2 | 3,
      hairColor: HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)],
      hairStyle: Math.floor(Math.random() * 4) as 0 | 1 | 2 | 3,
      beardStyle: Math.floor(Math.random() * 4) as 0 | 1 | 2 | 3,
    });
  };

  const handleRegionPick = (reg: RegionGroup) => {
    setRegionGroup(reg);
    const matching = SETTLEMENTS.filter((s) => s.regionGroup === reg);
    if (matching.length > 0) setBirthplaceId(matching[0].id);
    rollName(reg, sex);
  };

  const handleRandomizeEverything = () => {
    const randomReg = REGION_IDS[Math.floor(Math.random() * REGION_IDS.length)];
    const randomSex = Math.random() < 0.5 ? Sex.Male : Sex.Female;
    const randomClass = CLASS_IDS[Math.floor(Math.random() * CLASS_IDS.length)];
    const randomEra = HISTORICAL_ERAS[Math.floor(Math.random() * HISTORICAL_ERAS.length)];
    const matchingPorts = SETTLEMENTS.filter((s) => s.regionGroup === randomReg);
    const port = matchingPorts[Math.floor(Math.random() * matchingPorts.length)] ?? SETTLEMENTS[0];

    const shuffledTraits = [...SELECTABLE_TRAITS].sort(() => Math.random() - 0.5);

    setRegionGroup(randomReg);
    setBirthplaceId(port.id);
    setSex(randomSex);
    setSocialClass(randomClass);
    setSelectedEra(randomEra.id);
    setYear(randomEra.defaultYear);
    setSelectedTraits([shuffledTraits[0].id, shuffledTraits[1].id]);
    cycleAppearance();
    rollName(randomReg, randomSex);
  };

  const handleToggleTrait = (traitId: string) => {
    if (selectedTraits.includes(traitId)) {
      if (selectedTraits.length > 1) {
        setSelectedTraits(selectedTraits.filter((t) => t !== traitId));
      }
      return;
    }
    if (selectedTraits.length >= 3) {
      setSelectedTraits([...selectedTraits.slice(1), traitId]);
    } else {
      setSelectedTraits([...selectedTraits, traitId]);
    }
  };

  const handleStart = () => {
    onStartNewGame({
      givenName: givenName.trim() || 'Sigurd',
      patronymic: patronymic.trim() || 'Hakonsson',
      sex,
      year: Math.max(793, Math.min(1066, year)),
      startAge,
      birthplaceId,
      socialClass,
      religion,
      traits: selectedTraits,
      winGoalId,
      seedString: seedString.trim() || generateReadableSeed(),
      appearance,
    });
  };

  const handleStartPreset = (pm: PremadeCharacter) => {
    onStartNewGame({
      givenName: pm.name,
      patronymic: pm.patronymic,
      sex: pm.sex,
      year: pm.year,
      startAge: pm.age,
      birthplaceId: pm.birthplaceId,
      socialClass: pm.socialClass,
      religion: pm.religion,
      traits: pm.traits,
      winGoalId: pm.winGoalId,
      seedString: generateReadableSeed(),
      bonusSilver: pm.bonusSilver,
      bonusShips: pm.bonusShips,
      bonusWarriors: pm.bonusWarriors,
      startingFlags: pm.startingFlags,
    });
  };

  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      className="relative z-10 h-dvh w-full overflow-y-auto overflow-x-hidden bg-[#0B1118] text-[#F1F5F9]"
    >
      {!bgFailed && (
        <div className="pointer-events-none fixed inset-x-0 top-0 h-72 opacity-25 overflow-hidden">
          <img
            src={longshipHeroUrl}
            alt="Viking longship at dusk"
            referrerPolicy="no-referrer"
            onError={() => setBgFailed(true)}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B1118]/75 to-[#0B1118]" />
        </div>
      )}

      <div className="relative z-10 min-h-full w-full max-w-xl sm:max-w-2xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8 flex flex-col justify-start sm:justify-center gap-4">
        {/* Top Utility Strip */}
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onOpenGuide}
            className="min-h-[44px] px-3.5 rounded-xl bg-[#131D2B]/95 border border-[#233246] hover:border-[#38BDF8] text-xs font-medium text-[#F1F5F9] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-[#38BDF8]" />
            <span>{isFa ? 'راهنمای سریع بازی' : 'How to Play'}</span>
          </button>
        </div>

        {/* Game Logo Title */}
        <div className="text-center space-y-1 pt-1">
          <div className="text-xs font-mono tracking-widest text-[#38BDF8]">᛫ ELDSAGA ᛫</div>
          <h1 className="font-saga text-4xl sm:text-5xl font-bold text-[#F1F5F9]">
            {isFa ? 'زندگی وایکینگی' : 'Saga of Embers'}
          </h1>
          <p className="text-xs text-[#94A3B8]">
            {isFa
              ? 'زندگی کن، غارت برو، بمیر و با وارثت ادامه بده! · ۷۹۳ تا ۱۰۶۶ میلادی'
              : 'Live fast, raid hard, die gloriously & rule through your heirs · 793–1066 AD'}
          </p>
        </div>

        {/* Continue Saved Game Banner */}
        {savedGame && (
          <button
            type="button"
            onClick={onResumeSaved}
            className="w-full min-h-[60px] px-4 py-3 rounded-xl bg-[#132235] border border-[#F59E0B] hover:bg-[#192C44] transition-colors flex items-center justify-between gap-3 cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0 text-start">
              <VikingPortrait
                age={savedGame.character.age}
                sex={savedGame.character.sex}
                traits={savedGame.character.traits}
                title={savedGame.character.title}
                appearance={savedGame.character.appearance}
                seedId={savedGame.character.id}
                size={44}
              />
              <div className="min-w-0 flex-1">
                <div className="text-xs text-[#F59E0B] font-semibold">
                  {isFa ? 'ادامه بازی قبلی' : 'Continue Current Life'}
                </div>
                <div className="font-saga text-base sm:text-lg font-bold text-[#F1F5F9] line-clamp-2 break-words leading-snug">
                  {formatPersonName(
                    `${savedGame.character.givenName} ${savedGame.character.patronymic}`,
                    lang
                  )}{' '}
                  · {formatAgeLabel(savedGame.character.age, lang)} (
                  {formatYearLabel(savedGame.year, lang)})
                </div>
              </div>
            </div>
            <RotateCcw className="w-5 h-5 text-[#F59E0B] shrink-0" />
          </button>
        )}

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-[#131D2B] border border-[#233246] rounded-xl">
          <button
            type="button"
            onClick={() => setMode('create')}
            className={`min-h-[44px] px-3 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              mode === 'create'
                ? 'bg-[#F59E0B] text-[#0B1118]'
                : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            }`}
          >
            {isFa ? 'ساخت شخصیت جدید' : 'Custom Viking'}
          </button>
          <button
            type="button"
            onClick={() => setMode('presets')}
            className={`min-h-[44px] px-3 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              mode === 'presets'
                ? 'bg-[#F59E0B] text-[#0B1118]'
                : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            }`}
          >
            {isFa ? '۵ شخصیت آماده تاریخی' : '5 Historical Lives'}
          </button>
        </div>

        {mode === 'presets' ? (
          <div className="space-y-2.5">
            {PREMADE_CHARACTERS.map((pm) => {
              const place = SETTLEMENTS.find((s) => s.id === pm.birthplaceId);
              const pmFa = PREMADE_CHARACTERS_FA[pm.id];
              const placeName = isFa
                ? SETTLEMENTS_FA[pm.birthplaceId]?.name ?? place?.name
                : place?.name;
              return (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => handleStartPreset(pm)}
                  className="w-full p-4 text-start rounded-xl bg-[#131D2B] border border-[#233246] hover:border-[#F59E0B] transition-colors flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <VikingPortrait
                      age={pm.age}
                      sex={pm.sex}
                      traits={pm.traits}
                      title={SOCIAL_CLASS_CONFIG[pm.socialClass].startingTitle}
                      seedId={pm.id}
                      size={56}
                    />
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="font-saga text-xl font-bold text-[#F1F5F9] break-words leading-snug">
                        {isFa
                          ? pmFa?.displayName ?? `${pm.name} ${pm.patronymic}`
                          : `${pm.name} ${pm.patronymic}`}
                      </div>
                      <div className="text-xs text-[#38BDF8] break-words leading-snug">
                        {isFa ? pmFa?.subtitle ?? pm.subtitle : pm.subtitle} · {placeName}
                      </div>
                      <p className="text-xs text-[#94A3B8] leading-relaxed">
                        {isFa ? pmFa?.context ?? pm.historicalContext : pm.historicalContext}
                      </p>
                    </div>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-[#F59E0B] text-[#0B1118] flex items-center justify-center shrink-0">
                    <Play className={`w-4 h-4 fill-current ${isFa ? 'rotate-180' : ''}`} />
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-4 sm:p-6 rounded-2xl bg-[#131D2B] border border-[#233246] space-y-4 text-start">
            {/* Live Portrait + Name & Sex Row */}
            <div className="flex items-center gap-3.5">
              <button
                type="button"
                onClick={cycleAppearance}
                title={isFa ? 'تغییر قیافه، مو و ریش' : 'Tap to change hair, beard & skin'}
                className="relative group cursor-pointer shrink-0"
              >
                <VikingPortrait
                  age={startAge}
                  sex={sex}
                  traits={selectedTraits}
                  title={classCfg.startingTitle}
                  appearance={appearance}
                  seedId="creator_preview"
                  size={68}
                />
                <span className="absolute -bottom-1 inset-x-1 rounded bg-[#0B1118]/90 border border-[#38BDF8]/40 text-[9px] text-[#38BDF8] text-center py-0.5 font-semibold">
                  {isFa ? 'تغییر چهره' : 'Restyle'}
                </span>
              </button>

              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                  <span className="truncate">
                    {formatPersonName(`${givenName} ${patronymic}`, lang)}
                  </span>
                  <button
                    type="button"
                    onClick={handleRandomizeEverything}
                    className="text-[#F59E0B] hover:underline inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {isFa ? 'تصادفی کامل' : 'Randomize'}
                  </button>
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={givenName}
                    onChange={(e) => setGivenName(e.target.value)}
                    placeholder={isFa ? 'نام' : 'Name'}
                    aria-label="Given Name"
                    className="flex-1 min-w-0 min-h-[42px] px-3 text-sm bg-[#0B1118] border border-[#283B52] rounded-lg text-[#F1F5F9] focus:outline-none focus:border-[#38BDF8]"
                  />
                  <button
                    type="button"
                    onClick={() => rollName(regionGroup, sex)}
                    title={isFa ? 'نام تصادفی وایکینگی' : 'Roll Norse Name'}
                    className="min-w-[42px] min-h-[42px] flex items-center justify-center bg-[#0B1118] border border-[#283B52] hover:border-[#38BDF8] rounded-lg text-[#38BDF8] cursor-pointer shrink-0"
                  >
                    <Dices className="w-4 h-4" />
                  </button>
                  <div className="flex p-1 bg-[#0B1118] border border-[#283B52] rounded-lg shrink-0">
                    {([Sex.Male, Sex.Female] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setSex(s);
                          rollName(regionGroup, s);
                        }}
                        className={`px-2.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                          sex === s ? 'bg-[#38BDF8] text-[#0B1118] font-bold' : 'text-[#94A3B8]'
                        }`}
                      >
                        {s === Sex.Male ? (isFa ? 'مرد' : 'M') : isFa ? 'زن' : 'F'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sleek Dropdown Selectors (Era, Homeland & Port, Social Class) */}
            <div className="space-y-3">
              <NordicSelect
                label={isFa ? 'دوره تاریخی شروع' : 'Historical Era'}
                value={String(selectedEra)}
                icon={<Calendar className="w-4 h-4 text-[#38BDF8]" />}
                onChange={(val) => {
                  const nextEra = Number(val) as 1 | 2 | 3 | 4;
                  setSelectedEra(nextEra);
                  setYear(ERA_INFO[nextEra].year);
                }}
                options={([1, 2, 3, 4] as const).map((eId) => ({
                  value: String(eId),
                  label: isFa ? ERA_INFO[eId].shortFa : ERA_INFO[eId].shortEn,
                  sublabel: isFa ? ERA_INFO[eId].descFa : ERA_INFO[eId].descEn,
                  badge: formatYearLabel(ERA_INFO[eId].year, lang),
                  badgeTone: 'ice',
                }))}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <NordicSelect
                  label={isFa ? 'سرزمین زادگاه' : 'Homeland'}
                  value={regionGroup}
                  icon={<Compass className="w-4 h-4 text-[#38BDF8]" />}
                  onChange={(val) => handleRegionPick(val as RegionGroup)}
                  options={REGION_IDS.map((rId) => ({
                    value: rId,
                    label: REGION_LABELS[lang][rId],
                  }))}
                />

                <NordicSelect
                  label={isFa ? 'بندر یا شهر تولد' : 'Birth Port'}
                  value={birthplaceId}
                  icon={<MapPin className="w-4 h-4 text-[#F59E0B]" />}
                  onChange={(val) => setBirthplaceId(val)}
                  options={settlementsInRegion.map((s) => ({
                    value: s.id,
                    label: isFa ? SETTLEMENTS_FA[s.id]?.name ?? s.name : s.name.split(' (')[0],
                  }))}
                />
              </div>

              <NordicSelect
                label={isFa ? 'طبقه اجتماعی در شروع' : 'Starting Social Status'}
                value={socialClass}
                icon={<Crown className="w-4 h-4 text-[#F59E0B]" />}
                onChange={(val) => setSocialClass(val as SocialClass)}
                options={CLASS_IDS.map((cId) => {
                  const cfg = SOCIAL_CLASS_CONFIG[cId];
                  const sub = isFa
                    ? `${cfg.silver} نقره · ${cfg.farms} مزرعه · ${cfg.longships + cfg.knarrs} کشتی · ${cfg.warriors} جنگجو`
                    : `${cfg.silver} Silver · ${cfg.farms} Farms · ${cfg.longships + cfg.knarrs} Ships · ${cfg.warriors} Warriors`;
                  return {
                    value: cId,
                    label: CLASS_SHORT_LABELS_I18N[lang][cId],
                    sublabel: sub,
                    badge: isFa ? SOCIAL_CLASS_FA[cId].norseTerm : cfg.norseTerm,
                    badgeTone: 'gold',
                  };
                })}
              />
            </div>

            {/* Collapsible Drawer: Traits, Start Age, Faith & Dynasty Goal */}
            <NordicAccordion
              title={
                isFa
                  ? 'ویژگی‌های شخصیتی، سن شروع و هدف خاندان'
                  : 'Traits, Start Age, Faith & Goal'
              }
              subtitle={
                isFa
                  ? `${formatAgeLabel(startAge, 'fa')} · ${selectedTraits
                      .map((tid) => TRAITS_FA[tid]?.name ?? tid)
                      .join('، ')}`
                  : `${formatAgeLabel(startAge, 'en')} · ${selectedTraits
                      .map((tid) => SELECTABLE_TRAITS.find((t) => t.id === tid)?.name ?? tid)
                      .join(', ')}`
              }
              icon={<SlidersHorizontal className="w-4 h-4" />}
              accent="ice"
              isOpen={showAdvanced}
              onToggle={() => setShowAdvanced((v) => !v)}
            >
              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <NordicSelect
                    label={isFa ? 'سن شروع زندگی' : 'Starting Age'}
                    value={String(startAge)}
                    onChange={(val) => setStartAge(Number(val))}
                    options={[
                      {
                        value: '16',
                        label: isFa ? '۱۶ ساله (جوان آماده نبرد)' : 'Age 16 (Young Adult)',
                        sublabel: isFa ? 'ورود مستقیم به سفر و غارت' : 'Ready for raids & voyages',
                      },
                      {
                        value: '6',
                        label: isFa ? '۶ ساله (دوران کودکی)' : 'Age 6 (Childhood)',
                        sublabel: isFa ? 'تجربه شیطنت‌ها و آموزش کودکی' : 'Childhood events & training',
                      },
                      {
                        value: '0',
                        label: isFa ? 'نوزاد تازه متولدشده (۰ سال)' : 'Newborn (Age 0)',
                        sublabel: isFa ? 'زندگی کامل از گهواره تا والهالا' : 'Full life from cradle to grave',
                      },
                    ]}
                  />

                  <NordicSelect
                    label={isFa ? 'آیین و باور' : 'Starting Faith'}
                    value={religion}
                    onChange={(val) => setReligion(val as Religion)}
                    options={[
                      {
                        value: Religion.NorsePagan,
                        label: RELIGION_LABELS[lang][Religion.NorsePagan],
                      },
                      {
                        value: Religion.Syncretic,
                        label: RELIGION_LABELS[lang][Religion.Syncretic],
                      },
                      {
                        value: Religion.Christian,
                        label: RELIGION_LABELS[lang][Religion.Christian],
                      },
                    ]}
                  />
                </div>

                <NordicSelect
                  label={isFa ? 'هدف بزرگ خاندان' : 'Dynasty Ambition'}
                  value={winGoalId}
                  onChange={(val) => setWinGoalId(val)}
                  options={WIN_GOALS.map((wg) => ({
                    value: wg.id,
                    label: isFa ? WIN_GOALS_FA[wg.id]?.title ?? wg.title : wg.title,
                    sublabel: isFa
                      ? WIN_GOALS_FA[wg.id]?.description ?? wg.description
                      : wg.description,
                  }))}
                />

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-[#94A3B8]">
                    <span>{isFa ? 'ویژگی‌های شخصیتی (تا ۳ مورد)' : 'Traits (Up to 3)'}</span>
                    <span className="font-mono tabular-nums text-[#38BDF8]">
                      {selectedTraits.length}/3
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pe-0.5">
                    {SELECTABLE_TRAITS.map((t) => {
                      const active = selectedTraits.includes(t.id);
                      const tFa = TRAITS_FA[t.id];
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleToggleTrait(t.id)}
                          title={isFa ? tFa?.description ?? t.description : t.description}
                          className={`min-h-[44px] px-2.5 py-1.5 text-xs rounded-lg border text-start flex items-center justify-between gap-1.5 transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#192A3E] border-[#38BDF8] text-[#F1F5F9] font-semibold'
                              : 'bg-[#0B1118] border-[#233246] text-[#94A3B8] hover:text-[#F1F5F9]'
                          }`}
                        >
                          <span className="truncate">{isFa ? tFa?.name ?? t.name : t.name}</span>
                          {active && <span className="text-[#38BDF8] font-bold shrink-0">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-[#1E2D40]">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-[#94A3B8]">
                      <span>{isFa ? 'سال دقیق شروع' : 'Exact Year'}</span>
                      <span className="font-mono tabular-nums text-[#F1F5F9]">
                        {formatYearLabel(year, lang)}
                      </span>
                    </div>
                    <input
                      dir="ltr"
                      type="range"
                      min={793}
                      max={1066}
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      className="w-full accent-[#F59E0B] cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-[#94A3B8] block">
                      {isFa ? 'کد تصادفی دنیا (Seed)' : 'World Seed'}
                    </label>
                    <input
                      dir="ltr"
                      type="text"
                      value={seedString}
                      onChange={(e) => setSeedString(e.target.value)}
                      className="w-full min-h-[44px] px-3 text-xs font-mono bg-[#0B1118] border border-[#24354C] rounded-xl text-[#F1F5F9] focus:outline-none focus:border-[#38BDF8]"
                    />
                  </div>
                </div>
              </div>
            </NordicAccordion>

            {/* Primary Start Game CTA */}
            <button
              type="button"
              onClick={handleStart}
              className="w-full min-h-[54px] bg-[#F59E0B] hover:bg-[#FBBF24] active:scale-[0.99] text-[#0B1118] font-extrabold text-base rounded-xl shadow-[0_0_24px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Play className={`w-4 h-4 fill-current ${isFa ? 'rotate-180' : ''}`} />
              <span>{isFa ? 'شروع زندگی جدید!' : 'Start New Life'}</span>
            </button>
          </div>
        )}

        {/* Bottom Save Slots Link */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onOpenLoadModal}
            className="min-h-[44px] px-4 text-xs text-[#94A3B8] hover:text-[#F1F5F9] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <FolderOpen className="w-4 h-4" />
            {isFa ? 'جایگاه‌های ذخیره و تنظیمات' : 'Save Slots & Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
