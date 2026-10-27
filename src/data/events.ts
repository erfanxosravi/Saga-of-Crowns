import {
  GameEvent,
  HistoricalVikingEvent,
  Religion,
  Sex,
  SocialClass,
  TitleRank,
} from '../types/game';
import { HISTORICAL_SET_PIECE_EVENTS } from './historicalTimeline';
import { BITLIFE_EVENTS } from './bitlifeEvents';

/**
 * 65+ handcrafted life, feud, Thing, sea, farm, mystic, romance, and realm events
 * plus the 15 historical set-piece events = 80+ distinct interactive decision events!
 */
export const CORE_LIFE_EVENTS: GameEvent[] = [
  // ==========================================
  // CHILDHOOD & FOSTERING (Ages 1 - 15)
  // ==========================================
  {
    id: 'child_001_wooden_sword',
    title: 'Ash-Wood Sword in the Yard',
    category: 'Childhood',
    ageMin: 5,
    ageMax: 11,
    weight: 8,
    text: 'Frost crusts the turf roof while an old hirdman whittles you a balanced ash-wood blade beside the smithy. Older foster-kin dare you to strike the shield-post until your knuckles bleed.',
    choices: [
      {
        id: 'strike_till_dusk',
        label: 'Swing until twilight numbs your arms',
        outcomeText: 'The greybeard nods gruffly at your stubbornness and shows you how to hook an opponent’s shield-rim.',
        effects: { stats: { strength: 6, honor: 4, health: -2 }, skills: { combat: 6 } },
      },
      {
        id: 'watch_blacksmith',
        label: 'Step inside the forge and pump the bellows for the smith',
        outcomeText: 'Sparks dance in the gloom as you learn the cherry-red glow of bog-iron before quenching.',
        effects: { stats: { cunning: 4 }, skills: { craft: 8 } },
      },
      {
        id: 'listen_skald',
        label: 'Slip back to the hearth to memorize the skald’s verses',
        outcomeText: 'By bedtime you can recite three stanzas of the Völsunga tale without stumbling on a single kenning.',
        effects: { stats: { charisma: 5, happiness: 4 }, skills: { skaldcraft: 8 } },
      },
    ],
  },
  {
    id: 'child_002_fostering',
    title: 'Sent Away in Fosterage',
    category: 'Childhood',
    provenance: 'Social History',
    ageMin: 7,
    ageMax: 12,
    classes: [SocialClass.Karl, SocialClass.Bonde, SocialClass.HersirKin, SocialClass.JarlKin, SocialClass.Royal],
    blockedByFlags: ['fostered_youth'],
    weight: 9,
    text: '"A lesser man’s roof strengthens a chieftain’s child," your father declares, sealing a fosterage pact with a respected coastal bonde to bind two valleys in alliance.',
    choices: [
      {
        id: 'embrace_foster_kin',
        label: 'Swear loyalty to your new foster-siblings and share every chore',
        outcomeText: 'Pulling oars and herding sheep together forges a bond stronger than blood-kinship.',
        effects: {
          addFlags: ['fostered_youth'],
          spawnSwornSibling: true,
          stats: { charisma: 6, honor: 5, happiness: 5 },
          skills: { seamanship: 4, farming: 4 },
        },
      },
      {
        id: 'study_law_scrolls',
        label: 'Shadow your foster-father whenever disputes come before the local Thing',
        outcomeText: 'Sitting quietly behind the turf benches, you learn how clever phrasing wins boundary suits.',
        effects: {
          addFlags: ['fostered_youth'],
          stats: { cunning: 7 },
          skills: { law: 9, diplomacy: 4 },
        },
      },
    ],
  },
  {
    id: 'child_003_wolf_winter',
    title: 'Grey Shapes Beyond the Sheepfold',
    category: 'Childhood',
    ageMin: 9,
    ageMax: 15,
    weight: 7,
    text: 'Starving winter wolves dig beneath the turf wall of the lambing pen while the older men are away cutting bog-birch.',
    choices: [
      {
        id: 'take_boar_spear',
        label: 'Brace a heavy iron boar-spear in the doorway with a blazing pine brand',
        outcomeText: 'Singed fur and a sharp thrust drive the lead she-wolf snarling back into the birchwood! Every ewe is saved.',
        effects: { foodStores: 8, stats: { honor: 8, strength: 5 }, addTraits: ['brave'], skills: { combat: 6 } },
        injuryChance: 0.12,
        injuryTraitId: 'battle_scarred',
      },
      {
        id: 'bar_shutter_horn',
        label: 'Drop the oak bar and blow the ox-horn to summon neighbors',
        outcomeText: 'Two lambs are lost before ski-borne farmhands arrive, but nobody’s throat is torn.',
        effects: { foodStores: -3, stats: { cunning: 5, happiness: 2 } },
      },
    ],
  },
  {
    id: 'child_004_coming_of_age',
    title: 'Taking Iron at Fifteen Winters',
    category: 'Childhood',
    provenance: 'Social History',
    ageMin: 15,
    ageMax: 16,
    blockedByFlags: ['came_of_age'],
    weight: 40,
    text: 'Fifteen winters have passed over your head — legal adulthood under northern law. Before the hearth-fire, an elder places a pattern-welded spear or household ring-keys before you.',
    choices: [
      {
        id: 'claim_war_spear',
        label: 'Lift the ash-spear and swear to win silver and undying fame',
        outcomeText: 'Cheers echo from the rafters! You are reckoned full-grown in shield-wall and ship-bench.',
        effects: {
          addFlags: ['came_of_age'],
          fame: 10,
          stats: { honor: 8, strength: 4 },
          skills: { combat: 6, seamanship: 4 },
        },
      },
      {
        id: 'claim_silver_scale',
        label: 'Choose the bronze folding balance-scale and oath-ring of trade and law',
        outcomeText: 'Wise elders nod approvingly: swords rust in cairns, whereas shrewd judgment builds enduring estates.',
        effects: {
          addFlags: ['came_of_age'],
          silver: 18,
          stats: { cunning: 6, charisma: 5 },
          skills: { trade: 7, law: 6 },
        },
      },
    ],
  },

  // ==========================================
  // THRALLDOM & HIDDEN PAST
  // ==========================================
  {
    id: 'thrall_001_manumission_chance',
    title: 'Sparks in the Master’s Granary',
    category: 'Farm Life',
    classes: [SocialClass.Thrall],
    ageMin: 14,
    weight: 18,
    text: 'At midnight an overturned tallow lamp sets dry barley sheaves smoldering inside your master’s timber storehouse while everyone sleeps drunkenly after harvest.',
    choices: [
      {
        id: 'haul_water_save_grain',
        label: 'Wake the yard and beat out the flames with wet hides',
        outcomeText: 'Hands blistered black, you save the winter barley! Grateful before the district, the bonde strikes the iron collar from your neck and declares you a freedman (leysingi).',
        effects: {
          newTitle: TitleRank.Freeman,
          silver: 15,
          fame: 15,
          stats: { honor: 15, happiness: 18, health: -5 },
        },
      },
      {
        id: 'steal_silver_flee',
        label: 'Pry open the master’s silver chest in the smoke and slip aboard a departing knarr',
        outcomeText: 'By dawn Hedeby’s roofs vanish astern and nobody in the new port knows you ever wore unfree homespun!',
        effects: {
          newTitle: TitleRank.Freeman,
          silver: 42,
          moveToSettlementId: 'birka',
          stats: { cunning: 10, happiness: 14, honor: -4 },
          skills: { seamanship: 5, trade: 4 },
        },
      },
    ],
  },
  {
    id: 'thrall_002_hidden_brooch',
    title: 'The Westfold Rune-Brooch Recognized',
    category: 'Family',
    isSemiLegendary: true,
    requiredFlags: ['hidden_noble_brooch'],
    blockedByFlags: ['brooch_revealed'],
    ageMin: 17,
    weight: 22,
    text: 'A grey-cloaked Norwegian merchant stops dead beside the market well, staring at the niello-inlaid silver brooch pinned inside your cloak. "That raven-knot belonged to Hersir Ingvar of Kaupang," he whispers.',
    choices: [
      {
        id: 'claim_birthright',
        label: 'Declare your true parentage before witnesses and sail north to claim your kin-land',
        outcomeText: 'Old retainers weep upon recognizing your mother’s eyes! An ancestral farmstead at Kaupang and thirty ounces of silver are restored to your hand.',
        effects: {
          removeFlags: ['hidden_noble_brooch'],
          addFlags: ['brooch_revealed'],
          newTitle: TitleRank.Bonde,
          landFarms: 2,
          silver: 45,
          fame: 35,
          moveToSettlementId: 'kaupang',
          stats: { honor: 16, happiness: 15 },
        },
      },
      {
        id: 'blackmail_usurper',
        label: 'Sell silence to the cousin currently sitting on your father’s farm',
        outcomeText: 'Terrified of a Thing lawsuit, your cousin sends a heavy pouch of Arabic dirhams to keep you quiet.',
        effects: {
          removeFlags: ['hidden_noble_brooch'],
          addFlags: ['brooch_revealed'],
          newTitle: TitleRank.Freeman,
          silver: 95,
          stats: { cunning: 10, honor: -5 },
        },
      },
    ],
  },

  // ==========================================
  // BLOOD FEUDS & LAW AT THE THING (Chained!)
  // ==========================================
  {
    id: 'feud_001_slight_at_feast',
    title: 'A Slight Over the Ale-Horn',
    category: 'Blood Feud',
    ageMin: 16,
    blockedByFlags: ['feud_neighbor_active'],
    weight: 9,
    text: 'At the autumn yule-brewing feast, a neighbor’s arrogant son, Halldor Crow-Nose, loud-mouths across the trestle benches that your family waters its ale and hides behind women’s skirts when oars are manned.',
    choices: [
      {
        id: 'holmgang_challenge',
        label: 'Challenge Halldor to holmgang on the river-holm at dawn',
        outcomeText: 'Within the hazel-staked square, your blade splits his linden shield and draws first blood! Halldor pays three marks silver to ransom his life — yet his kinsmen glare with cold hatred.',
        effects: {
          silver: 24,
          fame: 18,
          addFlags: ['feud_neighbor_active'],
          spawnRival: { name: 'Halldor Crow-Nose', role: 'Blood-Feud Enemy' },
          stats: { honor: 12, health: -8 },
          skills: { combat: 6 },
        },
        deathChance: 0.04,
        deathReason: 'Bled out on the hazel-staked holmgang islet after an unlucky blow.',
        chain: { eventId: 'feud_002_ambush_at_ford', delayYears: 2 },
      },
      {
        id: 'summon_to_thing',
        label: 'Call witnesses to the slander (níð) and summon him to the Spring Thing',
        outcomeText: 'Your cool composure impresses the lawspeaker; Halldor is fined twelve ounces of hacksilver for unlawful tongue-slaying.',
        effects: {
          silver: 12,
          stats: { honor: 5, cunning: 4 },
          skills: { law: 7 },
        },
      },
      {
        id: 'swallow_insult',
        label: 'Stare into your trencher and swallow the mockery',
        outcomeText: 'Laughter ripples down the benches. You keep whole skin, yet skalds whisper your courage has gone cold.',
        effects: {
          stats: { honor: -12, happiness: -9 },
        },
      },
    ],
  },
  {
    id: 'feud_002_ambush_at_ford',
    title: 'Six Spears at the Birch Ford',
    category: 'Blood Feud',
    requiredFlags: ['feud_neighbor_active'],
    ageMin: 16,
    weight: 30,
    text: 'Riding home from the sheep-fold in autumn drizzle, crow-calls warn you a heartbeat before Halldor’s kinsmen rise from behind wet boulders with levelled spears! The blood-feud has ripened.',
    mildText: 'Riding home from the sheep-fold in autumn drizzle, Halldor’s kinsmen step from behind wet boulders to block the ford and settle old scores!',
    choices: [
      {
        id: 'stand_back_to_oak',
        label: 'Set your back to a twisted oak and hew with two-handed fury',
        outcomeText: 'Two ambushers drop in the heather before the rest scatter! You bind a gash across your ribs and swear their hall will answer for this.',
        mildOutcomeText: 'Your fierce guard drives the ambushers back across the stream! Bruised but standing tall, you vow their household will answer at the Thing.',
        effects: {
          fame: 28,
          stats: { honor: 14, health: -14, strength: 4 },
          skills: { combat: 8 },
        },
        injuryChance: 0.22,
        injuryTraitId: 'battle_scarred',
        deathChance: 0.07,
        deathReason: 'Slain six-to-one in a blood-feud ambush at the birch ford.',
        chain: { eventId: 'feud_003_thing_or_fire', delayYears: 1 },
      },
      {
        id: 'cut_girth_escape',
        label: 'Slash a pack-pony loose to block the narrow path and ride for your hird',
        outcomeText: 'Arrows rattle off your saddle-cantle as you gallop clear, returning an hour later with twenty armed householders.',
        effects: {
          stats: { cunning: 7, health: -4 },
        },
        chain: { eventId: 'feud_003_thing_or_fire', delayYears: 1 },
      },
    ],
  },
  {
    id: 'feud_003_thing_or_fire',
    title: 'Reckoning of the Blood Feud',
    category: 'Blood Feud',
    requiredFlags: ['feud_neighbor_active'],
    ageMin: 16,
    weight: 35,
    text: 'District goðar warn that another killing will split the valley. Yet tonight a dry east wind blows straight toward your enemy’s timber hall — the grim saga temptation of a hall-burning (brenna).',
    mildText: 'District lawmen warn that continued strife will divide the valley. The time has come to settle your feud with Halldor once and for all.',
    choices: [
      {
        id: 'arbitrate_wergild',
        label: 'Accept honorable arbitration at the Thing for full wergild and outlawry of the ambushers',
        outcomeText: 'Heavy silver rings clink onto the ox-hide cloak and your enemies are sentenced to three-year lesser outlawry (fjörbaugsgarðr). Peace returns with honor intact.',
        effects: {
          removeFlags: ['feud_neighbor_active'],
          silver: 55,
          fame: 20,
          stability: 10,
          stats: { honor: 10, happiness: 8 },
          skills: { law: 8, diplomacy: 6 },
        },
      },
      {
        id: 'surround_hall',
        label: 'Surround his steading at dawn and demand his farmstead at sword-point',
        mildLabel: 'Besiege his steading until his household surrenders its land-charter',
        outcomeText: 'Smoke curls under the eaves before Halldor throws out his weapons and yields his fertile meadowland to save his household. Neighbours fear your name — though stern lawmen frown.',
        mildOutcomeText: 'Outnumbered at dawn, Halldor yields his fertile meadowland charter to end the dispute. Neighbours respect your strength — though stern lawmen frown.',
        effects: {
          removeFlags: ['feud_neighbor_active'],
          landFarms: 1,
          silver: 30,
          fame: 25,
          stats: { honor: -4, strength: 4 },
          skills: { combat: 5 },
        },
      },
    ],
  },
  {
    id: 'thing_001_drift_whale',
    title: 'Dispute Over a Stranded Fin-Whale',
    category: 'Law & the Thing',
    provenance: 'Social History',
    regions: ['Norway', 'North Atlantic', 'British Isles'],
    ageMin: 16,
    weight: 8,
    text: 'A sixty-foot fin-whale washes ashore on the boundary-shingle between two farms during lean late winter — enough blubber, meat, and whalebone plaques to feed fifty mouths and enrich a household!',
    choices: [
      {
        id: 'cite_foreshore_law',
        label: 'Measure high-water mark before witnesses according to driftage law (rekaréttur)',
        outcomeText: 'Your iron harpoon-mark and exact knowledge of foreshore law win two-thirds of the whale without a single broken skull!',
        effects: {
          foodStores: 35,
          silver: 22,
          stats: { cunning: 5, honor: 6, happiness: 6 },
          skills: { law: 7 },
        },
      },
      {
        id: 'share_generously',
        label: 'Divide the whale meat freely among hungry cottagers across the fjord',
        outcomeText: 'Lean families bless your hall-hearth; four grateful young spear-men ask to join your household bench.',
        effects: {
          foodStores: 15,
          hirdWarriors: 4,
          fame: 15,
          stats: { charisma: 8, honor: 9, happiness: 8 },
        },
      },
      {
        id: 'seize_whole_carcass',
        label: 'March down with axes and haul every strip of blubber to your own smokehouse',
        outcomeText: 'Your larders groan with whale oil and salted meat, though your neighbor curses you bitterly at the Thing.',
        effects: {
          foodStores: 50,
          silver: 30,
          spawnRival: { role: 'Rival' },
          stats: { honor: -8 },
        },
      },
    ],
  },
  {
    id: 'thing_002_outlaw_plea',
    title: 'A Wood-Going Outlaw at Your Door',
    category: 'Law & the Thing',
    ageMin: 16,
    weight: 7,
    text: 'Sleet hammers the shutters when a gaunt warrior in wolfskin knocks with reversed spear — sentenced to skóggangr (full outlawry) for killing an overbearing royal bailiff. Harboring him risks a fine; taking him in adds a deadly blade.',
    choices: [
      {
        id: 'shelter_in_hird',
        label: 'Give him dry wool, bread, and a bench in your hird',
        outcomeText: 'Grim gratitude burns in his eyes. He becomes your fiercest shield-companion, though local magistrates fine you ten ounces of silver.',
        effects: {
          silver: -10,
          hirdWarriors: 2,
          stats: { honor: 5, charisma: 4 },
          skills: { combat: 6 },
        },
      },
      {
        id: 'smuggle_aboard_ship',
        label: 'Slip him passage out to Dublin for five ounces of silver from his kin',
        outcomeText: 'Your boatmen row him past the headland before dawn; his grateful sister pays discreetly in cut silver.',
        effects: {
          silver: 16,
          stats: { cunning: 6 },
          skills: { seamanship: 4, diplomacy: 4 },
        },
      },
      {
        id: 'turn_away_law',
        label: 'Bar the oak door and uphold the judgment of the Thing',
        outcomeText: 'The lawspeaker praises your strict respect for district peace as the outlaw vanishes into the snow.',
        effects: {
          stability: 5,
          stats: { honor: 3, happiness: -3 },
          skills: { law: 5 },
        },
      },
    ],
  },

  // ==========================================
  // FARM LIFE, MEDIEVAL WARM PERIOD & SETTLEMENT
  // ==========================================
  {
    id: 'farm_001_warm_summer_harvest',
    title: 'Golden Barley in the Northern Sun',
    category: 'Farm Life',
    yearRange: [950, 1066],
    ageMin: 16,
    weight: 8,
    text: 'Mild winds of the warming decades bring an unusually frost-free summer; even high hillside strips ripen thick ears of six-row barley while mountain shielings overflow with butter and skyr.',
    choices: [
      {
        id: 'brew_great_feast',
        label: 'Malted barley into strong ale and host an autumn harvest feast',
        outcomeText: 'Horns pass around your roaring hearth for three nights, drawing loyal retainers and praise across the shire.',
        effects: {
          foodStores: 18,
          fame: 18,
          stability: 8,
          stats: { happiness: 10, charisma: 6, honor: 6 },
        },
      },
      {
        id: 'clear_new_outfield',
        label: 'Invest the surplus to clear birch scrub and enclose new odal pasture',
        outcomeText: 'Stone dykes rise around rich new hay-meadows that will feed your grandchildren.',
        effects: {
          landFarms: 1,
          foodStores: 12,
          stats: { happiness: 5 },
          skills: { farming: 8 },
        },
      },
      {
        id: 'sell_butter_wadmal',
        label: 'Pack butter-firkins and homespun wadmal wool for market silver',
        outcomeText: 'Standardized lengths of water-repellent wadmal cloth fetch brisk hacksilver at the beach market.',
        effects: {
          silver: 38,
          skills: { trade: 6, farming: 4 },
        },
      },
    ],
  },
  {
    id: 'farm_002_late_spring_famine',
    title: 'Sea-Ice and Empty Hay-Barns',
    category: 'Farm Life',
    ageMin: 16,
    weight: 7,
    text: 'April brings stinging sleet instead of grass; cattle bellow weakly in dark stalls while birch-bark is ground into flour along poorer steadings.',
    choices: [
      {
        id: 'open_granary',
        label: 'Open your own grain chests and buy dried cod from northern fishers (20 silver)',
        requiredSilver: 20,
        outcomeText: 'Stockfish and porridge keep every child and thrall alive until green shoots break the mud. Your people revere your stewardship.',
        effects: {
          silver: -20,
          stability: 10,
          fame: 14,
          stats: { honor: 10, happiness: 5 },
        },
      },
      {
        id: 'launch_spring_raid',
        label: 'Push a longship over icy rollers to seize grain and cattle across the sea',
        outcomeText: 'Half-frozen oarsmen fall upon a coastal estate and return low in the water with salted beef and sacks of wheat!',
        effects: {
          foodStores: 35,
          silver: 22,
          fame: 15,
          stats: { honor: 4, health: -6 },
          skills: { seamanship: 5, combat: 5 },
        },
        deathChance: 0.04,
        deathReason: 'Drowned when a freak April squall swamped a famished raiding keel.',
      },
      {
        id: 'ration_strictly',
        label: 'Cull weak livestock and ration meal-chests strictly',
        outcomeText: 'Cheeks hollow and ribs show through wool tunics, yet the household survives the lean moon.',
        effects: {
          foodStores: -15,
          stability: -6,
          stats: { health: -8, happiness: -10 },
        },
      },
    ],
  },
  {
    id: 'farm_003_bog_iron_smelt',
    title: 'Red Ore from the Peat-Bog',
    category: 'Farm Life',
    ageMin: 15,
    weight: 6,
    text: 'Digging drainage ditches through red-stained sedge marsh, farmhands strike heavy nodules of bog-iron ore — prime material for axe-heads, ship-rivets, and ploughshares.',
    choices: [
      {
        id: 'forge_ship_rivets',
        label: 'Build clay bloomery furnaces and forge clinker ship-rivets',
        outcomeText: 'Hundreds of iron roves and nails clink from the anvil, cutting the cost of your fleet repairs and earning fine trade silver.',
        effects: {
          silver: 32,
          skills: { craft: 9, seamanship: 3 },
          stats: { happiness: 4 },
        },
      },
      {
        id: 'arm_the_hird',
        label: 'Hammer broad spears and iron helmet-nasals for your retainers',
        outcomeText: 'Every warrior on your bench now carries keen steel into the shield wall.',
        effects: {
          hirdWarriors: 5,
          fame: 12,
          skills: { craft: 6, combat: 5 },
          stats: { honor: 6 },
        },
      },
    ],
  },

  // ==========================================
  // RAIDING, TRADE & SEA VOYAGES
  // ==========================================
  {
    id: 'sea_001_sunstone_fog',
    title: 'Dead Reckoning in Sea-Fog',
    category: 'Voyage & Sea',
    ageMin: 15,
    weight: 8,
    text: 'Three days out of sight of land, clammy white fog swallows sun and stars alike while Atlantic swells hiss beneath your oak strakes. Oarsmen mutter nervously that Jörmungandr stirs below.',
    choices: [
      {
        id: 'read_swell_birds',
        label: 'Hold steady course by wave-angle, fulmar flight, and Iceland spar crystal',
        outcomeText: 'At noon a pale gleam through the calcite spar confirms true west! When fog lifts, your target headland rises dead ahead off the starboard bow.',
        effects: {
          fame: 16,
          stats: { cunning: 6, wyrd: 6 },
          skills: { seamanship: 10 },
        },
      },
      {
        id: 'release_ravens',
        label: 'Follow Flóki’s ancient trick and loose a caged raven from the mast',
        outcomeText: 'The first raven circles the mast, the second climbs high and arrow-flights toward unseen cliffs! Landfall follows before nightfall.',
        effects: {
          stats: { faith: 5, happiness: 6 },
          skills: { seamanship: 6 },
        },
      },
    ],
  },
  {
    id: 'trade_001_dirham_merchant',
    title: 'Silver Dirhams of Samarkand',
    category: 'Trade',
    ageMin: 16,
    weight: 8,
    text: 'Under an awning at the beach market, a Rus-traveled trader spills hundreds of crisp Kufic silver dirhams stamped in Baghdad and Tashkent, seeking northern marten pelts and Baltic amber.',
    choices: [
      {
        id: 'test_silver_nick',
        label: 'Nick every third coin with your knife-tip to test for lead cores before weighing',
        outcomeText: 'Catching four copper-cored counterfeits red-handed, you force the embarrassed merchant to add twelve pure silver ounces to seal the bargain!',
        effects: {
          silver: 46,
          stats: { cunning: 7, happiness: 5 },
          skills: { trade: 9 },
        },
      },
      {
        id: 'establish_partnership',
        label: 'Swear a recurring trading fellowship (félag) for eastern silk and spices',
        requiredSilver: 25,
        outcomeText: 'Your seal-mark opens regular cargo shipments from Birka and Novgorod, boosting your permanent trade income.',
        effects: {
          silver: 15,
          fame: 15,
          stats: { charisma: 6 },
          skills: { trade: 10, diplomacy: 5 },
          addFlags: ['eastern_trade_felag'],
        },
      },
    ],
  },
  {
    id: 'raid_001_frankish_sword',
    title: 'An +VLFBERHT+ Blade on the Field',
    category: 'Raiding',
    provenance: 'Archaeological Record',
    ageMin: 16,
    weight: 7,
    text: 'Among fallen Frankish horsemen beside a river toll-tower gleams a double-edged crucible-steel sword inlaid with iron letters reading +VLFBERHT+ — flexible enough to bend without snapping, sharp enough to bite chainmail.',
    choices: [
      {
        id: 'keep_ulfberht',
        label: 'Gird the Ulfberht scabbard to your own belt as an heirloom weapon',
        outcomeText: 'Balanced like a hawk’s wing in your grip, the Frankish steel raises your prowess and renown in every hall.',
        effects: {
          fame: 25,
          addFlags: ['owns_ulfberht_sword'],
          stats: { honor: 10, strength: 5 },
          skills: { combat: 10 },
        },
      },
      {
        id: 'gift_to_jarl',
        label: 'Present the prized blade to a powerful regional ruler for land and favor',
        outcomeText: 'Delighted by so princely a gift, the ruler grants you a coastal farmstead and rings of gold-alloyed silver!',
        effects: {
          landFarms: 1,
          silver: 40,
          fame: 18,
          stats: { charisma: 8, cunning: 5 },
          skills: { diplomacy: 9 },
        },
      },
    ],
  },
  {
    id: 'raid_002_ransom_abbot',
    title: 'The Captured Frankish Abbot',
    category: 'Raiding',
    ageMin: 16,
    weight: 7,
    text: 'After storming a river priory, your men drag forth Brother Lupus — tonsured, trembling, yet fluent in three tongues and cousin to a wealthy Carolingian count.',
    choices: [
      {
        id: 'ransom_silver',
        label: 'Treat him honorably at your table while messengers fetch 80 ounces of ransom silver',
        outcomeText: 'Six weeks later a mule-cart arrives clinking with Frankish deniers, and Lupus praises your unexpected courtesy.',
        effects: {
          silver: 80,
          fame: 14,
          stats: { cunning: 6, honor: 5 },
          skills: { diplomacy: 6 },
        },
      },
      {
        id: 'keep_as_scribe',
        label: 'Keep him in your hall to read Latin charters and royal letters',
        outcomeText: 'No southern envoy can trick you with parchment clauses ever again; Lupus even teaches your children Latin.',
        effects: {
          fame: 12,
          stats: { cunning: 10 },
          skills: { diplomacy: 10, law: 6 },
        },
      },
    ],
  },

  // ==========================================
  // RELIGION, SEIDR, OMENS & WYRD
  // ==========================================
  {
    id: 'rel_001_volva_high_seat',
    title: 'The Völva on the High Platform',
    category: 'Mystic & Omens',
    provenance: 'Semi-Legendary Saga Tradition',
    isSemiLegendary: true,
    ageMin: 15,
    weight: 7,
    text: 'Clad in blue cloak set with glass beads, catskin gloves upon her hands and an iron-knobbed staff (seiðstafr), a wandering seeress sits upon the raised platform while women sing the ward-song (varðlokkur). Her pale eyes fix suddenly upon you.',
    choices: [
      {
        id: 'ask_wyrd_prophecy',
        label: 'Step forward with a silver ring and ask what the Norns weave for your line',
        requiredSilver: 5,
        outcomeText: '"Iron crowns your grandchildren if you fear neither salt water nor changed gods," she chants softly. Strange confidence steadies your wyrd.',
        effects: {
          silver: -5,
          fame: 12,
          stats: { wyrd: 14, faith: 6, happiness: 5 },
          skills: { seidr: 6 },
        },
      },
      {
        id: 'learn_seidr_secret',
        label: 'Ask privately after midnight to learn galdr chants and hidden seiðr lore',
        outcomeText: 'She whispers runes of wind-binding and battle-fetter. Beware: among men, practicing seiðr carries whispers of ergi (unmanliness) if exposed, though women völur command awe.',
        effects: {
          stats: { cunning: 6, wyrd: 8, honor: -4 },
          skills: { seidr: 16 },
        },
      },
      {
        id: 'reject_sorcery',
        label: 'Cross your arms or make the hammer-sign: "A warrior trusts his own might and main!"',
        outcomeText: 'Hard-bitten drengir nod approvingly at your self-reliance, though the völva’s cold smile lingers in your dreams.',
        effects: {
          stats: { strength: 4, honor: 8, wyrd: -3 },
        },
      },
    ],
  },
  {
    id: 'rel_002_prime_signing',
    title: 'White Tunics at the Foreign Market',
    category: 'Religion',
    provenance: 'Social History',
    religions: [Religion.NorsePagan],
    ageMin: 16,
    weight: 8,
    text: 'At Dorestad and London, Christian guild-masters refuse to eat or strike silver bargains with unbaptized heathens — unless a bishop marks them with prima signatio (Prime-Signing), permitting trade with Christians while still honoring Thor at sea.',
    choices: [
      {
        id: 'accept_prime_sign',
        label: 'Take the bishop’s cross-mark on your brow to unlock wealthy Christian ports',
        outcomeText: 'Wearing a clean linen band, you trade freely inside walled Christian markets while keeping your silver Thor’s-hammer tucked under your shirt!',
        effects: {
          newReligion: Religion.Syncretic,
          silver: 35,
          stats: { cunning: 6 },
          skills: { trade: 8, diplomacy: 6 },
        },
      },
      {
        id: 'refuse_keep_hammer',
        label: 'Hold up your Mjöllnir pendant proudly and trade only on your own terms',
        outcomeText: 'Southern clerks keep their distance, yet pagan crews flock to sail under a captain who never bends to foreign priests.',
        effects: {
          hirdWarriors: 4,
          stats: { faith: 10, honor: 8 },
        },
      },
    ],
  },
  {
    id: 'rel_003_missionary_monk',
    title: 'The Barefoot Missionary in the Snow',
    category: 'Religion',
    yearRange: [826, 1066],
    ageMin: 16,
    weight: 7,
    text: 'A Saxon priest trained at Hamburg-Bremen asks leave to preach the White Christ in your hall, offering to carry letters of friendship to Christian kings — and daring to walk barefoot over hot iron to prove his God’s power.',
    choices: [
      {
        id: 'baptize_household',
        label: 'Step into the baptismal cask and align your realm with Christian Europe',
        outcomeText: 'Royal courts in England and Francia hail you as a civilized brother-ruler, though grumbling pagan elders mutter that Freyr’s harvests will wither.',
        effects: {
          newReligion: Religion.Christian,
          fame: 22,
          stability: -5,
          stats: { faith: 10, charisma: 5 },
          skills: { diplomacy: 10 },
        },
      },
      {
        id: 'allow_preaching_tolerate',
        label: 'Grant him guest-peace to speak, while keeping your own ancestral rites',
        outcomeText: 'True to northern hospitality (Hávamál), you harm no guest under your roof. Traders of both faiths feel safe in your harbor.',
        effects: {
          silver: 20,
          stability: 5,
          stats: { honor: 6, cunning: 5 },
          skills: { diplomacy: 6 },
        },
      },
      {
        id: 'hold_grand_blot',
        label: 'Send him packing and consecrate a grand Midwinter Blót to Odin, Thor, and Freyr',
        outcomeText: 'Sacred horse-broth steams in bronze cauldrons and evergreen boughs deck the high-seat pillars, uniting traditionalists behind your banner!',
        effects: {
          silver: -15,
          newReligion: Religion.NorsePagan,
          stability: 10,
          fame: 18,
          stats: { faith: 14, honor: 8, happiness: 6 },
        },
      },
    ],
  },

  // ==========================================
  // ROMANCE, MARRIAGE, WOMEN'S RIGHTS & FAMILY
  // ==========================================
  {
    id: 'rom_001_marriage_match',
    title: 'An Honorable Match Across the Fjord',
    category: 'Romance & Marriage',
    provenance: 'Social History',
    ageMin: 17,
    ageMax: 45,
    classes: [SocialClass.Karl, SocialClass.Bonde, SocialClass.HersirKin, SocialClass.JarlKin, SocialClass.Royal],
    weight: 9,
    text: 'Go-betweens propose a marriage alliance with a sharp-witted, prosperous householder from a neighboring valley. Under Norse law, both bride-price (mundr) and dowry (heimanfylgja) remain accounted should either spouse ever declare divorce before witnesses.',
    choices: [
      {
        id: 'celebrate_wedding',
        label: 'Pay generous mundr (20 silver) and drink the bridal-ale (brúðhlaup)',
        requiredSilver: 20,
        outcomeText: 'Keys to the storehouse chests are fastened at the belt, skalds chant blessings of Vár and Freyja, and two strong kin-groups unite!',
        effects: {
          silver: -20,
          landFarms: 1,
          marryRandom: true,
          fame: 15,
          stats: { happiness: 14, honor: 8, charisma: 4 },
        },
      },
      {
        id: 'modest_betrothal',
        label: 'Negotiate a thrifty contract with modest silver outlay',
        outcomeText: 'A practical match is sealed over salted salmon and barley-ale, bringing steady hands to manage the estate.',
        effects: {
          marryRandom: true,
          foodStores: 15,
          stats: { happiness: 8, cunning: 4 },
        },
      },
      {
        id: 'decline_match',
        label: 'Decline politely — your heart or ambition looks elsewhere',
        outcomeText: 'The go-betweens ride home without offense, leaving your hand free for higher politics.',
        effects: {
          stats: { cunning: 2 },
        },
      },
    ],
  },
  {
    id: 'rom_002_estate_stewardship_woman',
    title: 'Keys of the Homestead (Húsfreyja’s Rule)',
    category: 'Family',
    provenance: 'Social History',
    sex: Sex.Female,
    ageMin: 18,
    weight: 9,
    text: 'With ships away all summer, iron bunch-keys at your girdle mark complete legal authority within the threshold. Neighbouring merchants try to underpay for your estate’s wadmal wool, assuming a woman’s hall lacks teeth.',
    choices: [
      {
        id: 'enforce_weights',
        label: 'Summon armed farmhands, check the silver weights yourself, and charge late-toll',
        outcomeText: 'Blushing furiously, the traders pay full ounce-weight plus wharf-fee. Across the district your hall is respected as iron-run.',
        effects: {
          silver: 36,
          fame: 16,
          stats: { honor: 10, cunning: 6, happiness: 6 },
          skills: { trade: 8, law: 5 },
        },
      },
      {
        id: 'take_shield_birka',
        label: 'Strap on mail and helm to lead the estate’s keel personally next season',
        outcomeText: 'Though elders debate whether women belong in shield-walls — like the high-status warrior grave BJ 581 at Birka — none dare question your command once your crew brings home silver.',
        effects: {
          fame: 28,
          silver: 30,
          addTraits: ['shieldmaiden_renown'],
          stats: { honor: 12, strength: 6 },
          skills: { combat: 10, seamanship: 5 },
        },
      },
    ],
  },
  {
    id: 'fam_001_child_prodigy',
    title: 'Bright Eyes Beside the Hearth',
    category: 'Family',
    ageMin: 22,
    weight: 7,
    text: 'One of your young household kin amazes winter guests by solving a tricky Hnefatafl king-escape in four moves against your oldest veteran.',
    choices: [
      {
        id: 'teach_hnefatafl_tactics',
        label: 'Carve them a whalebone Hnefatafl board and teach flanking strategy',
        outcomeText: 'Playing nightly beside the embers sharpens your own tactical cunning as well as your heir’s promise.',
        effects: {
          stats: { cunning: 6, happiness: 8 },
          skills: { combat: 4, diplomacy: 4 },
        },
      },
      {
        id: 'hire_skald_tutor',
        label: 'Gift an Icelandic skald ten ounces of silver to teach court poetry and history',
        requiredSilver: 10,
        outcomeText: 'Your hall gains a reputation for wisdom as well as sharp iron.',
        effects: {
          silver: -10,
          fame: 18,
          stats: { honor: 6, happiness: 6 },
          skills: { skaldcraft: 7, law: 5 },
        },
      },
    ],
  },

  // ==========================================
  // POLITICS, KINGS, SKALDS & BETRAYAL
  // ==========================================
  {
    id: 'pol_001_head_ransom_poem',
    title: 'Head-Ransom Before an Angry Ruler (Höfuðlausn)',
    category: 'Politics & Kings',
    provenance: 'Semi-Legendary Saga Tradition',
    isSemiLegendary: true,
    ageMin: 18,
    weight: 6,
    text: 'Driven ashore by foul weather in a rival ruler’s territory, you are dragged into his crowded hall at dusk! His advisors urge your execution by morning — unless you can sway the benches.',
    choices: [
      {
        id: 'compose_drapa',
        label: 'Stay awake all night composing a twenty-stanza praise-poem (drápa) for his honor',
        outcomeText: 'Like Egil Skallagrímsson at York, your thunderous rhymes leave the hall spellbound! To execute you now would shame the ruler forever — he grants you your own head back.',
        effects: {
          fame: 35,
          stats: { charisma: 8, honor: 12, wyrd: 6 },
          skills: { skaldcraft: 12, diplomacy: 6 },
        },
      },
      {
        id: 'bribe_guard_silver',
        label: 'Slip twenty-five ounces of silver to the door-ward and steal a skiff at midnight',
        requiredSilver: 25,
        outcomeText: 'Muffled oars carry you past the harbor boom before cockcrow!',
        effects: {
          silver: -25,
          stats: { cunning: 8 },
          skills: { seamanship: 6 },
        },
      },
      {
        id: 'break_out_axe',
        label: 'Snatch a bench-board and fight your way through the smoke-hole door!',
        outcomeText: 'Overturning mead-vats into the hearth to blind pursuit, you burst bleeding into the night and swim out to a fishing boat!',
        effects: {
          fame: 30,
          stats: { strength: 6, health: -16, honor: 8 },
          skills: { combat: 8 },
        },
        injuryChance: 0.25,
        injuryTraitId: 'limping',
        deathChance: 0.08,
        deathReason: 'Cut down by royal housecarls while fighting out of a rival’s mead-hall.',
      },
    ],
  },
  {
    id: 'pol_002_varangian_call',
    title: 'Gold Solidii of Miklagarðr (Constantinople)',
    category: 'Politics & Kings',
    provenance: 'Archaeological Record',
    yearRange: [988, 1066],
    ageMin: 18,
    ageMax: 42,
    weight: 7,
    text: 'Veterans returning up the Dnieper river-road display heavy silk cloaks and Byzantine gold nomismata earned serving the Emperor in Miklagarðr’s elite axe-bearing Varangian Guard.',
    choices: [
      {
        id: 'send_expedition_east',
        label: 'Invest 30 silver to outfit a sworn kinsman’s company down the Eastern Way (Austrvegr)',
        requiredSilver: 30,
        outcomeText: 'Seasons later, runestones need not mourn him — chests of Greek gold and purple silk return to double your investment!',
        effects: {
          silver: 95,
          fame: 28,
          stats: { happiness: 8, cunning: 4 },
          skills: { trade: 6 },
        },
      },
      {
        id: 'recruit_veteran_captain',
        label: 'Hire a scarred Varangian drill-leader to train your personal hird (20 silver)',
        requiredSilver: 20,
        outcomeText: 'Eastern shield-wall discipline sharpens your warriors into the terror of the coast.',
        effects: {
          silver: -20,
          hirdWarriors: 8,
          fame: 18,
          skills: { combat: 9 },
          stats: { honor: 6 },
        },
      },
      {
        id: 'keep_eyes_west',
        label: 'Let others chase southern mirages; northern seas hold enough silver',
        outcomeText: 'Your crews stay close to home harbors, preserving manpower for your own realm.',
        effects: {
          stability: 5,
        },
      },
    ],
  },
  {
    id: 'bet_001_mutiny_over_loot',
    title: 'Grumbling at the Loot-Stake',
    category: 'Betrayal',
    ageMin: 18,
    minTitleRankIndex: 3, // Hersir+
    weight: 7,
    text: 'Around the division-pole where plunder is shared by lot, a scarred steersman named Ketil Flat-Foot accuses you of holding back a gilded chalice from the common heap.',
    choices: [
      {
        id: 'throw_ring_generous',
        label: 'Hack a heavy gold-silver arm-ring in two on your axe-blade and toss it into the pile',
        requiredSilver: 15,
        outcomeText: '"Ring-breaker!" roar the oarsmen in admiration! Ketil’s mutiny collapses in shame as loyalty surges.',
        effects: {
          silver: -15,
          stability: 14,
          fame: 20,
          stats: { charisma: 8, honor: 10 },
        },
      },
      {
        id: 'strike_mutineer',
        label: 'Challenge Ketil on the spot to prove his lie with iron',
        outcomeText: 'Three swift blows disarm Ketil into the surf. None question your share again, though sullen whispers linger.',
        effects: {
          stability: 4,
          fame: 14,
          stats: { honor: 6, health: -6 },
          skills: { combat: 6 },
        },
      },
    ],
  },

  // ==========================================
  // ILLNESS, SCARS & ELDER YEARS
  // ==========================================
  {
    id: 'ill_001_winter_lung_fever',
    title: 'Rattle in the Chest (Winter Sickness)',
    category: 'Illness & Death',
    ageMin: 12,
    weight: 7,
    text: 'Peat-smoke and freezing rain bring a burning fever that leaves sweat beading on your brow upon the box-bed.',
    choices: [
      {
        id: 'leech_woman_herbs',
        label: 'Drink bitter angelica-root, yarrow, and warm honey-mead prepared by a healer (8 silver)',
        requiredSilver: 8,
        outcomeText: 'After three delirious nights the fever breaks cleanly, leaving you weak but whole.',
        effects: {
          silver: -8,
          stats: { health: 6, happiness: 4 },
        },
      },
      {
        id: 'carve_healing_runes',
        label: 'Have birch-bark carved with healing runes slipped beneath your bolster and tough it out',
        outcomeText: 'Your iron constitution wrestles the sickness down, though the cough lingers until spring.',
        effects: {
          stats: { health: -8, faith: 5, wyrd: 4 },
        },
        deathChance: 0.04,
        deathReason: 'Succumbed to winter lung-fever beside the smoky turf hearth.',
      },
    ],
  },
  {
    id: 'ill_002_infected_arrow_wound',
    title: 'Onion-Soup Test on a Deep Wound',
    category: 'Illness & Death',
    provenance: 'Semi-Legendary Saga Tradition',
    ageMin: 16,
    weight: 5,
    text: 'After a skirmish, an iron barb festers near your side. Following battlefield custom known from northern leechcraft, the healer feeds you boiled leek-and-onion broth and sniffs the dressing to tell if the gut is pierced.',
    choices: [
      {
        id: 'draw_iron_tongs',
        label: 'Bite an oak stick while the healer draws the iron head with red-hot tongs',
        outcomeText: 'No smell of leek escapes the wound — the gut is whole! Hot pitch seals the flesh, leaving a grim scar and hard-won survival.',
        effects: {
          addTraits: ['battle_scarred'],
          stats: { health: -6, honor: 8, strength: 2 },
        },
        deathChance: 0.05,
        deathReason: 'Died of blood-poisoning three days after an iron arrow-barb was drawn.',
      },
      {
        id: 'rest_quietly_monastery',
        label: 'Pay quiet silver at a monastic infirmary for clean linen and rest (15 silver)',
        requiredSilver: 15,
        outcomeText: 'Clean spring-water washes and quiet rest knit your side with minimal lasting harm.',
        effects: {
          silver: -15,
          stats: { health: 4 },
        },
      },
    ],
  },
  {
    id: 'elder_001_runestone_legacy',
    title: 'Raising a Carved Runestone',
    category: 'Family',
    provenance: 'Archaeological Record',
    ageMin: 42,
    weight: 9,
    text: 'Silver threads streak your hair and young warriors ask for tales of older kings. A master rune-carver offers to raise and paint a granite memorial stone beside the bridge or Thing-road in honor of your kin and deeds.',
    choices: [
      {
        id: 'commission_grand_stone',
        label: 'Pay 35 silver for a tall dragon-interlace stone painted in bright red ochre',
        requiredSilver: 35,
        outcomeText: 'Passersby for a thousand years will read the Younger Futhark band proclaiming that you built bridges, sailed wide seas, and fed eagles!',
        effects: {
          silver: -35,
          fame: 55,
          stats: { honor: 14, happiness: 12, wyrd: 6 },
        },
      },
      {
        id: 'carve_modest_boulder',
        label: 'Carve the runes with your own chisel upon a glacier-smoothed headland boulder',
        outcomeText: 'Deep, honest strokes in grey stone preserve your family’s names above the surf.',
        effects: {
          fame: 22,
          stats: { honor: 8, happiness: 6 },
          skills: { craft: 6 },
        },
      },
    ],
  },
  {
    id: 'elder_002_silver_hoard_burial',
    title: 'Burying a Hacksilver Hoard',
    category: 'Trade',
    provenance: 'Archaeological Record',
    ageMin: 35,
    weight: 6,
    text: 'Like thousands of Viking Age silver hoards unearthed in Gotland, Galloway, and Cuerdale, uncertain times tempt you to bury a lead-lined chest of arm-rings and coins beneath an oak root.',
    choices: [
      {
        id: 'share_secret_with_heir',
        label: 'Show your chosen heir the exact stone-landmarks so the dynasty never loses it',
        outcomeText: 'Your family’s emergency war-chest rests safe from fire or sudden raid, ready for the next generation.',
        effects: {
          stability: 8,
          stats: { cunning: 6, happiness: 6 },
        },
      },
      {
        id: 'invest_in_ships_instead',
        label: 'Keep silver working above ground — outfit another trading knarr instead (45 silver)',
        requiredSilver: 45,
        outcomeText: '"Buried silver breeds no interest," you declare, launching a stout pine-planked cargo hull!',
        effects: {
          silver: -45,
          knarrs: 1,
          fame: 15,
          skills: { trade: 6, seamanship: 4 },
        },
      },
    ],
  },

  // ==========================================
  // ADDITIONAL FLAVOR & REGIONAL SAGA EVENTS
  // ==========================================
  {
    id: 'reg_ireland_slave_ransom',
    title: 'Captives on the Dublin Wharf',
    category: 'Trade',
    provenance: 'Annals of Ulster',
    regions: ['Ireland', 'British Isles'],
    ageMin: 16,
    weight: 7,
    text: 'Along Dyflinn’s timber quay, Hiberno-Norse factors haggle with Gaelic princes coming down from Meath to ransom highborn captives taken in border raids.',
    choices: [
      {
        id: 'broker_gaelic_ransom',
        label: 'Act as neutral surety between a Leinster abbot and the ship-captains',
        outcomeText: 'Honest brokerage earns ten ounces of commission silver and warm welcome at Irish inland fairs.',
        effects: {
          silver: 28,
          stats: { charisma: 6, honor: 6 },
          skills: { diplomacy: 8, trade: 5 },
        },
      },
      {
        id: 'free_skilled_weaver',
        label: 'Purchase and free a skilled Irish metalworker to join your household craft-shop (18 silver)',
        requiredSilver: 18,
        outcomeText: 'Grateful for free wages, the artisan crafts exquisite ringed pins and silver brooches in Hiberno-Norse style.',
        effects: {
          silver: -18,
          fame: 16,
          stats: { honor: 8, happiness: 6 },
          skills: { craft: 11, trade: 5 },
        },
      },
    ],
  },
  {
    id: 'reg_scand_ski_hunt',
    title: 'Birch-Bark Skis on the Winter Fell',
    category: 'Farm Life',
    regions: ['Norway', 'Sweden'],
    ageMin: 14,
    weight: 7,
    text: 'Crisp powder blankets the high mountain birch-line where wild reindeer herds paw for lichen — and Sámi fur-hunters camp with sledges piled high with white arctic fox and ermine.',
    choices: [
      {
        id: 'barter_iron_for_furs',
        label: 'Trade iron axe-heads and salt fairly with Sámi hunters for prime winter pelts',
        outcomeText: 'Mutual respect yields glossy pelts that fetch triple weight at Hedeby and Birka!',
        effects: {
          silver: 42,
          stats: { cunning: 5, honor: 5 },
          skills: { trade: 8 },
        },
      },
      {
        id: 'stalk_reindeer_bow',
        label: 'Glide on pine-tarred skis with yew-bow to fill your hall’s meat-racks',
        outcomeText: 'Clean arrow-shots bring down two fat stags, ensuring hearty stews until spring thaw.',
        effects: {
          foodStores: 26,
          stats: { health: 5, strength: 4, happiness: 6 },
          skills: { combat: 5 },
        },
      },
    ],
  },
  {
    id: 'reg_atlantic_walrus_hunt',
    title: 'Tusks of White Gold on the Skerries',
    category: 'Voyage & Sea',
    provenance: 'Archaeological Record',
    regions: ['North Atlantic', 'Norway'],
    ageMin: 16,
    weight: 8,
    text: 'Hundreds of bull walruses haul out upon surf-washed basalt skerries — their dense ivory tusks coveted from London to Cologne, and their thick hide-ropes prized above hemp for ship rigging!',
    choices: [
      {
        id: 'harpoon_herd_carefully',
        label: 'Land leeward with heavy lances for tusks and spiral-cut ship-ropes',
        outcomeText: 'Hard, dangerous work on slick rock fills two barrels with ivory tusks and tough walrus-hide hawsers.',
        effects: {
          silver: 52,
          fame: 14,
          stats: { strength: 5, health: -4 },
          skills: { seamanship: 6, trade: 6 },
        },
        injuryChance: 0.14,
        injuryTraitId: 'frost_bitten',
      },
      {
        id: 'capture_polar_bear_cub',
        label: 'Net a live white ice-bear on the drift-floe as a royal gift (Auðun’s gambit!)',
        outcomeText: 'Feeding a live white bear nearly empties your larder, yet a Danish king rewards so astonishing a marvel with a ship, silver, and a gold arm-ring!',
        effects: {
          foodStores: -15,
          silver: 85,
          knarrs: 1,
          fame: 45,
          stats: { wyrd: 10, charisma: 8 },
          skills: { diplomacy: 10 },
        },
      },
    ],
  },
  {
    id: 'war_001_sworn_brother_earth',
    title: 'Passing Under the Raised Turf-Arch',
    category: 'Family',
    provenance: 'Semi-Legendary Saga Tradition',
    ageMin: 16,
    blockedByFlags: ['sworn_turf_oath'],
    weight: 7,
    text: 'Your closest shield-companion proposes the ancient rite of fóstbræðralag: cutting three long strips of sod left attached at the ends, propping them up on an inlaid spear, and mingling blood in the dark earth beneath while swearing to avenge whichever falls first.',
    choices: [
      {
        id: 'swear_under_turf',
        label: 'Cut your palm beneath the raised turf-strip and swear eternal kinship',
        outcomeText: 'Gods and men witness the oath. You gain an unbreakable sworn sibling who stands beside your shield in every storm.',
        effects: {
          addFlags: ['sworn_turf_oath'],
          spawnSwornSibling: true,
          fame: 16,
          stats: { honor: 12, happiness: 10, wyrd: 4 },
        },
      },
      {
        id: 'exchange_cloaks_only',
        label: 'Exchange silver-pinned cloaks in friendship without binding your wyrd to vengeance',
        outcomeText: 'Warm comradeship remains without obligating you to inherit every feud he stirs up.',
        effects: {
          stats: { cunning: 5, happiness: 5 },
          skills: { diplomacy: 4 },
        },
      },
    ],
  },
  {
    id: 'war_002_berserker_duel',
    title: 'A Shield-Biter Demands Tribute',
    category: 'War',
    provenance: 'Semi-Legendary Saga Tradition',
    isSemiLegendary: true,
    ageMin: 17,
    weight: 6,
    text: 'A wandering duelist named Ljot the Pale — howling and gnawing the iron rim of his shield in berserksgangr — lands at a neighboring farm, challenging its aging householder to surrender silver or fight on the holm.',
    choices: [
      {
        id: 'step_onto_holm_champion',
        label: 'Take the old farmer’s place on the holmgang hide yourself!',
        outcomeText: 'Side-stepping Ljot’s wild downward cleave so his sword wedges deep in an oak root, you strike clean and end his terror! Grateful neighbors shower you with silver and praise.',
        effects: {
          silver: 48,
          fame: 38,
          stats: { honor: 18, strength: 5, health: -10 },
          skills: { combat: 10 },
        },
        injuryChance: 0.2,
        injuryTraitId: 'battle_scarred',
        deathChance: 0.06,
        deathReason: 'Cloven in holmgang against a wandering berserker.',
      },
      {
        id: 'ambush_with_clubs',
        label: 'Gather twelve men with heavy oak clubs to overwhelm him without giving fair duel',
        outcomeText: 'Blunt oak staves break his fury quickly. The district breathes easier, though sticklers for dueling custom call it unheroic.',
        effects: {
          silver: 22,
          stability: 6,
          stats: { cunning: 8, honor: -3 },
        },
      },
    ],
  },
  {
    id: 'sea_002_knarr_wreckage',
    title: 'Flotsam After an Autumn Gale',
    category: 'Voyage & Sea',
    ageMin: 15,
    weight: 7,
    text: 'Three days of screaming nor’westers leave oak ribs, Rhenish wine-barrels, and half-drowned Frisian sailors clinging to kelp-covered rocks below your headland.',
    choices: [
      {
        id: 'rescue_and_salvage_fair',
        label: 'Haul the chilled Frisians to your fire and take lawful one-third salvage share',
        outcomeText: 'Warmed with hot broth, the grateful Frisian master cedes four casks of fine wine and establishes a trade link with Dorestad!',
        effects: {
          silver: 36,
          fame: 14,
          stats: { honor: 10, happiness: 6 },
          skills: { trade: 7, diplomacy: 5 },
        },
      },
      {
        id: 'strip_cargo_quietly',
        label: 'Haul every barrel and bronze cauldron up the cliff-path before the sheriff’s men ride out',
        outcomeText: 'Your cellars brim with Frankish wine and cloth, though dark rumors follow your beachcombers.',
        effects: {
          silver: 62,
          stats: { honor: -9, cunning: 5 },
        },
      },
    ],
  },
  {
    id: 'myst_002_fetch_dream',
    title: 'Dream of the Fetch-Wolves (Fylgjur)',
    category: 'Mystic & Omens',
    isSemiLegendary: true,
    ageMin: 16,
    weight: 6,
    text: 'Before spring ship-launching, you dream of three grey wolves trotting ahead of a white bear toward your hall-door — traditional northern sign of hostile fylgjur (spirit-fetches) preceding armed guests.',
    choices: [
      {
        id: 'double_night_watch',
        label: 'Heed the dream: post archers on the turf roof and sleep in mail',
        outcomeText: 'Two nights later, prowling raiders find cross-spears waiting in the dark and flee empty-handed!',
        effects: {
          stability: 8,
          fame: 14,
          stats: { wyrd: 8, cunning: 6 },
          skills: { combat: 4 },
        },
      },
      {
        id: 'laugh_off_dream',
        label: 'Dismiss it as heavy smoked pork and save your men their sleep',
        outcomeText: 'Nothing comes save a stray hill-fox sniffing the midden; your men wake well-rested for spring ploughing.',
        effects: {
          foodStores: 8,
          stats: { happiness: 4 },
        },
      },
    ],
  },
  {
    id: 'pol_003_danegeld_tax_squeeze',
    title: 'Royal Tax-Reeves in the Fjord',
    category: 'Politics & Kings',
    ageMin: 18,
    regions: ['Norway', 'Denmark', 'Sweden', 'British Isles'],
    weight: 7,
    text: 'An arrogant royal bailiff beaches a thirty-bench ship in your harbor demanding extra nose-tax and naval leding provisions from every hearth.',
    choices: [
      {
        id: 'pay_and_feast_him',
        label: 'Pay 22 silver smoothly while plying his steersmen with ale to learn court gossip',
        requiredSilver: 22,
        outcomeText: 'Loose tongues reveal which earldoms are falling out of royal favor — priceless intelligence.',
        effects: {
          silver: -22,
          stats: { cunning: 8, charisma: 4 },
          skills: { diplomacy: 8 },
        },
      },
      {
        id: 'cite_ancient_custom',
        label: 'Confront him with armed bondi behind you and cite the customary law-limit',
        outcomeText: 'Counting the bristling spears along the shingle, the bailiff hastily settles for symbolic tribute and rows out on the tide.',
        effects: {
          fame: 20,
          stability: 8,
          stats: { honor: 10 },
          skills: { law: 8, diplomacy: 4 },
        },
      },
    ],
  },
  {
    id: 'craft_001_master_shipwright',
    title: 'The Curved Oak Stem-Post',
    category: 'Voyage & Sea',
    provenance: 'Archaeological Record',
    ageMin: 18,
    weight: 6,
    text: 'An aged shipwright from Roskilde discovers a naturally curved bog-seasoned oak trunk ideal for the stem-post of a swift, radial-split clinker warship.',
    choices: [
      {
        id: 'commission_sleek_langskip',
        label: 'Fund the master-wright (55 silver) to lay down a supple new longship',
        requiredSilver: 55,
        outcomeText: 'Flexing smoothly over steep waves rather than fighting them, the new keel leaps ahead of every ship in the fjord!',
        effects: {
          silver: -55,
          longships: 1,
          fame: 28,
          stats: { happiness: 10, honor: 8 },
          skills: { seamanship: 8, craft: 6 },
        },
      },
      {
        id: 'carve_dragon_prow',
        label: 'Carve a detachable gilt dragon-head for your flagship prow (remembering to lower it near home land-spirits!)',
        requiredSilver: 18,
        outcomeText: 'Respecting landvættir law at home and striking awe abroad, your prow becomes famous along three coasts.',
        effects: {
          silver: -18,
          fame: 22,
          stats: { honor: 8, faith: 4 },
          skills: { craft: 7 },
        },
      },
    ],
  },
  {
    id: 'fam_002_inheritance_quarrel',
    title: 'Quarrel Over Odal Meadowland',
    category: 'Family',
    provenance: 'Social History',
    ageMin: 20,
    weight: 7,
    text: 'A distant cousin arrives with weathered tally-sticks claiming redemption right (óðalsbrigði) over a hay-meadow cleared by your grandfather.',
    choices: [
      {
        id: 'buy_out_claim',
        label: 'Weigh out 20 ounces of hacksilver before Thing-witnesses to extinguish his claim forever',
        requiredSilver: 20,
        outcomeText: 'Hands clasp across the boundary-stone; your descendants’ title is now unassailable.',
        effects: {
          silver: -20,
          stability: 8,
          stats: { honor: 6, cunning: 4 },
          skills: { law: 6 },
        },
      },
      {
        id: 'out_argue_genealogy',
        label: 'Recite five generations of ancestral line aloud at the Thing to disprove his descent',
        outcomeText: 'When your cousin stumbles over his great-aunt’s patronymic, the judges laugh his suit out of court!',
        effects: {
          fame: 15,
          stats: { cunning: 7, honor: 6 },
          skills: { law: 9, skaldcraft: 4 },
        },
      },
    ],
  },
  {
    id: 'myst_003_aurora_northern_lights',
    title: 'Fire-Bridges Across the Winter Sky',
    category: 'Mystic & Omens',
    ageMin: 12,
    weight: 6,
    text: 'Green and crimson curtains ripple silently above black fjord waters on a frost-still January night while foxes bark on the crusted snow.',
    choices: [
      {
        id: 'compose_winter_lay',
        label: 'Compose a quiet skaldic verse by the doorway and reflect on mortal fame',
        outcomeText: '"Cattle die, kinsmen die, one’s self dies likewise; one thing I know that never dies: judgment on each dead man." Peace settles in your breast.',
        effects: {
          stats: { happiness: 10, wyrd: 6, faith: 5 },
          skills: { skaldcraft: 7 },
        },
      },
      {
        id: 'plan_spring_voyage',
        label: 'Spread oiled sealskin charts beside the hearth and plan bold spring voyages',
        outcomeText: 'By candle-stub light you work out tidal currents and provisioning math for the coming sailing season.',
        effects: {
          stats: { cunning: 6 },
          skills: { seamanship: 7, trade: 4 },
        },
      },
    ],
  },
  {
    id: 'war_003_coastal_beacon_lit',
    title: 'Watch-Beacons Blazing on the Fells!',
    category: 'War',
    ageMin: 16,
    weight: 8,
    text: 'Orange fire-pillars leap from peak to headland along the coast — the war-arrow (herör) passes from farm to farm warning that hostile raiders are rounding the ness!',
    choices: [
      {
        id: 'muster_shield_wall_beach',
        label: 'Lead your household warriors down to the shingle and lock shields at the tide-line!',
        outcomeText: 'Met by overlapping round-shields and hurled spears before their feet leave the surf, the raiders haul off leaving a beached skiff and silver behind!',
        effects: {
          silver: 38,
          fame: 28,
          stability: 8,
          stats: { honor: 14, health: -8 },
          skills: { combat: 9 },
        },
        injuryChance: 0.16,
        injuryTraitId: 'battle_scarred',
        deathChance: 0.04,
        deathReason: 'Fell defending the home shingle beneath blazing coastal watch-beacons.',
      },
      {
        id: 'drive_cattle_inland',
        label: 'Drive livestock and silver chests up to hidden mountain shielings and set an ambush',
        outcomeText: 'Finding empty byres and pelted with sling-stones from the birch crags, the raiders curse and row away.',
        effects: {
          stability: 5,
          stats: { cunning: 8, honor: 3 },
          skills: { combat: 4, farming: 3 },
        },
      },
    ],
  },
  {
    id: 'fam_003_new_child_named',
    title: 'Water-Sprinkling & Naming Rite (Vatni Ausa)',
    category: 'Family',
    provenance: 'Social History',
    ageMin: 19,
    ageMax: 48,
    weight: 8,
    text: 'A newborn cries lustily inside the warm hearth-room! Under northern custom, water is sprinkled upon the infant’s brow and a name-gift (nafngjöf) is bestowed as the child is lifted onto the knee.',
    choices: [
      {
        id: 'name_after_ancestor',
        label: 'Name the child after a famed ancestor with a silver teething-ring (10 silver)',
        requiredSilver: 10,
        outcomeText: 'Believing ancestral hamingja (luck) lives again in the name, the whole hall drinks to your new heir!',
        effects: {
          silver: -10,
          birthChild: true,
          fame: 12,
          stats: { happiness: 14, wyrd: 6 },
        },
      },
      {
        id: 'simple_blessing',
        label: 'Raise the child high toward the hearth-beams with a heartfelt blessing',
        outcomeText: 'Healthy lungs echo off the smoke-vent; your lineage grows stronger by another branch.',
        effects: {
          birthChild: true,
          stats: { happiness: 10 },
        },
      },
    ],
  },
  {
    id: 'rel_004_uppsala_nine_year_blot',
    title: 'The Nine-Year Festival at Gamla Uppsala',
    category: 'Religion',
    provenance: 'Archaeological Record',
    regions: ['Sweden', 'Norway', 'Denmark'],
    religions: [Religion.NorsePagan, Religion.Syncretic],
    ageMin: 16,
    weight: 6,
    text: 'Pilgrims and chieftains stream toward the great royal mounds of Uppsala for the nine-year vernal assembly, where sacred groves echo with chants to Thor of the sky, Odin of battle, and Ingvi-Freyr of peace and plenty.',
    choices: [
      {
        id: 'donate_arm_ring_grove',
        label: 'Offer a heavy silver arm-ring (18 silver) and feast alongside Svear lawspeakers',
        requiredSilver: 18,
        outcomeText: 'Pagan chieftains across Svealand and the Baltic hail your generosity and open their harbors to your ships.',
        effects: {
          silver: -18,
          fame: 26,
          stats: { faith: 12, honor: 8, charisma: 6 },
          skills: { diplomacy: 7 },
        },
      },
      {
        id: 'trade_horses_outside',
        label: 'Set up stalls at the edge of the assembly plain to trade swift riding horses',
        outcomeText: 'Hundreds of gathered nobles pay handsomely for sound mounts and embossed bridles.',
        effects: {
          silver: 36,
          skills: { trade: 7 },
        },
      },
    ],
  },
  {
    id: 'pol_004_skaldic_flyting',
    title: 'Flyting Match Across the Hearth-Fire (Mannjafnaðr)',
    category: 'Politics & Kings',
    ageMin: 16,
    weight: 7,
    text: 'Horns of dark ale loosen tongues until a visiting Icelandic poet challenges you to mannjafnaðr — trading sharp, metered boasts of voyages, battles, and wit without drawing iron under hall-peace.',
    choices: [
      {
        id: 'cap_verse_with_kenning',
        label: 'Match his meter syllable-for-syllable with a biting kenning about wave-steeds',
        outcomeText: 'Roars of laughter shake soot from the rafters! Even the poet grins and gifts you a carved drinking-horn.',
        effects: {
          fame: 18,
          stats: { charisma: 8, honor: 7, happiness: 8 },
          skills: { skaldcraft: 9 },
        },
      },
      {
        id: 'praise_hosts_deeds',
        label: 'Turn the verse deftly to honor the host and every warrior on the bench',
        outcomeText: 'Wise restraint wins wider friendship than mockery ever could; three stout drengir ask to sail with you.',
        effects: {
          hirdWarriors: 3,
          stats: { charisma: 7, cunning: 5 },
          skills: { diplomacy: 7 },
        },
      },
    ],
  },
  {
    id: 'trade_002_hedeby_glass_amber',
    title: 'Rhenish Glass & Baltic Amber',
    category: 'Trade',
    provenance: 'Archaeological Record',
    regions: ['Denmark', 'Continent', 'Sweden'],
    ageMin: 16,
    weight: 7,
    text: 'Along the planked street of the emporium, bead-makers melt colorful mosaic tesserae over charcoal braziers while Prussian gatherers weigh golden sea-amber.',
    choices: [
      {
        id: 'buy_amber_export_west',
        label: 'Buy raw amber blocks (20 silver) for rosaries and rings in Dublin and Winchester',
        requiredSilver: 20,
        outcomeText: 'Carried west aboard your next hull, golden amber sells for nearly triple its Baltic weight!',
        effects: {
          silver: 42,
          skills: { trade: 8 },
          stats: { cunning: 4 },
        },
      },
      {
        id: 'hire_beadmaker',
        label: 'Sponsor a workshop plot in return for quarterly craft tolls',
        outcomeText: 'Steady silver pennies trickle in from glass beads, bone combs, and bronze brooches.',
        effects: {
          silver: 26,
          fame: 10,
          skills: { craft: 7, trade: 4 },
        },
      },
    ],
  },
  {
    id: 'war_004_river_chain_bridge',
    title: 'Fortified Bridge Blocking the River',
    category: 'Raiding',
    provenance: 'Royal Frankish Annals',
    regions: ['Continent', 'British Isles'],
    ageMin: 17,
    weight: 6,
    text: 'Rowing upstream toward rich inland toll-towns, your prows confront a timber-towered bridge reinforced by Charles the Bald’s or Alfred’s engineers to bar Viking keels!',
    choices: [
      {
        id: 'portage_overland_rollers',
        label: 'Fell greased pine rollers and haul the shallow-draft longships overland past the bridge at night!',
        outcomeText: 'At sunrise the defenders stare dumbfounded as your sails belly upstream beyond their barrier!',
        effects: {
          silver: 58,
          fame: 30,
          stats: { cunning: 9, strength: 4, honor: 8 },
          skills: { seamanship: 8, combat: 5 },
        },
      },
      {
        id: 'rope_pilings_row_hard',
        label: 'Roof the decks with wattled shields, lash cables to the bridge pilings, and row downstream with the current!',
        outcomeText: 'Like Olaf’s famous feat at London Bridge, creaking oak pilings tear loose into the torrent!',
        effects: {
          silver: 68,
          fame: 38,
          stats: { honor: 14, health: -10 },
          skills: { combat: 8, seamanship: 7 },
        },
        injuryChance: 0.2,
        injuryTraitId: 'battle_scarred',
        deathChance: 0.05,
        deathReason: 'Crushed by falling bridge-stones while tearing down river pilings.',
      },
    ],
  },
  {
    id: 'sea_003_atlantic_pack_ice',
    title: 'Groaning Pack-Ice in the Western Strait',
    category: 'Voyage & Sea',
    regions: ['North Atlantic'],
    ageMin: 15,
    weight: 7,
    text: 'Blue-white drift floes grind together off the bow with a sound like splintering shields, threatening to nip your clinker planking two hundred miles from shelter.',
    choices: [
      {
        id: 'pole_through_leads',
        label: 'Furl sail, set ice-poles along both gunwales, and thread open water-leads patiently',
        outcomeText: 'Exhausting watches without sleep bring every plank safely into ice-free fjord water!',
        effects: {
          fame: 18,
          stats: { health: -4, wyrd: 6 },
          skills: { seamanship: 11 },
        },
      },
      {
        id: 'lighten_ship_cargo',
        label: 'Heave heavy timber and salt-barrels overboard so the hull rides high over slush',
        outcomeText: 'Cargo is lost to the grey deep, yet ship and crew live to tell the tale.',
        effects: {
          foodStores: -12,
          silver: -10,
          stats: { cunning: 5, happiness: 2 },
          skills: { seamanship: 6 },
        },
      },
    ],
  },
  {
    id: 'bet_002_poisoned_horn_rumor',
    title: 'Shadow Behind the Tapestry',
    category: 'Betrayal',
    ageMin: 20,
    minTitleRankIndex: 3,
    weight: 6,
    text: 'A sharp-eyed thrall tugs your sleeve before you drink: a nervous guest slipped bitter henbane-root into the silver-rimmed horn meant for the high seat!',
    choices: [
      {
        id: 'offer_horn_to_plotter',
        label: 'Smile warmly and invite the guest to drink first from your own honor-cup',
        outcomeText: 'Turning dead-white, the conspirator drops the horn on the rushes and confesses who paid him! You seize his silver and reward the loyal thrall with freedom.',
        effects: {
          silver: 40,
          stability: 10,
          fame: 20,
          stats: { cunning: 10, honor: 8 },
          skills: { diplomacy: 6, law: 5 },
        },
      },
      {
        id: 'lock_doors_interrogate',
        label: 'Bar the hall doors with drawn axes and purge every suspected turncoat',
        outcomeText: 'Fear silences treason for years to come, though the hall feels colder afterward.',
        effects: {
          stability: 12,
          stats: { honor: -4, happiness: -5, strength: 4 },
        },
      },
    ],
  },
  {
    id: 'fam_004_foster_alliance_offer',
    title: 'An Offer from a Neighboring Jarl',
    category: 'Politics & Kings',
    ageMin: 22,
    weight: 6,
    text: 'An influential coastal Jarl offers to foster his youngest son under your roof — a high honor in Norse custom, signaling he acknowledges your steadiness and prowess.',
    choices: [
      {
        id: 'accept_noble_fosterling',
        label: 'Welcome the boy with a carved pony-saddle and train him alongside your kin',
        outcomeText: 'Generous foster-gifts of silver and lasting political backing flow from the Jarl’s court.',
        effects: {
          silver: 35,
          fame: 22,
          stability: 6,
          stats: { charisma: 6, honor: 8 },
          skills: { diplomacy: 8 },
        },
      },
      {
        id: 'decline_avoid_entanglement',
        label: 'Decline courteously so you are not dragged into the Jarl’s dynastic wars',
        outcomeText: 'You preserve complete independence, though the Jarl cools toward your harbor.',
        effects: {
          stats: { cunning: 5 },
        },
      },
    ],
  },
  {
    id: 'rom_003_unhappy_match_divorce',
    title: 'Strife Across the Bed-Closet',
    category: 'Romance & Marriage',
    provenance: 'Social History',
    ageMin: 20,
    weight: 4,
    text: 'Harsh words echo beside the hearth. Unlike southern Christendom, Norse law permits either woman or man to summon witnesses at the threshold and bedside to declare lawful divorce and divide property cleanly.',
    choices: [
      {
        id: 'reconcile_with_gift',
        label: 'Speak honestly without pride and gift a fine silver cloak-pin (12 silver)',
        requiredSilver: 12,
        outcomeText: 'Warmth returns to the hearth-bench as old grievances are spoken out and forgiven.',
        effects: {
          silver: -12,
          stats: { happiness: 12, charisma: 5 },
        },
      },
      {
        id: 'endure_quietly_focus_work',
        label: 'Throw yourself into ship-work and farm accounts until tempers cool',
        outcomeText: 'Time and busy hands dull the sharp edges of the quarrel.',
        effects: {
          foodStores: 10,
          stats: { happiness: -3 },
          skills: { farming: 4 },
        },
      },
    ],
  },
  {
    id: 'craft_002_turf_wall_repair',
    title: 'Autumn Turf-Cutting Before First Frost',
    category: 'Farm Life',
    ageMin: 15,
    weight: 6,
    text: 'Gales off the sea have stripped sod from the longhouse windward wall. Cut thick marsh-turf herringbone-fashion now, and the hall stays warm on half the peat-fuel all winter.',
    choices: [
      {
        id: 'work_shoulder_to_shoulder',
        label: 'Strip your cloak and lay heavy turf-blocks shoulder-to-shoulder with your household',
        outcomeText: 'Seeing their leader muddy to the elbows inspires fierce pride; the hall stands tight as a badger-sett against January blizzards.',
        effects: {
          stability: 8,
          foodStores: 8,
          stats: { strength: 4, health: 4, charisma: 5, happiness: 6 },
          skills: { craft: 6, farming: 5 },
        },
      },
      {
        id: 'hire_stonemasons',
        label: 'Pay 15 silver for dry-stonewindbreaks and carved pine lintels',
        requiredSilver: 15,
        outcomeText: 'Neat stone courses and tarred gables make yours the finest steading on the coast.',
        effects: {
          silver: -15,
          fame: 14,
          stability: 6,
          stats: { honor: 5 },
        },
      },
    ],
  },
];

