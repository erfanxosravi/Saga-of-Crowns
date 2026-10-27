import { deriveAppearanceFromId } from '../engine/storage';
import { CharacterAppearance, Sex, TitleRank } from '../types/game';

interface VikingPortraitProps {
  age: number;
  sex: Sex;
  traits: string[];
  title?: TitleRank;
  appearance?: CharacterAppearance;
  seedId?: string;
  size?: number;
  className?: string;
}

const SKIN_PALETTE: Record<0 | 1 | 2 | 3, { base: string; shadow: string; ear: string }> = {
  0: { base: '#F5D6C3', shadow: '#E2B69C', ear: '#EAC3AC' },
  1: { base: '#E8BC9E', shadow: '#CF9C7A', ear: '#DCA987' },
  2: { base: '#D49E7A', shadow: '#B57D58', ear: '#C58D68' },
  3: { base: '#A67252', shadow: '#87573B', ear: '#966446' },
};

const HAIR_PALETTE: Record<
  CharacterAppearance['hairColor'],
  { main: string; shade: string; elder: string }
> = {
  blonde: { main: '#EAB308', shade: '#CA8A04', elder: '#CBD5E1' },
  red: { main: '#C2410C', shade: '#9A3412', elder: '#94A3B8' },
  brown: { main: '#78350F', shade: '#451A03', elder: '#94A3B8' },
  black: { main: '#1E293B', shade: '#0F172A', elder: '#64748B' },
};

