import { Language, RegionGroup, Religion, Season, Settlement } from '../types/game';

/**
 * MAP PROJECTION & COASTLINE ACCURACY NOTES:
 * - Projection: Equirectangular projection calibrated to 56°N latitude (cos(56°) ≈ 0.559 horizontal compression)
 *   covering longitudes -60°W (Vinland/Labrador) to +22°E (Uppland/Baltic) and latitudes 47.5°N (Loire/Paris)
 *   to 66.5°N (Arctic Circle / Northern Iceland & Helgeland).
 * - SVG Viewport: 1000 x 520 units.
 * - Coastline Polygons: Simplified low-poly vector approximations traced from real lat/lon headland waypoints
 *   so that every settlement's true geographic coordinate sits accurately on its peninsula, fjord, island, or river!
 * - Coordinate Note: In the specification, Wexford was written "52.33N, -6.46E"; historically Wexford (Veisafjörðr)
 *   is in SE Ireland at 52.34°N, 6.46°W (-6.46 longitude), which we use here so it sits accurately on the Irish coast.
 */

export const MAP_BOUNDS = {
  minLon: -60,
  maxLon: 22,
  minLat: 47.5,
  maxLat: 66.8,
  width: 1000,
  height: 520,
};

export function projectLatLon(lat: number, lon: number): { x: number; y: number } {
  const xRatio = (lon - MAP_BOUNDS.minLon) / (MAP_BOUNDS.maxLon - MAP_BOUNDS.minLon);
  const yRatio = 1 - (lat - MAP_BOUNDS.minLat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat);
  return {
    x: Math.round(xRatio * MAP_BOUNDS.width * 10) / 10,
    y: Math.round(yRatio * MAP_BOUNDS.height * 10) / 10,
  };
}

export function pointsToSvgPolygon(coords: [number, number][]): string {
  return coords
    .map(([lat, lon]) => {
      const { x, y } = projectLatLon(lat, lon);
      return `${x},${y}`;
    })
    .join(' ');
}

export function pointsToSvgPath(coords: [number, number][]): string {
  return coords
    .map(([lat, lon], idx) => {
      const { x, y } = projectLatLon(lat, lon);
      return `${idx === 0 ? 'M' : 'L'}${x} ${y}`;
    })
    .join(' ');
}

/**
 * Simplified geographic landmass outlines in [lat, lon] waypoints.
 * Simplified from hydrographic headlands for crisp offline SVG rendering.
 */
export const LANDMASS_POLYGONS: { id: string; name: string; coords: [number, number][] }[] = [
  {
    id: 'scandinavia_peninsula',
    name: 'Scandinavian Peninsula (Norway & Sweden)',
    coords: [
      [55.4, 12.8], [56.1, 15.6], [57.8, 16.7], [59.3, 18.2], [60.6, 17.9],
      [62.4, 17.5], [64.8, 21.2], [65.8, 22.0], [66.7, 20.5], [66.7, 14.0],
      [65.0, 11.8], [63.5, 10.2], [62.2, 5.2], [60.4, 5.0], [58.9, 5.6],
      [58.0, 7.5], [59.1, 10.2], [59.0, 11.2], [57.7, 11.9], [56.3, 12.5],
    ],
  },
  {
    id: 'jutland_denmark',
    name: 'Jutland & Danish Isles',
    coords: [
      [53.9, 8.8], [55.4, 8.4], [57.1, 8.6], [57.7, 10.6], [56.4, 10.9],
      [55.5, 9.8], [54.4, 10.2], [53.9, 9.8],
    ],
  },
  {
    id: 'zealand_funen',
    name: 'Sjælland & Fyn',
    coords: [
      [55.2, 11.0], [56.0, 11.2], [56.0, 12.6], [55.2, 12.4],
    ],
  },
  {
    id: 'continental_europe',
    name: 'Frisia, Frankia & Baltic Coast',
    coords: [
      [47.5, -4.5], [48.5, -4.7], [48.7, -1.6], [49.7, -1.9], [49.4, 0.2],
      [50.9, 1.6], [51.9, 4.1], [53.3, 5.2], [53.7, 7.5], [53.9, 8.9],
      [54.1, 11.0], [54.0, 14.5], [54.5, 18.8], [55.5, 21.2], [56.5, 22.0],
      [47.5, 22.0],
    ],
  },
  {
    id: 'great_britain',
    name: 'Great Britain',
    coords: [
      [50.0, -5.7], [51.2, -4.2], [51.7, -5.2], [52.9, -4.5], [53.4, -3.1],
      [54.8, -3.5], [55.0, -5.1], [56.4, -5.6], [57.5, -6.2], [58.6, -5.0],
      [58.6, -3.1], [57.7, -1.8], [56.0, -2.5], [55.7, -1.8], [54.5, -0.6],
      [53.6, 0.1], [52.9, 1.7], [51.8, 1.4], [51.4, 0.8], [51.2, 1.4],
      [50.7, 0.2], [50.6, -2.4],
    ],
  },
  {
    id: 'ireland',
    name: 'Ireland',
    coords: [
      [51.5, -9.8], [52.1, -10.3], [52.7, -9.7], [53.5, -10.1], [54.3, -9.9],
      [55.3, -7.4], [55.2, -6.1], [54.2, -5.6], [53.3, -6.1], [52.3, -6.4],
      [52.1, -7.1], [51.8, -8.2],
    ],
  },
  {
    id: 'iceland',
    name: 'Iceland (Ísland)',
    coords: [
      [63.4, -19.0], [64.0, -22.7], [64.9, -24.0], [66.4, -22.5], [66.5, -16.0],
      [65.5, -13.6], [64.2, -15.0],
    ],
  },
  {
    id: 'greenland_south',
    name: 'Southern Greenland (Eystribyggð)',
    coords: [
      [66.8, -53.5], [64.1, -51.7], [61.2, -48.2], [59.8, -43.9], [61.5, -42.2],
      [65.6, -37.5], [66.8, -35.0],
    ],
  },
  {
    id: 'vinland_newfoundland',
    name: 'Vinland (Northern Newfoundland & Labrador)',
    coords: [
      [53.5, -60.0], [52.2, -55.7], [51.6, -55.4], [49.5, -53.8], [47.6, -52.7],
      [47.6, -59.3], [50.2, -57.6], [51.4, -57.1], [52.0, -60.0],
    ],
  },
];

