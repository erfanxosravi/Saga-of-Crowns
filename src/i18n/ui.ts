import {
  EventCategory,
  Language,
  RegionGroup,
  RelationRole,
  Religion,
  Season,
  SkillKey,
  SocialClass,
  StatKey,
  TitleRank,
} from '../types/game';

export function isRtl(lang: Language): boolean {
  return lang === 'fa';
}

export function formatYearLabel(year: number, lang: Language): string {
  return lang === 'fa' ? `سال ${year} میلادی` : `${year} AD`;
}

export function formatAgeLabel(age: number, lang: Language): string {
  return lang === 'fa' ? `سن ${age}` : `Age ${age}`;
}

export const SEASON_LABELS: Record<Language, Record<Season, string>> = {
  en: {
    [Season.Spring]: 'Spring',
    [Season.Summer]: 'Summer',
    [Season.Autumn]: 'Autumn',
    [Season.Winter]: 'Winter',
  },
  fa: {
    [Season.Spring]: 'بهار',
    [Season.Summer]: 'تابستان',
    [Season.Autumn]: 'پاییز',
    [Season.Winter]: 'زمستان',
  },
};

export const TITLE_LABELS: Record<Language, Record<TitleRank, string>> = {
  en: {
    [TitleRank.Thrall]: 'Thrall (Bondservant)',
    [TitleRank.Freeman]: 'Freeman',
    [TitleRank.Bonde]: 'Landowner (Bonde)',
    [TitleRank.Hersir]: 'War-Chieftain (Hersir)',
    [TitleRank.Jarl]: 'Jarl (Earl)',
    [TitleRank.Konungr]: 'King (Konungr)',
    [TitleRank.Overking]: 'High King of the North Sea',
  },
  fa: {
    [TitleRank.Thrall]: 'بنده (ترال)',
    [TitleRank.Freeman]: 'مرد آزاد',
    [TitleRank.Bonde]: 'زمین‌دار (بونده)',
    [TitleRank.Hersir]: 'سردار محلی (هرسیر)',
    [TitleRank.Jarl]: 'فرمانروا (یارل)',
    [TitleRank.Konungr]: 'پادشاه (کونونگر)',
    [TitleRank.Overking]: 'شاهنشاه دریای شمال',
  },
};

export const SHORT_TITLE_LABELS: Record<Language, Record<TitleRank, string>> = {
  en: {
    [TitleRank.Thrall]: 'Thrall',
    [TitleRank.Freeman]: 'Freeman',
    [TitleRank.Bonde]: 'Landowner',
    [TitleRank.Hersir]: 'Chieftain',
    [TitleRank.Jarl]: 'Jarl',
    [TitleRank.Konungr]: 'King',
    [TitleRank.Overking]: 'High King',
  },
  fa: {
    [TitleRank.Thrall]: 'بنده',
    [TitleRank.Freeman]: 'آزادمرد',
    [TitleRank.Bonde]: 'زمین‌دار',
    [TitleRank.Hersir]: 'سردار',
    [TitleRank.Jarl]: 'یارل',
    [TitleRank.Konungr]: 'پادشاه',
    [TitleRank.Overking]: 'شاهنشاه',
  },
};

export const RELIGION_LABELS: Record<Language, Record<Religion, string>> = {
  en: {
    [Religion.NorsePagan]: 'Old Norse Gods',
    [Religion.Syncretic]: 'Mixed Faith (Prime-Signed)',
    [Religion.Christian]: 'Christian',
  },
  fa: {
    [Religion.NorsePagan]: 'خدایان کهن اسکاندیناوی',
    [Religion.Syncretic]: 'آیین ترکیبی (نشان صلیب و چکش ثور)',
    [Religion.Christian]: 'مسیحی',
  },
};

