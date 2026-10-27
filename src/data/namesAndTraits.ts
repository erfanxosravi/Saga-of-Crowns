import {
  BuildingType,
  PremadeCharacter,
  RegionGroup,
  Religion,
  Sex,
  SocialClass,
  TitleRank,
  TraitDef,
  WinGoal,
} from '../types/game';

export const MALE_NAMES_BY_REGION: Record<RegionGroup, string[]> = {
  Norway: [
    'Hakon', 'Harald', 'Olaf', 'Eirik', 'Sigurd', 'Bjorn', 'Torstein', 'Einar',
    'ketil', 'Gunnar', 'Rollo', 'Arne', 'Erling', 'Tryggvi', 'Kalf', 'Hallvard',
  ].map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
  Denmark: [
    'Sweyn', 'Cnut', 'Gorm', 'Harald', 'Halfdan', 'Guthrum', 'Toke', 'Ulf',
    'Thorkell', 'Hemming', 'Horik', 'Sigfred', 'Asbjorn', 'Eskil', 'Palnatoke',
  ],
  Sweden: [
    'Bjorn', 'Eirik', 'Olof', 'Rurik', 'Ingvar', 'Freyvid', 'Styrbjorn', 'Anund',
    'Hakon', 'Torgny', 'Folke', 'Sven', 'Ragnvald', 'Arnljot',
  ],
  'British Isles': [
    'Ivar', 'Ubbe', 'Sigtrygg', 'Ragnall', 'Thorfinn', 'Sigurd', 'Grim', 'Orm',
    'Hrafn', 'Morcar', 'Oswulf', 'Aethelred', 'Godwin', 'ketil',
  ].map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
  Ireland: [
    'Olaf', 'Sigtrygg', 'Ivar', 'Brodar', 'Gluniarainn', 'Thorgils', 'Amlaib',
    'Magnus', 'echmarcach', 'askel', 'Ottar', 'Gofraid',
  ].map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
  Continent: [
    'Rollo', 'William', 'Richard', 'Hastein', 'Bjorn', 'Ansgar', 'Godfrid',
    'Reginher', 'Sigfried', 'Welund', 'Turstin', 'Osbern',
  ],
  'North Atlantic': [
    'Ingolf', 'Leif', 'Thorvald', 'Skallagrim', 'Egil', 'Njal', 'Gunnar',
    'Snorri', 'Kjartan', 'Bolli', 'Thorfinn', 'Flosi', 'Hoskuld', 'Ari',
  ],
};

export const FEMALE_NAMES_BY_REGION: Record<RegionGroup, string[]> = {
  Norway: [
    'Astrid', 'Ragnhild', 'Gunnhild', 'Bergljot', 'Ingeborg', 'Gyda', 'Sigrid',
    'Tora', 'Jorunn', 'Alfhild', 'Solveig', 'Asa', 'Borghild',
  ],
  Denmark: [
    'Thyra', 'Estrid', 'Tove', 'Sigrid', 'Gunhild', 'Gytha', 'Aslaug', 'Bodil',
    'Ingegerd', 'Ragnhild', 'Svanehild', 'Gro',
  ],
  Sweden: [
    'Sigrid', 'Ingegerd', 'Estrid', 'Ylva', 'Freydis', 'Holmfrid', 'kata',
    'Bothild', 'Ragnfrid', 'Gunvor', 'Disa',
  ].map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
  'British Isles': [
    'Aud', 'Thora', 'Ragnhild', 'Gytha', 'Aethelflaed', 'Hild', 'Gunnor',
    'Ingrid', 'frida', 'Helga', 'unna',
  ].map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
  Ireland: [
    'Gormlaith', 'Aud', 'Melkorka', 'Ragnhild', 'Maelmuire', 'Cacht', 'Helga',
    'Thorgerd', 'Nuala', 'Ingibjorg',
  ],
  Continent: [
    'Poppa', 'Gunnor', 'Emma', 'Sprota', 'Gisela', 'Adela', 'Judith',
    'Ragnhild', 'Hildeburh', 'Estrid',
  ],
  'North Atlantic': [
    'Aud', 'Gudrun', 'Hallgerd', 'Freydis', 'Gudrid', 'Bergthora', 'Thorgerd',
    'Unn', 'Hrefna', 'Thurid', 'Yngvild', 'Steingerd',
  ],
};

