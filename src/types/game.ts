export type Language = 'en' | 'fa';

export enum GameScreen {
  CREATION = 'CREATION',
  PLAYING = 'PLAYING',
  DYNASTY_OVER = 'DYNASTY_OVER',
}

export enum Season {
  Spring = 'Spring',
  Summer = 'Summer',
  Autumn = 'Autumn',
  Winter = 'Winter',
}

export enum SocialClass {
  Thrall = 'thrall',
  Karl = 'karl',
  Bonde = 'bonde',
  HersirKin = 'hersir_kin',
  JarlKin = 'jarl_kin',
  Royal = 'royal',
}

export enum TitleRank {
  Thrall = 'Thrall',
  Freeman = 'Freeman',
  Bonde = 'Bonde',
  Hersir = 'Hersir',
  Jarl = 'Jarl',
  Konungr = 'Konungr',
  Overking = 'Overking of the North Sea',
}

export enum Religion {
  NorsePagan = 'Norse Pagan',
  Syncretic = 'Prime-Signed (Syncretic)',
  Christian = 'Christian',
}

export enum Sex {
  Male = 'male',
  Female = 'female',
}

export enum TabId {
  Life = 'life',
  Actions = 'actions',
  Realm = 'realm',
  Family = 'family',
  Map = 'map',
  Saga = 'saga',
  More = 'more',
}

export enum Difficulty {
  Forgiving = 'forgiving',
  Historical = 'historical',
  Brutal = 'brutal',
}

export enum ContentIntensity {
  Mild = 'mild',
  Normal = 'normal',
}

export enum TimeStepMode {
  Year = 'year',
  Season = 'season',
}

export type RegionGroup =
  | 'Norway'
  | 'Denmark'
  | 'Sweden'
  | 'British Isles'
  | 'Ireland'
  | 'Continent'
  | 'North Atlantic';

export type StatKey =
  | 'health'
  | 'strength'
  | 'cunning'
  | 'charisma'
  | 'honor'
  | 'wyrd'
  | 'faith'
  | 'happiness';

export type SkillKey =
  | 'combat'
  | 'seamanship'
  | 'farming'
  | 'trade'
  | 'diplomacy'
  | 'law'
  | 'craft'
  | 'skaldcraft'
  | 'seidr';

export type EventCategory =
  | 'Childhood'
  | 'Coming of Age'
  | 'Family'
  | 'Farm Life'
  | 'Blood Feud'
  | 'Feud'
  | 'Law & the Thing'
  | 'Thing & Law'
  | 'Raiding'
  | 'Trade'
  | 'Voyage & Sea'
  | 'Religion'
  | 'Politics & Kings'
  | 'War'
  | 'Illness & Death'
  | 'Romance & Marriage'
  | 'Betrayal'
  | 'Mystic & Omens'
  | 'Historical Set-Piece';

export type EventIconType =
  | 'sword'
  | 'ship'
  | 'skull'
  | 'heart'
  | 'coin'
  | 'religion'
  | 'family'
  | 'crown';

export type SourceProvenance =
  | 'Anglo-Saxon Chronicle'
  | 'Annals of Ulster'
  | 'Royal Frankish Annals'
  | 'Archaeological Record'
  | 'Semi-Legendary Saga Tradition'
  | 'Social History';

export interface PersonalStats {
  health: number;
  strength: number;
  cunning: number;
  charisma: number;
  honor: number;
  wyrd: number;
  faith: number;
  happiness: number;
}

export interface SkillsState {
  combat: number;
  seamanship: number;
  farming: number;
  trade: number;
  diplomacy: number;
  law: number;
  craft: number;
  skaldcraft: number;
  seidr: number;
}

export interface CharacterAppearance {
  skinTone: 0 | 1 | 2 | 3;
  hairColor: 'blonde' | 'red' | 'brown' | 'black';
  hairStyle: 0 | 1 | 2 | 3;
  beardStyle: 0 | 1 | 2 | 3;
}

export interface TraitDef {
  id: string;
  name: string;
  oldNorseTerm?: string;
  description: string;
  isScarOrCondition?: boolean;
  statModifiers?: Partial<PersonalStats>;
  skillModifiers?: Partial<SkillsState>;
}

export type RelationRole =
  | 'Father'
  | 'Mother'
  | 'Foster-Parent'
  | 'Sibling'
  | 'Spouse'
  | 'Concubine'
  | 'Child'
  | 'Foster-Child'
  | 'Sworn Brother'
  | 'Sworn Sister'
  | 'Uncle/Aunt'
  | 'Nephew/Niece'
  | 'Cousin'
  | 'Rival'
  | 'Blood-Feud Enemy';

