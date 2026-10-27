import { useState } from 'react';
import {
  BookOpen,
  Check,
  Copy,
  Download,
  FileCode2,
  FolderOpen,
  Globe,
  Save,
  Shield,
  Sliders,
  Trash2,
  Type,
  Upload,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import {
  deleteSlot,
  exportSaveAsText,
  importSaveFromText,
  listSaveSlots,
  loadFromSlot,
  saveToSlot,
} from '../engine/storage';
import { formatPersonName } from '../i18n/gameDataFa';
import { isRtl, SHORT_TITLE_LABELS } from '../i18n/ui';
import {
  ContentIntensity,
  Difficulty,
  FullGameState,
  GameSettings,
  Language,
  TitleRank,
} from '../types/game';
import { NordicAccordion, NordicSelect, NordicSelectOption } from './NordicControls';

interface SettingsSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentState: FullGameState | null;
  settings: GameSettings;
  onUpdateSettings: (next: GameSettings) => void;
  onLoadState: (loaded: FullGameState) => void;
  onReturnToTitle?: () => void;
}

export function SettingsSaveModal({
  isOpen,
  onClose,
  currentState,
  settings,
  onUpdateSettings,
  onLoadState,
  onReturnToTitle,
}: SettingsSaveModalProps) {
  const [slotsVersion, setSlotsVersion] = useState(0);
  const [importText, setImportText] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [copiedExport, setCopiedExport] = useState(false);

  const [slotsOpen, setSlotsOpen] = useState<boolean>(true);
  const [prefsOpen, setPrefsOpen] = useState<boolean>(true);
  const [exportOpen, setExportOpen] = useState<boolean>(false);

  if (!isOpen) return null;

  const lang = settings.language;
  const isFa = lang === 'fa';
  const rtl = isRtl(lang);

  const slots = slotsVersion >= 0 ? listSaveSlots() : [];

  const handleSaveSlot = (slot: 1 | 2 | 3) => {
    if (!currentState) return;
    const ok = saveToSlot(slot, currentState);
    setSlotsVersion((v) => v + 1);
    setStatusMessage(
      ok
        ? isFa
          ? `بازی در جایگاه ${slot} ذخیره شد.`
          : `Saved saga to Slot ${slot}.`
        : isFa
          ? 'حافظه مرورگر پر است — از خروجی متنی استفاده کنید.'
          : 'Storage full — try Export Text.'
    );
  };

  const handleLoadSlot = (slot: 1 | 2 | 3) => {
    const loaded = loadFromSlot(slot);
    if (loaded) {
      onLoadState(loaded);
      onClose();
    } else {
      setStatusMessage(
        isFa ? `جایگاه ${slot} قابل خواندن نیست.` : `Slot ${slot} could not be read.`
      );
    }
  };

  const handleDeleteSlot = (slot: 1 | 2 | 3) => {
    deleteSlot(slot);
    setSlotsVersion((v) => v + 1);
    setStatusMessage(isFa ? `جایگاه ${slot} پاک شد.` : `Cleared Slot ${slot}.`);
  };

  const handleCopyExport = () => {
    if (!currentState) return;
    const code = exportSaveAsText(currentState);
    navigator.clipboard?.writeText(code).catch(() => {});
    setImportText(code);
    setCopiedExport(true);
    setStatusMessage(
      isFa
        ? 'کد ذخیره کپی شد و در کادر پایین قرار گرفت.'
        : 'Export code copied to clipboard and shown below.'
    );
    setTimeout(() => setCopiedExport(false), 2000);
  };

  const handleImportCode = () => {
    const parsed = importSaveFromText(importText);
    if (!parsed) {
      setStatusMessage(
        isFa
          ? 'کد ذخیره نامعتبر است — مطمئن شوید متن کامل ELDSAGA1 را جای‌گذاری کرده‌اید.'
          : 'Invalid save text — check that you pasted the complete ELDSAGA1 string.'
      );
      return;
    }
    onLoadState(parsed);
    onClose();
  };

  const languageOptions: NordicSelectOption<Language>[] = [
    {
      value: 'fa',
      label: 'فارسی (راست‌به‌چپ)',
      sublabel: 'ترجمه کامل داستان، رویدادهای تاریخی و رابط کاربری',
      badge: 'FA',
      badgeTone: 'gold',
    },
    {
      value: 'en',
      label: 'English (Left-to-Right)',
      sublabel: 'Full saga text, historical events & Nordic chronicle',
      badge: 'EN',
      badgeTone: 'ice',
    },
  ];

  const difficultyOptions: NordicSelectOption<Difficulty>[] = [
    {
      value: Difficulty.Forgiving,
      label: isFa ? 'بخشنده و آسان‌تر' : 'Forgiving',
      sublabel: isFa ? 'خطر مرگ‌ومیر کمتر در نبرد و زمستان' : 'Lower mortality in battle & winter',
      badge: isFa ? 'ملایم' : 'Gentle',
      badgeTone: 'emerald',
    },
    {
      value: Difficulty.Historical,
      label: isFa ? 'تاریخی و متعادل' : 'Historical',
      sublabel: isFa ? 'تعادل استاندارد عصر وایکینگ‌ها' : 'Authentic Viking Age risk & reward',
      badge: isFa ? 'پیشنهادی' : 'Balanced',
      badgeTone: 'gold',
    },
    {
      value: Difficulty.Brutal,
      label: isFa ? 'بی‌رحمانه و مرگبار' : 'Brutal',
      sublabel: isFa ? 'تقدیر سخت‌گیرانه؛ هر زخم می‌تواند کشنده باشد' : 'Unforgiving wyrd; wounds cut deep',
      badge: isFa ? 'سخت' : 'Hard',
      badgeTone: 'danger',
    },
  ];

  const intensityOptions: NordicSelectOption<ContentIntensity>[] = [
    {
      value: ContentIntensity.Normal,
      label: isFa ? 'عادی (واقع‌گرایی تاریخی)' : 'Normal (Historical Realism)',
      sublabel: isFa ? 'روایت کامل نبردها و حماسه‌های نورس' : 'Authentic saga battle descriptions',
      badge: isFa ? 'کامل' : 'Standard',
      badgeTone: 'gold',
    },
    {
      value: ContentIntensity.Mild,
      label: isFa ? 'ملایم‌تر' : 'Mild',
      sublabel: isFa ? 'توصیف‌های نرم‌تر در رویدادهای جنگی' : 'Softened combat & raid descriptions',
      badge: isFa ? 'نرم' : 'Soft',
      badgeTone: 'ice',
    },
  ];

  const textSizeOptions: NordicSelectOption<'sm' | 'base' | 'lg'>[] = [
    {
      value: 'sm',
      label: isFa ? 'فشرده' : 'Compact',
      sublabel: isFa ? 'نمایش متن بیشتر در یک صفحه' : 'Fits more chronicle cards onscreen',
      badge: 'S',
      badgeTone: 'muted',
    },
    {
      value: 'base',
      label: isFa ? 'استاندارد' : 'Standard',
      sublabel: isFa ? 'اندازه متعادل برای موبایل و دسکتاپ' : 'Balanced default reading size',
      badge: 'M',
      badgeTone: 'ice',
    },
    {
      value: 'lg',
      label: isFa ? 'بزرگ و خوانا' : 'Large Reader',
      sublabel: isFa ? 'خوانایی بیشتر برای متون داستانی' : 'Larger story & choice typography',
      badge: 'L',
      badgeTone: 'gold',
    },
  ];

  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs p-2.5 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[calc(100dvh-1.25rem)] sm:max-h-[min(88dvh,800px)] flex flex-col bg-[#0E1622] border border-[#24354C] rounded-2xl overflow-hidden text-start shadow-[0_24px_64px_rgba(0,0,0,0.88)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 px-4 sm:px-5 py-3.5 sm:py-4 border-b border-[#1E2D40] bg-[#121C2B] flex items-center justify-between gap-3">
          <h2 id="settings-modal-title" className="font-saga text-lg sm:text-2xl font-bold text-[#F1F5F9] min-w-0 truncate">
            {isFa ? 'ذخیره بازی و تنظیمات' : 'Saves & Game Settings'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={isFa ? 'بستن پنجره' : 'Close modal'}
            className="shrink-0 min-w-[44px] min-h-[44px] rounded-xl bg-[#182638] hover:bg-[#21334A] border border-[#2A3E59] flex items-center justify-center text-[#94A3B8] hover:text-[#F1F5F9] cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 min-h-0 px-3.5 sm:px-6 py-4 space-y-3.5 overflow-y-auto">
          {statusMessage && (
            <div className="px-3.5 py-2.5 rounded-xl bg-[#1F1A12] border border-[#F59E0B] text-xs text-[#F1F5F9]">
              {statusMessage}
            </div>
          )}

          {/* 1. Save Slots Accordion */}
          <NordicAccordion
            title={isFa ? 'جایگاه‌های ذخیره بازی' : 'Saga Save Slots'}
            subtitle={
              isFa
                ? 'ذخیره خودکار در پایان هر سال فعال است'
                : 'Your saga also autosaves automatically every year'
            }
            icon={<Save className="w-4 h-4" />}
            accent="gold"
            isOpen={slotsOpen}
            onToggle={() => setSlotsOpen((prev) => !prev)}
          >
            <div className="space-y-2">
              {([1, 2, 3] as const).map((slotNum, idx) => {
                const meta = slots[idx];
                const localizedRank =
                  meta && SHORT_TITLE_LABELS[lang][meta.title as TitleRank]
                    ? SHORT_TITLE_LABELS[lang][meta.title as TitleRank]
                    : meta?.title;
                return (
                  <div
                    key={slotNum}
                    className="p-3 rounded-xl bg-[#121C2A] border border-[#223247] flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="text-xs min-w-0">
                      <div className="font-semibold text-[#F1F5F9]">
                        {isFa ? `جایگاه ${slotNum}: ` : `Slot ${slotNum}: `}
                        {meta ? (
                          <span>
                            {formatPersonName(meta.rulerName, lang)} · {localizedRank} (
                            {isFa
                              ? `سال ${meta.year} م، نسل ${meta.generation}`
                              : `${meta.year} AD, Gen ${meta.generation}`}
                            )
                          </span>
                        ) : (
                          <span className="text-[#94A3B8] font-normal">
                            {isFa ? 'خالی' : 'Empty'}
                          </span>
                        )}
                      </div>
                      {meta && (
                        <div className="text-[11px] text-[#94A3B8] font-mono tabular-nums mt-0.5">
                          {isFa
                            ? `شهرت ${meta.fame} · ذخیره: ${meta.savedAt}`
                            : `Fame ${meta.fame} · Saved ${meta.savedAt}`}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {currentState && (
                        <button
                          type="button"
                          onClick={() => handleSaveSlot(slotNum)}
                          className="min-h-[44px] px-3.5 text-xs font-bold bg-[#F59E0B] hover:bg-[#FBBF24] text-[#0B1118] rounded-lg inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors"
                        >
                          <Save className="w-3.5 h-3.5" />
                          {isFa ? 'ذخیره' : 'Save'}
                        </button>
                      )}
                      {meta && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleLoadSlot(slotNum)}
                            className="min-h-[44px] px-3.5 text-xs font-semibold bg-[#182638] border border-[#2C415C] hover:border-[#38BDF8] text-[#F1F5F9] rounded-lg inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors"
                          >
                            <FolderOpen className="w-3.5 h-3.5 text-[#38BDF8]" />
                            {isFa ? 'بارگذاری' : 'Load'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSlot(slotNum)}
                            aria-label={`Delete Slot ${slotNum}`}
                            className="min-w-[44px] min-h-[44px] rounded-lg hover:bg-[#24161B] flex items-center justify-center text-[#94A3B8] hover:text-[#EF4444] cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </NordicAccordion>

          {/* 2. Gameplay, Audio & Display Settings Accordion */}
          <NordicAccordion
            title={isFa ? 'تنظیمات گیم‌پلی، صدا و نمایش' : 'Gameplay, Audio & Display'}
            subtitle={
              isFa
                ? 'درجه سختی، اندازه نوشته، موسیقی محیطی و جلوه‌های بصری'
                : 'Difficulty, typography, Viking soundscape & visual overlays'
            }
            icon={<Sliders className="w-4 h-4" />}
            accent="ice"
            isOpen={prefsOpen}
            onToggle={() => setPrefsOpen((prev) => !prev)}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Language Switcher (only shown once game has started) */}
                {currentState && (
                  <NordicSelect
                    label={isFa ? 'زبان بازی / Language' : 'Game Language / زبان بازی'}
                    value={lang}
                    options={languageOptions}
                    onChange={(nextLang) => onUpdateSettings({ ...settings, language: nextLang })}
                    icon={<Globe className="w-4 h-4 text-[#F59E0B]" />}
                  />
                )}

                <NordicSelect
                  label={isFa ? 'درجه سختی' : 'Difficulty'}
                  value={settings.difficulty}
                  options={difficultyOptions}
                  onChange={(nextDiff) =>
                    onUpdateSettings({ ...settings, difficulty: nextDiff })
                  }
                  icon={<Shield className="w-4 h-4 text-[#F59E0B]" />}
                />

                <NordicSelect
                  label={isFa ? 'لحن توصیف نبردها' : 'Narrative Intensity'}
                  value={settings.contentIntensity}
                  options={intensityOptions}
                  onChange={(nextInt) =>
                    onUpdateSettings({ ...settings, contentIntensity: nextInt })
                  }
                  icon={<BookOpen className="w-4 h-4 text-[#38BDF8]" />}
                />

                <NordicSelect
                  label={isFa ? 'اندازه نوشته‌ها' : 'Text Size'}
                  value={settings.textSize}
                  options={textSizeOptions}
                  onChange={(nextSize) =>
                    onUpdateSettings({ ...settings, textSize: nextSize })
                  }
                  icon={<Type className="w-4 h-4 text-[#38BDF8]" />}
                />
              </div>

              {/* Ambient Soundscape Control */}
              <div className="p-3.5 rounded-xl bg-[#121C2A] border border-[#223247] space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {settings.ambientAudioEnabled ? (
                      <Volume2 className="w-4 h-4 text-[#F59E0B] shrink-0" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-[#64748B] shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="font-semibold text-[#F1F5F9]">
                        {isFa
                          ? 'فضای صوتی محیطی وایکینگی (Ambient)'
                          : 'Viking Ambient Soundscape'}
                      </div>
                      <div className="text-[#94A3B8]">
                        {isFa
                          ? 'طنین بم تاگلهارپا و باد آبدره‌های شمال هنگام بازی'
                          : 'Low-frequency tagelharpa drone & fjord wind during play'}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.ambientAudioEnabled}
                    onClick={() =>
                      onUpdateSettings({
                        ...settings,
                        ambientAudioEnabled: !settings.ambientAudioEnabled,
                      })
                    }
                    className={`min-h-[44px] px-4 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap ${
                      settings.ambientAudioEnabled
                        ? 'bg-[#F59E0B] text-[#0B1118]'
                        : 'bg-[#0B1118] border border-[#26384F] text-[#94A3B8] hover:text-[#F1F5F9]'
                    }`}
                  >
                    {settings.ambientAudioEnabled
                      ? isFa
                        ? 'فعال'
                        : 'Enabled'
                      : isFa
                        ? 'خاموش'
                        : 'Muted'}
                  </button>
                </div>

                {settings.ambientAudioEnabled && (
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-[#94A3B8] whitespace-nowrap">
                      {isFa ? 'بلندی صدای محیط:' : 'Volume:'}
                    </span>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      step={5}
                      aria-label={isFa ? 'بلندی صدای محیط' : 'Ambient Volume'}
                      value={Math.round((settings.ambientVolume ?? 0.55) * 100)}
                      onChange={(e) =>
                        onUpdateSettings({
                          ...settings,
                          ambientVolume: Number(e.target.value) / 100,
                        })
                      }
                      className="flex-1 accent-[#F59E0B] cursor-pointer"
                    />
                    <span className="w-10 text-end font-mono tabular-nums text-[#F1F5F9]">
                      {Math.round((settings.ambientVolume ?? 0.55) * 100)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Clean Toggle Buttons Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.soundEnabled}
                  onClick={() =>
                    onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })
                  }
                  className={`min-h-[44px] px-3 py-2 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                    settings.soundEnabled
                      ? 'bg-[#152438] border-[#38BDF8]/60 text-[#F1F5F9]'
                      : 'bg-[#0B1118] border-[#1E2D40] text-[#94A3B8]'
                  }`}
                >
                  <span className="font-medium truncate">
                    {isFa ? 'افکت صوتی دکمه‌ها' : 'Sound Effects'}
                  </span>
                  <span
                    className={`font-mono font-bold ${
                      settings.soundEnabled ? 'text-[#38BDF8]' : 'text-[#64748B]'
                    }`}
                  >
                    {settings.soundEnabled ? (isFa ? 'روشن' : 'ON') : isFa ? 'خاموش' : 'OFF'}
                  </span>
                </button>

                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.weatherOverlayEnabled}
                  onClick={() =>
                    onUpdateSettings({
                      ...settings,
                      weatherOverlayEnabled: !settings.weatherOverlayEnabled,
                    })
                  }
                  className={`min-h-[44px] px-3 py-2 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                    settings.weatherOverlayEnabled
                      ? 'bg-[#152438] border-[#38BDF8]/60 text-[#F1F5F9]'
                      : 'bg-[#0B1118] border-[#1E2D40] text-[#94A3B8]'
                  }`}
                >
                  <span className="font-medium truncate">
                    {isFa ? 'برف و باران فصلی' : 'Weather Overlay'}
                  </span>
                  <span
                    className={`font-mono font-bold ${
                      settings.weatherOverlayEnabled ? 'text-[#38BDF8]' : 'text-[#64748B]'
                    }`}
                  >
                    {settings.weatherOverlayEnabled
                      ? isFa
                        ? 'روشن'
                        : 'ON'
                      : isFa
                        ? 'خاموش'
                        : 'OFF'}
                  </span>
                </button>

                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.emberAnimation}
                  onClick={() =>
                    onUpdateSettings({
                      ...settings,
                      emberAnimation: !settings.emberAnimation,
                    })
                  }
                  className={`min-h-[44px] px-3 py-2 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                    settings.emberAnimation
                      ? 'bg-[#152438] border-[#F59E0B]/60 text-[#F1F5F9]'
                      : 'bg-[#0B1118] border-[#1E2D40] text-[#94A3B8]'
                  }`}
                >
                  <span className="font-medium truncate">
                    {isFa ? 'ذرات اخگر آتش' : 'Hearth Embers'}
                  </span>
                  <span
                    className={`font-mono font-bold ${
                      settings.emberAnimation ? 'text-[#F59E0B]' : 'text-[#64748B]'
                    }`}
                  >
                    {settings.emberAnimation ? (isFa ? 'روشن' : 'ON') : isFa ? 'خاموش' : 'OFF'}
                  </span>
                </button>
              </div>
            </div>
          </NordicAccordion>

          {/* 3. Export / Import Save as Text Accordion (collapsed by default) */}
          <NordicAccordion
            title={isFa ? 'خروجی و بازیابی کد متنی ذخیره' : 'Export / Import Save Code'}
            subtitle={
              isFa
                ? 'کپی رشته متنی ELDSAGA1 برای پشتیبان‌گیری یا انتقال به دستگاه دیگر'
                : 'Copy or paste an ELDSAGA1 save code to back up or transfer your saga'
            }
            icon={<FileCode2 className="w-4 h-4" />}
            accent="neutral"
            isOpen={exportOpen}
            onToggle={() => setExportOpen((prev) => !prev)}
          >
            <div className="space-y-3">
              {currentState && (
                <button
                  type="button"
                  onClick={handleCopyExport}
                  className="min-h-[44px] px-3.5 text-xs font-semibold bg-[#182638] border border-[#2C415C] hover:border-[#F59E0B] text-[#F1F5F9] rounded-xl inline-flex items-center gap-2 cursor-pointer whitespace-nowrap transition-colors"
                >
                  {copiedExport ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-[#F59E0B]" />
                  )}
                  {copiedExport
                    ? isFa
                      ? 'کپی شد!'
                      : 'Copied!'
                    : isFa
                      ? 'کپی کد ذخیره فعلی'
                      : 'Copy Current Saga Code'}
                </button>
              )}

              <textarea
                dir="ltr"
                rows={2}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={
                  isFa
                    ? 'کد ذخیره ELDSAGA1:... را برای بازیابی اینجا قرار دهید...'
                    : 'Paste an ELDSAGA1:... save string here to import...'
                }
                className="w-full p-3 text-xs font-mono bg-[#0B1118] border border-[#24354C] rounded-xl text-[#F1F5F9] focus:outline-none focus:border-[#F59E0B]"
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={!importText.trim()}
                  onClick={handleImportCode}
                  className="min-h-[44px] px-4 text-xs font-bold bg-[#0284C7] hover:bg-[#38BDF8] hover:text-[#0B1118] disabled:bg-[#1E293B] disabled:text-[#64748B] text-white rounded-xl inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  {isFa ? 'بارگذاری کد متنی' : 'Import Save String'}
                </button>
              </div>
            </div>
          </NordicAccordion>

          {onReturnToTitle && currentState && (
            <div className="pt-2 border-t border-[#1E2D40] flex flex-wrap justify-between items-center gap-3">
              <span className="text-xs text-[#94A3B8]">
                {isFa
                  ? 'می‌خواهید دوره تاریخی یا شخصیت تازه‌ای بسازید؟'
                  : 'Want to start a different historical era or character?'}
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onReturnToTitle();
                }}
                className="min-h-[44px] px-4 py-2 text-xs font-semibold bg-[#191116] border border-[#7F1D1D] hover:border-[#EF4444] text-[#FCA5A5] rounded-xl inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors"
              >
                <Download className="w-3.5 h-3.5 rotate-90" />
                {isFa ? 'بازگشت به صفحه ساخت شخصیت' : 'Return to Character Creation'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
