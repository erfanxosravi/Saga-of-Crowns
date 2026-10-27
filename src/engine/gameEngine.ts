import {
  BITLIFE_ACHIEVEMENTS,
  evaluateLifeReportTitle,
  resolveDeathCardDetails,
} from '../data/deathsAndAchievements';
import { ALL_EVENTS, EVENTS_BY_ID } from '../data/events';
import {
  calculateVoyageMetrics,
  SETTLEMENTS,
  SETTLEMENTS_BY_ID,
} from '../data/geography';
import { WORLD_CHRONICLES } from '../data/historicalTimeline';
import {
  ALL_TRAITS_MAP,
  BUILDINGS_CATALOG,
  FEMALE_NAMES_BY_REGION,
  MALE_NAMES_BY_REGION,
  makePatronymic,
  SOCIAL_CLASS_CONFIG,
  TITLE_LADDER,
  WIN_GOALS,
} from '../data/namesAndTraits';
import { EVENTS_FA } from '../i18n/eventsFa';
import {
  BUILDINGS_FA,
  formatDynastyName,
  formatPersonName,
  SETTLEMENTS_FA,
  SOCIAL_CLASS_FA,
  TRAITS_FA,
  WIN_GOALS_FA,
  WORLD_CHRONICLES_FA,
} from '../i18n/gameDataFa';
import {
  EPITHET_FA,
  RELIGION_LABELS,
  ROLE_LABELS,
  SEASON_LABELS,
  SHORT_TITLE_LABELS,
  SKILL_LABELS,
  STAT_LABELS,
  TITLE_LABELS,
} from '../i18n/ui';
import {
  BuildingType,
  CharacterAppearance,
  CharacterState,
  ContentIntensity,
  Difficulty,
  DynastyAncestor,
  EventConditions,
  FullGameState,
  GameEvent,
  GameScreen,
  GameSettings,
  Holding,
  Language,
  LogEntry,
  PersonalStats,
  RegionGroup,
  RelationshipPerson,
  Religion,
  Season,
  Sex,
  SkillKey,
  SkillsState,
  SocialClass,
  TitleRank,
  TimeStepMode,
} from '../types/game';
import { hashSeedString, SeededRNG } from './prng';
import { CURRENT_SAVE_VERSION, deriveAppearanceFromId } from './storage';

function clampStat(val: number): number {
  return Math.max(0, Math.min(100, Math.round(val)));
}

function clampSkill(val: number): number {
  return Math.max(0, Math.min(100, Math.round(val)));
}

export function getEraFromYear(year: number): 1 | 2 | 3 | 4 {
  if (year < 865) return 1;
  if (year < 954) return 2;
  if (year < 1016) return 3;
  return 4;
}

function getNearbyDiscoveredIds(startId: string, year: number): string[] {
  const start = SETTLEMENTS_BY_ID[startId] ?? SETTLEMENTS[0];
  const discovered = new Set<string>([start.id]);
  for (const s of SETTLEMENTS) {
    if (s.foundedYear && year < s.foundedYear - 5) continue;
    const sameRegion = s.regionGroup === start.regionGroup;
    const dLat = Math.abs(s.lat - start.lat);
    const dLon = Math.abs(s.lon - start.lon);
    if (sameRegion || (dLat < 6.5 && dLon < 13)) {
      discovered.add(s.id);
    }
  }
  // Major emporia known by rumor to most northern mariners
  ['hedeby', 'kaupang', 'birka', 'jorvik', 'dublin'].forEach((id) => discovered.add(id));
  return Array.from(discovered);
}

export interface NewGameParams {
  givenName: string;
  patronymic?: string;
  sex: Sex;
  year: number;
  startAge: number;
  birthplaceId: string;
  socialClass: SocialClass;
  religion: Religion;
  traits: string[];
  winGoalId: string;
  seedString: string;
  appearance?: CharacterAppearance;
  bonusSilver?: number;
  bonusShips?: number;
  bonusWarriors?: number;
  startingFlags?: string[];
}

function generateInitialFamily(
  rng: SeededRNG,
  region: RegionGroup,
  locationId: string,
  socialClass: SocialClass,
  playerAge: number,
  fatherNameInput?: string
): { fatherName: string; relationships: RelationshipPerson[] } {
  const malePool = MALE_NAMES_BY_REGION[region];
  const femalePool = FEMALE_NAMES_BY_REGION[region];

  const fatherGiven = fatherNameInput || rng.pick(malePool);
  const grandFather = rng.pick(malePool);
  const motherGiven = rng.pick(femalePool);
  const matGrandFather = rng.pick(malePool);

  const fatherAge = playerAge + rng.int(20, 32);
  const motherAge = playerAge + rng.int(18, 28);

  const relationships: RelationshipPerson[] = [
    {
      id: `rel_father_${rng.int(1000, 9999)}`,
      name: `${fatherGiven} ${makePatronymic(grandFather, Sex.Male)}`,
      sex: Sex.Male,
      role: 'Father',
      age: fatherAge,
      alive: fatherAge < 62 ? rng.chance(0.78) : rng.chance(0.35),
      affinity: rng.int(65, 92),
      socialClass,
      locationId,
      traits: [rng.pick(['brave', 'strong_limbed', 'oath_keeper', 'seafarer'])],
      causeOfDeath: 'Fell in an earlier coastal skirmish',
      causeOfDeathFa: 'کشته‌شده در یک درگیری ساحلی پیشین',
    },
    {
      id: `rel_mother_${rng.int(1000, 9999)}`,
      name: `${motherGiven} ${makePatronymic(matGrandFather, Sex.Female)}`,
      sex: Sex.Female,
      role: 'Mother',
      age: motherAge,
      alive: motherAge < 64 ? rng.chance(0.84) : rng.chance(0.45),
      affinity: rng.int(72, 96),
      socialClass,
      locationId,
      traits: [rng.pick(['cunning', 'charismatic', 'law_speaker', 'pious'])],
      causeOfDeath: 'Winter fever',
      causeOfDeathFa: 'تب سخت زمستانی',
    },
  ];

  // 1-2 siblings (eligible heirs!)
  const numSiblings = rng.int(1, 2);
  for (let i = 0; i < numSiblings; i++) {
    const sibSex = rng.chance(0.5) ? Sex.Male : Sex.Female;
    const sibGiven = rng.pick(sibSex === Sex.Male ? malePool : femalePool);
    const sibAge = Math.max(1, playerAge + rng.int(-5, 6));
    relationships.push({
      id: `rel_sib_${i}_${rng.int(1000, 9999)}`,
      name: `${sibGiven} ${makePatronymic(fatherGiven, sibSex)}`,
      sex: sibSex,
      role: 'Sibling',
      age: sibAge,
      alive: true,
      affinity: rng.int(58, 88),
      socialClass,
      locationId,
      traits: [rng.pick(['brave', 'cunning', 'seafarer', 'skald_tongued'])],
      isHeirEligible: true,
    });
  }

  // High-born families often start with an existing rival
  if (
    socialClass === SocialClass.HersirKin ||
    socialClass === SocialClass.JarlKin ||
    socialClass === SocialClass.Royal
  ) {
    const rivalGiven = rng.pick(malePool);
    relationships.push({
      id: `rel_rival_init_${rng.int(1000, 9999)}`,
      name: `${rivalGiven} ${makePatronymic(rng.pick(malePool), Sex.Male)}`,
      epithet: rng.pick(['the Proud', 'Crow-Nose', 'Iron-Brow', 'Skull-Splitter']),
      sex: Sex.Male,
      role: 'Rival',
      age: rng.int(22, 45),
      alive: true,
      affinity: rng.int(10, 28),
      socialClass,
      locationId,
      traits: ['wrathful'],
    });
  }

  return { fatherName: fatherGiven, relationships };
}

export function createNewGame(params: NewGameParams, settings: GameSettings): FullGameState {
  const initialSeedNum = hashSeedString(params.seedString || 'ELDSAGA');
  const rng = new SeededRNG(initialSeedNum);

  const settlement = SETTLEMENTS_BY_ID[params.birthplaceId] ?? SETTLEMENTS_BY_ID['nidaros'];
  const classCfg = SOCIAL_CLASS_CONFIG[params.socialClass];

  const extractedFather = params.patronymic
    ? params.patronymic.replace(/(sson|sdottir|son|dottir)$/i, '')
    : undefined;

  const { fatherName, relationships } = generateInitialFamily(
    rng,
    settlement.regionGroup,
    settlement.id,
    params.socialClass,
    params.startAge,
    extractedFather
  );

  const patronymic = params.patronymic?.trim() || makePatronymic(fatherName, params.sex);

  const baseStats: PersonalStats = {
    health: rng.int(72, 92),
    strength: params.startAge < 12 ? rng.int(22, 38) : rng.int(46, 68),
    cunning: rng.int(44, 68),
    charisma: rng.int(44, 68),
    honor: params.socialClass === SocialClass.Thrall ? 18 : rng.int(42, 65),
    wyrd: rng.int(45, 65),
    faith: rng.int(45, 68),
    happiness: params.socialClass === SocialClass.Thrall ? 36 : rng.int(60, 82),
  };

  const baseSkills: SkillsState = {
    combat: params.startAge < 12 ? 8 : rng.int(16, 32),
    seamanship:
      settlement.regionGroup === 'Norway' || settlement.regionGroup === 'North Atlantic'
        ? rng.int(22, 38)
        : rng.int(14, 28),
    farming: rng.int(16, 30),
    trade: settlement.baseWealth >= 8 ? rng.int(22, 36) : rng.int(12, 24),
    diplomacy: rng.int(14, 28),
    law: settlement.isThingSite ? rng.int(20, 34) : rng.int(10, 22),
    craft: rng.int(12, 25),
    skaldcraft: rng.int(10, 24),
    seidr: rng.int(4, 14),
  };

  for (const tid of params.traits) {
    const def = ALL_TRAITS_MAP[tid];
    if (!def) continue;
    if (def.statModifiers) {
      (Object.keys(def.statModifiers) as (keyof PersonalStats)[]).forEach((k) => {
        baseStats[k] = clampStat(baseStats[k] + (def.statModifiers?.[k] ?? 0));
      });
    }
    if (def.skillModifiers) {
      (Object.keys(def.skillModifiers) as (keyof SkillsState)[]).forEach((k) => {
        baseSkills[k] = clampSkill(baseSkills[k] + (def.skillModifiers?.[k] ?? 0));
      });
    }
  }

  const birthYear = params.year - params.startAge;
  const holdings: Holding[] =
    classCfg.farms > 0
      ? [
          {
            settlementId: settlement.id,
            farms: classCfg.farms,
            buildings: classCfg.farms >= 4 ? ['skali_hall'] : [],
            garrison: Math.floor(classCfg.warriors / 2),
          },
        ]
      : [];

  const dynastyBase = fatherName || params.givenName;
  const dynastyName = `House of ${dynastyBase}`;

  const charId = `char_gen1_${rng.int(1000, 9999)}`;
  const character: CharacterState = {
    id: charId,
    givenName: params.givenName.trim() || 'Sigurd',
    patronymic,
    epithet: '',
    sex: params.sex,
    age: params.startAge,
    birthYear,
    birthplaceId: settlement.id,
    locationId: settlement.id,
    socialClass: params.socialClass,
    title: classCfg.startingTitle,
    religion: params.religion,
    traits: [...params.traits],
    stats: baseStats,
    skills: baseSkills,
    appearance: params.appearance ?? deriveAppearanceFromId(charId),
    isOutlawed: false,
    raidsLed: 0,
    voyagesCompleted: 0,
    killsInHolmgang: 0,
    thingsAttended: 0,
  };

  const startingFlags = [...(params.startingFlags ?? [])];
  if (params.startAge >= 16) startingFlags.push('came_of_age');

  const sFa = SETTLEMENTS_FA[settlement.id];
  const fullNameFa = formatPersonName(`${character.givenName} ${character.patronymic}`, 'fa');
  const classFa = SOCIAL_CLASS_FA[params.socialClass]?.label ?? classCfg.label;
  const faithFa = RELIGION_LABELS.fa[character.religion];

  const openingEntry: LogEntry = {
    id: `log_init_${params.year}`,
    year: params.year,
    season: Season.Spring,
    age: params.startAge,
    locationName: `${settlement.name} (${settlement.norseName})`,
    category: 'Chronicle',
    iconType: 'crown',
    title: `A New Viking Life · ${params.year} AD`,
    titleFa: `شروع یک زندگی وایکینگی · سال ${params.year} میلادی`,
    text: `Born into ${settlement.name} as ${classCfg.label.toLowerCase()} following ${RELIGION_LABELS.en[character.religion]}. Northern seas and wild fates await.`,
    textFa: `در ${sFa?.name ?? settlement.name}، زندگی «${fullNameFa}» در جایگاه ${classFa} و پیرو «${faithFa}» شروع شد. دریاهای شمال منتظرند!`,
  };

  return {
    saveVersion: CURRENT_SAVE_VERSION,
    screen: GameScreen.PLAYING,
    seedString: params.seedString,
    rngState: rng.getState(),
    year: params.year,
    season: Season.Spring,
    generation: 1,
    dynastyName,
    winGoalId: params.winGoalId,
    actionsRemainingThisTurn: 2,
    yearlyActivitiesUsed: {},
    builtThisYear: false,
    familyInteractionsUsed: {},
    onboardingStep: 0,
    onboardingDismissed: false,
    epilogue1066Shown: params.year > 1066,
    pending1066Epilogue: false,
    freeModeAfter1066: params.year > 1066,
    totalRaidsWon: 0,
    marriedBloodEnemy: false,
    divorcesCount: 0,
    conquestsWon: 0,
    character,
    realm: {
      silver: classCfg.silver + (params.bonusSilver ?? 0),
      landFarms: classCfg.farms,
      hirdWarriors: classCfg.warriors + (params.bonusWarriors ?? 0),
      longships: classCfg.longships + (params.bonusShips ?? 0),
      knarrs: classCfg.knarrs,
      foodStores: 24 + classCfg.farms * 14,
      population: classCfg.farms * 18 + classCfg.warriors,
      stability: 74,
      fame: params.socialClass === SocialClass.Royal ? 85 : params.socialClass === SocialClass.JarlKin ? 55 : 15,
      tradeNetworks: classCfg.knarrs > 0 ? 1 : 0,
      holdings,
      thrallsOwned: classCfg.farms >= 2 ? Math.floor(classCfg.farms / 2) : 0,
    },
    relationships,
    ancestors: [],
    discoveredSettlements: getNearbyDiscoveredIds(settlement.id, params.year),
    flags: startingFlags,
    divergences: [],
    divergencesFa: [],
    achievements: [],
    scheduledChains: [],
    firedUniqueEvents: [],
    lifeLog: [openingEntry],
    activeEvent: null,
    lastOutcomeBanner: null,
    pendingDeath: null,
    settings: { ...settings, timeStepMode: TimeStepMode.Year },
  };
}

function evaluateEpithet(c: CharacterState, fame: number): string {
  if (c.epithet) return c.epithet;
  if (c.traits.includes('one_eyed')) return 'the One-Eyed';
  if (c.raidsLed >= 5) return 'Sea-Wolf';
  if (c.voyagesCompleted >= 6) return 'the Far-Traveler';
  if (c.skills.skaldcraft >= 55) return 'Skald-Tongue';
  if (c.skills.law >= 55) return 'the Law-Wise';
  if (fame >= 300 && c.stats.honor >= 75) return 'Ring-Giver';
  if (c.killsInHolmgang >= 2) return 'Ironside';
  return '';
}

function evaluateAchievements(state: FullGameState, isDeadNow = false): string[] {
  const unlocked = new Set(state.achievements);
  for (const ach of BITLIFE_ACHIEVEMENTS) {
    const prog = ach.getProgress(state, isDeadNow);
    if (prog.current >= prog.target) {
      unlocked.add(ach.id);
    }
  }
  return Array.from(unlocked);
}

export function calculateLegacyScore(state: FullGameState): number {
  const rankBonus = TITLE_LADDER.indexOf(state.character.title) * 180;
  const ancestorBonus = state.ancestors.reduce((sum, a) => sum + a.fameEarned + a.holdingsCount * 35, 0);
  return Math.round(
    state.realm.fame * 2 +
      state.realm.landFarms * 45 +
      state.realm.silver * 0.8 +
      (state.realm.longships + state.realm.knarrs) * 60 +
      state.generation * 220 +
      state.achievements.length * 90 +
      rankBonus +
      ancestorBonus
  );
}

export function composeSagaObituary(state: FullGameState, causeOfDeath: string): string {
  const c = state.character;
  const birthPlace = SETTLEMENTS_BY_ID[c.birthplaceId]?.name ?? c.birthplaceId;
  const deathPlace = SETTLEMENTS_BY_ID[c.locationId]?.name ?? c.locationId;
  const fullName = `${c.givenName} ${c.patronymic}${c.epithet ? ` "${c.epithet}"` : ''}`;
  const childrenCount = state.relationships.filter((r) => r.role === 'Child' && r.alive).length;

  const deeds: string[] = [];
  if (c.raidsLed > 0) deeds.push(`led ${c.raidsLed} sea raids`);
  if (c.voyagesCompleted > 0) deeds.push(`completed ${c.voyagesCompleted} sea voyages`);
  if (state.realm.landFarms > 0) deeds.push(`held ${state.realm.landFarms} family farms`);
  if (c.thingsAttended > 0) deeds.push(`spoke ${c.thingsAttended} times at the Thing council`);

  const deedSentence =
    deeds.length > 0
      ? `In life ${c.givenName} ${deeds.join(', ')}, earning ${state.realm.fame} fame and ${state.realm.silver} silver.`
      : `Though fate granted few grand campaigns, ${c.givenName} endured harsh northern winters with quiet grit.`;

  return `Here ends the life of ${fullName}, ${TITLE_LABELS.en[c.title]} of the ${state.dynastyName}. Born at ${birthPlace} in ${c.birthYear} AD, ${c.givenName} lived ${c.age} winters under northern skies and kept faith in ${RELIGION_LABELS.en[c.religion]} until ${state.year} AD at ${deathPlace}. ${deedSentence} Cause of death: ${causeOfDeath} Leaving ${childrenCount} living child${childrenCount === 1 ? '' : 'ren'} and kin to carry the dynasty forward, poets carve these runes so the name shall never fade.`;
}