export const NAVIGABLE_RIVERS: { name: string; coords: [number, number][] }[] = [
  {
    name: 'Seine',
    coords: [[49.45, 0.15], [49.44, 1.1], [49.1, 1.6], [48.86, 2.35]],
  },
  {
    name: 'Thames',
    coords: [[51.48, 0.85], [51.51, -0.13], [51.6, -1.1]],
  },
  {
    name: 'Humber & Ouse',
    coords: [[53.6, 0.1], [53.7, -0.8], [53.96, -1.08]],
  },
  {
    name: 'Rhine / Lek',
    coords: [[51.9, 4.1], [51.97, 5.34], [51.6, 6.4]],
  },
  {
    name: 'Shannon',
    coords: [[52.55, -9.7], [52.66, -8.63], [53.2, -8.0]],
  },
];

export const SETTLEMENTS: Settlement[] = [
  // SCANDINAVIA
  {
    id: 'hedeby',
    name: 'Hedeby',
    norseName: 'Heiðabýr',
    regionGroup: 'Denmark',
    subRegion: 'Jutland Isthmus',
    lat: 54.49,
    lon: 9.57,
    baseWealth: 9,
    baseDefense: 7,
    historicalSummary:
      'Premier Danish trading emporium linking the North Sea and Baltic across the Danevirke earthworks.',
    controllersByEra: [
      { untilYear: 935, ruler: 'Kings of Southern Jutland', polity: 'Danish Petty Kingdoms', religion: Religion.NorsePagan },
      { untilYear: 986, ruler: 'Gorm & Harald Bluetooth', polity: 'Kingdom of Denmark', religion: Religion.Christian },
      { untilYear: 1035, ruler: 'Sweyn & Cnut the Great', polity: 'North Sea Empire', religion: Religion.Christian },
      { untilYear: 1100, ruler: 'Sweyn Estridsen', polity: 'Kingdom of Denmark', religion: Religion.Christian },
    ],
  },
  {
    id: 'ribe',
    name: 'Ribe',
    norseName: 'Rípar',
    regionGroup: 'Denmark',
    subRegion: 'West Jutland',
    lat: 55.33,
    lon: 8.76,
    baseWealth: 7,
    baseDefense: 5,
    historicalSummary:
      'Oldest Scandinavian market town on the North Sea marsh coast; minting sceattas and hosting Ansgar’s early mission.',
    controllersByEra: [
      { untilYear: 960, ruler: 'Jutish Kings', polity: 'Kingdom of Denmark', religion: Religion.NorsePagan },
      { untilYear: 1100, ruler: 'Royal Bishops & Kings of Denmark', polity: 'Kingdom of Denmark', religion: Religion.Christian },
    ],
  },
  {
    id: 'jelling',
    name: 'Jelling',
    norseName: 'Jelling',
    regionGroup: 'Denmark',
    subRegion: 'Central Jutland',
    lat: 55.76,
    lon: 9.42,
    isThingSite: true,
    baseWealth: 7,
    baseDefense: 7,
    historicalSummary:
      'Dynastic ceremonial seat of Gorm the Old and Harald Bluetooth, famed for great ship-settings, royal mounds, and the Jelling Rune Stones.',
    controllersByEra: [
      { untilYear: 965, ruler: 'Gorm the Old', polity: 'Jelling Dynasty', religion: Religion.NorsePagan },
      { untilYear: 1100, ruler: 'House of Harald Bluetooth & Cnut', polity: 'Kingdom of Denmark', religion: Religion.Christian },
    ],
  },
  {
    id: 'roskilde',
    name: 'Roskilde',
    norseName: 'Hróarskeld',
    regionGroup: 'Denmark',
    subRegion: 'Sjælland',
    lat: 55.64,
    lon: 12.08,
    baseWealth: 8,
    baseDefense: 7,
    historicalSummary:
      'Sheltered fjord capital on Sjælland commanding the Danish straits; five sunken blockships guard its approaches.',
    controllersByEra: [
      { untilYear: 965, ruler: 'Zealand Chieftains', polity: 'Danish Isles', religion: Religion.NorsePagan },
      { untilYear: 1100, ruler: 'Danish Crown', polity: 'Kingdom of Denmark', religion: Religion.Christian },
    ],
  },
  {
    id: 'kaupang',
    name: 'Kaupang',
    norseName: 'Skíringssalr',
    regionGroup: 'Norway',
    subRegion: 'Vestfold',
    lat: 59.05,
    lon: 10.05,
    baseWealth: 7,
    baseDefense: 5,
    historicalSummary:
      'Norway’s bustling Vestfold port described by Ohthere of Hålogaland, trading soapstone, whetstones, walrus ivory, and iron.',
    controllersByEra: [
      { untilYear: 872, ruler: 'Vestfold Petty Kings', polity: 'Vestfold', religion: Religion.NorsePagan },
      { untilYear: 995, ruler: 'Fairhair & Lade Jarls', polity: 'Kingdom of Norway', religion: Religion.NorsePagan },
      { untilYear: 1100, ruler: 'Christian Kings of Norway', polity: 'Kingdom of Norway', religion: Religion.Christian },
    ],
  },
  {
    id: 'nidaros',
    name: 'Nidaros (Trondheim)',
    norseName: 'Niðaróss',
    regionGroup: 'Norway',
    subRegion: 'Trøndelag',
    lat: 63.43,
    lon: 10.40,
    isThingSite: true,
    baseWealth: 7,
    baseDefense: 7,
    historicalSummary:
      'Heartland of the powerful Jarls of Lade and the Frostathing; founded as a royal market town by Olaf Tryggvason c. 997 and later shrine of St. Olaf.',
    controllersByEra: [
      { untilYear: 997, ruler: 'Jarls of Lade (Håkon Sigurdsson)', polity: 'Trøndelag Earldom', religion: Religion.NorsePagan },
      { untilYear: 1100, ruler: 'Kings of Norway', polity: 'Kingdom of Norway', religion: Religion.Christian },
    ],
  },
  {
    id: 'birka',
    name: 'Birka',
    norseName: 'Björkö',
    regionGroup: 'Sweden',
    subRegion: 'Lake Mälaren',
    lat: 59.34,
    lon: 17.54,
    baseWealth: 8,
    baseDefense: 6,
    historicalSummary:
      'Island emporium of the Svear in Lake Mälaren, rich with Abbasid silver dirhams and eastern Rus fur trade until Sigtuna superseded it c. 975.',
    controllersByEra: [
      { untilYear: 1008, ruler: 'Svear Kings of Mälaren', polity: 'Svealand', religion: Religion.NorsePagan },
      { untilYear: 1100, ruler: 'Olof Skötkonung’s Line', polity: 'Kingdom of Sweden', religion: Religion.Christian },
    ],
  },
  {
    id: 'uppsala',
    name: 'Gamla Uppsala',
    norseName: 'Uppsalir',
    regionGroup: 'Sweden',
    subRegion: 'Uppland',
    lat: 59.86,
    lon: 17.64,
    isThingSite: true,
    baseWealth: 7,
    baseDefense: 6,
    historicalSummary:
      'Sacred royal mounds and great pagan cult center of the Svear, celebrated every nine years with grand blót assemblies.',
    controllersByEra: [
      { untilYear: 1080, ruler: 'High Kings & Lawspeakers of Uppland', polity: 'Svealand', religion: Religion.NorsePagan },
    ],
  },

  // BRITISH ISLES
  {
    id: 'lindisfarne',
    name: 'Lindisfarne',
    norseName: 'Lindisfarna',
    regionGroup: 'British Isles',
    subRegion: 'Northumbria',
    lat: 55.67,
    lon: -1.80,
    isMonastery: true,
    baseWealth: 7,
    baseDefense: 2,
    historicalSummary:
      'Tidal Holy Island monastery of St. Cuthbert in Northumbria. Its shock plundering on 8 June 793 opened the Viking Age in Christian chronicles.',
    controllersByEra: [
      { untilYear: 867, ruler: 'Kings & Bishops of Northumbria', polity: 'Kingdom of Northumbria', religion: Religion.Christian },
      { untilYear: 954, ruler: 'Norse-Northumbrian Lords', polity: 'Danelaw Northumbria', religion: Religion.Syncretic },
      { untilYear: 1100, ruler: 'Earls of Bamburgh', polity: 'Kingdom of England', religion: Religion.Christian },
    ],
  },
  {
    id: 'jorvik',
    name: 'Jorvik (York)',
    norseName: 'Jórvík',
    regionGroup: 'British Isles',
    subRegion: 'Yorkshire / Danelaw',
    lat: 53.96,
    lon: -1.08,
    isRiverPort: true,
    riverName: 'Ouse / Humber',
    baseWealth: 9,
    baseDefense: 8,
    historicalSummary:
      'Seized by the Great Heathen Army in 866; transformed from Anglo-Saxon Eoforwic into a thriving Norse royal mint, craft hub, and capital of northern Danelaw.',
    controllersByEra: [
      { untilYear: 866, ruler: 'Ælla & Osberht', polity: 'Kingdom of Northumbria', religion: Religion.Christian },
      { untilYear: 954, ruler: 'Norse Kings of Jórvík (Halfdan to Eric Bloodaxe)', polity: 'Kingdom of Jórvík (Danelaw)', religion: Religion.Syncretic },
      { untilYear: 1013, ruler: 'Anglo-Dane Earls under English Crown', polity: 'Kingdom of England', religion: Religion.Christian },
      { untilYear: 1042, ruler: 'Cnut & Sons', polity: 'North Sea Empire', religion: Religion.Christian },
      { untilYear: 1100, ruler: 'Earls Siward, Tostig & Morcar', polity: 'Kingdom of England', religion: Religion.Christian },
    ],
  },
  {
    id: 'repton',
    name: 'Repton',
    norseName: 'Hreppatún',
    regionGroup: 'British Isles',
    subRegion: 'Mercia / Five Boroughs',
    lat: 52.84,
    lon: -1.55,
    baseWealth: 6,
    baseDefense: 6,
    historicalSummary:
      'Mercian royal burial abbey on the Trent where the Great Heathen Army built a D-shaped winter camp in 873–874, confirmed by mass warrior burials.',
    controllersByEra: [
      { untilYear: 874, ruler: 'King Burgred of Mercia', polity: 'Kingdom of Mercia', religion: Religion.Christian },
      { untilYear: 920, ruler: 'Danish Jarls of the Five Boroughs', polity: 'The Danelaw', religion: Religion.NorsePagan },
      { untilYear: 1100, ruler: 'Ealdormen of Mercia', polity: 'Kingdom of England', religion: Religion.Christian },
    ],
  },
  {
    id: 'london',
    name: 'London (Lundenwic)',
    norseName: 'Lundúnaborg',
    regionGroup: 'British Isles',
    subRegion: 'Thames Valley',
    lat: 51.51,
    lon: -0.13,
    isRiverPort: true,
    riverName: 'Thames',
    baseWealth: 10,
    baseDefense: 9,
    historicalSummary:
      'Walled Roman burh refortified by Alfred the Great in 886; repeatedly besieged by Sweyn Forkbeard, Thorkell the Tall, Olaf Haraldsson, and Cnut.',
    controllersByEra: [
      { untilYear: 886, ruler: 'Mercian & Danish Garrison', polity: 'Contested Thames', religion: Religion.Christian },
      { untilYear: 1016, ruler: 'House of Wessex (Alfred to Æthelred)', polity: 'Kingdom of England', religion: Religion.Christian },
      { untilYear: 1042, ruler: 'Cnut the Great', polity: 'North Sea Empire', religion: Religion.Christian },
      { untilYear: 1100, ruler: 'Edward the Confessor & Harold Godwinson', polity: 'Kingdom of England', religion: Religion.Christian },
    ],
  },
  {
    id: 'winchester',
    name: 'Winchester',
    norseName: 'Víncestr',
    regionGroup: 'British Isles',
    subRegion: 'Wessex',
    lat: 51.06,
    lon: -1.31,
    baseWealth: 9,
    baseDefense: 9,
    historicalSummary:
      'Fortified burh, royal treasury, and scriptorium capital of Wessex — seat of Alfred the Great and later Cnut the Great.',
    controllersByEra: [
      { untilYear: 1016, ruler: 'House of Wessex', polity: 'Kingdom of Wessex / England', religion: Religion.Christian },
      { untilYear: 1042, ruler: 'Cnut & Harthacnut', polity: 'North Sea Empire', religion: Religion.Christian },
      { untilYear: 1100, ruler: 'House of Wessex & Godwin', polity: 'Kingdom of England', religion: Religion.Christian },
    ],
  },
  {
    id: 'maldon',
    name: 'Maldon',
    norseName: 'Mældún',
    regionGroup: 'British Isles',
    subRegion: 'Essex',
    lat: 51.73,
    lon: 0.68,
    baseWealth: 6,
    baseDefense: 5,
    historicalSummary:
      'Blackwater estuary burh in Essex where Ealdorman Byrhtnoth fell against a Viking fleet in August 991, immortalized in Old English heroic verse.',
    controllersByEra: [
      { untilYear: 878, ruler: 'East Saxon Ealdormen', polity: 'Kingdom of Wessex', religion: Religion.Christian },
      { untilYear: 917, ruler: 'Guthrum’s Danish Settlers', polity: 'Southern Danelaw', religion: Religion.Syncretic },
      { untilYear: 1100, ruler: 'Ealdormen of Essex', polity: 'Kingdom of England', religion: Religion.Christian },
    ],
  },
  {
    id: 'kirkwall',
    name: 'Kirkwall (Orkney)',
    norseName: 'Kirkjuvágr',
    regionGroup: 'British Isles',
    subRegion: 'Northern Isles',
    lat: 58.98,
    lon: -2.96,
    baseWealth: 6,
    baseDefense: 6,
    historicalSummary:
      'Strategic anchorage of the Jarls of Orkney controlling sea lanes between Norway, Caithness, the Hebrides, and Dublin.',
    controllersByEra: [
      { untilYear: 875, ruler: 'Pictish Mormaers & Early Raiders', polity: 'Pictish Isles', religion: Religion.Christian },
      { untilYear: 995, ruler: 'Norse Jarls of Orkney (Turf-Einar to Sigurd the Stout)', polity: 'Earldom of Orkney', religion: Religion.NorsePagan },
      { untilYear: 1100, ruler: 'Thorfinn the Mighty', polity: 'Earldom of Orkney', religion: Religion.Christian },
    ],
  },
  {
    id: 'shetland',
    name: 'Shetland',
    norseName: 'Hjaltland',
    regionGroup: 'British Isles',
    subRegion: 'Northern Isles',
    lat: 60.15,
    lon: -1.15,
    isThingSite: true,
    baseWealth: 5,
    baseDefense: 5,
    historicalSummary:
      'First landfall a day-and-a-half west of Bergen; soapstone quarries, Jarlshof longhouses, and the Law Ting Holm.',
    controllersByEra: [
      { untilYear: 850, ruler: 'Pictish Coastal Communities', polity: 'Pictland', religion: Religion.Christian },
      { untilYear: 1100, ruler: 'Jarls of Orkney & Hjaltland', polity: 'Earldom of Orkney', religion: Religion.NorsePagan },
    ],
  },
  {
    id: 'iona',
    name: 'Iona',
    norseName: 'Íkolmkill',
    regionGroup: 'British Isles',
    subRegion: 'Hebrides (Suðreyjar)',
    lat: 56.33,
    lon: -6.39,
    isMonastery: true,
    baseWealth: 7,
    baseDefense: 3,
    historicalSummary:
      'Venerable Columban abbey of the Inner Hebrides; raided in 795, 802, and 806 before becoming a revered burial isle of Norse-Gael kings.',
    controllersByEra: [
      { untilYear: 840, ruler: 'Columban Abbots & Dál Riata', polity: 'Dál Riata', religion: Religion.Christian },
      { untilYear: 1100, ruler: 'Gall-Ghàidheil Lords of the Isles', polity: 'Kingdom of the Isles', religion: Religion.Syncretic },
    ],
  },
  {
    id: 'isle_of_man',
    name: 'Isle of Man',
    norseName: 'Mön',
    regionGroup: 'British Isles',
    subRegion: 'Irish Sea',
    lat: 54.15,
    lon: -4.48,
    isThingSite: true,
    baseWealth: 7,
    baseDefense: 6,
    historicalSummary:
      'Hub of the Irish Sea boasting pagan boat-burials, carved Norse-Celtic stone crosses, silver hoards, and the Tynwald (Þingvöllr) assembly.',
    controllersByEra: [
      { untilYear: 850, ruler: 'Brittonic & Gaelic Rulers', polity: 'Mann', religion: Religion.Christian },
      { untilYear: 1100, ruler: 'Hiberno-Norse Kings of Mann & the Isles', polity: 'Kingdom of Mann', religion: Religion.Syncretic },
    ],
  },

  // IRELAND
  {
    id: 'dublin',
    name: 'Dublin',
    norseName: 'Dyflinn',
    regionGroup: 'Ireland',
    subRegion: 'Leinster Coast',
    lat: 53.35,
    lon: -6.26,
    baseWealth: 9,
    baseDefense: 7,
    historicalSummary:
      'Founded as a fortified winter ship-camp (longphort) in 841; grew into Western Europe’s wealthiest Hiberno-Norse maritime kingdom under the Uí Ímair.',
    controllersByEra: [
      { untilYear: 841, ruler: 'Gaelic Monasteries of Áth Cliath', polity: 'Leinster', religion: Religion.Christian },
      { untilYear: 980, ruler: 'Uí Ímair Dynasty (Olaf & Ivar)', polity: 'Kingdom of Dyflinn', religion: Religion.Syncretic },
      { untilYear: 1100, ruler: 'Sigtrygg Silkbeard & Hiberno-Norse Kings', polity: 'Kingdom of Dyflinn', religion: Religion.Christian },
    ],
  },
  {
    id: 'waterford',
    name: 'Waterford',
    norseName: 'Veðrafjörðr',
    regionGroup: 'Ireland',
    subRegion: 'Munster',
    lat: 52.26,
    lon: -7.11,
    baseWealth: 7,
    baseDefense: 6,
    historicalSummary:
      'Walled Norse harbor ("Ram-Fjord") re-established in 914 by Ragnall ua Ímair at the confluence of the Suir, Nore, and Barrow.',
    controllersByEra: [
      { untilYear: 914, ruler: 'Déisi Mumhan', polity: 'Munster', religion: Religion.Christian },
      { untilYear: 1100, ruler: 'Hiberno-Norse Lords of Veðrafjörðr', polity: 'Norse Waterford', religion: Religion.Syncretic },
    ],
  },
  {
    id: 'wexford',
    name: 'Wexford',
    norseName: 'Veisafjörðr',
    regionGroup: 'Ireland',
    subRegion: 'SE Leinster',
    lat: 52.33,
    lon: -6.46,
    baseWealth: 6,
    baseDefense: 5,
    historicalSummary:
      'Tidal mudflat harbor ("Inlet of the Mudflats") commanding the St. George’s Channel crossing to Wales and Bristol.',
    controllersByEra: [
      { untilYear: 890, ruler: 'Uí Cheinnselaig Kings', polity: 'Leinster', religion: Religion.Christian },
      { untilYear: 1100, ruler: 'Ostmen of Veisafjörðr', polity: 'Norse Wexford', religion: Religion.Syncretic },
    ],
  },
  {
    id: 'limerick',
    name: 'Limerick',
    norseName: 'Hlymrek',
    regionGroup: 'Ireland',
    subRegion: 'Shannon Estuary',
    lat: 52.66,
    lon: -8.63,
    isRiverPort: true,
    riverName: 'Shannon',
    baseWealth: 7,
    baseDefense: 6,
    historicalSummary:
      'Island stronghold on the River Shannon enabling Norse fleets to raid deep into the lakes of central Ireland until Brian Boru subdued it in 967.',
    controllersByEra: [
      { untilYear: 922, ruler: 'Thomond Kings', polity: 'Munster', religion: Religion.Christian },
      { untilYear: 967, ruler: 'Thorgils & Ivar of Limerick', polity: 'Norse Limerick', religion: Religion.NorsePagan },
      { untilYear: 1100, ruler: 'Dál gCais (Brian Boru’s Line)', polity: 'Kingdom of Munster', religion: Religion.Christian },
    ],
  },
  {
    id: 'tara',
    name: 'Tara',
    norseName: 'Temair',
    regionGroup: 'Ireland',
    subRegion: 'Meath (Brega)',
    lat: 53.58,
    lon: -6.61,
    isThingSite: true,
    baseWealth: 7,
    baseDefense: 7,
    historicalSummary:
      'Ancient ceremonial hill of the High Kings of Ireland; near here Mael Sechnaill II broke Dublin’s power at the Battle of Tara in 980.',
    controllersByEra: [
      { untilYear: 1100, ruler: 'Southern Uí Néill & High Kings', polity: 'High Kingship of Ireland', religion: Religion.Christian },
    ],
  },

  // CONTINENT
  {
    id: 'dorestad',
    name: 'Dorestad',
    norseName: 'Dóristaðr',
    regionGroup: 'Continent',
    subRegion: 'Frisia',
    lat: 51.97,
    lon: 5.34,
    isRiverPort: true,
    riverName: 'Rhine / Lek',
    baseWealth: 9,
    baseDefense: 5,
    historicalSummary:
      'Great Carolingian river port trading Rhenish wine, glass, and Ulfberht-type sword blades; sacked repeatedly in the 830s and granted in fief to Danish warlord Rorik.',
    controllersByEra: [
      { untilYear: 850, ruler: 'Carolingian Counts', polity: 'Frankish Empire', religion: Religion.Christian },
      { untilYear: 885, ruler: 'Danish Fief-Holders (Rorik & Godfrid)', polity: 'Norse Frisia', religion: Religion.Syncretic },
      { untilYear: 1100, ruler: 'Bishops of Utrecht & Counts of Holland', polity: 'East Francia / Empire', religion: Religion.Christian },
    ],
  },
  {
    id: 'rouen',
    name: 'Rouen (Normandy)',
    norseName: 'Rúðuborg',
    regionGroup: 'Continent',
    subRegion: 'Seine Valley',
    lat: 49.44,
    lon: 1.10,
    isRiverPort: true,
    riverName: 'Seine',
    baseWealth: 9,
    baseDefense: 8,
    historicalSummary:
      'Lower Seine metropolis ceded to the Viking leader Rollo (Göngu-Hrólfr) by Charles the Simple in 911, forging the Duchy of Normandy.',
    controllersByEra: [
      { untilYear: 911, ruler: 'West Frankish Archbishops & Counts', polity: 'West Francia', religion: Religion.Christian },
      { untilYear: 1100, ruler: 'House of Rollo (Counts/Dukes of Normandy)', polity: 'Duchy of Normandy', religion: Religion.Christian },
    ],
  },
  {
    id: 'paris',
    name: 'Paris',
    norseName: 'Parísaborg',
    regionGroup: 'Continent',
    subRegion: 'Île-de-France',
    lat: 48.86,
    lon: 2.35,
    isRiverPort: true,
    riverName: 'Seine',
    baseWealth: 10,
    baseDefense: 10,
    historicalSummary:
      'Fortified island city on the Seine; paid 7,000 pounds of silver Danegeld to Ragnar’s fleet in 845 and endured Sigfred’s epic year-long siege in 885–886.',
    controllersByEra: [
      { untilYear: 987, ruler: 'Carolingian & Robertian Counts (Odo)', polity: 'West Francia', religion: Religion.Christian },
      { untilYear: 1100, ruler: 'Capetian Kings of France', polity: 'Kingdom of France', religion: Religion.Christian },
    ],
  },

  // NORTH ATLANTIC
  {
    id: 'faroes',
    name: 'Tórshavn (Faroe Islands)',
    norseName: 'Færeyjar',
    regionGroup: 'North Atlantic',
    subRegion: 'Faroe Archipelago',
    lat: 62.01,
    lon: -6.77,
    isThingSite: true,
    baseWealth: 4,
    baseDefense: 4,
    historicalSummary:
      'Steep basalt sheep-islands ("Sheep Isles") settled by Norse voyagers c. 825, displacing Irish anchorite monks; home to the Tinganes headland.',
    controllersByEra: [
      { untilYear: 825, ruler: 'Hiberno-Scottish Hermits (Papar)', polity: 'Unclaimed Atlantic', religion: Religion.Christian },
      { untilYear: 1035, ruler: 'Faroese Chieftains (Tróndur í Gøtu)', polity: 'Faroese Thing', religion: Religion.NorsePagan },
      { untilYear: 1100, ruler: 'Tributary of Norway', polity: 'Kingdom of Norway', religion: Religion.Christian },
    ],
  },
  {
    id: 'reykjavik',
    name: 'Reykjavik',
    norseName: 'Reykjarvík',
    regionGroup: 'North Atlantic',
    subRegion: 'SW Iceland',
    lat: 64.15,
    lon: -21.94,
    foundedYear: 874,
    baseWealth: 5,
    baseDefense: 4,
    historicalSummary:
      'Steaming bay where Ingólfr Arnarson cast his high-seat pillars overboard c. 874, inaugurating Iceland’s Age of Settlement (Landnámsöld).',
    controllersByEra: [
      { untilYear: 873, ruler: 'Uninhabited (Occasional Irish Papar)', polity: 'Sub-Arctic Wilderness', religion: Religion.NorsePagan },
      { untilYear: 1000, ruler: 'Goðar (Chieftain-Priests)', polity: 'Icelandic Commonwealth', religion: Religion.NorsePagan },
      { untilYear: 1100, ruler: 'Christian Goðar', polity: 'Icelandic Commonwealth', religion: Religion.Christian },
    ],
  },
  {
    id: 'thingvellir',
    name: 'Thingvellir',
    norseName: 'Þingvellir',
    regionGroup: 'North Atlantic',
    subRegion: 'Icelandic Rift Valley',
    lat: 64.26,
    lon: -21.13,
    foundedYear: 930,
    isThingSite: true,
    baseWealth: 5,
    baseDefense: 4,
    historicalSummary:
      'Volcanic rift plain of Lögberg (Law Rock) where the Althing convened annually from 930 AD without a king, peacefuly adopting Christianity in 999/1000.',
    controllersByEra: [
      { untilYear: 929, ruler: 'Local Kjalarnes Thing', polity: 'Early Settlement', religion: Religion.NorsePagan },
      { untilYear: 1000, ruler: 'Althing & Lawspeaker (Lögsögumaðr)', polity: 'Icelandic Commonwealth', religion: Religion.NorsePagan },
      { untilYear: 1100, ruler: 'Christian Althing', polity: 'Icelandic Commonwealth', religion: Religion.Christian },
    ],
  },
  {
    id: 'brattahlid',
    name: 'Brattahlid (Greenland)',
    norseName: 'Brattahlíð',
    regionGroup: 'North Atlantic',
    subRegion: 'Eystribyggð (Eastern Settlement)',
    lat: 61.15,
    lon: -45.43,
    foundedYear: 985,
    baseWealth: 5,
    baseDefense: 3,
    historicalSummary:
      'Sheltered inner-fjord farm founded c. 985 by outlawed Erik the Red during the Medieval Warm Period; famed for prized walrus ivory and Thjodhild’s small church.',
    controllersByEra: [
      { untilYear: 984, ruler: 'Unsettled Inner Fjords', polity: 'Greenlandic Coast', religion: Religion.NorsePagan },
      { untilYear: 1002, ruler: 'Erik the Red', polity: 'Eastern Settlement', religion: Religion.NorsePagan },
      { untilYear: 1100, ruler: 'Leif Erikson’s Kin & Greenlanders', polity: 'Greenland Commonwealth', religion: Religion.Christian },
    ],
  },
  {
    id: 'vinland',
    name: "Vinland (L'Anse aux Meadows)",
    norseName: 'Vínland / Straumfjörðr',
    regionGroup: 'North Atlantic',
    subRegion: 'Newfoundland',
    lat: 51.60,
    lon: -55.50,
    foundedYear: 1000,
    baseWealth: 5,
    baseDefense: 4,
    historicalSummary:
      'Turf-walled Norse ship-repair and timber camp at the tip of Newfoundland c. 1000 AD — confirmed archaeologically by iron-smelting slag and ringed bronze pins, where Norse crews met Indigenous Skrælingjar.',
    controllersByEra: [
      { untilYear: 1100, ruler: 'Indigenous Peoples (Ancestral Beothuk / Dorset) & Seasonal Norse Voyagers', polity: 'Vínland Outpost', religion: Religion.NorsePagan },
    ],
  },
];