export function makePatronymic(fatherName: string, sex: Sex): string {
  const clean = fatherName.trim() || 'Ulf';
  const genitive = clean.endsWith('s') ? clean : `${clean}s`;
  return sex === Sex.Male ? `${genitive}son` : `${genitive}dottir`;
}

export const SELECTABLE_TRAITS: TraitDef[] = [
  {
    id: 'brave',
    name: 'Brave',
    oldNorseTerm: 'hugprúðr',
    description: 'Stands steady in the shield wall when iron rings on wood.',
    statModifiers: { honor: 8, strength: 5 },
    skillModifiers: { combat: 8 },
  },
  {
    id: 'cunning',
    name: 'Cunning',
    oldNorseTerm: 'slœgr',
    description: 'Weighs odds, sets ambushes, and reads hidden motives in the hall.',
    statModifiers: { cunning: 14 },
    skillModifiers: { diplomacy: 6, law: 6 },
  },
  {
    id: 'pious',
    name: 'Devout',
    oldNorseTerm: 'blótmaðr',
    description: 'Keeps sacred oaths, honors sacrificial rites or church fasts.',
    statModifiers: { faith: 16, honor: 4 },
  },
  {
    id: 'greedy',
    name: 'Silver-Hungry',
    oldNorseTerm: 'fégiarn',
    description: 'Never lets an ounce of hacksilver slip past the balance scale.',
    statModifiers: { cunning: 5, honor: -6 },
    skillModifiers: { trade: 10 },
  },
  {
    id: 'wrathful',
    name: 'Wrathful',
    oldNorseTerm: 'reiðr',
    description: 'Quick to draw steel over an insult; feared in holmgang.',
    statModifiers: { strength: 10, happiness: -5 },
    skillModifiers: { combat: 10, diplomacy: -8 },
  },
  {
    id: 'charismatic',
    name: 'Word-Gifted',
    oldNorseTerm: 'vinsæll',
    description: 'Draws drengir to your benches with generous rings and warm speech.',
    statModifiers: { charisma: 15, happiness: 5 },
    skillModifiers: { diplomacy: 10 },
  },
  {
    id: 'sickly',
    name: 'Frail Lung',
    oldNorseTerm: 'vanheill',
    description: 'Damp northern winters weigh heavily on your chest, sharpening your mind.',
    statModifiers: { health: -16, cunning: 8 },
    skillModifiers: { law: 6, skaldcraft: 6 },
  },
  {
    id: 'strong_limbed',
    name: 'Strong-Limbed',
    oldNorseTerm: 'rammr',
    description: 'Broad-shouldered at the oar and tireless behind a bossed round-shield.',
    statModifiers: { strength: 15, health: 8 },
    skillModifiers: { combat: 8, farming: 6 },
  },
  {
    id: 'seafarer',
    name: 'Sea-Reader',
    oldNorseTerm: 'farmann',
    description: 'Reads swell, fulmar flight, and sun-stone glimmer through North Atlantic fog.',
    statModifiers: { wyrd: 6 },
    skillModifiers: { seamanship: 16, trade: 6 },
  },
  {
    id: 'skald_tongued',
    name: 'Skald-Tongued',
    oldNorseTerm: 'skáld',
    description: 'Weaves kennings in dróttkvætt meter that kings pay silver to hear.',
    statModifiers: { charisma: 10, honor: 6 },
    skillModifiers: { skaldcraft: 18 },
  },
  {
    id: 'law_speaker',
    name: 'Law-Minded',
    oldNorseTerm: 'lögmaðr',
    description: 'Knows wergild schedules and Thing procedure better than greybeard chieftains.',
    statModifiers: { cunning: 8, honor: 6 },
    skillModifiers: { law: 18, diplomacy: 6 },
  },
  {
    id: 'blessed_luck',
    name: 'Blessed by Wyrd',
    oldNorseTerm: 'gæfumaðr',
    description: 'Good hamingja follows your keel; storms break before your prow.',
    statModifiers: { wyrd: 18, happiness: 6 },
  },
  {
    id: 'cursed_wyrd',
    name: 'Shadow-Fated',
    oldNorseTerm: 'ógæfumaðr',
    description: 'Dark dreams trouble your sleep, yet desperate men fear your resolve.',
    statModifiers: { wyrd: -14, strength: 6, cunning: 8 },
    skillModifiers: { seidr: 10 },
  },
  {
    id: 'oath_keeper',
    name: 'Oath-Fast',
    oldNorseTerm: 'eiðfastr',
    description: 'Your word sworn upon the temple arm-ring is trusted across three seas.',
    statModifiers: { honor: 14 },
    skillModifiers: { diplomacy: 8, law: 5 },
  },
];