/**
 * 20 Historical Viking Age Events (795–1030 AD) following the structured
 * { id, title, text, conditions, choices } schema and integrated into the engine.
 */
export const HISTORICAL_VIKING_EVENTS: HistoricalVikingEvent[] = [
  {
    id: 'hist_795_iona_abbey',
    title: '795 AD · Columba’s Island Shrine at Iona',
    provenance: 'Annals of Ulster',
    text: 'Sea-mist parts off Mull to reveal low stone cells and carved high crosses on Iona, sacred heart of Gaelic and Pictish kingship. Monks hurry jeweled book-shrines toward turf-roofed hiding places.',
    conditions: {
      yearRange: [795, 806],
      ageMin: 15,
      uniqueOncePerCampaign: true,
    },
    choices: [
      {
        id: 'raid_reliquaries',
        label: 'Seize the silver shrines and weigh anchor into the Hebrides',
        outcomeText: 'Heavy Irish silverwork fills your sea-chest before island beacons can summon Dalriadan galleys.',
        effects: {
          silver: 62,
          fame: 24,
          moveToSettlementId: 'iona',
          stats: { honor: 4 },
          skills: { seamanship: 4, combat: 4 },
        },
      },
      {
        id: 'ransom_gospel_books',
        label: 'Offer the abbot unharmed return of his illuminated gospels for weighed silver',
        outcomeText: 'Grateful monks pay bright silver bullion to preserve Saint Columba’s vellum treasures intact.',
        effects: {
          silver: 46,
          fame: 16,
          stats: { cunning: 6, honor: 6 },
          skills: { diplomacy: 6, trade: 4 },
          divergenceNote: '795 AD: Ransomed Iona’s illuminated gospels intact rather than burning the abbey.',
        },
      },
    ],
  },
  {
    id: 'hist_808_godfred_danevirke',
    title: '808 AD · King Gudfred Raises the Danevirke',
    provenance: 'Royal Frankish Annals',
    text: 'Danish King Gudfred has uprooted merchants from Slavic Reric to resettle Hedeby and orders a timber-revetted earthwork dug clear across Jutland’s neck against Emperor Charlemagne’s Franks.',
    conditions: {
      yearRange: [808, 812],
      ageMin: 15,
      regions: ['Denmark', 'Norway', 'Sweden', 'Continent'],
      uniqueOncePerCampaign: true,
    },
    choices: [
      {
        id: 'haul_oak_ramparts',
        label: 'Lead crews driving oak palisades along the Danevirke frontier wall',
        outcomeText: 'Gudfred’s marshals reward your labor with royal silver rings and trading privileges at Hedeby’s new wharves.',
        effects: {
          silver: 44,
          fame: 20,
          moveToSettlementId: 'hedeby',
          stats: { strength: 4, honor: 7 },
          skills: { craft: 6, diplomacy: 4 },
        },
      },
      {
        id: 'buy_reric_stalls',
        label: 'Invest 20 silver in market plots beside Hedeby’s semicircular harbor',
        requiredSilver: 20,
        outcomeText: 'Caravans crossing between the Baltic and North Sea pay tolls past your new warehouse!',
        effects: {
          silver: 48,
          fame: 14,
          stats: { cunning: 6 },
          skills: { trade: 8 },
        },
      },
    ],
  },
  {
    id: 'hist_826_ansgar_hedeby_birka',
    title: '829 AD · Ansgar’s Bell at Hedeby and Birka',
    provenance: 'Royal Frankish Annals',
    text: 'Frankish monk Ansgar arrives under royal safe-conduct with Rhineland glass gifts, preaching the White Christ and offering traders the sign of the cross (primsigning) so they may barter freely in Christian ports.',
    conditions: {
      yearRange: [826, 836],
      ageMin: 15,
      regions: ['Denmark', 'Sweden', 'Norway'],
      uniqueOncePerCampaign: true,
    },
    choices: [
      {
        id: 'take_prime_signing',
        label: 'Accept Prime-Signing — keep Thor’s hammer while trading freely with Christians',
        outcomeText: 'Both pagan captains and Frisian merchants welcome your ship at their quays without suspicion.',
        effects: {
          newReligion: Religion.Syncretic,
          silver: 34,
          stats: { cunning: 6 },
          skills: { trade: 7, diplomacy: 5 },
        },
      },
      {
        id: 'uphold_ancestral_blot',
        label: 'Speak for Odin and Freyr at the market assembly and refuse the foreign rite',
        outcomeText: 'Traditionalist bondi cheer your steadfastness and gift fine pelts to your household.',
        effects: {
          fame: 22,
          stats: { faith: 8, honor: 7 },
          skills: { law: 5 },
        },
      },
    ],
  },
  {
    id: 'hist_834_dorestad_emporium',
    title: '834 AD · Rich Wharves of Frisian Dorestad',
    provenance: 'Royal Frankish Annals',
    text: 'Emperor Louis the Pious’s sons quarrel across Francia, leaving two miles of timber quays, wine cellars, and silver mints at Dorestad on the Rhine delta lightly guarded.',
    conditions: {
      yearRange: [834, 839],
      ageMin: 16,
      uniqueOncePerCampaign: true,
    },
    choices: [
      {
        id: 'raid_rhine_mints',
        label: 'Row swiftly up the Rhine channels and seize the mint-chests',
        outcomeText: 'Barrels of Rhenish wine and sacks of bright Dorestad pennies weigh your hull low to the gunwales!',
        effects: {
          silver: 78,
          fame: 28,
          moveToSettlementId: 'dorestad',
          stats: { honor: 5, health: -5 },
          skills: { combat: 5, seamanship: 5 },
        },
        injuryChance: 0.14,
        injuryTraitId: 'battle_scarred',
      },
      {
        id: 'barter_furs_for_swords',
        label: 'Trade northern furs peacefully for prized Frankish pattern-welded blades',
        outcomeText: 'Skipping the bloodshed, you acquire keen Rhineland steel that strengthens your household guard.',
        effects: {
          hirdWarriors: 5,
          fame: 14,
          stats: { cunning: 5 },
          skills: { trade: 6, combat: 4 },
        },
      },
    ],
  },
  {
    id: 'hist_841_dublin_longphort',
    title: '841 AD · Fortifying the Longphort at Dyflinn',
    provenance: 'Annals of Ulster',
    text: 'Rather than sailing home before autumn gales, Norse fleets haul their keels onto the ridge above the Black Pool (Dubh Linn) on the Liffey, digging ditches and oak palisades for a permanent winter stronghold.',
    conditions: {
      yearRange: [841, 846],
      ageMin: 15,
      uniqueOncePerCampaign: true,
    },
    choices: [
      {
        id: 'stake_dublin_plot',
        label: 'Claim a waterfront plot inside Dyflinn’s rampart and winter in Ireland',
        outcomeText: 'Your hall rises beside the Liffey ship-camps, anchoring a lucrative Irish Sea foothold for your bloodline!',
        effects: {
          landFarms: 1,
          silver: 38,
          fame: 24,
          moveToSettlementId: 'dublin',
          stats: { honor: 6, cunning: 4 },
          skills: { seamanship: 4, trade: 5 },
        },
      },
      {
        id: 'raid_midland_shrines',
        label: 'Join the upriver expeditionary oars into Meath and the Shannon',
        outcomeText: 'Hard skirmishing against Irish kings yields silver brooches and battle-renown.',
        effects: {
          silver: 64,
          fame: 26,
          stats: { strength: 5, health: -6 },
          skills: { combat: 6 },
        },
        deathChance: 0.04,
        deathReason: 'Fell in an Irish woodland ambush beyond the Dyflinn longphort in 841 AD.',
      },
    ],
  },
  {
    id: 'hist_845_siege_of_paris',
    title: '845 AD · Seven Thousand Pounds on the Seine',
    provenance: 'Royal Frankish Annals',
    isSemiLegendary: true,
    text: 'One hundred twenty Danish ships row up the winding Seine to the island walls of Paris under Reginherus — remembered in saga lore as Ragnar Lodbrok. West Frankish King Charles the Bald offers massive silver tribute to spare the city.',
    conditions: {
      yearRange: [845, 847],
      ageMin: 16,
      uniqueOncePerCampaign: true,
    },
    choices: [
      {
        id: 'weigh_paris_danegeld',
        label: 'Claim your ship’s share of Charles the Bald’s 7,000-pound silver tribute',
        outcomeText: 'Frankish carts creak under chests of silver coin; your bench-mates return north richer than earls!',
        effects: {
          silver: 96,
          fame: 34,
          moveToSettlementId: 'paris',
          stats: { cunning: 5, happiness: 8 },
          skills: { seamanship: 4, diplomacy: 4 },
        },
      },
      {
        id: 'storm_river_abbey',
        label: 'Press ahead of the truce-envoys to storm the river-bank guard towers',
        outcomeText: 'Your bold rush breaks the outer barricade and wins your crew double war-spoils and undying song-fame!',
        effects: {
          silver: 115,
          fame: 46,
          stats: { honor: 10, strength: 5, health: -10 },
          skills: { combat: 8 },
        },
        injuryChance: 0.2,
        injuryTraitId: 'battle_scarred',
        deathChance: 0.05,
        deathReason: 'Slain beneath Frankish crossbow bolts along the Seine bridges before Paris (845 AD).',
      },
    ],
  },
  {
    id: 'hist_860_varangian_east_way',
    title: '860 AD · Silver Dirhams from the Eastern Way',
    provenance: 'Archaeological Record',
    text: 'Weather-beaten Swedish *Rús* captains tie up at Birka with walrus-hide sacks clinking with Kufic silver dirhams from Baghdad and silk caftans traded down the Volga and Dnieper toward Miklagarðr.',
    conditions: {
      yearRange: [858, 868],
      ageMin: 15,
      regions: ['Sweden', 'Denmark', 'Norway'],
      uniqueOncePerCampaign: true,
    },
    choices: [
      {
        id: 'outfit_eastern_cargo',
        label: 'Invest 25 silver in arctic furs and amber for the next eastern river convoy',
        requiredSilver: 25,
        outcomeText: 'When autumn ice forms, your factor returns with heavy pouches of pure Arabic silver dirhams!',
        effects: {
          silver: 72,
          fame: 18,
          stats: { cunning: 6 },
          skills: { trade: 8, seamanship: 3 },
        },
      },
      {
        id: 'recruit_rus_veterans',
        label: 'Feast the returning river-veterans and hire four mailed axe-men (18 silver)',
        requiredSilver: 18,
        outcomeText: 'Seasoned warriors hardened on the Dnieper rapids swear oaths onto your household bench.',
        effects: {
          silver: -18,
          hirdWarriors: 7,
          fame: 15,
          stats: { charisma: 5 },
          skills: { combat: 4 },
        },
      },
      {
        id: 'listen_tales_miklagard',
        label: 'Swap mead for navigation lore and eastern star-reckoning',
        outcomeText: 'Their stories of stone domes and river portages sharpen your sea-craft without spending a coin.',
        effects: {
          stats: { cunning: 4, happiness: 5 },
          skills: { seamanship: 6, skaldcraft: 4 },
        },
      },
    ],
  },
  {
    id: 'hist_873_repton_winter_camp',
    title: '873 AD · The Great Winter Camp at Repton',
    provenance: 'Archaeological Record',
    text: 'On the River Trent in Mercia, the Great Heathen Army incorporates Saint Wystan’s stone church into a massive D-shaped defensive ditch to haul up ships for winter. King Burgred flees to Rome as captains debate splitting the host.',
    conditions: {
      yearRange: [873, 876],
      ageMin: 15,
      regions: ['British Isles', 'Denmark', 'Norway'],
      uniqueOncePerCampaign: true,
    },
    choices: [
      {
        id: 'plough_mercian_land',
        label: 'Follow Halfdan’s veterans north to parcel out fertile Danelaw ploughlands',
        outcomeText: 'Measuring rich river-meadows by rope, you trade the oar-bench for enduring English farmland!',
        effects: {
          landFarms: 2,
          foodStores: 18,
          fame: 22,
          moveToSettlementId: 'repton',
          stats: { honor: 6, happiness: 6 },
          skills: { farming: 7 },
        },
      },
      {
        id: 'march_south_guthrum',
        label: 'Ride south with Guthrum’s war-kings toward Cambridge and Wessex silver',
        outcomeText: 'Mercian tribute chests and captured war-gear swell your warband’s coffers.',
        effects: {
          silver: 74,
          hirdWarriors: 5,
          fame: 24,
          stats: { strength: 4, honor: 5 },
          skills: { combat: 6 },
        },
      },
    ],
  },
  {
    id: 'hist_874_ingolf_iceland_landnam',
    title: '874 AD · High-Seat Pillars Drift to Reykjavík',
    provenance: 'Semi-Legendary Saga Tradition',
    text: 'Ingólfr Arnarson casts his carved timber high-seat pillars overboard as snowy Atlantic headlands rise ahead, vowing to raise his hall wherever Thor guides them ashore beside steaming vents.',
    conditions: {
      yearRange: [874, 884],
      ageMin: 15,
      regions: ['Norway', 'North Atlantic', 'British Isles', 'Ireland'],
      uniqueOncePerCampaign: true,
    },
    choices: [
      {
        id: 'claim_iceland_valley',
        label: 'Carry fire around an unsettled river valley in Iceland to claim odal land',
        outcomeText: 'No king taxes your hall! Birchwood pastures, salmon streams, and free Thing-law belong to your heirs.',
        effects: {
          landFarms: 2,
          foodStores: 16,
          fame: 30,
          moveToSettlementId: 'reykjavik',
          stats: { honor: 9, happiness: 10 },
          skills: { seamanship: 5, farming: 5 },
        },
      },
      {
        id: 'sell_livestock_settlers',
        label: 'Ferry hardy sheep, seed-barley, and iron tools to outbound Landnám families',
        outcomeText: 'Emigrant chieftains gladly pay heavy silver for breeding stock and timber beams.',
        effects: {
          silver: 64,
          fame: 15,
          stats: { cunning: 6 },
          skills: { trade: 7, seamanship: 4 },
        },
      },
    ],
  },
  {
    id: 'hist_885_great_siege_paris',
    title: '885 AD · Sigfred’s Fleet Before the Bridges of Paris',
    provenance: 'Royal Frankish Annals',
    text: 'Hundreds of longships choke the Seine beneath the fortified wooden bridges defended by Count Odo of Paris. Sigfred demands free passage upriver into wealthy Burgundy.',
    conditions: {
      yearRange: [885, 888],
      ageMin: 16,
      uniqueOncePerCampaign: true,
    },
    choices: [
      {
        id: 'assault_wooden_bridge',
        label: 'Push fire-boats and mantlets against Count Odo’s fortified bridge-tower',
        outcomeText: 'Boiling pitch hisses into the river as your warriors batter the pilings, winning fierce renown and Burgundian plunder!',
        effects: {
          silver: 88,
          fame: 38,
          stats: { strength: 5, honor: 8, health: -9 },
          skills: { combat: 7 },
        },
        injuryChance: 0.18,
        injuryTraitId: 'battle_scarred',
        deathChance: 0.05,
        deathReason: 'Fell storming the fortified bridge-head of Paris against Count Odo’s garrison (885 AD).',
      },
      {
        id: 'portage_around_island',
        label: 'Haul hulls overland on greased log-rollers past Paris into Burgundy',
        outcomeText: 'Outwitting the bridge garrison, your crew plunders untouched upriver estates and returns with Charles the Fat’s silver ransom!',
        effects: {
          silver: 82,
          fame: 26,
          stats: { cunning: 8 },
          skills: { seamanship: 6, craft: 5 },
        },
      },
    ],
  },
  {
    id: 'hist_927_aethelstan_jorvik',
    title: '927 AD · King Æthelstan Enters Jórvík',
    provenance: 'Anglo-Saxon Chronicle',
    text: 'West Saxon King Æthelstan marches north into York, demolishing the Viking fortress and styling himself Rex Totius Britanniae while Hiberno-Norse exiles in Dublin plot a grand northern coalition.',
    conditions: {
      yearRange: [927, 937],
      ageMin: 15,
      regions: ['British Isles', 'Ireland', 'Denmark', 'Norway'],
      uniqueOncePerCampaign: true,
    },
    choices: [
      {
        id: 'muster_dublin_coalition',
        label: 'Rally with Olaf Guthfrithsson’s Dublin-Norse host to contest English rule',
        outcomeText: 'Shields splinter on the blood-soaked ridge! Even against Æthelstan’s legions, your banner holds its ground and withdraws with honor intact.',
        effects: {
          silver: 55,
          fame: 42,
          stats: { honor: 12, health: -10 },
          skills: { combat: 8 },
          divergenceNote: '927–937 AD: Held the northern flank unbroken for the Hiberno-Norse coalition against Æthelstan.',
        },
        deathChance: 0.06,
        deathReason: 'Slain fighting King Æthelstan’s West Saxon levy for mastery of Northumbria.',
      },
      {
        id: 'attend_aethelstan_court',
        label: 'Accept peace-terms as an Anglo-Scandinavian landowner and trade silver at York',
        outcomeText: 'Æthelstan confirms your estate boundaries and welcomes northern jarls as witnesses to his royal charters.',
        effects: {
          silver: 52,
          stability: 8,
          stats: { cunning: 7 },
          skills: { diplomacy: 7, law: 5 },
        },
      },
    ],
  },
  {
    id: 'hist_936_haakon_good_gulathing',
    title: '936 AD · Haakon the Good Restores Odal Rights',
    provenance: 'Semi-Legendary Saga Tradition',
    text: 'Fostered in England at Æthelstan’s court, young Haakon Haraldsson lands in Norway promising to return ancestral *óðal* land rights seized by his father Harald Fairhair and organize coastal beacon-watches (*leiðangr*).',
    conditions: {
      yearRange: [934, 952],
      ageMin: 15,
      regions: ['Norway', 'North Atlantic', 'Denmark'],
      uniqueOncePerCampaign: true,
    },
    choices: [
      {
        id: 'acclaim_haakon_thing',
        label: 'Clash your shield for Haakon at the Thing and reclaim ancestral odal pastures',
        outcomeText: 'Cheers roll across the fjord! Freeholders regain tax-free inheritance rights and your family’s farmstead expands.',
        effects: {
          landFarms: 1,
          fame: 24,
          stability: 8,
          stats: { honor: 8, happiness: 8 },
          skills: { law: 6, diplomacy: 4 },
        },
      },
      {
        id: 'command_leidangr_ship',
        label: 'Accept captaincy of a district leiðangr defense longship',
        outcomeText: 'Commanding the coastal beacon-watch grants your house a swift warship and steady royal prestige.',
        effects: {
          longships: 1,
          fame: 26,
          stats: { honor: 6 },
          skills: { seamanship: 6, combat: 4 },
        },
      },
    ],
  },
  {
    id: 'hist_965_bluetooth_jelling_stone',
    title: '965 AD · Harald Bluetooth’s Great Stone at Jelling',
    provenance: 'Archaeological Record',
    text: 'After the cleric Poppo reportedly carries red-hot iron unscathed before the Danish court, King Harald Bluetooth raises a massive painted three-sided rune-stone at Jelling proclaiming he won all Denmark and Norway and made the Danes Christian.',
    conditions: {
      yearRange: [963, 972],
      ageMin: 15,
      uniqueOncePerCampaign: true,
    },
    choices: [
      {
        id: 'accept_royal_baptism',
        label: 'Stand witness at Jelling and adopt the new royal Christian faith',
        outcomeText: 'Harald gifts your house an embroidered Frankish cloak and exempts your ships from Belt-strait tolls.',
        effects: {
          newReligion: Religion.Christian,
          silver: 54,
          fame: 24,
          moveToSettlementId: 'jelling',
          stats: { faith: 6, cunning: 5 },
          skills: { diplomacy: 7 },
        },
      },
      {
        id: 'keep_mound_offerings',
        label: 'Honor Gorm the Old’s pagan burial mound by night while keeping outward peace',
        outcomeText: 'Old-faith chieftains quietly rally around your hearth as a trusted guardian of northern memory.',
        effects: {
          fame: 28,
          stability: 6,
          stats: { honor: 9, faith: 7 },
          skills: { skaldcraft: 5 },
        },
      },
    ],
  },
  {
    id: 'hist_980_trelleborg_ring_forts',
    title: '980 AD · Compass-Drawn Ring Fortresses of Trelleborg',
    provenance: 'Archaeological Record',
    text: 'Royal engineers stake out geometrically exact circular ramparts divided into four timber-paved quadrants — Trelleborg, Aggersborg, and Fyrkat — to tighten royal grip across Denmark.',
    conditions: {
      yearRange: [978, 986],
      ageMin: 15,
      regions: ['Denmark', 'Sweden', 'Norway'],
      uniqueOncePerCampaign: true,
    },
    choices: [
      {
        id: 'supply_oak_timbers',
        label: 'Contract oak timber-rafts and bog-iron rivets for the fortress gates',
        outcomeText: 'Royal paymasters weigh heavy silver ingots into your chest as the circular ramparts rise.',
        effects: {
          silver: 68,
          fame: 18,
          stats: { cunning: 5 },
          skills: { craft: 8, trade: 5 },
        },
      },
      {
        id: 'drill_garrison_quadrant',
        label: 'Serve a season drilling household spear-men inside the ring-fortress',
        outcomeText: 'Disciplined formation tactics sharpen your warriors into an iron-hard shield-wall.',
        effects: {
          hirdWarriors: 8,
          fame: 22,
          stats: { strength: 4, honor: 6 },
          skills: { combat: 7 },
        },
      },
    ],
  },
  {
    id: 'hist_988_varangian_guard_miklagard',
    title: '988 AD · The Golden Halls of Miklagarðr',
    provenance: 'Archaeological Record',
    text: 'Byzantine Emperor Basil II recruits tall northern axe-men into the elite Varangian Guard at Constantinople (Miklagarðr). Veterans return home wearing silk tunics and arm-rings of red Greek gold.',
    conditions: {
      yearRange: [988, 1045],
      ageMin: 17,
      ageMax: 42,
      uniqueOncePerCampaign: true,
    },
    choices: [
      {
        id: 'take_varangian_oath',
        label: 'Voyage south down the eastern rivers to swing a two-handed axe in the Emperor’s Guard',
        outcomeText: 'Returning bathed in renown with Byzantine gold solidi and a scarred shield-arm, skalds sing of your service in Miklagarðr!',
        effects: {
          silver: 135,
          fame: 55,
          addFlags: ['varangian_veteran'],
          stats: { strength: 6, honor: 10, health: -6 },
          skills: { combat: 10, seamanship: 5 },
        },
        injuryChance: 0.16,
        injuryTraitId: 'battle_scarred',
        deathChance: 0.05,
        deathReason: 'Fell wielding a two-handed Dane-axe in the imperial campaigns of Miklagarðr.',
      },
      {
        id: 'stay_guard_homestead',
        label: 'Remain in the North to tend your lands and trade with returning Varangians',
        outcomeText: 'Exchanging wool and ship-timber for eastern silks enriches your estate without risking distant battlefields.',
        effects: {
          silver: 42,
          stability: 6,
          stats: { cunning: 4, happiness: 5 },
          skills: { trade: 6 },
        },
      },
    ],
  },
  {
    id: 'hist_1000_battle_of_svolder',
    title: '1000 AD · Ambush of the Long Serpent at Svolder',
    provenance: 'Semi-Legendary Saga Tradition',
    isSemiLegendary: true,
    text: 'Allied fleets of Sweyn Forkbeard, Swedish King Olof Skötkonung, and Jarl Eirik Håkonsson spring from behind a Baltic island upon King Olaf Tryggvason’s towering flagship *Ormrinn Langi* (The Long Serpent).',
    conditions: {
      yearRange: [999, 1001],
      ageMin: 16,
      regions: ['Norway', 'Denmark', 'Sweden'],
      uniqueOncePerCampaign: true,
    },
    choices: [
      {
        id: 'board_with_jarl_eirik',
        label: 'Drive your iron-beaked prow alongside Jarl Eirik’s ship to clear the Long Serpent’s deck',
        outcomeText: 'After furious boarding combat, King Olaf leaps in gilded mail into the sea rather than yield; rich royal war-gear falls to the victors!',
        effects: {
          silver: 86,
          fame: 44,
          stats: { strength: 5, honor: 9, health: -8 },
          skills: { combat: 8, seamanship: 5 },
        },
        injuryChance: 0.18,
        injuryTraitId: 'battle_scarred',
        deathChance: 0.05,
        deathReason: 'Fell beneath Einar Tambarskjelve’s arrows on the blood-slicked gunwales at Svolder (1000 AD).',
      },
      {
        id: 'rescue_olaf_swimmers',
        label: 'Cut through the outer cordon to pull King Olaf’s surviving retainers from the Baltic',
        outcomeText: 'Whispers spread from fjord to fjord that your fast keel snatched Olaf Tryggvason’s banner-men from certain death!',
        effects: {
          hirdWarriors: 8,
          fame: 40,
          stats: { honor: 12, wyrd: 6 },
          skills: { seamanship: 8 },
          divergenceNote: '1000 AD: Rescued elite retainers of the Long Serpent from the waters of Svolder.',
        },
      },
    ],
  },
  {
    id: 'hist_1002_st_brices_day',
    title: '1002 AD · Smoke of St. Brice’s Day',
    provenance: 'Anglo-Saxon Chronicle',
    text: 'Panic sweeps King Æthelred II’s court, sparking treacherous attacks on Danish families settled in English market towns on November 13. Survivors flee to the coast calling for Sweyn Forkbeard’s vengeance.',
    conditions: {
      yearRange: [1002, 1005],
      ageMin: 15,
      uniqueOncePerCampaign: true,
    },
    choices: [
      {
        id: 'shelter_refugees_fleet',
        label: 'Open your ship-benches and granaries to fleeing Anglo-Danish families',
        outcomeText: 'Grateful craftsmen, traders, and warriors swell your settlement and swear lifelong loyalty to your house!',
        effects: {
          foodStores: -8,
          hirdWarriors: 7,
          fame: 32,
          stability: 8,
          stats: { honor: 12, charisma: 6 },
        },
      },
      {
        id: 'join_sweyn_retaliation',
        label: 'Sail with Sweyn Forkbeard’s avenging war-fleet to exact heavy Danegeld from England',
        outcomeText: 'Shire after shire buys peace with chests of silver pennies as Æthelred’s defenses crumble.',
        effects: {
          silver: 92,
          fame: 34,
          stats: { strength: 4, honor: 5 },
          skills: { combat: 6, seamanship: 4 },
        },
      },
    ],
  },
  {
    id: 'hist_1013_sweyn_forkbeard_london',
    title: '1013 AD · Sweyn Forkbeard Conquers England',
    provenance: 'Anglo-Saxon Chronicle',
    text: 'From Gainsborough on the Trent to Winchester and London, English ealdormen submit to King Sweyn Forkbeard and young Cnut while Æthelred flees across the sea to Normandy.',
    conditions: {
      yearRange: [1013, 1015],
      ageMin: 16,
      uniqueOncePerCampaign: true,
    },
    choices: [
      {
        id: 'ride_with_cnut_guard',
        label: 'Guard the royal horse-herd and ships alongside young Prince Cnut',
        outcomeText: 'When Sweyn dies suddenly five weeks into his triumph, Cnut remembers those who stood firm by the fleet and rewards you richly!',
        effects: {
          silver: 84,
          fame: 36,
          moveToSettlementId: 'london',
          stats: { honor: 9, cunning: 5 },
          skills: { combat: 5, diplomacy: 6 },
        },
      },
      {
        id: 'purchase_english_manor',
        label: 'Acquire forfeited manor-ploughlands in the Danelaw for 30 silver',
        requiredSilver: 30,
        outcomeText: 'Rich Mercian wheat-fields pass under your seal, boosting your dynasty’s yearly harvest.',
        effects: {
          silver: -30,
          landFarms: 2,
          foodStores: 20,
          fame: 20,
          skills: { farming: 5, law: 5 },
        },
      },
    ],
  },
  {
    id: 'hist_1016_cnut_north_sea_empire',
    title: '1018 AD · Cnut’s North Sea Empire',
    provenance: 'Anglo-Saxon Chronicle',
    text: 'King Cnut the Great collects an extraordinary 82,500-pound silver geld across England, pays off most of the invasion host, and establishes peaceful maritime law linking England, Denmark, and soon Norway.',
    conditions: {
      yearRange: [1016, 1030],
      ageMin: 16,
      uniqueOncePerCampaign: true,
    },
    choices: [
      {
        id: 'serve_thingmen_fleet',
        label: 'Enlist your ship in Cnut’s elite forty-ship royal Thingmen guard',
        outcomeText: 'Paid in crisp silver pennies from London’s mints, your crew stands among the proudest retainers of the North Sea Empire!',
        effects: {
          silver: 95,
          fame: 38,
          stats: { honor: 9 },
          skills: { combat: 6, seamanship: 5 },
        },
      },
      {
        id: 'charter_north_sea_knarrs',
        label: 'Launch regular wool-and-timber merchant voyages between London, Ribe, and Nidaros',
        outcomeText: 'With pirates suppressed by Cnut’s fleets, North Sea commerce flourishes and multiplies your silver!',
        effects: {
          silver: 82,
          knarrs: 1,
          fame: 22,
          stats: { cunning: 6, happiness: 6 },
          skills: { trade: 9, seamanship: 5 },
        },
      },
    ],
  },
  {
    id: 'hist_1030_stiklestad_eclipse',
    title: '1030 AD · Red Sun Over Stiklestad',
    provenance: 'Semi-Legendary Saga Tradition',
    text: 'Exiled King Olaf Haraldsson marches back from Kievan Rus’ into Trøndelag to reclaim Norway against a vast farmer-army led by Tore Hund and Kalv Arnesson. Mid-battle, the sky darkens eerily as the moon dims the sun.',
    conditions: {
      yearRange: [1030, 1033],
      ageMin: 16,
      regions: ['Norway', 'Sweden', 'Denmark', 'North Atlantic'],
      uniqueOncePerCampaign: true,
    },
    choices: [
      {
        id: 'stand_bondi_shieldwall',
        label: 'Stand with the Trøndelag free-farmers defending ancient regional autonomy',
        outcomeText: 'King Olaf falls beneath axe and spear! Though clerks soon proclaim him Saint Olaf at Nidaros, your district preserves its proud rights.',
        effects: {
          silver: 58,
          fame: 36,
          moveToSettlementId: 'nidaros',
          stats: { honor: 8, strength: 4, health: -7 },
          skills: { combat: 7, law: 4 },
        },
        injuryChance: 0.15,
        injuryTraitId: 'battle_scarred',
      },
      {
        id: 'shield_olaf_standard',
        label: 'Lock shields around King Olaf’s white-and-gold serpent banner!',
        outcomeText: 'Your fierce counter-charge breaks Tore Hund’s vanguard and pulls the wounded king alive from Stiklestad — rewriting the destiny of Norway!',
        effects: {
          silver: 75,
          fame: 55,
          stats: { honor: 14, faith: 8, health: -10 },
          skills: { combat: 9 },
          divergenceNote: '1030 AD: Saved King Olaf Haraldsson from death on the field of Stiklestad.',
        },
        deathChance: 0.06,
        deathReason: 'Fell beside King Olaf’s banner under the darkened sky of Stiklestad (29 July 1030).',
      },
    ],
  },
];

