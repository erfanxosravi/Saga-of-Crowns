import { BookOpen, Compass, HelpCircle, X } from 'lucide-react';
import { isRtl, QUICK_GUIDE } from '../i18n/ui';
import { Language } from '../types/game';

interface QuickGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export function QuickGuideModal({ isOpen, onClose, lang }: QuickGuideModalProps) {
  if (!isOpen) return null;
  const g = QUICK_GUIDE[lang];
  const rtl = isRtl(lang);

  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#05080D]/82 backdrop-blur-xs p-2.5 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-guide-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[calc(100dvh-1.25rem)] sm:max-h-[min(88dvh,760px)] flex flex-col bg-[#0E1622] border border-[#26384F] rounded-2xl overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.88)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="shrink-0 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#1E2D40] bg-[#121C2B] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-[#38BDF8]/15 border border-[#38BDF8]/35 flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5 text-[#38BDF8]" />
            </div>
            <div className="min-w-0">
              <h2
                id="quick-guide-title"
                className="font-saga text-xl sm:text-2xl font-bold text-[#F1F5F9] truncate"
              >
                {g.title}
              </h2>
              <p className="text-xs text-[#94A3B8] truncate mt-0.5">{g.subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={g.closeLabel}
            className="min-w-[44px] min-h-[44px] rounded-xl bg-[#182638] hover:bg-[#21334A] border border-[#2A3E59] flex items-center justify-center text-[#94A3B8] hover:text-[#F1F5F9] cursor-pointer shrink-0 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-5 text-start">
          {/* 4-Step Gameplay Loop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {g.steps.map((step, idx) => (
              <div
                key={idx}
                className="p-3.5 sm:p-4 rounded-xl bg-[#131D2B] border border-[#233246] space-y-1.5"
              >
                <div className="text-xs sm:text-sm font-bold text-[#F59E0B] flex items-center gap-1.5">
                  <Compass className="w-4 h-4 shrink-0" />
                  <span>{step.heading}</span>
                </div>
                <p className="text-xs sm:text-[13px] text-[#E2E8F0] leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>

          {/* Viking Age Glossary */}
          <div className="space-y-3 pt-3 border-t border-[#1E2D40]">
            <h3 className="text-sm font-bold text-[#F1F5F9] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#38BDF8] shrink-0" />
              <span>{g.glossaryTitle}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {g.terms.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#0B1118] border border-[#1E2D40] space-y-1"
                >
                  <div className="text-xs sm:text-sm font-semibold text-[#F59E0B]">{item.term}</div>
                  <div className="text-xs text-[#94A3B8] leading-relaxed">{item.meaning}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="shrink-0 px-4 sm:px-6 py-3 border-t border-[#1E2D40] bg-[#121C2B]/70 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-5 bg-[#F59E0B] hover:bg-[#FBBF24] text-[#0B1118] font-bold text-xs sm:text-sm rounded-xl cursor-pointer whitespace-nowrap transition-colors"
          >
            {g.closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