export const SETTLEMENTS_BY_ID: Record<string, Settlement> = SETTLEMENTS.reduce<Record<string, Settlement>>(
  (acc, s) => {
    acc[s.id] = s;
    return acc;
  },
  {}
);

export function getControllerInYear(settlement: Settlement, year: number) {
  for (const entry of settlement.controllersByEra) {
    if (year <= entry.untilYear) return entry;
  }
  return settlement.controllersByEra[settlement.controllersByEra.length - 1];
}

/**
 * Great-circle Haversine distance in nautical miles, plus realistic Viking Age voyage duration & hazard.
 * Longships & knarrs averaged ~5–6 knots (~110–130 NM per 24h) under good open-sea winds, slower along rivers/coasts.
 */
export interface SeasonalWeatherProfile {
  season: Season;
  weatherName: string;
  seaEffectShort: string;
  description: string;
  riskPenaltyPct: number;
  speedPct: number;
}

export function getSeasonalWeatherProfile(
  season: Season,
  lang: Language = 'en'
): SeasonalWeatherProfile {
  const isFa = lang === 'fa';
  switch (season) {
    case Season.Spring:
      return {
        season,
        weatherName: isFa ? 'مه بهاری و آب‌شدن یخ‌ها' : 'Thaw Mist & Drift Ice',
        seaEffectShort: isFa ? '+6% خطر طوفان · سرعت 85%' : '+6% Sea Risk · 85% Speed',
        description: isFa
          ? 'مه غلیظ ساحلی دید ناخدا را کم می‌کند و تکه‌های یخ شناور در آب‌های شمالی دیده می‌شود.'
          : 'Shifting coastal fog dims headland landmarks and early meltwater swells slow oar-crews.',
        riskPenaltyPct: 6,
        speedPct: 85,
      };
    case Season.Summer:
      return {
        season,
        weatherName: isFa ? 'بادهای موافق تابستانی' : 'Fair Summer Winds',
        seaEffectShort: isFa ? '+0% خطر پایه · سرعت کامل 100%' : '+0% Base Risk · 100% Speed',
        description: isFa
          ? 'شب‌های روشن شمال و دریای آرام، بهترین و ایمن‌ترین فصل دریانوردی وایکینگ‌ها را رقم می‌زند.'
          : 'Long bright northern nights and steady following winds offer the safest Viking sailing window.',
        riskPenaltyPct: 0,
        speedPct: 100,
      };
    case Season.Autumn:
      return {
        season,
        weatherName: isFa ? 'باران و تندباد پاییزی' : 'Autumn Rain & Heavy Swells',
        seaEffectShort: isFa ? '+14% خطر طوفان · سرعت 78%' : '+14% Gale Risk · 78% Speed',
        description: isFa
          ? 'باران‌های تند و طوفان‌های دریای شمال به طناب‌ها و بادبان فشار می‌آورد؛ کشتی کِنار پایدارتر است.'
          : 'Driving rain squalls and equinoctial gales batter low-freeboard hulls across the North Sea.',
        riskPenaltyPct: 14,
        speedPct: 78,
      };
    case Season.Winter:
      return {
        season,
        weatherName: isFa ? 'کولاک برف و یخبندان زمستانی' : 'Winter Blizzard & Pack-Ice',
        seaEffectShort: isFa ? '+32% خطر غرق‌شدن · سرعت 62%' : '+32% Gale & Ice Risk · 62% Speed',
        description: isFa
          ? 'امواج یخ‌زده و برف سنگین دریانوردی زمستان را مرگبار می‌کند؛ وایکینگ‌ها معمولاً کشتی‌ها را به خشکی می‌کشند.'
          : 'Freezing spray, blinding snow, and pack-ice make winter crossings perilous for open hulls.',
        riskPenaltyPct: 32,
        speedPct: 62,
      };
  }
}

