import { useRef, useState } from 'react';
import {
  AlertTriangle,
  Anchor,
  Castle,
  CloudRain,
  Eye,
  Minus,
  Plus,
  RotateCcw,
  Snowflake,
  Sun,
  Swords,
  Wind,
} from 'lucide-react';
import {
  calculateVoyageMetrics,
  getControllerInYear,
  getHistoricalBordersForYear,
  getSeasonalWeatherProfile,
  LANDMASS_POLYGONS,
  MAP_BOUNDS,
  NAVIGABLE_RIVERS,
  pointsToSvgPath,
  pointsToSvgPolygon,
  projectLatLon,
  SEA_ROUTES,
  SETTLEMENTS,
  SETTLEMENTS_BY_ID,
} from '../data/geography';
import { hasBoathouse, RaidTactic } from '../engine/gameEngine';
import { SETTLEMENTS_FA } from '../i18n/gameDataFa';
import { SEASON_LABELS } from '../i18n/ui';
import { FullGameState, Season, Settlement } from '../types/game';
import { NordicSelect } from './NordicControls';

interface VikingMapProps {
  state: FullGameState;
  onSailTo?: (settlementId: string) => void;
  onRaidPort?: (settlementId: string, tactic: RaidTactic) => void;
  onConquerCity?: (settlementId: string) => void;
  onTradeHere?: () => void;
}

const ZONE_LABELS_FA: Record<string, string> = {
  danelaw: 'قلمرو دانلو',
  normandy: 'نورماندی',
  north_sea_empire: 'امپراتوری دریای شمال',
  iceland_commonwealth: 'شورای آزاد ایسلند',
};

