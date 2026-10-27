import { FullGameState, TitleRank } from '../types/game';
import { TITLE_LADDER } from './namesAndTraits';

export interface DeathTypeDef {
  id: string;
  titleEn: string;
  titleFa: string;
  messageEn: string;
  messageFa: string;
  closingEn: string;
  closingFa: string;
}

export const DEATH_TYPES: DeathTypeDef[] = [
  {
    id: 'death_mead_vat',
    titleEn: 'Drowned in the Mead-Vat',
    titleFa: 'غرق‌شده در خمره‌ی نوشیدنی',
    messageEn: 'Leaned too far into the honey-mead cask looking for a dropped silver ring and never came back up.',
    messageFa: 'برای پیدا کردن انگشتر نقره‌ات تا کمر خم شدی توی خمره‌ی بزرگ عسلاب و دیگر هیچ‌کس پاهایت را هم بیرون ندید.',
    closingEn: 'At least you died marinating! Valhalla awaits!',
    closingFa: 'حداقل شیرین و خوش‌طعم رفتی آن دنیا! والهالا چشم‌به‌راهته!',
  },
  {
    id: 'death_flyting_shame',
    titleEn: 'Roasted to Death by a Skald',
    titleFa: 'سکته‌ی ناقص از شعرِ شاعر',
    messageEn: 'An Icelandic poet insulted your beard so savagely that a vein popped right behind your ear.',
    messageFa: 'شاعر ایسلندی وسط تالار چنان متلک سنگینی به ریش و قیافه‌ات انداخت که رگ گردنت زد بیرون و همان‌جا پس افتادی.',
    closingEn: 'Bragi is already quoting that verse in Asgard.',
    closingFa: 'الان تو والهالا هم دارن همون شعر رو برات می‌خونن و می‌خندن!',
  },
  {
    id: 'death_berserker_mushroom',
    titleEn: 'Suspicious Forest Toadstool',
    titleFa: 'قارچِ جادوییِ اشتباهی',
    messageEn: 'Ate a bright red mushroom to gain "bear-strength," tried to wrestle a pine tree, and lost.',
    messageFa: 'به هوای قدرت خرس قارچ خال‌خالی قرمز خوردی، رفتی با درخت کاج کشتی بگیری و درخت ضربه‌فنی‌ات کرد.',
    closingEn: 'The pine tree remains undefeated. Valhalla awaits!',
    closingFa: 'درخت کاج هنوز بدون شکست صدر جدوله! والهالا چشم‌به‌راهته!',
  },
  {
    id: 'death_angry_goat',
    titleEn: 'Butted Off a Cliff by a Goat',
    titleFa: 'پرواز از صخره با شاخِ بز',
    messageEn: 'Turned your back on a grumpy billy-goat near the fjord edge. Physics handled the rest.',
    messageFa: 'لب پرتگاه آبدره پشتت را کردی به یک بز نر اعصاب‌خرد... بقیه‌اش را قانون جاذبه زحمت کشید.',
    closingEn: 'Thor’s goats send their regards!',
    closingFa: 'بزهای ارابه‌ی ثور سلام می‌رسونن!',
  },
  {
    id: 'death_slippery_ice',
    titleEn: 'Heroic Slip on Frozen Slush',
    titleFa: 'لیز خوردنِ حماسی روی یخ',
    messageEn: 'Stepped out of the longhouse yelling a mighty war-cry and immediately slipped flat on icy mud.',
    messageFa: 'با نعره‌ی جنگی از درِ تالار پریدی بیرون که دشمن را بترسانی، ولی قدم اول روی یخ شپلق کله‌پا شدی.',
    closingEn: 'Odin is pretending he didn’t see that.',
    closingFa: 'اودین یک‌چشمش رو هم بست که بگه من ندیدم!',
  },
  {
    id: 'death_bad_herring',
    titleEn: 'Six-Month-Old Pickled Herring',
    titleFa: 'ماهی شورِ شش‌ماهه‌',
    messageEn: 'Insisted the grey, bubbling barrel of herring "still smelled totally fine." It did not.',
    messageFa: 'اصرار کردی بشکه‌ی ماهیِ کپک‌زده‌ای که قل‌قل می‌کرد «هنوز جا داره و حیفه دور بریزیم». اشتباه می‌کردی.',
    closingEn: 'Even Hel plugged her nose when you arrived.',
    closingFa: 'فرشته‌های مرگ هم با دستمال جلوی دماغشون اومدن سراغت!',
  },
  {
    id: 'death_shield_wall_glory',
    titleEn: 'Glorious Shield-Wall Last Stand',
    titleFa: 'مرگِ باشکوه در دیوار سپرها',
    messageEn: 'Fell axe-in-hand surrounded by broken spears while holding the line for your crew.',
    messageFa: 'تبر به دست، وسط انبوه نیزه‌های شکسته ایستادی تا یارانت سالم به کشتی برسند و مثل یک قهرمان واقعی افتادی.',
    closingEn: 'The Valkyries fight over who carries you! Valhalla awaits!',
    closingFa: 'والکیری‌ها سرِ بردنت به تالار اودین دعواشونه! والهالا چشم‌به‌راهته!',
  },
  {
    id: 'death_holmgang_cleave',
    titleEn: 'Ducked Left Instead of Right',
    titleFa: 'جاخالی دادن به سمتِ اشتباه',
    messageEn: 'Inside the staked holmgang ring, you zigged straight into a two-handed Dane-axe.',
    messageFa: 'وسط میدان دوئل خواستی حرکت نمایشی بزنی و جاخالی بدهی، ولی صاف رفتی زیر تیغ تبرِ دودستی حریف.',
    closingEn: 'Bold footwork, terrible outcome. Valhalla awaits!',
    closingFa: 'حرکت پا عالی بود، فقط زاویه‌اش با تبر یکی شد! والهالا چشم‌به‌راهته!',
  },
  {
    id: 'death_sea_blizzard',
    titleEn: 'Swallowed by Rán’s Icy Net',
    titleFa: 'طعمه‌ی تورِ یخیِ دریا',
    messageEn: 'A roaring North Atlantic winter wave flipped your hull like a wooden spoon.',
    messageFa: 'موج غول‌پیکر زمستانی در اقیانوس اطلس، کشتی‌ات را مثل قاشق چوبی توی تشت چپه کرد.',
    closingEn: 'Rán pours salt-ale for drowned sailors below!',
    closingFa: 'الاهه‌ی دریا زیر امواج برایت جام نمک‌سود ریخته!',
  },
  {
    id: 'death_monastery_beehive',
    titleEn: 'Stung by Angry Monastery Bees',
    titleFa: 'انتقامِ زنبورهای صومعه',
    messageEn: 'Mistook a wicker beehive for a hidden silver chest during a raid and kicked it open.',
    messageFa: 'وسط غارت صومعه، کندوی حصیری عسل را با صندوقچه‌ی سکه اشتباه گرفتی و با لگد رفتی تو شکمش.',
    closingEn: 'The monks called it a miracle. The Valkyries are trying not to laugh.',
    closingFa: 'راهب‌ها اسمش رو گذاشتن معجزه؛ والکیری‌ها هم دارن ریزریز می‌خندن!',
  },
  {
    id: 'death_walrus_tusk',
    titleEn: 'Outwrestled by a Bull Walrus',
    titleFa: 'شکست سنگین از گراز دریایی',
    messageEn: 'Tried to grab a thousand-pound bull walrus by the whiskers on slick sea-rock.',
    messageFa: 'روی صخره‌ی خیس خواستی سبیل یک گراز دریاییِ نیم‌تُنی را بکشی؛ او هم با عاج‌هایش حسابت را صاف کرد.',
    closingEn: 'The walrus kept your helmet. Valhalla awaits!',
    closingFa: 'گراز دریایی کلاه‌خودت رو هم به عنوان غنیمت برداشت!',
  },
  {
    id: 'death_lightning_thor',
    titleEn: 'Argued with Thor in a Thunderstorm',
    titleFa: 'کل‌کل با ثور زیر رعدوبرق',
    messageEn: 'Stood on a hilltop waving an iron sword at storm-clouds yelling "Is that all you’ve got?!"',
    messageFa: 'رفتی بالای تپه، شمشیر آهنی را گرفتی سمت ابرهای سیاه و داد زدی «همین بود زورت ای ثور؟!»... که خب، بیشتر بود.',
    closingEn: 'Answer received in 0.2 seconds. Valhalla awaits!',
    closingFa: 'جواب سوالت رو در دو دهم ثانیه تحویل گرفتی! والهالا چشم‌به‌راهته!',
  },
  {
    id: 'death_runestone_crush',
    titleEn: 'Flattened by Your Own Runestone',
    titleFa: 'له‌شدن زیر سنگِ یادبودِ خودت',
    messageEn: 'Stood right beneath your memorial granite boulder to inspect the spelling when the rope snapped.',
    messageFa: 'رفتی دقیقاً زیر سنگ یادبود دو تُنیِ خودت ایستادی ببینی اسمت را بدون غلط املایی کنده‌اند که طناب پاره شد.',
    closingEn: 'Conveniently, your gravestone is already in place!',
    closingFa: 'حُسنش اینه که سنگ قبرت از قبل دقیقاً سر جاش نصبه!',
  },
  {
    id: 'death_boasting_swim',
    titleEn: 'Drunken Fjord Swim in Chainmail',
    titleFa: 'شنا در آبدره با زرهِ آهنی',
    messageEn: 'Bet ten silver after six horns of ale that you could swim across the fjord wearing full mail.',
    messageFa: 'بعد از شش شاخ نوشیدنی، سرِ ده نقره شرط بستی با زرهِ زنجیری کامل عرض آبدره را شنا کنی. تا کفِ آب عالی رفتی!',
    closingEn: 'You sank faster than an anchor. Valhalla awaits!',
    closingFa: 'از لنگرِ کشتی سریع‌تر رفتی تهِ آب! والهالا چشم‌به‌راهته!',
  },
  {
    id: 'death_poisoned_horn',
    titleEn: 'Suspiciously Bitter Toast',
    titleFa: 'شربتِ شوکرانِ مجلسی',
    messageEn: 'Drank a rival’s "friendship horn" to the dregs despite the green foam on top.',
    messageFa: 'با اینکه روی جام «آشتی‌کنانِ» رقیبت کفِ سبز بسته بود، به خاطر تعارف رودربایستی تا ته سر کشیدی.',
    closingEn: 'Never trust a smiling cousin holding henbane.',
    closingFa: 'امان از تعارفِ بیجا وسط سیاستِ وایکینگی!',
  },
  {
    id: 'death_bear_hug',
    titleEn: 'Tried to Pet a Cave Bear',
    titleFa: 'ناز کردنِ خرسِ خواب‌آلود',
    messageEn: 'Poked a hibernating brown bear in January to check if the cave was vacant.',
    messageFa: 'چله‌ی زمستان با چوب زدی به پهلوی خرس قهوه‌ای توی غار که ببینی بیدار است یا نه. بیدار بود.',
    closingEn: 'Warm cave, terrible roommate. Valhalla awaits!',
    closingFa: 'غارش گرم بود، فقط صاحب‌خونه اخلاق نداشت! والهالا چشم‌به‌راهته!',
  },
  {
    id: 'death_leech_infection',
    titleEn: 'Questionable Viking Surgery',
    titleFa: 'طبابتِ سنتی با انبرِ داغ',
    messageEn: 'Let an enthusiastic village healer rub bog-mud and moss into a deep axe cut.',
    messageFa: 'سپردی شکستهبندِ محله روی زخم عمیق تبر، لجنِ مرداب و پشکلِ متبرک بمالد. عفونت سلام رساند.',
    closingEn: 'Modern medicine is still 900 years away, alas.',
    closingFa: 'حیف که تا کشف پنی‌سیلین نهصد سال دیگه مونده بود!',
  },
  {
    id: 'death_winter_lung',
    titleEn: 'Peat-Smoke & Winter Fever',
    titleFa: 'تبِ استخوان‌سوزِ زمستانی',
    messageEn: 'Coughed through a brutal northern freeze beside the smoky hearth until your breath gave out.',
    messageFa: 'سرمای استخوان‌سوز و دودِ زغال‌سنگِ تالار، سینه‌ات را از کار انداخت تا آخرین نفست هم بخار شد.',
    closingEn: 'No more frostbite where you’re going!',
    closingFa: 'خوشبختانه اون دنیا دیگه خبری از سوز و سرما نیست!',
  },
  {
    id: 'death_outlaw_ambush',
    titleEn: 'Hunted Down in the Wilds',
    titleFa: 'کمینِ جایزه‌بگیرها در جنگل',
    messageEn: 'Bounty-hunters tracked your campfire smoke through the pine woods while you were outlawed.',
    messageFa: 'وقتی حکم تبعید داشتی، جایزه‌بگیرها از روی دودِ کبابِ شبانه‌ات پیدایت کردند و مهلت ندادند لقمه را قورت بدهی.',
    closingEn: 'Next life, maybe hire a better lawyer at the Thing!',
    closingFa: 'زندگی بعدی سعی کن تو شورای ثینگ وکیل بهتری بگیری!',
  },
  {
    id: 'death_siege_rock',
    titleEn: 'Caught a Castle Boulder with Your Face',
    titleFa: 'کله زدن به سنگِ منجنیق',
    messageEn: 'Looked straight up at the city battlements right as the defenders tipped a millstone over.',
    messageFa: 'پای دیوارِ شهر سرت را بالا گرفتی ببینی مدافعان بالای برج چه‌کار می‌کنند که یک سنگِ آسیاب صاف آمد پایین.',
    closingEn: '10/10 bravery, 0/10 neck survival. Valhalla awaits!',
    closingFa: 'شجاعت بیست، گردن صفر! والهالا چشم‌به‌راهته!',
  },
  {
    id: 'death_feud_inlaws',
    titleEn: 'Vengeful Ex-In-Laws at Midnight',
    titleFa: 'شبیخونِ فامیلِ همسرِ سابق',
    messageEn: 'Your ex-spouse’s cousins never forgave that messy divorce settlement and visited with axes.',
    messageFa: 'پسرعموهای همسر سابقت هیچ‌وقت سرِ تقسیم مهریه بی‌خیال نشدند و نصفه‌شب با تبر آمدند مهمانی.',
    closingEn: 'Divorce lawyers in the 900s hit different.',
    closingFa: 'مهریه رو کی داده، کی گرفته؟ ظاهراً اینا با تبر می‌گرفتن!',
  },
  {
    id: 'death_revolt_mob',
    titleEn: 'Pitchforked by Angry Taxpayers',
    titleFa: 'شورشِ رعیت‌های کفری',
    messageEn: 'Hungry farmers stormed your hall waving hay-forks after one tax squeeze too many.',
    messageFa: 'کشاورزهای گرسنه که از خراج و قحطی کفرشان درآمده بود، با چنگکِ کاه‌کشی ریختند وسط تالارت.',
    closingEn: 'Turns out stability numbers actually mattered!',
    closingFa: 'نگو اون عددِ «ثبات قلمرو» واقعاً مهم بوده!',
  },
  {
    id: 'death_old_hearth',
    titleEn: 'Peaceful Nap in the High-Seat',
    titleFa: 'خوابِ آرام روی صندلیِ ریاست',
    messageEn: 'Dozed off by the warm embers with a horn in your hand after outliving almost all your enemies.',
    messageFa: 'بعد از اینکه عمرِ تقریباً همه‌ی دشمنانت را دیدی، کنار آتش گرم تالار با جامی در دست چرتت برد و بیدار نشدی.',
    closingEn: 'A rare, cozy ending in the Viking Age! Skál!',
    closingFa: 'مرگِ راحت تو عصر وایکینگ‌ها خودش یک معجزه‌ست! نوش!',
  },
  {
    id: 'death_exhausted_wounds',
    titleEn: 'Body Held Together by Scars Alone',
    titleFa: 'بدنی که فقط با بخیه بند بود',
    messageEn: 'After one scrape too many, your battered Viking frame finally clocked out for good.',
    messageFa: 'بعد از ده‌ها زخم و کوفتگی، بدنت رسماً اعلام بازنشستگی کرد و دیگر نکشید.',
    closingEn: 'You left nothing in the tank! Valhalla awaits!',
    closingFa: 'تا آخرین قطره جانت رو کار کشیدی! والهالا چشم‌به‌راهته!',
  },
];

