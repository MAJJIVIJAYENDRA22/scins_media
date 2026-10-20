import { Conference, RegistrationCategory } from '../types';

export type TierStatus = 'scheduled' | 'active' | 'expired';
export type ActiveTierKey = 'tier1' | 'tier2' | 'tier3';

export interface TierInfo {
  key: ActiveTierKey;
  name: string;
  startDate: string;
  endDate: string;
  status: TierStatus;
}

export interface TierScheduleResult {
  today: string;
  activeTier: ActiveTierKey;
  activeTierName: string;
  tier1: TierInfo;
  tier2: TierInfo;
  tier3: TierInfo;
}

export function toIsoDate(d?: string | Date | null): string {
  if (!d) return '';
  if (typeof d === 'string') {
    const trimmed = d.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];
    return trimmed.split('T')[0] || '';
  }
  return d.toISOString().split('T')[0];
}

export function getTierSchedules(
  conf?: Partial<Conference> | null,
  categories?: RegistrationCategory[] | null,
  targetDateStr?: string
): TierScheduleResult {
  const today = targetDateStr || new Date().toISOString().split('T')[0];

  const firstCat = (categories && categories.length > 0) ? categories[0] : null;

  // Tier 1: Early Bird Price
  const t1Name = conf?.tier1_name || firstCat?.tier1_label || 'Early Bird Price';
  const t1Start = toIsoDate(conf?.tier1_start_date || firstCat?.tier1_start_date);
  const t1End = toIsoDate(conf?.tier1_end_date || conf?.early_bird_deadline || firstCat?.tier1_end_date);

  // Tier 2: First Call Price
  const t2Name = conf?.tier2_name || firstCat?.tier2_label || 'First Call Price';
  let t2Start = toIsoDate(conf?.tier2_start_date || firstCat?.tier2_start_date);
  if (!t2Start && t1End) {
    try {
      const nextDay = new Date(t1End);
      nextDay.setDate(nextDay.getDate() + 1);
      t2Start = nextDay.toISOString().split('T')[0];
    } catch {
      t2Start = '';
    }
  }
  const t2End = toIsoDate(conf?.tier2_end_date || firstCat?.tier2_end_date);

  // Tier 3: Final Call Registration
  const t3Name = conf?.tier3_name || firstCat?.tier3_label || 'Final Call Registration';
  let t3Start = toIsoDate(conf?.tier3_start_date || firstCat?.tier3_start_date);
  if (!t3Start && t2End) {
    try {
      const nextDay = new Date(t2End);
      nextDay.setDate(nextDay.getDate() + 1);
      t3Start = nextDay.toISOString().split('T')[0];
    } catch {
      t3Start = '';
    }
  }
  const t3End = toIsoDate(conf?.tier3_end_date || conf?.registration_deadline || conf?.start_date || firstCat?.tier3_end_date);

  // Status computation for Tier 1
  let t1Status: TierStatus = 'active';
  if (t1End && today > t1End) {
    t1Status = 'expired';
  } else if (t1Start && today < t1Start) {
    t1Status = 'scheduled';
  } else {
    t1Status = 'active';
  }

  // Status computation for Tier 2
  let t2Status: TierStatus = 'scheduled';
  if (t2End && today > t2End) {
    t2Status = 'expired';
  } else if (t2Start && today < t2Start) {
    t2Status = 'scheduled';
  } else if (t1Status === 'active') {
    t2Status = 'scheduled';
  } else if (t1Status === 'expired') {
    // If Tier 1 has expired, Tier 2 is active unless today > t2End
    t2Status = 'active';
  } else {
    t2Status = 'active';
  }

  // Status computation for Tier 3
  let t3Status: TierStatus = 'scheduled';
  if (t3End && today > t3End) {
    t3Status = 'expired';
  } else if (t1Status === 'active' || t2Status === 'active') {
    t3Status = 'scheduled';
  } else {
    // Both Tier 1 and Tier 2 promotional periods have expired: Final Call activates automatically!
    t3Status = 'active';
  }

  // Active Tier selection
  let activeTier: ActiveTierKey = 'tier3';
  if (t1Status === 'active') {
    activeTier = 'tier1';
  } else if (t2Status === 'active') {
    activeTier = 'tier2';
  } else {
    activeTier = 'tier3';
  }

  const activeTierName = activeTier === 'tier1' ? t1Name : activeTier === 'tier2' ? t2Name : t3Name;

  return {
    today,
    activeTier,
    activeTierName,
    tier1: {
      key: 'tier1',
      name: t1Name,
      startDate: t1Start,
      endDate: t1End,
      status: t1Status
    },
    tier2: {
      key: 'tier2',
      name: t2Name,
      startDate: t2Start,
      endDate: t2End,
      status: t2Status
    },
    tier3: {
      key: 'tier3',
      name: t3Name,
      startDate: t3Start,
      endDate: t3End,
      status: t3Status
    }
  };
}

export function getCategoryTierPrice(
  cat: Partial<RegistrationCategory>,
  tier: ActiveTierKey
): number {
  const stdPrice = Number(cat.tier3_price ?? cat.price ?? cat.standard_fee ?? cat.industry_price ?? 799);
  const earlyPrice = Number(cat.tier1_price ?? cat.early_bird_price ?? cat.early_bird_fee ?? cat.academic_price ?? (stdPrice > 100 ? stdPrice - 100 : stdPrice));
  const midPrice = Number(cat.tier2_price ?? Math.round((earlyPrice + stdPrice) / 2));

  if (tier === 'tier1') return earlyPrice;
  if (tier === 'tier2') return midPrice;
  return stdPrice;
}

export function validateTierDates(
  tier1Start: string,
  tier1End: string,
  tier2Start: string,
  tier2End: string,
  tier3Start?: string,
  tier3End?: string
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (tier1Start && tier1End && tier1Start > tier1End) {
    errors.push('Early Bird start date cannot be later than Early Bird end date.');
  }

  if (tier2Start && tier2End && tier2Start > tier2End) {
    errors.push('First Call start date cannot be later than First Call end date.');
  }

  if (tier1End && tier2Start && tier2Start < tier1End) {
    errors.push('First Call start date cannot be earlier than Early Bird end date (periods cannot overlap).');
  }

  if (tier2End && tier3Start && tier3Start < tier2End) {
    errors.push('Final Call start date cannot be earlier than First Call end date (periods cannot overlap).');
  }

  if (tier3Start && tier3End && tier3Start > tier3End) {
    errors.push('Final Call start date cannot be later than Final Call end date.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
