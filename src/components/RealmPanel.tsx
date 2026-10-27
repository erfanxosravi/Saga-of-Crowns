import { useState } from 'react';
import { Castle, Check, Coins, Crown, Hammer, MapPin, Ship } from 'lucide-react';
import { SETTLEMENTS_BY_ID } from '../data/geography';
import { BUILDINGS_CATALOG, WIN_GOALS } from '../data/namesAndTraits';
import {
  getClaimableNextTitle,
  getNextTitleRequirementText,
  hasBoathouse,
  isFortifiedEnemyCity,
} from '../engine/gameEngine';
import { BUILDINGS_FA, SETTLEMENTS_FA, WIN_GOALS_FA } from '../i18n/gameDataFa';
import { RELIGION_LABELS, SHORT_TITLE_LABELS, TITLE_LABELS } from '../i18n/ui';
import { BuildingType, FullGameState } from '../types/game';
import { NordicAccordion, NordicSelect, NordicSelectOption } from './NordicControls';

interface RealmPanelProps {
  state: FullGameState;
  onClaimRank: () => void;
  onBuildShipOrHird: (action: 'recruit_hird' | 'build_longship' | 'build_knarr') => void;
  onBuildHoldingStructure: (settlementId: string, building: BuildingType) => void;
  onClearFirstFarm: () => void;
  onConquerCity?: (settlementId: string) => void;
}

type ForceActionId = 'recruit_hird' | 'build_longship' | 'build_knarr';