export function composeSagaObituaryFa(state: FullGameState, causeOfDeathFa: string): string {
  const c = state.character;
  const birthPlaceFa = SETTLEMENTS_FA[c.birthplaceId]?.name ?? c.birthplaceId;
  const deathPlaceFa = SETTLEMENTS_FA[c.locationId]?.name ?? c.locationId;
  const epFa = c.epithet ? EPITHET_FA[c.epithet] ?? c.epithet : '';
  const fullNameFa = `${formatPersonName(`${c.givenName} ${c.patronymic}`, 'fa')}${epFa ? ` «${epFa}»` : ''}`;
  const dynFa = formatDynastyName(state.dynastyName, 'fa');
  const givenFa = formatPersonName(c.givenName, 'fa');
  const childrenCount = state.relationships.filter((r) => r.role === 'Child' && r.alive).length;

  const deedsFa: string[] = [];
  if (c.raidsLed > 0) deedsFa.push(`فرماندهی ${c.raidsLed} غارت دریایی`);
  if (c.voyagesCompleted > 0) deedsFa.push(`${c.voyagesCompleted} سفر در امواج شمال`);
  if (state.realm.landFarms > 0) deedsFa.push(`تملک ${state.realm.landFarms} مزرعه و ملک`);
  if (c.thingsAttended > 0) deedsFa.push(`${c.thingsAttended} بار سخنرانی در شورای آزادگان (ثینگ)`);

  const deedSentenceFa =
    deedsFa.length > 0
      ? `در طول زندگی با ${deedsFa.join('، ')} توانست ${state.realm.fame} شهرت و ${state.realm.silver} سکه نقره گرد آورد.`
      : `هرچند روزگار فرصت نبردهای بزرگ را کمتر به او داد، «${givenFa}» زمستان‌های سخت شمال را با استقامت پشت سر گذاشت.`;

  return `در اینجا رشته زندگی «${fullNameFa}»، ${TITLE_LABELS.fa[c.title]} از «${dynFa}» به پایان می‌رسد. او که در سال ${c.birthYear} میلادی در ${birthPlaceFa} چشم به جهان گشود، ${c.age} زمستان زیر آسمان شمال زیست و با آیین «${RELIGION_LABELS.fa[c.religion]}» در سال ${state.year} میلادی در ${deathPlaceFa} چشم از جهان فروبست. ${deedSentenceFa} علت مرگ: ${causeOfDeathFa} اکنون با بر جای گذاشتن ${childrenCount} فرزند زنده و خویشاوندان، شاعران شمال نامش را بر سنگ رونیک جاودانه می‌سازند.`;
}

function triggerDeathState(
  state: FullGameState,
  causeOfDeath: string,
  causeOfDeathFaInput?: string,
  deathTypeId?: string
): FullGameState {
  const rawCauseFa = causeOfDeathFaInput || 'پایان‌یافتن رشته تقدیر در نبرد و سختی روزگار.';
  const deathCard = resolveDeathCardDetails(state, deathTypeId, causeOfDeath, rawCauseFa);
  const lifeTitleDef = evaluateLifeReportTitle(state);

  const obituaryProse = composeSagaObituary(state, deathCard.causeEn);
  const obituaryProseFa = composeSagaObituaryFa(state, deathCard.causeFa);
  const updatedAchievements = evaluateAchievements(state, true);
  const stateWithAch = { ...state, achievements: updatedAchievements };
  const legacyScore = calculateLegacyScore(stateWithAch);

  // Eligible heirs: living children first (oldest first), then living siblings/foster-children/sworn kin
  const eligibleHeirs = state.relationships
    .filter(
      (r) =>
        r.alive &&
        (r.role === 'Child' ||
          r.role === 'Foster-Child' ||
          r.role === 'Sibling' ||
          r.role === 'Sworn Brother' ||
          r.role === 'Sworn Sister')
    )
    .sort((a, b) => {
      const priority = (role: RelationshipPerson['role']) =>
        role === 'Child' ? 0 : role === 'Foster-Child' ? 1 : role === 'Sibling' ? 2 : 3;
      const diff = priority(a.role) - priority(b.role);
      return diff !== 0 ? diff : b.age - a.age;
    });

  // If no living kin exist at all and the player has hird warriors or farms, allow adopting a loyal household kinsman!
  const finalHeirs = [...eligibleHeirs];
  if (finalHeirs.length === 0 && (state.realm.hirdWarriors > 0 || state.realm.landFarms > 0)) {
    const loc = SETTLEMENTS_BY_ID[state.character.locationId] ?? SETTLEMENTS[0];
    const rng = new SeededRNG(state.rngState);
    const heirGiven = rng.pick(MALE_NAMES_BY_REGION[loc.regionGroup]);
    finalHeirs.push({
      id: `rel_cousin_${state.year}`,
      name: `${heirGiven} ${makePatronymic(state.character.givenName, Sex.Male)}`,
      sex: Sex.Male,
      role: 'Foster-Child',
      age: 19,
      alive: true,
      affinity: 75,
      socialClass: state.character.socialClass === SocialClass.Thrall ? SocialClass.Karl : state.character.socialClass,
      locationId: state.character.locationId,
      traits: ['brave', 'oath_keeper'],
      isHeirEligible: true,
    });
  }

  const fullNameFa = formatPersonName(
    `${state.character.givenName} ${state.character.patronymic}`,
    'fa'
  );

  const deathLog: LogEntry = {
    id: `log_death_${state.year}_${state.character.id}`,
    year: state.year,
    season: state.season,
    age: state.character.age,
    locationName: SETTLEMENTS_BY_ID[state.character.locationId]?.name ?? state.character.locationId,
    category: 'Illness & Death',
    iconType: 'skull',
    title: `End of a Life · ${state.year} AD`,
    titleFa: `پایان یک زندگی · سال ${state.year} میلادی`,
    text: `${state.character.givenName} ${state.character.patronymic} died at age ${state.character.age}: ${deathCard.causeEn} ${deathCard.closingEn}`,
    textFa: `«${fullNameFa}» در ${state.character.age} سالگی رفت آن دنیا: ${deathCard.causeFa} ${deathCard.closingFa}`,
    isDanger: true,
  };

  return {
    ...stateWithAch,
    activeEvent: null,
    lifeLog: [...state.lifeLog, deathLog],
    pendingDeath: {
      causeOfDeath: deathCard.causeEn,
      causeOfDeathFa: deathCard.causeFa,
      deathTypeId: deathCard.deathTypeId,
      closingLine: deathCard.closingEn,
      closingLineFa: deathCard.closingFa,
      lifeTitle: lifeTitleDef.titleEn,
      lifeTitleFa: lifeTitleDef.titleFa,
      obituaryProse,
      obituaryProseFa,
      legacyScore,
      eligibleHeirs: finalHeirs,
    },
  };
}

export function evaluateEventConditions(
  cond: EventConditions,
  state: FullGameState,
  eventId?: string
): boolean {
  const c = state.character;
  const r = state.realm;
  const loc = SETTLEMENTS_BY_ID[c.locationId];
  const era = getEraFromYear(state.year);

  if (cond.exactYear !== undefined && cond.exactYear !== state.year) return false;
  if (cond.yearRange && (state.year < cond.yearRange[0] || state.year > cond.yearRange[1])) {
    return false;
  }
  if (cond.eras && !cond.eras.includes(era)) return false;
  if (cond.ageMin !== undefined && c.age < cond.ageMin) return false;
  if (cond.ageMax !== undefined && c.age > cond.ageMax) return false;
  if (cond.sex && c.sex !== cond.sex) return false;
  if (cond.regions && loc && !cond.regions.includes(loc.regionGroup)) return false;
  if (cond.settlementIds && !cond.settlementIds.includes(c.locationId)) return false;
  if (cond.classes && !cond.classes.includes(c.socialClass)) return false;
  if (cond.religions && !cond.religions.includes(c.religion)) return false;
  if (
    cond.minTitleRankIndex !== undefined &&
    TITLE_LADDER.indexOf(c.title) < cond.minTitleRankIndex
  ) {
    return false;
  }
  if (cond.minSilver !== undefined && r.silver < cond.minSilver) return false;
  if (cond.minFame !== undefined && r.fame < cond.minFame) return false;
  if (cond.minWarriors !== undefined && r.hirdWarriors < cond.minWarriors) return false;
  if (cond.minShips !== undefined && r.longships + r.knarrs < cond.minShips) return false;
  if (cond.maxStability !== undefined && r.stability > cond.maxStability) return false;
  if (cond.requiredTraits && !cond.requiredTraits.every((t) => c.traits.includes(t))) return false;
  if (cond.blockedByTraits && cond.blockedByTraits.some((t) => c.traits.includes(t))) return false;
  if (cond.requiredFlags && !cond.requiredFlags.every((f) => state.flags.includes(f))) return false;
  if (cond.blockedByFlags && cond.blockedByFlags.some((f) => state.flags.includes(f))) return false;
  if (cond.uniqueOncePerCampaign && eventId && state.firedUniqueEvents.includes(eventId)) {
    return false;
  }

  return true;
}

function isEventEligible(ev: GameEvent, state: FullGameState): boolean {
  if (ev.conditions && !evaluateEventConditions(ev.conditions, state, ev.id)) {
    return false;
  }

  const c = state.character;
  const loc = SETTLEMENTS_BY_ID[c.locationId];
  const era = getEraFromYear(state.year);

  if (ev.exactYear !== undefined && ev.exactYear !== state.year) return false;
  if (ev.yearRange && (state.year < ev.yearRange[0] || state.year > ev.yearRange[1])) return false;
  if (ev.eras && !ev.eras.includes(era)) return false;
  if (ev.ageMin !== undefined && c.age < ev.ageMin) return false;
  if (ev.ageMax !== undefined && c.age > ev.ageMax) return false;
  if (ev.sex && c.sex !== ev.sex) return false;
  if (ev.regions && loc && !ev.regions.includes(loc.regionGroup)) return false;
  if (ev.settlementIds && !ev.settlementIds.includes(c.locationId)) return false;
  if (ev.classes && !ev.classes.includes(c.socialClass)) return false;
  if (ev.religions && !ev.religions.includes(c.religion)) return false;
  if (
    ev.minTitleRankIndex !== undefined &&
    TITLE_LADDER.indexOf(c.title) < ev.minTitleRankIndex
  ) {
    return false;
  }
  if (ev.requiredTraits && !ev.requiredTraits.every((t) => c.traits.includes(t))) return false;
  if (ev.blockedByTraits && ev.blockedByTraits.some((t) => c.traits.includes(t))) return false;
  if (ev.requiredFlags && !ev.requiredFlags.every((f) => state.flags.includes(f))) return false;
  if (ev.blockedByFlags && ev.blockedByFlags.some((f) => state.flags.includes(f))) return false;

  // Historical set-pieces and coming-of-age only fire once
  if (ev.category === 'Historical Set-Piece' && state.firedUniqueEvents.includes(ev.id)) {
    return false;
  }

  return true;
}

const SEASON_ORDER: Season[] = [Season.Spring, Season.Summer, Season.Autumn, Season.Winter];

function pickAutomaticSeason(rng: SeededRNG, year: number, chosenEvent: GameEvent | null): Season {
  if (chosenEvent) {
    if (chosenEvent.category === 'Raiding' || chosenEvent.category === 'Voyage & Sea') {
      return rng.chance(0.55)
        ? Season.Summer
        : rng.chance(0.6)
          ? Season.Autumn
          : rng.chance(0.5)
            ? Season.Spring
            : Season.Winter;
    }
    if (chosenEvent.category === 'Illness & Death') {
      return rng.chance(0.65) ? Season.Winter : Season.Autumn;
    }
    if (chosenEvent.category === 'Farm Life') {
      return rng.chance(0.55) ? Season.Spring : Season.Autumn;
    }
  }
  const offset = (year + rng.int(0, 2)) % SEASON_ORDER.length;
  return SEASON_ORDER[offset];
}

export function dismissOnboarding(state: FullGameState): FullGameState {
  return {
    ...state,
    onboardingDismissed: true,
    onboardingStep: 3,
  };
}

export function dismiss1066Epilogue(state: FullGameState): FullGameState {
  return {
    ...state,
    pending1066Epilogue: false,
    freeModeAfter1066: true,
  };
}

export function hasBoathouse(state: FullGameState): boolean {
  return state.realm.holdings.some((h) => h.buildings.includes('boathouse_naust'));
}

export function isFortifiedEnemyCity(state: FullGameState, settlementId: string): boolean {
  const s = SETTLEMENTS_BY_ID[settlementId];
  if (!s || s.baseDefense < 7) return false;
  return !state.realm.holdings.some((h) => h.settlementId === settlementId && h.farms > 0);
}