export function VikingMap({
  state,
  onSailTo,
  onRaidPort,
  onConquerCity,
  onTradeHere,
}: VikingMapProps) {
  const lang = state.settings.language;
  const isFa = lang === 'fa';
  const [selectedId, setSelectedId] = useState<string>(state.character.locationId);
  const [showUnexplored, setShowUnexplored] = useState<boolean>(false);
  const [showRaidTactics, setShowRaidTactics] = useState<boolean>(false);
  const [mapTactic, setMapTactic] = useState<RaidTactic>('shield_wall');

  // Zoom & Pan State (viewBox center + zoom factor)
  const [zoom, setZoom] = useState<number>(1);
  const [center, setCenter] = useState<{ x: number; y: number }>({
    x: MAP_BOUNDS.width / 2,
    y: MAP_BOUNDS.height / 2,
  });

  const dragRef = useRef<{
    dragging: boolean;
    moved: boolean;
    startX: number;
    startY: number;
    origCx: number;
    origCy: number;
  }>({
    dragging: false,
    moved: false,
    startX: 0,
    startY: 0,
    origCx: MAP_BOUNDS.width / 2,
    origCy: MAP_BOUNDS.height / 2,
  });

  const pinchDistRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const clampCenter = (cx: number, cy: number, z: number) => {
    const viewW = MAP_BOUNDS.width / z;
    const viewH = MAP_BOUNDS.height / z;
    const minX = viewW / 2;
    const maxX = MAP_BOUNDS.width - viewW / 2;
    const minY = viewH / 2;
    const maxY = MAP_BOUNDS.height - viewH / 2;
    return {
      x: Math.max(minX, Math.min(maxX, cx)),
      y: Math.max(minY, Math.min(maxY, cy)),
    };
  };

  const applyZoom = (nextZoomRaw: number) => {
    const nextZ = Math.max(1, Math.min(3.2, Number(nextZoomRaw.toFixed(2))));
    setZoom(nextZ);
    setCenter((prev) => clampCenter(prev.x, prev.y, nextZ));
  };

  const resetZoomPan = () => {
    setZoom(1);
    setCenter({ x: MAP_BOUNDS.width / 2, y: MAP_BOUNDS.height / 2 });
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.pointerType === 'touch' && pinchDistRef.current !== null) return;
    dragRef.current = {
      dragging: true,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
      origCx: center.x,
      origCy: center.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragRef.current.dragging || pinchDistRef.current !== null) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;

    const dxPx = e.clientX - dragRef.current.startX;
    const dyPx = e.clientY - dragRef.current.startY;
    if (Math.abs(dxPx) > 4 || Math.abs(dyPx) > 4) {
      dragRef.current.moved = true;
    }

    const svgUnitsPerPx = MAP_BOUNDS.width / zoom / rect.width;
    const nextCx = dragRef.current.origCx - dxPx * svgUnitsPerPx;
    const nextCy = dragRef.current.origCy - dyPx * svgUnitsPerPx;
    setCenter(clampCenter(nextCx, nextCy, zoom));
  };

  const handlePointerUp = () => {
    dragRef.current.dragging = false;
  };

  const handleTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchDistRef.current = Math.hypot(dx, dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length === 2 && pinchDistRef.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const scaleFactor = dist / Math.max(10, pinchDistRef.current);
      pinchDistRef.current = dist;
      applyZoom(zoom * scaleFactor);
    }
  };

  const handleTouchEnd = () => {
    pinchDistRef.current = null;
  };

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.25 : -0.25;
    applyZoom(zoom + delta);
  };

  const currentLoc = SETTLEMENTS_BY_ID[state.character.locationId] ?? SETTLEMENTS[0];
  const inspected: Settlement = SETTLEMENTS_BY_ID[selectedId] ?? currentLoc;
  const inspectedFa = SETTLEMENTS_FA[inspected.id];
  const controller = getControllerInYear(inspected, state.year);
  const borders = getHistoricalBordersForYear(state.year);
  const weather = getSeasonalWeatherProfile(state.season, lang);

  const used = state.yearlyActivitiesUsed ?? {};
  const hasShips = state.realm.longships + state.realm.knarrs > 0;
  const hasKnarr = state.realm.knarrs > 0;
  const isDiscovered = state.discoveredSettlements.includes(inspected.id) || showUnexplored;
  const isHeldByPlayer = state.realm.holdings.some(
    (h) => h.settlementId === inspected.id && h.farms > 0
  );
  const isFortifiedEnemyCity = inspected.baseDefense >= 7 && !isHeldByPlayer;
  const effectiveSeamanship =
    state.character.skills.seamanship + (hasBoathouse(state) ? 3 : 0);

  const voyage = calculateVoyageMetrics(
    currentLoc,
    inspected,
    state.season,
    state.year,
    effectiveSeamanship,
    hasKnarr
  );

  const inspectedDisplayName = isFa ? inspectedFa?.name ?? inspected.name : inspected.name;
  const inspectedNorseName = isFa ? inspectedFa?.norseName ?? inspected.norseName : inspected.norseName;

  const viewW = MAP_BOUNDS.width / zoom;
  const viewH = MAP_BOUNDS.height / zoom;
  const vbX = center.x - viewW / 2;
  const vbY = center.y - viewH / 2;

  const renderSeasonIcon = (s: Season, cls = 'w-4 h-4 shrink-0') => {
    switch (s) {
      case Season.Winter:
        return <Snowflake className={`${cls} text-[#38BDF8]`} />;
      case Season.Autumn:
        return <CloudRain className={`${cls} text-[#94A3B8]`} />;
      case Season.Spring:
        return <Wind className={`${cls} text-teal-300`} />;
      case Season.Summer:
        return <Sun className={`${cls} text-[#F59E0B]`} />;
    }
  };

  return (
    <div className="space-y-3 text-start">
      {/* Automatic Seasonal Weather & Sea Risk Bar */}
      <div className="p-3 rounded-xl bg-[#131D2B] border border-[#233246] space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {renderSeasonIcon(state.season)}
            <div className="text-xs min-w-0">
              <span className="font-semibold text-[#F1F5F9]">
                {SEASON_LABELS[lang][state.season]} · {weather.weatherName}
              </span>
              <span className="text-[#38BDF8] block sm:inline sm:ms-2 font-mono tabular-nums text-[11px]">
                {weather.seaEffectShort}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowUnexplored((v) => !v)}
            className="min-h-[44px] px-3.5 text-xs border border-[#2C425E] hover:border-[#38BDF8] rounded-xl text-[#F1F5F9] bg-[#0B1118] inline-flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap transition-colors"
          >
            <Eye className="w-4 h-4 text-[#38BDF8]" />
            {showUnexplored
              ? isFa
                ? 'پوشاندن ناشناخته‌ها'
                : 'Hide Unexplored'
              : isFa
                ? 'نمایش کل بنادر'
                : 'Reveal All'}
          </button>
        </div>
        <p className="text-[11px] text-[#94A3B8] leading-relaxed">{weather.description}</p>
      </div>

      {/* Interactive Zoomable & Pannable SVG Map */}
      <div
        ref={containerRef}
        dir="ltr"
        className="relative rounded-xl border border-[#233246] bg-[#070E17] overflow-hidden touch-none"
      >
        {/* Mobile-Friendly Zoom Controls */}
        <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => applyZoom(zoom + 0.45)}
            aria-label="Zoom In"
            title={isFa ? 'بزرگ‌نمایی نقشه' : 'Zoom In'}
            className="min-w-[44px] min-h-[44px] rounded-xl bg-[#0F1722]/90 border border-[#283B52] hover:border-[#38BDF8] text-[#F1F5F9] flex items-center justify-center shadow-md cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => applyZoom(zoom - 0.45)}
            aria-label="Zoom Out"
            title={isFa ? 'کوچک‌نمایی نقشه' : 'Zoom Out'}
            className="min-w-[44px] min-h-[44px] rounded-xl bg-[#0F1722]/90 border border-[#283B52] hover:border-[#38BDF8] text-[#F1F5F9] flex items-center justify-center shadow-md cursor-pointer transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          {zoom > 1.02 && (
            <button
              type="button"
              onClick={resetZoomPan}
              aria-label="Reset Map View"
              title={isFa ? 'بازنشانی نما' : 'Reset View'}
              className="min-w-[44px] min-h-[44px] rounded-xl bg-[#0F1722]/90 border border-[#F59E0B]/60 text-[#F59E0B] flex items-center justify-center shadow-md cursor-pointer transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="absolute bottom-2 left-2.5 z-10 pointer-events-none text-[10px] font-mono text-[#94A3B8] bg-[#0B1118]/75 px-2 py-0.5 rounded">
          {isFa ? `بزرگ‌نمایی ${zoom.toFixed(1)}x · بکشید و جابه‌جا کنید` : `${zoom.toFixed(1)}x · Drag or pinch`}
        </div>

        <svg
          viewBox={`${vbX} ${vbY} ${viewW} ${viewH}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
          className="w-full h-[240px] sm:h-[310px] lg:h-[350px] block select-none cursor-grab active:cursor-grabbing"
          role="img"
          aria-label="Viking Age Sea Chart"
        >
          {[-45, -20, 0, 15].map((lon) => {
            const { x } = projectLatLon(55, lon);
            return (
              <line
                key={`lon_${lon}`}
                x1={x}
                y1={0}
                x2={x}
                y2={MAP_BOUNDS.height}
                stroke="#0F1C2E"
                strokeWidth={1 / zoom}
              />
            );
          })}
          {[50, 55, 60, 65].map((lat) => {
            const { y } = projectLatLon(lat, 0);
            return (
              <line
                key={`lat_${lat}`}
                x1={0}
                y1={y}
                x2={MAP_BOUNDS.width}
                y2={y}
                stroke="#0F1C2E"
                strokeWidth={1 / zoom}
              />
            );
          })}

          {LANDMASS_POLYGONS.map((poly) => (
            <polygon
              key={poly.id}
              points={pointsToSvgPolygon(poly.coords)}
              fill="#15202E"
              stroke="#2D425B"
              strokeWidth={1.2 / Math.sqrt(zoom)}
            />
          ))}

          {['kirkwall', 'shetland', 'faroes', 'isle_of_man', 'iona'].map((islId) => {
            const s = SETTLEMENTS_BY_ID[islId];
            if (!s) return null;
            const { x, y } = projectLatLon(s.lat, s.lon);
            return (
              <ellipse
                key={`isl_${islId}`}
                cx={x}
                cy={y}
                rx={6}
                ry={4}
                fill="#1B293B"
                stroke="#354E6B"
                strokeWidth={1 / Math.sqrt(zoom)}
              />
            );
          })}

          {NAVIGABLE_RIVERS.map((riv) => (
            <path
              key={riv.name}
              d={pointsToSvgPath(riv.coords)}
              fill="none"
              stroke="#1D4ED8"
              strokeOpacity="0.45"
              strokeWidth={1.8 / Math.sqrt(zoom)}
              strokeLinecap="round"
            />
          ))}

          {borders.map((zone) => {
            const zCenter = projectLatLon(zone.coords[0][0], zone.coords[0][1]);
            return (
              <g key={zone.id}>
                <polygon
                  points={pointsToSvgPolygon(zone.coords)}
                  fill={zone.fill}
                  stroke={zone.stroke}
                  strokeWidth={1.2 / Math.sqrt(zoom)}
                  strokeDasharray="4 3"
                />
                <text
                  x={zCenter.x + 6}
                  y={zCenter.y + 12}
                  fill={zone.stroke}
                  fontSize={10 / Math.sqrt(zoom)}
                  fontWeight="600"
                  opacity="0.88"
                >
                  {isFa ? ZONE_LABELS_FA[zone.id] ?? zone.label : zone.label}
                </text>
              </g>
            );
          })}

          {SEA_ROUTES.map(([aId, bId]) => {
            const a = SETTLEMENTS_BY_ID[aId];
            const b = SETTLEMENTS_BY_ID[bId];
            if (!a || !b) return null;
            const bothKnown =
              showUnexplored ||
              (state.discoveredSettlements.includes(aId) &&
                state.discoveredSettlements.includes(bId));
            const routeMetrics = calculateVoyageMetrics(
              a,
              b,
              state.season,
              state.year,
              effectiveSeamanship,
              hasKnarr
            );
            const knownStroke =
              routeMetrics.dangerPct >= 35
                ? '#7F1D1D'
                : routeMetrics.dangerPct >= 20
                  ? '#78350F'
                  : '#1E3A5F';
            const pa = projectLatLon(a.lat, a.lon);
            const pb = projectLatLon(b.lat, b.lon);
            return (
              <line
                key={`route_${aId}_${bId}`}
                x1={pa.x}
                y1={pa.y}
                x2={pb.x}
                y2={pb.y}
                stroke={bothKnown ? knownStroke : '#101A28'}
                strokeWidth={1.15 / Math.sqrt(zoom)}
                strokeDasharray="3 4"
              />
            );
          })}

          {inspected.id !== currentLoc.id && (
            <line
              x1={projectLatLon(currentLoc.lat, currentLoc.lon).x}
              y1={projectLatLon(currentLoc.lat, currentLoc.lon).y}
              x2={projectLatLon(inspected.lat, inspected.lon).x}
              y2={projectLatLon(inspected.lat, inspected.lon).y}
              stroke={
                voyage.dangerPct >= 35
                  ? '#EF4444'
                  : voyage.dangerPct >= 18
                    ? '#F59E0B'
                    : '#38BDF8'
              }
              strokeWidth={2 / Math.sqrt(zoom)}
              strokeDasharray="5 3"
            />
          )}

          {SETTLEMENTS.map((s) => {
            const { x, y } = projectLatLon(s.lat, s.lon);
            const isCurrent = s.id === currentLoc.id;
            const isSelected = s.id === inspected.id;
            const known = state.discoveredSettlements.includes(s.id) || showUnexplored;
            const playerOwns = state.realm.holdings.some(
              (h) => h.settlementId === s.id && h.farms > 0
            );
            const mapPortLabel = isFa
              ? (SETTLEMENTS_FA[s.id]?.name ?? s.name).split(' (')[0]
              : s.name.split(' (')[0];

            return (
              <g
                key={s.id}
                onClick={() => {
                  if (!dragRef.current.moved) {
                    setSelectedId(s.id);
                    setShowRaidTactics(false);
                  }
                }}
                className="cursor-pointer"
              >
                <circle cx={x} cy={y} r={14 / Math.sqrt(zoom)} fill="transparent" />
                {isCurrent && (
                  <circle
                    cx={x}
                    cy={y}
                    r={10 / Math.sqrt(zoom)}
                    fill="rgba(245, 158, 11, 0.24)"
                    stroke="#F59E0B"
                    strokeWidth={1.3 / Math.sqrt(zoom)}
                  />
                )}
                {isSelected && !isCurrent && (
                  <circle
                    cx={x}
                    cy={y}
                    r={8.5 / Math.sqrt(zoom)}
                    fill="none"
                    stroke="#38BDF8"
                    strokeWidth={1.4 / Math.sqrt(zoom)}
                  />
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={(isCurrent ? 5.2 : playerOwns ? 4.5 : 3.6) / Math.sqrt(zoom)}
                  fill={
                    isCurrent
                      ? '#F59E0B'
                      : playerOwns
                        ? '#34D399'
                        : known
                          ? '#F1F5F9'
                          : '#475569'
                  }
                  stroke="#070E17"
                  strokeWidth={1 / Math.sqrt(zoom)}
                />
                {(known || isSelected) && (
                  <text
                    x={x + 6 / Math.sqrt(zoom)}
                    y={y + 3 / Math.sqrt(zoom)}
                    fill={isCurrent ? '#F59E0B' : isSelected ? '#38BDF8' : '#E2E8F0'}
                    fontSize={(isCurrent || isSelected ? 11 : 9.5) / Math.sqrt(zoom)}
                    fontWeight={isCurrent || isSelected ? '700' : '500'}
                  >
                    {mapPortLabel}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Port Detail Card */}
      <div className="p-4 rounded-xl bg-[#131D2B] border border-[#233246] space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-saga text-xl font-bold text-[#F1F5F9]">
              {inspectedDisplayName}{' '}
              <span className="text-sm font-normal text-[#94A3B8] italic">
                ({inspectedNorseName})
              </span>
            </h3>
            <p className="text-xs text-[#94A3B8]">
              {isDiscovered
                ? isFa
                  ? `${inspectedFa?.polity ?? controller.polity} · ثروت ${inspected.baseWealth}/10 · دفاع ${inspected.baseDefense}/10`
                  : `${controller.polity} · Wealth ${inspected.baseWealth}/10 · Defense ${inspected.baseDefense}/10`
                : isFa
                  ? 'ساحل ناشناخته'
                  : 'Unexplored Coast'}
              {isHeldByPlayer
                ? isFa
                  ? ' · ملک خاندان شما'
                  : ' · Your Estate'
                : isFortifiedEnemyCity
                  ? isFa
                    ? ' · دژ دشمن (نیازمند فتح نظامی)'
                    : ' · Fortified City (Conquest Required)'
                  : ''}
            </p>
          </div>

          {inspected.id !== currentLoc.id && (
            <div className="text-end font-mono tabular-nums text-xs shrink-0 space-y-0.5">
              <div className="text-[#F1F5F9]">
                {isFa
                  ? `~${voyage.sailingDays} روز (${voyage.nauticalMiles} مایل)`
                  : `~${voyage.sailingDays}d (${voyage.nauticalMiles} nm)`}
              </div>
              <div
                className={`inline-flex items-center gap-1 justify-end font-semibold ${
                  voyage.dangerPct >= 35
                    ? 'text-rose-400'
                    : voyage.dangerPct >= 18
                      ? 'text-[#F59E0B]'
                      : 'text-emerald-400'
                }`}
              >
                {voyage.dangerPct >= 30 && <AlertTriangle className="w-3 h-3 shrink-0" />}
                <span>
                  {isFa ? `خطر دریا ${voyage.dangerPct}%` : `Sea Risk ${voyage.dangerPct}%`}
                </span>
              </div>
            </div>
          )}
        </div>

        {isDiscovered && (
          <p className="text-xs text-[#E2E8F0]/85 leading-relaxed">
            {isFa ? inspectedFa?.summary ?? inspected.historicalSummary : inspected.historicalSummary}
          </p>
        )}

        {inspected.id === currentLoc.id ? (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <span className="text-xs text-[#38BDF8] inline-flex items-center gap-1.5 font-medium">
              <Anchor className="w-3.5 h-3.5 shrink-0" />
              {isFa ? 'کشتی شما در همین بندر لنگر انداخته' : 'Moored at this port'}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {isFortifiedEnemyCity && onConquerCity && (
                <button
                  type="button"
                  disabled={
                    Boolean(used.settle) ||
                    state.realm.longships <= 0 ||
                    state.realm.hirdWarriors < 12
                  }
                  onClick={() => onConquerCity(inspected.id)}
                  className="min-h-[44px] px-3.5 text-xs font-bold bg-[#DC2626] hover:bg-[#EF4444] disabled:bg-[#1E293B] disabled:text-[#64748B] text-white rounded-xl inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors"
                >
                  <Castle className="w-3.5 h-3.5" />
                  {isFa ? 'حمله برای فتح شهر!' : 'Conquer City!'}
                </button>
              )}
              {onTradeHere && (
                <button
                  type="button"
                  disabled={Boolean(used.trade)}
                  onClick={onTradeHere}
                  className="min-h-[44px] px-4 text-xs font-bold bg-[#F59E0B] hover:bg-[#FBBF24] disabled:bg-[#1E293B] disabled:text-[#64748B] text-[#0B1118] rounded-xl cursor-pointer whitespace-nowrap transition-colors"
                >
                  {used.trade
                    ? isFa
                      ? 'امسال معامله شد'
                      : 'Traded This Year'
                    : isFa
                      ? 'تجارت در بازار'
                      : 'Trade Here'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2.5 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {onSailTo && (
                <button
                  type="button"
                  disabled={!hasShips || Boolean(used.travel)}
                  onClick={() => onSailTo(inspected.id)}
                  className="min-h-[44px] px-3 py-2 text-xs font-bold bg-[#0284C7] hover:bg-[#38BDF8] hover:text-[#0B1118] disabled:bg-[#1E293B] disabled:text-[#64748B] text-white rounded-xl cursor-pointer transition-colors"
                >
                  {used.travel
                    ? isFa
                      ? 'امسال سفر رفتی'
                      : 'Sailed This Year'
                    : hasShips
                      ? isFa
                        ? `سفر به اینجا (${voyage.sailingDays} روز)`
                        : `Sail Here (${voyage.sailingDays}d)`
                      : isFa
                        ? 'نیازمند کشتی'
                        : 'Needs Ship'}
                </button>
              )}

              {onRaidPort && (
                <button
                  type="button"
                  disabled={
                    state.realm.longships <= 0 ||
                    state.realm.hirdWarriors <= 0 ||
                    Boolean(used.raid)
                  }
                  onClick={() => setShowRaidTactics((v) => !v)}
                  className="min-h-[44px] px-3 py-2 text-xs font-bold border border-[#DC2626] hover:bg-[#DC2626]/20 disabled:border-[#233246] disabled:text-[#64748B] text-[#F1F5F9] rounded-xl inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Swords className="w-3.5 h-3.5 text-[#EF4444] shrink-0" />
                  {used.raid
                    ? isFa
                      ? 'امسال غارت رفتی'
                      : 'Raided This Year'
                    : isFa
                      ? 'غارت این بندر'
                      : 'Raid Port'}
                </button>
              )}
            </div>

            {isFortifiedEnemyCity && onConquerCity && (
              <button
                type="button"
                disabled={
                  Boolean(used.settle) ||
                  state.realm.longships <= 0 ||
                  state.realm.hirdWarriors < 12
                }
                onClick={() => onConquerCity(inspected.id)}
                className="w-full min-h-[42px] px-3.5 text-xs font-bold bg-[#221318] border border-[#DC2626]/70 hover:bg-[#DC2626] disabled:border-[#233246] disabled:bg-[#131D2B] disabled:text-[#64748B] text-[#F1F5F9] rounded-lg inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors"
              >
                <Castle className="w-3.5 h-3.5 text-[#EF4444] shrink-0" />
                <span>
                  {used.settle
                    ? isFa
                      ? 'فتح/اسکان امسال انجام شد'
                      : 'Conquest Used This Year'
                    : isFa
                      ? `فتح نظامی دژ ${inspectedDisplayName} (۱ کشتی جنگی و ۱۲+ جنگجو)`
                      : `Conquer Fortified ${inspectedDisplayName} (1 Longship & 12+ Warriors)`}
                </span>
              </button>
            )}

            {/* Inline Sleek Raid Tactic Dropdown */}
            {showRaidTactics && onRaidPort && !used.raid && (
              <div className="p-3 rounded-xl bg-[#0B1118] border border-[#DC2626]/50 space-y-2.5">
                <NordicSelect
                  label={isFa ? 'انتخاب تاکتیک حمله' : 'Raid Battle Tactic'}
                  value={mapTactic}
                  onChange={setMapTactic}
                  options={[
                    {
                      value: 'shield_wall',
                      label: isFa ? 'دیوار سپرها' : 'Shield Wall',
                      sublabel: isFa ? 'نبرد مستقیم و متعادل' : 'Balanced frontline clash',
                      badge: isFa ? 'متعادل' : 'Balanced',
                      badgeTone: 'ice',
                    },
                    {
                      value: 'surprise',
                      label: isFa ? 'شبیخون سحرگاه' : 'Dawn Ambush',
                      sublabel: isFa ? 'یورش سریع با غنیمت بیشتر' : 'Cunning strike · higher loot',
                      badge: isFa ? 'ذکاوت' : 'Cunning',
                      badgeTone: 'gold',
                    },
                    {
                      value: 'ransom',
                      label: isFa ? 'گرفتن باج نقره' : 'Demand Tribute',
                      sublabel: isFa ? 'محاصره با تلفات کمتر' : 'Intimidate for silver · safer',
                      badge: isFa ? 'کم‌خطر' : 'Safer',
                      badgeTone: 'emerald',
                    },
                    {
                      value: 'feigned_retreat',
                      label: isFa ? 'فرار ساختگی' : 'Feigned Flight',
                      sublabel: isFa ? 'کشاندن مدافعان به تله' : 'Tactical ambush maneuver',
                      badge: isFa ? 'تاکتیکی' : 'Tactical',
                      badgeTone: 'ice',
                    },
                  ]}
                />
                <button
                  type="button"
                  onClick={() => {
                    onRaidPort(inspected.id, mapTactic);
                    setShowRaidTactics(false);
                  }}
                  className="w-full min-h-[44px] bg-[#DC2626] hover:bg-[#EF4444] text-white font-bold text-xs rounded-xl cursor-pointer whitespace-nowrap transition-colors"
                >
                  {isFa
                    ? `آغاز یورش به ${inspectedDisplayName}!`
                    : `Attack ${inspectedDisplayName}!`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