export interface RelationshipPerson {
  id: string;
  name: string;
  epithet?: string;
  sex: Sex;
  role: RelationRole;
  age: number;
  alive: boolean;
  affinity: number; // 0 to 100
  socialClass: SocialClass;
  locationId: string;
  traits: string[];
  causeOfDeath?: string;
  causeOfDeathFa?: string;
  deathYear?: number;
  isHeirEligible?: boolean;
}

export type BuildingType =
  | 'skali_hall'
  | 'boathouse_naust'
  | 'ring_fortress'
  | 'kaupang_market'
  | 'pagan_hof'
  | 'stave_church';

export interface Holding {
  settlementId: string;
  farms: number;
  buildings: BuildingType[];
  garrison: number;
}

export interface RealmState {
  silver: number;
  landFarms: number;
  hirdWarriors: number;
  longships: number;
  knarrs: number;
  foodStores: number;
  population: number;
  stability: number;
  fame: number;
  tradeNetworks: number;
  holdings: Holding[];
  thrallsOwned: number;
}

export interface Settlement {
  id: string;
  name: string;
  norseName: string;
  regionGroup: RegionGroup;
  subRegion: string;
  lat: number;
  lon: number;
  foundedYear?: number;
  isRiverPort?: boolean;
  riverName?: string;
  baseWealth: number;
  baseDefense: number;
  isMonastery?: boolean;
  isThingSite?: boolean;
  historicalSummary: string;
  controllersByEra: {
    untilYear: number;
    ruler: string;
    polity: string;
    religion: Religion;
  }[];
}

export interface ChainedEventRef {
  eventId: string;
  delayYears: number;
}

export interface EventEffects {
  stats?: Partial<PersonalStats>;
  skills?: Partial<SkillsState>;
  silver?: number;
  landFarms?: number;
  hirdWarriors?: number;
  longships?: number;
  knarrs?: number;
  foodStores?: number;
  stability?: number;
  fame?: number;
  thrallsOwned?: number;
  addTraits?: string[];
  removeTraits?: string[];
  addFlags?: string[];
  removeFlags?: string[];
  newReligion?: Religion;
  newTitle?: TitleRank;
  moveToSettlementId?: string;
  spawnRival?: { name?: string; role: 'Rival' | 'Blood-Feud Enemy' };
  spawnSwornSibling?: boolean;
  marryRandom?: boolean;
  marryRivalPeace?: boolean;
  birthChild?: boolean;
  divergenceNote?: string;
}

export interface EventChoice {
  id: string;
  label: string;
  mildLabel?: string;
  tooltipHint?: string;
  requiredSilver?: number;
  requiredSkill?: { skill: SkillKey; min: number };
  requiredStat?: { stat: StatKey; min: number };
  outcomeText: string;
  mildOutcomeText?: string;
  effects?: EventEffects;
  deathChance?: number;
  deathReason?: string;
  deathTypeId?: string;
  injuryChance?: number;
  injuryTraitId?: string;
  chain?: ChainedEventRef;
}

export interface EventConditions {
  eras?: (1 | 2 | 3 | 4)[];
  exactYear?: number;
  yearRange?: [number, number];
  ageMin?: number;
  ageMax?: number;
  sex?: Sex;
  regions?: RegionGroup[];
  settlementIds?: string[];
  classes?: SocialClass[];
  minTitleRankIndex?: number;
  religions?: Religion[];
  minSilver?: number;
  minFame?: number;
  minWarriors?: number;
  minShips?: number;
  maxStability?: number;
  requiredTraits?: string[];
  blockedByTraits?: string[];
  requiredFlags?: string[];
  blockedByFlags?: string[];
  uniqueOncePerCampaign?: boolean;
}

export interface HistoricalVikingEvent {
  id: string;
  title: string;
  text: string;
  mildText?: string;
  provenance?: SourceProvenance;
  isSemiLegendary?: boolean;
  conditions: EventConditions;
  choices: EventChoice[];
}

export interface GameEvent {
  id: string;
  title: string;
  category: EventCategory;
  iconType?: EventIconType;
  provenance?: SourceProvenance;
  isSemiLegendary?: boolean;
  conditions?: EventConditions;
  eras?: (1 | 2 | 3 | 4)[];
  exactYear?: number;
  yearRange?: [number, number];
  ageMin?: number;
  ageMax?: number;
  sex?: Sex;
  regions?: RegionGroup[];
  settlementIds?: string[];
  classes?: SocialClass[];
  minTitleRankIndex?: number;
  religions?: Religion[];
  requiredTraits?: string[];
  blockedByTraits?: string[];
  requiredFlags?: string[];
  blockedByFlags?: string[];
  weight: number;
  text: string;
  mildText?: string;
  choices: EventChoice[];
}