export const ROLE_LABELS: Record<Language, Record<RelationRole, string>> = {
  en: {
    Father: 'Father',
    Mother: 'Mother',
    'Foster-Parent': 'Foster-Parent',
    Sibling: 'Sibling',
    Spouse: 'Spouse',
    Concubine: 'Consort',
    Child: 'Child',
    'Foster-Child': 'Foster-Child',
    'Sworn Brother': 'Sworn Brother',
    'Sworn Sister': 'Sworn Sister',
    'Uncle/Aunt': 'Uncle / Aunt',
    'Nephew/Niece': 'Nephew / Niece',
    Cousin: 'Cousin',
    Rival: 'Rival',
    'Blood-Feud Enemy': 'Blood-Feud Enemy',
  },
  fa: {
    Father: 'پدر',
    Mother: 'مادر',
    'Foster-Parent': 'سرپرست خوانده',
    Sibling: 'خواهر/برادر',
    Spouse: 'همسر',
    Concubine: 'همدم',
    Child: 'فرزند',
    'Foster-Child': 'فرزندخوانده',
    'Sworn Brother': 'برادر قسم‌خورده',
    'Sworn Sister': 'خواهر قسم‌خورده',
    'Uncle/Aunt': 'عمو / عمه / دایی / خاله',
    'Nephew/Niece': 'برادرزاده / خواهرزاده',
    Cousin: 'پسرعمو / دخترعمو',
    Rival: 'رقیب',
    'Blood-Feud Enemy': 'دشمن خونی',
  },
};

export const REGION_LABELS: Record<Language, Record<RegionGroup, string>> = {
  en: {
    Norway: 'Norway',
    Denmark: 'Denmark',
    Sweden: 'Sweden',
    'British Isles': 'Britain',
    Ireland: 'Ireland',
    Continent: 'Francia',
    'North Atlantic': 'Iceland & West',
  },
  fa: {
    Norway: 'نروژ',
    Denmark: 'دانمارک',
    Sweden: 'سوئد',
    'British Isles': 'بریتانیا',
    Ireland: 'ایرلند',
    Continent: 'فرانسه و اروپا',
    'North Atlantic': 'ایسلند و غرب',
  },
};

export const CLASS_SHORT_LABELS_I18N: Record<Language, Record<SocialClass, string>> = {
  en: {
    [SocialClass.Thrall]: 'Thrall (Unfree)',
    [SocialClass.Karl]: 'Free Farmer',
    [SocialClass.Bonde]: 'Landowner',
    [SocialClass.HersirKin]: 'Chieftain',
    [SocialClass.JarlKin]: 'Jarl (Noble)',
    [SocialClass.Royal]: 'Royal Blood',
  },
  fa: {
    [SocialClass.Thrall]: 'بنده (اسیر)',
    [SocialClass.Karl]: 'کشاورز آزاد',
    [SocialClass.Bonde]: 'زمین‌دار ثروتمند',
    [SocialClass.HersirKin]: 'فرزند سردار',
    [SocialClass.JarlKin]: 'خاندان یارل',
    [SocialClass.Royal]: 'خون شاهی',
  },
};

export const STAT_LABELS: Record<Language, Record<StatKey, string>> = {
  en: {
    health: 'Health',
    strength: 'Strength',
    cunning: 'Cunning',
    charisma: 'Charisma',
    honor: 'Honor',
    wyrd: 'Fate & Luck (Wyrd)',
    faith: 'Faith',
    happiness: 'Happiness',
  },
  fa: {
    health: 'سلامتی',
    strength: 'قدرت بدنی',
    cunning: 'ذکاوت و تدبیر',
    charisma: 'کاریزما و نفوذ',
    honor: 'شرافت و آبرو',
    wyrd: 'بخت و تقدیر (ویرد)',
    faith: 'ایمان',
    happiness: 'شادی و روحیه',
  },
};

export const SKILL_LABELS: Record<Language, Record<SkillKey, string>> = {
  en: {
    combat: 'Combat',
    seamanship: 'Sailing',
    farming: 'Farming',
    trade: 'Trade',
    diplomacy: 'Diplomacy',
    law: 'Law',
    craft: 'Craft',
    skaldcraft: 'Poetry',
    seidr: 'Mystic Lore',
  },
  fa: {
    combat: 'رزم و شمشیرزنی',
    seamanship: 'دریانوردی',
    farming: 'کشاورزی',
    trade: 'تجارت',
    diplomacy: 'سیاست و مذاکره',
    law: 'قانون‌دانی',
    craft: 'صنعت و کشتی‌سازی',
    skaldcraft: 'شاعری و حماسه',
    seidr: 'جادو و پیشگویی',
  },
};