export const DEATH_TYPES_BY_ID: Record<string, DeathTypeDef> = DEATH_TYPES.reduce<
  Record<string, DeathTypeDef>
>((acc, d) => {
  acc[d.id] = d;
  return acc;
}, {});

export function resolveDeathCardDetails(
  state: FullGameState,
  deathTypeId: string | undefined,
  fallbackCauseEn: string,
  fallbackCauseFa: string
): {
  deathTypeId: string;
  causeEn: string;
  causeFa: string;
  closingEn: string;
  closingFa: string;
} {
  if (deathTypeId && DEATH_TYPES_BY_ID[deathTypeId]) {
    const dt = DEATH_TYPES_BY_ID[deathTypeId];
    return {
      deathTypeId: dt.id,
      causeEn: `${dt.titleEn} — ${dt.messageEn}`,
      causeFa: `${dt.titleFa} — ${dt.messageFa}`,
      closingEn: dt.closingEn,
      closingFa: dt.closingFa,
    };
  }

  const lower = fallbackCauseEn.toLowerCase();
  let matched: DeathTypeDef = DEATH_TYPES_BY_ID.death_exhausted_wounds;

  if (lower.includes('peacefully') || lower.includes('hearth after many winters')) {
    matched = DEATH_TYPES_BY_ID.death_old_hearth;
  } else if (lower.includes('sea') || lower.includes('capsized') || lower.includes('drowned')) {
    matched = DEATH_TYPES_BY_ID.death_sea_blizzard;
  } else if (lower.includes('holmgang')) {
    matched = DEATH_TYPES_BY_ID.death_holmgang_cleave;
  } else if (lower.includes('lung') || lower.includes('fever') || lower.includes('winter sickness')) {
    matched = DEATH_TYPES_BY_ID.death_winter_lung;
  } else if (lower.includes('poison')) {
    matched = DEATH_TYPES_BY_ID.death_poisoned_horn;
  } else if (lower.includes('bridge') || lower.includes('wall') || lower.includes('conquest') || lower.includes('gate')) {
    matched = DEATH_TYPES_BY_ID.death_siege_rock;
  } else if (lower.includes('raid') || lower.includes('shield') || lower.includes('battle') || lower.includes('cloven') || lower.includes('cut down')) {
    matched = DEATH_TYPES_BY_ID.death_shield_wall_glory;
  } else if (state.character.isOutlawed) {
    matched = DEATH_TYPES_BY_ID.death_outlaw_ambush;
  }

  return {
    deathTypeId: matched.id,
    causeEn: fallbackCauseEn || `${matched.titleEn} — ${matched.messageEn}`,
    causeFa: fallbackCauseFa || `${matched.titleFa} — ${matched.messageFa}`,
    closingEn: matched.closingEn,
    closingFa: matched.closingFa,
  };
}