export function RealmPanel({
  state,
  onClaimRank,
  onBuildShipOrHird,
  onBuildHoldingStructure,
  onClearFirstFarm,
  onConquerCity,
}: RealmPanelProps) {
  const lang = state.settings.language;
  const isFa = lang === 'fa';

  const [openDrawer, setOpenDrawer] = useState<'forces' | 'estates' | null>('forces');
  const [forceAction, setForceAction] = useState<ForceActionId>('recruit_hird');
  const [selectedHoldingId, setSelectedHoldingId] = useState<string>(
    state.realm.holdings[0]?.settlementId ?? ''
  );
  const allBuildingKeys = Object.keys(BUILDINGS_CATALOG) as BuildingType[];
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingType>(allBuildingKeys[0]);

  const claimableRank = getClaimableNextTitle(state);
  const winGoal = WIN_GOALS.find((w) => w.id === state.winGoalId) ?? WIN_GOALS[0];
  const winGoalFa = WIN_GOALS_FA[winGoal.id];

  const boathouseActive = hasBoathouse(state);
  const rawShipUpkeep = state.realm.longships * 4 + state.realm.knarrs * 2;
  const shipUpkeep = boathouseActive ? Math.floor(rawShipUpkeep * 0.5) : rawShipUpkeep;
  const warriorUpkeep = Math.floor(Math.max(0, state.realm.hirdWarriors - 4) * 0.45);
  const totalUpkeep = shipUpkeep + warriorUpkeep;

  const currentLocId = state.character.locationId;
  const currentLoc = SETTLEMENTS_BY_ID[currentLocId];
  const currentLocName = isFa
    ? SETTLEMENTS_FA[currentLocId]?.name ?? currentLoc?.name ?? currentLocId
    : currentLoc?.name.split(' (')[0] ?? currentLocId;
  const locIsFortified = isFortifiedEnemyCity(state, currentLocId);
  const used = state.yearlyActivitiesUsed ?? {};
  const builtThisYear = Boolean(state.builtThisYear);

  const forceOptions: NordicSelectOption<ForceActionId>[] = [
    {
      value: 'recruit_hird',
      label: isFa ? 'استخدام +۶ جنگجوی هیرد' : 'Recruit +6 Hird Warriors',
      sublabel: isFa
        ? `موجود: ${state.realm.hirdWarriors} جنگجو · افزایش توان غارت و فتح دژها`
        : `Have: ${state.realm.hirdWarriors} Warriors · Boosts raid & siege power`,
      badge: state.familyInteractionsUsed?.act_recruit_hird
        ? isFa
          ? 'انجام شد ✓'
          : 'Done ✓'
        : isFa
          ? '18 نقره'
          : '18 Silver',
      badgeTone: state.familyInteractionsUsed?.act_recruit_hird ? 'emerald' : 'gold',
    },
    {
      value: 'build_longship',
      label: isFa ? 'ساخت +۱ کشتی جنگی (لانگ‌شیپ)' : 'Build +1 War Longship',
      sublabel: isFa
        ? `موجود: ${state.realm.longships} فروند · ضروری برای غارت دریایی و فتح شهر`
        : `Have: ${state.realm.longships} Longships · Required for raids & conquest`,
      badge: state.familyInteractionsUsed?.act_build_longship
        ? isFa
          ? 'انجام شد ✓'
          : 'Done ✓'
        : isFa
          ? '55 نقره'
          : '55 Silver',
      badgeTone: state.familyInteractionsUsed?.act_build_longship ? 'emerald' : 'ice',
    },
    {
      value: 'build_knarr',
      label: isFa ? 'ساخت +۱ کشتی تجاری (کنار)' : 'Build +1 Trade Knarr',
      sublabel: isFa
        ? `موجود: ${state.realm.knarrs} فروند · افزایش سود بازار و ایمنی دریا`
        : `Have: ${state.realm.knarrs} Knarrs · Higher trade profit & safer seas`,
      badge: state.familyInteractionsUsed?.act_build_knarr
        ? isFa
          ? 'انجام شد ✓'
          : 'Done ✓'
        : isFa
          ? '45 نقره'
          : '45 Silver',
      badgeTone: state.familyInteractionsUsed?.act_build_knarr ? 'emerald' : 'gold',
    },
  ];

  const canExecuteForceAction = (() => {
    switch (forceAction) {
      case 'recruit_hird':
        return !state.familyInteractionsUsed?.act_recruit_hird && state.realm.silver >= 18;
      case 'build_longship':
        return !state.familyInteractionsUsed?.act_build_longship && state.realm.silver >= 55;
      case 'build_knarr':
        return !state.familyInteractionsUsed?.act_build_knarr && state.realm.silver >= 45;
    }
  })();

  const activeHolding =
    state.realm.holdings.find((h) => h.settlementId === selectedHoldingId) ??
    state.realm.holdings[0];

  const holdingOptions: NordicSelectOption<string>[] = state.realm.holdings.map((h) => {
    const s = SETTLEMENTS_BY_ID[h.settlementId];
    const sName = isFa
      ? SETTLEMENTS_FA[h.settlementId]?.name ?? s?.name ?? h.settlementId
      : s?.name ?? h.settlementId;
    return {
      value: h.settlementId,
      label: sName,
      sublabel: isFa
        ? `${h.farms} مزرعه · نگهبان ${h.garrison}`
        : `${h.farms} Farm${h.farms === 1 ? '' : 's'} · Garrison ${h.garrison}`,
      badge: isFa ? `${h.buildings.length} بنا` : `${h.buildings.length} Built`,
      badgeTone: 'gold',
    };
  });

  const buildingOptions: NordicSelectOption<BuildingType>[] = activeHolding
    ? allBuildingKeys.map((bKey) => {
        const bDef = BUILDINGS_CATALOG[bKey];
        const bFa = BUILDINGS_FA[bKey];
        const built = activeHolding.buildings.includes(bKey);
        const wrongFaith =
          bDef.religionReq !== undefined && state.character.religion !== bDef.religionReq;

        return {
          value: bKey,
          label: isFa ? bFa?.name ?? bDef.name : bDef.name,
          sublabel: wrongFaith
            ? isFa
              ? `نیازمند آیین: ${RELIGION_LABELS.fa[bDef.religionReq!]}`
              : `Requires faith: ${RELIGION_LABELS.en[bDef.religionReq!]}`
            : isFa
              ? bFa?.shortEffect ?? bDef.effectsLabel
              : bDef.effectsLabel.split('·')[0],
          badge: built
            ? isFa
              ? 'ساخته‌شده ✓'
              : 'Built ✓'
            : wrongFaith
              ? isFa
                ? 'آیین ناسازگار'
                : 'Wrong Faith'
              : isFa
                ? `${bDef.costSilver} نقره`
                : `${bDef.costSilver} Silver`,
          badgeTone: built ? 'emerald' : wrongFaith ? 'danger' : 'gold',
        };
      })
    : [];

  const activeBDef = BUILDINGS_CATALOG[selectedBuilding];
  const isSelectedBuilt = Boolean(activeHolding?.buildings.includes(selectedBuilding));
  const isSelectedWrongFaith =
    activeBDef.religionReq !== undefined && state.character.religion !== activeBDef.religionReq;
  const canConstructSelected =
    Boolean(activeHolding) &&
    !isSelectedBuilt &&
    !isSelectedWrongFaith &&
    !builtThisYear &&
    state.realm.silver >= activeBDef.costSilver;

  return (
    <div className="space-y-3.5 text-start">
      {/* Rank & Goal Compact Card */}
      <div className="p-4 rounded-xl bg-[#131D2B] border border-[#233246] space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <Crown className="w-5 h-5 text-[#F59E0B] shrink-0" />
            <div className="min-w-0">
              <div className="text-xs text-[#94A3B8]">
                {isFa ? 'مقام کنونی شما' : 'Current Rank'}
              </div>
              <div className="font-saga text-xl font-bold text-[#F1F5F9] truncate">
                {TITLE_LABELS[lang][state.character.title]}
              </div>
            </div>
          </div>
          <div className="text-end font-mono tabular-nums text-xs shrink-0">
            <div className="text-[#F59E0B] font-semibold">
              {isFa ? `${state.realm.fame} شهرت` : `${state.realm.fame} Fame`}
            </div>
            <div className="text-[#94A3B8]">
              {isFa ? `ثبات ${state.realm.stability}%` : `Stability ${state.realm.stability}%`}
            </div>
          </div>
        </div>

        <p className="text-xs text-[#94A3B8] leading-relaxed">
          {getNextTitleRequirementText(state.character.title, lang)}
        </p>

        {claimableRank && (
          <button
            type="button"
            onClick={onClaimRank}
            className="w-full min-h-[44px] bg-[#F59E0B] hover:bg-[#FBBF24] text-[#0B1118] font-extrabold text-xs rounded-lg cursor-pointer whitespace-nowrap transition-colors"
          >
            {isFa
              ? `ارتقای مقام به «${SHORT_TITLE_LABELS.fa[claimableRank]}»!`
              : `Rank Up to ${SHORT_TITLE_LABELS.en[claimableRank]}!`}
          </button>
        )}

        <div className="pt-2.5 border-t border-[#1E2D40] flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-[#94A3B8]">
            {isFa
              ? `هدف خاندان: ${winGoalFa?.title ?? winGoal.title}`
              : `Goal: ${winGoal.title}`}
          </span>
          <span className="font-mono tabular-nums text-[#F1F5F9]">
            {state.winGoalAchievedYear
              ? isFa
                ? 'تکمیل شد!'
                : 'Completed!'
              : isFa
                ? winGoalFa?.progressLabel(state) ?? winGoal.progressLabel(state)
                : winGoal.progressLabel(state)}
          </span>
        </div>
      </div>

      {/* 1. Army, Fleet & Upkeep Drawer */}
      <NordicAccordion
        title={isFa ? 'سپاه هیرد و ناوگان دریایی' : 'Hird Warriors & Naval Fleet'}
        subtitle={
          isFa
            ? `${state.realm.hirdWarriors} جنگجو · ${state.realm.longships} کشتی جنگی · ${state.realm.knarrs} کشتی تجاری`
            : `${state.realm.hirdWarriors} Warriors · ${state.realm.longships} Longships · ${state.realm.knarrs} Knarrs`
        }
        icon={<Ship className="w-4 h-4" />}
        accent="ice"
        statusNode={
          <span className="text-[11px] font-mono tabular-nums text-[#94A3B8]">
            {isFa ? `نگهداری ${totalUpkeep}/سال` : `${totalUpkeep}/yr`}
          </span>
        }
        isOpen={openDrawer === 'forces'}
        onToggle={() => setOpenDrawer(openDrawer === 'forces' ? null : 'forces')}
      >
        <div className="space-y-3">
          {/* Upkeep & Thralls Summary */}
          <div className="px-3 py-2 rounded-lg bg-[#121C2A] border border-[#223247] flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 text-[#94A3B8]">
              <Coins className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
              {isFa ? (
                <span>
                  هزینه نگهداری سالانه:{' '}
                  <strong className="font-mono text-[#F1F5F9]">{totalUpkeep} نقره</strong>
                  {boathouseActive ? ' (۵۰٪ تخفیف اسکله)' : ''}
                </span>
              ) : (
                <span>
                  Annual Upkeep:{' '}
                  <strong className="font-mono text-[#F1F5F9]">{totalUpkeep} Silver/yr</strong>
                  {boathouseActive ? ' (-50% Boathouse)' : ''}
                </span>
              )}
            </span>

            {state.realm.thrallsOwned > 0 && (
              <span className="font-mono tabular-nums text-emerald-400">
                {isFa
                  ? `${state.realm.thrallsOwned} کارگر برده (+${state.realm.thrallsOwned} نقره/سال)`
                  : `${state.realm.thrallsOwned} Thralls (+${state.realm.thrallsOwned} Silver/yr)`}
              </span>
            )}
          </div>

          <NordicSelect
            label={isFa ? 'گزینه تقویت ناوگان و سپاه' : 'Recruit Warriors or Build Ships'}
            value={forceAction}
            options={forceOptions}
            onChange={setForceAction}
            icon={<Ship className="w-4 h-4 text-[#38BDF8]" />}
          />

          <button
            type="button"
            disabled={!canExecuteForceAction}
            onClick={() => onBuildShipOrHird(forceAction)}
            className="w-full min-h-[46px] px-4 rounded-xl bg-[#0284C7] hover:bg-[#38BDF8] hover:text-[#0B1118] disabled:bg-[#1E293B] disabled:text-[#64748B] text-white font-bold text-xs transition-colors cursor-pointer"
          >
            {canExecuteForceAction
              ? isFa
                ? 'اجرای دستور ساخت / استخدام'
                : 'Confirm Recruit / Build'
              : isFa
                ? 'امسال انجام شده یا نقره کافی نیست'
                : 'Already Used This Year or Not Enough Silver'}
          </button>
        </div>
      </NordicAccordion>

      {/* 2. Estates, Farms & Buildings Drawer */}
      <NordicAccordion
        title={isFa ? 'املاک، مزارع و ساخت‌وساز' : 'Estates, Farms & Construction'}
        subtitle={
          isFa
            ? `${state.realm.landFarms} مزرعه · ذخیره غله ${state.realm.foodStores} · ${state.realm.holdings.length} ملک`
            : `${state.realm.landFarms} Farms · Food ${state.realm.foodStores} · ${state.realm.holdings.length} Estates`
        }
        icon={<Hammer className="w-4 h-4" />}
        accent="gold"
        statusNode={
          builtThisYear ? (
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : undefined
        }
        isOpen={openDrawer === 'estates'}
        onToggle={() => setOpenDrawer(openDrawer === 'estates' ? null : 'estates')}
      >
        {state.realm.holdings.length === 0 ? (
          <div className="p-4 rounded-xl bg-[#121C2A] border border-[#223247] text-center space-y-3">
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              {locIsFortified
                ? isFa
                  ? `شما در شهر مستحکم «${currentLocName}» هستید؛ شهرهای بزرگ دشمن را نمی‌توان با ۳۵ نقره خرید! یا آن را با سپاه فتح کنید یا به بندری کوچک سفر کنید.`
                  : `${currentLocName} is a fortified enemy city and cannot be bought for 35 Silver! Conquer it by force or sail to a smaller settlement.`
                : isFa
                  ? 'شما هنوز مزرعه یا ملکی برای ساخت‌وساز ندارید.'
                  : 'You do not own any farmland or estate yet.'}
            </p>
            {locIsFortified && onConquerCity ? (
              <button
                type="button"
                disabled={
                  Boolean(used.settle) ||
                  state.realm.longships <= 0 ||
                  state.realm.hirdWarriors < 12
                }
                onClick={() => onConquerCity(currentLocId)}
                className="min-h-[44px] px-4 bg-[#DC2626] hover:bg-[#EF4444] disabled:bg-[#1E293B] disabled:text-[#64748B] text-white font-bold text-xs rounded-lg inline-flex items-center gap-2 cursor-pointer"
              >
                <Castle className="w-4 h-4 shrink-0" />
                <span>
                  {isFa
                    ? `حمله برای فتح ${currentLocName} (۱ کشتی جنگی و ۱۲+ جنگجو)`
                    : `Conquer ${currentLocName} (1 Longship & 12+ Warriors)`}
                </span>
              </button>
            ) : (
              <button
                type="button"
                disabled={Boolean(used.settle) || state.realm.silver < 35}
                onClick={onClearFirstFarm}
                className="min-h-[44px] px-4 bg-[#F59E0B] hover:bg-[#FBBF24] disabled:bg-[#1E293B] disabled:text-[#64748B] text-[#0B1118] font-extrabold text-xs rounded-lg cursor-pointer"
              >
                {used.settle
                  ? isFa
                    ? 'امسال انجام شد'
                    : 'Claimed This Year'
                  : isFa
                    ? `خرید نخستین مزرعه در ${currentLocName} (35 نقره)`
                    : `Claim First Farm in ${currentLocName} (35 Silver)`}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <NordicSelect
              label={isFa ? 'انتخاب ملک برای مدیریت' : 'Select Estate to Manage'}
              value={activeHolding.settlementId}
              options={holdingOptions}
              onChange={setSelectedHoldingId}
              icon={<MapPin className="w-4 h-4 text-[#F59E0B]" />}
            />

            {activeHolding.buildings.length > 0 && (
              <div className="px-3 py-2 rounded-lg bg-[#121C2A] border border-[#223247] text-xs text-[#CBD5E1]">
                <span className="text-[#94A3B8]">
                  {isFa ? 'بناهای ساخته‌شده در این ملک: ' : 'Built in this estate: '}
                </span>
                <span className="font-medium text-[#F59E0B]">
                  {activeHolding.buildings
                    .map((bKey) =>
                      isFa
                        ? BUILDINGS_FA[bKey]?.name ?? BUILDINGS_CATALOG[bKey].name
                        : BUILDINGS_CATALOG[bKey].name
                    )
                    .join(isFa ? '، ' : ', ')}
                </span>
              </div>
            )}

            <NordicSelect
              label={
                builtThisYear
                  ? isFa
                    ? 'ساخت بنا (سهمیه ۱ بنا در سال استفاده شده)'
                    : 'Construct Structure (1 build/year limit used)'
                  : isFa
                    ? 'انتخاب بنا برای احداث (حداکثر ۱ بنا در سال)'
                    : 'Choose Structure to Construct (1 per year)'
              }
              value={selectedBuilding}
              options={buildingOptions}
              onChange={setSelectedBuilding}
              icon={<Hammer className="w-4 h-4 text-[#F59E0B]" />}
            />

            <button
              type="button"
              disabled={!canConstructSelected}
              onClick={() => onBuildHoldingStructure(activeHolding.settlementId, selectedBuilding)}
              className="w-full min-h-[46px] px-4 rounded-xl bg-[#E07A2F] hover:bg-[#F59E0B] disabled:bg-[#1E293B] disabled:text-[#64748B] text-[#0B1118] font-bold text-xs transition-colors cursor-pointer"
            >
              {isSelectedBuilt
                ? isFa
                  ? 'این بنا قبلاً ساخته شده است'
                  : 'Already Constructed Here'
                : builtThisYear
                  ? isFa
                    ? 'سهمیه ساخت‌وساز امسال تمام شده (سال بعد)'
                    : 'Annual Build Slot Used — Next Year'
                  : isSelectedWrongFaith
                    ? isFa
                      ? 'آیین شما با این بنا سازگار نیست'
                      : 'Faith Requirement Not Met'
                    : canConstructSelected
                      ? isFa
                        ? `احداث بنا (${activeBDef.costSilver} نقره)`
                        : `Construct (${activeBDef.costSilver} Silver)`
                      : isFa
                        ? `نقره کافی نیست (${activeBDef.costSilver} نقره لازم است)`
                        : `Need ${activeBDef.costSilver} Silver`}
            </button>
          </div>
        )}
      </NordicAccordion>
    </div>
  );
}