export function advanceTurn(state: FullGameState): FullGameState {
  if (state.activeEvent || state.pendingDeath) return state;

  const rng = new SeededRNG(state.rngState);
  const nextYear = state.year + 1;
  let nextSeason = SEASON_ORDER[(SEASON_ORDER.indexOf(state.season) + 1) % SEASON_ORDER.length];

  const nextLogs: LogEntry[] = [...state.lifeLog];
  const yearlySideNotices: LogEntry[] = [];
  const loc = SETTLEMENTS_BY_ID[state.character.locationId] ?? SETTLEMENTS[0];

  const char: CharacterState = {
    ...state.character,
    age: state.character.age + 1,
    stats: { ...state.character.stats },
    skills: { ...state.character.skills },
    traits: [...state.character.traits],
  };

  const realm = {
    ...state.realm,
    holdings: state.realm.holdings.map((h) => ({ ...h, buildings: [...h.buildings] })),
  };

  let relationships = state.relationships.map((r) => ({ ...r }));

  // 1. Estate, Thralls, Upkeep & Building Annual Economy
  const warmPeriodBonus = nextYear >= 950 ? 1.15 : 1.0;
  const harvestGrain = Math.round(
    realm.landFarms * (8 + char.skills.farming * 0.12) * warmPeriodBonus
  );
  const thrallFood = (realm.thrallsOwned ?? 0) * 2;
  const thrallSilver = (realm.thrallsOwned ?? 0) * 1;
  const warriorFoodUpkeep = Math.round(realm.hirdWarriors * 0.55);
  realm.foodStores = Math.max(
    0,
    realm.foodStores + harvestGrain + thrallFood - warriorFoodUpkeep - 4
  );

  let buildingSilver = 0;
  let buildingFame = 0;
  let buildingStability = 0;
  let hasBoathouseNow = false;
  for (const h of realm.holdings) {
    if (h.buildings.includes('kaupang_market')) buildingSilver += 18;
    if (h.buildings.includes('boathouse_naust')) hasBoathouseNow = true;
    if (h.buildings.includes('skali_hall')) {
      buildingFame += 3;
      buildingStability += 6;
    }
    if (h.buildings.includes('ring_fortress')) buildingStability += 8;
    if (h.buildings.includes('pagan_hof') && char.religion === Religion.NorsePagan) {
      char.stats.faith = clampStat(char.stats.faith + 5);
      char.stats.honor = clampStat(char.stats.honor + 4);
    }
    if (h.buildings.includes('stave_church') && char.religion === Religion.Christian) {
      char.stats.faith = clampStat(char.stats.faith + 5);
    }
  }

  const tradeIncome = realm.tradeNetworks * (6 + Math.floor(char.skills.trade * 0.14));
  const rawShipUpkeep = realm.longships * 4 + realm.knarrs * 2;
  const shipSilverUpkeep = hasBoathouseNow ? Math.floor(rawShipUpkeep * 0.5) : rawShipUpkeep;
  const hirdSilverUpkeep = Math.floor(Math.max(0, realm.hirdWarriors - 4) * 0.45);
  const totalUpkeep = hirdSilverUpkeep + shipSilverUpkeep;
  const grossSilver =
    realm.silver + buildingSilver + tradeIncome + realm.landFarms * 3 + thrallSilver;

  if (grossSilver < totalUpkeep && realm.hirdWarriors > 0) {
    realm.silver = 0;
    const deserted = Math.min(realm.hirdWarriors, rng.int(2, 5));
    realm.hirdWarriors = Math.max(0, realm.hirdWarriors - deserted);
    realm.stability = Math.max(10, realm.stability - 10);
    yearlySideNotices.push({
      id: `log_upkeep_desert_${nextYear}_${nextLogs.length}`,
      year: nextYear,
      season: nextSeason,
      age: char.age,
      locationName: loc.name,
      category: 'Politics & Kings',
      iconType: 'coin',
      title: 'Unpaid Crew Deserted',
      titleFa: 'فرار جنگجویانِ بی‌مواجب!',
      text: `Short on silver for fleet & hird upkeep (${totalUpkeep}/yr), ${deserted} grumbling warriors packed their spears and left.`,
      textFa: `چون نقره‌ی مواجب سالانه‌ی کشتی‌ها و سپاه (${totalUpkeep} سکه) جور نشد، ${deserted} جنگجو غرغرکنان نیزه‌هایشان را برداشتند و رفتند!`,
      deltas: [`-${deserted} Warriors`, 'Stability -10'],
      deltasFa: [`-${deserted} جنگجو`, 'ثبات -10'],
      isDanger: true,
    });
  } else {
    realm.silver = Math.max(0, grossSilver - totalUpkeep);
  }

  realm.fame += buildingFame;
  realm.stability = Math.max(10, Math.min(100, realm.stability + buildingStability - 1));
  realm.population = realm.landFarms * 18 + realm.hirdWarriors + realm.thrallsOwned * 2;

  if (realm.foodStores === 0 && realm.landFarms > 0) {
    char.stats.health = clampStat(char.stats.health - 6);
    char.stats.happiness = clampStat(char.stats.happiness - 6);
    yearlySideNotices.push({
      id: `log_hunger_${nextYear}_${nextLogs.length}`,
      year: nextYear,
      season: Season.Winter,
      age: char.age,
      locationName: loc.name,
      category: 'Farm Life',
      iconType: 'skull',
      title: 'Empty Grain Chests',
      titleFa: 'انبار خالی زمستان',
      text: 'Your grain stores ran dry before spring thaw.',
      textFa: 'آذوقه انبار قبل از آب شدن یخ‌های بهار ته‌کشید و شکم‌ها به قارقار افتاد.',
      deltas: ['Health -6', 'Happiness -6'],
      deltasFa: ['سلامتی -6', 'شادی -6'],
      isDanger: true,
    });
  }

  // 2. Age NPCs & Natural Childbirth Check
  const livingSpouse = relationships.find((r) => r.role === 'Spouse' && r.alive);
  if (
    livingSpouse &&
    char.age >= 18 &&
    char.age <= 48 &&
    livingSpouse.age <= 44 &&
    rng.chance(0.24)
  ) {
    const childSex = rng.chance(0.5) ? Sex.Male : Sex.Female;
    const childGiven = rng.pick(
      childSex === Sex.Male
        ? MALE_NAMES_BY_REGION[loc.regionGroup]
        : FEMALE_NAMES_BY_REGION[loc.regionGroup]
    );
    const fatherFirstName =
      char.sex === Sex.Male ? char.givenName : livingSpouse.name.split(' ')[0];
    const childFull = `${childGiven} ${makePatronymic(fatherFirstName, childSex)}`;
    relationships.push({
      id: `rel_child_${nextYear}_${relationships.length}_${rng.int(100, 999)}`,
      name: childFull,
      sex: childSex,
      role: 'Child',
      age: 0,
      alive: true,
      affinity: 88,
      socialClass: char.socialClass,
      locationId: char.locationId,
      traits: [rng.pick(['brave', 'cunning', 'strong_limbed', 'charismatic', 'seafarer'])],
      isHeirEligible: true,
    });
    const spouseFa = formatPersonName(livingSpouse.name, 'fa');
    const childFa = formatPersonName(childFull, 'fa');
    char.stats.happiness = clampStat(char.stats.happiness + 6);
    yearlySideNotices.unshift({
      id: `log_birth_${nextYear}_${nextLogs.length}_${childGiven}`,
      year: nextYear,
      season: nextSeason,
      age: char.age,
      locationName: loc.name,
      category: 'Family',
      iconType: 'family',
      title: `New Heir Born`,
      titleFa: 'قدم نورسیده مبارک!',
      text: `${livingSpouse.name} welcomed a healthy ${childSex === Sex.Male ? 'son' : 'daughter'}: ${childFull}.`,
      textFa: `«${spouseFa}» یک ${childSex === Sex.Male ? 'پسر' : 'دختر'} کاکل‌زری به دنیا آورد: «${childFa}»!`,
      deltas: ['Happiness +6'],
      deltasFa: ['شادی +6'],
    });
  }

  relationships = relationships.map((rel) => {
    if (!rel.alive) return rel;
    const newAge = rel.age + 1;
    const oldAgeDeathProb = newAge > 68 ? 0.14 : newAge > 56 ? 0.05 : 0.008;
    if (rng.chance(oldAgeDeathProb)) {
      const relNameFa = formatPersonName(rel.name, 'fa');
      const roleFa = ROLE_LABELS.fa[rel.role];
      yearlySideNotices.push({
        id: `log_npcd_${nextYear}_${nextLogs.length}_${rel.id}`,
        year: nextYear,
        season: nextSeason,
        age: char.age,
        locationName: loc.name,
        category: 'Family',
        iconType: 'skull',
        text: `Your ${ROLE_LABELS.en[rel.role].toLowerCase()}, ${rel.name}, died at age ${newAge}.`,
        textFa: `${roleFa} شما، «${relNameFa}»، در ${newAge} سالگی دار فانی را وداع گفت.`,
      });
      return {
        ...rel,
        age: newAge,
        alive: false,
        deathYear: nextYear,
        causeOfDeath: 'Winter sickness & age',
        causeOfDeathFa: 'کهولت سن و بیماری زمستان',
      };
    }
    return { ...rel, age: newAge };
  });

  // 3. Natural Character Aging & Mortality
  if (char.age >= 12 && char.age <= 24) {
    char.stats.strength = clampStat(char.stats.strength + rng.int(1, 3));
  }
  if (char.age >= 48) {
    const decay = char.age >= 64 ? rng.int(3, 7) : rng.int(1, 4);
    char.stats.health = clampStat(char.stats.health - decay);
    if (char.age >= 55) char.stats.strength = clampStat(char.stats.strength - rng.int(1, 2));
  }
  if (char.traits.includes('sickly') && rng.chance(0.35)) {
    char.stats.health = clampStat(char.stats.health - 3);
  }

  const diffMultiplier =
    state.settings.difficulty === Difficulty.Forgiving
      ? 0.55
      : state.settings.difficulty === Difficulty.Brutal
        ? 1.45
        : 1.0;

  if (char.stats.health <= 0) {
    const intermediate: FullGameState = {
      ...state,
      year: nextYear,
      season: nextSeason,
      rngState: rng.getState(),
      yearlyActivitiesUsed: {},
      builtThisYear: false,
      familyInteractionsUsed: {},
      character: char,
      realm,
      relationships,
      lifeLog: [...nextLogs, ...yearlySideNotices.slice(0, 1)],
    };
    return triggerDeathState(
      intermediate,
      'Failing strength and accumulated wounds.',
      'بدنت زیر بار زخم‌های کهنه کم آورد و جانت به والهالا پر کشید.'
    );
  }

  if (char.age >= 58) {
    const ageHazard = ((char.age - 55) * 0.018 + (100 - char.stats.health) * 0.002) * diffMultiplier;
    if (rng.chance(ageHazard)) {
      const intermediate: FullGameState = {
        ...state,
        year: nextYear,
        season: nextSeason,
        rngState: rng.getState(),
        yearlyActivitiesUsed: {},
        builtThisYear: false,
        familyInteractionsUsed: {},
        character: char,
        realm,
        relationships,
        lifeLog: [...nextLogs, ...yearlySideNotices.slice(0, 1)],
      };
      return triggerDeathState(
        intermediate,
        'Passed peacefully by the hearth after many winters of renown.',
        'کنار آتش گرم تالار، بعد از سال‌ها زندگی پرماجرا با خیال راحت چشم بستی.'
      );
    }
  }

  // 4. World Historical Chronicle Notices for this exact year
  const chronicles = WORLD_CHRONICLES.filter((wc) => wc.year === nextYear);
  for (const wc of chronicles) {
    const wcFa = WORLD_CHRONICLES_FA[wc.year];
    yearlySideNotices.unshift({
      id: `log_chron_${wc.year}_${nextLogs.length}_${wc.title.slice(0, 8)}`,
      year: nextYear,
      season: nextSeason,
      age: char.age,
      locationName: 'Northern Europe & the Sea',
      category: 'Chronicle',
      iconType: 'crown',
      title: `${wc.year} AD · ${wc.title}`,
      titleFa: wcFa ? `${wc.year} میلادی · ${wcFa.title}` : wc.title,
      text: wc.text,
      textFa: wcFa?.text ?? wc.text,
      provenance: wc.provenance,
      isSemiLegendary: wc.isSemiLegendary,
    });
  }

  char.epithet = evaluateEpithet(char, realm.fame);
  const nextOnboardingStep = state.onboardingDismissed
    ? 3
    : Math.min(3, (state.onboardingStep ?? 0) + 1);

  const reached1066Now = nextYear >= 1066 && !state.epilogue1066Shown;

  let updatedState: FullGameState = {
    ...state,
    year: nextYear,
    season: nextSeason,
    rngState: rng.getState(),
    actionsRemainingThisTurn: 2,
    yearlyActivitiesUsed: {},
    builtThisYear: false,
    familyInteractionsUsed: {},
    onboardingStep: nextOnboardingStep,
    onboardingDismissed: nextOnboardingStep >= 3 ? true : state.onboardingDismissed,
    epilogue1066Shown: state.epilogue1066Shown || reached1066Now,
    pending1066Epilogue: state.pending1066Epilogue || reached1066Now,
    character: char,
    realm,
    relationships,
    lifeLog: nextLogs,
    lastOutcomeBanner: null,
  };

  updatedState.achievements = evaluateAchievements(updatedState);
  const goal = WIN_GOALS.find((g) => g.id === updatedState.winGoalId);
  if (goal && !updatedState.winGoalAchievedYear && goal.checkCompleted(updatedState)) {
    updatedState.winGoalAchievedYear = nextYear;
    const goalFa = WIN_GOALS_FA[goal.id];
    const dynFa = formatDynastyName(updatedState.dynastyName, 'fa');
    yearlySideNotices.unshift({
      id: `log_wingoal_${nextYear}_${updatedState.lifeLog.length}`,
      year: nextYear,
      season: nextSeason,
      age: char.age,
      locationName: loc.name,
      category: 'Succession',
      iconType: 'crown',
      title: `Goal Achieved: ${goal.title}!`,
      titleFa: `هدف بزرگ خاندان تیک خورد: ${goalFa?.title ?? goal.title}!`,
      text: `Poets across the North sing that the ${updatedState.dynastyName} achieved: ${goal.title}!`,
      textFa: `شاعران شمال همه‌جا جار می‌زنند که «${dynFa}» به آرزوی بزرگش رسید: ${goalFa?.title ?? goal.title}!`,
    });
  }

  // 5. Select Event: Scheduled Chain -> Exact Historical Set-Piece -> Weighted Life Event
  let chosenEvent: GameEvent | null = null;

  const dueChainIdx = updatedState.scheduledChains.findIndex((sc) => sc.triggerYear <= nextYear);
  if (dueChainIdx >= 0) {
    const due = updatedState.scheduledChains[dueChainIdx];
    const remaining = [...updatedState.scheduledChains];
    remaining.splice(dueChainIdx, 1);
    updatedState.scheduledChains = remaining;
    if (EVENTS_BY_ID[due.eventId]) {
      chosenEvent = EVENTS_BY_ID[due.eventId];
    }
  }

  if (!chosenEvent) {
    const eligibleSetPieces = ALL_EVENTS.filter(
      (ev) => ev.category === 'Historical Set-Piece' && isEventEligible(ev, updatedState)
    );
    if (eligibleSetPieces.length > 0 && rng.chance(0.88)) {
      chosenEvent = rng.weightedPick(eligibleSetPieces);
    }
  }

  if (!chosenEvent) {
    const eligiblePool = ALL_EVENTS.filter(
      (ev) => ev.category !== 'Historical Set-Piece' && isEventEligible(ev, updatedState)
    );
    if (eligiblePool.length > 0) {
      const weightedPool = eligiblePool.map((ev) => ({
        ...ev,
        weight: updatedState.firedUniqueEvents.slice(-10).includes(ev.id)
          ? Math.max(0.4, ev.weight * 0.15)
          : ev.weight,
      }));
      chosenEvent = rng.weightedPick(weightedPool);
    }
  }

  // Automatic season selection (prevents manual season-bypass exploit)
  nextSeason = pickAutomaticSeason(rng, nextYear, chosenEvent);
  updatedState.season = nextSeason;

  // Enforce strict BitLife pacing: max 1–2 events/cards per year
  if (chosenEvent) {
    if (yearlySideNotices.length > 0) {
      updatedState.lifeLog = [...updatedState.lifeLog, yearlySideNotices[0]];
    }
    updatedState.activeEvent = chosenEvent;
    updatedState.firedUniqueEvents = [...updatedState.firedUniqueEvents, chosenEvent.id];
  } else if (yearlySideNotices.length > 0) {
    updatedState.lifeLog = [...updatedState.lifeLog, ...yearlySideNotices.slice(0, 2)];
  } else {
    const locFa = SETTLEMENTS_FA[loc.id]?.name ?? loc.name;
    const seasonFa = SEASON_LABELS.fa[nextSeason];
    updatedState.lifeLog = [
      ...updatedState.lifeLog,
      {
        id: `log_quiet_${nextYear}_${nextSeason}_${updatedState.lifeLog.length}_${rng.int(100, 999)}`,
        year: nextYear,
        season: nextSeason,
        age: char.age,
        locationName: loc.name,
        category: 'Farm Life',
        iconType: 'coin',
        text: `A quiet ${nextSeason.toLowerCase()} in ${loc.name} — tarred hull seams and warm ale by the fire.`,
        textFa: `${seasonFa} بی‌دردسری در ${locFa} گذشت؛ قیرکشی بدنه کشتی و نوشیدن آبجوی گرم کنار آتش.`,
      },
    ];
  }

  updatedState.rngState = rng.getState();
  return updatedState;
}