export function calculateVoyageMetrics(
  from: Settlement,
  to: Settlement,
  season: Season,
  year: number,
  seamanship: number,
  hasKnarr: boolean
): {
  nauticalMiles: number;
  sailingDays: number;
  dangerPct: number;
  seasonRiskDelta: number;
  hullSavedPct: number;
  dangerLevel: 'low' | 'moderate' | 'high' | 'extreme';
  dangerLabel: 'Low' | 'Moderate' | 'High' | 'Extreme (Winter Gale)';
  medievalWarmNote?: string;
} {
  if (from.id === to.id) {
    return {
      nauticalMiles: 0,
      sailingDays: 0,
      dangerPct: 0,
      seasonRiskDelta: 0,
      hullSavedPct: 0,
      dangerLevel: 'low',
      dangerLabel: 'Low',
    };
  }

  const R_NM = 3440.065; // Earth radius in nautical miles
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(to.lat - from.lat);
  const dLon = toRad(to.lon - from.lon);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Multiply by 1.22 coastal routing factor around headlands/straits
  const nauticalMiles = Math.max(18, Math.round(R_NM * c * 1.22));

  // Speed in NM/day: ~112 NM/day in summer, slower in spring/autumn, hazardous in winter
  const seasonSpeedFactor =
    season === Season.Summer
      ? 1.0
      : season === Season.Spring
        ? 0.85
        : season === Season.Autumn
          ? 0.78
          : 0.62;
  const dailyNm = 112 * seasonSpeedFactor * (1 + seamanship * 0.0025);
  const sailingDays = Math.max(1, Math.ceil(nauticalMiles / dailyNm));

  const involvesAtlantic =
    from.regionGroup === 'North Atlantic' || to.regionGroup === 'North Atlantic';

  let baseRisk = Math.min(35, nauticalMiles / 55);
  let hullSavedPct = 0;

  if (involvesAtlantic) {
    baseRisk += hasKnarr ? 8 : 16;
    if (hasKnarr) hullSavedPct += 8;
  }

  // Deep-beamed Knarr hulls weather Autumn gales and Winter swells better than low war longships
  if ((season === Season.Autumn || season === Season.Winter) && hasKnarr) {
    const roughWeatherHullSave = season === Season.Winter ? 7 : 4;
    baseRisk -= roughWeatherHullSave;
    hullSavedPct += roughWeatherHullSave;
  }

  // Medieval Warm Period (~950–1066 AD) eased drift ice along Greenland & Iceland sea lanes
  let medievalWarmNote: string | undefined;
  if (involvesAtlantic && year >= 950) {
    baseRisk -= 5;
    medievalWarmNote = 'Medieval Warm Period reduces pack-ice drift along high-latitude sea lanes.';
  } else if (involvesAtlantic && year < 870) {
    baseRisk += 6;
    medievalWarmNote = 'Uncharted western waters with heavy drift-ice before regular landnám pilot lore.';
  }

  const seasonRiskDelta =
    season === Season.Winter
      ? involvesAtlantic
        ? 38
        : 32
      : season === Season.Autumn
        ? 14
        : season === Season.Spring
          ? 6
          : 0;

  baseRisk += seasonRiskDelta;
  baseRisk -= seamanship * 0.22;
  const dangerPct = Math.max(2, Math.min(85, Math.round(baseRisk)));

  const dangerLevel: 'low' | 'moderate' | 'high' | 'extreme' =
    season === Season.Winter && dangerPct >= 30
      ? 'extreme'
      : dangerPct >= 35
        ? 'high'
        : dangerPct >= 18
          ? 'moderate'
          : 'low';

  const dangerLabel =
    dangerLevel === 'extreme'
      ? 'Extreme (Winter Gale)'
      : dangerLevel === 'high'
        ? 'High'
        : dangerLevel === 'moderate'
          ? 'Moderate'
          : 'Low';

  return {
    nauticalMiles,
    sailingDays,
    dangerPct,
    seasonRiskDelta,
    hullSavedPct,
    dangerLevel,
    dangerLabel,
    medievalWarmNote,
  };
}

