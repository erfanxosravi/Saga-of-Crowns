import {
  CharacterAppearance,
  ContentIntensity,
  Difficulty,
  FullGameState,
  GameScreen,
  GameSettings,
  Language,
  Season,
  TimeStepMode,
} from '../types/game';

const AUTOSAVE_KEY = 'eldsaga_autosave_v1';
const SLOT_PREFIX = 'eldsaga_slot_v1_';
const SETTINGS_KEY = 'eldsaga_settings_v1';
const LANG_PREF_KEY = 'eldsaga_lang_pref_v1';
const SESSION_ACTIVE_KEY = 'eldsaga_session_active_v1';

export const CURRENT_SAVE_VERSION = 2;

export interface SaveSlotSummary {
  slot: number;
  savedAt: string;
  rulerName: string;
  title: string;
  year: number;
  generation: number;
  fame: number;
}

export const DEFAULT_SETTINGS: GameSettings = {
  language: 'fa',
  textSize: 'base',
  emberAnimation: true,
  weatherOverlayEnabled: true,
  soundEnabled: true,
  ambientAudioEnabled: true,
  ambientVolume: 0.55,
  difficulty: Difficulty.Historical,
  contentIntensity: ContentIntensity.Normal,
  timeStepMode: TimeStepMode.Year,
};

export function deriveAppearanceFromId(idStr: string): CharacterAppearance {
  let h = 2166136261;
  for (let i = 0; i < idStr.length; i++) {
    h ^= idStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const u = h >>> 0;
  const hairColors: CharacterAppearance['hairColor'][] = ['blonde', 'red', 'brown', 'black'];
  return {
    skinTone: (u % 4) as 0 | 1 | 2 | 3,
    hairColor: hairColors[(u >>> 2) % 4],
    hairStyle: ((u >>> 4) % 4) as 0 | 1 | 2 | 3,
    beardStyle: ((u >>> 6) % 4) as 0 | 1 | 2 | 3,
  };
}

export function loadSettings(): GameSettings {
  let persistedLang: Language = 'fa';
  try {
    const savedLang = localStorage.getItem(LANG_PREF_KEY);
    if (savedLang === 'en' || savedLang === 'fa') {
      persistedLang = savedLang;
    }
  } catch {
    // Fallback to Persian default
  }

  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS, language: persistedLang };
    const parsed = JSON.parse(raw);
    const merged: GameSettings = {
      ...DEFAULT_SETTINGS,
      ...parsed,
      language: persistedLang,
      // Enforce crisp BitLife year-by-year flow
      timeStepMode: TimeStepMode.Year,
    };
    if (typeof merged.weatherOverlayEnabled !== 'boolean') {
      merged.weatherOverlayEnabled = DEFAULT_SETTINGS.weatherOverlayEnabled;
    }
    if (typeof merged.ambientAudioEnabled !== 'boolean') {
      merged.ambientAudioEnabled = DEFAULT_SETTINGS.ambientAudioEnabled;
    }
    if (typeof merged.ambientVolume !== 'number' || Number.isNaN(merged.ambientVolume)) {
      merged.ambientVolume = DEFAULT_SETTINGS.ambientVolume;
    } else {
      merged.ambientVolume = Math.max(0.05, Math.min(1, merged.ambientVolume));
    }
    return merged;
  } catch {
    return { ...DEFAULT_SETTINGS, language: persistedLang };
  }
}

export function saveLanguagePreference(lang: Language): void {
  try {
    localStorage.setItem(LANG_PREF_KEY, lang);
  } catch {
    // Ignore storage quota errors
  }
}

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ ...settings, timeStepMode: TimeStepMode.Year })
    );
  } catch {
    // Ignore storage quota errors
  }
}

export function setSessionActive(active: boolean): void {
  try {
    if (active) {
      sessionStorage.setItem(SESSION_ACTIVE_KEY, '1');
    } else {
      sessionStorage.removeItem(SESSION_ACTIVE_KEY);
    }
  } catch {
    // Ignore restricted sessionStorage
  }
}

export function isSessionActive(): boolean {
  try {
    return sessionStorage.getItem(SESSION_ACTIVE_KEY) === '1';
  } catch {
    return false;
  }
}

function deduplicateById<T extends { id: string }>(items: T[] | undefined): T[] {
  if (!Array.isArray(items)) return [];
  const seen = new Set<string>();
  return items.map((item, idx) => {
    let nextId = item.id || `item_${idx}`;
    if (seen.has(nextId)) {
      nextId = `${nextId}_${idx}`;
    }
    seen.add(nextId);
    return nextId === item.id ? item : { ...item, id: nextId };
  });
}

/**
 * Non-destructive v1 -> v2 save migration so existing saves in localStorage or ELDSAGA1
 * export strings load cleanly with all new Viking BitLife fields populated.
 */