export function resolveEventChoice(state: FullGameState, choiceId: string): FullGameState {
  const ev = state.activeEvent;
  if (!ev) return state;
  const choice = ev.choices.find((c) => c.id === choiceId) ?? ev.choices[0];
  const rng = new SeededRNG(state.rngState);

  const char: CharacterState = {
    ...state.character,
    stats: { ...state.character.stats },
    skills: { ...state.character.skills },
    traits: [...state.character.traits],
  };

  const realm = {
    ...state.realm,
    holdings: state.realm.holdings.map((h) => ({ ...h, buildings: [...h.buildings] })),
  };

  const relationships = state.relationships.map((r) => ({ ...r }));
  const flags = new Set(state.flags);
  const divergences = [...state.divergences];
  const divergencesFa = [...(state.divergencesFa ?? [])];
  const discovered = new Set(state.discoveredSettlements);
  const deltaSummary: string[] = [];
  const deltaSummaryFa: string[] = [];

  const evFa = EVENTS_FA[ev.id];
  const chFa = evFa?.choices[choice.id];

  const eff = choice.effects;
  if (eff) {
    if (eff.stats) {
      (Object.keys(eff.stats) as (keyof PersonalStats)[]).forEach((k) => {
        const d = eff.stats?.[k] ?? 0;
        if (d !== 0) {
          char.stats[k] = clampStat(char.stats[k] + d);
          deltaSummary.push(`${STAT_LABELS.en[k]} ${d > 0 ? `+${d}` : d}`);
          deltaSummaryFa.push(`${STAT_LABELS.fa[k]} ${d > 0 ? `+${d}` : d}`);
        }
      });
    }
    if (eff.skills) {
      (Object.keys(eff.skills) as (keyof SkillsState)[]).forEach((k) => {
        const d = eff.skills?.[k] ?? 0;
        if (d !== 0) {
          char.skills[k] = clampSkill(char.skills[k] + d);
          deltaSummary.push(`${SKILL_LABELS.en[k]} ${d > 0 ? `+${d}` : d}`);
          deltaSummaryFa.push(`${SKILL_LABELS.fa[k]} ${d > 0 ? `+${d}` : d}`);
        }
      });
    }
    if (eff.silver) {
      realm.silver = Math.max(0, realm.silver + eff.silver);
      deltaSummary.push(`Silver ${eff.silver > 0 ? `+${eff.silver}` : eff.silver}`);
      deltaSummaryFa.push(`نقره ${eff.silver > 0 ? `+${eff.silver}` : eff.silver}`);
    }
    if (eff.landFarms) {
      realm.landFarms = Math.max(0, realm.landFarms + eff.landFarms);
      const targetLoc = eff.moveToSettlementId || char.locationId;
      const existing = realm.holdings.find((h) => h.settlementId === targetLoc);
      if (existing) {
        existing.farms = Math.max(0, existing.farms + eff.landFarms);
      } else if (eff.landFarms > 0) {
        realm.holdings.push({ settlementId: targetLoc, farms: eff.landFarms, buildings: [], garrison: 4 });
      }
      deltaSummary.push(`Farms ${eff.landFarms > 0 ? `+${eff.landFarms}` : eff.landFarms}`);
      deltaSummaryFa.push(`مزرعه ${eff.landFarms > 0 ? `+${eff.landFarms}` : eff.landFarms}`);
    }
    if (eff.hirdWarriors) {
      realm.hirdWarriors = Math.max(0, realm.hirdWarriors + eff.hirdWarriors);
      deltaSummary.push(`Warriors ${eff.hirdWarriors > 0 ? `+${eff.hirdWarriors}` : eff.hirdWarriors}`);
      deltaSummaryFa.push(`جنگجو ${eff.hirdWarriors > 0 ? `+${eff.hirdWarriors}` : eff.hirdWarriors}`);
    }
    if (eff.longships) {
      realm.longships = Math.max(0, realm.longships + eff.longships);
      deltaSummary.push(`Warships +${eff.longships}`);
      deltaSummaryFa.push(`کشتی جنگی +${eff.longships}`);
    }
    if (eff.knarrs) {
      realm.knarrs = Math.max(0, realm.knarrs + eff.knarrs);
      deltaSummary.push(`Trade Ships +${eff.knarrs}`);
      deltaSummaryFa.push(`کشتی تجاری +${eff.knarrs}`);
    }
    if (eff.foodStores) {
      realm.foodStores = Math.max(0, realm.foodStores + eff.foodStores);
      deltaSummary.push(`Food ${eff.foodStores > 0 ? `+${eff.foodStores}` : eff.foodStores}`);
      deltaSummaryFa.push(`آذوقه ${eff.foodStores > 0 ? `+${eff.foodStores}` : eff.foodStores}`);
    }
    if (eff.stability) {
      realm.stability = clampStat(realm.stability + eff.stability);
    }
    if (eff.fame) {
      realm.fame = Math.max(0, realm.fame + eff.fame);
      deltaSummary.push(`Fame +${eff.fame}`);
      deltaSummaryFa.push(`شهرت +${eff.fame}`);
    }
    if (eff.addTraits) {
      eff.addTraits.forEach((t) => {
        if (!char.traits.includes(t)) {
          char.traits.push(t);
          const def = ALL_TRAITS_MAP[t];
          if (def) {
            deltaSummary.push(`Trait: ${def.name}`);
            deltaSummaryFa.push(`ویژگی: ${TRAITS_FA[t]?.name ?? def.name}`);
          }
        }
      });
    }
    if (eff.removeTraits) {
      char.traits = char.traits.filter((t) => !eff.removeTraits?.includes(t));
    }
    if (eff.addFlags) eff.addFlags.forEach((f) => flags.add(f));
    if (eff.removeFlags) eff.removeFlags.forEach((f) => flags.delete(f));
    if (eff.newReligion) {
      char.religion = eff.newReligion;
      deltaSummary.push(`Faith: ${RELIGION_LABELS.en[eff.newReligion]}`);
      deltaSummaryFa.push(`آیین: ${RELIGION_LABELS.fa[eff.newReligion]}`);
    }
    if (eff.newTitle) {
      if (TITLE_LADDER.indexOf(eff.newTitle) > TITLE_LADDER.indexOf(char.title)) {
        char.title = eff.newTitle;
        if (char.socialClass === SocialClass.Thrall && eff.newTitle !== TitleRank.Thrall) {
          char.socialClass = SocialClass.Karl;
        }
        deltaSummary.push(`Rank: ${SHORT_TITLE_LABELS.en[eff.newTitle]}`);
        deltaSummaryFa.push(`مقام جدید: ${SHORT_TITLE_LABELS.fa[eff.newTitle]}`);
      }
    }
    if (eff.moveToSettlementId && SETTLEMENTS_BY_ID[eff.moveToSettlementId]) {
      char.locationId = eff.moveToSettlementId;
      char.voyagesCompleted += 1;
      getNearbyDiscoveredIds(eff.moveToSettlementId, state.year).forEach((id) => discovered.add(id));
      deltaSummary.push(`Sailed to ${SETTLEMENTS_BY_ID[eff.moveToSettlementId].name}`);
      deltaSummaryFa.push(
        `ورود به ${SETTLEMENTS_FA[eff.moveToSettlementId]?.name ?? SETTLEMENTS_BY_ID[eff.moveToSettlementId].name}`
      );
    }
    if (eff.spawnRival) {
      const loc = SETTLEMENTS_BY_ID[char.locationId] ?? SETTLEMENTS[0];
      const rName =
        eff.spawnRival.name ||
        `${rng.pick(MALE_NAMES_BY_REGION[loc.regionGroup])} ${makePatronymic(rng.pick(MALE_NAMES_BY_REGION[loc.regionGroup]), Sex.Male)}`;
      relationships.push({
        id: `rel_riv_${state.year}_${rng.int(100, 999)}`,
        name: rName,
        sex: Sex.Male,
        role: eff.spawnRival.role,
        age: Math.max(18, char.age + rng.int(-4, 8)),
        alive: true,
        affinity: 8,
        socialClass: char.socialClass,
        locationId: char.locationId,
        traits: ['wrathful'],
      });
    }
    if (eff.spawnSwornSibling) {
      const loc = SETTLEMENTS_BY_ID[char.locationId] ?? SETTLEMENTS[0];
      const sSex = char.sex;
      const pool = sSex === Sex.Male ? MALE_NAMES_BY_REGION[loc.regionGroup] : FEMALE_NAMES_BY_REGION[loc.regionGroup];
      relationships.push({
        id: `rel_sworn_${state.year}_${rng.int(100, 999)}`,
        name: `${rng.pick(pool)} ${makePatronymic(rng.pick(MALE_NAMES_BY_REGION[loc.regionGroup]), sSex)}`,
        sex: sSex,
        role: sSex === Sex.Male ? 'Sworn Brother' : 'Sworn Sister',
        age: Math.max(15, char.age + rng.int(-2, 3)),
        alive: true,
        affinity: 94,
        socialClass: char.socialClass,
        locationId: char.locationId,
        traits: ['brave', 'oath_keeper'],
        isHeirEligible: true,
      });
    }
    if (eff.marryRandom && !relationships.some((r) => r.role === 'Spouse' && r.alive)) {
      const loc = SETTLEMENTS_BY_ID[char.locationId] ?? SETTLEMENTS[0];
      const spSex = char.sex === Sex.Male ? Sex.Female : Sex.Male;
      const pool = spSex === Sex.Male ? MALE_NAMES_BY_REGION[loc.regionGroup] : FEMALE_NAMES_BY_REGION[loc.regionGroup];
      relationships.push({
        id: `rel_spouse_${state.year}_${rng.int(100, 999)}`,
        name: `${rng.pick(pool)} ${makePatronymic(rng.pick(MALE_NAMES_BY_REGION[loc.regionGroup]), spSex)}`,
        sex: spSex,
        role: 'Spouse',
        age: Math.max(18, char.age + rng.int(-4, 4)),
        alive: true,
        affinity: 80,
        socialClass: char.socialClass,
        locationId: char.locationId,
        traits: [rng.pick(['cunning', 'charismatic', 'law_speaker'])],
      });
    }
    if (eff.birthChild) {
      const loc = SETTLEMENTS_BY_ID[char.locationId] ?? SETTLEMENTS[0];
      const cSex = rng.chance(0.5) ? Sex.Male : Sex.Female;
      const cGiven = rng.pick(cSex === Sex.Male ? MALE_NAMES_BY_REGION[loc.regionGroup] : FEMALE_NAMES_BY_REGION[loc.regionGroup]);
      relationships.push({
        id: `rel_child_ev_${state.year}_${rng.int(100, 999)}`,
        name: `${cGiven} ${makePatronymic(char.givenName, cSex)}`,
        sex: cSex,
        role: 'Child',
        age: 0,
        alive: true,
        affinity: 90,
        socialClass: char.socialClass,
        locationId: char.locationId,
        traits: [rng.pick(['brave', 'blessed_luck', 'cunning'])],
        isHeirEligible: true,
      });
      deltaSummary.push(`Child Born: ${cGiven}`);
      deltaSummaryFa.push(`فرزند جدید: ${formatPersonName(cGiven, 'fa')}`);
    }
    if (eff.marryRivalPeace) {
      const rivalIdx = relationships.findIndex(
        (r) => (r.role === 'Blood-Feud Enemy' || r.role === 'Rival') && r.alive
      );
      const alreadyMarried = relationships.some((r) => r.role === 'Spouse' && r.alive);
      if (rivalIdx >= 0) {
        const foe = relationships[rivalIdx];
        relationships.splice(rivalIdx, 1);
        deltaSummary.push(`Ended Feud: ${foe.name}`);
        deltaSummaryFa.push(`پایان دشمنی با ${formatPersonName(foe.name, 'fa')}`);
      }
      if (!alreadyMarried) {
        const loc = SETTLEMENTS_BY_ID[char.locationId] ?? SETTLEMENTS[0];
        const spSex = char.sex === Sex.Male ? Sex.Female : Sex.Male;
        const pool = spSex === Sex.Male ? MALE_NAMES_BY_REGION[loc.regionGroup] : FEMALE_NAMES_BY_REGION[loc.regionGroup];
        const spName = `${rng.pick(pool)} ${makePatronymic(rng.pick(MALE_NAMES_BY_REGION[loc.regionGroup]), spSex)}`;
        relationships.push({
          id: `rel_peace_spouse_${state.year}_${rng.int(100, 999)}`,
          name: spName,
          sex: spSex,
          role: 'Spouse',
          age: Math.max(18, char.age + rng.int(-3, 3)),
          alive: true,
          affinity: 84,
          socialClass: char.socialClass,
          locationId: char.locationId,
          traits: ['brave', 'cunning'],
        });
        deltaSummary.push(`Peace Wedding: ${spName}`);
        deltaSummaryFa.push(`ازدواج صلح با ${formatPersonName(spName, 'fa')}`);
      }
    }
    if (eff.divergenceNote) {
      divergences.push(eff.divergenceNote);
      divergencesFa.push(chFa?.divergenceNote ?? eff.divergenceNote);
    }
  }

  // Ring Fortress & Garrison bonus on enemy attack event (bl_ab_08_fortress_raid)
  const hasFortress = realm.holdings.some((h) => h.buildings.includes('ring_fortress'));
  const totalGarrison = realm.holdings.reduce((sum, h) => sum + (h.garrison ?? 0), 0);
  if (ev.id === 'bl_ab_08_fortress_raid' && choice.id === 'man_earthworks_garrison') {
    if (hasFortress || totalGarrison >= 12) {
      realm.silver += 18;
      realm.fame += 12;
      char.stats.health = clampStat(char.stats.health + 6);
      deltaSummary.push('Ring Fortress Bonus: +18 Silver');
      deltaSummaryFa.push('امتیاز دژ و پادگان: +18 نقره');
    } else if (totalGarrison < 5 && realm.hirdWarriors < 10) {
      char.stats.health = clampStat(char.stats.health - 8);
      deltaSummary.push('Weak Garrison: Health -8');
      deltaSummaryFa.push('پادگان ضعیف: سلامتی -8');
    }
  }

  // Injury roll
  if (choice.injuryChance && choice.injuryTraitId && rng.chance(choice.injuryChance)) {
    if (!char.traits.includes(choice.injuryTraitId)) {
      char.traits.push(choice.injuryTraitId);
      const tDef = ALL_TRAITS_MAP[choice.injuryTraitId];
      if (tDef) {
        deltaSummary.push(`Scar: ${tDef.name}`);
        deltaSummaryFa.push(`جراحت: ${TRAITS_FA[choice.injuryTraitId]?.name ?? tDef.name}`);
      }
    }
  }

  const scheduledChains = [...state.scheduledChains];
  if (choice.chain) {
    scheduledChains.push({
      eventId: choice.chain.eventId,
      triggerYear: state.year + choice.chain.delayYears,
    });
  }

  const isMild = state.settings.contentIntensity === ContentIntensity.Mild;
  const outcomeProse =
    isMild && choice.mildOutcomeText ? choice.mildOutcomeText : choice.outcomeText;

  const outcomeProseFa =
    isMild && chFa?.mildOutcomeText
      ? chFa.mildOutcomeText
      : chFa?.outcomeText ?? outcomeProse;
  const titleFa = evFa?.title ?? ev.title;

  const loc = SETTLEMENTS_BY_ID[char.locationId] ?? SETTLEMENTS[0];
  const newEntry: LogEntry = {
    id: `log_ev_${state.year}_${ev.id}_${state.lifeLog.length}_${rng.int(100, 999)}`,
    year: state.year,
    season: state.season,
    age: char.age,
    locationName: loc.name,
    category: ev.category,
    iconType: ev.iconType,
    title: ev.title,
    titleFa,
    text: outcomeProse,
    textFa: outcomeProseFa,
    deltas: deltaSummary,
    deltasFa: deltaSummaryFa,
    provenance: ev.provenance,
    isSemiLegendary: ev.isSemiLegendary,
    isDivergence: Boolean(eff?.divergenceNote),
  };

  let nextState: FullGameState = {
    ...state,
    rngState: rng.getState(),
    marriedBloodEnemy: state.marriedBloodEnemy || Boolean(eff?.marryRivalPeace),
    character: char,
    realm,
    relationships,
    flags: Array.from(flags),
    divergences,
    divergencesFa,
    discoveredSettlements: Array.from(discovered),
    scheduledChains,
    activeEvent: null,
    lifeLog: [...state.lifeLog, newEntry],
    lastOutcomeBanner: {
      title: ev.title,
      titleFa,
      text: outcomeProse,
      textFa: outcomeProseFa,
      deltaSummary,
      deltaSummaryFa,
    },
  };

  nextState.achievements = evaluateAchievements(nextState);

  // Death roll adjusted by difficulty, Wyrd, and Ring Fortress protection
  if (choice.deathChance && !(ev.id === 'bl_ab_08_fortress_raid' && hasFortress)) {
    const diffMult =
      state.settings.difficulty === Difficulty.Forgiving
        ? 0.45
        : state.settings.difficulty === Difficulty.Brutal
          ? 1.4
          : 1.0;
    const wyrdProtection = (char.stats.wyrd - 50) * 0.001;
    const finalDeathProb = Math.max(0.005, choice.deathChance * diffMult - wyrdProtection);
    if (rng.chance(finalDeathProb) || char.stats.health <= 0) {
      return triggerDeathState(
        nextState,
        choice.deathReason || 'Fell in a fateful clash of iron.',
        chFa?.deathReason || 'کشته‌شدن در چکاچک شمشیر و نبرد سرنوشت‌ساز.',
        choice.deathTypeId
      );
    }
  } else if (char.stats.health <= 0) {
    return triggerDeathState(
      nextState,
      'Succumbed to grievous wounds and exhaustion.',
      'جان‌باختن بر اثر زخم‌های کاری و خستگی مفرط.',
      'death_exhausted_wounds'
    );
  }

  return nextState;
}

export type RaidTactic = 'surprise' | 'shield_wall' | 'ransom' | 'feigned_retreat';

export function executeRaidAction(
  state: FullGameState,
  targetSettlementId: string,
  tactic: RaidTactic
): FullGameState {
  if (state.yearlyActivitiesUsed?.raid) return state;
  const rng = new SeededRNG(state.rngState);
  const target = SETTLEMENTS_BY_ID[targetSettlementId] ?? SETTLEMENTS_BY_ID['lindisfarne'];
  const char = {
    ...state.character,
    stats: { ...state.character.stats },
    skills: { ...state.character.skills },
    traits: [...state.character.traits],
  };
  const realm = { ...state.realm, holdings: state.realm.holdings.map((h) => ({ ...h })) };

  const playerForce =
    realm.hirdWarriors * 1.4 +
    char.skills.combat * 0.8 +
    char.stats.strength * 0.4 +
    (tactic === 'surprise' ? char.stats.cunning * 0.5 : 0) +
    (tactic === 'shield_wall' ? 18 : 0) +
    (tactic === 'ransom' ? char.skills.diplomacy * 0.6 : 0) +
    (tactic === 'feigned_retreat' ? char.stats.cunning * 0.65 : 0) +
    rng.int(-12, 22);

  const garrisonForce = target.baseDefense * 11 + rng.int(0, 25);
  const margin = playerForce - garrisonForce;

  char.raidsLed += 1;
  const discovered = new Set(state.discoveredSettlements);
  discovered.add(target.id);

  let outcomeText = '';
  let outcomeTextFa = '';
  const deltas: string[] = [];
  const deltasFa: string[] = [];
  const targetFa = SETTLEMENTS_FA[target.id]?.name ?? target.name;

  if (margin >= 0) {
    const baseLoot =
      target.baseWealth * (tactic === 'ransom' ? 9 : 7) + rng.int(12, 34);
    const casualties =
      tactic === 'ransom'
        ? rng.int(0, 1)
        : Math.min(realm.hirdWarriors, rng.int(0, Math.max(1, Math.floor(target.baseDefense / 3))));
    const fameGain = Math.round(16 + target.baseDefense * 3);

    realm.silver += baseLoot;
    realm.hirdWarriors = Math.max(0, realm.hirdWarriors - casualties);
    realm.fame += fameGain;
    char.skills.combat = clampSkill(char.skills.combat + 4);
    char.skills.seamanship = clampSkill(char.skills.seamanship + 2);
    char.stats.honor = clampStat(char.stats.honor + 6);

    deltas.push(`+${baseLoot} Silver`, `+${fameGain} Fame`);
    deltasFa.push(`+${baseLoot} نقره`, `+${fameGain} شهرت`);
    if (casualties > 0) {
      deltas.push(`-${casualties} Warriors`);
      deltasFa.push(`-${casualties} جنگجو`);
    }

    const tacticDesc =
      tactic === 'surprise'
        ? 'slipping ashore in grey dawn mist before watch-horns could blow'
        : tactic === 'shield_wall'
          ? 'locking overlapping shields in an unbreakable wall'
          : tactic === 'ransom'
            ? 'drawing up banners before the gates until the town paid silver tribute'
            : 'feigning retreat down the beach before wheeling upon the scattered defenders';

    const tacticDescFa =
      tactic === 'surprise'
        ? 'با شبیخون سحرگاهی پیش از به‌صدا درآمدن شیپور دیده‌بانان'
        : tactic === 'shield_wall'
          ? 'با بستن دیوار مستحکم سپرها در برابر نیزه‌داران ساحل'
          : tactic === 'ransom'
            ? 'با محاصره دروازه‌ها تا زمانی که بزرگان شهر باج نقره پرداختند'
            : 'با عقب‌نشینی ساختگی در ساحل و برگشتن ناگهانی بر سر مدافعان پراکنده';

    const isMild = state.settings.contentIntensity === ContentIntensity.Mild;
    outcomeText = isMild
      ? `Your ships struck ${target.name}, ${tacticDesc}. Carrying ${baseLoot} silver back to the oars, your warband won ${fameGain} fame.`
      : `Your ships struck ${target.name}, ${tacticDesc}. Carrying ${baseLoot} silver back to the oars, you lost ${casualties} warrior${casualties === 1 ? '' : 's'} and won ${fameGain} fame.`;
    outcomeTextFa = isMild
      ? `ناوگان شما ${tacticDescFa} به بندر ${targetFa} رفت و با ${baseLoot} سکه نقره غنیمت و +${fameGain} شهرت به کشتی‌ها بازگشت!`
      : `ناوگان شما ${tacticDescFa} به بندر ${targetFa} یورش برد! با ${baseLoot} سکه نقره غنیمت و +${fameGain} شهرت به کشتی‌ها بازگشتید${casualties > 0 ? ` (${casualties} جنگجو در نبرد کشته شدند)` : ' (بدون تلفات)'}.`;
  } else {
    const isMild = state.settings.contentIntensity === ContentIntensity.Mild;
    const casualties = Math.min(realm.hirdWarriors, rng.int(2, 6));
    const consolationLoot = rng.int(5, 16);
    const hpLoss = rng.int(8, 16);
    realm.silver += consolationLoot;
    realm.hirdWarriors = Math.max(0, realm.hirdWarriors - casualties);
    char.stats.health = clampStat(char.stats.health - hpLoss);
    char.skills.combat = clampSkill(char.skills.combat + 2);
    deltas.push(`+${consolationLoot} Silver`, `-${casualties} Warriors`, `Health -${hpLoss}`);
    deltasFa.push(`+${consolationLoot} نقره`, `-${casualties} جنگجو`, `سلامتی -${hpLoss}`);

    outcomeText = isMild
      ? `Stiff harbor defenses at ${target.name} repelled your landing! You rowed clear with ${consolationLoot} silver from the outer wharf while ${casualties} warriors were lost from your ranks.`
      : `Heavy garrison spears at ${target.name} held firm against your assault! Pulling back to the ships under arrow-fire with ${consolationLoot} silver snatched from the docks, ${casualties} warriors fell on the beach.`;
    outcomeTextFa = isMild
      ? `دفاع سرسختانه در ${targetFa} جلوی پیشروی شما را گرفت! با ${consolationLoot} نقره از اسکله عقب نشستید و ${casualties} جنگجو از صف سپاه کم شد.`
      : `مدافعان پرشمار در ${targetFa} در برابر یورش شما سرسختانه ایستادگی کردند! زیر باران تیر با ${consolationLoot} نقره از اسکله عقب نشستید و ${casualties} تن از جنگجویانتان در ساحل جان باختند.`;
  }

  const raidLogId = `log_raid_${state.year}_${state.lifeLog.length}_${rng.int(100, 999)}`;
  const nextState: FullGameState = {
    ...state,
    rngState: rng.getState(),
    yearlyActivitiesUsed: { ...(state.yearlyActivitiesUsed ?? {}), raid: true },
    totalRaidsWon: margin >= 0 ? (state.totalRaidsWon ?? 0) + 1 : state.totalRaidsWon ?? 0,
    character: char,
    realm,
    discoveredSettlements: Array.from(discovered),
    lifeLog: [
      ...state.lifeLog,
      {
        id: raidLogId,
        year: state.year,
        season: state.season,
        age: char.age,
        locationName: target.name,
        category: 'Raiding',
        iconType: 'sword',
        title: `Raid on ${target.name}`,
        titleFa: `یورش دریایی به ${targetFa}`,
        text: outcomeText,
        textFa: outcomeTextFa,
        deltas,
        deltasFa,
        isDanger: margin < 0,
      },
    ],
    lastOutcomeBanner: {
      title: `Raid on ${target.name}`,
      titleFa: `یورش دریایی به ${targetFa}`,
      text: outcomeText,
      textFa: outcomeTextFa,
      deltaSummary: deltas,
      deltaSummaryFa: deltasFa,
    },
  };

  if (margin < -18 && char.stats.health <= 15 && rng.chance(0.25)) {
    return triggerDeathState(
      nextState,
      `Fell covering the ship-launch during a hard-pressed raid on ${target.name}.`,
      `کشته‌شدن هنگام پوشش عقب‌نشینی یاران به سوی کشتی‌ها در ساحل ${targetFa}.`
    );
  }

  return nextState;
}