export const SCAR_AND_CONDITION_TRAITS: TraitDef[] = [
  {
    id: 'battle_scarred',
    name: 'Cheek-Scarred',
    oldNorseTerm: 'öróttr',
    description: 'A pale sword-seam crosses your jaw — proof you stood in the front rank.',
    isScarOrCondition: true,
    statModifiers: { honor: 6, health: -4 },
  },
  {
    id: 'limping',
    name: 'Spear-Lame',
    oldNorseTerm: 'haltr',
    description: 'A healed thigh wound slows your stride in winter damp.',
    isScarOrCondition: true,
    statModifiers: { health: -10, strength: -8 },
  },
  {
    id: 'one_eyed',
    name: 'One-Eyed',
    oldNorseTerm: 'einsýnn',
    description: 'Like the High One himself, you gave an eye to steel and gained grim renown.',
    isScarOrCondition: true,
    statModifiers: { faith: 8, honor: 8, health: -8 },
  },
  {
    id: 'frost_bitten',
    name: 'Salt-Frosted',
    oldNorseTerm: 'kalinn',
    description: 'Lost two fingers to an icy gale off the western skerries.',
    isScarOrCondition: true,
    statModifiers: { health: -6 },
    skillModifiers: { seamanship: 5 },
  },
  {
    id: 'shieldmaiden_renown',
    name: 'Birka War-Leader',
    oldNorseTerm: 'skjaldmær',
    description: 'Bore weapons in war — rare and fiercely debated in hall-talk, yet undeniable.',
    isScarOrCondition: true,
    statModifiers: { honor: 10 },
    skillModifiers: { combat: 10 },
  },
  {
    id: 'outlaw_mark',
    name: 'Lesser Outlaw',
    oldNorseTerm: 'fjörbaugsmaðr',
    description: 'Sentenced at the Thing; rivals may hunt you without paying wergild.',
    isScarOrCondition: true,
    statModifiers: { honor: -15, happiness: -10 },
  },
];

export const ALL_TRAITS_MAP: Record<string, TraitDef> = [
  ...SELECTABLE_TRAITS,
  ...SCAR_AND_CONDITION_TRAITS,
].reduce<Record<string, TraitDef>>((acc, t) => {
  acc[t.id] = t;
  return acc;
}, {});

export const SOCIAL_CLASS_CONFIG: Record<
  SocialClass,
  {
    label: string;
    norseTerm: string;
    startingTitle: TitleRank;
    silver: number;
    farms: number;
    warriors: number;
    longships: number;
    knarrs: number;
    description: string;
  }