export interface LifeTitleDef {
  id: string;
  titleEn: string;
  titleFa: string;
  subtitleEn: string;
  subtitleFa: string;
}

export function evaluateLifeReportTitle(state: FullGameState): LifeTitleDef {
  const c = state.character;
  const r = state.realm;

  if (c.age < 22) {
    return {
      id: 'short_sprout',
      titleEn: 'Short-Lived Sprout',
      titleFa: 'جوانه‌ی ناکام شمال',
      subtitleEn: 'Burned fast, died young, left a chaotic story.',
      subtitleFa: 'تند رفتی، زود پر کشیدی، ولی خاطراتت موند!',
    };
  }
  if ((state.conquestsWon ?? 0) >= 1 || TITLE_LADDER.indexOf(c.title) >= TITLE_LADDER.indexOf(TitleRank.Konungr)) {
    return {
      id: 'city_conqueror',
      titleEn: 'Breaker of Crowns',
      titleFa: 'تاج‌شکنِ شهرهای بزرگ',
      subtitleEn: 'Kings locked their gates when your sails appeared.',
      subtitleFa: 'پادشاهان با دیدن بادبان‌هایت دروازه‌ها را سفت قفل می‌کردند.',
    };
  }
  if ((state.totalRaidsWon ?? 0) >= 5 || c.raidsLed >= 6) {
    return {
      id: 'sea_wolf',
      titleEn: 'Sea Wolf',
      titleFa: 'گرگِ دریاهای شمال',
      subtitleEn: 'Terror of monasteries and coastal toll-ports.',
      subtitleFa: 'کابوسِ صومعه‌ها و بندرهای ثروتمند اروپا.',
    };
  }
  if (state.discoveredSettlements.includes('vinland')) {
    return {
      id: 'vinland_pathfinder',
      titleEn: 'Horizon-Breaker of Vínland',
      titleFa: 'رهگشای افق‌های وینلند',
      subtitleEn: 'Sailed clean off the edge of the known map.',
      subtitleFa: 'آن‌قدر غرب رفتی که از لبه‌ی نقشه‌های قدیمی زدی بیرون!',
    };
  }
  if (r.silver >= 350) {
    return {
      id: 'silver_dragon',
      titleEn: 'Dragon on a Silver Hoard',
      titleFa: 'اژدهای خفته بر گنجِ نقره',
      subtitleEn: 'Your chests clinked louder than church bells.',
      subtitleFa: 'صدای جرینگ‌جرینگ صندوق‌هایت از ناقوس کلیسا بلندتر بود.',
    };
  }
  if (c.killsInHolmgang >= 2) {
    return {
      id: 'holmgang_butcher',
      titleEn: 'Undisputed Duelist',
      titleFa: 'بی‌رقیبِ میدانِ دوئل',
      subtitleEn: 'Settled arguments with three feet of cold iron.',
      subtitleFa: 'همه‌ی بحث‌های حقوقی را با سه وجب آهنِ سرد حل می‌کردی.',
    };
  }
  if ((state.divorcesCount ?? 0) >= 2 || state.marriedBloodEnemy) {
    return {
      id: 'fjord_heartbreaker',
      titleEn: 'Chaos Romantic of the Fjords',
      titleFa: 'دل‌شکنِ پرحاشیه‌ی آبدره‌ها',
      subtitleEn: 'Turned weddings and feuds into spectator sports.',
      subtitleFa: 'ازدواج و طلاق و دشمنی خونی برایت تفریح آخر هفته بود.',
    };
  }
  if (c.skills.skaldcraft >= 45 && r.fame < 120) {
    return {
      id: 'unlucky_skald',
      titleEn: 'Unlucky Skald',
      titleFa: 'شاعرِ بدشانسِ تالار',
      subtitleEn: 'Great rhymes, questionable survival instincts.',
      subtitleFa: 'قافیه‌هایت عالی بود، فقط حیف که شانس باهات یار نبود!',
    };
  }
  if (c.skills.law >= 50 || c.thingsAttended >= 4) {
    return {
      id: 'iron_lawspeaker',
      titleEn: 'Silver-Tongued Lawspeaker',
      titleFa: 'زبانِ بُرنده‌ی قانون',
      subtitleEn: 'Won more silver with loopholes than with axes.',
      subtitleFa: 'با تبصره‌های قانونی بیشتر از تبر جنگی نقره درآوردی.',
    };
  }
  if (c.raidsLed === 0 && c.killsInHolmgang === 0 && c.stats.honor < 42) {
    return {
      id: 'hall_coward',
      titleEn: 'Cozy Hall-Hugger',
      titleFa: 'تنبلِ کنارِ کرسی و آتش',
      subtitleEn: 'Successfully avoided sharp objects almost your whole life.',
      subtitleFa: 'تمام عمرت با موفقیت از شمشیر و دریا و دردسر جاخالی دادی.',
    };
  }
  if (c.age >= 65) {
    return {
      id: 'old_oak',
      titleEn: 'Iron-Rooted Elder',
      titleFa: 'بلوطِ کهنسال و جان‌سخت',
      subtitleEn: 'Outlived plagues, blizzards, and younger hotheads.',
      subtitleFa: 'از طاعون و کولاک و جوان‌های کله‌شق جان سالم به در بردی.',
    };
  }
  return {
    id: 'proud_drengr',
    titleEn: 'Stout-Hearted Northman',
    titleFa: 'سردارِ نامدارِ شمال',
    subtitleEn: 'Lived boldly between hearth-smoke and salt spray.',
    subtitleFa: 'میان دودِ آتش تالار و کفِ امواج دریا، سرودِ خودت را ساختی.',
  };
}