export function executeSailAction(state: FullGameState, destinationId: string): FullGameState {
  if (state.yearlyActivitiesUsed?.travel || destinationId === state.character.locationId) return state;
  const from = SETTLEMENTS_BY_ID[state.character.locationId] ?? SETTLEMENTS[0];
  const to = SETTLEMENTS_BY_ID[destinationId];
  if (!to) return state;

  const rng = new SeededRNG(state.rngState);
  const effectiveSeamanship =
    state.character.skills.seamanship + (hasBoathouse(state) ? 3 : 0);
  const metrics = calculateVoyageMetrics(
    from,
    to,
    state.season,
    state.year,
    effectiveSeamanship,
    state.realm.knarrs > 0
  );

  const char = {
    ...state.character,
    locationId: to.id,
    voyagesCompleted: state.character.voyagesCompleted + 1,
    stats: { ...state.character.stats },
    skills: {
      ...state.character.skills,
      seamanship: clampSkill(state.character.skills.seamanship + 4),
    },
  };

  const hasKnarr = state.realm.knarrs > 0;
  const toFa = SETTLEMENTS_FA[to.id]?.name ?? to.name;
  const seasonEn = state.season;
  const seasonFa = SEASON_LABELS.fa[state.season];
  const stormHit = rng.int(1, 100) <= metrics.dangerPct;

  let prose = `Sailing ${metrics.nauticalMiles} nautical miles (~${metrics.sailingDays} days at sea in ${seasonEn.toLowerCase()} weather), your ship made landfall at ${to.name}.`;
  let proseFa = `پس از پیمودن ${metrics.nauticalMiles} مایل دریایی (حدود ${metrics.sailingDays} روز دریانوردی در هوای ${seasonFa})، کشتی شما در بندر ${toFa} لنگر انداخت.`;
  const deltas = [`Arrived: ${to.name}`, `Sailing +4`];
  const deltasFa = [`ورود به ${toFa}`, `دریانوردی +4`];

  let nextSilver = state.realm.silver;
  let nextWarriors = state.realm.hirdWarriors;

  if (stormHit) {
    const hpLoss =
      state.season === Season.Winter
        ? hasKnarr
          ? 10
          : 15
        : state.season === Season.Autumn
          ? 11
          : 8;
    char.stats.health = clampStat(char.stats.health - hpLoss);

    if (state.season === Season.Winter) {
      prose += ` Blinding winter snow and freezing spray coated the oars (-${hpLoss} Health)!`;
      proseFa += ` کولاک برف و یخ‌زدگی عرشه، خدمه را به شدت فرسوده و زخمی کرد (سلامتی -${hpLoss})!`;
      deltas.push(`Winter Gale: Health -${hpLoss}`);
      deltasFa.push(`کولاک زمستان: سلامتی -${hpLoss}`);
      if (!hasKnarr && nextWarriors > 2 && rng.chance(0.35)) {
        nextWarriors -= 1;
        prose += ' One oarsman was swept overboard in the icy gale.';
        proseFa += ' یک جنگجو در امواج یخ‌زده به دریا افتاد.';
        deltas.push('-1 Warrior');
        deltasFa.push('-1 جنگجو');
      }
    } else if (state.season === Season.Autumn) {
      const repairCost = Math.min(nextSilver, 4);
      nextSilver -= repairCost;
      prose += ` Fierce autumn rain squalls tore at the rigging (-${hpLoss} Health${repairCost > 0 ? `, -${repairCost} Silver repairs` : ''})!`;
      proseFa += ` باران شدید و تندباد پاییزی به طناب‌ها و بادبان آسیب زد (سلامتی -${hpLoss}${repairCost > 0 ? `، -${repairCost} نقره تعمیر` : ''})!`;
      deltas.push(`Autumn Storm: Health -${hpLoss}`);
      deltasFa.push(`طوفان پاییزی: سلامتی -${hpLoss}`);
      if (repairCost > 0) {
        deltas.push(`-${repairCost} Silver`);
        deltasFa.push(`-${repairCost} نقره`);
      }
    } else {
      prose += ` Thick ${seasonEn.toLowerCase()} squalls bruised the crew (-${hpLoss} Health)!`;
      proseFa += ` امواج و مه ${seasonFa} خدمه را کوفته کرد (سلامتی -${hpLoss})!`;
      deltas.push(`Squall: Health -${hpLoss}`);
      deltasFa.push(`تندباد: سلامتی -${hpLoss}`);
    }
  } else {
    if (state.season === Season.Summer) {
      char.stats.happiness = clampStat(char.stats.happiness + 3);
      prose += ' Fair summer winds carried the sail smoothly across bright waters (+3 Happiness).';
      proseFa += ' باد موافق تابستانی بادبان را به‌نرمی بر آب‌های آرام پیش راند (شادی +3).';
      deltas.push('Fair Winds: Happiness +3');
      deltasFa.push('باد موافق: شادی +3');
    }
    if (to.regionGroup === 'North Atlantic') {
      char.stats.honor = clampStat(char.stats.honor + 5);
      deltas.push('Honor +5');
      deltasFa.push('شرافت +5');
    }
  }

  const discovered = new Set(state.discoveredSettlements);
  getNearbyDiscoveredIds(to.id, state.year).forEach((id) => discovered.add(id));

  const sailLogId = `log_sail_${state.year}_${to.id}_${state.lifeLog.length}_${rng.int(100, 999)}`;
  const updated: FullGameState = {
    ...state,
    rngState: rng.getState(),
    yearlyActivitiesUsed: { ...(state.yearlyActivitiesUsed ?? {}), travel: true },
    character: char,
    realm: {
      ...state.realm,
      silver: nextSilver,
      hirdWarriors: nextWarriors,
      fame: state.realm.fame + (to.regionGroup === 'North Atlantic' ? 14 : 5),
    },
    discoveredSettlements: Array.from(discovered),
    lifeLog: [
      ...state.lifeLog,
      {
        id: sailLogId,
        year: state.year,
        season: state.season,
        age: char.age,
        locationName: to.name,
        category: 'Voyage & Sea',
        iconType: 'ship',
        title: `Sea Voyage to ${to.name}`,
        titleFa: `سفر دریایی به ${toFa}`,
        text: prose,
        textFa: proseFa,
        deltas,
        deltasFa,
        isDanger: stormHit,
      },
    ],
    lastOutcomeBanner: {
      title: `Landfall at ${to.name}`,
      titleFa: `ورود به بندر ${toFa}`,
      text: prose,
      textFa: proseFa,
      deltaSummary: deltas,
      deltaSummaryFa: deltasFa,
    },
  };

  updated.achievements = evaluateAchievements(updated);
  const winterCapsizeProb = hasKnarr ? 0.03 : 0.08;
  if (stormHit && state.season === Season.Winter && rng.chance(winterCapsizeProb)) {
    return triggerDeathState(
      updated,
      `Lost at sea when a towering winter blizzard wave capsized the ship off ${to.name}.`,
      `غرق‌شدن در دریا بر اثر کولاک و امواج سهمگین زمستانی در نزدیکی سواحل ${toFa}.`
    );
  }
  return updated;
}