> = {
  [SocialClass.Thrall]: {
    label: 'Thrall (Unfree Bondservant)',
    norseTerm: 'Þræll / Ambátt',
    startingTitle: TitleRank.Thrall,
    silver: 3,
    farms: 0,
    warriors: 0,
    longships: 0,
    knarrs: 0,
    description: 'Bound to another household with no wergild rights. Must earn or seize freedom first.',
  },
  [SocialClass.Karl]: {
    label: 'Karl (Free Tenant Farmer)',
    norseTerm: 'Karl',
    startingTitle: TitleRank.Freeman,
    silver: 22,
    farms: 1,
    warriors: 2,
    longships: 0,
    knarrs: 0,
    description: 'Freeborn spear-bearer with Thing voice, working modest barley fields and coastal nets.',
  },
  [SocialClass.Bonde]: {
    label: 'Wealthy Bonde (Odal Landholder)',
    norseTerm: 'Óðalsbóndi',
    startingTitle: TitleRank.Bonde,
    silver: 65,
    farms: 2,
    warriors: 8,
    longships: 0,
    knarrs: 1,
    description: 'Ancestral odal farmer with a trading knarr, livestock, and household retainers.',
  },
  [SocialClass.HersirKin]: {
    label: "Hersir's Kin (Local War-Chieftain)",
    norseTerm: 'Hersir',
    startingTitle: TitleRank.Hersir,
    silver: 130,
    farms: 4,
    warriors: 24,
    longships: 1,
    knarrs: 1,
    description: 'Commands a fjord district longship and sworn hirdmen; expected to feast and lead raids.',
  },
  [SocialClass.JarlKin]: {
    label: "Jarl's Kin (Regional Ruler)",
    norseTerm: 'Jarl',
    startingTitle: TitleRank.Jarl,
    silver: 260,
    farms: 7,
    warriors: 55,
    longships: 2,
    knarrs: 1,
    description: 'High-born ruler of shires or islands, surrounded by ambitious cousins and rival claimants.',
  },
  [SocialClass.Royal]: {
    label: 'Royal Scion (Yngling / Skjöldung Blood)',
    norseTerm: 'Konungborinn',
    startingTitle: TitleRank.Jarl,
    silver: 380,
    farms: 9,
    warriors: 80,
    longships: 3,
    knarrs: 2,
    description: 'Descended from ancient kings. Every throne is within claim — and every king sees you as a threat.',
  },
};

export const TITLE_LADDER: TitleRank[] = [
  TitleRank.Thrall,
  TitleRank.Freeman,
  TitleRank.Bonde,
  TitleRank.Hersir,
  TitleRank.Jarl,
  TitleRank.Konungr,
  TitleRank.Overking,
];

export const BUILDINGS_CATALOG: Record<
  BuildingType,
  {
    name: string;
    norseName: string;
    costSilver: number;
    description: string;
    religionReq?: Religion;
    effectsLabel: string;
  }
> = {
  skali_hall: {
    name: 'Timber Long-Hall',
    norseName: 'Skáli',
    costSilver: 90,
    description: 'Oak-pillared feast hall with a long central hearth for hirdmen and guests.',
    effectsLabel: '+6 Stability/yr · +3 Fame/yr · Hird capacity +25',
  },
  boathouse_naust: {
    name: 'Clinker Ship-Shed',
    norseName: 'Naust',
    costSilver: 75,
    description: 'Shelters oak hulls and tarred rigging through winter gales.',
    effectsLabel: 'Reduces ship upkeep · Seamanship +3 on voyages',
  },
  ring_fortress: {
    name: 'Earthen Ring-Fortress',
    norseName: 'Trelleborg',
    costSilver: 220,
    description: 'Circular turf-and-timber rampart quartered on geometric axes in the Danish royal fashion.',
    effectsLabel: '+12 Garrison defense · +8 Stability · Deter rival raids',
  },
  kaupang_market: {
    name: 'Seasonal Emporium',
    norseName: 'Kaupangr',
    costSilver: 140,
    description: 'Staked beach plots where scales weigh Arabic dirhams, Baltic amber, and northern furs.',
    effectsLabel: '+18 Silver/yr · +1 Trade Network',
  },
  pagan_hof: {
    name: 'Sacrificial Temple-Hall',
    norseName: 'Hof',
    costSilver: 110,
    religionReq: Religion.NorsePagan,
    description: 'Carved high-seat pillars of Thor and Freyr where seasonal blót feasts bind the district.',
    effectsLabel: '+5 Pagan Faith/yr · +4 Honor at local Thing',
  },
  stave_church: {
    name: 'Timber Stave Church',
    norseName: 'Stafkirkja',
    costSilver: 120,
    religionReq: Religion.Christian,
    description: 'Tarred pine sanctuary housing Latin clerks, relics, and Christian envoys.',
    effectsLabel: '+5 Christian Faith/yr · +Diplomacy with Frankish & Saxon courts',
  },
};