/**
 * Dynamic historical realm overlays by year for the interactive Map tab.
 */
export interface HistoricalBorderZone {
  id: string;
  label: string;
  sublabel: string;
  stroke: string;
  fill: string;
  coords: [number, number][];
}

export function getHistoricalBordersForYear(year: number): HistoricalBorderZone[] {
  const zones: HistoricalBorderZone[] = [];

  if (year >= 866 && year <= 954) {
    zones.push({
      id: 'danelaw',
      label: 'The Danelaw',
      sublabel: year >= 878 ? 'Treaty of Alfred & Guthrum Boundary' : 'Great Heathen Army Conquests',
      stroke: '#FF8C1A',
      fill: 'rgba(255, 106, 0, 0.11)',
      coords: [
        [54.9, -1.5], [53.9, -2.5], [52.8, -1.8], [51.6, -0.2],
        [51.7, 1.3], [52.9, 1.7], [54.5, -0.6],
      ],
    });
  }

  if (year >= 872 && year < 1016) {
    zones.push({
      id: 'norway_kingdom',
      label: 'Kingdom of Norway',
      sublabel: year < 930 ? 'Harald Fairhair’s Unification' : 'Coastal Realm & Lade Earldom',
      stroke: '#C24E00',
      fill: 'rgba(194, 78, 0, 0.10)',
      coords: [
        [58.0, 6.8], [59.1, 10.6], [63.8, 11.2], [65.5, 12.2],
        [63.2, 5.2], [60.2, 4.8],
      ],
    });
  }

  if (year >= 911) {
    zones.push({
      id: 'normandy',
      label: 'Duchy of Normandy',
      sublabel: year < 940 ? 'Rollo’s Grant (Saint-Clair-sur-Epte, 911)' : 'Norman Realm',
      stroke: '#EDE6DC',
      fill: 'rgba(237, 230, 220, 0.09)',
      coords: [
        [49.7, -1.9], [49.9, 1.4], [49.0, 1.6], [48.6, -1.6],
      ],
    });
  }

  if (year >= 1016 && year <= 1035) {
    zones.push({
      id: 'north_sea_empire',
      label: 'North Sea Empire of Cnut',
      sublabel: 'England, Denmark & Norway (1016–1035)',
      stroke: '#FF6A00',
      fill: 'rgba(255, 106, 0, 0.13)',
      coords: [
        [50.6, -2.6], [54.8, -3.2], [58.5, 6.2], [63.6, 10.6],
        [56.2, 12.6], [54.2, 9.8], [51.3, 1.4],
      ],
    });
  }

  return zones;
}

export const SEA_ROUTES: [string, string][] = [
  ['hedeby', 'dorestad'],
  ['ribe', 'jorvik'],
  ['ribe', 'london'],
  ['kaupang', 'jelling'],
  ['roskilde', 'birka'],
  ['nidaros', 'shetland'],
  ['shetland', 'kirkwall'],
  ['shetland', 'faroes'],
  ['faroes', 'reykjavik'],
  ['reykjavik', 'brattahlid'],
  ['brattahlid', 'vinland'],
  ['kirkwall', 'iona'],
  ['iona', 'isle_of_man'],
  ['isle_of_man', 'dublin'],
  ['dublin', 'waterford'],
  ['waterford', 'rouen'],
  ['london', 'rouen'],
];