export function normalizeHistoricalVikingEvent(ev: HistoricalVikingEvent): GameEvent {
  return {
    id: ev.id,
    title: ev.title,
    category: 'Historical Set-Piece',
    provenance: ev.provenance ?? 'Anglo-Saxon Chronicle',
    isSemiLegendary: ev.isSemiLegendary,
    conditions: ev.conditions,
    eras: ev.conditions.eras,
    exactYear: ev.conditions.exactYear,
    yearRange: ev.conditions.yearRange,
    ageMin: ev.conditions.ageMin,
    ageMax: ev.conditions.ageMax,
    sex: ev.conditions.sex,
    regions: ev.conditions.regions,
    settlementIds: ev.conditions.settlementIds,
    classes: ev.conditions.classes,
    minTitleRankIndex: ev.conditions.minTitleRankIndex,
    religions: ev.conditions.religions,
    requiredTraits: ev.conditions.requiredTraits,
    blockedByTraits: ev.conditions.blockedByTraits,
    requiredFlags: ev.conditions.requiredFlags,
    blockedByFlags: ev.conditions.blockedByFlags,
    weight: 92,
    text: ev.text,
    mildText: ev.mildText,
    choices: ev.choices,
  };
}

export const NORMALIZED_HISTORICAL_VIKING_EVENTS: GameEvent[] =
  HISTORICAL_VIKING_EVENTS.map(normalizeHistoricalVikingEvent);

export const ALL_EVENTS: GameEvent[] = [
  ...HISTORICAL_SET_PIECE_EVENTS,
  ...NORMALIZED_HISTORICAL_VIKING_EVENTS,
  ...CORE_LIFE_EVENTS,
  ...BITLIFE_EVENTS,
];

export const EVENTS_BY_ID: Record<string, GameEvent> = ALL_EVENTS.reduce<Record<string, GameEvent>>(
  (acc, ev) => {
    acc[ev.id] = ev;
    return acc;
  },
  {}
);