export const HISTORICAL_ERAS = [
  {
    id: 1 as const,
    name: 'Era I · Early Raids',
    years: '793–865 AD',
    defaultYear: 793,
    summary:
      'Longships strike Lindisfarne and Iona; coastal monasteries hold unguarded silver while Norse longphorts take root in Ireland.',
  },
  {
    id: 2 as const,
    name: 'Era II · Great Heathen Army & Landnám',
    years: '865–954 AD',
    defaultYear: 865,
    summary:
      'Coalition fleets conquer Jorvik and carve out the Danelaw; Harald Fairhair consolidates Norway, driving proud bondi to settle Iceland.',
  },
  {
    id: 3 as const,
    name: 'Era III · Kingdom Building & Conversion',
    years: '954–1015 AD',
    defaultYear: 960,
    summary:
      'Ring fortresses rise in Denmark, Greenland and Vinland open under the Medieval Warm Period, and missionary kings contest the Old Gods.',
  },
  {
    id: 4 as const,
    name: 'Era IV · North Sea Empire & Twilight',
    years: '1016–1066 AD',
    defaultYear: 1016,
    summary:
      'Cnut the Great rules England, Denmark, and Norway; Varangians serve Constantinople until Stamford Bridge closes the age in 1066.',
  },
];

export const PREMADE_CHARACTERS: PremadeCharacter[] = [
  {
    id: 'hakon_fairhair_era',
    name: 'Hakon',
    patronymic: 'Sigurdsson',
    subtitle: "Norwegian Hersir's Son (872 AD)",
    historicalContext:
      'Harald Fairhair demands tax on ancestral odal land around Trondelag. Submit as his jarl, fight against him, or sail west to unsettled Iceland.',
    isSagaInspired: true,
    year: 872,
    age: 19,
    sex: Sex.Male,
    birthplaceId: 'nidaros',
    socialClass: SocialClass.HersirKin,
    religion: Religion.NorsePagan,
    traits: ['brave', 'seafarer', 'oath_keeper'],
    winGoalId: 'king_norway',
    bonusShips: 1,
    bonusWarriors: 12,
  },
  {
    id: 'ivar_great_army',
    name: 'Toke',
    patronymic: 'Hundason',
    subtitle: 'Danish Drengr of the Great Army (865 AD)',
    historicalContext:
      'Drawn to the banners of Ivar and Halfdan crossing from Jutland into Anglo-Saxon England in search of silver and ploughland.',
    year: 865,
    age: 21,
    sex: Sex.Male,
    birthplaceId: 'hedeby',
    socialClass: SocialClass.Bonde,
    religion: Religion.NorsePagan,
    traits: ['strong_limbed', 'greedy', 'brave'],
    winGoalId: 'king_england',
    bonusSilver: 45,
    bonusShips: 1,
    bonusWarriors: 18,
    startingFlags: ['joined_great_army'],
  },
  {
    id: 'aud_iceland_settler',
    name: 'Aud',
    patronymic: 'Ketilsdottir',
    subtitle: "Icelandic Settler's Daughter (876 AD)",
    historicalContext:
      'Inspired by the landnám pioneers of western fjords. Guide a household across the North Atlantic, claim valleys, and speak at the Thing.',
    isSagaInspired: true,
    year: 876,
    age: 20,
    sex: Sex.Female,
    birthplaceId: 'reykjavik',
    socialClass: SocialClass.HersirKin,
    religion: Religion.Syncretic,
    traits: ['law_speaker', 'charismatic', 'seafarer'],
    winGoalId: 'iceland_chieftain',
    bonusSilver: 80,
    bonusShips: 1,
  },
  {
    id: 'thorstein_dublin_merchant',
    name: 'Thorstein',
    patronymic: 'Olafsson',
    subtitle: 'Hiberno-Norse Merchant of Dyflinn (942 AD)',
    historicalContext:
      'Positioned on the Irish Sea crossroads linking Dublin, Chester, Jorvik, and Rouen. Wealth in silver and knarr fleets decides kings.',
    year: 942,
    age: 23,
    sex: Sex.Male,
    birthplaceId: 'dublin',
    socialClass: SocialClass.Bonde,
    religion: Religion.Syncretic,
    traits: ['cunning', 'seafarer', 'greedy'],
    winGoalId: 'king_dublin',
    bonusSilver: 140,
    bonusShips: 1,
  },
  {
    id: 'astrid_thrall_past',
    name: 'Astrid',
    patronymic: 'Ingvarsdottir',
    subtitle: 'Thrall Girl in Hedeby with a Hidden Past (826 AD)',
    historicalContext:
      'Captured as a child when raiders burned a Westfold hall, you carry a silver rune-brooch sewn inside your wool tunic. Win freedom and reclaim your kin-right.',
    isSagaInspired: true,
    year: 826,
    age: 16,
    sex: Sex.Female,
    birthplaceId: 'hedeby',
    socialClass: SocialClass.Thrall,
    religion: Religion.NorsePagan,
    traits: ['cunning', 'blessed_luck', 'skald_tongued'],
    winGoalId: 'freeform_dynasty',
    startingFlags: ['hidden_noble_brooch'],
  },
];