export interface LogEntry {
  id: string;
  year: number;
  season: Season;
  age: number;
  locationName: string;
  category: EventCategory | 'Chronicle' | 'Action' | 'Succession';
  iconType?: EventIconType;
  title?: string;
  titleFa?: string;
  text: string;
  textFa?: string;
  deltas?: string[];
  deltasFa?: string[];
  provenance?: SourceProvenance;
  isSemiLegendary?: boolean;
  isDivergence?: boolean;
  isDanger?: boolean;
}

export interface ScheduledChain {
  triggerYear: number;
  eventId: string;
}

export interface CharacterState {
  id: string;
  givenName: string;
  patronymic: string;
  epithet: string;
  sex: Sex;
  age: number;
  birthYear: number;
  birthplaceId: string;
  locationId: string;
  socialClass: SocialClass;
  title: TitleRank;
  religion: Religion;
  traits: string[];
  stats: PersonalStats;
  skills: SkillsState;
  appearance?: CharacterAppearance;
  isOutlawed: boolean;
  raidsLed: number;
  voyagesCompleted: number;
  killsInHolmgang: number;
  thingsAttended: number;
}

export interface DynastyAncestor {
  id: string;
  fullName: string;
  title: TitleRank;
  birthYear: number;
  deathYear: number;
  ageAtDeath: number;
  causeOfDeath: string;
  causeOfDeathFa?: string;
  reportTitle?: string;
  reportTitleFa?: string;
  generation: number;
  fameEarned: number;
  holdingsCount: number;
  raidsLed: number;
  religion: Religion;
  obituaryProse: string;
  obituaryProseFa?: string;
  divergences: string[];
}

export interface WinGoal {
  id: string;
  title: string;
  norseSubtitle: string;
  description: string;
  checkCompleted: (state: FullGameState) => boolean;
  progressLabel: (state: FullGameState) => string;
}

export interface GameSettings {
  language: Language;
  textSize: 'sm' | 'base' | 'lg';
  emberAnimation: boolean;
  weatherOverlayEnabled: boolean;
  soundEnabled: boolean;
  ambientAudioEnabled: boolean;
  ambientVolume: number;
  difficulty: Difficulty;
  contentIntensity: ContentIntensity;
  timeStepMode: TimeStepMode;
}

export interface PendingDeathState {
  deathTypeId?: string;
  causeOfDeath: string;
  causeOfDeathFa?: string;
  closingLine?: string;
  closingLineFa?: string;
  lifeTitle?: string;
  lifeTitleFa?: string;
  reportTitle?: string;
  reportTitleFa?: string;
  obituaryProse: string;
  obituaryProseFa?: string;
  legacyScore: number;
  eligibleHeirs: RelationshipPerson[];
}

export type YearlyActivityKey = 'trade' | 'train' | 'raid' | 'travel' | 'settle';

export interface FullGameState {
  saveVersion?: number;
  screen: GameScreen;
  seedString: string;
  rngState: number;
  year: number;
  season: Season;
  generation: number;
  dynastyName: string;
  winGoalId: string;
  winGoalAchievedYear?: number;
  actionsRemainingThisTurn: number;
  yearlyActivitiesUsed?: Partial<Record<YearlyActivityKey, boolean>>;
  builtThisYear?: boolean;
  familyInteractionsUsed?: Record<string, boolean>;
  onboardingStep?: number;
  onboardingDismissed?: boolean;
  epilogue1066Shown?: boolean;
  pending1066Epilogue?: boolean;
  freeModeAfter1066?: boolean;
  totalRaidsWon?: number;
  marriedBloodEnemy?: boolean;
  divorcesCount?: number;
  conquestsWon?: number;
  character: CharacterState;
  realm: RealmState;
  relationships: RelationshipPerson[];
  ancestors: DynastyAncestor[];
  discoveredSettlements: string[];
  flags: string[];
  divergences: string[];
  divergencesFa?: string[];
  achievements: string[];
  scheduledChains: ScheduledChain[];
  firedUniqueEvents: string[];
  lifeLog: LogEntry[];
  activeEvent: GameEvent | null;
  lastOutcomeBanner: {
    title: string;
    titleFa?: string;
    text: string;
    textFa?: string;
    deltaSummary: string[];
    deltaSummaryFa?: string[];
  } | null;
  pendingDeath: PendingDeathState | null;
  settings: GameSettings;
}

export interface PremadeCharacter {
  id: string;
  name: string;
  patronymic: string;
  subtitle: string;
  historicalContext: string;
  isSagaInspired?: boolean;
  year: number;
  age: number;
  sex: Sex;
  birthplaceId: string;
  socialClass: SocialClass;
  religion: Religion;
  traits: string[];
  winGoalId: string;
  bonusSilver?: number;
  bonusShips?: number;
  bonusWarriors?: number;
  startingFlags?: string[];
}