export const CATEGORY_LABELS: Record<
  Language,
  Record<EventCategory | 'Chronicle' | 'Action' | 'Succession', string>
> = {
  en: {
    Childhood: 'Childhood',
    'Coming of Age': 'Coming of Age',
    Family: 'Family & Kin',
    'Farm Life': 'Homestead Life',
    'Blood Feud': 'Blood Feud',
    Feud: 'Blood Feud',
    'Law & the Thing': 'Council of Law (The Thing)',
    'Thing & Law': 'Council of Law (The Thing)',
    Raiding: 'Sea Raid',
    Trade: 'Merchant Trade',
    'Voyage & Sea': 'Open Sea Voyage',
    Religion: 'Gods & Faith',
    'Politics & Kings': 'Halls of Power',
    War: 'Battle',
    'Illness & Death': 'Sickness & Survival',
    'Romance & Marriage': 'Marriage & Hearth',
    Betrayal: 'Treachery',
    'Mystic & Omens': 'Omens & Fate',
    'Historical Set-Piece': 'World History Event',
    Chronicle: 'World Chronicle',
    Action: 'Action',
    Succession: 'Dynasty Succession',
  },
  fa: {
    Childhood: 'دوران کودکی',
    'Coming of Age': 'نوجوانی و بلوغ',
    Family: 'خانواده و تبار',
    'Farm Life': 'زندگی در ملک و مزرعه',
    'Blood Feud': 'کینه و دشمنی خونی',
    Feud: 'کینه و دشمنی خونی',
    'Law & the Thing': 'شورای قانون (ثینگ)',
    'Thing & Law': 'شورای قانون (ثینگ)',
    Raiding: 'غارت دریایی',
    Trade: 'تجارت و بازار',
    'Voyage & Sea': 'سفر در دریاهای شمال',
    Religion: 'آیین و خدایان',
    'Politics & Kings': 'سیاست و شاهان',
    War: 'نبرد و سپرها',
    'Illness & Death': 'بیماری و بقا',
    'Romance & Marriage': 'پیوند و زناشویی',
    Betrayal: 'خیانت در تالار',
    'Mystic & Omens': 'فال و تقدیر',
    'Historical Set-Piece': 'رویداد بزرگ تاریخی',
    Chronicle: 'وقایع‌نامه جهان',
    Action: 'اقدام',
    Succession: 'جانشینی خاندان',
  },
};

export const EPITHET_FA: Record<string, string> = {
  'the One-Eyed': 'تک‌چشم',
  'Sea-Wolf': 'گرگ دریا',
  'the Far-Traveler': 'جهانگرد دریاها',
  'Skald-Tongue': 'سخنور حماسه',
  'the Law-Wise': 'قانون‌دان خردمند',
  'Ring-Giver': 'بخشنده حلقه‌های سیمین',
  Ironside: 'پهلوان رویین‌تن',
  'the Proud': 'مغرور',
  'Crow-Nose': 'کلاغ‌منقار',
  'Iron-Brow': 'آهن‌جبین',
  'Skull-Splitter': 'شکافنده خودها',
};

export const QUICK_GUIDE: Record<
  Language,
  {
    title: string;
    subtitle: string;
    steps: { heading: string; body: string }[];
    glossaryTitle: string;
    terms: { term: string; meaning: string }[];
    closeLabel: string;
  }
