import { ReactNode, useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export interface NordicSelectOption<T extends string = string> {
  value: T;
  label: string;
  sublabel?: string;
  badge?: string;
  badgeTone?: 'gold' | 'ice' | 'danger' | 'emerald' | 'muted';
}

interface NordicSelectProps<T extends string = string> {
  label?: string;
  value: T;
  options: NordicSelectOption<T>[];
  onChange: (next: T) => void;
  icon?: ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
}

function getBadgeToneClass(tone: NordicSelectOption['badgeTone']): string {
  switch (tone) {
    case 'gold':
      return 'text-[#FBBF24]';
    case 'ice':
      return 'text-[#38BDF8]';
    case 'danger':
      return 'text-[#F87171]';
    case 'emerald':
      return 'text-[#34D399]';
    case 'muted':
    default:
      return 'text-[#94A3B8]';
  }
}

export function NordicSelect<T extends string = string>({
  label,
  value,
  options,
  onChange,
  icon,
  disabled = false,
  ariaLabel,
}: NordicSelectProps<T>) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [openUpward, setOpenUpward] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const selectedOption = options.find((opt) => opt.value === value) ?? options[0];

  const handleToggleOpen = () => {
    if (disabled) return;
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setOpenUpward(spaceBelow < 235 && spaceAbove > spaceBelow);
    }
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleOutside = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setIsOpen(false);
      }
    };

    window.addEventListener('pointerdown', handleOutside);
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('pointerdown', handleOutside);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative ${isOpen ? 'z-50' : 'z-10'} space-y-1.5`}>
      {label && <label className="block text-xs font-medium text-[#94A3B8] px-0.5">{label}</label>}

      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel ?? label}
        onClick={handleToggleOpen}
        className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border text-start flex items-center justify-between gap-2.5 transition-colors cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]/70 ${
          isOpen
            ? 'bg-[#131F30] border-[#F59E0B] text-[#F1F5F9]'
            : 'bg-[#0B1118] border-[#24354C] hover:border-[#38BDF8]/70 text-[#F1F5F9]'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {icon && <span className="shrink-0">{icon}</span>}
          <div className="min-w-0 flex-1">
            <div className="text-xs sm:text-sm font-semibold text-[#F1F5F9] truncate">
              {selectedOption?.label}
            </div>
            {selectedOption?.sublabel && (
              <div className="text-[11px] sm:text-xs text-[#94A3B8] truncate mt-0.5">
                {selectedOption.sublabel}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {selectedOption?.badge && (
            <span
              className={`text-[11px] sm:text-xs font-mono tabular-nums font-semibold ${getBadgeToneClass(
                selectedOption.badgeTone
              )}`}
            >
              {selectedOption.badge}
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 motion-reduce:transition-none ${
              isOpen ? 'rotate-180 text-[#F59E0B]' : 'text-[#94A3B8]'
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div
          role="listbox"
          className={`absolute start-0 end-0 z-50 max-h-56 overflow-y-auto rounded-xl bg-[#0D1520] border border-[#2C415C] shadow-[0_18px_42px_rgba(0,0,0,0.88)] p-1.5 space-y-0.5 ${
            openUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          }`}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full min-h-[44px] px-3 py-2 rounded-lg text-start flex items-center justify-between gap-2.5 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#192A3E] text-[#F1F5F9]'
                    : 'hover:bg-[#142030] text-[#CBD5E1] hover:text-[#F1F5F9]'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-xs sm:text-sm font-semibold leading-snug break-words">
                    {opt.label}
                  </div>
                  {opt.sublabel && (
                    <div className="text-[11px] sm:text-xs text-[#94A3B8] leading-snug mt-0.5 break-words">
                      {opt.sublabel}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {opt.badge && (
                    <span
                      className={`text-[11px] sm:text-xs font-mono tabular-nums font-semibold ${getBadgeToneClass(
                        opt.badgeTone
                      )}`}
                    >
                      {opt.badge}
                    </span>
                  )}
                  {isSelected && <Check className="w-4 h-4 text-[#F59E0B] shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface NordicAccordionProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  accent?: 'gold' | 'ice' | 'crimson' | 'emerald' | 'neutral';
  statusNode?: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export function NordicAccordion({
  title,
  subtitle,
  icon,
  accent = 'ice',
  statusNode,
  isOpen,
  onToggle,
  children,
}: NordicAccordionProps) {
  const [allowOverflow, setAllowOverflow] = useState<boolean>(isOpen);

  useEffect(() => {
    if (isOpen) {
      const timer = window.setTimeout(() => setAllowOverflow(true), 220);
      return () => window.clearTimeout(timer);
    }
    setAllowOverflow(false);
  }, [isOpen]);

  const iconBgClass =
    accent === 'gold'
      ? 'bg-[#F59E0B]/15 text-[#F59E0B]'
      : accent === 'crimson'
        ? 'bg-[#EF4444]/15 text-[#EF4444]'
        : accent === 'emerald'
          ? 'bg-[#34D399]/15 text-[#34D399]'
          : accent === 'ice'
            ? 'bg-[#38BDF8]/15 text-[#38BDF8]'
            : 'bg-[#1A2738] text-[#94A3B8]';

  const activeBorderClass =
    accent === 'gold'
      ? 'border-[#F59E0B]/60'
      : accent === 'crimson'
        ? 'border-[#EF4444]/60'
        : accent === 'emerald'
          ? 'border-[#34D399]/60'
          : 'border-[#38BDF8]/60';

  return (
    <div
      className={`rounded-xl bg-[#131D2B] border transition-colors ${
        isOpen ? activeBorderClass : 'border-[#233246] hover:border-[#2F445E]'
      }`}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={onToggle}
        className="w-full min-h-[60px] px-4 py-3 flex items-center justify-between gap-3 text-start hover:bg-[#172334]/70 rounded-xl transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]/70"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {icon && (
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconBgClass}`}
            >
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-sm sm:text-[15px] font-semibold text-[#F1F5F9] leading-snug break-words">
              {title}
            </div>
            {subtitle && (
              <div className="text-xs text-[#94A3B8] leading-snug mt-0.5 break-words">
                {subtitle}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {statusNode}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 motion-reduce:transition-none ${
              isOpen ? 'rotate-180 text-[#F59E0B]' : 'text-[#94A3B8]'
            }`}
          />
        </div>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className={allowOverflow ? 'overflow-visible' : 'overflow-hidden'}>
          <div className="px-4 pb-4 pt-3 border-t border-[#1E2D40] bg-[#0D1520]/85 rounded-b-xl">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