export function executeGeneralAction(
  state: FullGameState,
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
    | 'convert_christian'
    | 'claim_rank'
    | 'court_spouse'
    | 'divorce_spouse'
    | 'pay_wergild'
    | 'holmgang_rival',
  extraParam?: SkillKey | BuildingType | string
): FullGameState {
  if (actionType === 'trade_voyage' && state.yearlyActivitiesUsed?.trade) return state;
  if (actionType === 'farm_settle' && state.yearlyActivitiesUsed?.settle) return state;
  const oncePerYearFreeActions = new Set([
    'attend_thing',
    'hold_feast',
    'patronize_skald',
    'convert_pagan',
    'convert_christian',
  ]);
  if (
    oncePerYearFreeActions.has(actionType) &&
    state.familyInteractionsUsed?.[`act_${actionType}`]
  ) {
    return state;
  }
  const rng = new SeededRNG(state.rngState);
  const loc = SETTLEMENTS_BY_ID[state.character.locationId] ?? SETTLEMENTS[0];

  const char: CharacterState = {
    ...state.character,
    stats: { ...state.character.stats },
    skills: { ...state.character.skills },
    traits: [...state.character.traits],
  };
  const realm = {
    ...state.realm,
    holdings: state.realm.holdings.map((h) => ({ ...h, buildings: [...h.buildings] })),
  };
  const relationships = state.relationships.map((r) => ({ ...r }));

  const locFa = SETTLEMENTS_FA[loc.id]?.name ?? loc.name;
  let title = '';
  let titleFa = '';
  let text = '';
  let textFa = '';
  const deltas: string[] = [];
  const deltasFa: string[] = [];
  let consumeAction = true;

  if (actionType === 'trade_voyage') {
    const profit = Math.round(24 + loc.baseWealth * 4 + char.skills.trade * 0.6 + rng.int(0, 18));
    realm.silver += profit;
    if (realm.knarrs > 0 && realm.tradeNetworks < 6 && rng.chance(0.4)) {
      realm.tradeNetworks += 1;
      deltas.push('Trade Route +1');
      deltasFa.push('مسیر تجاری +1');
    }
    char.skills.trade = clampSkill(char.skills.trade + 5);
    title = `Market Trade at ${loc.name}`;
    titleFa = `معامله سودآور در بازار ${locFa}`;
    text = `Trading furs, woven wool, and Baltic amber on bronze scales at ${loc.name}, you earned ${profit} silver.`;
    textFa = `با دادوستد خز سمور، پشم و کهربای بالتیک بر ترازوهای برنزی بازار ${locFa}، مبلغ ${profit} سکه نقره سود بردید.`;
    deltas.push(`+${profit} Silver`, 'Trade +5');
    deltasFa.push(`+${profit} نقره`, 'تجارت +5');
  } else if (actionType === 'farm_settle') {
    if (isFortifiedEnemyCity(state, loc.id)) return state;
    const cost = 35;
    if (realm.silver < cost) return state;
    realm.silver -= cost;
    realm.landFarms += 1;
    realm.foodStores += 16;
    const existing = realm.holdings.find((h) => h.settlementId === loc.id);
    if (existing) {
      existing.farms += 1;
    } else {
      realm.holdings.push({ settlementId: loc.id, farms: 1, buildings: [], garrison: 3 });
    }
    char.skills.farming = clampSkill(char.skills.farming + 5);
    realm.fame += loc.regionGroup === 'North Atlantic' ? 18 : 8;
    title = `New Farmland Claimed at ${loc.name}`;
    titleFa = `تصاحب و آبادانی مزرعه در ${locFa}`;
    text = `Setting boundary-stones at ${loc.name}, you added productive farmland and winter grain stores to the ${state.dynastyName}.`;
    textFa = `با نشاندن سنگ‌های مرزی در ${locFa}، یک مزرعه حاصلخیز و انبار غله زمستانی به املاک «${formatDynastyName(state.dynastyName, 'fa')}» افزودید.`;
    deltas.push('-35 Silver', '+1 Farm', '+16 Food');
    deltasFa.push('-35 نقره', '+1 مزرعه', '+16 آذوقه');
  } else if (actionType === 'attend_thing') {
    char.thingsAttended += 1;
    char.skills.law = clampSkill(char.skills.law + 5);
    char.skills.diplomacy = clampSkill(char.skills.diplomacy + 3);
    char.stats.honor = clampStat(char.stats.honor + 6);
    realm.stability = clampStat(realm.stability + 6);
    if (char.isOutlawed || char.traits.includes('outlaw_mark')) {
      char.isOutlawed = false;
      char.traits = char.traits.filter((t) => t !== 'outlaw_mark');
      deltas.push('Outlawry Cleared');
      deltasFa.push('رفع حکم تبعید');
    }
    title = `Spoke at the Thing Council`;
    titleFa = `سخنرانی در شورای آزادگان (ثینگ)`;
    text = `Standing before assembled freefolk near ${loc.name}, your grasp of law and oaths strengthened your family’s honor.`;
    textFa = `در جمع مردان آزاد در شورای ثینگِ ${locFa}، تسلط شما بر قوانین کهن و سوگندها جایگاه و آبروی خاندانتان را استوار ساخت.`;
    deltas.push('Law +5', 'Honor +6', 'Stability +6');
    deltasFa.push('قانون‌دانی +5', 'شرافت +6', 'ثبات +6');
  } else if (actionType === 'hold_feast') {
    if (realm.silver < 16) return state;
    realm.silver -= 16;
    realm.fame += 18;
    realm.stability = clampStat(realm.stability + 9);
    char.stats.happiness = clampStat(char.stats.happiness + 10);
    char.stats.charisma = clampStat(char.stats.charisma + 4);
    char.stats.faith = clampStat(char.stats.faith + 5);
    title =
      char.religion === Religion.NorsePagan
        ? 'Seasonal Blót & Great Hall Feast'
        : 'Grand Feast in the Longhouse';
    titleFa =
      char.religion === Religion.NorsePagan
        ? 'ضیافت بزرگ و جشن آیینی (بلوت)'
        : 'مهمانی باشکوه در تالار بزرگ';
    text = `Roast meats and horns of honeyed ale warmed every bench in ${loc.name}, binding warriors and neighbors to your side.`;
    textFa = `کباب گرم و جام‌های نوشیدنی عسل در تالار ${locFa} دل جنگجویان و همسایگان را گرم کرد و وفاداری آنان را به جایگاه شما محکم‌تر ساخت.`;
    deltas.push('-16 Silver', '+18 Fame', 'Stability +9', 'Happiness +10');
    deltasFa.push('-16 نقره', '+18 شهرت', 'ثبات +9', 'شادی +10');
  } else if (actionType === 'patronize_skald') {
    if (realm.silver < 15) return state;
    realm.silver -= 15;
    const fameGain = 26 + Math.floor(char.skills.skaldcraft * 0.25);
    realm.fame += fameGain;
    char.stats.honor = clampStat(char.stats.honor + 8);
    char.skills.skaldcraft = clampSkill(char.skills.skaldcraft + 4);
    title = 'Commissioned a Skald Praise-Poem';
    titleFa = 'سرودن چکامه ستایش توسط شاعر (اسکالد)';
    text = `A master skald chanted verses recounting your voyages and generosity — a song that travels faster than ships across the North.`;
    textFa = `شاعری چیره‌دست سرودی حماسی درباره سفرها و بخشندگی شما سرود؛ اشعاری که سریع‌تر از کشتی‌ها در تالارهای شمال دهان‌به‌دهان می‌چرخد.`;
    deltas.push('-15 Silver', `+${fameGain} Fame`, 'Honor +8');
    deltasFa.push('-15 نقره', `+${fameGain} شهرت`, 'شرافت +8');
  } else if (actionType === 'recruit_hird') {
    if (realm.silver < 18) return state;
    realm.silver -= 18;
    realm.hirdWarriors += 6;
    title = 'Recruited 6 Household Warriors (Hird)';
    titleFa = 'استخدام ۶ جنگجوی سوگندخورده (هیرد)';
    text = `Six seasoned spear-men swore loyalty on your sword-hilt at ${loc.name}, joining your personal warband.`;
    textFa = `شش نیزه‌دار کارآزموده در ${locFa} دست بر قبضه شمشیر شما گذاشتند و به سپاه وفادار تالارتان پیوستند.`;
    deltas.push('-18 Silver', '+6 Warriors');
    deltasFa.push('-18 نقره', '+6 جنگجو');
  } else if (actionType === 'build_longship') {
    if (realm.silver < 55) return state;
    realm.silver -= 55;
    realm.longships += 1;
    realm.fame += 15;
    char.skills.craft = clampSkill(char.skills.craft + 3);
    title = 'Launched a War Longship';
    titleFa = 'به‌آب‌اندازی کشتی جنگی (لانگ‌شیپ)';
    text = `Built of split oak planks, iron rivets, and a wool square-sail, your new warship slid into the harbor of ${loc.name}!`;
    textFa = `کشتی جنگی تندرو از الوار بلوط و بادبان پشمی چهارگوش بر ریل‌های چرب‌شده به آب‌های بندر ${locFa} لغزید!`;
    deltas.push('-55 Silver', '+1 War Longship', '+15 Fame');
    deltasFa.push('-55 نقره', '+1 کشتی جنگی', '+15 شهرت');
  } else if (actionType === 'build_knarr') {
    if (realm.silver < 45) return state;
    realm.silver -= 45;
    realm.knarrs += 1;
    realm.tradeNetworks = Math.min(8, realm.tradeNetworks + 1);
    title = 'Launched an Ocean Trade Ship (Knarr)';
    titleFa = 'به‌آب‌اندازی کشتی تجاری اقیانوس‌پیما (کِنار)';
    text = `Broad-beamed to ride deep Atlantic waves with cargo and settlers, your new trade knarr rides at anchor in ${loc.name}.`;
    textFa = `کشتی پهن‌پیکر و استوار برای حمل کالا و عبور ایمن از امواج اقیانوس اطلس ساخته شد و در بندر ${locFa} لنگر انداخت.`;
    deltas.push('-45 Silver', '+1 Trade Ship', '+1 Trade Route');
    deltasFa.push('-45 نقره', '+1 کشتی تجاری', '+1 مسیر تجاری');
  } else if (actionType === 'buy_freedom') {
    if (realm.silver < 25 || char.title !== TitleRank.Thrall) return state;
    realm.silver -= 25;
    char.title = TitleRank.Freeman;
    char.socialClass = SocialClass.Karl;
    char.stats.honor = clampStat(char.stats.honor + 20);
    char.stats.happiness = clampStat(char.stats.happiness + 20);
    realm.fame += 20;
    title = 'Freedom Purchased!';
    titleFa = 'جشن خرید آزادی!';
    text = `Weighing 25 silver before witnesses, you drank the freedom-ale and stood forth as a freeborn citizen with full rights at the Thing!`;
    textFa = `با پرداخت ۲۵ سکه نقره در برابر شاهدان، جام آزادی را نوشیدید و از این پس به عنوان یک انسان آزاد حق حمل سلاح و رأی در شورا دارید!`;
    deltas.push('-25 Silver', 'Rank: Freeman', 'Honor +20');
    deltasFa.push('-25 نقره', 'مقام: مرد آزاد', 'شرافت +20');
  } else if (actionType === 'convert_pagan') {
    char.religion = Religion.NorsePagan;
    char.stats.faith = clampStat(char.stats.faith + 8);
    title = 'Returned to the Old Norse Gods';
    titleFa = 'بازگشت به آیین خدایان کهن شمال';
    text = `Beside the hearth, you consecrated an oath-ring to Thor, Odin, and Freyr according to ancestral custom.`;
    textFa = `در کنار آتش تالار، حلقه سوگند را به نام ثور، اودین و فریر متبرک کردید و به آیین نیاکان بازگشتید.`;
    deltas.push('Faith: Old Norse Gods');
    deltasFa.push('آیین: خدایان کهن اسکاندیناوی');
  } else if (actionType === 'convert_christian') {
    char.religion = Religion.Christian;
    char.stats.faith = clampStat(char.stats.faith + 8);
    char.skills.diplomacy = clampSkill(char.skills.diplomacy + 5);
    title = 'Accepted Christian Baptism';
    titleFa = 'پذیرش غسل تعمید و آیین مسیحیت';
    text = `Clad in white linen, you accepted Christian baptism, opening smoother trade and diplomacy with English and Frankish rulers.`;
    textFa = `با جامه کتان سپید غسل تعمید پذیرفتید؛ تصمیمی که دروازه‌های تجارت و سیاست را با دربارهای انگلستان و اروپا به رویتان می‌گشاید.`;
    deltas.push('Faith: Christian', 'Diplomacy +5');
    deltasFa.push('آیین: مسیحی', 'سیاست +5');
  } else if (actionType === 'claim_rank') {
    consumeAction = false;
    const nextRank = getClaimableNextTitle(state);
    if (!nextRank) return state;
    char.title = nextRank;
    realm.fame += 35;
    char.stats.honor = clampStat(char.stats.honor + 12);
    const rankEn = TITLE_LABELS.en[nextRank];
    const rankFa = TITLE_LABELS.fa[nextRank];
    title = `Acclaimed as ${rankEn}!`;
    titleFa = `ارتقای مقام به «${rankFa}»!`;
    text = `Striking weapons against shields at the assembly, warriors and landowners hailed ${char.givenName} ${char.patronymic} as ${rankEn}!`;
    textFa = `جنگجویان و بزرگان با کوبیدن شمشیر بر سپرها در شورا، «${formatPersonName(`${char.givenName} ${char.patronymic}`, 'fa')}» را به مقام «${rankFa}» برگزیدند!`;
    deltas.push(`New Rank: ${SHORT_TITLE_LABELS.en[nextRank]}`, '+35 Fame');
    deltasFa.push(`مقام جدید: ${SHORT_TITLE_LABELS.fa[nextRank]}`, '+35 شهرت');
  } else if (actionType === 'court_spouse') {
    if (relationships.some((r) => r.role === 'Spouse' && r.alive)) return state;
    if (realm.silver < 15) return state;
    realm.silver -= 15;
    const spSex = char.sex === Sex.Male ? Sex.Female : Sex.Male;
    const pool = spSex === Sex.Male ? MALE_NAMES_BY_REGION[loc.regionGroup] : FEMALE_NAMES_BY_REGION[loc.regionGroup];
    const spName = `${rng.pick(pool)} ${makePatronymic(rng.pick(MALE_NAMES_BY_REGION[loc.regionGroup]), spSex)}`;
    const spNameFa = formatPersonName(spName, 'fa');
    relationships.push({
      id: `rel_sp_${state.year}_${relationships.length}_${rng.int(100, 999)}`,
      name: spName,
      sex: spSex,
      role: 'Spouse',
      age: Math.max(18, char.age + rng.int(-4, 3)),
      alive: true,
      affinity: 82,
      socialClass: char.socialClass,
      locationId: loc.id,
      traits: [rng.pick(['charismatic', 'cunning', 'law_speaker', 'brave'])],
    });
    char.stats.happiness = clampStat(char.stats.happiness + 12);
    title = `Wedding Feast with ${spName}`;
    titleFa = `پیوند زناشویی با «${spNameFa}»`;
    text = `Paying the honorable bride-gift (15 silver), you wed ${spName} amid three nights of feasting at ${loc.name}.`;
    textFa = `با پرداخت مهریه محترمانه (۱۵ نقره) و سه شب جشن و سرور در ${locFa}، با «${spNameFa}» پیمان زناشویی بستید.`;
    deltas.push('-15 Silver', `Married ${spName}`, 'Happiness +12');
    deltasFa.push('-15 نقره', `ازدواج با ${spNameFa}`, 'شادی +12');
  } else if (actionType === 'divorce_spouse') {
    const idx = relationships.findIndex((r) => r.role === 'Spouse' && r.alive);
    if (idx < 0) return state;
    const ex = relationships[idx];
    const exFa = formatPersonName(ex.name, 'fa');
    const settlementCost = Math.min(realm.silver, Math.max(10, Math.round(realm.silver * 0.2)));
    realm.silver = Math.max(0, realm.silver - settlementCost);
    char.stats.happiness = clampStat(char.stats.happiness - 14);
    relationships.splice(idx, 1);

    const feudTriggered = rng.chance(0.4);
    if (feudTriggered) {
      const kinGiven = rng.pick(MALE_NAMES_BY_REGION[loc.regionGroup]);
      const kinName = `${kinGiven} ${makePatronymic(rng.pick(MALE_NAMES_BY_REGION[loc.regionGroup]), Sex.Male)}`;
      relationships.push({
        id: `rel_div_feud_${state.year}_${rng.int(100, 999)}`,
        name: kinName,
        sex: Sex.Male,
        role: 'Blood-Feud Enemy',
        age: Math.max(20, ex.age + rng.int(-3, 5)),
        alive: true,
        affinity: 6,
        socialClass: char.socialClass,
        locationId: loc.id,
        traits: ['wrathful'],
      });
    }

    title = `Threshold Divorce Declared`;
    titleFa = `طلاق رسمی جلوی چهارچوب در`;
    text = feudTriggered
      ? `You divorced ${ex.name}, paying ${settlementCost} silver settlement (-14 Happiness) — and ${ex.name}’s furious brother swore a blood-feud against you!`
      : `Calling witnesses to the threshold, you divorced ${ex.name}, paying ${settlementCost} silver property settlement (-14 Happiness).`;
    textFa = feudTriggered
      ? `از «${exFa}» جدا شدی و ${settlementCost} نقره مهریه و سهم اموال دادی (شادی -14) — اما برادرِ عصبانی‌اش قسمِ انتقام خونی با خاندانت خورد!`
      : `در حضور شاهدان رسماً از «${exFa}» جدا شدی؛ ${settlementCost} نقره سهم اموال پرداختی و دل‌گرفته شدی (شادی -14).`;
    deltas.push(`-${settlementCost} Silver`, 'Happiness -14');
    deltasFa.push(`-${settlementCost} نقره`, 'شادی -14');
    if (feudTriggered) {
      deltas.push('New Blood-Feud!');
      deltasFa.push('دشمنِ خونی جدید!');
    }
  } else if (actionType === 'pay_wergild') {
    if (realm.silver < 30) return state;
    const idx = relationships.findIndex(
      (r) => (r.role === 'Blood-Feud Enemy' || r.role === 'Rival') && r.alive
    );
    if (idx < 0) return state;
    const foe = relationships[idx];
    const foeFa = formatPersonName(foe.name, 'fa');
    realm.silver -= 30;
    relationships.splice(idx, 1);
    realm.stability = clampStat(realm.stability + 8);
    char.skills.law = clampSkill(char.skills.law + 4);
    title = `Blood-Feud Ended by Wergild`;
    titleFa = `پایان دشمنی خونی با پرداخت خون‌بها (ورگیلد)`;
    text = `Weighing 30 silver rings at the Thing council, you settled the feud with ${foe.name} honorably under peace-oaths.`;
    textFa = `با پرداخت ۳۰ حلقه نقره در شورای ثینگ، کینه و دشمنی با «${foeFa}» را به شیوه‌ای آبرومندانه و با سوگند صلح پایان دادید.`;
    deltas.push('-30 Silver', `Ended Feud with ${foe.name}`, 'Stability +8');
    deltasFa.push('-30 نقره', `پایان دشمنی با ${foeFa}`, 'ثبات +8');
  } else if (actionType === 'holmgang_rival') {
    const idx = relationships.findIndex(
      (r) => (r.role === 'Blood-Feud Enemy' || r.role === 'Rival') && r.alive && r.id === extraParam
    );
    const targetIdx =
      idx >= 0
        ? idx
        : relationships.findIndex((r) => (r.role === 'Blood-Feud Enemy' || r.role === 'Rival') && r.alive);
    if (targetIdx < 0) return state;
    const foe = relationships[targetIdx];
    const foeFa = formatPersonName(foe.name, 'fa');
    const roll = char.skills.combat + char.stats.strength * 0.5 + rng.int(-15, 25);
    const isMild = state.settings.contentIntensity === ContentIntensity.Mild;
    if (roll >= 48) {
      relationships[targetIdx] = {
        ...foe,
        alive: false,
        deathYear: state.year,
        causeOfDeath: isMild
          ? `Defeated in holmgang duel by ${char.givenName}`
          : `Slain in holmgang duel by ${char.givenName}`,
        causeOfDeathFa: isMild
          ? `شکست‌خورده در دوئل رسمی برابر ${formatPersonName(char.givenName, 'fa')}`
          : `کشته‌شده در دوئل هولم‌گانگ به دست ${formatPersonName(char.givenName, 'fa')}`,
      };
      char.killsInHolmgang += 1;
      realm.silver += 22;
      realm.fame += 28;
      char.stats.honor = clampStat(char.stats.honor + 12);
      char.skills.combat = clampSkill(char.skills.combat + 6);
      title = `Victory in the Holmgang Duel!`;
      titleFa = `پیروزی در دوئل تن‌به‌تن (هولم‌گانگ)!`;
      text = isMild
        ? `Inside the staked duel-ring, your strike disarmed ${foe.name} cleanly and ended the rivalry once and for all!`
        : `Inside the staked duel-ring, your blade split ${foe.name}’s shield and ended the rivalry once and for all!`;
      textFa = isMild
        ? `در محوطه دوئل، با حرکت سریع «${foeFa}» را خلع سلاح کردی و برای همیشه به این رقابت پایان دادی!`
        : `درون محوطه دوئل، ضربه پولادین شما سپر «${foeFa}» را شکافت و برای همیشه به این رقابت پایان داد!`;
      deltas.push('+22 Silver', '+28 Fame', 'Honor +12');
      deltasFa.push('+22 نقره', '+28 شهرت', 'شرافت +12');
    } else {
      char.stats.health = clampStat(char.stats.health - 22);
      if (!char.traits.includes('battle_scarred')) char.traits.push('battle_scarred');
      title = `Wounded in the Holmgang Duel`;
      titleFa = `زخمی‌شدن در دوئل هولم‌گانگ`;
      text = isMild
        ? `${foe.name} overwhelmed your guard in the duel-ring, forcing you to pay 12 silver duel-ransom to step out!`
        : `${foe.name} drew first blood in the duel-ring, forcing you to pay 12 silver duel-ransom to step out alive!`;
      textFa = isMild
        ? `«${foeFa}» در میدان دوئل بر تو چیره شد و ناچار شدی طبق قانون ۱۲ سکه نقره غرامت بدهی تا نبرد متوقف شود!`
        : `«${foeFa}» در میدان دوئل نخستین زخم را بر شما وارد کرد و ناچار شدید طبق قانون ۱۲ سکه نقره بپردازید تا نبرد متوقف شود!`;
      realm.silver = Math.max(0, realm.silver - 12);
      deltas.push('Health -22', '-12 Silver');
      deltasFa.push('سلامتی -22', '-12 نقره');
    }
  }

  const actLogId = `log_act_${actionType}_${state.year}_${state.lifeLog.length}_${rng.int(100, 999)}`;
  const nextYearlyUsed = { ...(state.yearlyActivitiesUsed ?? {}) };
  if (actionType === 'trade_voyage') nextYearlyUsed.trade = true;
  if (actionType === 'farm_settle') nextYearlyUsed.settle = true;

  const nextFamUsed = { ...(state.familyInteractionsUsed ?? {}) };
  if (oncePerYearFreeActions.has(actionType)) {
    nextFamUsed[`act_${actionType}`] = true;
  }

  const iconType =
    actionType === 'trade_voyage' || actionType === 'farm_settle'
      ? 'coin'
      : actionType === 'build_longship' || actionType === 'build_knarr'
        ? 'ship'
        : actionType === 'holmgang_rival' || actionType === 'recruit_hird'
          ? 'sword'
          : actionType === 'court_spouse' || actionType === 'divorce_spouse'
            ? 'heart'
            : actionType === 'convert_pagan' || actionType === 'convert_christian'
              ? 'religion'
              : 'crown';

  const nextState: FullGameState = {
    ...state,
    rngState: rng.getState(),
    divorcesCount:
      actionType === 'divorce_spouse' ? (state.divorcesCount ?? 0) + 1 : state.divorcesCount ?? 0,
    actionsRemainingThisTurn: consumeAction
      ? Math.max(0, state.actionsRemainingThisTurn - 1)
      : state.actionsRemainingThisTurn,
    yearlyActivitiesUsed: nextYearlyUsed,
    familyInteractionsUsed: nextFamUsed,
    character: char,
    realm,
    relationships,
    flags: state.flags.filter((f) => !(actionType === 'pay_wergild' && f === 'feud_neighbor_active')),
    lifeLog: [
      ...state.lifeLog,
      {
        id: actLogId,
        year: state.year,
        season: state.season,
        age: char.age,
        locationName: loc.name,
        category: 'Action',
        iconType,
        title,
        titleFa,
        text,
        textFa,
        deltas,
        deltasFa,
      },
    ],
    lastOutcomeBanner: {
      title,
      titleFa,
      text,
      textFa,
      deltaSummary: deltas,
      deltaSummaryFa: deltasFa,
    },
  };

  nextState.achievements = evaluateAchievements(nextState);
  if (char.stats.health <= 0) {
    return triggerDeathState(
      nextState,
      'Died of wounds taken in a holmgang duel.',
      'جان‌باختن بر اثر زخم‌های عمیق در دوئل هولم‌گانگ.'
    );
  }
  return nextState;
}