export const WIN_GOALS: WinGoal[] = [
  {
    id: 'freeform_dynasty',
    title: 'Enduring Saga of the North',
    norseSubtitle: 'Orðstírr deyr aldregi',
    description: 'Survive 3+ generations, amass 450+ Fame, and hold at least 8 odal farms across the seas.',
    checkCompleted: (s) => s.generation >= 3 && s.realm.fame >= 450 && s.realm.landFarms >= 8,
    progressLabel: (s) =>
      `Gen ${s.generation}/3 · Fame ${s.realm.fame}/450 · Farms ${s.realm.landFarms}/8`,
  },
  {
    id: 'king_norway',
    title: 'Konungr of Norway',
    norseSubtitle: 'Nóregs Konungr',
    description: 'Attain rank of Konungr, hold Nidaros and Kaupang, and command 120+ Hird warriors.',
    checkCompleted: (s) =>
      TITLE_LADDER.indexOf(s.character.title) >= TITLE_LADDER.indexOf(TitleRank.Konungr) &&
      s.realm.holdings.some((h) => h.settlementId === 'nidaros') &&
      s.realm.holdings.some((h) => h.settlementId === 'kaupang') &&
      s.realm.hirdWarriors >= 120,
    progressLabel: (s) =>
      `Rank: ${s.character.title} · Hird ${s.realm.hirdWarriors}/120`,
  },
  {
    id: 'king_denmark',
    title: 'King of the Danes',
    norseSubtitle: 'Danakonungr',
    description: 'Attain rank of Konungr, hold Jelling, Hedeby, and Roskilde, with 500+ Fame.',
    checkCompleted: (s) =>
      TITLE_LADDER.indexOf(s.character.title) >= TITLE_LADDER.indexOf(TitleRank.Konungr) &&
      ['jelling', 'hedeby', 'roskilde'].every((id) =>
        s.realm.holdings.some((h) => h.settlementId === id)
      ) &&
      s.realm.fame >= 500,
    progressLabel: (s) =>
      `Danish seats held: ${['jelling', 'hedeby', 'roskilde'].filter((id) => s.realm.holdings.some((h) => h.settlementId === id)).length}/3 · Fame ${s.realm.fame}/500`,
  },
  {
    id: 'king_england',
    title: 'Ruler of England (Danelaw & Crown)',
    norseSubtitle: 'Englands Konungr',
    description: 'Attain Konungr or Overking, hold Jorvik and London or Winchester, with 150+ Hird warriors.',
    checkCompleted: (s) =>
      TITLE_LADDER.indexOf(s.character.title) >= TITLE_LADDER.indexOf(TitleRank.Konungr) &&
      s.realm.holdings.some((h) => h.settlementId === 'jorvik') &&
      (s.realm.holdings.some((h) => h.settlementId === 'london') ||
        s.realm.holdings.some((h) => h.settlementId === 'winchester')) &&
      s.realm.hirdWarriors >= 150,
    progressLabel: (s) =>
      `Jorvik: ${s.realm.holdings.some((h) => h.settlementId === 'jorvik') ? 'Held' : 'Unheld'} · Hird ${s.realm.hirdWarriors}/150`,
  },
  {
    id: 'duke_normandy',
    title: 'Count of Rouen & Normandy (Rollo Path)',
    norseSubtitle: 'Rúðujarl',
    description: 'Hold Rouen with at least 6 farms, reach Jarl+, and secure Frankish recognition or Christian diplomacy.',
    checkCompleted: (s) =>
      TITLE_LADDER.indexOf(s.character.title) >= TITLE_LADDER.indexOf(TitleRank.Jarl) &&
      s.realm.holdings.some((h) => h.settlementId === 'rouen' && h.farms >= 4) &&
      s.realm.landFarms >= 6,
    progressLabel: (s) =>
      `Rank: ${s.character.title} · Farms ${s.realm.landFarms}/6 · Rouen ${s.realm.holdings.some((h) => h.settlementId === 'rouen') ? 'Held' : 'Unheld'}`,
  },
  {
    id: 'king_dublin',
    title: 'King of Dyflinn & the Irish Sea',
    norseSubtitle: 'Dyflinnar Konungr',
    description: 'Reach Jarl or Konungr, hold Dublin and Isle of Man or Waterford, and operate 3+ Trade Networks.',
    checkCompleted: (s) =>
      TITLE_LADDER.indexOf(s.character.title) >= TITLE_LADDER.indexOf(TitleRank.Jarl) &&
      s.realm.holdings.some((h) => h.settlementId === 'dublin') &&
      (s.realm.holdings.some((h) => h.settlementId === 'isle_of_man') ||
        s.realm.holdings.some((h) => h.settlementId === 'waterford')) &&
      s.realm.tradeNetworks >= 3,
    progressLabel: (s) =>
      `Dublin: ${s.realm.holdings.some((h) => h.settlementId === 'dublin') ? 'Held' : 'Unheld'} · Trade Links ${s.realm.tradeNetworks}/3`,
  },
  {
    id: 'jarl_orkney',
    title: 'Jarl of Orkney & the Northern Isles',
    norseSubtitle: 'Orkneyinga Jarl',
    description: 'Reach Jarl+, hold Kirkwall and Shetland, and command a fleet of 4+ Longships.',
    checkCompleted: (s) =>
      TITLE_LADDER.indexOf(s.character.title) >= TITLE_LADDER.indexOf(TitleRank.Jarl) &&
      s.realm.holdings.some((h) => h.settlementId === 'kirkwall') &&
      s.realm.holdings.some((h) => h.settlementId === 'shetland') &&
      s.realm.longships >= 4,
    progressLabel: (s) =>
      `Longships ${s.realm.longships}/4 · Isles held: ${['kirkwall', 'shetland'].filter((id) => s.realm.holdings.some((h) => h.settlementId === id)).length}/2`,
  },
  {
    id: 'iceland_chieftain',
    title: 'Goði of the Icelandic Commonwealth',
    norseSubtitle: 'Allsherjargoði',
    description: 'Hold farms at Reykjavik and Thingvellir, reach Law skill 55+, and earn 350+ Fame without bowing to a foreign crown.',
    checkCompleted: (s) =>
      s.realm.holdings.some((h) => h.settlementId === 'reykjavik') &&
      s.realm.holdings.some((h) => h.settlementId === 'thingvellir') &&
      s.character.skills.law >= 55 &&
      s.realm.fame >= 350,
    progressLabel: (s) =>
      `Law Skill ${s.character.skills.law}/55 · Fame ${s.realm.fame}/350`,
  },
  {
    id: 'greenland_founder',
    title: 'Chieftain of the Western Edge (Greenland & Vinland)',
    norseSubtitle: 'Grœnlandsbyggð',
    description: 'Establish holdings at Brattahlid and explore Vinland across the western ocean.',
    checkCompleted: (s) =>
      s.realm.holdings.some((h) => h.settlementId === 'brattahlid') &&
      s.discoveredSettlements.includes('vinland') &&
      s.realm.landFarms >= 5,
    progressLabel: (s) =>
      `Brattahlid: ${s.realm.holdings.some((h) => h.settlementId === 'brattahlid') ? 'Settled' : 'Unsettled'} · Vinland: ${s.discoveredSettlements.includes('vinland') ? 'Sighted' : 'Unknown'}`,
  },
  {
    id: 'north_sea_emperor',
    title: 'High King of the North Sea',
    norseSubtitle: 'Norðrsjávar Yfirkonungr',
    description: 'Hold at least one seat each in Norway, Denmark, and England, command 200+ Hirdmen, and attain Overking rank.',
    checkCompleted: (s) =>
      s.character.title === TitleRank.Overking &&
      s.realm.hirdWarriors >= 200,
    progressLabel: (s) =>
      `Rank: ${s.character.title} · Hird ${s.realm.hirdWarriors}/200 · Fame ${s.realm.fame}/900`,
  },
];