> = {
  en: {
    title: 'How Viking BitLife Works',
    subtitle: 'Fast choices, wild fates, and multi-generation sagas (793–1066 AD).',
    steps: [
      {
        heading: '1. Tap "Next Year" (or Spacebar)',
        body: 'Live year by year! Each year brings 1–2 short, punchy events with clear risk and cost labels before you pick.',
      },
      {
        heading: '2. Optional Yearly Activities',
        body: 'Want extra silver, combat skill, or a coastal raid? Open Activities — each quick action can be used once per year.',
      },
      {
        heading: '3. Watch Your 4 Stats & Portrait',
        body: 'Health, Honor, Strength, and Happiness react to every choice, while scars, age, and crowns show right on your Viking portrait.',
      },
      {
        heading: '4. Die Gloriously — Continue in 1 Click',
        body: 'Interact with family in Kin. When you die, save your Life Report Card and continue as your heir in a single tap! Heavy realm/fleet tools live in More.',
      },
    ],
    glossaryTitle: 'Key Viking Age Terms',
    terms: [
      { term: 'The Thing', meaning: 'Assembly of free people where laws are spoken and feuds are judged.' },
      { term: 'Holmgang', meaning: 'Legal 1-on-1 duel fought on a staked hide or island to settle disputes.' },
      { term: 'Wergild', meaning: 'Blood-price paid in silver to end a deadly family feud peacefully.' },
      { term: 'Hird', meaning: 'Your sworn warband of loyal household warriors.' },
      { term: 'Longship vs. Knarr', meaning: 'Longships are fast warships for raids; Knarrs are deep ocean cargo ships that cut storm risk.' },
      { term: 'Wyrd', meaning: 'Norse fate and personal luck woven by the Norns — saves your skin in close calls.' },
    ],
    closeLabel: 'Back to Life',
  },
  fa: {
    title: 'راهنمای سریع زندگی وایکینگی',
    subtitle: 'انتخاب‌های سریع، سرنوشت‌های عجیب‌وغریب و میراث نسل‌به‌نسل (۷۹۳ تا ۱۰۶۶ میلادی).',
    steps: [
      {
        heading: '۱. دکمه بزرگ «سال بعد» رو بزن!',
        body: 'زندگی سال‌به‌سال جلو می‌ره! هر سال فقط ۱ تا ۲ اتفاق کوتاه و باحال برات پیش میاد و قبل از انتخاب، ریسک و هزینه‌ش رو می‌بینی.',
      },
      {
        heading: '۲. فعالیت‌های سبک سالانه',
        body: 'اگه دلت نقره بیشتر، تمرین شمشیرزنی یا غارت خواست، سر بزن به «فعالیت‌ها»؛ هر کدوم سالی یک‌بار قابل انجامه.',
      },
      {
        heading: '۳. حواست به ۴ نوار اصلی باشه',
        body: 'سلامتی، شرافت، قدرت و شادی با تصمیم‌هات بالا و پایین می‌رن و زخم‌ها و گذر عمر مستقیم روی چهره شخصیتت دیده می‌شن.',
      },
      {
        heading: '۴. مرگ آخر خط نیست — ادامه با یک کلیک!',
        body: 'تو تب «خاندان» با خانواده‌ت تعامل کن. وقتی مردی، کارنامه زندگیت رو ذخیره کن و با یک کلیک با وارثت ادامه بده! بخش‌های سنگین‌تر هم تو منوی «بیشتر» هستن.',
      },
    ],
    glossaryTitle: 'چند اصطلاح باحال عصر وایکینگ‌ها',
    terms: [
      { term: 'ثینگ (Thing)', meaning: 'شورای مردان آزاد که توش بدون نیاز به شاه، دعواها و قوانین رو قضاوت می‌کردن.' },
      { term: 'هولم‌گانگ (Holmgang)', meaning: 'دوئل رسمی و تن‌به‌تن وسط یه زمین مشخص که تا خون اول یا مرگ ادامه داشت.' },
      { term: 'ورگیلد (Wergild)', meaning: 'خون‌بهای نقره برای تموم کردن آبرومندانه دشمنی‌های خونی.' },
      { term: 'هیرد (Hird)', meaning: 'جنگجوهای قسم‌خورده و بامرام تالارت که تو غارت و جنگ هواتو دارن.' },
      { term: 'لانگ‌شیپ و کِنار', meaning: 'لانگ‌شیپ کشتی جنگی سریع برای غارته؛ کِنار کشتی پهن تجاریه که تو طوفان غرق نمی‌شه.' },
      { term: 'ویرد (Wyrd)', meaning: 'بخت و اقبال نورس؛ هرچی بالاتر باشه، دمِ مرگ بیشتر قسر درمی‌ری!' },
    ],
    closeLabel: 'بزن بریم تو بازی',
  },
};