export function VikingPortrait({
  age,
  sex,
  traits,
  title = TitleRank.Freeman,
  appearance,
  seedId = 'viking',
  size = 64,
  className = '',
}: VikingPortraitProps) {
  const app = appearance ?? deriveAppearanceFromId(seedId);
  const ageStage: 'child' | 'young' | 'middle' | 'elder' =
    age < 13 ? 'child' : age < 35 ? 'young' : age < 55 ? 'middle' : 'elder';

  const skin = SKIN_PALETTE[app.skinTone] ?? SKIN_PALETTE[1];
  const hairCfg = HAIR_PALETTE[app.hairColor] ?? HAIR_PALETTE.blonde;
  const hairFill = ageStage === 'elder' ? hairCfg.elder : hairCfg.main;
  const hairShade = ageStage === 'elder' ? '#64748B' : hairCfg.shade;

  const isOneEyed = traits.includes('one_eyed');
  const isScarred = traits.includes('battle_scarred') || traits.includes('berserker');
  const isFrostbitten = traits.includes('frost_bitten');
  const isSickly = traits.includes('sickly');
  const isOutlaw = traits.includes('outlaw_mark');
  const isWarriorHelm =
    ageStage !== 'child' &&
    (title === TitleRank.Hersir ||
      title === TitleRank.Jarl ||
      traits.includes('brave') ||
      traits.includes('shieldmaiden_renown'));
  const isCrowned =
    ageStage !== 'child' && (title === TitleRank.Konungr || title === TitleRank.Overking);
  const hasAmulet = traits.includes('pious') || traits.includes('blessed_luck');

  const showBeard = sex === Sex.Male && age >= 17;
  const cloakColor = isOutlaw
    ? '#1E293B'
    : isCrowned
      ? '#7F1D1D'
      : title === TitleRank.Jarl || title === TitleRank.Hersir
        ? '#1E3A5F'
        : '#273549';

  const headScale = ageStage === 'child' ? 0.9 : 1;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`shrink-0 select-none ${className}`}
      role="img"
      aria-label="Viking Character Portrait"
    >
      {/* Frame Background */}
      <defs>
        <linearGradient id={`bg_${seedId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#162336" />
          <stop offset="100%" stopColor="#0B1118" />
        </linearGradient>
      </defs>
      <rect
        x="2"
        y="2"
        width="96"
        height="96"
        rx="18"
        fill={`url(#bg_${seedId})`}
        stroke={isCrowned ? '#F59E0B' : isWarriorHelm ? '#38BDF8' : '#283B52'}
        strokeWidth="2.5"
      />

      {/* Subtle Runic Halo for Kings/Jarls */}
      {isCrowned && (
        <circle
          cx="50"
          cy="46"
          r="34"
          fill="none"
          stroke="#F59E0B"
          strokeOpacity="0.22"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
      )}

      {/* Shoulders, Tunic & Fur Cloak */}
      <g transform={ageStage === 'child' ? 'translate(0, 8)' : undefined}>
        <path
          d="M14 96 C16 74, 30 68, 50 68 C70 68, 84 74, 86 96 Z"
          fill={cloakColor}
        />
        {/* Fur Mantle */}
        {ageStage !== 'child' && (
          <path
            d="M18 96 C21 78, 32 73, 50 73 C68 73, 79 78, 82 96 L72 96 C70 84, 62 80, 50 80 C38 80, 30 84, 28 96 Z"
            fill={ageStage === 'elder' ? '#64748B' : '#475569'}
          />
        )}
        {/* Cloak Brooch / Amulet */}
        <circle cx="34" cy="80" r="3.5" fill="#F59E0B" />
        <circle cx="66" cy="80" r="3.5" fill="#F59E0B" />
        {hasAmulet && (
          <path
            d="M47 78 L53 78 L51 86 L55 86 L55 89 L45 89 L45 86 L49 86 Z"
            fill="#38BDF8"
          />
        )}
      </g>

      {/* Head & Face Group */}
      <g
        transform={`translate(50, 48) scale(${headScale}) translate(-50, -48)`}
      >
        {/* Back Hair Layer (long braids / waves) */}
        {(sex === Sex.Female || app.hairStyle >= 2) && (
          <path
            d="M25 40 C20 56, 21 74, 28 84 L35 80 C32 68, 31 54, 33 42 Z M75 40 C80 56, 79 74, 72 84 L65 80 C68 68, 69 54, 67 42 Z"
            fill={hairShade}
          />
        )}

        {/* Neck */}
        <rect x="42" y="58" width="16" height="15" rx="4" fill={skin.shadow} />

        {/* Ears */}
        <ellipse
          cx="27"
          cy="47"
          rx="4"
          ry="6"
          fill={isFrostbitten ? '#93C5FD' : skin.ear}
        />
        <ellipse
          cx="73"
          cy="47"
          rx="4"
          ry="6"
          fill={isFrostbitten ? '#93C5FD' : skin.ear}
        />

        {/* Face Base */}
        <path
          d={
            ageStage === 'child'
              ? 'M30 34 C30 22, 70 22, 70 34 C70 55, 62 66, 50 66 C38 66, 30 55, 30 34 Z'
              : 'M29 32 C29 19, 71 19, 71 32 L69 52 C68 62, 59 68, 50 68 C41 68, 32 62, 31 52 Z'
          }
          fill={isSickly ? '#D8D4CE' : skin.base}
        />

        {/* Frostbite Tint on Cheeks & Nose */}
        {isFrostbitten && (
          <>
            <ellipse cx="37" cy="50" rx="5" ry="3" fill="#38BDF8" opacity="0.35" />
            <ellipse cx="63" cy="50" rx="5" ry="3" fill="#38BDF8" opacity="0.35" />
            <ellipse cx="50" cy="49" rx="3.5" ry="2.5" fill="#38BDF8" opacity="0.45" />
          </>
        )}

        {/* Sickly Under-Eye Shadows */}
        {isSickly && (
          <>
            <path d="M36 45 Q41 48 45 45" stroke="#64748B" strokeWidth="1.8" fill="none" />
            <path d="M55 45 Q59 48 64 45" stroke="#64748B" strokeWidth="1.8" fill="none" />
          </>
        )}

        {/* Age Lines (Middle-Aged & Elder) */}
        {(ageStage === 'middle' || ageStage === 'elder') && (
          <g stroke={skin.shadow} strokeWidth="1.3" fill="none" opacity="0.85">
            <path d="M38 34 Q50 32 62 34" />
            {ageStage === 'elder' && <path d="M40 31 Q50 29 60 31" />}
            <path d="M36 52 Q38 56 41 58" />
            <path d="M64 52 Q62 56 59 58" />
          </g>
        )}

        {/* Outlaw Forehead Ash Mark */}
        {isOutlaw && (
          <path
            d="M48 28 L52 35 M52 28 L48 35"
            stroke="#DC2626"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        )}

        {/* Battle Scar Across Face */}
        {isScarred && (
          <g stroke="#DC2626" strokeWidth="1.8" strokeLinecap="round" opacity="0.85">
            <path d="M56 35 L63 55" />
            <path d="M56 41 L60 40" strokeWidth="1.1" />
            <path d="M58 48 L62 47" strokeWidth="1.1" />
          </g>
        )}

        {/* Eyebrows */}
        <path d="M35 38 Q41 36 46 38" stroke={hairShade} strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d="M54 38 Q59 36 65 38" stroke={hairShade} strokeWidth="2.2" strokeLinecap="round" fill="none" />

        {/* Eyes */}
        <circle cx="41" cy="42.5" r={ageStage === 'child' ? 2.6 : 2.1} fill="#0F172A" />
        <circle cx="40.3" cy="41.8" r="0.7" fill="#F8FAFC" />

        {!isOneEyed ? (
          <>
            <circle cx="59" cy="42.5" r={ageStage === 'child' ? 2.6 : 2.1} fill="#0F172A" />
            <circle cx="58.3" cy="41.8" r="0.7" fill="#F8FAFC" />
          </>
        ) : (
          /* One-Eyed Odinic Leather Patch & Strap */
          <g>
            <path d="M31 32 L70 48" stroke="#1E293B" strokeWidth="2.4" />
            <ellipse cx="59" cy="42.5" rx="5.5" ry="4.2" fill="#0F172A" stroke="#475569" strokeWidth="1" />
          </g>
        )}

        {/* Nose */}
        <path d="M50 41 L48.5 50 L52 50.5" stroke={skin.shadow} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />

        {/* Mouth (visible when no full beard) */}
        {(!showBeard || app.beardStyle === 0) && (
          <path
            d={ageStage === 'child' ? 'M45 56 Q50 59 55 56' : 'M45 56.5 Q50 58 55 56.5'}
            stroke="#9F5843"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* Beard Layer (Male 17+) */}
        {showBeard && app.beardStyle > 0 && (
          <g fill={hairFill} stroke={hairShade} strokeWidth="0.8">
            {app.beardStyle === 1 && (
              /* Shorttrimmed Norse Beard */
              <path d="M31 50 C32 63, 41 69, 50 69 C59 69, 68 63, 69 50 L64 52 C62 59, 56 62, 50 62 C44 62, 38 59, 36 52 Z" />
            )}
            {app.beardStyle === 2 && (
              /* Braided Forked Viking Beard */
              <path d="M31 49 C31 63, 39 70, 45 77 L49 71 L51 71 L55 77 C61 70, 69 63, 69 49 L63 52 C60 58, 55 60, 50 60 C45 60, 40 58, 37 52 Z" />
            )}
            {app.beardStyle >= 3 && (
              /* Full Jarl / Elder Flowing Beard */
              <path
                d={
                  ageStage === 'elder'
                    ? 'M30 48 C30 66, 38 78, 50 84 C62 78, 70 66, 70 48 L63 52 C60 58, 55 60, 50 60 C45 60, 40 58, 37 52 Z'
                    : 'M30 48 C30 64, 39 74, 50 78 C61 74, 70 64, 70 48 L63 52 C60 58, 55 60, 50 60 C45 60, 40 58, 37 52 Z'
                }
              />
            )}
            {/* Moustache */}
            <path d="M41 55 Q50 51 59 55 Q55 58 50 56 Q45 58 41 55 Z" fill={hairShade} />
          </g>
        )}

        {/* Top Hair Layer (when not covered by full helmet) */}
        {!isWarriorHelm && (
          <g fill={hairFill}>
            {sex === Sex.Female ? (
              <>
                <path d="M27 40 C26 21, 40 16, 50 16 C60 16, 74 21, 73 40 C68 30, 60 27, 50 27 C40 27, 32 30, 27 40 Z" />
                {/* Shieldmaiden Side Braids */}
                <path d="M28 38 L24 68 L30 68 L32 40 Z" fill={hairFill} />
                <path d="M72 38 L76 68 L70 68 L68 40 Z" fill={hairFill} />
                <rect x="24" y="62" width="6" height="2.5" fill="#F59E0B" />
                <rect x="70" y="62" width="6" height="2.5" fill="#F59E0B" />
              </>
            ) : app.hairStyle === 0 ? (
              /* Swept Undercut */
              <path d="M29 34 C30 19, 44 16, 58 18 C67 19, 71 26, 70 34 C63 26, 44 25, 29 34 Z" />
            ) : (
              /* Classic Norse Parted Mane */
              <path d="M27 39 C26 20, 39 16, 50 16 C61 16, 74 20, 73 39 C67 29, 58 26, 50 26 C42 26, 33 29, 27 39 Z" />
            )}
          </g>
        )}

        {/* Spectacle / Nasal Norse Iron Helmet */}
        {isWarriorHelm && !isCrowned && (
          <g>
            <path
              d="M27 37 C27 18, 73 18, 73 37 Z"
              fill="#64748B"
              stroke="#94A3B8"
              strokeWidth="1.5"
            />
            {/* Center Ridge & Nasal Guard */}
            <rect x="48.2" y="18" width="3.6" height="28" rx="1.5" fill="#94A3B8" />
            {/* Brow Rim */}
            <path d="M26 36 Q50 33 74 36" stroke="#CBD5E1" strokeWidth="2.5" fill="none" />
          </g>
        )}

        {/* Royal Konungr Crown */}
        {isCrowned && (
          <g>
            <path
              d="M28 33 L31 19 L40 26 L50 15 L60 26 L69 19 L72 33 Z"
              fill="#F59E0B"
              stroke="#FDE68A"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <circle cx="50" cy="25" r="2.2" fill="#38BDF8" />
            <circle cx="38" cy="28" r="1.6" fill="#DC2626" />
            <circle cx="62" cy="28" r="1.6" fill="#DC2626" />
          </g>
        )}
      </g>
    </svg>
  );
}