export interface AchievementDef {
  id: string;
  nameEn: string;
  nameFa: string;
  descEn: string;
  descFa: string;
  getProgress: (state: FullGameState, isDeadNow?: boolean) => { current: number; target: number };
}

export const BITLIFE_ACHIEVEMENTS: AchievementDef[] = [
  // Preserve original 9 achievements (keyed by exact legacy name so v1 saves stay unlocked!)
  {
    id: 'First Keel Launched',
    nameEn: 'First Keel Launched',
    nameFa: 'نخستین بادبان در آب',
    descEn: 'Own at least 1 war longship or ocean trade knarr.',
    descFa: 'حداقل ۱ کشتی جنگی یا تجاری داشته باشید.',
    getProgress: (s) => ({ current: Math.min(1, s.realm.longships + s.realm.knarrs), target: 1 }),
  },
  {
    id: 'Scourge of the Coasts',
    nameEn: 'Scourge of the Coasts',
    nameFa: 'تازیانه‌ی سواحل',
    descEn: 'Lead 3 coastal raids.',
    descFa: 'فرماندهی ۳ غارت دریایی را بر عهده بگیرید.',
    getProgress: (s) => ({ current: Math.min(3, s.character.raidsLed), target: 3 }),
  },
  {
    id: 'Sea Wolf (5 Raids Won)',
    nameEn: 'Five Plundered Harbors',
    nameFa: 'پنج غارتِ پیروزمندانه',
    descEn: 'Win 5 successful coastal raids.',
    descFa: 'در ۵ غارت دریایی پیروز شوید.',
    getProgress: (s) => ({
      current: Math.min(5, Math.max(s.totalRaidsWon ?? 0, Math.floor(s.character.raidsLed * 0.8))),
      target: 5,
    }),
  },
  {
    id: 'Die Before 30',
    nameEn: 'Live Fast, Valhalla Young',
    nameFa: 'مرگِ زیر ۳۰ سال!',
    descEn: 'Meet a glorious (or ridiculous) end before age 30.',
    descFa: 'قبل از رسیدن به ۳۰ سالگی به والهالا بروید!',
    getProgress: (s, isDeadNow) => {
      const deadYoung =
        (isDeadNow && s.character.age < 30) || s.ancestors.some((a) => a.ageAtDeath < 30);
      return { current: deadYoung ? 1 : 0, target: 1 };
    },
  },
  {
    id: 'Marry a Blood Enemy',
    nameEn: 'Sleeping with the Enemy',
    nameFa: 'ازدواج با دشمنِ خونی!',
    descEn: 'Seal a peace marriage with a rival or blood-feud enemy.',
    descFa: 'با یک رقیب یا دشمن خونی پیمان ازدواج ببندید.',
    getProgress: (s) => ({ current: s.marriedBloodEnemy ? 1 : 0, target: 1 }),
  },
  {
    id: 'Conqueror of Walls',
    nameEn: 'Stormer of Stone Gates',
    nameFa: 'فاتحِ شهرهای مستحکم',
    descEn: 'Conquer a fortified city (London, York, Paris, etc.) by force.',
    descFa: 'یک شهر بزرگ و قلعه‌دار دشمن را با یورش فتح کنید.',
    getProgress: (s) => ({ current: Math.min(1, s.conquestsWon ?? 0), target: 1 }),
  },
  {
    id: 'Voice at Lögberg',
    nameEn: 'Voice at Lögberg',
    nameFa: 'صدای رسا در شورای ثینگ',
    descEn: 'Speak 3 times at the Thing council or reach Law 50.',
    descFa: '۳ بار در شورای ثینگ سخنرانی کنید یا قانون‌دانی را به ۵۰ برسانید.',
    getProgress: (s) => ({
      current: s.character.skills.law >= 50 ? 3 : Math.min(3, s.character.thingsAttended),
      target: 3,
    }),
  },
  {
    id: 'Beyond the Ice-Fjords',
    nameEn: 'Beyond the Ice-Fjords',
    nameFa: 'فراتر از آبدره‌های یخ‌زده',
    descEn: 'Discover Greenland (Brattahlíð).',
    descFa: 'مسیر دریایی گرینلند را کشف کنید.',
    getProgress: (s) => ({
      current: s.discoveredSettlements.includes('brattahlid') ? 1 : 0,
      target: 1,
    }),
  },
  {
    id: 'Vínland Voyagers',
    nameEn: 'Vínland Voyagers',
    nameFa: 'مسافران سرزمین وینلند',
    descEn: 'Make landfall at Vínland in North America.',
    descFa: 'به سواحل قاره جدید (وینلند) قدم بگذارید.',
    getProgress: (s) => ({
      current: s.discoveredSettlements.includes('vinland') ? 1 : 0,
      target: 1,
    }),
  },
  {
    id: 'Unbroken Bloodline',
    nameEn: 'Unbroken Bloodline',
    nameFa: 'تداوم نسل خاندان',
    descEn: 'Continue your saga as an heir in Generation 2.',
    descFa: 'پس از مرگ، بازی را با وارث خود در نسل دوم ادامه دهید.',
    getProgress: (s) => ({ current: s.generation >= 2 ? 2 : 1, target: 2 }),
  },
  {
    id: 'Four Generations of Saga',
    nameEn: 'Four Generations of Saga',
    nameFa: 'حماسه‌ی چهار نسل',
    descEn: 'Carry one dynasty across 4 generations.',
    descFa: 'دودمان خود را تا نسل چهارم سرپا نگه دارید.',
    getProgress: (s) => ({ current: Math.min(4, s.generation), target: 4 }),
  },
  {
    id: 'Undying Word-Fame',
    nameEn: 'Undying Word-Fame',
    nameFa: 'شهرتِ جاودان',
    descEn: 'Reach 500+ Fame.',
    descFa: 'شهرت خاندان را به ۵۰۰ برسانید.',
    getProgress: (s) => ({ current: Math.min(500, s.realm.fame), target: 500 }),
  },
  {
    id: 'Living Legend (1000 Fame)',
    nameEn: 'Myth of the Nine Realms',
    nameFa: 'افسانه‌ی نُه جهان (۱۰۰۰ شهرت)',
    descEn: 'Reach 1,000+ Fame.',
    descFa: 'شهرت خود را به بیش از ۱۰۰۰ برسانید.',
    getProgress: (s) => ({ current: Math.min(1000, s.realm.fame), target: 1000 }),
  },
  {
    id: 'Crowned Konungr',
    nameEn: 'Crowned Konungr',
    nameFa: 'تاج‌گذاری پادشاهی',
    descEn: 'Rise to the rank of King (Konungr) or High King.',
    descFa: 'به مقام پادشاه (کونونگر) برسید.',
    getProgress: (s) => ({
      current: Math.min(5, TITLE_LADDER.indexOf(s.character.title)),
      target: 5,
    }),
  },
  {
    id: 'North Sea Overking',
    nameEn: 'High King of Three Coasts',
    nameFa: 'شاهنشاهِ دریای شمال',
    descEn: 'Claim the supreme rank of High King (Overking).',
    descFa: 'بالاترین مقام عصر وایکینگ‌ها (شاهنشاه) را فتح کنید.',
    getProgress: (s) => ({
      current: Math.min(6, TITLE_LADDER.indexOf(s.character.title)),
      target: 6,
    }),
  },
  {
    id: 'Silver Hoarder 500',
    nameEn: 'Chest Full of Hacksilver',
    nameFa: 'صندوقِ لبریز از نقره (۵۰۰ سکه)',
    descEn: 'Hold 500+ silver in your treasury at once.',
    descFa: 'هم‌زمان ۵۰۰ سکه نقره در خزانه داشته باشید.',
    getProgress: (s) => ({ current: Math.min(500, s.realm.silver), target: 500 }),
  },
  {
    id: 'Holmgang Champion',
    nameEn: 'Three Duels, Three Graves',
    nameFa: 'قهرمانِ سه دوئل خونین',
    descEn: 'Slay 3 rivals in single-combat holmgang duels.',
    descFa: '۳ رقیب را در دوئل تن‌به‌تن هولم‌گانگ شکست دهید.',
    getProgress: (s) => ({ current: Math.min(3, s.character.killsInHolmgang), target: 3 }),
  },
  {
    id: 'Survive to 70',
    nameEn: 'Greybeard of Seventy Winters',
    nameFa: 'پیرِ هفتاد زمستان',
    descEn: 'Reach age 70 in a brutal medieval world.',
    descFa: 'در دنیای بی‌رحم وایکینگ‌ها به سن ۷۰ سالگی برسید.',
    getProgress: (s) => ({ current: Math.min(70, s.character.age), target: 70 }),
  },
  {
    id: 'Thrall Broken Chains',
    nameEn: 'Chains Broken',
    nameFa: 'زنجیرشکن (از بردگی تا آزادی)',
    descEn: 'Start as or rise out of Thralldom into free rank.',
    descFa: 'از جایگاه برده (ثرال) آزادی خود را به دست آورید.',
    getProgress: (s) => {
      const wasThrall =
        s.flags.includes('started_as_thrall') ||
        s.lifeLog.some((l) => l.id.includes('buy_freedom'));
      const freed = wasThrall && s.character.title !== TitleRank.Thrall;
      return { current: freed ? 1 : 0, target: 1 };
    },
  },
  {
    id: 'Full Longhouse (5 Kids)',
    nameEn: 'Noisy Longhouse',
    nameFa: 'تالارِ پرجمعیت (۵ فرزند)',
    descEn: 'Have 5 living children at the same time.',
    descFa: 'هم‌زمان ۵ فرزند زنده در تالار داشته باشید.',
    getProgress: (s) => ({
      current: Math.min(
        5,
        s.relationships.filter((r) => r.role === 'Child' && r.alive).length
      ),
      target: 5,
    }),
  },
  {
    id: 'Divorce Drama',
    nameEn: 'Keep the Silver, Take the Goat',
    nameFa: 'طلاقِ پرحاشیه به رسم شمال',
    descEn: 'Declare a Norse threshold divorce.',
    descFa: 'یک طلاق رسمی جلوی چهارچوب در اعلام کنید.',
    getProgress: (s) => ({ current: Math.min(1, s.divorcesCount ?? 0), target: 1 }),
  },
  {
    id: 'One-Eyed Wisdom',
    nameEn: 'Odin’s Mirror',
    nameFa: 'یک‌چشم به سبکِ اودین',
    descEn: 'Carry the One-Eyed trait through life.',
    descFa: 'ویژگی «یک‌چشم» را به دست آورید و در چهره‌تان ببینید.',
    getProgress: (s) => ({
      current: s.character.traits.includes('one_eyed') ? 1 : 0,
      target: 1,
    }),
  },
  {
    id: 'Shieldmaiden Legend',
    nameEn: 'Valkyrie of the Fjord',
    nameFa: 'بانوی سپردارِ افسانه‌ای',
    descEn: 'Earn the Shieldmaiden of Renown trait.',
    descFa: 'ویژگی «بانوی سپردار نامدار» را کسب کنید.',
    getProgress: (s) => ({
      current: s.character.traits.includes('shieldmaiden_renown') ? 1 : 0,
      target: 1,
    }),
  },
  {
    id: 'Fleet Admiral (5 Ships)',
    nameEn: 'Dragon-Prow Fleet',
    nameFa: 'ناوگانِ اژدهاپیکر (۵ کشتی)',
    descEn: 'Command 5+ ships across warships and knarrs.',
    descFa: 'صاحب حداقل ۵ کشتی (جنگی و تجاری) شوید.',
    getProgress: (s) => ({
      current: Math.min(5, s.realm.longships + s.realm.knarrs),
      target: 5,
    }),
  },
  {
    id: 'Warlord of Fifty',
    nameEn: 'Fifty Sworn Spears',
    nameFa: 'فرماندهِ پنجاه نیزه‌دار',
    descEn: 'Maintain a personal hird warband of 50+ warriors.',
    descFa: 'سپاه شخصی خود را به ۵۰ جنگجو برسانید.',
    getProgress: (s) => ({ current: Math.min(50, s.realm.hirdWarriors), target: 50 }),
  },
  {
    id: 'Landed Magnate (8 Farms)',
    nameEn: 'Lord of Eight Valleys',
    nameFa: 'اربابِ هشت مزرعه',
    descEn: 'Own 8+ family farms across the map.',
    descFa: 'حداقل ۸ مزرعه در سرزمین‌های مختلف داشته باشید.',
    getProgress: (s) => ({ current: Math.min(8, s.realm.landFarms), target: 8 }),
  },
  {
    id: 'Ring Fortress Builder',
    nameEn: 'Trelleborg Ramparts',
    nameFa: 'معمارِ دژِ حلقه‌ای',
    descEn: 'Construct a mighty circular Ring Fortress on an estate.',
    descFa: 'در یکی از املاک خود «دژ حلقه‌ای» بسازید.',
    getProgress: (s) => ({
      current: s.realm.holdings.some((h) => h.buildings.includes('ring_fortress')) ? 1 : 0,
      target: 1,
    }),
  },
  {
    id: 'Timeline Breaker',
    nameEn: 'Rewriter of Chronicles',
    nameFa: 'تغییردهنده‌ی مسیر تاریخ',
    descEn: 'Alter recorded history in a major historical event.',
    descFa: 'در یکی از رویدادهای بزرگ، مسیر واقعی تاریخ را تغییر دهید.',
    getProgress: (s) => ({ current: Math.min(1, s.divergences.length), target: 1 }),
  },
  {
    id: 'Master Sea-Captain',
    nameEn: 'Star-Steerer (10 Voyages)',
    nameFa: 'ناخدای ستاره‌شناس (۱۰ سفر)',
    descEn: 'Complete 10 sea voyages across northern waters.',
    descFa: '۱۰ سفر دریایی میان بنادر مختلف انجام دهید.',
    getProgress: (s) => ({ current: Math.min(10, s.character.voyagesCompleted), target: 10 }),
  },
  {
    id: 'Pure Joy in Cold Lands',
    nameEn: 'Laughing in the Blizzard',
    nameFa: 'قهقهه وسطِ کولاک (شادی ۹۵+)',
    descEn: 'Reach 95+ Happiness despite living in the Viking Age.',
    descFa: 'شادی شخصیت خود را به بالای ۹۵ برسانید.',
    getProgress: (s) => ({ current: Math.min(95, s.character.stats.happiness), target: 95 }),
  },
];
