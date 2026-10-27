import {
  Coins,
  Crown,
  Flame,
  Heart,
  Ship,
  Skull,
  Swords,
  Users,
} from 'lucide-react';
import { EventCategory, EventIconType } from '../types/game';

export function resolveEventIconType(
  category: EventCategory | 'Chronicle' | 'Action' | 'Succession',
  explicit?: EventIconType,
  isDanger?: boolean
): EventIconType {
  if (explicit) return explicit;
  if (isDanger && category === 'Illness & Death') return 'skull';

  switch (category) {
    case 'Raiding':
    case 'War':
    case 'Blood Feud':
    case 'Feud':
    case 'Betrayal':
      return 'sword';
    case 'Voyage & Sea':
      return 'ship';
    case 'Illness & Death':
      return 'skull';
    case 'Romance & Marriage':
      return 'heart';
    case 'Trade':
    case 'Farm Life':
      return 'coin';
    case 'Religion':
    case 'Mystic & Omens':
      return 'religion';
    case 'Childhood':
    case 'Coming of Age':
    case 'Family':
      return 'family';
    case 'Politics & Kings':
    case 'Law & the Thing':
    case 'Thing & Law':
    case 'Historical Set-Piece':
    case 'Chronicle':
    case 'Succession':
    case 'Action':
    default:
      return 'crown';
  }
}

interface EventCategoryIconProps {
  category: EventCategory | 'Chronicle' | 'Action' | 'Succession';
  iconType?: EventIconType;
  isDanger?: boolean;
  className?: string;
  inheritColor?: boolean;
}

export function EventCategoryIcon({
  category,
  iconType,
  isDanger,
  className = 'w-4 h-4',
  inheritColor = false,
}: EventCategoryIconProps) {
  const resolved = resolveEventIconType(category, iconType, isDanger);

  switch (resolved) {
    case 'sword':
      return (
        <Swords
          className={`${className} ${inheritColor ? 'text-current' : 'text-[#EF4444]'} shrink-0`}
        />
      );
    case 'ship':
      return (
        <Ship
          className={`${className} ${inheritColor ? 'text-current' : 'text-[#38BDF8]'} shrink-0`}
        />
      );
    case 'skull':
      return (
        <Skull
          className={`${className} ${inheritColor ? 'text-current' : 'text-[#F87171]'} shrink-0`}
        />
      );
    case 'heart':
      return (
        <Heart
          className={`${className} ${inheritColor ? 'text-current' : 'text-[#FB7185]'} shrink-0`}
        />
      );
    case 'coin':
      return (
        <Coins
          className={`${className} ${inheritColor ? 'text-current' : 'text-[#34D399]'} shrink-0`}
        />
      );
    case 'religion':
      return (
        <Flame
          className={`${className} ${inheritColor ? 'text-current' : 'text-[#A78BFA]'} shrink-0`}
        />
      );
    case 'family':
      return (
        <Users
          className={`${className} ${inheritColor ? 'text-current' : 'text-[#34D399]'} shrink-0`}
        />
      );
    case 'crown':
    default:
      return (
        <Crown
          className={`${className} ${inheritColor ? 'text-current' : 'text-[#38BDF8]'} shrink-0`}
        />
      );
  }
}