export function migrateGameState(raw: unknown): FullGameState | null {
  if (!raw || typeof raw !== 'object') return null;
  const parsed = raw as Partial<FullGameState>;
  if (!parsed.character || typeof parsed.year !== 'number' || !parsed.realm) {
    return null;
  }

  const charId = parsed.character.id || `char_${parsed.year}`;
  const appearance = parsed.character.appearance ?? deriveAppearanceFromId(charId);

  const migratedLogs = deduplicateById(parsed.lifeLog).slice(-160);

  return {
    ...(parsed as FullGameState),
    saveVersion: CURRENT_SAVE_VERSION,
    screen: GameScreen.PLAYING,
    season: parsed.season ?? Season.Spring,
    actionsRemainingThisTurn:
      typeof parsed.actionsRemainingThisTurn === 'number' ? parsed.actionsRemainingThisTurn : 2,
    yearlyActivitiesUsed: parsed.yearlyActivitiesUsed ?? {},
    builtThisYear: Boolean(parsed.builtThisYear),
    familyInteractionsUsed: parsed.familyInteractionsUsed ?? {},
    onboardingStep:
      typeof parsed.onboardingStep === 'number'
        ? parsed.onboardingStep
        : migratedLogs.length > 3
          ? 3
          : 0,
    onboardingDismissed:
      typeof parsed.onboardingDismissed === 'boolean'
        ? parsed.onboardingDismissed
        : migratedLogs.length > 3,
    epilogue1066Shown: Boolean(parsed.epilogue1066Shown || parsed.year > 1066),
    pending1066Epilogue: Boolean(parsed.pending1066Epilogue),
    freeModeAfter1066: Boolean(parsed.freeModeAfter1066 || parsed.year > 1066),
    totalRaidsWon:
      typeof parsed.totalRaidsWon === 'number'
        ? parsed.totalRaidsWon
        : Math.max(0, parsed.character.raidsLed ?? 0),
    marriedBloodEnemy: Boolean(parsed.marriedBloodEnemy),
    divorcesCount: typeof parsed.divorcesCount === 'number' ? parsed.divorcesCount : 0,
    conquestsWon: typeof parsed.conquestsWon === 'number' ? parsed.conquestsWon : 0,
    character: {
      ...parsed.character,
      appearance,
      traits: Array.isArray(parsed.character.traits) ? parsed.character.traits : [],
    },
    realm: {
      ...parsed.realm,
      holdings: Array.isArray(parsed.realm.holdings) ? parsed.realm.holdings : [],
      thrallsOwned: typeof parsed.realm.thrallsOwned === 'number' ? parsed.realm.thrallsOwned : 0,
    },
    relationships: deduplicateById(parsed.relationships),
    ancestors: deduplicateById(parsed.ancestors),
    discoveredSettlements: Array.isArray(parsed.discoveredSettlements)
      ? parsed.discoveredSettlements
      : [parsed.character.locationId],
    flags: Array.isArray(parsed.flags) ? parsed.flags : [],
    divergences: Array.isArray(parsed.divergences) ? parsed.divergences : [],
    divergencesFa: Array.isArray(parsed.divergencesFa) ? parsed.divergencesFa : [],
    achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
    scheduledChains: Array.isArray(parsed.scheduledChains) ? parsed.scheduledChains : [],
    firedUniqueEvents: Array.isArray(parsed.firedUniqueEvents) ? parsed.firedUniqueEvents : [],
    lifeLog: migratedLogs,
    activeEvent: parsed.activeEvent ?? null,
    lastOutcomeBanner: parsed.lastOutcomeBanner ?? null,
    pendingDeath: parsed.pendingDeath ?? null,
    settings: {
      ...DEFAULT_SETTINGS,
      ...(parsed.settings ?? {}),
      timeStepMode: TimeStepMode.Year,
    },
  };
}

export function saveAutosave(state: FullGameState): void {
  try {
    const trimmed: FullGameState =
      state.lifeLog.length > 160
        ? { ...state, lifeLog: state.lifeLog.slice(-160) }
        : state;
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(trimmed));
  } catch {
    // Ignore quota errors
  }
}

export function loadAutosave(): FullGameState | null {
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY);
    if (!raw) return null;
    return migrateGameState(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveToSlot(slot: 1 | 2 | 3, state: FullGameState): boolean {
  try {
    const payload = {
      meta: {
        slot,
        savedAt: new Date().toLocaleString(),
        rulerName: `${state.character.givenName} ${state.character.patronymic}`,
        title: state.character.title,
        year: state.year,
        generation: state.generation,
        fame: state.realm.fame,
      } satisfies SaveSlotSummary,
      state:
        state.lifeLog.length > 160
          ? { ...state, lifeLog: state.lifeLog.slice(-160) }
          : state,
    };
    localStorage.setItem(`${SLOT_PREFIX}${slot}`, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export function loadFromSlot(slot: 1 | 2 | 3): FullGameState | null {
  try {
    const raw = localStorage.getItem(`${SLOT_PREFIX}${slot}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.state) return null;
    return migrateGameState(parsed.state);
  } catch {
    return null;
  }
}

export function deleteSlot(slot: 1 | 2 | 3): void {
  try {
    localStorage.removeItem(`${SLOT_PREFIX}${slot}`);
  } catch {
    // Ignore
  }
}

export function listSaveSlots(): (SaveSlotSummary | null)[] {
  return ([1, 2, 3] as const).map((slot) => {
    try {
      const raw = localStorage.getItem(`${SLOT_PREFIX}${slot}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return (parsed?.meta as SaveSlotSummary) ?? null;
    } catch {
      return null;
    }
  });
}

export function exportSaveAsText(state: FullGameState): string {
  const json = JSON.stringify(state);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return `ELDSAGA1:${btoa(binary)}`;
}

export function importSaveFromText(encoded: string): FullGameState | null {
  try {
    const trimmed = encoded.trim();
    const rawB64 = trimmed.startsWith('ELDSAGA1:') ? trimmed.slice('ELDSAGA1:'.length) : trimmed;
    const binary = atob(rawB64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    return migrateGameState(JSON.parse(json));
  } catch {
    return null;
  }
}