export function executeTrainSkillAction(state: FullGameState, skill: SkillKey): FullGameState {
  if (state.yearlyActivitiesUsed?.train) return state;
  const rng = new SeededRNG(state.rngState);
  const gain = rng.int(5, 9);
  const char: CharacterState = {
    ...state.character,
    stats: { ...state.character.stats },
    skills: {
      ...state.character.skills,
      [skill]: clampSkill(state.character.skills[skill] + gain),
    },
  };
  const deltas: string[] = [];
  const deltasFa: string[] = [];
  const labelEn = SKILL_LABELS.en[skill];
  const labelFa = SKILL_LABELS.fa[skill];
  deltas.push(`${labelEn} +${gain}`);
  deltasFa.push(`${labelFa} +${gain}`);

  if (skill === 'combat') {
    char.stats.strength = clampStat(char.stats.strength + 3);
    deltas.push('Strength +3');
    deltasFa.push('قدرت بدنی +3');
  }
  if (skill === 'skaldcraft') {
    char.stats.charisma = clampStat(char.stats.charisma + 3);
    deltas.push('Charisma +3');
    deltasFa.push('کاریزما +3');
  }
  if (skill === 'law') {
    char.stats.cunning = clampStat(char.stats.cunning + 3);
    deltas.push('Cunning +3');
    deltasFa.push('ذکاوت +3');
  }

  const loc = SETTLEMENTS_BY_ID[char.locationId] ?? SETTLEMENTS[0];
  const locFa = SETTLEMENTS_FA[loc.id]?.name ?? loc.name;
  const text = `Dedicated practice in ${labelEn.toLowerCase()} at ${loc.name} sharpened your edge.`;
  const textFa = `تمرین جدی «${labelFa}» در ${locFa} حسابی کارکشته‌ترت کرد!`;
  const trainLogId = `log_train_${skill}_${state.year}_${state.lifeLog.length}_${rng.int(100, 999)}`;

  return {
    ...state,
    rngState: rng.getState(),
    yearlyActivitiesUsed: { ...(state.yearlyActivitiesUsed ?? {}), train: true },
    character: char,
    lifeLog: [
      ...state.lifeLog,
      {
        id: trainLogId,
        year: state.year,
        season: state.season,
        age: char.age,
        locationName: loc.name,
        category: 'Action',
        iconType: skill === 'combat' ? 'sword' : skill === 'seamanship' ? 'ship' : 'crown',
        title: `Trained ${labelEn}`,
        titleFa: `تمرین مهارت: ${labelFa}`,
        text,
        textFa,
        deltas,
        deltasFa,
      },
    ],
    lastOutcomeBanner: {
      title: `Trained ${labelEn}`,
      titleFa: `تمرین مهارت: ${labelFa}`,
      text,
      textFa,
      deltaSummary: deltas,
      deltaSummaryFa: deltasFa,
    },
  };
}

export function executeCityConquestAction(
  state: FullGameState,
  settlementId?: string
): FullGameState {
  if (state.yearlyActivitiesUsed?.settle) return state;
  const targetId = settlementId ?? state.character.locationId;
  const target = SETTLEMENTS_BY_ID[targetId];
  if (!target || !isFortifiedEnemyCity(state, target.id)) return state;
  if (state.realm.longships < 1 || state.realm.hirdWarriors < 12) return state;

  const rng = new SeededRNG(state.rngState);
  const isMild = state.settings.contentIntensity === ContentIntensity.Mild;

  const char: CharacterState = {
    ...state.character,
    locationId: target.id,
    stats: { ...state.character.stats },
    skills: { ...state.character.skills },
    traits: [...state.character.traits],
  };
  const realm = {
    ...state.realm,
    holdings: state.realm.holdings.map((h) => ({ ...h, buildings: [...h.buildings] })),
  };

  const attackPower =
    realm.hirdWarriors * 1.5 +
    realm.longships * 12 +
    char.skills.combat * 0.9 +
    char.stats.strength * 0.4 +
    rng.int(-15, 25);
  const cityPower = target.baseDefense * 16 + 30;
  const targetFa = SETTLEMENTS_FA[target.id]?.name ?? target.name;

  const discovered = new Set(state.discoveredSettlements);
  discovered.add(target.id);

  let title = '';
  let titleFa = '';
  let text = '';
  let textFa = '';
  const deltas: string[] = [];
  const deltasFa: string[] = [];
  const won = attackPower >= cityPower;

  if (won) {
    const losses = Math.min(realm.hirdWarriors, rng.int(2, 6));
    const spoilSilver = target.baseWealth * 12;
    realm.hirdWarriors = Math.max(0, realm.hirdWarriors - losses);
    realm.silver += spoilSilver;
    realm.landFarms += 2;
    realm.fame += 45;
    realm.stability = clampStat(realm.stability + 6);
    char.stats.honor = clampStat(char.stats.honor + 14);
    char.skills.combat = clampSkill(char.skills.combat + 6);

    const existing = realm.holdings.find((h) => h.settlementId === target.id);
    if (existing) {
      existing.farms += 2;
      existing.garrison += 10;
    } else {
      realm.holdings.push({
        settlementId: target.id,
        farms: 2,
        buildings: [],
        garrison: 10,
      });
    }

    title = `Conquered ${target.name}!`;
    titleFa = `فتح بزرگ شهر مستحکم «${targetFa}»!`;
    text = isMild
      ? `Battering the gates of ${target.name} with ${state.realm.longships} warships, the ruler surrendered the citadel, 2 fertile estates, and ${spoilSilver} silver tribute!`
      : `Ramming the gates of ${target.name} beneath locked shields, your warband broke the garrison, seizing the city, 2 estates, and ${spoilSilver} silver (-${losses} warriors)!`;
    textFa = isMild
      ? `با محاصره‌ی دروازه‌های «${targetFa}»، حاکم شهر تسلیم شد و کلید دژ، ۲ مزرعه بزرگ و ${spoilSilver} سکه نقره به چنگت افتاد!`
      : `سپر در سپر دروازه‌های سنگی «${targetFa}» را در هم شکستی و شهر، ۲ ملک حاصلخیز و ${spoilSilver} سکه نقره را فتح کردی (-${losses} جنگجو)!`;

    deltas.push(`+2 Farms (${target.name})`, `+${spoilSilver} Silver`, '+45 Fame');
    deltasFa.push(`+2 ملک (${targetFa})`, `+${spoilSilver} نقره`, '+45 شهرت');
    if (losses > 0) {
      deltas.push(`-${losses} Warriors`);
      deltasFa.push(`-${losses} جنگجو`);
    }
  } else {
    const losses = Math.min(realm.hirdWarriors, rng.int(4, 10));
    realm.hirdWarriors = Math.max(0, realm.hirdWarriors - losses);
    char.stats.health = clampStat(char.stats.health - 18);
    if (rng.chance(0.2) && !char.traits.includes('battle_scarred')) {
      char.traits.push('battle_scarred');
      deltas.push('Scar: Cheek-Scarred');
      deltasFa.push('جراحت: زخم چهره');
    }

    title = `Repulsed Before ${target.name}`;
    titleFa = `عقب‌نشینی از پای دیوارهای «${targetFa}»`;
    text = isMild
      ? `Towering stone walls at ${target.name} held out against your assault! Your battered warband pulled back to the ships (-${losses} warriors, -18 Health).`
      : `Heavy boulders and spear-volleys from ${target.name}’s ramparts smashed your scaling ladders! You dragged your wounded back to the oars (-${losses} warriors, -18 Health).`;
    textFa = isMild
      ? `دیوارهای بلند «${targetFa}» در برابر یورش شما مقاومت کرد و ناچار به عقب‌نشینی به سوی کشتی‌ها شدی (-${losses} جنگجو، سلامتی -18).`
      : `باران سنگ و نیزه از بالای باروی «${targetFa}» نردبان‌هایت را شکست و مجروح و خسته به سمت کشتی‌ها عقب نشستی (-${losses} جنگجو، سلامتی -18)!`;

    deltas.push(`-${losses} Warriors`, 'Health -18');
    deltasFa.push(`-${losses} جنگجو`, 'سلامتی -18');
  }

  const nextState: FullGameState = {
    ...state,
    rngState: rng.getState(),
    conquestsWon: won ? (state.conquestsWon ?? 0) + 1 : state.conquestsWon ?? 0,
    yearlyActivitiesUsed: { ...(state.yearlyActivitiesUsed ?? {}), settle: true },
    character: char,
    realm,
    discoveredSettlements: Array.from(discovered),
    lifeLog: [
      ...state.lifeLog,
      {
        id: `log_conq_${target.id}_${state.year}_${state.lifeLog.length}_${rng.int(100, 999)}`,
        year: state.year,
        season: state.season,
        age: char.age,
        locationName: target.name,
        category: 'War',
        iconType: 'sword',
        title,
        titleFa,
        text,
        textFa,
        deltas,
        deltasFa,
        isDanger: !won,
      },
    ],
    lastOutcomeBanner: {
      title,
      titleFa,
      text,
      textFa,
      deltaSummary: deltas,
      deltaSummaryFa: deltasFa,
    },
  };

  nextState.achievements = evaluateAchievements(nextState);

  if (!won && (char.stats.health <= 0 || rng.chance(0.1))) {
    return triggerDeathState(
      nextState,
      `Struck down by a heavy rampart stone while storming the gates of ${target.name}.`,
      `هنگام یورش به دروازه‌ی مستحکم «${targetFa}»، تختهسنگی از بالای برج صاف آمد سر وقتت!`,
      'death_siege_rock'
    );
  }

  return nextState;
}

export function executeBuildHoldingAction(
  state: FullGameState,
  settlementId: string,
  building: BuildingType
): FullGameState {
  if (state.builtThisYear) return state;
  const bDef = BUILDINGS_CATALOG[building];
  if (!bDef || state.realm.silver < bDef.costSilver) return state;
  const holdingIdx = state.realm.holdings.findIndex((h) => h.settlementId === settlementId);
  if (holdingIdx < 0) return state;
  if (state.realm.holdings[holdingIdx].buildings.includes(building)) return state;

  const holdings = state.realm.holdings.map((h, idx) =>
    idx === holdingIdx
      ? {
          ...h,
          buildings: [...h.buildings, building],
          garrison: h.garrison + (building === 'ring_fortress' ? 12 : 0),
        }
      : h
  );

  const realm = {
    ...state.realm,
    silver: state.realm.silver - bDef.costSilver,
    fame: state.realm.fame + 20,
    stability: clampStat(state.realm.stability + (building === 'ring_fortress' ? 8 : 0)),
    tradeNetworks:
      building === 'kaupang_market' ? state.realm.tradeNetworks + 1 : state.realm.tradeNetworks,
    holdings,
  };

  const sName = SETTLEMENTS_BY_ID[settlementId]?.name ?? settlementId;
  const sNameFa = SETTLEMENTS_FA[settlementId]?.name ?? sName;
  const bFa = BUILDINGS_FA[building];
  const text = `Built a ${bDef.name} (${bDef.norseName}) on your estate at ${sName}.`;
  const textFa = `بنای «${bFa?.name ?? bDef.name}» در املاک شما در ${sNameFa} ساخته و آماده شد.`;

  const deltas = [
    `-${bDef.costSilver} Silver`,
    '+20 Fame',
    bDef.effectsLabel.split('·')[0].trim(),
  ];
  const deltasFa = [`-${bDef.costSilver} نقره`, '+20 شهرت', bFa?.shortEffect ?? ''];

  const builtState: FullGameState = {
    ...state,
    builtThisYear: true,
    realm,
    lifeLog: [
      ...state.lifeLog,
      {
        id: `log_bld_${building}_${settlementId}_${state.year}_${state.lifeLog.length}`,
        year: state.year,
        season: state.season,
        age: state.character.age,
        locationName: sName,
        category: 'Action',
        iconType: 'crown',
        title: `Built ${bDef.name}`,
        titleFa: `ساخت بنا: ${bFa?.name ?? bDef.name}`,
        text,
        textFa,
        deltas,
        deltasFa,
      },
    ],
    lastOutcomeBanner: {
      title: `Constructed ${bDef.name}`,
      titleFa: `ساخت بنا: ${bFa?.name ?? bDef.name}`,
      text,
      textFa,
      deltaSummary: deltas,
      deltaSummaryFa: deltasFa,
    },
  };

  builtState.achievements = evaluateAchievements(builtState);
  return builtState;
}

export function getClaimableNextTitle(state: FullGameState): TitleRank | null {
  const curIdx = TITLE_LADDER.indexOf(state.character.title);
  if (curIdx < 0 || curIdx >= TITLE_LADDER.length - 1) return null;

  const r = state.realm;
  if (state.character.title === TitleRank.Thrall) {
    return null; // Must use buy_freedom or event
  }
  if (state.character.title === TitleRank.Freeman) {
    if (r.landFarms >= 1 && r.silver >= 30) return TitleRank.Bonde;
  } else if (state.character.title === TitleRank.Bonde) {
    if (r.landFarms >= 3 && r.hirdWarriors >= 15 && r.fame >= 90) return TitleRank.Hersir;
  } else if (state.character.title === TitleRank.Hersir) {
    if (r.landFarms >= 6 && r.hirdWarriors >= 45 && r.longships >= 2 && r.fame >= 240)
      return TitleRank.Jarl;
  } else if (state.character.title === TitleRank.Jarl) {
    if (r.landFarms >= 10 && r.hirdWarriors >= 100 && r.longships >= 4 && r.fame >= 500)
      return TitleRank.Konungr;
  } else if (state.character.title === TitleRank.Konungr) {
    const regionsHeld = new Set(
      r.holdings.map((h) => SETTLEMENTS_BY_ID[h.settlementId]?.regionGroup).filter(Boolean)
    );
    if (regionsHeld.size >= 3 && r.hirdWarriors >= 180 && r.fame >= 850) {
      return TitleRank.Overking;
    }
  }
  return null;
}

export function getNextTitleRequirementText(title: TitleRank, lang: Language = 'en'): string {
  if (lang === 'fa') {
    switch (title) {
      case TitleRank.Thrall:
        return 'برای آزادی: ۲۵ نقره جمع کنید و از بخش «اقدامات» آزادی خود را بخرید.';
      case TitleRank.Freeman:
        return 'مقام بعدی — زمین‌دار (بونده): داشتن حداقل ۱ مزرعه و ۳۰ سکه نقره.';
      case TitleRank.Bonde:
        return 'مقام بعدی — سردار محلی (هرسیر): ۳ مزرعه، ۱۵ جنگجو و ۹۰ شهرت.';
      case TitleRank.Hersir:
        return 'مقام بعدی — فرمانروا (یارل): ۶ مزرعه، ۴۵ جنگجو، ۲ کشتی جنگی و ۲۴۰ شهرت.';
      case TitleRank.Jarl:
        return 'مقام بعدی — پادشاه (کونونگر): ۱۰ مزرعه، ۱۰۰ جنگجو، ۴ کشتی جنگی و ۵۰۰ شهرت.';
      case TitleRank.Konungr:
        return 'مقام بعدی — شاهنشاه دریای شمال: املاک در ۳ منطقه مختلف، ۱۸۰ جنگجو و ۸۵۰ شهرت.';
      case TitleRank.Overking:
        return 'بالاترین مقام عصر وایکینگ‌ها در دست شماست — شاهنشاه دریاهای شمال!';
    }
  }
  switch (title) {
    case TitleRank.Thrall:
      return 'To become Free: Save 25 Silver and select "Buy Your Freedom" in Actions.';
    case TitleRank.Freeman:
      return 'Next Rank — Landowner (Bonde): Own 1+ Farm and 30+ Silver.';
    case TitleRank.Bonde:
      return 'Next Rank — War-Chieftain (Hersir): Own 3+ Farms, 15+ Warriors, and 90+ Fame.';
    case TitleRank.Hersir:
      return 'Next Rank — Jarl (Earl): Own 6+ Farms, 45+ Warriors, 2+ War Longships, and 240+ Fame.';
    case TitleRank.Jarl:
      return 'Next Rank — King (Konungr): Own 10+ Farms, 100+ Warriors, 4+ War Longships, and 500+ Fame.';
    case TitleRank.Konungr:
      return 'Next Rank — High King of the North Sea: Hold lands in 3+ Regions, 180+ Warriors, and 850+ Fame.';
    case TitleRank.Overking:
      return 'Supreme Rank Achieved — High King across the Northern Seas!';
  }
}

export type FamilyInteractionType = 'talk' | 'gift' | 'teach' | 'argue' | 'peace_marry';

export function executeFamilyMemberInteraction(
  state: FullGameState,
  personId: string,
  interaction: FamilyInteractionType
): FullGameState {
  if (state.familyInteractionsUsed?.[personId]) return state;
  const idx = state.relationships.findIndex((r) => r.id === personId && r.alive);
  if (idx < 0) return state;

  const rng = new SeededRNG(state.rngState);
  const char: CharacterState = {
    ...state.character,
    stats: { ...state.character.stats },
    skills: { ...state.character.skills },
    traits: [...state.character.traits],
  };
  const realm = {
    ...state.realm,
    holdings: state.realm.holdings.map((h) => ({ ...h, buildings: [...h.buildings] })),
  };
  const relationships = state.relationships.map((r) => ({ ...r, traits: [...r.traits] }));
  const target = relationships[idx];
  const nameEn = target.name;
  const nameFa = formatPersonName(target.name, 'fa');
  const loc = SETTLEMENTS_BY_ID[char.locationId] ?? SETTLEMENTS[0];

  let title = '';
  let titleFa = '';
  let text = '';
  let textFa = '';
  const deltas: string[] = [];
  const deltasFa: string[] = [];
  let marriedEnemy = false;

  if (interaction === 'talk') {
    target.affinity = clampStat(target.affinity + rng.int(6, 11));
    char.stats.happiness = clampStat(char.stats.happiness + 4);
    char.stats.charisma = clampStat(char.stats.charisma + 1);
    title = `Heart-to-Heart with ${nameEn}`;
    titleFa = `گپِ صمیمی با «${nameFa}»`;
    text = `You shared warm ale and stories by the hearth with ${nameEn}, growing closer.`;
    textFa = `کنار آتش با «${nameFa}» نشستید، بگووبخند کردید و صمیمیت بینتان بیشتر شد.`;
    deltas.push('Bond +8', 'Happiness +4');
    deltasFa.push('صمیمیت +8', 'شادی +4');
  } else if (interaction === 'gift') {
    if (realm.silver < 5) return state;
    realm.silver -= 5;
    target.affinity = clampStat(target.affinity + rng.int(13, 18));
    char.stats.happiness = clampStat(char.stats.happiness + 5);
    char.stats.honor = clampStat(char.stats.honor + 2);
    title = `Gifted Silver to ${nameEn}`;
    titleFa = `هدیه‌ی نقره به «${nameFa}»`;
    text = `You gifted ${nameEn} a finely worked 5-silver brooch — their eyes lit right up!`;
    textFa = `یک سنجاقِ نقره‌کوبِ ۵ سکه‌ای به «${nameFa}» کادو دادی و چشمانش از خوشحالی برق زد!`;
    deltas.push('-5 Silver', 'Bond +15', 'Happiness +5');
    deltasFa.push('-5 نقره', 'صمیمیت +15', 'شادی +5');
  } else if (interaction === 'teach') {
    target.affinity = clampStat(target.affinity + 10);
    const mentorTrait = rng.pick(['brave', 'cunning', 'oath_keeper']);
    if (!target.traits.includes(mentorTrait)) {
      target.traits.push(mentorTrait);
    }
    char.stats.honor = clampStat(char.stats.honor + 3);
    char.stats.happiness = clampStat(char.stats.happiness + 4);
    char.skills.combat = clampSkill(char.skills.combat + 2);
    title = `Trained ${nameEn}`;
    titleFa = `آموزش مهارت به «${nameFa}»`;
    text = `You drilled ${nameEn} in shield-work and northern law, preparing a sharper heir for tomorrow!`;
    textFa = `به «${nameFa}» فوت‌وفنِ سپرداری و رسمِ روزگار یاد دادی تا وارثِ کاربلدی بار بیاید!`;
    deltas.push('Bond +10', 'Honor +3', 'Heir Trained');
    deltasFa.push('صمیمیت +10', 'شرافت +3', 'تقویت وارث');
  } else if (interaction === 'argue') {
    target.affinity = clampStat(target.affinity - rng.int(14, 22));
    char.stats.happiness = clampStat(char.stats.happiness - 4);
    char.stats.strength = clampStat(char.stats.strength + 2);
    const turnedRival =
      target.affinity <= 15 &&
      target.role !== 'Child' &&
      target.role !== 'Spouse' &&
      rng.chance(0.35);
    if (turnedRival) {
      target.role = 'Rival';
    }
    title = `Heated Argument with ${nameEn}`;
    titleFa = `بحث و دعوای لفظی با «${nameFa}»`;
    text = turnedRival
      ? `Your shouting match with ${nameEn} got so ugly they stormed out of the hall as an open rival!`
      : `Tempers flared over dinner with ${nameEn}; mugs slammed on oak and the mood soured.`;
    textFa = turnedRival
      ? `کل‌کل و دعوایت با «${nameFa}» آن‌قدر بالا گرفت که درِ تالار را کوبید و رسماً رقیبت شد!`
      : `سرِ شام با «${nameFa}» بحثت بالا گرفت؛ لیوان‌ها کوبیده شد روی میز و فضا شکرآب شد.`;
    deltas.push('Bond -18', 'Happiness -4', 'Strength +2');
    deltasFa.push('صمیمیت -18', 'شادی -4', 'قدرت +2');
  } else if (interaction === 'peace_marry') {
    const alreadyMarried = relationships.some((r) => r.role === 'Spouse' && r.alive);
    if (alreadyMarried || char.age < 17) return state;
    marriedEnemy = true;
    const spSex = char.sex === Sex.Male ? Sex.Female : Sex.Male;
    if (target.sex === spSex) {
      target.role = 'Spouse';
      target.affinity = 78;
    } else {
      relationships.splice(idx, 1);
      const pool =
        spSex === Sex.Male
          ? MALE_NAMES_BY_REGION[loc.regionGroup]
          : FEMALE_NAMES_BY_REGION[loc.regionGroup];
      const kinName = `${rng.pick(pool)} ${makePatronymic(target.name.split(' ')[0] || 'Ragnar', spSex)}`;
      relationships.push({
        id: `rel_pmarry_${state.year}_${rng.int(100, 999)}`,
        name: kinName,
        sex: spSex,
        role: 'Spouse',
        age: Math.max(18, char.age + rng.int(-3, 3)),
        alive: true,
        affinity: 80,
        socialClass: char.socialClass,
        locationId: loc.id,
        traits: ['brave', 'cunning'],
      });
    }
    realm.stability = clampStat(realm.stability + 10);
    realm.fame += 20;
    char.stats.happiness = clampStat(char.stats.happiness + 12);
    title = `Peace-Marriage Sealed!`;
    titleFa = `پیوندِ ازدواجِ سیاسی با خاندان دشمن!`;
    text = `Instead of trading axe-blows, you sealed a dramatic peace-marriage ending the feud with ${nameEn}!`;
    textFa = `به‌جای تبرکشی و خون‌ریزی، با یک وصلتِ پرماجرا به دشمنی با «${nameFa}» پایان دادی!`;
    deltas.push('Feud Ended!', 'Happiness +12', 'Stability +10');
    deltasFa.push('پایان دشمنی خونی!', 'شادی +12', 'ثبات +10');
  }

  const nextState: FullGameState = {
    ...state,
    rngState: rng.getState(),
    marriedBloodEnemy: state.marriedBloodEnemy || marriedEnemy,
    familyInteractionsUsed: {
      ...(state.familyInteractionsUsed ?? {}),
      [personId]: true,
    },
    character: char,
    realm,
    relationships,
    lifeLog: [
      ...state.lifeLog,
      {
        id: `log_fam_${interaction}_${state.year}_${state.lifeLog.length}_${rng.int(100, 999)}`,
        year: state.year,
        season: state.season,
        age: char.age,
        locationName: loc.name,
        category: 'Family',
        iconType: interaction === 'argue' ? 'sword' : interaction === 'gift' ? 'coin' : 'family',
        title,
        titleFa,
        text,
        textFa,
        deltas,
        deltasFa,
      },
    ],
    lastOutcomeBanner: {
      title,
      titleFa,
      text,
      textFa,
      deltaSummary: deltas,
      deltaSummaryFa: deltasFa,
    },
  };

  nextState.achievements = evaluateAchievements(nextState);
  return nextState;
}

export function continueAsHeir(state: FullGameState, heirId: string): FullGameState {
  if (!state.pendingDeath) return state;
  const heir = state.pendingDeath.eligibleHeirs.find((h) => h.id === heirId);
  if (!heir) {
    return { ...state, screen: GameScreen.DYNASTY_OVER };
  }

  const rng = new SeededRNG(state.rngState);
  const old = state.character;

  const ancestorRecord: DynastyAncestor = {
    id: old.id,
    fullName: `${old.givenName} ${old.patronymic}${old.epithet ? ` "${old.epithet}"` : ''}`,
    title: old.title,
    birthYear: old.birthYear,
    deathYear: state.year,
    ageAtDeath: old.age,
    causeOfDeath: state.pendingDeath.causeOfDeath,
    causeOfDeathFa: state.pendingDeath.causeOfDeathFa,
    reportTitle: state.pendingDeath.lifeTitle ?? state.pendingDeath.reportTitle,
    reportTitleFa: state.pendingDeath.lifeTitleFa ?? state.pendingDeath.reportTitleFa,
    generation: state.generation,
    fameEarned: state.realm.fame,
    holdingsCount: state.realm.landFarms,
    raidsLed: old.raidsLed,
    religion: old.religion,
    obituaryProse: state.pendingDeath.obituaryProse,
    obituaryProseFa: state.pendingDeath.obituaryProseFa,
    divergences: [...state.divergences],
  };

  const parts = heir.name.split(' ');
  const givenName = parts[0] || 'Harald';
  const patronymic = parts.slice(1).join(' ') || makePatronymic(old.givenName, heir.sex);
  const newCharId = `char_gen${state.generation + 1}_${rng.int(1000, 9999)}`;
  const heirAge = Math.max(6, heir.age);

  const inheritedTitle =
    old.title === TitleRank.Overking ? TitleRank.Konungr : old.title;

  const newChar: CharacterState = {
    id: newCharId,
    givenName,
    patronymic,
    epithet: '',
    sex: heir.sex,
    age: heirAge,
    birthYear: state.year - heirAge,
    birthplaceId: heir.locationId,
    locationId: old.locationId,
    socialClass:
      old.socialClass === SocialClass.Thrall && inheritedTitle !== TitleRank.Thrall
        ? SocialClass.Karl
        : old.socialClass,
    title: inheritedTitle,
    religion: old.religion,
    appearance: deriveAppearanceFromId(newCharId),
    traits: heir.traits.length > 0 ? [...heir.traits] : ['brave', 'oath_keeper'],
    stats: {
      health: rng.int(76, 94),
      strength: heirAge < 14 ? rng.int(28, 45) : rng.int(52, 74),
      cunning: rng.int(48, 74),
      charisma: rng.int(48, 74),
      honor: clampStat(Math.round(old.stats.honor * 0.75) + 15),
      wyrd: rng.int(48, 72),
      faith: rng.int(45, 70),
      happiness: 68,
    },
    skills: {
      combat: heirAge < 14 ? 12 : rng.int(22, 42),
      seamanship: rng.int(20, 40),
      farming: rng.int(18, 36),
      trade: rng.int(18, 36),
      diplomacy: rng.int(18, 36),
      law: rng.int(16, 34),
      craft: rng.int(14, 30),
      skaldcraft: rng.int(12, 28),
      seidr: rng.int(4, 14),
    },
    isOutlawed: false,
    raidsLed: 0,
    voyagesCompleted: 0,
    killsInHolmgang: 0,
    thingsAttended: 0,
  };

  const heirWasChild = heir.role === 'Child' || heir.role === 'Foster-Child';
  const heirWasSibling = heir.role === 'Sibling';

  // Rebuild all relationship roles from the new character's perspective!
  const nextRelationships: RelationshipPerson[] = state.relationships
    .filter((r) => r.id !== heir.id && r.alive)
    .map((r) => {
      let newRole = r.role;
      if (heirWasChild) {
        if (r.role === 'Child' || r.role === 'Foster-Child') newRole = 'Sibling';
        else if (r.role === 'Spouse' || r.role === 'Concubine') {
          newRole = r.sex === Sex.Female ? 'Mother' : 'Father';
        } else if (r.role === 'Sibling') {
          newRole = 'Uncle/Aunt';
        } else if (r.role === 'Nephew/Niece') {
          newRole = 'Cousin';
        } else if (r.role === 'Father' || r.role === 'Mother') {
          newRole = 'Uncle/Aunt';
        }
      } else if (heirWasSibling) {
        if (r.role === 'Child' || r.role === 'Foster-Child') {
          newRole = 'Nephew/Niece';
        } else if (r.role === 'Spouse') {
          newRole = 'Cousin';
        }
      }
      return {
        ...r,
        role: newRole,
        isHeirEligible:
          newRole === 'Child' ||
          newRole === 'Sibling' ||
          newRole === 'Nephew/Niece' ||
          newRole === 'Foster-Child',
      };
    });

  // Record the late predecessor from the heir's perspective (e.g., Late Father / Late Mother / Late Sibling)
  const lateRole: RelationshipPerson['role'] = heirWasChild
    ? old.sex === Sex.Male
      ? 'Father'
      : 'Mother'
    : heirWasSibling
      ? 'Sibling'
      : old.sex === Sex.Male
        ? 'Sworn Brother'
        : 'Sworn Sister';

  nextRelationships.push({
    id: `rel_late_${old.id}`,
    name: `${old.givenName} ${old.patronymic}`,
    epithet: old.epithet || undefined,
    sex: old.sex,
    role: lateRole,
    age: old.age,
    alive: false,
    affinity: 90,
    socialClass: old.socialClass,
    locationId: old.locationId,
    traits: [...old.traits],
    deathYear: state.year,
    causeOfDeath: state.pendingDeath.causeOfDeath,
    causeOfDeathFa: state.pendingDeath.causeOfDeathFa,
  });

  // Generate age-appropriate Spouse & Children if the heir is already an adult!
  const loc = SETTLEMENTS_BY_ID[newChar.locationId] ?? SETTLEMENTS[0];
  if (heirAge >= 20 && !nextRelationships.some((r) => r.role === 'Spouse' && r.alive)) {
    const spSex = newChar.sex === Sex.Male ? Sex.Female : Sex.Male;
    const spPool =
      spSex === Sex.Male
        ? MALE_NAMES_BY_REGION[loc.regionGroup]
        : FEMALE_NAMES_BY_REGION[loc.regionGroup];
    const spGiven = rng.pick(spPool);
    nextRelationships.unshift({
      id: `rel_heir_sp_${state.year}_${rng.int(100, 999)}`,
      name: `${spGiven} ${makePatronymic(rng.pick(MALE_NAMES_BY_REGION[loc.regionGroup]), spSex)}`,
      sex: spSex,
      role: 'Spouse',
      age: Math.max(18, heirAge + rng.int(-3, 2)),
      alive: true,
      affinity: rng.int(74, 90),
      socialClass: newChar.socialClass,
      locationId: newChar.locationId,
      traits: [rng.pick(['charismatic', 'cunning', 'brave', 'oath_keeper'])],
    });
  }

  if (heirAge >= 22 && !nextRelationships.some((r) => r.role === 'Child' && r.alive)) {
    const targetKids = heirAge >= 34 ? rng.int(2, 3) : heirAge >= 27 ? 2 : 1;
    const maxChildAge = Math.max(1, Math.min(22, heirAge - 19));
    for (let i = 0; i < targetKids; i++) {
      const kSex = rng.chance(0.5) ? Sex.Male : Sex.Female;
      const kGiven = rng.pick(
        kSex === Sex.Male
          ? MALE_NAMES_BY_REGION[loc.regionGroup]
          : FEMALE_NAMES_BY_REGION[loc.regionGroup]
      );
      const childAge = Math.max(1, maxChildAge - i * rng.int(2, 4));
      nextRelationships.push({
        id: `rel_heir_kid_${state.year}_${i}_${rng.int(100, 999)}`,
        name: `${kGiven} ${makePatronymic(newChar.givenName, kSex)}`,
        sex: kSex,
        role: 'Child',
        age: childAge,
        alive: true,
        affinity: rng.int(80, 95),
        socialClass: newChar.socialClass,
        locationId: newChar.locationId,
        traits: [rng.pick(['brave', 'cunning', 'blessed_luck'])],
        isHeirEligible: true,
      });
    }
  }

  // Add a sibling if still no eligible next-gen kin (e.g. young child heir with no brothers/sisters)
  if (!nextRelationships.some((r) => r.alive && r.isHeirEligible)) {
    const kinSex = rng.chance(0.5) ? Sex.Male : Sex.Female;
    const kinGiven = rng.pick(
      kinSex === Sex.Male
        ? MALE_NAMES_BY_REGION[loc.regionGroup]
        : FEMALE_NAMES_BY_REGION[loc.regionGroup]
    );
    nextRelationships.push({
      id: `rel_kin_${state.year}_${rng.int(100, 999)}`,
      name: `${kinGiven} ${makePatronymic(old.givenName, kinSex)}`,
      sex: kinSex,
      role: 'Sibling',
      age: Math.max(4, newChar.age - rng.int(1, 4)),
      alive: true,
      affinity: 78,
      socialClass: newChar.socialClass,
      locationId: newChar.locationId,
      traits: ['cunning'],
      isHeirEligible: true,
    });
  }

  const nextGen = state.generation + 1;
  const locName = SETTLEMENTS_BY_ID[newChar.locationId]?.name ?? newChar.locationId;
  const locNameFa = SETTLEMENTS_FA[newChar.locationId]?.name ?? locName;
  const oldGivenFa = formatPersonName(old.givenName, 'fa');
  const newFullFa = formatPersonName(`${newChar.givenName} ${newChar.patronymic}`, 'fa');
  const dynFa = formatDynastyName(state.dynastyName, 'fa');

  const successionLog: LogEntry = {
    id: `log_succ_gen${nextGen}_${state.year}_${state.lifeLog.length}`,
    year: state.year,
    season: state.season,
    age: newChar.age,
    locationName: locName,
    category: 'Succession',
    iconType: 'crown',
    title: `Generation ${nextGen} · ${newChar.givenName} Takes the High-Seat`,
    titleFa: `نسل ${nextGen} · نشستن «${newFullFa}» بر مسند خاندان`,
    text: `Raising the memorial cup for ${old.givenName}, ${newChar.givenName} ${newChar.patronymic} takes command at ${locName}, inheriting ${state.realm.silver} silver, ${state.realm.landFarms} farms, and ${state.realm.longships + state.realm.knarrs} ships.`,
    textFa: `پس از نوشیدن جام یادبود برای «${oldGivenFa}»، اکنون «${newFullFa}» در ${locNameFa} فرمانروای «${dynFa}» شد و ${state.realm.silver} نقره، ${state.realm.landFarms} مزرعه و ${state.realm.longships + state.realm.knarrs} کشتی را به ارث برد.`,
  };

  const resumed: FullGameState = {
    ...state,
    rngState: rng.getState(),
    generation: nextGen,
    yearlyActivitiesUsed: {},
    builtThisYear: false,
    familyInteractionsUsed: {},
    character: newChar,
    realm: {
      ...state.realm,
      fame: Math.round(state.realm.fame * 0.75) + 20,
    },
    relationships: nextRelationships,
    ancestors: [...state.ancestors, ancestorRecord],
    pendingDeath: null,
    lastOutcomeBanner: {
      title: `Generation ${nextGen}: ${newChar.givenName} ${newChar.patronymic}`,
      titleFa: `نسل ${nextGen}: ${newFullFa}`,
      text: `The dynasty endures! ${newChar.givenName} takes command of ${state.realm.landFarms} farms and ${state.realm.hirdWarriors} warriors.`,
      textFa: `خاندان پابرجاست! «${formatPersonName(newChar.givenName, 'fa')}» فرماندهی ${state.realm.landFarms} مزرعه و ${state.realm.hirdWarriors} جنگجو را بر عهده گرفت.`,
      deltaSummary: [`Generation ${nextGen}`, `Rank: ${SHORT_TITLE_LABELS.en[newChar.title]}`],
      deltaSummaryFa: [`نسل ${nextGen}`, `مقام: ${SHORT_TITLE_LABELS.fa[newChar.title]}`],
    },
    lifeLog: [...state.lifeLog, successionLog],
  };

  resumed.achievements = evaluateAchievements(resumed);
  return resumed;
}
